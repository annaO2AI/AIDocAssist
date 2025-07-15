"use client"

import { useState } from "react"
import { useAISearch } from "../context/AISearchContext"
import { CloseIcon } from "../chat-ui/components/icons"
import ProfileCard from "../components/dashboard/ProfileCard"


export default function Popupprofile() {

  const { isOpen, closePopup } = useAISearch();
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdivbgProfile">
      <div className="fixed backclose" onClick={closePopup}></div>
      <div
        className="bg-white p-12 rounded-xl shadow-2xl w-[50%] relative z-50 "
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-800"
        >
          ✖
          {/* <CloseIcon width={36} /> */}
        </button>
        <ProfileCard /> 
      </div>
     
    </div>
  )
}
