'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="relative h-14 w-14"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg
          className="h-14 w-14"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.70 0.15 265)" stopOpacity="0" />
              <stop offset="50%" stopColor="oklch(0.65 0.20 265)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="oklch(0.60 0.25 265)" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="spinner-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.75 0.10 265)" stopOpacity="0" />
              <stop offset="50%" stopColor="oklch(0.70 0.15 265)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="oklch(0.65 0.20 265)" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Background circle - very subtle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[oklch(0.95_0.00_0)] dark:text-[oklch(0.20_0.00_0)]"
            opacity="0.3"
          />
          
          {/* Animated gradient circle */}
          <motion.circle
            cx="28"
            cy="28"
            r="24"
            stroke="url(#spinner-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="100 150"
            initial={{ 
              strokeDashoffset: 0,
              opacity: 0.6 
            }}
            animate={{ 
              strokeDashoffset: -250,
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              strokeDashoffset: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="dark:[stroke:url(#spinner-gradient-dark)]"
          />
        </svg>
      </motion.div>
    </div>
  )
}