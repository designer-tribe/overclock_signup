# Overclock — Webinar Landing

Landing page untuk peserta webinar Overclock: hero, profil pembicara, file
takeaway, dan form untuk meminta sesi lanjutan.

Ada **dua layout** yang sedang ditinjau. Pemilihnya ada di tab kiri layar —
klik untuk membuka panel pilihan. Pilihannya disimpan di URL (`?v=1` / `?v=2`)
sehingga bisa dikirim sebagai tautan.

1. **V1** — hero foto, profil pembicara, takeaway, dan kolom form yang sticky.
2. **V2** — form dipaku di hero, takeaway dan pembicara berdampingan.

Keduanya memakai form badge berpita yang sama (`NametagForm`).

Halaman **Signup** (Studio / Workplace / Particles) sudah dihapus. Kodenya
masih ada di riwayat git kalau suatu saat dibutuhkan lagi.

## Stack

| Layer | Paket |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` di `app/globals.css`) |
| Animasi | GSAP 3.15 + `@gsap/react` — ScrollTrigger & SplitText sudah gratis di paket publik |
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

> **Kalau utility Tailwind baru tidak muncul, hapus `.next`.** Cache persisten
> Turbopack bisa menyajikan CSS basi setelah `app/globals.css` diubah —
> restart dev server saja tidak cukup, hash chunk-nya tetap sama. Gejalanya
> khas: class-nya ada di DOM tapi `getComputedStyle` mengembalikan nilai
> default. Sudah kena dua kali di proyek ini (`bg-rust`, lalu `.badge-control`).

```bash
pnpm build        # build produksi
pnpm lint
pnpm exec tsc --noEmit
```

## Struktur

```
app/
  page.tsx            Satu-satunya route — layout V1 atau V2 dari `?v=`
  actions.ts          Server Action submitSignup()
  globals.css         Token brand + styling field
components/
  landing/            LandingOne (V1) · LandingTwo (V2) · NametagForm (badge
                      berpita) · LandingHero · SpeakerBio · Takeaways · footer
  variations/         Switcher + panel pemilih (HTML popover API)
  hero/HeroCopy.tsx   Reveal headline per baris (SplitText + mask)
  brand/Logo.tsx      Lockup Overclock (aset asli, di-inline)
  form/               useSignupForm (logika) · SignupFields (kontrol) · Field
providers/
  SmoothScrollProvider.tsx
hooks/
  useReducedMotion.ts
lib/
  variations.ts       Daftar layout + state-nya (dari URL)
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
  sejenisnya masuk ke `useRef`.
- **Apa pun yang menyentuh `window`/`document` saat render** harus di balik
  client boundary atau sebuah hook client.
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

## Landing V1

**Aset.** Tiga sudah masuk, satu belum:

- `assets/landing-hero.webp` — foto hero. **Sudah di-grade hangat dari
  sananya, jangan dikasih filter lagi.** File aslinya punya alpha vignette
  lembut di tiga sisi (di-export untuk penempatan mengambang); di sini sudah
  di-crop ke area fotonya yang solid, karena band full-bleed bertepi keras
  tidak punya apa-apa untuk ditumpuki fade selain halaman itu sendiri.
- `assets/ahmed-haque.png` — cutout beralpha, jadi teal-nya yang terlihat di
  belakangnya. Dia yang menentukan tinggi kartu, bukan sebaliknya.
- `assets/vyond.png` — di-trim ke mark-nya saja, supaya tingginya bisa diatur
  terhadap lockup Overclock, bukan terhadap canvas yang sudah bawa padding.
- **Take-away file** → belum ada. `Takeaways` menerima prop `fileHref`; tanpa
  itu barisnya dirender sebagai teks biasa, bukan link mati.

Kontras di atas band (diukur dari piksel render, persentil ke-95): headline
putih 14,7:1, aksen teal 7,4:1, standfirst 16,4:1, lockup putih di atas 6,5:1.

**Banner-nya 620px pas.** Tiga angka yang membentuk halamannya — tinggi band,
tinggi brand bar, dan tinggi sel di bawah band — ditaruh sebagai CSS variable
di `<main>` (`--band`, `--bar`, `--cell`), bukan nilai yang diulang-ulang.
Blok copy-nya `calc(var(--band) - var(--bar))`, jadi dia berakhir persis di
kaki foto; sel di bawahnya diisi penuh blok oranye, jadi kotaknya menempel
tanpa celah ke fotonya. Tanpa itu, angkanya harus diturunkan ulang dengan
tangan setiap kali ukuran lockup berubah.

