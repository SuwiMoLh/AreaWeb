"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import the InteractiveCardStack component with no SSR
const InteractiveCardStack = dynamic(() => import("@/components/interactive-card-stack"), { ssr: false })

// Create a simple loading placeholder
function CardStackPlaceholder() {
  return (
    <div className="relative h-[400px] w-full max-w-3xl mx-auto my-12 rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30 animate-pulse">
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
          <div className="h-6 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
          <div className="h-4 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    </div>
  )
}

export default function ClientCardStack() {
  return (
    <Suspense fallback={<CardStackPlaceholder />}>
      <InteractiveCardStack />
    </Suspense>
  )
}
