import {
  MicOffIcon,
  AudioLineIcon,
  StopRecoding,
  MicIcon,
} from "@/app/chat-ui/components/icons"
import React, { useCallback, useRef, useState } from "react"
import { APIService } from "../service/api"
import { useWebSocket } from "../hooks/useWebSocket"
import { ConversationEntry } from "../types"

export default function StreamTranscript({sessionId}:{
  sessionId:string
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isConnected, setIsConnected] = useState(true)
    const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const recordedChunksRef = useRef<Blob[]>([])


  const handleStopButtonClick = async() => {
    setIsRecording(false)
    const result = await APIService.endSession(sessionId)
    console.log(result,"end session id")
    if(result){
    const summary = await APIService.generateSummary(JSON.stringify(conversation))
    console.log(summary)
  }}


    const handleWebSocketMessage = useCallback((message: any) => {
      switch (message.type) {
        case 'transcript_update':
          if (message.speaker && message.text) {
            const entry: any = {
              id: Date.now().toString(),
              speaker: message.speaker,
              text: message.text,
              timestamp: new Date().toLocaleTimeString(),
              isFromBackend: true
            }
            setConversation(prev => [...prev, entry])
          }
          break
        
        case 'processing':
          console.log('Backend is processing audio...')
          break
        
        case 'keepalive':
          console.log('Keepalive received')
          break
        
        case 'error':
          break
      }
    }, [])

      const handleConnectionChange = useCallback((connected: boolean) => {
        console.log("caling....")
        setIsRecording(true)
    // setIsConnected(connected)
  }, [])

  const { sendAudioChunk, disconnect, reconnect } = useWebSocket({
      sessionId: sessionId || "1323",
      onMessage: handleWebSocketMessage,
      onConnectionChange: handleConnectionChange
    })
  console.log({isConnected})
  return (
    <div className="flex flex-col items-center space-y-4 w-full mt-12">
      {!isRecording ? (
        <div className="border-o2 w-full rounded-lg flex items-center ">
          <button
          onClick={() => setIsRecording(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors"
            disabled={!isConnected}
          >
            <MicIcon className="w-8 h-8" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2 w-full">
          <div className="flex w-full justify-between border-o2 rounded-lg border-highlight">
            <div className="flex items-center">
              <button
                onClick={handleStopButtonClick}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors"
              >
                <MicOffIcon className="w-8 h-8" />
              </button>
              <AudioLineIcon className="w-[743px] h-[24px]" />
            </div>
            <button
              onClick={handleStopButtonClick}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors"
            >
              <StopRecoding className="w-[45] h-[45]" />
            </button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>
                Recording: {Math.floor(recordingTime / 60)}:
                {(recordingTime % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
