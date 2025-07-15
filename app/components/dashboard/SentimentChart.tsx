// "use client"

// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts"

// type SentimentItem = {
//   time_sec: number
//   sentiment: "positive" | "neutral" | "negative"
//   text: string
// }

// const sentimentScoreMap: Record<string, number> = {
//   positive: 1,
//   neutral: 0,
//   negative: -1,
// }

// export default function SentimentChart({ data }: { data?: SentimentItem[] }) {
//   if (!data || data.length === 0) {
//     return <p className="text-gray-500 text-sm">No sentiment data available</p>
//   }

//   const chartData = data.map((item) => ({
//     time: item.time_sec,
//     sentiment: sentimentScoreMap[item.sentiment.toLowerCase()] ?? 0,
//     text: item.text,
//   }))

//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <LineChart
//         data={chartData}
//         margin={{ top: 30, right: 30, left: 30, bottom: 30 }}
//       >
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey="time"
//           label={{
//             value: "Time (s)",
//             position: "insideBottomRight",
//             offset: -5,
//           }}
//         />
//         <YAxis
//           domain={[-1, 1]}
//           ticks={[-1, 0, 1]}
//           tickFormatter={(v) =>
//             v === 1 ? "Positive" : v === 0 ? "Neutral" : "Negative"
//           }
//         />
//         <Tooltip
//           content={({ payload }) => {
//             if (!payload || payload.length === 0) return null
//             const entry = payload[0].payload
//             return (
//               <div className="bg-white p-2 rounded shadow">
//                 <p className="text-sm font-semibold">
//                   Time: {entry.time}s —{" "}
//                   {entry.sentiment === 1
//                     ? "Positive"
//                     : entry.sentiment === 0
//                     ? "Neutral"
//                     : "Negative"}
//                 </p>
//                 <p className="text-xs mt-1 max-w-xs whitespace-pre-wrap">
//                   {entry.text}
//                 </p>
//               </div>
//             )
//           }}
//         />
//         <Line
//           type="monotone"
//           dataKey="sentiment"
//           stroke="#28bede"
//           strokeWidth={2}
//           dot
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   )
// }

// "use client"

// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts"

// type SentimentItem = {
//   time_sec: number
//   sentiment: "positive" | "neutral" | "negative"
//   text: string
// }

// const sentimentScoreMap: Record<string, number> = {
//   positive: 1,
//   neutral: 0,
//   negative: -1,
// }

// export default function SentimentChart({ data }: { data?: SentimentItem[] }) {
//   if (!data || data.length === 0) {
//     return <p className="text-gray-500 text-sm">No sentiment data available</p>
//   }

//   const chartData = data.map((item) => ({
//     time: item.time_sec,
//     sentiment: sentimentScoreMap[item.sentiment.toLowerCase()] ?? 0,
//     text: item.text,
//   }))

//   return (
//     <div className="bg-[#f9fbfd] rounded-xl p-4">
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart
//           data={chartData}
//           margin={{ top: 30, right: 30, left: 10, bottom: 30 }}
//         >
//           {/* Gradient Line */}
//           <defs>
//             <linearGradient id="sentimentGradient" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%" stopColor="#ef4444" /> {/* red */}
//               <stop offset="50%" stopColor="#6366f1" /> {/* indigo */}
//               <stop offset="100%" stopColor="#28bede" /> {/* cyan-blue */}
//             </linearGradient>
//           </defs>

//           {/* Grid */}
//           <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

//           {/* X Axis (Time) */}
//           <XAxis
//             dataKey="time"
//             label={{
//               value: "Time (s)",
//               position: "insideBottomRight",
//               offset: -5,
//               style: { fill: "#6b7280", fontSize: 12 },
//             }}
//             tick={{ fill: "#9ca3af", fontSize: 12 }}
//           />

//           {/* Y Axis (Emoji) */}
//           <YAxis
//             domain={[-1, 1]}
//             ticks={[-1, 0, 1]}
//             tickFormatter={(v) =>
//               v === 1 ? "Positive" : v === 0 ? "Neutral" : "Negative"
//             }
//           />

