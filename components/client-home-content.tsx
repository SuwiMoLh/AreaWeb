"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import ClientCardStack from "@/components/client-card-stack"
import { motion } from "framer-motion"

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-slate-950 dark:text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function ClientHomeContent() {
  return (
    <>
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 md:p-12 shadow-xl border border-gray-200/30 dark:border-gray-800/30">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />

        <div className="relative z-10 max-w-3xl">
          <motion.h1
            className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            ค้นหาที่ดินที่สมบูรณ์แบบสำหรับคุณ
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Area เชื่อมต่อคุณกับโอกาสในการลงทุนที่ดินระดับพรีเมียมทั่วประเทศไทย ซื้อ ขาย และค้นพบการลงทุนครั้งต่อไปของคุณด้วยความมั่นใจ
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/listings">
              <Button className="rounded-full px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105">
                ดูรายการ
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="contact" className="rounded-full px-8 py-6 text-lg transition-all hover:scale-105">
                ติดต่อเรา
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Interactive Card Stack */}
      <ClientCardStack />
    </>
  )
}
