"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
} from "@floating-ui/react";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";

export function ChartInfoPopover() {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(8), flip()],
    placement: "right-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setOpen(false), 3000);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="차트 출처 안내 보기"
        aria-expanded={open}
        ref={refs.setReference}
        {...getReferenceProps()}
        className="p-1 rounded-full hover:bg-gray-40 active:bg-gray-30 duration-150 transition-colors ease-in-out"
      >
        <Info size={14} color="#b294ee" />
      </button>

      <FloatingPortal>
        <AnimatePresence>
          {open && (
            <div
              // eslint-disable-next-line react-hooks/refs
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className="z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="w-52 rounded-xl border border-gray-20 bg-gray-40 p-3"
              >
                <p className="typo-label font-light leading-relaxed text-content-muted">
                  이 차트는 TJ미디어의 J-POP TOP 100 데이터를 기반으로
                  제공됩니다.
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}
