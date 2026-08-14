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
    logo-mark.svg     ← sudah TIDAK dipakai (dulu placeholder favicon, lihat catatan di bawah)
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
| 0 | **Navbar** | Tinggi 80px (`--nav-h`), sticky, blur saat scroll, sembunyi saat scroll ke bawah & muncul lagi saat scroll ke atas, scroll-spy menandai section aktif, drawer di mobile. Tanpa footer (sesuai permintaan). |
| 1 | **Hero** | Copy ajakan install + asset screenshot Smart TV + CTA "Install Sekarang" & "Panduan", plus petunjuk scroll ("Gulir ke bawah") yang melayang di dasar viewport. |
| 2 | **Program Unggulan** | 4 kartu program dengan poster asli. |
| 3 | **Kelebihan** | Bento grid 7 item (1 kartu lebar Live Streaming + 6 kartu screenshot promo), hover memperbesar asset sedikit. |
| 4 | **Cara Install Kompas TV** | 3 tab (Android TV/Google TV, **Samsung TV**, Lewat Google Play HP/Laptop) × 4-5 langkah, **semua langkah** di ketiga tab menampilkan **foto produk asli** (langkah "Selesai" di tab Google Play meminjam foto step "Selesai" dari tab Android TV, karena instalasinya rampung di TV bukan di laptop/HP). Tab Google Play step 2 punya link "Kunjungi Playstore Sekarang" ke halaman aplikasi. Tidak ada lagi kotak "Aplikasi tidak muncul?" di bawah stepper — dihapus atas permintaan. |

---

## Alur pilih merek TV — modal "Install Sekarang"

Klik CTA "Install Sekarang" (navbar/hero) → modal tampil grid 6 logo merek
(Samsung, LG, Sony, TCL, Xiaomi, Infinix), masing-masing dengan **keterangan OS**
kecil di bawah nama mereknya (Tizen OS / Android TV — lihat tabel di bawah).
Klik logo **tidak langsung** pindah tab, tapi ganti tampilan modal jadi
instruksi singkat dulu (judul + OS + 4-5 langkah, tanpa mock layar TV supaya
ringkas). Ada tombol "← Pilih merek lain" untuk balik ke grid. Ini disengaja —
user yang klik CTA utama biasanya belum tahu caranya sama sekali, jadi kasih
konteks dulu sebelum diarahkan pergi.

> Sempat ada section terpisah "Panduan Merek TV" (showcase 6 logo yang langsung
> membuka store tanpa instruksi) di iterasi sebelumnya, tapi sudah dihapus atas
> permintaan — sekarang satu-satunya cara pilih merek TV adalah lewat modal ini.

Instruksi di modal diambil dari data yang sama dengan section **Cara Install
Kompas TV** (`GUIDES` di [`assets/js/main.js`](assets/js/main.js)):

**Urutan tile-nya: LG, Sony, TCL, Xiaomi, Infinix, lalu Samsung paling akhir.**
Samsung sengaja ditaruh terakhir karena satu-satunya merek yang aplikasinya
belum tersedia — merek yang sudah bisa dipasang tampil lebih dulu.

| Merek diklik | OS di modal | Guide default di modal | Tombol akhir |
|---|---|---|---|
| LG | **Android TV** | `GUIDES.playstore` ("Lewat Google Play HP/Laptop") | Buka Google Play |
| Sony / TCL / Xiaomi / Infinix | Android TV | `GUIDES.playstore` ("Lewat Google Play HP/Laptop") | Buka Google Play |
| Samsung *(terakhir)* | Tizen OS | `GUIDES.samsunglg` | **Segera Hadir** (disabled) |

**LG diperlakukan sebagai brand Android TV di modal ini** (`data-group="android"`
di tile-nya, bukan `"lg"`) — atas permintaan eksplisit, bukan default lama.
Efeknya: OS-nya tertulis "Android TV" (bukan "LG OS"), guide default & tombol
akhirnya sama persis seperti Sony/TCL/Xiaomi/Infinix ("Buka Google Play" yang
benar-benar membuka Play Store). Konsisten juga dengan section `#panduan`, yang
tab-nya kini **"Samsung TV" saja** (LG sudah dihapus dari sana).

