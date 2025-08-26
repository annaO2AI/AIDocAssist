"use client"
import { useState } from "react"
import Aisearch from "./Aisearch"
import ProcurementSearchPage from "../../mediNote-ai/patient-registration/page"


export default function Layout() {
  const [showInner, setShowInner] = useState(false)

  const handleToggle = () => {
    setShowInner((prev) => !prev)
  }

  return (
    <>
      <ProcurementSearchPage />
    </>
  )
}
