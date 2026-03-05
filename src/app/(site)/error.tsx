"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h2 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] mb-4">
        Something went wrong
      </h2>
      <p className="text-[#666] text-sm max-w-md mb-8">
        We apologise for the inconvenience. Please try again or return to the
        homepage.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-[#C08A6F] text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-[#a8755c] transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="border border-[#1A1A1A]/20 text-[#1A1A1A] uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
