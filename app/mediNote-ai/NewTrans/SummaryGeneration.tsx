'use client'

import { useCallback, useEffect, useState } from "react"
import {
  Play, Pause, Edit, CheckCircle,
  FileText, Calendar, User, Stethoscope, Save,
} from "lucide-react"
import { APIService } from "../service/api"
import { TranscriptionSummary } from "../types"
import { Summary } from "../transcription-summary/Summary"
import Image from 'next/image';

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
  const [isEdit, setIsEdit] = useState(false)
  const [editedSummary, setEditedSummary] = useState("")
  const [notification, setNotification] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  })
  const [summaryId, setSummaryId] = useState<SummaryText | null>(null)
  const [summaryContent, setSummaryContent] = useState<string>("")

  const handleApiError = useCallback(
    (error: unknown, context: string) => {
      const message = error instanceof Error ? error.message : "An unknown error occurred"
      setApiError(`${context}: ${message}`)
      console.error(`${context} error:`, error)
    },
    []
  )

  const showNotification = (message: string) => {
    setNotification({ message, show: true })
    setTimeout(() => setNotification({ message: "", show: false }), 3000)
  }

  const fetchSummaryById = useCallback(async () => {
    if (!sessionId) return
    try {
      const data = await APIService.getSummaryById(sessionId)
      if (data) setSummaryId(data)
    } catch (err) {
      handleApiError(err, "Failed to fetch summary")
    }
  }, [sessionId, handleApiError])

  useEffect(() => {
    fetchSummaryById()
  }, [fetchSummaryById])

  useEffect(() => {
    const content =
      summaryId?.summary?.content
        .split("## Summary")[1]
        ?.split("### Doctor Call Insights")[0]
        ?.trim() || "Summary content not available."
    setSummaryContent(content)
  }, [summaryId])

  const handleSaveEditedSummary = async () => {
    if (!transcriptionEnd?.summary_id) return
    try {
      await APIService.editSummary({
        summaryId: transcriptionEnd.summary_id,
        edited_text: editedSummary,
      })
      setSummaryContent(editedSummary)
      setIsEdit(false)
      showNotification("Summary updated successfully!")
    } catch (err) {
      handleApiError(err, "Failed to update summary")
    }
  }

  const handleSaveSummary = async () => {
    try {
      await APIService.saveSummary({
        doctor_id: 0,
        patient_id: patientId,
        session_id: sessionId,
        original_text: summaryContent,
        summary_text: editedSummary,
      })
      showNotification("Summary saved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to save summary")
    }
  }

  const handleApproveSummary = async () => {
    try {
      await APIService.saveFinalSummary({ session_id: sessionId })
      showNotification("Summary approved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to approve summary")
    }
  }

  // Helper for cleaning and structuring bullets
  const processDoctorInsights = (bullets: string[] = []) => {
    const clean = (str: string) => str.replace(/[*#]+/g, "").trim()
    const sections: Record<string, string[]> = {
      Summary: [],
      "Follow-ups": [],
      General: [],
    }
    bullets.forEach((text) => {
      const cleanText = clean(text)
      if (/summary/i.test(text)) sections.Summary.push(cleanText)
      else if (/follow[- ]?up/i.test(text)) sections["Follow-ups"].push(cleanText)
      else sections.General.push(cleanText)
    })
    return sections
  }

  // Safely access nested fields with fallback defaults
  const patientName = summaryId?.summary?.ui?.chips?.[0]?.value ?? "Patient"
  const symptoms = summaryId?.summary?.ui?.chips?.[1]?.value ?? "Not specified"
  const durationText = summaryId?.summary?.ui?.chips?.[2]?.value ?? "Not specified"
  const familyHistory = summaryId?.summary?.ui?.chips?.[3]?.value ?? "Not specified"
  const nextSteps = summaryId?.summary?.ui?.chips?.[4]?.value?.replace("** ", "") ?? ""
  const doctorName = summaryId?.summary?.ui?.insights?.doctor?.by ?? "Doctor"
  const doctorBullets = summaryId?.summary?.ui?.insights?.doctor?.bullets ?? []
  const structuredInsights = processDoctorInsights(doctorBullets)
  const patientInsights = summaryId?.summary?.ui?.insights?.patient?.bullets ?? []
  const followupNote = summaryId?.summary?.ui?.followup?.note?.replace("** ", "") ?? ""
  const followupDate = summaryId?.summary?.ui?.followup?.date ?? "To be scheduled"

  return (
    <>
    <div className="summaryGeneration-widthfix w-full mx-auto p-6 bg-gray-50 min-h-screen mt-12 border-o3 rounded-lg">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-md shadow-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center">
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M5 8.8421C6.18575 8.8421 7.14283 7.85471 7.14283 6.6316V2.21053C7.14283 0.987368 6.18575 0 5 0C3.81425 0 2.85714 0.987368 2.85714 2.21053V6.6316C2.85714 7.85471 3.81425 8.8421 5 8.8421ZM4.28575 2.21053C4.28575 1.80527 4.60717 1.47369 5 1.47369C5.39283 1.47369 5.71425 1.80527 5.71425 2.21053V6.6316C5.71425 7.04423 5.4 7.3684 5 7.3684C4.60717 7.3684 4.28575 7.03684 4.28575 6.6316V2.21053ZM8.78575 6.6316H10C10 9.14418 8.05717 11.2221 5.71425 11.5832V14H4.28575V11.5832C1.94286 11.2221 0 9.14418 0 6.6316H1.21428C1.21428 8.8421 3.02858 10.3895 5 10.3895C6.97142 10.3895 8.78575 8.8421 8.78575 6.6316Z" fill="#34334B"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Patient-{patientName.replace("#", "")}.mp3
            </h1>
          </div>
          <button
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            onClick={() => {
              setIsEdit(!isEdit)
              if (!isEdit) {
                setEditedSummary(summaryContent.replace(/\n/g, " ").trim())
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
        <Image
           src="/audio-clip-illustrations.svg"
           alt="Customer Illustration"
           width={449}
           height={42}
          />
      </div>

      {/* Summary Section */} 
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-o3">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="flex justify-between items-center">
           <div className="w-full">
            {isEdit ? (
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={editedSummary}
              onChange={(e) =>
                setEditedSummary(e.target.value.replace(/\n/g, " ").trim())
              }
            />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{summaryContent}</p>
              )}
            </div>
            <div className="w-[400px] flex  items-center">
              <Image
                src="/summary-docter-petiont.svg"
                alt="Customer Illustration"
                width={250}
                height={170}
              />
             </div>
         </div>
      </div>

      {/* Insights & Follow-up Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Doctor Call Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-o3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Doctor Call Insights</h3>
              <p className="text-sm text-gray-600 mb-3">{doctorName}</p>
              {Object.entries(structuredInsights).map(
                ([section, items]) =>
                  items.length > 0 && (
                    <div key={section} className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">{section}</h4>
                      <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                        {items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
              {doctorBullets.length === 0 && (
                <p className="text-sm text-gray-500">No doctor insights available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Patient Call Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-o3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Patient Call Insights</h3>
              <p className="text-sm text-gray-600 mb-3">{patientName}</p>
              {patientInsights.length > 0 ? (
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  {patientInsights.map((ins, idx) => (
                    <li key={idx}>{ins}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No patient insights available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Appointment */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 custom-gradient">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10  rounded-lg flex items-center justify-center">
            {/* <Calendar className="w-5 h-5 text-purple-600" /> */}
             <Image
                src="/follow-up-appointment.svg"
                alt="follow-up"
                width={40}
                height={40}
              />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">Follow-up Appointment</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> {followupNote}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {followupDate}
            </p>
          </div>
        </div>
      </div>
    </div>
    {/* Action Buttons */}
      <div className="flex justify-center space-x-3 mt-8 mb-8">
        <button
          className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          onClick={handleSaveSummary}
        >
          Save Draft
        </button>
        <button
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={handleApproveSummary}
        >
          <span>Submit</span>
        </button>
      </div>
    </>
  )
}
