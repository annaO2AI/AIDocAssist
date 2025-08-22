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

interface TranscriptionInterfaceProps {
  sessionId: number
  patientId: number
  setTranscriptionEnd: (summary: TranscriptionSummary) => void
}

const TranscriptionInterface: React.FC<TranscriptionInterfaceProps> = ({
  sessionId,
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
  } = useTranscriptionWebSocket({
    sessionId,
    doctorId: 0,
    patientId,
  })

  const [showStopConfirmation, setShowStopConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [transcription])

  const handleStopRecording = () => {
    setShowStopConfirmation(true)
  }

  const confirmStopRecording = async () => {
    setIsProcessing(true)
    stopRecording()
    
    try {
      const result = await APIService.endSession(sessionId)
      if (result) {
        setTranscriptionEnd(result)
      }
    } catch (error) {
      console.error("Error ending session:", error)
    } finally {
      setIsProcessing(false)
      setShowStopConfirmation(false)
    }
  }

  const cancelStopRecording = () => {
    setShowStopConfirmation(false)
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
              <>
                <h3 className="text-lg font-medium mb-4">
                  Are you sure you want to stop the recording?
                </h3>
                <p className="text-gray-600 mb-6">
                  The current conversation will be saved and processed.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelStopRecording}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
              </>
            )}
          </div>
        </div>
      )}

      <div className="mediNote-widthfix-warpper">
        {/* Transcription Display */}
        <div className="mt-10">
          {transcription.length === 0 ? (
            <WelcomeMessage username={"Doctor"} />
            // <div className="text-center py-12 text-gray-500">
            //   <svg
            //     className="w-16 h-16 mx-auto mb-4 text-gray-300"
            //     fill="none"
            //     stroke="currentColor"
            //     viewBox="0 0 24 24"
            //   >
            //     <path
            //       strokeLinecap="round"
            //       strokeLinejoin="round"
            //       strokeWidth={1.5}
            //       d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012 2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            //     />
            //   </svg>
            //   <p>
            //     {isConnected
            //       ? "No transcription yet. Start recording to begin."
            //       : "Connect to begin transcription."}
            //   </p>
            // </div>
          ) : (
            <div className="space-y-4 overflow-y-auto p-2 transcriptDoctorPatient">
              {transcription.map((msg: any, index: number) => (
                <div
                  key={index}
                  className={`p-2 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                    msg.type === "turn-final"
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
                          {msg.speaker === "Doctor" && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-normal">
                              DR
                            </div>
                          )}
                          {msg.speaker === "Patient" && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-normal">
                              PA
                            </div>
                          )}
                          {msg.speaker === "Unknown" && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white text-sm font-normal">
                              UN
                            </div>
                          )}
                          {/* <span
                            className={`font-semibold text-sm px-2 py-1 rounded-full ${
                              msg.speaker === "Doctor"
                                ? "bg-blue-100 text-blue-700"
                                : msg.speaker === "Patient"
                                ? "bg-green-100 text-green-700"
                                : msg.speaker === "Unknown"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {msg.speaker === "Doctor" && <span>Dr</span>}
                            {msg.speaker === "Patient" && <span>Pa</span>}
                            {msg.speaker === "Unknown" && <span>Un</span>}
                            {msg.speaker || "System"}
                          </span> */}
                        </div>
                      </div>
                      <p className="text-gray-800 leading-relaxed">
                        {msg.text || msg.msg}
                         {msg.t0 && msg.t1 && (
                          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {(msg.t1 - msg.t0).toFixed(1)}s
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
              onClick={isRecording ? handleStopRecording : startRecording}
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
              onClick={isRecording ? handleStopRecording : startRecording}
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