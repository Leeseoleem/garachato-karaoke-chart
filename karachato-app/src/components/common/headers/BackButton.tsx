"use client";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { ROUTES } from "@/constants/routes";

interface BackButtonProps {
  fallback?: string;
}

export default function BackButton({
  fallback = ROUTES.HOME,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
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
