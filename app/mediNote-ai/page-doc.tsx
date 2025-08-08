"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "../components/dashboard/Sidebar"
import { DashboardProvider } from "../context/DashboardContext"
import VoiceEnrollment from "./components-doc/VoiceEnrollment"
import TranscriptionInterface from "./components-doc/TranscriptionInterface"
import HeaderAISearch from "../chat-ui/components/Header"
import Breadcrumbs from "../components/dashboard/Breadcrumbs"
import PatientRegistration from "./components/PatientRegistration"
import { Patient, startConversation } from "./types"
import StartConversation from "./components-doc/StartConversation"

interface EnrollmentStatus {
  doctors: boolean
  patients: boolean
}

export default function Home() {
  const [isPatient, setIsPatient] = useState<Boolean>(false)
  const [registerData, setRegisterData] = useState<Patient | null>(null)
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>({
    doctors: false,
    patients: false,
  })
  const [conversationData, setConversationData] = useState<startConversation | null>(null)

  const isFullyEnrolled = enrollmentStatus.doctors && enrollmentStatus.patients
  const canStartTranscription = isFullyEnrolled
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
            {/* Step 1: Patient Registration */}
            {/* {!registerData && (
              <PatientRegistration setIsPatient={setIsPatient} setRegisterData={setRegisterData}/>
            )} */}
            
            {/* Step 2: Voice Enrollment (after patient is registered) */}
            {registerData && !isFullyEnrolled && (
              <div className="pt-8">
                <VoiceEnrollment onEnrollmentComplete={setEnrollmentStatus} />
              </div>
            )}
            
            {/* Step 3: Start Conversation (after voice enrollment is complete) */}
            {/* {registerData && isFullyEnrolled && !conversationData && (
              <div className="pt-8">
                <StartConversation 
                  setData={setConversationData} 
                  registerData={registerData}
                />
              </div>
            )} */}
            
            {/* Step 4: Transcription Interface (after conversation is started) */}
            {registerData && isFullyEnrolled && (
              <div className="pt-8 Transcription-Interface-wrapper">
                <TranscriptionInterface isEnabled={canStartTranscription}/>
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}