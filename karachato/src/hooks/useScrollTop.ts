import { useRef, useState, useEffect } from "react";

export function useScrollTop() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBottom, setIsBottom] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setIsScrolled(el.scrollTop > 100);
      // scrollHeight - scrollTop - clientHeight 가 threshold 이하면 바닥
      setIsBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
    };

    handleScroll();

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrollRef, isScrolled, isBottom };
}
