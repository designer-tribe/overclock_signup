"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The CRT-head figure, scrubbed by the mouse.
 *
 * The video never plays on its own. It is parked on frame 0, and horizontal
 * mouse movement drags the playhead: move right and it runs forward, move left
 * and it runs back. The monitor turning is baked into the footage, so what used
 * to be a CSS rotation of a flat cut-out is now real filmed motion.
 *
 * Two things were done to the source file to make this work (see the commit
 * message for the exact ffmpeg invocation):
 *
 * 1. It was re-encoded all-intra. The original had a single keyframe for the
 *    whole 5 seconds, so every seek had to decode forward from frame 0 and
 *    scrubbing crawled. Every frame is now a keyframe, which makes seeks
 *    effectively free. Counter-intuitively the file also got smaller, because
 *    it was downscaled at the same time.
 * 2. Its backdrop was colour-shifted onto `--color-paper`. The footage has no
 *    alpha and sat on #fcfaf7 against the page's #f8f6f1 — close enough to look
 *    like a mistake rather than a deliberate panel.
 */

/** Fraction of the clip traversed by dragging the full width of the window once. */
const SENSITIVITY = 0.8;

/** Below this, a further seek would not change a visible frame. */
const SEEK_EPSILON = 0.01;

export function HeroVisual({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mutable scrub state. Deliberately a ref: this updates on every mousemove
  // and none of it belongs in render.
  const scrub = useRef({ targetTime: 0, isSeeking: false, prevX: null as number | null });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    // Scrubbing is user-driven, but it is still motion. Leaving the first frame
    // up is the honest equivalent of the static portrait.
    if (prefersReducedMotion()) return;

    /**
     * The browser services one seek at a time; assigning `currentTime` while a
     * seek is in flight silently drops the request. So seeks are chained off
     * `seeked` instead: each completion checks whether the target has moved on
     * and, if so, fires the next one.
     */
    const seekToTarget = () => {
      const { targetTime } = scrub.current;
      if (Math.abs(video.currentTime - targetTime) <= SEEK_EPSILON) {
        scrub.current.isSeeking = false;
        return;
      }
      scrub.current.isSeeking = true;
      video.currentTime = targetTime;
    };

    const onMouseMove = (event: MouseEvent) => {
      const { duration } = video;
      // Metadata may not have landed yet, and duration is NaN until it does.
      if (!Number.isFinite(duration) || duration <= 0) return;

      const x = event.clientX / window.innerWidth;
      const previous = scrub.current.prevX;
      scrub.current.prevX = x;

      // The first event only establishes an origin — there is no delta yet, and
      // treating x as one would jump the playhead by wherever the cursor
      // happened to enter the window.
      if (previous === null) return;

      const offset = (x - previous) * SENSITIVITY * duration;
      scrub.current.targetTime = Math.min(
        duration,
        Math.max(0, scrub.current.targetTime + offset),
      );

      if (!scrub.current.isSeeking) seekToTarget();
    };

    video.addEventListener("seeked", seekToTarget);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      video.removeEventListener("seeked", seekToTarget);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/*
        Below lg this is a normal block in the stacked flow. From lg it fills
        the stretched grid cell, which runs from the top of the form card to the
        bottom of the page, so the figure's top sits level with the card and its
        bottom reaches the edge at any viewport height.

        `h-full` is the ceiling, not a starting point: the cell's top edge is
        also the headline's lower bound, so anything above 100% rides up over
        the headline.

        max-h caps the width that the height implies, since width follows the
        aspect ratio; without it a tall viewport grows the figure sideways until
        it reaches the form.

        The aspect ratio has to be declared because, unlike the image it
        replaced, the video gives the box no intrinsic size to grow from.
      */}
      <div className="relative mx-auto aspect-[986/1200] w-full max-w-[33rem] lg:absolute lg:bottom-0 lg:left-0 lg:mx-0 lg:h-full lg:max-h-[63vw] lg:w-auto lg:max-w-none">
        {/*
          preload="auto" on purpose: the whole clip has to be buffered before
          scrubbing feels instant, and a hero the visitor will immediately play
          with is the one case that earns an eager download.

          H.264 first, even though VP9 is the more modern codec: all-intra
          encoding strips out the inter-frame prediction VP9 wins on, so here
          x264 is the smaller file (2.4MB against 4.6MB at matched quality).
          The WebM is only a fallback for builds shipped without H.264 — some
          Linux Chromium packages, and the headless Chromium this was tested
          in, which cannot decode H.264 at all.
        */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          // 23KB still of frame 0, so the figure is up immediately instead of
          // leaving an empty panel for however long the clip takes to arrive.
          poster="/monitor-scrub-poster.webp"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/monitor-scrub.mp4" type="video/mp4" />
          <source src="/monitor-scrub.webm" type="video/webm" />
        </video>
      </div>
    </div>
  );
}
