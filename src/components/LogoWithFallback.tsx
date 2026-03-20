'use client';

import { useState } from 'react';

interface LogoWithFallbackProps {
  src: string;
  alt: string;
  /** CSS class for the img element (e.g. "w-full h-full object-contain") */
  className?: string;
  /** Font size class for the fallback letter (e.g. "text-base", "text-xl", "text-3xl") */
  fallbackSize?: string;
  /** Optional fallback image URL to try before showing the letter fallback */
  fallbackSrc?: string;
  /** Optional custom fallback element to render instead of the default letter */
  fallbackElement?: React.ReactNode;
  /** Optional explicit size in pixels (sets width and height via inline style) */
  size?: number;
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
  fallbackSrc,
  fallbackElement,
  size,
}: LogoWithFallbackProps) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const sizeStyle = size ? { width: size, height: size } : undefined;

  // Primary image failed, try fallback image
  if (error && fallbackSrc && !fallbackError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        style={sizeStyle}
        onError={() => setFallbackError(true)}
      />
    );
  }

  // Both images failed (or no fallbackSrc), show fallback element or letter
  if (error || !src) {
    if (fallbackElement) return <>{fallbackElement}</>;
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
      style={sizeStyle}
      onError={() => setError(true)}
    />
  );
}
