"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "../../components/dashboard/Sidebar"
import { DashboardProvider } from "../../context/DashboardContext"
import HeaderAISearch from "../../chat-ui/components/Header"
import Breadcrumbs from "../../components/dashboard/Breadcrumbs"

import CheckPatientVoice from "./CheckPatientVoice"
import { APIService } from "../service/api"
import TranscriptionComponent from "../NewTrans/TranscriptionComponent"
import SummaryGeneration from "../NewTrans/SummaryGeneration"
import { TranscriptionSummary } from "../types"
import { sampleData } from "../transcription-summary/Summary"
import ICDGenerator from "../icdCode/ICDGenerator"

// Define types for our state
type AppState = "patientCheck" | "transcription" | "summary"

export default function ProcurementSearchPage() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [sessionId, setSessionId] = useState<number>()
  const [patientId, setPatientId] = useState<number>()
  const [currentState, setCurrentState] = useState<AppState>("patientCheck")
  const [transcriptionEnd, setTranscriptionEnd] = useState<TranscriptionSummary | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored !== null) setCollapsed(stored === "true")
  }, [])

  const toggleCollapse = () => {
    const newCollapsed = !collapsed
    localStorage.setItem("sidebar-collapsed", String(newCollapsed))
    setCollapsed(newCollapsed)
  }

  const isSidebarExpanded = !collapsed || hovered
  const sidebarWidth = isSidebarExpanded ? 256 : 64

  // Show sidebar on the talent-acquisition page
  const showSidebar = pathname === "/mediNote-ai/doctor-patient-voice"

  const startRecording = async (patientId: number) => {
    try {
      const data = await APIService.startSession(patientId)
      if (data) {
        setSessionId(data?.session_id)
        setPatientId(patientId)
        setCurrentState("transcription")
      }
    } catch (error) {
      console.log("Failed to start recording:", error)
    }
  }


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
            <div className="enrollDoctorVoice">
              {currentState === "patientCheck" && 
                <CheckPatientVoice handleStartCon={startRecording} />
              }
              
              {currentState === "transcription" && sessionId && patientId && !transcriptionEnd && (
                <TranscriptionComponent
                  sessionId={sessionId}
                  patientId={patientId}
                  setTranscriptionEnd={setTranscriptionEnd}
                />
              )}
              {sessionId && patientId && transcriptionEnd && (
                <SummaryGeneration
                  sessionId={sessionId}
                  patientId={patientId}
                  transcriptionEnd={transcriptionEnd}
                  summaryData={sampleData}
                />
              )}
{sessionId && patientId && transcriptionEnd && (
                <ICDGenerator sessionId={sessionId}/>
              )}

            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}