//           {/* Tooltip */}
//           <Tooltip
//             content={({ payload }) => {
//               if (!payload || payload.length === 0) return null
//               const entry = payload[0].payload
//               return (
//                 <div className="bg-white p-2 rounded shadow text-sm">
//                   <p>
//                     <strong>Time:</strong> {entry.time}s
//                   </p>
//                   <p>
//                     <strong>Sentiment:</strong>{" "}
//                     {entry.sentiment === 1
//                       ? "Positive"
//                       : entry.sentiment === 0
//                       ? "Neutral"
//                       : "Negative"}
//                   </p>
//                   <p className="mt-1 text-xs text-gray-600">{entry.text}</p>
//                 </div>
//               )
//             }}
//           />

//           {/* Sentiment Line */}
//           <Line
//             type="monotone"
//             dataKey="sentiment"
//             stroke="url(#sentimentGradient)"
//             strokeWidth={3}
//             dot={false}
//             activeDot={{ r: 6 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   )
// }


"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type SentimentItem = {
  time_sec: number;
  sentiment: "positive" | "neutral" | "negative";
  text: string;
};

// Map sentiment labels to numerical scores
const sentimentScoreMap: Record<string, number> = {
  positive: 1,
  neutral: 0,
  negative: -1,
};

// Rule-based sentiment scoring function
const getSentimentScore = (text: string): number => {
  const lowerText = text.toLowerCase();
  // Negative keywords
  if (
    lowerText.includes("frustrated") ||
    lowerText.includes("annoying") ||
    lowerText.includes("problem") ||
    lowerText.includes("not resolved") ||
    lowerText.includes("could not")
  ) {
    return -1; // Negative
  }
  // Positive keywords
  if (
    lowerText.includes("thank") ||
    lowerText.includes("great") ||
    lowerText.includes("happy") ||
    lowerText.includes("thanks")
  ) {
    return 1; // Positive
  }
  // Default to neutral
  return 0; // Neutral
};

export default function SentimentChart({ data }: { data?: SentimentItem[] }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm">No sentiment data available</p>;
  }

  // Map API data to chart data, using client-side sentiment scoring
  const chartData = data.map((item) => ({
    time: item.time_sec,
    sentiment: getSentimentScore(item.text), // Use rule-based scoring
    text: item.text,
  }));
  console.log(chartData)
  return (
    <div className="bg-[#f9fbfd] rounded-xl p-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 10, bottom: 30 }}
        >
          {/* Gradient Line */}
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" /> {/* red */}
              <stop offset="50%" stopColor="#6366f1" /> {/* indigo */}
              <stop offset="100%" stopColor="#28bede" /> {/* cyan-blue */}
            </linearGradient>
          </defs>

          {/* Grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X Axis (Time) */}
          <XAxis
            dataKey="time"
            label={{
              value: "Time (s)",
              position: "insideBottomRight",
              offset: -5,
              style: { fill: "#6b7280", fontSize: 12 },
            }}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            interval="preserveStartEnd"
            ticks={data.map((d) => d.time_sec).filter((_, i) => i % 10 === 0)}
          />

          {/* Y Axis (Sentiment) */}
          <YAxis
            domain={[-1, 1]}
            ticks={[-1, 0, 1]}
            tickFormatter={(v) =>
              v === 1 ? "Positive" : v === 0 ? "Neutral" : "Negative"
            }
            // label={{
            //   value: "Sentiment",
            //   angle: -90,
            //   position: "insideLeft",
            //   style: { fill: "#6b7280", fontSize: 12 },
            // }}
          />

          {/* Tooltip */}
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const entry = payload[0].payload;
              return (
                <div className="bg-white p-2 rounded shadow text-sm">
                  <p>
                    <strong>Time:</strong> {entry.time}s
                  </p>
                  <p>
                    <strong>Sentiment:</strong>{" "}
                    {entry.sentiment === 1
                      ? "Positive"
                      : entry.sentiment === 0
                      ? "Neutral"
                      : "Negative"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">{entry.text}</p>
                </div>
              );
            }}
          />

          {/* Sentiment Line */}
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke="url(#sentimentGradient)"
            strokeWidth={3}
            // dot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}