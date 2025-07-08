"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Volume2,
  Users,
  VolumeX,
  Maximize,
  Minimize,
  Pause,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react"

export default function LivePage() {
  // Updated stream URLs with the new primary URL
  const streamUrls = [
    "https://672a3a5c8e335.streamlock.net:443/alhadi/smil:alhadimedia.smil/playlist.m3u8",
    "https://g.decdn.net/haditv.co.uk/haditv6.m3u8", // Fallback
  ]

  const [currentStreamIndex, setCurrentStreamIndex] = useState(0)
  const [streamStatus, setStreamStatus] = useState<"checking" | "available" | "unavailable">("checking")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewers, setViewers] = useState(1250)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<any>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
        startLoadingProgress()

        try {
          const streamUrl = streamUrls[currentStreamIndex]
          console.log(`Loading stream: ${streamUrl}`)

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
              console.log("HLS manifest parsed")
              setStreamStatus("available")
              setError(null)
              setIsLoading(false)
              stopLoadingProgress()
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current)
              }
            })

            hlsRef.current.on(Hls.Events.LEVEL_LOADED, () => {
              setLoadingProgress(75)
            })

            hlsRef.current.on(Hls.Events.FRAG_LOADED, () => {
              setLoadingProgress(85)
            })

            hlsRef.current.on(Hls.Events.ERROR, (event: any, data: any) => {
              console.error("HLS Error:", data)
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error", data)
                    setStreamStatus("unavailable")
                    // Retry with the next stream URL or show an error after all attempts
                    if (currentStreamIndex < streamUrls.length - 1) {
                      console.log(`Trying next stream URL (${currentStreamIndex + 1})`)
                      setCurrentStreamIndex(currentStreamIndex + 1)
                    } else {
                      setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
                      stopLoadingProgress()
                    }
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Media error", data)
                    setStreamStatus("unavailable")
                    hlsRef.current.recoverMediaError()
                    break
                  default:
                    console.error("Unrecoverable error", data)
                    setStreamStatus("unavailable")
                    setError("خطا در پخش ویدیو. لطفاً دوباره تلاش کنید.")
                    stopLoadingProgress()
                    break
                }
              }
            })
          } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            // For Safari which has native HLS support
            videoRef.current.src = streamUrl
            videoRef.current.addEventListener("loadedmetadata", () => {
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
            setError("مرورگر شما از پخش زنده پشتیبانی نمی‌کند.")
            setStreamStatus("unavailable")
            setIsLoading(false)
            stopLoadingProgress()
          }
        } catch (err) {
          console.error("Error loading HLS.js:", err)
          setError("خطا در بارگذاری پخش زنده.")
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

    // Simulate random viewer count changes
    const interval = setInterval(() => {
      setViewers((prev) => Math.floor(prev + (Math.random() * 10 - 5)))
    }, 5000)

    // Cleanup function
    return () => {
      clearInterval(interval)
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
    setCurrentStreamIndex(0)
    setStreamStatus("checking")
    setIsLoading(true)

    if (hlsRef.current) {
      hlsRef.current.destroy()
    }

    // Trigger re-initialization
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <div className="container py-8 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-4xl">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800">
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {streamStatus === "available" ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="font-medium text-white text-sm">پخش زنده</span>
                </>
              ) : streamStatus === "unavailable" ? (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium text-white text-sm">غیرفعال</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span className="font-medium text-white text-sm">در حال بارگذاری...</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-white text-sm">
              <Users className="h-4 w-4" />
              <span>{viewers} بیننده</span>
            </div>
          </div>

          {/* Loading Progress Bar */}
          {streamStatus === "checking" && loadingProgress > 0 && (
            <div className="absolute top-16 left-3 right-3 z-10">
              <div className="bg-black/50 rounded p-2">
                <div className="flex justify-between text-white text-xs mb-1">
                  <span>بارگذاری پخش زنده</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {error && streamStatus === "unavailable" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center z-20">
              <AlertCircle className="h-12 w-12 mb-4 text-yellow-400" />
              <p className="mb-4">{error}</p>
              <Button variant="secondary" size="sm" onClick={retryStream}>
                تلاش مجدد
              </Button>
            </div>
          )}

          {streamStatus === "checking" && !error && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-white" />
                <p className="text-white">در حال بارگذاری پخش زنده...</p>
                <p className="text-white/70 text-sm mt-1">لطفاً صبر کنید، این ممکن است چند لحظه طول بکشد</p>
                {loadingProgress > 0 && <p className="text-white/70 text-sm mt-1">{Math.round(loadingProgress)}%</p>}
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster="/images/logo.png"
            playsInline
            muted={isMuted}
          />

          {!isPlaying && !isLoading && !error && streamStatus === "available" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-medium">کانال الهادی داری</span>
                </div>
                <p className="text-xl font-bold mb-4">پخش زنده برنامه‌های اسلامی</p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="mt-2 gap-2 px-6 py-6 rounded-full hover:scale-105 transition-transform"
                  onClick={togglePlay}
                >
                  <Play className="h-6 w-6" />
                  شروع پخش زنده
                </Button>
              </div>
            </div>
          )}

          {isLoading && !error && streamStatus === "available" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-white" />
                <p className="text-white">در حال آماده‌سازی پخش...</p>
              </div>
            </div>
          )}

          {isPlaying && !isLoading && !error && streamStatus === "available" && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <div className="h-1 bg-white/20 rounded-full w-32 md:w-48 lg:w-64 overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                    <Pause className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
