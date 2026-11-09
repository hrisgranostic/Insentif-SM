/* =====================================================================
 * views-master.js — staf & target, klien & PIC, tabel rate, pengguna,
 *                   pengaturan, data awal dari file Excel lama
 * ===================================================================== */
(function () {
  'use strict';
  var App = window.App, F = App.F, I = App.I, S = App.S, V = App.views;

  V.master = async function (main, args) {
    var sub = args[0] || 'staf';
    if (sub === 'pengguna' && !App.hasRole('SUPER')) { main.innerHTML = '<div class="empty"><h3>Khusus Super Admin</h3><p>Pengelolaan pengguna hanya bisa dilakukan lewat login Super Admin.</p></div>'; return; }
    if (sub !== 'klien' && !App.hasRole('ADMIN')) { main.innerHTML = '<div class="empty"><h3>Khusus Admin HR</h3></div>'; return; }
    ({ staf: staf, klien: klien, rate: rate, pengguna: pengguna, pengaturan: pengaturan, 'data-awal': dataAwal }[sub] || staf)(main);
  };
  function head(t, sub, tools) { return '<div class="page-head"><div><h1>' + t + '</h1><div class="sub">' + sub + '</div></div><div class="tools">' + (tools || '') + '</div></div>'; }
  function val(m, id) { var e = m.querySelector('#' + id); return e ? e.value : ''; }

  /* ------------------------------ oper klien ------------------------------ */
  /** Oper klien dari satu staf ke staf lain. Centang satu klien = per satuan; "Pilih semua" = massal. */
  async function operKlien(dari, main) {
    try {
      var info = await API.call('handoverInfo', {});
      var asal = info.staff.filter(function (x) { return x.kode === dari; })[0] || { nama: dari };
      var mine = info.clients.filter(function (c) { return c.kode === dari; });
      if (!mine.length) return App.toast(asal.nama + ' tidak memegang klien saat ini.', true);
      var tujuan = info.staff.filter(function (x) { return x.kode !== dari; });
      if (!tujuan.length) return App.toast('Tidak ada staf aktif lain sebagai tujuan.', true);
      var opts = tujuan.map(function (x) { return '<option value="' + x.kode + '">' + F.esc(x.nama) + '</option>'; }).join('');
      var rows = mine.map(function (c) {
        return '<label class="check" style="display:flex;gap:8px;padding:6px 2px"><input type="checkbox" class="opc" data-id="' + F.esc(c.id) + '"> <span>' + F.esc(c.nama) + '</span>' +
          (c.sisa > 0.5 ? '<span class="small faint">· sisa piutang Rp ' + F.n(c.sisa) + '</span>' : '') + '</label>';
      }).join('');
      var m = App.modal({
        title: 'Oper klien dari ' + asal.nama,
        body: '<div class="form-grid"><div class="field"><label>Oper ke</label><select class="in" id="ke">' + opts + '</select></div>' +
          '<div class="field"><label>Mulai berlaku (bulan sales)</label><input class="in" type="month" id="mu" value="' + info.nextDefault + '">' +
          '<span class="hint">' + (info.lastLocked ? 'Periode terkunci terakhir: ' + F.bln(info.lastLocked) + '. Tanggal tidak boleh lebih awal dari itu.' : 'Belum ada periode terkunci.') +
          ' Invoice sebelum bulan ini tetap atas nama ' + F.esc(asal.nama) + '.</span></div></div>' +
          '<div class="row" style="justify-content:space-between;margin:10px 0 4px"><span class="small">Klien (' + mine.length + ')</span><button class="btn sm" id="pall">Pilih semua</button></div>' +
          '<div style="max-height:320px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:4px 12px">' + rows + '</div>',
        foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Oper klien</button>'
      });
      var semua = false;
      m.querySelector('#pall').onclick = function () {
        semua = !semua;
        m.querySelectorAll('.opc').forEach(function (c) { c.checked = semua; });
        m.querySelector('#pall').textContent = semua ? 'Kosongkan pilihan' : 'Pilih semua';
      };
      m.querySelector('[data-ok]').onclick = async function () {
        var ids = Array.prototype.map.call(m.querySelectorAll('.opc:checked'), function (c) { return c.getAttribute('data-id'); });
        if (!ids.length) return App.toast('Centang minimal satu klien.', true);
        var ke = val(m, 'ke'), mu = val(m, 'mu');
        var keNama = (tujuan.filter(function (x) { return x.kode === ke; })[0] || {}).nama || ke;
        var yakin = await App.confirm('Oper ' + ids.length + ' klien ke ' + keNama + '?',
          'Berlaku mulai ' + F.bln(mu) + '. PIC klien berubah dan perhitungan bulan itu mengikuti staf tujuan. Invoice lama tetap atas nama ' + F.esc(asal.nama) + '. Lanjutkan?', 'Ya, oper', false);
        if (!yakin) return;
        try {
          var r = await API.call('handover', { dari: dari, ke: ke, mulai: mu, ids: ids });
          m.close();
          App.toast(r.jumlah + ' klien dioper ke ' + keNama + (r.dilewati.length ? '. Dilewati (bukan lagi pegangan ' + asal.nama + '): ' + r.dilewati.join(', ') : '.'));
          staf(main);
        } catch (er) { App.err(er); }
      };
    } catch (er) { App.err(er); }
  }

  /* ------------------------------ staf ------------------------------ */
  async function staf(main) {
    S.boot = await API.call('bootstrap');
    var T = await API.call('targets');
    var L = S.boot.staff.slice().sort(function (a, b) { return (a.urutan || 99) - (b.urutan || 99); });
    main.innerHTML = head('Staf & target', 'Target dipakai menghitung PRA. Staf resign tetap menerima insentif dari piutang lama yang dibayar.', '<button class="btn primary" id="add">' + I.plus + 'Tambah staf</button>') +
      '<div class="panel"><div class="panel-b flush tbl-wrap"><table class="t"><thead><tr><th>Kode</th><th>Nama</th><th>Nama lain (alias)</th><th class="num">Target omzet</th><th class="num">Target kunjungan</th><th>Status</th><th></th></tr></thead><tbody>' +
      L.map(function (s) { return '<tr><td><b>' + F.esc(s.kode) + '</b></td><td>' + F.esc(s.nama) + '</td><td class="small muted">' + F.esc(s.alias) + '</td><td class="num">' + F.rp(s.target) + '</td><td class="num">' + (s.call_target || '–') + '</td><td>' + (s.status === 'RESIGN' ? '<span class="chip">Resign mulai ' + F.bln(s.keluar_mulai) + '</span>' : '<span class="chip cash">Aktif</span>') + '</td><td class="num"><button class="btn sm" data-e="' + s.kode + '">Ubah</button> <button class="btn sm" data-op="' + s.kode + '">Oper klien</button></td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Target khusus per bulan</h2><button class="btn sm" id="addt">' + I.plus + 'Tambah</button></div><div class="panel-b' + (T.length ? ' flush' : '') + '">' +
      (T.length ? '<table class="t dense"><thead><tr><th>Berlaku mulai</th><th>Staf</th><th class="num">Target</th><th></th></tr></thead><tbody>' + T.map(function (t) { return '<tr><td>' + F.bln(t.periode) + '</td><td>' + F.esc(App.staffName(t.kode)) + '</td><td class="num">' + F.rp(t.target) + '</td><td class="num"><button class="btn ghost sm" data-dt="' + t.kode + '|' + t.periode + '">Hapus</button></td></tr>'; }).join('') + '</tbody></table>' : '<p class="small muted">Belum ada. Pakai ini bila target staf berubah mulai bulan tertentu; bulan sebelumnya tetap memakai target lama.</p>') + '</div></div>';
    var edit = function (s) {
      s = s || { status: 'AKTIF', call_target: 60, urutan: L.length + 1 };
      var m = App.modal({
        title: s.kode ? 'Ubah staf ' + s.kode : 'Tambah staf',
        body: '<div class="form-grid"><div class="field"><label>Kode</label><input class="in" id="k" value="' + F.esc(s.kode || '') + '" ' + (s.kode ? 'readonly' : '') + ' placeholder="KML"></div><div class="field"><label>Nama lengkap</label><input class="in" id="n" value="' + F.esc(s.nama || '') + '"></div></div>' +
          '<div class="field"><label>Nama lain di file Excel</label><input class="in" id="a" value="' + F.esc(s.alias || '') + '"><span class="hint">Pisahkan koma. Contoh: KRIS,KRIS MEI — dipakai mencocokkan nama di Call Report.</span></div>' +
          '<div class="form-grid"><div class="field"><label>Email staf (Kepada)</label><input class="in" id="em" type="email" value="' + F.esc(s.email || '') + '" placeholder="nama@perusahaan.com"><span class="hint">Penerima hasil perhitungan (PDF) setelah direksi menyetujui.</span></div>' +
          '<div class="field"><label>Cc untuk email staf ini</label><textarea class="in" id="cc" rows="2" placeholder="manajer-sm@..., manajer-finance@..., manajer-hrga@...">' + F.esc(s.cc || '') + '</textarea><span class="hint">Pisahkan dengan koma. Setiap pengiriman tetap dikonfirmasi dulu.</span></div></div>' +
          '<div class="form-grid"><div class="field"><label>Target omzet / bulan (Rp)</label><input class="in" id="t" value="' + F.n(s.target || 0) + '"></div><div class="field"><label>Target kunjungan</label><input class="in" id="c" value="' + (s.call_target || '') + '"></div>' +
          '<div class="field"><label>Status</label><select class="in" id="st"><option value="AKTIF">Aktif</option><option value="RESIGN"' + (s.status === 'RESIGN' ? ' selected' : '') + '>Resign</option></select></div><div class="field"><label>Resign mulai bulan</label><input class="in" type="month" id="km" value="' + F.esc(s.keluar_mulai || '') + '"></div>' +
          '<div class="field"><label>Urutan tampil</label><input class="in" id="u" value="' + (s.urutan || '') + '"></div></div>',
        foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan staf</button>'
      });
      m.querySelector('[data-ok]').onclick = async function () {
        try {
          await API.call('saveStaff', { staff: { kode: val(m, 'k'), nama: val(m, 'n'), alias: val(m, 'a'), email: val(m, 'em'), cc: val(m, 'cc'), target: F.num(val(m, 't')), call_target: F.num(val(m, 'c')), status: val(m, 'st'), keluar_mulai: val(m, 'st') === 'RESIGN' ? val(m, 'km') : '', urutan: F.num(val(m, 'u')) } });
          m.close(); App.toast('Staf disimpan.'); staf(main);
        } catch (e) { App.err(e); }
      };
    };
    document.getElementById('add').onclick = function () { edit(); };
    main.querySelectorAll('[data-e]').forEach(function (b) { b.onclick = function () { edit(L.filter(function (s) { return s.kode === b.getAttribute('data-e'); })[0]); }; });
    main.querySelectorAll('[data-op]').forEach(function (b) { b.onclick = function () { operKlien(b.getAttribute('data-op'), main); }; });
    document.getElementById('addt').onclick = function () {
      var m = App.modal({ title: 'Target khusus', body: '<div class="form-grid"><div class="field"><label>Staf</label><select class="in" id="k">' + App.staffOptions('', { aktif: true }) + '</select></div><div class="field"><label>Berlaku mulai</label><input class="in" type="month" id="p"></div><div class="field"><label>Target (Rp)</label><input class="in" id="t"></div></div>', foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan</button>' });
      m.querySelector('[data-ok]').onclick = async function () { try { await API.call('saveTarget', { kode: val(m, 'k'), periode: val(m, 'p'), target: F.num(val(m, 't')) }); m.close(); staf(main); } catch (e) { App.err(e); } };
    };
    main.querySelectorAll('[data-dt]').forEach(function (b) { b.onclick = async function () { var x = b.getAttribute('data-dt').split('|'); try { await API.call('saveTarget', { kode: x[0], periode: x[1], target: null }); staf(main); } catch (e) { App.err(e); } }; });
  }

  /* ------------------------------ klien ------------------------------ */
  async function klien(main) {
    var L = await API.call('clients', {});
    var q = App._kq || '', fk = App._kk || '';
    var admin = App.hasRole('ADMIN');
    main.innerHTML = head('Klien & PIC', L.length + ' klien. Setiap klien dipegang satu staf (PIC); pergantian PIC tercatat per bulan.', '<input class="in inline" id="q" placeholder="Cari nama / kode BP" value="' + F.esc(q) + '"><select class="in inline" id="fk" aria-label="Filter PIC">' + App.staffOptions(fk, { empty: 'Semua PIC' }) + '<option value="-"' + (fk === '-' ? ' selected' : '') + '>Tanpa PIC</option></select>' + (admin ? '<button class="btn primary" id="add">' + I.plus + 'Tambah klien</button>' : '')) +
      '<div class="panel"><div class="panel-b flush tbl-wrap"><table class="t dense"><thead><tr><th>Kode</th><th>Nama</th><th>Segmen</th><th>PIC</th><th>Kode BP</th><th>Sejak</th><th class="num">Sisa piutang</th></tr></thead><tbody id="kb"></tbody></table></div></div>';
    var body = document.getElementById('kb');
    var draw = function () {
      var qq = q.toUpperCase();
      var R = L.filter(function (c) { return (!qq || (c.nama + ' ' + c.bp_code + ' ' + c.alias + ' ' + c.id).toUpperCase().indexOf(qq) >= 0) && (!fk || (fk === '-' ? !c.kode : c.kode === fk)); })
        .sort(function (a, b) { return a.nama.localeCompare(b.nama); });
      body.innerHTML = R.slice(0, 400).map(function (c) { return '<tr class="click" data-c="' + c.id + '"><td class="faint">' + c.id + '</td><td><b>' + F.esc(c.nama) + '</b>' + (c.alias ? '<div class="small faint">juga: ' + F.esc(c.alias.split('|').join(', ')) + '</div>' : '') + '</td><td>' + F.esc(c.segmen) + '</td><td>' + (c.kode ? F.esc(c.kode) : '<span class="chip warn">belum</span>') + '</td><td>' + F.esc(c.bp_code) + '</td><td>' + F.blnShort(c.first_periode) + '</td><td class="num">' + (c.sisa ? F.rp(c.sisa) : '') + '</td></tr>'; }).join('') +
        (R.length > 400 ? '<tr><td colspan="7" class="muted">Menampilkan 400 dari ' + R.length + '. Persempit pencarian.</td></tr>' : '') + (R.length ? '' : '<tr><td colspan="7" class="muted">Tidak ada yang cocok.</td></tr>');
      body.querySelectorAll('[data-c]').forEach(function (r) { r.onclick = function () { admin ? edit(L.filter(function (c) { return c.id === r.getAttribute('data-c'); })[0]) : App.clientDrawer(r.getAttribute('data-c')); }; });
    };
    draw();
    document.getElementById('q').oninput = function (e) { q = App._kq = e.target.value; draw(); };
    document.getElementById('fk').onchange = function (e) { fk = App._kk = e.target.value; draw(); };
    var thisMonth = new Date(); var pm = thisMonth.getFullYear() + '-' + ('0' + (thisMonth.getMonth() + 1)).slice(-2);
    var edit = function (c) {
      c = c || { segmen: 'APP' };
      var m = App.modal({
        title: c.id ? c.nama : 'Tambah klien', wide: false,
        body: '<div class="field"><label>Nama (sesuai data Finance)</label><input class="in" id="n" value="' + F.esc(c.nama || '') + '"></div>' +
          '<div class="form-grid"><div class="field"><label>Segmen</label><select class="in" id="sg">' + ['APL', 'APP', 'APD'].map(function (s) { return '<option' + (s === c.segmen ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div><div class="field"><label>Kode BP Finance</label><input class="in" id="bp" value="' + F.esc(c.bp_code || '') + '"></div></div>' +
          '<div class="field"><label>Nama lain</label><input class="in" id="al" value="' + F.esc(c.alias || '') + '"><span class="hint">Pisahkan dengan |. Nama di laporan staf yang berbeda ditulis di sini supaya otomatis cocok.</span></div>' +
          '<h3 style="margin:14px 0 8px">Ganti PIC</h3><div class="form-grid"><div class="field"><label>PIC baru</label><select class="in" id="pk">' + App.staffOptions(c.kode || '', { empty: '— tanpa PIC —' }) + '</select></div><div class="field"><label>Berlaku mulai bulan penjualan</label><input class="in" type="month" id="pmu" value="' + pm + '"></div></div>' +
          '<div class="field"><label>Catatan</label><input class="in" id="pc" placeholder="Contoh: peralihan dari SAD"></div>' +
          (c.id ? '<h3 style="margin:14px 0 8px">Gabungkan dengan klien lain</h3><div class="row"><input class="in" id="mq" placeholder="Ketik nama klien tujuan" style="flex:1"><select class="in inline" id="mt"></select><button class="btn sm" id="mg">Gabungkan</button></div><p class="hint small faint">Untuk klien dobel dengan nama berbeda. Semua tagihan & pembayaran dipindah ke klien tujuan.</p>' : ''),
        foot: (c.id ? '<button class="btn" data-hist>Riwayat & tagihan</button>' : '') + '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan</button>'
      });
      var picChanged = function () { return val(m, 'pk') !== (c.kode || ''); };
      m.querySelector('[data-ok]').onclick = async function () {
        try {
          await API.call('saveClient', { client: { id: c.id, nama: val(m, 'n'), segmen: val(m, 'sg'), bp_code: val(m, 'bp'), alias: val(m, 'al'), first_periode: c.first_periode || pm }, pic: picChanged() ? { kode: val(m, 'pk'), mulai: val(m, 'pmu'), catatan: val(m, 'pc') } : null });
          m.close(); App.toast('Klien disimpan.'); klien(main);
        } catch (e) { App.err(e); }
      };
      var hb = m.querySelector('[data-hist]'); if (hb) hb.onclick = function () { App.clientDrawer(c.id); };
      var mq = m.querySelector('#mq');
      if (mq) {
        mq.oninput = function () {
          var qq = mq.value.toUpperCase();
          m.querySelector('#mt').innerHTML = L.filter(function (x) { return x.id !== c.id && qq.length > 1 && x.nama.toUpperCase().indexOf(qq) >= 0; }).slice(0, 20).map(function (x) { return '<option value="' + x.id + '">' + F.esc(x.nama) + '</option>'; }).join('');
        };
        m.querySelector('#mg').onclick = async function () {
          var to = m.querySelector('#mt').value; if (!to) return App.toast('Pilih klien tujuan.', true);
          if (!(await App.confirm('Gabungkan klien?', F.esc(c.nama) + ' akan digabung ke klien terpilih dan dihapus dari daftar.', 'Gabungkan', true))) return;
          try { await API.call('mergeClient', { from: c.id, to: to }); m.close(); App.toast('Klien digabung.'); klien(main); } catch (e) { App.err(e); }
        };
      }
    };
    var add = document.getElementById('add'); if (add) add.onclick = function () { edit(); };
  }

  /* ------------------------------ rate ------------------------------ */
  async function rate(main) {
    S.boot = await API.call('bootstrap');
    var all = S.boot.tiers;
    var vers = Array.from(new Set(all.map(function (t) { return t.berlaku_mulai || '0000-00'; }))).sort();
    var cur = App._rv && vers.indexOf(App._rv) >= 0 ? App._rv : vers[vers.length - 1];
    var L = all.filter(function (t) { return (t.berlaku_mulai || '0000-00') === cur; });
    var tbl = function (j, ttl, desc, isRate) {
      var R = L.filter(function (t) { return t.jenis === j; }).sort(function (a, b) { return a.min - b.min; });
      return '<div class="panel"><div class="panel-h"><div><h2>' + ttl + '</h2><div class="small muted">' + desc + '</div></div><button class="btn sm" data-add="' + j + '">' + I.plus + 'Tambah baris</button></div><div class="panel-b flush"><table class="t dense"><thead><tr><th>Pencapaian minimal (%)</th><th>' + (isRate ? 'Rate (%)' : 'Faktor') + '</th><th>Keterangan</th><th></th></tr></thead><tbody data-j="' + j + '">' +
        R.map(function (t) { return row(t, isRate); }).join('') + '</tbody></table></div></div>';
    };
    function row(t, isRate) {
      return '<tr><td><input class="in inline" data-f="min" value="' + F.n(t.min * 100, 2) + '" style="width:90px"></td><td><input class="in inline" data-f="nilai" value="' + (isRate ? F.n(t.nilai * 100, 4) : F.n(t.nilai, 2)) + '" style="width:100px"></td><td><input class="in" data-f="label" value="' + F.esc(t.label || '') + '"></td><td><button class="btn ghost sm" data-rm aria-label="Hapus baris">' + I.x + '</button></td></tr>';
    }
    main.innerHTML = head('Tabel rate', 'Sama dengan sheet Rate_insentif. Rate final staf = PIR × GAF.', '<label class="small muted" for="vv">Versi berlaku mulai</label><select class="in inline" id="vv">' + vers.map(function (v) { return '<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + (v === '0000-00' ? 'Awal (semua periode)' : F.bln(v)) + '</option>'; }).join('') + '</select>') +
      '<div class="grid g2">' + tbl('PIR', 'Personal Incentive Rate (PIR)', 'Dari pencapaian pribadi: omzet staf ÷ target staf.', true) + tbl('GAF', 'Group Achievement Factor (GAF)', 'Dari pencapaian tim: total omzet ÷ total target staf aktif.', false) + '</div>' +
      '<div class="panel"><div class="panel-b row" style="justify-content:space-between"><div class="field" style="margin:0"><label for="bm">Simpan sebagai versi yang berlaku mulai bulan penjualan</label><input class="in inline" type="month" id="bm" value="' + (cur === '0000-00' ? '' : cur) + '"><span class="hint">Kosongkan untuk mengubah versi awal. Periode yang sudah disetujui tidak ikut berubah.</span></div><button class="btn primary" id="sv">Simpan tabel rate</button></div></div>';
    document.getElementById('vv').onchange = function (e) { App._rv = e.target.value; rate(main); };
    main.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function () { var j = b.getAttribute('data-add'); main.querySelector('tbody[data-j="' + j + '"]').insertAdjacentHTML('beforeend', row({ min: 0, nilai: 0, label: '' }, j === 'PIR')); }; });
    main.addEventListener('click', function (e) { var r = e.target.closest('[data-rm]'); if (r) r.closest('tr').remove(); });
    document.getElementById('sv').onclick = async function () {
      var tiers = [];
      ['PIR', 'GAF'].forEach(function (j) {
        main.querySelectorAll('tbody[data-j="' + j + '"] tr').forEach(function (tr) {
          var g = function (f) { return tr.querySelector('[data-f="' + f + '"]').value; };
          tiers.push({ jenis: j, min: F.num(g('min')) / 100, nilai: j === 'PIR' ? F.num(g('nilai')) / 100 : F.num(g('nilai')), label: g('label') });
        });
      });
      if (!tiers.some(function (t) { return t.jenis === 'PIR' && t.min === 0; }) || !tiers.some(function (t) { return t.jenis === 'GAF' && t.min === 0; })) return App.toast('Setiap tabel wajib punya baris pencapaian minimal 0%.', true);
      try { await API.call('saveTiers', { berlaku_mulai: val(main, 'bm') || '0000-00', tiers: tiers }); App._rv = val(main, 'bm') || '0000-00'; App.toast('Tabel rate disimpan.'); rate(main); } catch (e) { App.err(e); }
    };
  }

  /* ------------------------------ pengguna ------------------------------ */
  async function pengguna(main) {
    var L = await API.call('users');
    var R = S.boot.roles;
    main.innerHTML = head('Pengguna', 'Peran menentukan menu dan langkah persetujuan yang bisa dipakai. Direktur dan Direktur Utama sama-sama diberi peran Direksi (salah satu cukup menandatangani).', '<button class="btn primary" id="add">' + I.plus + 'Tambah pengguna</button>') +
      '<div class="panel"><div class="panel-b flush tbl-wrap"><table class="t"><thead><tr><th>Username</th><th>Nama</th><th>Jabatan</th><th>Email</th><th>Peran</th><th>Status</th><th></th></tr></thead><tbody>' +
      L.map(function (u) { return '<tr><td><b>' + F.esc(u.username) + '</b></td><td>' + F.esc(u.nama) + '</td><td>' + F.esc(u.jabatan) + '</td><td>' + F.esc(u.email) + '</td><td>' + u.role.map(function (r) { return '<span class="chip ink">' + F.esc(R[r] || r) + '</span>'; }).join(' ') + '</td><td>' + (u.aktif === false || u.aktif === 'FALSE' ? '<span class="chip">nonaktif</span>' : '<span class="chip cash">aktif</span>') + '</td><td class="num"><button class="btn sm" data-u="' + F.esc(u.username) + '">Ubah</button></td></tr>'; }).join('') +
      '</tbody></table></div></div><p class="small faint" style="margin-top:10px">Email dipakai untuk notifikasi "menunggu persetujuan Anda". Peran <b>Super Admin</b> hanya untuk akun admin; masuknya wajib dengan dua password (admin + penanggung jawab).</p>';
    var edit = function (u) {
      u = u || { role: [], aktif: true };
      var m = App.modal({
        title: u.username ? 'Ubah ' + u.username : 'Tambah pengguna',
        body: '<div class="form-grid"><div class="field"><label>Username</label><input class="in" id="un" value="' + F.esc(u.username || '') + '" ' + (u.username ? 'readonly' : '') + '></div><div class="field"><label>Nama</label><input class="in" id="nm" value="' + F.esc(u.nama || '') + '"></div>' +
          '<div class="field"><label>Jabatan</label><input class="in" id="jb" value="' + F.esc(u.jabatan || '') + '"></div><div class="field"><label>Email</label><input class="in" id="em" type="email" value="' + F.esc(u.email || '') + '"></div></div>' +
          '<div class="field"><label>Peran</label>' + Object.keys(R).map(function (r) { return '<label class="check"><input type="checkbox" value="' + r + '"' + (u.role.indexOf(r) >= 0 ? ' checked' : '') + '> ' + F.esc(R[r]) + '</label>'; }).join('') + '</div>' +
          '<div class="form-grid"><div class="field"><label>' + (u.username ? 'Password baru (kosongkan jika tetap)' : 'Password awal') + '</label><input class="in" id="pw" type="password" autocomplete="new-password"></div><div class="field"><label>Status</label><select class="in" id="ak"><option value="1">Aktif</option><option value="0"' + (u.aktif === false || u.aktif === 'FALSE' ? ' selected' : '') + '>Nonaktif</option></select></div></div>',
        foot: '<button class="btn" data-close>Batal</button><button class="btn primary" data-ok>Simpan pengguna</button>'
      });
      m.querySelector('[data-ok]').onclick = async function () {
        var roles = Array.from(m.querySelectorAll('input[type=checkbox]:checked')).map(function (c) { return c.value; });
        try { await API.call('saveUser', { user: { username: val(m, 'un'), nama: val(m, 'nm'), jabatan: val(m, 'jb'), email: val(m, 'em'), role: roles, aktif: val(m, 'ak') === '1', password: val(m, 'pw') } }); m.close(); App.toast('Pengguna disimpan.'); pengguna(main); } catch (e) { App.err(e); }
      };
    };
    document.getElementById('add').onclick = function () { edit(); };
    main.querySelectorAll('[data-u]').forEach(function (b) { b.onclick = function () { edit(L.filter(function (u) { return u.username === b.getAttribute('data-u'); })[0]); }; });
  }

  /* ------------------------------ pengaturan ------------------------------ */
  async function pengaturan(main) {
    S.boot = await API.call('bootstrap');
    var st = S.boot.settings, R = S.boot.roles;
    main.innerHTML = head('Pengaturan', 'Kop dokumen, urutan penanda tangan, dan notifikasi.') +
      '<div class="panel"><div class="panel-h"><h2>Kop & nomor dokumen</h2></div><div class="panel-b"><div class="form-grid">' +
      '<div class="field"><label>Nama perusahaan</label><input class="in" id="on" value="' + F.esc(st.org.nama) + '"></div><div class="field"><label>Kota (untuk tanggal surat)</label><input class="in" id="ok" value="' + F.esc(st.org.kota) + '"></div>' +
      '<div class="field"><label>Unit</label><input class="in" id="ou" value="' + F.esc(st.org.unit || '') + '"></div><div></div>' +
      '<div class="field"><label>No. dokumen Persentase Insentif</label><input class="in" id="d1" value="' + F.esc(st.doc_no.persen) + '"></div><div class="field"><label>No. dokumen Rincian per staf</label><input class="in" id="d2" value="' + F.esc(st.doc_no.ri) + '"></div>' +
      '<div class="field"><label>No. dokumen Rincian Pencairan</label><input class="in" id="d3" value="' + F.esc(st.doc_no.riborar) + '"></div></div></div></div>' +
      '<div class="panel"><div class="panel-h"><div><h2>Urutan persetujuan</h2><div class="small muted">Baris pertama = pembuat (Admin HR). Nama & jabatan tercetak di kolom tanda tangan.</div></div></div><div class="panel-b flush tbl-wrap"><table class="t dense"><thead><tr><th>Langkah</th><th>Label</th><th>Nama tercetak</th><th>Jabatan</th><th>Peran yang boleh tanda tangan</th></tr></thead><tbody>' +
      st.signers.map(function (s, i) { return '<tr data-sg="' + i + '"><td>' + (i + 1) + '</td><td><input class="in" data-f="label" value="' + F.esc(s.label) + '"></td><td><input class="in" data-f="nama" value="' + F.esc(s.nama) + '"></td><td><input class="in" data-f="jabatan" value="' + F.esc(s.jabatan) + '"></td><td><select class="in" data-f="role">' + Object.keys(R).map(function (r) { return '<option value="' + r + '"' + (r === s.role ? ' selected' : '') + '>' + F.esc(R[r]) + '</option>'; }).join('') + '</select></td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '<div class="panel"><div class="panel-h"><div><h2>Penerima email rekap global</h2><div class="small muted">Urutan kirim: rekap global ke direksi lebih dulu. Setelah direksi menyetujui, hasil per staf Sales dikirim. Penerima per staf diisi di menu Staf &amp; target (Email dan Cc).</div></div></div><div class="panel-b"><div class="form-grid">' +
      '<div class="field"><label>Kepada (utama)</label><textarea class="in" id="mt" rows="3" placeholder="direktur@perusahaan.com">' + F.esc((st.mail || {}).global_to || '') + '</textarea><span class="hint">Pisahkan dengan koma atau baris baru.</span></div>' +
      '<div class="field"><label>Cc</label><textarea class="in" id="mc" rows="3" placeholder="manajer-sm@perusahaan.com, manajer-hrga@perusahaan.com, manajer-finance@perusahaan.com, staf-finance@perusahaan.com">' + F.esc((st.mail || {}).global_cc || '') + '</textarea><span class="hint">Manajer S&amp;M, HRGA&amp;IT, Finance, dan staf Finance.</span></div></div></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Lain-lain</h2></div><div class="panel-b"><div class="form-grid">' +
      '<div class="field"><label>Alamat aplikasi (untuk QR & link email)</label><input class="in" id="au" value="' + F.esc(st.app_url || '') + '" placeholder="https://namaakun.github.io/insentif-sm/"></div>' +
      '<div class="field"><label>Notifikasi email</label><select class="in" id="en"><option value="1">Aktif</option><option value="0"' + (st.email_notif ? '' : ' selected') + '>Nonaktif</option></select></div>' +
      '<div class="field"><label>Tanda "s" di file APD milik staf</label><select class="in" id="ms">' + App.staffOptions((st.apd_marker || {}).S, { empty: '-' }) + '</select></div>' +
      '<div class="field"><label>Tanda "r" di file APD milik staf</label><select class="in" id="mr">' + App.staffOptions((st.apd_marker || {}).R, { empty: '-' }) + '</select></div>' +
      '<div class="field"><label>Pembulatan rate per invoice</label><select class="in" id="pr"><option value="4">Seperti Excel: 0,375% → 0,38%</option><option value="0"' + (st.pembulatan_rate === 0 ? ' selected' : '') + '>Tanpa pembulatan (0,375%)</option></select><span class="hint">Berlaku untuk periode yang dihitung setelah disimpan.</span></div>' +
      '<div class="field"><label>Increment over target (%)</label><input class="in" id="inc" value="' + F.n((st.increment_over_target || 0) * 100, 2) + '"><span class="hint">Tambahan PIR bila pencapaian ≥ 120%. Di Excel tertulis "+3% berlaku untuk target 1 tahun" tapi tidak pernah dihitung; biarkan 0 bila belum dipakai.</span></div></div></div></div>' +
      '<div class="row end"><button class="btn primary" id="sv">Simpan pengaturan</button></div>';
    document.getElementById('sv').onclick = async function () {
      var signers = Array.from(main.querySelectorAll('[data-sg]')).map(function (tr, i) {
        var g = function (f) { return tr.querySelector('[data-f="' + f + '"]').value; };
        return { step: i, key: st.signers[i].key, label: g('label'), nama: g('nama'), jabatan: g('jabatan'), role: g('role') };
      });
      var mk = {}; if (val(main, 'ms')) mk.S = val(main, 'ms'); if (val(main, 'mr')) mk.R = val(main, 'mr');
      try {
        await API.call('saveSettings', { settings: { org: { nama: val(main, 'on'), kota: val(main, 'ok'), unit: val(main, 'ou') }, doc_no: { persen: val(main, 'd1'), ri: val(main, 'd2'), riborar: val(main, 'd3') }, signers: signers, mail: { global_to: val(main, 'mt'), global_cc: val(main, 'mc') }, app_url: val(main, 'au'), email_notif: val(main, 'en') === '1', apd_marker: mk, increment_over_target: F.num(val(main, 'inc')) / 100, pembulatan_rate: +val(main, 'pr') } });
        S.boot = await API.call('bootstrap'); App.toast('Pengaturan disimpan.');
      } catch (e) { App.err(e); }
    };
  }

  /* ------------------------------ data awal ------------------------------ */
  function dataAwal(main) {
    main.innerHTML = head('Data awal', 'Ambil saldo piutang & arsip dari file insentif Excel yang selama ini dipakai.') +
      '<div class="panel"><div class="panel-b"><ol style="margin:0 0 12px;padding-left:20px"><li>Upload file insentif <b>bulan terakhir</b> (contoh <i>2026_09_Insentif_Fin.xlsx</i>) dengan pilihan <b>Saldo awal</b>. Semua invoice yang belum lunas masuk buku piutang, termasuk piutang staf yang sudah resign.</li>' +
      '<li>Opsional: upload file bulan-bulan sebelumnya dengan pilihan <b>Arsip saja</b> supaya riwayat & grafik terisi.</li><li>Lanjut ke Proses bulanan untuk bulan berikutnya.</li></ol>' +
      '<label class="btn primary">' + I.upload + 'Pilih file insentif Excel<input type="file" accept=".xlsx" class="hidden" id="sf"></label></div></div><div id="sp"></div>';
    document.getElementById('sf').onchange = async function (e) {
      var f = e.target.files[0]; if (!f) return; e.target.value = '';
      try {
        var wb = await App.readWorkbook(f);
        var d = Parsers.parseInsentif(XLSX, wb);
        if (!d.periode) throw new Error('Periode tidak terbaca. Pastikan ini file insentif dengan sheet "% Insentif".');
        var sp = document.getElementById('sp');
        sp.innerHTML = '<div class="panel" style="margin-top:18px"><div class="panel-h"><h2>' + F.esc(f.name) + '</h2><span class="muted">' + F.esc(d.periodeLabel) + '</span></div><div class="panel-b">' +
          '<dl class="kv"><dt>Omzet tim</dt><dd>' + F.rp(d.group.omzet) + ' (GRA ' + F.pct(d.group.gra) + ', GAF ' + d.group.gaf + ')</dd><dt>Total pencairan</dt><dd>' + F.rp(d.riborarTotal, 2) + '</dd><dt>Tanggal surat</dt><dd>' + F.esc(d.tglSurat) + '</dd></dl>' +
          '<table class="t dense" style="margin-top:14px"><thead><tr><th>Sheet</th><th>Staf</th><th class="num">Baris</th><th class="num">Saldo awal</th><th class="num">Sales</th><th class="num">Dibayar</th><th class="num">Saldo akhir</th><th class="num">Insentif</th></tr></thead><tbody>' +
          d.ri.map(function (r) { return '<tr><td>' + F.esc(r.sheet) + '</td><td>' + F.esc(r.staf) + '</td><td class="num">' + r.lines.length + '</td><td class="num">' + F.rp(r.total.saldoAwal) + '</td><td class="num">' + F.rp(r.total.sales) + '</td><td class="num">' + F.rp(r.total.bayar) + '</td><td class="num">' + F.rp(r.total.saldoAkhir) + '</td><td class="num">' + F.rp(r.total.insentif, 2) + '</td></tr>'; }).join('') + '</tbody></table>' +
          warnL(d.warnings) +
          '<div class="field" style="margin-top:16px"><label>Cara menyimpan</label><label class="check"><input type="radio" name="md" value="SALDO" checked> Saldo awal: buku piutang + arsip ' + F.esc(F.label(d.periode)) + '</label><label class="check"><input type="radio" name="md" value="ARSIP"> Arsip saja (riwayat & grafik, tanpa mengubah buku piutang)</label></div>' +
          '<div class="row end"><button class="btn primary" id="go">Simpan data awal</button></div></div></div>';
        document.getElementById('go').onclick = async function () {
          var md = sp.querySelector('input[name=md]:checked').value;
          try {
            var r = await API.call('importSeed', { mode: md, data: d, filename: f.name });
            S.boot = await API.call('bootstrap');
            App.modal({
              title: 'Data awal tersimpan', body: '<p>' + F.esc(F.label(r.periode)) + ' tersimpan sebagai ' + (r.mode === 'SALDO' ? 'saldo awal' : 'arsip') + '. ' + (r.mode === 'SALDO' ? r.baris + ' baris tagihan, ' + r.klienBaru + ' klien baru di master.' : '') + '</p>' +
                (r.catatan.length ? '<div class="note warn"><b>Koreksi otomatis</b><ul style="margin:6px 0 0;padding-left:18px">' + r.catatan.map(function (c) { return '<li>' + F.esc(c) + '</li>'; }).join('') + '</ul></div>' : ''),
              foot: '<a class="btn" href="#/periode/' + r.periode + '" data-close>Lihat arsip</a><a class="btn primary" href="#/proses/' + F.addMonth(r.periode, 1) + '/upload" data-close>Proses ' + F.bln(F.addMonth(r.periode, 1)) + '</a>'
            });
          } catch (er) { App.err(er); }
        };
      } catch (er) { App.err(er); }
    };
  }
  function warnL(w) { return w && w.length ? '<div class="note warn" style="margin-top:12px">' + w.map(F.esc).join('<br>') + '</div>' : ''; }
})();
