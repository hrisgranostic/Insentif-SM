/* =====================================================================
 * views-panduan.js — menu "Panduan": arti setiap ikon dan cara pakai
 * Bisa dibuka semua peran (termasuk Staf Sales).
 * ===================================================================== */
(function () {
  'use strict';
  var App = window.App, F = App.F, I = App.I, V = App.views;

  // [ikon, nama, di mana terlihat, fungsi]
  var IKON = [
    ['home', 'Rumah / Ringkasan', 'Menu Ringkasan', 'Angka utama periode terakhir, persetujuan yang menunggu Anda, grafik, dan umur piutang.'],
    ['upload', 'Unggah', 'Menu Proses bulanan', 'Mengunggah file Realisasi Sales, Realisasi AR, dan Call Report. Juga tombol untuk memulai periode baru.'],
    ['stamp', 'Tanda tangan / setujui', 'Menu Persetujuan, tombol "Periksa & setujui"', 'Menandatangani langkah Anda. Ada juga tombol tolak (dikembalikan dengan catatan).'],
    ['history', 'Riwayat', 'Menu Riwayat periode', 'Daftar semua periode yang sudah dihitung, termasuk arsipnya.'],
    ['wallet', 'Dompet / piutang', 'Menu Piutang klien', 'Buku piutang per invoice dan riwayat pembayaran tiap klien.'],
    ['users', 'Orang banyak', 'Menu Staf & target', 'Data staf, target omzet, target kunjungan, dan email staf.'],
    ['building', 'Gedung', 'Menu Klien & PIC', 'Daftar klien, PIC (staf pemegang klien), dan penggabungan klien ganda.'],
    ['percent', 'Persen', 'Menu Tabel rate', 'Tabel PIR dan GAF beserta tanggal mulai berlakunya.'],
    ['key', 'Kunci', 'Menu Pengguna; tombol Password', 'Akun dan peran pengguna (Super Admin). Tombol Password untuk ganti password sendiri.'],
    ['gear', 'Roda gigi', 'Menu Pengaturan', 'Kop surat, nomor dokumen, urutan penandatangan, alamat aplikasi, dan notifikasi.'],
    ['db', 'Database', 'Menu Data awal', 'Mengisi saldo awal dari file Excel lama (hanya sekali di awal).'],
    ['list', 'Daftar', 'Menu Log aktivitas', 'Catatan siapa melakukan apa dan kapan, termasuk login dan logout.'],
    ['qr', 'QR code', 'Kotak tanda tangan di PDF', 'Dipindai untuk memeriksa apakah persetujuan itu sah dan datanya belum berubah.'],
    ['file', 'Dokumen', 'Tombol di Proses bulanan / Riwayat', 'Membuat dokumen PDF atau lampiran untuk dicetak.'],
    ['printer', 'Printer', 'Tombol Cetak', 'Mencetak dokumen yang sedang dibuka.'],
    ['download', 'Unduh', 'Tombol Unduh Excel / PDF', 'Menyimpan hasil ke komputer Anda sebagai file Excel atau PDF.'],
    ['mail', 'Amplop', 'Tombol Kirim email (Riwayat / periode)', 'Mengirim email dua langkah: rekap ke direksi dulu, lalu hasil per staf setelah disetujui.'],
    ['copy', 'Salin', 'Tombol di beberapa tabel', 'Menyalin isi tabel atau teks ke clipboard.'],
    ['refresh', 'Putar / muat ulang', 'Tombol Reset draft', 'Mengulang perhitungan dari awal. Hanya selama periode belum diajukan. Butuh password.'],
    ['alert', 'Peringatan', 'Di tabel periode dan rekonsiliasi', 'Ada data yang perlu dicek, misalnya selisih klaim atau PIC yang belum terisi. Bukan error.'],
    ['check', 'Centang', 'Di baris yang sudah beres', 'Baris atau langkah sudah cocok atau sudah disetujui.'],
    ['plus', 'Plus / tambah', 'Tombol Tambah', 'Menambah data baru: pengguna, staf, klien, atau periode.'],
    ['x', 'Silang / tutup', 'Pojok jendela dan tombol Batal', 'Menutup jendela tanpa menyimpan.'],
    ['menu', 'Tiga garis', 'Pojok kiri atas (HP)', 'Membuka dan menutup menu samping.'],
    ['out', 'Keluar', 'Tombol Keluar di kiri bawah', 'Keluar dari aplikasi. Juga otomatis setelah 30 menit tidak aktif.']
  ];

  // [judul, isi (HTML sederhana)]
  var CARA = [
    ['Masuk ke aplikasi', '<ol><li>Isi <b>username</b> dan <b>password</b> akun Anda.</li><li>Kalau akun Anda Super Admin: masukkan <code>admin</code> dan password admin. Lalu pilih nama penanggung jawab dan ketik password miliknya di popup. Semua aktivitas akan tercatat sebagai "admin atas nama [nama]".</li><li>Kalau tidak ada aktivitas selama <b>30 menit</b>, aplikasi keluar otomatis. Data yang sudah tersimpan tidak hilang.</li></ol>'],
    ['Alur bulanan (Admin HR dan Finance)', '<ol><li><b>Unggah</b> file Realisasi Sales, Realisasi AR, dan Call Report di menu Proses bulanan.</li><li><b>Hitung</b>. Sistem menghitung insentif dan piutang tiap staf.</li><li><b>Rekonsiliasi</b>. Cek baris yang bertanda peringatan. Perbaiki data di Klien & PIC atau Staf & target bila perlu.</li><li><b>Ajukan</b> ke verifikator. Setelah diajukan, periode terkunci dan tidak bisa diubah.</li><li>Verifikator dan direksi menandatangani berurutan di menu <b>Persetujuan</b>.</li><li>Setelah disetujui lengkap, <b>cetak</b> atau <b>unduh</b> dokumen, lalu <b>kirim email</b> dua langkah.</li></ol>'],
    ['Persetujuan (untuk penandatangan)', '<ol><li>Buka menu <b>Persetujuan</b>. Daftar di sini hanya periode yang menunggu langkah Anda.</li><li>Klik <b>Periksa &amp; setujui</b>. Baca angkanya, lalu setujui atau tolak.</li><li>Kalau menolak, tulis catatan supaya Admin HR tahu apa yang harus diperbaiki.</li><li>Tanda tangan Anda muncul dengan QR code. Siapa pun bisa memindainya untuk memeriksa keasliannya.</li></ol>'],
    ['Reset draft dan hapus data bulan (Admin HR)', '<ul><li><b>Reset draft</b>: mengulang perhitungan dari awal. Hanya selama belum diajukan.</li><li><b>Hapus data bulan</b>: menghapus periode terakhir. Tidak bisa untuk periode yang sudah diajukan atau disetujui.</li><li>Keduanya meminta <b>password akun yang sedang login</b>. Setiap percobaan tercatat di log.</li></ul>'],
    ['Piutang dan riwayat', '<ul><li>Menu <b>Piutang klien</b> menampilkan tagihan per invoice, pembayaran yang sudah masuk, dan sisanya.</li><li>Menu <b>Riwayat periode</b> membuka rincian periode lama, termasuk periode arsip dari Excel.</li></ul>'],
    ['Master data (Admin HR)', '<ul><li><b>Staf &amp; target</b>: data staf, target omzet, dan email.</li><li><b>Klien &amp; PIC</b>: daftar klien dan siapa PIC-nya. Pindah PIC bila ada oper klien.</li><li><b>Tabel rate</b>: rate PIR dan GAF. Tanggal mulai berlaku menentukan periode mana yang memakai rate baru.</li><li><b>Pengaturan</b>: kop surat, nomor dokumen, dan urutan penandatangan.</li></ul>'],
    ['Mode simulasi (latihan)', '<ul><li>Di pojok kanan bawah halaman masuk, klik <b>Mode simulasi</b> sampai statusnya aktif. Lalu masuk seperti biasa. Username dan password tetap sama.</li><li>Untuk masuk yang riil, biarkan Mode simulasi nonaktif.</li><li>Ada garis kuning <b>MODE SIMULASI</b> di atas. Semua yang dicoba di sini tidak mengubah data asli.</li><li>Email tidak terkirim sungguhan. Di riwayat tercatat status <b>SIMULASI</b>.</li><li>Data simulasi adalah salinan lengkap data asli. Dibuat ulang otomatis setiap 30 hari dengan salinan terbaru.</li></ul>'],
    ['Pengguna dan peran (Super Admin)', '<ul><li>Menu <b>Pengguna</b> hanya bisa dibuka lewat login Super Admin.</li><li>Centang peran sesuai orangnya: Staf HR, KaDept. HRGA-IT, Manajer Operasional, Sales &amp; Marketing Manager, Direksi, Finance, atau Staf Sales.</li><li>Peran yang tidak dicentang tidak bisa mengakses menu atau tombol yang sesuai peran itu.</li></ul>'],
    ['Log aktivitas', '<ul><li>Mencatat login, logout, perubahan data, persetujuan, dan pengiriman email.</li><li>Di sesi Super Admin, tercatat sebagai "admin atas nama [penanggung jawab]".</li><li>Password tidak pernah masuk log.</li></ul>'],
    ['Kalau ada masalah', '<ul><li>"Sesi berakhir": login lagi. Data yang sudah tersimpan aman.</li><li>"Server membalas 404": alamat backend di config salah. Minta IT memeriksanya.</li><li>Tampilan lama masih muncul: tekan <b>Ctrl+Shift+R</b> untuk memuat ulang.</li></ul>']
  ];

  V.panduan = async function (main) {
    var rows = IKON.map(function (r) {
      return '<tr><td style="width:48px"><span class="panduan-ico" aria-hidden="true">' + I[r[0]] + '</span></td><td><b>' + F.esc(r[1]) + '</b><div class="small faint">' + F.esc(r[2]) + '</div></td><td>' + F.esc(r[3]) + '</td></tr>';
    }).join('');
    var steps = CARA.map(function (c, i) {
      return '<details class="panduan-item"' + (i === 0 ? ' open' : '') + '><summary>' + F.esc(c[0]) + '</summary><div class="panduan-body">' + c[1] + '</div></details>';
    }).join('');
    main.innerHTML = '<div class="page-head"><div><h1>Panduan</h1><div class="sub">Arti setiap ikon dan cara memakai aplikasi. Menu ini bisa dibuka oleh semua peran.</div></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Arti ikon</h2></div><div class="panel-b flush tbl-wrap"><table class="t"><thead><tr><th></th><th>Ikon</th><th>Fungsi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="panel" style="margin-top:16px"><div class="panel-h"><h2>Cara pakai</h2></div><div class="panel-b">' + steps + '</div></div>' +
      '<p class="small faint" style="margin-top:10px">Menu dan tombol yang tampil bergantung pada peran Anda. Kalau ada yang tidak terlihat, berarti peran Anda belum mengaksesnya.</p>' +
      '<div class="panel" style="margin-top:16px"><div class="panel-h"><h2>Tentang Aplikasi</h2></div><div class="panel-b hak-cipta about-foot">' + App.HAK.map(function (l) { return '<p>' + F.esc(l) + '</p>'; }).join('') + '</div></div>';
  };
})();
