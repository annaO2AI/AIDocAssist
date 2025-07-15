"use client"

import { UserRound } from "lucide-react"

interface OSCardProps {
  sentiment: string
}

export default function OSCard({ sentiment }: OSCardProps) {
  const sentimentMap = () => {
    const val = Number(sentiment)
    if (val > 6 && val <= 10) return "Positive"
    if (val > 5 && val <= 6) return "Neutral"
    if (val >= 0 && val <= 5) return "Negative"
    return "Unknown"
  }

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-[#62C6FF]" // inline hex if not in tailwind config
      case "Negative":
        return "bg-red-500"
      case "Neutral":
        return "bg-yellow-400"
      default:
        return "bg-gray-200"
    }
  }

  const mappedSentiment = sentimentMap()

  return (
    <div
      className={`text-white p-6 rounded-xl w-64 shadow-md relative overflow-hidden ${getSentimentBg(
        mappedSentiment
      )}`}
    >
      <div className="flex items-start space-x-2 mb-8 flex-col">
        <UserRound className="w-23 h-31" />
      </div>
      <div className="font-medium text-[28px] leading-[100%] mb-2" >
        {mappedSentiment}
      </div>
      <div className="space-y-1 text-base">
        <span>Overall<br/> Sentiment</span>
      </div>

      {/* Faded icon */}
      <UserRound className="absolute w-[12rem] h-[12rem] bottom-[-2rem] right-[-2rem] text-white opacity-10 pointer-events-none" />
    </div>
  )
}
