"use client";

import { useSyncExternalStore } from "react";

/**
 * Offline-first support:
 *  - getDeviceId(): stable anonymous device identity (no PII)
 *  - IndexedDB queue for diagnoses made while offline ("TFLite local model")
 *  - syncPending(): pushes queued results to the server when connectivity returns
 */

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("shamba-device-id");
  if (!id) {
    id = `dev-${crypto.randomUUID()}`;
    localStorage.setItem("shamba-device-id", id);
  }
  return id;
}

export function getProfileCounty(): string {
  if (typeof window === "undefined") return "Nakuru";
  return localStorage.getItem("shamba-county") || "Nakuru";
}

export function setProfileCounty(county: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("shamba-county", county);
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

/* ------------------------- IndexedDB queue ------------------------- */

export interface PendingRecord {
  id?: number;
  createdAt: string;
  payload: Record<string, unknown>;
  imageData: string | null;
}

const DB_NAME = "shamba-ai-offline";
const STORE = "pending-detections";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueDetection(payload: Record<string, unknown>, imageData: string | null): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add({ createdAt: new Date().toISOString(), payload, imageData });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getPending(): Promise<PendingRecord[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    const rows = await new Promise<PendingRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as PendingRecord[]);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return rows;
  } catch {
    return [];
  }
}

export async function removePending(id: number): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function pendingCount(): Promise<number> {
  const rows = await getPending();
  return rows.length;
}

/**
 * Push every queued record to the server. Returns how many synced.
 */
export async function syncPending(): Promise<number> {
  const rows = await getPending();
  let synced = 0;
  for (const row of rows) {
    try {
      const res = await fetch("/api/detections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...row.payload, imageData: row.imageData, createdAt: row.createdAt, source: "offline-sync" }),
      });
      if (res.ok && row.id != null) {
        await removePending(row.id);
        synced++;
      }
    } catch {
      break; // still offline — leave the rest in the queue
    }
  }
  return synced;
}

/** SHA-256 hex of image bytes (WebCrypto) — feeds the local "TFLite" path. */
export async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
