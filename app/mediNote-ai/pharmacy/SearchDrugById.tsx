import React, { useState } from "react"
import { APIService } from "../service/api"

type RxNormCore = {
  rxcui: string
  name: string
  synonym: string
  tty: string
  language: string
  suppress: string
  umlscui: string
}

type RxSynonym = {
  propCategory: string
  propName: string
  propValue: string
}

export type IdResponseData = {
  rxcui: string
  rxnorm_core: RxNormCore
  rxnorm_synonyms: RxSynonym[]
  openfda_labels: any[]
}

const SearchDrugById = ({data,setData}:{
    data: IdResponseData | null
    setData: (e: IdResponseData | null) => void
}) => {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    try {
      const response = await APIService?.getDrugById(query)
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
        Search Drug By ID
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
          disabled={loading}
        >
          Search
        </button>
      </div>

      {/* 3. Conditional Output */}
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {data && (
          <div className="bg-white p-4 shadow rounded space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">RxNorm Core</h2>
              <p><strong>Name:</strong> {data.rxnorm_core.name}</p>
              <p><strong>TTY:</strong> {data.rxnorm_core.tty}</p>
              <p><strong>Language:</strong> {data.rxnorm_core.language}</p>
              <p><strong>Suppressed:</strong> {data.rxnorm_core.suppress}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800">Synonyms</h2>
              <ul className="list-disc list-inside">
                {data.rxnorm_synonyms.map((syn, idx) => (
                  <li key={idx}>
                    <span className="text-gray-700">{syn.propValue}</span>
                    <span className="text-sm text-gray-500"> ({syn.propName})</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-auto h-[800px]">
              <h2 className="text-xl font-semibold text-gray-800">OpenFDA Labels</h2>
              {data.openfda_labels.length > 0 ? (
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(data.openfda_labels, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No label data available.</p>
              )}
            </div>
          </div>
        )}
    </div>
  )
}

export default SearchDrugById
