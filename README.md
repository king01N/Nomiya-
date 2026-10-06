# Nomiya 🦋 - AI Companion Web App

Nomiya is a warm, realistic, and lively AI companion designed to provide a natural, WhatsApp-style messaging experience powered by Google Gemini AI (`@google/genai`).

---

## 🌟 Key Features

- **Realistic Texting Cadence**: Dynamically varies message bubbles (1, 2, or 3 short messages) with natural typing delays and notification sounds.
- **Photo Request & Reluctance Flow**: Plays cute/shy reluctance before sending photos, and references her profile picture (DP) before sharing new wardrobe/scenario pictures upon user insistence.
- **Multi-Scenario Photo Wardrobe**: Context-aware poses (traditional kurti, cafe coffee, balcony sunset, cozy bedroom, park walk, etc.).
- **Interactive Multimedia**:
  - Voice recording (Speech-to-Text)
  - Interactive voice & video call simulation
  - Sticker & emoji reactions
  - Image attachments & live camera capture
  - Fullscreen lightbox photo viewer
- **Privacy First**: LocalStorage persistence per browser — zero cross-user data leakage.
- **Customizable Experience**: Wallpaper customization, audio toggle, and chat clearing.

---

## 📁 Project Directory Structure

```text
├── public/                     # Static assets & photos
│   ├── nomiya_avatar.jpg       # Profile picture (DP)
│   └── photos/                 # High-resolution wardrobe gallery
│       ├── nomiya_balcony.jpg
│       ├── nomiya_bedroom_chin.jpg
│       ├── nomiya_bookstore.jpg
│       ├── nomiya_cafe.jpg
│       ├── nomiya_garden_park.jpg
│       ├── nomiya_hoodie_coffee.jpg
│       ├── nomiya_park.jpg
│       ├── nomiya_peace_selfie.jpg
│       ├── nomiya_rainy_window.jpg
│       ├── nomiya_sunset_balcony.jpg
│       └── nomiya_traditional.jpg
├── src/                        # React Frontend
│   ├── components/             # Reusable UI components
│   │   ├── AttachmentPicker.tsx
│   │   ├── CameraCaptureModal.tsx
│   │   ├── CharacterInfoModal.tsx
│   │   ├── ChatArea.tsx
│   │   ├── ClearChatModal.tsx
│   │   ├── Composer.tsx
│   │   ├── Header.tsx
│   │   ├── ImagePreviewModal.tsx
│   │   ├── ImageViewerModal.tsx
│   │   ├── MessageItem.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── StickerPicker.tsx
│   │   ├── ThreeDotMenu.tsx
│   │   ├── VideoCallModal.tsx
│   │   └── VoiceCallModal.tsx
│   ├── config/
│   │   └── character.ts        # Persona prompts & system instructions
│   ├── data/
│   │   └── stickers.ts         # Sticker packs
│   ├── services/               # API & Storage clients
│   │   ├── geminiService.ts    # Frontend chat API bridge
│   │   ├── soundService.ts     # Audio feedback effects
│   │   ├── storage.ts          # LocalStorage persistence
│   │   └── voiceService.ts     # Speech Recognition & Synthesis
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   ├── App.tsx                 # Main application controller
│   ├── index.css               # Tailwind CSS setup
│   └── main.tsx                # React entry root
├── server.ts                   # Express server & Gemini backend proxy
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── metadata.json               # AI Studio project metadata
└── .env.example                # Example environment variables
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **bun**
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
git clone <your-github-repo-url>
cd <repo-folder>
npm install
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Add your Gemini API key inside `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser!

### 5. Build for Production
```bash
npm run build
npm start
```
