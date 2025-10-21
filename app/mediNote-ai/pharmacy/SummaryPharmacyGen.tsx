import React, { useEffect } from "react"
import SearchPharmacy from "./SearchPharmacy"
import { X } from "lucide-react"
import { MedicationResponse } from "./PharmacyGenerator"
import { APIService } from "../service/api"

const SummaryPharmacyGen = ({
  setData,
  data,
  sessionId,
  patientId,
  doctorId,
}: {
  setData: (e: MedicationResponse | null) => void
  data: MedicationResponse | null,
  sessionId:number
  patientId:number
  doctorId:number
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<any>(null)
  const [toast, setToast] = React.useState<{msg: string, type: "success" | "error"} | null>(null)

  const handleItemSelect = async (item: any) => {
    try {
      const response = await APIService?.createMedication(item)
      if (response) {
        setToast({msg: "Medication Added successfully!", type: "success"})
      }
    } catch (err) {
      setToast({msg: "Failed to create medication.", type: "error"})
      console.log(err)
    }
  }

  useEffect(() => {
    if (selectedItem && selectedItem !== null) {
      handleItemSelect({
        session_id: sessionId,
        patient_id: patientId,
        doctor_id: doctorId,
        query: selectedItem.generic_name || "",
        rxcui: Array.isArray(selectedItem?.openfda?.rxcui) && selectedItem.openfda.rxcui.length > 0
        ? selectedItem.openfda.rxcui[0]
        : "",
        drug_name: selectedItem?.brand_name || "",
        ndc: selectedItem?.product_ndc || "",
        source: selectedItem?.source || "",
        payload: {selectedItem }
      })
    }
  }, [selectedItem])

  // Hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-4 py-2 rounded shadow-lg text-white transition-all
          ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

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
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Offcanvas Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Pharmacy Search
          </h3>
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
            <SearchPharmacy
              setData={setData}
              data={data}
              id="summary"
              setSelectedItem={setSelectedItem}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default SummaryPharmacyGen