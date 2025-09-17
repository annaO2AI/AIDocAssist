"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { decodeJWT } from "@/app/utils/decodeJWT"
import { APIService } from "../service/api"
import { DoctorVoiceEnroll } from "../components/DoctorVoiceEnroll"

// Types
interface DoctorCreationTypes {
  first_name: string
  last_name: string
  email: string
}

export default function DoctorForm() {
  const [formData, setFormData] = useState<DoctorCreationTypes>({
    first_name: "",
    last_name: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [registeredDoctorId, setRegisteredDoctorId] = useState<number | null>(
    null
  )
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim())
    const token = cookies
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1]
    if (token) {
      setToken(token)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Basic validation
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim()
    ) {
      setError("All fields are required")
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await APIService.createDoctor(formData)
      if (!response) {
        throw new Error("No response received from server")
      }
      setRegisteredDoctorId(response.id)
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
      })
      setSuccessMessage("Doctor registered successfully!")
    } catch (error) {
      console.error("Registration failed:", error)
      setError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToForm = () => {
    setSuccessMessage(null)
    setError(null)
  }

  return (
    <>
    {isVoiceModalOpen &&  
      <DoctorVoiceEnroll
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        id={registeredDoctorId ?? 0}
      />
    }
      <div className="mt-12 pt-6">
        <h1 className="max-w-xl text-2xl mt-6 mx-auto font-bold mb-6 text-gray-800 text-center">
          Doctor Registration
        </h1>
        <div className="max-w-xl mt-6 mx-auto p-12 bg-white rounded-xl border-o2 mb-12">
          {error && !successMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                !error
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {error}
            </div>
          )}
          {successMessage ? (
            <div className="mb-4 p-8 rounded bg-white-100 text-center">
              <Image
                src="/checked-tick-svgrepo-com.svg"
                alt="Success"
                width={120}
                height={120}
                className="imagfilter m-auto"
                unoptimized
              />
              <h2 className="text-3xl mt-6 mb-4 font-normal text-green-500 text-center">
                Doctor registered successfully
              </h2>
              <div className="m-auto mb-2 text-center">
                <span className="font-bold ot-title">Doctor ID:</span>
                <span className="ot-title"> {registeredDoctorId}</span>
              </div>
              <p className="text-sm mb-4 ot-title text-center osubtitle">
                Thank you for your submission. We have received your
                information. Your doctor profile has been created
              </p>
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-[250px] m-auto mb-3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                Enroll Doctor Voice
              </button>
              <button
                onClick={handleBackToForm}
                className="w-[250px] m-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                Back to Doctor Registration
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
