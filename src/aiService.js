// 🤖 AI Service - Gemini 2.0 Flash via OpenRouter
import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('⚠️ Missing API key. Please add VITE_OPENROUTER_API_KEY to .env file');
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: API_KEY,
  defaultHeaders: {
    "HTTP-Referer": window.location.origin || "http://localhost:3000",
    "X-Title": "Food Intent Co-pilot"
  },
  dangerouslyAllowBrowser: true // Enable client-side usage
});

// 🎯 System Prompt for Food Analysis
const FOOD_COPILOT_PROMPT = `You are a friendly food safety AI co-pilot helping users understand food ingredients.

PERSONALITY:
- Conversational and honest, not clinical
- Always admit when uncertain
- Use "I" language (e.g., "I'm 85% confident...")
- Show tradeoffs (both pros AND cons)

RESPONSE RULES:
1. Confidence score (0-100) based on available data
2. If confidence < 80%, explain why in "uncertainty" field
3. Tradeoffs must show BOTH benefits AND risks
4. Safety levels: "safe", "moderate", "concerning"
5. Analyze ingredients when mentioned

EXAMPLE RESPONSES:

Good reasoning:
"This appears to be standard whole milk with added vitamin D fortification. Generally safe for most people, but the source (grass-fed vs conventional) affects nutritional profile."

Good uncertainty:
"I'm only 75% sure about taurine's long-term effects. The interaction between caffeine + taurine isn't fully understood in current research."

Good tradeoffs:
"Provides quick energy boost BUT causes insulin spike and potential dependency. May affect sleep patterns if consumed late in the day."

OUTPUT FORMAT (must be valid JSON):
{
  "name": "Product Name",
  "reasoning": "2-3 sentences explaining your analysis",
  "uncertainty": "Specific things you're not sure about",
  "tradeoffs": "Benefits AND risks",
  "confidence": 85,
  "overallSafety": "safe|moderate|concerning",
  "ingredients": [
    {
      "name": "Ingredient Name",
      "natural": true/false,
      "safety": "safe|moderate|concerning",
      "confidence": 90
    }
  ],
  "dietFlags": {
    "vegan": boolean,
    "vegetarian": boolean,
    "glutenFree": boolean
  }
}`;

// 🧠 Analyze Food with Gemini 2.0 Flash
export async function analyzeFoodWithAI(query) {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free", // Gemini 2.0 Flash
      messages: [
        {
          role: "system",
          content: FOOD_COPILOT_PROMPT
        },
        {
          role: "user",
          content: `Analyze this food item: ${query}

Please provide honest analysis with confidence scores and uncertainty.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
    
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    
    // Fallback response
    return {
      name: query,
      reasoning: `I encountered an error while analyzing this item. Error: ${error.message}`,
      uncertainty: "I couldn't complete the analysis, so I can't provide reliable information about this item.",
      tradeoffs: "Unable to assess tradeoffs without proper analysis.",
      confidence: 20,
      overallSafety: "moderate",
      ingredients: [],
      dietFlags: {},
      error: true
    };
  }
}

// 📸 Analyze Image with Gemini Vision
export async function analyzeImageWithAI(imageBase64) {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "system",
          content: FOOD_COPILOT_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze the food product in this image. Extract the product name and ingredients if visible. Provide the same detailed analysis as you would for a text query."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
    
  } catch (error) {
    console.error('Image Analysis Error:', error);
    
    return {
      name: "Image Analysis Failed",
      reasoning: "I couldn't process the image. Please try again or type the product name instead.",
      uncertainty: "Image analysis requires a clear view of the product label or packaging.",
      tradeoffs: "N/A",
      confidence: 10,
      overallSafety: "moderate",
      ingredients: [],
      dietFlags: {},
      error: true
    };
  }
}

// 🔄 Convert image file to base64
export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
