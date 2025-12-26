import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, Search, AlertTriangle, CheckCircle2, Brain, 
  Sparkles, Info, Shield, Leaf, Circle, Flame, Upload
} from 'lucide-react'
import { analyzeFoodWithAI, analyzeImageWithAI, imageToBase64 } from './aiService'

// 🎨 Safety-based theme colors
const safetyTheme = {
  safe: {
    bg: "from-emerald-50 to-green-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    icon: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    glow: "shadow-emerald-200/50"
  },
  moderate: {
    bg: "from-amber-50 to-yellow-50",
    border: "border-amber-200",
    text: "text-amber-900",
    icon: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    glow: "shadow-amber-200/50"
  },
  concerning: {
    bg: "from-rose-50 to-red-50",
    border: "border-rose-200",
    text: "text-rose-900",
    icon: "text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    glow: "shadow-rose-200/50"
  }
}

export default function App() {
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [mode, setMode] = useState('text')
  const fileInputRef = useRef(null)

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

  // 📸 Analyze uploaded image
  const analyzeImage = async (file) => {
    setIsAnalyzing(true)
    setAnalysis(null)
    setMode('processing')

    try {
      const base64Image = await imageToBase64(file)
      const result = await analyzeImageWithAI(base64Image)
      setAnalysis(result)
      setInput(result.name || 'Scanned Product')
    } catch (error) {
      console.error('Image analysis failed:', error)
      setAnalysis({
        name: "Image Analysis Error",
        reasoning: "I couldn't process the image. Please try uploading a clearer photo or type the product name.",
        uncertainty: "Image quality or format might be causing issues.",
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

  const handleCameraMode = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      analyzeImage(file)
    }
  }

  const theme = analysis ? safetyTheme[analysis.overallSafety] : null

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
            Powered by Gemini 2.0 Flash AI—analyze any food with vision or text. Just honest insights with uncertainty included.
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={handleCameraMode}
                  disabled={isAnalyzing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                  title="Upload image for AI vision analysis"
                >
                  <Upload className="text-slate-600" size={20} />
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
                className={`bg-gradient-to-br ${theme.bg} border-2 ${theme.border} rounded-3xl shadow-2xl ${theme.glow} overflow-hidden`}
              >
                {/* Header with Confidence Bar */}
                <div className="p-6 border-b border-current/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className={`text-2xl font-bold ${theme.text} mb-1`}>{analysis.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        {analysis.dietFlags.vegan && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Leaf size={12} /> Vegan
                          </span>
                        )}
                        {analysis.dietFlags.glutenFree && (
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
                    >
                      {analysis.overallSafety === 'safe' && <CheckCircle2 className={theme.icon} size={40} />}
                      {analysis.overallSafety === 'moderate' && <AlertTriangle className={theme.icon} size={40} />}
                      {analysis.overallSafety === 'concerning' && <Flame className={theme.icon} size={40} />}
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

