/**
 * The closing block: the webinar takeaway pitch, and the file itself.
 *
 * The file row takes an optional `href`. Without one it renders as plain text
 * rather than a link — a row that looks clickable and goes nowhere is worse
 * than one that plainly is not ready yet, and the layout is identical either
 * way, so dropping the real file in later changes nothing but the markup.
 */

export function Takeaways({
  className = "",
  fileHref,
}: {
  className?: string;
  /** The take-away file. Omitted until the real asset is supplied. */
  fileHref?: string;
}) {
  return (
    <section className={className}>
      {/* Same hard offset shadow as the speaker block — see the note there. */}
      <div className="bg-sand p-6 shadow-[0_6px_0_0_var(--color-ink)] sm:p-8">
        <h2 className="max-w-sm font-serif text-xl leading-snug font-semibold text-ink sm:text-[1.6rem]">
          More People Leaders Want a Say in AI Strategy
        </h2>
        {/*
          Transcribed from the comp as it reads there. The sentence does not
          quite parse — flagged for final copy rather than silently rewritten,
          because guessing at someone's marketing line is not a fix.
        */}
        <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-ink/75">
          Over AI as a workforce decisions, take the webinar and these takeaways
          as you plan for your teams!
        </p>
      </div>

      <FileRow className="mt-8" href={fileHref} />
    </section>
  );
}

function FileRow({ className = "", href }: { className?: string; href?: string }) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-white">
        <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" fill="none" aria-hidden>
          <rect
            x="3"
            y="5.5"
            width="18"
            height="13"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M3.5 6.5 12 13l8.5-6.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-sans text-[0.95rem] font-medium">
        Take away file
      </span>
    </>
  );

  const shell =
    "flex items-center gap-4 border border-rule bg-white px-4 py-3 text-ink shadow-[0_6px_0_0_var(--color-ink)]";

  if (!href) {
    // No file yet. Dimmed so the state is visible in review rather than
    // looking like a link that happens to be broken.
    return (
      <p className={`${shell} opacity-60 ${className}`}>
        {content}
        <span className="sr-only"> — not yet available</span>
      </p>
    );
  }

  return (
    <a
      href={href}
      download
      className={`${shell} transition-colors hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none ${className}`}
    >
      {content}
    </a>
  );
}
