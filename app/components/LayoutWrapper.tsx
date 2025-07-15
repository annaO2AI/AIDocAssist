"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HeaderAISearch from "../chat-ui/components/Header";
import Sidebar from "./dashboard/Sidebar";
import FooterAISearch from "../chat-ui/components/Footer";
import { DashboardProvider } from "../context/DashboardContext";
import PopupComponent from "../chat-ui/components/PopupComponent";
import Popupprofile from "../components/Popupprofile";
import Breadcrumbs from "./dashboard/Breadcrumbs";
import clsx from "clsx";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed
  const [hovered, setHovered] = useState(false); // Changed to false for consistency

  const isAltLayout = pathname === "/chat-ui";

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    // Only update state if localStorage has a valid value
    if (stored !== null) {
      setCollapsed(stored === "true"); // Use stored value only if it exists
    }
    // No else needed; useState(true) ensures collapsed = true on first load
  }, []);

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    localStorage.setItem("sidebar-collapsed", String(newCollapsed));
    setCollapsed(newCollapsed);
  };

  const isSidebarExpanded = !collapsed;
  const sidebarWidth = isSidebarExpanded ? 256 : 64;

  // Show sidebar only on the homepage
  const showSidebar = pathname === "/" || pathname === "/talent-acquisition" || pathname === "/human-resources" || pathname === "/aiops" ;

  return (
    <DashboardProvider>
      <div className="flex min-h-screen overflow-hidden">
        {showSidebar && (
          <Sidebar
            collapsed={collapsed}
            hovered={hovered}
            toggleSidebar={toggleCollapse}
            setHovered={setHovered}
          />
        )}
         <HeaderAISearch sidebarOpen={showSidebar && isSidebarExpanded} />
        <div
          className="flex flex-col flex-1 transition-all duration-300 ease-in-out"
          style={{ marginLeft: showSidebar ? sidebarWidth : 0 }}
        >
          <>
           
            {/* <Popupprofile /> */}
            <PopupComponent />
            {/* <Breadcrumbs sidebarOpen={showSidebar && isSidebarExpanded} /> */}
          </>
          <main
            className={clsx("flex-1 overflow-auto p-2 background-chat-ui", {
              "mt-1": isAltLayout,
              "mt-16": !isAltLayout,
            })}
          >
            {children}
          </main>
          <FooterAISearch />
        </div>
      </div>
    </DashboardProvider>
  );
}