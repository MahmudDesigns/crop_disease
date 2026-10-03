import type { CropKey } from "@/lib/knowledge";

/** Custom hand-drawn crop glyphs — consistent 24×24 stroke icons. */
export function CropIcon({ crop, className = "h-6 w-6" }: { crop: CropKey; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (crop) {
    case "maize":
      return (
        <svg {...common}>
          <path d="M12 3c-3 0-5 4.2-5 9.5V20c0 .8.7 1.4 1.5 1.2L12 20l3.5 1.2c.8.2 1.5-.4 1.5-1.2v-7.5C17 7.2 15 3 12 3Z" />
          <path d="M12 6v14M9.2 8.5h5.6M9.2 12h5.6M9.6 15.5h4.8" />
          <path d="M7 10.5C5.2 10 4 8.6 3.6 6.8 5.4 7.2 6.6 8.6 7 10.5ZM17 10.5c1.8-.5 3-1.9 3.4-3.7-1.8.4-3 1.8-3.4 3.7Z" />
        </svg>
      );
    case "beans":
      return (
        <svg {...common}>
          <path d="M8 4.5C5 6.4 3.8 9.6 5.1 12.6c1.2 2.7 4 4.1 7 3.7" />
          <path d="M9.5 6.8c-1.8 1.1-2.6 3-1.9 4.8.6 1.6 2.4 2.4 4.2 2.2" />
          <ellipse cx="14.5" cy="15" rx="3.4" ry="2.2" transform="rotate(-24 14.5 15)" />
          <ellipse cx="18" cy="10" rx="3" ry="2" transform="rotate(-38 18 10)" />
          <path d="M13.6 15h1.8M17.2 9.9l1.5.4" />
        </svg>
      );
    case "tomato":
      return (
        <svg {...common}>
          <circle cx="12" cy="13.5" r="7" />
          <path d="M12 6.5c-.6-1.2-.4-2.4.5-3.5M12 6.5c-1.8.2-3.4-.4-4.6-1.5 1.8-.6 3.3-.3 4.6.7.5-1.6 1.6-2.5 3-2.7-.4 1.6-1.4 2.8-3 3.5Z" />
          <path d="M8.5 12.5c.8 1.6 2 2.6 3.5 3" />
        </svg>
      );
    case "potato":
      return (
        <svg {...common}>
          <path d="M15.5 4.5c2.9.4 5 3 5 6.2 0 3.5-2.9 6.5-7 7.6-3.6 1-7.6-.4-8.9-3.3-1.3-2.9.7-6.3 4.3-8.3 2.4-1.3 4.4-2.4 6.6-2.2Z" />
          <path d="M9.5 11h.01M13 8.5h.01M13.5 13.5h.01M9 14.5h.01" />
        </svg>
      );
    case "cassava":
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M12 7.5c-2.2-.3-3.8-1.7-4.3-3.8 2.2.3 3.8 1.7 4.3 3.8ZM12 7.5c2.2-.3 3.8-1.7 4.3-3.8-2.2.3-3.8 1.7-4.3 3.8Z" />
          <path d="M12 12c-2.8-.3-4.8-2-5.3-4.6C9.5 7.7 11.5 9.4 12 12ZM12 12c2.8-.3 4.8-2 5.3-4.6-2.8.3-4.8 2-5.3 4.6Z" />
          <path d="M9.5 21c.3-2.5 1.3-4 2.5-4.5 1.2.5 2.2 2 2.5 4.5" />
        </svg>
      );
  }
}
