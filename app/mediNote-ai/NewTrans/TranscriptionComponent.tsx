//TranscriptionComponent.tsx
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
import PharmacyGenerator from "../pharmacy/PharmacyGenerator"

interface TranscriptionInterfaceProps {
  sessionId: number
  // doctorId: number
  patientId: number
  patientName: string
  doctorName: string
  setTranscriptionEnd: (summary: TranscriptionSummary) => void
}

const TranscriptionInterface: React.FC<TranscriptionInterfaceProps> = ({
  sessionId,
  // doctorId,
  patientId,
  patientName,
  doctorName,
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

  // Debug props to verify names are being passed
  useEffect(() => {
    console.log("TranscriptionComponent props:", { patientName, doctorName });
  }, [patientName, doctorName]);

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
<div className="flex Patient-voice mx-auto w-[80%] mt-6 transcription-welcommassege-main rounded-[1vw] relative">
  {/* Top-right PharmacyGenerator */}
      <div className="absolute top-[5px] right-[190px] mt-4 mr-4 z-10">
        <PharmacyGenerator />
      </div>
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
            ? "mediNote-widthfix-warpper-center m-auto w-[80%]"
            : "mediNote-widthfix-warpper m-auto w-[80%]"
        }
      >
        {/* Transcription Display */}
        <div className="mt-10">
            <div className="flex gap-2 text-white items-center absolute left-8 top-8 z-20 ">
              <span className="avatar flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-semibold">{patientName ? patientName.charAt(0).toUpperCase() : "P"}</span>
              <span className="font-semibold text-white flex flex-col leading-[1] ">
                <span className="text-white text-[16px]">{patientName || "No patient selected"}</span> 
                <span className="text-white text-[14px] font-normal">Patent</span>
              </span>
              <span>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.86603 7.5C5.48112 8.16667 4.51887 8.16667 4.13397 7.5L0.669873 1.5C0.284972 0.833333 0.766098 5.89981e-08 1.5359 1.26296e-07L8.4641 7.31979e-07C9.2339 7.99277e-07 9.71503 0.833334 9.33013 1.5L5.86603 7.5Z" fill="white"/>
                </svg>
              </span>
            </div>

            <div className="flex gap-2 text-white items-center absolute top-6 right-6 w-[160px] z-10">
              <span className="avatar flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-semibold">{doctorName ? doctorName.charAt(0).toUpperCase() : "D"}</span>
              <span className="font-semibold text-white flex flex-col leading-[1] ">
                <span className="text-white text-[16px]">{doctorName || "No doctor selected"}</span> 
                <span className="text-white text-[14px] font-normal">Doctor</span>
              </span>
              <span>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.86603 7.5C5.48112 8.16667 4.51887 8.16667 4.13397 7.5L0.669873 1.5C0.284972 0.833333 0.766098 5.89981e-08 1.5359 1.26296e-07L8.4641 7.31979e-07C9.2339 7.99277e-07 9.71503 0.833334 9.33013 1.5L5.86603 7.5Z" fill="white"/>
                </svg>
              </span>
            </div>
          {transcription.length === 0 ? (
            <WelcomeMessage username={"Doctor"} />
          ) : (
            <div className="space-y-4 overflow-y-auto p-2 transcriptDoctorPatient">
              {transcription.map((msg: any, index: number) => {
                if (msg.text === "Thank you.") return null; // Hide "Thank you."
                return (
                  <div
                    key={index}
                    className={`p-2 border-l-4 transition-all duration-200 hover:shadow-md transcript-strip-msg ${msg.type === "turn-final"
                        ? "hover:bg-white"
                        : msg.type === "error"
                          ? "bg-red-50  hover:bg-red-100"
                          : "bg-blue-50  hover:bg-blue-100"
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
          <div className="flex items-center space-x-4 text-white">
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
        <div className="flex flex-wrap gap-3 mb-10 justify-between controle-search-AIDocAssist h-[70px]">
          <div className="flex items-center overflow-hidden dm-width">
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

        <span className="bottomlinerGrading">
              <svg width="289" height="199" viewBox="0 0 289 199" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M74.4604 14.9961C29.4945 21.2278 -3.5762 38.2063 -12.2914 45.6118L-26.7382 51.5987L-18.129 238.328L15.9938 288.05L59.727 287.301L185.831 257.872C186.478 228.034 237.253 176.817 262.56 154.938C307.047 107.868 284.151 58.3168 267.142 39.4252C236.04 -2.0024 184.942 -2.74081 158.943 2.76831C155.608 3.47505 152.272 4.08963 148.876 4.38837C134.405 5.6613 97.5463 9.50809 74.4604 14.9961Z" fill="url(#paint0_linear_3427_90583)" fillOpacity="0.4"/>
              <defs>
              <linearGradient id="paint0_linear_3427_90583" x1="307.848" y1="2.45841" x2="-6.38578" y2="289.124" gradientUnits="userSpaceOnUse">
              <stop stopColor="#45CEF1"/>
              <stop offset="1" stopColor="#219DF1"/>
              </linearGradient>
              </defs>
              </svg>
        </span>
        <span className="rightlinerGrading">
         <svg width="461" height="430" viewBox="0 0 461 430" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M261.412 0C341.45 8.67863e-05 413.082 35.9951 461.001 92.6807V429.783C460.94 429.856 460.878 429.928 460.816 430H289.244C370.46 416.708 432.435 346.208 432.435 261.232C432.435 166.779 355.865 90.2101 261.412 90.21C166.959 90.21 90.3887 166.779 90.3887 261.232C90.3887 346.208 152.364 416.707 233.579 430H62.0068C23.4388 384.476 0.179688 325.571 0.179688 261.232C0.179741 116.958 117.137 0 261.412 0Z" fill="#C2F5F9" fillOpacity="0.2"/>
          </svg>
        </span>
      </div>
    </div>
  )
}

export default TranscriptionInterface