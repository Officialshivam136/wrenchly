import React, { useRef, useState, useCallback } from 'react';

/**
 * Tilt3DCard: Wraps any UI element with physics-based 3D tilt,
 * specular glare highlight, and depth parallax.
 */
export default function Tilt3DCard({
  children,
  className = '',
  maxTilt = 12,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  style = {},
  onClick
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    isHovered: false
  });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransform({
      rotateX: Number(rotateX.toFixed(2)),
      rotateY: Number(rotateY.toFixed(2)),
      glareX: Number(glareX.toFixed(2)),
      glareY: Number(glareY.toFixed(2)),
      glareOpacity: 0.22,
      isHovered: true
    });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      rotateX: 0,
      rotateY: 0,
      glareOpacity: 0,
      isHovered: false
    }));
  }, []);

  const cardStyle = {
    ...style,
    transform: transform.isHovered
      ? `perspective(${perspective}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
      : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: transform.isHovered ? 'transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'transform 0.5s ease-out',
    transformStyle: 'preserve-3d',
    position: 'relative',
    willChange: 'transform'
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-3d-card ${className}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
      {glare && (
        <div
          className="tilt-3d-glare"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, ${transform.glareOpacity}) 0%, rgba(255, 255, 255, 0) 65%)`,
            transition: transform.isHovered ? 'background 0.05s ease-out' : 'background 0.4s ease-out',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
}

