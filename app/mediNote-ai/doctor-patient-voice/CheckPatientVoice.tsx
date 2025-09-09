import React, { useCallback, useState } from "react"
import { APIService } from "../service/api"
import ViewPatientList from "./ViewPatientList"
import EnrollDoctorVoice from "./EnrollDoctorVoice"
import PatientHistory from "./PatientHistory"

interface PatientCardProps {
  patient_id: number
  name: string
  voice_file: string
  exists: boolean
}

interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  ssn_last4: string
  address: string
}

interface ApiResponse {
  results: Patient[]
}

export default function CheckPatientVoice({
  handleStartCon,
}: {
  handleStartCon: (id: number) => void
}) {
  const [users, setUsers] = useState<PatientCardProps[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPatientList, setShowPatientList] = useState(true)
  const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]) // Changed to array

  // Memoized fetchUsers function
  const fetchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a search query")
      setUsers([])
      setSelectedPatientIds([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data: ApiResponse = await APIService.SearchPatient(query)

      if (!data || !data.results || data.results.length === 0) {
        setUsers([])
        setSelectedPatientIds([])
      } else {
        // Map all patients to PatientCardProps
        const patientCards: PatientCardProps[] = data.results.map(
          (patient) => ({
            patient_id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`,
            voice_file: "", // Adjust if API provides voice_file
            exists: true,
          })
        )
        setUsers(patientCards)
        // Set all patient IDs for PatientHistory
        setSelectedPatientIds(patientCards.map((patient) => patient.patient_id))
      }
      setLoading(false)
      setShowPatientList(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to fetch users: ${err.message}`
          : "Failed to fetch users"
      )
      setLoading(false)
      setUsers([])
      setSelectedPatientIds([])
    }
  }, [])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchQuery)
  }

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      fetchUsers(searchQuery)
    }
  }

  // Function to handle Start Session button click
  const handleStartSession = (patientId: number) => {
    setShowPatientList(false)
    handleStartCon(patientId)
  }

  return (
    <div className="Patient-voice mx-auto mb-6 mediNote-widthfix pl-4 mt-16">
      <div className="w-full flex gap-3 items-start justify-between">
        <div className="relative mb-2 w-[800px]">
          <div className="pb-1 ot-title font-medium text-xl">
            Search Patients
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative w-full">
              <div className="absolute inset-y-0 top-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block h-[50px] w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search patients by ID or name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.trim())}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>
        <EnrollDoctorVoice />
      </div>

      <div>
        <div className="flex flex-col gap-3">
          <div className="w-full">
            {loading && (
              <div className="p-4 text-center text-gray-500">
                Searching for patient...
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-red-500">{error}</div>
            )}

            {users.length === 0 && !loading && !error && (
              <div className="p-4 text-center text-gray-500">
               Searching Patient details: {searchQuery}
              </div>
            )}

            {users.length > 0 && showPatientList && (
              <ViewPatientList
                patients={users}
                handleStartCon={handleStartSession}
              />
            )}
          </div>
          <div className="full">
            {selectedPatientIds.length > 0 && (
              <PatientHistory patientIds={selectedPatientIds} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
