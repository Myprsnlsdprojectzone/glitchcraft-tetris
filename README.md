# GlitchCraft 🧩✨

A complete, premium, and fully-featured block puzzle game built with modern web technologies: React 19, TypeScript, and Vite. This codebase is ready to be instantly deployed, played, and monetized.

## 🚀 Core Features & Value

* **🏆 Full Achievement System**: 10 built-in unlockable achievements (with local storage persistence) and beautifully animated toast notifications.
* **🌍 Global & Local Leaderboards**: Ready-to-connect Supabase backend for global competitive rankings, with seamless fallback to Local History.
* **📱 Progressive Web App (PWA)**: Fully configured as an installable app on iOS, Android, and Desktop. Works offline and behaves like a native application.
* **💰 AdSense Ready**: Easily monetize your traffic. Just drop in your Google AdSense Publisher ID in `index.html`.
* **🎮 Advanced Gameplay Mechanics**: Includes Ghost Piece (drop preview), Piece Hold feature, 7-bag randomizer, Combos, and Score multipliers.
* **💻 Responsive & Polished UI**: Custom-designed layouts tailored perfectly for Mobile, Tablet (Portrait & Landscape), and Desktop.
* **✨ Premium Sensory Feedback**: Auto-looping 8-bit ambient background music, procedurally generated sound effects, and haptic feedback on mobile devices.
* **🎨 Multiple Themes**: Comes with 5 gorgeous themes (Neon, Synthwave, Matrix, Ocean, Gameboy) that users can cycle through.
* **💾 Local Storage Persistence**: Saves high scores, score history, user settings (theme, audio, bgm), and unlocked achievements locally.

---

## 🛠️ Tech Stack

* **Frameworks**: React 19 + TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS 4 + custom CSS for animations
* **Audio**: Native Web Audio API (No external assets required)

---

## 📦 Getting Started

### 1. Install Dependencies
Make sure you have Node.js installed. Open your terminal in the project directory and run:

```bash
npm install
```

### 2. Run the Development Server
To start the local development server with hot-module replacement and instant updates:

```bash
npm run dev
```

The app will compile and be available at `http://localhost:5173`. 

### 3. Build for Production
To create an optimized, minified production build:

```bash
npm run build
```

This will generate a `dist` folder. You can preview the production build locally using `npm run preview`.

---

## 🌎 Deployment

This project is exceptionally lightweight and pre-configured for free deployment platforms like [Vercel](https://vercel.com).
Refer to `DEPLOY.md` for a step-by-step 2-minute guide on getting this game live on the internet! 

## ☁️ Setting Up Global Leaderboards
GlitchCraft comes pre-wired for Global Leaderboards via Supabase. 
Refer to `SUPABASE_SCHEMA.md` for exact instructions on connecting your own free Supabase database in minutes.

## 💸 Monetization
Refer to `ADSENSE.md` for instructions on integrating your Google AdSense Publisher ID to start earning revenue from ad views.
