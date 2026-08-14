/* ============================================================================
   Kompas TV — Smart TV Landing Page
   Vanilla JS. No build step, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     KONFIGURASI LINK STORE
     Ubah di sini kalau URL store berubah — tidak ada URL lain di file ini.
     ══════════════════════════════════════════════════════════════════════ */
  var STORE = {
    // Android TV / Google TV → Google Play (package resmi Kompas TV)
    playPackage: 'tv.kompas.kompastv',
    // Parameter `referrer` dibaca Google Play untuk atribusi campaign — muncul di
    // Play Console → Acquisition reports, dan diteruskan ke app lewat Install
    // Referrer API. Isinya WAJIB di-encode (= jadi %3D, & jadi %26), kalau tidak
    // akan terbaca sebagai parameter terpisah milik URL Play Store dan hilang.
    playWeb:     'https://play.google.com/store/apps/details?id=tv.kompas.kompastv&referrer=utm_source%3Dapp.kompas.tv%26utm_medium%3Dreferral%26utm_campaign%3Dsmarttv_landing',
    // Fallback untuk pengguna iOS yang membuka landing page ini dari iPhone/iPad
    appStore:    'https://apps.apple.com/id/app/kompas-tv-live-streaming/id539944871',
    // Samsung Tizen
    samsung:     'https://www.samsung.com/us/tvs/smart-tv/samsung-tv-apps/',
    // LG webOS — LG Content Store
    lg:          'https://us.lgappstv.com/main'
  };

  /* ══════════════════════════════════════════════════════════════════════
     HELPERS
     ══════════════════════════════════════════════════════════════════════ */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var UA = navigator.userAgent || '';
  var isIOS     = /iPad|iPhone|iPod/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(UA);
  var isMobile  = isIOS || isAndroid || window.matchMedia('(pointer: coarse)').matches;

  function openExternal(url) {
    // PENTING: jangan pakai 'noopener' di argumen window.open — sebagian besar
    // browser SELALU mengembalikan null saat noopener dipakai (bahkan saat tab
    // baru berhasil terbuka), sehingga deteksi "popup diblokir" jadi salah dan
    // ikut me-redirect halaman ini juga. Sebagai gantinya, buka biasa lalu putus
    // referensi opener secara manual — hasilnya sama amannya tanpa bug itu.
    var w = window.open(url, '_blank');
    if (w) {
      w.opener = null;
    } else {
      // Benar-benar diblokir browser — jangan alihkan halaman ini, cukup beri tahu.
      toast('Popup diblokir browser. Izinkan pop-up untuk situs ini, lalu coba lagi.', 'warning-circle');
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     TOAST
     ══════════════════════════════════════════════════════════════════════ */
  var toastEl = $('#toast');
  var toastTimer;

  function toast(msg, icon) {
    if (!toastEl) return;
    toastEl.innerHTML = '<i class="ph-bold ph-' + (icon || 'info') + '" aria-hidden="true"></i><span></span>';
    $('span', toastEl).textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4000);
  }

  /* ══════════════════════════════════════════════════════════════════════
     NAVBAR — sticky state, mobile drawer, scroll spy
     ══════════════════════════════════════════════════════════════════════ */
  var nav    = $('#nav');
  var burger = $('#navBurger');
  var drawer = $('#navDrawer');
  var scrim  = $('#navScrim');

  // Navbar sembunyi saat scroll ke bawah, muncul lagi saat scroll ke atas.
  var lastScrollY   = window.scrollY;
  var HIDE_AFTER_PX = 96;  // navbar tetap tampil selama masih dekat atas halaman
  var SCROLL_DEADZONE = 6; // abaikan gerakan scroll kecil (rubber-band / trackpad jitter)

  var onScroll = throttle(function () {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 12);

    // Saat drawer mobile terbuka, jangan sembunyikan navbar — drawer menempel di dalamnya.
    if (drawer && !drawer.hidden) { lastScrollY = y; return; }

    var delta = y - lastScrollY;
    if (y <= HIDE_AFTER_PX) {
      nav.classList.remove('is-hidden');
    } else if (delta > SCROLL_DEADZONE) {
      nav.classList.add('is-hidden');       // scroll ke bawah → sembunyikan
    } else if (delta < -SCROLL_DEADZONE) {
      nav.classList.remove('is-hidden');    // scroll ke atas → tampilkan
    }
    lastScrollY = y;
  }, 100);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open;
    scrim.hidden  = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    document.body.classList.toggle('is-locked', open);
    if (open) nav.classList.remove('is-hidden'); // pastikan navbar+drawer terlihat saat dibuka
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setDrawer(drawer.hidden);
    });
  }
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  $$('[data-nav-mobile]').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });

  // Scroll spy
  var navLinks = $$('[data-nav]');
  var sections = navLinks
    .map(function (l) { return $(l.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = '#' + e.target.id;
        navLinks.forEach(function (l) {
          var on = l.getAttribute('href') === id;
          l.classList.toggle('is-active', on);
          if (on) { l.setAttribute('aria-current', 'true'); }
          else    { l.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ══════════════════════════════════════════════════════════════════════
     REVEAL ON SCROLL
     ══════════════════════════════════════════════════════════════════════ */
  var revealEls = $$('[data-reveal]');
  revealEls.forEach(function (el) {
    el.style.setProperty('--d', el.dataset.delay || 0);
  });

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCROLL TO TOP — muncul begitu user melewati section Program Unggulan
     ══════════════════════════════════════════════════════════════════════ */
  var scrollTopBtn = $('#scrollTop');
  var programSection = $('#program');

  if (scrollTopBtn && programSection) {
    if ('IntersectionObserver' in window) {
      // Tombol muncul begitu #program keluar dari viewport bagian atas (sudah
      // dilewati saat scroll ke bawah), dan hilang lagi begitu user scroll
      // balik ke atas hingga #program terlihat lagi.
      var scrollTopSpy = new IntersectionObserver(function (entries) {
        var e = entries[0];
        // isIntersecting = false & boundingClientRect di atas viewport (top < 0)
        // berarti section sudah terlewati ke atas (user sudah scroll ke bawah).
        var passed = !e.isIntersecting && e.boundingClientRect.top < 0;
        scrollTopBtn.classList.toggle('is-visible', passed);
      }, { threshold: 0 });
      scrollTopSpy.observe(programSection);
    } else {
      // Fallback tanpa IntersectionObserver: pakai posisi scroll biasa.
      window.addEventListener('scroll', function () {
        var passed = window.scrollY > programSection.offsetTop + programSection.offsetHeight;
        scrollTopBtn.classList.toggle('is-visible', passed);
      }, { passive: true });
    }

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     PETUNJUK SCROLL DI HERO — hilang begitu user mulai scroll
     ══════════════════════════════════════════════════════════════════════ */
  var scrollCue = $('#scrollCue');
  if (scrollCue) {
    var HIDE_CUE_AFTER_PX = 60;
    var syncCue = function () {
      scrollCue.classList.toggle('is-hidden', window.scrollY > HIDE_CUE_AFTER_PX);
    };
    window.addEventListener('scroll', syncCue, { passive: true });
    syncCue(); // halaman bisa saja dibuka dalam kondisi sudah ter-scroll (reload/anchor)
  }

  /* ══════════════════════════════════════════════════════════════════════
     MODAL — pilih merek Smart TV → arahkan ke store yang tepat
     ══════════════════════════════════════════════════════════════════════ */
  var modal            = $('#installer');
  var panel            = $('.modal__panel', modal);
  var brandGridView    = $('#brandGridView');
  var brandDetailView  = $('#brandDetailView');
  var brandDetailBack  = $('#brandDetailBack');
  var brandDetailHead   = $('#brandDetailHead');
  var brandDetailSteps  = $('#brandDetailSteps');
  var brandDetailToggle = $('#brandDetailToggle');
  var brandDetailCta    = $('#brandDetailCta');
  var lastFocus         = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    setDrawer(false);
    showBrandGrid(); // selalu mulai dari grid merek, bukan dari instruksi terakhir
    var first = $('.brand-tile', brandGridView);
    if (first) first.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$('[data-open-installer]').forEach(function (b) {
    b.addEventListener('click', openModal);
  });
  $$('[data-close-installer]').forEach(function (b) {
    b.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;

    // Focus trap — exclude elemen disabled: elemen disabled tidak bisa
    // menerima focus() sama sekali, jadi kalau dia kebetulan jadi elemen
    // pertama/terakhir, wrap-around Tab/Shift+Tab bisa gagal diam-diam
    // (focus tidak pindah ke mana pun). Ini nyata terpakai: tombol
    // "Segera Hadir" milik Samsung memang disabled.
    var f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', panel)
      .filter(function (el) { return el.offsetParent !== null && !el.disabled; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ─── Routing per merek ───────────────────────────────────────────────────
     Catatan: Samsung TIDAK punya tombol store di sini — tidak bisa diinstall
     langsung lewat link store dari perangkat ini (Samsung TV Apps hanya
     halaman info umum, bukan link instalasi). Instruksinya cukup
     langkah-langkah yang dilakukan di TV (lihat GUIDES.samsunglg) — modal
     berhenti di daftar langkah, tanpa CTA (link "install langsung di TV" di
     #brandDetailToggle tetap tampil, lihat showBrandDetail()). LG TIDAK di
     sini lagi — di modal ini LG diperlakukan sebagai brand Android TV
     (data-group="android" di index.html), jadi selalu masuk case 'android'
     di bawah. */
  function handleBrand(brand) {
    switch (brand) {
      case 'android':
        // Di HP Android, link Play Store web otomatis membuka aplikasi Play Store.
        // Di iOS, arahkan ke App Store agar user bisa install di perangkatnya dulu.
        // Di desktop/laptop, buka halaman web Play Store.
        if (isIOS) {
          toast('Membuka App Store — untuk TV, install lewat Google Play.', 'apple-logo');
          openExternal(STORE.appStore);
        } else {
          // Di HP Android link ini otomatis dibuka oleh aplikasi Play Store;
          // di desktop/laptop terbuka sebagai halaman web Google Play.
          toast(isMobile ? 'Membuka Google Play…' : 'Membuka Google Play di tab baru.', 'google-play-logo');
          openExternal(STORE.playWeb);
        }
        break;

      default:
        return; // seharusnya tidak pernah terjadi — CTA hanya tampil untuk brand Android TV
    }
    closeModal();
  }

  /* ─── Tampilan instruksi singkat setelah merek dipilih (di dalam modal) ──
     Samsung satu-satunya grup yang BUKAN Android TV di modal ini — pakai
     langkah "samsunglg" (dilakukan langsung di TV, tidak ada CTA store, lihat
     catatan di handleBrand). Semua brand lain (Sony/TCL/Xiaomi/Infinix, DAN
     LG — LG sengaja diperlakukan sebagai Android TV di modal, lihat komentar
     di tile-nya di index.html) pakai langkah "playstore" — karena landing
     page ini dibuka dari HP/laptop, memandu lewat Google Play di perangkat
     yang sedang dipegang user lebih relevan. Ada link #brandDetailToggle
     ("Ingin install langsung dari TV Anda?") untuk SEMUA merek — untuk brand
     Android TV ini alternatif ke tab #panduan yang menunjukkan cara instal
     langsung di TV; untuk Samsung ini juga jalan keluar karena Samsung tidak
     punya CTA store. Klik toggle menutup modal, tidak pernah mengubah langkah
     di dalam modal itu sendiri. ────────────────────────────────────────────── */
  var ANDROID_ONLY_GROUPS = { samsung: true }; // satu-satunya brand YANG BUKAN Android TV di modal
  function isAndroidGroup(group) { return !ANDROID_ONLY_GROUPS[group]; }

  function guideKeyForGroup(group) {
    return group === 'samsung' ? 'samsunglg' : 'playstore';
  }
  function ctaLabelForGroup(group) {
    return 'Buka Google Play'; // hanya brand Android TV yang punya CTA ini
  }
  // Tab #panduan yang dituju toggle "Ingin install langsung dari TV Anda?" —
  // beda dari guideKeyForGroup() di atas: brand Android TV di modal defaultnya
  // menunjukkan guide "playstore" (HP/laptop), tapi toggle-nya sengaja
  // menawarkan ALTERNATIF ke tab "android" (langsung di TV). Untuk Samsung,
  // yang di modal memang sudah menunjukkan langkah langsung-di-TV, toggle-nya
  // mengarah ke tab "samsunglg" (guide lengkap dengan foto, bukan versi
  // ringkas di modal).
  function toggleTabForGroup(group) {
    return group === 'samsung' ? 'samsunglg' : 'android';
  }
  function brandDetailStepHTML(step, i) {
    return '<li class="brand-detail__step">' +
      '<span class="brand-detail__step-num">' + (i + 1) + '</span>' +
      '<span class="brand-detail__step-text">' +
        '<strong>' + step.t + '</strong>' +
        '<span class="brand-detail__step-desc">' + step.d + '</span>' +
      '</span>' +
    '</li>';
  }

  function showBrandGrid() {
    brandGridView.hidden = false;
    brandDetailView.hidden = true;
  }

  function showBrandDetail(tile) {
    var group   = tile.dataset.group;
    var name    = $('.brand-tile__name', tile).textContent;
    var os      = $('.brand-tile__os', tile).textContent;
    var icoHTML = $('.brand-tile__ico', tile).innerHTML;
    var guide   = GUIDES[guideKeyForGroup(group)];

    brandDetailHead.innerHTML =
      '<span class="brand-tile__ico">' + icoHTML + '</span>' +
      '<span class="brand-detail__head-text"><h3>' + name + '</h3><span class="brand-detail__os">' + os + '</span></span>';

    brandDetailSteps.innerHTML = guide.steps.map(brandDetailStepHTML).join('');

    // CTA beda per grup:
    // - Android TV (termasuk LG) → "Buka Google Play", aktif, benar-benar
    //   membuka store.
    // - Samsung → "Segera Hadir", DISABLED. Aplikasinya belum rilis di Tizen,
    //   jadi tidak ada yang bisa dibuka — tombolnya tetap ditampilkan (bukan
    //   disembunyikan) supaya user tahu statusnya, bukan mengira fiturnya
    //   hilang. Jalan keluarnya lewat link toggle di bawah, yang tetap tampil.
    brandDetailCta.onclick = null; // reset dulu, supaya tidak ada handler nyangkut dari brand sebelumnya
    brandDetailCta.hidden = false;
    brandDetailCta.classList.toggle('btn--soon', !isAndroidGroup(group));
    if (isAndroidGroup(group)) {
      brandDetailCta.disabled = false;
      brandDetailCta.innerHTML =
        '<i class="ph-bold ph-arrow-square-out" aria-hidden="true"></i><span>' + ctaLabelForGroup(group) + '</span>';
      brandDetailCta.onclick = function () { handleBrand(group); };
    } else {
      brandDetailCta.disabled = true;
      brandDetailCta.innerHTML =
        '<i class="ph-bold ph-clock" aria-hidden="true"></i><span>Segera Hadir</span>';
    }

    // Link "Ingin install langsung dari TV Anda?" — tampil untuk SEMUA
    // merek (bukan cuma Android TV lagi). Klik-nya menutup modal & membawa
    // ke tab #panduan yang sesuai (lihat toggleTabForGroup() & listener
    // #brandDetailToggle di bawah) — bukan mengubah apa pun di modal ini.
    // `dataset.group` dipakai listener klik-nya untuk tahu tab tujuan yang
    // benar tanpa perlu state tambahan di luar tombol ini.
    brandDetailToggle.hidden = false;
    brandDetailToggle.dataset.group = group;
    brandDetailToggle.innerHTML =
      '<i class="ph-bold ph-television-simple" aria-hidden="true"></i><span>Ingin install langsung dari TV Anda? Lihat caranya</span>';

    brandGridView.hidden = true;
    brandDetailView.hidden = false;
    brandDetailBack.focus();
  }

  // Grid di dalam modal — klik merek tampilkan instruksi dulu, belum langsung pindah.
  $('#brands').addEventListener('click', function (e) {
    var tile = e.target.closest ? e.target.closest('.brand-tile') : null;
    if (tile) showBrandDetail(tile);
  });

  // "Ingin install langsung dari TV Anda? Lihat caranya" — tutup modal,
  // ganti tab Panduan Install sesuai merek yang sedang tampil
  // (toggleTabForGroup, dibaca dari dataset.group yang di-set showBrandDetail),
  // lalu scroll ke section-nya. setPlatform() & stopAuto() didefinisikan lebih
  // bawah di file ini, tapi aman dipanggil di sini karena function declaration
  // di-hoist dan handler ini baru jalan setelah seluruh script selesai
  // dieksekusi (dipicu klik user).
  brandDetailToggle.addEventListener('click', function () {
    var targetTab = toggleTabForGroup(brandDetailToggle.dataset.group);
    closeModal();
    stopAuto();
    setPlatform(targetTab);
    var panduan = $('#panduan');
    if (panduan) panduan.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  });

  brandDetailBack.addEventListener('click', function () {
    showBrandGrid();
    var first = $('.brand-tile', brandGridView);
    if (first) first.focus();
  });

  /* ══════════════════════════════════════════════════════════════════════
     PANDUAN INSTALL MANUAL — data per platform
     Catatan: field `note` di tiap guide TIDAK ditampilkan di mana pun saat
     ini (kotak "Aplikasi tidak muncul?" di section #panduan & di modal
     install sudah dihapus atas permintaan) — sengaja dipertahankan sebagai
     data kalau suatu saat butuh ditampilkan lagi di tempat lain.
     ══════════════════════════════════════════════════════════════════════ */
  var GUIDES = {
    android: {
      label: 'Android TV / Google TV',
      note: 'Belum ketemu juga? Pastikan TV terhubung internet dan sudah login dengan <strong>Akun Google</strong>. Anda juga bisa install dari HP/laptop lewat <a href="' + STORE.playWeb + '" target="_blank" rel="noopener">halaman Google Play</a> — pilih Smart TV Anda sebagai perangkat tujuan.',
      steps: [
        {
          t: 'Buka Google Play Store di TV',
          d: 'Dari layar Home, cari ikon Play Store di deretan aplikasi, lalu tekan.',
          screen: gridScreen('Home', 'Pilih Google Play Store', ['ph-television-simple', 'ph-play-circle', 'ph-google-play-logo', 'ph-gear'], 2, 'ph-house')
        },
        {
          t: 'Cari Kompas TV Melalui Pencarian',
          d: 'Buka kolom search, dan ketikan Kompas TV.',
          screen: searchScreen('Google Play Store', 'Kompas TV')
        },
        {
          t: 'Pilih Aplikasi Lalu Install',
          d: 'Setelah ketemu app Kompas TV, kamu bisa klik atau tekan untuk menginstall dan menunggu prosesnya selesai.',
          screen: resultScreen('Kompas TV — Live Streaming', 'Kompas TV · Berita', 'Install', false)
        },
        {
          t: 'Selesai',
          d: 'Aplikasi akan muncul dalam deretan aplikasi Anda.',
          screen: resultScreen('Kompas TV — Live Streaming', 'Terpasang di TV Anda', 'Buka', true)
        }
      ]
    },

    // Key-nya masih "samsunglg" (historis) tapi isinya SAMSUNG SAJA — LG sudah
    // dihapus dari tab ini atas permintaan & sekarang lewat jalur Android TV /
    // Google Play. Key sengaja tidak di-rename supaya id tab, data-guide-tab,
    // SHOT_IMAGES, dan folder assets/img/guide/samsunglg/ tetap sinkron.
    samsunglg: {
      label: 'Samsung TV',
      note: 'Aplikasi tidak muncul? Pastikan TV Anda tersambung internet dan region toko sudah diset ke Indonesia. Pastikan juga sudah login <strong>Samsung Account</strong> (TV keluaran 2017 ke atas). Cek juga ketersediaan aplikasi di <a href="' + STORE.samsung + '" target="_blank" rel="noopener">Samsung TV Apps</a>.',
      steps: [
        {
          t: 'Buka Menu Apps di TV',
          d: 'Tekan Home pada remote Anda, kemudian pilih menu Apps.',
          screen: gridScreen('Smart Hub / Home Launcher', 'Tekan Home, pilih Apps', ['ph-house', 'ph-play-circle', 'ph-squares-four', 'ph-gear'], 2, 'ph-house')
        },
        {
          t: 'Cari Kompas TV Melalui Pencarian',
          d: 'Buka kolom search, dan ketikan Kompas TV.',
          screen: searchScreen('Cari Aplikasi', 'Kompas TV')
        },
        {
          t: 'Pilih Aplikasi Lalu Install',
          d: 'Setelah ketemu app Kompas TV, kamu bisa klik atau tekan untuk menginstall dan menunggu prosesnya selesai.',
          screen: resultScreen('Kompas TV — Live Streaming', 'Kompas TV · Berita', 'Install', false)
        },
        {
          t: 'Selesai',
          d: 'Aplikasi akan muncul dalam deretan aplikasi Anda.',
          screen: resultScreen('Kompas TV — Live Streaming', 'Terpasang di TV Anda', 'Buka', true)
        }
      ]
    },

    playstore: {
      label: 'Lewat Google Play (HP/Laptop)',
      note: 'Opsi "Instal di perangkat lain" tidak muncul? Coba buka Google Play lewat <strong>browser di komputer/laptop</strong> (bukan aplikasi Play Store di HP) — tampilan ini paling lengkap di sana. Pastikan juga Smart TV Anda sudah pernah dinyalakan dan tersambung internet minimal sekali.',
      steps: [
        {
          t: 'Pastikan Akun Google Anda Sama',
          d: 'Sebelum mulai, pastikan akun Google yang Anda gunakan pada laptop/HP dengan yang ada pada Smart TV itu menggunakan akun yang sama ya.',
          screen: resultScreen('Akun Google Anda', 'Harus sama dengan akun di Smart TV', 'Lanjut', false, 'Sudah dicek?', 'ph-check', 'ph-user-circle')
        },
        {
          t: 'Buka atau Kunjungi Google Play Store',
          // Link CTA ditulis MENYATU di akhir kalimat deskripsi (bukan elemen
          // terpisah) — dirender lewat innerHTML sama seperti <strong>/<a> di
          // GUIDES.*.note lain, jadi otomatis ikut tampil di dalam kartu
          // langkah yang sama (satu frame utuh, bukan dua blok terpisah).
          d: 'Kunjungi Google Play Store melalui website atau aplikasi pada smartphone Android Anda. <a href="' + STORE.playWeb + '" target="_blank" rel="noopener">Kunjungi Playstore Sekarang</a>.',
          screen: searchScreen('Google Play', '', 'Ketik nama aplikasi', 'ph-cursor-click')
        },
        {
          t: 'Cari Kompas TV Melalui Pencarian',
          d: 'Masuk ke kolom search dan ketikan Kompas TV.',
          screen: searchScreen('Google Play', 'Kompas TV', 'Klik hasil pencarian', 'ph-cursor-click')
        },
        {
          t: 'Pilih Install di Perangkat Lain',
          d: 'Silakan pilih install pada perangkat lain, pilih tipe Smart TV Anda, lalu klik Install dan tunggu prosesnya hingga selesai.',
          screen: gridScreen('Google Play', 'Instal di perangkat lain', ['ph-device-mobile', 'ph-television-simple', 'ph-laptop', 'ph-device-tablet'], 1, 'ph-google-play-logo', 'Klik untuk pilih', 'ph-cursor-click')
        },
        {
          t: 'Selesai',
          d: 'Jika sudah selesai maka aplikasi akan muncul dalam deretan aplikasi pada Smart TV Anda.',
          screen: resultScreen('Kompas TV — Live Streaming', 'Terpasang di Smart TV Anda', 'Buka', true, 'Cek TV Anda', 'ph-television-simple')
        }
      ]
    }
  };

  /* ─── Template layar mock (dipakai di dalam bingkai TV) ─────────────────
     Parameter "hint"/"hintIcon" opsional — dipakai untuk tab yang bukan
     dioperasikan lewat remote TV (misalnya tab Google Play di HP/laptop,
     yang dikontrol pakai klik/tap, bukan tombol remote). ─────────────────── */
  function gridScreen(label, title, icons, focusIndex, labelIcon, hint, hintIcon) {
    var tiles = icons.map(function (ic, i) {
      return '<span class="ss__tile' + (i === focusIndex ? ' is-focused' : '') + '">' +
             '<i class="ph-bold ' + ic + '" aria-hidden="true"></i></span>';
    }).join('');
    return '<span class="ss__label"><i class="ph-bold ' + (labelIcon || 'ph-house') + '" aria-hidden="true"></i>' + label + '</span>' +
           '<h4 class="ss__title">' + title + '</h4>' +
           '<div class="ss__grid">' + tiles + '</div>' +
           remote(hint || 'Tekan OK', hintIcon);
  }

  function searchScreen(label, query, hint, hintIcon) {
    return '<span class="ss__label"><i class="ph-bold ph-magnifying-glass" aria-hidden="true"></i>' + label + '</span>' +
           '<h4 class="ss__title">Cari aplikasi</h4>' +
           '<div class="ss__search"><i class="ph-bold ph-magnifying-glass" aria-hidden="true"></i>' +
             '<span>' + (query || '<span style="opacity:.45">Ketik nama aplikasi…</span>') + '</span>' +
             '<span class="ss__caret"></span>' +
           '</div>' +
           (query ? '<div class="ss__result"><span class="ss__result-ico"><i class="ph-fill ph-television-simple" aria-hidden="true"></i></span>' +
             '<span class="ss__result-txt"><strong>Kompas TV</strong><small>Hasil teratas</small></span></div>' : '') +
           remote(hint || (query ? 'Pilih hasil' : 'Ketik dengan remote'), hintIcon);
  }

  function resultScreen(name, sub, cta, done, hint, hintIcon, icon) {
    return '<span class="ss__label"><i class="ph-bold ph-storefront" aria-hidden="true"></i>Detail Aplikasi</span>' +
           '<h4 class="ss__title">' + (done ? 'Berhasil terpasang' : 'Siap dipasang') + '</h4>' +
           '<div class="ss__result">' +
             '<span class="ss__result-ico"><i class="ph-fill ph-' + (icon || (done ? 'check' : 'television-simple')) + '" aria-hidden="true"></i></span>' +
             '<span class="ss__result-txt"><strong>' + name + '</strong><small>' + sub + '</small></span>' +
             '<span class="ss__cta' + (done ? ' ss__cta--done' : '') + '">' + cta + '</span>' +
           '</div>' +
           (done ? '' : '<div class="ss__bar"><span></span></div>') +
           remote(hint || (done ? 'Tekan Buka' : 'Tekan OK untuk Install'), hintIcon);
  }

  function remote(text, icon) {
    return '<span class="ss__remote"><i class="ph-bold ' + (icon || 'ph-arrows-out-cardinal') + '" aria-hidden="true"></i>' + text + '</span>';
  }

  /* ─── State & render ──────────────────────────────────────────────────── */
  var current = 'android';
  var index   = 0;
  var autoTimer = null;

  var stepScreen   = $('#stepScreen');
  var stepsList    = $('#stepsList');
  var guideBar     = $('#guideBar');
  var stepCount    = $('#stepCount');
  var btnPrev      = $('#stepPrev');
  var btnNext      = $('#stepNext');
  var guidePanel   = $('#guidePanel');
  var tvMock       = $('#tvMock');
  var guideShot    = $('#guideShot');
  var guideShotImg = $('#guideShotImg');

  // Screenshot produk asli per guide. Urutan array HARUS sejajar dengan
  // urutan GUIDES[key].steps. Kalau elemennya `undefined`/index-nya tidak
  // ada, renderScreen() otomatis fallback ke mockup .tv buatan CSS untuk
  // step itu saja (tidak mempengaruhi step lain di guide yang sama).
  var SHOT_IMAGES = {
    android: [
      'assets/img/guide/android/1.jpg',
      'assets/img/guide/android/2.jpg',
      'assets/img/guide/android/3.jpg',
      'assets/img/guide/android/4.jpg'
    ],
    samsunglg: [
      'assets/img/guide/samsunglg/1.jpg',
      'assets/img/guide/samsunglg/2.jpg',
      'assets/img/guide/samsunglg/3.jpg',
      'assets/img/guide/samsunglg/4.jpg'
    ],
    // 5 langkah teks, 5 foto — "Pilih Install di Perangkat Lain" (step 4)
    // sekarang juga mencakup teks "klik Install" (step lamanya sudah
    // digabung, karena keduanya memang satu dialog yang sama di Google
    // Play asli). Step "Selesai" (index 4) tidak punya foto Google Play-nya
    // sendiri (instalasinya rampung di TV, bukan di laptop/HP ini) — sengaja
    // dipakaikan foto step "Selesai" dari tab Android TV (`Google TV/4.png`)
    // supaya tetap ada foto TV sungguhan yang menutup alurnya, bukan mock CSS.
    playstore: [
      'assets/img/guide/playstore/1.jpg',
      'assets/img/guide/playstore/2.jpg',
      'assets/img/guide/playstore/3.jpg',
      'assets/img/guide/playstore/4.jpg',
      'assets/img/guide/android/4.jpg'
    ]
  };

  function renderSteps() {
    var g = GUIDES[current];
    // Kartu tiap langkah SENGAJA <div role="button">, bukan <button>: kalau
    // deskripsi langkahnya (s.d) mengandung link (lihat GUIDES.playstore step
    // 2), link itu perlu jadi bagian dalam kartu yang sama — <a> di dalam
    // <button> itu HTML tidak valid (link-nya jadi tidak bisa diklik dengan
    // benar), tapi <a> di dalam <div> sah-sah saja. Karena bukan elemen
    // <button> sungguhan, keyboard activation (Enter/Space) ditangani manual
    // di listener di bawah.
    stepsList.innerHTML = g.steps.map(function (s, i) {
      return '<li>' +
        '<div class="step' + (i === index ? ' is-active' : '') + '" role="button" tabindex="0" data-step="' + i + '"' +
        ' aria-current="' + (i === index ? 'step' : 'false') + '">' +
          '<span class="step__num" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span><span class="step__t">' + s.t + '</span><span class="step__d">' + s.d + '</span></span>' +
        '</div>' +
      '</li>';
    }).join('');

    $$('.step', stepsList).forEach(function (b) {
      b.addEventListener('click', function (e) {
        // Klik link inline (mis. "Kunjungi Playstore Sekarang") biarkan
        // dia yang menangani (buka tab baru) — jangan ikut memilih ulang
        // langkah ini, sudah aktif dengan sendirinya.
        if (e.target.closest('a')) return;
        stopAuto();
        setStep(parseInt(b.dataset.step, 10));
      });
      // Pengganti aktivasi keyboard native <button> (Enter & Space).
      b.addEventListener('keydown', function (e) {
        if (e.target.closest('a')) return; // biarkan Enter di link tetap membuka link
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stopAuto();
          setStep(parseInt(b.dataset.step, 10));
        }
      });
    });
  }

  function renderScreen() {
    var g     = GUIDES[current];
    var shots = SHOT_IMAGES[current];
    var shot  = shots && shots[index];

    if (shot) {
      // Foto produk asli (TV+remote sungguhan) — tampilkan langsung, TANPA
      // mockup bezel .tv (lihat komentar di index.html kenapa).
      guideShot.hidden = false;
      tvMock.hidden = true;
      guideShotImg.src = shot;
      guideShotImg.alt = g.steps[index].t + ' — ' + g.label;
      if (!prefersReduced) {
        guideShotImg.style.animation = 'none';
        void guideShotImg.offsetWidth;
        guideShotImg.style.animation = '';
      }
    } else {
      // Belum ada foto asli untuk guide ini (tab "Lewat Google Play") —
      // pakai mockup UI buatan CSS seperti sebelumnya.
      guideShot.hidden = true;
      tvMock.hidden = false;
      stepScreen.innerHTML = g.steps[index].screen;
      if (!prefersReduced) {
        stepScreen.style.animation = 'none';
        void stepScreen.offsetWidth;
        stepScreen.style.animation = '';
      }
    }
  }

  function setStep(i) {
    var g = GUIDES[current];
    index = Math.max(0, Math.min(i, g.steps.length - 1));

    $$('.step', stepsList).forEach(function (b, n) {
      var on = n === index;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-current', on ? 'step' : 'false');
    });

    renderScreen();
    guideBar.style.width = ((index + 1) / g.steps.length * 100) + '%';
    stepCount.textContent = 'Langkah ' + (index + 1) + ' dari ' + g.steps.length;
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === g.steps.length - 1;
  }

  function setPlatform(key) {
    current = key;
    index = 0;

    $$('.guide__tab').forEach(function (t) {
      var on = t.dataset.guideTab === key;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    guidePanel.setAttribute('aria-labelledby', 'tab-' + key);

    renderSteps();
    setStep(0);
  }

  $$('.guide__tab').forEach(function (t) {
    t.addEventListener('click', function () {
      stopAuto();
      setPlatform(t.dataset.guideTab);
    });
  });

  // Keyboard: panah kiri/kanan berpindah tab (pola ARIA tablist)
  var tabs = $$('.guide__tab');
  tabs.forEach(function (t, i) {
    t.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft')  next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home')       next = tabs[0];
      if (e.key === 'End')        next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      stopAuto();
      setPlatform(next.dataset.guideTab);
      next.focus();
    });
  });

  btnPrev.addEventListener('click', function () { stopAuto(); setStep(index - 1); });
  btnNext.addEventListener('click', function () { stopAuto(); setStep(index + 1); });

  /* ─── Auto-play langkah saat section terlihat (berhenti begitu disentuh) ─ */
  function startAuto() {
    if (prefersReduced || autoTimer) return;
    autoTimer = setInterval(function () {
      var g = GUIDES[current];
      setStep((index + 1) % g.steps.length);
    }, 4200);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  if ('IntersectionObserver' in window) {
    var guideIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? startAuto() : stopAuto(); });
    }, { threshold: 0.35 });
    var guideEl = $('.guide');
    if (guideEl) guideIO.observe(guideEl);
  }

  setPlatform('android');

  /* ══════════════════════════════════════════════════════════════════════
     PROGRAM RAIL — tombol geser (tablet)
     ══════════════════════════════════════════════════════════════════════ */
  var rail = $('#programs');
  $$('[data-rail]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!rail) return;
      var card = $('.prog', rail);
      var step = card ? card.getBoundingClientRect().width + 16 : 320;
      rail.scrollBy({ left: step * parseInt(b.dataset.rail, 10), behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     SMOOTH ANCHOR (dengan offset navbar) + tutup drawer
     ══════════════════════════════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setDrawer(false);
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     UTIL
     ══════════════════════════════════════════════════════════════════════ */
  function throttle(fn, wait) {
    var last = 0, timer;
    return function () {
      var now = Date.now();
      var run = function () { last = now; fn(); };
      if (now - last >= wait) { run(); }
      else { clearTimeout(timer); timer = setTimeout(run, wait - (now - last)); }
    };
  }
})();
