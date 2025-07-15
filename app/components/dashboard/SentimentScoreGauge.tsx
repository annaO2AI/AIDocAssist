// "use client"

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Cell,
// } from "recharts"

// type Props = {
//   sentimentScore: number // from 0 to 10
// }

// export default function SentimentScoreGauge({ sentimentScore }: Props) {
//   const data = [
//     {
//       name: "Score",
//       value: sentimentScore,
//     },
//   ]

//   const getColor = (score: number) => {
//     if (score >= 7) return "#10b981" // green
//     if (score >= 4) return "#facc15" // yellow
//     return "#f43f5e" // red
//   }

//   return (
//     <div className="w-full p-4 rounded-2xl shadow bg-white">
//       <h2 className="text-xl font-semibold mb-4">Overall Sentiment Score</h2>
//       <ResponsiveContainer width="100%" height={250}>
//         <BarChart
//           data={data}
//           layout="vertical"
//           margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//         >
//           <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
//           <YAxis type="category" dataKey="name" hide />
//           <Tooltip />
//           <Bar dataKey="value" fill={getColor(sentimentScore)} barSize={30}>
//             <Cell key="cell-0" fill={getColor(sentimentScore)} />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//       <div
//         className="text-center mt-2 text-2xl font-bold"
//         style={{ color: getColor(sentimentScore) }}
//       >
//         {sentimentScore}/10
//       </div>
//     </div>
//   )
// }

// "use client"

// type Props = {
//   sentimentScore: number // from 1 to 10
// }

// const sentimentScale = [
//   { value: 1, emoji: "😠", color: "#b91c1c" },
//   { value: 2, emoji: "😡", color: "#ef4444" },
//   { value: 3, emoji: "😟", color: "#f97316" },
//   { value: 4, emoji: "😐", color: "#facc15" },
//   { value: 5, emoji: "🙂", color: "#eab308" },
//   { value: 6, emoji: "😊", color: "#84cc16" },
//   { value: 7, emoji: "😃", color: "#4ade80" },
//   { value: 8, emoji: "😁", color: "#22c55e" },
//   { value: 9, emoji: "😍", color: "#10b981" },
//   { value: 10, emoji: "🤩", color: "#06b6d4" },
// ]

// export default function SentimentScoreBlocks({ sentimentScore }: Props) {
//   return (
//     <div className="w-full max-w-3xl mx-auto p-4 rounded-2xl shadow bg-white">
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">
//         Overall Sentiment Score
//       </h2>

//       {/* Emojis */}
//       <div className="flex justify-between mb-1">
//         {sentimentScale.map((item) => (
//           <div key={item.value} className="w-8 text-center text-xl">
//             {item.emoji}
//           </div>
//         ))}
//       </div>

//       {/* Colored boxes */}
//       <div className="flex justify-between">
//         {sentimentScale.map((item) => (
//           <div
//             key={item.value}
//             className={`w-8 h-8 rounded-md text-white font-semibold flex items-center justify-center`}
//             style={{
//               backgroundColor: item.color,
//               opacity: item.value === sentimentScore ? 1 : 0.6,
//               border: item.value === sentimentScore ? "2px solid #000" : "",
//             }}
//           >
//             {item.value}
//           </div>
//         ))}
//       </div>

//       {/* Score indicator */}
//       <div className="relative mt-6 h-4 bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-500 rounded-full">
//         <div
//           className="absolute -top-7 px-2 py-1 text-white text-sm font-medium rounded bg-black"
//           style={{
//             left: `${(sentimentScore - 1) * 10}%`,
//             transform: "translateX(-50%)",
//           }}
//         >
//           {sentimentScore}/10
//         </div>
//       </div>
//     </div>
//   )
// }

// "use client"

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Cell,
//   LabelList,
// } from "recharts"

// type Props = {
//   sentimentScore: number // from 1 to 10
// }

// const scoreData = [
//   { score: 1, emoji: "😠", color: "#b91c1c" },
//   { score: 2, emoji: "😡", color: "#dc2626" },
//   { score: 3, emoji: "😟", color: "#f97316" },
//   { score: 4, emoji: "😐", color: "#facc15" },
//   { score: 5, emoji: "🙂", color: "#eab308" },
//   { score: 6, emoji: "😊", color: "#a3e635" },
//   { score: 7, emoji: "😃", color: "#4ade80" },
//   { score: 8, emoji: "😁", color: "#22c55e" },
//   { score: 9, emoji: "😍", color: "#10b981" },
//   { score: 10, emoji: "🤩", color: "#06b6d4" },
// ]

// export default function SentimentScoreGauge({ sentimentScore }: Props) {
//   const chartData = scoreData.map((item) => ({
//     name: item.score.toString(),
//     value: item.score === sentimentScore ? 1 : 0.5, // Highlight current score
//     emoji: item.emoji,
//     color: item.color,
//     isCurrent: item.score === sentimentScore,
//   }))

