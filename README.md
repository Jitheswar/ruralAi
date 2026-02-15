# Rural Health AI 🏥

**Rural Health AI** is a comprehensive healthcare platform designed to bridge the gap in rural healthcare access. It empowers community health workers (Sahayaks) and citizens with AI-driven tools for symptom analysis, prescription scanning, medicine information, and outbreak detection.

## 🌟 Features

### For Sahayaks (Health Workers) & Admins
-   **Patient Management**: Create and track patient profiles with syncing capabilities.
-   **Outbreak Detection**: Real-time monitoring of disease outbreaks using aggregated symptom data.
-   **Dashboard Analytics**: Visual insights into community health trends.
-   **Offline First**: Crucial functionality works without internet connectivity.

### For Citizens
-   **AI Symptom Checker**: powered by **Gemini 1.5 Flash**, provides preliminary triage and advice based on symptoms.
-   **Prescription Scanner**: scan handwritten prescriptions using advanced **OCR** to digitize them and find affordable generic alternatives (Jan Aushadhi).
-   **Medicine Search**: Search database of 150+ medicines for usage, side effects, and pricing.
-   **Nearby Help**: Locate nearby hospitals and pharmacies with integration to map services.
-   **Multi-language Support**: Fully localized interface for English, Hindi, Telugu, and more.

## 🛠️ Tech Stack

### Frontend
-   **Web**: [Next.js](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
-   **Mobile**: [React Native](https://reactnative.dev/) (Expo), NativeWind

### Backend & AI
-   **API**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
-   **Database & Auth**: [Supabase](https://supabase.com/)
-   **AI Models**:
    -   **Symptom Analysis**: Google Gemini 1.5 Flash
    -   **OCR**: Custom OCR pipeline (EasyOCR / PaddleOCR)
    -   **Speech-to-Text**: Whisper / Web Speech API (for voice input)

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   Supabase Account
-   Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Jitheswar/ruralAi.git
    cd ruralAi
    ```

2.  **Install Dependencies:**
    ```bash
    # Install root and workspace dependencies
    npm install
    ```

3.  **Setup Environment Variables:**
    -   Copy `.env.example` to `.env.local` in `apps/web` and `apps/mobile`.
    -   Configure your Supabase URL, Anon Key, and Gemini API Key.

### Running the Application

**Run all services (Turbo):**
```bash
npm run dev
```

**Run specific services:**
-   **Web Dashboard**: `npm run dev --filter=web` (Runs on http://localhost:3000)
-   **API Server**:
    ```bash
    cd apps/api
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
    (Runs on http://localhost:8000)
-   **Mobile App**: `npm run start --filter=mobile`

## 📂 Project Structure

```
ruralAi/
├── apps/
│   ├── api/            # FastAPI backend & AI services
│   ├── mobile/         # React Native mobile app (Expo)
│   └── web/            # Next.js web dashboard
├── packages/
│   └── shared/         # Shared TypeScript types & utilities
├── supabase/           # Database migrations & configuration
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
