"use client"
import { useCallback, useEffect, useState } from "react"
import {
  Play,
  Pause,
  Edit,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Stethoscope,
  Save,
} from "lucide-react"
import { APIService } from "../service/api"
import { TranscriptionSummary } from "../types"
import { Summary } from "../transcription-summary/Summary"

type TextCase = {
  sessionId: number
  patientId: number
  transcriptionEnd: TranscriptionSummary
  summaryData: SummaryText
}
type SummaryText = {
  success: boolean
  session_id: number
  summary_id: number
  status: string
  title: string
  content: string
  created_at: string
  approved_at: string | null
  file_path: string
  summary: Summary
}

export default function SummaryGeneration({
  sessionId,
  patientId,
  transcriptionEnd,
  summaryData,
}: TextCase) {
  const [apiError, setApiError] = useState("")
  const [summary, setSummary] = useState<any | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [editedSummary, setEditedSummary] = useState("")
  const [notification, setNotification] = useState<{
    message: string
    show: boolean
  }>({ message: "", show: false })
  const [summaryId, setSummaryId] = useState<SummaryText | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [summaryContent, setSummaryContent] = useState<string>( summaryId?.summary?.content
    ?.split("## Summary")[1]
    ?.split("### Doctor Call Insights")[0] || "Summary content not available.")

  const handleApiError = useCallback((error: unknown, context: string) => {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred"
    setApiError(`${context}: ${errorMessage}`)
    console.error(`${context} error:`, error)
  }, [])

  const showNotification = (message: string) => {
    setNotification({ message, show: true })
    setTimeout(() => setNotification({ message: "", show: false }), 3000)
  }
  // Fetch summary data
  const fetchSummary = useCallback(
    async (sessionId: number) => {
      try {
        const data = await APIService.getSummary(sessionId)
        console.log(data, "data summary ")
        if (data) {
          setSummary(data)
        }
      } catch (err) {
        handleApiError(err, "Failed to fetch summary")
        throw err
      }
    },
    [handleApiError]
  )
  // Fetch summary ID
  const fetchSummaryID = useCallback(
    async (sessionId: number) => {
      try {
        const data = await APIService.getSummaryById(sessionId)
        if (data) {
          setSummaryId(data)
        }
      } catch (err) {
        handleApiError(err, "Failed to fetch summary")
        throw err
      }
    },
    [handleApiError]
  )

  useEffect(() => {
    if (sessionId) {
      // fetchSummary(sessionId)
      fetchSummaryID(sessionId)
    }
  }, [sessionId, fetchSummary, fetchSummaryID])

 useEffect(() => {
  setSummaryContent(summaryId?.summary?.content
    ?.split("## Summary")[1]
    ?.split("### Doctor Call Insights")[0] || "Summary content not available.")
 }, [summaryId])

  // Handle save edited summary
  const handleSaveEditedSummary = async () => {
    try {
      if (!summaryData) return

      const data = await APIService.editSummary({
        summaryId: transcriptionEnd.summary_id,
        edited_text: editedSummary,
      })
      setSummaryContent(editedSummary)
      setIsEdit(false)
      showNotification("Summary updated successfully!")
    } catch (err) {
      handleApiError(err, "Failed to update summary")
      throw err
    }
  }

  // Save summary handler
  const handleSaveSummary = async () => {
    try {
      if (!summaryData) return
      const data = await APIService.saveSummary({
        doctor_id: 0,
        patient_id: patientId,
        session_id: sessionId,
        original_text: summaryContent,
        summary_text: editedSummary,
      })
      showNotification("Summary saved successfully!")
      //   alert("Summary saved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to save summary")
      throw err
    }
  }

  // Approve summary handler
  const handleApproveSummary = async() => {
    try {
      if (!summaryData) return

      const data = await APIService.saveFinalSummary({
        session_id: sessionId,
      })
      showNotification("Summary approved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to approve summary")
      throw err
    }
  }
  const patientName = summaryId?.summary?.ui.chips[0].value
  const symptoms = summaryId?.summary?.ui.chips[1].value
  const durationText = summaryId?.summary?.ui.chips[2].value
  const familyHistory = summaryId?.summary?.ui.chips[3].value
  const nextSteps = summaryId?.summary?.ui.chips[4].value.replace("** ", "")

  const doctorName = summaryId?.summary?.ui.insights.doctor.by
  const doctorInsights = summaryId?.summary?.ui.insights.doctor.bullets

  const patientInsights = summaryId?.summary?.ui.insights.patient.bullets

  const followupNote = summaryId?.summary?.ui.followup.note.replace("** ", "")
  const followupDate = summaryId?.summary?.ui.followup.date

  const createdDate =
    summaryId?.created_at &&
    new Date(summaryId?.created_at).toLocaleDateString()
  const createdTime =
    summaryId?.created_at &&
    new Date(summaryId?.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

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
              Patient-{patientName?.replace("#", "")}.mp3
            </h1>
          </div>
          <button
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            onClick={() => {
              setIsEdit(!isEdit)
              if (!isEdit) {
                setEditedSummary(summaryContent?.replace(/\n/g, " ").trim())
              } else {
                handleSaveEditedSummary()
              }
            }}
          >
            {isEdit ? (
              <>
                <Save className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Player */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <button
              // onClick={togglePlayPause}
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
                // onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  // style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>000</span>
                <span>99</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mt-6 space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Patient:</span>{" "}
            <span className="text-gray-600">{patientName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Symptoms:</span>{" "}
            <span className="text-gray-600">{symptoms || "Not specified"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration:</span>{" "}
            <span className="text-gray-600">
              {durationText || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Family History:</span>{" "}
            <span className="text-gray-600">
              {familyHistory || "Not specified"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Next Steps:</span>{" "}
            <span className="text-gray-600">{nextSteps}</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        {isEdit ? (
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={editedSummary}
            onChange={(e) =>
              setEditedSummary(e.target.value?.replace(/\n/g, " ").trim())
            }
          />
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed">
            {summaryContent}
          </p>
        )}
      </div>
      {/* Insights Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Doctor Call Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
              <p className="text-sm text-gray-600 mb-3">{doctorName}</p>
              <ul className="text-sm text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
                {doctorInsights && doctorInsights?.length > 0 ? (
                  doctorInsights?.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))
                ) : (
                  <li>No doctor insights available</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Patient Call Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
              <p className="text-sm text-gray-600 mb-3">{patientName}</p>
              <ul className="text-sm text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
                {patientInsights && patientInsights.length > 0 ? (
                  patientInsights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))
                ) : (
                  <li>No patient insights available</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Appointment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">
              Follow-up Appointment
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> {followupNote}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span>{" "}
              {followupDate || "To be scheduled after results"}
            </p>
          </div>
        </div>
      </div>

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
        </button>
      </div>
    </div>
  )
}
