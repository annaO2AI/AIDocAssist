import { APIService } from "../service/api"
import { useTranscriptionWebSocket } from "./useTranscriptionWebSocket"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import {
  StopRecoding,
  Speeker,
  AudioLineIcon,
} from "../../chat-ui/components/icons"

interface TextCase {
  sessionId: number
  patientId: number
}
interface SummaryData {
  id?: number
  content: string
  status?: string
}

export default function TranscriptionComponent({ sessionId, patientId }: TextCase) {
  const router = useRouter()
  const [isSessionEnd,setIsSessionEnd] = useState(false)
  // WebSocket hook
  const {
    isConnected,
    isRecording,
    transcription,
    error: wsError,
    startRecording,
    stopRecording,
    connect,
    disconnect,
  } = useTranscriptionWebSocket({
    sessionId,
    autoConnect: true,
  })

  // Format timestamp for logs
  const formatTime = useCallback((timestamp?: number) => {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleTimeString()
  }, [])

  const handleStopRecording = async () => {
    setIsSessionEnd(true)
    stopRecording();
    try{
      const result = await APIService.endSession(sessionId)
    console.log(result)
    }catch(err:any){
     alert(err?.detail ?? err?.message ?? 'Something went wrong');
    }finally{
            router.push(`/mediNote-ai/transcription-summary?session_id=${sessionId}`)
        setIsSessionEnd(false)
    }
  }

  return (
    <div className="mediNote-widthfix mx-auto rounded-lg px-4">
      <div className="mediNote-widthfix-warpper">
        {/* Transcription Display */}
        <div className="mb-4">
          <div className="bg-white rounded-md max-h-96 overflow-y-auto">
            {transcription.length !== 0 &&
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
              ))}
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
          {!isConnected && 
          <button className=" px-2 py-2 rounded-md font-medium flex items-center bg-blue-200 hover:bg-blue-300">Connect</button>}
        </div>

        {/* Error Display */}
        {wsError && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{wsError}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-between controle-search-AIDocAssist h-[90px]">
        {isSessionEnd ? 
        <div className="text-start my-auto pl-3 text-xl text-blue-200">
          Ending Session ....
        </div> :
        <>
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
        </>
            }
          </div>
      </div>
    </div>
  )
}
