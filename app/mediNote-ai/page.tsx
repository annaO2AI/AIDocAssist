"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "../components/dashboard/Sidebar"
import { DashboardProvider } from "../context/DashboardContext"
import HealthCheck from "./components/HealthCheck"
import VoiceEnrollment from "./components/VoiceEnrollment"
import TranscriptionInterface from "./components/TranscriptionInterface"
import type { ConversationEntry } from "./types"
import HeaderAISearch from "../chat-ui/components/Header"
import Breadcrumbs from "../components/dashboard/Breadcrumbs" // Import Breadcrumbs component

interface EnrollmentStatus {
  doctor: boolean
  patient: boolean
}

export default function Home() {
  const [isBackendHealthy, setIsBackendHealthy] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>({
    doctor: false,
    patient: false,
  })
  const [conversationHistory, setConversationHistory] = useState<
    ConversationEntry[]
  >([])

  const isFullyEnrolled = enrollmentStatus.doctor && enrollmentStatus.patient
  const canStartTranscription = isFullyEnrolled
  //   const canStartTranscription = isBackendHealthy && isFullyEnrolled;
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [hovered, setHovered] = useState(false)

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

  // Show sidebar on the mediNote-ai page
  const showSidebar = pathname === "/mediNote-ai"
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
              <div className="pt-8 Trnascrption-Interface-wrapper">
                  {/* Transcription Interface */}
                  {isFullyEnrolled && (
                  <TranscriptionInterface isEnabled={canStartTranscription} />
                  )}
                  {/* Voice Enrollment */}
                  {!isFullyEnrolled && (
                  <VoiceEnrollment onEnrollmentComplete={setEnrollmentStatus} />
                  )}
              </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
