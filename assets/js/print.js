/* =====================================================================
 * print.js — dokumen A4 (Persentase, Rincian per staf, Pencairan, Resume),
 *            pratinjau, cetak, unduh PDF, unduh Excel
 * ===================================================================== */
(function () {
  'use strict';
  var App = window.App, F = App.F, I = App.I, S = App.S;
  var e = F.esc;
  function rp0(v) { return v ? F.n(v) : ''; }
  function rp2(v) { return v ? F.n(v, 2) : ''; }
  function rateTxt(v) { return v === null || v === undefined ? '' : F.rate(v); }
  var BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  /** Nama file: "2025 12 10 Perhitungan Insentif November 2025.pdf"
   *  Tanggal = tanggal tombol Hitung diklik (tersimpan di periode, zona Jakarta); bulan = bulan sales.
   *  Untuk PDF per staf ditambah " - Nama Staf". */
  function namaFile(rep, ext, nama) {
    var tgl = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(rep.computedAt || rep.generated || Date.now())).replace(/-/g, ' ');
    return tgl + ' Perhitungan Insentif ' + rep.bulanSales + (nama ? ' - ' + nama : '') + '.' + ext;
  }

  /** Periode sebelumnya dalam nama bulan, mis. "2026-08" → "Juli 2026" */
  function namaBulanLalu(p) {
    var y = +p.slice(0, 4), m = +p.slice(5, 7) - 2;
    if (m < 0) { m += 12; y -= 1; }
    return BLN[m] + ' ' + y;
  }

  /** Kalimat ringkasan kenaikan omzet satu staf */
  function kalimatAnalisis(rep, s) {
    var now = s.omzet || 0, lalu = s.omzet_lalu || 0, namaLalu = namaBulanLalu(rep.periode);
    if (!lalu) return 'Belum ada data omzet ' + namaLalu + ' sebagai pembanding.';
    var naik = (now - lalu) / lalu;
    return 'Omzet ' + (naik >= 0 ? 'naik ' : 'turun ') + F.n(Math.abs(naik) * 100, 2) + '% dibanding ' + namaLalu +
      ' (selisih Rp ' + F.n(now - lalu) + ').';
  }

  /** Blok analisis perbandingan omzet per staf (Rupiah, rumus sama dengan sheet REKAP) */
  function analisisHtml(rep, s) {
    var now = s.omzet || 0, lalu = s.omzet_lalu || 0, tgt = s.target || 0;
    var namaLalu = namaBulanLalu(rep.periode);
    var naik = lalu ? (now - lalu) / lalu : null;
    var kalimat = kalimatAnalisis(rep, s);
    var kunjungan = s.call_target
      ? s.calls + ' dari target ' + s.call_target + ' kunjungan (' + F.n(s.calls / s.call_target * 100, 0) + '%)'
      : s.calls + ' kunjungan';
    var row = function (k, v) { return '<tr><td style="width:55%">' + e(k) + '</td><td class="num">' + v + '</td></tr>'; };
    return '<div style="font-weight:700;margin:5mm 0 2mm">ANALISIS PERBANDINGAN OMZET</div>' +
      '<table class="dt"><tbody>' +
      row('Omzet bulan ini (Sales ' + e(rep.bulanSales) + ')', 'Rp ' + F.n(now)) +
      row('Omzet bulan lalu (Sales ' + e(namaLalu) + ')', lalu ? 'Rp ' + F.n(lalu) : '-') +
      row('Selisih omzet', lalu ? 'Rp ' + F.n(now - lalu) : '-') +
      row('Kenaikan / penurunan omzet (%)', naik === null ? '-' : F.n(naik * 100, 2) + '%') +
      row('Pencapaian target bulan ini', tgt ? F.n(now / tgt * 100, 0) + '%' : '-') +
      row('Kunjungan call report', kunjungan) +
      '</tbody></table>' +
      '<div style="margin-top:2mm">' + e(kalimat) + '</div>';
  }

  /* ------------------------------ potongan dokumen ------------------------------ */
  function headHtml(rep, title, docNo, extra) {
    var org = rep.org || S.boot.settings.org;
    return '<div class="doc-head"><div><div class="org">' + e(org.nama) + '</div><div class="ttl">' + e(title) + '</div><div class="per">PERIODE : ' + e(rep.label) + '</div>' + (extra || '') + '</div>' +
      '<div><div class="no">' + e(docNo || '') + '</div><div class="pg" data-pg></div></div></div>';
  }
  function sigsHtml(rep, cols) {
    var sg = rep.signers || S.boot.settings.signers;
    var by = App.validApprovals(rep.approvals);
    var org = rep.org || S.boot.settings.org;
    var tgl = rep.tglSurat ? F.tgl(rep.tglSurat) : '';
    return '<div class="doc-place">' + e(org.kota || 'Surabaya') + ', ' + (tgl ? e(tgl) : '..............................') + '</div>' +
      '<div class="sigs c' + (cols || 5) + '">' + sg.map(function (s) {
        var a = by[s.step];
        return '<div class="sig"><div class="l">' + e(s.label) + '</div><div class="space">' +
          (a ? '<span class="qr">' + App.qrSvg(App.verifyUrl(a.kode), 2) + '</span><span class="dg">Disetujui digital<br>' + e(F.waktu(a.pada)) + '<br>' + a.kode + '</span>' : '') +
          '</div><div class="n">' + e(a ? a.nama : s.nama) + '</div><div class="j">' + e(s.jabatan) + '</div></div>';
      }).join('') + '</div>';
  }
  function footHtml(rep) {
    return '<div class="doc-foot"><span>Dicetak dari Sistem Insentif S&amp;M · ' + e(F.waktu(new Date().toISOString())) + '</span><span>' + (rep.arsipExcel ? 'Arsip dari file Excel' : 'Data hash ' + e(String((rep.periodeRow || {}).data_hash || '').slice(0, 12))) + '</span></div>';
  }

  /* ------------------------------ paginator ------------------------------ */
  var stage;
  function getStage() {
    if (!stage) { stage = document.createElement('div'); stage.style.cssText = 'position:absolute;left:-12000px;top:0;'; document.body.appendChild(stage); }
    return stage;
  }
  function newPage(land, head, out) {
    var p = document.createElement('div');
    p.className = 'page' + (land ? ' land' : '');
    p.innerHTML = head + '<div class="doc-body"></div>';
    getStage().appendChild(p);
    out.push(p);
    return p.querySelector('.doc-body');
  }
  function overflow(body) { return body.scrollHeight > body.clientHeight + 1; }

  /** Dokumen 1: Perhitungan persentase insentif */
  function docPersen(rep, out) {
    var docNo = (rep.docNo || S.boot.settings.doc_no).persen;
    var head = headHtml(rep, 'PERHITUNGAN PERSENTASE INSENTIF', docNo);
    var start = out.length;
    var body, cols;
    var mkPage = function () {
      body = newPage(false, head, out);
      var wrap = document.createElement('div'); wrap.className = 'blocks'; body.appendChild(wrap);
      cols = [document.createElement('div'), document.createElement('div')];
      cols.forEach(function (c) { wrap.appendChild(c); });
    };
    mkPage();
    var staff = rep.staff.filter(function (s) { return s.status === 'AKTIF'; });
    var blockHtml = function (s, rows, cont) {
      return '<div class="blk-name">' + e(String(s.nama).toUpperCase()) + (cont ? ' (lanjutan)' : '') + '</div><table class="dt"><thead><tr><th style="width:22px">NO</th><th>REKANAN</th><th style="width:30%">SALES</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td class="c">' + r.no + '</td><td>' + e(r.client) + '</td><td class="num">' + rp0(r.omzet) + '</td></tr>'; }).join('') + '</tbody></table>';
    };
    var metricHtml = function (s) {
      var m = [['TOTAL PENCAPAIAN REVENUE', F.n(s.omzet)], ['REVENUE TARGET', F.n(s.target)], ['PERSONAL REVENUE ACHIEVEMENT (PRA)', F.pct(s.pra, 0)], ['PERSONAL INCENTIVES RATE (PIR)', F.rate(s.pir)],
        ['GROUP ACHIEVEMENT FACTOR (GAF)', F.pct(s.gaf, 0)], ['WEIGHTED INCENTIVES RATE', F.rate(s.rate)], ['PERSONAL INCENTIVES', F.n(s.terbentuk, 2)]];
      return '<table class="dt" style="margin-top:2pt">' + m.map(function (x) { return '<tr class="m"><td>' + x[0] + '</td><td class="num" style="width:30%">' + x[1] + '</td></tr>'; }).join('') + '</table>';
    };
    var ci = 0;
    var nextCol = function () { ci++; if (ci > 1) { mkPage(); ci = 0; } };
    var tbl = function (s, cont) {
      var div = document.createElement('div'); div.style.marginBottom = '4mm';
      div.innerHTML = '<div class="blk-name">' + e(String(s.nama).toUpperCase()) + (cont ? ' (lanjutan)' : '') + '</div><table class="dt"><thead><tr><th style="width:22px">NO</th><th>REKANAN</th><th style="width:30%">SALES</th></tr></thead><tbody></tbody></table>';
      cols[ci].appendChild(div);
      return div;
    };
    staff.forEach(function (s) {
      var rows = s.rekanan.length ? s.rekanan : [{ client: '(tidak ada omzet)', omzet: 0 }];
      var div = tbl(s, false);
      if (overflow(body)) { cols[ci].removeChild(div); nextCol(); div = tbl(s, false); }
      rows.forEach(function (r, i) {
        var tb = div.querySelector('tbody');
        tb.insertAdjacentHTML('beforeend', '<tr><td class="c">' + (s.rekanan.length ? i + 1 : '') + '</td><td>' + e(r.client) + '</td><td class="num">' + rp0(r.omzet) + '</td></tr>');
        if (overflow(body)) {
          var fresh = !/lanjutan/.test(div.querySelector('.blk-name').textContent);
          if (fresh && tb.children.length <= 3 && rows.length > tb.children.length) {
            // jangan tinggalkan judul + 1–2 baris di dasar kolom: pindahkan blok utuh
            var moved = Array.prototype.slice.call(tb.children);
            cols[ci].removeChild(div); nextCol(); div = tbl(s, false);
            moved.forEach(function (x) { div.querySelector('tbody').appendChild(x); });
          } else {
            var last = tb.lastElementChild; tb.removeChild(last);
            if (!tb.children.length) cols[ci].removeChild(div);
            nextCol(); div = tbl(s, true); div.querySelector('tbody').appendChild(last);
          }
        }
      });
      var m = document.createElement('div'); m.innerHTML = metricHtml(s);
      div.appendChild(m);
      if (overflow(body)) { div.removeChild(m); nextCol(); var d2 = tbl(s, true); d2.querySelector('table').remove(); d2.appendChild(m); }
    });
    var g = rep.group || {};
    var tail = document.createElement('div');
    tail.innerHTML = '<table class="dt group-box"><tr class="m"><td>TOTAL GROUP ACHIEVEMENT</td><td class="num">' + F.n(g.omzet) + '</td></tr><tr class="m"><td>TOTAL GROUP TARGET</td><td class="num">' + F.n(g.target) + '</td></tr><tr class="m"><td>GROUP REVENUE ACHIEVEMENT (GRA)</td><td class="num">' + F.pct(g.gra, 0) + '</td></tr><tr class="m"><td>GROUP ACHIEVEMENT FACTOR (GAF)</td><td class="num">' + F.pct(g.gaf, 0) + '</td></tr></table>' +
      '<table class="dt ins-list"><tr><th colspan="2" style="text-align:left">INSENTIF TERBENTUK ' + e(String(rep.bulanSales).toUpperCase()) + ' (rate × omzet)</th></tr>' +
      staff.map(function (s) { return '<tr><td>' + e(String(s.nama).toUpperCase()) + '</td><td class="num" style="width:35%">' + F.n(s.terbentuk, 2) + '</td></tr>'; }).join('') +
      '<tr class="gt"><td>TOTAL</td><td class="num">' + F.n(rep.totalTerbentuk, 2) + '</td></tr></table>' +
      '<div style="font-size:7.4pt;color:#4b5563;margin-top:2mm">Insentif yang dicairkan dihitung dari pembayaran klien — lihat Rincian Pencairan.</div>' + sigsHtml(rep, 5);
    body.appendChild(tail);
    if (overflow(body)) { body.removeChild(tail); body = newPage(false, head, out); body.appendChild(tail); }
    out.slice(start).forEach(function (p) { p.insertAdjacentHTML('beforeend', footHtml(rep)); });
  }

  /** Dokumen 2: Rincian insentif per staf (landscape) */
  function docRI(rep, st, out) {
    var docNo = (rep.docNo || S.boot.settings.doc_no).ri;
    var head = headHtml(rep, 'PERHITUNGAN INSENTIF SALES STAFF', docNo, '<div>Sales : ' + e(st.nama) + (st.status === 'RESIGN' ? ' (resign)' : '') + '</div>');
    var thead = '<thead><tr><th style="width:24px">NO</th><th>NAMA PENGIRIM / NO. INVOICE</th><th style="width:52px">PERIODE</th><th>SALDO AWAL A/R</th><th>REALISASI SALES ' + e(String(rep.bulanSales).toUpperCase()) + '</th><th>REALISASI A/R</th><th>SALDO AKHIR A/R</th><th>DPI</th><th style="width:58px">INSENTIF (%)</th><th>INSENTIF (Rp)</th><th style="width:16%">CATATAN</th></tr></thead>';
    var rows = [];
    st.clients.forEach(function (c, ci) {
      rows.push({ k: 'cl', h: '<tr class="cl"><td class="c">' + (ci + 1) + '</td><td colspan="10">' + e(c.client) + '</td></tr>' });
      c.lines.forEach(function (l) {
        rows.push({ k: 'ln', h: '<tr' + (l.jenis === 'ADJ' ? ' class="adj"' : '') + '><td></td><td style="padding-left:10pt">' + e(l.invoice_no) + '</td><td class="c">' + F.blnShort(l.periode) + '</td><td class="num">' + rp0(l.saldo_awal) + '</td><td class="num">' + rp0(l.sales) + '</td><td class="num">' + rp0(l.bayar) + '</td><td class="num">' + (Math.abs(l.saldo_akhir) > 0.5 ? F.n(l.saldo_akhir) : '') + '</td><td class="num">' + rp0(l.bayar) + '</td><td class="num">' + (l.jenis === 'ADJ' ? '' : rateTxt(l.rate)) + '</td><td class="num">' + rp2(l.insentif) + '</td><td>' + e(l.catatan || '') + '</td></tr>' });
      });
      if (c.lines.length > 1) rows.push({ k: 'st', h: '<tr class="st"><td></td><td colspan="2" style="text-align:right">Subtotal</td><td class="num">' + rp0(c.total.saldo_awal) + '</td><td class="num">' + rp0(c.total.sales) + '</td><td class="num">' + rp0(c.total.bayar) + '</td><td class="num">' + rp0(c.total.saldo_akhir) + '</td><td class="num">' + rp0(c.total.bayar) + '</td><td></td><td class="num">' + rp2(c.total.insentif) + '</td><td></td></tr>' });
    });
    var T = st.total;
    rows.push({ k: 'gt', h: '<tr class="gt"><td></td><td colspan="2">TOTAL</td><td class="num">' + F.n(T.saldo_awal) + '</td><td class="num">' + F.n(T.sales) + '</td><td class="num">' + F.n(T.bayar) + '</td><td class="num">' + F.n(T.saldo_akhir) + '</td><td class="num">' + F.n(T.bayar) + '</td><td></td><td class="num">' + F.n(T.insentif, 2) + '</td><td></td></tr>' });
    var start = out.length;
    var body = newPage(true, head, out);
    var mk = function () { var t = document.createElement('table'); t.className = 'dt'; t.innerHTML = thead + '<tbody></tbody>'; body.appendChild(t); return t.tBodies[0]; };
    var tb = mk();
    rows.forEach(function (r) {
      tb.insertAdjacentHTML('beforeend', r.h);
      if (overflow(body)) {
        var last = tb.lastElementChild; tb.removeChild(last);
        var carry = [];
        if (tb.lastElementChild && tb.lastElementChild.classList.contains('cl')) { carry.push(tb.lastElementChild); tb.removeChild(tb.lastElementChild); }
        body = newPage(true, head, out); tb = mk();
        carry.forEach(function (c) { tb.appendChild(c); });
        tb.appendChild(last);
      }
    });
    var sf = (rep.staff || []).filter(function (x) { return x.kode === st.kode; })[0];
    if (sf) {
      var an = document.createElement('div'); an.innerHTML = analisisHtml(rep, sf);
      body.appendChild(an);
      if (overflow(body)) { body.removeChild(an); body = newPage(true, head, out); body.appendChild(an); }
    }
    var sig = document.createElement('div'); sig.innerHTML = sigsHtml(rep, 5);
    body.appendChild(sig);
    if (overflow(body)) { body.removeChild(sig); body = newPage(true, head, out); body.appendChild(sig); }
    out.slice(start).forEach(function (p) { p.insertAdjacentHTML('beforeend', footHtml(rep)); });
  }

  /** Dokumen 4: Analisis perbandingan omzet semua staf (PDF, landscape) */
  function docAnalisis(rep, out) {
    var docNo = (rep.docNo || S.boot.settings.doc_no).ri;
    var namaLalu = namaBulanLalu(rep.periode);
    var staff = rep.staff.filter(function (s) { return s.status === 'AKTIF'; });
    var sumNow = 0, sumLalu = 0;
    staff.forEach(function (s) { sumNow += s.omzet || 0; sumLalu += s.omzet_lalu || 0; });
    var pctTxt = function (x) { return x === null ? '-' : F.n(x * 100, 2) + '%'; };
    var rowsH = staff.map(function (s, i) {
      var now = s.omzet || 0, lalu = s.omzet_lalu || 0;
      var naik = lalu ? (now - lalu) / lalu : null;
      var calls = s.call_target ? s.calls + ' / ' + s.call_target + ' (' + F.n(s.calls / s.call_target * 100, 0) + '%)' : String(s.calls || 0);
      return '<tr><td class="c">' + (i + 1) + '</td><td>' + e(s.nama) + '</td><td class="num">' + F.n(now) + '</td><td class="num">' + (lalu ? F.n(lalu) : '-') + '</td><td class="num">' + (lalu ? F.n(now - lalu) : '-') + '</td><td class="num">' + pctTxt(naik) + '</td><td class="num">' + (s.target ? F.n(now / s.target * 100, 0) + '%' : '-') + '</td><td class="num">' + calls + '</td></tr>';
    }).join('');
    var tn = sumLalu ? (sumNow - sumLalu) / sumLalu : null;
    var g = rep.group || {};
    var totalH = '<tr class="gt"><td></td><td>TOTAL SALES STAFF</td><td class="num">' + F.n(sumNow) + '</td><td class="num">' + F.n(sumLalu) + '</td><td class="num">' + F.n(sumNow - sumLalu) + '</td><td class="num">' + pctTxt(tn) + '</td><td class="num">' + (g.target ? F.n(sumNow / g.target * 100, 0) + '%' : '-') + '</td><td></td></tr>';
    var thead = '<thead><tr><th style="width:24px">NO</th><th>NAMA SALES</th><th>OMZET ' + e(String(rep.bulanSales).toUpperCase()) + ' (Rp)</th><th>OMZET ' + e(String(namaLalu).toUpperCase()) + ' (Rp)</th><th>SELISIH (Rp)</th><th style="width:12%">KENAIKAN (%)</th><th style="width:12%">PENCAPAIAN TARGET</th><th style="width:14%">KUNJUNGAN (CALL REPORT)</th></tr></thead>';
    var ket = staff.map(function (s) { return '<li><b>' + e(s.nama) + '</b>: ' + e(kalimatAnalisis(rep, s)) + '</li>'; }).join('');
    var body = newPage(true, headHtml(rep, 'ANALISIS PERBANDINGAN OMZET SALES STAFF', docNo), out);
    body.innerHTML = '<table class="dt">' + thead + '<tbody>' + rowsH + totalH + '</tbody></table>' +
      '<div style="font-weight:700;margin:5mm 0 2mm">CATATAN ANALISIS</div><ul style="margin:0;padding-left:16px;font-size:8.6pt;line-height:1.5">' + ket + '</ul>' + sigsHtml(rep, 5);
    out[out.length - 1].insertAdjacentHTML('beforeend', footHtml(rep));
  }

  /** Dokumen 3: Rincian pencairan */
  function docRiborar(rep, out) {
    var docNo = (rep.docNo || S.boot.settings.doc_no).riborar;
    var body = newPage(false, headHtml(rep, 'RINCIAN PENCAIRAN INSENTIF SALES STAFF', docNo), out);
    body.innerHTML = '<div class="riborar-list">' + rep.riborar.map(function (r) {
      return '<div class="who">' + e(String(r.nama).toUpperCase()) + (r.status === 'RESIGN' ? ' (resign)' : '') + '</div><div class="ln"><span>Insentif Periode ' + e(rep.bulanSales) + '</span><span>:</span><span class="v">Rp ' + F.n(r.cair, 2) + '</span></div>';
    }).join('') + '<div class="ln gt"><span>Grand total insentif ' + e(rep.bulanSales) + '</span><span>:</span><span class="v">Rp ' + F.n(rep.totalCair, 2) + '</span></div><div style="margin-top:1mm">(Berdasarkan pembayaran klien)</div></div>' + sigsHtml(rep, 5);
    out[out.length - 1].insertAdjacentHTML('beforeend', footHtml(rep));
  }
  async function docResume(rep, out) {
    var txt = await API.call('resume', { periode: rep.periode });
    var body = newPage(false, headHtml(rep, 'RESUME PERHITUNGAN INSENTIF', ''), out);
    body.innerHTML = '<div class="mail-doc">' + e(txt) + '</div>';
  }

  async function buildPages(rep, sel) {
    var st = getStage(); st.innerHTML = '';
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    var out = [];
    if (sel.persen) docPersen(rep, out);
    if (sel.analisis) docAnalisis(rep, out);
    if (sel.ri) rep.ri.forEach(function (r) { if (!sel.riStaff || sel.riStaff.indexOf(r.kode) >= 0) docRI(rep, r, out); });
    if (sel.riborar) docRiborar(rep, out);
    if (sel.resume && !rep.arsipExcel) await docResume(rep, out);
    out.forEach(function (p, i) { var pg = p.querySelector('[data-pg]'); if (pg) pg.textContent = 'Hal. ' + (i + 1) + ' / ' + out.length; });
    return out;
  }

  /* ------------------------------ pratinjau ------------------------------ */
  var PREVIEW_ONLY = function () {
    if (!(window.APP_CONFIG || {}).ARTIFACT_PREVIEW) return false;
    App.toast('Halaman demo ini tidak bisa mencetak atau mengunduh file. Di aplikasi yang terpasang (GitHub Pages) tombol ini berfungsi.', true);
    return true;
  };
  App.printPreview = function (rep) {
    var sel = { persen: true, analisis: true, ri: true, riborar: true, resume: false, riStaff: null };
    var back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal wide" style="height:calc(100vh - 32px)" role="dialog" aria-modal="true" aria-label="Pratinjau cetak"><div class="modal-h"><h2>Pratinjau: ' + e(rep.label) + '</h2><div class="row"><span class="small faint" id="pcount"></span><button class="btn" data-pdf>' + I.download + 'Unduh PDF</button><button class="btn primary" data-print>' + I.printer + 'Cetak</button><button class="btn ghost sm" data-close aria-label="Tutup">' + I.x + '</button></div></div>' +
      '<div class="panel-b row" style="border-bottom:1px solid var(--line)">' +
      '<label class="check"><input type="checkbox" data-s="persen" checked> Persentase insentif</label><label class="check"><input type="checkbox" data-s="analisis" checked> Analisis omzet</label><label class="check"><input type="checkbox" data-s="ri" checked> Rincian per staf</label><label class="check"><input type="checkbox" data-s="riborar" checked> Rincian pencairan</label>' + (rep.arsipExcel ? '' : '<label class="check"><input type="checkbox" data-s="resume"> Resume email</label>') +
      '<select class="in inline" id="pst" aria-label="Rincian staf"><option value="">Rincian: semua staf</option>' + rep.ri.map(function (r) { return '<option value="' + r.kode + '">Rincian: ' + e(r.nama) + '</option>'; }).join('') + '</select>' +
      '</div>' +
      '<div class="preview-area" id="parea"><div class="empty" style="color:#fff">Menyusun halaman…</div></div></div>';
    document.body.appendChild(back);
    var area = back.querySelector('#parea');
    var pages = [];
    var close = function () { back.remove(); document.removeEventListener('keydown', esc); if (stage) stage.innerHTML = ''; };
    var esc = function (ev) { if (ev.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    back.addEventListener('click', function (ev) { if (ev.target === back || ev.target.closest('[data-close]')) close(); });
    var redraw = async function () {
      try {
        pages = await buildPages(rep, sel);
        area.innerHTML = '';
        pages.forEach(function (p) { area.appendChild(p); });
        back.querySelector('#pcount').textContent = pages.length + ' halaman A4';
        // perkecil agar muat di layar
        var w = area.clientWidth - 36, scale = Math.min(1, w / 1123);
        area.querySelectorAll('.page').forEach(function (p) { p.style.zoom = p.classList.contains('land') ? Math.min(1, w / 1123) : Math.min(1, w / 794); });
        void scale;
      } catch (er) { App.err(er); }
    };
    back.querySelectorAll('[data-s]').forEach(function (c) { c.onchange = function () { sel[c.getAttribute('data-s')] = c.checked; redraw(); }; });
    back.querySelector('#pst').onchange = function (ev) { sel.riStaff = ev.target.value ? [ev.target.value] : null; redraw(); };
    back.querySelector('[data-print]').onclick = function () {
      if (PREVIEW_ONLY()) return;
      var root = document.getElementById('print-root');
      root.innerHTML = '';
      pages.forEach(function (p) { var c = p.cloneNode(true); c.style.zoom = ''; root.appendChild(c); });
      window.print();
      setTimeout(function () { root.innerHTML = ''; }, 1000);
    };
    back.querySelector('[data-pdf]').onclick = function () {
      if (PREVIEW_ONLY()) return; App.downloadPdf(pages, namaFile(rep, 'pdf')); };
    redraw();
  };

  /** Susun objek PDF dari halaman A4 (dipakai untuk unduh dan untuk kirim ke staf) */
  App.makePdf = async function (pages) {
    if (!window.jspdf || !window.html2canvas) { App.toast('Library PDF belum termuat. Gunakan tombol Cetak lalu pilih "Simpan sebagai PDF".', true); return null; }
    App.toast('Menyusun PDF ' + pages.length + ' halaman…');
    var holder = document.createElement('div'); holder.style.cssText = 'position:absolute;left:-12000px;top:0'; document.body.appendChild(holder);
    try {
      var jsPDF = window.jspdf.jsPDF, pdf = null;
      for (var i = 0; i < pages.length; i++) {
        var p = pages[i].cloneNode(true); p.style.zoom = ''; holder.innerHTML = ''; holder.appendChild(p);
        var land = p.classList.contains('land');
        var canvas = await html2canvas(p, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
        var img = canvas.toDataURL('image/jpeg', 0.92);
        var w = land ? 297 : 210, h = land ? 210 : 297;
        if (!pdf) pdf = new jsPDF({ orientation: land ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
        else pdf.addPage('a4', land ? 'landscape' : 'portrait');
        pdf.addImage(img, 'JPEG', 0, 0, w, h);
      }
      return pdf;
    } finally { holder.remove(); }
  };

  App.downloadPdf = async function (pages, name) {
    try { var pdf = await App.makePdf(pages); if (pdf) pdf.save(name); } catch (er) { App.err(er); }
  };

  /* ------------------------------ kirim email ------------------------------ */
  /** PDF (base64) dari dokumen terpilih, siap dilampirkan ke email */
  async function pdfB64(rep, sel) {
    var pgs = await buildPages(rep, sel);
    var pdf = await App.makePdf(pgs);
    getStage().innerHTML = '';
    if (!pdf) throw new Error('Library PDF belum termuat. Muat ulang halaman lalu coba lagi.');
    return pdf.output('datauristring').split(',')[1];
  }
  var SEL_GLOBAL = { persen: true, analisis: true, ri: true, riborar: true, resume: false, riStaff: null };
  function mailList(s) { return String(s || '').split(/[,;\n\r]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function chips(s) {
    var L = mailList(s);
    return L.length ? L.map(function (x) { return '<span class="chip">' + e(x) + '</span>'; }).join(' ') : '<span class="muted">belum diisi</span>';
  }
  function lastLog(info, jenis, kode) { return info.log.filter(function (l) { return l.jenis === jenis && (!kode || l.kode === kode); })[0]; }
  function logChip(l) {
    return l ? '<span class="chip cash">' + (l.status === 'SIMULASI' ? 'Simulasi ' : 'Terkirim ') + e(F.waktu(l.pada)) + '</span>' : '<span class="chip">Belum dikirim</span>';
  }

  /** Dialog kirim email. Urutan: (1) rekap global ke direksi → direksi menyetujui → (2) hasil per staf Sales.
   *  Setiap pengiriman dikonfirmasi dulu; penerima diisi di Pengaturan (global) dan Staf & target (per staf). */
  App.emailDialog = async function (rep) {
    var info;
    try { info = await API.call('mailInfo', { periode: rep.periode }); } catch (er) { return App.err(er); }
    var disetujui = info.status === 'DISETUJUI', diajukan = info.status === 'PROSES' || disetujui;
    var g = info.global, lg = lastLog(info, 'GLOBAL');
    var globalSiap = diajukan && mailList(g.to).length;
    var rows = info.staff.map(function (s) {
      var sent = lastLog(info, 'STAF', s.kode), bisa = disetujui && mailList(s.email).length;
      return '<tr><td><input type="checkbox" class="mc" data-k="' + e(s.kode) + '"' + (bisa && !sent ? ' checked' : '') + (bisa ? '' : ' disabled') + ' aria-label="Pilih ' + e(s.nama) + '"></td>' +
        '<td><b>' + e(s.nama) + '</b>' + (s.status === 'RESIGN' ? ' <span class="small faint">(resign)</span>' : '') + '</td><td>' + chips(s.email) + '</td><td>' + chips(s.cc) + '</td><td>' + logChip(sent) + '</td></tr>';
    }).join('');
    var punyaStaf = info.staff.some(function (s) { return mailList(s.email).length; });
    var m = App.modal({
      title: 'Kirim email — ' + rep.label, wide: true,
      body: '<div class="note">Urutan: <b>1)</b> rekap global ke direksi → direksi menyetujui → <b>2)</b> hasil perhitungan per staf Sales. Setiap pengiriman dikonfirmasi dulu.</div>' +
        '<h3 style="margin:16px 0 8px">1. Rekap global ke direksi</h3>' +
        '<table class="t dense"><tbody><tr><td style="width:90px">Kepada</td><td>' + chips(g.to) + '</td></tr><tr><td>Cc</td><td>' + chips(g.cc) + '</td></tr><tr><td>Status</td><td>' + logChip(lg) + '</td></tr></tbody></table>' +
        '<div class="row" style="margin-top:8px"><button class="btn primary" id="mg"' + (globalSiap ? '' : ' disabled') + '>' + I.mail + 'Kirim rekap ke direksi…</button>' +
        '<span class="small muted">' + (!diajukan ? 'Tersedia setelah periode diajukan persetujuan.' : (!mailList(g.to).length ? 'Isi penerima di Pengaturan → Penerima email rekap global.' : 'Lampiran: PDF lengkap (persentase, analisis, rincian per staf, pencairan).')) + '</span></div>' +
        '<h3 style="margin:20px 0 8px">2. Hasil per staf Sales</h3>' +
        (disetujui ? '' : '<div class="small muted" style="margin-bottom:8px">Dibuka setelah direksi menyetujui periode ini.</div>') +
        '<div class="tbl-wrap"><table class="t dense"><thead><tr><th style="width:28px"></th><th>Staf</th><th>Kepada</th><th>Cc</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        (disetujui && !punyaStaf ? '<div class="small muted" style="margin-top:8px">Email staf belum diisi. Isi di menu Staf &amp; target (Email dan Cc).</div>' : '') +
        '<div class="row" style="margin-top:8px"><button class="btn primary" id="ms"' + (disetujui && punyaStaf ? '' : ' disabled') + '>' + I.mail + 'Kirim ke staf terpilih…</button><span class="small muted">Setiap staf dikonfirmasi satu per satu.</span></div>'
    });

    m.querySelector('#mg').onclick = async function () {
      if (PREVIEW_ONLY()) return;
      var ulang = lg ? '<br><br><b>Perhatian:</b> rekap ini sudah pernah dikirim (' + e(F.waktu(lg.pada)) + '). Kirim ulang?' : '';
      var ya = await App.confirm('Kirim rekap global ke direksi?',
        'Kepada: <b>' + e(mailList(g.to).join(', ')) + '</b><br>Cc: <b>' + e(mailList(g.cc).join(', ') || '-') + '</b><br>Lampiran: PDF perhitungan insentif ' + e(rep.label) + '.<br><br>Benar penerimanya?' + ulang, 'Ya, kirim', false);
      if (!ya) return;
      try {
        App.toast('Menyiapkan PDF…');
        var b64 = await pdfB64(rep, SEL_GLOBAL);
        var r = await API.call('kirimGlobal', { periode: rep.periode, pdf: b64, file: namaFile(rep, 'pdf') });
        m.close();
        App.toast(r.simulasi ? 'Mode demo: email tidak dikirim, hanya dicatat.' : 'Rekap global terkirim ke ' + r.to.join(', ') + '.');
        App.emailDialog(rep);
      } catch (er) { App.err(er); }
    };

    m.querySelector('#ms').onclick = async function () {
      if (PREVIEW_ONLY()) return;
      var ks = Array.prototype.map.call(m.querySelectorAll('.mc:checked'), function (c) { return c.getAttribute('data-k'); });
      if (!ks.length) return App.toast('Centang minimal satu staf.', true);
      var kirim = 0, lewat = 0, gagal = 0, simulasi = false;
      for (var i = 0; i < ks.length; i++) {
        var s = info.staff.filter(function (x) { return x.kode === ks[i]; })[0];
        var ya = await App.confirm('Kirim hasil ' + s.nama + '? (' + (i + 1) + ' dari ' + ks.length + ')',
          'Hasil perhitungan <b>' + e(s.nama) + '</b> akan dikirim kepada <b>' + e(mailList(s.email).join(', ')) + '</b><br>Cc: <b>' + e(mailList(s.cc).join(', ') || '-') + '</b><br><br>Benar penerimanya? Pilih <b>Batal</b> untuk melewati staf ini.', 'Ya, kirim', false);
        if (!ya) { lewat++; continue; }
        try {
          App.toast('Menyiapkan PDF ' + s.nama + '…');
          var b64 = await pdfB64(rep, { persen: false, analisis: false, ri: true, riborar: false, resume: false, riStaff: [s.kode] });
          var r = await API.call('kirimStaf', { periode: rep.periode, kode: s.kode, pdf: b64, file: namaFile(rep, 'pdf', s.nama) });
          kirim++; if (r.simulasi) simulasi = true;
        } catch (er) { gagal++; App.err(er); }
      }
      m.close();
      App.toast(kirim + ' terkirim' + (simulasi ? ' (mode demo: hanya dicatat)' : '') + (lewat ? ', ' + lewat + ' dilewati' : '') + (gagal ? ', ' + gagal + ' gagal' : '') + '.', gagal > 0);
      App.emailDialog(rep);
    };
  };

  /* ------------------------------ Excel ------------------------------ */
  App.exportExcel = function (rep) {
    if (PREVIEW_ONLY()) return;
    if (!window.XLSX) return App.toast('Library Excel belum termuat.', true);
    var wb = XLSX.utils.book_new();
    var money = '#,##0', money2 = '#,##0.00', pct = '0.00%', rate = '0.0000%';
    function sheet(aoa, fmts, widths) {
      var ws = XLSX.utils.aoa_to_sheet(aoa);
      Object.keys(ws).forEach(function (k) {
        if (k[0] === '!') return;
        var c = XLSX.utils.decode_cell(k), f = fmts[c.c];
        if (f && typeof ws[k].v === 'number') ws[k].z = f;
      });
      ws['!cols'] = widths.map(function (w) { return { wch: w }; });
      return ws;
    }
    var org = (rep.org || S.boot.settings.org).nama;
    // ringkasan
    var A = [[org], ['RINGKASAN INSENTIF — PERIODE ' + rep.label], [], ['Kode', 'Staf', 'Status', 'Target', 'Omzet', 'PRA', 'PIR', 'GAF', 'Rate', 'Insentif terbentuk', 'Insentif cair', 'Piutang']];
    rep.staff.forEach(function (s) { A.push([s.kode, s.nama, s.status, s.target, s.omzet, s.pra, s.pir, s.gaf, s.rate, s.terbentuk, s.cair, s.piutang]); });
    A.push(['', 'TIM', '', rep.group.target, rep.group.omzet, rep.group.gra, '', rep.group.gaf, '', rep.totalTerbentuk, rep.totalCair, '']);
    XLSX.utils.book_append_sheet(wb, sheet(A, { 3: money, 4: money, 5: pct, 6: rate, 7: '0.00', 8: rate, 9: money2, 10: money2, 11: money }, [7, 28, 9, 14, 16, 9, 9, 7, 10, 16, 16, 16]), 'Ringkasan');
    // persentase
    var B = [[org], ['PERHITUNGAN PERSENTASE INSENTIF'], ['PERIODE : ' + rep.label], []];
    rep.staff.filter(function (s) { return s.status === 'AKTIF'; }).forEach(function (s) {
      B.push([String(s.nama).toUpperCase()]); B.push(['NO', 'REKANAN', 'SEGMEN', 'SALES']);
      s.rekanan.forEach(function (r, i) { B.push([i + 1, r.client, r.segmen || '', r.omzet]); });
      B.push(['', 'TOTAL PENCAPAIAN REVENUE', '', s.omzet], ['', 'REVENUE TARGET', '', s.target], ['', 'PERSONAL REVENUE ACHIEVEMENT (PRA)', '', s.pra], ['', 'PERSONAL INCENTIVES RATE (PIR)', '', s.pir], ['', 'GROUP ACHIEVEMENT FACTOR (GAF)', '', s.gaf], ['', 'WEIGHTED INCENTIVES RATE', '', s.rate], ['', 'PERSONAL INCENTIVES', '', s.terbentuk], []);
    });
    XLSX.utils.book_append_sheet(wb, sheet(B, { 3: '#,##0.######' }, [6, 48, 9, 18]), '% Insentif');
    // RI
    rep.ri.forEach(function (st) {
      var R = [[org], ['PERHITUNGAN INSENTIF SALES STAFF'], ['PERIODE : ' + rep.label], ['Sales : ' + st.nama], [], ['NO', 'NAMA PENGIRIM / NO. INVOICE', 'PERIODE', 'SALDO AWAL A/R', 'REALISASI SALES', 'REALISASI A/R', 'SALDO AKHIR A/R', 'DPI', 'INSENTIF (%)', 'INSENTIF (Rp)', 'CATATAN']];
      st.clients.forEach(function (c, ci) {
        R.push([ci + 1, c.client]);
        c.lines.forEach(function (l) { R.push(['', l.invoice_no, l.periode, l.saldo_awal || '', l.sales || '', l.bayar || '', l.saldo_akhir || '', l.bayar || '', l.jenis === 'ADJ' ? '' : l.rate, l.insentif || '', l.catatan || '']); });
        R.push(['', 'Subtotal', '', c.total.saldo_awal, c.total.sales, c.total.bayar, c.total.saldo_akhir, c.total.bayar, '', c.total.insentif, '']);
      });
      R.push([], ['', 'TOTAL', '', st.total.saldo_awal, st.total.sales, st.total.bayar, st.total.saldo_akhir, st.total.bayar, '', st.total.insentif, '']);
      XLSX.utils.book_append_sheet(wb, sheet(R, { 3: money, 4: money, 5: money, 6: money, 7: money, 8: rate, 9: money2 }, [5, 44, 9, 15, 15, 15, 15, 15, 11, 14, 30]), ('RI ' + st.kode).slice(0, 31));
    });
    // pencairan
    var C = [[org], ['RINCIAN PENCAIRAN INSENTIF SALES STAFF'], ['PERIODE : ' + rep.label], [], ['Staf', 'Status', 'Insentif periode ' + rep.bulanSales]];
    rep.riborar.forEach(function (r) { C.push([r.nama, r.status, r.cair]); });
    C.push([], ['Grand total (berdasarkan pembayaran klien)', '', rep.totalCair]);
    XLSX.utils.book_append_sheet(wb, sheet(C, { 2: money2 }, [40, 10, 20]), 'Pencairan');
    var out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    App.download(namaFile(rep, 'xlsx'), new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  };
})();
