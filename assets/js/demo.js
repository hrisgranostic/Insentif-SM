/* =====================================================================
 * demo.js — backend tiruan di browser (dipakai bila API_URL kosong)
 * Menjalankan kode backend yang SAMA (Config/Core/Api) dengan
 * penyimpanan localStorage. Cocok untuk mencoba sebelum deploy.
 * ===================================================================== */
(function () {
  if ((window.APP_CONFIG || {}).API_URL) return;
  var store;
  try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); store = localStorage; } catch (e) { store = null; }
  var KEY = 'insentif_sm_demo_v1';
  window.DB = window.MemDB({ storage: store, key: KEY });
  var mem = {};
  window.SESS = {
    put: function (t, u) { mem[t] = u; try { store && store.setItem('ism_sess_' + t, u); } catch (e) {} },
    get: function (t) { if (mem[t]) return mem[t]; try { return store ? store.getItem('ism_sess_' + t) : null; } catch (e) { return null; } },
    del: function (t) { delete mem[t]; try { store && store.removeItem('ism_sess_' + t); } catch (e) {} }
  };
  window.HOOKS = { notify: function (o) { console.info('[demo] email ke', o.to.join(', '), '—', o.kind, o.label); } };

  var DEMO_USERS = [
    { username: 'admin', nama: 'Moch Ichsan Majid', jabatan: 'Staff HR', role: 'ADMIN' },
    { username: 'finance', nama: 'Tim Finance', jabatan: 'Finance & Accounting', role: 'FINANCE' },
    { username: 'deiky', nama: 'Deiky Catur Hadi', jabatan: 'KaDept. HRGA-IT', role: 'VERIF1' },
    { username: 'yayang', nama: 'Yayang Ari Setiawan', jabatan: 'Manajer Operasional', role: 'VERIF2' },
    { username: 'haninda', nama: 'Haninda Pundhi N.', jabatan: 'Sales & Marketing Manager', role: 'DIKETAHUI' },
    { username: 'drmay', nama: 'dr. May Fanny Tanzilia, Sp.PK(K)', jabatan: 'Direktur', role: 'DIREKTUR' }
  ];
  function ensureUsers() {
    DB.begin();
    Api.ensureDefaults();
    var L = DB.get('Users');
    DEMO_USERS.forEach(function (u) {
      if (L.some(function (x) { return x.username === u.username; })) return;
      var salt = U.uid('S');
      L.push({ username: u.username, nama: u.nama, jabatan: u.jabatan, email: '', role: u.role, salt: salt, pass_hash: Api.hashPass(salt, 'demo123'), aktif: true, dibuat: U.nowISO(), login_terakhir: '' });
    });
    var adm = L.filter(function (x) { return x.username === 'admin'; })[0];
    if (adm && adm.role.indexOf('ADMIN') >= 0) { adm.nama = 'Moch Ichsan Majid'; adm.jabatan = 'Staff HR'; adm.salt = adm.salt || U.uid('S'); adm.pass_hash = Api.hashPass(adm.salt, 'demo123'); }
    DB.flush();
  }

  window.DemoBackend = {
    users: DEMO_USERS,
    handle: function (req) { DB.begin(); return Api.handle(req); },
    isEmpty: function () { DB.begin(); return !DB.get('Periods').length; },
    reset: function () { DB.reset(); ensureUsers(); },
    loadSample: function (data) {
      DB.reset(); DB.begin();
      Object.keys(data).forEach(function (t) { if (t !== 'Users' && t !== 'Audit') DB.set(t, data[t]); });
      DB.flush();
      ensureUsers();
    },
    init: ensureUsers
  };
})();
