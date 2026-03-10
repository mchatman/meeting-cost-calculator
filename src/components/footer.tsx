export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-mauve-light/30 py-10">
      {/* Decorative blob */}
      <div
        className="blob blob-mauve pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 opacity-60"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center">
        <div className="mx-auto mb-4 w-20 accent-bar" />
        <p className="text-sm font-medium tracking-wide text-navy/50">
          Know the true cost of your meetings.
        </p>
        <p className="mt-1 text-xs text-navy/40">
          Built with intent. Every second counts.
        </p>
      </div>
    </footer>
  );
}
