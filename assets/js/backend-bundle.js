/* Dibuat otomatis oleh tools/build.js dari folder backend — jangan diedit manual. */
/* ---- Config.gs ---- */
/* =====================================================================
 * Config.gs — skema tabel (sheet) & nilai bawaan
 * Sistem Perhitungan Insentif Sales & Marketing — PT Persada Medika Utama
 * ===================================================================== */
var CFG = {
  APP_NAME: 'Sistem Insentif S&M',
  VERSION: '1.0.0',
  SESSION_HOURS: 8,

  /** Kolom tiap sheet. Baris 1 = header. */
  TABLES: {
    Settings:    ['key', 'value'],
    Users:       ['username', 'nama', 'jabatan', 'email', 'role', 'salt', 'pass_hash', 'aktif', 'dibuat', 'login_terakhir'],
    Staff:       ['kode', 'nama', 'alias', 'target', 'call_target', 'status', 'keluar_mulai', 'urutan', 'catatan', 'email', 'cc'],
    Targets:     ['periode', 'kode', 'target'],
    Clients:     ['id', 'nama', 'segmen', 'bp_code', 'alias', 'first_periode', 'catatan', 'dibuat'],
    PicHistory:  ['client_id', 'kode', 'mulai', 'sumber', 'oleh', 'pada', 'catatan'],
    RateTiers:   ['jenis', 'min', 'nilai', 'label', 'berlaku_mulai'],
    Periods:     ['periode', 'status', 'step', 'tgl_surat', 'computed_at', 'computed_by', 'data_hash', 'omzet', 'target', 'gra', 'gaf', 'terbentuk', 'cair', 'piutang', 'n_error', 'n_warn', 'catatan', 'sumber'],
    PeriodStaff: ['periode', 'kode', 'nama', 'status', 'target', 'omzet', 'omzet_apl', 'omzet_app', 'omzet_apd', 'klaim', 'pra', 'pir', 'gaf', 'rate', 'terbentuk', 'cair', 'calls', 'call_target', 'akun_baru', 'omzet_lalu', 'piutang', 'n_rekanan'],
    Lines:       ['line_id', 'invoice_no', 'periode', 'asal', 'segmen', 'client_id', 'client', 'kode', 'nilai', 'rate', 'jenis', 'sumber', 'dibayar', 'sisa', 'catatan'],
    Payments:    ['pay_id', 'periode', 'tanggal', 'receipt', 'invoice_no', 'line_id', 'client_id', 'client', 'kode', 'nilai', 'rate', 'insentif', 'sumber', 'catatan'],
    StgSales:    ['periode', 'segmen', 'client', 'label', 'nilai', 'cek', 'marker', 'row'],
    StgAR:       ['periode', 'row', 'tanggal', 'tipe', 'invoice', 'receipt', 'ref', 'code', 'client', 'cust_type', 'saldo_awal', 'sales', 'bayar', 'saldo_akhir'],
    StgCall:     ['periode', 'tipe', 'staf', 'client', 'omzet', 'calls', 'call_target', 'omzet_lalu', 'extra'],
    Resolutions: ['key', 'periode', 'jenis', 'data', 'oleh', 'pada'],
    Issues:      ['periode', 'id', 'level', 'kategori', 'kode', 'ref', 'pesan', 'data'],
    Approvals:   ['periode', 'step', 'label', 'username', 'nama', 'jabatan', 'aksi', 'catatan', 'pada', 'kode', 'data_hash', 'valid'],
    Snapshots:   ['periode', 'part', 'chunk'],
    Imports:     ['id', 'periode', 'jenis', 'filename', 'baris', 'total', 'oleh', 'pada', 'catatan'],
    MailLog:     ['id', 'periode', 'jenis', 'kode', 'to', 'cc', 'file', 'oleh', 'pada', 'status'],
    Audit:       ['pada', 'username', 'aksi', 'periode', 'detail']
  },

  /** Kolom yang disimpan sebagai angka */
  NUMERIC: ['target', 'call_target', 'urutan', 'min', 'nilai', 'step', 'omzet', 'gra', 'gaf', 'terbentuk', 'cair', 'piutang',
    'n_error', 'n_warn', 'omzet_apl', 'omzet_app', 'omzet_apd', 'klaim', 'pra', 'pir', 'rate', 'calls', 'akun_baru',
    'omzet_lalu', 'n_rekanan', 'dibayar', 'sisa', 'insentif', 'row', 'saldo_awal', 'sales', 'bayar', 'saldo_akhir',
    'baris', 'total', 'part'],
  BOOLEAN: ['aktif', 'cek', 'valid'],

  ROLES: {
    ADMIN: 'Admin HR (pembuat)',
    FINANCE: 'Finance (upload data)',
    VERIF1: 'Verifikator 1',
    VERIF2: 'Verifikator 2',
    DIKETAHUI: 'Mengetahui',
    DIREKTUR: 'Direktur (menyetujui)',
    VIEWER: 'Lihat saja'
  },

  DEFAULT_SETTINGS: {
    org: { nama: 'PT. PERSADA MEDIKA UTAMA', kota: 'Surabaya', unit: 'Granostic Center' },
    doc_no: {
      persen: 'G.01/DP/HRGA&IT/HR.01/20/01',
      ri: 'G.01/DP/HRGA&IT/HR.01/20/02',
      riborar: 'G.01/DP/HRGA&IT/HR.01/20/03'
    },
    signers: [
      { step: 0, key: 'DIBUAT', label: 'Dibuat oleh,', nama: 'Moch Ichsan Majid', jabatan: 'Staff HR', role: 'ADMIN' },
      { step: 1, key: 'VERIF1', label: 'Verifikator 1,', nama: 'Deiky Catur Hadi', jabatan: 'KaDept. HRGA-IT', role: 'VERIF1' },
      { step: 2, key: 'VERIF2', label: 'Verifikator 2,', nama: 'Yayang Ari Setiawan', jabatan: 'Manajer Operasional', role: 'VERIF2' },
      { step: 3, key: 'DIKETAHUI', label: 'Diketahui oleh,', nama: 'Haninda Pundhi N.', jabatan: 'Sales & Marketing Manager', role: 'DIKETAHUI' },
      { step: 4, key: 'DISETUJUI', label: 'Disetujui oleh,', nama: 'dr. May Fanny Tanzilia, Sp.PK(K)', jabatan: 'Direktur', role: 'DIREKTUR' }
    ],
    apd_marker: { S: 'SAD', R: 'MRA' },
    app_url: '',
    email_notif: true,
    /** penerima email rekap global ke direksi (pisahkan koma). Penerima per staf ada di tabel Staff (email, cc). */
    mail: { global_to: '', global_cc: '' },
    increment_over_target: 0,
    /** rate per invoice dibulatkan ke N desimal (4 = 0,0038 → tampil 0,38% seperti sheet RI). 0 = tanpa pembulatan */
    pembulatan_rate: 4
  },

  DEFAULT_STAFF: [
    { kode: 'KML', nama: 'Kris Mei Lanirosa', alias: 'KRIS,KRIS MEI,KRIS MEI LANIROSA', target: 250000000, call_target: 60, status: 'AKTIF', urutan: 1 },
    { kode: 'JAF', nama: 'Jayus Afandi', alias: 'JAYUS,DJAYUS,JAYUS AFANDI', target: 250000000, call_target: 60, status: 'AKTIF', urutan: 2 },
    { kode: 'LFS', nama: 'Lina Faidatus Sholihah', alias: 'LINA,LINA FAIDATUS S.,LINA FAIDATUS SHOLIHAH', target: 250000000, call_target: 60, status: 'AKTIF', urutan: 3 },
    { kode: 'SAD', nama: 'Sarwo Agung Djatmiko', alias: 'SARWO,SARWO AGUNG DJATMIKO', target: 100000000, call_target: 60, status: 'AKTIF', urutan: 4 },
    { kode: 'MRA', nama: 'M. Rizal Ardiansyah', alias: 'RIZAL,M. RIZAL ARDIANSYAH,M RIZAL ARDIANSYAH', target: 70000000, call_target: 60, status: 'AKTIF', urutan: 5 },
    { kode: 'EAN', nama: 'Edwin Anggiharto', alias: 'EDWIN,EDWIN ANGGIHARTO', target: 0, call_target: 0, status: 'RESIGN', keluar_mulai: '2025-08', urutan: 9 }
  ],

  /** Tabel rate dari sheet Rate_insentif. min = batas bawah pencapaian (≥). */
  DEFAULT_TIERS: [
    { jenis: 'PIR', min: 0,    nilai: 0.0015, label: 'UNDER TARGET (< 65%)' },
    { jenis: 'PIR', min: 0.65, nilai: 0.005,  label: 'UNDER TARGET (65% s/d < 75%)' },
    { jenis: 'PIR', min: 0.75, nilai: 0.0075, label: 'UNDER TARGET (75% s/d < 100%)' },
    { jenis: 'PIR', min: 1.0,  nilai: 0.0175, label: 'ON TARGET (100% s/d < 120%)' },
    { jenis: 'PIR', min: 1.2,  nilai: 0.02,   label: 'OVER TARGET (≥ 120%)' },
    { jenis: 'GAF', min: 0,    nilai: 0.5,    label: '< 65%' },
    { jenis: 'GAF', min: 0.65, nilai: 0.6,    label: '65% s/d < 75%' },
    { jenis: 'GAF', min: 0.75, nilai: 0.75,   label: '75% s/d < 85%' },
    { jenis: 'GAF', min: 0.85, nilai: 0.95,   label: '85% s/d < 100%' },
    { jenis: 'GAF', min: 1.0,  nilai: 1,      label: '≥ 100%' }
  ]
};

/* ---- Core.gs ---- */
/* =====================================================================
 * Core.gs — logika inti (murni JavaScript, tanpa API Google)
 * Dipakai oleh Apps Script DAN mode demo di browser.
 *  - U      : utilitas (normalisasi nama, periode, hash)
 *  - Engine : hitung insentif per periode, buku piutang, rekonsiliasi
 *  - Report : susun data laporan (layar, cetak, arsip)
 * ===================================================================== */

/* ---------------------------- UTILITAS ---------------------------- */
var U = (function () {
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function pad(n) { return ('0' + n).slice(-2); }
  function nowISO() { var d = new Date(); return d.toISOString(); }
  function addMonth(p, k) {
    var y = +p.slice(0, 4), m = +p.slice(5, 7) - 1 + k;
    y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    return y + '-' + pad(m + 1);
  }
  function bulanNama(p) { return p ? BULAN[+p.slice(5, 7) - 1] + ' ' + p.slice(0, 4) : ''; }
  /** periode sales 2026-08 → "September 2026 (Sales Agustus 2026)" */
  function periodeLabel(p) { return bulanNama(addMonth(p, 1)) + ' (Sales ' + bulanNama(p) + ')'; }
  function lastDay(p) {
    var y = +p.slice(0, 4), m = +p.slice(5, 7);
    return p + '-' + pad(new Date(Date.UTC(y, m, 0)).getUTCDate());
  }
  function tglIndo(iso) {
    if (!iso) return '';
    var d = String(iso).slice(0, 10).split('-');
    return (+d[2]) + ' ' + BULAN[+d[1] - 1] + ' ' + d[0];
  }

  var STOP = { PT: 1, CV: 1, TBK: 1, UD: 1, THE: 1, PERSERO: 1 };
  /** Kunci pencocokan nama klien: "PT. Nur Sejati Andhika (--)" == "PT NUR SEJATI ANDHIKA" */
  function norm(s) {
    s = String(s || '').toUpperCase().replace(/&/g, ' DAN ').replace(/\(\s*-*\s*\)/g, ' ');
    s = s.replace(/[^A-Z0-9]+/g, ' ').trim();
    return s.split(' ').filter(function (w) { return w && !STOP[w]; }).join(' ');
  }
  function tokens(s) { return norm(s).split(' ').filter(function (w) { return w.length > 1; }); }
  function similarity(a, b) {
    var A = tokens(a), B = tokens(b);
    if (!A.length || !B.length) return 0;
    var setB = {}; B.forEach(function (w) { setB[w] = 1; });
    var inter = A.filter(function (w) { return setB[w]; }).length;
    return inter / (A.length + B.length - inter);
  }
  function sum(arr, f) { var s = 0; for (var i = 0; i < arr.length; i++) s += (f ? f(arr[i]) : arr[i]) || 0; return s; }
  function by(arr, f) { var o = {}; arr.forEach(function (x) { var k = f(x); (o[k] = o[k] || []).push(x); }); return o; }
  function idx(arr, f) { var o = {}; arr.forEach(function (x) { o[f(x)] = x; }); return o; }
  function r2(n) { return Math.round((n || 0) * 100) / 100; }
  function uid(prefix) { return (prefix || '') + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1e6).toString(36).toUpperCase(); }

  /* SHA-256 (murni JS, agar sama di GAS & browser) */
  function sha256(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mp = Math.pow, maxWord = mp(2, 32), result = '', words = [], i, j;
    ascii = unescape(encodeURIComponent(ascii));
    var asciiBitLength = ascii.length * 8;
    var hash = [], k = [], primeCounter = 0, isComposite = {};
    for (var c = 2; primeCounter < 64; c++) {
      if (!isComposite[c]) {
        for (i = 0; i < 313; i += c) isComposite[i] = c;
        hash[primeCounter] = (mp(c, .5) * maxWord) | 0;
        k[primeCounter++] = (mp(c, 1 / 3) * maxWord) | 0;
      }
    }
    hash = hash.slice(0, 8);
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength);
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var temp1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var temp2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
    return result;
  }

  return {
    BULAN: BULAN, pad: pad, nowISO: nowISO, addMonth: addMonth, bulanNama: bulanNama, periodeLabel: periodeLabel,
    lastDay: lastDay, tglIndo: tglIndo, norm: norm, similarity: similarity, sum: sum, by: by, idx: idx, r2: r2,
    uid: uid, sha256: sha256
  };
})();

