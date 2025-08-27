import React, { useCallback, useEffect, useState } from "react"
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

export default function CheckPatientVoice({
  handleStartCon,
}: {
  handleStartCon: (id: number) => void
}) {
  const [users, setUsers] = useState<PatientCardProps | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPatientList, setShowPatientList] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [patientNotFound, setPatientNotFound] = useState(false)

  // Memoized fetchUsers function
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setPatientNotFound(false)
      const data: PatientCardProps = await APIService.checkPatientVoiceExists(
        parseInt(searchQuery)
      )
      if (!data || !data.exists) {
        setPatientNotFound(true)
        setUsers(null)
        setSelectedPatientId(null)
      } else {
        setUsers(data)
        setPatientNotFound(false)
        // Update selectedPatientId when new patient data is fetched
        setSelectedPatientId(parseInt(searchQuery))
      }
      setLoading(false)
      setError(null)
      setShowPatientList(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch users: ${err.message}`)
      } else {
        setError("Failed to fetch users")
      }
      setLoading(false)
      setPatientNotFound(true)
      setUsers(null)
      setSelectedPatientId(null)
    }
  }, [searchQuery])

  console.log({ users })

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery && searchQuery.trim() !== "" && !isNaN(parseInt(searchQuery))) {
        fetchUsers()
      } else {
        setUsers(null)
        setSelectedPatientId(null)
        setPatientNotFound(false)
      }
    }, 500)

    return () => {
      clearTimeout(timerId)
    }
  }, [searchQuery, fetchUsers])

  // Function to handle Start Session button click
  const handleStartSession = (patientId: number) => {
    setShowPatientList(false)
    handleStartCon(patientId)
  }

  return (
    <div className="Patient-voice mx-auto mb-6 mediNote-widthfix pl-4 mt-16">
      <div className="w-full flex gap-3 items-start justify-between">
        <div className="relative mb-2 w-[800px]">
          <div className="pb-1 ot-title font-medium text-xl">Search Patients ID</div>
          <div className="absolute inset-y-0 top-8 left-0 pl-3 flex items-center pointer-events-none">
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
            className="block h-[50px] w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[45px]"
            placeholder="Search patients by ID"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
          />
        </div>
        <EnrollDoctorVoice />
      </div>

      <div>
        <div className="flex flex-col gap-3">
          <div className="w-3/5 ">
            {loading && (
              <div className="p-4 text-center text-gray-500">
                Searching for patient...
              </div>
            )}
            
            {patientNotFound && !loading && (
              <div className="p-4 text-center text-gray-500">
                No patient found with ID: {searchQuery}
              </div>
            )}
            
            {users && showPatientList && (
              <ViewPatientList
                patient={users}
                handleStartCon={handleStartSession}
              />
            )}
          </div>
          <div className="full ">
            {selectedPatientId && (
              <PatientHistory patientId={selectedPatientId} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}