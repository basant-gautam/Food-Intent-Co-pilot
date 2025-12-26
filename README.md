# 🧠 Food Intent Co-pilot  
**AI-Native Food Health Analysis**

## 🎯 Overview

An Intent-First AI application powered by **Gemini 2.0 Flash** that analyzes food ingredients through reasoning, not databases. Zero configuration—just ask and get honest AI insights with uncertainty included.

---

## ✨ Features

- **🤖 Real AI Analysis** - Gemini 2.0 Flash via OpenRouter
- **📸 Vision Support** - Upload food photos for automatic analysis
- **🎨 Generative UI** - Interface adapts based on safety level
- **⚠️ Honest Uncertainty** - AI admits when not 100% confident
- **⚖️ Tradeoffs Analysis** - Shows both benefits AND risks

---

## 🚀 Quick Start

### 1. Install Dependencies
This project uses **npm** (Node Package Manager). All dependencies are listed in `package.json`.

```bash
# Install all required packages
npm install
```

**Core Dependencies:**
- `react` - UI framework
- `react-dom` - React DOM rendering
- `framer-motion` - Animations
- `lucide-react` - Icons
- `openai` - AI SDK for Gemini API
- `tailwindcss` - Styling

### 2. Environment Setup
Create `.env` file in the project root:
```bash
VITE_OPENROUTER_API_KEY=your-api-key-here
```

Get your API key from: [OpenRouter](https://openrouter.ai/)

### 3. Run Development Server
```bash
npm run dev
```

Visit: **http://localhost:5173**

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🎯 How It Works

1. **Type** any food item or question
2. **Upload** a photo of food packaging (optional)
3. **Get** AI-powered analysis with confidence scores

---

## 🛠️ Tech Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Gemini 2.0 Flash API
- Lucide React Icons

---

## 📁 Project Structure

```
src/
├── aiService.js    # Gemini API integration
├── App.jsx         # Main UI component
├── index.css       # Tailwind + animations
└── main.jsx        # Entry point
```

---

## 🔑 API Configuration

Get your API key from [OpenRouter](https://openrouter.ai/)

Model: `google/gemini-2.0-flash-exp:free`

---

## 📄 License

MIT License

