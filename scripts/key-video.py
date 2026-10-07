#!/usr/bin/env python3
"""
Prepare the hero figure video for mouse scrubbing.

    python3 scripts/key-video.py <source>.mp4 public/ [--keep-rgba]

Produces monitor-scrub.mp4, monitor-scrub.webm and monitor-scrub-poster.webp.

Three things happen here, and each one fixes a specific defect in the source:

1. The backdrop is keyed out and composited back onto a single flat colour.
   The footage has no alpha, and its backdrop both drifts 2-3 levels between
   frames and carries a 4-7 level vignette within a frame. That shifting
   mismatch against the page is what reads as "the background brightens on some
   frames". A static colour correction cannot fix it, because the variation is
   not constant — so the backdrop is separated out and replaced wholesale.

   The key is by connectivity, not luma: the t-shirt is as bright as the
   backdrop, so a luma key would punch holes in the figure. Near-white pixels
   that reach the top/left/right edge are backdrop. The bottom edge is not a
   seed because the figure is cropped there and touches it.

   Connectivity alone leaves the gaps between the monitor's cables opaque —
   backdrop, but walled in by the cables. Those are recovered by colour: a
   small near-white region whose mean matches the border backdrop is backdrop
   wherever it sits. That rule cannot eat the figure, since the t-shirt never
   passes the near-white threshold to begin with.

2. Every frame is encoded as a keyframe. The original carried one keyframe for
   the whole clip, so each seek had to decode forward from frame 0 and
   scrubbing crawled.

3. The composite colour is calibrated against the *browser's* decode, not the
   design token. RGB -> yuv420 -> RGB shifts values by a few levels, and
   browsers shift differently from ffmpeg. PAPER below is the value that lands
   on #f8f6f1 once Chrome has decoded it. If the palette changes, re-measure in
   a browser rather than copying the new token in here.

Intermediates are deleted unless --keep-rgba is passed, which leaves the RGBA
frames behind. Those are what an alpha encode would need, if the figure ever has
to sit on something other than a flat colour:

    ffmpeg -framerate 24 -i .rgba-frames/%03d.png -c:v libvpx-vp9 \
      -pix_fmt yuva420p -crf 34 -b:v 0 -g 1 -keyint_min 1 \
      -lag-in-frames 0 -auto-alt-ref 0 -an alpha.webm
"""
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HEIGHT = 1200          # working height; the clip is displayed well under this
WEBM_HEIGHT = 1000     # the fallback can afford to be smaller
FRAMERATE = 24

WHITE = 222            # min(R,G,B) above this is candidate backdrop
COLOR_TOL = 14.0       # RGB distance from the border backdrop to count as backdrop
MAX_PATCH = 0.02       # ...and no larger than this share of the frame
FEATHER = 1.1          # px of blur on the mask, against a stair-stepped cut-out

# Calibrated so Chrome decodes the backdrop to #f8f6f1 (--color-paper).
PAPER = (247, 246, 241)


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def key_frame(path: Path) -> tuple[np.ndarray, np.ndarray]:
    rgb = np.array(Image.open(path).convert("RGB"))
    floats = rgb.astype(np.float32)
    height, width, _ = rgb.shape

    candidate = rgb.min(axis=2) > WHITE
    labels, count = ndimage.label(candidate)

    seeds = set(labels[0, :]) | set(labels[:, 0]) | set(labels[:, -1])
    seeds.discard(0)
    backdrop = np.isin(labels, list(seeds))

    reference = floats[backdrop].mean(0)
    for label in range(1, count + 1):
        if label in seeds:
            continue
        patch = labels == label
        size = patch.sum()
        if size < 50 or size > MAX_PATCH * height * width:
            continue
        if np.linalg.norm(floats[patch].mean(0) - reference) < COLOR_TOL:
            backdrop |= patch

    alpha = np.where(backdrop, 0, 255).astype(np.uint8)
    alpha = np.array(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(FEATHER)))
    return rgb, alpha


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    keep_rgba = "--keep-rgba" in sys.argv
    if len(args) != 2:
        print(__doc__)
        return 2

    source, out_dir = Path(args[0]), Path(args[1])
    if not source.exists():
        print(f"source not found: {source}")
        return 1
    out_dir.mkdir(parents=True, exist_ok=True)

    work = out_dir / ".work-frames"
    rgba_dir = out_dir / ".rgba-frames"
    flat_dir = out_dir / ".flat-frames"
    for d in (work, rgba_dir, flat_dir):
        shutil.rmtree(d, ignore_errors=True)
        d.mkdir()

    print("extracting frames...")
    run("ffmpeg", "-v", "error", "-i", str(source), "-vf", f"scale=-2:{HEIGHT}",
        str(work / "%03d.png"), "-y")

    frames = sorted(work.glob("*.png"))
    print(f"keying {len(frames)} frames...")
    backdrop_colour = Image.new("RGBA", (1, 1), PAPER + (255,))
    for index, frame in enumerate(frames, start=1):
        rgb, alpha = key_frame(frame)
        rgba = Image.fromarray(np.dstack([rgb, alpha]))
        rgba.save(rgba_dir / f"{index:03d}.png")
        flat = Image.alpha_composite(backdrop_colour.resize(rgba.size), rgba)
        flat.convert("RGB").save(flat_dir / f"{index:03d}.png")

    print("encoding mp4 (all-intra)...")
    run("ffmpeg", "-v", "error", "-framerate", str(FRAMERATE),
        "-i", str(flat_dir / "%03d.png"),
        "-c:v", "libx264", "-preset", "slow", "-crf", "26",
        "-g", "1", "-keyint_min", "1", "-sc_threshold", "0", "-bf", "0",
        "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart",
        str(out_dir / "monitor-scrub.mp4"), "-y")

    print("encoding webm fallback (all-intra)...")
    run("ffmpeg", "-v", "error", "-framerate", str(FRAMERATE),
        "-i", str(flat_dir / "%03d.png"),
        "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0",
        "-g", "1", "-keyint_min", "1", "-lag-in-frames", "0", "-auto-alt-ref", "0",
        "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
        "-vf", f"scale=-2:{WEBM_HEIGHT}", "-pix_fmt", "yuv420p", "-an",
        str(out_dir / "monitor-scrub.webm"), "-y")

    print("writing poster...")
    run("ffmpeg", "-v", "error", "-i", str(out_dir / "monitor-scrub.mp4"),
        "-vframes", "1", "-vf", "scale=-2:900", "-q:v", "80",
        str(out_dir / "monitor-scrub-poster.webp"), "-y")

    shutil.rmtree(work)
    shutil.rmtree(flat_dir)
    if keep_rgba:
        print(f"done. RGBA frames kept in {rgba_dir} for an alpha encode.")
    else:
        # They must not survive in public/ — they would be committed and served.
        shutil.rmtree(rgba_dir)
        print("done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
