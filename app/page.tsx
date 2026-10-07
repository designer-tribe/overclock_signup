import { HeroCanvas } from "@/components/hero/HeroCanvas";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { SignupForm } from "@/components/form/SignupForm";

export default function Page() {
  return (
    <main className="relative isolate flex min-h-dvh w-full items-center overflow-hidden bg-[#0a0a12]">
      {/* Fallback wash — visible before the canvas mounts, and instead of it. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(130%_100%_at_15%_15%,#1d2b64_0%,#0a0a12_55%,#0a0a12_100%)]"
      />

      {/* Loaded client-side only: <Canvas> reaches for `document`. The gradient
          above is not a spinner — it is the permanent fallback for devices
          without WebGL, which the shader simply draws over when it can. */}
      <HeroCanvas />

      {/* Scrim: the shader animates, so copy contrast has to be guaranteed
          rather than hoped for at whatever the noise field happens to be. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#0a0a12]/85 via-[#0a0a12]/40 to-[#0a0a12]/70"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_minmax(380px,0.95fr)] lg:items-center lg:gap-16 lg:py-24">
        <HeroCopy />
        <SignupForm />
      </div>
    </main>
  );
}