**Samsung: tombol "Segera Hadir" yang disabled.** Riwayatnya sempat
bolak-balik — awalnya "Buka Samsung TV Apps", lalu disabled "Segera Hadir",
lalu dihapus total, dan sekarang **kembali ke "Segera Hadir" disabled**.
Aplikasinya belum rilis di Tizen jadi tidak ada yang bisa dibuka, tapi
tombolnya tetap ditampilkan supaya user tahu statusnya (bukan mengira fiturnya
hilang). Diberi kelas `.btn--soon` — lihat catatan gaya di bawah.

> **Kenapa `.btn--soon`, bukan `[disabled]` biasa?** Aturan global
> `.btn[disabled] { opacity:.42 }` kalau dipakai pada `.btn--primary` (gradient
> merah, teks putih) membuat label "Segera Hadir" jatuh ke kontras ~1,5:1 —
> praktis tidak terbaca, padahal justru label itulah pesannya. `.btn--soon`
> membatalkan peredupan itu dan menggantinya dengan permukaan netral
> (`--surface-2` + `--line-strong`, teks `--text-mid`) → **kontras terukur
> 7,93:1**, tetap jelas terbaca sebagai tombol non-aktif. Varian ini juga
> mematikan overlay gradient `::after` dan glow hover milik `.btn--primary`
> (tanpa itu, hover malah mengecat ulang jadi merah seolah bisa diklik) dan
> memasang `cursor: not-allowed`.

**Link "Ingin install langsung dari TV Anda? Lihat caranya" tampil untuk
SEMUA merek** (`#brandDetailToggle`) — diletakkan **di bawah tombol CTA**.
Bukan tombol/kotak (tanpa border/background, warna **putih netral**
`var(--text-hi)` — bukan warna brand merah, karena ini navigasi biasa, bukan
CTA ke-2 yang perlu ditonjolkan). Klik-nya **menutup modal**, mengganti tab
section **Cara Install Kompas TV** (`#panduan`), lalu scroll halus ke section
itu — tab tujuannya beda per merek, dihitung oleh `toggleTabForGroup()`:

| Merek | Tab tujuan toggle | Kenapa |
|---|---|---|
| Android TV (Sony/TCL/Xiaomi/Infinix/LG) | `android` | Modal defaultnya menunjukkan guide "lewat HP/Laptop" — toggle ini alternatif ke cara instal langsung di TV. |
| Samsung | `samsunglg` | Modal Samsung sudah menunjukkan langkah langsung-di-TV (versi ringkas) — toggle ini membawa ke guide yang sama tapi versi lengkap dengan foto asli. |

Tab tujuan disimpan di `brandDetailToggle.dataset.group` tiap kali
`showBrandDetail()` dipanggil, dibaca lagi oleh listener klik-nya — jadi tidak
perlu variabel state tambahan di luar tombolnya sendiri.

**6 merek yang tampil di modal** — Samsung, LG, Sony, TCL, Xiaomi, Infinix —
masing-masing punya `data-group` yang menentukan tujuan akhir:

| `data-group` | Tujuan |
|-------|--------|
| `android` | `https://play.google.com/store/apps/details?id=tv.kompas.kompastv` — dipakai LG, Sony, TCL, Xiaomi, Infinix |
| `samsung` | *(tidak ada — tombolnya "Segera Hadir" & disabled, lihat di atas)* |

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
baru bukan `samsung`, dia otomatis dianggap Android TV oleh `isAndroidGroup()`
(dapat tombol CTA "Buka Google Play"; toggle "instal langsung di TV" selalu
tampil untuk semua grup, lihat di atas).

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

> **Perlu dicek tim:** Samsung belum punya deep link langsung ke halaman
> aplikasi Kompas TV — makanya tombolnya masih "Segera Hadir" & disabled.
> `STORE.samsung`/`STORE.lg` tidak lagi dipakai di modal (LG sekarang lewat
> `STORE.playWeb` seperti brand Android TV lain), tapi `STORE.samsung` masih
> dipakai sebagai link referensi di `GUIDES.samsunglg.note` — data yang saat
> ini tidak ditampilkan di UI mana pun (lihat komentar di atas `var GUIDES` di
> `main.js`). Begitu aplikasinya rilis di Tizen, tinggal ubah cabang `else` di
> `showBrandDetail()` jadi CTA aktif (dan lepas kelas `.btn--soon`).

