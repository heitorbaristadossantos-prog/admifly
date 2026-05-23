document.addEventListener('DOMContentLoaded', () => {
  // Navigation active state
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      navItems.forEach(nav => nav.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // Chart Configuration Variables based on Design System
  const colors = {
    graphite: '#0F1419',
    orangeBurn: '#FF6B35',
    slate: '#6B6862',
    bone: '#FAFAF7',
    border: 'rgba(15, 20, 25, 0.08)'
  };

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = colors.slate;

  // 1. Fluxo de Caixa (Linha, 30 dias) - "Pra onde o caixa está indo?"
  const ctxCashflow = document.getElementById('cashflowChart');
  if (ctxCashflow) {
    new Chart(ctxCashflow, {
      type: 'line',
      data: {
        labels: ['01', '05', '10', '15', '20', '25', '30'],
        datasets: [{
          label: 'Saldo Bancário',
          data: [420000, 410000, 480000, 475000, 460000, 520000, 512900],
          borderColor: colors.graphite,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: colors.graphite,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1 // Linha simples, sem muita curvatura (história em 2 segundos)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.graphite,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          },
          y: {
            border: { display: false },
            grid: { color: colors.border, borderDash: [4, 4] },
            ticks: {
              font: { size: 11 },
              callback: function(value) {
                return 'R$ ' + (value / 1000) + 'k';
              }
            }
          }
        }
      }
    });
  }

  // 2. Receita vs Despesa (Barras Pareadas, 6 meses) - "As contas estão batendo?"
  const ctxRevExp = document.getElementById('revExpChart');
  if (ctxRevExp) {
    new Chart(ctxRevExp, {
      type: 'bar',
      data: {
        labels: ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
        datasets: [
          {
            label: 'Receita',
            data: [75000, 82000, 78000, 95000, 110000, 85000],
            backgroundColor: colors.graphite,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          },
          {
            label: 'Despesa',
            data: [65000, 70000, 72000, 75000, 80000, 68000],
            backgroundColor: colors.orangeBurn, // Contraste perceptível instantaneamente
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: colors.graphite,
            padding: 12,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          },
          y: {
            border: { display: false },
            grid: { color: colors.border, borderDash: [4, 4] },
            ticks: {
              font: { size: 11 },
              callback: function(value) {
                return 'R$ ' + (value / 1000) + 'k';
              }
            }
          }
        }
      }
    });
  }
});
