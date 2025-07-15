import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export default function Leftarrow({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg width="51" height="50" viewBox="0 0 51 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_1_12221)">
      <rect x="10.5" y="8" width="30" height="30" rx="15" fill="white" shapeRendering="crispEdges"/>
      <path d="M21.7008 16.1922C21.4331 16.4485 21.4331 16.864 21.7008 17.1203L27.8445 23L21.7008 28.8797C21.4331 29.136 21.4331 29.5515 21.7008 29.8078C21.9686 30.0641 22.4028 30.0641 22.6706 29.8078L29.2992 23.464C29.5669 23.2078 29.5669 22.7922 29.2992 22.536L22.6706 16.1922C22.4028 15.9359 21.9686 15.9359 21.7008 16.1922Z" fill="#34334B" stroke="#34334B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
      <filter id="filter0_d_1_12221" x="0.5" y="0" width="50" height="50" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="2"/>
      <feGaussianBlur stdDeviation="5"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.437384 0 0 0 0 0.554544 0 0 0 0 0.610577 0 0 0 0.3 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_12221"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_12221" result="shape"/>
      </filter>
      </defs>
    </svg>
  );
}