---

## Section "Cara Install Kompas TV" (`#panduan`)

Tiga tab, datanya dari `GUIDES` di [`assets/js/main.js`](assets/js/main.js):
`android` (Android TV / Google TV), `samsunglg` (**Samsung TV**), `playstore`
(Lewat Google Play HP/Laptop).

**LG sudah dihapus dari tab kedua** atas permintaan — label tab-nya kini
"Samsung TV" saja, dan `GUIDES.samsunglg.note` tidak lagi menyebut LG Account /
LG Content Store. Yang **sengaja TIDAK ikut diganti** adalah nama key-nya
(`samsunglg`) beserta turunannya: `id="tab-samsunglg"`, `data-guide-tab`,
`SHOT_IMAGES.samsunglg`, dan folder `assets/img/guide/samsunglg/`. Alasannya
murni menekan risiko — rename itu menyentuh 13 tempat di 2 file sekaligus,
sementara yang diminta hanya label yang terlihat user. Namanya historis;
isinya Samsung saja. Kalau nanti mau dirapikan, rename keempat hal di atas
bersamaan (folder ikut) supaya tetap sinkron.

**Link opsional per-langkah — MENYATU di kalimat deskripsi.** Sebuah langkah
bisa saja punya link CTA, tapi itu ditulis **langsung di dalam string `d`**
sebagai `<a>` inline (pola yang sama seperti `<strong>`/`<a>` di
`GUIDES.*.note`), bukan field terpisah. Saat ini dipakai satu kali: step 2 tab
Google Play — `d` diakhiri kalimat **"Kunjungi Playstore Sekarang"** yang jadi
link ke halaman aplikasi Kompas TV di Play Store. Karena satu string yang
sama dipakai baik oleh `#panduan` maupun oleh `brandDetailStepHTML()` di
modal, link ini otomatis muncul di kedua tempat tanpa kode tambahan.

> **Catatan teknis (kenapa kartu langkah di `#panduan` itu `<div role="button">`,
> bukan `<button>`):** dulu tiap langkah dibungkus `<button class="step">`.
> Begitu link CTA di atas ditulis inline di dalam `d`, itu berarti sebuah
> `<a>` akan berakhir sebagai **descendant** dari `<button>` — HTML tidak
> valid, dan link jadi tidak bisa diklik dengan benar (ini sempat jadi bug
> nyata: link-nya dirender sebagai elemen terpisah di luar kartu, sehingga
> box-nya terlihat "kepisah" dari CTA-nya). Perbaikannya: `.step` diganti jadi
> `<div role="button" tabindex="0">` — `<a>` di dalam `<div>` itu sah, jadi
> link-nya bisa langsung ditaruh di dalam `.step__d`, tetap satu frame/kartu
> yang sama dengan teksnya. Konsekuensinya, aktivasi keyboard (Enter/Space)
> yang biasanya gratis dari elemen `<button>` sekarang ditangani manual lewat
> listener `keydown` di `renderSteps()`. Listener klik & keydown pada `.step`
> juga mengecek `e.target.closest('a')` — kalau klik/Enter berasal dari link
> di dalamnya, biarkan link itu sendiri yang menangani (buka tab baru),
> jangan ikut memilih ulang langkahnya (toh sudah aktif). Style link inline
> ini ada di `.step__d a, .brand-detail__step-desc a` (`styles.css`).

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
| `assets/img/guide/samsunglg/1-4.jpg` | `Samsung & LG TV/1-4.png` (root folder) | Foto langkah di tab **Samsung TV**, section Cara Install (nama folder sumber & tujuan masih menyebut LG — historis, lihat catatan di section `#panduan`) |
| `assets/img/guide/playstore/1-4.jpg` | `Google Play Laptop/1-4.jpg` (root folder) | Foto langkah di tab **Lewat Google Play (HP/Laptop)**, section Cara Install |

