import { HomeIcon, BarChart2Icon, SettingsIcon } from "lucide-react"
import clsx from "clsx"
import { useState } from "react"
import {
  Rightarrow,
  Leftarrow,
  HrIcon,
  ArroTabIcon,
  LegalSearchIcon,
  AiIcon,
  AiOps,
  AIDocAssist,
} from "../../chat-ui/components/icons"


// Define menu items for dropdowns
const menuItems = [
  {
    id: "AIDocAssist",
    label: "AIDocAssist",
    icon: AiIcon,
    subItems: [
      {
        label: "Patient Registration",
        href: "/mediNote-ai/patient-registration",
        icon: ArroTabIcon,
      },
      {
        label: "Patient Details",
        href: "/mediNote-ai/patient-details",
        icon: ArroTabIcon,
      },
      {
        label: "Doctor Registration",
        href: "/mediNote-ai/doctor-registration",
        icon: ArroTabIcon,
      },
      {
        label: "Doctor Details",
        href: "/mediNote-ai/doctor-details",
        icon: ArroTabIcon,
      },

      {
        label: "Doctor & Patient Voice",
        href: "/mediNote-ai/doctor-patient-voice",
        icon: ArroTabIcon,
      },
    ],
  },
]

type SidebarProps = {
  collapsed: boolean
  hovered: boolean
  toggleSidebar: () => void
  setHovered: (hovered: boolean) => void
}

export default function Sidebar({
  collapsed,
  hovered,
  toggleSidebar,
  setHovered,
}: SidebarProps) {
  const isExpanded = !collapsed
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleMenu = (menuId: string) => {
    setOpenMenu(openMenu === menuId ? null : menuId)
    // No toggleSidebar call here to prevent collapsing on main menu click
  }

  const handleSubItemClick = () => {
    // Collapse sidebar only if it's expanded
    if (isExpanded) {
      toggleSidebar()
    }
  }

  return (
    <aside
      className={clsx(
        "h-screen fixed top-0 left-0 bg-white border-r shadow transition-all duration-300 z-40 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex justify-end p-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 main-toggleSidebar"
        >
          {isExpanded ? <Rightarrow /> : <Leftarrow />}
        </button>
      </div>
      <div className="w-full h-screen text-gray-800 flex flex-col main-width-manu">
        {/* Render Menu Items with Submenus */}
        {menuItems.map((menu) => (
          <div key={menu.id} className="text-left">
            <button
              onClick={() => toggleMenu(menu.id)}
              className="w-full px-4 py-5 flex items-center justify-between hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center text-left gap-3">
                {isExpanded ? (
                  <>
                    <menu.icon width={20} className="min-w-[20px]" />{" "}
                    {menu.label}
                  </>
                ) : (
                  <menu.icon width={20} className="min-w-[20px]" />
                )}
              </div>
              {isExpanded && (
                <svg
                  className={`w-4 h-4 transition-transform ${
                    openMenu === menu.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>
            <div
              className={clsx(
                "overflow-hidden transition-all duration-300",
                openMenu === menu.id ? "max-h-72" : "max-h-0"
              )}
            >
              {menu.subItems.map((subItem) => (
                <a
                  key={subItem.label}
                  href={subItem.href}
                  onClick={handleSubItemClick}
                  className="flex block px-4 py-4 hover:bg-gray-200 gap-3 bg-gray-100 min-w-[20px]"
                >
                  {isExpanded ? (
                    <>
                      <subItem.icon width={20} className="min-w-[20px]" />{" "}
                      {subItem.label}
                    </>
                  ) : (
                    <subItem.icon width={20} className="min-w-[20px]" />
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
        {/* Static Menu Item */}
        {/* <a
          href="#"
          onClick={handleSubItemClick}
          className="px-4 py-5 flex items-center hover:bg-gray-200 transition-colors gap-3 min-w-[20px]"
        >
          {isExpanded ? (
            <>
              <AIDocAssist width={20} /> AIDocAssist
            </>
          ) : (
            <AIDocAssist width={20} />
          )}
        </a> */}
      </div>
    </aside>
  )
}
