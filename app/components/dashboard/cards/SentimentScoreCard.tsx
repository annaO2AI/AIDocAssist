interface SentimentScoreCardProps {
  score: number
}
import Image from 'next/image';

export default function SentimentScoreCard({ score }: SentimentScoreCardProps) {
  return (
    <div className="relative bg-[#B275F2] text-white w-64 p-6 rounded-xl shadow-md overflow-hidden flex flex-col items-start">
      <div className="flex space-x-1 mb-6">
        <Image
          src="/stars.png"
          alt="Star"
          width={45}
          height={38}
        />
      </div>

      <div className="font-medium text-[28px]">{score}/10</div>

      <div className="text-base opacity-90">Sentiment <br/>Score</div>

      {/* <img
        src="/stars.png"
        alt="Faded Star"
        className="absolute w-28 h-28 bottom-[-1rem] right-[-1rem] opacity-10 pointer-events-none"
      /> */}
      <Image
          src="/stars.png"
           alt="Faded Star"
          width={40}
          height={40}
          className="absolute w-28 h-28 bottom-[-1rem] right-[-1rem] opacity-10 pointer-events-none"
        />
    </div>
  )
}
