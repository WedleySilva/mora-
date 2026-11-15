import { useState } from 'react';
import { Home } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EAF1F4] via-[#F5F6F7] to-[#FEF5E7] text-[#123F52] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Home className="w-8 h-8 mb-2 opacity-60" />
        <span className="text-xs font-medium text-[#737B80] line-clamp-2 max-w-[200px]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
}
