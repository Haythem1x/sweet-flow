"use client"

import { motion } from "framer-motion"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_11tixf11tixf11ti-61t32DDnz2udx2nMvbHjmRxCU7OImi.png')" }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Logo/Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-white mb-2">SweetFlow</h1>
          <p className="text-lg text-white/80">Distribution Management</p>
        </motion.div>

        {/* Animated Chocolate Bars */}
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-16 rounded-full bg-gradient-to-b from-amber-400 to-amber-700"
              initial={{ scaleY: 0.3, opacity: 0.3 }}
              animate={{ 
                scaleY: [0.3, 1, 0.3],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "bottom" }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-white/70 text-sm tracking-wide"
        >
          Loading your sweet experience...
        </motion.p>
      </div>
    </div>
  )
}
