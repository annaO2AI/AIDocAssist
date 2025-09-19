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
  AIDocAssist
} from "../../chat-ui/components/icons"


// Define menu items for dropdowns
const menuItems = [
  {
    id: "AIDocAssist",
    label: "AIDocAssist",
    icon: AIDocAssist,
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
        "h-screen fixed top-0 left-0 bg-white border-r shadow transition-all duration-300 z-40 ease-in-out aside-style-left",
        isExpanded ? "w-64" : "w-16"
      )}
    >     
      <span className="showdo-gradiant absolute">
            <svg width="46" height="947" viewBox="0 0 46 947" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_f_3427_90606)">
                <ellipse cx="54" cy="475" rx="28" ry="449" fill="black" fillOpacity="0.4"/>
                </g>
                <defs>
                <filter id="filter0_f_3427_90606" x="0.6" y="0.6" width="106.8" height="948.8" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="12.7" result="effect1_foregroundBlur_3427_90606"/>
                </filter>
                </defs>
            </svg>
      </span>
      <div className="flex justify-end p-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 main-toggleSidebar"
        >
          {isExpanded ? <Rightarrow /> : <Leftarrow />}
        </button>
      </div>
     <div 
          className={clsx(
          "newconversation-number py-4",
          isExpanded ? "px-5" : "px-3"
          )}
     >
        <a
          href="/mediNote-ai/doctor-patient-voice"
          className={clsx(
          "w-full py-3 flex items-center gap-3  transition-colors w-full bg-white rounded",
          isExpanded ? "font-show-new-co px-4 py-3" : "ont-hide-new-co px-0 py-2 justify-center"
          )}
        > 
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.3571 9.14286H9.64286V14.8571C9.64286 15.1602 9.52245 15.4509 9.30812 15.6653C9.09379 15.8796 8.8031 16 8.5 16C8.1969 16 7.9062 15.8796 7.69188 15.6653C7.47755 15.4509 7.35714 15.1602 7.35714 14.8571V9.14286H1.64286C1.33975 9.14286 1.04906 9.02245 0.834735 8.80812C0.620408 8.59379 0.5 8.30311 0.5 8C0.5 7.6969 0.620408 7.40621 0.834735 7.19188C1.04906 6.97755 1.33975 6.85714 1.64286 6.85714H7.35714V1.14286C7.35714 0.839753 7.47755 0.549062 7.69188 0.334735C7.9062 0.120408 8.1969 0 8.5 0C8.8031 0 9.09379 0.120408 9.30812 0.334735C9.52245 0.549062 9.64286 0.839753 9.64286 1.14286V6.85714H15.3571C15.6602 6.85714 15.9509 6.97755 16.1653 7.19188C16.3796 7.40621 16.5 7.6969 16.5 8C16.5 8.30311 16.3796 8.59379 16.1653 8.80812C15.9509 9.02245 15.6602 9.14286 15.3571 9.14286Z" fill="#34334B"/>
          </svg>
            <span className="newConvetsotiotext">New Conversation </span>
        </a>
     </div>
      <div className="w-full h-screen text-gray-800 flex flex-col main-width-manu">
        {/* Render Menu Items with Submenus */}
        {menuItems.map((menu) => (
          <div key={menu.id} className="text-left">
            <button
              onClick={() => toggleMenu(menu.id)}
              className="w-full px-4 py-5 flex items-center justify-between hover:bg-blue-500 transition-colors text-white"
            >
              <div className="flex items-center text-left gap-3 svg-white">
                {isExpanded ? (
                  <>
                    <menu.icon width={20} className="min-w-[20px] text-white" />{" "}
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
                  className="flex block px-4 py-3 hover:bg-blue-500 gap-3  min-w-[20px] text-white svg-white"
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
      <div 
        className={clsx(
          "flex flex-col gap-3 fixed",
          isExpanded ? "bottom-helo-full " : "bottom-helo-slide "
        )}
      >
          <svg width="40" height="35" viewBox="0 0 40 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M6.92502 21.9352L4.85097 26.4228C4.75503 26.6295 4.79707 26.8778 4.95661 27.0397C5.0601 27.1458 5.19808 27.2005 5.33822 27.2005C5.41476 27.2005 5.49237 27.1841 5.5646 27.1502L12.8669 23.7169C13.7045 23.8208 14.4721 23.8711 15.2062 23.8711C23.5919 23.8711 30.4134 18.5161 30.4134 11.935C30.4145 5.355 23.5929 0 15.2072 0C6.82154 0 0 5.355 0 11.935C0 16.018 2.57748 19.7225 6.92502 21.9352ZM15.2072 1.09375C22.9979 1.09375 29.3365 5.95656 29.3365 11.935C29.3365 17.9134 22.9979 22.7773 15.2072 22.7773C14.4731 22.7773 13.7024 22.7237 12.8497 22.6133C12.7505 22.6012 12.647 22.6177 12.5554 22.6592L6.4561 25.5259L8.12807 21.9089C8.18951 21.7777 8.1949 21.6267 8.14639 21.49C8.09788 21.3533 7.99655 21.2406 7.86611 21.1805C3.61559 19.1866 1.07799 15.7303 1.07799 11.935C1.07799 5.95656 7.41659 1.09375 15.2072 1.09375ZM7.81545 14.5775C7.99008 14.6202 8.16795 14.642 8.34474 14.642C9.00986 14.642 9.62755 14.338 10.0393 13.8075C10.4511 13.277 10.5967 12.588 10.4371 11.9175C10.2528 11.1409 9.63941 10.5186 8.87296 10.3305C8.03751 10.1248 7.16973 10.43 6.65014 11.1016C6.23834 11.632 6.09281 12.3211 6.25236 12.9905C6.43562 13.767 7.04899 14.3894 7.81545 14.5775ZM7.49636 11.7797C7.70226 11.5139 8.01164 11.3608 8.34474 11.3608C8.43529 11.3608 8.528 11.3728 8.61963 11.3947C8.99046 11.4855 9.29876 11.7983 9.38824 12.1745C9.47017 12.5212 9.4001 12.8614 9.19096 13.1305C8.92793 13.4695 8.49566 13.6172 8.0677 13.5144C7.69687 13.4236 7.38856 13.1108 7.29909 12.7345C7.21716 12.3878 7.28723 12.0487 7.49636 11.7797ZM14.706 14.642C14.5292 14.642 14.3513 14.6202 14.1767 14.5775C13.4102 14.3894 12.7958 13.7659 12.6114 12.9905C12.453 12.32 12.5985 11.632 13.0103 11.1016C13.531 10.43 14.3987 10.1248 15.2331 10.3305C15.9996 10.5186 16.6129 11.1409 16.7973 11.9175C16.9568 12.588 16.8113 13.277 16.3995 13.8075C15.9877 14.338 15.3711 14.642 14.706 14.642ZM14.706 11.3608C14.3729 11.3608 14.0635 11.5139 13.8576 11.7797C13.6474 12.0487 13.5773 12.3878 13.6592 12.7345C13.7487 13.1108 14.0581 13.4236 14.4289 13.5144C14.858 13.6183 15.2902 13.4706 15.5522 13.1305C15.7624 12.8614 15.8325 12.5212 15.7495 12.1745C15.6611 11.7983 15.3517 11.4855 14.9809 11.3947C14.8892 11.3728 14.7965 11.3608 14.706 11.3608ZM20.5368 14.5775C20.7115 14.6202 20.8893 14.642 21.0661 14.642C21.7313 14.642 22.3489 14.338 22.7607 13.8075C23.1725 13.277 23.3181 12.588 23.1585 11.9175C22.9742 11.1409 22.3608 10.5186 21.5943 10.3305C20.76 10.1248 19.8911 10.43 19.3715 11.1016C18.9597 11.632 18.8142 12.32 18.9737 12.9905C19.1581 13.767 19.7715 14.3894 20.5368 14.5775ZM20.2178 11.7797C20.4237 11.5139 20.733 11.3608 21.0661 11.3608C21.1567 11.3608 21.2494 11.3728 21.341 11.3947C21.7119 11.4855 22.0202 11.7983 22.1096 12.1745C22.1916 12.5212 22.1215 12.8614 21.9124 13.1305C21.6493 13.4695 21.216 13.6172 20.7891 13.5144C20.4183 13.4236 20.1089 13.1108 20.0194 12.7345C19.9386 12.3878 20.0086 12.0487 20.2178 11.7797ZM31.6272 13.732C31.7124 13.4433 32.0088 13.2814 32.2977 13.3634C36.9773 14.7798 40 18.2481 40 22.202C40 25.4537 37.8516 28.4911 34.3632 30.2159L35.2029 34.3438C35.2482 34.5658 35.1523 34.7944 34.9625 34.9158C34.8752 34.9727 34.775 35 34.6747 35C34.5594 35 34.4451 34.9628 34.3502 34.8895L29.9682 31.5317C29.2912 31.6214 28.6207 31.6663 27.9728 31.6663C23.6425 31.6663 19.4319 29.3803 17.7341 26.1067C17.595 25.8398 17.6963 25.5095 17.9594 25.3684C18.2213 25.2284 18.549 25.3302 18.687 25.5981C20.207 28.5272 24.0252 30.5725 27.9718 30.5725C28.6401 30.5725 29.3343 30.52 30.0372 30.4172C30.1806 30.4019 30.3239 30.4347 30.4393 30.5222L33.8565 33.1417L33.2205 30.0125C33.1698 29.7609 33.2981 29.5083 33.5288 29.4033C36.8555 27.895 38.922 25.1355 38.922 22.2009C38.922 18.7972 36.1365 15.6658 31.9894 14.4123C31.7038 14.3259 31.5421 14.0219 31.6272 13.732Z" fill="white"/>
        </svg>
        <span className="text-white text-center">
          Have questions or concerns
          regarding your account? Our experts are here to help!
        </span>  
      </div>
    </aside>
  )
}
