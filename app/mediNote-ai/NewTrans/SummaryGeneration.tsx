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
  const [icdSectionText, setIcdSectionText] = useState<string>("")
  const [notification, setNotification] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  })
  const [summaryId, setSummaryId] = useState<SummaryText | null>(null)
  const [summaryContent, setSummaryContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

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
    if (!sessionId) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const data = await APIService.getSummaryById(sessionId)
      if (data) setSummaryId(data)
    } catch (err) {
      handleApiError(err, "Failed to fetch summary")
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, handleApiError])

  useEffect(() => {
    fetchSummaryById()
  }, [fetchSummaryById])

  // Helper to upsert the ICD section into the editable summary text
  const upsertIcdSection = useCallback((baseText: string, section: string) => {
    if (!section) return baseText
    const lines = baseText.split("\n")
    const headerIndex = lines.findIndex((l) => /^##\s+ICD Codes\s*\(/.test(l))
    if (headerIndex === -1) {
      // Append with spacing
      const needsNewline = baseText.endsWith("\n") ? "" : "\n"
      return baseText + needsNewline + section
    }
    // Replace section from headerIndex until next section header (## ...)
    let endIndex = lines.length
    for (let i = headerIndex + 1; i < lines.length; i++) {
      if (/^##\s+/.test(lines[i])) {
        endIndex = i
        break
      }
    }
    const before = lines.slice(0, headerIndex).join("\n")
    const after = lines.slice(endIndex).join("\n")
    const mid = section.replace(/\n+$/, "") // avoid trailing extra newlines
    const parts = [before, mid, after].filter((p) => p.length > 0)
    return parts.join("\n") + (after ? "" : "\n")
  }, [])

  // Listen for ICD selection updates and initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const initializeFromStorage = () => {
      try {
        const raw = localStorage.getItem(`icdSelection:${sessionId}`)
        if (!raw) return
        const parsed = JSON.parse(raw) as { system?: string; items?: Array<{ code: string; title: string }>; updatedAt?: string }
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0 && parsed.system) {
          const header = `\n\n ICD Codes (${parsed.system})\n`
          // Deduplicate by code
          const unique = parsed.items.reduce((acc: Array<{ code: string; title: string }>, it) => {
            if (!acc.some((x) => x.code === it.code)) acc.push(it)
            return acc
          }, [])
          const lines = unique.map((it) => `- ${it.code}: ${it.title}`).join("\n")
          setIcdSectionText(header + lines + "\n")
        } else {
          setIcdSectionText("")
        }
      } catch {
        // noop
      }
    }

    initializeFromStorage()

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { sessionId: number; sectionText: string } | undefined
      if (!detail || Number(detail.sessionId) !== Number(sessionId)) return
      setIcdSectionText(detail.sectionText || "")
    }

    window.addEventListener("icdSelectionUpdated", handler as EventListener)
    return () => window.removeEventListener("icdSelectionUpdated", handler as EventListener)
  }, [sessionId])

  // Parse and format the entire content dynamically
  const parseContentSections = (content: string) => {
    if (!content) return []
    
    const sections = content.split(/(?=^#+ )/m).filter(section => section.trim())
    
    return sections.map(section => {
      const lines = section.trim().split('\n')
      const headerLine = lines[0]
      const contentLines = lines.slice(1)
      
      const headerMatch = headerLine.match(/^(#+)\s*(.+)/)
      if (!headerMatch) return null
      
      const level = headerMatch[1].length
      const title = headerMatch[2].trim()
      const content = contentLines.join('\n').trim()
      
      return { level, title, content }
    }).filter(Boolean)
  }

  useEffect(() => {
    if (!summaryId?.summary?.content) {
      setSummaryContent("Summary content not available.")
      return
    }

    setSummaryContent(summaryId.summary.content)
  }, [summaryId])

  // When entering edit mode or ICD section changes, ensure the ICD section is present in the edited text
  useEffect(() => {
    if (!isEdit) return
    setEditedSummary((current) => {
      const base = current && current.trim().length > 0 ? current : summaryContent
      return upsertIcdSection(base || "", icdSectionText)
    })
  }, [isEdit, icdSectionText, summaryContent, upsertIcdSection])

  const handleSaveEditedSummary = async () => {
    // Prefer summary_id from fetched summary; fallback to props if available
    const resolvedSummaryId = summaryId?.summary_id ?? transcriptionEnd?.summary_id ?? summaryData?.summary_id
    if (!resolvedSummaryId) {
      handleApiError(new Error("summary_id not available"), "Cannot update summary")
      return
    }
    try {
      setIsLoading(true)
      await APIService.editSummary({
        summaryId: resolvedSummaryId,
        edited_text: editedSummary || summaryContent,
      })
      setSummaryContent(editedSummary || summaryContent)
      setIsEdit(false)
      showNotification("Summary updated successfully!")
      // Broadcast edit mode off for ICD selector consumers
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`visitSummaryEdit:${sessionId}`, "false")
          window.dispatchEvent(new CustomEvent("visitSummaryEditToggle", { detail: { sessionId, isEdit: false } }))
        }
      } catch {}
    } catch (err) {
      handleApiError(err, "Failed to update summary")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSummary = async () => {
    try {
      setIsLoading(true)
      await APIService.saveSummary({
        doctor_id: 1,
        patient_id: patientId,
        session_id: sessionId,
        original_text: summaryContent,
        summary_text: editedSummary,
      })
      showNotification("Summary saved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to save summary")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveSummary = async () => {
    try {
      setIsLoading(true)
      await APIService.saveFinalSummary({ session_id: sessionId })
      showNotification("Summary approved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to approve summary")
    } finally {
      setIsLoading(false)
    }
  }

  // Updated helper for cleaning and structuring bullets
  const processDoctorInsights = (bullets: string[] = []) => {
    const clean = (str: string) => {
      return str
        .replace(/[*#]+/g, "")
        .replace(/^-\s*/, "")
        .replace(/^\w+\s*-\s*/, "")
        .trim()
    }
    
    const sections: Record<string, string[]> = {
      Treatment: [],
      Instructions: [],
      General: [],
    }
    
    bullets.forEach((text) => {
      const cleanText = clean(text)
      if (cleanText) {
        if (/treatment|therapy|medication|administered/i.test(text)) {
          sections.Treatment.push(cleanText)
        } else if (/instruction|education|precaution/i.test(text)) {
          sections.Instructions.push(cleanText)
        } else {
          sections.General.push(cleanText)
        }
      }
    })
    
    return sections
  }

  // Updated patient insights processing
  const processPatientInsights = (bullets: string[] = []) => {
    return bullets.map(bullet => 
      bullet
        .replace(/[*#]+/g, "")
        .replace(/^-\s*/, "")
        .replace(/^\w+\s*Summary\s*-\s*/i, "")
        .trim()
    ).filter(bullet => bullet.length > 0)
  }

  // Render formatted content sections
  const renderContentSections = (content: string) => {
    const sections = parseContentSections(content)
    
    return sections.map((section, index) => {
      if (!section) return null
      
      const { level, title, content: sectionContent } = section
      
      const formatContent = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim())
        
        return lines.map((line, lineIndex) => {
          const trimmed = line.trim()
          if (!trimmed) return null
          
          if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            const bulletText = trimmed.replace(/^[-•]\s*/, '').trim()
            return (
              <li key={lineIndex} className="text-gray-700 text-sm leading-relaxed ml-4 mb-1">
                {bulletText}
              </li>
            )
          }
          
          return (
            <p key={lineIndex} className="text-gray-700 text-sm leading-relaxed mb-2">
              {trimmed}
            </p>
          )
        }).filter(Boolean)
      }
      
      const HeaderTag = level === 1 ? 'h2' : 'h3'
      const headerClass = level === 1 
        ? 'text-lg font-semibold text-gray-900 mb-3 mt-6 first:mt-0' 
        : 'text-md font-medium text-gray-800 mb-2 mt-4'
      
      return (
        <div key={index} className="mb-4">
          <HeaderTag className={headerClass}>
            {title}
          </HeaderTag>
          <div className="pl-2">
            {sectionContent.includes('-') || sectionContent.includes('•') ? (
              <ul className="list-none space-y-1">
                {formatContent(sectionContent)}
              </ul>
            ) : (
              <div>{formatContent(sectionContent)}</div>
            )}
          </div>
        </div>
      )
    })
  }

  // Safely access nested fields with fallback defaults
  const patientName = summaryId?.summary?.ui?.chips?.[0]?.value ?? "Patient"
  const symptoms = summaryId?.summary?.ui?.chips?.[1]?.value ?? "Not specified"
  const durationText = summaryId?.summary?.ui?.chips?.[2]?.value ?? "Not specified"
  const familyHistory = summaryId?.summary?.ui?.chips?.[3]?.value ?? "Not specified"
  const nextSteps = summaryId?.summary?.ui?.chips?.[4]?.value?.replace(/\*\*/g, "") ?? ""
  const doctorName = summaryId?.summary?.ui?.insights?.doctor?.by ?? "Doctor"
  const doctorBullets = summaryId?.summary?.ui?.insights?.doctor?.bullets ?? []
  const structuredInsights = processDoctorInsights(doctorBullets)
  const patientBullets = summaryId?.summary?.ui?.insights?.patient?.bullets ?? []
  const processedPatientInsights = processPatientInsights(patientBullets)
  const followupNote = summaryId?.summary?.ui?.followup?.note?.replace(/\*\*/g, "") ?? ""
  const followupDate = summaryId?.summary?.ui?.followup?.date ?? "To be scheduled"

  const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    </div>
  )

  return (
    <>
      {isLoading && <Loader />}
      <div className={`w-full mx-auto p-6 bg-gray-50 min-h-screen rounded-lg ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
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
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
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
          </div>
          <Image
            src="/audio-clip-illustrations.svg"
            alt="Audio Clip Illustration"
            width={449}
            height={42}
          />
        </div>

        {/* Chips Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Patient", value: patientName },
              { label: "Symptoms", value: symptoms },
              { label: "Duration", value: durationText },
              { label: "Family History", value: familyHistory },
              { label: "Next Steps", value: nextSteps },
            ].map((chip, index) => (
              <div
                key={index}
                className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span className="font-medium mr-1">{chip.label}:</span>
                <span>{chip.value || "Not specified"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Visit Summary</h2>
          </div>
          <div className="flex justify-between items-start">
            <div className="w-full pr-4">
              {isEdit ? (
                <textarea
                  className="w-full h-96 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  placeholder="Edit the summary here..."
                />
              ) : (
                <div className="text-gray-700 text-sm leading-relaxed">
                  {summaryContent === "Summary content not available." ? (
                    <p>{summaryContent}</p>
                  ) : (
                    renderContentSections(summaryContent)
                  )}
                </div>
              )}
            </div>
            <div className="w-[300px] flex items-center justify-center">
              <Image
                src="/summary-docter-petiont.svg"
                alt="Doctor-Patient Illustration"
                width={250}
                height={170}
              />
            </div>
          </div>
        </div>

        {/* Insights & Follow-up Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Doctor Call Insights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Patient Call Insights</h3>
                <p className="text-sm text-gray-600 mb-3">{patientName}</p>
                {processedPatientInsights.length > 0 ? (
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                    {processedPatientInsights.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image
                src="/follow-up-appointment.svg"
                alt="Follow-up Illustration"
                width={40}
                height={40}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Follow-up Appointment</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Note:</span> {followupNote || "No follow-up actions specified"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date:</span> {followupDate}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8 mb-8">
          {!isEdit && (
            <button
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleApproveSummary}
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Approve Summary</span>
            </button>
          )}
          
          {!isEdit && (
            <button
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={() => {
                setIsEdit(true)
                setEditedSummary(summaryContent)
                // Broadcast edit mode so ICD selector allows selection
                try {
                  if (typeof window !== "undefined") {
                    localStorage.setItem(`visitSummaryEdit:${sessionId}`, "true")
                    window.dispatchEvent(new CustomEvent("visitSummaryEditToggle", { detail: { sessionId, isEdit: true } }))
                  }
                } catch {}
              }}
              disabled={isLoading}
            >
              <Edit className="w-4 h-4 mr-2" />
              <span>Edit Summary</span>
            </button>
          )}

          {isEdit && (
            <button
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              onClick={handleSaveEditedSummary}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              <span>Save Changes</span>
            </button>
          )}

          {isEdit && (
            <button
              className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              onClick={() => {
                setIsEdit(false)
                // Broadcast edit mode off
                try {
                  if (typeof window !== "undefined") {
                    localStorage.setItem(`visitSummaryEdit:${sessionId}`, "false")
                    window.dispatchEvent(new CustomEvent("visitSummaryEditToggle", { detail: { sessionId, isEdit: false } }))
                  }
                } catch {}
              }}
              disabled={isLoading}
            >
              <span>Cancel</span>
            </button>
          )}

          {!isEdit && (
            <button
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={handleSaveSummary}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              <span>Save for Later</span>
            </button>
          )}
          
        </div>
      </div>
    </>
  )
}