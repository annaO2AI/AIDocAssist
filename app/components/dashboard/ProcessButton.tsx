import { API_ROUTES } from "../../constants/api"
import { fetchWithAuth } from "@/app/utils/axios"
type Props = {
  selectedAudio: string | null
  setGraphData: (data: any[]) => void
  loading: boolean
  setLoading: (v: boolean) => void
}

export default function ProcessButton({
  selectedAudio,
  setGraphData,
  loading,
  setLoading,
}: Props) {
  const handleProcess = async () => {
    if (!selectedAudio) return
    setLoading(true)

    try {
      const res = await fetchWithAuth(API_ROUTES.processCall, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedAudio,
          model_option: "AzureOpenAI",
        }),
      })

      const data = await res.json()
      // console.log("Processing result:", data)
      setGraphData(data)
    } catch (err) {
      console.error("Processing error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedAudio) return null

  return (
    <div className="flex justify-center mt-4 dashordmain-custom-stylewrap">
      <button
        onClick={handleProcess}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 dashordmain-custom-style"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>
    </div>
  )
}

// import { API_ROUTES } from "../../constants/api"
// import { fetchWithAuth } from "@/app/utils/axios"
// type Props = {
//   selectedAudio: string | null
//   setGraphData: (data: any[]) => void
//   loading: boolean
//   setLoading: (v: boolean) => void
// }

// export default function ProcessButton({
//   selectedAudio,
//   setGraphData,
//   loading,
//   setLoading,
// }: Props) {
//   const handleProcess = async () => {
//     if (!selectedAudio) return
//     // Normalize selectedAudio
//     const correctedAudio = selectedAudio.replace("-", "–");
    
//     console.log("selectedAudio:", selectedAudio, "correctedAudio:", correctedAudio)
//     setLoading(true)

//     try {
//       const res = await fetchWithAuth(API_ROUTES.processCall, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           filename: correctedAudio,
//           model_option: "AzureOpenAI",
//         }),
//       })

//       const data = await res.json()
//       console.log("Processing result:", data)
//       setGraphData(data)
//     } catch (err) {
//       console.error("Processing error:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!selectedAudio) return null

//   return (
//     <div className="flex justify-center mt-4">
//       <button
//         onClick={handleProcess}
//         className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//         disabled={loading}
//       >
//         {loading ? "Processing..." : "Process"}
//       </button>
//     </div>
//   )
// }
