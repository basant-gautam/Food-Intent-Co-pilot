# Food Intent Co-pilot - OCR Feature Guide

## 🎯 Features Added

### 1. **OCR Text Extraction (Easy OCR)**
- Extract text from food product images
- Supports ingredient lists, nutrition labels, and packaging text
- Uses Tesseract.js for browser-based OCR

### 2. **AI Reasoning on Extracted Text**
- Automatically sends extracted text to Gemini 2.0 Flash AI
- AI analyzes the text and provides food safety insights
- Gets reasoning, confidence scores, and health recommendations

## 📱 How to Use

### Method 1: OCR Mode (Purple Button - ScanText Icon)
1. Click the purple **OCR button** (scan text icon)
2. Upload an image with visible text (ingredients, labels, etc.)
3. Wait for OCR to extract the text
4. AI automatically analyzes the extracted text
5. Get detailed food safety insights

### Method 2: Vision Mode (Gray Button - Upload Icon)
1. Click the gray **Upload button**
2. Upload a product image
3. AI directly analyzes the image using vision
4. Get instant product analysis

### Method 3: Text Input
1. Type any food-related query
2. Click **Analyze** button
3. Get AI-powered insights

## 🔧 Technical Details

**New Dependencies:**
- `tesseract.js` - OCR engine for text extraction

**New Files:**
- `src/ocrService.js` - OCR functionality
- `FEATURES.md` - This guide

**Updated Files:**
- `src/App.jsx` - Added OCR UI and workflow
- `package.json` - Added tesseract.js dependency

## 🎨 UI Updates

- **Purple OCR Button**: Extract text using OCR
- **Progress Bar**: Shows OCR extraction progress
- **Image Preview**: Shows uploaded image during processing
- **Extracted Text Display**: Shows detected text before AI analysis

## 💡 Best Practices

1. **Clear Images**: Use well-lit, clear images for best OCR results
2. **Close-up Shots**: Take close-up photos of ingredient lists
3. **Flat Surfaces**: Avoid curved or wrinkled labels
4. **High Resolution**: Higher quality images = better text extraction

## 🚀 Workflow

```
User uploads image 
    ↓
OCR extracts text (with progress)
    ↓
Text displayed to user
    ↓
AI analyzes extracted text
    ↓
Show reasoning & safety insights
```

## 🎯 Example Use Cases

1. **Scan ingredient list** from packaged food
2. **Extract nutrition facts** from labels
3. **Read allergy warnings** from packaging
4. **Analyze product descriptions** from boxes
5. **Check additives** in processed foods

---

Built with ❤️ using React + Vite + Gemini AI + Tesseract.js
