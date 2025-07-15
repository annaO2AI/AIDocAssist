// "use client

import { Suspense } from "react"
import CallbackClient from "./CallbackClient"

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Logging in...</div>}>
      <CallbackClient />
    </Suspense>
  )
}
