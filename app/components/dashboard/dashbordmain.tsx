import {
  HomeIcon,
  BarChart2Icon,
  SettingsIcon,
} from "lucide-react"
import {
  LoganimationsIcon,
} from "../../chat-ui/components/icons"
import clsx from "clsx"
import { AudioSelector, ProcessButton } from "./index"
import { useDashboard } from "../../context/DashboardContext"
import Image from 'next/image';
import { useEffect, useState } from "react"
import { decodeJWT } from "@/app/utils/decodeJWT"

const navItems = [
  { label: "Home", icon: HomeIcon, href: "#" },
  { label: "Reports", icon: BarChart2Icon, href: "#" },
  { label: "Settings", icon: SettingsIcon, href: "#" },
]


export default function Dashbordmain() {
  const [username, setUsername] = useState<string | null>(null)
  
  const {
    selectedAudio,
    setSelectedAudio,
    graphData,
    setGraphData,
    loading,
    setLoading,
    
  } = useDashboard();

 useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim())
    const token = cookies
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1]

    if (token) {
      const decoded = decodeJWT(token)
      if (decoded?.name) {
        setUsername(decoded.name)
      }
    }
  }, [])

  function getInitials(name: string): string {
    if (!name) return ""
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

 const initials = username ? getInitials(username) : ""

  return (
    <div className="hidden-1 ot-dashbord-main-container">
         <div className="ot-min-h-screen flex items-center justify-center">
            <div className="max-w-6xl w-full grid grid-cols-[40%_60%] gap-10 items-center">
                {/* Illustration */}
                <div className="flex justify-center">
                 <Image 
                    src="/dashboard-main1.svg" 
                    alt="I Call Summary Illustration" 
                    width={349} 
                    height={282} 
                    className="w-full max-w-md"
                />
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div className="flex flex-col items-left justify-center">
                        <LoganimationsIcon width={73} />
                        <div className="text-4xl font-bold w-2xl otitle mt-4 mb-4">
                           Hi, {username}<br></br>
                           AI-Powered Call Summaries with
                           Sentiment Intelligence
                        </div>
                        <p className="osubtitle text-base">
                            Instantly convert conversations into clear, actionable summaries. <br />
                            Understand emotions behind every word with intelligent sentiment analysis.
                        </p>
                    </div>
                <div>
                    <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700">
                    Call Audio
                    </label>
                    <div className="relative mt-1">
                        <AudioSelector
                            selectedAudio={selectedAudio}
                            setSelectedAudio={setSelectedAudio}
                            clearGraphData={() => setGraphData([])}
                        />
                    </div>
                </div>

                <ProcessButton
                    selectedAudio={selectedAudio}
                    setGraphData={setGraphData}
                    loading={loading}
                    setLoading={setLoading}
                />
                </div>
            </div>
        </div>

        {/* <div className="p-4 space-y-4 mt-6 border-t pt-4">
          <AudioSelector
            selectedAudio={selectedAudio}
            setSelectedAudio={setSelectedAudio}
            clearGraphData={() => setGraphData([])}
          />
          <ProcessButton
            selectedAudio={selectedAudio}
            setGraphData={setGraphData}
            loading={loading}
            setLoading={setLoading}
          />
        </div> */}
    </div>
  )
}
