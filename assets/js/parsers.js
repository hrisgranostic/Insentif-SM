/* =====================================================================
 * Parsers — membaca file Excel Finance / Marketing / Insentif lama
 * Jalan di browser (window.Parsers) dan di Node (module.exports).
 * Input: workbook SheetJS (XLSX.read). Output: JSON bersih.
 * ===================================================================== */
(function (root) {
  'use strict';

  var BULAN = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI',
    'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

  function rows(XLSX, ws) {
    if (!ws) return [];
    return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true });
  }
  function str(v) { return v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim(); }
  function up(v) { return str(v).toUpperCase(); }
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return isFinite(v) ? v : null;
    var s = String(v).replace(/[^0-9,.\-]/g, '');
    if (!s) return null;
    // format Indonesia 1.234.567,89
    if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
    var n = parseFloat(s);
    return isFinite(n) ? n : null;
  }
  function isDate(v) { return v instanceof Date && !isNaN(v); }
  // SheetJS kadang memberi 2026-06-30T16:59:48Z untuk 1 Juli (efek zona waktu) → bulatkan ke hari terdekat (UTC)
  function dayUTC(d) { return new Date(Math.round(d.getTime() / 864e5) * 864e5); }
  function ym(d) {
    var x = dayUTC(d);
    return x.getUTCFullYear() + '-' + ('0' + (x.getUTCMonth() + 1)).slice(-2);
  }
  function ymd(d) {
    return ym(d) + '-' + ('0' + dayUTC(d).getUTCDate()).slice(-2);
  }
  /** Cari "AGUSTUS 2026" di teks → "2026-08" */
  function periodeFromText(t) {
    var s = up(t);
    for (var i = 0; i < BULAN.length; i++) {
      var m = s.match(new RegExp(BULAN[i] + '\\s+(\\d{4})'));
      if (m) return m[1] + '-' + ('0' + (i + 1)).slice(-2);
    }
    return null;
  }
  function periodeFromFilename(name) {
    var p = periodeFromText(String(name || '').replace(/[_\-.]+/g, ' '));
    if (p) return p;
    var m = String(name || '').match(/(20\d\d)[_\- ]?(0[1-9]|1[0-2])/);
    if (m) return m[1] + '-' + m[2];
    m = String(name || '').match(/^(\d\d)(0[1-9]|1[0-2])\b/); // "2608 - CALL REPORT"
    if (m) return '20' + m[1] + '-' + m[2];
    return null;
  }

  /* ---------------------------------------------------------------
   * 1. REALISASI SALES (Finance) — sheet APL / APP / APD
   * --------------------------------------------------------------- */
  function parseSales(XLSX, wb) {
    var out = { jenis: 'SALES', periode: null, lines: [], segmen: {}, warnings: [] };
    wb.SheetNames.forEach(function (name) {
      var seg = up(name).slice(0, 3);
      if (['APL', 'APP', 'APD'].indexOf(seg) < 0) return;
      var R = rows(XLSX, wb.Sheets[name]);
      var title = str((R[0] || [])[0]);
      var pTitle = periodeFromText(title);
      if (pTitle && !out.periode) out.periode = pTitle;
      if (pTitle && out.periode && pTitle !== out.periode)
        out.warnings.push('Judul sheet "' + name + '" menyebut periode ' + pTitle + ', beda dengan sheet lain (' + out.periode + ').');
      var segInfo = { sheet: name, total: 0, grandTotal: null, klien: 0 };
      out.segmen[seg] = segInfo;
      // cari baris header
      var h = -1;
      for (var i = 0; i < Math.min(R.length, 15); i++) {
        var r = R[i] || [];
        if (r.some(function (c) { return /NAMA (PERUSAHAAN|DOKTER)/.test(up(c)); })) { h = i; break; }
      }
      if (h < 0) { out.warnings.push('Header tidak ditemukan di sheet ' + name); return; }
      if (seg === 'APD') {
        for (var j = h + 1; j < R.length; j++) {
          var a = R[j] || [];
          var nm = str(a[1]);
          if (!nm) continue;
          if (/^GRAND TOTAL/.test(up(nm))) { segInfo.grandTotal = num(a[2]); continue; }
          var v = num(a[2]);
          if (!v) continue;
          var marker = up(a[4]) || up(a[5]) || '';
          out.lines.push({ segmen: 'APD', client: nm, label: 'CASH', nilai: v, cek: up(a[3]) === 'V', marker: marker, row: j + 1 });
          segInfo.total += v; segInfo.klien++;
        }
      } else {
        var cur = null, curTotal = 0, curSum = 0, curChildren = 0, curRow = 0;
        var flush = function () {
          if (cur === null) return;
          if (curChildren === 0 && curTotal) {
            out.lines.push({ segmen: seg, client: cur, label: '(TANPA NO)', nilai: curTotal, cek: false, marker: '', row: curRow });
            segInfo.total += curTotal;
            out.warnings.push(seg + ' · ' + cur + ': tidak ada rincian invoice, dicatat sebagai tagihan tanpa nomor.');
          } else if (Math.abs(curSum - curTotal) > 1) {
            out.warnings.push(seg + ' · ' + cur + ': jumlah rincian (' + curSum + ') beda dengan total klien (' + curTotal + ').');
          }
        };
        for (var k = h + 1; k < R.length; k++) {
          var b = R[k] || [];
          var cName = str(b[1]), lab = str(b[2]), val = num(b[3]);
          if (cName) {
            if (/^GRAND TOTAL/.test(up(cName))) { flush(); cur = null; segInfo.grandTotal = val; continue; }
            flush();
            cur = cName; curTotal = val || 0; curSum = 0; curChildren = 0; curRow = k + 1; segInfo.klien++;
            if (!lab) continue;
          }
          if (lab && cur !== null) {
            curChildren++;
            curSum += val || 0;
            if (!val) continue; // FREE / 0
            out.lines.push({ segmen: seg, client: cur, label: lab, nilai: val, cek: up(b[4]) === 'V', marker: '', row: k + 1 });
            segInfo.total += val;
          }
        }
        flush();
      }
      if (segInfo.grandTotal !== null && Math.abs(segInfo.grandTotal - segInfo.total) > 1)
        out.warnings.push('Sheet ' + name + ': jumlah baris terbaca ' + segInfo.total + ' ≠ Grand Total ' + segInfo.grandTotal + '.');
    });
    if (!out.lines.length) out.warnings.push('Tidak ada sheet APL/APP/APD yang terbaca. Pastikan ini file Realisasi Sales dari Finance.');
    out.total = out.lines.reduce(function (s, l) { return s + l.nilai; }, 0);
    return out;
  }

  /* ---------------------------------------------------------------
   * 2. REALISASI AR (Finance) — buku piutang
   * --------------------------------------------------------------- */
  function parseAR(XLSX, wb) {
    var out = { jenis: 'AR', periode: null, rows: [], warnings: [] };
    var ws = wb.Sheets[wb.SheetNames[0]];
    out.periode = periodeFromText(wb.SheetNames[0]);
    var R = rows(XLSX, ws);
    var h = -1, col = {};
    for (var i = 0; i < Math.min(R.length, 10); i++) {
      if ((R[i] || []).some(function (c) { return /ARINVOICENO/.test(up(c).replace(/\s/g, '')); })) { h = i; break; }
    }
    if (h < 0) { out.warnings.push('Header (ArInvoiceNo) tidak ditemukan. Pastikan ini file Realisasi AR.'); return out; }
    (R[h] || []).forEach(function (c, idx) {
      var k = up(c).replace(/[^A-Z]/g, '');
      if (k === 'TANGGAL') col.tgl = idx;
      else if (k === 'ARINVOICENO') col.inv = idx;
      else if (k === 'ARRECEIVINGNO') col.rcv = idx;
      else if (k === 'BUSINESSPARTNERCODE') col.code = idx;
      else if (k === 'BUSINESSPARTNERNAME') col.nama = idx;
      else if (k === 'CUSTOMERTYPE') col.tipe = idx;
      else if (k === 'SALDOAWAL') col.sa = idx;
      else if (k.indexOf('REALISASISALES') === 0) col.sales = idx;
      else if (k.indexOf('REALISASIAR') === 0) col.bayar = idx;
      else if (k === 'SALDOAKHIR') col.sak = idx;
    });
    ['inv', 'rcv', 'nama', 'bayar'].forEach(function (k) {
      if (col[k] === undefined) out.warnings.push('Kolom ' + k + ' tidak ditemukan di file AR.');
    });
    for (var j = h + 1; j < R.length; j++) {
      var r = R[j] || [];
      var nama = str(r[col.nama]);
      if (!nama) continue;
      var tgl = r[col.tgl];
      var inv = str(r[col.inv]), rcv = str(r[col.rcv]);
      var refs = [];
      var re = /\((AII\/[^)]+)\)/gi, m;
      while ((m = re.exec(rcv))) refs.push(m[1].trim().toUpperCase());
      var row = {
        row: j + 1,
        tanggal: isDate(tgl) ? ymd(tgl) : str(tgl),
        tipe: inv ? 'INV' : (rcv ? 'RCV' : 'OPEN'),
        invoice: inv.toUpperCase(),
        receipt: rcv ? rcv.split('(')[0].trim().toUpperCase() : '',
        ref: refs[0] || '',
        refs: refs,
        code: str(r[col.code]),
        client: nama,
        custType: str(r[col.tipe]),
        saldoAwal: num(r[col.sa]) || 0,
        sales: num(r[col.sales]) || 0,
        bayar: num(r[col.bayar]) || 0,
        saldoAkhir: num(r[col.sak]) || 0
      };
      if (!out.periode && isDate(tgl)) out.periode = ym(tgl);
      if (row.tipe === 'RCV' && !row.ref && row.bayar) out.warnings.push('Baris ' + row.row + ' (' + nama + '): pembayaran tanpa nomor invoice rujukan.');
      if (refs.length > 1) out.warnings.push('Baris ' + row.row + ': satu baris pembayaran merujuk ' + refs.length + ' invoice, dialokasikan ke invoice pertama yang masih ada sisa.');
      out.rows.push(row);
    }
    out.totalBayar = out.rows.reduce(function (s, r) { return s + r.bayar; }, 0);
    out.totalSales = out.rows.reduce(function (s, r) { return s + r.sales; }, 0);
    return out;
  }

  /* ---------------------------------------------------------------
   * 3. CALL REPORT & SALES REPORT (Marketing)
   *    Hanya membaca sheet rekap — sheet MASTER (data pasien) diabaikan.
   * --------------------------------------------------------------- */
  var CALL_SHEETS_SKIP = /^(MASTER|PVT|SHEET\d*)/i;
  function callReportSheetFilter(names) {
    return names.filter(function (n) { return !/^MASTER$/i.test(n.trim()); });
  }
  function parseCallReport(XLSX, wb) {
    var out = { jenis: 'CALL', periode: null, claims: [], staff: [], visits: {}, warnings: [] };
    var names = wb.SheetNames;
    // a. LIST REKAP OMSET → klaim omzet per staf per rekanan
    var listName = names.filter(function (n) { return /LIST\s*REKAP\s*OMSET/i.test(n); })[0];
    if (!listName) out.warnings.push('Sheet "LIST REKAP OMSET" tidak ditemukan.');
    else {
      var R = rows(XLSX, wb.Sheets[listName]);
      out.periode = periodeFromText(str((R[0] || [])[0]));
      var hr = -1;
      for (var i = 0; i < Math.min(R.length, 12); i++) {
        if ((R[i] || []).some(function (c) { return up(c) === 'PERUSAHAAN'; })) { hr = i; break; }
      }
      if (hr < 0) out.warnings.push('Header PERUSAHAAN tidak ditemukan di ' + listName);
      else {
        (R[hr] || []).forEach(function (c, ci) {
          if (up(c) !== 'PERUSAHAAN') return;
          var staf = '';
          for (var u = hr - 1; u >= 0 && !staf; u--) staf = str((R[u] || [])[ci]);
          var total = null, sum = 0;
          for (var k = hr + 1; k < R.length; k++) {
            var nm = str((R[k] || [])[ci]);
            var v = num((R[k] || [])[ci + 1]);
            if (!nm && v === null) continue;
            if (/^TOTAL OMSET/i.test(nm)) { total = v; break; }
            if (!nm) continue;
            out.claims.push({ staf: staf, client: nm, omzet: v || 0, row: k + 1 });
            sum += v || 0;
          }
          if (total !== null && Math.abs(total - sum) > 1) out.warnings.push('Total omzet ' + staf + ' (' + total + ') ≠ jumlah rincian (' + sum + ').');
        });
      }
    }
    // b. REKAP OMSET & CALL REPORT → jumlah kunjungan & omzet bulan lalu
    var rekName = names.filter(function (n) { return /REKAP\s*OMSET\s*&\s*CALL/i.test(n); })[0];
    if (rekName) {
      var Q = rows(XLSX, wb.Sheets[rekName]);
      if (!out.periode) out.periode = periodeFromText(str(((Q[1] || [])[1]) || ((Q[0] || [])[0])));
      var hq = -1, cmap = {};
      for (var a = 0; a < Math.min(Q.length, 12); a++) {
        if ((Q[a] || []).some(function (c) { return up(c) === 'NAMA'; })) { hq = a; break; }
      }
      if (hq >= 0) {
        (Q[hq] || []).forEach(function (c, ci) {
          var k = up(c);
          if (k === 'NAMA') cmap.nama = ci;
          else if (k === 'TOTAL OMSET') cmap.total = ci;
          else if (k === 'TARGET OMSET') cmap.target = ci;
          else if (k === 'CALL REPORT') cmap.call = ci;
        });
        (Q[hq + 1] || []).forEach(function (c, ci) {
          var k = up(c);
          if (k === 'APD' || k === 'APL' || k === 'APP') cmap[k] = ci;
          if (k === 'TARGET' && cmap.call !== undefined && ci > cmap.call) cmap.callTarget = ci;
        });
        for (var b = hq + 2; b < Q.length; b++) {
          var rr = Q[b] || [];
          var nm2 = str(rr[cmap.nama]);
          if (!nm2) continue;
          // omzet bulan lalu: kolom angka sesudah persentase call
          var lalu = null;
          for (var cc = (cmap.callTarget || 9) + 2; cc < rr.length; cc++) {
            var nv = num(rr[cc]);
            if (nv !== null && nv > 1) { lalu = nv; break; }
          }
          out.staff.push({
            staf: nm2,
            apd: num(rr[cmap.APD]) || 0, apl: num(rr[cmap.APL]) || 0, app: num(rr[cmap.APP]) || 0,
            total: num(rr[cmap.total]) || 0, target: num(rr[cmap.target]) || 0,
            calls: num(rr[cmap.call]) || 0, callTarget: num(rr[cmap.callTarget]) || 0,
            omzetLalu: lalu
          });
        }
      }
    } else out.warnings.push('Sheet "REKAP OMSET & CALL REPORT" tidak ditemukan — jumlah kunjungan tidak terbaca.');
    // c. Sheet kunjungan per staf (KRIS, JAYUS, ...)
    names.forEach(function (n) {
      if (CALL_SHEETS_SKIP.test(n.trim()) || /REKAP/i.test(n)) return;
      var V = rows(XLSX, wb.Sheets[n]);
      var hdr = (V[0] || []).map(up);
      if (hdr.indexOf('REKANAN') < 0 || hdr.indexOf('JENIS REKANAN') < 0) return;
      var iJ = hdr.indexOf('JENIS REKANAN'), iT = hdr.indexOf('TUJUAN');
      var tot = 0, baru = 0, penjajakan = 0;
      for (var z = 1; z < V.length; z++) {
        var vr = V[z] || [];
        if (!str(vr[hdr.indexOf('REKANAN')])) continue;
        tot++;
        if (/BARU/.test(up(vr[iJ]))) baru++;
        if (/PENJAJAKAN/.test(up(vr[iT]))) penjajakan++;
      }
      out.visits[n.trim()] = { total: tot, rekananBaru: baru, penjajakan: penjajakan };
    });
    out.totalKlaim = out.claims.reduce(function (s, c) { return s + c.omzet; }, 0);
    return out;
  }

  /* ---------------------------------------------------------------
   * 4. FILE INSENTIF LAMA (untuk data awal / arsip)
   *    Sheet "% Insentif", "RI <nama>", "RIBORAR"
   * --------------------------------------------------------------- */
  function parseInsentif(XLSX, wb) {
    var out = { jenis: 'INSENTIF', periode: null, periodeLabel: '', tglSurat: '', blocks: [], group: {}, ri: [], riborar: [], warnings: [] };
    var P = rows(XLSX, wb.Sheets['% Insentif']);
    if (!P.length) { out.warnings.push('Sheet "% Insentif" tidak ditemukan.'); return out; }
    // judul periode: "PERIODE : September 2026 (SALES Agustus 2026)"
    for (var i = 0; i < 6; i++) {
      (P[i] || []).forEach(function (c) {
        var s = str(c);
        if (/PERIODE/i.test(s) && /SALES/i.test(s)) {
          out.periodeLabel = s.replace(/^PERIODE\s*:\s*/i, '');
          var m = s.match(/SALES\s+([A-Za-z]+\s+\d{4})/i);
          if (m) out.periode = periodeFromText(m[1]);
        }
        if (/^G\.\d+\//.test(s)) out.docNo = s;
      });
    }
    // blok staf: baris header NO | REKANAN | SALES
    for (var r = 0; r < P.length; r++) {
      var row = P[r] || [];
      for (var c = 0; c < row.length; c++) {
        if (up(row[c]) === 'NO' && up(row[c + 1]) === 'REKANAN' && up(row[c + 2]) === 'SALES') {
          var nama = str((P[r - 1] || [])[c]);
          var blk = { nama: nama, rekanan: [], metrics: {} };
          for (var k = r + 1; k < P.length; k++) {
            var lbl = up((P[k] || [])[c + 1]);
            var val = (P[k] || [])[c + 2];
            if (/^TOTAL PENCAPAIAN/.test(lbl)) {
              blk.metrics.omzet = num(val);
              var labels = { 'REVENUE TARGET': 'target', 'PERSONAL REVENUE ACHIEVEMENT (PRA)': 'pra', 'PERSONAL INCENTIVES RATE (PIR)': 'pir', 'GROUP ACHIEVEMENT FACTOR (GAF)': 'gaf', 'WEIGHTED INCENTIVES RATE': 'rate', 'PERSONAL INCENTIVES': 'insentif' };
              for (var q = k + 1; q < k + 12 && q < P.length; q++) {
                var l2 = up((P[q] || [])[c + 1]);
                if (labels[l2]) blk.metrics[labels[l2]] = num((P[q] || [])[c + 2]);
              }
              break;
            }
            var nm = str((P[k] || [])[c + 1]);
            var v = num(val);
            if (nm && v) blk.rekanan.push({ client: nm, omzet: v, cek: up((P[k] || [])[c + 3]) === 'V' });
          }
          out.blocks.push(blk);
        }
      }
      var b0 = up(row[1]);
      if (b0 === 'TOTAL GROUP ACHIEVEMENT') out.group.omzet = num(row[2]);
      if (b0 === 'TOTAL GROUP TARGET') out.group.target = num(row[2]);
      if (b0 === 'GROUP REVENUE ACHIEVEMENT (GRA)') out.group.gra = num(row[2]);
      if (b0 === 'GROUP ACHIEVEMENT FACTOR (GAF)' && out.group.gra !== undefined) out.group.gaf = num(row[2]);
    }
    // RI sheets
    wb.SheetNames.forEach(function (n) {
      if (!/^RI\s+/i.test(n) || /^RIBORAR/i.test(n)) return;
      var R = rows(XLSX, wb.Sheets[n]);
      var staf = str((R[3] || [])[3]).replace(/^:\s*/, '');
      if (!out.tglSurat) {
        for (var t = R.length - 1; t > 0 && !out.tglSurat; t--) {
          var s0 = str((R[t] || [])[0]);
          if (/^[A-Za-z]+,\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(s0)) out.tglSurat = s0;
        }
      }
      var sheet = { sheet: n.trim(), staf: staf, lines: [], clients: [], total: {} };
      var client = null, no = null;
      for (var j = 8; j < R.length; j++) {
        var a = R[j] || [];
        if (/^SURABAYA|^DIBUAT/i.test(str(a[0]))) break;
        if (str(a[0]) && str(a[2])) { client = str(a[2]); no = str(a[0]); sheet.clients.push(client); continue; }
        var lab = str(a[3]);
        var F = num(a[5]), G = num(a[6]), H = num(a[7]), K = num(a[10]), L = num(a[11]);
        if (!lab) {
          // baris total sheet (SUM(...)/2) — ada di kolom F..L tanpa label, setelah semua klien
          continue;
        }
        if (!(F || G || H)) continue;
        sheet.lines.push({
          no: no, client: client, label: lab.toUpperCase(),
          periode: isDate(a[4]) ? ym(a[4]) : null,
          saldoAwal: F || 0, sales: G || 0, bayar: H || 0,
          saldoAkhir: (F || 0) + (G || 0) - (H || 0),
          rate: K === null ? null : K, insentif: L || 0, catatan: str(a[12]), row: j + 1
        });
      }
      ['saldoAwal', 'sales', 'bayar', 'saldoAkhir', 'insentif'].forEach(function (k) {
        sheet.total[k] = sheet.lines.reduce(function (s, x) { return s + x[k]; }, 0);
      });
      out.ri.push(sheet);
    });
    // RIBORAR
    var B = rows(XLSX, wb.Sheets['RIBORAR']);
    for (var x = 0; x < B.length; x++) {
      var bb = B[x] || [];
      var lbl2 = str(bb[0]);
      if (/^Insentif Periode/i.test(lbl2)) {
        out.riborar.push({ nama: str((B[x - 1] || [])[0]), nilai: num(bb[5]) || 0 });
      }
      if (/^Grand total/i.test(lbl2)) out.riborarTotal = num(bb[5]);
    }
    return out;
  }

  /** Deteksi jenis file dari nama sheet */
  function detect(sheetNames) {
    var s = sheetNames.map(function (n) { return n.toUpperCase(); }).join('|');
    if (/% INSENTIF/.test(s) && /RIBORAR/.test(s)) return 'INSENTIF';
    if (/LIST\s*REKAP\s*OMSET|CALL REPORT/.test(s)) return 'CALL';
    if (/(^|\|)(APL|APP|APD)\b/.test(s)) return 'SALES';
    if (/REALISASI AR/.test(s)) return 'AR';
    return null;
  }

  var api = {
    BULAN: BULAN, parseSales: parseSales, parseAR: parseAR, parseCallReport: parseCallReport,
    parseInsentif: parseInsentif, detect: detect, periodeFromText: periodeFromText,
    periodeFromFilename: periodeFromFilename, callReportSheetFilter: callReportSheetFilter
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Parsers = api;
})(typeof window !== 'undefined' ? window : this);
