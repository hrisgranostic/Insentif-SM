/* =====================================================================
 * views-main.js — login, verifikasi, ringkasan, persetujuan, riwayat,
 *                 detail periode, piutang, log
 * ===================================================================== */
(function () {
  'use strict';
  var App = window.App, F = App.F, I = App.I, S = App.S, V = App.views;
  var charts = [];
  function killCharts() { charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); charts = []; }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  /* ------------------------------ login ------------------------------ */
  V.login = function () {
    var app = document.getElementById('app');
    app.className = '';
    var demo = API.DEMO && window.DemoBackend;
    app.innerHTML = '<div class="login">' +
      '<section class="login-art"><div><div class="brand-mark" style="border-color:#8C9BF2;color:#8C9BF2">S&amp;M</div></div>' +
      '<div><h1>Insentif Sales &amp; Marketing</h1><p style="margin-top:12px">Hitung insentif dari data Finance, cocokkan dengan laporan staf, dan cairkan sesuai pembayaran klien. Setiap periode disetujui berjenjang dan tersimpan sebagai arsip.</p></div>' +
      '<div class="small" style="color:#8D9BB0">PT Persada Medika Utama · Granostic Center</div>' +
      '<div class="seal-big" aria-hidden="true">DISETUJUI<br>BERJENJANG</div></section>' +
      '<section class="login-form"><form id="lf" autocomplete="on"><h2>Masuk</h2><p class="muted" style="margin-bottom:18px">Gunakan akun yang dibuat Admin HR.</p>' +
      '<div class="field"><label for="lu">Username</label><input class="in" id="lu" name="username" autocomplete="username" required></div>' +
      '<div class="field"><label for="lp">Password</label><input class="in" id="lp" type="password" name="password" autocomplete="current-password" required></div>' +
      '<button class="btn primary" style="width:100%;justify-content:center;padding:10px" type="submit">Masuk</button>' +
      '<p class="small faint" style="margin-top:14px">Lupa password? Minta Admin HR mengatur ulang.</p>' +
      (demo ? '<div class="note" style="margin-top:16px"><b>Mode demo</b> — pilih akun di bawah (password <code>demo123</code>) untuk mencoba alur persetujuan.</div><div class="demo-users">' +
        DemoBackend.users.map(function (u) { return '<button type="button" data-u="' + u.username + '"><b>' + F.esc(u.nama) + '</b><span class="faint">' + F.esc(u.jabatan) + '</span></button>'; }).join('') + '</div>' : '') +
      '</form></section></div>';
    var f = document.getElementById('lf');
    f.onsubmit = async function (e) {
      e.preventDefault();
      try { await App.afterLogin(await API.call('login', { username: f.username.value, password: f.password.value })); } catch (er) { App.err(er); }
    };
    app.querySelectorAll('[data-u]').forEach(function (b) {
      b.onclick = function () { f.username.value = b.getAttribute('data-u'); f.password.value = 'demo123'; f.requestSubmit(); };
    });
  };

  /* ------------------------------ verifikasi QR ------------------------------ */
  V.verify = async function (kode) {
    var app = document.getElementById('app');
    app.innerHTML = '<div class="login-form" style="min-height:100vh"><div class="panel" style="width:min(460px,100%)"><div class="panel-h"><h2>Verifikasi persetujuan</h2></div><div class="panel-b" id="vb"></div></div></div>';
    var vb = document.getElementById('vb');
    var form = '<form id="vf" class="row" style="margin-top:12px"><input class="in" id="vk" placeholder="Kode di bawah QR" value="' + F.esc(kode || '') + '" style="flex:1"><button class="btn primary">Periksa</button></form>';
    if (!kode) { vb.innerHTML = '<p class="muted">Masukkan kode yang tertera di samping QR pada dokumen.</p>' + form; }
    else {
      try {
        var r = await API.call('verify', { kode: kode });
        if (!r.found) vb.innerHTML = '<div class="note err">Kode <b>' + F.esc(kode) + '</b> tidak terdaftar. Dokumen ini bukan hasil sistem, atau kodenya salah ketik.</div>' + form;
        else vb.innerHTML = '<div class="note ' + (r.valid ? '' : 'warn') + '" style="margin-bottom:14px">' + (r.valid ? '<b style="color:var(--cash)">Sah.</b> Persetujuan ini tercatat di sistem dan data perhitungannya belum berubah.' : '<b>Tidak berlaku lagi.</b> Persetujuan pernah tercatat, tapi periode ini sudah dibuka kembali atau dihitung ulang setelahnya.') + '</div>' +
          '<dl class="kv"><dt>Periode</dt><dd>' + F.esc(r.label) + '</dd><dt>Langkah</dt><dd>' + F.esc(r.langkah.replace(/,\s*$/, '')) + '</dd><dt>Oleh</dt><dd>' + F.esc(r.nama) + '</dd><dt>Jabatan</dt><dd>' + F.esc(r.jabatan) + '</dd><dt>Waktu</dt><dd>' + F.esc(F.waktu(r.pada)) + '</dd><dt>Status periode</dt><dd>' + F.esc(r.status) + '</dd></dl>' + form;
      } catch (e) { vb.innerHTML = '<div class="note err">' + F.esc(e.message) + '</div>' + form; }
    }
    document.getElementById('vf').onsubmit = function (e) { e.preventDefault(); location.hash = '#/verifikasi/' + encodeURIComponent(document.getElementById('vk').value.trim().toUpperCase()); };
  };

  /* ------------------------------ stempel ------------------------------ */
  var SEAL = { DIBUAT: 'DIBUAT', VERIF1: 'VERIF.<br>I', VERIF2: 'VERIF.<br>II', DIKETAHUI: 'DIKE-<br>TAHUI', DISETUJUI: 'DISE-<br>TUJUI' };
  App.validApprovals = function (approvals) {
    var by = {};
    (approvals || []).forEach(function (a) { if ((a.valid === true || a.valid === 'TRUE') && a.aksi !== 'TOLAK') by[a.step] = a; });
    return by;
  };
  App.stampsHtml = function (signers, approvals, per) {
    var by = App.validApprovals(approvals);
    var arsip = per && per.status === 'ARSIP';
    var rej = (approvals || []).filter(function (a) { return a.aksi === 'TOLAK'; }).slice(-1)[0];
    var h = '';
    if (rej && per && per.status === 'DIHITUNG' && !(approvals || []).some(function (a) { return a.pada > rej.pada; }))
      h += '<div class="note err" style="margin-bottom:12px"><b>Dikembalikan oleh ' + F.esc(rej.nama) + '</b> (' + F.esc(F.waktu(rej.pada)) + '): ' + F.esc(rej.catatan || '-') + '</div>';
    h += '<div class="stamps">';
    signers.forEach(function (sg, i) {
      var a = by[sg.step];
      var now = per && ((per.status === 'PROSES' && per.step === i) || (per.status === 'DIHITUNG' && i === 0));
      if (a) {
        h += '<div class="stamp done"><span class="lbl">' + F.esc(sg.label.replace(/,\s*$/, '')) + '</span><span class="nm">' + F.esc(a.nama) + '</span><span class="jb">' + F.esc(sg.jabatan) + '</span>' +
          '<div class="mark"><div class="seal">' + SEAL[sg.key] + '</div><a class="qr" href="#/verifikasi/' + a.kode + '" title="Verifikasi ' + a.kode + '">' + App.qrSvg(App.verifyUrl(a.kode), 2) + '</a></div>' +
          '<span class="when">' + F.esc(F.waktu(a.pada)) + ' · ' + a.kode + '</span>' + (a.catatan ? '<span class="small muted">“' + F.esc(a.catatan) + '”</span>' : '') + '</div>';
      } else if (arsip) {
        h += '<div class="stamp"><span class="lbl">' + F.esc(sg.label.replace(/,\s*$/, '')) + '</span><span class="nm">' + F.esc(sg.nama) + '</span><span class="jb">' + F.esc(sg.jabatan) + '</span><span class="mark small faint">Ditandatangani di kertas (arsip Excel)</span></div>';
      } else {
        h += '<div class="stamp ' + (now ? 'now' : '') + '"><span class="lbl">' + (now ? (i === 0 ? 'Siap diajukan' : 'Menunggu') : F.esc(sg.label.replace(/,\s*$/, ''))) + '</span><span class="nm">' + F.esc(sg.nama) + '</span><span class="jb">' + F.esc(sg.jabatan) + '</span><span class="mark small faint">' + (now ? 'Giliran langkah ini' : 'Belum') + '</span></div>';
      }
    });
    return h + '</div>';
  };
  App.pendingApprovals = function () {
    var sg = (S.boot && S.boot.settings.signers) || [];
    return (S.boot.periods || []).filter(function (p) { return p.status === 'PROSES' && sg[p.step] && App.hasRole(sg[p.step].role); });
  };

  function periodSelect(sel, list, id) {
    var opts = list.slice().sort(function (a, b) { return a.periode < b.periode ? 1 : -1; }).map(function (p) {
      return '<option value="' + p.periode + '"' + (p.periode === sel ? ' selected' : '') + '>Sales ' + F.bln(p.periode) + '</option>';
    }).join('');
    return '<select class="in inline" id="' + (id || 'psel') + '" aria-label="Pilih periode">' + opts + '</select>';
  }

  /* ------------------------------ ringkasan ------------------------------ */
  V.dashboard = async function (main) {
    killCharts();
    var periods = (S.boot.periods || []).filter(function (p) { return p.status !== 'DRAFT'; });
    var sel = S.periode && periods.some(function (p) { return p.periode === S.periode; }) ? S.periode : (periods.length ? periods.slice().sort(function (a, b) { return a.periode < b.periode ? 1 : -1; })[0].periode : null);
    if (!sel) {
      main.innerHTML = App.demoBanner() + '<div class="page-head"><div><h1>Ringkasan</h1><div class="sub">Belum ada periode yang dihitung.</div></div></div>' +
        '<div class="panel"><div class="empty"><h3>Mulai dari data awal</h3><p>Isi saldo piutang terakhir dari file insentif Excel, lalu proses bulan berikutnya dari file Finance dan Call Report.</p>' +
        '<div class="row" style="justify-content:center;margin-top:14px">' + (App.hasRole('ADMIN') ? '<a class="btn" href="#/master/data-awal">' + I.db + 'Isi data awal</a><a class="btn primary" href="#/proses">' + I.upload + 'Proses bulanan</a>' : '<span class="muted">Hubungi Admin HR.</span>') + '</div></div></div>';
      return;
    }
    S.periode = sel;
    var d = await API.call('dashboard', { periode: sel });
    var p = d.period || {};
    var T = (S.boot.tiers || []).filter(function (t) { return t.jenis === 'GAF'; }).sort(function (a, b) { return a.min - b.min; });
    var nextG = T.filter(function (t) { return t.min > (p.gra || 0) + 1e-9; })[0];
    var gafNote = nextG ? 'Naik ke ' + F.pct(nextG.nilai, 0) + ' bila tim capai ' + F.pct(nextG.min, 0) + ' (kurang ' + F.rpShort(nextG.min * p.target - p.omzet) + ')' : 'Sudah di faktor tertinggi';
    var ag = d.aging;
    var html = App.demoBanner() +
      '<div class="page-head"><div><h1>Ringkasan</h1><div class="sub">Penjualan ' + F.bln(sel) + ', insentif dibayarkan ' + F.bln(F.addMonth(sel, 1)) + ' ' + App.statusChip(p.status, p.step) + '</div></div>' +
      '<div class="tools">' + periodSelect(sel, periods) + '<a class="btn" href="#/periode/' + sel + '">' + I.file + 'Buka laporan</a></div></div>' +
      '<div class="figures">' +
      '<div class="fig"><div class="k">Omzet tim</div><div class="v">' + F.rpShort(p.omzet) + '</div><div class="d">' + F.pct(p.gra) + ' dari target ' + F.rpShort(p.target) + '</div><div class="bar"><i style="width:' + Math.min(100, (p.gra || 0) * 100) + '%"></i></div></div>' +
      '<div class="fig"><div class="k">Faktor grup (GAF)</div><div class="v">' + F.pct(p.gaf, 0) + '</div><div class="d">' + F.esc(gafNote) + '</div></div>' +
      '<div class="fig"><div class="k">Insentif cair</div><div class="v cash">' + F.rp(p.cair) + '</div><div class="d">Dari pembayaran klien yang masuk ' + F.bln(sel) + '</div></div>' +
      '<div class="fig"><div class="k">Piutang klien</div><div class="v">' + F.rpShort(d.arsip ? d.piutangArsip : ag.total) + '</div><div class="d">' + (d.arsip ? 'Dari arsip Excel (buku piutang dimulai Agustus 2026)' : 'Insentif tertahan ' + F.rp(ag.tertahan)) + '</div></div>' +
      '</div>' +
      '<div class="grid g3" style="margin-top:18px"><div class="panel"><div class="panel-h"><h2>Pencapaian per staf</h2><span class="muted">Garis = batas tier rate pribadi</span></div><div class="panel-b" id="achv"></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Persetujuan</h2><a class="small" href="#/periode/' + sel + '">Detail</a></div><div class="panel-b" id="aprv"></div></div></div>' +
      '<div class="grid g2"><div class="panel"><div class="panel-h"><h2>Omzet tim per bulan</h2><span class="muted">dibanding target</span></div><div class="panel-b"><div class="chart-box"><canvas id="c1" aria-label="Grafik omzet tim per bulan"></canvas></div><div class="legend"><span><i style="background:var(--s1)"></i>Omzet</span><span><i style="background:var(--ink-3)"></i>Target</span></div></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Insentif cair per bulan</h2><span class="muted">berdasarkan pembayaran klien</span></div><div class="panel-b"><div class="chart-box"><canvas id="c2" aria-label="Grafik insentif cair per bulan"></canvas></div></div></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Umur piutang</h2><a class="small" href="#/piutang">Lihat semua piutang</a></div><div class="panel-b" id="agv"></div></div>';
    main.innerHTML = html;
    document.getElementById('psel').onchange = function (e) { S.periode = e.target.value; V.dashboard(main); };

    // pencapaian
    var PIR = (S.boot.tiers || []).filter(function (t) { return t.jenis === 'PIR'; }).sort(function (a, b) { return a.min - b.min; });
    var max = 1.3;
    var ticks = PIR.filter(function (t) { return t.min > 0; }).map(function (t) { return '<span class="tk" style="left:' + (t.min / max * 100) + '%"></span>'; }).join('');
    var tickLbl = PIR.filter(function (t) { return t.min > 0; }).map(function (t) { return '<span class="tkl" style="left:' + (t.min / max * 100) + '%">' + Math.round(t.min * 100) + '%</span>'; }).join('');
    var rows = d.staff.filter(function (s) { return s.status === 'AKTIF' && s.target; }).map(function (s, i) {
      var nx = PIR.filter(function (t) { return t.min > s.pra + 1e-9; })[0];
      var sub = nx ? 'kurang ' + F.rpShort(nx.min * s.target - s.omzet) + ' ke ' + Math.round(nx.min * 100) + '%' : 'tier tertinggi';
      return '<div class="ach"><div class="nm"><b>' + F.esc(s.nama) + '</b><span>' + F.rpShort(s.omzet) + ' / ' + F.rpShort(s.target) + '</span></div>' +
        '<div class="track" title="' + F.esc(sub) + '">' + (i === 0 ? tickLbl : '') + ticks + '<span class="fill" style="width:' + Math.min(100, s.pra / max * 100) + '%"></span></div>' +
        '<div class="pc">' + F.pct(s.pra, 0) + '<span>rate ' + F.rate(s.rate) + '</span></div></div>' +
        '<div class="small faint ach-sub">' + F.esc(sub) + '</div>';
    }).join('');
    document.getElementById('achv').innerHTML = rows ? '<div style="padding-top:14px">' + rows + '</div>' : '<p class="muted">Belum ada data staf.</p>';

    // persetujuan ringkas
    var sg = S.boot.settings.signers, by = App.validApprovals(d.approvals);
    document.getElementById('aprv').innerHTML = p.status === 'ARSIP' ? '<p class="muted">Periode ini diambil dari arsip Excel; tanda tangan ada di dokumen kertas.</p>' :
      '<ol style="margin:0;padding-left:18px">' + sg.map(function (x, i) {
        var a = by[x.step], now = (p.status === 'PROSES' && p.step === i) || (p.status === 'DIHITUNG' && i === 0);
        return '<li style="margin-bottom:8px"><b>' + F.esc(x.jabatan) + '</b><br><span class="small ' + (a ? 'pos' : now ? '' : 'faint') + '">' + (a ? 'Selesai, ' + F.esc(F.waktu(a.pada)) : now ? '<span class="chip warn">Giliran sekarang</span>' : 'Belum') + '</span></li>';
      }).join('') + '</ol>';

    // grafik (library dimuat saat dibutuhkan)
    try { await App.lib('chart'); } catch (e) { /* grafik dilewati */ }
    if (window.Chart) {
      var tr = d.trend.filter(function (t) { return t.status !== 'DRAFT'; });
      var lab = tr.map(function (t) { return F.blnShort(t.periode); });
      var grid = css('--line'), ink = css('--ink-2');
      var base = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return c.dataset.label + ': ' + F.rp(c.parsed.y); } } } },
        scales: { x: { grid: { display: false }, ticks: { color: ink } }, y: { grid: { color: grid }, border: { display: false }, ticks: { color: ink, callback: function (v) { return F.rpShort(v).replace('Rp ', ''); } } } } };
      charts.push(new Chart(document.getElementById('c1'), { type: 'bar', data: { labels: lab, datasets: [
        { label: 'Omzet', data: tr.map(function (t) { return t.omzet; }), backgroundColor: css('--s1'), borderRadius: 4, maxBarThickness: 38 },
        { label: 'Target', type: 'line', data: tr.map(function (t) { return t.target; }), borderColor: css('--ink-3'), borderDash: [5, 4], borderWidth: 2, pointRadius: 3, pointBackgroundColor: css('--ink-3') }] }, options: base }));
      charts.push(new Chart(document.getElementById('c2'), { type: 'bar', data: { labels: lab, datasets: [
        { label: 'Insentif cair', data: tr.map(function (t) { return t.cair; }), backgroundColor: css('--s2'), borderRadius: 4, maxBarThickness: 38 }] }, options: base }));
    }
    // aging
    var col = ['var(--s2)', 'var(--s1)', 'var(--s3)', 'color-mix(in srgb, var(--err) 75%, var(--surface))', 'var(--err)'];
    var tot = ag.total || 1;
    document.getElementById('agv').innerHTML = d.arsip ? '<p class="muted">Umur piutang hanya tersedia sejak saldo awal (Agustus 2026).</p>' : ag.total ? '<div class="aging" role="img" aria-label="Komposisi umur piutang">' + ag.buckets.map(function (b, i) { return b.nilai ? '<i style="width:' + (b.nilai / tot * 100) + '%;background:' + col[i] + '" title="' + F.esc(b.label + ': ' + F.rp(b.nilai)) + '"></i>' : ''; }).join('') + '</div>' +
      '<div class="legend">' + ag.buckets.map(function (b, i) { return '<span><i style="background:' + col[i] + '"></i>' + F.esc(b.label) + ' · ' + F.rpShort(b.nilai) + '</span>'; }).join('') + '</div>' +
      '<div class="tbl-wrap" style="margin-top:14px"><table class="t dense"><thead><tr><th>Klien</th><th>PIC</th><th class="num">Sisa piutang</th><th class="num">Insentif tertahan</th><th>Invoice tertua</th></tr></thead><tbody>' +
      ag.clients.slice(0, 8).map(function (c) { return '<tr class="click" data-cl="' + c.client_id + '"><td>' + F.esc(c.client) + '</td><td>' + F.esc(c.kode) + '</td><td class="num">' + F.rp(c.sisa) + '</td><td class="num">' + F.rp(c.tertahan) + '</td><td>' + F.bln(c.tertua) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' : '<p class="muted">Tidak ada piutang terbuka.</p>';
    main.querySelectorAll('[data-cl]').forEach(function (r) { r.onclick = function () { App.clientDrawer(r.getAttribute('data-cl')); }; });
  };

  /* ------------------------------ persetujuan ------------------------------ */
  V.persetujuan = async function (main) {
    S.boot.periods = await API.call('periods');
    var mine = App.pendingApprovals();
    var sg = S.boot.settings.signers;
    var proses = S.boot.periods.filter(function (p) { return p.status === 'PROSES'; });
    main.innerHTML = '<div class="page-head"><div><h1>Persetujuan</h1><div class="sub">Periode yang menunggu tanda tangan digital Anda.</div></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Giliran Anda</h2></div>' + (mine.length ? '<div class="panel-b flush"><table class="t"><thead><tr><th>Periode</th><th>Langkah</th><th class="num">Insentif cair</th><th class="num">Omzet tim</th><th></th></tr></thead><tbody>' +
        mine.map(function (p) { return '<tr><td><b>' + F.esc(F.label(p.periode)) + '</b></td><td>' + F.esc(sg[p.step].label.replace(/,\s*$/, '')) + ' — ' + F.esc(sg[p.step].jabatan) + '</td><td class="num">' + F.rp(p.cair) + '</td><td class="num">' + F.rpShort(p.omzet) + '</td><td class="num"><a class="btn primary sm" href="#/periode/' + p.periode + '">Periksa &amp; setujui</a></td></tr>'; }).join('') +
        '</tbody></table></div>' : '<div class="empty"><h3>Tidak ada yang menunggu Anda</h3><p>Anda akan menerima email saat ada periode yang perlu diperiksa.</p></div>') + '</div>' +
      '<div class="panel"><div class="panel-h"><h2>Sedang berjalan</h2></div>' + (proses.length ? '<div class="panel-b flush"><table class="t"><thead><tr><th>Periode</th><th>Posisi</th><th class="num">Insentif cair</th></tr></thead><tbody>' +
        proses.map(function (p) { return '<tr class="click" data-p="' + p.periode + '"><td>' + F.esc(F.label(p.periode)) + '</td><td>' + App.statusChip(p.status, p.step) + '</td><td class="num">' + F.rp(p.cair) + '</td></tr>'; }).join('') +
        '</tbody></table></div>' : '<div class="panel-b muted">Tidak ada periode dalam proses persetujuan.</div>') + '</div>';
    main.querySelectorAll('[data-p]').forEach(function (r) { r.onclick = function () { App.go('periode/' + r.getAttribute('data-p')); }; });
  };

  /* ------------------------------ riwayat ------------------------------ */
  V.riwayat = async function (main) {
    S.boot.periods = await API.call('periods');
    var L = S.boot.periods.slice().sort(function (a, b) { return a.periode < b.periode ? 1 : -1; });
    main.innerHTML = App.demoBanner() + '<div class="page-head"><div><h1>Riwayat periode</h1><div class="sub">Setiap bulan tersimpan beserta perhitungan, rincian, dan persetujuannya.</div></div></div>' +
      '<div class="panel"><div class="panel-b flush tbl-wrap">' + (L.length ? '<table class="t"><thead><tr><th>Periode insentif</th><th>Status</th><th class="num">Omzet tim</th><th class="num">GRA</th><th class="num">GAF</th><th class="num">Insentif terbentuk</th><th class="num">Insentif cair</th><th class="num">Piutang akhir</th><th>Tanggal surat</th></tr></thead><tbody>' +
        L.map(function (p) {
          return '<tr class="click" data-p="' + p.periode + '"><td><b>' + F.bln(F.addMonth(p.periode, 1)) + '</b><div class="small faint">Sales ' + F.bln(p.periode) + '</div></td><td>' + App.statusChip(p.status, p.step) + (p.n_error ? ' <span class="chip err">' + p.n_error + ' masalah</span>' : '') + '</td>' +
            '<td class="num">' + F.rp(p.omzet) + '</td><td class="num">' + F.pct(p.gra) + '</td><td class="num">' + F.pct(p.gaf, 0) + '</td><td class="num">' + F.rp(p.terbentuk) + '</td><td class="num"><b>' + F.rp(p.cair) + '</b></td><td class="num">' + F.rp(p.piutang) + '</td><td>' + F.tgl(p.tgl_surat) + '</td></tr>';
        }).join('') + '</tbody></table>' : '<div class="empty"><h3>Belum ada periode</h3><p>Mulai dari menu Proses bulanan.</p></div>') + '</div></div>';
    main.querySelectorAll('[data-p]').forEach(function (r) { r.onclick = function () { var p = S.boot.periods.filter(function (x) { return x.periode === r.getAttribute('data-p'); })[0]; App.go((p.status === 'DRAFT' ? 'proses/' : 'periode/') + p.periode); }; });
  };

  /* ------------------------------ detail periode ------------------------------ */
  V.periode = async function (main, args) {
    var P = args[0], tab = args[1] || 'ringkasan';
    var rep = await API.call('report', { periode: P });
    App._rep = rep;
    var per = rep.periodeRow, sg = rep.signers || S.boot.settings.signers;
    var myStep = per.status === 'PROSES' && sg[per.step] && App.hasRole(sg[per.step].role);
    var editable = App.hasRole('ADMIN') && (per.status === 'DIHITUNG' || per.status === 'DRAFT');
    var tools = '<button class="btn" data-x="print">' + I.printer + 'Pratinjau &amp; cetak</button><button class="btn" data-x="xlsx">' + I.download + 'Unduh Excel</button>';
    if (editable) tools += '<a class="btn" href="#/proses/' + P + '/rekonsiliasi">' + I.refresh + 'Rekonsiliasi</a>' + (per.status === 'DIHITUNG' ? '<button class="btn primary" data-x="submit">' + I.stamp + 'Ajukan persetujuan</button>' : '');
    if (myStep) tools += '<button class="btn primary" data-x="approve">' + I.stamp + 'Periksa &amp; setujui</button>';
    if (App.hasRole('ADMIN') && (per.status === 'DISETUJUI' || per.status === 'PROSES')) tools += '<button class="btn" data-x="mail">' + I.mail + 'Kirim email</button>';
    if (App.hasRole('ADMIN') && (per.status === 'DISETUJUI' || per.status === 'PROSES')) tools += '<button class="btn danger" data-x="reopen">Buka kembali</button>';
    var tabs = [['ringkasan', 'Ringkasan'], ['persen', 'Persentase insentif'], ['rincian', 'Rincian per staf'], ['pencairan', 'Pencairan'], ['resume', 'Resume email'], ['catatan', 'Catatan & log']];
    main.innerHTML = '<div class="page-head"><div><h1>Insentif ' + F.esc(rep.bulanBayar) + '</h1><div class="sub">Dari penjualan ' + F.esc(rep.bulanSales) + ' ' + App.statusChip(per.status, per.step) + (rep.arsipExcel ? ' <span class="chip">Arsip dari ' + F.esc(rep.sumberFile || 'Excel') + '</span>' : '') + '</div></div><div class="tools">' + tools + '</div></div>' +
      '<div class="panel"><div class="panel-b">' + App.stampsHtml(sg, rep.approvals, per) + '</div></div>' +
      '<div class="tabs" role="tablist" style="margin-top:18px">' + tabs.map(function (t) { return '<a role="tab" href="#/periode/' + P + '/' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</a>'; }).join('') + '</div><div id="tabv"></div>';
    var tv = document.getElementById('tabv');
    ({ ringkasan: tabRingkasan, persen: tabPersen, rincian: tabRincian, pencairan: tabPencairan, resume: tabResume, catatan: tabCatatan }[tab] || tabRingkasan)(tv, rep);
    main.querySelectorAll('[data-x]').forEach(function (b) {
      b.onclick = function () {
        var x = b.getAttribute('data-x');
        if (x === 'print') App.printPreview(rep);
        else if (x === 'xlsx') App.exportExcel(rep);
        else if (x === 'submit') App.submitDialog(P);
        else if (x === 'approve') approveDialog(P, sg[per.step]);
        else if (x === 'reopen') reopenDialog(P);
        else if (x === 'mail') App.emailDialog(rep);
      };
    });
  };
  function staffTable(rep) {
    var g = rep.group || {};
    return '<div class="tbl-wrap"><table class="t"><thead><tr><th>Staf</th><th class="num">Target</th><th class="num">Omzet</th><th class="num">PRA</th><th class="num">PIR</th><th class="num">GAF</th><th class="num">Rate</th><th class="num">Insentif terbentuk</th><th class="num">Insentif cair</th><th class="num">Piutang</th></tr></thead><tbody>' +
      rep.staff.map(function (s) {
        return '<tr><td><b>' + F.esc(s.nama) + '</b> <span class="faint small">' + s.kode + '</span>' + (s.status === 'RESIGN' ? ' <span class="chip">resign</span>' : '') + '</td><td class="num">' + (s.target ? F.rpShort(s.target) : '–') + '</td><td class="num">' + F.rp(s.omzet) + '</td><td class="num">' + (s.target ? F.pct(s.pra) : '–') + '</td><td class="num">' + (s.target ? F.rate(s.pir) : '–') + '</td><td class="num">' + (s.target ? F.pct(s.gaf, 0) : '–') + '</td><td class="num">' + (s.target ? F.rate(s.rate) : '–') + '</td><td class="num">' + F.rp(s.terbentuk) + '</td><td class="num"><b class="pos">' + F.rp(s.cair) + '</b></td><td class="num">' + F.rp(s.piutang) + '</td></tr>';
      }).join('') +
      '<tr class="total"><td>Tim</td><td class="num">' + F.rpShort(g.target) + '</td><td class="num">' + F.rp(g.omzet) + '</td><td class="num">' + F.pct(g.gra) + '</td><td></td><td class="num">' + F.pct(g.gaf, 0) + '</td><td></td><td class="num">' + F.rp(rep.totalTerbentuk) + '</td><td class="num pos">' + F.rp(rep.totalCair) + '</td><td class="num">' + F.rp(rep.staff.reduce(function (a, s) { return a + (+s.piutang || 0); }, 0)) + '</td></tr></tbody></table></div>';
  }
  App.staffTable = staffTable;
  function tabRingkasan(tv, rep) {
    tv.innerHTML = '<div class="panel"><div class="panel-h"><h2>Hasil per staf</h2><span class="muted">Rate = PIR × GAF. Insentif cair = pembayaran klien bulan ini × rate bulan invoicenya.</span></div><div class="panel-b flush">' + staffTable(rep) + '</div></div>';
  }
  function tabPersen(tv, rep) {
    tv.innerHTML = rep.staff.filter(function (s) { return s.status === 'AKTIF'; }).map(function (s) {
      return '<div class="panel"><div class="panel-h"><h2>' + F.esc(s.nama) + '</h2><span class="muted">' + s.rekanan.length + ' rekanan · omzet ' + F.rp(s.omzet) + '</span></div><div class="grid g3" style="padding:0"><div class="tbl-wrap"><table class="t dense"><thead><tr><th>Rekanan</th><th>Segmen</th><th class="num">Sales</th></tr></thead><tbody>' +
        (s.rekanan.length ? s.rekanan.map(function (r) { return '<tr><td>' + F.esc(r.client) + (r.baru ? ' <span class="chip ink">' + (r.dari ? 'peralihan dari ' + F.esc(r.dari) : 'baru') + '</span>' : '') + '</td><td>' + F.esc(r.segmen || '') + '</td><td class="num">' + F.rp(r.omzet) + '</td></tr>'; }).join('') : '<tr><td colspan="3" class="muted">Tidak ada omzet.</td></tr>') +
        '</tbody></table></div><div class="panel-b"><dl class="kv"><dt>Total pencapaian</dt><dd>' + F.rp(s.omzet) + '</dd><dt>Target</dt><dd>' + F.rp(s.target) + '</dd><dt>PRA</dt><dd>' + F.pct(s.pra, 0) + '</dd><dt>PIR</dt><dd>' + F.rate(s.pir) + '</dd><dt>GAF</dt><dd>' + F.pct(s.gaf, 0) + '</dd><dt>Rate tertimbang</dt><dd>' + F.rate(s.rate) + '</dd><dt>Insentif terbentuk</dt><dd>' + F.rp(s.terbentuk, 2) + '</dd>' +
        (s.calls ? '<dt>Kunjungan</dt><dd>' + s.calls + ' / ' + (s.call_target || '-') + '</dd>' : '') + (s.klaim ? '<dt>Klaim di Call Report</dt><dd>' + F.rp(s.klaim) + (Math.abs(s.klaim - s.omzet) > 1 ? ' <span class="chip warn">selisih ' + F.rp(s.klaim - s.omzet) + '</span>' : '') + '</dd>' : '') + '</dl></div></div></div>';
    }).join('') || '<div class="panel"><div class="empty">Tidak ada data.</div></div>';
  }
  function riTable(st) {
    var h = '<div class="tbl-wrap"><table class="t dense"><thead><tr><th>Rekanan / invoice</th><th>Bulan</th><th class="num">Saldo awal</th><th class="num">Realisasi sales</th><th class="num">Realisasi A/R</th><th class="num">Saldo akhir</th><th class="num">Rate</th><th class="num">Insentif</th></tr></thead><tbody>';
    st.clients.forEach(function (c) {
      h += '<tr class="grp"><td colspan="8">' + F.esc(c.client) + '</td></tr>';
      c.lines.forEach(function (l) {
        h += '<tr><td style="padding-left:22px">' + F.esc(l.invoice_no) + (l.catatan ? '<div class="small faint">' + F.esc(l.catatan) + '</div>' : '') + '</td><td class="nowrap">' + F.blnShort(l.periode) + '</td><td class="num">' + (l.saldo_awal ? F.rp(l.saldo_awal) : '') + '</td><td class="num">' + (l.sales ? F.rp(l.sales) : '') + '</td><td class="num">' + (l.bayar ? F.rp(l.bayar) : '') + '</td><td class="num">' + (Math.abs(l.saldo_akhir) > 0.5 ? F.rp(l.saldo_akhir) : '') + '</td><td class="num">' + (l.jenis === 'ADJ' ? '' : F.rate(l.rate)) + '</td><td class="num">' + (l.insentif ? F.rp(l.insentif, 2) : '') + '</td></tr>';
      });
      if (c.lines.length > 1) h += '<tr class="sub"><td colspan="2">Subtotal</td><td class="num">' + F.rp(c.total.saldo_awal) + '</td><td class="num">' + F.rp(c.total.sales) + '</td><td class="num">' + F.rp(c.total.bayar) + '</td><td class="num">' + F.rp(c.total.saldo_akhir) + '</td><td></td><td class="num">' + F.rp(c.total.insentif, 2) + '</td></tr>';
    });
    h += '<tr class="total"><td colspan="2">Total ' + F.esc(st.nama) + '</td><td class="num">' + F.rp(st.total.saldo_awal) + '</td><td class="num">' + F.rp(st.total.sales) + '</td><td class="num">' + F.rp(st.total.bayar) + '</td><td class="num">' + F.rp(st.total.saldo_akhir) + '</td><td></td><td class="num pos">' + F.rp(st.total.insentif, 2) + '</td></tr></tbody></table></div>';
    return h;
  }
  function tabRincian(tv, rep) {
    if (!rep.ri.length) { tv.innerHTML = '<div class="panel"><div class="empty">Tidak ada rincian.</div></div>'; return; }
    var cur = App._riSel && rep.ri.some(function (r) { return r.kode === App._riSel; }) ? App._riSel : rep.ri[0].kode;
    var draw = function () {
      var st = rep.ri.filter(function (r) { return r.kode === cur; })[0];
      tv.innerHTML = '<div class="pills" style="margin-bottom:14px">' + rep.ri.map(function (r) { return '<button data-k="' + r.kode + '" class="' + (r.kode === cur ? 'on' : '') + '">' + F.esc(r.nama) + (r.status === 'RESIGN' ? ' (resign)' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="panel"><div class="panel-h"><h2>' + F.esc(st.nama) + '</h2><span class="muted">Insentif ' + F.rp(st.total.insentif, 2) + ' dari pembayaran ' + F.rp(st.total.bayar) + '</span></div><div class="panel-b flush">' + riTable(st) + '</div></div>';
      tv.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { cur = App._riSel = b.getAttribute('data-k'); draw(); }; });
    };
    draw();
  }
  function tabPencairan(tv, rep) {
    tv.innerHTML = '<div class="panel"><div class="panel-h"><h2>Rincian pencairan insentif</h2><span class="muted">Berdasarkan pembayaran klien</span></div><div class="panel-b flush"><table class="t"><thead><tr><th>Staf</th><th>Status</th><th class="num">Insentif periode ' + F.esc(rep.bulanSales) + '</th></tr></thead><tbody>' +
      rep.riborar.map(function (r) { return '<tr><td><b>' + F.esc(r.nama) + '</b></td><td>' + (r.status === 'RESIGN' ? '<span class="chip">resign</span>' : '<span class="chip cash">aktif</span>') + '</td><td class="num">' + F.rp(r.cair, 2) + '</td></tr>'; }).join('') +
      '<tr class="total"><td colspan="2">Grand total</td><td class="num pos">' + F.rp(rep.totalCair, 2) + '</td></tr></tbody></table></div></div>' +
      '<p class="small faint" style="margin-top:10px">Nilai dibulatkan ke rupiah saat transfer: ' + rep.riborar.map(function (r) { return F.esc(r.kode) + ' ' + F.rp(Math.round(r.cair)); }).join(', ') + '.</p>';
  }
  async function tabResume(tv, rep) {
    var txt = rep.arsipExcel ? 'Periode ini berasal dari arsip Excel — resume email tidak dibuat ulang.' : await API.call('resume', { periode: rep.periode });
    tv.innerHTML = '<div class="panel"><div class="panel-h"><h2>Draft email untuk direksi</h2><div class="row"><button class="btn sm" data-c>' + I.copy + 'Salin teks</button><a class="btn sm" href="mailto:?subject=' + encodeURIComponent('Perhitungan insentif ' + rep.label) + '&body=' + encodeURIComponent(txt) + '">' + I.mail + 'Buka di aplikasi email</a></div></div><div class="panel-b"><pre class="mail">' + F.esc(txt) + '</pre></div></div>';
    tv.querySelector('[data-c]').onclick = function () { navigator.clipboard.writeText(txt).then(function () { App.toast('Teks email disalin.'); }, function () { App.toast('Gagal menyalin, pilih teks lalu salin manual.', true); }); };
  }
  function tabCatatan(tv, rep) {
    var iss = rep.issues || [];
    tv.innerHTML = '<div class="panel"><div class="panel-h"><h2>Catatan rekonsiliasi</h2><span class="muted">' + iss.length + ' catatan</span></div><div class="panel-b">' +
      (iss.length ? iss.map(function (i) { return '<div class="iss ' + i.level + '"><div class="msg">' + F.esc(i.pesan) + '</div></div>'; }).join('') : '<p class="muted">Tidak ada catatan.</p>') + '</div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Riwayat tanda tangan</h2></div><div class="panel-b flush"><table class="t dense"><thead><tr><th>Waktu</th><th>Langkah</th><th>Oleh</th><th>Aksi</th><th>Catatan</th><th>Kode</th></tr></thead><tbody>' +
      ((rep.approvals || []).map(function (a) { return '<tr><td class="nowrap">' + F.esc(F.waktu(a.pada)) + '</td><td>' + F.esc(a.label.replace(/,\s*$/, '')) + '</td><td>' + F.esc(a.nama) + '</td><td>' + (a.aksi === 'TOLAK' ? '<span class="chip err">Dikembalikan</span>' : '<span class="chip ' + ((a.valid === true || a.valid === 'TRUE') ? 'ink' : '') + '">' + (a.aksi === 'AJUKAN' ? 'Diajukan' : 'Disetujui') + ((a.valid === true || a.valid === 'TRUE') ? '' : ' (batal)') + '</span>') + '</td><td>' + F.esc(a.catatan) + '</td><td><a href="#/verifikasi/' + a.kode + '">' + a.kode + '</a></td></tr>'; }).join('') || '<tr><td colspan="6" class="muted">Belum ada.</td></tr>') +
      '</tbody></table></div></div>';
  }

  App.submitDialog = function (P) {
    var today = new Date(); var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    var m = App.modal({
      title: 'Ajukan persetujuan',
      body: '<p>Perhitungan dikunci dan dikirim ke ' + F.esc(S.boot.settings.signers[1].jabatan) + ' untuk diverifikasi. Anda tercatat sebagai pembuat.</p>' +
        '<div class="field"><label for="ts">Tanggal surat</label><input class="in" type="date" id="ts" value="' + iso + '"><span class="hint">Tampil di dokumen: "' + F.esc((S.boot.settings.org || {}).kota || 'Surabaya') + ', tanggal".</span></div>' +
        '<div class="field"><label for="tc">Catatan (opsional)</label><textarea class="in" id="tc"></textarea></div>',
      foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Ajukan</button>'
    });
    m.querySelector('[data-ok]').onclick = async function () {
      try { await API.call('submit', { periode: P, tgl_surat: m.querySelector('#ts').value, catatan: m.querySelector('#tc').value }); m.close(); App.toast('Diajukan. Verifikator mendapat notifikasi.'); S.boot.periods = await API.call('periods'); App.go('periode/' + P); App.route(); } catch (e) { App.err(e); }
    };
  };
  function approveDialog(P, sg) {
    var m = App.modal({
      title: 'Persetujuan: ' + sg.label.replace(/,\s*$/, ''),
      body: '<p>Anda menandatangani sebagai <b>' + F.esc(sg.jabatan) + '</b> untuk insentif ' + F.esc(F.label(P)) + '. Tanda tangan digital ini disertai kode QR yang bisa dicek keasliannya.</p>' +
        '<div class="field"><label for="ac">Catatan</label><textarea class="in" id="ac" placeholder="Wajib diisi jika dikembalikan"></textarea></div>',
      foot: '<button class="btn danger" data-no>Kembalikan ke HR</button><button class="btn primary" data-ok>' + I.stamp + 'Setujui</button>'
    });
    var go = async function (tolak) {
      var c = m.querySelector('#ac').value;
      if (tolak && !c.trim()) { App.toast('Tulis alasan pengembalian di kolom catatan.', true); return; }
      try { await API.call('approve', { periode: P, tolak: tolak, catatan: c }); m.close(); App.toast(tolak ? 'Dikembalikan ke HR.' : 'Disetujui.'); S.boot.periods = await API.call('periods'); App.route(); } catch (e) { App.err(e); }
    };
    m.querySelector('[data-ok]').onclick = function () { go(false); };
    m.querySelector('[data-no]').onclick = function () { go(true); };
  }
  async function reopenDialog(P) {
    var r = await App.prompt('Buka kembali periode', 'Alasan', { area: true, required: true, ok: 'Buka kembali', danger: true, hint: 'Semua tanda tangan periode ini dibatalkan dan QR lama tidak berlaku lagi.' });
    if (r === null) return;
    try { await API.call('reopen', { periode: P, alasan: r }); App.toast('Periode dibuka kembali.'); S.boot.periods = await API.call('periods'); App.route(); } catch (e) { App.err(e); }
  }

  /* ------------------------------ piutang ------------------------------ */
  V.piutang = async function (main) {
    var periods = (S.boot.periods || []).filter(function (p) { return p.status !== 'DRAFT'; });
    if (!periods.length) { main.innerHTML = '<div class="page-head"><div><h1>Piutang klien</h1></div></div><div class="panel"><div class="empty"><h3>Belum ada data piutang</h3><p>Isi data awal atau proses satu periode dulu.</p></div></div>'; return; }
    var asOf = App._agAsOf || periods.slice().sort(function (a, b) { return a.periode < b.periode ? 1 : -1; })[0].periode;
    var kode = App._agKode || '';
    var d = await API.call('aging', { asOf: asOf, kode: kode });
    var q = App._agQ || '';
    main.innerHTML = '<div class="page-head"><div><h1>Piutang klien</h1><div class="sub">Tagihan yang belum dibayar per akhir ' + F.bln(asOf) + '. Insentifnya baru cair setelah klien membayar.</div></div>' +
      '<div class="tools">' + periodSelect(asOf, periods, 'ag-p') + '<select class="in inline" id="ag-k" aria-label="Filter staf">' + App.staffOptions(kode, { empty: 'Semua staf' }) + '</select><input class="in inline" id="ag-q" placeholder="Cari klien" value="' + F.esc(q) + '"></div></div>' +
      '<div class="figures"><div class="fig"><div class="k">Total piutang</div><div class="v">' + F.rp(d.total) + '</div></div><div class="fig"><div class="k">Insentif tertahan</div><div class="v">' + F.rp(d.tertahan) + '</div><div class="d">Cair saat dibayar</div></div><div class="fig"><div class="k">Klien</div><div class="v">' + d.clients.length + '</div></div><div class="fig"><div class="k">Lewat 3 bulan</div><div class="v">' + F.rp(d.buckets[3].nilai + d.buckets[4].nilai) + '</div><div class="d">' + (d.buckets[3].n + d.buckets[4].n) + ' tagihan</div></div></div>' +
      '<div class="panel"><div class="panel-b flush tbl-wrap"><table class="t"><thead><tr><th>Klien</th><th>PIC</th><th class="num">Bulan berjalan</th><th class="num">1 bln</th><th class="num">2 bln</th><th class="num">3–5 bln</th><th class="num">≥ 6 bln</th><th class="num">Total sisa</th><th class="num">Insentif tertahan</th></tr></thead><tbody id="ag-b"></tbody></table></div></div>';
    var body = document.getElementById('ag-b');
    var draw = function () {
      var qq = U2(q);
      var L = d.clients.filter(function (c) { return !qq || U2(c.client).indexOf(qq) >= 0; });
      body.innerHTML = L.length ? L.map(function (c) {
        return '<tr class="click" data-cl="' + c.client_id + '"><td><b>' + F.esc(c.client) + '</b><div class="small faint">' + c.n + ' tagihan, tertua ' + F.bln(c.tertua) + '</div></td><td>' + F.esc(c.kode) + '</td>' + c.b.map(function (v, i) { return '<td class="num' + (i >= 3 && v ? ' neg' : '') + '">' + (v ? F.rp(v) : '') + '</td>'; }).join('') + '<td class="num"><b>' + F.rp(c.sisa) + '</b></td><td class="num">' + F.rp(c.tertahan) + '</td></tr>';
      }).join('') : '<tr><td colspan="9" class="muted">Tidak ada piutang yang cocok.</td></tr>';
      body.querySelectorAll('[data-cl]').forEach(function (r) { r.onclick = function () { App.clientDrawer(r.getAttribute('data-cl')); }; });
    };
    function U2(s) { return String(s || '').toUpperCase(); }
    draw();
    document.getElementById('ag-p').onchange = function (e) { App._agAsOf = e.target.value; V.piutang(main); };
    document.getElementById('ag-k').onchange = function (e) { App._agKode = e.target.value; V.piutang(main); };
    document.getElementById('ag-q').oninput = function (e) { q = App._agQ = e.target.value; draw(); };
  };
  App.clientDrawer = async function (id) {
    try {
      var d = await API.call('clientDetail', { id: id });
      var c = d.client;
      var pic = d.pic.slice(-1)[0];
      var lines = d.lines.map(function (l) { return '<tr><td>' + F.esc(l.jenis === 'CASH' ? 'CASH' : (l.invoice_no || l.catatan || '(tanpa no)')) + '</td><td class="nowrap">' + F.blnShort(l.periode) + '</td><td>' + F.esc(l.kode) + '</td><td class="num">' + F.rp(l.nilai) + '</td><td class="num">' + F.rp(l.dibayar) + '</td><td class="num ' + (l.sisa > 0.5 ? 'neg' : '') + '">' + (Math.abs(l.sisa) > 0.5 ? F.rp(l.sisa) : 'Lunas') + '</td><td class="num">' + F.rate(l.rate) + '</td></tr>'; }).join('');
      var pays = d.payments.map(function (p) { return '<tr><td class="nowrap">' + F.tgl(p.tanggal) + '</td><td>' + F.esc(p.receipt) + '</td><td>' + F.esc(p.invoice_no) + '</td><td class="num">' + F.rp(p.nilai) + '</td><td class="num">' + F.rp(p.insentif, 2) + '</td><td>' + F.esc(p.kode) + '</td><td>' + F.bln(F.addMonth(p.periode, 1)) + '</td></tr>'; }).join('');
      App.drawer({
        title: c.nama,
        body: '<dl class="kv" style="margin-bottom:16px"><dt>PIC sekarang</dt><dd>' + F.esc(pic ? App.staffName(pic.kode) + ' (sejak ' + F.bln(pic.mulai) + ')' : '-') + '</dd><dt>Segmen</dt><dd>' + F.esc(c.segmen || '-') + '</dd><dt>Kode BP Finance</dt><dd>' + F.esc(c.bp_code || '-') + '</dd><dt>Pertama tercatat</dt><dd>' + F.bln(c.first_periode) + '</dd>' + (c.alias ? '<dt>Nama lain</dt><dd>' + F.esc(c.alias.split('|').join(', ')) + '</dd>' : '') + '</dl>' +
          '<h3 style="margin-bottom:8px">Tagihan</h3><div class="tbl-wrap"><table class="t dense"><thead><tr><th>Invoice</th><th>Bulan</th><th>Staf</th><th class="num">Nilai</th><th class="num">Dibayar</th><th class="num">Sisa</th><th class="num">Rate</th></tr></thead><tbody>' + (lines || '<tr><td colspan="7" class="muted">Belum ada.</td></tr>') + '</tbody></table></div>' +
          '<h3 style="margin:18px 0 8px">Pembayaran</h3><div class="tbl-wrap"><table class="t dense"><thead><tr><th>Tanggal</th><th>No. terima</th><th>Invoice</th><th class="num">Nilai</th><th class="num">Insentif</th><th>Staf</th><th>Dicairkan</th></tr></thead><tbody>' + (pays || '<tr><td colspan="7" class="muted">Belum ada.</td></tr>') + '</tbody></table></div>' +
          '<h3 style="margin:18px 0 8px">Riwayat PIC</h3>' + (d.pic.length ? '<ul style="margin:0;padding-left:18px">' + d.pic.map(function (h) { return '<li>' + F.bln(h.mulai) + ': ' + F.esc(h.kode ? App.staffName(h.kode) : 'tanpa PIC') + ' <span class="faint small">(' + F.esc(h.sumber) + (h.catatan ? ', ' + F.esc(h.catatan) : '') + ')</span></li>'; }).join('') + '</ul>' : '<p class="muted">Belum ada.</p>')
      });
    } catch (e) { App.err(e); }
  };

  /* ------------------------------ log ------------------------------ */
  V.log = async function (main) {
    var L = await API.call('audit');
    main.innerHTML = '<div class="page-head"><div><h1>Log aktivitas</h1><div class="sub">500 aktivitas terakhir: login, import, hitung, keputusan, persetujuan.</div></div><div class="tools"><input class="in inline" id="lq" placeholder="Cari"></div></div>' +
      '<div class="panel"><div class="panel-b flush tbl-wrap"><table class="t dense"><thead><tr><th>Waktu</th><th>User</th><th>Aksi</th><th>Periode</th><th>Detail</th></tr></thead><tbody id="lb"></tbody></table></div></div>';
    var draw = function (q) {
      q = (q || '').toLowerCase();
      document.getElementById('lb').innerHTML = L.filter(function (a) { return !q || JSON.stringify(a).toLowerCase().indexOf(q) >= 0; }).map(function (a) {
        return '<tr><td class="nowrap">' + F.esc(F.waktu(a.pada)) + '</td><td>' + F.esc(a.username) + '</td><td>' + F.esc(a.aksi) + '</td><td>' + F.esc(a.periode) + '</td><td class="small" style="max-width:520px;word-break:break-word">' + F.esc(String(a.detail).slice(0, 300)) + '</td></tr>';
      }).join('');
    };
    draw();
    document.getElementById('lq').oninput = function (e) { draw(e.target.value); };
  };
})();
