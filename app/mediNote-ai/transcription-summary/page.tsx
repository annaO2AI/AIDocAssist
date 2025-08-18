"use client"
import HeaderAISearch from "@/app/chat-ui/components/Header"
import Breadcrumbs from "@/app/components/dashboard/Breadcrumbs"
import Sidebar from "@/app/components/dashboard/Sidebar"
import { DashboardProvider } from "@/app/context/DashboardContext"
import React, { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { APIService } from "../service/api"
import { useSearchParams } from "next/navigation"
import MedicalConsultationInterface from "./Summary"

export default function TranscriptionSummaryPage() {
  const searchParams = useSearchParams()
  const sessionId = Number(searchParams.get("session_id")) || 0
  const [collapsed, setCollapsed] = useState(true)
  const [hovered, setHovered] = useState(false)

  const patientId =  2;
  console.log(sessionId,"sessionId", searchParams.get("session_id"))
  const toggleCollapse = () => {
    const newCollapsed = !collapsed
    localStorage.setItem("sidebar-collapsed", String(newCollapsed))
    setCollapsed(newCollapsed)
  }
  const isSidebarExpanded = !collapsed || hovered
  const sidebarWidth = isSidebarExpanded ? 256 : 64
  const showSidebar = true

  const [apiError, setApiError] = useState("")
  // Handle API errors consistently
  const handleApiError = useCallback((error: unknown, context: string) => {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred"

    setApiError(`${context}: ${errorMessage}`)
    console.error(`${context} error:`, error)
  }, [])

  const fetchTranscript = useCallback(async() => {
    try{

      const transcript = await APIService.getTranscript(sessionId)
      console.log(transcript)
    }catch (err) {
      handleApiError(err, "Failed to fetch Transcript")
    } 
  },[sessionId, handleApiError])

  const fetchSummary = useCallback(async () => {
    try {
      const data = await APIService.getSummaryById(sessionId)
    } catch (err) {
      handleApiError(err, "Failed to fetch summary")
    } finally {
    }
  }, [sessionId, handleApiError])

  useEffect(() => {
 if(sessionId !== 0){
     fetchTranscript()
    fetchSummary()
 }
  }, [sessionId])

  // Generate summary handler
  const handleGenerateSummary = useCallback(async () => {
    try {
      setApiError("")

      const transcriptionText = ""
      const data = await APIService.generateSummary(transcriptionText)
    } catch (err) {
      handleApiError(err, "Failed to generate summary")
    } finally {
    }
  }, [handleApiError])

  // Save summary handler
  const handleSaveSummary = useCallback(async () => {
    try {
      setApiError("")

      const data = await APIService.saveSummary({
        doctor_id: 0,
        patient_id: patientId,
        session_id: sessionId,
        original_text: "",
        summary_text: "",
      })

      alert("Summary saved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to save summary")
    } finally {
    }
  }, [sessionId, handleApiError])

  // Approve summary handler
  const handleApproveSummary = useCallback(async () => {
    try {
      setApiError("")

      const data = await APIService.saveFinalSummary({
        session_id: sessionId,
        final_content: "",
        title: `Session ${sessionId} Summary`,
      })

      alert("Summary approved successfully!")
    } catch (err) {
      handleApiError(err, "Failed to approve summary")
    } finally {
    }
  }, [sessionId, handleApiError])

  // Update summary handler
  const handleUpdateSummary = useCallback(async () => {
    try {
      setApiError("")

      const data = await APIService.editSummary({
        summaryId: 1,
        edited_text: "",
      })

      alert("Summary updated successfully!")
    } catch (err) {
      handleApiError(err, "Failed to update summary")
    } finally {
    }
  }, [handleApiError])

  return (
    <DashboardProvider>
      <div className="flex overflow-hidden">
        {showSidebar && (
          <Sidebar
            collapsed={collapsed}
            hovered={hovered}
            toggleSidebar={toggleCollapse}
            setHovered={setHovered}
          />
        )}
        <HeaderAISearch sidebarOpen={showSidebar && isSidebarExpanded} />
        <Breadcrumbs sidebarOpen={showSidebar && isSidebarExpanded} />
        <div
          className="flex flex-col flex-1 transition-all duration-300 ease-in-out"
          style={{ marginLeft: showSidebar ? sidebarWidth : 0 }}
        >
          <main>
            <MedicalConsultationInterface handleSaveAsDraft={handleSaveSummary} handleApproveSummary={handleApproveSummary}/>
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
