import React from 'react';

/**
 * LegalSeal Component (ตราช่างกฎหมาย / Scales of Justice Seal)
 * Used for top-left header brand logo and bottom-right floating chat widget logo.
 */
export default function LegalSeal({
  size = 32,
  color = '#7A1F2B',
  secondaryColor = '#B98A3D',
  showRing = true,
  style = {},
  className = ''
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    >
      {/* Outer Circle Ring / Seal Frame */}
      {showRing && (
        <>
          <circle cx="32" cy="32" r="30" stroke={color} strokeWidth="2" fill="none" opacity="0.85" />
          <circle cx="32" cy="32" r="26.5" stroke={secondaryColor} strokeWidth="1" strokeDasharray="3 2" opacity="0.75" />
        </>
      )}

      {/* Top Ornament Finial (Legal Crest Crown) */}
      <path d="M32 9 L35 15 H29 L32 9 Z" fill={secondaryColor} />
      <circle cx="32" cy="16.5" r="1.8" fill={color} />

      {/* Main Vertical Pillar */}
      <line x1="32" y1="16.5" x2="32" y2="48" stroke={color} strokeWidth="2.8" strokeLinecap="round" />

      {/* Central Fulcrum Diamond / Joint */}
      <polygon points="32,20.5 35,23.5 32,26.5 29,23.5" fill={secondaryColor} stroke={color} strokeWidth="1" />

      {/* Balance Beam (Curved Arch for classic legal scale look) */}
      <path d="M13 23.5 Q32 19 51 23.5" stroke={color} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <circle cx="13" cy="23.5" r="2" fill={secondaryColor} />
      <circle cx="51" cy="23.5" r="2" fill={secondaryColor} />

      {/* Left Hanging Chains */}
      <line x1="13" y1="23.5" x2="7.5" y2="38" stroke={color} strokeWidth="1.2" />
      <line x1="13" y1="23.5" x2="18.5" y2="38" stroke={color} strokeWidth="1.2" />

      {/* Left Scale Pan */}
      <path d="M5.5 38.5 Q13 44.5 20.5 38.5" fill={secondaryColor} fillOpacity="0.3" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="5.5" y1="38.5" x2="20.5" y2="38.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* Right Hanging Chains */}
      <line x1="51" y1="23.5" x2="45.5" y2="38" stroke={color} strokeWidth="1.2" />
      <line x1="51" y1="23.5" x2="56.5" y2="38" stroke={color} strokeWidth="1.2" />

      {/* Right Scale Pan */}
      <path d="M43.5 38.5 Q51 44.5 58.5 38.5" fill={secondaryColor} fillOpacity="0.3" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="43.5" y1="38.5" x2="58.5" y2="38.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />

      {/* Pedestal Base */}
      <path d="M24 48 H40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 51.5 H44" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="48" x2="26" y2="51.5" stroke={color} strokeWidth="1.5" />
      <line x1="36" y1="48" x2="38" y2="51.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
