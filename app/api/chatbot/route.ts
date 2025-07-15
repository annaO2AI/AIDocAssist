// app/api/chatbot/route.ts

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { question } = await req.json()

  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 })
  }

  try {
    // Call the actual /ask API endpoint (replace with your correct API endpoint)
    const response = await fetch(
      "https://aisummary-api-fue6a9gxabdceng4.canadacentral-01.azurewebsites.net/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error fetching from chatbot API" },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Assuming the response has a field 'answer' that contains the bot's response
    return NextResponse.json({ answer: data.answer })
  } catch (error) {
    console.error("Error in /ask API:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
