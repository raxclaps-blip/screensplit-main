import React from "react";

const Logo = () => {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="34"
        height="34"
        viewBox="0 0 34 34"
        role="img"
        aria-label="Animated gradient square with vertical bar"
      >
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff">
              <animate
                attributeName="stop-color"
                values="#ffffff;#d1d5db;#ffffff"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#9ca3af">
              <animate
                attributeName="stop-color"
                values="#9ca3af;#6b7280;#9ca3af"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="32"
          height="32"
          rx="6"
          ry="6"
          fill="url(#grad)"
        />

        <rect x="15" y="8" width="2" height="16" rx="1" ry="1" fill="#000000">
          <animate
            attributeName="height"
            values="8;16;8"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="12;8;12"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </div>
  );
};

export default Logo;
