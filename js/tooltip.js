(function () {
  // Injeta o elemento de tooltip uma única vez
  if (document.getElementById('_tt')) return;
  const el = document.createElement('div');
  el.id = '_tt';
  el.style.cssText = [
    'display:none','position:fixed','z-index:99999',
    'max-width:260px','background:#111827','color:#f9fafb',
    'font-size:12.5px','line-height:1.55','padding:10px 14px',
    'border-radius:8px','box-shadow:0 8px 24px rgba(0,0,0,0.22)',
    'pointer-events:none','font-family:inherit',
  ].join(';');
  document.body.appendChild(el);

  function move(e) {
    const pad = 14;
    const x = Math.min(e.clientX + pad, window.innerWidth  - 280);
    const y = Math.min(e.clientY + pad, window.innerHeight - 100);
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
  }

  document.addEventListener('mousemove', function (e) {
    if (el.style.display !== 'none') move(e);
  });

  document.addEventListener('mouseover', function (e) {
    const btn = e.target.closest('[data-tip]');
    if (!btn) return;
    el.textContent = btn.dataset.tip;
    el.style.display = 'block';
    move(e);
  });

  document.addEventListener('mouseout', function (e) {
    const btn = e.target.closest('[data-tip]');
    if (btn) el.style.display = 'none';
  });
})();
