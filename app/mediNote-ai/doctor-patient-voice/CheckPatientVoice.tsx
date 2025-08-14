import React, { useCallback, useEffect, useState } from "react"
import { APIService } from "../service/api"
import ViewPatientList from "./ViewPatientList"

interface PatientCardProps {
    patient_id: number;
    name: string;
    voice_file: string;
    exists: boolean;  
}

export default function CheckPatientVoice({handleStartCon}:{
  handleStartCon:(id:number) => void
}) {
  const [users, setUsers] = useState<PatientCardProps | null>(null)
  const [searchQuery, setSearchQuery] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized fetchUsers function
  const fetchUsers = useCallback(async () => {  

    try {
      setLoading(true)
      const data: PatientCardProps = await APIService.checkPatientVoiceExists(
        searchQuery
      )
      if (!data) {
        setError("Something went wrong")
        throw new Error("No response received from server")
      } else {
        setUsers(data)
        setLoading(false)
        setError(null)
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch users: ${err.message}`)
      } else {
        setError("Failed to fetch users")
      }
      setLoading(false)
    }
  }, [searchQuery])

  console.log({users})

    // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
     searchQuery &&   fetchUsers()
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);



  return (
    <div>
      {" "}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Search patients"
        value={searchQuery}
        onChange={(e) => setSearchQuery(Number(e.target.value))}
      />

     {users && <ViewPatientList patient={users} handleStartCon={handleStartCon}/>}
    </div>
  )
}
