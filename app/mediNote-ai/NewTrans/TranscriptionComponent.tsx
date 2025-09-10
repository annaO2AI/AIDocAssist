import React, { useEffect, useRef, useState } from "react"
import { useTranscriptionWebSocket } from "./useTranscriptionWebSocket"
import WelcomeMessage from "./WelcomeMessage"
import {
  AudioLineIcon,
  Speeker,
  StopRecoding,
} from "@/app/chat-ui/components/icons"
import { TranscriptionSummary } from "../types"
import { APIService } from "../service/api"
import Image from "next/image"

interface TranscriptionInterfaceProps {
  sessionId: number
  // doctorId: number
  patientId: number
  setTranscriptionEnd: (summary: TranscriptionSummary) => void
}

const TranscriptionInterface: React.FC<TranscriptionInterfaceProps> = ({
  sessionId,
  // doctorId,
  patientId,
  setTranscriptionEnd,
}) => {
  const {
    isConnected,
    isRecording,
    transcription,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    // safeDisconnect,
  } = useTranscriptionWebSocket({
    sessionId,
    doctorId: 0,
    patientId,
  })

  const [showStopConfirmation, setShowStopConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userInitiatedStop, setUserInitiatedStop] = useState(false) // Track if user initiated stop
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [transcription])

  // Prevent automatic stopping of recording unless user initiated
  useEffect(() => {
    // If recording stops but user didn't initiate it, restart recording
    if (!isRecording && !userInitiatedStop && !isProcessing && isConnected) {
      // Add a small delay to prevent rapid restart loops
      const timer = setTimeout(() => {
        startRecording()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isRecording, userInitiatedStop, isProcessing, isConnected, startRecording])

  const handleStopRecording = () => {
    setUserInitiatedStop(true) // Mark that user initiated the stop
    setShowStopConfirmation(true)
  }

  const confirmStopRecording = async () => {
    setIsProcessing(true)
    
    try {
      stopRecording()
      
      const result = await APIService.endSession(sessionId)
      if (result) {
        setTranscriptionEnd(result)
        // safeDisconnect()
      }
    } catch (error) {
      console.error("Error ending session:", error)
      setUserInitiatedStop(false)
    } finally {
      setIsProcessing(false)
      setShowStopConfirmation(false)
    }
  }

  const cancelStopRecording = () => {
    setUserInitiatedStop(false)
    setShowStopConfirmation(false)
  }

  const handleStartRecording = () => {
    setUserInitiatedStop(false) 
    startRecording()
  }

  return (
    <div className="mediNote-widthfix mx-auto rounded-lg px-4">
      {/* Stop Recording Confirmation Popup */}
      {showStopConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-95 shadow-xl">
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <h3 className="text-lg font-medium mb-2">Processing...</h3>
                <p className="text-gray-600">
                  Generating summary note, please wait...
                </p>
              </div>
            ) : (
              <div className="flex justify-center flex-col items-center p-10">
                <Image
                  src="/stoprecording-conversation.svg"
                  alt="stop recording"
                  width={136.35}
                  height={117.99}
                />
                <h3 className="text-xl font-medium mb-0 mt-10">
                  Are you sure you want to stop the recording?
                </h3>
                <p className="text-gray-600 mb-8">
                  The current conversation will be saved and processed.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelStopRecording}
                    className="px-4 py-2 hover:text-blue-800 bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg"
                    disabled={isProcessing}
                  >
                    Continue recording
                  </button>
                  <button
                    onClick={confirmStopRecording}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    Stop recording & Generate summary note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={
          transcription.length === 0
            ? "mediNote-widthfix-warpper-center"
            : "mediNote-widthfix-warpper"
        }
      >
        {/* Transcription Display */}
        <div className="mt-10">
          {transcription.length === 0 ? (
            <WelcomeMessage username={"Doctor"} />
          ) : (
            <div className="space-y-4 overflow-y-auto p-2 transcriptDoctorPatient">
              {transcription.map((msg: any, index: number) => {
                if (msg.text === "Thank you.") return null; // Hide "Thank you."
                return (
                  <div
                    key={index}
                    className={`p-2 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${msg.type === "turn-final"
                        ? "bg-white border-blue-400 hover:bg-white"
                        : msg.type === "error"
                          ? "bg-red-50 border-red-400 hover:bg-red-100"
                          : "bg-blue-50 border-blue-400 hover:bg-blue-100"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <div className="flex items-center">
                          <div className="flex items-center space-x-2">
                           {msg.speakerName}
                          </div>
                        </div>
                        <p className="text-gray-800 leading-relaxed">
                          {msg.text || msg.msg}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>
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

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-between controle-search-AIDocAssist h-[90px]">
          <div className="flex items-center">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={!isConnected || isProcessing}
            >
              {isRecording ? (
                <span className="flex gap-3 items-center">
                  <span className="px-6 py-4 rounded-md font-medium flex items-center bg-blue-200 hover:bg-blue-300">
                    <Speeker />
                  </span>
                  <AudioLineIcon />
                </span>
              ) : (
                <span className="flex gap-3 items-center">
                  <span className="px-6 py-4 rounded-md font-medium flex items-center bg-blue-200 hover:bg-blue-300">
                    <Speeker />
                  </span>
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={!isConnected || isProcessing}
              className={`rounded-md font-medium h-[44px] ${
                isRecording
                  ? "bg-white-500 hover:bg-white-600"
                  : "px-4 py-2 bg-blue-500 hover:bg-blue-600"
              } text-white ${
                !isConnected || isProcessing ? "opacity-50 cursor-not-allowed" : ""
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
        </div>
      </div>
    </div>
  )
}

export default TranscriptionInterface