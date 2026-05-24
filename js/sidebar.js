(function () {
  const page = location.pathname.split('/').pop() || 'index.html';

  const CORE = [
    { href: 'pdvfly.html',   icon: 'shopping-cart', label: 'PdvFly'   },
    { href: 'towerfly.html', icon: 'bell',           label: 'Towerfly' },
    { href: 'logbook.html',  icon: 'history',        label: 'Logbook'  },
  ];

  const MODULES = [
    { href: 'stockfly.html',   icon: 'package',   label: 'Stockfly'   },
    { href: 'billingfly.html', icon: 'file-text', label: 'Billingfly' },
    { href: 'cashfly.html',    icon: 'banknote',  label: 'Cashfly'    },
    { href: 'goalfly.html',    icon: 'target',    label: 'Goalfly'    },
    { href: 'comercefly.html', icon: 'store',     label: 'Comercefly' },
  ];

  function navItem({ href, icon, label }) {
    const active = href === page ? ' active' : '';
    return `<a href="${href}" class="nav-item${active}">
      <i data-lucide="${icon}" class="nav-icon"></i>
      <span>${label}</span>
    </a>`;
  }

  function navSection(label, items) {
    return `<div class="nav-section">
      <div class="nav-label">${label}</div>
      ${items.map(navItem).join('\n')}
    </div>`;
  }

  const html = `
    <a href="index.html" class="brand-lockup">
      <svg class="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="wordmark">
        <span class="wordmark-admi">admi</span><span class="wordmark-fly">fly</span>
      </div>
    </a>

    ${navItem({ href: 'index.html', icon: 'layout-dashboard', label: 'Dashboard' })}

    ${navSection('Gestão', CORE)}
    ${navSection('Módulos', MODULES)}

    <div class="nav-section">
      <div class="nav-label">Inteligência</div>
      <a href="prodash.html" class="nav-item pro-item${page === 'prodash.html' ? ' active' : ''}">
        <i data-lucide="gem" class="nav-icon"></i>
        <span>Pro-Dash</span>
        <span class="pro-badge">PRO</span>
      </a>
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-user" id="sidebar-user-trigger" title="Abrir perfil">
        <div class="sidebar-avatar">${typeof Auth !== 'undefined' ? Auth.getInicial() : '?'}</div>
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">${typeof Auth !== 'undefined' ? Auth.getNome() : ''}</span>
          <span class="sidebar-user-role">${typeof Auth !== 'undefined' ? Auth.getRole() + ' · ADMIFLY' : 'ADMIFLY'}</span>
        </div>
        <button data-logout title="Sair" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--gray-400);padding:4px;border-radius:var(--r-sm);display:flex;align-items:center;transition:color var(--t);" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray-400)'">
          <i data-lucide="log-out" style="width:15px;height:15px;"></i>
        </button>
      </div>
    </div>
  `;

  const root = document.getElementById('sidebar-root');
  if (root) {
    root.innerHTML = html;
    root.className = 'sidebar';
  }

  // ── Account Panel ─────────────────────────────────────────
  _initAccountPanel();

  function _getDataPrefix() {
    try {
      const raw = localStorage.getItem('sb-lplfffnbfswgjclayszd-auth-token');
      const uid = raw ? JSON.parse(raw)?.user?.id : null;
      return uid ? 'admifly_' + uid.replace(/-/g, '') : 'admifly';
    } catch { return 'admifly'; }
  }

  function _initAccountPanel() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      .topbar-avatar { cursor: pointer; transition: opacity 0.15s; user-select: none; }
      .topbar-avatar:hover { opacity: 0.75; }
      #sidebar-user-trigger { cursor: pointer; }

      .account-panel {
        position: fixed;
        width: 252px;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: var(--r-lg);
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08), 0 12px 28px -4px rgba(0,0,0,0.13);
        z-index: 1000;
        overflow: hidden;
        display: none;
        font-family: var(--font);
      }
      .account-panel.ap-open {
        display: block;
        animation: apSlideIn 0.14s ease;
      }
      @keyframes apSlideIn {
        from { opacity: 0; transform: translateY(-5px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .ap-head {
        padding: 16px;
        border-bottom: 1px solid var(--border);
        background: var(--gray-50);
      }
      .ap-head-row { display: flex; align-items: center; gap: 12px; }
      .ap-ava {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: var(--brand);
        color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; font-weight: 700; flex-shrink: 0;
      }
      .ap-meta { flex: 1; min-width: 0; }
      .ap-nome  { font-size: 13.5px; font-weight: 600; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ap-email { font-size: 11.5px; color: var(--gray-400); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ap-badge {
        display: inline-block; margin-top: 8px;
        font-size: 10px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.05em;
        color: var(--gray-500); background: var(--gray-100);
        padding: 2px 8px; border-radius: 999px;
      }

      .ap-section { border-bottom: 1px solid var(--gray-100); padding: 4px 0; }
      .ap-section:last-child { border-bottom: none; }
      .ap-sec-label {
        font-size: 10px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.06em;
        color: var(--gray-400); padding: 6px 14px 2px;
      }
      .ap-item {
        display: flex; align-items: center; gap: 9px;
        width: 100%; padding: 8px 14px;
        font-size: 13px; font-family: var(--font);
        color: var(--gray-700); background: none; border: none;
        text-align: left; cursor: pointer; transition: background 0.1s;
      }
      .ap-item:hover { background: var(--gray-50); color: var(--gray-900); }
      .ap-item.ap-danger { color: var(--danger); }
      .ap-item.ap-danger:hover { background: rgba(220,38,38,0.05); }
    `;
    document.head.appendChild(style);

    // Create panel element
    const panel = document.createElement('div');
    panel.id = 'account-panel';
    panel.className = 'account-panel';
    panel.innerHTML = `
      <div class="ap-head">
        <div class="ap-head-row">
          <div class="ap-ava" id="ap-ava">?</div>
          <div class="ap-meta">
            <div class="ap-nome" id="ap-nome">—</div>
            <div class="ap-email" id="ap-email">—</div>
          </div>
        </div>
        <span class="ap-badge" id="ap-badge">Usuário</span>
      </div>

      <div class="ap-section">
        <button class="ap-item" id="ap-btn-senha" onclick="window._apTrocarSenha()">
          <i data-lucide="key-round" style="width:14px;height:14px;"></i>
          Trocar senha
        </button>
      </div>

      <div class="ap-section">
        <div class="ap-sec-label">Dados</div>
        <button class="ap-item" onclick="window._apExportar()">
          <i data-lucide="download" style="width:14px;height:14px;"></i>
          Exportar meus dados
        </button>
        <button class="ap-item ap-danger" onclick="window._apLimpar()">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
          Limpar dados locais
        </button>
      </div>

      <div class="ap-section">
        <button class="ap-item ap-danger" onclick="typeof Auth !== 'undefined' && Auth.logout()">
          <i data-lucide="log-out" style="width:14px;height:14px;"></i>
          Sair da conta
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    // ── Event listeners ───────────────────────────────────────
    document.addEventListener('click', function (e) {
      // Let the data-logout button be handled by auth.js only
      if (e.target.closest('[data-logout]')) return;

      const fromTopbar  = e.target.closest('.topbar-avatar');
      const fromSidebar = e.target.closest('#sidebar-user-trigger');
      const insidePanel = e.target.closest('#account-panel');

      if (fromTopbar) {
        _toggle(panel, fromTopbar, 'top');
        e.stopPropagation();
      } else if (fromSidebar) {
        _toggle(panel, fromSidebar, 'sidebar');
        e.stopPropagation();
      } else if (!insidePanel) {
        _close(panel);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') _close(panel);
    });

    // ── Global action functions (called from onclick attrs) ────
    window._apTrocarSenha = async function () {
      if (typeof Auth === 'undefined') return;
      const btn = document.getElementById('ap-btn-senha');
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      const res = await Auth.resetSenha();
      btn.disabled = false;
      btn.innerHTML = orig;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      alert(res.ok
        ? `E-mail de redefinição enviado para ${Auth.getEmail()}.`
        : `Erro: ${res.msg}`);
    };

    window._apExportar = function () {
      const prefix = _getDataPrefix();
      const dados = {};
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .forEach(k => {
          try { dados[k] = JSON.parse(localStorage.getItem(k)); }
          catch  { dados[k] = localStorage.getItem(k); }
        });
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'admifly-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
    };

    window._apLimpar = function () {
      if (!confirm('Isso vai apagar todos os seus produtos, lotes, categorias e histórico neste dispositivo.\n\nTem certeza?')) return;
      const prefix = _getDataPrefix();
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .forEach(k => localStorage.removeItem(k));
      _close(panel);
      location.reload();
    };
  }

  function _populatePanel() {
    if (typeof Auth === 'undefined') return;
    document.getElementById('ap-ava').textContent   = Auth.getInicial();
    document.getElementById('ap-nome').textContent  = Auth.getNome();
    document.getElementById('ap-email').textContent = Auth.getEmail();
    document.getElementById('ap-badge').textContent = Auth.getRole();
  }

  function _open(panel, trigger, source) {
    _populatePanel();

    const rect = trigger.getBoundingClientRect();
    const PW   = 252;

    if (source === 'top') {
      panel.style.top    = (rect.bottom + 8) + 'px';
      panel.style.left   = Math.max(8, rect.right - PW) + 'px';
      panel.style.bottom = 'auto';
    } else {
      panel.style.top    = 'auto';
      panel.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
      panel.style.left   = rect.left + 'px';
    }

    panel.classList.add('ap-open');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function _close(panel) {
    panel.classList.remove('ap-open');
  }

  function _toggle(panel, trigger, source) {
    panel.classList.contains('ap-open') ? _close(panel) : _open(panel, trigger, source);
  }
})();
