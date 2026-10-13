import React from 'react';

/**
 * Global SVG Pattern Definitions for Subtle Architectural Girih Geometry.
 * Mounted once at the root of the app.
 */
export const IslamicPatternDefs: React.FC = () => (
  <svg className="w-0 h-0 absolute pointer-events-none" aria-hidden="true">
    <defs>
      <pattern
        id="islamic-girih-subtle"
        x="0"
        y="0"
        width="64"
        height="64"
        patternUnits="userSpaceOnUse"
      >
        <g stroke="#0B5D46" strokeWidth="0.5" fill="none" opacity="0.035">
          <path d="M32 0 L48 16 L64 16 L64 48 L48 48 L32 64 L16 48 L0 48 L0 16 L16 16 Z" />
          <polygon points="32,8 39,25 56,32 39,39 32,56 25,39 8,32 25,25" />
          <circle cx="32" cy="32" r="4" stroke="#B8955A" strokeWidth="0.5" />
        </g>
      </pattern>

      <pattern
        id="mashrabiya-header-pattern"
        x="0"
        y="0"
        width="48"
        height="48"
        patternUnits="userSpaceOnUse"
      >
        <g stroke="#D4B886" strokeWidth="0.5" fill="none" opacity="0.08">
          <polygon points="24,2 30,18 46,24 30,30 24,46 18,30 2,24 18,18" />
          <circle cx="24" cy="24" r="3.5" />
        </g>
      </pattern>
    </defs>
  </svg>
);

export const KhatimCornerOrnament: React.FC<{
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}> = ({ position }) => {
  const posClasses = {
    'top-right': 'top-1.5 right-1.5 rotate-0',
    'top-left': 'top-1.5 left-1.5 -scale-x-100',
    'bottom-right': 'bottom-1.5 right-1.5 -scale-y-100',
    'bottom-left': 'bottom-1.5 left-1.5 scale-[-1]',
  }[position];

  return (
    <svg
      viewBox="0 0 28 28"
      className={`w-4 h-4 absolute pointer-events-none text-[#B8955A]/30 ${posClasses}`}
      aria-hidden="true"
    >
      <path
        d="M26 2 H10 L2 10 V26"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
};

export const KhatimStarEmblem: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4 text-[#0B5D46]',
}) => (
  <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden="true">
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      transform="rotate(45 12 12)"
      fill="none"
      stroke="#B8955A"
      strokeWidth="1.5"
    />
  </svg>
);

/**
 * Clean Hairline Divider for Section & Chart Headers
 */
export const GirihHeaderBorder: React.FC = () => (
  <div
    className="w-full h-px bg-[#E6DFD1] my-2.5"
    aria-hidden="true"
  />
);

/**
 * Single-Elevation Surface Wrapper.
 * Follows the Single-Elevation Depth rule: flat surface with a 1px hairline border (`border-[#DFD8C8]`), no drop-shadow + border combo.
 */
export const IslamicChartCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  highlightBorder?: boolean;
}> = ({ children, className = '', highlightBorder = false }) => {
  const tokens = className.trim().split(/\s+/).filter(Boolean);
  const outerGridTokens: string[] = [];
  const innerContentTokens: string[] = [];

  for (const token of tokens) {
    if (
      token.includes('col-span-') ||
      token.includes('row-span-') ||
      token.includes('order-') ||
      token.includes('self-')
    ) {
      outerGridTokens.push(token);
    } else {
      innerContentTokens.push(token);
    }
  }

  return (
    <section
      className={`relative w-full min-w-0 bg-[#FDFCF9] rounded-xl border ${
        highlightBorder ? 'border-[#0B5D46]/35' : 'border-[#DFD8C8]'
      } overflow-hidden ${outerGridTokens.join(' ')}`}
    >
      <div className={`relative z-10 w-full min-w-0 ${innerContentTokens.join(' ')}`}>
        {children}
      </div>
    </section>
  );
};
