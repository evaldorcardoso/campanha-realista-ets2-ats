'use strict';
/* ============================================================
   I18N — Campanha Realista
   Dicionários pt-BR (padrão) e en-US. Carregado entre version.js
   e app.js. Expõe: getLang(), setLang(), t(), fmtNum(),
   applyStaticI18n(), LANG_KEY, I18N.
   ============================================================ */

var LANG_KEY = 'realistic_campaign_lang';
var DEFAULT_LANG = 'pt';
var NUM_LOCALES = { pt: 'pt-BR', en: 'en-US' };

var I18N = {
  pt: {
    lang: { button: '🌐 Português' },

    app: { title: 'Campanha Realista — ETS2 / ATS' },

    nav: {
      brand: '🚛 Campanha Realista',
      newProfile: '+ Novo Perfil',
      undo: '↩ Desfazer última ação',
      logoutText: 'Sair',
      logoutTitle: 'Voltar à tela inicial',
      themeTitle: 'Alternar tema',
      langTitle: 'Idioma',
      selectProfile: 'Selecionar perfil',
      noProfiles: 'Nenhum perfil',
      noProfilesList: 'Nenhum perfil criado'
    },

    tabs: {
      today: '📋 Hoje',
      profile: '👤 Meu Perfil',
      finances: '💰 Minhas Finanças',
      financing: '💳 Financiamentos',
      cargo: '🚛 Minhas Cargas',
      employees: '👥 Meus Funcionários',
      rules: '📖 Regras da campanha',
      ariaMenu: 'Menu'
    },

    start: {
      title: '🚛 Campanha Realista',
      subtitle: 'ETS2 / ATS',
      intro: 'Este é o <strong>caderno digital</strong> da sua Campanha Realista no Euro Truck Simulator 2 / American Truck Simulator. No lugar do papel e da caneta, você registra <strong>cargas, refeições, estadia, despesas, salários e funcionários</strong>, mantém o <strong>controle do dinheiro por nível</strong> (como nas regras do Tio Restanho) e o app <strong>sugere a sua próxima ação</strong> e copia o comando <code>g_set_time</code> do console do jogo.',
      cardTodayTitle: 'Hoje',
      cardTodayDesc: 'Sugere a próxima ação do turno e registra refeições, estadia e o avanço do relógio com <code>g_set_time</code>.',
      cardFinTitle: 'Finanças',
      cardFinDesc: 'Saldo, salários, comissões, financiamentos, pedágios e multas — tudo controlado por nível.',
      cardCargoTitle: 'Cargas',
      cardCargoDesc: 'Registre fretes e deslocamentos vazios, acompanhe cada viagem e o retorno que ela gera.',
      cardEmpTitle: 'Funcionários',
      cardEmpDesc: 'No Nível 4, contrate motoristas, pague salários e ganhe comissão sobre os fretes deles.',
      videoTitle: '▶ Vídeo base da campanha — Tio Restanho',
      videoIframeTitle: 'Como fazer uma carreira realista no Euro Truck Simulator 2 / American Truck Simulator — Tio Restanho',
      startBtn: '▶ Iniciar',
      setupBtn: '🎮 Setup do jogo',
      configBtn: '⚙️ Configurações'
    },

    today: {
      dayLabel: 'Dia do jogo',
      weekdayLabel: 'Dia da semana',
      hourLabel: 'Hora',
      cityLabel: 'Cidade',
      whatNow: 'O que fazer agora:',
      nextAction: 'Próxima ação:',
      inTransit: 'Em trajeto',
      outTransit: 'Fora de trajeto',
      companyTruck: '🚛 Caminhão da empresa',
      ownTruck: '🚛 Caminhão próprio',
      levelBadge: 'Nível {n} — {name}',
      baseCard: 'Base',
      baseCity: 'Cidade-base:',
      company: 'Empresa:',
      commission: 'Comissão:',
      shift: 'Turno:',
      pctOfFreight: '{p}% do frete',
      advanceTime: 'Avançar tempo (+1h)',
      rainBadge: '🌧 Chuva hoje: {p}%',
      trafficBadge: '🚗 Tráfego hoje: {v}×',
      trafficTitle: 'Probabilidade de tráfego: {p}%',
      copyTraffic: 'Copiar comando g_traffic {v}',
      actionsHeader: 'Ações rápidas',
      checklistHeader: 'Checklist do dia',
      noProfile: 'Crie um perfil para começar',
      createProfileBtn: '+ Criar perfil',
      heroIntro: 'Registre refeições, estadia, cargas e comissões. O app mantém o registro do seu saldo da campanha — o dinheiro no jogo é administrado por você.'
    },

    actions: {
      noProfile: 'Crie um perfil primeiro.',
      breakfast: 'Registrar café',
      lunch: 'Registrar almoço',
      dinner: 'Registrar jantar',
      lodging: 'Registrar estadia',
      sleep: '🌙 Dormir / próximo dia',
      sleepHint: 'Estadia já registrada — avança para amanhã às {t} sem novo débito.',
      salary: '💰 Receber salário ({m})',
      payEmployees: '👥 Pagar funcionários ({n}): {m} (salário {s} + encargos {c})',
      insurance: '🛡 Pagar seguro ATS ({m})',
      newCargo: '🚛 Registrar nova carga',
      deliver: '✅ Entregar: {from} → {to} ({m})',
      reposition: '🧭 Registrar deslocamento vazio',
      toll: '🛣 Registrar pedágio',
      fuel: '⛽ Registrar abastecimento',
      expense: '💸 Registrar despesa / lançamento',
      empTravel: '🧳 Despesa de viagem do funcionário',
      payFinancing: 'Pagar parcela ({m})'
    },

    checklist: {
      empty: '—',
      done: 'feito',
      companyPays: ' (empresa paga)',
      lodging: 'Estadia',
      footer: 'Dia {n} de 30 · {w}',
      inTransit: 'em trajeto',
      outTransit: 'fora de trajeto'
    },

    fin: {
      balanceHeader: 'Saldo',
      initialBalance: 'Saldo inicial:',
      ledgerHeader: 'Extrato',
      newEntry: '+ Nova despesa / entrada',
      levelBadge: 'Nível {n}',
      noProfile: 'Sem perfil.',
      empty: 'Nenhum lançamento ainda. Saldo inicial: {m}.',
      dayPrefix: 'Dia {n}'
    },

    financing: {
      header: 'Financiamentos Ativos',
      newBtn: '+ Novo financiamento',
      upcomingHeader: 'Próximos Pagamentos',
      empty: 'Nenhum financiamento ativo.',
      emptyUpcoming: 'Nenhuma parcela próxima do vencimento.',
      locked: 'Disponível a partir do <strong>Nível 2</strong> (caminhão próprio).',
      contractDesc: 'Descrição',
      contractPrincipal: 'Valor financiado',
      contractTotal: 'Total com juros',
      contractInstallments: 'Parcelas',
      contractPaid: 'Pagas',
      contractRemaining: 'Restantes',
      contractMonthly: 'Valor da parcela',
      contractNextDay: 'Próximo vencimento (dia)',
      contractProgress: '{paid} de {total}',
      payBtn: 'Pagar parcela',
      overdueBadge: 'vencida',
      noContracts: 'Nenhum financiamento ativo.',
      lvl2Required: 'Disponível apenas a partir do Nível 2 (caminhão próprio).'
    },

    financingModal: {
      title: 'Novo financiamento',
      rule: 'Regra do Tio Restanho: <strong>valor financiado + 20% ÷ 12 meses</strong>. 1 parcela a cada 30 dias.',
      description: 'Descrição (opcional)',
      descPh: 'Ex.: Caminhão Volvo FH16',
      amount: 'Valor financiado (principal)',
      downPayment: 'Entrada (opcional)',
      installments: 'Parcelas',
      interest: 'Juros (%)',
      cancel: 'Cancelar',
      confirm: 'Criar financiamento',
      summary: 'Total com juros: <strong>{total}</strong> · Parcela: <strong>{monthly}</strong> · {installments}x',
      amountToast: 'Informe um valor válido.',
      createdToast: 'Financiamento criado com sucesso.'
    },

    financingAlert: {
      overdue: '⚠️ <strong>{n} parcela(s) vencida(s)</strong> — total: {m}. Toque em "Pagar parcela" para quitar.',
      payBtn: 'Pagar parcela'
    },

    cargo: {
      header: 'Cargas',
      newBtn: '➕ Nova carga',
      empty: 'Nenhuma carga registrada.',
      empty2: '—',
      activeBadge: 'em andamento',
      deliveredBadge: 'entregue',
      driver: 'Motorista: {name}',
      freight: 'Frete {m}',
      yourCommission: 'sua comissão {p}% = {m}',
      empCommission: 'func. 5% = {m}',
      km: '{n} km',
      deliveredDay: 'entregue no dia {n}',
      startedDay: 'iniciada no dia {n}',
      deliverBtn: 'Entregar',
      you: 'Você',
      employee: 'Funcionário'
    },

    emp: {
      header: 'Funcionários',
      addBtn: '+ Adicionar',
      empty: '—',
      locked: 'Disponível no <strong>Nível 4 (Empresário)</strong>. Lá você gerencia caminhões com motoristas: salário {s} + {p}% de encargos a cada {d} dias, comissão de {c}% do frete, despesas de viagem por sua conta. Multas são por conta do funcionário.',
      noEmployees: 'Nenhum funcionário contratado. Clique em "+ Adicionar".',
      salaryLine: 'Salário {s} + {p}% encargos (dia {d})',
      pending: 'pendente',
      paid: 'pago',
      travelExpense: 'Despesa de viagem'
    },

    meal: {
      breakfast: 'Café da manhã',
      lunch: 'Almoço',
      dinner: 'Jantar'
    },

    expense: {
      toll: {
        label: 'Pedágio',
        note: 'Níveis 1–2: pago pelo empregador.'
      },
      fuel: {
        label: 'Combustível',
        note: 'Nível 1: empresa paga. Níveis 2–3: seu.'
      },
      maintenance: {
        label: 'Manutenção do caminhão',
        note: 'Nível 1: empresa paga. Níveis 2–3: seu.'
      },
      ferry: {
        label: 'Balsa / Trem',
        note: 'Níveis 1–2: pago pelo empregador.'
      },
      tag: {
        label: 'Tag (pedágio automático)',
        note: 'Custa {C}{TAG} por país. Nível 1: não se aplica.'
      },
      fine: {
        label: 'Multa / infração',
        note: 'Sempre paga pelo jogador.'
      },
      insurance: {
        label: 'Seguro ATS (a cada {SALARYDAY} dias)',
        note: 'Somente ATS, nível 3+. ETS2 não tem.'
      },
      financing: {
        label: 'Financiamento (parcela)',
        note: 'Regra: valor + 20% ÷ 12 meses, 1 parcela a cada {SALARYDAY} dias.',
        entry: 'Lançamento de financiamento',
        downPayment: 'Entrada',
        payment: 'Parcela {n} de {total}',
        remaining: 'vencido'
      },
      repairL: {
        label: 'Conserto — acidente leve',
        note: 'Nível 3+: 2 dias parado consertando.'
      },
      rollover: {
        label: 'Conserto — tombamento',
        note: 'Nível 3+: 30 dias. Níveis 1–2: demissão + 10 dias parado.'
      },
      emp_travel: {
        label: 'Despesa de viagem do funcionário',
        note: 'Pagas por você (estadia {C}{LODGING} + refeições {C}{BREAKFAST}/{C}{LUNCH}/{C}{DINNER} em trajeto). Multas do funcionário são por conta dele.'
      },
      salary: {
        label: 'Salário (recebimento)',
        note: 'Nível 1: {C}{SALARY1} · Nível 2: {C}{SALARY2}. Dia {SALARYDAY}.'
      },
      commission: {
        label: 'Comissão (renda do frete)',
        note: 'Nível 1: {COMM1}% · Nível 2: {COMM2}% · Nível 3: {COMM3}%.'
      },
      other: {
        label: 'Outro',
        note: ''
      },
      entry: 'Lançamento'
    },

    common: {
      weekday: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
      level: ['', 'Empregado', 'Empregado c/ caminhão', 'Autônomo', 'Empresário']
    },

    rules: {
      header: 'Regras da campanha',
      cmdAccordion: 'Comandos da campanha',
      costAccordion: 'Custos e turno',
      levelAccordion: 'Níveis 1–4',
      cmdIntro: 'Rode no console do jogo (tecla <code>`</code>). Tudo em <strong>minúsculas</strong>. Clique no botão ao lado para copiar:',
      copyCmdTitle: 'Copiar comando',
      cmd: [
        { desc: 'freio mais realista (~30% da força). Roda <strong>1 vez</strong>.' },
        { desc: 'dobra o tráfego. Roda <strong>1 vez</strong>.' },
        { desc: 'deixa o jogo levemente mais lento (mais realista). Precisa <strong>repetir em toda sessão</strong>, pois o jogo volta para 1 ao reiniciar.' },
        { desc: 'define a hora. Ex.: <code>g_set_time 7</code> = 07:00; <code>g_set_time 6 20</code> = 06:20. Só avança o relógio (não volta).' }
      ],
      custos: [
        '{b} {mb} ({db}) · {l} {ml} ({dl}) · {d} {md} ({dd})',
        'Estadia (fora de trajeto) {m} — avança para o dia seguinte {t}',
        'Turno: {t} · intervalo de jornada: 11h',
        'Descarga: {d}',
        'Tag: {m} por país · Seguro ATS: {m2}/{d} dias',
        'Clima: a cada novo dia o app sorteia a chuva (0–100%) — 70% de chance de até 10%, 30% de chance de mais de 10%. Valor informativo.'
      ],
      niveis: [
        '<b>N1 Empregado:</b> salário {s}/mês · comissão {c}% · pedágio/balsa-trem/combustível/refeições-em-viagem da empresa · demissão se tombar (+10 dias)',
        '<b>N2 Caminhão próprio:</b> salário {s}/mês · comissão {c}% · combustível e manutenção seus · tag {t}/país · financiamento = valor +20% ÷ 12 meses',
        '<b>N3 Autônomo:</b> renda {c}% do frete · tudo por sua conta · acidente leve = 2 dias · tombamento = 30 dias · seguro ATS {s}/{d} dias',
        '<b>N4 Empresário:</b> regras N3 + você recebe {c}% do frete; funcionário: salário {s} + {p}% de encargos a cada {d} dias, comissão {e}% do frete, despesas de viagem por sua conta, multas por conta dele'
      ],
      setup: '<p class="mb-2">O console do jogo precisa ser habilitado <strong>uma única vez</strong> (ou de novo se você reinstalar o jogo). Siga os passos:</p><ol class="mb-2"><li><strong>Feche o jogo.</strong> O arquivo <code>config.cfg</code> só pode ser editado com o jogo fechado — se ele estiver aberto, o jogo reescreve o arquivo ao fechar e desfaz a alteração.</li><li><strong>Encontre o arquivo.</strong> No Windows, abra a pasta <strong>Documentos</strong> (Meus Documentos). Dentro dela, procure:<br>• ETS2 → <code>Documentos\\Euro Truck Simulator 2\\config.cfg</code><br>• ATS → <code>Documentos\\American Truck Simulator\\config.cfg</code></li><li><strong>Abra com o Bloco de Notas.</strong> Clique com o botão direito em <code>config.cfg</code> → <em>Abrir com</em> → <em>Bloco de Notas</em> (Notepad).</li><li><strong>Ligue o console.</strong> Use Ctrl+F para procurar as duas linhas e mude o valor <code>"0"</code> para <code>"1"</code>:<br>• <code>uset g_console "0"</code> → <code>uset g_console "1"</code><br>• <code>uset g_developer "0"</code> → <code>uset g_developer "1"</code></li><li><strong>Salve e abra o jogo.</strong> Ctrl+S para salvar, feche o Bloco de Notas e abra o jogo normalmente.</li><li><strong>Abra o console dentro do jogo.</strong> Aperte a tecla <code>`</code> (crase/acento grave — fica logo acima do Tab, ao lado do número 1). Vai aparecer uma barra de texto na tela.</li><li><strong>Digite os comandos.</strong> Cada comando + Enter. Tudo em <strong>minúsculas</strong>.</li></ol><strong>Opções do menu do jogo (Opções → Jogo):</strong><ul class="mb-2"><li>Cansaço / fadiga: <strong>ligado</strong></li><li>Parada obrigatória: <strong>desligada</strong></li><li>Infrações de trânsito: <strong>ligadas</strong></li><li>Estacionamento: <strong>aleatório</strong></li><li>NÃO mexer em <code>g_income_factor</code> (fica em 1 — mudar bagunça a economia da campanha)</li></ul><p class="mb-0 small text-muted">Dica: se o jogo avisar <em>"Unknown command"</em>, confira se digitou tudo minúsculo e se o console foi habilitado (Passo 4).</p>'
    },

    profile: {
      header: 'Perfil da campanha',
      name: 'Nome do perfil',
      game: 'Jogo',
      gameAts: 'American Truck Simulator (US$)',
      gameEts2: 'Euro Truck Simulator 2 (€)',
      baseCity: 'Cidade-base',
      company: 'Empresa',
      startBalance: 'Saldo inicial (aplicado apenas se o extrato estiver vazio)',
      delete: 'Excluir perfil',
      changeLevel: 'Mudar nível',
      save: 'Salvar',
      deleteConfirmTitle: 'Excluir perfil',
      deleteConfirmBody: 'Excluir <strong>{name}</strong> e todos os seus dados? (Você pode desfazer com o botão Desfazer.)'
    },

    config: {
      title: '⚙️ Configurações globais',
      mealsHeader: 'Refeições (ações rápidas)',
      colAction: 'Ação',
      colStart: 'Início da janela',
      colEnd: 'Fim da janela',
      colDuration: 'Duração (min)',
      colAmount: 'Valor',
      lodgingHeader: 'Estadia',
      lodgingAmount: 'Valor da estadia',
      lodgingNext: 'Avançar para o dia seguinte às',
      shiftHeader: 'Turno & tempos',
      shiftStart: 'Início do turno',
      shiftEnd: 'Fim de turno (empregado)',
      shiftRest: 'Descanso (autônomo)',
      shiftDelivery: 'Descarga (min)',
      finHeader: 'Finanças',
      payDay: 'Dia do pagamento (salário/seguro/encargos)',
      salaryN: 'Salário N{n}',
      commN: 'Comissão N{n} (%)',
      tagLabel: 'Tag (pedágio automático) por país',
      insuranceLabel: 'Seguro ATS (a cada período)',
      empSalary: 'Salário do funcionário',
      empCharges: 'Encargos do funcionário (%)',
      empCommission: 'Comissão do funcionário (%)',
      resetBtn: 'Restaurar padrões',
      saveBtn: 'Salvar configurações',
      backupLabel: 'Backup multi-dispositivo:',
      exportBtn: '⬇ Exportar JSON',
      importBtn: '⬆ Importar JSON',
      exportTitle: 'Exportar todos os perfis e configurações em um arquivo .json',
      importTitle: 'Importar perfis e configurações de um arquivo .json',
      close: 'Fechar',
      backupVersion: 'Backup v{v} · gerado em {d}',
      resetConfirmTitle: 'Restaurar padrões',
      resetConfirmBody: 'Restaurar todas as configurações para os valores padrão?',
      resetToast: 'Configurações restauradas para o padrão.',
      savedToast: 'Configurações salvas.',
      mealsInvalid: 'Janelas de refeição inválidas: o fim deve ser depois do início.',
      lodgingInvalid: 'Hora de avanço da estadia inválida.',
      shiftInvalid: 'Horários de turno inválidos.'
    },

    newProfile: {
      title: 'Novo perfil de campanha',
      name: 'Nome do perfil',
      namePh: 'Ex.: Campanha ATS - San Diego',
      game: 'Jogo',
      cancel: 'Cancelar',
      create: 'Criar perfil',
      hint: 'Saldo inicial: {c}{n}. Cidade-base e empresa serão definidas em seguida.',
      defaultName: 'Campanha {n}'
    },

    selectProfile: {
      title: 'Iniciar campanha',
      newBtn: '+ Criar novo perfil',
      cancel: 'Cancelar',
      empty: 'Nenhum perfil criado ainda. Clique em <em>+ Criar novo perfil</em>.'
    },

    startSetup: {
      title: 'Setup do jogo',
      ok: 'Entendi'
    },

    cargoModal: {
      title: 'Registrar carga',
      driver: 'Motorista',
      origin: 'Origem',
      dest: 'Destino',
      distance: 'Distância (km)',
      freight: 'Valor do frete',
      time: 'Hora de saída',
      commissionLabel: 'Sua comissão:',
      ofFreight: 'do frete.',
      cancel: 'Cancelar',
      start: 'Iniciar viagem',
      hint1: 'Níveis 1–2: cargas <strong>somente da sua empresa</strong> ({c}). Pegue a primeira disponível.',
      hint2: 'Nível 3: transporte livre para qualquer empresa.',
      hint3: 'Nível 4: ao dirigir você recebe {p}% do frete; nos caminhões dos funcionários, você recebe {p}% e paga {e}% de comissão a eles.',
      driverYou: 'Você (recebe {p}%)',
      driverEmp: '{name} (você recebe {p}%, funcionário recebe {e}%)',
      driverYou2: 'Você',
      fillToast: 'Preencha origem, destino e valor do frete.'
    },

    repositionModal: {
      title: 'Deslocamento vazio',
      origin: 'Origem',
      dest: 'Destino',
      dep: 'Hora de saída',
      arr: 'Hora de chegada',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      hint1: 'Rodando <strong>vazio</strong> até a filial mais próxima da sua empresa. Refeições e estadia em trajeto continuam por conta do empregador (N1–2).',
      hint2: 'Rodando <strong>vazio</strong> (sem carga) para reposicionar o caminhão. Tudo por sua conta (N3–4).',
      hint3: 'Rodando vazio até a filial mais próxima da sua empresa ({c}).',
      hint4: 'Rodando vazio (sem carga).',
      destToast: 'Informe o destino do deslocamento.',
      timeToast: 'Hora inválida.',
      arrAfterDep: 'A hora de chegada deve ser depois da de saída.',
      departureAt: 'Saída às {t}.',
      labelStart: 'Deslocamento vazio: {from} → {to}',
      labelArrive: 'Chegada do deslocamento: {to}',
      noteArrive: '{from} → {to} rodando vazio em {d}.'
    },

    expenseModal: {
      title: 'Registrar despesa / entrada',
      type: 'Tipo',
      dir: 'Direção',
      dirOut: 'Saída (gasto)',
      dirIn: 'Entrada (ganho)',
      amount: 'Valor (sempre positivo)',
      note: 'Observação',
      time: 'Horário em que ocorreu',
      city: 'Cidade onde ocorreu (opcional)',
      cityDest: 'Cidade de destino (opcional)',
      cancel: 'Cancelar',
      save: 'Registrar',
      employerPays: 'Pago pelo empregador — não será debitado.',
      coveredToast: 'Despesa paga pelo empregador — não foi debitada.'
    },

    timeModal: {
      title: 'Avançar tempo (+1h)',
      now: 'Agora:',
      next: 'Próxima ação:',
      addHour: '+1 hora',
      addHourBlocked: '+1 hora (bloqueado — próxima ação chegou)',
      helper: 'Avança 1h de jogo e copia o comando <code>g_set_time</code>. Fica bloqueado quando a próxima ação já chegou — registre-a primeiro.',
      copiedLabel: 'Comando copiado:',
      dueIn: '· falta {d}',
      now2: '· agora',
      nextNone: '—',
      nowBig: 'Dia {d} · {w} · {t}',
      restNow: 'Descanso — registre a estadia e durma',
      rest: 'Descanso / fim de turno ({t})',
      restFree: 'Descanso / hora de dormir ({t})',
      sleepTomorrow: 'Dormir — amanhã às {t}',
      shiftTomorrow: 'Início de turno (amanhã {t})',
      regNow: '{label} — registre agora',
      arrivedToast: 'Próxima ação já chegou — registre-a antes de avançar.'
    },

    levelModal: {
      title: 'Mudar nível da campanha',
      cancel: 'Cancelar',
      up: 'Subir de nível',
      max: '<span class="text-muted">Você já está no nível máximo.</span>',
      rules2: 'Nível 2 — Empregado com caminhão próprio.<br>• Salário {s}/mês<br>• Comissão {c}%<br>• Combustível e manutenção seus<br>• Tag {t} por país<br>• Financiamento: valor + 20% ÷ 12 meses',
      rules3: 'Nível 3 — Autônomo (caminhão + reboque).<br>• Sem salário; renda = {c}% do frete<br>• Tudo por sua conta<br>• Acidente leve = 2 dias · Tombamento = 30 dias<br>• Seguro ATS {s}/{d} dias',
      rules4: 'Nível 4 — Empresário.<br>• Regras do Nível 3<br>• Funcionários (módulo em versão futura)',
      entry: 'Promoção para Nível {n}',
      toast: 'Nível atualizado: {name}',
      onlyLevel4: 'Disponível no Nível 4 (Empresário).'
    },

    employeeModal: {
      title: 'Contratar funcionário',
      name: 'Nome do motorista',
      namePh: 'Ex.: João',
      cancel: 'Cancelar',
      hire: 'Contratar',
      hint: 'Salário {s} + {p}% encargos a cada {d} dias · comissão {c}% do frete · despesas de viagem por sua conta.',
      nameToast: 'Informe o nome do funcionário.',
      hiredToast: 'Funcionário contratado: {name}'
    },

    confirm: {
      title: 'Confirmar',
      amount: 'Valor',
      time: 'Horário em que a ação ocorreu',
      city: 'Cidade onde ocorreu (opcional)',
      cancel: 'Cancelar',
      ok: 'Confirmar',
      amountToast: 'Informe um valor válido.',
      employerNoDebit: 'Em trajeto — pago pelo empregador (sem débito).',
      debit: 'Debitar {m} do seu saldo?',
      dayTime: 'Dia {d}, {t}',
      coveredNote: 'Pago pelo empregador — não será debitado (valor fica como referência).',
      yourCost: 'Debitar do seu saldo.',
      enterAmount: 'Informe o valor de <strong>{label}</strong>:',
      sleepTitle: 'Dormir / próximo dia',
      sleepBody: 'Estadia já registrada hoje. Avançar direto para <strong>amanhã às {t}</strong>? Sem novo débito.',
      salaryTitle: 'Receber salário',
      salaryBody: 'Receber {m} referente ao dia {d}?',
      payEmpTitle: 'Pagar funcionários',
      payEmpBody: 'Pagar <strong>{n} funcionário(s)</strong>:<br>• Salários: {s}<br>• Encargos ({p}%): {c}<br><strong>Total: {t}</strong>',
      insuranceTitle: 'Pagar seguro',
      insuranceBody: 'Pagar {m} do seguro do veículo (ATS)?',
      lodgingTitle: 'Estadia',
      financingPaymentTitle: 'Pagar parcela de financiamento',
      financingPaymentBody: 'Pagar R$ {m} da parcela devida?',
      deliverTitle: 'Entregar carga',
      deliverBody: 'Entregar {from} → {to} e creditar comissão de {m}?',
      empTravelNote: 'Despesas de viagem do funcionário {name} (em trajeto).'
    },

    daySummary: {
      titleSingle: 'Resumo do dia {n} · {w}',
      titleRange: 'Resumo dos dias {a} a {b}',
      positive: 'positivo',
      negative: 'negativo',
      neutral: 'neutro',
      start: 'Saldo inicial',
      income: 'Entradas do dia',
      outgo: 'Saídas do dia',
      result: 'Resultado (entradas − saídas)',
      final: 'Saldo final',
      done: 'feito',
      missing: 'faltando',
      checklistTitle: 'Checklist do dia',
      complete: 'Completo ✓',
      missingCount: '{n} de {total} ações faltando',
      checklistRangeTitle: 'Checklist dos dias',
      pending: 'Pendências',
      dayPrefix: 'Dia {n}',
      empty: 'Nenhuma movimentação no período.',
      movementsHeader: 'Movimentação do dia',
      weatherTitle: 'Previsão de chuva do próximo dia',
      weatherValue: '{p}%',
      trafficTitle: 'Tráfego do próximo dia',
      trafficValue: '{v}×',
      ok: 'Ok'
    },

    cmd: {
      title: 'Comando para o console',
      copy: 'Copiar',
      autoCopy: 'Ignorar esta etapa e copiar automaticamente nas próximas vezes',
      ok: 'Ok',
      copied: 'O comando foi copiado. Abra o console do jogo (tecla `), cole e pressione Enter.',
      failed: 'Não foi possível copiar automaticamente — use o botão Copiar e cole no console do jogo (tecla `).',
      toastOk: 'Comando copiado para a área de transferência. Cole no console do jogo (tecla `).',
      toastFail: 'Não foi possível copiar automaticamente — copie manualmente: <code>{cmd}</code>',
      autoToast: 'Comando será copiado automaticamente nas próximas vezes.',
      copiedToast: 'Comando copiado!',
      failToast: 'Falha ao copiar.'
    },

    changelog: {
      titleUpdated: '🚀 Atualizado para v{v}',
      title: 'Changelog — v{v}',
      empty: 'Nenhuma mudança registrada.',
      new: 'novo',
      ok: 'Ok',
      see: 'ver changelog'
    },

    toast: {
      nothingUndo: 'Nada para desfazer.',
      undone: 'Ação desfeita.'
    },

    suggest: {
      config: 'Configure a campanha: escolha cidade-base e empresa nas Configurações.',
      allDone: 'Tudo registrado hoje (café, almoço, jantar e estadia). Toque em <strong>Dormir / próximo dia</strong> para avançar até {t} amanhã.',
      shiftEnd: 'Fim de turno (≥ {t}). {dinner}procure um repouso, registre a estadia e vá descansar. Amanhã {start} recomeça.',
      dinnerMissing: 'Registre o jantar e ',
      restTime: 'Hora de descansar. Procure um repouso/área de descanso e registre a estadia{dinner}. Vá dormir.',
      dinnerParenthetical: ' (e o jantar, se ainda não registrou)',
      mealHeadBreakfast: 'Horário do café da manhã',
      mealHead: 'Horário de {label}',
      mealDo: 'Faça uma pausa e registre o {label}.',
      mealEmployerNote: ' Em trajeto — pago pelo empregador.',
      empPayday: 'Dia {d} — pague os funcionários: {n} × (salário {s} + {p}% encargos) = {total}.',
      salaryDay: 'Dia {d} — receba seu salário ({m}).',
      insuranceDay: 'Dia {d} — pague o seguro do veículo ATS ({m}).',
      sunday: 'Domingo — dia de descanso (níveis 1–2). Registre refeições e estadia por sua conta.',
      inTransit: 'Em trajeto: {from} → {to} (frete {m}). Ao chegar, use "Entregar carga".',
      beforeShift: 'Antes do turno (começa às {t}). Avance o tempo até {t} para começar.',
      shiftStart: 'Início de turno na base — pegue a primeira carga da empresa ({c}), sem escolher.',
      noCargoBase: 'Sem carga em andamento. Na base, pegue a primeira carga da sua empresa ({c}) — não escolha.',
      noCargoBranch: 'Sem carga em andamento. Vá até a filial da sua empresa ({c}) mais próxima e pegue a primeira carga disponível.',
      noCargoFree: 'Sem carga em andamento. Procure um novo frete (qualquer empresa), registre a carga e siga viagem.',
      shiftRunning: 'Turno em andamento. Continue a rota, registre refeições/estadia e fique de olho no limite de 11h de jornada.',
      financingDue: 'Vencimento de {n} parcela(s) no total de R$ {m}',
      rodando: 'Em rodagem desde {t}. Pare para registrar refeição/estadia ou continue dirigindo.',
      rodagem: 'Em rodagem desde {t}. Pare para registrar refeição/estadia ou continue dirigindo.'
    },

    entry: {
      mealEmployer: 'Em trajeto — pago pelo empregador.',
      mealInTransit: 'Em trajeto.',
      mealOutTransit: 'Fora de trajeto.',
      lodgingOutTransit: 'Fora de trajeto (por sua conta).',
      city: ' · em {c}',
      lodging: 'Estadia',
      cargoLabel: 'Carga: {from} → {to}{emp}',
      cargoNoteOwn: 'Frete {m} · comissão {p}% = {c} na entrega.',
      cargoNoteEmp: 'Frete {m} · você recebe {p}% = {c} · funcionário {name} recebe {e}% = {ec}.',
      commYouLabel: 'Comissão (sua): {from} → {to}',
      commEmpLabel: 'Comissão do funcionário: {name}',
      commPlayerLabel: 'Comissão: {from} → {to}',
      commNote: '{p}% de frete {m} (+1h de descarga).',
      commEmpNote: '{p}% do frete {m} pago a {name}.',
      salaryLabel: 'Salário mensal',
      salaryNote: 'Pago a cada {d} dias.',
      insuranceLabel: 'Seguro do veículo (ATS)',
      insuranceNote: 'A cada {d} dias.',
      empSalaryLabel: 'Salário: {name}',
      empSalaryNote: 'Funcionário — dia {d}.',
      empChargesLabel: 'Encargos ({p}%): {name}',
      empChargesNote: '{p}% sobre o salário pago ao governo.',
      quickCovered: 'Pago pelo empregador (sem débito).',
      quickYourCost: 'Por sua conta.',
      quickValue: 'Valor informado: {m}',
      financingEntry: 'Financiamento: {desc}',
      financingDownPayment: 'Entrada: R$ {m}',
      financingPayment: 'Parcela {n} de {total}',
      financingNote: 'Parcela {n} de {total}: R$ {m}'
    },

    backup: {
      exported: 'Backup exportado.',
      fileName: 'campanha_realista_backup.json',
      invalid: 'Falha ao importar: arquivo inválido.',
      title: 'Importar backup',
      body: '<p>Isto vai <b>substituir todos os perfis e configurações</b> atuais pelos dados do arquivo.</p><p class="mb-0 text-muted small">Perfis: {n} &middot; Backup de outro dispositivo.</p>',
      done: 'Backup importado com sucesso.'
    },

    combo: {
      noResult: 'Nenhum resultado para “{q}”',
      create: '+ Criar “{q}”',
      yours: ' (sua)',
      cityCreated: 'Cidade “{name}” criada e salva neste aparelho.',
      companyCreated: 'Empresa “{name}” criada e salva neste aparelho.',
      citiesAria: 'Cidades',
      companiesAria: 'Empresas',
      ph: 'Digite para buscar…'
    },

    langToast: {
      changed: 'Idioma alterado para Português.'
    },

    rodagem: {
      active: 'Em rodagem',
      startBtn: 'Iniciar rodagem',
      stopBtn: 'Parar rodagem',
      started: 'Rodagem iniciada',
      startedNote: 'Início às {t}',
      stopped: 'Rodagem finalizada',
      stoppedNote: 'Duração: {d}',
      since: 'Desde {t}',
      hint: 'Marque o início de uma viagem (com ou sem carga) para acompanhar o tempo.',
      startTitle: 'Iniciar rodagem',
      startBody: 'Iniciar rodagem agora ({t})? O tempo de jogo será registrado.',
      stopTitle: 'Parar rodagem',
      stopBody: 'Finalizar a rodagem atual? Duração total será registrada.',
      stopFirst: 'Pare a rodagem antes de registrar uma refeição ou estadia.',
      levelLocked: 'Disponível apenas a partir do Nível 2 (ou em trajeto no Nível 1).',
      ongoing: 'Em rodagem desde {t}. Pare para registrar refeição/estadia ou continue dirigindo.',
      notRunning: 'Nenhuma rodagem em andamento.'
    },
  },

  /* ============================================================ */

  en: {
    lang: { button: '🌐 English' },

    app: { title: 'Realistic Campaign — ETS2 / ATS' },

    nav: {
      brand: '🚛 Realistic Campaign',
      newProfile: '+ New Profile',
      undo: '↩ Undo last action',
      logoutText: 'Log out',
      logoutTitle: 'Back to start screen',
      themeTitle: 'Toggle theme',
      langTitle: 'Language',
      selectProfile: 'Select profile',
      noProfiles: 'No profiles',
      noProfilesList: 'No profiles created'
    },

    tabs: {
      today: '📋 Today',
      profile: '👤 My Profile',
      finances: '💰 My Finances',
      financing: '💳 Financings',
      cargo: '🚛 My Loads',
      employees: '👥 My Employees',
      rules: '📖 Campaign rules',
      ariaMenu: 'Menu'
    },

    start: {
      title: '🚛 Realistic Campaign',
      subtitle: 'ETS2 / ATS',
      intro: 'This is the <strong>digital notebook</strong> of your Realistic Campaign in Euro Truck Simulator 2 / American Truck Simulator. Instead of paper and pen, you log <strong>loads, meals, lodging, expenses, salaries and employees</strong>, keep <strong>money tracking per level</strong> (following Tio Restanho\'s rules) and the app <strong>suggests your next action</strong> and copies the <code>g_set_time</code> command from the game console.',
      cardTodayTitle: 'Today',
      cardTodayDesc: 'Suggests your next shift action and logs meals, lodging and the in-game clock using <code>g_set_time</code>.',
      cardFinTitle: 'Finances',
      cardFinDesc: 'Balance, salaries, commissions, financing, tolls and fines — all tracked by level.',
      cardCargoTitle: 'Loads',
      cardCargoDesc: 'Log freight and empty relocations, follow each trip and the income it generates.',
      cardEmpTitle: 'Employees',
      cardEmpDesc: 'At Level 4, hire drivers, pay salaries and earn commission on their freight.',
      videoTitle: '▶ Campaign base video — Tio Restanho',
      videoIframeTitle: 'How to do a realistic career in Euro Truck Simulator 2 / American Truck Simulator — Tio Restanho',
      startBtn: '▶ Start',
      setupBtn: '🎮 Game setup',
      configBtn: '⚙️ Settings'
    },

    today: {
      dayLabel: 'Game day',
      weekdayLabel: 'Weekday',
      hourLabel: 'Time',
      cityLabel: 'City',
      whatNow: 'What to do now:',
      nextAction: 'Next action:',
      inTransit: 'In transit',
      outTransit: 'Not in transit',
      companyTruck: '🚛 Company truck',
      ownTruck: '🚛 Own truck',
      levelBadge: 'Level {n} — {name}',
      baseCard: 'Home base',
      baseCity: 'Home city:',
      company: 'Company:',
      commission: 'Commission:',
      shift: 'Shift:',
      pctOfFreight: '{p}% of the freight',
      advanceTime: 'Advance time (+1h)',
      rainBadge: '🌧 Rain today: {p}%',
      trafficBadge: '🚗 Traffic today: {v}×',
      trafficTitle: 'Traffic probability: {p}%',
      copyTraffic: 'Copy g_traffic {v} command',
      actionsHeader: 'Quick actions',
      checklistHeader: 'Daily checklist',
      noProfile: 'Create a profile to start',
      createProfileBtn: '+ Create profile',
      heroIntro: 'Log meals, lodging, loads and commissions. The app keeps track of your campaign balance — the in-game money is managed by you.'
    },

    actions: {
      noProfile: 'Create a profile first.',
      breakfast: 'Log breakfast',
      lunch: 'Log lunch',
      dinner: 'Log dinner',
      lodging: 'Log lodging',
      sleep: '🌙 Sleep / next day',
      sleepHint: 'Lodging already logged — advances to tomorrow at {t} with no new charge.',
      salary: '💰 Receive salary ({m})',
      payEmployees: '👥 Pay employees ({n}): {m} (salary {s} + charges {c})',
      insurance: '🛡 Pay ATS insurance ({m})',
      newCargo: '🚛 Log a new load',
      deliver: '✅ Deliver: {from} → {to} ({m})',
      reposition: '🧭 Log empty relocation',
      toll: '🛣 Log toll',
      fuel: '⛽ Log refueling',
      expense: '💸 Log expense / entry',
      empTravel: '🧳 Employee travel expense',
      payFinancing: 'Pay installment ({m})'
    },

    checklist: {
      empty: '—',
      done: 'done',
      companyPays: ' (company pays)',
      lodging: 'Lodging',
      footer: 'Day {n} of 30 · {w}',
      inTransit: 'in transit',
      outTransit: 'not in transit'
    },

    fin: {
      balanceHeader: 'Balance',
      initialBalance: 'Starting balance:',
      ledgerHeader: 'Ledger',
      newEntry: '+ New expense / income',
      levelBadge: 'Level {n}',
      noProfile: 'No profile.',
      empty: 'No entries yet. Starting balance: {m}.',
      dayPrefix: 'Day {n}'
    },

    financing: {
      header: 'Active Financings',
      newBtn: '+ New financing',
      upcomingHeader: 'Upcoming Payments',
      empty: 'No active financing.',
      emptyUpcoming: 'No installments due soon.',
      locked: 'Available from <strong>Level 2</strong> (own truck).',
      contractDesc: 'Description',
      contractPrincipal: 'Financed amount',
      contractTotal: 'Total with interest',
      contractInstallments: 'Installments',
      contractPaid: 'Paid',
      contractRemaining: 'Remaining',
      contractMonthly: 'Installment amount',
      contractNextDay: 'Next due (day)',
      contractProgress: '{paid} of {total}',
      payBtn: 'Pay installment',
      overdueBadge: 'overdue',
      noContracts: 'No active financing.',
      lvl2Required: 'Available only from Level 2 (own truck).'
    },

    financingModal: {
      title: 'New financing',
      rule: 'Tio Restanho\'s rule: <strong>financed amount + 20% ÷ 12 months</strong>. 1 installment every 30 days.',
      description: 'Description (optional)',
      descPh: 'e.g. Volvo FH16 Truck',
      amount: 'Financed amount (principal)',
      downPayment: 'Down payment (optional)',
      installments: 'Installments',
      interest: 'Interest (%)',
      cancel: 'Cancel',
      confirm: 'Create financing',
      summary: 'Total with interest: <strong>{total}</strong> · Installment: <strong>{monthly}</strong> · {installments}x',
      amountToast: 'Enter a valid amount.',
      createdToast: 'Financing created successfully.'
    },

    financingAlert: {
      overdue: '⚠️ <strong>{n} installment(s) overdue</strong> — total: {m}. Tap "Pay installment" to settle.',
      payBtn: 'Pay installment'
    },

    cargo: {
      header: 'Loads',
      newBtn: '➕ New load',
      empty: 'No loads registered.',
      empty2: '—',
      activeBadge: 'in progress',
      deliveredBadge: 'delivered',
      driver: 'Driver: {name}',
      freight: 'Freight {m}',
      yourCommission: 'your commission {p}% = {m}',
      empCommission: 'emp. 5% = {m}',
      km: '{n} km',
      deliveredDay: 'delivered on day {n}',
      startedDay: 'started on day {n}',
      deliverBtn: 'Deliver',
      you: 'You',
      employee: 'Employee'
    },

    emp: {
      header: 'Employees',
      addBtn: '+ Add',
      empty: '—',
      locked: 'Available at <strong>Level 4 (Business owner)</strong>. There you manage trucks with drivers: salary {s} + {p}% charges every {d} days, commission of {c}% on freight, travel expenses on you. Fines are paid by the employee.',
      noEmployees: 'No employees hired. Click "+ Add".',
      salaryLine: 'Salary {s} + {p}% charges (day {d})',
      pending: 'pending',
      paid: 'paid',
      travelExpense: 'Travel expense'
    },

    meal: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner'
    },

    expense: {
      toll: {
        label: 'Toll',
        note: 'Levels 1–2: paid by the employer.'
      },
      fuel: {
        label: 'Fuel',
        note: 'Level 1: company pays. Levels 2–3: yours.'
      },
      maintenance: {
        label: 'Truck maintenance',
        note: 'Level 1: company pays. Levels 2–3: yours.'
      },
      ferry: {
        label: 'Ferry / Train',
        note: 'Levels 1–2: paid by the employer.'
      },
      tag: {
        label: 'Tag (automatic toll)',
        note: 'Costs {C}{TAG} per country. Level 1: N/A.'
      },
      fine: {
        label: 'Fine / violation',
        note: 'Always paid by the player.'
      },
      insurance: {
        label: 'ATS insurance (every {SALARYDAY} days)',
        note: 'ATS only, level 3+. ETS2 has none.'
      },
      financing: {
        label: 'Financing (installment)',
        note: 'Rule: price + 20% ÷ 12 months, 1 installment every {SALARYDAY} days.',
        entry: 'Financing entry',
        downPayment: 'Down payment',
        payment: 'Installment {n} of {total}',
        remaining: 'overdue'
      },
      repairL: {
        label: 'Repair — light accident',
        note: 'Level 3+: 2 days stopped for repairs.'
      },
      rollover: {
        label: 'Repair — rollover',
        note: 'Level 3+: 30 days. Levels 1–2: fired + 10 days stopped.'
      },
      emp_travel: {
        label: 'Employee travel expense',
        note: 'Paid by you (lodging {C}{LODGING} + meals {C}{BREAKFAST}/{C}{LUNCH}/{C}{DINNER} while in transit). Employee fines are on him.'
      },
      salary: {
        label: 'Salary (income)',
        note: 'Level 1: {C}{SALARY1} · Level 2: {C}{SALARY2}. Day {SALARYDAY}.'
      },
      commission: {
        label: 'Commission (freight income)',
        note: 'Level 1: {COMM1}% · Level 2: {COMM2}% · Level 3: {COMM3}%.'
      },
      other: {
        label: 'Other',
        note: ''
      },
      entry: 'Entry'
    },

    common: {
      weekday: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      level: ['', 'Employee', 'Employee w/ truck', 'Self-employed', 'Business owner']
    },

    rules: {
      header: 'Campaign rules',
      cmdAccordion: 'Campaign commands',
      costAccordion: 'Costs and shift',
      levelAccordion: 'Levels 1–4',
      cmdIntro: 'Run these in the game console (key <code>`</code>). All in <strong>lowercase</strong>. Click the button to copy:',
      copyCmdTitle: 'Copy command',
      cmd: [
        { desc: 'more realistic brakes (~30% power). Run <strong>1 time</strong>.' },
        { desc: 'doubles traffic. Run <strong>1 time</strong>.' },
        { desc: 'makes the game slightly slower (more realistic). Must be <strong>repeated every session</strong>, as the game resets it to 1 on restart.' },
        { desc: 'sets the time. E.g. <code>g_set_time 7</code> = 07:00; <code>g_set_time 6 20</code> = 06:20. Only advances the clock (never back).' }
      ],
      custos: [
        '{b} {mb} ({db}) · {l} {ml} ({dl}) · {d} {md} ({dd})',
        'Lodging (off-transit) {m} — advances to the next day {t}',
        'Shift: {t} · work interval: 11h',
        'Unloading: {d}',
        'Tag: {m} per country · ATS insurance: {m2}/{d} days',
        'Weather: every new day the app rolls the rain (0–100%) — 70% chance of up to 10%, 30% chance of above 10%. Informational value.'
      ],
      niveis: [
        '<b>L1 Employee:</b> salary {s}/month · commission {c}% · toll/ferry-train/fuel/on-road meals paid by company · fired on rollover (+10 days)',
        '<b>L2 Own truck:</b> salary {s}/month · commission {c}% · fuel and maintenance yours · tag {t}/country · financing = price +20% ÷ 12 months',
        '<b>L3 Self-employed:</b> income {c}% of freight · everything on you · light accident = 2 days · rollover = 30 days · ATS insurance {s}/{d} days',
        '<b>L4 Business owner:</b> L3 rules + you earn {c}% of freight; employee: salary {s} + {p}% charges every {d} days, commission {e}% of freight, travel expenses on you, fines on him'
      ],
      setup: '<p class="mb-2">The game console must be enabled <strong>once</strong> (or again if you reinstall the game). Follow these steps:</p><ol class="mb-2"><li><strong>Close the game.</strong> The <code>config.cfg</code> file can only be edited while the game is closed — if it is open, the game rewrites the file when closing and undoes your change.</li><li><strong>Find the file.</strong> On Windows, open the <strong>Documents</strong> folder (My Documents). Inside it, look for:<br>• ETS2 → <code>Documents\\Euro Truck Simulator 2\\config.cfg</code><br>• ATS → <code>Documents\\American Truck Simulator\\config.cfg</code></li><li><strong>Open with Notepad.</strong> Right-click <code>config.cfg</code> → <em>Open with</em> → <em>Notepad</em>.</li><li><strong>Enable the console.</strong> Use Ctrl+F to find both lines and change the value <code>"0"</code> to <code>"1"</code>:<br>• <code>uset g_console "0"</code> → <code>uset g_console "1"</code><br>• <code>uset g_developer "0"</code> → <code>uset g_developer "1"</code></li><li><strong>Save and open the game.</strong> Ctrl+S to save, close Notepad and start the game normally.</li><li><strong>Open the in-game console.</strong> Press the <code>`</code> key (backtick — right above Tab, next to the 1 key). A text bar appears on screen.</li><li><strong>Type the commands.</strong> Each command + Enter. All in <strong>lowercase</strong>.</li></ol><strong>Game menu options (Options → Gameplay):</strong><ul class="mb-2"><li>Fatigue / tiredness: <strong>on</strong></li><li>Mandatory rest stops: <strong>off</strong></li><li>Traffic offences: <strong>on</strong></li><li>Parking: <strong>random</strong></li><li>Do NOT touch <code>g_income_factor</code> (keep it at 1 — changing it breaks the campaign economy)</li></ul><p class="mb-0 small text-muted">Tip: if the game says <em>"Unknown command"</em>, check that you typed everything in lowercase and that the console was enabled (Step 4).</p>'
    },

    profile: {
      header: 'Campaign profile',
      name: 'Profile name',
      game: 'Game',
      gameAts: 'American Truck Simulator (US$)',
      gameEts2: 'Euro Truck Simulator 2 (€)',
      baseCity: 'Home city',
      company: 'Company',
      startBalance: 'Starting balance (only applied if the ledger is empty)',
      delete: 'Delete profile',
      changeLevel: 'Change level',
      save: 'Save',
      deleteConfirmTitle: 'Delete profile',
      deleteConfirmBody: 'Delete <strong>{name}</strong> and all its data? (You can undo with the Undo button.)'
    },

    config: {
      title: '⚙️ Global settings',
      mealsHeader: 'Meals (quick actions)',
      colAction: 'Action',
      colStart: 'Window starts',
      colEnd: 'Window ends',
      colDuration: 'Duration (min)',
      colAmount: 'Amount',
      lodgingHeader: 'Lodging',
      lodgingAmount: 'Lodging cost',
      lodgingNext: 'Advance to next day at',
      shiftHeader: 'Shift & times',
      shiftStart: 'Shift start',
      shiftEnd: 'Shift end (employee)',
      shiftRest: 'Rest (self-employed)',
      shiftDelivery: 'Unloading (min)',
      finHeader: 'Finances',
      payDay: 'Payday (salary/insurance/charges)',
      salaryN: 'Salary L{n}',
      commN: 'Commission L{n} (%)',
      tagLabel: 'Tag (automatic toll) per country',
      insuranceLabel: 'ATS insurance (per period)',
      empSalary: 'Employee salary',
      empCharges: 'Employee charges (%)',
      empCommission: 'Employee commission (%)',
      resetBtn: 'Reset to defaults',
      saveBtn: 'Save settings',
      backupLabel: 'Multi-device backup:',
      exportBtn: '⬇ Export JSON',
      importBtn: '⬆ Import JSON',
      exportTitle: 'Export all profiles and settings to a .json file',
      importTitle: 'Import profiles and settings from a .json file',
      close: 'Close',
      backupVersion: 'Backup v{v} · generated on {d}',
      resetConfirmTitle: 'Reset to defaults',
      resetConfirmBody: 'Restore all settings to default values?',
      resetToast: 'Settings restored to defaults.',
      savedToast: 'Settings saved.',
      mealsInvalid: 'Invalid meal windows: the end must be after the start.',
      lodgingInvalid: 'Invalid lodging advance time.',
      shiftInvalid: 'Invalid shift times.'
    },

    newProfile: {
      title: 'New campaign profile',
      name: 'Profile name',
      namePh: 'e.g. ATS Campaign - San Diego',
      game: 'Game',
      cancel: 'Cancel',
      create: 'Create profile',
      hint: 'Starting balance: {c}{n}. Home city and company are set next.',
      defaultName: 'Campaign {n}'
    },

    selectProfile: {
      title: 'Start campaign',
      newBtn: '+ Create new profile',
      cancel: 'Cancel',
      empty: 'No profiles created yet. Click <em>+ Create new profile</em>.'
    },

    startSetup: {
      title: 'Game setup',
      ok: 'Got it'
    },

    cargoModal: {
      title: 'Log a load',
      driver: 'Driver',
      origin: 'Origin',
      dest: 'Destination',
      distance: 'Distance (km)',
      freight: 'Freight value',
      time: 'Departure time',
      commissionLabel: 'Your commission:',
      ofFreight: 'of the freight.',
      cancel: 'Cancel',
      start: 'Start trip',
      hint1: 'Levels 1–2: loads <strong>only from your company</strong> ({c}). Take the first available one.',
      hint2: 'Level 3: free hauling for any company.',
      hint3: 'Level 4: when you drive you earn {p}% of the freight; on employee trucks you earn {p}% and pay them {e}% commission.',
      driverYou: 'You (earn {p}%)',
      driverEmp: '{name} (you earn {p}%, employee earns {e}%)',
      driverYou2: 'You',
      fillToast: 'Fill in origin, destination and freight value.'
    },

    repositionModal: {
      title: 'Empty relocation',
      origin: 'Origin',
      dest: 'Destination',
      dep: 'Departure time',
      arr: 'Arrival time',
      cancel: 'Cancel',
      confirm: 'Confirm',
      hint1: 'Driving <strong>empty</strong> to the nearest branch of your company. Meals and lodging in transit are still paid by the employer (L1–2).',
      hint2: 'Driving <strong>empty</strong> (no load) to reposition the truck. Everything on you (L3–4).',
      hint3: 'Driving empty to the nearest branch of your company ({c}).',
      hint4: 'Driving empty (no load).',
      destToast: 'Enter the relocation destination.',
      timeToast: 'Invalid time.',
      arrAfterDep: 'Arrival time must be after departure time.',
      departureAt: 'Departed at {t}.',
      labelStart: 'Empty relocation: {from} → {to}',
      labelArrive: 'Relocation arrival: {to}',
      noteArrive: '{from} → {to} driving empty in {d}.'
    },

    expenseModal: {
      title: 'Log expense / income',
      type: 'Type',
      dir: 'Direction',
      dirOut: 'Out (spending)',
      dirIn: 'In (income)',
      amount: 'Amount (always positive)',
      note: 'Note',
      time: 'When it happened',
      city: 'City where it happened (optional)',
      cityDest: 'Destination city (optional)',
      cancel: 'Cancel',
      save: 'Record',
      employerPays: 'Paid by employer — will not be deducted.',
      coveredToast: 'Expense paid by employer — was not deducted.'
    },

    timeModal: {
      title: 'Advance time (+1h)',
      now: 'Now:',
      next: 'Next action:',
      addHour: '+1 hour',
      addHourBlocked: '+1 hour (blocked — next action is here)',
      helper: 'Advances 1h of game time and copies the <code>g_set_time</code> command. Stays blocked when the next action has arrived — log it first.',
      copiedLabel: 'Copied command:',
      dueIn: '· in {d}',
      now2: '· now',
      nextNone: '—',
      nowBig: 'Day {d} · {w} · {t}',
      restNow: 'Rest — log lodging and sleep',
      rest: 'Rest / shift end ({t})',
      restFree: 'Rest / bedtime ({t})',
      sleepTomorrow: 'Sleep — tomorrow at {t}',
      shiftTomorrow: 'Shift start (tomorrow {t})',
      regNow: '{label} — log it now',
      arrivedToast: 'The next action has arrived — log it before advancing.'
    },

    levelModal: {
      title: 'Change campaign level',
      cancel: 'Cancel',
      up: 'Level up',
      max: '<span class="text-muted">You are already at the max level.</span>',
      rules2: 'Level 2 — Employee with own truck.<br>• Salary {s}/month<br>• Commission {c}%<br>• Fuel and maintenance yours<br>• Tag {t} per country<br>• Financing: price + 20% ÷ 12 months',
      rules3: 'Level 3 — Self-employed (truck + trailer).<br>• No salary; income = {c}% of freight<br>• Everything on you<br>• Light accident = 2 days · Rollover = 30 days<br>• ATS insurance {s}/{d} days',
      rules4: 'Level 4 — Business owner.<br>• Level 3 rules<br>• Employees (module in a future version)',
      entry: 'Promotion to Level {n}',
      toast: 'Level updated: {name}',
      onlyLevel4: 'Available at Level 4 (Business owner).'
    },

    employeeModal: {
      title: 'Hire employee',
      name: 'Driver name',
      namePh: 'e.g. John',
      cancel: 'Cancel',
      hire: 'Hire',
      hint: 'Salary {s} + {p}% charges every {d} days · commission {c}% of freight · travel expenses on you.',
      nameToast: 'Enter the employee\'s name.',
      hiredToast: 'Employee hired: {name}'
    },

    confirm: {
      title: 'Confirm',
      amount: 'Amount',
      time: 'When the action happened',
      city: 'City where it happened (optional)',
      cancel: 'Cancel',
      ok: 'Confirm',
      amountToast: 'Enter a valid amount.',
      employerNoDebit: 'In transit — paid by the employer (no debit).',
      debit: 'Debit {m} from your balance?',
      dayTime: 'Day {d}, {t}',
      coveredNote: 'Paid by employer — will not be deducted (value kept for reference).',
      yourCost: 'Debit from your balance.',
      enterAmount: 'Enter the amount of <strong>{label}</strong>:',
      sleepTitle: 'Sleep / next day',
      sleepBody: 'Lodging already logged today. Advance straight to <strong>tomorrow at {t}</strong>? No new charge.',
      salaryTitle: 'Receive salary',
      salaryBody: 'Receive {m} for day {d}?',
      payEmpTitle: 'Pay employees',
      payEmpBody: 'Pay <strong>{n} employee(s)</strong>:<br>• Salaries: {s}<br>• Charges ({p}%): {c}<br><strong>Total: {t}</strong>',
      insuranceTitle: 'Pay insurance',
      insuranceBody: 'Pay {m} for the ATS vehicle insurance?',
      lodgingTitle: 'Lodging',
      financingPaymentTitle: 'Pay financing installment',
      financingPaymentBody: 'Pay $ {m} for the overdue installment?',
      deliverTitle: 'Deliver load',
      deliverBody: 'Deliver {from} → {to} and credit the {m} commission?',
      empTravelNote: 'Travel expenses of employee {name} (in transit).'
    },

    daySummary: {
      titleSingle: 'Day {n} summary · {w}',
      titleRange: 'Days {a} to {b} summary',
      positive: 'positive',
      negative: 'negative',
      neutral: 'neutral',
      start: 'Starting balance',
      income: 'Day\'s income',
      outgo: 'Day\'s expenses',
      result: 'Result (income − expenses)',
      final: 'Final balance',
      done: 'done',
      missing: 'missing',
      checklistTitle: 'Daily checklist',
      complete: 'Complete ✓',
      missingCount: '{n} of {total} actions missing',
      checklistRangeTitle: 'Days checklist',
      pending: 'Pending',
      dayPrefix: 'Day {n}',
      empty: 'No movements in the period.',
      movementsHeader: 'Day movements',
      weatherTitle: 'Next day rain forecast',
      weatherValue: '{p}%',
      trafficTitle: 'Next day traffic',
      trafficValue: '{v}×',
      ok: 'Ok'
    },

    cmd: {
      title: 'Console command',
      copy: 'Copy',
      autoCopy: 'Skip this step and auto-copy next times',
      ok: 'Ok',
      copied: 'The command was copied. Open the game console (key `), paste and press Enter.',
      failed: 'Could not copy automatically — use the Copy button and paste into the game console (key `).',
      toastOk: 'Command copied to the clipboard. Paste it into the game console (key `).',
      toastFail: 'Could not copy automatically — copy manually: <code>{cmd}</code>',
      autoToast: 'Command will be copied automatically next times.',
      copiedToast: 'Command copied!',
      failToast: 'Failed to copy.'
    },

    changelog: {
      titleUpdated: '🚀 Updated to v{v}',
      title: 'Changelog — v{v}',
      empty: 'No changes recorded.',
      new: 'new',
      ok: 'Ok',
      see: 'view changelog'
    },

    toast: {
      nothingUndo: 'Nothing to undo.',
      undone: 'Action undone.'
    },

    suggest: {
      config: 'Set up the campaign: choose a home city and company in Settings.',
      allDone: 'Everything logged today (breakfast, lunch, dinner and lodging). Tap <strong>Sleep / next day</strong> to advance to {t} tomorrow.',
      shiftEnd: 'End of shift (≥ {t}). {dinner}find a rest area, log lodging and get some rest. Tomorrow starts at {start}.',
      dinnerMissing: 'Log dinner and ',
      restTime: 'Time to rest. Find a rest area and log lodging{dinner}. Go to sleep.',
      dinnerParenthetical: ' (and dinner, if not yet logged)',
      mealHeadBreakfast: 'Breakfast time',
      mealHead: '{label} time',
      mealDo: 'Take a break and log the {label}.',
      mealEmployerNote: ' In transit — paid by employer.',
      empPayday: 'Day {d} — pay the employees: {n} × (salary {s} + {p}% charges) = {total}.',
      salaryDay: 'Day {d} — receive your salary ({m}).',
      insuranceDay: 'Day {d} — pay the ATS vehicle insurance ({m}).',
      sunday: 'Sunday — rest day (levels 1–2). Log meals and lodging at your own expense.',
      inTransit: 'In transit: {from} → {to} (freight {m}). On arrival, use "Deliver load".',
      beforeShift: 'Before the shift (starts at {t}). Advance the time to {t} to begin.',
      shiftStart: 'Shift start at base — take the first company load ({c}), no picking.',
      noCargoBase: 'No load in progress. At base, take the first load of your company ({c}) — no picking.',
      noCargoBranch: 'No load in progress. Go to the nearest branch of your company ({c}) and take the first available load.',
      noCargoFree: 'No load in progress. Look for a new freight (any company), log the load and hit the road.',
      shiftRunning: 'Shift in progress. Continue the route, log meals/lodging and keep an eye on the 11h work limit.',
      financingDue: '{n} installment(s) due totaling $ {m}',
      rodando: 'Driving since {t}. Stop to log meal/lodging or keep driving.',
      rodagem: 'Driving since {t}. Stop to log meal/lodging or keep driving.'
    },

    entry: {
      mealEmployer: 'In transit — paid by the employer.',
      mealInTransit: 'In transit.',
      mealOutTransit: 'Not in transit.',
      lodgingOutTransit: 'Not in transit (your cost).',
      city: ' · in {c}',
      lodging: 'Lodging',
      cargoLabel: 'Load: {from} → {to}{emp}',
      cargoNoteOwn: 'Freight {m} · commission {p}% = {c} on delivery.',
      cargoNoteEmp: 'Freight {m} · you earn {p}% = {c} · employee {name} earns {e}% = {ec}.',
      commYouLabel: 'Commission (yours): {from} → {to}',
      commEmpLabel: 'Employee commission: {name}',
      commPlayerLabel: 'Commission: {from} → {to}',
      commNote: '{p}% of freight {m} (+1h unloading).',
      commEmpNote: '{p}% of freight {m} paid to {name}.',
      salaryLabel: 'Monthly salary',
      salaryNote: 'Paid every {d} days.',
      insuranceLabel: 'Vehicle insurance (ATS)',
      insuranceNote: 'Every {d} days.',
      empSalaryLabel: 'Salary: {name}',
      empSalaryNote: 'Employee — day {d}.',
      empChargesLabel: 'Charges ({p}%): {name}',
      empChargesNote: '{p}% on the salary paid to the government.',
      quickCovered: 'Paid by employer (no debit).',
      quickYourCost: 'Your cost.',
      quickValue: 'Reported value: {m}',
      financingEntry: 'Financing: {desc}',
      financingDownPayment: 'Down payment: $ {m}',
      financingPayment: 'Installment {n} of {total}',
      financingNote: 'Installment {n} of {total}: $ {m}'
    },

    backup: {
      exported: 'Backup exported.',
      fileName: 'campanha_realista_backup.json',
      invalid: 'Import failed: invalid file.',
      title: 'Import backup',
      body: '<p>This will <b>replace all current profiles and settings</b> with the data from the file.</p><p class="mb-0 text-muted small">Profiles: {n} &middot; Backup from another device.</p>',
      done: 'Backup imported successfully.'
    },

    combo: {
      noResult: 'No results for “{q}”',
      create: '+ Create “{q}”',
      yours: ' (yours)',
      cityCreated: 'City “{name}” created and saved on this device.',
      companyCreated: 'Company “{name}” created and saved on this device.',
      citiesAria: 'Cities',
      companiesAria: 'Companies',
      ph: 'Type to search…'
    },

    langToast: {
      changed: 'Language changed to English.'
    },

    rodagem: {
      active: 'Driving',
      startBtn: 'Start driving',
      stopBtn: 'Stop driving',
      started: 'Drive started',
      startedNote: 'Started at {t}',
      stopped: 'Drive finished',
      stoppedNote: 'Duration: {d}',
      since: 'Since {t}',
      hint: 'Mark the start of a trip (with or without cargo) to track time.',
      startTitle: 'Start driving',
      startBody: 'Start driving now ({t})? In-game time will be recorded.',
      stopTitle: 'Stop driving',
      stopBody: 'End the current drive? Total duration will be recorded.',
      stopFirst: 'Stop driving before logging a meal or lodging.',
      levelLocked: 'Available only from Level 2 (or while in transit at Level 1).',
      ongoing: 'Driving since {t}. Stop to log meal/lodging or keep driving.',
      notRunning: 'No active driving.'
    }
  }
};

