"use client"

import { useEffect, useState } from "react"
import { API_ROUTES } from "../../constants/api"
import AudioPlayer from "./AudioPlayer"
import { fetchWithAuth } from "../../utils/axios"
type Props = {
  selectedAudio: string | null
  setSelectedAudio: (filename: string) => void
  clearGraphData: () => void
}

export default function AudioSelector({
  selectedAudio,
  setSelectedAudio,
  clearGraphData,
}: Props) {
  const [audioMap, setAudioMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const res = await fetchWithAuth(API_ROUTES.audioFiles)
        const data = await res.json()
        setAudioMap(data)
      } catch (err) {
        console.error("Failed to load audio files:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAudioFiles()
  }, [])

  const audioUrl =
    selectedAudio && audioMap[selectedAudio]
      ? "/" + audioMap[selectedAudio].replace(/\\/g, "/")
      : ""

  return (
    <>
      {loading ? (
        <p>Loading audio files...</p>
      ) : (
        <div className="relative">
        <select
          className="w-full h-[45px] appearance-none px-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            setSelectedAudio(e.target.value)
            clearGraphData()
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Select an audio file
          </option>
          {Object.keys(audioMap).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
        {/* <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg> */}

        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.10378 1.09419L5.82044 6.00739L10.5371 1.09419" stroke="#34334B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

      </div>
      </div>
      )}
      <div className="dashbord-miannot">
        {selectedAudio && <AudioPlayer src={audioUrl} />}
      </div>
    </>
  )
}
