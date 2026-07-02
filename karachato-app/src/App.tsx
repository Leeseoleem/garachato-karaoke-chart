function App() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-page flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-3xl font-bold text-content-primary">가라챠토</h1>
        <p className="text-content-secondary">노래방 J-POP 인기곡, 한글로 골라요</p>
      </div>

      <div className="flex gap-3">
        <span className="rounded-full bg-kara-tj-bg px-3 py-1 text-sm font-medium text-kara-tj-text">
          TJ
        </span>
        <span className="rounded-full bg-kara-ky-bg px-3 py-1 text-sm font-medium text-kara-ky-text">
          금영
        </span>
      </div>

      <div className="w-full rounded-2xl bg-gray-30 p-5 text-left">
        <p className="text-content-primary">스타일 파이프라인 렌더 확인</p>
        <p className="mt-1 text-sm text-content-secondary">
          Tailwind v4 · Pretendard · 브랜드 토큰
        </p>
        <p className="mt-3 font-semibold tabular-nums text-brand-light">
          01234 56789
        </p>
      </div>

      <button
        type="button"
        className="rounded-xl bg-brand-main px-6 py-2.5 font-medium text-gray-white transition-colors active:bg-brand-dark"
      >
        브랜드 버튼
      </button>

      <p className="text-xs text-content-secondary">appName: karachato</p>
    </main>
  )
}

export default App
