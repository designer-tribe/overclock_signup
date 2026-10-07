/**
 * Overclock lockup: mark plus wordmark.
 *
 * The mark here is drawn from the design comp, not from a supplied brand asset —
 * treat it as a stand-in and replace it with the official SVG when that lands.
 * The wordmark is set in the page's serif so it tracks the rest of the type.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 text-ink ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 shrink-0"
        fill="none"
        aria-hidden
      >
        {/* Outer ring */}
        <circle cx="16" cy="16" r="14.2" stroke="currentColor" strokeWidth="1.8" />
        {/* Inner crescent: a filled disc with a second disc punched out of it. */}
        <mask id="overclock-mark-crescent">
          <rect width="32" height="32" fill="black" />
          <circle cx="16" cy="16" r="9.6" fill="white" />
          <circle cx="23.5" cy="8.5" r="9.6" fill="black" />
        </mask>
        <circle
          cx="16"
          cy="16"
          r="9.6"
          fill="currentColor"
          mask="url(#overclock-mark-crescent)"
        />
      </svg>

      <span className="font-serif text-[1.65rem] leading-none tracking-tight">
        Overclock
      </span>
    </div>
  );
}
