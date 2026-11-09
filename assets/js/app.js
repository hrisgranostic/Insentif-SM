/* =====================================================================
 * app.js — kerangka aplikasi: state, router, layout, helper UI
 * ===================================================================== */
(function () {
  'use strict';
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  /* ------------------------------ format ------------------------------ */
  var F = {
    esc: function (s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    n: function (v, d) { v = +v || 0; return v.toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); },
    rp: function (v, d) { v = +v || 0; var s = F.n(Math.abs(v), d); return (v < -0.004 ? '−' : '') + 'Rp ' + s; },
    rpShort: function (v) {
      v = +v || 0; var a = Math.abs(v), s;
      if (a >= 1e9) s = (a / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' M';
      else if (a >= 1e6) s = (a / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
      else if (a >= 1e3) s = (a / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' rb';
      else s = F.n(a);
      return (v < 0 ? '−' : '') + 'Rp ' + s;
    },
    pct: function (v, d) { return ((+v || 0) * 100).toLocaleString('id-ID', { minimumFractionDigits: d === undefined ? 1 : d, maximumFractionDigits: d === undefined ? 1 : d }) + '%'; },
    rate: function (v) { if (v === null || v === undefined || v === '') return '–'; var d = ((S.boot && S.boot.settings && S.boot.settings.pembulatan_rate) === 0) ? 4 : 2; return ((+v || 0) * 100).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: d }) + '%'; },
    bln: function (p) { return p ? BULAN[+p.slice(5, 7) - 1] + ' ' + p.slice(0, 4) : ''; },
    blnShort: function (p) { return p ? BULAN[+p.slice(5, 7) - 1].slice(0, 3) + ' ' + p.slice(2, 4) : ''; },
    addMonth: function (p, k) { var y = +p.slice(0, 4), m = +p.slice(5, 7) - 1 + k; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return y + '-' + ('0' + (m + 1)).slice(-2); },
    label: function (p) { return F.bln(F.addMonth(p, 1)) + ' (Sales ' + F.bln(p) + ')'; },
    tgl: function (iso) { if (!iso) return ''; var d = String(iso).slice(0, 10).split('-'); return (+d[2]) + ' ' + BULAN[+d[1] - 1] + ' ' + d[0]; },
    waktu: function (iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return iso; return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); },
    num: function (s) { s = String(s || '').replace(/[^0-9,.\-]/g, ''); if (/,\d{1,4}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); else s = s.replace(/[.,]/g, ''); var n = parseFloat(s); return isFinite(n) ? n : 0; },
    BULAN: BULAN
  };

  /* ------------------------------ ikon ------------------------------ */
  var I = {};
  var P = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    stamp: '<path d="M9 3h6v5l2 3H7l2-3z"/><path d="M5 14h14v3H5z"/><path d="M4 21h16"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14.5" r="1"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3 3 0 0 1 0 6M21 20c0-2.6-1.6-4.8-4-5.6"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M6 14h12v7H6z"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>',
    alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17v.01"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    out: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h11"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'
  };
  Object.keys(P).forEach(function (k) { I[k] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + '</svg>'; });

  /* ------------------------------ state ------------------------------ */
  var S = { user: null, boot: null, route: [], periode: null };
  var App = { S: S, F: F, I: I, views: {} };

  /* Super Admin lolos semua peran, kecuali pengecekan 'SUPER' itu sendiri */
  function hasRole(r) { return !!S.user && (S.user.role.indexOf(r) >= 0 || (r !== 'SUPER' && S.user.role.indexOf('SUPER') >= 0)); }
  App.hasRole = hasRole;
  App.staffName = function (k) { var s = (S.boot.staff || []).filter(function (x) { return x.kode === k; })[0]; return s ? s.nama : (k || 'Tanpa PIC'); };
  App.staffOptions = function (sel, opts) {
    opts = opts || {};
    var L = (S.boot.staff || []).slice().sort(function (a, b) { return (a.urutan || 99) - (b.urutan || 99); });
    var h = opts.empty ? '<option value="">' + F.esc(opts.empty) + '</option>' : '';
    L.forEach(function (s) { if (opts.aktif && s.status === 'RESIGN') return; h += '<option value="' + s.kode + '"' + (s.kode === sel ? ' selected' : '') + '>' + F.esc(s.kode + ' — ' + s.nama) + '</option>'; });
    return h;
  };
  App.statusChip = function (st, step) {
    var sg = (S.boot && S.boot.settings.signers) || [];
    var m = {
      DRAFT: ['Draft', ''], DIHITUNG: ['Dihitung', 'warn'], PROSES: ['Menunggu ' + ((sg[step] || {}).jabatan || 'persetujuan'), 'ink'],
      DISETUJUI: ['Disetujui', 'cash'], ARSIP: ['Arsip Excel', '']
    }[st] || [st, ''];
    return '<span class="chip ' + m[1] + '">' + F.esc(m[0]) + '</span>';
  };

  /* ------------------------------ UI helper ------------------------------ */
  App.toast = function (msg, err) {
    var box = document.getElementById('toasts');
    var t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : '');
    t.setAttribute('role', err ? 'alert' : 'status');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.remove(); }, err ? 7000 : 3500);
  };
  App.err = function (e) { console.error(e); App.toast(e && e.message ? e.message : String(e), true); };
  App.modal = function (o) {
    var back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal ' + (o.wide ? 'wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + F.esc(o.title) + '">' +
      '<div class="modal-h"><h2>' + F.esc(o.title) + '</h2><button class="btn ghost sm" data-close aria-label="Tutup">' + I.x + '</button></div>' +
      '<div class="modal-b">' + (o.body || '') + '</div>' +
      (o.foot === false ? '' : '<div class="modal-f">' + (o.foot || '<button class="btn" data-close>Tutup</button>') + '</div>') + '</div>';
    document.body.appendChild(back);
    var close = function () { back.remove(); document.removeEventListener('keydown', esc); if (o.onClose) o.onClose(); };
    var esc = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    back.addEventListener('click', function (e) { if (e.target === back || e.target.closest('[data-close]')) close(); });
    var m = back.querySelector('.modal');
    m.close = close;
    if (o.onOpen) o.onOpen(m);
    var f = m.querySelector('input,select,textarea');
    if (f) f.focus();
    return m;
  };
  App.drawer = function (o) {
    var back = document.createElement('div'); back.className = 'drawer-back';
    var d = document.createElement('div'); d.className = 'drawer'; d.setAttribute('role', 'dialog');
    d.innerHTML = '<div class="modal-h"><h2>' + F.esc(o.title) + '</h2><button class="btn ghost sm" data-close aria-label="Tutup">' + I.x + '</button></div><div class="modal-b">' + o.body + '</div>';
    document.body.appendChild(back); document.body.appendChild(d);
    var close = function () { back.remove(); d.remove(); document.removeEventListener('keydown', esc); };
    var esc = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    back.onclick = close;
    d.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    d.close = close;
    if (o.onOpen) o.onOpen(d);
    return d;
  };
  App.confirm = function (title, text, okLabel, danger) {
    return new Promise(function (res) {
      var done = false;
      var m = App.modal({
        title: title, body: '<p>' + text + '</p>',
        foot: '<button class="btn" data-close>Batal</button><button class="btn ' + (danger ? 'danger' : 'primary') + '" data-ok>' + F.esc(okLabel || 'Lanjut') + '</button>',
        onClose: function () { if (!done) res(false); }
      });
      m.querySelector('[data-ok]').onclick = function () { done = true; m.close(); res(true); };
    });
  };
  App.prompt = function (title, label, opts) {
    opts = opts || {};
    return new Promise(function (res) {
      var done = false;
      var m = App.modal({
        title: title,
        body: '<div class="field"><label>' + F.esc(label) + '</label>' + (opts.area ? '<textarea class="in" id="pv"></textarea>' : '<input class="in" id="pv" type="' + (opts.password ? 'password' : 'text') + '" autocomplete="current-password" value="' + F.esc(opts.value || '') + '">') + (opts.hint ? '<span class="hint">' + F.esc(opts.hint) + '</span>' : '') + '</div>',
        foot: '<button class="btn" data-close>Batal</button><button class="btn ' + (opts.danger ? 'danger' : 'primary') + '" data-ok>' + F.esc(opts.ok || 'Simpan') + '</button>',
        onClose: function () { if (!done) res(null); }
      });
      m.querySelector('[data-ok]').onclick = function () {
        var v = m.querySelector('#pv').value;
        if (opts.required && !v.trim()) { App.toast('Isian ini wajib diisi.', true); return; }
        done = true; m.close(); res(v);
      };
    });
  };
  App.download = function (name, blob) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  App.readFile = function (file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(new Uint8Array(r.result)); };
      r.onerror = function () { rej(new Error('File tidak bisa dibaca.')); };
      r.readAsArrayBuffer(file);
    });
  };
  /** baca workbook; sheet MASTER (data pasien) tidak dimuat */
  /* Library berat dimuat hanya saat dibutuhkan (lebih cepat dibuka). */
  var LIBS = {
    xlsx: { src: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', ok: function () { return window.XLSX; } },
    chart: { src: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js', ok: function () { return window.Chart; } },
    html2canvas: { src: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', ok: function () { return window.html2canvas; } },
    jspdf: { src: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', ok: function () { return window.jspdf; } }
  };
  App.lib = function (name) {
    var L = LIBS[name];
    if (L.ok()) return Promise.resolve();
    if (!L.p) L.p = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = L.src;
      s.onload = function () { res(); };
      s.onerror = function () { L.p = null; rej(new Error('Gagal memuat library ' + name + '. Periksa koneksi internet lalu coba lagi.')); };
      document.head.appendChild(s);
    });
    return L.p;
  };
  App.readWorkbook = async function (file) {
    await App.lib('xlsx');
    var buf = await App.readFile(file);
    var names = XLSX.read(buf, { bookSheets: true }).SheetNames;
    return XLSX.read(buf, { cellDates: true, sheets: Parsers.callReportSheetFilter(names) });
  };
  App.qrSvg = function (text, cell) {
    if (!window.qrcode) return '';
    var q = qrcode(0, 'M'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: cell || 2, margin: 0, scalable: true });
  };
  App.verifyUrl = function (kode) {
    var base = (S.boot && S.boot.settings.app_url) || (location.origin + location.pathname);
    return base.replace(/#.*$/, '') + '#/verifikasi/' + kode;
  };

  /* ------------------------------ layout ------------------------------ */
  function nav() {
    var r = S.route[0] || 'dashboard';
    var pend = App.pendingApprovals ? App.pendingApprovals().length : 0;
    var it = function (href, icon, label, on, extra) { return '<a href="#/' + href + '" class="' + (on ? 'on' : '') + '">' + I[icon] + '<span>' + label + '</span>' + (extra || '') + '</a>'; };
    var h = '';
    h += it('dashboard', 'home', 'Ringkasan', r === 'dashboard');
    h += it('panduan', 'book', 'Panduan', r === 'panduan');
    if (hasRole('ADMIN') || hasRole('FINANCE')) h += it('proses', 'upload', 'Proses bulanan', r === 'proses');
    var signers = ((S.boot.settings || {}).signers || []);
    if (hasRole('ADMIN') || signers.some(function (sg) { return hasRole(sg.role); })) h += it('persetujuan', 'stamp', 'Persetujuan', r === 'persetujuan', pend ? '<span class="badge">' + pend + '</span>' : '');
    h += it('riwayat', 'history', 'Riwayat periode', r === 'riwayat' || r === 'periode');
    h += it('piutang', 'wallet', 'Piutang klien', r === 'piutang');
    if (hasRole('ADMIN')) {
      h += '<div class="grp">Master data</div>';
      h += it('master/staf', 'users', 'Staf & target', r === 'master' && S.route[1] === 'staf');
      h += it('master/klien', 'building', 'Klien & PIC', r === 'master' && S.route[1] === 'klien');
      h += it('master/rate', 'percent', 'Tabel rate', r === 'master' && S.route[1] === 'rate');
      if (hasRole('SUPER')) h += it('master/pengguna', 'key', 'Pengguna', r === 'master' && S.route[1] === 'pengguna');
      h += it('master/pengaturan', 'gear', 'Pengaturan', r === 'master' && S.route[1] === 'pengaturan');
      h += it('master/data-awal', 'db', 'Data awal', r === 'master' && S.route[1] === 'data-awal');
      h += it('log', 'list', 'Log aktivitas', r === 'log');
    } else {
      h += '<div class="grp">Data</div>';
      h += it('master/klien', 'building', 'Klien & PIC', r === 'master');
    }
    return h;
  }
  function shell() {
    var app = document.getElementById('app');
    if (!app.querySelector('.side')) {
      app.className = 'app';
      app.innerHTML =
        '<aside class="side" id="side"><div class="brand"><div class="brand-mark">S&amp;M</div><div><b>Insentif S&amp;M</b><span>' + F.esc(((S.boot.settings.org || {}).unit) || 'Granostic Center') + '</span></div></div>' +
        '<nav class="nav" id="nav" aria-label="Menu utama"></nav>' +
        '<div class="side-foot"><div class="who" id="who"></div>' +
        '<div class="row"><button class="btn sm" data-act="pass">' + I.key + 'Password</button><button class="btn sm" data-act="logout">' + I.out + 'Keluar</button></div>' +
        '<div class="faint small" style="margin-top:8px">v' + F.esc(S.boot.version) + (API.DEMO ? ' · mode demo' : '') + '</div></div></aside>' +
        '<div><div class="topbar"><button class="btn ghost sm" data-act="menu" aria-label="Buka menu">' + I.menu + '</button><b>Insentif S&amp;M</b></div>' +
        '<main class="main" id="main" tabindex="-1"></main></div>';
      app.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) { if (e.target.closest('.nav a')) app.classList.remove('nav-open'); return; }
        var a = b.getAttribute('data-act');
        if (a === 'logout') logout();
        else if (a === 'pass') changePass();
        else if (a === 'menu') app.classList.toggle('nav-open');
      });
    }
    document.getElementById('nav').innerHTML = nav();
    var w = document.getElementById('who');
    if (w) w.innerHTML = '<b>' + F.esc(S.user.nama) + '</b><span class="faint">' + F.esc(S.user.jabatan || '') + '</span>' + (S.user.admin ? '<span class="chip ink" style="margin-top:4px">Super Admin</span>' : (hasRole('SUPER') ? '<span class="chip ink" style="margin-top:4px">Super Admin</span>' : ''));
  }
  App.refreshNav = function () { var n = document.getElementById('nav'); if (n) n.innerHTML = nav(); };
  App.demoBanner = function () {
    if (!API.DEMO) return '';
    return '<div class="demo-banner"><span><b>Mode demo.</b> Data tersimpan di browser ini saja. Isi <code>API_URL</code> di config.js untuk memakai Google Sheets.</span>' +
      '<span class="row" style="margin-left:auto"><button class="btn sm" data-demo="sample">Muat contoh data Juli–Agustus</button><button class="btn sm danger" data-demo="reset">Kosongkan</button></span></div>';
  };
  document.addEventListener('click', async function (e) {
    var b = e.target.closest('[data-demo]');
    if (!b) return;
    var a = b.getAttribute('data-demo');
    if (a === 'reset') {
      if (!(await App.confirm('Kosongkan data demo?', 'Semua data demo di browser ini dihapus. Akun demo tetap ada.', 'Kosongkan', true))) return;
      DemoBackend.reset(); await App.reload(); App.toast('Data demo dikosongkan.');
    } else if (a === 'sample') {
      try {
        var r = await fetch('assets/data/sample-data.json'); if (!r.ok) throw new Error('File contoh data tidak ditemukan.');
        DemoBackend.loadSample(await r.json()); await App.reload(); App.toast('Contoh data dimuat.');
      } catch (er) { App.err(er); }
    }
  });

  async function logout(idle) {
    stopIdle();
    try { await API.call('logout', idle ? { idle: true } : {}); } catch (e) { /* abaikan */ }
    API.setToken(''); S.user = null; location.hash = '#/'; await render();
    if (idle) App.toast('Anda otomatis keluar karena tidak ada aktivitas lebih dari ' + idleMin() + ' menit. Silakan masuk lagi.', true);
  }

  /* ------------------------------ auto-logout (idle) ------------------------------ */
  var idle = { last: Date.now(), touched: Date.now(), timer: null, bound: false };
  function idleMin() { return (S.boot && S.boot.idle_min) || 30; }
  function bump() { idle.last = Date.now(); }
  function startIdle() {
    idle.last = Date.now(); idle.touched = Date.now();
    if (!idle.bound) {
      idle.bound = true;
      ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function (ev) { window.addEventListener(ev, bump, { passive: true, capture: true }); });
    }
    if (idle.timer) return;
    idle.timer = setInterval(async function () {
      if (!S.user) return stopIdle();
      var now = Date.now();
      if (now - idle.last > idleMin() * 60000) return logout(true);
      // beri tahu server selama pengguna masih aktif, supaya sesi di server tidak kedaluwarsa lebih dulu
      if (idle.last > idle.touched && now - idle.touched > 4 * 60000) {
        idle.touched = now;
        try { await API.call('touch', {}, true); } catch (e) { /* sesi mati ditangani onAuthLost */ }
      }
    }, 15000);
  }
  function stopIdle() { if (idle.timer) { clearInterval(idle.timer); idle.timer = null; } }
  App.startIdle = startIdle;
  function changePass() {
    var m = App.modal({
      title: 'Ganti password',
      body: '<div class="field"><label for="pl">Password lama</label><input class="in" type="password" id="pl" autocomplete="current-password"></div>' +
        '<div class="field"><label for="pb">Password baru</label><input class="in" type="password" id="pb" autocomplete="new-password"><span class="hint">Minimal 6 karakter.</span></div>',
      foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan password</button>'
    });
    m.querySelector('[data-ok]').onclick = async function () {
      try { await API.call('changePassword', { lama: m.querySelector('#pl').value, baru: m.querySelector('#pb').value }); m.close(); App.toast('Password diganti.'); } catch (e) { App.err(e); }
    };
  }
  App.onAuthLost = function () { stopIdle(); S.user = null; render(); };

  /* ------------------------------ login Super Admin tahap 2 (popup) ------------------------------ */
  App.loginPenanggungJawab = function (data) {
    return new Promise(function (resolve) {
      var m = App.modal({
        title: 'Konfirmasi penanggung jawab',
        body: '<p class="muted" style="margin-bottom:12px">Anda masuk sebagai <b>Super Admin</b>. Pilih nama penanggung jawab lalu ketik <b>password miliknya</b>. Semua aktivitas akan tercatat sebagai <i>"admin atas nama [nama]"</i>.</p>' +
          '<div class="field"><label for="pj">Penanggung jawab</label><select class="in" id="pj">' + data.kandidat.map(function (k) { return '<option value="' + F.esc(k.username) + '">' + F.esc(k.nama) + ' — ' + F.esc(k.jabatan || '') + '</option>'; }).join('') + '</select></div>' +
          '<div class="field"><label for="pjp">Password penanggung jawab</label><input class="in" id="pjp" type="password" autocomplete="off"><span class="hint">Berlaku ' + (data.menit || 5) + ' menit sejak password admin dimasukkan.</span></div>',
        foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Masuk</button>'
      });
      var pw = m.querySelector('#pjp'); setTimeout(function () { pw.focus(); }, 30);
      var go = async function () {
        try {
          var r = await API.call('login2', { challenge: data.challenge, username: m.querySelector('#pj').value, password: pw.value });
          m.close(); await App.afterLogin(r); resolve();
        } catch (e) { App.err(e); pw.value = ''; pw.focus(); }
      };
      m.querySelector('[data-ok]').onclick = go;
      pw.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    });
  };

  /* ------------------------------ router ------------------------------ */
  App.go = function (h) { location.hash = '#/' + h; };
  App.reload = async function () { S.boot = await API.call('bootstrap'); S.user = S.boot.user; await route(); };
  async function route() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    S.route = h.split('/').filter(String).map(decodeURIComponent);
    if (S.route[0] === 'verifikasi') { document.getElementById('app').className = ''; return App.views.verify(S.route[1]); }
    if (!S.user) return App.views.login();
    shell();
    var main = document.getElementById('main');
    var v = App.views[S.route[0] || 'dashboard'] || App.views.dashboard;
    try { await v(main, S.route.slice(1)); } catch (e) { App.err(e); main.innerHTML = '<div class="empty"><h3>Halaman gagal dimuat</h3><p>' + F.esc(e.message) + '</p></div>'; }
    App.refreshNav();
    window.scrollTo(0, 0);
  }
  App.route = route;
  async function render() {
    if (!S.user && API.token()) {
      try { S.boot = await API.call('bootstrap'); S.user = S.boot.user; } catch (e) { S.user = null; }
    }
    if (!S.user) document.getElementById('app').innerHTML = '';
    else startIdle();
    await route();
  }
  App.render = render;
  App.afterLogin = async function (data) {
    if (data.challenge) return App.loginPenanggungJawab(data);
    API.setToken(data.token);
    startIdle();
    S.boot = await API.call('bootstrap'); S.user = S.boot.user;
    document.getElementById('app').innerHTML = '';
    if (data.mustChange && !API.DEMO) App.toast('Anda masih memakai password awal. Segera ganti lewat tombol Password.', true);
    if (!location.hash || location.hash === '#/' || location.hash === '#') location.hash = '#/dashboard';
    else await route();
  };

  window.addEventListener('hashchange', route);
  window.App = App;
  document.addEventListener('DOMContentLoaded', function () {
    if (API.DEMO && window.DemoBackend) DemoBackend.init();
    render();
  });
})();
