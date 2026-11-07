import React from 'react';

interface SymbolProps {
  className?: string;
  size?: number | string;
  isWinning?: boolean;
}

/**
 * Pink X Symbol with thick black outline
 * Designed to match the vibrant neo-arcade / pop-art design spec.
 */
export const XSymbol: React.FC<SymbolProps> = ({
  className = '',
  size = '100%',
  isWinning = false,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: size, height: size }}
      className={`select-none transition-transform duration-300 drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] ${
        isWinning ? 'animate-bounce' : 'animate-pop-in'
      } ${className}`}
      aria-label="X"
    >
      <defs>
        {/* Soft gloss filter */}
        <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF409A" />
          <stop offset="100%" stopColor="#E60067" />
        </linearGradient>
      </defs>

      {/* Layer 1: Thick Black Outer Border */}
      <line
        x1="22"
        y1="22"
        x2="78"
        y2="78"
        stroke="#000000"
        strokeWidth="19"
        strokeLinecap="round"
      />
      <line
        x1="78"
        y1="22"
        x2="22"
        y2="78"
        stroke="#000000"
        strokeWidth="19"
        strokeLinecap="round"
      />

      {/* Layer 2: Vibrant Pink Body */}
      <line
        x1="22"
        y1="22"
        x2="78"
        y2="78"
        stroke="url(#pinkGradient)"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <line
        x1="78"
        y1="22"
        x2="22"
        y2="78"
        stroke="url(#pinkGradient)"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Layer 3: Subtle top gloss highlights */}
      <line
        x1="25"
        y1="25"
        x2="45"
        y2="45"
        stroke="#FFAAD4"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <line
        x1="75"
        y1="25"
        x2="55"
        y2="45"
        stroke="#FFAAD4"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
};

/**
 * Blue O Symbol with thick black outline
 * Vibrant electric blue with thick black contour and arcade gloss.
 */
export const OSymbol: React.FC<SymbolProps> = ({
  className = '',
  size = '100%',
  isWinning = false,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: size, height: size }}
      className={`select-none transition-transform duration-300 drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] ${
        isWinning ? 'animate-bounce' : 'animate-pop-in'
      } ${className}`}
      aria-label="O"
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Layer 1: Thick Black Outer Border */}
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="#000000"
        strokeWidth="19"
      />

      {/* Layer 2: Vibrant Blue Body */}
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="11"
      />

      {/* Layer 3: Top Curved Gloss Highlight */}
      <path
        d="M 32 30 A 28 28 0 0 1 68 30"
        fill="none"
        stroke="#BAE6FD"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
};

/**
 * Ghost preview of token for hover state
 */
export const GhostSymbol: React.FC<{ player: 'X' | 'O' }> = ({ player }) => {
  return (
    <div className="opacity-25 pointer-events-none scale-90 transition-transform">
      {player === 'X' ? <XSymbol /> : <OSymbol />}
    </div>
  );
};
