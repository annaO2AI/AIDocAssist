"use client"

// import { ListTodo as Clock } from "lucide-react"
import EmailSentTags from "./EmailSentTags"
import Image from 'next/image';

type ActionItem = {
  task: string
}

type Props = {
  actionItems: ActionItem[]
  emailSent: string[]
}

export default function ActionItemsList({ actionItems, emailSent }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-4 gap-6 items-stretch">
        <div className="w-[65%] p-12 rounded-2xl boxshadow bg-white">
          <div className="flex items-baseline mb-2">
            <h2 className="text-xl font-semibold mb-4 ot-title">Action Items</h2>
          </div>
          <ul className="space-y-3">
            {actionItems.map((item, idx) => (
              <li key={idx} className="flex items-center justify-left gap-3 border-o2 p-4 rounded-md">
                <Image
                  src="/checkbox.svg"
                  alt="Check"
                  width={18}
                  height={18}
                />
                <span className="text-base osubtitle ">{item.task}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-[35%] rounded-2xl boxshadow bg-white emailactivatbg emailBoder">
          <EmailSentTags emailSent={emailSent} />
        </div>
      </div>
    </div>
  )
}
