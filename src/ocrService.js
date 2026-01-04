// 🔍 OCR Service using Tesseract.js
import Tesseract from 'tesseract.js';

/**
 * Extract text from image using OCR
 * @param {File|string} image - Image file or base64 string
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function extractTextFromImage(image, onProgress = null) {
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: onProgress ? (m) => {
        if (m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      } : undefined
    });

    const { data } = await worker.recognize(image);
    await worker.terminate();

    return {
      text: data.text.trim(),
      confidence: data.confidence
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Convert File to base64 for preview
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
