/* =====================================================================
 * memdb.js — penyimpanan pengganti Google Sheets untuk MODE DEMO
 * (data disimpan di localStorage browser) dan untuk pengujian di Node.
 * ===================================================================== */
(function (root) {
  function MemDB(opts) {
    opts = opts || {};
    var KEY = opts.key || 'insentif_sm_demo_v1';
    var persisted = null; // string JSON
    var work = null;
    var appendQ = {};
    function load() {
      if (persisted === null) {
        var s = null;
        try { s = opts.storage ? opts.storage.getItem(KEY) : null; } catch (e) { s = null; }
        persisted = s || '{}';
      }
      work = JSON.parse(persisted);
    }
    var db = {
      get: function (t) { if (!work) load(); if (!work[t]) work[t] = []; return work[t]; },
      set: function (t, rows) { if (!work) load(); work[t] = rows; },
      dirty: function () {},
      append: function (t, rows) { db.get(t); Array.prototype.push.apply(work[t], rows); },
      flush: function () {
        if (!work) return;
        persisted = JSON.stringify(work);
        try { if (opts.storage) opts.storage.setItem(KEY, persisted); } catch (e) { /* kuota penuh: tetap jalan di memori */ }
        work = JSON.parse(persisted);
      },
      rollback: function () { work = null; },
      begin: function () { work = null; load(); },
      reset: function () { persisted = '{}'; work = null; try { if (opts.storage) opts.storage.removeItem(KEY); } catch (e) {} },
      dump: function () { if (!work) load(); return work; },
      size: function () { return (persisted || '').length; }
    };
    return db;
  }
  function MemSess() {
    var m = {};
    return { put: function (t, u) { m[t] = u; }, get: function (t) { return m[t] || null; }, del: function (t) { delete m[t]; } };
  }
  var api = { MemDB: MemDB, MemSess: MemSess };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.MemDB = MemDB; root.MemSess = MemSess; }
})(typeof window !== 'undefined' ? window : this);
