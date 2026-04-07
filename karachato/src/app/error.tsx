"use client";

import { useEffect } from "react";
import { Ban } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-5 rounded-full bg-brand-dark">
          <Ban color="#7c5cbf" />
        </div>
        <p
          className="typo-title-02
         font-light text-content-muted text-center"
        >
          문제가 발생했어요.
        </p>
      </div>

      <button
        onClick={reset}
        className="absolute bottom-9 left-4 right-4 text-label text-brand-light border border-brand-main rounded-full h-12 max-w-90 mx-auto hover:bg-gray-40 active:bg-gray-30 duration-150 transition-colors ease-in-out"
      >
        다시 시도
      </button>
    </div>
  );
}
