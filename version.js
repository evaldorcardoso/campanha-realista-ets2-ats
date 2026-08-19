'use strict';
/* Versão única do app — usada pelo app.js (UI) e pelo sw.js (nome do cache do PWA).
   Ao publicar mudanças: (1) incrementar APP_VERSION aqui e (2) adicionar a entrada
   correspondente no topo de APP_CHANGELOG (mais recente primeiro). */
var APP_VERSION = '1.5.0';
var APP_VERSION_DATE = '2026-08-19';

/* Changelog do app — mais recente primeiro. Cada entrada: { version, date, changes[] }
    e opcionalmente changesEn[] (tradução em inglês). O app mostra automaticamente um
    modal quando APP_VERSION muda e ao clicar na versão (navbar). */
var APP_CHANGELOG = [
  {
    version: '1.5.0',
    date: '2026-08-19',
    changes: [
      'Novo: probabilidade de chuva diária — o app sorteia 0–100% a cada novo dia (70% de chance de até 10%, 30% de chance de mais de 10%).',
      'Valor mostrado no painel "Chuva hoje" e na previsão do próximo dia no resumo diário.',
      'Registrado por dia no perfil (informativo — você aplica a regra no jogo).'
    ],
    changesEn: [
      'New: daily rain chance — the app rolls 0–100% every new day (70% chance of up to 10%, 30% chance of above 10%).',
      'Shown on the "Rain today" panel badge and as next-day forecast in the daily summary.',
      'Tracked per day in the profile (informational — you apply the rule in-game).'
    ]
  },
  {
    version: '1.4.0',
    date: '2026-08-16',
    changes: [
      'Novo: estado "Em rodagem" — marque início/fim de uma viagem manualmente na aba Hoje',
      'Barra de progresso animada durante a rodagem',
      'Botões iniciar/parar rodagem nas ações rápidas',
      'Bloqueio: pare a rodagem antes de registrar refeição ou estadia (pedágio não interrompe)',
      'Disponível no Nível 2+ (ou Nível 1 em trajeto)'
    ],
    changesEn: [
      'New: "Driving" state — manually mark start/end of a trip on the Today tab',
      'Animated progress bar while driving',
      'Start/stop driving buttons in quick actions',
      'Blocking: stop driving before logging a meal or lodging (toll does not interrupt)',
      'Available at Level 2+ (or Level 1 while in transit)'
    ]
  },
  {
    version: '1.3.0',
    date: '2026-08-16',
    changes: [
      'Novo aba de Financiamentos com contratos, parcelas vencidas e alertas',
      'Nova modal para criar financiamentos (regra +20% ÷ 12 meses)',
      'Alertas persistentes de parcelas vencidas (exibidos em todas as abas)',
      'Suporte a múltiplos contratos simultâneos'
    ],
    changesEn: [
      'New Financing tab with contracts, overdue installments and alerts',
      'New modal to create financing (rule +20% ÷ 12 months)',
      'Persistent overdue installment alerts (shown on all tabs)',
      'Support for multiple simultaneous financing contracts'
    ]
  },
  {
    version: '1.2.0',
    date: '2026-08-16',
    changes: [
      'Novo: idiomas — app inteiro em Português ou Inglês. Seletor na tela inicial (canto superior direito) e na barra superior (🌐).',
      'O idioma fica salvo neste aparelho; números e moeda seguem o idioma escolhido.',
      'Changelog e tela de setup do jogo também são traduzidos.'
    ],
    changesEn: [
      'New: languages — the whole app in Portuguese or English. Selector on the start screen (top-right corner) and in the top bar (🌐).',
      'The language is saved on this device; numbers and currency follow the chosen language.',
      'Changelog and game setup screen are translated too.'
    ]
  },
  {
    version: '1.1.0',
    date: '2026-08-16',
    changes: [
      'Novo: crie cidades e empresas personalizadas direto na busca — quando nada é encontrado, aparece o botão "+ Criar".',
      'Cidades/empresas criadas ficam salvas apenas neste aparelho (sem expiração) e são marcadas com "(sua)".',
      'Se uma cidade/empresa oficial surgir com o mesmo nome de uma personalizada, a personalizada é removida automaticamente.',
      'Campo de empresa nas configurações virou busca (igual às cidades).'
    ],
    changesEn: [
      'New: create custom cities and companies right from the search — when nothing is found, a "+ Create" button appears.',
      'Created cities/companies are saved only on this device (no expiration) and marked with "(yours)".',
      'If an official city/company appears with the same name as a custom one, the custom one is removed automatically.',
      'The company field in settings became a search (just like cities).'
    ]
  },
  {
    version: '1.0.9',
    date: '2026-08-15',
    changes: [
      'Novo: botões de ação rápida para pedágio e abastecimento (com valor informado manualmente), com ícones próprios.',
      'Pedágio e abastecimento removidos do modal de despesas — agora têm entrada própria.'
    ]
  },
  {
    version: '1.0.8',
    date: '2026-08-15',
    changes: [
      'Novo: modal de changelog — mostra automaticamente as mudanças quando o app é atualizado.',
      'Clique na versão na barra superior para rever o changelog a qualquer momento.'
    ]
  }
];