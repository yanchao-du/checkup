import React from 'react';

interface InlineErrorProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineError({ children, className = '' }: InlineErrorProps) {
  return (
    <p className={`text-xs text-red-600 mt-1 ${className}`}>{children}</p>
  );
}
