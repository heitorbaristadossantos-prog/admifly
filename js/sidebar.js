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
      <div class="sidebar-user">
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
})();
