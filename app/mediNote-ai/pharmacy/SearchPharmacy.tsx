import { Loader2, Search } from 'lucide-react'
import React, { useState } from 'react'
import { MedicationResponse } from './PharmacyGenerator';
import { APIService } from '../service/api';

const SearchPharmacy = ({
  data,
  setData,
  id,
  setSelectedItem
}: {
  data: MedicationResponse | null,
  setData: (e: MedicationResponse | null) => void,
  id?: string
  setSelectedItem?: (e: any) => void
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    q: '',
    limit: 10,
    source: 'combined'
  });

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await APIService?.searchPharmacy(formData?.q, formData?.limit, formData?.source)
      if (res) {
        setData(res)
        setFormData({
          q: '',
          limit: 0,
          source: 'combined'
        })
      } else {
        setData(null)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }

  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' ? parseInt(value) || 1 : value
    }));
  };
  return (
    <>
      {/* Query Input */}
      <div>
        <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-2">
          Pharmacy Search <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="q"
          name="q"
          value={formData.q}
          onChange={handleInputChange}
          required
          minLength={1}
          placeholder="e.g., amoxicillin"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum 1 character required</p>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        {/* Limit Selection */}
        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
            Limit
          </label>
          <select
            id="limit"
            name="limit"
            value={formData.limit}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            {[...Array(50)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Maximum: 50, Minimum: 1</p>
        </div>

        {/* Source Selection */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            <option value="combined">Combined</option>
            <option value="rxnorm">RxNorm</option>
            <option value="openfda">OpenFDA</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Pattern: combined | rxnorm | openfda</p>
        </div>
      </div>
      {/* Submit Button */}
      <button
        disabled={loading || !formData.q}
        onClick={handleSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search size={20} />
            Search
          </>
        )}
      </button>


      <div className=" mx-auto mt-3">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Medication Info {data?.query && `for "${data.query}"`}
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : data?.openfda_ndc && data.openfda_ndc.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {data.openfda_ndc.map((item: any, idx: number) => (
              <button
                key={idx}
                disabled={id !== 'summary'}
                className="w-full text-left h-full" // make button fill available height
                onClick={() => setSelectedItem?.({ ...item, source: formData.source })}    >
                <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col justify-between">
                  <h2 className="text-xl font-semibold text-blue-700 mb-2">
                    {item.generic_name || 'Unknown'}
                  </h2>

                  <p className="text-sm text-gray-700">
                    <strong>Brand Name:</strong> {item.brand_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Manufacturer:</strong> {item.labeler_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Dosage Form:</strong> {item.dosage_form}
                  </p>

                  {/* Active Ingredients */}
                  <div className="mt-2">
                    <strong className="text-sm text-gray-800">Ingredients:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {item.active_ingredients.map((ing: any, index: number) => (
                        <li key={index}>
                          {ing.name} – {ing.strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RxCUI Info */}
                  <div className="mt-2"> <strong className="text-sm text-gray-800">RxCUI:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {Array.isArray(item.openfda?.rxcui) && item.openfda.rxcui.length > 0 ? (
                        item.openfda.rxcui.map((rxcui: string, index: number) => (
                          <li key={index}>{rxcui}</li>
                        ))
                      ) : (
                        <li className="text-gray-400">N/A</li>
                      )}
                    </ul> </div>

                  {/* Packaging Info */}
                  <div className="mt-2">
                    <strong className="text-sm text-gray-800">Packaging:</strong>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {item.packaging.slice(0, 2).map((pack: any, index: number) => (
                        <li key={index}>{pack.description}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            ))}
          </div>

        ) : (
          <p className="text-center text-red-500 text-lg">
            No medication data found.
          </p>
        )}
      </div>
    </>
  )
}

export default SearchPharmacy