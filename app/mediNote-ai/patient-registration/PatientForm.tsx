"use client"

import { useEffect, useState } from "react"
import { PatientCreationTypes, patient } from "../types"
import { decodeJWT } from "@/app/utils/decodeJWT"
import { APIService } from "../service/api"
import Image from "next/image"
import { PatientVoiceEnroll } from "../components/PatientVoiceEnroll"

export default function PatientForm() {
  const [formData, setFormData] = useState<PatientCreationTypes>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    ssn_last4: "",
    address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [registeredPatientId, setRegisteredPatientId] = useState<number | null>(null)
  const [showVoiceEnroll, setShowVoiceEnroll] = useState(false)

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
    try {
      const response = await APIService.registerPatient(formData)
      if (!response) {
        throw new Error("No response received from server")
      }
      setRegisteredPatientId(response.id)
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        ssn_last4: "",
        address: "",
      })
      setSuccessMessage("Patient registered successfully!")
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
    setShowVoiceEnroll(false)
  }

  const handleCloseVoiceEnroll = () => {
    setShowVoiceEnroll(false)
  }

  const handleEnrollVoice = () => {
    setShowVoiceEnroll(true)
  }

  return (
    <div className="mt-12 pt-6 ">
      <h1 className=" max-w-xl text-2xl mt-6 mx-auto font-bold mb-6 text-gray-800 text-center">
        Patient Registration
      </h1>
      <div className="max-w-xl mt-6 mx-auto p-12 bg-white rounded-xl border-o2 mb-12">
        {error && !successMessage && (
          <div
            className={`mb-4 p-3 rounded ${
              !error ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {error}
          </div>
        )}
        {successMessage ? (
          <div className="mb-4 p-8 rounded bg-white-100 ttext-centerext">
            <Image
              src="/checked-tick-svgrepo-com.svg"
              alt="I Search"
              width={120}
              height={120}
              className="imagfilter m-auto"
              unoptimized
            />
            <h2 className="text-3xl mt-6 mb-4 font-normal text-green-500 text-center">
              Patient registered successfully{" "}
            </h2>

            <div className="m-auto mb-2 text-center">
              <span className="font-bold ot-title">Patient ID:</span>
              <span className="ot-title"> {registeredPatientId}</span>
            </div>

            <p className="text-sm mb-6 ot-title text-center osubtitle">
              Thank you for your submission. We have received your information.
              Your patient profile has been created
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleEnrollVoice}
                className="w-[250px] m-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Enroll Patient Voice
              </button>
              
              <button
                onClick={handleBackToForm}
                className="w-[250px] m-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Patient Registration
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="ssn_last4"
                className="block text-sm font-medium text-gray-700"
              >
                Last 4 digits of SSN
              </label>
              <input
                type="text"
                id="ssn_last4"
                name="ssn_last4"
                value={formData.ssn_last4}
                onChange={handleChange}
                pattern="\d{4}"
                maxLength={4}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
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
      
      {/* Voice Enrollment Modal */}
      {showVoiceEnroll && registeredPatientId && (
        <PatientVoiceEnroll 
          isOpen={showVoiceEnroll} 
          onClose={handleCloseVoiceEnroll} 
          id={registeredPatientId} 
        />
      )}
    </div>
  )
}