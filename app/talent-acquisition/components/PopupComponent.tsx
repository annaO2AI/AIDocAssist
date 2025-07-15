"use client"

import { useState } from "react"
import { CloseIcon } from "./icons"
import { useAISearch } from "../../context/AISearchContext"
import { groupMessagesByDay } from "@/app/utils/groupMsgByDay"

interface ConversationChat {
  message_id: string
  query: string
  response: string
  followups: string[]
  timestamp: string
  feedback: string | null
}

interface PopupComponentProps {
  conversationHistory: ConversationChat[]
}

export default function PopupComponent() {
  const { conversationHistory, isOpen, closePopup } = useAISearch()
  const [searchTerm, setSearchTerm] = useState("")

  if (!isOpen) return null

  const filteredHistory = conversationHistory.filter(
    (msg) =>
      msg.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.response.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const grouped = groupMessagesByDay(filteredHistory)
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const getDate = (label: string) => {
      if (label === "Today") return 0
      if (label === "Yesterday") return 1
      const match = label.match(/^(\d+) days ago$/)
      if (match) return parseInt(match[1], 10)
      return 999 // put old dates at the end
    }
    return getDate(a) - getDate(b)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="backdivbg absolute inset-0 z-40" onClick={closePopup} />
      <div
        className="bg-white p-12 rounded-xl shadow-2xl w-[700px] relative z-50"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <CloseIcon width={36} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Search chat history</h2>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        />
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {sortedKeys.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              No history found.
            </div>
          ) : (
            sortedKeys.map((label) => (
              <div key={label}>
                <div className=" font-normal mb-2 osubtitle">{label}</div>
                {grouped[label].map((item) => (
                  // <div key={item.message_id} className="border-b pb-2 mb-2">
                  //   <div className="text-sm font-medium text-gray-700">
                  //     Q: {item.query}
                  //   </div>
                  //   <div className="text-sm text-gray-500">
                  //     A: {item.response}
                  //   </div>
                  //   <div className="text-xs text-gray-400">
                  //     {new Date(item.timestamp).toLocaleString()}
                  //   </div>
                  // </div>
                  <div key={item.message_id} className="border-b pb-2 mb-2">
                    <div className="text-base font-medium text-gray-700">
                     {item.query}
                    </div>
                    {/* <div className="text-sm text-gray-500">
                      A: {item.response}
                    </div> */}
                    {/* <div className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </div> */}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
