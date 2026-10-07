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
        Below lg this is a normal block in the stacked flow, where the declared
        aspect ratio gives the box a size — unlike the image it replaced, a
        video brings no intrinsic one.

        From lg the box is pinned to the stretched grid cell, which runs from
        the top of the form card to the bottom of the page, and takes its width
        from the viewport. The aspect ratio is dropped there on purpose, so the
        box can be wider than the clip — that mismatch is what makes
        `object-cover` crop the figure at the waist.

        The -10%/110% pair raises the figure without lifting it off the bottom
        edge: the top moves up a tenth of the cell and the height grows by the
        same tenth, so the lower edge stays exactly where it was. Shifting with
        a plain translate would drag the crop line up into view as a hard
        horizontal cut across the torso.

        Width is in vw rather than a fixed size because the form column also
        begins at roughly half the viewport, so anything absolute drifts into
        the card as the window narrows. The horizontal shift is a translate
        rather than a negative offset so it scales with that width.
      */}
      <div className="relative mx-auto aspect-[986/1200] w-full max-w-[33rem] lg:absolute lg:top-[-10%] lg:left-0 lg:mx-0 lg:aspect-auto lg:h-[110%] lg:w-[52vw] lg:max-w-none lg:-translate-x-[10%]">
        {/*
          preload="auto" on purpose: the whole clip has to be buffered before
          scrubbing feels instant, and a hero the visitor will immediately play
          with is the one case that earns an eager download.

          H.264 first, even though VP9 is the more modern codec: all-intra
          encoding strips out the inter-frame prediction VP9 wins on, so here
          x264 is the smaller file (2.1MB against 2.6MB here).
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
          // object-top, not the default centre: the box is wider than the clip,
          // so cover scales by width and the surplus height is trimmed — and it
          // has to come off the bottom, cropping the figure at the waist rather
          // than taking the top off its head.
          className="absolute inset-0 h-full w-full object-cover object-top"
        >
          <source src="/monitor-scrub.mp4" type="video/mp4" />
          <source src="/monitor-scrub.webm" type="video/webm" />
        </video>
      </div>
    </div>
  );
}
