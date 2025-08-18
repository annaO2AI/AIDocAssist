"use client"
import { useCallback, useEffect, useState } from "react"
import { Play, Pause, Edit, CheckCircle, FileText } from "lucide-react"
import { APIService } from "../service/api"
import { SummaryData } from "../types"

type TextCase = {
  sessionId: number
  patientId: number
}

export default function SummaryGeneration({ sessionId, patientId }: TextCase) {
  const [apiError, setApiError] = useState("")
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [editedSummary, setEditedSummary] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [notification, setNotification] = useState<{message: string, show: boolean}>({message: '', show: false})

  const handleApiError = useCallback((error: unknown, context: string) => {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    setApiError(`${context}: ${errorMessage}`)
    console.error(`${context} error:`, error)
  }, [])

  const showNotification = (message: string) => {
    setNotification({message, show: true})
    setTimeout(() => setNotification({message: '', show: false}), 3000)
  }
  // Fetch summary data
  const fetchSummary = useCallback(async (sessionId: number) => {
    try {
      const data = await APIService.getSummaryById(sessionId)
      if (data) {
        setSummary(data)
        setEditedSummary(data.content || "")
      }
    } catch (err) {
      handleApiError(err, "Failed to fetch summary")
      throw err
    }
  }, [handleApiError])

  useEffect(() => {
    if (sessionId) {
      fetchSummary(sessionId)
      // Mock audio duration
      setDuration(180) // 3 minutes
    }
  }, [sessionId, fetchSummary])

  // Handle edit toggle
  const handleEditToggle = () => {
    setIsEdit(!isEdit)
  }

  // Handle save edited summary
  const handleSaveEditedSummary = useCallback(async () => {
    try {
      if (!summary) return
      
      const data = await APIService.editSummary({
        summaryId: summary.summary_id,
        edited_text: editedSummary
      })
      
      setSummary({
        ...summary,
        content: editedSummary
      })
      
      setIsEdit(false)
    
    //   alert("Summary updated successfully!")
      return data
    } catch (err) {
      handleApiError(err, "Failed to update summary")
      throw err
    }
  }, [editedSummary, summary, handleApiError])

  // Save summary handler
  const handleSaveSummary = useCallback(async () => {
    try {
      if (!summary) return
      
      const data = await APIService.saveSummary({
        doctor_id: 0,
        patient_id: patientId,
        session_id: sessionId,
        original_text: summary.content,
        summary_text: editedSummary,
      })
    showNotification("Summary saved successfully!")
    //   alert("Summary saved successfully!")
      return data
    } catch (err) {
      handleApiError(err, "Failed to save summary")
      throw err
    }
  }, [sessionId, patientId, summary, editedSummary, handleApiError])

  // Approve summary handler
  const handleApproveSummary = useCallback(async () => {
    try {
      if (!summary) return
      
      const data = await APIService.saveFinalSummary({
        session_id: sessionId,
      })
      showNotification("Summary approved successfully!")
  //   alert("Summary approved successfully!")
      return data
    } catch (err) {
      handleApiError(err, "Failed to approve summary")
      throw err
    }
  }, [sessionId, editedSummary, summary, handleApiError])

  // Toggle play/pause for audio player
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    // Mock progress update
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(interval)
            setIsPlaying(false)
            return duration
          }
          return prev + 1
        })
      }, 1000)
    }
  }

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickPosition = e.clientX - rect.left
    const percentage = clickPosition / rect.width
    const newTime = duration * percentage
    setCurrentTime(newTime)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
         {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-md shadow-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            {notification.message}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Summary
            </h1>
          </div>
          <button 
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            onClick={isEdit ? handleSaveEditedSummary : handleEditToggle}
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">{isEdit ? 'Save' : 'Edit'}</span>
          </button>
        </div>
              {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {isEdit ? (
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
          />
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {summary?.content}
          </p>
        )}
      </div>

        {/* Audio Player */}
        {/* <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <div className="flex-1">
              <div
                className="h-2 bg-gray-200 rounded-full cursor-pointer relative"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Patient Info */}
        {/* <div className="mt-6 space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Patient:</span>{" "}
            <span className="text-gray-600">Mr. Davis</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Symptoms:</span>{" "}
            <span className="text-gray-600">
              Chest tightness during exertion, mild shortness of breath
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>{" "}
            <span className="text-gray-600">Past few days</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Family History:</span>{" "}
            <span className="text-gray-600">
              Father had a heart attack in his 50s
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Next Steps:</span>{" "}
            <span className="text-gray-600">ECC and blood tests scheduled</span>
          </div>
        </div> */}
      </div>

      {/* Summary Section */}
      {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
        </div>
        
        {isEdit ? (
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
          />
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {summary?.content}
          </p>
        )}
      </div> */}

      {/* Insights Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Doctor Call Insights */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  Doctor Call Insights
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Dr. Rachel</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Noted patient's chest discomfort over the past few days.
              </p>
            </div>
          </div>
        </div> */}

        {/* Patient Call Insights */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  Patient Call Insights
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Mr. Davis</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Reported chest discomfort for the past few days, described as
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Follow-up Appointment */}
      {/* <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">
              Follow-up Appointment
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> To be determined after
              lab results (estimated around 01/08/2025)
            </p>
          </div>
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8">
        <button
          className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={handleSaveSummary}
        >
          Save Draft
        </button>
        <button
          onClick={handleApproveSummary}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Submit</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Error Display */}
      {apiError && (
        <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p>{apiError}</p>
        </div>
      )}

      {/* Footer */}
      {/* <div className="text-center text-xs text-gray-400 mt-8">
        10/07/2024 - 4:30 PM
      </div> */}
    </div>
  )
}