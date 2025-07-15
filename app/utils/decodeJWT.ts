export function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1] // Get middle part
    const decoded = atob(payload)
    return JSON.parse(decoded)
  } catch (e) {
    console.error("Failed to decode token", e)
    return null
  }
}
