# Overclock — Webinar Signup

Landing page satu-section untuk peserta webinar Overclock: sign-up + penjadwalan
sesi 1-on-1.

Ada **dua variasi desain** yang sedang ditinjau. Pemilihnya ada di panel kiri
layar; pilihannya disimpan di URL (`?v=2`) sehingga bisa dikirim sebagai tautan.

1. **Studio** — latar paper, figur CRT yang di-scrub mouse.
2. **Workplace** — foto full-bleed yang digelapkan, form di atasnya.

Keduanya memakai `SignupForm` dan `HeroCopy` yang sama; yang berbeda hanya
permukaannya.

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
  variants/           VariantOne (Studio) · VariantTwo (Workplace)
  variations/         Switcher + panel pemilih (modal <dialog>)
  hero/HeroCopy.tsx   Reveal headline per baris (SplitText + mask)
  hero/HeroVisual.tsx Video figur + scrub mengikuti mouse — hanya di variation 1
  brand/Logo.tsx      Lockup Overclock (aset asli, di-inline)
  form/               SignupForm · Field
providers/
  SmoothScrollProvider.tsx
hooks/
  usePointer.ts       Posisi pointer di ref — bukan state, supaya tidak re-render
  useReducedMotion.ts
  useToday.ts
lib/
  variations.ts       Daftar variasi + state-nya (dibaca dari URL)
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

`public/monitor-scrub.{mp4,webm}` bukan file asli — diproses ulang lewat
`scripts/key-video.py` + ffmpeg. Tiga hal yang dilakukan, dan ketiganya penting:

1. **Latar di-key lalu di-composite ulang ke warna paper.** Video tidak punya
   alpha. Latar aslinya bergeser 2–3 level antar-frame dan punya vignette 4–7
   level dalam satu frame — itu yang terlihat sebagai "latar menerang di
   beberapa frame". Koreksi warna statis tidak bisa menuntaskannya, jadi latar
   dipisahkan dulu (flood-fill dari tepi + pemulihan berbasis warna untuk celah
   antar kabel), baru di-composite ke satu warna datar.
2. **`-g 1` wajib.** File aslinya hanya punya satu keyframe untuk 5 detik penuh,
   jadi tiap seek harus decode maju dari frame 0 dan scrub-nya tersendat.
3. **Warna composite dikompensasi.** Round-trip RGB → yuv420 → RGB menggeser
   nilai beberapa level, dan browser menggeser berbeda dari ffmpeg. Angka di
   script (247, 246, 241) adalah hasil kalibrasi terhadap **decode browser**,
   bukan nilai token mentah. Kalau palet berubah, kalibrasi ulang dengan
   mengukur di browser, bukan dengan menyalin token.

```bash
python3 scripts/key-video.py <sumber>.mp4 public/
```

MP4 ditaruh lebih dulu dari WebM: pada encoding all-intra, x264 menghasilkan file
lebih kecil daripada VP9 (2.1MB lawan 2.6MB). WebM hanya fallback untuk build
tanpa H.264 — termasuk Chromium headless, yang tidak bisa decode H.264 sama
sekali, jadi **jalur MP4 tidak pernah terverifikasi otomatis**; cek manual di
browser kalau videonya diganti.

Versi beralpha (VP9 `yuva420p`) juga sudah diuji dan berfungsi, tapi tidak
dipakai: ukurannya 5.5MB lawan 2.1MB untuk hasil visual yang sama di atas latar
datar. Kalau figur ini nanti dipakai di atas latar bergradasi atau berwarna,
itu jalur yang benar — script-nya sudah menghasilkan frame RGBA.
