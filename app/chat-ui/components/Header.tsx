import { HomeIcon, SearchHistoryIcon } from "../components/icons"
import { useState, useEffect } from "react"
import { useAISearch } from "../../context/AISearchContext"
import { decodeJWT } from "@/app/utils/decodeJWT"
import Link from "next/link"
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx"

type HeaderProps = {
  sidebarOpen: boolean
}

export default function HeaderAISearch({ sidebarOpen }: HeaderProps) {
  const [username, setUsername] = useState<string | null>(null)
  const { openPopup } = useAISearch()
  const pathname = usePathname()
   const [scrolled, setScrolled] = useState(false)

   useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  
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
    <header
          className={clsx(
            "w-full fixed top-0 z-10 transition-all duration-300 h-18 flex items-center custome-header-shadow",
            "backdrop-blur-xl supports-[backdrop-filter]:bg-white",
            scrolled
              ? "shadow-md border-b border-white/30"
              : "border-b border-white/10",
            sidebarOpen
              ? "pl-[240px]"
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
          <Link
            href="/"
            className={`transition ${
              pathname === "/" ? "ot-title font-semibold activenavigation py-2 px-4 rounded-md" : "text-gray-700 hover:ot-title py-2 px-4 rounded-md"
            }`}
          >
            AIDocAssist
          </Link>
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
            <div className="flex flex-row gap-3 items-center">
              {initials && (
                <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center font-normal text-sm">
                  {initials}
                </div>
              )}
              {/* <div className="w-[36px] h-[36px] bg-[#3C77EF] text-white rounded-full flex items-center justify-items-center pl-2" >JO</div> */}
              <span className="text-sm">{username}</span>
            </div>
          </div>
      </div>
    </header>
  )
}