/* ------------------------------ ENGINE ------------------------------ */
var Engine = (function () {

  function settings() {
    var o = {};
    DB.get('Settings').forEach(function (r) {
      try { o[r.key] = JSON.parse(r.value); } catch (e) { o[r.key] = r.value; }
    });
    Object.keys(CFG.DEFAULT_SETTINGS).forEach(function (k) { if (o[k] === undefined) o[k] = CFG.DEFAULT_SETTINGS[k]; });
    return o;
  }

  /* ---- master staf ---- */
  function staffAktif(s, p) {
    if (s.status !== 'RESIGN') return true;
    return s.keluar_mulai && p < s.keluar_mulai;
  }
  function targetOf(s, p) {
    var t = DB.get('Targets').filter(function (x) { return x.kode === s.kode && x.periode <= p; })
      .sort(function (a, b) { return a.periode < b.periode ? 1 : -1; })[0];
    return t ? +t.target : +s.target || 0;
  }
  function staffMatcher() {
    var list = DB.get('Staff');
    var keys = [];
    list.forEach(function (s) {
      var al = [s.kode, s.nama].concat(String(s.alias || '').split(','));
      al.forEach(function (a) { var n = U.norm(a); if (n) keys.push({ k: n, s: s }); });
    });
    return function (name) {
      var n = U.norm(name);
      if (!n) return null;
      for (var i = 0; i < keys.length; i++) if (keys[i].k === n) return keys[i].s;
      var first = n.split(' ')[0];
      var hit = keys.filter(function (x) { return x.k.split(' ')[0] === first; });
      var uniq = {}; hit.forEach(function (h) { uniq[h.s.kode] = h.s; });
      var ks = Object.keys(uniq);
      return ks.length === 1 ? uniq[ks[0]] : null;
    };
  }

  /* ---- master klien ---- */
  function clientIndex() {
    var ix = {};
    DB.get('Clients').forEach(function (c) {
      [c.nama].concat(String(c.alias || '').split('|')).forEach(function (a) {
        var n = U.norm(a); if (n && !ix[n]) ix[n] = c;
      });
    });
    return ix;
  }
  function nextClientId() {
    var max = 0;
    DB.get('Clients').forEach(function (c) { var n = parseInt(String(c.id).replace(/\D/g, ''), 10); if (n > max) max = n; });
    return 'K' + ('0000' + (max + 1)).slice(-4);
  }
  function addAlias(c, name) {
    var n = U.norm(name);
    if (!n || U.norm(c.nama) === n) return;
    var al = String(c.alias || '').split('|').filter(String);
    if (al.map(U.norm).indexOf(n) < 0) { al.push(name); c.alias = al.join('|'); }
  }
  function createClient(nama, segmen, periode, extra) {
    var c = {
      id: nextClientId(), nama: nama, segmen: segmen || '', bp_code: (extra && extra.bp_code) || '', alias: '',
      first_periode: periode || '', catatan: (extra && extra.catatan) || '', dibuat: U.nowISO()
    };
    DB.get('Clients').push(c);
    DB.dirty('Clients');
    return c;
  }
  function suggestClients(name, n) {
    return DB.get('Clients').map(function (c) {
      var best = U.similarity(name, c.nama);
      String(c.alias || '').split('|').forEach(function (a) { if (a) best = Math.max(best, U.similarity(name, a)); });
      return { id: c.id, nama: c.nama, skor: Math.round(best * 100) / 100 };
    }).filter(function (x) { return x.skor >= 0.34; })
      .sort(function (a, b) { return b.skor - a.skor; }).slice(0, n || 5);
  }

  /** PIC (staf pemegang) klien pada periode p */
  function picMap(p) {
    var m = {};
    DB.get('PicHistory').filter(function (h) { return h.mulai <= p; })
      .sort(function (a, b) { return a.mulai < b.mulai ? -1 : a.mulai > b.mulai ? 1 : (a.pada < b.pada ? -1 : 1); })
      .forEach(function (h) { m[h.client_id] = h.kode || ''; });
    return m;
  }
  function setPic(clientId, kode, mulai, sumber, user, catatan) {
    var H = DB.get('PicHistory');
    // hapus entri dengan bulan mulai yang sama agar tidak dobel
    for (var i = H.length - 1; i >= 0; i--) if (H[i].client_id === clientId && H[i].mulai === mulai) H.splice(i, 1);
    H.push({ client_id: clientId, kode: kode, mulai: mulai, sumber: sumber || 'MANUAL', oleh: user || '', pada: U.nowISO(), catatan: catatan || '' });
    DB.dirty('PicHistory');
  }

  /* ---- tabel rate ---- */
  function tiers(p) {
    var all = DB.get('RateTiers');
    var vers = all.map(function (t) { return t.berlaku_mulai || '0000-00'; }).filter(function (v) { return v <= p; }).sort();
    var v = vers.length ? vers[vers.length - 1] : '0000-00';
    var pick = function (j) {
      return all.filter(function (t) { return t.jenis === j && (t.berlaku_mulai || '0000-00') === v; })
        .sort(function (a, b) { return a.min - b.min; });
    };
    return { PIR: pick('PIR'), GAF: pick('GAF'), versi: v };
  }
  function tierValue(list, ach) {
    var val = list.length ? list[0].nilai : 0;
    list.forEach(function (t) { if (ach >= t.min - 1e-12) val = t.nilai; });
    return val;
  }

  /* ---- jenis baris tagihan ---- */
  function lineJenis(label) {
    var s = String(label || '').toUpperCase().trim();
    if (/^CASH/.test(s)) return 'CASH';
    if (/^AII\//.test(s)) return 'INV';
    if (/DITAGIH|TANPA NO|BELUM/.test(s)) return 'PENDING';
    return 'INV';
  }

  /* ===================================================================
   * HITUNG PERIODE
   * =================================================================== */
  function compute(P, user) {
    var per = DB.get('Periods').filter(function (x) { return x.periode === P; })[0];
    if (per && ['PROSES', 'DISETUJUI', 'ARSIP'].indexOf(per.status) >= 0)
      throw new Error('Periode ' + U.bulanNama(P) + ' sedang/sudah disetujui. Batalkan persetujuan dulu untuk menghitung ulang.');
    var later = DB.get('Periods').filter(function (x) { return x.periode > P && x.status !== 'DRAFT'; });
    if (later.length) throw new Error('Sudah ada periode setelahnya (' + U.bulanNama(later[0].periode) + ') yang dihitung. Hitung ulang hanya bisa untuk periode terakhir.');

    var S = settings();
    var stgS = DB.get('StgSales').filter(function (r) { return r.periode === P; });
    var stgA = DB.get('StgAR').filter(function (r) { return r.periode === P; });
    var stgC = DB.get('StgCall').filter(function (r) { return r.periode === P; });
    if (!stgS.length) throw new Error('Data Realisasi Sales ' + U.bulanNama(P) + ' belum di-import.');

    var RES = {};
    DB.get('Resolutions').forEach(function (r) {
      if (r.periode === P || r.periode === '*') { try { RES[r.key] = JSON.parse(r.data); } catch (e) { RES[r.key] = {}; } }
    });
    var issues = [];
    var issue = function (level, kategori, kode, ref, pesan, data) {
      issues.push({ periode: P, id: kategori + '|' + ref, level: level, kategori: kategori, kode: kode || '', ref: ref || '', pesan: pesan, data: JSON.stringify(data || {}) });
    };

    // 0. bersihkan hasil hitung sebelumnya utk periode ini
    DB.set('Lines', DB.get('Lines').filter(function (l) { return l.asal !== P; }));
    DB.set('Payments', DB.get('Payments').filter(function (p) { return p.periode !== P; }));

    var matchStaff = staffMatcher();
    var staffAll = DB.get('Staff');
    var staffBy = U.idx(staffAll, function (s) { return s.kode; });

    /* 1. cocokkan klien dari data Finance */
    var cix = clientIndex();
    var resolveName = function (name) {
      var n = U.norm(name);
      var r = RES['NAMA|' + n];
      if (r && r.client_id) { var c0 = DB.get('Clients').filter(function (c) { return c.id === r.client_id; })[0]; if (c0) return c0; }
      return cix[n] || null;
    };
    var akunBaru = {};
    stgS.forEach(function (r) {
      var c = resolveName(r.client);
      if (!c) {
        c = createClient(r.client, r.segmen, P);
        cix[U.norm(r.client)] = c;
      }
      if (!c.segmen) { c.segmen = r.segmen; DB.dirty('Clients'); }
      if (!c.first_periode || c.first_periode > P) { c.first_periode = P; DB.dirty('Clients'); }
      r._c = c;
    });
    var firstSeen = {}; // klien baru = pertama kali punya sales di periode P
    DB.get('Clients').forEach(function (c) { if (c.first_periode === P) firstSeen[c.id] = 1; });
    // klien lama yg pernah ada sales di periode sebelumnya → bukan akun baru
    DB.get('Lines').forEach(function (l) { if (l.periode < P) delete firstSeen[l.client_id]; });

    /* 2. klaim staf (call report) */
    var claims = stgC.filter(function (r) { return r.tipe === 'KLAIM'; }).map(function (r) {
      var s = matchStaff(r.staf);
      var c = resolveName(r.client);
      return { staf: r.staf, kode: s ? s.kode : '', client: r.client, client_id: c ? c.id : '', omzet: +r.omzet || 0 };
    });
    claims.forEach(function (k) {
      if (!k.kode) issue('WARN', 'STAF_TIDAK_DIKENAL', '', k.staf, 'Nama staf "' + k.staf + '" di Call Report tidak dikenali. Tambahkan sebagai alias di Master Staf.', { staf: k.staf });
    });
    var claimBy = U.by(claims.filter(function (k) { return k.client_id; }), function (k) { return k.client_id; });

    /* 3. tentukan PIC tiap klien */
    var PIC = picMap(P);
    var marker = S.apd_marker || {};
    var clientRows = U.by(stgS, function (r) { return r._c.id; });
    var house = {}; // klien yang diputuskan "tanpa PIC / bukan akun staf
    Object.keys(clientRows).forEach(function (cid) {
      var rowsC = clientRows[cid], c = rowsC[0]._c;
      var cand = {};
      (claimBy[cid] || []).forEach(function (k) { if (k.kode) cand[k.kode] = 'Call Report'; });
      rowsC.forEach(function (r) { var mk = String(r.marker || '').toUpperCase(); if (mk && marker[mk]) cand[marker[mk]] = 'tanda "' + mk.toLowerCase() + '" di file Finance APD'; });
      var cur = PIC[cid];
      var res = RES['PIC|' + cid];
      if (res && res.kode === '') house[cid] = 1;
      if (res && res.kode !== undefined) {
        if (res.kode !== cur) { setPic(cid, res.kode, P, 'KEPUTUSAN', user, res.catatan || ''); PIC[cid] = res.kode; }
        return;
      }
      var ks = Object.keys(cand);
      if (cur === undefined) {
        if (ks.length === 1) {
          setPic(cid, ks[0], P, 'OTOMATIS (' + cand[ks[0]] + ')', user);
          PIC[cid] = ks[0];
        } else if (ks.length > 1) {
          issue('ERROR', 'PIC_GANDA', '', cid, c.nama + ' diklaim lebih dari satu staf (' + ks.join(', ') + '). Tentukan PIC-nya.', { client_id: cid, client: c.nama, kandidat: ks, omzet: U.sum(rowsC, function (r) { return r.nilai; }) });
        } else {
          issue('ERROR', 'TANPA_PIC', '', cid, c.nama + ' punya omzet ' + fmt(U.sum(rowsC, function (r) { return r.nilai; })) + ' tapi belum ada staf pemegang (tidak diklaim siapa pun).', { client_id: cid, client: c.nama, omzet: U.sum(rowsC, function (r) { return r.nilai; }), saran: [] });
        }
      } else if (ks.length && ks.indexOf(cur) < 0 && cur) {
        issue('WARN', 'KLAIM_BEDA_PIC', ks[0], cid, c.nama + ': PIC tercatat ' + cur + ', tapi bulan ini diklaim oleh ' + ks.join(', ') + ' (' + cand[ks[0]] + '). Pindahkan PIC jika memang ada peralihan.', { client_id: cid, client: c.nama, pic: cur, kandidat: ks });
      } else if (cur && staffBy[cur] && !staffAktif(staffBy[cur], P)) {
        issue('WARN', 'PIC_RESIGN', cur, cid, c.nama + ' masih dipegang ' + staffBy[cur].nama + ' yang sudah resign. Omzet tidak dihitung ke siapa pun sampai dipindahkan.', { client_id: cid, client: c.nama, pic: cur });
      }
    });

    /* 4. omzet & rate */
    var T = tiers(P);
    var aktif = staffAll.filter(function (s) { return staffAktif(s, P); });
    var omz = {};
    staffAll.forEach(function (s) { omz[s.kode] = { omzet: 0, APL: 0, APP: 0, APD: 0, rek: {} }; });
    var unassigned = 0;
    stgS.forEach(function (r) {
      var k = PIC[r._c.id];
      if (k && staffBy[k] && staffAktif(staffBy[k], P)) {
        omz[k].omzet += +r.nilai; omz[k][r.segmen] = (omz[k][r.segmen] || 0) + (+r.nilai);
        omz[k].rek[r._c.id] = (omz[k].rek[r._c.id] || 0) + (+r.nilai);
        r._k = k;
      } else { if (!house[r._c.id]) unassigned += +r.nilai; r._k = ''; }
    });
    var grpStaff = aktif.filter(function (s) { return targetOf(s, P) > 0; });
    var gOmzet = U.sum(grpStaff, function (s) { return omz[s.kode].omzet; });
    var gTarget = U.sum(grpStaff, function (s) { return targetOf(s, P); });
    var gra = gTarget ? gOmzet / gTarget : 0;
    var gaf = tierValue(T.GAF, gra);
    var rate = {};
    var inc = +S.increment_over_target || 0;
    aktif.forEach(function (s) {
      var t = targetOf(s, P);
      var pra = t ? omz[s.kode].omzet / t : 0;
      var pir = t ? tierValue(T.PIR, pra) : 0;
      if (inc && pra >= 1.2) pir += inc;
      rate[s.kode] = { target: t, pra: pra, pir: pir, gaf: gaf, rate: roundRate(pir * gaf, S), raw: pir * gaf };
    });

    /* 5. baris tagihan baru dari sales */
    var Lines = DB.get('Lines');
    var seq = 0;
    var mkLine = function (o) {
      seq++;
      var l = {
        line_id: P + '-' + ('000' + seq).slice(-4), invoice_no: o.invoice_no || '', periode: o.periode || P, asal: P,
        segmen: o.segmen || '', client_id: o.client_id, client: o.client, kode: o.kode || '', nilai: +o.nilai || 0,
        rate: o.rate || 0, jenis: o.jenis, sumber: o.sumber, dibayar: 0, sisa: +o.nilai || 0, catatan: o.catatan || ''
      };
      Lines.push(l);
      return l;
    };
    var newLines = stgS.map(function (r) {
      var j = lineJenis(r.label);
      return mkLine({
        invoice_no: j === 'INV' ? String(r.label).toUpperCase().trim() : (j === 'CASH' ? 'CASH' : ''),
        segmen: r.segmen, client_id: r._c.id, client: r._c.nama, kode: r._k, nilai: r.nilai,
        rate: r._k && rate[r._k] ? rate[r._k].rate : 0, jenis: j, sumber: 'SALES',
        catatan: j === 'PENDING' ? String(r.label).trim() : ''
      });
    });

    /* 6. pembayaran */
    var Pay = DB.get('Payments');
    var paidBefore = {};
    Pay.forEach(function (p) { if (p.periode < P) paidBefore[p.line_id] = (paidBefore[p.line_id] || 0) + (+p.nilai); });
    Lines.forEach(function (l) { l._sisa = l.nilai - (paidBefore[l.line_id] || 0); });
    var byInv = U.by(Lines.filter(function (l) { return l.invoice_no && l.jenis !== 'CASH'; }), function (l) { return l.invoice_no; });
    var pseq = 0;
    var addPay = function (l, nilai, o) {
      pseq++;
      Pay.push({
        pay_id: P + '-P' + ('000' + pseq).slice(-4), periode: P, tanggal: o.tanggal || U.lastDay(P), receipt: o.receipt || '',
        invoice_no: l.invoice_no, line_id: l.line_id, client_id: l.client_id, client: l.client, kode: l.kode,
        nilai: nilai, rate: l.rate, insentif: nilai * (l.rate || 0), sumber: o.sumber, catatan: o.catatan || ''
      });
      l._sisa -= nilai;
    };
    var allocate = function (targets, nilai, o) {
      var open = targets.filter(function (l) { return l._sisa > 0.5; });
      var use = open.length ? open : targets;
      if (use.length === 1) { addPay(use[0], nilai, o); return; }
      var base = U.sum(use, function (l) { return Math.max(l._sisa, 0); }) || U.sum(use, function (l) { return l.nilai; });
      var left = nilai;
      use.forEach(function (l, i) {
        var part = i === use.length - 1 ? left : Math.round(nilai * (Math.max(l._sisa, 0) || l.nilai) / base);
        left -= part;
        addPay(l, part, o);
      });
    };
    var occ = {};
    var unmatchedPay = 0;
    stgA.filter(function (r) { return r.tipe === 'RCV' && +r.bayar; }).forEach(function (r) {
      var base = 'BAYAR|' + r.receipt + '|' + r.ref + '|' + r.bayar;
      occ[base] = (occ[base] || 0) + 1;
      var key = base + (occ[base] > 1 ? '#' + occ[base] : '');
      var o = { tanggal: r.tanggal, receipt: r.receipt, sumber: 'AR', catatan: '' };
      var res = RES[key];
      if (res && res.aksi === 'ABAIKAN') return;
      var targets = [];
      if (res && res.aksi === 'TAUTKAN') {
        targets = Lines.filter(function (l) { return l.line_id === res.line_id; });
        o.catatan = 'Ditautkan manual';
      } else if (res && res.aksi === 'LAMA') {
        var c = DB.get('Clients').filter(function (x) { return x.id === res.client_id; })[0] || resolveName(r.client) || createClient(r.client, '', res.periode);
        var lr = +res.rate;
        if (!isFinite(lr) || res.rate === '' || res.rate === null) {
          var ps = DB.get('PeriodStaff').filter(function (x) { return x.periode === res.periode && x.kode === res.kode; })[0];
          lr = ps ? +ps.rate : 0;
        }
        var nl = mkLine({ invoice_no: r.ref || ('LAMA-' + r.receipt), periode: res.periode, segmen: c.segmen, client_id: c.id, client: c.nama, kode: res.kode, nilai: +r.bayar, rate: lr, jenis: 'INV', sumber: 'LAMA', catatan: res.catatan || 'Invoice lama (input manual)' });
        nl._sisa = nl.nilai;
        targets = [nl];
      } else if (r.ref && byInv[r.ref]) {
        targets = byInv[r.ref];
      }
      if (!targets.length) {
        unmatchedPay += +r.bayar;
        var cl = resolveName(r.client);
        var sug = cl ? Lines.filter(function (l) { return l.client_id === cl.id && l._sisa > 0.5; })
          .map(function (l) { return { line_id: l.line_id, invoice_no: l.invoice_no || l.catatan || '(tanpa no)', periode: l.periode, sisa: l._sisa, kode: l.kode }; }) : [];
        issue('ERROR', 'BAYAR_TANPA_INVOICE', '', key,
          r.client + ' bayar ' + fmt(r.bayar) + ' untuk ' + (r.ref || 'invoice tanpa nomor') + ' (' + r.receipt + '), tapi invoice itu tidak ada di sistem.',
          { key: key, client: r.client, client_id: cl ? cl.id : '', ref: r.ref, receipt: r.receipt, bayar: +r.bayar, tanggal: r.tanggal, saran: sug, pic: cl ? (PIC[cl.id] || '') : '' });
        return;
      }
      var sisaAll = U.sum(targets, function (l) { return Math.max(l._sisa, 0); });
      var amt = +r.bayar;
      if (amt > sisaAll + 1 && sisaAll > 0.5) {
        // kelebihan → tagihan "DITAGIHKAN ..." (tanpa nomor) milik klien yang sama, mulai yang terlama
        var excess = amt - sisaAll;
        var cid = targets[0].client_id;
        var pend = Lines.filter(function (l) { return l.client_id === cid && l.jenis === 'PENDING' && l._sisa > 0.5 && l.asal < P; })
          .sort(function (a, b) { return a.periode < b.periode ? -1 : 1; });
        allocate(targets, sisaAll, o);
        pend.forEach(function (l) {
          if (excess < 0.5) return;
          var part = Math.min(excess, l._sisa);
          addPay(l, part, { tanggal: o.tanggal, receipt: o.receipt, sumber: 'AR', catatan: 'Kelebihan bayar ' + r.ref + ' dialokasikan ke ' + (l.catatan || 'tagihan tanpa nomor') });
          excess -= part;
        });
        if (excess > 1) {
          issue('WARN', 'LEBIH_BAYAR', targets[0].kode, key, r.client + ': pembayaran ' + fmt(amt) + ' untuk ' + r.ref + ' melebihi sisa tagihan. Kelebihan ' + fmt(excess) + ' dicatat di invoice tsb (saldo minus).', { key: key, ref: r.ref, bayar: amt, sisa: sisaAll });
          addPay(targets[targets.length - 1], excess, o);
        } else if (pend.length) {
          issue('INFO', 'BAYAR_DIALOKASIKAN', targets[0].kode, key, r.client + ': pembayaran ' + fmt(amt) + ' untuk ' + r.ref + ' melebihi sisa invoice; kelebihan dialokasikan otomatis ke tagihan "' + pend[0].catatan + '".', { key: key });
        }
        return;
      }
      if (amt > sisaAll + 1) {
        issue('WARN', 'LEBIH_BAYAR', targets[0].kode, key, r.client + ': pembayaran ' + fmt(amt) + ' untuk ' + r.ref + ' melebihi sisa tagihan ' + fmt(sisaAll) + '.', { key: key, ref: r.ref, bayar: amt, sisa: sisaAll });
      }
      allocate(targets, amt, o);
    });
    // CASH = lunas di bulan yang sama
    newLines.forEach(function (l) { if (l.jenis === 'CASH') addPay(l, l.nilai, { receipt: 'CASH', sumber: 'CASH' }); });
    // penyesuaian manual (koreksi kurang/lebih bayar periode lalu, dll.)
    Object.keys(RES).forEach(function (key) {
      if (key.indexOf('ADJ|') !== 0) return;
      var a = RES[key];
      if (!a || !a.kode || !+a.nilai) return;
      pseq++;
      Pay.push({
        pay_id: P + '-J' + ('000' + pseq).slice(-4), periode: P, tanggal: U.lastDay(P), receipt: 'PENYESUAIAN', invoice_no: 'PENYESUAIAN',
        line_id: '', client_id: '', client: a.alasan || 'Penyesuaian', kode: a.kode, nilai: 0, rate: 0, insentif: +a.nilai,
        sumber: 'PENYESUAIAN', catatan: key
      });
    });

    /* 7. cek silang AR vs Sales */
    var arInv = U.by(stgA.filter(function (r) { return r.tipe === 'INV' && +r.sales; }), function (r) { return r.invoice; });
    var salesInv = U.by(newLines.filter(function (l) { return l.jenis === 'INV'; }), function (l) { return l.invoice_no; });
    Object.keys(arInv).forEach(function (inv) {
      var a = U.sum(arInv[inv], function (r) { return +r.sales; });
      var s = U.sum(salesInv[inv] || [], function (l) { return l.nilai; });
      if (!salesInv[inv]) {
        if (!byInv[inv] || !byInv[inv].some(function (l) { return l.periode < P; }))
          issue('WARN', 'INVOICE_AR_SAJA', '', inv, 'Invoice ' + inv + ' (' + arInv[inv][0].client + ', ' + fmt(a) + ') ada di file AR tapi tidak ada di Realisasi Sales.', { invoice: inv, client: arInv[inv][0].client, nilai: a });
      } else if (Math.abs(a - s) > 1) {
        issue('INFO', 'INVOICE_BEDA_NILAI', '', inv, 'Invoice ' + inv + ': nilai di AR ' + fmt(a) + ' vs Realisasi Sales ' + fmt(s) + '.', { invoice: inv, ar: a, sales: s });
      }
    });

    /* 8. rekonsiliasi klaim staf vs Finance */
    var finByClient = {};
    stgS.forEach(function (r) { finByClient[r._c.id] = (finByClient[r._c.id] || 0) + (+r.nilai); });
    claims.forEach(function (k) {
      if (!k.kode) return;
      if (!k.client_id) {
        issue('WARN', 'KLAIM_TIDAK_ADA', k.kode, 'KLAIM|' + U.norm(k.client), k.staf + ' mengklaim "' + k.client + '" ' + fmt(k.omzet) + ', tapi nama ini tidak ada di data Finance bulan ini.', { kode: k.kode, client: k.client, omzet: k.omzet, saran: suggestClients(k.client, 4) });
        return;
      }
      var f = finByClient[k.client_id] || 0;
      if (!f) issue('WARN', 'KLAIM_TIDAK_ADA', k.kode, 'KLAIM|' + U.norm(k.client), k.staf + ' mengklaim "' + k.client + '" ' + fmt(k.omzet) + ', tapi tidak ada omzet di data Finance bulan ini.', { kode: k.kode, client: k.client, omzet: k.omzet });
      else if (Math.abs(f - k.omzet) > 1 && (claimBy[k.client_id] || []).length === 1)
        issue('WARN', 'KLAIM_BEDA_NILAI', k.kode, 'KLAIMNILAI|' + k.client_id, k.staf + ' · ' + k.client + ': klaim ' + fmt(k.omzet) + ' vs Finance ' + fmt(f) + ' (selisih ' + fmt(k.omzet - f) + ').', { kode: k.kode, client_id: k.client_id, klaim: k.omzet, finance: f });
    });

    /* 9. simpan saldo baris */
    var paidNow = {};
    Pay.forEach(function (p) { paidNow[p.line_id] = (paidNow[p.line_id] || 0) + (+p.nilai); });
    Lines.forEach(function (l) { l.dibayar = paidNow[l.line_id] || 0; l.sisa = l.nilai - l.dibayar; delete l._sisa; });
    DB.dirty('Lines'); DB.dirty('Payments');

    /* 10. ringkasan per staf */
    var prevP = U.addMonth(P, -1);
    var prevPS = U.idx(DB.get('PeriodStaff').filter(function (x) { return x.periode === prevP; }), function (x) { return x.kode; });
    var callBy = {};
    stgC.filter(function (r) { return r.tipe === 'STAF'; }).forEach(function (r) {
      var s = matchStaff(r.staf); if (s) callBy[s.kode] = r;
    });
    var cairBy = {}, piutangBy = {};
    Pay.forEach(function (p) { if (p.periode === P) cairBy[p.kode] = (cairBy[p.kode] || 0) + (+p.insentif); });
    Lines.forEach(function (l) { if (l.sisa > 0.5) piutangBy[l.kode] = (piutangBy[l.kode] || 0) + l.sisa; });
    var klaimBy = {};
    claims.forEach(function (k) { if (k.kode) klaimBy[k.kode] = (klaimBy[k.kode] || 0) + k.omzet; });
    var psRows = [];
    staffAll.forEach(function (s) {
      var isAktif = staffAktif(s, P);
      var o = omz[s.kode], rt = rate[s.kode] || { target: 0, pra: 0, pir: 0, gaf: 0, rate: 0 };
      var cair = cairBy[s.kode] || 0, piu = piutangBy[s.kode] || 0;
      if (!isAktif && !cair && !piu) return;
      var cr = callBy[s.kode];
      var baru = newAccounts(P, s.kode, Object.keys(o.rek)).length;
      psRows.push({
        periode: P, kode: s.kode, nama: s.nama, status: isAktif ? 'AKTIF' : 'RESIGN', target: rt.target, omzet: o.omzet,
        omzet_apl: o.APL || 0, omzet_app: o.APP || 0, omzet_apd: o.APD || 0, klaim: klaimBy[s.kode] || 0,
        pra: rt.pra, pir: rt.pir, gaf: isAktif ? gaf : 0, rate: rt.rate, terbentuk: (rt.raw === undefined ? rt.rate : rt.raw) * o.omzet, cair: cair,
        calls: cr ? +cr.calls : 0, call_target: cr ? +cr.call_target : (+s.call_target || 0), akun_baru: baru,
        omzet_lalu: prevPS[s.kode] ? +prevPS[s.kode].omzet : (cr && +cr.omzet_lalu ? +cr.omzet_lalu : 0),
        piutang: piu, n_rekanan: Object.keys(o.rek).length
      });
    });
    DB.set('PeriodStaff', DB.get('PeriodStaff').filter(function (x) { return x.periode !== P; }).concat(psRows));

    if (unassigned > 0.5) issue('ERROR', 'OMZET_TANPA_PIC', '', 'TOTAL', 'Total omzet ' + fmt(unassigned) + ' belum masuk ke staf mana pun (lihat daftar klien tanpa PIC).', { nilai: unassigned });
    if (!stgA.length) issue('WARN', 'AR_KOSONG', '', 'AR', 'File Realisasi AR ' + U.bulanNama(P) + ' belum di-import — pembayaran invoice (selain CASH) belum dihitung.', {});
    if (!stgC.length) issue('WARN', 'CALL_KOSONG', '', 'CALL', 'File Call Report ' + U.bulanNama(P) + ' belum di-import — PIC klien baru & rekonsiliasi klaim tidak bisa otomatis.', {});

    // terapkan keputusan "abaikan" untuk peringatan
    issues.forEach(function (it) { var r = RES['ACK|' + it.id]; if (r) { it.level = it.level === 'ERROR' ? 'ERROR_OK' : 'OK'; it.pesan += ' — Ditandai: ' + (r.catatan || 'sudah dicek'); } });
    DB.set('Issues', DB.get('Issues').filter(function (x) { return x.periode !== P; }).concat(issues));

    /* 11. ringkasan periode */
    var cair = U.sum(Pay.filter(function (p) { return p.periode === P; }), function (p) { return +p.insentif; });
    var dataHash = hashPeriode(P);
    var rowP = per || { periode: P };
    var fresh = {
      periode: P, status: 'DIHITUNG', step: 0, tgl_surat: rowP.tgl_surat || '', computed_at: U.nowISO(), computed_by: user || '',
      data_hash: dataHash, omzet: gOmzet, target: gTarget, gra: gra, gaf: gaf, terbentuk: U.sum(psRows, function (r) { return r.terbentuk; }),
      cair: cair, piutang: U.sum(Lines, function (l) { return l.sisa > 0.5 ? l.sisa : 0; }),
      n_error: issues.filter(function (i) { return i.level === 'ERROR'; }).length,
      n_warn: issues.filter(function (i) { return i.level === 'WARN'; }).length,
      catatan: rowP.catatan || '', sumber: 'SISTEM'
    };
    var Ps = DB.get('Periods').filter(function (x) { return x.periode !== P; });
    Ps.push(fresh);
    DB.set('Periods', Ps.sort(function (a, b) { return a.periode < b.periode ? -1 : 1; }));
    return { periode: fresh, staff: psRows, issues: issues };
  }

  /** Akun baru staf k di periode P: klien yang baru pertama kali beli, ATAU baru dialihkan ke staf k */
  function newAccounts(P, k, clientIds) {
    var prev = picMap(U.addMonth(P, -1));
    var cb = U.idx(DB.get('Clients'), function (c) { return c.id; });
    var hadSales = {};
    DB.get('Lines').forEach(function (l) { if (l.periode < P && l.asal < P) hadSales[l.client_id] = 1; });
    var out = [];
    clientIds.forEach(function (cid) {
      var c = cb[cid] || {};
      if (prev[cid] !== undefined && prev[cid] && prev[cid] !== k) out.push({ client_id: cid, client: c.nama, dari: prev[cid] });
      else if (c.first_periode === P && !hadSales[cid]) out.push({ client_id: cid, client: c.nama, dari: '' });
    });
    return out;
  }

  function hashPeriode(P) {
    var ps = DB.get('PeriodStaff').filter(function (x) { return x.periode === P; })
      .map(function (x) { return [x.kode, U.r2(x.omzet), x.rate, U.r2(x.cair)].join(':'); }).sort();
    var pay = DB.get('Payments').filter(function (x) { return x.periode === P; })
      .map(function (x) { return [x.line_id, U.r2(x.nilai), x.rate].join(':'); }).sort();
    return U.sha256(P + '|' + ps.join(',') + '|' + pay.join(','));
  }

  /** Pembulatan rate seperti sheet RI di Excel: 0,00375 → 0,0038 */
  function roundRate(x, S) {
    var d = S && S.pembulatan_rate !== undefined ? +S.pembulatan_rate : 4;
    if (!d) return x;
    var f = Math.pow(10, d);
    return Math.round(x * f + 1e-9) / f;
  }

  function fmt(n) {
    var s = Math.round(+n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'Rp ' + s;
  }

  return {
    settings: settings, compute: compute, tiers: tiers, tierValue: tierValue, picMap: picMap, setPic: setPic,
    staffMatcher: staffMatcher, staffAktif: staffAktif, targetOf: targetOf, clientIndex: clientIndex, createClient: createClient,
    addAlias: addAlias, suggestClients: suggestClients, roundRate: roundRate, newAccounts: newAccounts, lineJenis: lineJenis, hashPeriode: hashPeriode, fmt: fmt
  };
})();

/* ------------------------------ LAPORAN ------------------------------ */
var Report = (function () {

  /** Susun laporan lengkap periode P dari tabel (atau ambil arsip/snapshot) */
  function build(P, opts) {
    opts = opts || {};
    var per = DB.get('Periods').filter(function (x) { return x.periode === P; })[0];
    if (!per) throw new Error('Periode ' + P + ' belum ada.');
    if (!opts.live && (per.status === 'DISETUJUI' || per.status === 'ARSIP')) {
      var snap = loadSnapshot(P);
      if (snap) { snap.periodeRow = per; snap.approvals = approvals(P); snap.fromSnapshot = true; return snap; }
    }
    var S = Engine.settings();
    var staffBy = U.idx(DB.get('Staff'), function (s) { return s.kode; });
    var PS = DB.get('PeriodStaff').filter(function (x) { return x.periode === P; })
      .sort(function (a, b) { return ((staffBy[a.kode] || {}).urutan || 99) - ((staffBy[b.kode] || {}).urutan || 99); });
    var lines = DB.get('Lines');
    var pays = DB.get('Payments');
    var payP = pays.filter(function (p) { return p.periode === P; });
    var paidBefore = {}, paidIn = {}, insIn = {};
    pays.forEach(function (p) {
      if (p.periode < P) paidBefore[p.line_id] = (paidBefore[p.line_id] || 0) + (+p.nilai);
      if (p.periode === P) { paidIn[p.line_id] = (paidIn[p.line_id] || 0) + (+p.nilai); insIn[p.line_id] = (insIn[p.line_id] || 0) + (+p.insentif); }
    });
    var clientsBy = U.idx(DB.get('Clients'), function (c) { return c.id; });

    // rekanan per staf (dari sales periode P)
    var salesP = lines.filter(function (l) { return l.asal === P && l.sumber === 'SALES'; });
    var rekBy = {};
    salesP.forEach(function (l) {
      if (!l.kode) return;
      var m = rekBy[l.kode] = rekBy[l.kode] || {};
      var k = l.client_id + '|' + l.segmen;
      if (!m[k]) m[k] = { client_id: l.client_id, client: l.client, segmen: l.segmen, omzet: 0, baru: false, dari: '' };
      m[k].omzet += l.nilai;
    });

    // RI per staf
    var riBy = {};
    lines.forEach(function (l) {
      if (l.periode > P && l.asal > P) return;
      if (l.asal > P) return;
      var isNewSale = l.asal === P && l.sumber === 'SALES';
      var sa = isNewSale ? 0 : l.nilai - (paidBefore[l.line_id] || 0);
      var sales = isNewSale ? l.nilai : 0;
      var bayar = paidIn[l.line_id] || 0;
      if (Math.abs(sa) < 0.5 && !sales && !bayar) return;
      var k = l.kode || '-';
      var st = riBy[k] = riBy[k] || { kode: k, nama: (staffBy[k] || {}).nama || 'Tanpa PIC', clients: {} };
      var c = st.clients[l.client_id] = st.clients[l.client_id] || { client_id: l.client_id, client: l.client, lines: [] };
      c.lines.push({
        line_id: l.line_id, invoice_no: l.jenis === 'CASH' ? 'CASH' : (l.invoice_no || l.catatan || '(tanpa no)'), periode: l.periode,
        jenis: l.jenis, saldo_awal: sa, sales: sales, bayar: bayar, saldo_akhir: sa + sales - bayar,
        rate: l.rate, insentif: insIn[l.line_id] || 0, catatan: l.sumber === 'LAMA' ? l.catatan : (l.jenis === 'PENDING' ? l.catatan : '')
      });
    });
    payP.filter(function (p) { return p.sumber === 'PENYESUAIAN'; }).forEach(function (p) {
      var k = p.kode;
      var st = riBy[k] = riBy[k] || { kode: k, nama: (staffBy[k] || {}).nama || k, clients: {} };
      var c = st.clients['~ADJ'] = st.clients['~ADJ'] || { client_id: '', client: 'Penyesuaian manual', lines: [], adj: true };
      c.lines.push({ line_id: '', invoice_no: 'PENYESUAIAN', periode: P, jenis: 'ADJ', saldo_awal: 0, sales: 0, bayar: 0, saldo_akhir: 0, rate: 0, insentif: +p.insentif, catatan: p.client });
    });
    var ri = Object.keys(riBy).map(function (k) {
      var st = riBy[k];
      var cl = Object.keys(st.clients).map(function (cid) {
        var c = st.clients[cid];
        c.lines.sort(function (a, b) { return a.periode < b.periode ? -1 : a.periode > b.periode ? 1 : (a.invoice_no < b.invoice_no ? -1 : 1); });
        c.total = tot(c.lines);
        return c;
      }).sort(function (a, b) { return (a.adj ? 1 : 0) - (b.adj ? 1 : 0) || a.client.localeCompare(b.client); });
      return { kode: k, nama: st.nama, status: (staffBy[k] || {}).status || '', clients: cl, total: tot([].concat.apply([], cl.map(function (c) { return c.lines; }))) };
    }).sort(function (a, b) { return ((staffBy[a.kode] || {}).urutan || 99) - ((staffBy[b.kode] || {}).urutan || 99); });

    var staff = PS.map(function (x) {
      var rek = rekBy[x.kode] ? Object.keys(rekBy[x.kode]).map(function (k) { return rekBy[x.kode][k]; }) : [];
      rek.sort(function (a, b) { return a.client.localeCompare(b.client); });
      var o = JSON.parse(JSON.stringify(x));
      var nb = U.idx(Engine.newAccounts(P, x.kode, rek.map(function (r) { return r.client_id; })), function (z) { return z.client_id; });
      rek.forEach(function (r) { if (nb[r.client_id]) { r.baru = true; r.dari = nb[r.client_id].dari; } });
      o.rekanan = rek;
      var seenB = {};
      o.akun_baru_list = rek.filter(function (r) { if (!r.baru || seenB[r.client_id]) return false; seenB[r.client_id] = 1; return true; })
        .map(function (r) { return r.client + (r.dari ? ' (peralihan dari ' + r.dari + ')' : ''); });
      return o;
    });

    var issues = DB.get('Issues').filter(function (i) { return i.periode === P; }).map(function (i) {
      var o = JSON.parse(JSON.stringify(i)); try { o.data = JSON.parse(i.data); } catch (e) { o.data = {}; } return o;
    });

    return {
      periode: P, label: U.periodeLabel(P), bulanSales: U.bulanNama(P), bulanBayar: U.bulanNama(U.addMonth(P, 1)),
      tglSurat: per.tgl_surat || '', org: S.org, docNo: S.doc_no, signers: S.signers,
      periodeRow: per, group: { omzet: per.omzet, target: per.target, gra: per.gra, gaf: per.gaf },
      staff: staff, ri: ri,
      riborar: staff.filter(function (s) { return s.cair || s.status === 'AKTIF'; }).map(function (s) { return { kode: s.kode, nama: s.nama, cair: s.cair, status: s.status }; }),
      totalCair: U.sum(payP, function (p) { return +p.insentif; }),
      totalTerbentuk: U.sum(staff, function (s) { return s.terbentuk; }),
      issues: issues, approvals: approvals(P), tiers: Engine.tiers(P),
      generated: U.nowISO(),
      computedAt: per.computed_at || '' /* tanggal tombol Hitung diklik (tetap sampai dihitung ulang) */
    };
  }

  function tot(ls) {
    return {
      saldo_awal: U.sum(ls, function (l) { return l.saldo_awal; }), sales: U.sum(ls, function (l) { return l.sales; }),
      bayar: U.sum(ls, function (l) { return l.bayar; }), saldo_akhir: U.sum(ls, function (l) { return l.saldo_akhir; }),
      insentif: U.sum(ls, function (l) { return l.insentif; })
    };
  }

  function approvals(P) {
    return DB.get('Approvals').filter(function (a) { return a.periode === P; })
      .sort(function (a, b) { return a.pada < b.pada ? -1 : 1; });
  }

  /* ---- arsip JSON di sheet Snapshots (dipotong per 40rb karakter) ---- */
  function saveSnapshot(P, obj) {
    var s = JSON.stringify(obj), parts = [], size = 40000;
    for (var i = 0; i < s.length; i += size) parts.push({ periode: P, part: parts.length, chunk: s.slice(i, i + size) });
    DB.set('Snapshots', DB.get('Snapshots').filter(function (x) { return x.periode !== P; }).concat(parts));
  }
  function loadSnapshot(P) {
    var parts = DB.get('Snapshots').filter(function (x) { return x.periode === P; }).sort(function (a, b) { return a.part - b.part; });
    if (!parts.length) return null;
    try { return JSON.parse(parts.map(function (p) { return p.chunk; }).join('')); } catch (e) { return null; }
  }
  function deleteSnapshot(P) { DB.set('Snapshots', DB.get('Snapshots').filter(function (x) { return x.periode !== P; })); }

  /** Draft email resume untuk direksi (format seperti email HR selama ini) */
  function resume(rep) {
    var S = Engine.settings();
    var L = [];
    L.push('Yth.');
    L.push('Direktur dan semua rekan manager yang saya hormati');
    L.push('di tempat');
    L.push('');
    L.push('Terlampir perhitungan insentif periode ' + rep.label + '.');
    var sg = (rep.signers || []).slice(1).map(function (s) { return s.jabatan; });
    L.push('Mohon persetujuan perhitungan ini secara berurutan: ' + sg.join(' → ') + '.');
    L.push('');
    L.push('Resume singkat:');
    rep.staff.filter(function (s) { return s.status === 'AKTIF'; }).forEach(function (s) {
      if (s.akun_baru_list && s.akun_baru_list.length)
        L.push('- ' + s.kode + ' ada tambahan ' + s.akun_baru_list.length + ' account baru : ' + s.akun_baru_list.join(', '));
    });
    rep.staff.filter(function (s) { return s.status === 'AKTIF' && s.target; }).forEach(function (s) {
      var now = s.target ? s.omzet / s.target : 0, prev = s.target ? s.omzet_lalu / s.target : 0;
      var ratio = s.omzet_lalu ? (s.omzet - s.omzet_lalu) / s.omzet_lalu : 0;
      L.push('- ' + s.kode + ' (target ' + Math.round(s.target / 1e6) + 'jt) pencapaian omzet ' + pct(now) + ', omzet bulan lalu ' + pct(prev) +
        ', selisih ' + pct(now - prev) + ', rasio kenaikan omzet dibanding bulan lalu ' + pct(ratio));
    });
    var resign = rep.ri.filter(function (r) { return r.status === 'RESIGN' && r.total.saldo_akhir > 0.5; });
    if (resign.length) {
      L.push('');
      L.push('*Note');
      resign.forEach(function (r) { L.push('Rincian ' + r.nama + ' (resign) masih ditampilkan karena ada tagihan yang belum lunas: ' + Engine.fmt(r.total.saldo_akhir) + '.'); });
    }
    L.push('');
    L.push('Total insentif yang dicairkan (berdasarkan pembayaran klien): ' + Engine.fmt(rep.totalCair) + '.');
    L.push('Mohon dibalas melalui email ini jika ada koreksi atau hal yang tidak sesuai.');
    L.push('');
    L.push('Terima kasih atas perhatiannya.');
    L.push('Hormat saya,');
    L.push(((S.signers || [])[0] || {}).nama || '');
    L.push(((S.signers || [])[0] || {}).jabatan || '');
    return L.join('\n');
  }
  function pct(x) { return Math.round((x || 0) * 100) + '%'; }

  return { build: build, approvals: approvals, saveSnapshot: saveSnapshot, loadSnapshot: loadSnapshot, deleteSnapshot: deleteSnapshot, resume: resume, tot: tot };
})();

/* ---- Api.gs ---- */
/* =====================================================================
 * Api.gs — router aksi, login, hak akses, approval, master data, data awal
 * Murni JS: membutuhkan objek global DB (penyimpanan), SESS (sesi) dan
 * HOOKS (opsional: notifikasi email) dari Main.gs / demo.
 * ===================================================================== */
var Api = (function () {

  /* ---------------------------- helper ---------------------------- */
  function ok(data) { return { ok: true, data: data }; }
  function fail(msg) { return { ok: false, error: String(msg && msg.message ? msg.message : msg) }; }
  function hashPass(salt, pass) { var h = salt + '|' + pass; for (var i = 0; i < 150; i++) h = U.sha256(h + salt); return h; }
  function roles(u) { return String(u.role || '').split(',').map(function (r) { return r.trim(); }).filter(String); }
  function hasRole(u, r) { return roles(u).indexOf(r) >= 0; }
  function need(u, list) {
    if (!list.some(function (r) { return hasRole(u, r); })) throw new Error('Akses ditolak. Fitur ini butuh peran: ' + list.join(' / '));
  }
  function audit(u, aksi, periode, detail) {
    DB.append('Audit', [{ pada: U.nowISO(), username: u ? u.username : '-', aksi: aksi, periode: periode || '', detail: typeof detail === 'string' ? detail : JSON.stringify(detail || {}) }]);
  }
  function setting(key, val) {
    var S = DB.get('Settings');
    var row = S.filter(function (r) { return r.key === key; })[0];
    if (!row) { row = { key: key, value: '' }; S.push(row); }
    row.value = JSON.stringify(val);
    DB.dirty('Settings');
  }
  function periodRow(P) { return DB.get('Periods').filter(function (x) { return x.periode === P; })[0]; }
  function assertEditable(P) {
    var p = periodRow(P);
    if (p && ['PROSES', 'DISETUJUI', 'ARSIP'].indexOf(p.status) >= 0)
      throw new Error('Periode ' + U.bulanNama(P) + ' terkunci (' + p.status + '). Batalkan persetujuan dulu jika perlu mengubah.');
  }
  function publicUser(u) { return { username: u.username, nama: u.nama, jabatan: u.jabatan, email: u.email, role: roles(u), aktif: u.aktif }; }

  /* ------------------------- setup awal ------------------------- */
  function ensureDefaults() {
    if (!DB.get('Settings').length) {
      Object.keys(CFG.DEFAULT_SETTINGS).forEach(function (k) { setting(k, CFG.DEFAULT_SETTINGS[k]); });
    }
    if (!DB.get('Staff').length) { DB.set('Staff', CFG.DEFAULT_STAFF.map(function (s) { var o = {}; CFG.TABLES.Staff.forEach(function (c) { o[c] = s[c] === undefined ? '' : s[c]; }); return o; })); }
    if (!DB.get('RateTiers').length) { DB.set('RateTiers', CFG.DEFAULT_TIERS.map(function (t) { return { jenis: t.jenis, min: t.min, nilai: t.nilai, label: t.label, berlaku_mulai: '0000-00' }; })); }
    if (!DB.get('Users').length) {
      var salt = U.uid('S');
      DB.set('Users', [{ username: 'admin', nama: 'Administrator', jabatan: 'Admin Sistem', email: '', role: 'ADMIN', salt: salt, pass_hash: hashPass(salt, 'admin123'), aktif: true, dibuat: U.nowISO(), login_terakhir: '' }]);
    }
  }

  /* ----------------------------- auth ----------------------------- */
  function login(p) {
    var u = DB.get('Users').filter(function (x) { return String(x.username).toLowerCase() === String(p.username || '').toLowerCase().trim(); })[0];
    if (!u || u.aktif === false || u.aktif === 'FALSE') throw new Error('Username atau password salah.');
    if (hashPass(u.salt, p.password || '') !== u.pass_hash) throw new Error('Username atau password salah.');
    var token = U.sha256(U.uid('T') + u.username + Math.random());
    SESS.put(token, u.username);
    u.login_terakhir = U.nowISO(); DB.dirty('Users');
    audit(u, 'LOGIN', '', '');
    return { token: token, user: publicUser(u), mustChange: p.password === 'admin123' };
  }
  function userFromToken(token) {
    var un = token ? SESS.get(token) : null;
    if (!un) return null;
    var u = DB.get('Users').filter(function (x) { return x.username === un; })[0];
    return u && u.aktif !== false && u.aktif !== 'FALSE' ? u : null;
  }

  /* --------------------------- bootstrap --------------------------- */
  function bootstrap(u) {
    var S = Engine.settings();
    return {
      user: publicUser(u), settings: { org: S.org, doc_no: S.doc_no, signers: S.signers, apd_marker: S.apd_marker, app_url: S.app_url, email_notif: S.email_notif, increment_over_target: S.increment_over_target, pembulatan_rate: S.pembulatan_rate },
      staff: DB.get('Staff'), periods: DB.get('Periods'), roles: CFG.ROLES, version: CFG.VERSION, tiers: DB.get('RateTiers')
    };
  }

  /* --------------------------- dashboard --------------------------- */
  function dashboard(p) {
    var periods = DB.get('Periods').slice().sort(function (a, b) { return a.periode < b.periode ? -1 : 1; });
    var P = p.periode || (periods.length ? periods[periods.length - 1].periode : null);
    var PS = DB.get('PeriodStaff');
    var trend = periods.map(function (x) {
      return { periode: x.periode, omzet: x.omzet, target: x.target, gra: x.gra, gaf: x.gaf, terbentuk: x.terbentuk, cair: x.cair, piutang: x.piutang, status: x.status };
    });
    var staffTrend = {};
    PS.forEach(function (r) { (staffTrend[r.kode] = staffTrend[r.kode] || []).push({ periode: r.periode, omzet: r.omzet, pra: r.pra, cair: r.cair, rate: r.rate }); });
    return {
      periode: P, period: P ? periodRow(P) : null,
      staff: PS.filter(function (r) { return r.periode === P; }),
      trend: trend, staffTrend: staffTrend, aging: aging({ asOf: P }),
      /* periode sebelum buku piutang aktif (saldo awal): pakai piutang akhir yang tersimpan di arsip */
      arsip: !!P && !DB.get('Lines').some(function (l) { return l.asal <= P; }),
      piutangArsip: P && periodRow(P) ? (periodRow(P).piutang || 0) : 0,
      issues: P ? DB.get('Issues').filter(function (i) { return i.periode === P; }).length : 0,
      approvals: P ? Report.approvals(P) : []
    };
  }

  /* ------------------------ piutang / ledger ------------------------ */
  function monthsDiff(a, b) { return (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7)); }
  function aging(p) {
    var asOf = p.asOf;
    var periods = DB.get('Periods').map(function (x) { return x.periode; }).sort();
    if (!asOf) asOf = periods[periods.length - 1];
    if (!asOf) return { asOf: null, buckets: [], clients: [], total: 0 };
    var lines = DB.get('Lines').filter(function (l) { return l.asal <= asOf; });
    var paid = {};
    DB.get('Payments').forEach(function (x) { if (x.periode <= asOf) paid[x.line_id] = (paid[x.line_id] || 0) + (+x.nilai); });
    var staffBy = U.idx(DB.get('Staff'), function (s) { return s.kode; });
    var B = [{ k: '0', label: 'Bulan berjalan', min: 0, max: 0 }, { k: '1', label: '1 bulan', min: 1, max: 1 }, { k: '2', label: '2 bulan', min: 2, max: 2 }, { k: '3-5', label: '3–5 bulan', min: 3, max: 5 }, { k: '6+', label: '≥ 6 bulan', min: 6, max: 9999 }];
    var buckets = B.map(function (b) { return { k: b.k, label: b.label, nilai: 0, tertahan: 0, n: 0 }; });
    var cl = {};
    lines.forEach(function (l) {
      var sisa = l.nilai - (paid[l.line_id] || 0);
      if (sisa < 0.5) return;
      if (p.kode && l.kode !== p.kode) return;
      var age = monthsDiff(l.periode, asOf);
      var bi = 0; B.forEach(function (b, i) { if (age >= b.min && age <= b.max) bi = i; });
      buckets[bi].nilai += sisa; buckets[bi].tertahan += sisa * (l.rate || 0); buckets[bi].n++;
      var c = cl[l.client_id] = cl[l.client_id] || { client_id: l.client_id, client: l.client, kode: l.kode, staf: (staffBy[l.kode] || {}).nama || '-', sisa: 0, tertahan: 0, n: 0, tertua: l.periode, b: [0, 0, 0, 0, 0] };
      c.sisa += sisa; c.tertahan += sisa * (l.rate || 0); c.n++; c.b[bi] += sisa;
      if (l.periode < c.tertua) c.tertua = l.periode;
    });
    var clients = Object.keys(cl).map(function (k) { return cl[k]; }).sort(function (a, b) { return b.sisa - a.sisa; });
    return { asOf: asOf, buckets: buckets, clients: clients, total: U.sum(clients, function (c) { return c.sisa; }), tertahan: U.sum(clients, function (c) { return c.tertahan; }) };
  }
  function clientDetail(p) {
    var c = DB.get('Clients').filter(function (x) { return x.id === p.id; })[0];
    if (!c) throw new Error('Klien tidak ditemukan');
    var lines = DB.get('Lines').filter(function (l) { return l.client_id === c.id; }).sort(function (a, b) { return a.periode < b.periode ? -1 : 1; });
    var pays = DB.get('Payments').filter(function (x) { return x.client_id === c.id; }).sort(function (a, b) { return a.tanggal < b.tanggal ? -1 : 1; });
    var hist = DB.get('PicHistory').filter(function (h) { return h.client_id === c.id; }).sort(function (a, b) { return a.mulai < b.mulai ? -1 : 1; });
    return { client: c, lines: lines, payments: pays, pic: hist };
  }
  function clients(p) {
    var PIC = Engine.picMap(p.periode || '9999-99');
    var sisa = {};
    DB.get('Lines').forEach(function (l) { if (l.sisa > 0.5) sisa[l.client_id] = (sisa[l.client_id] || 0) + l.sisa; });
    return DB.get('Clients').map(function (c) {
      return { id: c.id, nama: c.nama, segmen: c.segmen, bp_code: c.bp_code, alias: c.alias, first_periode: c.first_periode, kode: PIC[c.id] || '', sisa: sisa[c.id] || 0, catatan: c.catatan };
    });
  }

  /* --------------------------- import data --------------------------- */
  function importStaging(u, p) {
    var P = p.periode, jenis = p.jenis;
    if (!/^\d{4}-\d{2}$/.test(P || '')) throw new Error('Periode tidak valid.');
    assertEditable(P);
    var n = 0, total = 0;
    if (jenis === 'SALES') {
      var rows = (p.data.lines || []).map(function (l) { total += +l.nilai || 0; return { periode: P, segmen: l.segmen, client: l.client, label: l.label, nilai: +l.nilai, cek: !!l.cek, marker: l.marker || '', row: l.row || 0 }; });
      DB.set('StgSales', DB.get('StgSales').filter(function (x) { return x.periode !== P; }).concat(rows)); n = rows.length;
    } else if (jenis === 'AR') {
      var ar = (p.data.rows || []).map(function (r) {
        total += +r.bayar || 0;
        return { periode: P, row: r.row, tanggal: r.tanggal, tipe: r.tipe, invoice: r.invoice, receipt: r.receipt, ref: r.ref, code: r.code, client: r.client, cust_type: r.custType, saldo_awal: r.saldoAwal, sales: r.sales, bayar: r.bayar, saldo_akhir: r.saldoAkhir };
      });
      DB.set('StgAR', DB.get('StgAR').filter(function (x) { return x.periode !== P; }).concat(ar)); n = ar.length;
      // simpan kode Business Partner ke master klien bila namanya cocok
      var cix = Engine.clientIndex();
      ar.forEach(function (r) { var c = cix[U.norm(r.client)]; if (c && r.code && !c.bp_code) { c.bp_code = r.code; DB.dirty('Clients'); } });
    } else if (jenis === 'CALL') {
      need(u, ['ADMIN']);
      var cr = [];
      (p.data.claims || []).forEach(function (c) { total += +c.omzet || 0; cr.push({ periode: P, tipe: 'KLAIM', staf: c.staf, client: c.client, omzet: +c.omzet || 0, calls: 0, call_target: 0, omzet_lalu: 0, extra: '' }); });
      (p.data.staff || []).forEach(function (s) {
        var v = (p.data.visits || {});
        var vk = Object.keys(v).filter(function (k) { return U.norm(s.staf).indexOf(U.norm(k)) === 0 || U.norm(k).indexOf(U.norm(s.staf).split(' ')[0]) === 0; })[0];
        cr.push({ periode: P, tipe: 'STAF', staf: s.staf, client: '', omzet: +s.total || 0, calls: +s.calls || 0, call_target: +s.callTarget || 0, omzet_lalu: +s.omzetLalu || 0, extra: JSON.stringify({ apd: s.apd, apl: s.apl, app: s.app, target: s.target, kunjungan: vk ? v[vk] : null }) });
      });
      DB.set('StgCall', DB.get('StgCall').filter(function (x) { return x.periode !== P; }).concat(cr)); n = cr.length;
    } else throw new Error('Jenis import tidak dikenal: ' + jenis);
    var per = periodRow(P);
    if (!per) {
      DB.get('Periods').push({ periode: P, status: 'DRAFT', step: 0, tgl_surat: '', computed_at: '', computed_by: '', data_hash: '', omzet: 0, target: 0, gra: 0, gaf: 0, terbentuk: 0, cair: 0, piutang: 0, n_error: 0, n_warn: 0, catatan: '', sumber: 'SISTEM' });
      DB.dirty('Periods');
    } else if (per.status === 'DIHITUNG') { per.status = 'DRAFT'; DB.dirty('Periods'); }
    DB.append('Imports', [{ id: U.uid('I'), periode: P, jenis: jenis, filename: p.filename || '', baris: n, total: total, oleh: u.username, pada: U.nowISO(), catatan: (p.data.warnings || []).slice(0, 20).join(' | ') }]);
    audit(u, 'IMPORT_' + jenis, P, { file: p.filename, baris: n, total: total });
    return { baris: n, total: total };
  }
  function stagingStatus(p) {
    var P = p.periode;
    var f = function (t) { return DB.get(t).filter(function (x) { return x.periode === P; }); };
    var imp = DB.get('Imports').filter(function (x) { return x.periode === P; }).sort(function (a, b) { return a.pada < b.pada ? 1 : -1; });
    var last = {}; imp.forEach(function (i) { if (!last[i.jenis]) last[i.jenis] = i; });
    var s = f('StgSales'), a = f('StgAR'), c = f('StgCall');
    return {
      SALES: s.length ? { baris: s.length, total: U.sum(s, function (x) { return +x.nilai; }), info: last.SALES } : null,
      AR: a.length ? { baris: a.length, total: U.sum(a, function (x) { return +x.bayar; }), info: last.AR } : null,
      CALL: c.length ? { baris: c.length, total: U.sum(c.filter(function (x) { return x.tipe === 'KLAIM'; }), function (x) { return +x.omzet; }), info: last.CALL } : null
    };
  }

  /* -------------------- keputusan / penyelesaian masalah -------------------- */
  function resolve(u, p) {
    var P = p.periode; assertEditable(P);
    var R = DB.get('Resolutions');
    for (var i = R.length - 1; i >= 0; i--) if (R[i].key === p.key && (R[i].periode === P || R[i].periode === '*')) R.splice(i, 1);
    if (!p.hapus) R.push({ key: p.key, periode: p.global ? '*' : P, jenis: p.jenis, data: JSON.stringify(p.data || {}), oleh: u.username, pada: U.nowISO() });
    DB.dirty('Resolutions');
    // pemetaan nama → simpan juga sebagai alias klien
    if (p.jenis === 'NAMA' && p.data && p.data.client_id && p.data.nama) {
      var c = DB.get('Clients').filter(function (x) { return x.id === p.data.client_id; })[0];
      if (c) { Engine.addAlias(c, p.data.nama); DB.dirty('Clients'); }
    }
    audit(u, 'KEPUTUSAN_' + p.jenis, P, { key: p.key, data: p.data, hapus: !!p.hapus });
    return true;
  }

  /* ---------------------------- approval ---------------------------- */
  function approvalCode(P, step, un, at, hash) { return U.sha256([P, step, un, at, hash].join('|')).slice(0, 12).toUpperCase(); }
  function submit(u, p) {
    need(u, ['ADMIN']);
    var P = p.periode, per = periodRow(P);
    if (!per || per.status !== 'DIHITUNG') throw new Error('Periode harus berstatus DIHITUNG untuk diajukan.');
    var open = DB.get('Issues').filter(function (i) { return i.periode === P && i.level === 'ERROR'; });
    if (open.length) throw new Error('Masih ada ' + open.length + ' masalah (merah) yang belum diselesaikan di halaman Rekonsiliasi.');
    if (Engine.hashPeriode(P) !== per.data_hash) throw new Error('Data berubah sejak terakhir dihitung. Klik "Hitung ulang" dulu.');
    var S = Engine.settings(), sg = S.signers[0];
    if (p.tgl_surat) per.tgl_surat = p.tgl_surat;
    if (!per.tgl_surat) per.tgl_surat = U.nowISO().slice(0, 10);
    sign(u, P, sg, 'AJUKAN', p.catatan, per.data_hash);
    per.status = 'PROSES'; per.step = 1; DB.dirty('Periods');
    audit(u, 'AJUKAN', P, p.catatan || '');
    notify(P, 1);
    return periodRow(P);
  }
  function sign(u, P, sg, aksi, catatan, hash) {
    var at = U.nowISO();
    DB.get('Approvals').push({ periode: P, step: sg.step, label: sg.label, username: u.username, nama: u.nama, jabatan: u.jabatan || sg.jabatan, aksi: aksi, catatan: catatan || '', pada: at, kode: approvalCode(P, sg.step, u.username, at, hash), data_hash: hash, valid: true });
    DB.dirty('Approvals');
  }
  function approve(u, p) {
    var P = p.periode, per = periodRow(P);
    if (!per || per.status !== 'PROSES') throw new Error('Periode ini tidak sedang menunggu persetujuan.');
    var S = Engine.settings(), sg = S.signers[per.step];
    if (!sg) throw new Error('Langkah persetujuan tidak dikenal.');
    if (!hasRole(u, sg.role)) throw new Error('Langkah ini (' + sg.label.replace(/,\s*$/, '') + ' — ' + sg.jabatan + ') bukan bagian Anda.');
    if (Engine.hashPeriode(P) !== per.data_hash) throw new Error('Data perhitungan berubah setelah diajukan. Hubungi Admin HR.');
    if (p.tolak) {
      sign(u, P, sg, 'TOLAK', p.catatan, per.data_hash);
      DB.get('Approvals').forEach(function (a) { if (a.periode === P && a.aksi !== 'TOLAK') a.valid = false; });
      per.status = 'DIHITUNG'; per.step = 0; DB.dirty('Periods');
      audit(u, 'TOLAK', P, p.catatan || '');
      notify(P, 0, 'TOLAK', p.catatan);
      return periodRow(P);
    }
    sign(u, P, sg, 'SETUJU', p.catatan, per.data_hash);
    per.step = per.step + 1;
    if (per.step >= S.signers.length) {
      per.status = 'DISETUJUI';
      DB.dirty('Periods');
      Report.saveSnapshot(P, Report.build(P, { live: true }));
      audit(u, 'DISETUJUI_FINAL', P, '');
      notify(P, -1, 'FINAL');
    } else {
      DB.dirty('Periods');
      audit(u, 'SETUJU', P, sg.label);
      notify(P, per.step);
    }
    return periodRow(P);
  }
  function reopen(u, p) {
    need(u, ['ADMIN']);
    var P = p.periode, per = periodRow(P);
    if (!per || (per.status !== 'DISETUJUI' && per.status !== 'PROSES')) throw new Error('Hanya periode yang sedang/sudah disetujui yang bisa dibuka kembali.');
    if (!p.alasan) throw new Error('Isi alasan pembukaan kembali.');
    var later = DB.get('Periods').filter(function (x) { return x.periode > P && x.status !== 'DRAFT'; });
    if (later.length) throw new Error('Tidak bisa dibuka: periode ' + U.bulanNama(later[0].periode) + ' sudah dihitung berdasarkan saldo periode ini.');
    DB.get('Approvals').forEach(function (a) { if (a.periode === P) a.valid = false; });
    DB.dirty('Approvals');
    Report.deleteSnapshot(P);
    per.status = 'DIHITUNG'; per.step = 0; DB.dirty('Periods');
    audit(u, 'BUKA_KEMBALI', P, p.alasan);
    return periodRow(P);
  }
  function verify(p) {
    var code = String(p.kode || '').toUpperCase().trim();
    var a = DB.get('Approvals').filter(function (x) { return x.kode === code; })[0];
    if (!a) return { found: false };
    var per = periodRow(a.periode) || {};
    return {
      found: true, periode: a.periode, label: U.periodeLabel(a.periode), langkah: a.label, nama: a.nama, jabatan: a.jabatan, aksi: a.aksi, pada: a.pada,
      valid: (a.valid === true || a.valid === 'TRUE') && a.data_hash === per.data_hash, status: per.status
    };
  }
  function notify(P, step, kind, note) {
    if (typeof HOOKS === 'undefined' || !HOOKS.notify) return;
    try {
      var S = Engine.settings();
      if (!S.email_notif) return;
      var to = [];
      if (kind === 'FINAL' || kind === 'TOLAK') {
        to = DB.get('Users').filter(function (x) { return hasRole(x, 'ADMIN') && x.email; }).map(function (x) { return x.email; });
      } else {
        var sg = S.signers[step];
        to = DB.get('Users').filter(function (x) { return sg && hasRole(x, sg.role) && x.email && x.aktif !== false; }).map(function (x) { return x.email; });
      }
      if (to.length) HOOKS.notify({ to: to, periode: P, label: U.periodeLabel(P), step: step, kind: kind || 'NEXT', note: note || '', url: S.app_url });
    } catch (e) { /* notifikasi gagal tidak menghentikan proses */ }
  }

  /* ---------------------------- master data ---------------------------- */
  function saveStaff(u, p) {
    need(u, ['ADMIN']);
    var L = DB.get('Staff'), s = p.staff;
    if (!s.kode || !s.nama) throw new Error('Kode dan nama staf wajib diisi.');
    s.kode = String(s.kode).toUpperCase().trim();
    if (s.email !== undefined) parseMails(s.email, 'email staf');
    if (s.cc !== undefined) parseMails(s.cc, 'cc staf');
    var cur = L.filter(function (x) { return x.kode === s.kode; })[0];
    if (cur) Object.keys(s).forEach(function (k) { if (CFG.TABLES.Staff.indexOf(k) >= 0) cur[k] = s[k]; });
    else { var o = {}; CFG.TABLES.Staff.forEach(function (c) { o[c] = s[c] === undefined ? '' : s[c]; }); L.push(o); }
    DB.dirty('Staff');
    audit(u, 'SIMPAN_STAF', '', s);
    return DB.get('Staff');
  }
  function saveTarget(u, p) {
    need(u, ['ADMIN']);
    var T = DB.get('Targets');
    for (var i = T.length - 1; i >= 0; i--) if (T[i].kode === p.kode && T[i].periode === p.periode) T.splice(i, 1);
    if (p.target !== null && p.target !== '' && p.target !== undefined) T.push({ periode: p.periode, kode: p.kode, target: +p.target });
    DB.dirty('Targets');
    audit(u, 'TARGET', p.periode, p);
    return DB.get('Targets');
  }
  /** Periode terakhir yang sudah terkunci (PROSES/DISETUJUI/ARSIP). PIC tidak boleh diubah ke bulan di bawah atau sama dengan ini. */
  function lastLockedPeriod() {
    var L = DB.get('Periods').filter(function (x) { return ['PROSES', 'DISETUJUI', 'ARSIP'].indexOf(x.status) >= 0; })
      .map(function (x) { return x.periode; }).sort();
    return L.length ? L[L.length - 1] : '';
  }
  function assertMulai(mulai) {
    if (!/^\d{4}-\d{2}$/.test(mulai || '')) throw new Error('Bulan mulai tidak valid.');
    var lock = lastLockedPeriod();
    if (lock && mulai <= lock) throw new Error('Bulan mulai harus setelah ' + U.bulanNama(lock) + ', karena periode itu sudah terkunci.');
  }
  /** Data untuk dialog oper klien: periode terkunci terakhir, staf aktif, dan daftar klien beserta PIC saat ini */
  function handoverInfo(u, p) {
    need(u, ['ADMIN']);
    var lock = lastLockedPeriod();
    return {
      lastLocked: lock,
      nextDefault: lock ? U.addMonth(lock, 1) : U.nowISO().slice(0, 7),
      staff: DB.get('Staff').filter(function (x) { return x.status === 'AKTIF'; }).map(function (x) { return { kode: x.kode, nama: x.nama }; }),
      clients: clients({})
    };
  }
  /** Oper klien dari satu staf ke staf lain. Massal = banyak klien sekaligus, per satuan = satu klien. Berlaku mulai bulan sales tertentu. */
  function handover(u, p) {
    need(u, ['ADMIN']);
    var dari = String(p.dari || '').toUpperCase(), ke = String(p.ke || '').toUpperCase();
    if (!dari || !ke || dari === ke) throw new Error('Pilih staf asal dan staf tujuan yang berbeda.');
    var tujuan = DB.get('Staff').filter(function (x) { return x.kode === ke && x.status === 'AKTIF'; })[0];
    if (!tujuan) throw new Error('Staf tujuan harus berstatus Aktif.');
    var ids = p.ids || [];
    if (!ids.length) throw new Error('Pilih minimal satu klien.');
    assertMulai(p.mulai);
    var PIC = Engine.picMap('9999-99');
    var namaKlien = {};
    DB.get('Clients').forEach(function (c) { namaKlien[c.id] = c.nama; });
    var pindah = [], dilewati = [];
    ids.forEach(function (id) {
      if (!namaKlien[id]) return;
      if (PIC[id] !== dari) { dilewati.push(namaKlien[id]); return; }
      Engine.setPic(id, ke, p.mulai, 'OPER', u.username, p.catatan || ('Oper dari ' + dari + ' ke ' + ke));
      pindah.push(namaKlien[id]);
    });
    audit(u, 'OPER_KLIEN', p.mulai, { dari: dari, ke: ke, jumlah: pindah.length, klien: pindah, dilewati: dilewati });
    return { jumlah: pindah.length, dilewati: dilewati };
  }

  function saveClient(u, p) {
    need(u, ['ADMIN']);
    var c = p.client;
    var L = DB.get('Clients');
    var cur = c.id ? L.filter(function (x) { return x.id === c.id; })[0] : null;
    if (!cur) cur = Engine.createClient(c.nama, c.segmen, c.first_periode || '');
    ['nama', 'segmen', 'bp_code', 'alias', 'catatan', 'first_periode'].forEach(function (k) { if (c[k] !== undefined) cur[k] = c[k]; });
    DB.dirty('Clients');
    if (p.pic && p.pic.mulai) { assertMulai(p.pic.mulai); Engine.setPic(cur.id, p.pic.kode || '', p.pic.mulai, 'MANUAL', u.username, p.pic.catatan || ''); }
    audit(u, 'SIMPAN_KLIEN', '', { id: cur.id, nama: cur.nama, pic: p.pic || null });
    return cur;
  }
  function mergeClient(u, p) {
    need(u, ['ADMIN']);
    var L = DB.get('Clients');
    var from = L.filter(function (x) { return x.id === p.from; })[0], to = L.filter(function (x) { return x.id === p.to; })[0];
    if (!from || !to || from === to) throw new Error('Klien sumber/tujuan tidak valid.');
    Engine.addAlias(to, from.nama);
    String(from.alias || '').split('|').filter(String).forEach(function (a) { Engine.addAlias(to, a); });
    DB.get('Lines').forEach(function (l) { if (l.client_id === from.id) { l.client_id = to.id; } });
    DB.get('Payments').forEach(function (x) { if (x.client_id === from.id) { x.client_id = to.id; } });
    DB.get('PicHistory').forEach(function (h) { if (h.client_id === from.id) h.client_id = to.id; });
    if (from.first_periode && (!to.first_periode || from.first_periode < to.first_periode)) to.first_periode = from.first_periode;
    DB.set('Clients', L.filter(function (x) { return x.id !== from.id; }));
    ['Lines', 'Payments', 'PicHistory'].forEach(function (t) { DB.dirty(t); });
    audit(u, 'GABUNG_KLIEN', '', { dari: from.nama, ke: to.nama });
    return to;
  }
  function saveTiers(u, p) {
    need(u, ['ADMIN']);
    var v = p.berlaku_mulai || '0000-00';
    var keep = DB.get('RateTiers').filter(function (t) { return (t.berlaku_mulai || '0000-00') !== v; });
    var add = (p.tiers || []).map(function (t) { return { jenis: t.jenis, min: +t.min, nilai: +t.nilai, label: t.label || '', berlaku_mulai: v }; });
    DB.set('RateTiers', keep.concat(add));
    audit(u, 'SIMPAN_RATE', v, add);
    return DB.get('RateTiers');
  }
  function saveSettings(u, p) {
    need(u, ['ADMIN']);
    if (p.settings && p.settings.mail) { parseMails(p.settings.mail.global_to, 'Kepada rekap global'); parseMails(p.settings.mail.global_cc, 'Cc rekap global'); }
    Object.keys(p.settings || {}).forEach(function (k) { if (CFG.DEFAULT_SETTINGS[k] !== undefined) setting(k, p.settings[k]); });
    audit(u, 'SIMPAN_PENGATURAN', '', Object.keys(p.settings || {}));
    return Engine.settings();
  }
  function saveUser(u, p) {
    need(u, ['ADMIN']);
    var L = DB.get('Users'), x = p.user;
    if (!x.username) throw new Error('Username wajib diisi.');
    var cur = L.filter(function (y) { return y.username === x.username; })[0];
    if (!cur) {
      if (!x.password) throw new Error('Password awal wajib diisi untuk user baru.');
      cur = { username: String(x.username).toLowerCase().trim(), dibuat: U.nowISO(), login_terakhir: '' };
      L.push(cur);
    }
    ['nama', 'jabatan', 'email'].forEach(function (k) { if (x[k] !== undefined) cur[k] = x[k]; });
    if (x.role !== undefined) cur.role = Array.isArray(x.role) ? x.role.join(',') : x.role;
    if (x.aktif !== undefined) cur.aktif = !!x.aktif;
    if (x.password) { cur.salt = U.uid('S'); cur.pass_hash = hashPass(cur.salt, x.password); }
    DB.dirty('Users');
    audit(u, 'SIMPAN_USER', '', { username: cur.username, role: cur.role });
    return DB.get('Users').map(publicUser);
  }
  function changePassword(u, p) {
    if (hashPass(u.salt, p.lama || '') !== u.pass_hash) throw new Error('Password lama salah.');
    if (!p.baru || String(p.baru).length < 6) throw new Error('Password baru minimal 6 karakter.');
    u.salt = U.uid('S'); u.pass_hash = hashPass(u.salt, p.baru); DB.dirty('Users');
    audit(u, 'GANTI_PASSWORD', '', '');
    return true;
  }

  /* ------------------------ data awal dari file lama ------------------------ */
  function tglFromText(t) {
    var m = String(t || '').match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (!m) return '';
    var bi = U.BULAN.map(function (b) { return b.toUpperCase(); }).indexOf(m[2].toUpperCase());
    return bi < 0 ? '' : m[3] + '-' + U.pad(bi + 1) + '-' + U.pad(+m[1]);
  }
  /* --------------------------- email --------------------------- */
  /** "a@x.com, b@y.com" → ['a@x.com','b@y.com'] (huruf kecil, tanpa duplikat). Alamat yang salah → error. */
  function parseMails(str, label) {
    var out = [], seen = {};
    String(str || '').split(/[,;\n\r]+/).forEach(function (x) {
      x = x.trim().toLowerCase();
      if (!x || seen[x]) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)) throw new Error('Alamat email tidak valid: ' + x + (label ? ' (' + label + ')' : ''));
      seen[x] = 1; out.push(x);
    });
    return out;
  }
  /** Penerima akhir: cc yang sama dengan penerima utama dibuang. */
  function recipients(to, cc, label) {
    var T = parseMails(to, 'Kepada ' + label), C = parseMails(cc, 'Cc ' + label);
    return { to: T, cc: C.filter(function (x) { return T.indexOf(x) < 0; }) };
  }
  function htmlEsc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /** Kirim email + lampiran PDF. Mode demo (tanpa MailApp) hanya mensimulasikan. Hasil: true = benar-benar terkirim. */
  function sendMail(o) {
    if (typeof MailApp === 'undefined') return false;
    var opt = {
      to: o.to.join(','), subject: o.subject, htmlBody: o.html, name: 'Sistem Insentif S&M',
      attachments: [Utilities.newBlob(Utilities.base64Decode(o.pdf), 'application/pdf', o.file)]
    };
    if (o.cc.length) opt.cc = o.cc.join(',');
    MailApp.sendEmail(opt);
    return true;
  }
  function logMail(u, P, jenis, kode, rc, file, terkirim) {
    DB.append('MailLog', [{ id: U.uid('M'), periode: P, jenis: jenis, kode: kode || '', to: rc.to.join(', '), cc: rc.cc.join(', '), file: file, oleh: u.username, pada: U.nowISO(), status: terkirim ? 'TERKIRIM' : 'SIMULASI' }]);
    audit(u, terkirim ? 'KIRIM_EMAIL' : 'KIRIM_EMAIL_SIMULASI', P, { jenis: jenis, kode: kode || '', to: rc.to, cc: rc.cc, file: file });
  }
  function periodOf(P) {
    var per = DB.get('Periods').filter(function (x) { return x.periode === P; })[0];
    if (!per) throw new Error('Periode belum ada.');
    return per;
  }
  /** Data untuk dialog kirim email: penerima global, penerima tiap staf, dan riwayat kirim periode ini */
  function mailInfo(u, p) {
    need(u, ['ADMIN']);
    var per = periodOf(p.periode);
    var g = (Engine.settings().mail) || {};
    var staffBy = U.idx(DB.get('Staff'), function (x) { return x.kode; });
    var staff = DB.get('PeriodStaff').filter(function (x) { return x.periode === p.periode && (x.status === 'AKTIF' || +x.cair > 0); })
      .map(function (x) {
        var s = staffBy[x.kode] || {};
        return { kode: x.kode, nama: x.nama, status: x.status, cair: +x.cair || 0, email: s.email || '', cc: s.cc || '' };
      });
    var log = DB.get('MailLog').filter(function (x) { return x.periode === p.periode; }).sort(function (a, b) { return a.pada < b.pada ? 1 : -1; });
    return { status: per.status, global: { to: g.global_to || '', cc: g.global_cc || '' }, staff: staff, log: log };
  }
  /** Langkah 1: rekap global ke direksi (cc manajer & staf Finance). Setelah periode diajukan. */
  function kirimGlobal(u, p) {
    need(u, ['ADMIN']);
    var per = periodOf(p.periode);
    if (per.status !== 'PROSES' && per.status !== 'DISETUJUI') throw new Error('Rekap global hanya bisa dikirim setelah periode diajukan persetujuan.');
    if (!p.pdf || !p.file) throw new Error('Berkas PDF kosong.');
    var g = (Engine.settings().mail) || {};
    var rc = recipients(g.global_to, g.global_cc, 'rekap global');
    if (!rc.to.length) throw new Error('Penerima rekap global belum diisi. Isi di Pengaturan → Penerima email.');
    var rep = Report.build(p.periode);
    var link = Engine.settings().app_url ? '<p><a href="' + Engine.settings().app_url + '#/periode/' + p.periode + '">Buka di Sistem Insentif S&amp;M</a></p>' : '';
    var html = '<div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5;white-space:pre-wrap">' + htmlEsc(Report.resume(rep)) + '</div>' + link;
    var ok = sendMail({ to: rc.to, cc: rc.cc, subject: '[Insentif S&M] Perhitungan insentif ' + rep.label + ' — mohon persetujuan', html: html, pdf: p.pdf, file: p.file });
    logMail(u, p.periode, 'GLOBAL', '', rc, p.file, ok);
    return { terkirim: ok, simulasi: !ok, to: rc.to, cc: rc.cc };
  }
  /** Langkah 2: hasil perhitungan satu staf Sales. Hanya setelah direksi menyetujui. */
  function kirimStaf(u, p) {
    need(u, ['ADMIN']);
    var per = periodOf(p.periode);
    if (per.status !== 'DISETUJUI') throw new Error('Email ke staf hanya bisa dikirim setelah direksi menyetujui periode ini.');
    var st = DB.get('Staff').filter(function (x) { return x.kode === p.kode; })[0];
    if (!st) throw new Error('Staf tidak ditemukan.');
    var rc = recipients(st.email, st.cc, st.nama);
    if (!rc.to.length) throw new Error('Email ' + st.nama + ' belum diisi. Isi dulu di menu Staf & target.');
    if (!p.pdf || !p.file) throw new Error('Berkas PDF kosong.');
    var ps = DB.get('PeriodStaff').filter(function (x) { return x.periode === p.periode && x.kode === p.kode; })[0] || {};
    var html = '<p>Yth. ' + htmlEsc(st.nama) + ',</p><p>Terlampir hasil perhitungan insentif Anda untuk periode <b>' + htmlEsc(U.periodeLabel(p.periode)) + '</b>.</p>' +
      '<p>Insentif yang dicairkan (berdasarkan pembayaran klien): <b>' + htmlEsc(Engine.fmt(+ps.cair || 0)) + '</b>.</p>' +
      '<p>Mohon dibalas melalui email ini jika ada koreksi atau hal yang tidak sesuai. Dokumen ini bersifat rahasia dan hanya untuk yang bersangkutan.</p><p>Terima kasih.</p>';
    var ok = sendMail({ to: rc.to, cc: rc.cc, subject: '[Insentif S&M] Hasil perhitungan insentif ' + U.periodeLabel(p.periode) + ' — ' + st.nama, html: html, pdf: p.pdf, file: p.file });
    logMail(u, p.periode, 'STAF', st.kode, rc, p.file, ok);
    return { terkirim: ok, simulasi: !ok, to: rc.to, cc: rc.cc };
  }
  function importSeed(u, p) {
    need(u, ['ADMIN']);
    var d = p.data, P = d.periode, mode = p.mode || 'ARSIP';
    if (!P) throw new Error('Periode file insentif tidak terbaca.');
    var ex = periodRow(P);
    if (ex && ex.sumber === 'SISTEM' && ex.status !== 'DRAFT') throw new Error('Periode ' + U.bulanNama(P) + ' sudah dihitung oleh sistem — data awal tidak boleh menimpa.');
    var matchStaff = Engine.staffMatcher();
    var staffL = DB.get('Staff');
    var codeFor = function (nama, aktif) {
      var s = matchStaff(nama);
      if (s) return s;
      var ini = String(nama).toUpperCase().replace(/[^A-Z ]/g, '').split(' ').filter(String).map(function (w) { return w[0]; }).join('').slice(0, 3);
      var kode = ini || 'STF', n = 1;
      while (staffL.some(function (x) { return x.kode === kode; })) kode = ini.slice(0, 2) + (++n);
      s = { kode: kode, nama: nama, alias: String(nama).toUpperCase(), target: 0, call_target: 0, status: aktif ? 'AKTIF' : 'RESIGN', keluar_mulai: aktif ? '' : P, urutan: 20 + staffL.length, catatan: 'Dibuat dari data awal ' + U.bulanNama(P) };
      staffL.push(s); DB.dirty('Staff');
      return s;
    };
    var warns = [];
    // blok % Insentif
    var blockBy = {};
    d.blocks.forEach(function (b) { var s = codeFor(b.nama, true); blockBy[s.kode] = b; b.kode = s.kode; });
    var riBy = {};
    d.ri.forEach(function (r) { var s = codeFor(r.staf, !!blockBy[(matchStaff(r.staf) || {}).kode]); riBy[s.kode] = r; r.kode = s.kode; });
    var cairBy = {};
    (d.riborar || []).forEach(function (x) { var s = matchStaff(x.nama); if (s) cairBy[s.kode] = x.nilai; });

    // periode & ringkasan staf
    var Ps = DB.get('Periods').filter(function (x) { return x.periode !== P; });
    var totCair = U.sum(Object.keys(cairBy), function (k) { return cairBy[k]; });
    var terb = U.sum(d.blocks, function (b) { return b.metrics.insentif || 0; });
    var piutangAll = U.sum(d.ri, function (r) { return r.total.saldoAkhir; });
    Ps.push({
      periode: P, status: 'ARSIP', step: 99, tgl_surat: tglFromText(d.tglSurat), computed_at: (tglFromText(d.tglSurat) ? tglFromText(d.tglSurat) + 'T02:00:00.000Z' : U.nowISO()), computed_by: u.username, data_hash: '',
      omzet: d.group.omzet || 0, target: d.group.target || 0, gra: d.group.gra || 0, gaf: d.group.gaf || 0, terbentuk: terb, cair: totCair, piutang: piutangAll,
      n_error: 0, n_warn: 0, catatan: 'Data awal dari file Excel ' + (p.filename || ''), sumber: mode === 'SALDO' ? 'DATA_AWAL' : 'ARSIP_EXCEL'
    });
    DB.set('Periods', Ps.sort(function (a, b) { return a.periode < b.periode ? -1 : 1; }));
    var prevPS = U.idx(DB.get('PeriodStaff').filter(function (x) { return x.periode === U.addMonth(P, -1); }), function (x) { return x.kode; });
    var psRows = [];
    var kodes = {}; Object.keys(blockBy).concat(Object.keys(riBy)).forEach(function (k) { kodes[k] = 1; });
    Object.keys(kodes).forEach(function (k) {
      var b = blockBy[k], r = riBy[k], m = b ? b.metrics : {};
      var piu = r ? r.total.saldoAkhir : 0, cair = cairBy[k] || (r ? r.total.insentif : 0);
      if (!b && !piu && !cair) return;
      psRows.push({
        periode: P, kode: k, nama: (staffL.filter(function (s) { return s.kode === k; })[0] || {}).nama, status: b ? 'AKTIF' : 'RESIGN',
        target: m.target || 0, omzet: m.omzet || 0, omzet_apl: 0, omzet_app: 0, omzet_apd: 0, klaim: m.omzet || 0, pra: m.pra || 0, pir: m.pir || 0,
        gaf: m.gaf || 0, rate: m.rate || 0, terbentuk: m.insentif || 0, cair: cair, calls: 0, call_target: 0, akun_baru: 0,
        omzet_lalu: prevPS[k] ? prevPS[k].omzet : 0, piutang: piu, n_rekanan: b ? b.rekanan.length : 0
      });
    });
    DB.set('PeriodStaff', DB.get('PeriodStaff').filter(function (x) { return x.periode !== P; }).concat(psRows));

    // arsip laporan (bentuk sama dengan Report.build)
    var S = Engine.settings();
    var snap = {
      periode: P, label: U.periodeLabel(P), bulanSales: U.bulanNama(P), bulanBayar: U.bulanNama(U.addMonth(P, 1)), tglSurat: tglFromText(d.tglSurat),
      org: S.org, docNo: S.doc_no, signers: S.signers, group: d.group, arsipExcel: true, sumberFile: p.filename || '',
      staff: psRows.map(function (x) {
        var b = blockBy[x.kode]; var o = JSON.parse(JSON.stringify(x));
        o.rekanan = b ? b.rekanan.map(function (rk) { return { client: rk.client, segmen: '', omzet: rk.omzet }; }) : [];
        o.akun_baru_list = [];
        return o;
      }),
      ri: d.ri.filter(function (r) { return r.lines.length; }).map(function (r) {
        var cl = U.by(r.lines, function (l) { return l.client; });
        var clients = Object.keys(cl).map(function (cn) {
          var ls = cl[cn].map(function (l) { return { invoice_no: l.label, periode: l.periode || P, saldo_awal: l.saldoAwal, sales: l.sales, bayar: l.bayar, saldo_akhir: l.saldoAkhir, rate: l.rate, insentif: l.insentif, catatan: l.catatan }; });
          return { client: cn, lines: ls, total: Report.tot(ls) };
        });
        var all = [].concat.apply([], clients.map(function (c) { return c.lines; }));
        return { kode: r.kode, nama: (staffL.filter(function (s) { return s.kode === r.kode; })[0] || {}).nama || r.staf, status: blockBy[r.kode] ? 'AKTIF' : 'RESIGN', clients: clients, total: Report.tot(all) };
      }),
      riborar: psRows.map(function (x) { return { kode: x.kode, nama: x.nama, cair: x.cair, status: x.status }; }),
      totalCair: totCair, totalTerbentuk: terb, issues: [], approvals: [], generated: U.nowISO()
    };
    Report.saveSnapshot(P, snap);

    var nLines = 0, nClients = 0;
    if (mode === 'SALDO') {
      // klien, PIC, baris tagihan & pembayaran bulan itu
      var cix = Engine.clientIndex();
      var getClient = function (nama, seg) {
        var c = cix[U.norm(nama)];
        if (!c) { c = Engine.createClient(nama, seg || '', ''); cix[U.norm(nama)] = c; nClients++; }
        return c;
      };
      d.blocks.forEach(function (b) { b.rekanan.forEach(function (rk) { getClient(rk.client); }); });
      DB.set('Lines', DB.get('Lines').filter(function (l) { return l.asal !== P; }));
      DB.set('Payments', DB.get('Payments').filter(function (x) { return x.periode !== P; }));
      var Lines = DB.get('Lines'), Pay = DB.get('Payments'), seq = 0;
      var picCand = {};
      d.ri.forEach(function (r) {
        var rateNow = blockBy[r.kode] ? Engine.roundRate(blockBy[r.kode].metrics.rate, Engine.settings()) : null;
        r.lines.forEach(function (l) {
          var c = getClient(l.client);
          var lp = l.periode || P;
          if (!c.first_periode || lp < c.first_periode) { c.first_periode = lp; DB.dirty('Clients'); }
          var pc = picCand[c.id] = picCand[c.id] || {};
          pc[r.kode] = (pc[r.kode] || '') < lp ? lp : pc[r.kode];
          var nilai = (l.saldoAwal || 0) + (l.sales || 0);
          if (nilai < 0.5) return;
          var j = Engine.lineJenis(l.label);
          var recorded = l.rate === null ? 0 : l.rate;
          // rate Excel dipakai apa adanya (sesuai yang sudah dibayarkan); rate periode hanya jika Excel tidak mencatat rate
          var hasNow = rateNow !== null && rateNow !== undefined;
          var rate = (l.rate === null && lp === P && hasNow) ? rateNow : recorded;
          if (lp === P && hasNow && l.rate !== null && Math.abs(recorded - rateNow) > 0.000001)
            warns.push(r.kode + ' · ' + l.client + ' · ' + l.label + ': rate Excel ' + (recorded * 100).toFixed(3) + '% dipakai (rate periode ' + (rateNow * 100).toFixed(3) + '%).');
          seq++;
          var line = {
            line_id: P + '-A' + ('0000' + seq).slice(-4), invoice_no: j === 'INV' ? l.label : (j === 'CASH' ? 'CASH' : ''), periode: lp, asal: P,
            segmen: c.segmen || '', client_id: c.id, client: c.nama, kode: r.kode, nilai: nilai, rate: rate, jenis: j, sumber: 'DATA_AWAL',
            dibayar: l.bayar || 0, sisa: nilai - (l.bayar || 0), catatan: j === 'PENDING' ? l.label : (l.catatan || '')
          };
          Lines.push(line); nLines++;
          if (l.bayar) {
            Pay.push({
              pay_id: P + '-PA' + ('0000' + seq).slice(-4), periode: P, tanggal: U.lastDay(P), receipt: j === 'CASH' ? 'CASH' : 'ARSIP', invoice_no: line.invoice_no,
              line_id: line.line_id, client_id: c.id, client: c.nama, kode: r.kode, nilai: l.bayar, rate: recorded, insentif: l.insentif || 0,
              sumber: 'ARSIP', catatan: 'Sesuai file Excel ' + U.bulanNama(P)
            });
          }
        });
      });
      DB.dirty('Lines'); DB.dirty('Payments');
      Object.keys(picCand).forEach(function (cid) {
        var m = picCand[cid];
        var best = Object.keys(m).sort(function (a, b) { return m[a] < m[b] ? 1 : -1; })[0];
        var first = Object.keys(m).map(function (k) { return m[k]; }).sort()[0];
        Engine.setPic(cid, best, first < P ? first : P, 'DATA AWAL', u.username, 'Dari file ' + (p.filename || ''));
      });
      d.blocks.forEach(function (b) {
        b.rekanan.forEach(function (rk) { var c = getClient(rk.client); if (!picCand[c.id]) { picCand[c.id] = 1; Engine.setPic(c.id, b.kode, P, 'DATA AWAL', u.username, ''); } });
      });
      // klien lain yang tercantum di sheet RI (tanpa transaksi) → tetap dicatat sebagai klien lama + PIC
      var aktifFirst = d.ri.slice().sort(function (a, b) { return (blockBy[a.kode] ? 0 : 1) - (blockBy[b.kode] ? 0 : 1); });
      aktifFirst.forEach(function (r) {
        (r.clients || []).forEach(function (nm) {
          var c = getClient(nm);
          if (!c.first_periode) { c.first_periode = P; DB.dirty('Clients'); }
          if (!picCand[c.id]) { picCand[c.id] = 1; Engine.setPic(c.id, r.kode, P, 'DATA AWAL', u.username, 'Tercantum di sheet ' + r.sheet); }
        });
      });
      DB.get('Clients').forEach(function (c) { if (!c.first_periode) { c.first_periode = P; DB.dirty('Clients'); } });
    }
    audit(u, 'DATA_AWAL_' + mode, P, { file: p.filename, baris: nLines, klienBaru: nClients });
    return { periode: P, mode: mode, baris: nLines, klienBaru: nClients, catatan: warns };
  }

  /* ------------------------------ router ------------------------------ */
  var PUBLIC = { ping: 1, login: 1, verify: 1 };
  function handle(req) {
    try {
      ensureDefaults();
      var a = req.action, p = req.payload || {};
      if (a === 'ping') return ok({ app: CFG.APP_NAME, version: CFG.VERSION, time: U.nowISO() });
      if (a === 'login') { var r = login(p); DB.flush(); return ok(r); }
      if (a === 'verify') return ok(verify(p));
      var u = userFromToken(req.token);
      if (!u) return { ok: false, error: 'Sesi berakhir, silakan login lagi.', auth: false };
      var out;
      switch (a) {
        case 'logout': SESS.del(req.token); out = true; break;
        case 'bootstrap': out = bootstrap(u); break;
        case 'dashboard': out = dashboard(p); break;
        case 'periods': out = DB.get('Periods'); break;
        case 'report': out = Report.build(p.periode, { live: !!p.live }); break;
        case 'resume': out = Report.resume(Report.build(p.periode)); break;
        case 'staging': out = stagingStatus(p); break;
        case 'stagingRows': out = { sales: DB.get('StgSales').filter(function (x) { return x.periode === p.periode; }), call: DB.get('StgCall').filter(function (x) { return x.periode === p.periode; }) }; break;
        case 'aging': out = aging(p); break;
        case 'clients': out = clients(p); break;
        case 'handoverInfo': out = handoverInfo(u, p); break;
        case 'handover': out = handover(u, p); break;
        case 'clientDetail': out = clientDetail(p); break;
        case 'suggestClients': out = Engine.suggestClients(p.nama, 6); break;
        case 'imports': out = DB.get('Imports').slice().reverse().slice(0, 200); break;
        case 'audit': need(u, ['ADMIN']); out = DB.get('Audit').slice().reverse().slice(0, 500); break;
        case 'users': need(u, ['ADMIN']); out = DB.get('Users').map(publicUser); break;
        case 'targets': out = DB.get('Targets'); break;
        case 'resolutions': out = DB.get('Resolutions').filter(function (x) { return x.periode === p.periode || x.periode === '*'; }); break;
        case 'importStaging':
          if (p.jenis === 'CALL') need(u, ['ADMIN']); else need(u, ['ADMIN', 'FINANCE']);
          out = importStaging(u, p); break;
        case 'compute': need(u, ['ADMIN']); out = Engine.compute(p.periode, u.username); audit(u, 'HITUNG', p.periode, { omzet: out.periode.omzet, cair: out.periode.cair, error: out.periode.n_error }); break;
        case 'resolve': need(u, ['ADMIN']); out = resolve(u, p); break;
        case 'setTglSurat': need(u, ['ADMIN']); var pr = periodRow(p.periode); if (pr) { pr.tgl_surat = p.tgl_surat; DB.dirty('Periods'); } out = pr; break;
        case 'submit': out = submit(u, p); break;
        case 'approve': out = approve(u, p); break;
        case 'reopen': out = reopen(u, p); break;
        case 'saveStaff': out = saveStaff(u, p); break;
        case 'saveTarget': out = saveTarget(u, p); break;
        case 'saveClient': out = saveClient(u, p); break;
        case 'mergeClient': out = mergeClient(u, p); break;
        case 'saveTiers': out = saveTiers(u, p); break;
        case 'saveSettings': out = saveSettings(u, p); break;
        case 'saveUser': out = saveUser(u, p); break;
        case 'changePassword': out = changePassword(u, p); break;
        case 'importSeed': out = importSeed(u, p); break;
        case 'mailInfo': out = mailInfo(u, p); break;
        case 'kirimGlobal': out = kirimGlobal(u, p); break;
        case 'kirimStaf': out = kirimStaf(u, p); break;
        default: throw new Error('Aksi tidak dikenal: ' + a);
      }
      DB.flush();
      return ok(out);
    } catch (e) {
      if (DB.rollback) DB.rollback();
      return fail(e);
    }
  }

  /** Dipakai Seed riwayat (dijalankan dari editor Apps Script, tanpa login). Satu periode per panggilan. */
  function seedRun(p) {
    ensureDefaults();
    var adm = DB.get('Users').filter(function (x) { return x.aktif && roles(x).indexOf('ADMIN') >= 0; })[0];
    if (!adm) throw new Error('Tidak ada akun Admin aktif.');
    try { var r = importSeed(adm, p); DB.flush(); return r; }
    catch (e) { if (DB.rollback) DB.rollback(); throw e; }
  }

  return { handle: handle, ensureDefaults: ensureDefaults, hashPass: hashPass, seedRun: seedRun };
})();