**Favicon sudah pakai aset resmi**, bukan lagi `assets/img/logo-mark.svg`
(placeholder lama). Sekarang link langsung ke CDN `media.kompas.tv` di
`index.html`:

```html
<link rel="shortcut icon" type="image/x-icon" href="https://media.kompas.tv/webassets/images/kompastv64.ico">
<link rel="apple-touch-icon-precomposed" href="https://media.kompas.tv/webassets/images/kompastvicon.png">
```

`kompastv64.ico` (64×64, tab browser) dan `kompastvicon.png` (64×64, home
screen iOS lewat `apple-touch-icon-precomposed` — atribut lama, tapi ini
persis kode yang diberikan tim, jadi dipakai apa adanya). Keduanya dimuat dari
server Kompas TV sendiri, bukan file lokal — kalau situs media.kompas.tv
down atau asetnya dipindah, favicon ikut hilang; tidak ada fallback lokal.
`assets/img/logo-mark.svg` jadi **file yatim** (tidak dirujuk di mana pun lagi)
— aman dihapus kapan saja, dibiarkan dulu kalau-kalau mau dipakai ulang.

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

**Riwayat refresh foto:** 4 foto sempat diganti ulang dari folder root
`Update Cara Install Kompas TV/` — `Google TV Step 2.png` → `guide/android/2.jpg`,
`Google TV Step 3.png` → `guide/android/3.jpg`, `Lewat Google Play HP Laptop
Step 1.png` → `guide/playstore/1.jpg`, `Samsung TV Step 3.png` →
`guide/samsunglg/3.jpg`. **Nama file tujuan (`1.jpg`/`2.jpg`/dst.) tidak
berubah** — jadi tidak ada perubahan di `SHOT_IMAGES` (`main.js`), cukup
resize+convert (proses sama seperti di atas) lalu overwrite langsung ke path
yang sudah ada. Kalau ada refresh lagi di masa depan, pola nama foldernya
sepertinya "Update Cara Install Kompas TV" + nama file `"<Label Tab> Step
<N>.png"` — cocokkan `<Label Tab>` ke folder (`android`/`samsunglg`/
`playstore`) dan `<N>` ke nomor step (1-indexed, sesuai urutan `GUIDES[key].steps`)
sebelum overwrite.

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

**Tinggi navbar** juga token: `--nav-h` (sekarang `80px`, sebelumnya `66px`).
Dipakai di 3 tempat yang sinkron otomatis — `.nav__inner { height }`,
`.section { scroll-margin-top: calc(var(--nav-h) + 12px) }` (biar anchor-jump
ke section tidak ketutup navbar), dan `.hero { padding-top: calc(var(--nav-h)
+ var(--sp-16)) }`. Ubah nilainya di `:root` saja, tidak perlu cari-cari
hardcode di tempat lain.

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
- Petunjuk scroll di Hero (`#scrollCue`, teks "Gulir ke bawah" + ikon mouse
  buatan CSS dengan titik "roda" yang turun-memudar, plus 3 chevron turun yang
  menyala bergantian di bawahnya — meniru animasi indikator scroll yang umum
  dipakai). **Kontainer LUAR-nya polos** — tanpa frame/latar/border/scrim,
  cuma teks + ikon, dijaga tetap terbaca di atas asset TV Hero yang ramai
  lewat `text-shadow`/`drop-shadow`, bukan kotak latar. **Outline mouse-nya
  sendiri TETAP ada** (bagian dari bentuk ikon, bukan "frame" komponen yang
  dimaksud saat diminta dihapus).
  > Riwayat: versi awal pakai bentuk ini juga (mouse + wheel CSS), lalu sempat
  > diganti jadi ikon flat Phosphor tunggal (`ph-mouse-scroll`) — niatnya cuma
  > melepas scrim pill di sekitarnya, tapi ikutan mengganti bentuk ikonnya, jadi
  > tidak sesuai maksud aslinya. Dikembalikan ke bentuk mouse+chevron
  > (`.scroll-cue__mouse`/`__dot`/`__chevrons`) sambil scrim-nya tetap dilepas.

  Hilang (`.is-hidden`) begitu `scrollY > 60`, muncul lagi kalau balik ke atas.
  **`position: fixed` di dasar viewport, bukan di alur normal Hero** — ini
  disengaja: tinggi Hero bisa ~1300px di layar sempit sementara viewport hanya
  ~790px, jadi kalau ditaruh di alur normal petunjuknya justru jatuh ~400px di
  bawah lipatan alias tidak terlihat persis saat paling dibutuhkan (ini sempat
  terjadi & ketahuan waktu diukur). Dipusatkan pakai `left/right:0 + margin
  auto`, **bukan** `translateX(-50%)`. Elemennya `<a href="#program">`, jadi
  sekali klik juga langsung membawa ke section berikutnya.
