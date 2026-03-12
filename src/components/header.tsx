import Link from "next/link";

export function Header() {
  return (
    <header className="relative border-b border-mauve-light/30 bg-white/70 backdrop-blur-md">
      <div className="accent-bar" />

      <div className="relative mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
        <Link
          href="/"
          className="link-brand flex items-center gap-3 text-base font-semibold tracking-tight"
        >
          <span
            className="flex size-9 items-center justify-center bg-navy text-base font-bold text-white shadow-lg"
            style={{ borderRadius: "52% 48% 40% 60% / 55% 45% 55% 45%" }}
          >
            $
          </span>
          <span className="hidden sm:inline">Meeting Cost Calculator</span>
          <span className="sm:hidden">MCC</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="link-brand text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/50 hover:text-pink"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
