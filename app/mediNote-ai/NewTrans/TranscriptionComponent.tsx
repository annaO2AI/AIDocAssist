import { APIService } from "../service/api"
import { useTranscriptionWebSocket } from "./useTranscriptionWebSocket"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import {
  StopRecoding,
  Speeker,
  AudioLineIcon,
} from "../../chat-ui/components/icons"

export type TranscriptionData = {
  session_id: number;
  doctor_id: number;
  patient_id: number;
  transcript_line_added: boolean;
  text_preview: string;
  audio_used: string;
  lines_in_memory: number;
};

interface TextCase {
  sessionId: number
  patientId: number
  setTranscriptionData: React.Dispatch<React.SetStateAction<TranscriptionData | null>>
}

interface SummaryData {
  id?: number
  content: string
  status?: string
}

interface UploadedSummary {
  session_id: number
  doctor_id: number
  patient_id: number
  transcript_line_added: boolean
  text_preview: string
  audio_used: string
  lines_in_memory: number
}

export default function TranscriptionComponent({
  sessionId,
  patientId,
  setTranscriptionData
}: TextCase) {
  const router = useRouter()
  // WebSocket hook with audio file support
  const {
    isConnected,
    isRecording,
    transcription,
    error: wsError,
    recordedAudioBlob,
    hasRecordedAudio,
    startRecording,
    stopRecording,
    downloadAudioFile,
    getAudioFile,
    getWavAudioFile,
    connect,
    disconnect,
  } = useTranscriptionWebSocket({
    sessionId,
    autoConnect: true,
  })

  // State management
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiError, setApiError] = useState("")
  const [shouldAutoUpload, setShouldAutoUpload] = useState(false)
  // Format timestamp for logs
  const formatTime = useCallback((timestamp?: number) => {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleTimeString()
  }, [])
  // Fixed upload handler - removed parameter, use state directly
  const handleUploadAudioFile = useCallback(async () => {
    if (!recordedAudioBlob) {
      alert("No audio file to upload")
      return false
    }
    try {
      setIsProcessing(true)
      setApiError("")
      // Convert to WAV format for server compatibility
      const wavAudioFile = await getWavAudioFile(
        `session-${sessionId}-audio.wav`
      )
      if (!wavAudioFile) {
        throw new Error("Failed to convert audio to WAV format")
      }
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("session_id", sessionId.toString())
      formData.append("doctor_id", "0")
      formData.append("patient_id", `${patientId}`)
      formData.append("file", wavAudioFile)

      // API call to transcribe from file
      const response = await APIService.transcribeFromFile(formData)
      if (response) {
        setTranscriptionData(response)
      }
      // alert("Audio file uploaded and processed successfully!")
      return true
    } catch (err) {
      console.error("Upload error:", err)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [recordedAudioBlob, getWavAudioFile, sessionId, isProcessing])

  // Simple stop recording handler
  const handleStopRecording = useCallback(async() => {
    stopRecording()

    // Set flag to trigger auto-upload when blob becomes available
    setShouldAutoUpload(true)

    // 3. End the session
    const result = await APIService.endSession(sessionId);
    console.log('Session ended:', result);

  }, [stopRecording])

  // Watch for audio blob changes and auto-upload
  useEffect(() => {
    const performAutoUpload = async () => {
      if (shouldAutoUpload && recordedAudioBlob && !isProcessing) {
        console.log("Audio blob ready for auto-upload:", {
          size: recordedAudioBlob.size,
          hasRecordedAudio,
        })

        setShouldAutoUpload(false) // Reset flag

        try {
          const success = await handleUploadAudioFile()

          if (success) {
            console.log("Auto-upload completed successfully")
          }
        } catch (error) {
          console.error("Auto-upload failed:", error)
        }
      }
    }

    // Small delay to ensure blob is fully created
    if (shouldAutoUpload && recordedAudioBlob) {
      const timeoutId = setTimeout(performAutoUpload, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [
    shouldAutoUpload,
    recordedAudioBlob,
    isProcessing,
    handleUploadAudioFile,
    hasRecordedAudio,
  ])

  return (
    <div className="mediNote-widthfix mx-auto rounded-lg px-4">
      <div className="mediNote-widthfix-warpper">
        {/* Transcription Display */}
        <div className="mb-4">
          <div className="bg-white rounded-md max-h-96 overflow-y-auto">
            {transcription.length === 0 ? (
              <p className="text-gray-500 italic">
                {isConnected
                  ? "No transcription yet. Start recording to begin."
                  : "Connect to begin transcription."}
              </p>
            ) : (
              transcription.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 p-2 rounded ${
                    msg.type === "error"
                      ? "bg-red-50 border-l-4 border-red-500"
                      : msg.type === "Patient"
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "bg-gray-50 border-l-4 border-gray-300"
                  }`}
                >
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium capitalize">{msg.type}</span>
                    <span>{formatTime(msg.ts)}</span>
                  </div>
                  <p className="text-gray-800">{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span
              className={`h-3 w-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {(wsError || apiError) && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{wsError || apiError}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-between controle-search-AIDocAssist h-[90px]">
          <div className="flex items-center">
            <button
              onClick={isRecording ? handleStopRecording : startRecording}
              disabled={!isConnected}
            >
              {isRecording ? (
                <span className="flex gap-3 items-center">
                  <span className=" px-6 py-4 rounded-md font-medium flex items-center bg-blue-200 hover:bg-blue-300">
                    <Speeker />
                  </span>
                  <AudioLineIcon />
                </span>
              ) : (
                <span className="flex gap-3 items-center">
                  <span className=" px-6 py-4 rounded-md font-medium flex items-center bg-blue-200 hover:bg-blue-300">
                    <Speeker />
                  </span>
                </span>
              )}
            </button>
          </div>
          {/* Processing Status */}
          {isProcessing ? (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700 font-medium">
                  Processing audio file...
                </span>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <button
                onClick={isRecording ? handleStopRecording : startRecording}
                disabled={!isConnected}
                className={`rounded-md font-medium h-[44px] ${
                  isRecording
                    ? "bg-white-500 hover:bg-white-600"
                    : "px-4 py-2  bg-blue-500 hover:bg-blue-600"
                } text-white ${
                  !isConnected ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isRecording ? (
                  <span className="flex items-center">
                    <StopRecoding />
                  </span>
                ) : (
                  "Start Recording"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
