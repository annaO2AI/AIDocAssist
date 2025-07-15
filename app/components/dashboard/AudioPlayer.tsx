// "use client"

// import React, { useRef, useState, useEffect } from "react"
// import { Mic } from "lucide-react"

// interface AudioPlayerProps {
//   src: string
//   fileName?: string
// }

// const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, fileName }) => {
//   const audioRef = useRef<HTMLAudioElement>(null)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [duration, setDuration] = useState(0)

//   useEffect(() => {
//     const audio = audioRef.current
//     if (!audio) return

//     const onLoaded = () => setDuration(audio.duration)
//     const onTimeUpdate = () => setCurrentTime(audio.currentTime)
//     const onEnded = () => setIsPlaying(false)

//     audio.addEventListener("loadedmetadata", onLoaded)
//     audio.addEventListener("timeupdate", onTimeUpdate)
//     audio.addEventListener("ended", onEnded)

//     return () => {
//       audio.removeEventListener("loadedmetadata", onLoaded)
//       audio.removeEventListener("timeupdate", onTimeUpdate)
//       audio.removeEventListener("ended", onEnded)
//     }
//   }, [])

//   const togglePlay = () => {
//     const audio = audioRef.current
//     console.log(audio)
//     if (!audio) return

//     if (isPlaying) {
//       audio.pause()
//     } else {
//       audio.play()
//     }
//     setIsPlaying(!isPlaying)
//   }

//   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const time = parseFloat(e.target.value)
//     if (audioRef.current) {
//       audioRef.current.currentTime = time
//       setCurrentTime(time)
//     }
//   }

//   const extractFileName = (fullPath: string) => {
//     const parts = fullPath.split("_")
//     return parts[parts.length - 1]
//   }

//   const formatTime = (t: number) =>
//     isNaN(t) ? "00:00" : new Date(t * 1000).toISOString().substring(14, 19)

//   return (
//     <div className="w-[225px] p-3 rounded-xl border border-gray-200 shadow-sm bg-white">
//       <audio ref={audioRef} src={src} preload="metadata" />

//       {/* <div className="text-[10px] text-gray-400 mb-2">1 minute ago</div> */}

//       <div className="flex items-center space-x-2 px-2 py-2 rounded-xl border border-gray-100 shadow-inner bg-gray-50">
//         <div className="text-blue-600 text-lg">
//           <Mic />
//         </div>
//         <div className="truncate text-sm font-semibold text-gray-700 max-w-xs">
//           {extractFileName(src)}
//         </div>
//       </div>

//       <div className="flex items-center mt-3 space-x-2">
//         <button
//           onClick={togglePlay}
//           className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md hover:bg-blue-600"
//         >
//           {isPlaying ? (
//             <svg viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
//               <path d="M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48s48-21.5 48-48V112C96 85.5 74.5 64 48 64zm224 0c-26.5 0-48 21.5-48 48v288c0 26.5 21.5 48 48 48s48-21.5 48-48V112c0-26.5-21.5-48-48-48z" />
//             </svg>
//           ) : (
//             <svg viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
//               <path d="M96 64.14v383.72C96 470.52 131.6 488.7 158.6 469.3l181.5-143.7c20.8-16.5 20.8-49.3 0-65.8L158.6 116.1C131.6 96.7 96 114.9 96 148.1z" />
//             </svg>
//           )}
//         </button>

//         <div className="h-8 bg-white flex items-center justify-center">
//           {/* Static waveform lookalike (SVG or bars can be replaced with waveformjs) */}
//           <div className="flex items-end gap-[2px]">
//             {Array.from({ length: 30 }).map((_, i) => {
//               const height = Math.random() * 10 + 4
//               return (
//                 <div
//                   key={i}
//                   className="w-[2px] bg-blue-400 rounded-sm"
//                   style={{ height }}
//                 />
//               )
//             })}
//           </div>

//           <span className="ml-1 text-xs text-gray-600">
//             {formatTime(duration)}
//           </span>
//         </div>
//       </div>

//       <div className="mt-1 flex justify-between text-[10px] text-gray-400 px-1">
//         <span>{formatTime(currentTime)}</span>
//         <span>{formatTime(duration)}</span>
//       </div>

//       <input
//         type="range"
//         min={0}
//         max={duration}
//         value={currentTime}
//         step={0.1}
//         onChange={handleSeek}
//         className="w-full mt-1 accent-blue-500"
//       />
//     </div>
//   )
// }

// export default AudioPlayer


"use client"

import React, { useRef, useState, useEffect } from "react"
import { Mic } from "lucide-react"

interface AudioPlayerProps {
  src: string
  fileName?: string
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, fileName }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Normalize src to include /audio_sample/ and handle special characters
  const correctedSrc = src.startsWith("/audio_sample/") 
    ? src.replace("–", "-") // Replace en dash with hyphen
    : `/audio_sample${src.startsWith("/") ? src : `/${src}`}`.replace("–", "-");

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => setDuration(audio.duration)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => setIsPlaying(false)
    const onError = () => console.error("Audio loading error:", audio.error)

    audio.addEventListener("loadedmetadata", onLoaded)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    console.log("Audio element:", audio, "Source:", correctedSrc)
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch((error) => console.error("Playback error:", error))
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Updated to handle spaces and hyphens
  const extractFileName = (fullPath: string) => {
    const parts = fullPath.split("/")
    const file = parts[parts.length - 1]
    return decodeURIComponent(file) // Decode %20 to spaces
  }

  const formatTime = (t: number) =>
    isNaN(t) ? "00:00" : new Date(t * 1000).toISOString().substring(14, 19)

  return (
    <div className="w-[225px] p-3 rounded-xl border border-gray-200 shadow-sm bg-white dashbord-main-audio-not">
      <audio ref={audioRef} src={correctedSrc} preload="metadata" />

      <div className="flex items-center space-x-2 px-2 py-2 rounded-xl border border-gray-100 shadow-inner bg-gray-50">
        <div className="text-blue-600 text-lg">
          <Mic />
        </div>
        <div className="truncate text-sm font-semibold text-gray-700 max-w-xs">
          {fileName || extractFileName(correctedSrc)}
        </div>
      </div>

      <div className="flex items-center mt-3 space-x-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md hover:bg-blue-600"
        >
          {isPlaying ? (
            <svg viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
              <path d="M48 64C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48s48-21.5 48-48V112C96 85.5 74.5 64 48 64zm224 0c-26.5 0-48 21.5-48 48v288c0 26.5 21.5 48 48 48s48-21.5 48-48V112c0-26.5-21.5-48-48-48z" />
            </svg>
          ) : (
            <svg viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4">
              <path d="M96 64.14v383.72C96 470.52 131.6 488.7 158.6 469.3l181.5-143.7c20.8-16.5 20.8-49.3 0-65.8L158.6 116.1C131.6 96.7 96 114.9 96 148.1z" />
            </svg>
          )}
        </button>

        <div className="h-8 bg-white flex items-center justify-center">
          <div className="flex items-end gap-[2px]">
            {Array.from({ length: 30 }).map((_, i) => {
              const height = Math.random() * 10 + 4
              return (
                <div
                  key={i}
                  className="w-[2px] bg-blue-400 rounded-sm"
                  style={{ height }}
                />
              )
            })}
          </div>

          <span className="ml-1 text-xs text-gray-600">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-gray-400 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <input
        type="range"
        min={0}
        max={duration}
        value={currentTime}
        step={0.1}
        onChange={handleSeek}
        className="w-full mt-1 accent-blue-500"
      />
    </div>
  )
}

export default AudioPlayer