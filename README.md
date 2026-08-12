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
| 0 | **Navbar** | Sticky, blur saat scroll, sembunyi saat scroll ke bawah & muncul lagi saat scroll ke atas, scroll-spy menandai section aktif, drawer di mobile. Tanpa footer (sesuai permintaan). |
| 1 | **Hero** | Copy ajakan install + asset screenshot Smart TV + CTA "Pasang Sekarang" & "Panduan". |
| 2 | **Program Unggulan** | 4 kartu program dengan poster asli. |
| 3 | **Kelebihan** | Bento grid 7 item (1 kartu lebar Live Streaming + 6 kartu screenshot promo), hover memperbesar asset sedikit. |
| 4 | **Cara Install Kompas TV** | 3 tab (Android TV/Google TV, Samsung TV & LG TV, Lewat Google Play HP/Laptop) × 4-5 langkah, **semua langkah** di ketiga tab menampilkan **foto produk asli** (langkah "Selesai" di tab Google Play meminjam foto step "Selesai" dari tab Android TV, karena instalasinya rampung di TV bukan di laptop/HP). Tidak ada lagi kotak "Aplikasi tidak muncul?" di bawah stepper — dihapus atas permintaan. |

---

## Alur pilih merek TV — modal "Pasang Sekarang"

Klik CTA "Pasang Sekarang" (navbar/hero) → modal tampil grid 6 logo merek
(Samsung, LG, Sony, TCL, Xiaomi, Infinix), masing-masing dengan **keterangan OS**
kecil di bawah nama mereknya (Tizen OS / LG OS / Android TV — lihat tabel di
bawah). Klik logo **tidak langsung** pindah tab, tapi ganti tampilan modal jadi
instruksi singkat dulu (judul + OS + 4-5 langkah, tanpa mock layar TV supaya
ringkas). Ada tombol "← Pilih merek lain" untuk balik ke grid. Ini disengaja —
user yang klik CTA utama biasanya belum tahu caranya sama sekali, jadi kasih
konteks dulu sebelum diarahkan pergi.

> Sempat ada section terpisah "Panduan Merek TV" (showcase 6 logo yang langsung
> membuka store tanpa instruksi) di iterasi sebelumnya, tapi sudah dihapus atas
> permintaan — sekarang satu-satunya cara pilih merek TV adalah lewat modal ini.

Instruksi di modal diambil dari data yang sama dengan section **Cara Install
Kompas TV** (`GUIDES` di [`assets/js/main.js`](assets/js/main.js)):

| Merek diklik | OS | Guide default | Tombol akhir |
|---|---|---|---|
| Samsung | Tizen OS | `GUIDES.samsunglg` | *(tidak ada — lihat catatan di bawah)* |
| LG | LG OS | `GUIDES.samsunglg` | *(tidak ada — lihat catatan di bawah)* |
| Sony / TCL / Xiaomi / Infinix | Android TV | `GUIDES.playstore` ("Lewat Google Play HP/Laptop") | Buka Google Play |

**Samsung & LG tidak punya tombol store.** Awalnya ada tombol "Buka Samsung TV
Apps" / "Buka LG Content Store", tapi ditarik (`#brandDetailCta` disembunyikan
untuk kedua grup ini di `showBrandDetail()`) karena kedua link itu cuma
halaman info umum Samsung/LG — bukan link yang benar-benar menginstall Kompas TV
di TV, jadi tombolnya menyesatkan. Sempat diganti kotak catatan
(`#brandDetailNote`, menampilkan `GUIDES.samsunglg.note`) sebagai pengganti,
tapi **kotak itu juga sudah dihapus** atas permintaan — untuk kedua merek ini
modal sekarang cukup berhenti di daftar langkah (tanpa CTA, tanpa catatan apa
pun); langkah-langkahnya sendiri sudah cukup jelas.

