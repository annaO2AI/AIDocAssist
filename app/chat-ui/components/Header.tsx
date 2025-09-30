//Header.tsx
import { HomeIcon, SearchHistoryIcon } from "../components/icons"
import { useState, useEffect } from "react"
import { useAISearch } from "../../context/AISearchContext"
import Link from "next/link"
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx"
import { APIService } from "../../mediNote-ai/service/api"
import Profile from "./Profile" // Add this import

type HeaderProps = {
  sidebarOpen: boolean
}

export default function HeaderAISearch({ sidebarOpen }: HeaderProps) {
  const [username, setUsername] = useState<string | null>(null)
  const [useremail, setUseremail] = useState<string | null>(null)
  const [apiUsername, setApiUsername] = useState<string | null>(null)
  const [apiUseremail, setApiUseremail] = useState<string | null>(null)
  const { openPopup } = useAISearch()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  
  // Add profile state
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // API call for username - exact same pattern as updateDoctor
  useEffect(() => {
    const getUserFromAPI = async () => {
      try {
        console.log('Calling getCurrentUser...')
        const response = await APIService.getCurrentUser()
        console.log('Response received:', response)
        if (response?.name) {
          setApiUsername(response.name)
          setUsername(response.name)
          setUseremail(response.email)
          console.log('Username set from API:', response.name)
        }
      } catch (error) {
        console.error("Error getting current user:", error)
      }
    }

    getUserFromAPI()
  }, [])

  const displayName = apiUsername || username
  const displyuseremail = apiUseremail || useremail
  const initials = displayName ? getInitials(displayName) : ""

  // Split displayName into firstName and lastName
  const getNameParts = (name: string | null | undefined): { firstName: string | undefined, lastName: string | undefined } => {
    if (!name) return { firstName: undefined, lastName: undefined }
    const parts = name.trim().split(" ")
    if (parts.length === 1) return { firstName: parts[0], lastName: undefined }
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
  }

  const { firstName, lastName } = getNameParts(displayName)

  function getInitials(name: string): string {
    if (!name) return ""
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const closeProfile = () => {
    setIsProfileOpen(false)
  }

  return (
    <>
      <header
        className={clsx(
          "w-full fixed top-0 z-10 transition-all duration-300 h-18 flex items-center bacgroundColorSt",
          "backdrop-blur-xl supports-[backdrop-filter]:bg-white",
          scrolled
            ? "shadow-md border-b border-white/30 "
            : "border-b border-white/10 bg-white",
          sidebarOpen
            ? "pl-[213px]"
            : pathname === "/" || pathname === "/aiops" || pathname === "/talent-acquisition" || pathname === "/human-resources"
            ? "pl-[0]"
            : "w-full"
        )}
      >
        <div className="w-full header-widthfix mx-auto px-4 flex items-center justify-between">
          <div>
            <Image
              src="/Otow-log.svg"
              alt="Otow Logo"
              width={100}
              height={40}
              priority
            />
          </div>
          <nav className="hidden md:flex space-x-3">
            {/* <Link
              href="/"
              className={`transition ${
                pathname === "/" ? "ot-title font-semibold activenavigation py-2 px-4 rounded-md" : "text-gray-700 hover:ot-title py-2 px-4 rounded-md"
              }`}
            >
              AIDocAssist
            </Link> */}
            {/* <Link
              href="/about"
              className={`transition ${
                pathname === "/about" ? "ot-title font-semibold activenavigation py-2 px-4 rounded-md" : "text-gray-700 hover:ot-title py-2 px-4 rounded-md"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`transition ${
                pathname === "/contact" ? "ot-title font-semibold activenavigation py-2 px-4 rounded-md" : "text-gray-700 hover:ot-title py-2 px-4 rounded-md"
              }`}
            >
              Contact
            </Link> */}
          </nav>
          <div className="flex flex-row gap-3 items-center">
            <button
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={openPopup}
            >
              <SearchHistoryIcon
                width={28}
                color="#3b82f6"
                className="cursor-pointer"
              />
            </button>
            <div 
              className="flex flex-row gap-3 items-center cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"
              onClick={toggleProfile}
            >
              {initials && (
                <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center font-normal text-sm">
                  {initials}
                </div>
              )}
              {/* <div className="w-[36px] h-[36px] bg-[#3C77EF] text-white rounded-full flex items-center justify-items-center pl-2" >JO</div> */}
              <span className="text-sm">{displayName || 'User'}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Profile Modal */}
      <Profile
        isOpen={isProfileOpen}
        onClose={closeProfile}
        displayName={displayName ?? undefined}
        initials={initials}
        firstName={firstName}
        lastName={lastName}
        email={displyuseremail ?? undefined}
        phone="(972) 432-0000"
        role="Cardiologist"
      />
    </>
  )
}