# Landing Page — Kompas TV untuk Smart TV

Landing page statis untuk mempromosikan ekspansi aplikasi Kompas TV ke platform Smart TV
(Android TV / Google TV, Samsung Tizen, LG webOS).

**Tanpa build step.** Tidak butuh Node.js atau Python — cukup buka `index.html` di browser.

```
index.html
assets/
  css/styles.css      ← seluruh styling + design token
  js/main.js          ← modal store-routing, stepper panduan, scroll spy, motion
  img/
    logo-kompastv.png ← logo resmi (navbar + mock UI di dalam TV)
    logo-mark.svg     ← PLACEHOLDER favicon / app mark
```

---

## Cara menjalankan

Klik dua kali `index.html`, atau jalankan static server apa pun (opsional):

```bash
npx serve .
```

Untuk deploy: unggah seluruh folder apa adanya ke hosting statis mana pun
(Netlify, Vercel, S3, Nginx). Tidak ada dependensi server-side.

---

## Struktur halaman

| # | Section | Isi |
|---|---------|-----|
| 0 | **Navbar** | Sticky, blur saat scroll, scroll-spy menandai section aktif, drawer di mobile. Tanpa footer (sesuai permintaan). |
| 1 | **Hero** | Copy ajakan install + mockup Smart TV berisi homepage aplikasi + CTA utama. |
| 2 | **Program Unggulan** | 8 kartu program. Grid 4 kolom di desktop, carousel scroll-snap di mobile. |
| 3 | **Kelebihan** | Bento grid 6 item, satu kartu lebar dengan visual TV live. |
| 4 | **Panduan Install Manual** | Tab per OS × 5 langkah, tiap langkah menampilkan mock layar TV di dalam bingkai TV. |
| — | **Closing CTA** | Band penutup, bukan footer. |

---

## Tombol utama Hero — cara kerjanya

Klik **"Install di Smart TV"** → modal pencarian merek TV. User ketik nama
mereknya, list ter-filter live, klik hasilnya → diarahkan sesuai OS:

| Group | Tujuan |
|-------|--------|
| `samsung` | `https://www.samsung.com/us/tvs/smart-tv/samsung-tv-apps/` |
| `lg` | `https://us.lgappstv.com/main` (LG Content Store) |
| `android` | `https://play.google.com/store/apps/details?id=tv.kompas.kompastv` |

Daftar merek yang bisa dicari ada di array `BRANDS` — awal
[`assets/js/main.js`](assets/js/main.js), tiap entri punya `name`, `os`, `group`
(salah satu dari 3 di atas), dan `logo` (nama file di `assets/img/brands/`, atau
`null` kalau belum ada file logonya → badge jatuh ke inisial huruf).

**Merek yang tidak ada di daftar `BRANDS` = "tidak ditemukan"** saat dicari —
tampil empty state yang menjelaskan aplikasi mungkin belum tersedia untuk TV itu,
dengan dua jalan keluar: coba tetap lewat Google Play, atau ke panduan manual.
Ini sengaja jadi cara utama menyampaikan "belum didukung", jadi kalau ada merek
penting yang belum masuk daftar, tambahkan ke `BRANDS` — jangan diasumsikan
otomatis tidak didukung.

**Deteksi perangkat:** kalau landing page dibuka dari iPhone/iPad, opsi Android TV
mengarah ke App Store (`id539944871`) agar user bisa install di perangkatnya dulu.
Dari HP Android, link Play Store web otomatis dibuka oleh aplikasi Play Store.
Dari laptop/komputer, terbuka sebagai halaman web Google Play.

Semua URL terkumpul di satu objek `STORE` di baris paling atas
[`assets/js/main.js`](assets/js/main.js) — tidak ada URL hardcoded di tempat lain.

> **Perlu dicek tim:** Samsung dan LG belum punya deep link langsung ke halaman
> aplikasi Kompas TV, jadi untuk sementara mengarah ke halaman store umum. Begitu
> app ID Tizen / webOS terbit, ganti nilainya di objek `STORE`.

---

## Yang perlu diganti sebelum live

### 1. Logo & aset visual — sudah pakai file asli

| File | Sumber | Dipakai di |
|------|--------|-----------|
| `assets/img/logo-kompastv.png` | `logo kompas tv.png` (root folder) | Navbar |
| `assets/img/hero-tv.png` | `asset tv hero.png` (root folder), di-resize dari 5754px → 1400px lebar agar tidak berat (asli 10,1 MB → 1,6 MB, alpha transparan tetap terjaga) | Asset utama Hero |
| `assets/img/programs/rosi.png` | `Rosi.png` | Kartu program ROSI |
| `assets/img/programs/dipo-investigasi.png` | `Dipo Investigasi.png` | Kartu program Dipo Investigasi |
| `assets/img/programs/satu-meja.png` | `Satu Meja.png` | Kartu program Satu Meja The Forum |
| `assets/img/programs/bola-liar.png` | `Bola Liar.png` | Kartu program Bola Liar |
| `assets/img/brands/*.png` (10 file) | `logo brand tv/*.png` (root folder) | Badge merek di modal pencarian TV |

