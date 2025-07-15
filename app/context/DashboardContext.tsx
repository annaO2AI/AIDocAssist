// "use client"

// import { createContext, useContext, useState, ReactNode } from "react"

// type DashboardContextType = {
//   selectedAudio: string | null
//   setSelectedAudio: (value: string | null) => void
//   graphData: any
//   setGraphData: (data: any) => void
//   loading: boolean
//   setLoading: (loading: boolean) => void
// }

// const DashboardContext = createContext<DashboardContextType | undefined>(
//   undefined
// )

// export const DashboardProvider = ({ children }: { children: ReactNode }) => {
//   const [selectedAudio, setSelectedAudio] = useState<string | null>(null)
//   const [graphData, setGraphData] = useState<any>({})
//   const [loading, setLoading] = useState(false)

//   return (
//     <DashboardContext.Provider
//       value={{
//         selectedAudio,
//         setSelectedAudio,
//         graphData,
//         setGraphData,
//         loading,
//         setLoading,
//       }}
//     >
//       {children}
//     </DashboardContext.Provider>
//   )
// }

// export const useDashboard = () => {
//   const context = useContext(DashboardContext)
//   if (!context) {
//     throw new Error("useDashboard must be used within a DashboardProvider")
//   }
//   return context
// }

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type DashboardContextType = {
  selectedAudio: string | null;
  setSelectedAudio: (value: string | null) => void;
  graphData: any;
  setGraphData: (data: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  hasProcessed: boolean;
  setHasProcessed: (hasProcessed: boolean) => void;
  resetDashboard: () => void; // Added resetDashboard
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const resetDashboard = () => {
    setGraphData({});
    setSelectedAudio(null);
    setLoading(false);
    setHasProcessed(false); // Reset to show Dashboardmain
  };

  return (
    <DashboardContext.Provider
      value={{
        selectedAudio,
        setSelectedAudio,
        graphData,
        setGraphData,
        loading,
        setLoading,
        hasProcessed,
        setHasProcessed,
        resetDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};