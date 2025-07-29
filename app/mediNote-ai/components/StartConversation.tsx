import React, { useState } from "react"
import { Patient, startConversation } from "../types"
import { APIService } from "../service/api"

export default function StartConversation({
  setData,
  registerData,
}: {
  setData: (data: startConversation | null) => void
  registerData: Patient
}) {
  const [formData, setFormData] = useState<string>("")
  const [conversationId, setConversationId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      patient_id: registerData?.id,
      title: formData,
    }
   try {
      const response = await APIService.startConversation(payload)
      if (!response) {
        console.log(response)
      }
      setData(response)
      setConversationId(response?.conversation_id)
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Start Conversation</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
