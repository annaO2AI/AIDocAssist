"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardProvider } from "../context/DashboardContext";
import Breadcrumbs from "../components/dashboard/Breadcrumbs";
import Sidebar from "../components/dashboard/Sidebar";
import PatientRegistration from "./components/PatientRegistration";
import HeaderAISearch from "../chat-ui/components/Header";
import SearchPatient from "./components/SearchPatient";
import DoctorVoiceEnrollment from "./components/VoiceDoctorEnrollment";
import PatientVoiceEnrollment from "./components/VoicePatientEnrollment";

export default function Page() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isSidebarExpanded = !collapsed || hovered;
  const sidebarWidth = isSidebarExpanded ? 256 : 64;

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    localStorage.setItem("sidebar-collapsed", String(newCollapsed));
    setCollapsed(newCollapsed);
  };

  const showSidebar = pathname === "/mediNote-ai";

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
            <PatientRegistration />
            <SearchPatient />
            <DoctorVoiceEnrollment />
            <PatientVoiceEnrollment />
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}