# Overclock — Webinar Signup

Landing page satu-section untuk peserta webinar Overclock: sign-up + penjadwalan
sesi 1-on-1.

Layout section-nya sudah mengikuti desain yang disetujui: headline + portrait di
kiri, intro + form di kanan. Semua aset brand sudah aslinya.

Figur CRT-head adalah **video yang di-scrub mouse**: videonya tidak pernah
autoplay, gerakan mouse horizontal yang menarik playhead-nya. Lihat
`components/hero/HeroVisual.tsx`.

Tidak ada WebGL yang ter-mount saat ini. Paketnya tetap terpasang untuk pekerjaan
3D berikutnya.

## Stack

| Layer | Paket |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` di `app/globals.css`) |
| Animasi | GSAP 3.15 + `@gsap/react` — ScrollTrigger & SplitText sudah gratis di paket publik |
| 3D / WebGL | three · `@react-three/fiber` v9 · drei · postprocessing — terpasang, belum dipakai |
| Smooth scroll | Lenis, didorong dari `gsap.ticker` |
| Form | react-hook-form + Zod (satu skema dipakai client **dan** server) |

**Hanya satu library animasi: GSAP.** Jangan menambah Motion/Framer Motion —
dua timeline engine di satu halaman menimbulkan konflik timing yang sulit dilacak.

## Menjalankan

```bash
pnpm install
cp .env.example .env.local
pnpm dev          # http://localhost:3000
```

```bash
pnpm build        # build produksi
pnpm lint
pnpm exec tsc --noEmit
```

## Struktur

```
app/
  page.tsx            Satu-satunya route — single section
  actions.ts          Server Action submitSignup()
  globals.css         Token brand + styling field (dotted → solid underline)
components/
  hero/HeroCopy.tsx   Reveal headline per baris (SplitText + mask)
  hero/HeroVisual.tsx Video figur + scrub mengikuti mouse
  brand/Logo.tsx      Lockup Overclock (aset asli, di-inline)
  form/               SignupForm · Field
providers/
  SmoothScrollProvider.tsx
hooks/
  usePointer.ts       Posisi pointer di ref — bukan state, supaya tidak re-render
  useReducedMotion.ts
  useToday.ts
lib/
  gsap.ts             Registrasi plugin terpusat — selalu import dari sini
  schema.ts           signupSchema (Zod)
  storage/            Adapter tujuan data signup
```

## Aturan yang menjaga stack ini tetap waras

- **Import `gsap` dari `@/lib/gsap`**, tidak pernah dari `"gsap"` langsung.
  Plugin disentuh `document` saat import, jadi harus terkurung di satu modul client.
- **Pakai `useGSAP()`**, bukan `useEffect` manual — cleanup/revert otomatis, dan
  itu yang bikin aman di React 19 Strict Mode.
- **Jangan taruh nilai per-frame di `useState`.** Pointer, scroll progress, dan
  sejenisnya masuk ke `useRef` lalu dibaca di dalam `useFrame`.
- **Apa pun yang menyentuh `window`/`document` saat render** harus di balik
  `HeroCanvas` (client boundary) atau sebuah hook client.
- **Setiap animasi wajib punya jalur reduced-motion.** Lihat `useReducedMotion`.

## Penyimpanan data signup

Tujuan data belum final, jadi `submitSignup` tidak tahu apa-apa soal backend —
ia hanya memanggil `getSignupStore().save(...)`.

- `SIGNUP_STORAGE=console` (default) — hanya log, **tidak menyimpan apa pun**.
- `SIGNUP_STORAGE=sheets` — append ke Google Sheets. Implementasinya ada di
  `lib/storage/sheets.ts`, lengkap dengan langkah setup service account.

> Adapter Sheets belum pernah dijalankan dengan kredensial asli — tujuannya masih
> ditentukan saat kode itu ditulis. Perlakukan run pertama sebagai pengujian.

Menambah tujuan baru = satu file di `lib/storage/` + daftarkan di `index.ts`.
Tidak ada komponen atau action yang perlu disentuh.

## Yang belum dikerjakan

- **Animasi halaman.** Entrance headline dan form masih baseline sederhana;
  motion pass belum dikerjakan.
- **Proteksi spam.** Form ini publik; sebelum live sebaiknya ditambah honeypot
  atau rate limit.
- `robots` masih `noindex` di `app/layout.tsx` — lepas saat siap publik.

## Video figur (scrub)

`public/monitor-scrub.{mp4,webm}` bukan file asli — sudah diproses ulang:

```bash
ffmpeg -i <sumber>.mp4 \
  -vf "colorlevels=romax=0.98413:gomax=0.98400:bomax=0.97571,scale=-2:1200" \
  -c:v libx264 -preset slow -crf 26 \
  -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p -an -movflags +faststart public/monitor-scrub.mp4
```

Dua hal penting kalau videonya diganti:

- **`-g 1` wajib.** File aslinya hanya punya satu keyframe untuk 5 detik penuh,
  jadi tiap seek harus decode maju dari frame 0 dan scrub-nya tersendat. Dengan
  semua frame jadi keyframe, seek praktis gratis — dan filenya justru lebih
  kecil karena sekalian di-downscale.
- **Filter `colorlevels` menggeser latar video ke `--color-paper`.** Videonya
  tidak punya alpha; aslinya duduk di `#fcfaf7` sementara halaman `#f8f6f1`.
  Angka filternya = target ÷ sumber per kanal. Kalau palet halaman berubah,
  hitung ulang.

MP4 ditaruh lebih dulu dari WebM: pada encoding all-intra, x264 menghasilkan file
lebih kecil daripada VP9 (2.4MB lawan 4.6MB). WebM hanya fallback untuk build
tanpa H.264.
