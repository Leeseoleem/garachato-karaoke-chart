"use client";

import { Sheet } from "react-modal-sheet";
import { X } from "lucide-react";

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  headerLabel: string;
  children: React.ReactNode;
}

export function ModalSheet({
  isOpen,
  onClose,
  headerLabel,
  children,
}: ModalSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} detent="content">
      <Sheet.Container className="max-h-dvh bg-gray-50! rounded-t-3xl border-[1.5px] border-brand-main border-b-0">
        <Sheet.Header />
        <div className="shrink-0 flex flex-row h-12 w-full px-5 items-center justify-between border-b border-gray-40">
          <h5 className="typo-subtitle text-content-primary">{headerLabel}</h5>
          <button
            className="flex justify-center items-center p-1 hover:bg-gray-10/20 active:bg-gray-10/40 transition-colors duration-150 rounded-full"
            onClick={onClose}
          >
            <X
              size={16}
              color="#F0EEFF"
              strokeWidth={1.5}
              absoluteStrokeWidth
            />
          </button>
        </div>
        <Sheet.Content scrollClassName="overflow-y-auto">
          {children}
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop
        className="backdrop-blur-xs! bg-black/40!"
        onTap={onClose}
      />
    </Sheet>
  );
}
