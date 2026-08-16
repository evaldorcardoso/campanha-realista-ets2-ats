'use strict';
/* Versão única do app — usada pelo app.js (UI) e pelo sw.js (nome do cache do PWA).
   Ao publicar mudanças: (1) incrementar APP_VERSION aqui e (2) adicionar a entrada
   correspondente no topo de APP_CHANGELOG (mais recente primeiro). */
var APP_VERSION = '1.2.0';
var APP_VERSION_DATE = '2026-08-16';

/* Changelog do app — mais recente primeiro. Cada entrada: { version, date, changes[] }
   e opcionalmente changesEn[] (tradução em inglês). O app mostra automaticamente um
   modal quando APP_VERSION muda e ao clicar na versão (navbar). */
var APP_CHANGELOG = [
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