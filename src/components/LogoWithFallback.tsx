'use client';

import { useState } from 'react';

interface LogoWithFallbackProps {
  src: string;
  alt: string;
  /** CSS class for the img element (e.g. "w-full h-full object-contain") */
  className?: string;
  /** Font size class for the fallback letter (e.g. "text-base", "text-xl", "text-3xl") */
  fallbackSize?: string;
}

/**
 * Renders an <img> that gracefully falls back to a styled initial letter
 * when the image fails to load. Uses React state instead of DOM manipulation.
 */
export default function LogoWithFallback({
  src,
  alt,
  className = 'w-full h-full object-contain',
  fallbackSize = 'text-base',
}: LogoWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <span className={`${fallbackSize} font-extrabold text-slate-500`}>
        {alt?.charAt(0) || '?'}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
