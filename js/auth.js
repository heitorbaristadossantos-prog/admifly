/**
 * auth.js — guarda de autenticação do ADMIFLY.
 * Carregue este script PRIMEIRO no <head> de todas as páginas protegidas.
 * O guard roda de forma síncrona, antes de qualquer conteúdo ser exibido.
 */
const Auth = (function () {

  const SESSION_KEY = 'admifly_session';

  // Usuários válidos (em produção isso viria de um backend)
  const USUARIOS = [
    { email: 'heitor@admifly.com', senha: 'admifly2026', nome: 'Heitor', role: 'Proprietário' },
    { email: 'admin@admifly.com',  senha: 'admin123',    nome: 'Admin',  role: 'Administrador' },
  ];

  // ── Helpers internos ─────────────────────────────────────
  function _isLoginPage() {
    const p = location.pathname.split('/').pop().split('?')[0];
    return p === 'login.html' || p === '';
  }

  // ── API pública ──────────────────────────────────────────

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || Date.now() > s.expires) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch { return null; }
  }

  /** Tenta fazer login. Retorna true em sucesso, false em falha. */
  function login(email, senha, lembrar) {
    const user = USUARIOS.find(
      u => u.email === email.toLowerCase().trim() && u.senha === senha
    );
    if (!user) return false;

    const dias = lembrar ? 30 : 1;
    const session = {
      nome:    user.nome,
      role:    user.role,
      email:   user.email,
      expires: Date.now() + dias * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    location.replace('login.html');
  }

  function getNome()    { const s = getSession(); return s ? s.nome : ''; }
  function getRole()    { const s = getSession(); return s ? s.role : ''; }
  function getEmail()   { const s = getSession(); return s ? s.email : ''; }
  function getInicial() { const n = getNome(); return n ? n.charAt(0).toUpperCase() : '?'; }

  // ── Guard: roda imediatamente (antes do DOM) ─────────────
  (function guard() {
    if (_isLoginPage()) return;
    if (!getSession()) {
      try { sessionStorage.setItem('admifly_redirect', location.href); } catch {}
      location.replace('login.html');
    }
  })();

  // ── Pós-DOM: preenche avatar e registra logout ───────────
  document.addEventListener('DOMContentLoaded', function () {
    // Atualiza topbar avatars com inicial do usuário
    document.querySelectorAll('.topbar-avatar').forEach(el => {
      el.textContent = getInicial();
      el.title = getNome() + ' · ' + getRole();
    });
    // Wires de logout para qualquer elemento com data-logout
    document.querySelectorAll('[data-logout]').forEach(btn => {
      btn.addEventListener('click', function (e) { e.preventDefault(); logout(); });
    });
  });

  return { getSession, login, logout, getNome, getRole, getEmail, getInicial };
})();