**Grid-nya digambar, bukan cuma diimplikasikan.** Garisnya `border` di elemen
asli, bukan layer dekoratif, supaya tidak pernah meleset dari konten yang
dipisahkannya. Tapi band-nya cuma selebar kolom kiri sementara di comp garisnya
menyeberang seluruh halaman — makanya ada pseudo-element yang menyambung dari
tepi kolom ke tepi container. Lebarnya `95%` persis rasio grid-nya (`1fr` dan
`0.95fr`, tanpa gap); ubah rasionya, ubah ini juga. Alternatifnya — garis
kepanjangan lalu `overflow` untuk memotongnya — lebih buruk: `overflow: hidden`
di ancestor bikin dia jadi scroll container dan form-nya berhenti sticky.

Garis vertikalnya menempel di **band**, bukan di container atau kolom, supaya
baru mulai setelah band foto habis. Dipasang lebih tinggi dia melintasi
fotonya, dan hairline pucat di atas gambar gelap itu bukan garis grid — itu
goresan.

**Footer-nya** disalin dari screenshot overclockaccelerator.com. Label-nya
benar; **path link-nya hasil inferensi** dari labelnya, karena domainnya
diblokir network policy environment ini jadi href aslinya tidak bisa dibaca.
Semuanya ada di `components/landing/footerNav.ts` — satu file untuk dikoreksi.
Tanda tangan "Built by Tribe" memakai `assets/tribe-signature.png` (putih di atas transparan, tinggi 32px).

**Formnya berbentuk nametag**: kepala badge berisi penerbit dan tanggalnya,
lalu nama event, lalu baris-baris yang biasanya *dicetak* di badge jadi field
yang kamu isi. Yang mengatur spasinya adalah satu syarat — semua field harus
muat satu layar di samping hero. Apa pun yang dekorasi dan bukan informasi
(lanyard, lubang jepitan, nomor seri, barcode) sudah dibuang karena masing-
masing memakan ruang vertikal yang dibutuhkan field.

Logikanya **tidak diduplikasi**: `useSignupForm` memegang validasi, submit, dan
pemasangan ulang error dari server; `SignupFields` memegang kelima kontrolnya
beserta token `autoComplete`-nya; `NametagForm` hanya bingkainya. Kalau bingkai
lain dibutuhkan lagi, pakai keduanya — jangan menyalin logikanya.

**Form sticky-nya satu baris grid.** Kolom kiri adalah *satu* grid item tinggi
berisi semua section; kolom kanan satu item pendek di sebelahnya. Karena
sebaris, item kanan bisa `sticky` sementara barisnya scroll — dan dia wajib
`self-start`: grid item yang teregang setinggi barisnya tidak punya ruang
gerak dan tidak akan menempel sama sekali.

Band fotonya adalah **layer di belakang grid**, bukan section di dalamnya, supaya
kolom form bisa mulai dari paling atas halaman dan menimpanya seperti di comp.
Tinggi band dan `min-height` blok hero adalah satu keputusan di dua tempat —
band harus berhenti di celah antara standfirst dan kartu pembicara. Ubah salah
satu, cek yang lain.

Scrim-nya cokelat hangat, bukan token `ink`. Ink itu nyaris netral, dan
ditumpuk di atas foto sepia dengan kekuatan segini dia justru membatalkan
kehangatan yang baru saja dipasang — bandnya keluar abu-abu.

Di bawah lg kolomnya menumpuk dan form ikut mengalir biasa, tidak sticky:
nempel di layar pendek artinya kartu yang menutupi sebagian besar viewport
sepanjang halaman.

## Landing V2

`?v=2` — `components/landing/LandingTwo.tsx`. Kontennya sama
dengan V1 (foto hero, copy, pembicara, takeaway, footer), layout-nya mengikuti
comp V2:

- Form badge berpita (`NametagForm`) **identik dengan V1** — lebar, bayangan,
  tombol — tapi **dipaku di hero**, tidak sticky, karena halamannya pendek.
- Tiga blok piksel (rust, teal, rust kecil) menurun dari tepi kiri badge,
  ditempatkan dari `--band` sehingga selalu menempel di tepi bawah foto. Hanya
  di `lg` ke atas.
- Logo VYOND | Overclock di `z-30`, di atas pita lanyard yang naik ke luar
  layar.
- Kolom: dari `xl` kolom badge selebar badge (30rem, sama dengan V1) dan copy
  mengisi sisanya; di `lg` dibagi rata.

**Ilustrasi** `assets/landing-v2-branch.png` (730×318, PNG transparan) —
figur di ranting, menempel di tepi kiri halaman tepat di bawah foto. Hanya di
`lg` ke atas; ditampilkan 352px lebar, jadi file ini cukup untuk layar 2x.
Kalau mau lebih tajam di layar 3x, kirim versi ≥1100px.
