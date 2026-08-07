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
    playWeb:     'https://play.google.com/store/apps/details?id=tv.kompas.kompastv',
    // Fallback untuk pengguna iOS yang membuka landing page ini dari iPhone/iPad
    appStore:    'https://apps.apple.com/id/app/kompas-tv-live-streaming/id539944871',
    // Samsung Tizen
    samsung:     'https://www.samsung.com/us/tvs/smart-tv/samsung-tv-apps/',
    // LG webOS — LG Content Store
    lg:          'https://us.lgappstv.com/main'
  };

  /* ══════════════════════════════════════════════════════════════════════
     DAFTAR MEREK TV — dipakai untuk fitur pencarian pada modal installer.
     "group" menentukan tujuan: 'samsung' | 'lg' | 'android' (→ Google Play).
     "logo" = nama file di assets/img/brands/<logo>.png (aset asli dari tim);
     kalau kosong, badge memakai inisial huruf sebagai pengganti yang jujur
     (bukan logo asli, karena belum ada file logonya).
     Merek yang TIDAK ada di daftar ini akan muncul sebagai "tidak ditemukan"
     saat dicari — artinya belum terverifikasi didukung aplikasi Kompas TV.
     ══════════════════════════════════════════════════════════════════════ */
  var BRANDS = [
    { name: 'Samsung',        os: 'Tizen OS',   group: 'samsung',  logo: 'samsung' },
    { name: 'LG',             os: 'webOS',      group: 'lg',       logo: 'lg' },
    { name: 'Sony',           os: 'Android TV', group: 'android',  logo: 'sony' },
    { name: 'Xiaomi / Mi TV', os: 'Android TV', group: 'android',  logo: 'xiaomi' },
    { name: 'Panasonic',      os: 'Android TV', group: 'android',  logo: 'panasonic' },
    { name: 'Sharp',          os: 'Android TV', group: 'android',  logo: 'sharp' },
    { name: 'TCL',            os: 'Android TV', group: 'android',  logo: 'tcl' },
    { name: 'Polytron',       os: 'Android TV', group: 'android',  logo: 'polytron' },
    { name: 'Realme',         os: 'Android TV', group: 'android',  logo: 'realme' },
    { name: 'Changhong',      os: 'Android TV', group: 'android',  logo: 'changhong' },
    { name: 'Toshiba',        os: 'Android TV', group: 'android',  logo: null },
    { name: 'Hisense',        os: 'Android TV', group: 'android',  logo: null },
    { name: 'Coocaa',         os: 'Android TV', group: 'android',  logo: null }
  ];

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
     MODAL — pilih merek Smart TV → arahkan ke store yang tepat
     ══════════════════════════════════════════════════════════════════════ */
  var modal      = $('#installer');
  var panel      = $('.modal__panel', modal);
  var brandList  = $('#brands');
  var brandInput = $('#brandSearch');
  var brandEmpty = $('#brandEmpty');
  var brandEmptyQuery = $('#brandEmptyQuery');
  var lastFocus  = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    setDrawer(false);
    brandInput.value = '';
    brandEmpty.hidden = true;
    renderBrands(BRANDS);
    // fokus ke kolom cari supaya keyboard user langsung bisa mengetik
    brandInput.focus();
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

    // Focus trap
    var f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', panel)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ─── Routing per merek ───────────────────────────────────────────────── */
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

      case 'samsung':
        toast('Membuka halaman Samsung TV Apps.', 'television-simple');
        openExternal(STORE.samsung);
        break;

      case 'lg':
        toast('Membuka LG Content Store.', 'television-simple');
        openExternal(STORE.lg);
        break;

      default:
        return; // seharusnya tidak pernah terjadi — semua brand punya group valid
    }
    closeModal();
  }

  function goToGuide() {
    var target = $('#panduan');
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () {
      var tab = $('.guide__tab.is-active');
      if (tab) tab.focus({ preventScroll: true });
    }, prefersReduced ? 0 : 650);
  }

  /* ─── Pencarian merek TV ──────────────────────────────────────────────── */
  function initials(name) {
    return name.replace(/\/.*$/, '').trim().charAt(0).toUpperCase();
  }

  function brandRowHTML(b) {
    var logo = b.logo
      ? '<img src="assets/img/brands/' + b.logo + '.png" alt="" onerror="this.remove()" />'
      : '';
    return (
      '<li>' +
        '<button class="brand" type="button" data-group="' + b.group + '">' +
          '<span class="brand__ico">' +
            logo +
            '<span class="brand__initial">' + initials(b.name) + '</span>' +
          '</span>' +
          '<span class="brand__txt">' +
            '<strong>' + b.name + '</strong>' +
            '<small>' + b.os + '</small>' +
          '</span>' +
          '<i class="ph-bold ph-arrow-up-right brand__go" aria-hidden="true"></i>' +
        '</button>' +
      '</li>'
    );
  }

  function renderBrands(list) {
    brandList.innerHTML = list.map(brandRowHTML).join('');
    brandList.hidden = list.length === 0;
  }

  function filterBrands(query) {
    var q = query.trim().toLowerCase();
    if (!q) return BRANDS;
    return BRANDS.filter(function (b) { return b.name.toLowerCase().indexOf(q) !== -1; });
  }

  function runSearch() {
    var query = brandInput.value;
    var matches = filterBrands(query);
    renderBrands(matches);

    var showEmpty = matches.length === 0 && query.trim() !== '';
    brandEmpty.hidden = !showEmpty;
    if (showEmpty) brandEmptyQuery.textContent = query.trim();
  }

  brandInput.addEventListener('input', runSearch);
  brandInput.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var matches = filterBrands(brandInput.value);
    if (matches.length === 1) { e.preventDefault(); handleBrand(matches[0].group); }
  });

  // Delegasi klik — daftar brand di-render ulang tiap kali user mengetik,
  // jadi listener dipasang sekali di container, bukan per elemen.
  brandList.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.brand') : null;
    if (btn) handleBrand(btn.dataset.group);
  });

  $$('[data-brand-fallback]').forEach(function (b) {
    b.addEventListener('click', function () { handleBrand(b.dataset.brandFallback); });
  });

  /* ══════════════════════════════════════════════════════════════════════
     PANDUAN INSTALL MANUAL — data per platform
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

    samsunglg: {
      label: 'Samsung TV & LG TV',
      note: 'Aplikasi tidak muncul? Pastikan TV Anda tersambung internet dan region toko sudah diset ke Indonesia. Untuk Samsung, pastikan sudah login <strong>Samsung Account</strong> (TV keluaran 2017 ke atas); untuk LG, pastikan sudah login <strong>LG Account</strong> (webOS 4.0 ke atas). Cek juga ketersediaan aplikasi di <a href="' + STORE.samsung + '" target="_blank" rel="noopener">Samsung TV Apps</a> atau <a href="' + STORE.lg + '" target="_blank" rel="noopener">LG Content Store</a>.',
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
          t: 'Buka atau Kunjungi Google Play Store',
          d: 'Kunjungi Google Play Store melalui website atau aplikasi pada smartphone Android Anda.',
          screen: searchScreen('Google Play', '', 'Ketik nama aplikasi', 'ph-cursor-click')
        },
        {
          t: 'Cari Kompas TV Melalui Pencarian',
          d: 'Masuk ke kolom search dan ketikan Kompas TV.',
          screen: searchScreen('Google Play', 'Kompas TV', 'Klik hasil pencarian', 'ph-cursor-click')
        },
        {
          t: 'Pilih Install di Perangkat Lain',
          d: 'Silakan pilih install pada perangkat lain dan pilih tipe Smart TV Anda.',
          screen: gridScreen('Google Play', 'Instal di perangkat lain', ['ph-device-mobile', 'ph-television-simple', 'ph-laptop', 'ph-device-tablet'], 1, 'ph-google-play-logo', 'Klik untuk pilih', 'ph-cursor-click')
        },
        {
          t: 'Pastikan Akun Google Anda Sama',
          d: 'Sebelum install, pastikan akun Google yang Anda gunakan pada laptop/HP dengan yang ada pada Smart TV itu menggunakan akun yang sama ya.',
          screen: resultScreen('Akun Google Anda', 'Harus sama dengan akun di Smart TV', 'Lanjut', false, 'Sudah dicek?', 'ph-check', 'ph-user-circle')
        },
        {
          t: 'Klik Install',
          d: 'Setelah itu Anda bisa klik Install dan tunggu prosesnya hingga selesai.',
          screen: resultScreen('Kompas TV — Live Streaming', 'Kompas TV · Berita', 'Install', false, 'Klik Install', 'ph-cursor-click')
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

  var stepScreen = $('#stepScreen');
  var stepsList  = $('#stepsList');
  var guideBar   = $('#guideBar');
  var stepCount  = $('#stepCount');
  var btnPrev    = $('#stepPrev');
  var btnNext    = $('#stepNext');
  var fallback   = $('#guideFallback');
  var guidePanel = $('#guidePanel');

  function renderSteps() {
    var g = GUIDES[current];
    stepsList.innerHTML = g.steps.map(function (s, i) {
      return '<li>' +
        '<button class="step' + (i === index ? ' is-active' : '') + '" type="button" data-step="' + i + '"' +
        ' aria-current="' + (i === index ? 'step' : 'false') + '">' +
          '<span class="step__num" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span><span class="step__t">' + s.t + '</span><span class="step__d">' + s.d + '</span></span>' +
        '</button></li>';
    }).join('');

    $$('.step', stepsList).forEach(function (b) {
      b.addEventListener('click', function () {
        stopAuto();
        setStep(parseInt(b.dataset.step, 10));
      });
    });

    fallback.innerHTML = '<i class="ph-bold ph-lifebuoy" aria-hidden="true"></i> ' + g.note;
  }

  function renderScreen() {
    var g = GUIDES[current];
    stepScreen.innerHTML = g.steps[index].screen;
    // restart animasi masuk
    if (!prefersReduced) {
      stepScreen.style.animation = 'none';
      void stepScreen.offsetWidth;
      stepScreen.style.animation = '';
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
