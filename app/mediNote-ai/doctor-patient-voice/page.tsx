"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/dashboard/Sidebar";
import { DashboardProvider } from "../../context/DashboardContext";
import HeaderAISearch from "../../chat-ui/components/Header";
import Breadcrumbs from "../../components/dashboard/Breadcrumbs"; // Import Breadcrumbs component

import CheckPatientVoice from "./CheckPatientVoice";
import StreamTranscript from "./StreamTranscript";
import { APIService } from "../service/api";
import TranscriptionComponent from "../NewTrans/TranscriptionComponent";

export default function ProcurementSearchPage() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [sessionId, setSessionId] = useState<number>()

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
            <div className="enrollDoctorVoice"> 
               
                <CheckPatientVoice handleStartCon={startRecording}/>
                {sessionId && 
                <TranscriptionComponent sessionId={sessionId}/>
                } 
              {/* {sessionId && <StreamTranscript sessionId={sessionId }/>}  */}
            </div> 
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}