**Link "instal langsung di TV" untuk brand Android TV.** Sony/TCL/Xiaomi/
Infinix defaultnya diarahkan ke guide "lewat HP/Laptop" di dalam modal (karena
orang yang buka landing page ini biasanya sedang pegang HP/laptop, bukan
berdiri di depan TV). Tapi untuk yang justru mengakses halaman ini dari TV-nya
sendiri, ada link teks `#brandDetailToggle` — **"Ingin install langsung dari TV
Anda? Lihat caranya"** — diletakkan tepat **di bawah tombol "Buka Google Play"**
(bukan di atasnya), tanpa border/kotak (murni teks tertaut, karena tidak ada
apa pun untuk "dipilih" di sini — ini navigasi, bukan opsi ke-2), dan warnanya
**putih netral** (`var(--text-hi)`, bukan warna brand merah — link ini bukan
CTA ke-2 yang perlu ditonjolkan). Klik link ini **menutup modal**, mengganti
tab section **Cara Install Kompas TV** (`#panduan`) ke **Android TV / Google TV**
lewat `setPlatform('android')`, lalu scroll halus ke section itu — jadi user
langsung disambut instruksi lengkap bergambar, bukan sekadar teks di dalam
modal. Tombol ini sendiri tidak pernah mengubah apa pun di dalam modal.

**6 merek yang tampil di modal** — Samsung, LG, Sony, TCL, Xiaomi, Infinix —
masing-masing punya `data-group` yang menentukan tujuan akhir:

| `data-group` | Tujuan |
|-------|--------|
| `samsung` | `https://www.samsung.com/us/tvs/smart-tv/samsung-tv-apps/` (hanya link referensi di catatan, bukan tombol) |
| `lg` | `https://us.lgappstv.com/main` — LG Content Store (hanya link referensi di catatan, bukan tombol) |
| `android` | `https://play.google.com/store/apps/details?id=tv.kompas.kompastv` |

Kalau mau menambah/mengurangi merek yang ditampilkan, tiles-nya ditulis manual
di `index.html` di dalam `#brands` (dalam modal `#installer`) — bukan dari
array JS lagi:

```html
<button class="brand-tile" type="button" data-group="samsung">
  <span class="brand-tile__ico"><img src="assets/img/brands/samsung.png" alt="" onerror="this.remove()" /><span class="brand-tile__initial">S</span></span>
  <span class="brand-tile__name">Samsung</span>
  <span class="brand-tile__os">Tizen OS</span>
</button>
```

`.brand-tile__os` (dan `.brand-detail__os` di tampilan detail) adalah satu-
satunya tempat teks OS ditulis — `showBrandDetail()` di `main.js` membaca
langsung dari `.brand-tile__os` tile yang diklik, jadi kalau menambah merek baru
cukup isi teks OS-nya di HTML, tidak perlu ubah JS. Kalau `data-group` merek
baru bukan `samsung`/`lg`, dia otomatis dianggap Android TV oleh
`isAndroidGroup()` (dapat tombol CTA + toggle "instal langsung di TV").

Kalau file logonya belum ada, hapus saja tag `<img>` — badge otomatis jatuh ke
inisial huruf (`.brand-tile__initial`), bukan logo palsu. Semua 6 merek saat
ini (termasuk Infinix) sudah punya file logo asli di `assets/img/brands/`.

Ada juga pesan permanen di bawah grid modal (bukan "hasil pencarian tidak
ketemu" — search sudah dihapus, jadi ini sekadar pesan tetap untuk merek yang
tidak masuk daftar 6):

