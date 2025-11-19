"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Volume2, VolumeX, Maximize, Minimize, Pause, Loader2, AlertCircle } from "lucide-react"

export default function LiveBanner() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamStatus, setStreamStatus] = useState<"checking" | "available" | "unavailable">("checking")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Updated stream URLs with the new primary URL
  const streamUrls = [
    "http://209.127.202.247:1935/alhadi/_definst_/alhadimedia/playlist.m3u8",
    "http://209.127.202.247:1935/alhadi/_definst_/alhadimedia/playlist.m3u8", // Fallback
  ]

  const [currentStreamIndex, setCurrentStreamIndex] = useState(0)

  // Simulate loading progress for better UX
  const startLoadingProgress = () => {
    setLoadingProgress(0)
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev // Stop at 90% until actual loading completes
        return prev + Math.random() * 15
      })
    }, 500)
  }

  const stopLoadingProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setLoadingProgress(100)
    setTimeout(() => setLoadingProgress(0), 1000)
  }

  // Initialize HLS.js when component mounts
  useEffect(() => {
    const setupHls = async () => {
      if (videoRef.current) {
        setIsLoading(true)
        setStreamStatus("checking")
        setError(null)
        startLoadingProgress()

        try {
          const streamUrl = streamUrls[currentStreamIndex]
          console.log(`Attempting to load stream: ${streamUrl}`)

          // Dynamically import hls.js
          const Hls = (await import("hls.js")).default

          if (Hls.isSupported()) {
            hlsRef.current = new Hls({
              maxBufferLength: 60, // Increased buffer for slower loading streams
              maxMaxBufferLength: 120,
              startLevel: 1, // Start with lower quality for faster initial load
              capLevelToPlayerSize: true,
              debug: false,
              enableWorker: false,
              lowLatencyMode: false,
              backBufferLength: 90,
              // Increased timeouts for slower streams
              manifestLoadingTimeOut: 30000, // 30 seconds
              manifestLoadingMaxRetry: 3,
              levelLoadingTimeOut: 30000,
              levelLoadingMaxRetry: 2,
              fragLoadingTimeOut: 30000,
              fragLoadingMaxRetry: 3,
            })

            hlsRef.current.loadSource(streamUrl)
            hlsRef.current.attachMedia(videoRef.current)

            // Set a longer timeout for this stream since it takes time to load
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current)
            }

            loadingTimeoutRef.current = setTimeout(() => {
              if (streamStatus === "checking") {
                console.log("Stream loading timeout, trying next URL...")
                if (currentStreamIndex < streamUrls.length - 1) {
                  setCurrentStreamIndex((prev) => prev + 1)
                } else {
                  setError("پخش زنده در حال حاضر در دسترس نیست")
                  setStreamStatus("unavailable")
                  setIsLoading(false)
                  stopLoadingProgress()
                }
              }
            }, 45000) // 45 second timeout for slower streams

            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed successfully")
              setStreamStatus("available")
              setError(null)
              setIsLoading(false)
              stopLoadingProgress()
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current)
              }
            })

            hlsRef.current.on(Hls.Events.LEVEL_LOADED, () => {
              console.log("HLS level loaded")
              setLoadingProgress(75)
            })

            hlsRef.current.on(Hls.Events.FRAG_LOADED, () => {
              console.log("HLS fragment loaded")
              setLoadingProgress(85)
            })

            hlsRef.current.on(Hls.Events.ERROR, (event: any, data: any) => {
              console.error("HLS Error:", data)

              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error, trying to recover...")
                    // Try next stream URL if available
                    if (currentStreamIndex < streamUrls.length - 1) {
                      console.log("Trying next stream URL...")
                      setCurrentStreamIndex((prev) => prev + 1)
                      return
                    }
                    setError("خطای شبکه - لطفاً اتصال اینترنت خود را بررسی کنید")
                    setStreamStatus("unavailable")
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Media error, trying to recover...")
                    hlsRef.current.recoverMediaError()
                    break
                  default:
                    console.error("Unrecoverable error:", data)
                    setError("پخش زنده در حال حاضر در دسترس نیست")
                    setStreamStatus("unavailable")
                    break
                }
                setIsLoading(false)
                stopLoadingProgress()
              }
            })
          } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            // For Safari which has native HLS support
            const streamUrl = streamUrls[currentStreamIndex]
            videoRef.current.src = streamUrl

            videoRef.current.addEventListener("loadedmetadata", () => {
              console.log("Safari HLS loaded")
              setStreamStatus("available")
              setError(null)
              setIsLoading(false)
              stopLoadingProgress()
            })

            videoRef.current.addEventListener("error", () => {
              if (currentStreamIndex < streamUrls.length - 1) {
                setCurrentStreamIndex((prev) => prev + 1)
              } else {
                setError("پخش زنده در حال حاضر در دسترس نیست")
                setStreamStatus("unavailable")
                setIsLoading(false)
                stopLoadingProgress()
              }
            })
          } else {
            setError("مرورگر شما از پخش زنده پشتیبانی نمی‌کند")
            setStreamStatus("unavailable")
            setIsLoading(false)
            stopLoadingProgress()
          }
        } catch (err) {
          console.error("Error loading HLS.js:", err)
          setError("خطا در بارگذاری پخش زنده")
          setStreamStatus("unavailable")
          setIsLoading(false)
          stopLoadingProgress()
        }
      }
    }

    setupHls()

    // Add fullscreen event listeners
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      // Remove fullscreen event listeners
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [currentStreamIndex])

  const togglePlay = () => {
    if (videoRef.current && streamStatus === "available") {
      setIsLoading(true)

      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        setIsLoading(false)
      } else {
        const playPromise = videoRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              setIsLoading(false)
            })
            .catch((error) => {
              console.error("Error playing video:", error)
              setIsPlaying(false)
              setIsLoading(false)
              setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
            })
        }
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        // Enter fullscreen
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen()
        } else if ((videoRef.current as any).webkitRequestFullscreen) {
          ;(videoRef.current as any).webkitRequestFullscreen()
        } else if ((videoRef.current as any).mozRequestFullScreen) {
          ;(videoRef.current as any).mozRequestFullScreen()
        } else if ((videoRef.current as any).msRequestFullscreen) {
          ;(videoRef.current as any).msRequestFullscreen()
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          ;(document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          ;(document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          ;(document as any).msExitFullscreen()
        }
      }
    }
  }

  const retryStream = () => {
    setError(null)
    setCurrentStreamIndex(0) // Reset to first stream
    setStreamStatus("checking")
    setIsLoading(true)

    if (hlsRef.current) {
      hlsRef.current.destroy()
    }

    // Trigger re-initialization by updating the effect dependency
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <section className="bg-gradient-to-r from-primary/90 to-primary/70 text-white">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-right">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              {streamStatus === "available" ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="font-medium">پخش زنده</span>
                </>
              ) : streamStatus === "unavailable" ? (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">پخش زنده غیرفعال</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">در حال بارگذاری...</span>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">رسانه الهادی</h1>
            <p className="max-w-md">
              {streamStatus === "available"
                ? "هم‌اکنون برنامه رسانه الهادی در حال پخش زنده است. برای مشاهده روی دکمه پخش کلیک کنید."
                : streamStatus === "unavailable"
                  ? "پخش زنده در حال حاضر در دسترس نیست. لطفاً بعداً دوباره تلاش کنید."
                  : "در حال بارگذاری پخش زنده... لطفاً صبر کنید."}
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              {streamStatus === "available" ? (
                <Button variant="secondary" size="lg" className="gap-2" onClick={togglePlay} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال بارگذاری...
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      توقف پخش زنده
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      مشاهده پخش زنده
                    </>
                  )}
                </Button>
              ) : streamStatus === "unavailable" ? (
                <Button variant="secondary" size="lg" className="gap-2" onClick={retryStream}>
                  <AlertCircle className="h-4 w-4" />
                  تلاش مجدد
                </Button>
              ) : (
                <Button variant="secondary" size="lg" className="gap-2" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال بارگذاری...
                </Button>
              )}
            </div>

            {/* Loading Progress Bar */}
            {streamStatus === "checking" && loadingProgress > 0 && (
              <div className="w-full max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-sm mb-1">
                  <span>بارگذاری پخش زنده</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="relative w-full md:w-auto aspect-video md:h-64 rounded-lg overflow-hidden border-4 border-white/20 bg-black">
            {error && streamStatus === "unavailable" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center">
                <AlertCircle className="h-12 w-12 mb-4 text-yellow-400" />
                <p className="mb-4 text-sm">{error}</p>
                <Button variant="secondary" size="sm" onClick={retryStream}>
                  تلاش مجدد
                </Button>
              </div>
            ) : null}

            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/images/logo-menu.png"
              playsInline
              muted={isMuted}
            />

            {!isPlaying && !isLoading && streamStatus === "available" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button size="icon" variant="secondary" className="rounded-full h-16 w-16" onClick={togglePlay}>
                  <Play className="h-8 w-8" />
                  <span className="sr-only">پخش</span>
                </Button>
              </div>
            )}

            {(isLoading || streamStatus === "checking") && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
                  <p className="text-white">
                    {streamStatus === "checking" ? "در حال بارگذاری پخش زنده..." : "در حال آماده‌سازی..."}
                  </p>
                  {loadingProgress > 0 && <p className="text-white/70 text-sm mt-1">{Math.round(loadingProgress)}%</p>}
                </div>
              </div>
            )}

            {isPlaying && !isLoading && streamStatus === "available" && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" className="text-white h-8 w-8" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white h-8 w-8" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
