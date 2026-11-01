/* =====================================================================
 * api.js — penghubung ke backend Apps Script, atau backend demo di browser
 * ===================================================================== */
(function () {
  var cfg = window.APP_CONFIG || {};
  var DEMO = !cfg.API_URL;
  var pending = 0;

  function loading(on) {
    pending += on ? 1 : -1;
    var el = document.getElementById('loading');
    if (el) el.classList.toggle('hidden', pending <= 0);
  }
  function token() { try { return localStorage.getItem('ism_token') || ''; } catch (e) { return window.__ism_token || ''; } }
  function setToken(t) { try { if (t) localStorage.setItem('ism_token', t); else localStorage.removeItem('ism_token'); } catch (e) { window.__ism_token = t; } }

  async function call(action, payload) {
    loading(true);
    try {
      var req = { action: action, payload: payload || {}, token: token() };
      var res;
      if (DEMO) {
        await new Promise(function (r) { setTimeout(r, 30); });
        res = window.DemoBackend.handle(JSON.parse(JSON.stringify(req)));
        res = JSON.parse(JSON.stringify(res));
      } else {
        var r = await fetch(cfg.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(req), redirect: 'follow' });
        if (!r.ok) throw new Error('Server membalas ' + r.status + '. Periksa URL Web App di config.js.');
        res = await r.json();
      }
      if (!res.ok) {
        var err = new Error(res.error || 'Terjadi kesalahan');
        if (res.auth === false) { setToken(''); err.auth = true; if (window.App) window.App.onAuthLost(); }
        throw err;
      }
      return res.data;
    } catch (e) {
      if (e instanceof TypeError) throw new Error('Tidak bisa terhubung ke server. Periksa koneksi internet atau URL Web App.');
      throw e;
    } finally { loading(false); }
  }

  window.API = { call: call, token: token, setToken: setToken, DEMO: DEMO };
})();