//   return (
//     <div className="w-full  mx-auto p-4 rounded-2xl shadow bg-white">
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">
//         Overall Sentiment Score
//       </h2>

//       <ResponsiveContainer width="100%" height={150}>
//         <BarChart
//           data={chartData}
//           margin={{ top: 40, right: 30, left: 30, bottom: 30 }}
//         >
//           <XAxis
//             dataKey="name"
//             tickLine={false}
//             axisLine={false}
//             tick={{ fontSize: 14, fontWeight: "bold" }}
//           />
//           <YAxis hide />
//           {/* <Tooltip content={<></>} /> */}
//           <Bar dataKey="value" radius={[8, 8, 0, 0]}>
//             <LabelList
//               dataKey="emoji"
//               content={({ x, y, value }: any) => (
//                 <text
//                   x={x! + 35}
//                   y={y! - 10}
//                   textAnchor="middle"
//                   fill="#000"
//                   fontSize={22}
//                 >
//                   {value}
//                 </text>
//               )}
//             />
//             {chartData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={entry.color}
//                 opacity={entry.isCurrent ? 1 : 0.6}
//                 stroke={entry.isCurrent ? "#000" : "none"}
//                 strokeWidth={entry.isCurrent ? 2 : 0}
//               />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>

//       {/* Score Indicator */}
//       <div
//         className="text-center mt-2 text-2xl font-bold"
//         style={{ color: scoreData[sentimentScore - 1].color }}
//       >
//         {sentimentScore}/10
//       </div>
//     </div>
//   )
// }

"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts"

interface SentimentScoreGaugeProps {
  sentimentScore: number
}

export default function SentimentScoreGauge({
  sentimentScore,
}: SentimentScoreGaugeProps) {
  const data = [
    {
      name: "Sentiment Score",
      value: sentimentScore,
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-md ">
      <h3 className="text-xl font-medium  mb-7 ot-title">
        Overall Sentiment Score
      </h3>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical horizontal={false} />

          <XAxis
            type="number"
            domain={[1, 10]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            padding={{ left: 6, right: 0 }}
          />

          <YAxis type="category" dataKey="name" hide />

          <Tooltip
            cursor={false}
            content={({ active, payload }) =>
              active && payload && payload.length ? (
                <div className="bg-black text-white text-xs px-2 py-1 rounded">
                  {payload[0].value}/10
                </div>
              ) : null
            }
          />

          <Bar dataKey="value" barSize={16} radius={[8, 8, 8, 8]}>
            <Cell fill="url(#gradient)" />
          </Bar>

          <defs>
            <linearGradient id="gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const scoreData = [
  { score: 1, emoji: "😠", color: "#b91c1c" },
  { score: 2, emoji: "😡", color: "#dc2626" },
  { score: 3, emoji: "😟", color: "#f97316" },
  { score: 4, emoji: "😐", color: "#facc15" },
  { score: 5, emoji: "🙂", color: "#eab308" },
  { score: 6, emoji: "😊", color: "#a3e635" },
  { score: 7, emoji: "😃", color: "#4ade80" },
  { score: 8, emoji: "😁", color: "#22c55e" },
  { score: 9, emoji: "😍", color: "#10b981" },
  { score: 10, emoji: "🤩", color: "#06b6d4" },
]

export const SentimentScoreChart = ({
  sentimentScore,
}: SentimentScoreGaugeProps) => {
  const chartData = scoreData.map((item) => ({
    name: item.score.toString(),
    value: item.score === sentimentScore ? 1 : 0.5, // Highlight current score
    emoji: item.emoji,
    color: item.color,
    isCurrent: item.score === sentimentScore,
  }))

  return (
    <div className="w-full  mx-auto p-12 rounded-2xl boxshadow bg-white">
      <div>
        <h2 className="text-xl font-semibold ot-title">
           Overall Call Sentiment Score
        </h2>
        <p className="text-base osubtitle ">
          Measures customer and agent interaction quality on a scale of 1 to 10
        </p>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart
          data={chartData}
          margin={{ top: 40, right: 30, left: 30, bottom: 30 }}
        >
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 14, fontWeight: "bold" }}
          />
          <YAxis hide />
          {/* <Tooltip content={<></>} /> */}
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            <LabelList
              dataKey="score"
              content={({ x, y, value }: any) => (
                <text
                  x={x! + 35}
                  y={y! - 10}
                  textAnchor="middle"
                  fill="#000"
                  fontSize={22}
                >
                  {value}
                </text>
              )}
            />
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={entry.isCurrent ? 1 : 0.6}
                stroke={entry.isCurrent ? "#000" : "none"}
                strokeWidth={entry.isCurrent ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Score Indicator */}
      <div
        className="text-center mt-2 text-2xl font-bold"
        style={{ color: scoreData[sentimentScore - 1].color }}
      >
        {sentimentScore}/10
      </div>
    </div>
  )
}
