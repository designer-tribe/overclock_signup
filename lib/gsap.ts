/**
 * Single place where GSAP plugins get registered.
 *
 * Import `gsap` from here — never from "gsap" directly. Registering the same
 * plugin from several modules is harmless but makes it impossible to tell which
 * plugins the app actually relies on, and the plugin files touch `document` at
 * import time, so they must stay out of server-rendered modules.
 *
 * Since GSAP 3.13 every plugin ships in the public package, so there is no
 * bonus-plugin registry or license token to thread through here.
 */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

  // Studio-style defaults. Set once so individual tweens stay terse and the
  // page keeps a consistent feel; override per-tween where a moment needs it.
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export { gsap, useGSAP, ScrollTrigger, SplitText };
