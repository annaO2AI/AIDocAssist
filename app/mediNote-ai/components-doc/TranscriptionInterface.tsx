'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Wifi, WifiOff, RotateCcw } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import { APIService } from '../service/api'
import type { TranscriptMessage, ConversationEntry, startConversation } from '../types'
import { MicIcon, MicOffIcon, AudioLineIcon, StopRecoding } from '../../chat-ui/components/icons'
import SummarySection, { SummaryResponse } from './summary'

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

type SpeechRecognition = typeof window.webkitSpeechRecognition

interface UploadResponse {
  status: string
  session_id: string
  segments_count: number
  total_characters: number
  transcript_file: string
  message: string
}

export default function TranscriptionInterface({ isEnabled }: {isEnabled : boolean}) {
  const [isRecording, setIsRecording] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [currentText, setCurrentText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [detailedSummary, setDetailedSummary] = useState<SummaryResponse | null>(null)
  const [summaries, setSummaries] = useState<SummaryResponse[]>([])
  const [isFetchingSummaries, setIsFetchingSummaries] = useState(false)
  const [summaryType, setSummaryType] = useState<'quick' | 'detailed' | 'medical_notes'>('detailed')
  const [showSummaryOptions, setShowSummaryOptions] = useState(false)
  const [showStopConfirmation, setShowStopConfirmation] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const conversationContainerRef = useRef<HTMLDivElement | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const shouldRestartRecognition = useRef<boolean>(false)
  const recognitionRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const uploadFullRecording = async (audioBlob: Blob, sessionId:any ): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('audio', audioBlob, `${sessionId}_recording.webm`)
    formData.append('timestamp', new Date().toISOString())

    const xhr = new XMLHttpRequest()
    
    return new Promise<UploadResponse>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: UploadResponse = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            reject(new Error('Failed to parse response'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('POST', 'https://doc-assistant-api.azurewebsites.net/api/upload_full_recording')
      xhr.send(formData)
    })
  }

  const completeConversation = useCallback(async () => {
    try {
      const completionUrl = `https://doc-assistant-api.azurewebsites.net/api/conversations/complete`
      
      const response = await fetch(completionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to complete conversation: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error completing conversation:', error)
      throw error
    }
  }, [])

  const handleWebSocketMessage = useCallback((message: TranscriptMessage) => {
    switch (message.type) {
      case 'transcript_update':
        if (message.speaker && message.text) {
          const entry: ConversationEntry = {
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

  const fetchSummaries = useCallback(async () => {
    try {
      setIsFetchingSummaries(true)
      
      await completeConversation()
      
      const summaryUrl = `https://doc-assistant-api.azurewebsites.net/api/conversations/summary`
      
      const summaryResponse = await fetch(summaryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary_type: summaryType })
      })
      
      if (!summaryResponse.ok) {
        throw new Error(`Failed to fetch ${summaryType} summary: ${summaryResponse.status}`)
      }
      
      const summaryData = await summaryResponse.json()
      
      if (summaryType === 'detailed') {
        setDetailedSummary(summaryData)
      } else {
        setSummaries(prev => [...prev, summaryData])
      }
      
      const summariesUrl = `https://doc-assistant-api.azurewebsites.net/api/conversations/summaries`
      const summariesResponse = await fetch(summariesUrl)
      
      if (!summariesResponse.ok) {
        throw new Error(`Failed to fetch summaries: ${summariesResponse.status}`)
      }
      
      const summariesData = await summariesResponse.json()
      setSummaries(summariesData)
      
    } catch (error) {
      console.error('Error in fetchSummaries:', error)
    } finally {
      setIsFetchingSummaries(false)
    }
  }, [summaryType, completeConversation])

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected)
  }, [])

  const { sendAudioChunk, disconnect, reconnect } = useWebSocket({
    sessionId: '1233434',
    onMessage: handleWebSocketMessage,
    onConnectionChange: handleConnectionChange
  })

  // Function to restart speech recognition automatically
  const restartSpeechRecognition = useCallback(() => {
    if (!shouldRestartRecognition.current || !speechRecognitionRef.current) return

    try {
      speechRecognitionRef.current.start()
      console.log('Speech recognition restarted')
    } catch (error) {
      console.log('Error restarting speech recognition:', error)
      // If recognition is already running, this will throw an error, which is fine
    }
  }, [])

  // Function to reset silence timeout
  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        resetSilenceTimeout()
        
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setCurrentText(interimTranscript)

        if (finalTranscript) {
          const entry: ConversationEntry = {
            id: Date.now().toString(),
            speaker: 'doctor',
            text: finalTranscript,
            timestamp: new Date().toLocaleTimeString(),
            isFromBackend: false
          }
          setConversation(prev => [...prev, entry])
          setCurrentText('')
        }
      }

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error)
        
        // Only restart if we're still supposed to be recording
        if (shouldRestartRecognition.current && event.error !== 'aborted') {
          recognitionRestartTimeoutRef.current = setTimeout(() => {
            restartSpeechRecognition()
          }, 1000)
        }
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        
        // Automatically restart if we're still recording
        if (shouldRestartRecognition.current) {
          recognitionRestartTimeoutRef.current = setTimeout(() => {
            restartSpeechRecognition()
          }, 500)
        }
      }

      recognition.onstart = () => {
        console.log('Speech recognition started')
        resetSilenceTimeout()
      }

      recognition.onspeechstart = () => {
        console.log('Speech detected')
        resetSilenceTimeout()
      }

      recognition.onspeechend = () => {
        console.log('Speech ended')
      }

      recognition.onnomatch = () => {
        console.log('No speech match')
      }

      speechRecognitionRef.current = recognition
    }
    const newSessionId = APIService.generateSessionId()
    setSessionId(newSessionId)
  }, [restartSpeechRecognition, resetSilenceTimeout])

  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight
    }
  }, [conversation, currentText])

  const startRecording = async () => {
    try {
      const newSessionId = APIService.generateSessionId()
      setSessionId(newSessionId)

      recordedChunksRef.current = []
      setUploadProgress(0)
      shouldRestartRecognition.current = true

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
          
          if (isConnected) {
            sendAudioChunk(event.data)
          }
        }
      }

      mediaRecorder.start(1000)
      mediaRecorderRef.current = mediaRecorder

      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start()
          console.log('Starting speech recognition')
        } catch (error) {
          console.log('Speech recognition ', error)
        }
      }

      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.log('Failed to start recording:', error)
      shouldRestartRecognition.current = false
    }
  }

  const stopRecording = async (): Promise<void> => {
    return new Promise((resolve) => {
      shouldRestartRecognition.current = false

      // Clear any pending restart timeouts
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current)
        recognitionRestartTimeoutRef.current = null
      }

      // Clear silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())

        mediaRecorderRef.current.onstop = async () => {
          if (recordedChunksRef.current.length > 0) {
            try {
              const fullRecording = new Blob(recordedChunksRef.current, { type: 'audio/webm;codecs=opus' })
              const uploadResponse = await uploadFullRecording(fullRecording, "")
              if (uploadResponse.status === 'success') {
                // Handle successful upload
              }
            } catch (error) {
              console.error('Error in stop recording process:', error)
            } finally {
              recordedChunksRef.current = []
              resolve()
            }
          } else {
            resolve()
          }
        }
      } else {
        resolve()
      }

      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop()
          console.log('Stopping speech recognition')
        } catch (error) {
          console.log('Error stopping speech recognition:', error)
        }
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      setIsRecording(false)
      setRecordingTime(0)
      setCurrentText('')
    })
  }

  const handleStopButtonClick = () => {
    setShowStopConfirmation(true)
  }

  const handleContinueRecording = () => {
    setShowStopConfirmation(false)
  }

  const handleStopAndShowOptions = async () => {
    setShowStopConfirmation(false)
    try {
      setIsUploading(true)
      await stopRecording()
      
      if (sessionId) {
        await completeConversation()
      }
      
      setShowSummaryOptions(true)
    } catch (error) {
      console.error('Error stopping recording:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const clearConversation = () => {
    setConversation([])
    setCurrentText('')
    setDetailedSummary(null)
    setSummaries([])
    setSummaryType('detailed')
    setShowSummaryOptions(false)
  }

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      shouldRestartRecognition.current = false
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current)
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  if (!isEnabled) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          Please complete voice enrollment for both speakers before starting transcription.
        </p>
      </div>
    )
  }

  return (
    <div className="Transcription-Interface rounded-lg p-6 w-full flex flex-col justify-end max-w-7xl m-auto">
      {/* Stop Confirmation Modal */}
      {showStopConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stop Recording?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Do you want to stop recording and generate a summary or continue recording?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleContinueRecording}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Continue Recording
              </button>
              <button
                onClick={handleStopAndShowOptions}
                className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Stop & Show Summary Options
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        {/* <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-green-600 text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-red-600 text-sm">Disconnected</span>
                <button
                  onClick={reconnect}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Reconnect"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div> */}
      </div>

      {isUploading && (
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-600 text-sm">
              {uploadProgress < 100 ? `Uploading recording... (${uploadProgress}%)` : 'Processing recording...'}
            </span>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      <div
        ref={conversationContainerRef}
        className="space-y-3 mb-6 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {conversation.length === 0 && !detailedSummary && summaries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Conversation will appear here...</p>
            <p className="text-sm">Start recording to begin transcription</p>
          </div>
        ) : (
          <>
            {conversation.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg ${
                  entry.speaker === 'doctor' 
                    ? 'bg-blue-50 border-l-4 border-blue-400' 
                    : 'bg-green-50 border-l-4 border-green-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    entry.speaker === 'doctor' ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {entry.speaker.charAt(0).toUpperCase() + entry.speaker.slice(1)}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{entry.timestamp}</span>
                    {entry.isFromBackend && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        AI Identified
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-800">{entry.text}</p>
              </div>
            ))}

            <SummarySection
              sessionId={sessionId}
              summaries={summaries}
              detailedSummary={detailedSummary}
              isFetchingSummaries={isFetchingSummaries}
              summaryType={summaryType}
              setSummaryType={setSummaryType}
              fetchSummaries={fetchSummaries}
              showSummaryOptions={showSummaryOptions}
              setShowSummaryOptions={setShowSummaryOptions}
            />
          </>
        )}
      </div>

      {currentText && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-600">Currently speaking:</p>
          <p className="text-gray-800 italic">{currentText}</p>
        </div>
      )}

      <div className="flex flex-col items-center space-y-4 w-full">
        {!isRecording ? (
          <div className="border-o2 w-full rounded-lg flex items-center ">
            <button
              onClick={startRecording}
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
                  {(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}