- `prefers-reduced-motion: reduce` mematikan seluruh animasi & smooth scroll
  (termasuk animasi bob petunjuk scroll — elemennya tetap tampil & bisa diklik)

---

## Hasil verifikasi

Diuji langsung di browser pada 375px (mobile) dan 768px:

| Cek | Hasil |
|-----|-------|
| Horizontal overflow | 0px di 375px dan 768px |
| Touch target | Semua tombol/link non-inline ≥ 44×44px |
| Kontras teks (WCAG AA) | Body 9,95:1 · H1 18,61:1 · teks tersier 6,01:1 · CTA putih di gradient 5,24–9,08:1 · badge LIVE 4,85:1 |
| Font | Source Sans 3 termuat, Phosphor termuat, tidak ada emoji sebagai ikon |
| Modal — grid → instruksi | Klik tile → tampilan ganti ke instruksi (Samsung 4 langkah dari `GUIDES.samsunglg`; LG & Sony 5 langkah dari `GUIDES.playstore`, step 1 = "Pastikan Akun Google Anda Sama") sesuai `GUIDES` yang benar; tombol akhir & label sesuai merek, membuka URL yang tepat tanpa navigasi halaman ini ikut pindah |
| Modal — tombol kembali | Balik ke grid, fokus kembali ke tile pertama |
| Modal — teks reassurance | Link "di sini" mengalir wajar di dalam paragraf (bukan melompat ke kanan sebagai kolom flex terpisah) |
| Modal | Focus trap aktif, Esc menutup, fokus kembali ke tombol pemicu, scroll body terkunci |
| Stepper | Ganti tab me-reset ke langkah 1, prev/next disabled di ujung, progress bar sinkron |
| Navigasi keyboard | Tablist ← → Home End berfungsi, skip-link ada, focus ring terlihat |
| Asset Hero | `hero-tv.png` termuat, ukuran natural 1400×1164, chip "Live 24 Jam" & "Kualitas HD" tampil di atasnya (z-index benar), tidak overlap konten sibuk pada foto |
| Foto langkah — ketiga tab | Android TV & Samsung/LG TV: 4 foto/tab termuat (900×1125), urutan `src` sejajar step aktif. Google Play sekarang 5 langkah (bukan 6 — "Klik Install" sudah digabung ke "Pilih Install di Perangkat Lain"): step 1-3 foto `playstore/1-3.jpg`, step 4 `playstore/4.jpg`, step 5 "Selesai" pakai `guide/android/4.jpg` (dicek satu-satu lewat `src`/`hidden` tiap step, bukan cuma tab default) |
| Cara Install — kotak "Aplikasi tidak muncul?" | `#guideFallback` sudah tidak ada di DOM (dicek di ketiga tab) |
| Modal — kotak "Tidak menemukan merek TV" | `.modal__reassure` netral: bg `rgba(255,255,255,.04)` / border `rgba(255,255,255,.09)` (bukan lagi merah), ikon & link `var(--text-mid)`/`var(--text-hi)` |
| Modal — toggle "instal langsung di TV" | Warna teks putih netral (`rgb(242,246,255)` = `var(--text-hi)`), bukan merah |

