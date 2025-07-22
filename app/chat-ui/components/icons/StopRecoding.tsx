import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export default function StopRecoding({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
   <svg width="45" height="46" viewBox="0 0 45 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="0.5" width="45" height="45" rx="22.5" fill="url(#paint0_linear_2267_56387)"/>
      <path d="M29.5 14C30.6046 14 31.5 14.8954 31.5 16V30C31.5 31.0357 30.7128 31.887 29.7041 31.9893L29.5 32H15.5L15.2959 31.9893C14.3543 31.8938 13.6062 31.1457 13.5107 30.2041L13.5 30V16C13.5 14.8954 14.3954 14 15.5 14H29.5ZM15.5 30H29.5V16H15.5V30ZM26.2275 17.2725C27.3319 17.2726 28.2274 18.1681 28.2275 19.2725V26.7275C28.2274 27.8319 27.3319 28.7274 26.2275 28.7275H18.7725C17.6681 28.7274 16.7726 27.8319 16.7725 26.7275V19.2725C16.7726 18.1681 17.6681 17.2726 18.7725 17.2725H26.2275Z" fill="white"/>
      <defs>
      <linearGradient id="paint0_linear_2267_56387" x1="-20.8594" y1="-10.1875" x2="56.3007" y2="3.59108" gradientUnits="userSpaceOnUse">
      <stop stopColor="#6A3398"/>
      <stop offset="1" stopColor="#3C77EF"/>
      </linearGradient>
      </defs>
   </svg>
  );
}