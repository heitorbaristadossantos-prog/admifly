/**
 * store.js — fonte única de verdade para todos os dados do ADMIFLY.
 * Todas as páginas lêem e escrevem pelo Store, nunca direto no localStorage.
 */
const Store = (function () {

  // ── Reset de dados ao iniciar como novo usuário ──────────
  // Incrementar VERSAO_DADOS quando o esquema mudar ou para forçar reset.
  const VERSAO_DADOS = '1.3';
  (function resetSeNecessario() {
    if (localStorage.getItem('admifly_versao') !== VERSAO_DADOS) {
      ['admifly_novos_produtos','admifly_lotes','admifly_excluidos',
       'admifly_categorias','admifly_qtd_base','admifly_log']
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('admifly_versao', VERSAO_DADOS);
    }
  })();

  // Sem produtos pré-cadastrados — cada usuário cadastra os seus
  const BASE_PRODUTOS = [];

  // ── Chaves do localStorage (contrato central) ────────────
  const KEYS = {
    produtos:   'admifly_novos_produtos',
    lotes:      'admifly_lotes',
    excluidos:  'admifly_excluidos',
    categorias: 'admifly_categorias',
    qtdBase:    'admifly_qtd_base',   // persistência de qtd dos produtos base
    log:        'admifly_log',
  };

  // ── Leitura genérica ─────────────────────────────────────
  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // ── Log de eventos ───────────────────────────────────────
  function log(tipo, acao, detalhe, icon) {
    const eventos = _get(KEYS.log);
    eventos.unshift({ tipo, acao, detalhe, icon: icon || 'activity', data: new Date().toISOString() });
    if (eventos.length > 500) eventos.splice(500); // limite de 500 eventos
    _set(KEYS.log, eventos);
  }

  // ── Produtos ─────────────────────────────────────────────
  function getProdutos() {
    const excluidos  = _get(KEYS.excluidos);
    const customizados = _get(KEYS.produtos);
    const qtdBase    = _get(KEYS.qtdBase); // {nome: qtd} para produtos base

    // Aplica qtd persistida nos produtos base
    const base = BASE_PRODUTOS
      .filter(p => !excluidos.includes(p.nome))
      .map(p => {
        const qtdSalva = qtdBase.find(q => q.nome === p.nome);
        return { ...p, qtd: qtdSalva ? qtdSalva.qtd : p.qtd };
      });

    // Adiciona produtos customizados que não existam na base
    customizados
      .filter(p => !excluidos.includes(p.nome) && !base.find(b => b.nome === p.nome))
      .forEach(p => base.push({ ...p }));

    return base;
  }

  function adicionarProduto(produto) {
    const lista = _get(KEYS.produtos);
    if (!lista.find(p => p.nome === produto.nome)) {
      lista.push(produto);
      _set(KEYS.produtos, lista);
      log('estoque', 'Produto cadastrado',
        `${produto.nome} · Código: ${produto.codigo || '—'} · ${produto.qtd} un`,
        'package-plus');
    }
  }

  function excluirProduto(nome) {
    // Remove de customizados
    const custom = _get(KEYS.produtos).filter(p => p.nome !== nome);
    _set(KEYS.produtos, custom);

    // Adiciona à lista de excluídos
    const exc = _get(KEYS.excluidos);
    if (!exc.includes(nome)) { exc.push(nome); _set(KEYS.excluidos, exc); }

    // Remove qtd salva de base (se existia)
    const qtd = _get(KEYS.qtdBase).filter(q => q.nome !== nome);
    _set(KEYS.qtdBase, qtd);

    log('estoque', 'Produto removido', nome, 'trash-2');
  }

  // ── Lotes ────────────────────────────────────────────────
  function getLotes() { return _get(KEYS.lotes); }

  function adicionarLote(lote) {
    // Valida o produto antes de persistir qualquer dado
    const produtos = getProdutos();
    const produto  = produtos.find(p => p.nome === lote.produto);
    if (!produto) {
      log('estoque', 'Lote ignorado', `Produto "${lote.produto}" não encontrado no estoque`, 'alert-triangle');
      return;
    }

    // Salva o lote
    const lotes = _get(KEYS.lotes);
    lotes.push({ ...lote, data: new Date().toISOString() });
    _set(KEYS.lotes, lotes);

    // Atualiza qtd no array de customizados
    const novaQtd = produto.qtd + lote.qtdAdicionada;
    const custom  = _get(KEYS.produtos);
    const p       = custom.find(c => c.nome === lote.produto);
    if (p) { p.qtd = novaQtd; if (lote.novaValidade) p.validade = lote.novaValidade; }
    _set(KEYS.produtos, custom);

    log('estoque', 'Lote adicionado',
      `${lote.produto} · ${lote.lote} · +${lote.qtdAdicionada} un`,
      'layers');
  }

  function getLotesPorProduto(nomeProduto) {
    return getLotes().filter(l => l.produto === nomeProduto);
  }

  function reduzirEstoque(nome, qtdVendida) {
    const produtos = getProdutos();
    const produto  = produtos.find(p => p.nome === nome);
    if (!produto) return;
    const novaQtd = Math.max(0, produto.qtd - qtdVendida);
    const custom  = _get(KEYS.produtos);
    const p       = custom.find(c => c.nome === nome);
    if (p) p.qtd = novaQtd;
    _set(KEYS.produtos, custom);
  }

  // ── Categorias ───────────────────────────────────────────
  function getCategorias() { return _get(KEYS.categorias); }

  function adicionarCategoria(nome) {
    const cats = getCategorias();
    if (!cats.includes(nome)) { cats.push(nome); _set(KEYS.categorias, cats); }
  }

  // ── Log ──────────────────────────────────────────────────
  function getLog() { return _get(KEYS.log); }

  function logVenda(total, itens, pagamento) {
    log('pdv', 'Venda finalizada',
      `R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2})} · ${itens} item${itens!==1?'s':''} · ${pagamento}`,
      'shopping-cart');
  }

  function logCaixa(tipo, valor, descricao) {
    log('caixa', tipo === 'entrada' ? 'Entrada registrada' : 'Saída registrada',
      `R$ ${valor.toLocaleString('pt-BR',{minimumFractionDigits:2})} · ${descricao}`,
      tipo === 'entrada' ? 'banknote' : 'arrow-down-circle');
  }

  // ── Expor API pública ────────────────────────────────────
  return {
    getProdutos,
    adicionarProduto,
    excluirProduto,
    getLotes,
    adicionarLote,
    getLotesPorProduto,
    reduzirEstoque,
    getCategorias,
    adicionarCategoria,
    getLog,
    logVenda,
    logCaixa,
    log,
    BASE_PRODUTOS, // exposto para leitura, nunca modificar diretamente
  };
})();
