import React from 'react';

/**
 * Floating3DToolBadge: CSS 3D & SVG automotive elements with
 * realistic metallic gradients, perspective tilt, and floating animation.
 */
export function Floating3DGear({ size = 48, speed = 12, className = '' }) {
  return (
    <div
      className={`floating-3d-gear ${className}`}
      style={{
        width: size,
        height: size,
        animationDuration: `${speed}s`
      }}
    >
      <svg viewBox="0 0 100 100" className="gear-svg">
        <defs>
          <linearGradient id="gearMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#334155" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <filter id="gearShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>
        <path
          fill="url(#gearMetallic)"
          filter="url(#gearShadow)"
          d="M50 35 C41.7 35 35 41.7 35 50 C35 58.3 41.7 65 50 65 C58.3 65 65 58.3 65 50 C65 41.7 58.3 35 50 35 Z M94 45 L85 45 C84 41 82 37 80 34 L86 28 C87 27 87 25 86 24 L76 14 C75 13 73 13 72 14 L66 20 C63 18 59 16 55 15 L55 6 C55 4 53 3 51 3 L37 3 C35 3 33 4 33 6 L33 15 C29 16 25 18 22 20 L16 14 C15 13 13 13 12 14 L2 24 C1 25 1 27 2 28 L8 34 C6 37 4 41 3 45 L0 45 C0 47 0 49 0 51 L0 55 C0 57 1 59 3 59 L8 59 C9 63 11 67 13 70 L7 76 C6 77 6 79 7 80 L17 90 C18 91 20 91 21 90 L27 84 C30 86 34 88 38 89 L38 98 C38 100 40 101 42 101 L56 101 C58 101 60 100 60 98 L60 89 C64 88 68 86 71 84 L77 90 C78 91 80 91 81 90 L91 80 C92 79 92 77 91 76 L85 70 C87 67 89 63 90 59 L95 59 C97 59 98 57 98 55 L98 51 C98 49 97 47 94 45 Z"
        />
        <circle cx="50" cy="50" r="14" fill="#0f172a" />
      </svg>
    </div>
  );
}

export function Floating3DPiston({ size = 44, className = '' }) {
  return (
    <div className={`floating-3d-piston ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="piston-svg">
        <defs>
          <linearGradient id="pistonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#004f9c" />
          </linearGradient>
        </defs>
        <rect x="18" y="10" width="28" height="24" rx="3" fill="url(#pistonGrad)" />
        <rect x="14" y="16" width="36" height="3" fill="#ffffff" opacity="0.8" />
        <rect x="14" y="24" width="36" height="3" fill="#ffffff" opacity="0.8" />
        <rect x="28" y="34" width="8" height="20" rx="2" fill="#94a3b8" />
        <circle cx="32" cy="54" r="6" fill="#64748b" />
        <circle cx="32" cy="54" r="3" fill="#0f172a" />
      </svg>
    </div>
  );
}

