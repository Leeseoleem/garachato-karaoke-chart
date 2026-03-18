"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ROUTES } from "@/constants/routes";

interface BackButtonProps {
  fallback?: string;
}

export default function BackButton({
  fallback = ROUTES.HOME,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };

  return (
    <button
      type="button"
      className="p-1 rounded-full hover:bg-brand-main/20 active:bg-brand-main/40 transform duration-150 ease-in-out"
      onClick={handleBack}
      aria-label="뒤로가기"
    >
      <ChevronLeft size={24} color="#B294EE" />
    </button>
  );
}
