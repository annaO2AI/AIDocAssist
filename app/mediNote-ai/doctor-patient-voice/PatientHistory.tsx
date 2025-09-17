import React, { useCallback, useEffect, useState } from "react"
import { APIService } from "../service/api"
import { formatArrayToString, parseHistoryField } from "./Helper"
import { CheckCircle, Edit, Save } from "lucide-react"

interface PatientData {
  id: number
  first_name: string
  last_name: string
}

interface VisitSummary {
  session_id: number
  title: string
  created_at: string
}

interface PatientHistoryResponse {
  success: boolean
  patient: PatientData
  history: string
  previous_visit_summaries: VisitSummary[]
  last_updated: string | null
}

export default function PatientHistory({
  patientIds,
}: {
  patientIds: number[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    show: boolean
  }>({
    message: "",
    show: false,
  })
  const [patientHistories, setPatientHistories] = useState<
    PatientHistoryResponse[]
  >([])
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  )
  const [apiError, setApiError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editedSession, setEditedSession] = useState<string | null>(null)
  const [editedHistory, setEditedHistory] = useState("")
  const [isSummarySaved,setIsSummarySaved] = useState(false)


  const showNotification = (message: string) => {
    setNotification({ message, show: true })
    setTimeout(() => setNotification({ message: "", show: false }), 3000)
  }

  const fetchPatientHistories = async () => {
    setLoading(true)
    setError(null)
    try {
      const historyPromises = patientIds.map((id) =>
        APIService.getPatientHistory(id)
      )
      const results = await Promise.all(
        historyPromises.map((promise) =>
          promise.catch((err) => {
            console.error(`Failed to fetch history for patient ID`, err)
            return null
          })
        )
      )
      const validResults = results.filter(
        (result): result is PatientHistoryResponse => result !== null
      )
      setPatientHistories(validResults)
    } catch (err) {
      setError("Failed to fetch Patient Medical History")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (patientIds.length > 0) {
      fetchPatientHistories()
    } else {
      setPatientHistories([])
      setSelectedPatientId(null)
    }
  }, [patientIds])

  const handleApiError = useCallback((error: unknown, context: string) => {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred"
    setApiError(`${context}: ${message}`)
    console.error(`${context} error:`, error)
  }, [])

  const handleSaveEditedHistory = async (id: number) => {
    try {
      setIsLoading(true)

      const res = await APIService.editSummary({
        summaryId: 1,
        edited_text: editedHistory,
      })
      fetchPatientHistories()
      setIsEdit(false)
      setEditedHistory("")
      setEditedSession(null)
      showNotification("Edit Summary saved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to update patient history")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveSummary = async (sessionId: number) => {
    try {
      setIsLoading(true)
      await APIService.saveFinalSummary({ session_id: sessionId })
      setIsSummarySaved(true)
      showNotification("Summary Saved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to approve summary")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to check if history data exists and has content
  const hasValidHistory = (historyData: string) => {
    if (!historyData || historyData.trim() === '') {
      return false
    }
    
    try {
      const parsedHistory = parseHistoryField(historyData)
      return parsedHistory && parsedHistory.length > 0
    } catch (error) {
      console.error('Error parsing history field:', error)
      return false
    }
  }

  return (
    <>
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-md shadow-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            {notification.message}
          </div>
        </div>
      )}

      <div
        className={`patient-history p-6 border rounded-lg bg-white shadow-sm mt-4 max-w-4xl mx-auto ${
          isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
          Patient Medical History
        </h3>

        {patientHistories &&
          patientHistories.map((data, index) => (
            <div key={index}>
              <div className="patient-info mb-6 p-4 bg-blue-50 rounded-lg w-full">
                <h4 className="font-medium text-blue-800 text-lg mb-2">
                  Patient Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-blue-600 font-medium">ID:</span>{" "}
                    {data?.patient?.id}
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Name:</span>{" "}
                    {data?.patient?.first_name} {data?.patient?.last_name}
                  </div>
                </div>
              </div>

              <div className="history-section mb-6">
                <h4 className="font-medium text-gray-700 text-lg mb-4">
                  Medical History
                </h4>

                {hasValidHistory(data.history) ? (
                  <>
                    {parseHistoryField(data.history).map(
                      (session, sessionIndex) => (
                        <div key={sessionIndex}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="font-semibold text-blue-700">
                              Session #{session.session}
                            </div>
                            <div className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                              {new Date(session.date).toLocaleString()}
                            </div>
                          </div>

                          {!isEdit ? (
                            <div className="flex justify-end gap-2">
                              {!isSummarySaved &&
                              <button
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                onClick={() => {
                                  setIsEdit(true)
                                  setEditedSession(session.session)
                                  setEditedHistory(
                                    formatArrayToString(session?.sections)
                                  )
                                }}
                                disabled={isLoading}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                <span>Edit History</span>
                              </button>
                              }
                              <button
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                onClick={() =>
                                  handleApproveSummary(Number(session?.session))
                                }
                                disabled={isLoading || isSummarySaved}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                <span>Save summary</span>
                              </button>
                            </div>
                          ) : (
                            editedSession === session.session && (
                              <div className="flex justify-end gap-2">
                                <button
                                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                  onClick={() =>
                                    handleSaveEditedHistory(
                                      Number(session?.session)
                                    )
                                  }
                                  disabled={isLoading}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  <span>Save Changes</span>
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                  onClick={() => {
                                    setIsEdit(false)
                                    setEditedSession(null)
                                  }}
                                  disabled={isLoading}
                                >
                                  <span>Cancel</span>
                                </button>
                              </div>
                            )
                          )}

                          {isEdit && editedSession === session.session ? (
                            <div className="mb-4">
                              <textarea
                                className="w-full h-96 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                                value={editedHistory}
                                onChange={(e) =>
                                  setEditedHistory(e.target.value)
                                }
                                placeholder="Edit the patient history here..."
                              />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {session.sections.map((section, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-4 rounded-md shadow-xs"
                                >
                                  <p className="font-bold mb-2 text-blue-800 border-b pb-1">
                                    {section.title}
                                  </p>
                                  {section.content.length > 0 && (
                                    <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                                      {section.content.map((item, i) => (
                                        <li key={i} className="text-sm">
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </>
                ) : (
                  <div className="mt-2 p-4 bg-gray-50 rounded text-gray-500">
                    No medical history recorded
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
