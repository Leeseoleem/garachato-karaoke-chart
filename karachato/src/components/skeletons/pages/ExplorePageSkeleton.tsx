import { AudioLines } from "lucide-react";
import BackHeader from "@/components/common/headers/BackHeader";
import { SkeletonBox } from "../SkeletonBox";
import { SkeletonText } from "../SkeletonText";

function CardSkeleton() {
  return (
    <div className="w-44 shrink-0 overflow-hidden rounded-xl bg-gray-30 sm:w-52 md:w-60">
      <SkeletonBox className="aspect-[16/9] w-full rounded-none" elevated />
      <div className="flex flex-col gap-2 p-4 sm:p-5">
        <SkeletonText className="h-4 w-4/5" elevated />
        <SkeletonText className="h-3 w-2/5" elevated />
        <SkeletonText className="h-3 w-1/3" elevated />
      </div>
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <section className="mt-9">
      <div className="flex items-center justify-between px-5 pb-4">
        <SkeletonText className="h-5 w-32" />
        <SkeletonText className="h-4 w-12" />
      </div>
      <div className="flex gap-4 overflow-hidden px-5 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// 탐색 홈 콘텐츠(캐러셀·카테고리·가수) 스켈레톤. 검색 헤더가 이미 있는 곳에서 사용.
export function ExploreContentSkeleton() {
  return (
    <>
      <CarouselSkeleton />
      <CarouselSkeleton />
      <CarouselSkeleton />
      <section className="mt-9">
        <SkeletonText className="mx-5 mb-3 h-5 w-20" />
        <div className="flex flex-wrap gap-2 px-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </section>
      <section className="mb-6 mt-9">
        <SkeletonText className="mx-5 mb-2 h-5 w-28" />
        <div className="px-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-gray-30 py-3"
            >
              <SkeletonBox className="h-10 w-10 rounded-full" />
              <SkeletonText className="h-4 w-32" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function RowSkeleton() {
  return (
    <div className="flex gap-4 border-b border-gray-30 px-5 py-5">
      <SkeletonBox className="h-16 w-16 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <SkeletonText className="h-4 w-1/2" />
        <SkeletonText className="h-3 w-1/3" />
        <SkeletonText className="h-3 w-11/12" />
        <div className="flex gap-2 pt-1">
          <SkeletonBox className="h-5 w-9 rounded-lg" />
          <SkeletonBox className="h-5 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// 상세 리스트(최근·상승·보컬로이드·카테고리·가수) 전용 스켈레톤. 헤더(뒤로가기+타이틀)·칩 고정 + 곡 행.
export function DetailListSkeleton({
  title,
  chips = false,
}: {
  title?: string;
  chips?: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BackHeader title={title} />
      {chips && (
        <div className="flex shrink-0 gap-2 px-5 py-3">
          {["w-14", "w-20", "w-24", "w-16"].map((w) => (
            <SkeletonBox key={w} className={`h-9 rounded-full ${w}`} />
          ))}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// 검색 헤더까지 포함한 전체 페이지 스켈레톤.
export function ExplorePageSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex h-25 w-full items-center gap-3 px-4">
        <div className="flex h-13 w-full items-center rounded-full bg-transparent px-5 pr-12 search-border">
          <p className="typo-body text-brand-main/60">
            원하는 곡을 검색해보세요!
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full glass">
          <AudioLines size={20} color="#ffffff" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden pb-6">
        <ExploreContentSkeleton />
      </div>
    </div>
  );
}