| Modal — urutan tile | LG, Sony, TCL, Xiaomi, Infinix, **Samsung terakhir** |
| Modal — Samsung | CTA tampil & `disabled`, label "Segera Hadir", kelas `.btn--soon` aktif → `opacity:1`, bg `rgba(255,255,255,.063)`, teks `#A9B7D0`, `cursor:not-allowed`; **kontras label 7,93:1** (vs ~1,5:1 kalau pakai `[disabled]` default) |
| Modal — Samsung → toggle | Klik "Ingin install langsung dari TV Anda?" → modal tertutup, tab aktif jadi `samsunglg` (label "Samsung TV", 4 langkah, step 1 "Buka Menu Apps di TV"), halaman ter-scroll ke `#panduan` (top 115px) |
| Modal — LG | `data-group="android"`, OS "Android TV", guide `GUIDES.playstore`, CTA "Buka Google Play" aktif |
| Cara Install — label tab | "Android TV / Google TV" · "Samsung TV" · "Lewat Google Play (HP/Laptop)" — LG sudah tidak muncul |
| Step link Google Play — 1 frame | `.step` step 2 = `<div role="button">` (bukan `<button>`); `<a>` "Kunjungi Playstore Sekarang" ada **di dalam** `.step__d` yang sama (`link.parentElement === desc`), bukan elemen adik terpisah lagi. Klik area kartu (bukan link) → step terpilih (`stepCount` update). Klik link langsung → href tetap benar, tidak error, step yang sudah aktif tidak berubah. Keyboard: `focus()` + `keydown Enter` pada kartu → step terpilih tanpa perlu klik. Link yang sama otomatis muncul juga di `#brandDetailSteps` (modal), sumbernya field `d` yang sama |
| Petunjuk scroll Hero — bentuk ikon | Kembali ke mouse+dot+chevron buatan CSS (bukan lagi ikon flat Phosphor) — `.scroll-cue__mouse` border `1.6px solid`, radius `999px`; 3 `.scroll-cue__chevron` dgn `animation-delay` bertingkat `0s/0.18s/0.36s`. Kontainer luar (`.scroll-cue`) tetap tanpa background/border |
| Navbar — tinggi 80px | `.nav__inner` computed height `80px` (naik dari `66px`) di desktop maupun 375px mobile; drawer (`top:100%` relatif ke `.nav`) otomatis ikut turun, tidak perlu penyesuaian terpisah |
| Foto langkah — refresh terbaru | `android/2.jpg`, `android/3.jpg`, `playstore/1.jpg`, `samsunglg/3.jpg` termuat ulang (900×1125) di step yang benar (dicek `src` + `naturalWidth/Height` per step, bukan cuma cek file ada) |
| Favicon | Kedua URL (`kompastv64.ico`, `kompastvicon.png`) dicek langsung lewat `curl` (200, tipe konten benar) sebelum dipasang, lalu dicek ulang di browser lewat `new Image()` — keduanya termuat 64×64 |

> Diverifikasi lewat origin `http://localhost` sungguhan, bukan snapshot.
> Preview bawaan sesi ini me-render `file://` sebagai `data:` URL (JS & CSS
> eksternal tidak ikut termuat), jadi project di-serve dulu lewat static
> server PowerShell kecil di `scratchpad/serve.ps1` (port 8099, `no-store`).
> Dua keanehan yang **bukan** bug produk, hanya friksi alat ukur: (1)
> `window.scrollTo()` tidak jalan karena `html { scroll-behavior: smooth }`
> menganimasikannya — harus set `scrollBehavior='auto'` dulu atau pakai wheel
> event sungguhan; (2) tool screenshot sesekali mengembalikan frame hitam di
> posisi scroll dalam, padahal pengukuran DOM menunjukkan elemennya ada &
> ter-render.

Perubahan terbaru juga dicek ulang di **375px (mobile)**: 0 horizontal overflow
(baik saat modal tertutup maupun terbuka), petunjuk scroll tetap utuh & center
di dalam viewport, tombol "Segera Hadir" tidak melebar keluar layar, dan link
"Kunjungi Playstore Sekarang" tetap sejajar dengan teks langkahnya (109px vs
110px) tanpa mendorong lebar halaman.

**Belum diuji:** perangkat fisik (iOS Safari, Smart TV browser).
