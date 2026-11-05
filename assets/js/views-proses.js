/* =====================================================================
 * views-proses.js — Proses bulanan: upload data → rekonsiliasi → hasil
 * ===================================================================== */
(function () {
  'use strict';
  var App = window.App, F = App.F, I = App.I, S = App.S, V = App.views;

  // sama dengan U.norm di backend
  var STOP = { PT: 1, CV: 1, TBK: 1, UD: 1, THE: 1, PERSERO: 1 };
  App.norm = function (s) {
    s = String(s || '').toUpperCase().replace(/&/g, ' DAN ').replace(/\(\s*-*\s*\)/g, ' ');
    s = s.replace(/[^A-Z0-9]+/g, ' ').trim();
    return s.split(' ').filter(function (w) { return w && !STOP[w]; }).join(' ');
  };

  var SLOT = {
    SALES: { judul: 'Realisasi Sales', dari: 'Dari Finance · sheet APL, APP, APD', contoh: 'Realisasi_Sales_Periode_<Bulan>_2026.xlsx', role: ['ADMIN', 'FINANCE'] },
    AR: { judul: 'Realisasi AR', dari: 'Dari Finance · buku piutang & pembayaran', contoh: 'Realisasi_AR_<Bulan>_2026.xlsx', role: ['ADMIN', 'FINANCE'] },
    CALL: { judul: 'Call Report & Sales Report', dari: 'Dari Marketing · rekap omzet & kunjungan staf', contoh: '26MM - CALL REPORT _SALES REPORT.xlsx', role: ['ADMIN'] }
  };
  var KAT = {
    OMZET_TANPA_PIC: 'Omzet belum terbagi ke staf', TANPA_PIC: 'Klien tanpa PIC', PIC_GANDA: 'Diklaim lebih dari satu staf',
    BAYAR_TANPA_INVOICE: 'Pembayaran yang invoicenya tidak ada di sistem', PIC_RESIGN: 'PIC sudah resign', KLAIM_BEDA_PIC: 'Kemungkinan peralihan klien',
    KLAIM_TIDAK_ADA: 'Klaim staf yang tidak ada di data Finance', KLAIM_BEDA_NILAI: 'Nilai klaim staf beda dengan Finance', LEBIH_BAYAR: 'Kelebihan bayar',
    INVOICE_AR_SAJA: 'Invoice hanya ada di file AR', INVOICE_BEDA_NILAI: 'Nilai invoice di AR beda dengan Realisasi Sales', BAYAR_DIALOKASIKAN: 'Pembayaran yang dialokasikan otomatis',
    STAF_TIDAK_DIKENAL: 'Nama staf tidak dikenal', AR_KOSONG: 'Data belum lengkap', CALL_KOSONG: 'Data belum lengkap'
  };
  var ORDER = ['ERROR', 'WARN', 'INFO', 'ERROR_OK', 'OK'];

  function defaultPeriode() {
    var L = (S.boot.periods || []).slice().sort(function (a, b) { return a.periode < b.periode ? -1 : 1; });
    var open = L.filter(function (p) { return p.status === 'DRAFT' || p.status === 'DIHITUNG'; }).slice(-1)[0];
    if (open) return open.periode;
    var done = L.filter(function (p) { return p.status !== 'DRAFT'; }).slice(-1)[0];
    if (done) return F.addMonth(done.periode, 1);
    var d = new Date(); return F.addMonth(d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2), -1);
  }

  V.proses = async function (main, args) {
    var P = args[0] || defaultPeriode();
    var step = args[1] || 'upload';
    if (!args[0]) { App.go('proses/' + P + '/' + step); return; }
    S.boot.periods = await API.call('periods');
    var per = S.boot.periods.filter(function (p) { return p.periode === P; })[0];
    var locked = per && ['PROSES', 'DISETUJUI', 'ARSIP'].indexOf(per.status) >= 0;
    var stg = await API.call('staging', { periode: P });
    var computed = per && per.status !== 'DRAFT';
    var opts = '';
    for (var k = -6; k <= 2; k++) { var pp = F.addMonth(defaultPeriode(), k); opts += '<option value="' + pp + '"' + (pp === P ? ' selected' : '') + '>Sales ' + F.bln(pp) + '</option>'; }
    var st = function (key, n, title, sub) {
      var done = key === 'upload' ? !!stg.SALES : key === 'rekonsiliasi' ? (computed && per.n_error === 0) : (per && per.status === 'PROSES');
      return '<a href="#/proses/' + P + '/' + key + '" class="' + (step === key ? 'on' : '') + (done && step !== key ? ' done' : '') + '"><span class="n">' + (done && step !== key ? '✓' : n) + '</span><span><b>' + title + '</b><span class="s">' + sub + '</span></span></a>';
    };
    main.innerHTML = App.demoBanner() + '<div class="page-head"><div><h1>Proses bulanan</h1><div class="sub">Insentif ' + F.bln(F.addMonth(P, 1)) + ' dari penjualan ' + F.bln(P) + ' ' + (per ? App.statusChip(per.status, per.step) : '<span class="chip">Belum mulai</span>') + '</div></div>' +
      '<div class="tools"><label class="small muted" for="pp">Bulan penjualan</label><select class="in inline" id="pp">' + opts + '</select></div></div>' +
      (locked ? '<div class="note warn" style="margin-bottom:16px">Periode ini sudah diajukan/disetujui sehingga datanya terkunci. <a href="#/periode/' + P + '">Buka laporan periode</a>.</div>' : '') +
      '<nav class="steps" aria-label="Langkah proses">' + st('upload', 1, 'Upload data', 'File Finance & Marketing') + st('rekonsiliasi', 2, 'Rekonsiliasi', computed ? (per.n_error ? per.n_error + ' perlu diputuskan' : 'Tidak ada yang menghalangi') : 'Setelah dihitung') + st('hasil', 3, 'Hasil & ajukan', computed ? 'Cair ' + F.rpShort(per.cair) : 'Belum dihitung') + '</nav><div id="pv"></div>';
    document.getElementById('pp').onchange = function (e) { App.go('proses/' + e.target.value + '/' + step); };
    var pv = document.getElementById('pv');
    if (step === 'upload') upload(pv, P, stg, per, locked);
    else if (step === 'rekonsiliasi') await rekon(pv, P, per, locked);
    else await hasil(pv, P, per, locked);
  };

  /* ---------------------------- 1. upload ---------------------------- */
  function upload(pv, P, stg, per, locked) {
    var slot = function (j) {
      var o = SLOT[j], s = stg[j], can = o.role.some(App.hasRole) && !locked;
      return '<div class="drop ' + (s ? 'has' : '') + '" data-slot="' + j + '"><div><h3>' + o.judul + '</h3><div class="src">' + o.dari + '</div></div>' +
        (s ? '<div class="stat"><b>' + (j === 'AR' ? F.rp(s.total) : F.rp(s.total)) + '</b>' + (j === 'AR' ? 'pembayaran masuk' : j === 'CALL' ? 'total klaim omzet staf' : 'total omzet') + ' · ' + s.baris + ' baris' +
          (s.info ? '<div class="small faint">' + F.esc(s.info.filename) + ', ' + F.esc(F.waktu(s.info.pada)) + ' oleh ' + F.esc(s.info.oleh) + '</div>' : '') + '</div>' : '<div class="small faint">Contoh nama file: ' + F.esc(o.contoh) + '</div>') +
        '<div class="act">' + (can ? '<label class="btn ' + (s ? '' : 'primary') + '">' + I.upload + (s ? 'Ganti file' : 'Pilih file') + '<input type="file" accept=".xlsx,.xls" class="hidden" data-file="' + j + '"></label>' : '') + (can ? '<span class="small faint" style="align-self:center">atau seret file ke sini</span>' : '') + '</div></div>';
    };
    pv.innerHTML = '<div class="upl">' + slot('SALES') + slot('AR') + slot('CALL') + '</div>' +
      '<div class="panel" style="margin-top:18px"><div class="panel-b row" style="justify-content:space-between"><div><b>Siap menghitung?</b><div class="small muted">Realisasi Sales wajib. Tanpa AR, hanya transaksi CASH yang cair. Tanpa Call Report, PIC klien baru tidak bisa ditebak otomatis.</div></div>' +
      (App.hasRole('ADMIN') && !locked ? (stg.SALES || stg.AR || stg.CALL || per ? '<button class="btn" id="rst">' + I.refresh + 'Reset draft</button>' : '') + '<button class="btn primary" id="hit" ' + (stg.SALES ? '' : 'disabled') + '>' + I.refresh + (per && per.status !== 'DRAFT' ? 'Hitung ulang' : 'Hitung sekarang') + '</button>' : '') + '</div></div>' +
      '<p class="small faint" style="margin-top:10px">File dibaca di browser Anda. Sheet MASTER di Call Report (berisi data pasien) tidak dibaca dan tidak dikirim ke server.</p>';
    pv.querySelectorAll('[data-file]').forEach(function (inp) { inp.onchange = function () { if (inp.files[0]) handleFile(inp.files[0], inp.getAttribute('data-file'), P); inp.value = ''; }; });
    pv.querySelectorAll('.drop').forEach(function (d) {
      var j = d.getAttribute('data-slot');
      if (!SLOT[j].role.some(App.hasRole) || locked) return;
      d.addEventListener('dragover', function (e) { e.preventDefault(); d.classList.add('over'); });
      d.addEventListener('dragleave', function () { d.classList.remove('over'); });
      d.addEventListener('drop', function (e) { e.preventDefault(); d.classList.remove('over'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0], j, P); });
    });
    var hit = document.getElementById('hit');
    if (hit) hit.onclick = function () { doCompute(P, 'rekonsiliasi'); };
    var rst = document.getElementById('rst');
    if (rst) rst.onclick = function () { resetDraft(P); };
  }
  /** Reset draft: buang semua file & hasil hitung periode ini (hanya untuk periode belum diajukan, maks 5 hari sejak upload). */
  async function resetDraft(P) {
    var ya = await App.confirm('Reset draft ' + F.bln(P) + '?',
      'Semua file yang sudah diupload dan hasil hitung periode ini akan dihapus. Periode bisa diisi ulang dari awal. Tidak bisa dibatalkan.', 'Ya, reset', true);
    if (!ya) return;
    var pw = await App.prompt('Konfirmasi reset draft', 'Masukkan password akun Anda', { password: true, required: true, danger: true, ok: 'Reset draft' });
    if (pw === null) return;
    try {
      await API.call('resetDraft', { periode: P, password: pw });
      App.toast('Draft ' + F.bln(P) + ' direset. Silakan upload ulang.');
      S.boot = await API.call('bootstrap');
      App.route();
    } catch (e) { App.err(e); }
  }
  async function doCompute(P, then) {
    try {
      var r = await API.call('compute', { periode: P });
      App.toast('Dihitung: omzet ' + F.rpShort(r.periode.omzet) + ', insentif cair ' + F.rp(r.periode.cair) + (r.periode.n_error ? '. Ada ' + r.periode.n_error + ' hal yang perlu diputuskan.' : '.'));
      S.boot = await API.call('bootstrap');
      if (then) App.go('proses/' + P + '/' + then); else App.route();
    } catch (e) { App.err(e); }
  }
  async function handleFile(file, slot, P) {
    try {
      var wb = await App.readWorkbook(file);
      var det = Parsers.detect(wb.SheetNames);
      if (det && det !== slot) {
        var ok = await App.confirm('Jenis file tidak cocok', 'File <b>' + F.esc(file.name) + '</b> terlihat seperti <b>' + F.esc((SLOT[det] || { judul: det }).judul) + '</b>, bukan ' + F.esc(SLOT[slot].judul) + '. Tetap lanjut?', 'Tetap lanjut');
        if (!ok) return;
      }
      var d = slot === 'SALES' ? Parsers.parseSales(XLSX, wb) : slot === 'AR' ? Parsers.parseAR(XLSX, wb) : Parsers.parseCallReport(XLSX, wb);
      d.periode = d.periode || Parsers.periodeFromFilename(file.name);
      preview(slot, d, file.name, P);
    } catch (e) { App.err(e); }
  }
  function warnList(w) { return w && w.length ? '<div class="note warn" style="margin-top:12px"><b>' + w.length + ' catatan saat membaca file</b><ul style="margin:6px 0 0;padding-left:18px">' + w.slice(0, 15).map(function (x) { return '<li>' + F.esc(x) + '</li>'; }).join('') + '</ul></div>' : ''; }
  function preview(slot, d, fname, P) {
    var body = '<dl class="kv"><dt>File</dt><dd>' + F.esc(fname) + '</dd><dt>Periode di file</dt><dd>' + (d.periode ? F.bln(d.periode) : '<span class="neg">tidak terbaca</span>') + '</dd><dt>Disimpan ke</dt><dd>Penjualan ' + F.bln(P) + '</dd></dl>';
    if (d.periode && d.periode !== P) body += '<div class="note err" style="margin-top:12px">Periode di file (' + F.bln(d.periode) + ') berbeda dengan periode yang dipilih (' + F.bln(P) + '). Pastikan file-nya benar.</div>';
    if (slot === 'SALES') {
      body += '<table class="t dense" style="margin-top:14px"><thead><tr><th>Segmen</th><th>Sheet</th><th class="num">Klien</th><th class="num">Terbaca</th><th class="num">Grand Total di file</th></tr></thead><tbody>' +
        Object.keys(d.segmen).map(function (k) { var s = d.segmen[k]; return '<tr><td>' + k + '</td><td>' + F.esc(s.sheet) + '</td><td class="num">' + s.klien + '</td><td class="num">' + F.rp(s.total) + '</td><td class="num ' + (s.grandTotal !== null && Math.abs(s.grandTotal - s.total) > 1 ? 'neg' : '') + '">' + (s.grandTotal === null ? '–' : F.rp(s.grandTotal)) + '</td></tr>'; }).join('') +
        '<tr class="total"><td colspan="3">Total</td><td class="num">' + F.rp(d.total) + '</td><td></td></tr></tbody></table>';
      var cash = d.lines.filter(function (l) { return /^CASH/i.test(l.label); }).reduce(function (a, l) { return a + l.nilai; }, 0);
      body += '<p class="small muted" style="margin-top:8px">' + d.lines.length + ' baris tagihan, termasuk CASH ' + F.rp(cash) + ' (langsung dianggap lunas bulan ini).</p>';
    } else if (slot === 'AR') {
      var inv = d.rows.filter(function (r) { return r.tipe === 'INV'; }).length, rcv = d.rows.filter(function (r) { return r.tipe === 'RCV' && r.bayar; });
      var noref = rcv.filter(function (r) { return !r.ref; }).length;
      body += '<dl class="kv" style="margin-top:14px"><dt>Klien</dt><dd>' + new Set(d.rows.map(function (r) { return r.code || r.client; })).size + '</dd><dt>Invoice baru</dt><dd>' + inv + ' (' + F.rp(d.totalSales) + ')</dd><dt>Pembayaran</dt><dd>' + rcv.length + ' (' + F.rp(d.totalBayar) + ')</dd><dt>Tanpa nomor invoice</dt><dd>' + noref + '</dd></dl>';
    } else {
      body += '<table class="t dense" style="margin-top:14px"><thead><tr><th>Staf</th><th class="num">Rekanan diklaim</th><th class="num">Total klaim</th><th class="num">Kunjungan</th></tr></thead><tbody>' +
        (d.staff.length ? d.staff : Object.keys(d.claims.reduce(function (o, c) { o[c.staf] = 1; return o; }, {})).map(function (n) { return { staf: n }; })).map(function (s) {
          var cl = d.claims.filter(function (c) { return c.staf === s.staf || App.norm(c.staf).split(' ')[0] === App.norm(s.staf).split(' ')[0]; });
          return '<tr><td>' + F.esc(s.staf) + '</td><td class="num">' + cl.length + '</td><td class="num">' + F.rp(cl.reduce(function (a, c) { return a + c.omzet; }, 0)) + '</td><td class="num">' + (s.calls !== undefined ? s.calls + ' / ' + (s.callTarget || '-') : '–') + '</td></tr>';
        }).join('') + '</tbody></table>';
    }
    body += warnList(d.warnings);
    var m = App.modal({ title: 'Periksa sebelum disimpan: ' + SLOT[slot].judul, wide: true, body: body, foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan ke periode ' + F.bln(P) + '</button>' });
    m.querySelector('[data-ok]').onclick = async function () {
      try {
        var payload = slot === 'SALES' ? { lines: d.lines, warnings: d.warnings } : slot === 'AR' ? { rows: d.rows, warnings: d.warnings } : { claims: d.claims, staff: d.staff, visits: d.visits, warnings: d.warnings };
        var r = await API.call('importStaging', { periode: P, jenis: slot, data: payload, filename: fname });
        m.close(); App.toast(SLOT[slot].judul + ' tersimpan: ' + r.baris + ' baris.');
        App.route();
      } catch (e) { App.err(e); }
    };
  }

  /* ---------------------------- 2. rekonsiliasi ---------------------------- */
  async function rekon(pv, P, per, locked) {
    if (!per || per.status === 'DRAFT') {
      pv.innerHTML = '<div class="panel"><div class="empty"><h3>Belum dihitung</h3><p>Upload data lalu klik Hitung sekarang.</p><a class="btn primary" href="#/proses/' + P + '/upload">Ke langkah upload</a></div></div>';
      return;
    }
    var rep = await API.call('report', { periode: P, live: true });
    var res = await API.call('resolutions', { periode: P });
    var iss = rep.issues.slice().sort(function (a, b) { return ORDER.indexOf(a.level) - ORDER.indexOf(b.level); });
    var cnt = function (l) { return iss.filter(function (i) { return i.level === l; }).length; };
    var groups = {};
    iss.forEach(function (i) { var g = i.level === 'OK' || i.level === 'ERROR_OK' ? 'SELESAI' : i.kategori; (groups[g] = groups[g] || []).push(i); });
    var gk = Object.keys(groups).sort(function (a, b) {
      var la = a === 'SELESAI' ? 9 : ORDER.indexOf(groups[a][0].level), lb = b === 'SELESAI' ? 9 : ORDER.indexOf(groups[b][0].level);
      return la - lb;
    });
    var cmp = rep.staff.filter(function (s) { return s.status === 'AKTIF'; }).map(function (s) {
      var d = s.klaim - s.omzet;
      return '<tr><td>' + F.esc(s.nama) + '</td><td class="num">' + F.rp(s.klaim) + '</td><td class="num">' + F.rp(s.omzet) + '</td><td class="num ' + (Math.abs(d) > 1 ? 'neg' : '') + '">' + (Math.abs(d) > 1 ? F.rp(d) : 'cocok') + '</td><td class="num">' + (s.calls ? s.calls + ' / ' + s.call_target : '–') + '</td></tr>';
    }).join('');
    var adj = res.filter(function (r) { return r.jenis === 'ADJ'; });
    var dec = res.filter(function (r) { return r.jenis !== 'ADJ'; });
    var canAct = App.hasRole('ADMIN') && !locked;
    pv.innerHTML = '<div class="panel"><div class="panel-b row" style="justify-content:space-between"><div class="row">' +
      '<span class="chip err">' + cnt('ERROR') + ' harus diputuskan</span><span class="chip warn">' + cnt('WARN') + ' perlu dicek</span><span class="chip ink">' + cnt('INFO') + ' info</span><span class="chip cash">' + (cnt('OK') + cnt('ERROR_OK')) + ' sudah ditangani</span></div>' +
      (canAct ? '<button class="btn" id="rh">' + I.refresh + 'Hitung ulang</button>' : '') + '</div></div>' +
      '<div class="grid g3" style="margin-top:18px"><div id="isv">' + (gk.length ? '' : '<div class="panel"><div class="empty"><h3>Semua cocok</h3><p>Tidak ada selisih antara data Finance, AR, dan laporan staf.</p></div></div>') + '</div>' +
      '<div><div class="panel"><div class="panel-h"><h3>Omzet: laporan staf vs Finance</h3></div><div class="panel-b flush tbl-wrap"><table class="t dense"><thead><tr><th>Staf</th><th class="num">Klaim staf</th><th class="num">Finance</th><th class="num">Selisih</th><th class="num">Kunjungan</th></tr></thead><tbody>' + cmp + '</tbody></table></div><div class="panel-b small muted">Omzet resmi selalu dari data Finance. Klaim staf dipakai untuk mencocokkan dan menebak PIC klien baru.</div></div>' +
      '<div class="panel"><div class="panel-h"><h3>Penyesuaian manual</h3>' + (canAct ? '<button class="btn sm" id="adj-add">' + I.plus + 'Tambah</button>' : '') + '</div><div class="panel-b">' +
      (adj.length ? '<table class="t dense"><tbody>' + adj.map(function (a) { var x = JSON.parse(a.data); return '<tr><td>' + F.esc(x.kode) + '</td><td>' + F.esc(x.alasan) + '</td><td class="num ' + (x.nilai < 0 ? 'neg' : 'pos') + '">' + F.rp(x.nilai, 2) + '</td><td class="num">' + (canAct ? '<button class="btn ghost sm" data-del="' + F.esc(a.key) + '" aria-label="Hapus">' + I.x + '</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="small muted">Untuk koreksi kurang/lebih bayar periode sebelumnya. Nilai masuk ke insentif cair staf dan tampil di rincian.</p>') + '</div></div>' +
      '<div class="panel"><div class="panel-h"><h3>Keputusan tercatat</h3><span class="muted small">' + dec.length + '</span></div><div class="panel-b" style="max-height:320px;overflow:auto">' +
      (dec.length ? dec.map(function (r) { return '<div class="row small" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:6px 0"><span><b>' + F.esc(r.jenis) + '</b> ' + F.esc(descRes(r)) + '<br><span class="faint">' + F.esc(r.oleh) + ', ' + F.esc(F.waktu(r.pada)) + '</span></span>' + (canAct ? '<button class="btn ghost sm" data-del="' + F.esc(r.key) + '" data-glob="' + (r.periode === '*' ? 1 : 0) + '">Batalkan</button>' : '') + '</div>'; }).join('') : '<p class="small muted">Belum ada.</p>') + '</div></div></div></div>' +
      (canAct ? '<div class="row end" style="margin-top:18px"><a class="btn primary" href="#/proses/' + P + '/hasil">Lanjut ke hasil</a></div>' : '');
    var isv = document.getElementById('isv');
    gk.forEach(function (g) {
      var L = groups[g];
      var div = document.createElement('div'); div.className = 'iss-group';
      div.innerHTML = '<h3>' + F.esc(g === 'SELESAI' ? 'Sudah ditangani' : (KAT[g] || g)) + ' <span class="chip">' + L.length + '</span></h3>';
      L.forEach(function (i) { div.appendChild(issueCard(i, P, canAct)); });
      isv.appendChild(div);
    });
    var rh = document.getElementById('rh'); if (rh) rh.onclick = function () { doCompute(P); };
    var aa = document.getElementById('adj-add'); if (aa) aa.onclick = function () { adjDialog(P); };
    pv.querySelectorAll('[data-del]').forEach(function (b) {
      b.onclick = async function () { try { await API.call('resolve', { periode: P, key: b.getAttribute('data-del'), hapus: true }); await doCompute(P); } catch (e) { App.err(e); } };
    });
  }
  function descRes(r) {
    var d = {}; try { d = JSON.parse(r.data); } catch (e) {}
    if (r.jenis === 'PIC') return r.key.replace('PIC|', '') + ' → ' + (d.kode || 'tanpa PIC');
    if (r.jenis === 'BAYAR') return r.key.split('|').slice(1, 3).join(' ') + ': ' + (d.aksi === 'TAUTKAN' ? 'ditautkan' : d.aksi === 'LAMA' ? 'invoice lama ' + d.kode + ' ' + F.bln(d.periode) : 'diabaikan');
    if (r.jenis === 'NAMA') return '"' + (d.nama || '') + '" = klien ' + d.client_id;
    if (r.jenis === 'ACK') return (d.catatan || 'sudah dicek') + ' (' + r.key.split('|')[1] + ')';
    return r.key;
  }
  function issueCard(i, P, canAct) {
    var d = i.data || {};
    var el = document.createElement('div');
    el.className = 'iss ' + i.level;
    var acts = '';
    var done = i.level === 'OK' || i.level === 'ERROR_OK';
    if (canAct && !done) {
      if (i.kategori === 'TANPA_PIC' || i.kategori === 'PIC_GANDA' || i.kategori === 'PIC_RESIGN') {
        var sel = d.kandidat && d.kandidat.length ? d.kandidat[0] : '';
        acts = '<select class="in" data-k aria-label="Pilih staf">' + App.staffOptions(sel, { empty: 'Pilih staf…', aktif: true }) + '</select><button class="btn sm primary" data-a="pic">Tetapkan PIC mulai ' + F.blnShort(P) + '</button><button class="btn sm" data-a="house">Bukan akun staf (tanpa insentif)</button>';
      } else if (i.kategori === 'KLAIM_BEDA_PIC') {
        acts = '<button class="btn sm primary" data-a="move">Pindahkan ke ' + F.esc(d.kandidat[0]) + ' mulai ' + F.blnShort(P) + '</button><button class="btn sm" data-a="ack">Tetap di ' + F.esc(d.pic) + '</button>';
      } else if (i.kategori === 'BAYAR_TANPA_INVOICE') {
        acts = (d.saran && d.saran.length ? '<select class="in" data-line aria-label="Pilih tagihan">' + d.saran.map(function (s) { return '<option value="' + s.line_id + '">' + F.esc(s.invoice_no + ' · ' + F.blnShort(s.periode) + ' · sisa ' + F.rp(s.sisa) + ' · ' + (s.kode || '-')) + '</option>'; }).join('') + '</select><button class="btn sm primary" data-a="link">Tautkan</button>' : '') +
          '<button class="btn sm' + (d.saran && d.saran.length ? '' : ' primary') + '" data-a="lama">Catat sebagai invoice lama…</button><button class="btn sm" data-a="ignore">Abaikan (bukan insentif)</button>';
      } else if (i.kategori === 'KLAIM_TIDAK_ADA') {
        acts = (d.saran && d.saran.length ? '<select class="in" data-cl aria-label="Pilih klien">' + d.saran.map(function (s) { return '<option value="' + s.id + '">' + F.esc(s.nama) + ' (' + Math.round(s.skor * 100) + '% mirip)</option>'; }).join('') + '</select><button class="btn sm" data-a="alias">Ini klien yang sama</button>' : '') + '<button class="btn sm" data-a="ack">Tandai sudah dicek</button>';
      } else if (i.kategori !== 'OMZET_TANPA_PIC' && i.kategori !== 'AR_KOSONG' && i.kategori !== 'CALL_KOSONG') {
        acts = '<button class="btn sm" data-a="ack">Tandai sudah dicek</button>';
      } else if (i.kategori !== 'OMZET_TANPA_PIC') {
        acts = '<a class="btn sm" href="#/proses/' + P + '/upload">Upload file</a><button class="btn sm" data-a="ack">Lanjut tanpa file ini</button>';
      }
    }
    el.innerHTML = '<div class="msg">' + F.esc(i.pesan) + '</div>' + (acts ? '<div class="acts">' + acts + '</div>' : '');
    var send = async function (payload) { try { await API.call('resolve', Object.assign({ periode: P }, payload)); await doCompute(P); } catch (e) { App.err(e); } };
    el.addEventListener('click', async function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'pic') { var k = el.querySelector('[data-k]').value; if (!k) return App.toast('Pilih staf dulu.', true); send({ key: 'PIC|' + d.client_id, jenis: 'PIC', data: { kode: k } }); }
      else if (a === 'house') send({ key: 'PIC|' + d.client_id, jenis: 'PIC', data: { kode: '', catatan: 'Bukan akun staf' } });
      else if (a === 'move') send({ key: 'PIC|' + d.client_id, jenis: 'PIC', data: { kode: d.kandidat[0], catatan: 'Peralihan dari ' + d.pic } });
      else if (a === 'ack') { var c = await App.prompt('Tandai sudah dicek', 'Catatan singkat', { value: 'Sudah dikonfirmasi', ok: 'Tandai' }); if (c !== null) send({ key: 'ACK|' + i.id, jenis: 'ACK', data: { catatan: c } }); }
      else if (a === 'link') send({ key: d.key, jenis: 'BAYAR', data: { aksi: 'TAUTKAN', line_id: el.querySelector('[data-line]').value } });
      else if (a === 'ignore') { var c2 = await App.prompt('Abaikan pembayaran', 'Alasan', { required: true, ok: 'Abaikan' }); if (c2 !== null) send({ key: d.key, jenis: 'BAYAR', data: { aksi: 'ABAIKAN', catatan: c2 } }); }
      else if (a === 'lama') lamaDialog(P, d, send);
      else if (a === 'alias') { var cid = el.querySelector('[data-cl]').value; send({ key: 'NAMA|' + App.norm(d.client), jenis: 'NAMA', global: true, data: { client_id: cid, nama: d.client } }); }
    });
    return el;
  }
  function lamaDialog(P, d, send) {
    var m = App.modal({
      title: 'Catat sebagai invoice lama',
      body: '<p class="muted">' + F.esc(d.client) + ' membayar ' + F.rp(d.bayar) + ' untuk ' + F.esc(d.ref || 'invoice tanpa nomor') + '. Isi dari bulan apa penjualannya dan siapa stafnya; insentif dihitung dengan rate bulan itu.</p>' +
        '<div class="form-grid"><div class="field"><label>Staf</label><select class="in" id="lk">' + App.staffOptions(d.pic || '', { empty: 'Pilih staf…' }) + '</select></div>' +
        '<div class="field"><label>Bulan penjualan</label><input class="in" type="month" id="lp" value="' + F.addMonth(P, -1) + '"></div>' +
        '<div class="field"><label>Rate (%)</label><input class="in" id="lr" placeholder="Kosongkan = rate staf bulan itu"><span class="hint">Contoh 0,375</span></div>' +
        '<div class="field"><label>Catatan</label><input class="in" id="lc" value="Invoice sebelum sistem"></div></div>',
      foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan</button>'
    });
    m.querySelector('[data-ok]').onclick = function () {
      var k = m.querySelector('#lk').value, pp = m.querySelector('#lp').value, rr = m.querySelector('#lr').value.trim();
      if (!k || !pp) return App.toast('Staf dan bulan penjualan wajib diisi.', true);
      m.close();
      send({ key: d.key, jenis: 'BAYAR', data: { aksi: 'LAMA', kode: k, periode: pp, rate: rr === '' ? '' : F.num(rr) / 100, client_id: d.client_id, catatan: m.querySelector('#lc').value } });
    };
  }
  function adjDialog(P) {
    var m = App.modal({
      title: 'Tambah penyesuaian manual',
      body: '<div class="form-grid"><div class="field"><label>Staf</label><select class="in" id="ak">' + App.staffOptions('', { empty: 'Pilih staf…' }) + '</select></div>' +
        '<div class="field"><label>Nilai (Rp)</label><input class="in" id="an" placeholder="Contoh 5775 atau -18593"><span class="hint">Minus = mengurangi insentif cair.</span></div></div>' +
        '<div class="field"><label>Alasan</label><input class="in" id="aa" placeholder="Contoh: kurang bayar RS Sheila Medika periode September"></div>',
      foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan penyesuaian</button>'
    });
    m.querySelector('[data-ok]').onclick = async function () {
      var k = m.querySelector('#ak').value, n = F.num(m.querySelector('#an').value), a = m.querySelector('#aa').value.trim();
      if (!k || !n || !a) return App.toast('Staf, nilai, dan alasan wajib diisi.', true);
      try { await API.call('resolve', { periode: P, key: 'ADJ|' + Date.now().toString(36), jenis: 'ADJ', data: { kode: k, nilai: n, alasan: a } }); m.close(); await doCompute(P); } catch (e) { App.err(e); }
    };
  }

  /* ---------------------------- 3. hasil ---------------------------- */
  async function hasil(pv, P, per, locked) {
    if (!per || per.status === 'DRAFT') { pv.innerHTML = '<div class="panel"><div class="empty"><h3>Belum dihitung</h3><a class="btn primary" href="#/proses/' + P + '/upload">Ke langkah upload</a></div></div>'; return; }
    var rep = await API.call('report', { periode: P, live: true });
    var nErr = rep.issues.filter(function (i) { return i.level === 'ERROR'; }).length;
    pv.innerHTML = '<div class="panel"><div class="panel-h"><h2>Hasil perhitungan</h2><span class="muted">Dihitung ' + F.esc(F.waktu(per.computed_at)) + ' oleh ' + F.esc(per.computed_by) + '</span></div><div class="panel-b flush">' + App.staffTable(rep) + '</div></div>' +
      '<div class="panel"><div class="panel-b row" style="justify-content:space-between"><div>' + (nErr ? '<b class="neg">Masih ada ' + nErr + ' hal yang harus diputuskan.</b><div class="small muted">Selesaikan di langkah Rekonsiliasi sebelum diajukan.</div>' : '<b>Siap diajukan.</b><div class="small muted">Periksa dulu pratinjau dokumen. Setelah diajukan, data periode ini terkunci.</div>') + '</div>' +
      '<div class="row"><button class="btn" id="pr">' + I.printer + 'Pratinjau dokumen</button><a class="btn" href="#/periode/' + P + '">' + I.file + 'Laporan lengkap</a>' +
      (App.hasRole('ADMIN') && per.status === 'DIHITUNG' ? '<button class="btn primary" id="sb" ' + (nErr ? 'disabled' : '') + '>' + I.stamp + 'Ajukan persetujuan</button>' : '') + '</div></div></div>';
    document.getElementById('pr').onclick = function () { App.printPreview(rep); };
    var sb = document.getElementById('sb'); if (sb) sb.onclick = function () { App.submitDialog(P); };
  }
})();
