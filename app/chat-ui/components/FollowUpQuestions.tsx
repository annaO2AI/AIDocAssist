"use client";
import { RefObject, useRef, useState, useEffect } from "react";

interface FollowUpQuestionsProps {
  followupQuestions: string[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  sendMessage: () => Promise<void>;
   inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function FollowUpQuestions({
  followupQuestions,
  isLoading,
  setQuery,
  sendMessage,
  inputRef,
}: FollowUpQuestionsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Function to update scroll button states
  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 to account for rounding
    }
  };

  // Update scroll button states on mount and when followupQuestions change
  useEffect(() => {
    updateScrollButtons();
  }, [followupQuestions]);

  // Update scroll button states on scroll
  const handleScroll = () => {
    updateScrollButtons();
  };

  // Scroll left by a fixed amount (e.g., 200px)
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  // Scroll right by a fixed amount (e.g., 200px)
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  // Only render if there are follow-up questions
  if (!followupQuestions?.length) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      {/* Left Arrow Button */}
      <button
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        className={`p-2 rounded-full  text-gray-600 ${
          canScrollLeft
            ? "hover:bg-gray-300"
            : "opacity-0 cursor-not-allowed"
        } transition-colors`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-nowrap gap-2 overflow-hidden"
      >
        {followupQuestions.map((question, qIdx) => (
          <div
            key={qIdx}
            className={`flex items-center justify-between bg-blue-100 text-gray-800 text-sm rounded-lg py-1 px-2  cursor-pointer transition-colors ${
              isLoading
                ? "opacity-0 cursor-not-allowed"
                : "hover:bg-blue-200 hover:text-gray-900"
            }`}
            onClick={() => {
              if (!isLoading) {
                setQuery(question);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
                sendMessage();
              }
            }}
          >
            <span className="truncate">{question}</span>
          </div>
        ))}
      </div>

      {/* Right Arrow Button */}
      <button
        onClick={scrollRight}
        disabled={!canScrollRight}
        className={`p-2 rounded-full  text-gray-600 ${
          canScrollRight
            ? "hover:bg-gray-300"
            : "opacity-0 cursor-not-allowed"
        } transition-colors`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}