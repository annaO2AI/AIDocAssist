// components/AgentRating.tsx
import React from 'react';

const AgentRating = ({ rating = 9 }) => {
  const ratingScale = Array.from({ length: 11 }, (_, i) => i);

  const getColorClass = (num) => {
    if (num === 0) return 'bg-red-500';
    if (num === 1) return 'bg-red-400';
    if (num === 2) return 'bg-orange-400';
    if (num === 3) return 'bg-orange-300';
    if (num === 4) return 'bg-yellow-300';
    if (num === 5) return 'bg-yellow-200';
    if (num === 6) return 'bg-lime-300';
    if (num === 7) return 'bg-green-300';
    if (num === 8) return 'bg-green-400';
    if (num === 9) return 'bg-green-500';
    return 'bg-teal-400'; // num === 10
  };

  return (
    <div className="">
      <div className="flex space-x-2 justify-center mb-2  mt-2 gap-1">
        {ratingScale.map((num) => (
          <div
            key={num}
            className={`w-8 h-8 flex items-center justify-center rounded text-white opacity-[0.8]
              ${getColorClass(num)}
              ${num === rating ? 'w-10 h-10 font-bold border-2 border-white opacity-[1] o2-agent-shadow scale-[1.7] ' : ''}`}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-gray-500 text-sm mt-3">
        <span>0: Needs Improvement </span>
        <span className='w-[50%] ot-customline relative'></span>
        <span>10: Excellent</span>
      </div>
    </div>
  );
};

export default AgentRating;