'use strict';
/* Versão única do app — usada pelo app.js (UI) e pelo sw.js (nome do cache do PWA).
   Ao publicar mudanças: (1) incrementar APP_VERSION aqui e (2) adicionar a entrada
   correspondente no topo de APP_CHANGELOG (mais recente primeiro). */
var APP_VERSION = '1.0.8';
var APP_VERSION_DATE = '2026-08-15';

/* Changelog do app — mais recente primeiro. Cada entrada: { version, date, changes[] }.
   O app mostra automaticamente um modal quando APP_VERSION muda e ao clicar na versão (navbar). */
var APP_CHANGELOG = [
  {
    version: '1.0.8',
    date: '2026-08-15',
    changes: [
      'Novo: modal de changelog — mostra automaticamente as mudanças quando o app é atualizado.',
      'Clique na versão na barra superior para rever o changelog a qualquer momento.'
    ]
  }
];