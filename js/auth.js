/**
 * auth.js — autenticação via Supabase.
 * Carregue PRIMEIRO no <head> de todas as páginas (após o CDN do Supabase).
 *
 * CONFIGURAÇÃO:
 *   1. Crie um projeto em https://supabase.com
 *   2. Vá em Project Settings → API
 *   3. Cole o "Project URL" e a "anon public key" abaixo
 */

// Oculta a página imediatamente para evitar flash de conteúdo não autorizado
document.documentElement.style.visibility = 'hidden';

const Auth = (function () {

  // ── Cole suas credenciais Supabase aqui ─────────────────────
  const SUPABASE_URL = 'https://lplfffnbfswgjclayszd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_r7fRswFz4pphDPirp2G2Gw_tvgnQ2Bx';
  // ────────────────────────────────────────────────────────────

  const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  let _user = null;

  // ── Helpers ──────────────────────────────────────────────────
  function _isLoginPage() {
    const p = location.pathname.split('/').pop().split('?')[0];
    return p === 'login.html' || p === '';
  }

  function _populateUI() {
    const inicial = getInicial();
    const nome    = getNome();
    const role    = getRole();

    document.querySelectorAll('.topbar-avatar').forEach(el => {
      el.textContent = inicial;
      el.title = nome + ' · ' + role;
    });
    document.querySelectorAll('.sidebar-avatar').forEach(el => {
      el.textContent = inicial;
    });
    document.querySelectorAll('.sidebar-user-name').forEach(el => {
      el.textContent = nome;
    });
    document.querySelectorAll('.sidebar-user-role').forEach(el => {
      el.textContent = role + ' · ADMIFLY';
    });
    document.querySelectorAll('[data-logout]').forEach(btn => {
      btn.addEventListener('click', function (e) { e.preventDefault(); logout(); });
    });
  }

  // ── API pública ───────────────────────────────────────────────
  function getSession() { return _user; }

  function getNome() {
    if (!_user) return '';
    return _user.user_metadata?.full_name ||
           _user.user_metadata?.name ||
           _user.email?.split('@')[0] || '';
  }

  function getEmail()   { return _user?.email || ''; }
  function getRole()    { return _user?.user_metadata?.role || 'Usuário'; }
  function getInicial() { const n = getNome(); return n ? n.charAt(0).toUpperCase() : '?'; }

  async function login(email, senha) {
    const { data, error } = await _sb.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: senha,
    });
    if (error) return { ok: false, msg: _traduzirErro(error.message) };
    _user = data.user;
    return { ok: true };
  }

  async function loginComGoogle() {
    const { error } = await _sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'index.html' },
    });
    if (error) return { ok: false, msg: error.message };
  }

  async function logout() {
    await _sb.auth.signOut();
    location.replace('login.html');
  }

  async function resetSenha() {
    const email = getEmail();
    if (!email) return { ok: false, msg: 'E-mail não encontrado.' };
    const { error } = await _sb.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'login.html',
    });
    if (error) return { ok: false, msg: error.message };
    return { ok: true };
  }

  function _traduzirErro(msg) {
    if (msg.includes('Invalid login')) return 'E-mail ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
    if (msg.includes('Too many requests')) return 'Muitas tentativas. Aguarde alguns minutos.';
    return 'Erro ao entrar. Tente novamente.';
  }

  // ── Guard assíncrono ─────────────────────────────────────────
  (async function guard() {
    const { data: { session } } = await _sb.auth.getSession();
    _user = session?.user || null;

    if (_isLoginPage()) {
      if (_user) { location.replace('index.html'); return; }
      document.documentElement.style.visibility = 'visible';
      return;
    }

    if (!_user) {
      location.replace('login.html');
      return;
    }

    document.documentElement.style.visibility = 'visible';

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _populateUI);
    } else {
      _populateUI();
    }
  })();

  return { getSession, login, loginComGoogle, logout, resetSenha, getNome, getRole, getEmail, getInicial };
})();
