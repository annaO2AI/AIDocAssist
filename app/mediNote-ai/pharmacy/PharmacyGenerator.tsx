import React, { useState } from "react"
import { X, Menu, Search, Loader2 } from 'lucide-react';
import { APIService } from "../service/api";
import SearchPharmacy from "./SearchPharmacy";
import SearchDrugById, { IdResponseData } from "./SearchDrugById";
import SearchDrugByNdc, { DrugInfoNDC } from "./SearchDrugByNdc";


type Ingredient = {
  name: string
  strength: string
}

type Packaging = {
  package_ndc: string
  description: string
  marketing_start_date: string
}

type Product = {
  generic_name: string
  brand_name?: string
  labeler_name: string
  dosage_form: string
  active_ingredients: Ingredient[]
  packaging: Packaging[]
}

export type MedicationResponse = {
  query: string
  openfda_ndc?: Product[]
}

const PharmacyGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
   const [data, setData] = useState<MedicationResponse | null>(null)
   const [drugIdData, setDrugIdData] = useState<IdResponseData | null>(null)
   const [ndcData, setNdcData] = useState<DrugInfoNDC | null>(null)

   const [tab, setTab] = useState(0)



  return (
    <>
      <button
        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        onClick={() => setIsOpen(true)}
        disabled={isOpen}
      >
        Generate Pharmacy
      </button>
     {/* Offcanvas Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[800px] max-w-screen-lg bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Offcanvas Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Pharmacy Search</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Offcanvas Body - Form */}
        <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
            {/* Tabs */}
            <div className="mb-6 w-full">
              <div className="flex border-b border-gray-200 mb-3">
                {["Pharmacy Search","Search Drug By ID","Search Drug By NDC"]?.map((idx:string, index) => (
                <button
                key={index}
                  className={ `px-4 py-2 -mb-px text-sm font-medium ${
                    tab !== index  ? "text-gray-500 border-transparent border-b-2 hover:text-blue-600 hover:border-blue-300" : "text-blue-600 border-b-2 border-blue-600 focus:outline-none"
                  }`}
                  onClick={() => setTab(index)}
                >
                  {idx}
                </button>
                ))}
              </div>
              {/* Tab content: keep empty for now */}
              {tab === 0 && (
                <SearchPharmacy 
                  setData={setData}
                  data={data}
                  id="while-recording"
                />
              )}
              {tab === 1 && (
                <SearchDrugById 
                data={drugIdData}
                setData={setDrugIdData}                
                />
              )}
              {tab === 2 && (
                <SearchDrugByNdc 
                data={ndcData}
                setData={setNdcData}
                />
              )}
            </div>
           
        </div>

         

      </div>
    </>
  )
}

export default PharmacyGenerator
