// components/ui/CopyToClipboard.tsx
"use client";

import { ReactNode } from 'react';

interface CopyToClipboardProps {
  text: string;
  onCopy?: () => void;
  children: ReactNode;
}

export default function CopyToClipboard({ text, onCopy, children }: CopyToClipboardProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (onCopy) onCopy();
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div onClick={handleCopy} className="cursor-pointer">
      {children}
    </div>
  );
}