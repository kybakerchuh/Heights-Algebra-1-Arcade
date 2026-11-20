import { useState } from 'react';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export function ThumbnailImage({
  src,
  alt,
  title,
  className = '',
}: ThumbnailImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`relative w-full h-full bg-[#131317] flex flex-col items-center justify-center p-6 text-center overflow-hidden ${className}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 120 80"
          className="w-24 h-16 text-[#F5B700]/40 mb-3"
          fill="none"
        >
          <path
            d="M10 65 L110 65 M20 10 L20 75"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M25 58 Q60 12 105 22"
            stroke="#F5B700"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="62" cy="31" r="3.5" fill="#F5B700" />
        </svg>
        <span className="font-display text-lg font-bold text-[#F8F7F4] line-clamp-2">
          {title}
        </span>
      </div>
    );
  }

  const resolvedSrc = src.startsWith('/src/assets/')
    ? `${import.meta.env.BASE_URL}${src.slice(1)}`
    : src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
