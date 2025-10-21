"use client";
import { LoganimationsIcon, LoganimationsIconWhite } from "../../chat-ui/components/icons";
import Image from 'next/image';

interface WelcomeMessageProps {
  username: string | null;
  onStartConversation: () => void; // Added prop for handling button click
}

export default function WelcomeMessage({ username, onStartConversation }: WelcomeMessageProps) {
  return (
    <div className="flex flex-col  w-[70%] m-auto items-center justify-center items-end z-10">
      <div className="flex justify-evenly w-full">
        <div className="flex flex-col items-left justify-center mb-4 w-[56%]">
          <LoganimationsIconWhite width={73} />
          <div className="text-[58px] font-bold w-2xl otitle mt-4 mb-4 leading-[1.1]">
            Hi, {username}
            <br />
            What would like to know?
          </div>
          <p className="osubtitle-white text-[20px] mb-4">
            Tap to start conversation your patient visit and 
            <br />
            receive a streamlined summary immediately.
          </p>
        </div>
        <div className="flex imagfilter-doctor w-[44%]">
                <Image 
                      src="/DocAssistes.svg" 
                      alt="I Search" 
                      width={420} 
                      height={288} 
                      className="imagfilter"
                  /> 
        </div>
      </div>
      <div className="StartConversation w-full h-[60px] mt-[10px] mb-[20px]">
        <div className="flex items-center justify-center SearchConversation w-full justify-between px-4 py-3">
          <svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="0.5" width="49" height="48" rx="6" fill="#E2E4FF"/>
            <path d="M19.6992 16.4994C19.6992 15.2263 20.2049 14.0054 21.1051 13.1052C22.0053 12.2049 23.2262 11.6992 24.4992 11.6992C25.7723 11.6992 26.9932 12.2049 27.8933 13.1052C28.7935 14.0054 29.2992 15.2263 29.2992 16.4994V24.4997C29.2992 25.7727 28.7935 26.9937 27.8933 27.8939C26.9932 28.7941 25.7723 29.2998 24.4992 29.2998C23.2262 29.2998 22.0053 28.7941 21.1051 27.8939C20.2049 26.9937 19.6992 25.7727 19.6992 24.4997V16.4994Z" fill="url(#paint0_linear_3706_112579)"/>
            <path d="M17.3 22.0977C17.5122 22.0977 17.7157 22.1819 17.8657 22.332C18.0157 22.482 18.1 22.6855 18.1 22.8977V24.4977C18.1 26.1952 18.7743 27.8231 19.9745 29.0234C21.1747 30.2237 22.8026 30.898 24.5 30.898C26.1974 30.898 27.8253 30.2237 29.0255 29.0234C30.2257 27.8231 30.9 26.1952 30.9 24.4977V22.8977C30.9 22.6855 30.9843 22.482 31.1343 22.332C31.2843 22.1819 31.4878 22.0977 31.7 22.0977C31.9122 22.0977 32.1157 22.1819 32.2657 22.332C32.4157 22.482 32.5 22.6855 32.5 22.8977V24.4977C32.5 26.4811 31.7634 28.3937 30.433 29.8646C29.1026 31.3354 27.2733 32.2597 25.3 32.458V35.6981H30.1C30.3122 35.6981 30.5157 35.7824 30.6657 35.9324C30.8157 36.0825 30.9 36.286 30.9 36.4982C30.9 36.7103 30.8157 36.9138 30.6657 37.0639C30.5157 37.2139 30.3122 37.2982 30.1 37.2982H18.9C18.6878 37.2982 18.4843 37.2139 18.3343 37.0639C18.1843 36.9138 18.1 36.7103 18.1 36.4982C18.1 36.286 18.1843 36.0825 18.3343 35.9324C18.4843 35.7824 18.6878 35.6981 18.9 35.6981H23.7V32.458C21.7267 32.2597 19.8974 31.3354 18.567 29.8646C17.2366 28.3937 16.5 26.4811 16.5 24.4977V22.8977C16.5 22.6855 16.5843 22.482 16.7343 22.332C16.8843 22.1819 17.0878 22.0977 17.3 22.0977Z" fill="url(#paint1_linear_3706_112579)"/>
            <defs>
            <linearGradient id="paint0_linear_3706_112579" x1="20.8992" y1="13.3862" x2="33.3757" y2="20.1492" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E6DCC"/>
            <stop offset="1" stopColor="#4938CF"/>
            </linearGradient>
            <linearGradient id="paint1_linear_3706_112579" x1="18.4999" y1="23.5546" x2="31.3465" y2="36.993" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2E6DCC"/>
            <stop offset="1" stopColor="#4938CF"/>
            </linearGradient>
            </defs>
          </svg>
          <button 
            className="flex items-center justify-center gap-3 bradiantAdd px-6 py-2 rounded-md text-white text-[18px]"
            onClick={onStartConversation} // Added onClick handler
          >
              Start Conversation
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.2691 9.1329L5.13941 1.64071C4.86258 1.48564 4.5451 1.41853 4.22919 1.4483C3.91329 1.47807 3.61394 1.60331 3.37095 1.80737C3.12797 2.01143 2.95287 2.28463 2.86894 2.59063C2.78501 2.89663 2.79624 3.22093 2.90113 3.5204L5.25894 10.5017L2.90113 17.4829C2.81823 17.7184 2.79299 17.9704 2.8275 18.2177C2.86202 18.4649 2.95529 18.7003 3.09951 18.9042C3.24373 19.108 3.43469 19.2743 3.6564 19.3891C3.8781 19.5039 4.1241 19.564 4.37378 19.5642C4.64228 19.5636 4.90615 19.4942 5.14019 19.3626L5.14722 19.3579L18.2722 11.8524C18.5129 11.7162 18.7131 11.5186 18.8523 11.2797C18.9916 11.0408 19.065 10.7692 19.065 10.4927C19.065 10.2161 18.9916 9.94456 18.8523 9.70566C18.7131 9.46677 18.5129 9.26912 18.2722 9.1329H18.2691ZM4.9355 17.3188L6.92144 11.4392H11.2488C11.4974 11.4392 11.7359 11.3404 11.9117 11.1646C12.0875 10.9887 12.1863 10.7503 12.1863 10.5017C12.1863 10.253 12.0875 10.0146 11.9117 9.83874C11.7359 9.66292 11.4974 9.56415 11.2488 9.56415H6.92144L4.93472 3.6829L16.8691 10.4931L4.9355 17.3188Z" fill="white"/>
              </svg>
          </button>
        </div>
      </div>
    </div>
  );
}