function getLang() {
  try {
    var v = localStorage.getItem(LANG_KEY);
    return (v === 'en' || v === 'pt') ? v : DEFAULT_LANG;
  } catch (e) { return DEFAULT_LANG; }
}

function setLang(lang) {
  if (lang !== 'pt' && lang !== 'en') lang = DEFAULT_LANG;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
  return lang;
}

function lookupI18n(obj, key) {
  return key.split('.').reduce(function (o, k) { return o && typeof o === 'object' ? o[k] : undefined; }, obj);
}

function t(key, vars) {
  var str = lookupI18n(I18N[getLang()], key);
  if (str === undefined || str === null) str = lookupI18n(I18N[DEFAULT_LANG], key);
  if (str === undefined || str === null) str = key;
  if (vars) {
    for (var k in vars) {
      str = String(str).split('{' + k + '}').join(String(vars[k]));
    }
  }
  return str;
}

function fmtNum(v) {
  return Number(v).toLocaleString(NUM_LOCALES[getLang()] || 'pt-BR');
}

function i18nVars(el) {
  var vars = null;
  for (var i = 0; i < el.attributes.length; i++) {
    var name = el.attributes[i].name;
    if (name.indexOf('data-i18n-var-') === 0) {
      vars = vars || {};
      vars[name.slice('data-i18n-var-'.length)] = el.getAttribute(name);
    }
  }
  return vars;
}

function applyStaticI18n() {
  document.documentElement.setAttribute('lang', getLang() === 'en' ? 'en' : 'pt-BR');
  document.title = t('app.title');
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.getAttribute('data-i18n'), i18nVars(el));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  document.querySelectorAll('#btnLang, #btnLangStart').forEach(function (el) {
    if (el) el.textContent = t('lang.button');
  });
}
