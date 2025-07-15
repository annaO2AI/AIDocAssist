import React from "react"
import Image from 'next/image';

const CallSummaryCard = ({ summary }: { summary: string }) => {
  return (
    <div className="flex p-12 from-indigo-50 to-blue-50 boxshadow rounded-xl shadow-sm bg-white gap-10" >
      <div >
        <h2 className="text-xl font-semibold mb-2 ot-title">Call Summary</h2>
        <p className="leading-relaxed osubtitle text-base">{summary}</p>
      </div>
      <Image
        src="/CallSummary.gif"
        alt="Call Summary"
        width={196}
        height={196}
      />
    </div>
  )
}

export default CallSummaryCard
