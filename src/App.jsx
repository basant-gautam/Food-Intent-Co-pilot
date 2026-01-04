import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, Search, AlertTriangle, CheckCircle2, Brain, 
  Sparkles, Info, Shield, Leaf, Circle, Flame, FileText, ScanText,
  TrendingUp, TrendingDown, Zap, Target, Coffee, Apple, Pizza, Cookie
} from 'lucide-react'
import { analyzeFoodWithAI } from './aiService'
import { extractTextFromImage, fileToBase64 } from './ocrService'

// 🎨 Enhanced Theme Engine - Dynamic based on Risk Score
const getThemeEngine = (safety, confidence) => {
  const themes = {
    safe: {
      // Minimalist Theme - Emphasizes transparency
      bg: "from-emerald-50 via-green-50 to-teal-50",
      border: "border-emerald-300",
      text: "text-emerald-900",
      icon: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
      glow: "shadow-emerald-300/60 shadow-xl",
      layoutDensity: "relaxed", // More whitespace
      statusIcon: CheckCircle2,
      statusBg: "bg-emerald-500",
      accentColor: "emerald",
      warningBanner: false
    },
    moderate: {
      // Balanced Theme
      bg: "from-amber-50 via-yellow-50 to-orange-50",
      border: "border-amber-300",
      text: "text-amber-900",
      icon: "text-amber-600",
      badge: "bg-amber-100 text-amber-700",
      glow: "shadow-amber-300/60 shadow-xl",
      layoutDensity: "normal",
      statusIcon: Info,
      statusBg: "bg-amber-500",
      accentColor: "amber",
      warningBanner: confidence < 70 // Show banner if low confidence
    },
    concerning: {
      // Alert-driven Theme - Prominent warnings
      bg: "from-rose-100 via-red-50 to-orange-50",
      border: "border-rose-400",
      text: "text-rose-900",
      icon: "text-rose-600",
      badge: "bg-rose-100 text-rose-700",
      glow: "shadow-rose-400/70 shadow-2xl",
      layoutDensity: "compact", // Dense for urgency
      statusIcon: AlertTriangle,
      statusBg: "bg-rose-600",
      accentColor: "rose",
      warningBanner: true // Always show warning
    }
  }
  
  return themes[safety] || themes.moderate
}

