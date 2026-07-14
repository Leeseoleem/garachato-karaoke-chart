"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeHover(cb: () => void) {
  const mq = window.matchMedia(HOVER_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

// 가로 스크롤 컨테이너.
// - arrows: 마우스 있는 데스크탑에서 좌우 화살표 버튼으로 클릭해서 넘기기.
// - 휠 하이재킹은 하지 않음(캐러셀은 화살표로 넘김). 터치 스와이프·트랙패드·shift+휠은 네이티브 그대로.
export default function HScroll({
  children,
  className,
  arrows = false,
}: {
  children: ReactNode;
  className?: string;
  arrows?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hoverable = useSyncExternalStore(
    subscribeHover,
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!arrows) return;
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setCanPrev(el.scrollLeft > 1);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();

    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [arrows]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const row = (
    <div ref={ref} className={className}>
      {children}
    </div>
  );

  if (!arrows) return row;

  return (
    <div className="relative">
      {row}
      {hoverable && (
        <>
          <Arrow dir="prev" show={canPrev} onClick={() => page(-1)} />
          <Arrow dir="next" show={canNext} onClick={() => page(1)} />
        </>
      )}
    </div>
  );
}

function Arrow({
  dir,
  show,
  onClick,
}: {
  dir: "prev" | "next";
  show: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "이전" : "다음"}
      onClick={onClick}
      className={clsx(
        "glass-static absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-opacity",
        dir === "prev" ? "left-2" : "right-2",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon size={18} color="#ffffff" />
    </button>
  );
}
