'use strict';
/* Versão única do app — usada pelo app.js (UI) e pelo sw.js (nome do cache do PWA).
   Ao publicar mudanças: (1) incrementar APP_VERSION aqui e (2) adicionar a entrada
   correspondente no topo de APP_CHANGELOG (mais recente primeiro). */
var APP_VERSION = '1.1.0';
var APP_VERSION_DATE = '2026-08-16';

/* Changelog do app — mais recente primeiro. Cada entrada: { version, date, changes[] }.
   O app mostra automaticamente um modal quando APP_VERSION muda e ao clicar na versão (navbar). */
var APP_CHANGELOG = [
  {
    version: '1.1.0',
    date: '2026-08-16',
    changes: [
      'Novo: crie cidades e empresas personalizadas direto na busca — quando nada é encontrado, aparece o botão "+ Criar".',
      'Cidades/empresas criadas ficam salvas apenas neste aparelho (sem expiração) e são marcadas com "(sua)".',
      'Se uma cidade/empresa oficial surgir com o mesmo nome de uma personalizada, a personalizada é removida automaticamente.',
      'Campo de empresa nas configurações virou busca (igual às cidades).'
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