export default function App() {
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [mode, setMode] = useState('text')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const ocrFileInputRef = useRef(null)

  // 🧠 AI Analysis with Gemini 2.0 Flash
  const analyzeFood = async (query) => {
    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const result = await analyzeFoodWithAI(query)
      setAnalysis(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysis({
        name: query,
        reasoning: "I encountered an error while analyzing this item. Please try again.",
        uncertainty: "The analysis couldn't be completed due to a technical issue.",
        tradeoffs: "Unable to provide insights at this time.",
        confidence: 20,
        overallSafety: "moderate",
        ingredients: [],
        dietFlags: {}
      })
    }

    setIsAnalyzing(false)
  }

  // � OCR - Extract text from image then analyze with TEXT-ONLY AI
  const handleOCRImage = async (file) => {
    setIsAnalyzing(true)
    setAnalysis(null)
    setExtractedText('')
    setOcrProgress(0)
    setMode('ocr')

    try {
      // Show image preview
      const preview = await fileToBase64(file)
      setPreviewImage(preview)

      // Extract text using OCR
      const { text, confidence } = await extractTextFromImage(file, (progress) => {
        setOcrProgress(progress)
      })

      setExtractedText(text)
      
      // If text extracted successfully, analyze it with AI
      if (text && text.length > 5) {
        setMode('analyzing')
        const result = await analyzeFoodWithAI(`Analyze this text extracted from a food product image: "${text}"`)
        setAnalysis(result)
        setInput(text.substring(0, 100)) // Set first 100 chars as input
      } else {
        setAnalysis({
          name: "OCR Result",
          reasoning: "I couldn't extract enough text from the image. Please try uploading a clearer image with visible text.",
          uncertainty: "The image might be blurry, too dark, or the text might be too small.",
          tradeoffs: "N/A",
          confidence: 20,
          overallSafety: "moderate",
          ingredients: [],
          dietFlags: {}
        })
      }
    } catch (error) {
      console.error('OCR failed:', error)
      setAnalysis({
        name: "OCR Error",
        reasoning: "Failed to extract text from the image. Please ensure the image contains clear, readable text.",
        uncertainty: error.message || "Unknown error occurred",
        tradeoffs: "N/A",
        confidence: 10,
        overallSafety: "moderate",
        ingredients: [],
        dietFlags: {}
      })
    }

    setIsAnalyzing(false)
    setMode('text')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    analyzeFood(input)
  }

  const handleOCRFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleOCRImage(file)
    }
  }

  const handleOCRMode = () => {
    ocrFileInputRef.current?.click()
  }

  // 🎯 Generate Co-pilot Recommendation
  const generateRecommendation = (analysis) => {
    if (!analysis) return null
    
    const { name, overallSafety, confidence, tradeoffs, ingredients } = analysis
    
    // Infer user situation
    let situation = "Checking this food item"
    if (name.toLowerCase().includes('snack') || name.toLowerCase().includes('chips') || name.toLowerCase().includes('cookie')) {
      situation = "Looks like you're looking for a quick snack"
    } else if (name.toLowerCase().includes('drink') || name.toLowerCase().includes('soda') || name.toLowerCase().includes('juice')) {
      situation = "Analyzing your beverage choice"
    } else if (name.toLowerCase().includes('meal') || name.toLowerCase().includes('dinner')) {
      situation = "Evaluating your meal option"
    }
    
    // Generate specific actions
    let actions = []
    if (overallSafety === 'concerning') {
      actions = [
        '⚠️ Consider limiting consumption',
        '🔍 Check for healthier alternatives',
        '💡 Read ingredient labels carefully'
      ]
    } else if (overallSafety === 'moderate') {
      actions = [
        '⚖️ Consume in moderation',
        '🕐 Limit to occasional use',
        '🔄 Balance with healthier options'
      ]
    } else {
      actions = [
        '✅ Safe for regular consumption',
        '💚 Fits well in balanced diet',
        '🎯 Good choice for your situation'
      ]
    }
    
    return { situation, actions }
  }

  const theme = analysis ? getThemeEngine(analysis.overallSafety, analysis.confidence) : null
  const copilotRec = analysis ? generateRecommendation(analysis) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* 🤖 AI Co-pilot Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="text-white" size={28} />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Food Intent Co-pilot
            </h1>
          </motion.div>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Powered by GPT-3.5 AI with OCR—extract text from food images and get honest insights with uncertainty included.
          </p>
        </motion.div>

        {/* 🎯 Zero-Config Intent Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type anything... 'Coca Cola ingredients', 'Is Nutella healthy?', 'Peanut allergy check'"
                className="w-full px-6 py-5 pr-32 text-lg bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400 shadow-lg group-hover:shadow-xl"
                disabled={isAnalyzing || mode === 'camera'}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {/* Removed vision upload - too expensive! */}
                <input
                  ref={ocrFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleOCRFileChange}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={handleOCRMode}
                  disabled={isAnalyzing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors disabled:opacity-50"
                  title="Extract text from image using OCR (Free!)"
                >
                  <ScanText className="text-purple-600" size={20} />
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isAnalyzing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Sparkles size={18} />
                      </motion.div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Analyze
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>

          {/* 📸 Image Processing Mode */}
          <AnimatePresence>
            {mode === 'processing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-center shadow-2xl"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Brain className="text-white mx-auto mb-3" size={48} />
                </motion.div>
                <p className="text-white text-lg font-medium">Analyzing image with Gemini Vision...</p>
                <p className="text-indigo-100 text-sm mt-2">AI is reading ingredients and labels</p>
              </motion.div>
            )}

            {/* 🔍 OCR Processing Mode */}
            {(mode === 'ocr' || mode === 'analyzing') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 shadow-2xl"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ScanText className="text-white mx-auto mb-3" size={48} />
                  </motion.div>
                  <p className="text-white text-lg font-medium mb-2">
                    {mode === 'ocr' ? 'Extracting text from image...' : 'Analyzing extracted text with AI...'}
                  </p>
                  <p className="text-purple-100 text-sm mb-4">
                    {mode === 'ocr' ? 'Using OCR technology to read text' : 'AI is reasoning about the extracted content'}
                  </p>
                  
                  {/* Progress Bar */}
                  {mode === 'ocr' && (
                    <div className="w-full max-w-md bg-white/20 rounded-full h-2 mb-4">
                      <motion.div
                        className="bg-white h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${ocrProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Image Preview */}
                  {previewImage && (
                    <motion.img
                      src={previewImage}
                      alt="OCR Preview"
                      className="max-w-md w-full rounded-xl shadow-lg mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}

                  {/* Extracted Text Preview */}
                  {extractedText && mode === 'analyzing' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md w-full"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="text-white" size={20} />
                        <p className="text-white font-medium">Extracted Text:</p>
                      </div>
                      <p className="text-purple-100 text-sm max-h-32 overflow-y-auto">
                        {extractedText}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🧠 Generative UI - Analysis Results */}
          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div
                key={analysis.name}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ type: "spring", damping: 20 }}
                className="space-y-4"
              >
                {/* ⚠️ Alert-Driven Warning Banner (High Risk Only) */}
                {theme.warningBanner && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-${theme.accentColor}-600 text-white rounded-2xl p-6 shadow-2xl`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-white/20 rounded-xl`}>
                        <theme.statusIcon size={32} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                          {analysis.overallSafety === 'concerning' ? '⚠️ High Risk Detected' : '⚡ Moderate Caution'}
                        </h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {analysis.overallSafety === 'concerning' 
                            ? 'This product may pose health concerns. Review details carefully before consuming.' 
                            : 'This product has some concerns. Consider the trade-offs before consuming.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Main Analysis Card */}
                <motion.div
                  className={`bg-gradient-to-br ${theme.bg} border-2 ${theme.border} rounded-3xl shadow-2xl ${theme.glow} overflow-hidden`}
                >
                  {/* Header with Confidence Bar */}
                  <div className={`p-6 border-b border-current/10 ${theme.layoutDensity === 'compact' ? 'pb-4' : 'pb-6'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className={`text-2xl font-bold ${theme.text} mb-1`}>{analysis.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          {analysis.dietFlags?.vegan && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <Leaf size={12} /> Vegan
                            </span>
                          )}
                          {analysis.dietFlags?.glutenFree && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Gluten-Free
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className={`p-3 rounded-2xl ${theme.statusBg}`}
                      >
                        <theme.statusIcon className="text-white" size={32} />
                      </motion.div>
                    </div>

                    {/* Confidence Meter - HONEST UNCERTAINTY */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme.text}`}>My Confidence Level</span>
                        <span className={`text-lg font-bold ${theme.text}`}>{analysis.confidence}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${analysis.confidence}%` }}
                          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                          className={`h-full ${analysis.confidence > 80 ? 'bg-emerald-500' : analysis.confidence > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        />
                    </div>
                  </div>
                </div>

                {/* AI Reasoning Section */}
                <div className="p-6 space-y-6">
                  {/* Main Reasoning */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3"
                  >
                    <Brain className={`${theme.icon} flex-shrink-0 mt-1`} size={24} />
                    <div>
                      <h3 className={`font-semibold ${theme.text} mb-2`}>🧠 My Reasoning</h3>
                      <p className="text-slate-700 leading-relaxed">{analysis.reasoning}</p>
                    </div>
                  </motion.div>

                  {/* Honest Uncertainty - KEY FEATURE */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${theme.badge} border-2 border-current/20 rounded-xl p-4 flex gap-3`}
                  >
                    <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">⚠️ What I'm Uncertain About</h3>
                      <p className="text-sm leading-relaxed">{analysis.uncertainty}</p>
                    </div>
                  </motion.div>

                  {/* Tradeoffs */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-3"
                  >
                    <Shield className={`${theme.icon} flex-shrink-0 mt-1`} size={24} />
                    <div>
                      <h3 className={`font-semibold ${theme.text} mb-2`}>⚖️ Tradeoffs to Consider</h3>
                      <p className="text-slate-700 leading-relaxed">{analysis.tradeoffs}</p>
                    </div>
                  </motion.div>

                  {/* 🎯 CO-PILOT'S ACTIONABLE RECOMMENDATION */}
                  {copilotRec && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className={`bg-gradient-to-br ${
                        analysis.overallSafety === 'safe' 
                          ? 'from-emerald-500 to-teal-600' 
                          : analysis.overallSafety === 'moderate'
                          ? 'from-amber-500 to-orange-600'
                          : 'from-rose-500 to-red-600'
                      } text-white rounded-2xl p-6 shadow-xl`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <Target size={28} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            🎯 Co-pilot's Recommendation
                          </h3>
                          
                          {/* User Situation Inference */}
                          <div className="mb-4 text-white/90 text-sm italic">
                            "{copilotRec.situation}"
                          </div>

                          {/* Trade-off Summary */}
                          <div className="mb-4 bg-white/10 rounded-lg p-3">
                            <h4 className="font-semibold mb-1 text-sm">📊 Quick Trade-off Summary:</h4>
                            <p className="text-sm text-white/95">
                              {analysis.tradeoffs.substring(0, 150)}...
                            </p>
                          </div>

                          {/* Specific Actions */}
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">✨ Suggested Actions:</h4>
                            <div className="space-y-2">
                              {copilotRec.actions.map((action, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 + idx * 0.1 }}
                                  className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                  <span className="text-sm">{action}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Ingredients Breakdown */}
                  {analysis.ingredients && analysis.ingredients.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className={`font-semibold ${theme.text} mb-3 flex items-center gap-2`}>
                        <Info size={20} />
                        Key Ingredients ({analysis.ingredients.length})
                      </h3>
                      <div className="grid gap-2">
                        {analysis.ingredients.map((ing, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + idx * 0.1 }}
                            className="flex items-center justify-between bg-white/60 rounded-lg px-4 py-3 border border-current/10"
                          >
                            <div className="flex items-center gap-3">
                              {ing.natural ? (
                                <Leaf className="text-green-600" size={16} />
                              ) : (
                                <Circle className="text-orange-500" size={16} />
                              )}
                              <span className="font-medium text-slate-800">{ing.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{ing.confidence}% sure</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ing.safety === 'safe' ? 'bg-green-100 text-green-700' :
                                ing.safety === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                              }`}>
                                {ing.safety}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Co-pilot Footer */}
                <div className="px-6 pb-6">
                  <div className="bg-white/50 rounded-xl p-4 border border-current/10">
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <Sparkles size={14} className={theme.icon} />
                      <span>AI Co-pilot Analysis • Reasoning-driven • Honest uncertainty included</span>
                    </p>
                  </div>
                </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI-First Placeholder - No Examples */}
          {!analysis && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-slate-400">Ask me anything about food ingredients, safety, or nutrition.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

