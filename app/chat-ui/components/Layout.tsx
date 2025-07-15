"use client"
import { useState } from "react"
import Aisearch from "./Aisearch"


export default function Layout() {
  const [showInner, setShowInner] = useState(false)

  const handleToggle = () => {
    setShowInner((prev) => !prev)
  }

  return (
    <>
      <Aisearch onSend={handleToggle} />
    </>
  )
}
