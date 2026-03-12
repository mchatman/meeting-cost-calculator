import { MeetingCreator } from "@/components/meeting-creator";
import { HomeCta } from "@/components/home-cta";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ── Decorative blobs ── */}
      <div
        className="blob blob-mauve absolute -right-20 top-10 h-72 w-72 sm:h-96 sm:w-96"
        aria-hidden="true"
      />
      <div
        className="blob blob-pink absolute -left-16 top-40 h-52 w-52 sm:h-72 sm:w-72"
        aria-hidden="true"
      />
      <div
        className="blob blob-navy absolute bottom-20 right-10 h-40 w-40"
        aria-hidden="true"
      />

      {/* ── Hero section ── */}
      <div className="relative mx-auto max-w-4xl px-5 pt-16 sm:pt-28">
        <div className="animate-fade-in-up grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
          {/* Left: editorial text */}
          <div className="relative max-w-lg">
            {/* Organic blob backdrop behind hero text */}
            <svg
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute -left-24 -top-16 w-[130%] h-[110%]"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="hero-blob" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#d1aade" stopOpacity="0.22" />
                  <stop offset="45%" stopColor="#d1aade" stopOpacity="0.12" />
                  <stop offset="75%" stopColor="#fb6ec2" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#fb6ec2" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="260" cy="230" rx="220" ry="200" fill="url(#hero-blob)" />
            </svg>
            <p className="animate-fade-in-up animate-delay-1 mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-pink">
              Real-time meeting analytics
            </p>

            <h1 className="animate-fade-in-up animate-delay-2 text-5xl font-bold leading-[1.1] tracking-tight text-navy sm:text-6xl lg:text-7xl">
              How much
              <br />
              does your
              <br />
              <span className="text-brand-gradient italic">meeting</span>
              <br />
              cost?
            </h1>

            <p className="animate-fade-in-up animate-delay-3 mt-8 max-w-sm text-base leading-relaxed text-navy/50">
              Track the real-time cost of any meeting based on who&apos;s in the
              room. Every second has a price tag.
            </p>

            {/* Decorative element */}
            <div className="animate-fade-in-up animate-delay-4 mt-8 flex items-center gap-3">
              <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-navy/20 to-transparent" />
              <div className="nav-blob flex size-3 bg-mauve" />
              <div className="nav-blob flex size-2 bg-pink/60" style={{ animationDelay: "2s" }} />
            </div>
          </div>

          {/* Right: meeting creator card */}
          <div className="animate-fade-in-up animate-delay-3 pb-20 lg:pb-28">
            <MeetingCreator />
          </div>
        </div>

        {/* Calendar connection CTA */}
        <HomeCta />
      </div>
    </div>
  );
}
