# Overclock — Webinar Signup

Landing page satu-section untuk peserta webinar Overclock: sign-up + penjadwalan
sesi 1-on-1.

Ada **dua halaman** yang sedang ditinjau, masing-masing dengan variasinya
sendiri. Pemilihnya ada di tab kiri layar — klik untuk membuka panel pilihan.
Pilihannya disimpan di URL (`?page=landing&v=1`) sehingga bisa dikirim sebagai
tautan.

**Signup** — satu section: pitch dan form berdampingan.

1. **Studio** — latar paper, figur CRT yang di-scrub mouse.
2. **Workplace** — foto full-bleed yang digelapkan, form di atasnya. Punya
   pilihan background sendiri (`?img=1` / `?img=2`).
3. **Particles** — hitam pekat, logomark Overclock tersusun dari partikel yang
   berayun pelan, dengan partikel ambient yang terus mengalir masuk. Kursor
   memecah marknya.

**Landing** — beberapa section, di-scroll, dengan form yang menemani di samping.

1. **V1** — hero foto, profil pembicara, takeaway, dan kolom form yang sticky.

Id variasinya **per halaman**: `v=1` berarti Studio di Signup dan V1 di Landing.
Semuanya memakai `SignupForm` yang sama; yang berbeda permukaannya.

Figur CRT-head adalah **video yang di-scrub mouse**: videonya tidak pernah
autoplay, gerakan mouse horizontal yang menarik playhead-nya. Lihat
`components/hero/HeroVisual.tsx`.

WebGL hanya ter-mount di variation 3, lewat `dynamic(..., { ssr: false })` —
three dan kawan-kawannya tidak ikut ter-bundle untuk variation 1 dan 2.

## Stack

| Layer | Paket |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` di `app/globals.css`) |
| Animasi | GSAP 3.15 + `@gsap/react` — ScrollTrigger & SplitText sudah gratis di paket publik |
| 3D / WebGL | three · `@react-three/fiber` v9 · drei · postprocessing — dipakai di variation 3 |
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
  page.tsx            Satu-satunya route — single section
  actions.ts          Server Action submitSignup()
  globals.css         Token brand + styling field (dotted → solid underline)
components/
  variants/           VariantOne (Studio) · VariantTwo (Workplace) · VariantThree (Particles)
  variants/particles/ Sampling logomark + simulasi partikel + canvas r3f
  landing/            Halaman Landing V1 — hero foto, profil pembicara, takeaway
  variations/         Switcher + panel pemilih (HTML popover API)
  hero/HeroCopy.tsx   Reveal headline per baris (SplitText + mask)
  hero/HeroVisual.tsx Video figur + scrub mengikuti mouse — hanya di variation 1
  brand/Logo.tsx      Lockup Overclock (aset asli, di-inline)
  form/               useSignupForm (logika) · SignupFields (kontrol) ·
                      SignupForm (kartu) · Field
providers/
  SmoothScrollProvider.tsx
hooks/
  usePointer.ts       Posisi pointer di ref — bukan state, supaya tidak re-render
  useReducedMotion.ts
  useToday.ts
lib/
  variations.ts       Daftar halaman, variasi & background + state-nya (dari URL)
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
beserta token `autoComplete`-nya. Yang berbeda cuma bingkainya — `SignupForm`
(kartu, dipakai halaman Signup) dan `NametagForm` (badge, dipakai Landing).
Kalau dua salinan dibiarkan, salah satunya cepat atau lambat jadi yang lupa
memasang ulang field error.

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

`?page=landing&v=2` — `components/landing/LandingTwo.tsx`. Kontennya sama
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

## Partikel logomark (variation 3)

Bentuknya diambil dari path SVG brand-nya sendiri (`markPoints.ts`), di-sample
dengan rejection sampling lewat `Path2D` + `isPointInPath(..., "evenodd")` —
aturan even-odd itu yang melubangi segitiga di tengah mark. Tidak ada aset
tambahan yang dikirim; kalau logonya berubah, cukup ganti satu string.

Simulasinya ada di `particleSystem.ts`, sengaja di luar React: array-nya ditulis
ulang 60x per detik, dan itu persis yang dilarang aturan immutability React
Compiler terhadap nilai balikan hook. Objeknya dibuat di sana, dipegang `useRef`.

Tiga hal yang memakan waktu dan gampang terulang:

1. **`state.pointer` dari r3f bernilai (0, 0) sebelum ada pointer event** — dan
   (0, 0) itu titik tengah canvas, tepat di marknya. Dipercaya mentah-mentah,
   kursor tak kasat mata menahan di tengah logo dan merobeknya sebelum
   mouse-nya disentuh. Jadi kehadiran pointer dilacak sendiri lewat
   `pointermove`/`pointerleave` di `gl.domElement`.
2. **Bloom justru menghancurkan marknya.** Logonya cincin tipis — di beberapa
   titik hanya selebar satu partikel. Bloom melebarkan tiap titik jadi halo, dan
   ribuan halo additive itu kabut, bukan logo. Sempat dipakai, lalu dicabut;
   di atas hitam, titik additive yang tajam sudah terbaca sebagai cahaya.
3. **Rotasinya ayunan, bukan putaran penuh.** Marknya pipih (tebal 0.1 unit).
   Diputar penuh terhadap Y, sebagian siklusnya dilihat dari samping dan logonya
   jadi segaris. Ayunan ±31° tetap memberi kesan 3D tanpa pernah kehilangan
   bentuknya.

**Canvas-nya satu halaman penuh** (`fixed inset-0`, di belakang konten), bukan
sebesar kolom tempat marknya. Ini bukan detail: partikel harus datang dari suatu
tempat, dan kalau canvas-nya hanya sebesar kolom, tepi kolom itulah yang jadi
tempat mereka muncul — terlihat sebagai kotak berisi partikel yang menyembur
dari sisi-sisinya. Spawn-nya juga dari luar tepi halaman, bukan dari lingkaran
berjari-jari tetap: lingkaran itu sebuah bentuk, dan bentuk di dalam frame itu
kelihatan.

Karena canvas-nya seluas halaman, posisi dan ukuran marknya diukur dari sebuah
**elemen jangkar** kosong di grid kolom kiri (ResizeObserver + listener scroll,
bukan `getBoundingClientRect` tiap frame — itu memaksa reflow 60x per detik).
Jadi logonya mengikuti layout, bukan menyimpan salinan breakpoint-nya sendiri.

Canvas-nya `pointer-events-none` supaya form tetap bisa diklik; r3f dipasangi
`eventSource={document.body}` + `eventPrefix="client"` supaya kursor tetap
sampai ke marknya dari mana pun di halaman.

Yang berputar adalah **posisi tujuan** partikelnya, bukan group-nya. Kursor
mendorong partikel di world space; kalau group-nya yang diputar, tiap frame
pointer harus ditransformasi ke local space dan letak "robek"-nya meleset dari
posisi kursor di layar.

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
