"use client"

import { useEffect, useRef, useState } from "react"
import { getActiveNewsTickerItems } from "@/app/admin/news-ticker/actions"

export default function NewsTicker() {
  const [position, setPosition] = useState(0)
  const [ahkamItems, setAhkamItems] = useState<string[]>([])
  const tickerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch news ticker items from database
    const fetchItems = async () => {
      try {
        const items = await getActiveNewsTickerItems()
        const texts = items.map((item) => item.text)
        setAhkamItems(texts)
      } catch (error) {
        console.error("Error fetching news ticker items:", error)
        setAhkamItems([]) // Set to empty on error
      }
    }

    fetchItems()
  }, [])

  // This effect sets the initial off-screen position only when items are loaded
  useEffect(() => {
    if (ahkamItems.length > 0 && tickerRef.current) {
        setPosition(-tickerRef.current.scrollWidth);
    }
  }, [ahkamItems])

  const combinedAhkam = ahkamItems.join(" • ")

  // This effect runs the animation
  useEffect(() => {
    // Only run animation if there's text
    if (ahkamItems.length === 0 || !tickerRef.current || !containerRef.current) return

    const animate = () => {
      const tickerWidth = tickerRef.current?.scrollWidth || 0
      const containerWidth = containerRef.current?.clientWidth || 0

      setPosition((prevPosition) => {
        if (prevPosition >= containerWidth) {
          return -tickerWidth
        }
        return prevPosition + 1
      })
    }

    const interval = setInterval(animate, 30)

    return () => clearInterval(interval)
  }, [ahkamItems, combinedAhkam]) // Depend on ahkamItems to start/stop the effect

  // **FIX: The main component frame is now ALWAYS rendered.**
  return (
    <div className="bg-primary/10 border-y border-primary/30 py-3 overflow-hidden text-foreground">
      <div className="container relative">
        <div className="flex items-center">
          <div className="font-bold ml-4 bg-secondary text-white px-3 py-1 rounded whitespace-nowrap">
            احکام آیت الله سیستانی
          </div>
          <div ref={containerRef} className="overflow-hidden flex-1 relative h-[28px]">
            {/* **FIX: Only render the moving text div if there are items to show** */}
            {ahkamItems.length > 0 && (
              <div
                ref={tickerRef}
                className="absolute whitespace-nowrap text-right font-medium text-lg"
                style={{ transform: `translateX(${position}px)` }}
              >
                {combinedAhkam}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}