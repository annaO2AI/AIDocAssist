"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/dashboard/Sidebar";
import { DashboardProvider } from "../../context/DashboardContext";
import HeaderAISearch from "../../chat-ui/components/Header";
import Breadcrumbs from "../../components/dashboard/Breadcrumbs"; // Import Breadcrumbs component
import EnrollDoctorVoice from "./EnrollDoctorVoice";
import CheckPatientVoice from "./CheckPatientVoice";
import StreamTranscript from "./StreamTranscript";
import { APIService } from "../service/api";

export default function ProcurementSearchPage() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    localStorage.setItem("sidebar-collapsed", String(newCollapsed));
    setCollapsed(newCollapsed);
  };

  const isSidebarExpanded = !collapsed || hovered;
  const sidebarWidth = isSidebarExpanded ? 256 : 64;

  // Show sidebar on the talent-acquisition page
   const showSidebar =  pathname === "/mediNote-ai/doctor-patient-voice" ;

     const startRecording = async (id:number) => {
       try {
         const data = await APIService.startSession()
         if (data) {
           setSessionId(data?.session_id)
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
          <EnrollDoctorVoice />
          <CheckPatientVoice handleStartCon={startRecording}/> 
         {sessionId && <StreamTranscript sessionId={sessionId }/>} 
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}