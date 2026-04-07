"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ban, RotateCcw } from "lucide-react";

export default function SongError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

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

      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-90 flex flex-row items-center gap-4">
        <button className="shrink-0 flex justify-center items-center w-12 h-12 border border-brand-main rounded-full hover:bg-gray-40 active:bg-gray-30 duration-150 transition-colors ease-in-out">
          <RotateCcw color="#7c5cbf" />
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 text-label text-brand-light border border-brand-main rounded-full h-12 hover:bg-gray-40 active:bg-gray-30 duration-150 transition-colors ease-in-out"
        >
          메인 화면으로
        </button>
      </div>
    </div>
  );
}