> Tidak menemukan merek TV Anda? Jangan khawatir, Anda masih tetap bisa
> menonton siaran langsung Kompas TV [di sini](https://www.kompas.tv/live).

Kotak ini (`.modal__reassure`) sengaja **netral** — background & border sama
seperti `.brand-tile` di atasnya (`var(--surface)` / `var(--line)`), ikon &
link pakai `var(--text-mid)`/`var(--text-hi)` — bukan warna brand merah.
Awalnya ikut ditinting merah waktu tombol-tombol lain diubah ke nuansa merah,
tapi dikembalikan netral karena kotak ini isinya info alternatif biasa, bukan
peringatan — merah di sini bisa disalahartikan sebagai warning/danger.

**Catatan teknis:** teks pesan ini WAJIB dibungkus `<span>` di HTML (lihat
`.modal__reassure` di `index.html`) — bukan teks lepas langsung sebagai anak
`display:flex`. Kalau teks & link dibiarkan lepas sebagai node terpisah,
browser akan memperlakukan tiap potongan teks (termasuk link "di sini") sebagai
kolom flex sendiri-sendiri, sehingga link melompat ke kanan alih-alih mengalir
wajar di dalam paragraf. Ini pernah jadi bug nyata di iterasi sebelumnya.

**Deteksi perangkat:** kalau landing page dibuka dari iPhone/iPad, opsi Android TV
mengarah ke App Store (`id539944871`) agar user bisa install di perangkatnya dulu.
Dari HP Android, link Play Store web otomatis dibuka oleh aplikasi Play Store.
Dari laptop/komputer, terbuka sebagai halaman web Google Play.

Semua URL terkumpul di satu objek `STORE` di baris paling atas
[`assets/js/main.js`](assets/js/main.js) — tidak ada URL hardcoded di tempat lain.

> **Perlu dicek tim:** Samsung dan LG belum punya deep link langsung ke halaman
> aplikasi Kompas TV — makanya tombol store-nya ditarik dari modal (lihat di
> atas). `STORE.samsung`/`STORE.lg` masih disimpan untuk link referensi di
> catatan. Begitu app ID Tizen / webOS (atau deep link instalasi yang valid)
> terbit, tombol CTA bisa dikembalikan dengan menghapus kondisi
> `isAndroidGroup(group)` pada `showCta` di `showBrandDetail()`.

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
| `assets/img/brands/samsung.png` | `logo brand tv/Samsung.png` | Badge merek Samsung |
| `assets/img/brands/lg.png` | `logo brand tv/LG.png` | Badge merek LG |
| `assets/img/brands/sony.png` | `logo brand tv/Sony.png` | Badge merek Sony |
| `assets/img/brands/tcl.png` | `logo brand tv/TCL.png` | Badge merek TCL |
| `assets/img/brands/xiaomi.png` | `logo brand tv/Xiaomi.png` | Badge merek Xiaomi |
| `assets/img/brands/infinix.png` | `logo brand tv/Infinix.png` | Badge merek Infinix |
| `assets/img/promo/*.png` (6 file) | `asset promo/*.png` (root folder) | Screenshot di 6 kartu section Kelebihan |
| `assets/img/guide/android/1-4.jpg` | `Google TV/1-4.png` (root folder) | Foto langkah di tab **Android TV / Google TV**, section Cara Install |
| `assets/img/guide/samsunglg/1-4.jpg` | `Samsung & LG TV/1-4.png` (root folder) | Foto langkah di tab **Samsung TV & LG TV**, section Cara Install |
| `assets/img/guide/playstore/1-4.jpg` | `Google Play Laptop/1-4.jpg` (root folder) | Foto langkah di tab **Lewat Google Play (HP/Laptop)**, section Cara Install |

`assets/img/logo-mark.svg` masih **placeholder** (dipakai untuk favicon saja) —
ganti dengan app mark resmi kalau tersedia.

Semua 6 merek di modal sekarang sudah punya logo asli — tidak ada lagi yang
jatuh ke badge inisial huruf.

**Foto langkah ketiga tab** — dikonversi dari file asli (PNG 1122×1402 untuk
Android TV & Samsung/LG TV, ~1,5 MB/file; JPEG 1683×2103 untuk Google Play
Laptop, ~1,5-1,6 MB/file) ke JPEG 900×1125 kualitas 82 (~60-90 KB/file, turun
~95%) pakai `System.Drawing` lewat PowerShell (tidak ada ImageMagick/Node/
Python di environment ini). Urutan file **1 → 4** di ketiga folder sumber
sudah sejajar apa adanya dengan urutan `GUIDES.android.steps` /
`GUIDES.samsunglg.steps` / `GUIDES.playstore.steps` di `main.js` — kalau
menambah/mengganti foto, pastikan urutannya tetap sejajar, dan simpan sebagai
JPEG (bukan PNG) karena background-nya solid gelap, tidak butuh transparansi.

> **Tab "Lewat Google Play (HP/Laptop)" cuma punya 5 langkah, bukan 6.**
> Langkah "Klik Install" sudah **digabung ke dalam** "Pilih Install di
> Perangkat Lain" (`GUIDES.playstore.steps`, `main.js`) — di alur Google Play
> sesungguhnya, pilih tipe TV dan klik Instal memang terjadi di **satu dialog
> yang sama** (foto ke-4), jadi teksnya digabung juga, bukan cuma foto-nya.
> Langkah terakhir ("Selesai", sekarang index ke-4) **tidak pakai foto Google
> Play-nya sendiri** — instalasinya rampung di TV, bukan di laptop/HP ini, jadi
> `SHOT_IMAGES.playstore[4]` sengaja diarahkan ke
> **`assets/img/guide/android/4.jpg`** (foto step "Selesai" dari tab Android
> TV, sumber aslinya `Google TV/4.png`) — dipilih ulang atas permintaan, bukan
> fallback ke mock CSS lagi seperti sebelumnya.

### 2. Copywriting program

Program Unggulan sekarang tampil 4 kartu saja (ROSI, Dipo Investigasi, Satu Meja
The Forum, Bola Liar) — baris kedua yang berisi Berkas Kompas, Sapa Indonesia
Pagi, dan Kompas Petang sudah dihapus atas permintaan. Kalau nanti mau menambah
kartu lagi, siapkan poster 3:4 dan taruh di `assets/img/programs/`, lalu duplikasi
satu `<li class="prog">` di `index.html` section `#program`.

---

## Design system

**Tema:** dark mode, background gradient navy tua tetap dipertahankan (senada
dengan tone product app Kompas TV di Smart TV), tapi seluruh elemen interaktif
— tombol, tab aktif, hover state, badge, ikon aksen — kini pakai **nuansa
merah** sebagai warna brand. **Font: Source Sans 3 untuk seluruh komponen** —
tidak ada typeface lain di mana pun, termasuk di dalam mock layar TV pada
section Panduan Install. **Ikon:** [Phosphor Icons](https://phosphoricons.com)
v2.1.2 via jsDelivr (regular / bold / fill).

**Heading tiap section** (`.hero__title`, `.sec-title`) pakai `font-weight: 700`
— sebelumnya 800, diturunkan satu tingkat atas permintaan karena dirasa terlalu
tebal. Ini sekarang sama dengan default `h1-h4` di base style (`styles.css`,
selector `h1, h2, h3, h4`), jadi tidak ada lagi heading section yang lebih
tebal dari heading lain di halaman.

### Token warna (`:root` di `styles.css`)

| Token | Nilai | Pakai untuk |
|-------|-------|-------------|
| `--bg-base` | `#04070F` | Background halaman (tetap navy — ambient, tidak diubah) |
| `--bg-700` / `--bg-600` | `#0A1730` / `#0E2144` | Gradient & surface gelap (tetap navy) |
| `--brand-500` / `--brand-600` | `#DC2626` / `#991B1B` | Gradient tombol primary, tab aktif, hover border |
| `--brand-400` / `--brand-300` | `#F87171` / `#FCA5A5` | Ikon, aksen, teks link |
| `--accent-live` | `#E01B0F` | Badge LIVE (semantik, tetap terpisah dari token brand) |
| `--text-hi` / `--text-mid` / `--text-low` | `#F2F6FF` / `#A9B7D0` / `#7E8DA8` | Hierarki teks |

> **Riwayat warna:** versi awal pakai gradient biru tua (`--brand-500:
> #1F63E8`, dst). Sempat juga dicoba abu-abu netral (charcoal), lalu
> dikembalikan ke biru. Iterasi terakhir: token `--brand-*` diubah ke nuansa
> merah (`#DC2626` / `#991B1B` / `#F87171` / `#FCA5A5`) untuk tombol & semua
> elemen interaktif, sementara **background ambient (`--bg-*`, glow backdrop,
> bezel mock TV, panel guide/modal) sengaja dibiarkan navy** — kontras hangat
> (merah) di atas dingin (navy) ini disengaja, bukan oversight. Kalau mau
> eksperimen lagi, semua warna aksen ada di token `--brand-*` dan
> `--brand-glow` — tinggal ganti di satu tempat; beberapa `rgba(...)` hover/
> active state yang di-hardcode (bukan lewat token) juga sudah dikonversi ke
> hue merah yang senada — cari komentar terkait di `styles.css` kalau perlu
> disesuaikan lagi.
>
> `.grad-text` (highlight kata di heading) sengaja **dilepas dari token
> `--brand-*`** — sekarang selalu putih polos (`color: #fff`) apa pun warna
> brand yang aktif, supaya heading tidak ikut berubah warna setiap kali tema
> aksen diganti.

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
- Tombol **Scroll to Top** (`#scrollTop`, pojok kanan bawah, bulat, warna
  brand) — fade + slide-up begitu section **Program Unggulan** (`#program`)
  terlewati ke atas saat scroll ke bawah, dan hilang lagi begitu scroll balik
  ke atas melewati section itu. Dipantau lewat `IntersectionObserver` di
  `main.js` (fallback ke listener `scroll` biasa kalau browser tidak dukung
  IO), toggle kelas `.is-visible` — sengaja **tanpa** atribut `[hidden]` di
  HTML, supaya transisi opacity/transform-nya jalan (`display:none` dari
  `[hidden]` akan mengalahkan transition). Klik tombolnya → `window.scrollTo`
  ke atas, `behavior: 'smooth'` (otomatis `'auto'` kalau user mengaktifkan
  `prefers-reduced-motion`).
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
| Modal — grid → instruksi | Klik tile → tampilan ganti ke instruksi (Samsung 4 langkah, LG 4 langkah, Sony 5 langkah, step 1 = "Pastikan Akun Google Anda Sama" untuk Android TV) sesuai `GUIDES` yang benar; tombol akhir & label sesuai merek, membuka URL yang tepat tanpa navigasi halaman ini ikut pindah |
| Modal — tombol kembali | Balik ke grid, fokus kembali ke tile pertama |
| Modal — teks reassurance | Link "di sini" mengalir wajar di dalam paragraf (bukan melompat ke kanan sebagai kolom flex terpisah) |
| Modal | Focus trap aktif, Esc menutup, fokus kembali ke tombol pemicu, scroll body terkunci |
| Stepper | Ganti tab me-reset ke langkah 1, prev/next disabled di ujung, progress bar sinkron |
| Navigasi keyboard | Tablist ← → Home End berfungsi, skip-link ada, focus ring terlihat |
| Asset Hero | `hero-tv.png` termuat, ukuran natural 1400×1164, chip "Live 24 Jam" & "Kualitas HD" tampil di atasnya (z-index benar), tidak overlap konten sibuk pada foto |
| Foto langkah — ketiga tab | Android TV & Samsung/LG TV: 4 foto/tab termuat (900×1125), urutan `src` sejajar step aktif. Google Play sekarang 5 langkah (bukan 6 — "Klik Install" sudah digabung ke "Pilih Install di Perangkat Lain"): step 1-3 foto `playstore/1-3.jpg`, step 4 `playstore/4.jpg`, step 5 "Selesai" pakai `guide/android/4.jpg` (dicek satu-satu lewat `src`/`hidden` tiap step, bukan cuma tab default) |
| Cara Install — kotak "Aplikasi tidak muncul?" | `#guideFallback` sudah tidak ada di DOM (dicek di ketiga tab) |
| Modal — kotak "Tidak menemukan merek TV" | `.modal__reassure` netral: bg `rgba(255,255,255,.04)` / border `rgba(255,255,255,.09)` (bukan lagi merah), ikon & link `var(--text-mid)`/`var(--text-hi)` |
| Modal — Samsung & LG | Tidak ada CTA, tidak ada kotak catatan (`#brandDetailNote` sudah tidak ada di DOM), toggle "instal langsung di TV" ikut tersembunyi (memang hanya untuk brand Android TV) |
| Modal — toggle "instal langsung di TV" | Warna teks putih netral (`rgb(242,246,255)` = `var(--text-hi)`), bukan merah |

**Belum diuji:** perangkat fisik (iOS Safari, Smart TV browser).