`assets/img/logo-mark.svg` masih **placeholder** (dipakai untuk favicon saja) —
ganti dengan app mark resmi kalau tersedia.

**Brand tanpa file logo** (Toshiba, Hisense, Coocaa) tampil dengan badge inisial
huruf di modal — bukan diam-diam disembunyikan. Kalau ada file logonya nanti,
taruh di `assets/img/brands/<nama>.png` lalu isi field `logo` di array `BRANDS`
([`assets/js/main.js`](assets/js/main.js)) dengan nama file itu (tanpa `.png`).

### 2. Copywriting program

Program Unggulan sekarang tampil 4 kartu saja (ROSI, Dipo Investigasi, Satu Meja
The Forum, Bola Liar) — baris kedua yang berisi Berkas Kompas, Sapa Indonesia
Pagi, dan Kompas Petang sudah dihapus atas permintaan. Kalau nanti mau menambah
kartu lagi, siapkan poster 3:4 dan taruh di `assets/img/programs/`, lalu duplikasi
satu `<li class="prog">` di `index.html` section `#program`.

---

## Design system

**Tema:** dark mode, gradient abu-abu gelap (charcoal). **Font: Source Sans 3
untuk seluruh komponen** — tidak ada typeface lain di mana pun, termasuk di
dalam mock layar TV pada section Panduan Install. **Ikon:**
[Phosphor Icons](https://phosphoricons.com) v2.1.2 via jsDelivr (regular / bold / fill).

### Token warna (`:root` di `styles.css`)

| Token | Nilai | Pakai untuk |
|-------|-------|-------------|
| `--bg-base` | `#0A0A0B` | Background halaman |
| `--bg-700` / `--bg-600` | `#1C1C1F` / `#26262A` | Gradient & surface gelap |
| `--brand-500` / `--brand-600` | `#6E6E76` / `#3F3F42` | Gradient tombol primary |
| `--brand-400` / `--brand-300` | `#96969E` / `#C7C7CE` | Ikon, aksen, teks gradient |
| `--accent-live` | `#E01B0F` | Badge LIVE saja (satu-satunya warna non-netral, semantik) |
| `--text-hi` / `--text-mid` / `--text-low` | `#F5F5F7` / `#AEAEB6` / `#8B8B94` | Hierarki teks |

Gray dipilih dengan luminance yang sama seperti biru sebelumnya, jadi semua
rasio kontras di bawah tetap berlaku persis — tinggal ganti tone, bukan
tingkat keterbacaan.

Type scale dan spacing (skala 4/8) juga token — ubah di satu tempat, konsisten
di seluruh halaman.

### Motion

Semuanya `transform` + `opacity` saja (tidak ada animasi layout, jadi nihil CLS):

- Reveal per section via `IntersectionObserver`, stagger 70ms antar elemen
- Pressed state `scale(0.965)` di semua tombol & elemen yang bisa diklik
- Card program naik 6px saat hover
- Dua chip "Live 24 Jam" & "Kualitas HD" mengambang lembut (float, ±9px, loop 6s,
  saling silang fase) di atas asset Hero — pelengkap visual, bukan navigasi
- Stepper panduan auto-play tiap 4,2 detik — **berhenti permanen** begitu user
  menyentuh tab atau langkah mana pun
- `prefers-reduced-motion: reduce` mematikan seluruh animasi & smooth scroll

---

## Hasil verifikasi

Diuji langsung di browser pada 375px (mobile) dan 768px:

| Cek | Hasil |
|-----|-------|
| Horizontal overflow | 0px di 375px dan 768px |
| Touch target | Semua tombol/link non-inline ≥ 44×44px |
| Kontras teks (WCAG AA) | Body 9,95:1 · H1 18,61:1 · teks tersier 6,01:1 · CTA putih di gradient 5,24–9,08:1 · badge LIVE 4,85:1 |
| Font | Source Sans 3 termuat, Phosphor termuat, tidak ada emoji sebagai ikon |
| Routing store | Samsung/LG/Android TV → URL benar; pencarian merek tak dikenal → empty state, tanpa membuka tab |
| Modal | Focus trap aktif, Esc menutup, fokus kembali ke tombol pemicu, scroll body terkunci |
| Stepper | Ganti tab me-reset ke langkah 1, prev/next disabled di ujung, progress bar sinkron |
| Navigasi keyboard | Tablist ← → Home End berfungsi, skip-link ada, focus ring terlihat |
| Asset Hero | `hero-tv.png` termuat, ukuran natural 1400×1164, chip "Live 24 Jam" & "Kualitas HD" tampil di atasnya (z-index benar), tidak overlap konten sibuk pada foto |

**Belum diuji:** perangkat fisik (iOS Safari, Smart TV browser).
