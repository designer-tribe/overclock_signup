"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Lenis driven off GSAP's ticker, with ScrollTrigger kept in sync.
 *
 * Two independent requestAnimationFrame loops (Lenis' own, plus GSAP's) drift
 * apart, which shows up as scroll-linked animations lagging a frame behind the
 * scroll itself. Driving Lenis from `gsap.ticker` keeps them on one clock.
 *
 * On the current single-section page this is effectively inert — there is almost
 * nothing to scroll. It is here so that the moment the page grows taller,
 * scroll-linked work behaves correctly without retrofitting the setup.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Smoothing hijacks the scroll the OS was asked to calm down, so opt out.
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Slight ease-out; the default is fine but this reads a touch less floaty.
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Native touch scrolling is better than anything we'd simulate.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      // GSAP's ticker reports seconds, Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    // GSAP's own lag smoothing fights Lenis' interpolation.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
