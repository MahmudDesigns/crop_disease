# Intelligent Crop Disease & Pest Detection System Using Computer Vision

An AI-powered mobile and web platform that helps Kenyan smallholder farmers detect crop diseases and pests instantly from a smartphone photo, and provides treatment recommendations — with a companion dashboard for agricultural officers to monitor outbreaks.

## The Problem

Smallholder farmers in Kenya face major challenges identifying and managing crop diseases and pests:
- **Delayed diagnosis** — reliance on agricultural extension officers causes delays, letting disease spread.
- **High costs** — laboratory testing is too expensive for most smallholder farmers.
- **Lack of expertise** — many farmers aren't trained to visually identify disease.
- **Language barriers** — most diagnostic tools and resources exist only in English, excluding Swahili speakers.
- **No centralized tracking** — there's no system for tracking disease outbreaks spatially for early warning.

Crop losses from diseases and pests account for 20–40% of global agricultural productivity annually, and common Kenyan staples like maize, beans, tomatoes, and potatoes are frequently affected by diseases such as Late Blight, Maize Lethal Necrosis, and Fall Armyworm infestations.

## What This System Does

- **Image-based detection (mobile)** — farmers photograph or upload an image of an infected leaf or pest; a CNN-based deep learning model identifies the disease or pest.
- **Treatment recommendations** — organic and chemical treatment suggestions based on the diagnosis.
- **Multilingual interface** — full support for English and Swahili.
- **Offline mode** — a lightweight TensorFlow Lite model allows detection without an internet connection.
- **Agricultural officer dashboard (web)** — view outbreak trends geographically and send alerts to farmers in affected regions.
- **Record keeping** — stores past detection results for future reference and trend analysis.

## Coverage

- **Crops:** Maize, Beans, Tomatoes, Potatoes, Cassava (5 key staples).
- **Diseases:** 15+ (e.g. Late Blight, Maize Lethal Necrosis, Rust, Leaf Spot).
- **Pests:** 10+ (e.g. Fall Armyworm, Aphids, Whiteflies).
- **Languages:** English, Swahili.
- **Platforms:** Android mobile app (primary), web-based dashboard for agricultural officers.

## User Groups

- **Farmers** — capture/upload crop images, receive diagnosis and treatment advice.
- **Agricultural officers** — monitor outbreak trends via dashboard, send regional alerts.
- **Agricultural researchers/crop specialists** — access historical detection data.

## Objectives

- Train a CNN (via transfer learning on models such as ResNet50 or EfficientNet) to classify at least 15 crop diseases and 10 pests.
- Build a user-friendly mobile app with image capture/upload in English and Swahili.
- Build a treatment recommendation engine.
- Build a web dashboard for geographic outbreak monitoring.
- Evaluate system accuracy, usability, and performance against current diagnostic methods.
- Explore a lightweight offline model for low-connectivity use.

## Scope

**Included:** image-based disease/pest detection for the 5 named crops, treatment recommendations, English/Swahili interface, offline detection mode, officer dashboard with outbreak visualization and alerting, historical record storage.

**Excluded:** hardware development (sensors, drones), integration with government agricultural databases, soil nutrient/pH analysis, full commercial deployment/marketing.

## Tech Stack

- **AI/ML:** Python, TensorFlow/PyTorch, OpenCV, transfer learning on pre-trained CNNs, TensorFlow Lite for offline/mobile inference.
- **Mobile app:** Android (primary); Flutter or React Native for cross-platform development.
- **Backend/storage:** MySQL (or equivalent relational database).

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd crop-disease-detection

# Backend / ML service setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Mobile app setup
cd ../mobile
npm install
npm start
```

Configure your `.env` files for database credentials and model paths before running.

## Development Approach

Agile software development combined with a CRISP-DM (Cross-Industry Standard Process for Data Mining) approach for the AI model, following these stages: problem identification, analysis, design, coding, testing, implementation, and maintenance.

## Data Feasibility Note

While public datasets (e.g. PlantVillage) provide a foundation, localized images of Kenyan crops and pests are needed for accuracy — field visits and partnerships (e.g. with KALRO) support this.

## Limitations

Limited availability of high-quality images for some diseases/crops, potential internet connectivity requirements for the web-based dashboard, limited financial/time resources affecting data collection, and detection limited to diseases/pests included in the training dataset.

## Author

Mbete Josephine Paul — Mount Kenya University, School of Computing and Informatics.
Supervisor: Kevin Njagi.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
