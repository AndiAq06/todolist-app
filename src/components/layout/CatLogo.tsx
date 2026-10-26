'use client';

import React from 'react';

interface CatLogoProps {
  size?: number;
  className?: string;
}

export const CatLogo: React.FC<CatLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-[#FF5A1F] text-white flex items-center justify-center shadow-md shadow-orange-500/20 relative overflow-hidden flex-shrink-0 select-none ${className}`}
      aria-label="Cat Logo"
    >
      <svg
        viewBox="0 0 36 36"
        fill="currentColor"
        className="w-[82%] h-[82%] text-white"
      >
        {/* Cat Left Ear */}
        <polygon points="7,7 15,16 6,17" fill="#FFF8F0" />
        <polygon points="8,9 13,15 7,15.5" fill="#FFA570" />

        {/* Cat Right Ear */}
        <polygon points="29,7 21,16 30,17" fill="#FFF8F0" />
        <polygon points="28,9 23,15 29,15.5" fill="#FFA570" />

        {/* Cat Head Base */}
        <ellipse cx="18" cy="20" rx="12" ry="10" fill="#FFF8F0" />

        {/* Cat Cheeks Soft Blush */}
        <ellipse cx="10" cy="23" rx="2" ry="1.2" fill="#FFA07A" opacity="0.6" />
        <ellipse cx="26" cy="23" rx="2" ry="1.2" fill="#FFA07A" opacity="0.6" />

        {/* Cat Eyes */}
        <ellipse cx="13.5" cy="18" rx="1.8" ry="2.3" fill="#202026" />
        <ellipse cx="22.5" cy="18" rx="1.8" ry="2.3" fill="#202026" />

        {/* Eye Sparkles */}
        <circle cx="14.2" cy="17.2" r="0.7" fill="#FFFFFF" />
        <circle cx="23.2" cy="17.2" r="0.7" fill="#FFFFFF" />

        {/* Nose */}
        <polygon points="18,21.5 16.6,20 19.4,20" fill="#FF5A1F" />

        {/* Mouth */}
        <path
          d="M16.5 22.5 Q18 24 18 21.5 Q18 24 19.5 22.5"
          stroke="#202026"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Whiskers */}
        <line x1="6" y1="19.5" x2="11.5" y2="20.5" stroke="#202026" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="6.5" y1="22.5" x2="11.5" y2="22" stroke="#202026" strokeWidth="0.9" strokeLinecap="round" />

        {/* Right Whiskers */}
        <line x1="30" y1="19.5" x2="24.5" y2="20.5" stroke="#202026" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="29.5" y1="22.5" x2="24.5" y2="22" stroke="#202026" strokeWidth="0.9" strokeLinecap="round" />
      </svg>
    </div>
  );
};
