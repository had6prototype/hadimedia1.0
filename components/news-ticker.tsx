"use client"

import { useEffect, useState } from "react"
import { getActiveNewsTickerItems } from "@/app/admin/news-ticker/actions"

export default function NewsTicker() {
  const [position, setPosition] = useState(0)
  const [ahkamItems, setAhkamItems] = useState<string[]>([])

  useEffect(() => {
    // Fetch news ticker items from database
    const fetchItems = async () => {
      try {
        const items = await getActiveNewsTickerItems()
        const texts = items.map((item) => item.text)
        setAhkamItems(
          texts.length > 0
            ? texts
            : [
                "احکام آیت الله سیستانی: نماز و روزه در سفر",
                "احکام آیت الله سیستانی: خمس و زکات",
                "احکام آیت الله سیستانی: معاملات و تجارت",
              ],
        )
      } catch (error) {
        console.error("Error fetching news ticker items:", error)
        // Fallback to default items
        setAhkamItems([
          "احکام آیت الله سیستانی: نماز و روزه در سفر",
          "احکام آیت الله سیستانی: خمس و زکات",
          "احکام آیت الله سیستانی: معاملات و تجارت",
        ])
      }
    }

    fetchItems()
  }, [])

  const combinedAhkam = ahkamItems.join(" • ")

  useEffect(() => {
    if (!combinedAhkam) return

    // شروع از خارج از صفحه در سمت چپ
    setPosition(-window.innerWidth)

    const tickerWidth = combinedAhkam.length * 12 // تنظیم عرض تقریبی بر اساس طول متن

    const animate = () => {
      setPosition((prevPosition) => {
        // حرکت از چپ به راست
        if (prevPosition >= tickerWidth) {
          return -window.innerWidth // شروع مجدد از خارج صفحه سمت چپ
        }
        return prevPosition + 1 // افزایش به جای کاهش برای حرکت از چپ به راست
      })
    }

    const interval = setInterval(animate, 30)

    return () => clearInterval(interval)
  }, [combinedAhkam])

  if (!combinedAhkam) return null

  return (
    <div className="bg-primary/10 border-y border-primary/30 py-3 overflow-hidden text-foreground">
      <div className="container relative">
        <div className="flex items-center">
          <div className="font-bold ml-4 bg-secondary text-white px-3 py-1 rounded whitespace-nowrap">
            احکام آیت الله سیستانی
          </div>
          <div className="overflow-hidden flex-1 relative">
            <div
              className="inline-block whitespace-nowrap text-right font-medium text-lg"
              style={{ transform: `translateX(${position}px)` }}
            >
              {combinedAhkam}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
