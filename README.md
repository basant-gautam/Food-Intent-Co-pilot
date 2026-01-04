# 🧠 Food Intent Co-pilot  
**AI-Native Food Health Analysis**

## 🎯 Overview

An Intent-First AI application powered by **Gemini 2.0 Flash** that analyzes food ingredients through reasoning, not databases. Zero configuration—just ask and get honest AI insights with uncertainty included.

---

## ✨ Features

- **🤖 Real AI Analysis** - Gemini 2.0 Flash via OpenRouter
- **� OCR Text Extraction** - Extract text from food labels and ingredients lists
- **📸 Vision Support** - Upload food photos for automatic analysis
- **💬 AI Reasoning** - Automatically analyze OCR-extracted text with AI
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
- `tesseract.js` - OCR engine for text extraction
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

### Mode 1: Text Input 📝
1. **Type** any food item or question
2. **Click Analyze** to get AI-powered insights
3. **Get** detailed analysis with confidence scores

### Mode 2: OCR Text Extraction 🔍
1. **Click the purple OCR button** (ScanText icon)
2. **Upload** an image with visible text (ingredients, nutrition label, etc.)
3. **Watch** as OCR extracts text from the image
4. **AI automatically analyzes** the extracted text
5. **Get** reasoning and safety insights

### Mode 3: Vision Analysis 📸
1. **Click the gray Upload button**
2. **Upload** a photo of food packaging
3. **AI directly analyzes** the image using vision
4. **Get** instant product analysis

---

## 🛠️ Tech Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Gemini 2.0 Flash API
- Tesseract.js (OCR Engine)
- Lucide React Icons

---

## 📁 Project Structure

```
src/
├── aiService.js    # Gemini API integration
├── ocrService.js   # OCR text extraction (NEW)
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

