// app/components/CallCard.tsx
import { Mic, User } from "lucide-react"

interface CallCardProps {
  audioId: string
  customerName: string
  agentName: string
}

export default function CallCard({
  audioId,
  customerName,
  agentName,
}: CallCardProps) {
  return (
    <div className="bg-blue-500 text-white p-6 rounded-xl w-64 shadow-md relative overflow-hidden">
      <div className="flex items-start space-x-2 mb-8 flex-col">
        <Mic className="w-23 h-31" />
      </div>
      <div className="flex items-start space-x-2 mb-1 flex-col wrap-anywhere line-braksr">
          <span className="font-semibold text-lg">#{audioId}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>Customer:</span>
          <span>{customerName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span>Agent</span>
        </div>
      </div>

      <Mic className="absolute w-[12rem] h-[12rem] bottom-[-2rem] right-[-2rem] text-blue-400 opacity-10 pointer-events-none" />
    </div>
  )
}
