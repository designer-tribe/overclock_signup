# Overclock — Webinar Signup

Landing page satu-section untuk peserta webinar Overclock: sign-up + penjadwalan
sesi 1-on-1.

Layout section-nya sudah mengikuti desain yang disetujui: headline + portrait di
kiri, intro + form di kanan. Dua hal yang masih menunggu:

- **Foto portrait (CRT head) belum ada asetnya** — saat ini placeholder dengan
  aspect ratio yang benar. Lihat `components/hero/HeroVisual.tsx`.
- **Animasi dan elemen 3D belum dikerjakan** — yang ada baru entrance sederhana
  sebagai baseline.

## Stack

| Layer | Paket |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` di `app/globals.css`) |
| Animasi | GSAP 3.15 + `@gsap/react` — ScrollTrigger & SplitText sudah gratis di paket publik |
| 3D / WebGL | three · `@react-three/fiber` v9 · drei · postprocessing |
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
  hero/               HeroCanvas · HeroScene · Backdrop · shader — belum dipasang
  hero/HeroCopy.tsx   Reveal headline per baris (SplitText + mask)
  hero/HeroVisual.tsx Slot foto portrait (placeholder)
  brand/Logo.tsx      Lockup Overclock (aproksimasi)
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

- **Foto portrait.** Taruh cut-out di `public/hero-portrait.webp`, lalu ikuti
  instruksi di `components/hero/HeroVisual.tsx`.
- **Animasi & 3D.** Komponen WebGL (`HeroCanvas`, `HeroScene`, `Backdrop`) masih
  ada di repo tapi sengaja **tidak dipasang** di halaman — shader full-bleed
  tidak cocok untuk desain terang ini. Itu titik mulai untuk mark 3D di dalam
  layar CRT.
- **Logo masih aproksimasi.** `components/brand/Logo.tsx` digambar dari comp,
  bukan aset resmi. Ganti dengan SVG asli saat tersedia.
- **Proteksi spam.** Form ini publik; sebelum live sebaiknya ditambah honeypot
  atau rate limit.
- `robots` masih `noindex` di `app/layout.tsx` — lepas saat siap publik.
