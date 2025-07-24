"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, History, Target, Eye, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

type CardData = {
  id: string
  title: string
  description: string
  iconComponent: React.ReactNode
  color: string
  features: string[]
  detailedDescription: string
}

export default function InteractiveCardStack() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [mounted, setMounted] = useState(false)

  // ข้อมูลการ์ด
  const cards: CardData[] = [
    {
      id: "history",
      title: "ความเป็นมา",
      description: "เกี่ยวกับ Area",
      iconComponent: <History className="w-12 h-12" />,
      color: "from-blue-500 to-purple-500",
      features: [],
      detailedDescription:
        "Area เริ่มต้นจากความตั้งใจที่จะพัฒนาแพลตฟอร์มสำหรับการซื้อขายที่ดินในประเทศไทย ให้สะดวก โปร่งใส และเข้าถึงง่ายสำหรับทุกคน เรารวบรวมทีมผู้เชี่ยวชาญด้านอสังหาริมทรัพย์และเทคโนโลยี เพื่อสร้างประสบการณ์ที่ดีที่สุดในการใช้งาน",
    },
    {
      id: "mission",
      title: "พันธกิจ",
      description: "พันธกิจของเรา",
      iconComponent: <Target className="w-12 h-12" />,
      color: "from-green-500 to-teal-500",
      features: [
        "มุ่งมั่นพัฒนาแพลตฟอร์มที่เชื่อมโยงผู้ซื้อและผู้ขายที่ดินอย่างมีประสิทธิภาพ",
        "สร้างระบบที่โปร่งใส ปลอดภัย และตรวจสอบได้",
        "ส่งเสริมให้ทุกคนสามารถเข้าถึงตลาดที่ดินได้อย่างเท่าเทียม",
      ],
      detailedDescription: "",
    },
    {
      id: "vision",
      title: "วิสัยทัศน์",
      description: "วิสัยทัศน์ของเรา",
      iconComponent: <Eye className="w-12 h-12" />,
      color: "from-orange-500 to-red-500",
      features: [
        "เป็นผู้นำด้านเทคโนโลยีอสังหาริมทรัพย์ในประเทศไทย",
        "พัฒนาแพลตฟอร์มที่ขับเคลื่อนด้วยข้อมูล เพื่อให้การตัดสินใจซื้อ-ขายที่ดินเป็นเรื่องง่าย",
      ],
      detailedDescription: "",
    },
    {
      id: "features",
      title: "จุดเด่นของแพลตฟอร์ม",
      description: "จุดเด่นของ Area",
      iconComponent: <Award className="w-12 h-12" />,
      color: "from-blue-600 to-indigo-600",
      features: [
        "เข้าถึงรายการที่ดินได้อย่างรวดเร็ว พร้อมข้อมูลครบถ้วน",
        "พูดคุยกับผู้ขายได้ทันทีผ่านระบบแชทภายใน ไม่ต้องออกนอกเว็บ",
        "ระบบสมาชิกช่วยให้จัดการรายการขาย-ซื้อได้สะดวกขึ้น",
        "ดูโปรไฟล์ผู้ขาย พร้อมช่องทางติดต่อครบทุกช่อง",
        "รองรับทั้งภาษาไทยและอังกฤษ พร้อมโหมดแสง-มืด",
      ],
      detailedDescription: "",
    },
    {
      id: "team",
      title: "ทีมงาน",
      description: "ทีมงานของเรา",
      iconComponent: <Users className="w-12 h-12" />,
      color: "from-purple-500 to-pink-500",
      features: [],
      detailedDescription:
        "เบื้องหลัง Area คือทีมที่มีความหลงใหลในอสังหาริมทรัพย์และเทคโนโลยี เราร่วมมือกันพัฒนาเครื่องมือที่ช่วยให้คนไทยซื้อขายที่ดินได้ง่ายขึ้นทุกวัน",
    },
  ]

  // แก้ไขปัญหา hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  useEffect(() => {
    if (!autoplay || !mounted) return

    const interval = setInterval(() => {
      nextCard()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, mounted, cards.length])

  const getCardClass = (index: number) => {
    if (!mounted) return "hidden"

    const diff = (index - activeIndex + cards.length) % cards.length
    if (diff === 0) return "active"
    if (diff === 1 || diff === cards.length - 1) return diff === 1 ? "next" : "prev"
    return "hidden"
  }

  // ไม่แสดงอะไรเลยจนกว่าจะ mounted เพื่อป้องกัน hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="relative h-[500px] w-full max-w-3xl mx-auto my-12">
      <div className="card-stack h-full w-full">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card-stack-item absolute inset-0 glass-card p-8 ${getCardClass(index)}`}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.color} opacity-20`} />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="text-5xl mb-6 text-gray-800 dark:text-gray-200">{card.iconComponent}</div>
                <h3 className="text-4xl font-semibold mb-4">{card.title}</h3>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-5">{card.description}</p>

                <div className="mt-4 space-y-5">
                  {card.detailedDescription && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      {card.detailedDescription}
                    </p>
                  )}

                  {card.features.length > 0 && (
                    <div className="mt-5">
                      <ul className="list-disc pl-6 space-y-3">
                        {card.features.map((feature, idx) => (
                          <li key={idx} className="text-base text-gray-600 dark:text-gray-400">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="flex space-x-2">
                  {cards.map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-full transition-all duration-300 ${
                        i === activeIndex ? "bg-gray-800 dark:bg-white w-8" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                    onClick={prevCard}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                    onClick={nextCard}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
