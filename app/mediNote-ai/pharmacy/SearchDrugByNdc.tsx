import React, { useState } from "react"
import { APIService } from "../service/api"

export type DrugInfoNDC = {
  ndc: string;
  rxcui: string;
  name: string;
  package: string;
  status: "active" | "inactive" | string; // You can adjust based on known statuses
};


const SearchDrugByNdc = ({
    data,
    setData
}:{
    data: DrugInfoNDC | null
    setData: (e: DrugInfoNDC | null) => void
}) => {
      const [query, setQuery] = useState("")
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState("")

        const handleSearch = async (e: React.FormEvent) => {
          e.preventDefault()
          if (!query) return
          setLoading(true)
          try {
            const response = await APIService?.getDrugByNdc(query)
            if (response) {
              setData(response)
            }
          } catch (err: any) {
            setError(err.message || "Something went wrong")
          } finally {
            setLoading(false)
          }
        }
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Search Drug By NDC
      </h1>

      {/* 2. Form */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter medication name (e.g., amoxicillin)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={(e) => handleSearch(e)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* 3. Conditional Output */}
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {data && (
          <div className="space-y-2">
          <div>
            <p className="text-gray-500 text-sm">NDC</p>
            <p className="text-lg font-medium">{data.ndc}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">RxCUI</p>
            <p className="text-lg font-medium">{data.rxcui}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Name</p>
            <p className="text-lg font-medium">{data.name}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Package</p>
            <p className="text-lg font-medium">{data.package}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${
                data.status === "active" ? "bg-green-600" : "bg-red-500"
              }`}
            >
              {data.status}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchDrugByNdc