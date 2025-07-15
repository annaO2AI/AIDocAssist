import React from 'react';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export default function Rightarrow({
  width = 24,
  height = 24,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_670_33986)">
    <rect x="40" y="38" width="30" height="30" rx="15" transform="rotate(-180 40 38)" fill="white" shapeRendering="crispEdges"/>
    <path d="M28.7992 29.8078C29.0669 29.5515 29.0669 29.136 28.7992 28.8797L22.6555 23L28.7992 17.1203C29.0669 16.864 29.0669 16.4485 28.7992 16.1922C28.5314 15.9359 28.0972 15.9359 27.8294 16.1922L21.2008 22.536C20.9331 22.7922 20.9331 23.2078 21.2008 23.464L27.8294 29.8078C28.0972 30.0641 28.5314 30.0641 28.7992 29.8078Z" fill="#34334B" stroke="#34334B" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
    <filter id="filter0_d_670_33986" x="0" y="-1.90735e-06" width="50" height="50" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="2"/>
    <feGaussianBlur stdDeviation="5"/>
    <feComposite in2="hardAlpha" operator="out"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.437384 0 0 0 0 0.554544 0 0 0 0 0.610577 0 0 0 0.3 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_670_33986"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_670_33986" result="shape"/>
    </filter>
    </defs>
    </svg>
  );
}