'use strict';

/* ============================================================
   CAMPANHA REALISTA — ETS2 / ATS
   App simples: HTML + JS + localStorage
   ============================================================ */

const STORAGE_KEY = 'realistic_campaign_app';
const THEME_KEY = 'realistic_campaign_theme';
const CONFIG_KEY = 'realistic_campaign_config';

const APP_VERSION = '1.0.1';
const APP_VERSION_DATE = '2026-08-07';

const CONST = {
  weekdays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
  levelNames: ['', 'Empregado', 'Empregado c/ caminhão', 'Autônomo', 'Empresário'],
  campaignCommands: [
    { cmd: 'g_brake_intensity 0.3', desc: 'freio mais realista (~30% da força). Roda <strong>1 vez</strong>.' },
    { cmd: 'g_traffic 2', desc: 'dobra o tráfego. Roda <strong>1 vez</strong>.' },
    { cmd: 'warp 0.92', desc: 'deixa o jogo levemente mais lento (mais realista). Precisa <strong>repetir em toda sessão</strong>, pois o jogo volta para 1 ao reiniciar.' },
    { cmd: 'g_set_time H [M]', desc: 'define a hora. Ex.: <code>g_set_time 7</code> = 07:00; <code>g_set_time 6 20</code> = 06:20. Só avança o relógio (não volta).' }
  ]
};

/* Configurações globais (localStorage). Default = valores atuais do app. */

const DEFAULT_CONFIG = {
  meals: {
    breakfast: { label: 'Café da manhã', amount: 15, startMin: 6 * 60,         endMin: 8 * 60 + 30,  durationMin: 5 },
    lunch:     { label: 'Almoço',        amount: 25, startMin: 11 * 60 + 30,   endMin: 14 * 60,      durationMin: 60 },
    dinner:    { label: 'Jantar',        amount: 20, startMin: 17 * 60,        endMin: 19 * 60 + 30, durationMin: 60 }
  },
  lodging: { amount: 45, nextDayHour: 6 },
  turno:   { startHour: 7, employeeEndHour: 18, freeRestHour: 20, deliveryMin: 60 },
  salary:        { 1: 1300, 2: 1500, 3: 0, 4: 0 },
  commission:    { 1: 0.05, 2: 0.10, 3: 0.20, 4: 0.30 },
  insuranceAts: 200,
  tag: 15,
  employeeSalary: 1300,
  employeeChargesPct: 0.70,
  employeeCommission: 0.05,
  salaryDay: 30,
  autoCopyCmd: false
};

function cloneConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function sanitizeNumber(v, def, min, max) {
  v = parseFloat(v);
  if (isNaN(v)) return def;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

function sanitizeConfig(c) {
  if (!c || typeof c !== 'object') return cloneConfig();
  const out = cloneConfig();
  ['breakfast', 'lunch', 'dinner'].forEach(k => {
    const m = (c.meals && c.meals[k]) || {};
    if (typeof m.label === 'string' && m.label.trim()) out.meals[k].label = m.label.trim();
    out.meals[k].amount = sanitizeNumber(m.amount, out.meals[k].amount, 0);
    out.meals[k].startMin = Math.floor(sanitizeNumber(m.startMin, out.meals[k].startMin, 0, 1439));
    out.meals[k].endMin = Math.floor(sanitizeNumber(m.endMin, out.meals[k].endMin, 0, 1439));
    out.meals[k].durationMin = Math.floor(sanitizeNumber(m.durationMin, out.meals[k].durationMin, 0));
    if (out.meals[k].endMin <= out.meals[k].startMin) {
      out.meals[k].endMin = Math.min(1439, out.meals[k].startMin + out.meals[k].durationMin + 1);
    }
  });
  if (c.lodging) {
    out.lodging.amount = sanitizeNumber(c.lodging.amount, out.lodging.amount, 0);
    out.lodging.nextDayHour = Math.floor(sanitizeNumber(c.lodging.nextDayHour, out.lodging.nextDayHour, 0, 23));
  }
  if (c.turno) {
    out.turno.startHour = Math.floor(sanitizeNumber(c.turno.startHour, out.turno.startHour, 0, 23));
    out.turno.employeeEndHour = Math.floor(sanitizeNumber(c.turno.employeeEndHour, out.turno.employeeEndHour, 0, 24));
    out.turno.freeRestHour = Math.floor(sanitizeNumber(c.turno.freeRestHour, out.turno.freeRestHour, 0, 24));
    out.turno.deliveryMin = Math.floor(sanitizeNumber(c.turno.deliveryMin, out.turno.deliveryMin, 0));
  }
  [1, 2, 3, 4].forEach(n => {
    out.salary[n] = sanitizeNumber(c.salary && c.salary[n], out.salary[n], 0);
    out.commission[n] = sanitizeNumber(c.commission && c.commission[n], out.commission[n], 0, 1);
  });
  out.insuranceAts = sanitizeNumber(c.insuranceAts, out.insuranceAts, 0);
  out.tag = sanitizeNumber(c.tag, out.tag, 0);
  out.employeeSalary = sanitizeNumber(c.employeeSalary, out.employeeSalary, 0);
  out.employeeChargesPct = sanitizeNumber(c.employeeChargesPct, out.employeeChargesPct, 0, 10);
  out.employeeCommission = sanitizeNumber(c.employeeCommission, out.employeeCommission, 0, 1);
  out.salaryDay = Math.floor(sanitizeNumber(c.salaryDay, out.salaryDay, 1, 90));
  out.autoCopyCmd = (typeof c.autoCopyCmd === 'boolean') ? c.autoCopyCmd : false;
  return out;
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return sanitizeConfig(JSON.parse(raw));
  } catch (e) { /* ignore */ }
  return cloneConfig();
}

function saveConfig() {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ }
}

function resetConfig() {
  cfg = cloneConfig();
  saveConfig();
}

let cfg = loadConfig();

const EXPENSE_TYPES = [
  { id: 'toll',        label: 'Pedágio',                     dir: 'out', def: 0,   note: 'Níveis 1–2: pago pelo empregador.' },
  { id: 'fuel',        label: 'Combustível',                 dir: 'out', def: 0,   note: 'Nível 1: empresa paga. Níveis 2–3: seu.' },
  { id: 'maintenance', label: 'Manutenção do caminhão',      dir: 'out', def: 0,   note: 'Nível 1: empresa paga. Níveis 2–3: seu.' },
  { id: 'tag',         label: 'Tag (pedágio automático)',    dir: 'out', def: 'tag', note: 'Custa {C}{TAG} por país. Nível 1: não se aplica.' },
  { id: 'fine',        label: 'Multa / infração',            dir: 'out', def: 0,   note: 'Sempre paga pelo jogador.' },
  { id: 'insurance',   label: 'Seguro ATS (a cada {SALARYDAY} dias)', dir: 'out', def: 'insurance', note: 'Somente ATS, nível 3+. ETS2 não tem.' },
  { id: 'financing',   label: 'Financiamento (parcela)',     dir: 'out', def: 0,   note: 'Regra: valor + 20% ÷ 12 meses, 1 parcela a cada {SALARYDAY} dias.' },
  { id: 'repairL',     label: 'Conserto — acidente leve',    dir: 'out', def: 0,   note: 'Nível 3+: 2 dias parado consertando.' },
  { id: 'rollover',    label: 'Conserto — tombamento',       dir: 'out', def: 0,   note: 'Nível 3+: 30 dias. Níveis 1–2: demissão + 10 dias parado.' },
  { id: 'emp_travel',  label: 'Despesa de viagem do funcionário', dir: 'out', def: 'emp_travel', note: 'Pagas por você (estadia {C}{LODGING} + refeições {C}{BREAKFAST}/{C}{LUNCH}/{C}{DINNER} em trajeto). Multas do funcionário são por conta dele.' },
  { id: 'salary',      label: 'Salário (recebimento)',       dir: 'in',  def: 0,   note: 'Nível 1: {C}{SALARY1} · Nível 2: {C}{SALARY2}. Dia {SALARYDAY}.' },
  { id: 'commission',  label: 'Comissão (renda do frete)',   dir: 'in',  def: 0,   note: 'Nível 1: {COMM1}% · Nível 2: {COMM2}% · Nível 3: {COMM3}%.' },
  { id: 'other',       label: 'Outro',                       dir: 'out', def: 0,   note: '' }
];

/* ---------------- Estado ---------------- */

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.profiles)) {
        s.profiles.forEach(normalizeProfile);
        return s;
      }
    }
  } catch (e) { /* ignore */ }
  return { version: 2, appVersion: APP_VERSION, activeProfileId: null, profiles: [] };
}

function normalizeProfile(p) {
  p.employees = p.employees || [];
  p.lastSalaryDay = p.lastSalaryDay || 0;
  p.lastInsuranceDay = p.lastInsuranceDay || 0;
  p.minute = p.minute || 0;
  p.reposition = null;
  (p.cargo || []).forEach(c => { c.driver = c.driver || 'player'; });
  return p;
}

function saveState() {
  state.appVersion = APP_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- Desfazer última ação ---------------- */

let lastSnapshot = null;

function pushUndo() {
  lastSnapshot = {
    activeProfileId: state.activeProfileId,
    profiles: JSON.parse(JSON.stringify(state.profiles))
  };
  updateUndoButton();
}

function updateUndoButton() {
  const btn = document.getElementById('btnUndo');
  if (btn) btn.style.display = lastSnapshot ? '' : 'none';
}

function undoLast() {
  if (!lastSnapshot) { toast('Nada para desfazer.', 'warning'); return; }
  state.activeProfileId = lastSnapshot.activeProfileId;
  state.profiles = lastSnapshot.profiles;
  lastSnapshot = null;
  updateUndoButton();
  saveState();
  renderAll();
  toast('Ação desfeita.', 'success');
}

function currentProfile() {
  return state.profiles.find(p => p.id === state.activeProfileId) || null;
}

function makeProfile(name, game) {
  return {
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name, game,
    currency: game === 'ATS' ? '$' : '€',
    baseCity: '', company: '',
    level: 1, startBalance: 5000, balance: 5000,
    day: 1, weekday: 0, hour: 7, minute: 0,
    currentCity: '', inTransit: false,
    lastSalaryDay: 0, lastInsuranceDay: 0,
    log: [], cargo: [], employees: []
  };
}

/* ---------------- Helpers ---------------- */

function pct(p) { return Math.round(cfg.commission[p.level] * 100); }
function isInTransit(p) { return p.cargo.some(c => c.status === 'active' && c.driver === 'player'); }
function money(p, v) { return p.currency + (Math.round(v * 100) / 100).toLocaleString('pt-BR'); }
function pad2(n) { return String(n).padStart(2, '0'); }
function uid() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* Tempo: relógio da carreira (day / weekday / hour / minute) */

function currentMinutes(p) { return p.hour * 60 + (p.minute || 0); }

function toAbs(p) { return (p.day - 1) * 1440 + currentMinutes(p); }

function fromAbs(p, abs) {
  const oldDay = p.day;
  p.day = Math.floor(abs / 1440) + 1;
  p.weekday = (((p.weekday + (p.day - oldDay)) % 7) + 7) % 7;
  const rem = ((abs % 1440) + 1440) % 1440;
  p.hour = Math.floor(rem / 60);
  p.minute = rem % 60;
}

function timeToAbsolute(p, h, m) {
  const target = (p.day - 1) * 1440 + h * 60 + (m || 0);
  return target < toAbs(p) ? target + 1440 : target;
}

function emitTimeCmd(p) {
  const cmd = 'g_set_time ' + p.hour + (p.minute ? ' ' + p.minute : '');
  setCommand(cmd, { copy: true });
}

function applyActionTime(p, h, m, durationMin) {
  const startAbs = timeToAbsolute(p, h, m);
  fromAbs(p, startAbs + (durationMin || 0));
  saveState();
  emitTimeCmd(p);
}

function addEntry(p, { type, label, amount, note }) {
  p.log.unshift({
    id: uid(), day: p.day, hour: p.hour, minute: p.minute || 0, weekday: p.weekday,
    type, label, amount: Math.round(amount * 100) / 100, note: note || '', at: new Date().toISOString()
  });
  p.balance = Math.round((p.balance + amount) * 100) / 100;
}

function employerPaysMeals(p) { return p.level <= 2; }
function employerPaysLodging(p) { return p.level <= 2; }

/* Comando + clipboard */

function setCommand(cmd, opts) {
  opts = opts || {};
  if (opts.copy !== false) {
    copyText(cmd).then(ok => showCommandModal(cmd, ok));
  }
}

function showCommandModal(cmd, ok) {
  if (cfg.autoCopyCmd) {
    toast(ok
      ? 'Comando copiado para a área de transferência. Cole no console do jogo (tecla `).'
      : 'Não foi possível copiar automaticamente — copie manualmente: <code>' + cmd + '</code>',
      ok ? 'success' : 'danger');
    return;
  }
  const t = document.getElementById('cmdText');
  if (t) t.value = cmd;
  const chk = document.getElementById('chkAutoCopyCmd');
  if (chk) chk.checked = false;
  const st = document.getElementById('cmdStatus');
  if (st) {
    st.textContent = ok
      ? 'O comando foi copiado. Abra o console do jogo (tecla `), cole e pressione Enter.'
      : 'Não foi possível copiar automaticamente — use o botão Copiar e cole no console do jogo (tecla `).';
  }
  modal('Cmd').show();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e2) { return false; }
  }
}

/* ---------------- Toasts ---------------- */

function toast(msg, kind) {
  const area = document.getElementById('toastArea');
  const el = document.createElement('div');
  el.className = 'toast align-items-center text-bg-' + (kind || 'secondary') + ' border-0 show';
  el.setAttribute('role', 'alert');
  el.innerHTML = '<div class="d-flex"><div class="toast-body">' + msg + '</div>' +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
  area.appendChild(el);
  setTimeout(() => { el.remove(); }, 3500);
}

/* ---------------- Modais ---------------- */

const modals = {};
function modal(name) {
  if (!modals[name]) modals[name] = new bootstrap.Modal(document.getElementById('modal' + name));
  return modals[name];
}

/* ---------------- Ações de negócio ---------------- */

function actionMeal(p, kind) {
  const meal = cfg.meals[kind];
  const inT = isInTransit(p);
  const employer = employerPaysMeals(p) && inT;
  const amount = employer ? 0 : -meal.amount;
  addEntry(p, {
    type: 'meal_' + kind, label: meal.label,
    amount, note: employer ? 'Em trajeto — pago pelo empregador.' : (inT ? 'Em trajeto.' : 'Fora de trajeto.')
  });
  afterTransaction(p, 'meal_' + kind);
}

function actionLodging(p) {
  const inT = isInTransit(p);
  const employer = employerPaysLodging(p) && inT;
  const amount = employer ? 0 : -cfg.lodging.amount;
  addEntry(p, {
    type: 'lodging', label: 'Estadia',
    amount, note: employer ? 'Em trajeto — pago pelo empregador.' : (inT ? 'Em trajeto.' : 'Fora de trajeto (por sua conta).')
  });
  afterTransaction(p, 'lodging');
}

function actionSalary(p) {
  const amount = cfg.salary[p.level] || 0;
  addEntry(p, { type: 'salary', label: 'Salário mensal', amount: amount, note: 'Pago a cada ' + cfg.salaryDay + ' dias.' });
  p.lastSalaryDay = p.day;
  afterTransaction(p, 'salary');
}

function actionInsurance(p) {
  addEntry(p, { type: 'insurance', label: 'Seguro do veículo (ATS)', amount: -cfg.insuranceAts, note: 'A cada ' + cfg.salaryDay + ' dias.' });
  p.lastInsuranceDay = p.day;
  afterTransaction(p, 'insurance');
}

function startCargo(p, data) {
  const driver = data.driver || 'player';
  const emp = driver === 'player' ? null : p.employees.find(e => e.id === driver);
  const ownerPct = pct(p);
  const ownerCommission = Math.round(data.freight * cfg.commission[p.level] * 100) / 100;
  const employeeCommission = emp ? Math.round(data.freight * cfg.employeeCommission * 100) / 100 : 0;

  p.cargo.unshift({
    id: uid(), day: p.day, from: data.from, to: data.to,
    distance: data.distance, freight: data.freight,
    driver, pct: ownerPct,
    commission: ownerCommission, employeeCommission,
    status: 'active', deliveredDay: null
  });
  if (data.hour !== null && data.hour !== undefined) {
    p.hour = Math.min(23, Math.max(0, data.hour));
    p.minute = data.minute || 0;
  }

  const note = emp
    ? 'Frete ' + money(p, data.freight) + ' · você recebe ' + ownerPct + '% = ' + money(p, ownerCommission) +
      ' · funcionário ' + emp.name + ' recebe 5% = ' + money(p, employeeCommission) + '.'
    : 'Frete ' + money(p, data.freight) + ' · comissão ' + ownerPct + '% = ' + money(p, ownerCommission) + ' na entrega.';
  addEntry(p, {
    type: 'cargo_start', label: 'Carga: ' + data.from + ' → ' + data.to + (emp ? ' (' + emp.name + ')' : ''),
    amount: 0, note: note
  });
  afterTransaction(p, 'cargo_start');
}

function deliverCargo(p, cargo) {
  cargo.status = 'done';
  cargo.deliveredDay = p.day;
  if (cargo.driver && cargo.driver !== 'player') {
    const emp = p.employees.find(e => e.id === cargo.driver);
    addEntry(p, {
      type: 'commission', label: 'Comissão (sua): ' + cargo.from + ' → ' + cargo.to,
      amount: cargo.commission, note: pct(p) + '% de frete ' + money(p, cargo.freight) + ' (+1h de descarga).'
    });
    addEntry(p, {
      type: 'emp_commission', label: 'Comissão do funcionário: ' + (emp ? emp.name : '—'),
      amount: -cargo.employeeCommission, note: Math.round(cfg.employeeCommission * 100) + '% do frete ' + money(p, cargo.freight) + ' pago a ' + (emp ? emp.name : 'o funcionário') + '.'
    });
  } else {
    addEntry(p, {
      type: 'commission', label: 'Comissão: ' + cargo.from + ' → ' + cargo.to,
      amount: cargo.commission, note: pct(p) + '% de frete ' + money(p, cargo.freight) + ' (+1h de descarga).'
    });
    p.currentCity = cargo.to;
  }
  afterTransaction(p, 'commission');
}

/* ---------------- Deslocamento vazio (viagem sem carga) ---------------- */

function doReposition(p, data) {
  const hint = p.level <= 2
    ? 'Rodando vazio até a filial mais próxima da sua empresa (' + (p.company || '—') + ').'
    : 'Rodando vazio (sem carga).';

  fromAbs(p, data.depAbs);
  addEntry(p, {
    type: 'reposition_start',
    label: 'Deslocamento vazio: ' + data.from + ' → ' + data.to,
    amount: 0,
    note: hint + ' Saída às ' + pad2(p.hour) + ':' + pad2(p.minute || 0) + '.'
  });

  const durMin = data.arrAbs - data.depAbs;
  fromAbs(p, data.arrAbs);
  addEntry(p, {
    type: 'reposition_arrive',
    label: 'Chegada do deslocamento: ' + data.to,
    amount: 0,
    note: data.from + ' → ' + data.to + ' rodando vazio em ' + fmtDur(durMin) + '.'
  });

  p.currentCity = data.to;
  p.reposition = null;
  afterTransaction(p, 'reposition_arrive');
  emitTimeCmd(p);
}

/* ---------------- Funcionários (Nível 4) ---------------- */

function employeeSalaryDue(p) {
  return p.level >= 4 && p.employees.length > 0 &&
    p.day % cfg.salaryDay === 0 && p.employees.some(e => (e.lastSalaryDay || 0) !== p.day);
}

function employeeTotalSalary(p) {
  const due = p.employees.filter(e => (e.lastSalaryDay || 0) !== p.day);
  const salary = due.length * cfg.employeeSalary;
  const charges = Math.round(salary * cfg.employeeChargesPct);
  return { count: due.length, salary, charges, total: salary + charges };
}

function payEmployeeSalaries(p) {
  if (!employeeSalaryDue(p)) return;
  p.employees.forEach(e => {
    if ((e.lastSalaryDay || 0) !== p.day) {
      addEntry(p, {
        type: 'emp_salary', label: 'Salário: ' + e.name,
        amount: -cfg.employeeSalary, note: 'Funcionário — dia ' + cfg.salaryDay + '.'
      });
      addEntry(p, {
        type: 'emp_charges', label: 'Encargos (' + Math.round(cfg.employeeChargesPct * 100) + '%): ' + e.name,
        amount: -Math.round(cfg.employeeSalary * cfg.employeeChargesPct), note: Math.round(cfg.employeeChargesPct * 100) + '% sobre o salário pago ao governo.'
      });
      e.lastSalaryDay = p.day;
    }
  });
  afterTransaction(p, 'emp_salary');
}

function addEmployee(p, name) {
  p.employees.push({ id: uid(), name: name, lastSalaryDay: 0 });
}

function addExpense(p, typeId, amount, note) {
  addEntry(p, { type: typeId, label: labelOfExpense(typeId), amount: amount, note: note });
  afterTransaction(p, typeId);
}

function labelOfExpense(id) {
  const t = EXPENSE_TYPES.find(e => e.id === id);
  return t ? t.label : 'Lançamento';
}

function afterTransaction(p, type) {
  saveState();
  renderAll();
}

/* ---------------- Render: perfis ---------------- */

function renderProfileList() {
  const list = document.getElementById('profileList');
  const btn = document.getElementById('profileDropdown');
  if (state.profiles.length === 0) {
    list.innerHTML = '<li><span class="dropdown-item-text text-muted">Nenhum perfil criado</span></li>';
    btn.textContent = 'Nenhum perfil';
    return;
  }
  list.innerHTML = '';
  state.profiles.forEach(p => {
    const li = document.createElement('li');
    const a = document.createElement('button');
    a.className = 'dropdown-item' + (p.id === state.activeProfileId ? ' active' : '');
    a.textContent = p.name + (p.id === state.activeProfileId ? ' ✓' : '');
    a.addEventListener('click', () => {
      state.activeProfileId = p.id;
      saveState();
      renderAll();
    });
    li.appendChild(a);
    list.appendChild(li);
  });
  const cur = currentProfile();
  btn.textContent = cur ? cur.name + ' — Nível ' + cur.level : 'Selecionar perfil';
}

/* ---------------- Render: hoje ---------------- */

function renderToday() {
  const row = document.getElementById('todayRow');
  const p = currentProfile();
  if (!p) {
    row.innerHTML = '<div class="col"><div class="card shadow-sm"><div class="card-body text-center py-5">' +
      '<h4>Crie um perfil para começar</h4>' +
      '<button class="btn btn-primary mt-2" id="btnNewProfileHero">+ Criar perfil</button>' +
      '<p class="text-muted small mt-3 mb-0">Registre refeições, estadia, cargas e comissões. ' +
      'O app mantém o registro do seu saldo da campanha — o dinheiro no jogo é administrado por você.</p></div></div></div>';
    document.getElementById('btnNewProfileHero').addEventListener('click', openNewProfile);
    return;
  }

  const suggestion = suggestAction(p);
  const inTransitBadge = isInTransit(p)
    ? '<span class="badge text-bg-warning"><span class="status-dot bg-dark me-1"></span>Em trajeto</span>'
    : '<span class="badge text-bg-secondary"><span class="status-dot bg-light me-1"></span>Fora de trajeto</span>';

  row.innerHTML =
    '<div class="col-lg-8">' +
      '<div class="card shadow-sm h-100">' +
        '<div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">' +
          '<span class="fw-bold">' + p.name + '</span>' +
          '<span>' +
            '<span class="badge text-bg-primary me-1">Nível ' + p.level + ' — ' + CONST.levelNames[p.level] + '</span>' +
            inTransitBadge +
          '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="row text-center mb-3">' +
            '<div class="col"><small class="text-muted d-block">Dia do jogo</small><span class="stat-big">' + p.day + '</span><small class="text-muted d-block mt-1">de 30</small></div>' +
            '<div class="col"><small class="text-muted d-block">Dia da semana</small><span class="stat-big">' + CONST.weekdays[p.weekday] + '</span></div>' +
            '<div class="col"><small class="text-muted d-block">Hora</small><span class="stat-big">' + pad2(p.hour) + ':' + pad2(p.minute || 0) + '</span></div>' +
            '<div class="col"><small class="text-muted d-block">Cidade</small><span class="stat-big stat-big--city">' + (p.currentCity || '—') + '</span></div>' +
          '</div>' +
          '<div class="next-action-callout"><strong>O que fazer agora:</strong><br>' + suggestion.text +
          (suggestion.next ? '<div class="next-action-sub mt-2"><strong>Próxima ação:</strong> ' + suggestion.next + '</div>' : '') +
          '</div>' +
          '<div class="d-flex flex-wrap gap-2">' +
            '<button class="btn btn-outline-primary btn-sm" data-act="time">Avançar tempo (+1h)</button>' +
            '<button class="btn btn-outline-success btn-sm" data-act="level">Mudar nível</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="col-lg-4">' +
      '<div class="card shadow-sm h-100">' +
        '<div class="card-header fw-bold">Base</div>' +
        '<div class="card-body">' +
          '<p class="mb-1"><span class="text-muted">Cidade-base:</span> <strong>' + (p.baseCity || '—') + '</strong></p>' +
          '<p class="mb-1"><span class="text-muted">Empresa:</span> <strong>' + (p.company || '—') + '</strong></p>' +
          '<p class="mb-1"><span class="text-muted">Comissão:</span> <strong>' + pct(p) + '% do frete</strong></p>' +
          '<p class="mb-0"><span class="text-muted">Turno:</span> <strong>' + fmtTurno() + '</strong></p>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function mealRegisteredToday(p, kind) {
  return p.log.some(e => e.day === p.day && e.type === 'meal_' + kind);
}

const DAILY_SEQUENCE = ['breakfast', 'lunch', 'dinner', 'lodging'];

function dailyStepDone(p, step) {
  if (step === 'lodging') {
    return p.log.some(e => e.day === p.day && e.type === 'lodging');
  }
  return mealRegisteredToday(p, step);
}

function nextDailyStep(p) {
  for (const step of DAILY_SEQUENCE) {
    if (!dailyStepDone(p, step)) return step;
  }
  return null;
}

function fmtMin(m) {
  const abs = ((m % 1440) + 1440) % 1440;
  return pad2(Math.floor(abs / 60)) + ':' + pad2(abs % 60);
}

function fmtTurno() {
  return fmtMin(cfg.turno.startHour * 60) + '–' + fmtMin(cfg.turno.employeeEndHour * 60);
}

function fmtDur(m) {
  m = Math.max(0, Math.round(m || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return h + 'h ' + r + 'min';
  if (h) return h + 'h';
  return m + 'min';
}

function nextAction(p) {
  const now = currentMinutes(p);
  const cand = [];

  Object.keys(cfg.meals).forEach(k => {
    const w = cfg.meals[k];
    if (!mealRegisteredToday(p, k) && w.startMin > now) {
      cand.push({ at: w.startMin, label: w.label + ' (' + fmtMin(w.startMin) + '–' + fmtMin(w.endMin) + ')' });
    }
  });

  const restAt = p.level <= 2 ? cfg.turno.employeeEndHour * 60 : cfg.turno.freeRestHour * 60;
  if (now < restAt) {
    cand.push({ at: restAt, label: p.level <= 2
      ? 'Descanso / fim de turno (' + fmtMin(cfg.turno.employeeEndHour * 60) + ')'
      : 'Descanso / hora de dormir (' + fmtMin(cfg.turno.freeRestHour * 60) + ')' });
  }

  if (p.level <= 2) {
    cand.push({ at: 24 * 60 + cfg.turno.startHour * 60, label: 'Início de turno (amanhã ' + fmtMin(cfg.turno.startHour * 60) + ')' });
  }

  cand.sort((a, b) => a.at - b.at);
  return cand.length ? cand[0].label : null;
}

function nextEvent(p) {
  const now = currentMinutes(p);
  const cand = [];

  Object.keys(cfg.meals).forEach(k => {
    const w = cfg.meals[k];
    if (mealRegisteredToday(p, k)) return;
    if (now < w.startMin) {
      cand.push({ at: w.startMin, label: w.label + ' (' + fmtMin(w.startMin) + '–' + fmtMin(w.endMin) + ')' });
    } else if (now <= w.endMin) {
      cand.push({ at: now, label: w.label + ' — registre agora' });
    }
  });

  const restAt = p.level <= 2 ? cfg.turno.employeeEndHour * 60 : cfg.turno.freeRestHour * 60;
  if (now < restAt) {
    cand.push({ at: restAt, label: 'Descanso / fim de turno (' + fmtMin(restAt) + ')' });
  } else {
    cand.push({ at: now, label: 'Descanso — registre a estadia e durma' });
  }

  if (p.level <= 2) {
    cand.push({ at: 24 * 60 + cfg.turno.startHour * 60, label: 'Início de turno (amanhã ' + fmtMin(cfg.turno.startHour * 60) + ')' });
  }

  cand.sort((a, b) => a.at - b.at);
  return cand[0] || null;
}

function suggestAction(p) {
  const now = currentMinutes(p);
  const inBase = p.currentCity === p.baseCity;

  if (!p.baseCity || !p.company) {
    return { text: 'Configure a campanha: escolha cidade-base e empresa nas Configurações.' };
  }

  if (p.level <= 2 && now >= cfg.turno.employeeEndHour * 60) {
    const dinnerMissing = !mealRegisteredToday(p, 'dinner');
    return {
      text: 'Fim de turno (≥ ' + fmtMin(cfg.turno.employeeEndHour * 60) + '). ' +
        (dinnerMissing ? 'Registre o jantar e ' : '') +
        'procure um repouso, registre a estadia e vá descansar. Amanhã ' + fmtMin(cfg.turno.startHour * 60) + ' recomeça.'
    };
  }

  if (p.level >= 3 && now >= cfg.turno.freeRestHour * 60) {
    const dinnerMissing = !mealRegisteredToday(p, 'dinner');
    return {
      text: 'Hora de descansar. Procure um repouso/área de descanso e registre a estadia' +
        (dinnerMissing ? ' (e o jantar, se ainda não registrou)' : '') + '. Vá dormir.'
    };
  }

  for (const [kind, w] of Object.entries(cfg.meals)) {
    if (now >= w.startMin && now <= w.endMin && !mealRegisteredToday(p, kind)) {
      const head = kind === 'breakfast' ? 'Horário do café da manhã' : 'Horário de ' + w.label.toLowerCase();
      const actionLabel = w.label.toLowerCase();
      const employerNote = employerPaysMeals(p) && isInTransit(p) ? ' Em trajeto — pago pelo empregador.' : '';
      return {
        text: head + '. Faça uma pausa e registre o ' + actionLabel + '.' + employerNote
      };
    }
  }

  if (employeeSalaryDue(p)) {
    const t = employeeTotalSalary(p);
    return { text: 'Dia ' + cfg.salaryDay + ' — pague os funcionários: ' + t.count + ' × (salário ' + money(p, cfg.employeeSalary) + ' + ' + Math.round(cfg.employeeChargesPct * 100) + '% encargos) = ' + money(p, t.total) + '.' };
  }

  if (p.day % cfg.salaryDay === 0 && p.lastSalaryDay !== p.day && (cfg.salary[p.level] || 0) > 0) {
    return { text: 'Dia ' + cfg.salaryDay + ' — receba seu salário (' + money(p, cfg.salary[p.level]) + ').' };
  }

  if (p.game === 'ATS' && p.level >= 3 && p.day % cfg.salaryDay === 0 && p.lastInsuranceDay !== p.day) {
    return { text: 'Dia ' + cfg.salaryDay + ' — pague o seguro do veículo ATS (' + money(p, cfg.insuranceAts) + ').' };
  }

  if (p.level <= 2 && p.weekday === 6) {
    return { text: 'Domingo — dia de descanso (níveis 1–2). Registre refeições e estadia por sua conta.' };
  }

  if (isInTransit(p)) {
    const active = p.cargo.find(c => c.status === 'active' && c.driver === 'player');
    if (active) return { text: 'Em trajeto: ' + active.from + ' → ' + active.to + ' (frete ' + money(p, active.freight) + '). Ao chegar, use "Entregar carga".' };
  }

  const hasActivePlayerCargo = p.cargo.some(c => c.status === 'active' && c.driver === 'player');

  if (p.level <= 2 && now < cfg.turno.startHour * 60) {
    return { text: 'Antes do turno (começa às ' + fmtMin(cfg.turno.startHour * 60) + '). Avance o tempo até ' + fmtMin(cfg.turno.startHour * 60) + ' para começar.' };
  }

  if (p.level <= 2 && p.hour === cfg.turno.startHour && inBase) {
    return { text: 'Início de turno na base — pegue a primeira carga da empresa (' + (p.company || '') + '), sem escolher.' };
  }

  if (!hasActivePlayerCargo) {
    if (p.level <= 2) {
      return { text: inBase
        ? 'Sem carga em andamento. Na base, pegue a primeira carga da sua empresa (' + (p.company || '') + ') — não escolha.'
        : 'Sem carga em andamento. Vá até a filial da sua empresa (' + (p.company || '') + ') mais próxima e pegue a primeira carga disponível.' };
    }
    return { text: 'Sem carga em andamento. Procure um novo frete (qualquer empresa), registre a carga e siga viagem.' };
  }

  return { text: 'Turno em andamento. Continue a rota, registre refeições/estadia e fique de olho no limite de 11h de jornada.' };
}

/* ---------------- Render: ações ---------------- */

function renderActions() {
  const panel = document.getElementById('actionPanel');
  const p = currentProfile();
  if (!p) { panel.innerHTML = '<p class="text-muted small mb-0">Crie um perfil primeiro.</p>'; return; }

  const salaryDue = p.day % cfg.salaryDay === 0 && p.lastSalaryDay !== p.day && (cfg.salary[p.level] || 0) > 0;
  const insDue = p.game === 'ATS' && p.level >= 3 && p.day % cfg.salaryDay === 0 && p.lastInsuranceDay !== p.day;
  const empDue = employeeSalaryDue(p);
  const activeCargos = p.cargo.filter(c => c.status === 'active');

  let html = '';
  const nextStep = nextDailyStep(p);
  const stepBtns = [
    { key: 'breakfast', act: 'meal-breakfast', icon: '☕', label: 'Registrar café', cost: money(p, cfg.meals.breakfast.amount) },
    { key: 'lunch', act: 'meal-lunch', icon: '🍽', label: 'Registrar almoço', cost: money(p, cfg.meals.lunch.amount) },
    { key: 'dinner', act: 'meal-dinner', icon: '🌙', label: 'Registrar jantar', cost: money(p, cfg.meals.dinner.amount) },
    { key: 'lodging', act: 'lodging', icon: '🛏', label: 'Registrar estadia', cost: money(p, cfg.lodging.amount) }
  ];
  html += '<div class="action-grid mb-3">';
  stepBtns.forEach(s => {
    const enabled = nextStep === s.key;
    const state = dailyStepDone(p, s.key) ? 'done' : (enabled ? 'next' : 'locked');
    html += '<button class="btn btn-outline-warning btn-sm step-' + state + '" data-act="' + s.act + '"' +
      (enabled ? '' : ' disabled') + '>' + s.icon + ' ' + s.label + '<br><small>' + s.cost + '</small></button>';
  });
  html += '</div>';

  html += '<div class="d-grid gap-2">';
  if (salaryDue) html += '<button class="btn btn-success" data-act="salary">💰 Receber salário (' + money(p, cfg.salary[p.level]) + ')</button>';
  if (empDue) {
    const t = employeeTotalSalary(p);
    html += '<button class="btn btn-danger" data-act="payEmployees">👥 Pagar funcionários (' + t.count + '): ' + money(p, t.total) + ' (salário ' + money(p, t.salary) + ' + encargos ' + money(p, t.charges) + ')</button>';
  }
  if (insDue) html += '<button class="btn btn-danger" data-act="insurance">🛡 Pagar seguro ATS (' + money(p, cfg.insuranceAts) + ')</button>';
  html += '<button class="btn btn-primary" data-act="cargo">🚛 Registrar nova carga</button>';
  if (activeCargos.length) {
    activeCargos.forEach(c => {
      html += '<button class="btn btn-outline-success" data-act="deliver-' + c.id + '">✅ Entregar: ' + c.from + ' → ' + c.to + ' (' + money(p, c.commission) + ')</button>';
    });
  }
  if (!isInTransit(p)) {
    html += '<button class="btn btn-outline-secondary" data-act="reposition">🧭 Registrar deslocamento vazio</button>';
  }
  html += '<button class="btn btn-outline-secondary" data-act="expense">💸 Registrar despesa / lançamento</button>';
  html += '</div>';

  panel.innerHTML = html;
}

/* ---------------- Render: checklist ---------------- */

function renderChecklist() {
  const panel = document.getElementById('checklistPanel');
  const p = currentProfile();
  if (!p) { panel.innerHTML = '<p class="text-muted small mb-0">—</p>'; return; }

  const today = p.log.filter(e => e.day === p.day && (e.type.startsWith('meal_') || e.type === 'lodging'));

  const done = (kind) => {
    const found = today.find(e => e.type === kind);
    return found ? found : null;
  };

  const item = (key, label, cost, hint) => {
    const e = done(key);
    const employerNote = e && e.amount === 0 ? ' (empresa paga)' : '';
    const icon = e ? '✅' : '⬜';
    return '<div class="check-item">' +
      '<span>' + icon + '</span>' +
      '<span class="flex-grow-1">' + label + employerNote + '</span>' +
      '<span class="badge text-bg-light border">' + (e ? 'feito' : hint) + '</span>' +
      '</div>';
  };

  panel.innerHTML =
    item('meal_breakfast', cfg.meals.breakfast.label, money(p, cfg.meals.breakfast.amount), money(p, cfg.meals.breakfast.amount)) +
    item('meal_lunch', cfg.meals.lunch.label, money(p, cfg.meals.lunch.amount), money(p, cfg.meals.lunch.amount)) +
    item('meal_dinner', cfg.meals.dinner.label, money(p, cfg.meals.dinner.amount), money(p, cfg.meals.dinner.amount)) +
    item('lodging', 'Estadia', money(p, cfg.lodging.amount), money(p, cfg.lodging.amount)) +
    '<hr class="my-2">' +
    '<div class="small text-muted">Dia ' + p.day + ' · ' + CONST.weekdays[p.weekday] +
    (isInTransit(p) ? ' · em trajeto' : ' · fora de trajeto') + '</div>';
}

/* ---------------- Render: saldo + extrato ---------------- */

function renderLedger() {
  const p = currentProfile();
  const bv = document.getElementById('balanceValue');
  const bb = document.getElementById('balanceBadge');
  const sv = document.getElementById('startBalanceValue');
  const panel = document.getElementById('ledgerPanel');

  if (!p) {
    bv.textContent = '—'; bb.textContent = ''; sv.textContent = '—';
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">Sem perfil.</p>';
    return;
  }

  bv.textContent = money(p, p.balance);
  bb.textContent = 'Nível ' + p.level;
  sv.textContent = money(p, p.startBalance);

  if (p.log.length === 0) {
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">Nenhum lançamento ainda. Saldo inicial: ' + money(p, p.startBalance) + '.</p>';
    return;
  }

  panel.innerHTML = p.log.map(e => {
    const cls = e.amount > 0 ? 'amount-pos' : (e.amount < 0 ? 'amount-neg' : 'amount-zero');
    const sign = e.amount > 0 ? '+' : (e.amount < 0 ? '−' : '');
    const amountStr = e.amount === 0 ? '—' : sign + money(p, Math.abs(e.amount));
    return '<div class="entry-row">' +
      '<div class="d-flex justify-content-between align-items-center">' +
        '<div>' +
          '<div class="fw-semibold">' + e.label + '</div>' +
          '<small class="text-muted">Dia ' + e.day + ' · ' + CONST.weekdays[e.weekday] + ' · ' + pad2(e.hour) + ':' + pad2(e.minute || 0) + '</small>' +
        '</div>' +
        '<span class="' + cls + '">' + amountStr + '</span>' +
      '</div>' +
      (e.note ? '<small class="text-muted d-block">' + e.note + '</small>' : '') +
    '</div>';
  }).join('');
}

/* ---------------- Render: cargas ---------------- */

function renderCargo() {
  const panel = document.getElementById('cargoPanel');
  const p = currentProfile();
  if (!p) {
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">—</p>';
    return;
  }
  if (p.cargo.length === 0) {
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">Nenhuma carga registrada.</p>';
    return;
  }
  panel.innerHTML = p.cargo.map(c => {
    const active = c.status === 'active';
    const driverName = c.driver && c.driver !== 'player'
      ? (p.employees.find(e => e.id === c.driver) || {}).name || 'Funcionário'
      : 'Você';
    return '<div class="entry-row">' +
      '<div class="d-flex justify-content-between align-items-center">' +
        '<div>' +
          '<div class="fw-semibold">' + c.from + ' → ' + c.to +
            (active ? ' <span class="badge text-bg-warning">em andamento</span>' : ' <span class="badge text-bg-success">entregue</span>') +
          '</div>' +
          '<small class="text-muted">Motorista: ' + driverName + ' · Frete ' + money(p, c.freight) + ' · sua comissão ' + c.pct + '% = ' + money(p, c.commission) +
          (c.employeeCommission ? ' · func. 5% = ' + money(p, c.employeeCommission) : '') +
          (c.distance ? ' · ' + c.distance + ' km' : '') +
          (c.deliveredDay ? ' · entregue no dia ' + c.deliveredDay : ' · iniciada no dia ' + c.day) +
          '</small>' +
        '</div>' +
        (active ? '<button class="btn btn-sm btn-outline-success" data-act="deliver-' + c.id + '">Entregar</button>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

/* ---------------- Render: funcionários ---------------- */

function renderEmployees() {
  const panel = document.getElementById('employeePanel');
  const btn = document.getElementById('btnAddEmployee');
  const p = currentProfile();
  if (!p) {
    if (btn) btn.disabled = true;
    panel.innerHTML = '<p class="text-muted small mb-0">—</p>';
    return;
  }
  if (btn) btn.disabled = p.level < 4;
  if (p.level < 4) {
    panel.innerHTML = '<p class="text-muted small mb-0">Disponível no <strong>Nível 4 (Empresário)</strong>. ' +
      'Lá você gerencia caminhões com motoristas: salário ' + money(p, cfg.employeeSalary) + ' + ' + Math.round(cfg.employeeChargesPct * 100) + '% de encargos a cada ' + cfg.salaryDay + ' dias, comissão de ' + Math.round(cfg.employeeCommission * 100) + '% do frete, ' +
      'despesas de viagem por sua conta. Multas são por conta do funcionário.</p>';
    return;
  }
  if (p.employees.length === 0) {
    panel.innerHTML = '<p class="text-muted small mb-0">Nenhum funcionário contratado. Clique em "+ Adicionar".</p>';
    return;
  }
  panel.innerHTML = p.employees.map(e => {
    const due = (e.lastSalaryDay || 0) !== p.day;
    return '<div class="entry-row">' +
      '<div class="d-flex justify-content-between align-items-center">' +
        '<div>' +
          '<div class="fw-semibold">' + e.name + '</div>' +
          '<small class="text-muted">Salário ' + money(p, cfg.employeeSalary) + ' + ' + Math.round(cfg.employeeChargesPct * 100) + '% encargos (dia ' + cfg.salaryDay + ')' +
            (due ? ' · <span class="text-danger fw-semibold">pendente</span>' : ' · pago') +
          '</small>' +
        '</div>' +
        '<button class="btn btn-sm btn-outline-secondary" data-act="empTravel-' + e.id + '">Despesa de viagem</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ---------------- Render: regras ---------------- */

function buildStartSetupHtml() {
  return '<p class="mb-2">O console do jogo precisa ser habilitado <strong>uma única vez</strong> (ou de novo se você reinstalar o jogo). Siga os passos:</p>' +
    '<ol class="mb-2">' +
      '<li><strong>Feche o jogo.</strong> O arquivo <code>config.cfg</code> só pode ser editado com o jogo fechado — se ele estiver aberto, o jogo reescreve o arquivo ao fechar e desfaz a alteração.</li>' +
      '<li><strong>Encontre o arquivo.</strong> No Windows, abra a pasta <strong>Documentos</strong> (Meus Documentos). Dentro dela, procure:<br>' +
        '• ETS2 → <code>Documentos\\Euro Truck Simulator 2\\config.cfg</code><br>' +
        '• ATS → <code>Documentos\\American Truck Simulator\\config.cfg</code></li>' +
      '<li><strong>Abra com o Bloco de Notas.</strong> Clique com o botão direito em <code>config.cfg</code> → <em>Abrir com</em> → <em>Bloco de Notas</em> (Notepad).</li>' +
      '<li><strong>Ligue o console.</strong> Use Ctrl+F para procurar as duas linhas e mude o valor <code>"0"</code> para <code>"1"</code>:<br>' +
        '• <code>uset g_console "0"</code> → <code>uset g_console "1"</code><br>' +
        '• <code>uset g_developer "0"</code> → <code>uset g_developer "1"</code></li>' +
      '<li><strong>Salve e abra o jogo.</strong> Ctrl+S para salvar, feche o Bloco de Notas e abra o jogo normalmente.</li>' +
      '<li><strong>Abra o console dentro do jogo.</strong> Aperte a tecla <code>`</code> (crase/acento grave — fica logo acima do Tab, ao lado do número 1). Vai aparecer uma barra de texto na tela.</li>' +
      '<li><strong>Digite os comandos.</strong> Cada comando + Enter. Tudo em <strong>minúsculas</strong>.</li>' +
    '</ol>' +
    '<strong>Opções do menu do jogo (Opções → Jogo):</strong>' +
    '<ul class="mb-2">' +
      '<li>Cansaço / fadiga: <strong>ligado</strong></li>' +
      '<li>Parada obrigatória: <strong>desligada</strong></li>' +
      '<li>Infrações de trânsito: <strong>ligadas</strong></li>' +
      '<li>Estacionamento: <strong>aleatório</strong></li>' +
      '<li>NÃO mexer em <code>g_income_factor</code> (fica em 1 — mudar bagunça a economia da campanha)</li>' +
    '</ul>' +
    '<p class="mb-0 small text-muted">Dica: se o jogo avisar <em>"Unknown command"</em>, confira se digitou tudo minúsculo e se o console foi habilitado (Passo 4).</p>';
}

function buildCampaignCommandsHtml() {
  return '<p class="mb-2">Rode no console do jogo (tecla <code>`</code>). Tudo em <strong>minúsculas</strong>. Clique no botão ao lado para copiar:</p>' +
    '<ul class="mb-0 list-unstyled">' +
    CONST.campaignCommands.map((c, i) =>
      '<li class="d-flex align-items-center gap-2 mb-2">' +
        '<button class="btn btn-sm btn-outline-secondary btn-copy-cmd" type="button" data-act="copyCmd-' + i + '" title="Copiar comando">📋</button>' +
        '<code>' + c.cmd + '</code>' +
        '<span class="text-muted small">→ ' + c.desc + '</span>' +
      '</li>'
    ).join('') +
    '</ul>';
}

function renderRules() {
  const p = currentProfile();
  const m = v => (p ? p.currency : '') + v;
  const bodies = {
    rulesSetupBody: buildCampaignCommandsHtml(),
    startSetupBody: buildStartSetupHtml(),
    rulesCustosBody: '<ul class="mb-0">' +
      '<li>' + cfg.meals.breakfast.label + ' ' + m(cfg.meals.breakfast.amount) + ' (' + fmtDur(cfg.meals.breakfast.durationMin) + ') · ' + cfg.meals.lunch.label + ' ' + m(cfg.meals.lunch.amount) + ' (' + fmtDur(cfg.meals.lunch.durationMin) + ') · ' + cfg.meals.dinner.label + ' ' + m(cfg.meals.dinner.amount) + ' (' + fmtDur(cfg.meals.dinner.durationMin) + ')</li>' +
      '<li>Estadia (fora de trajeto) ' + m(cfg.lodging.amount) + ' — avança para o dia seguinte ' + fmtMin(cfg.lodging.nextDayHour * 60) + '</li>' +
      '<li>Turno: ' + fmtTurno() + ' · intervalo de jornada: 11h</li>' +
      '<li>Descarga: ' + fmtDur(cfg.turno.deliveryMin) + '</li>' +
      '<li>Tag: ' + m(cfg.tag) + ' por país · Seguro ATS: ' + m(cfg.insuranceAts) + '/' + cfg.salaryDay + ' dias</li>' +
      '</ul>',
    rulesNiveisBody: '<ul class="mb-0">' +
      '<li><b>N1 Empregado:</b> salário ' + m(cfg.salary[1]) + '/mês · comissão ' + Math.round(cfg.commission[1] * 100) + '% · pedágio/combustível/refeições-em-viagem da empresa · demissão se tombar (+10 dias)</li>' +
      '<li><b>N2 Caminhão próprio:</b> salário ' + m(cfg.salary[2]) + '/mês · comissão ' + Math.round(cfg.commission[2] * 100) + '% · combustível e manutenção seus · tag ' + m(cfg.tag) + '/país · financiamento = valor +20% ÷ 12 meses</li>' +
      '<li><b>N3 Autônomo:</b> renda ' + Math.round(cfg.commission[3] * 100) + '% do frete · tudo por sua conta · acidente leve = 2 dias · tombamento = 30 dias · seguro ATS ' + m(cfg.insuranceAts) + '/' + cfg.salaryDay + ' dias</li>' +
      '<li><b>N4 Empresário:</b> regras N3 + você recebe ' + Math.round(cfg.commission[4] * 100) + '% do frete; funcionário: salário ' + m(cfg.employeeSalary) + ' + ' + Math.round(cfg.employeeChargesPct * 100) + '% de encargos a cada ' + cfg.salaryDay + ' dias, comissão ' + Math.round(cfg.employeeCommission * 100) + '% do frete, despesas de viagem por sua conta, multas por conta dele</li>' +
      '</ul>'
  };
  Object.keys(bodies).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = bodies[id];
  });
}

/* ---------------- Render all ---------------- */

function renderAll() {
  renderStartScreen();
  renderProfileList();
  renderToday();
  renderActions();
  renderChecklist();
  renderLedger();
  renderCargo();
  renderEmployees();
  renderRules();
  renderProfile();
  const navVer = document.getElementById('appVersion');
  if (navVer) navVer.textContent = 'v' + APP_VERSION;
  bindActionButtons();
}

/* ---------------- Start Screen / Seleção de perfil ---------------- */

function renderStartScreen() {
  const hasProfile = !!currentProfile();
  const start = document.getElementById('startScreen');
  const app = document.getElementById('appMain');
  if (!start || !app) return;
  if (hasProfile) {
    start.classList.add('d-none');
    app.classList.remove('d-none');
  } else {
    start.classList.remove('d-none');
    app.classList.add('d-none');
  }
}

function renderProfileSelect() {
  const list = document.getElementById('profileSelectList');
  if (!list) return;
  if (state.profiles.length === 0) {
    list.innerHTML = '<div class="text-muted text-center py-3">Nenhum perfil criado ainda. Clique em <em>+ Criar novo perfil</em>.</div>';
    return;
  }
  list.innerHTML = '';
  state.profiles.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
    btn.innerHTML =
      '<span><strong>' + escapeHtml(p.name) + '</strong> <span class="text-muted small">— Nível ' + p.level + ' · ' + escapeHtml(CONST.levelNames[p.level]) + '</span></span>' +
      '<span class="badge text-bg-secondary">' + (p.game === 'ATS' ? 'ATS' : 'ETS2') + '</span>';
    btn.addEventListener('click', () => {
      state.activeProfileId = p.id;
      saveState();
      try { modal('SelectProfile').hide(); } catch (e) { /* ignore */ }
      renderAll();
    });
    list.appendChild(btn);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[ch]));
}

function bindStartScreen() {
  const btnIniciar = document.getElementById('btnStartIniciar');
  const btnSetup = document.getElementById('btnStartSetup');
  const btnConfig = document.getElementById('btnStartConfig');
  const btnSelectNew = document.getElementById('btnSelectNewProfile');

  if (btnIniciar) btnIniciar.addEventListener('click', () => {
    renderProfileSelect();
    try { modal('SelectProfile').show(); } catch (e) { /* ignore */ }
  });
  if (btnSetup) btnSetup.addEventListener('click', () => {
    startFillRulesSetup();
    try { modal('StartSetup').show(); } catch (e) { /* ignore */ }
  });
  if (btnConfig) btnConfig.addEventListener('click', () => {
    fillConfigForm();
    try { modal('StartConfig').show(); } catch (e) { /* ignore */ }
  });
  if (btnSelectNew) btnSelectNew.addEventListener('click', () => {
    try { modal('SelectProfile').hide(); } catch (e) { /* ignore */ }
    openNewProfile();
  });
}

function startFillRulesSetup() {
  const el = document.getElementById('startSetupBody');
  if (el) el.innerHTML = buildStartSetupHtml();
}

/* ---------------- Eventos ---------------- */

function bindActionButtons() {
  document.querySelectorAll('#mainTabsContent [data-act]').forEach(b => {
    b.addEventListener('click', () => handleAction(b.getAttribute('data-act')));
  });
}

function handleAction(act) {
  const p = currentProfile();
  if (!p) return;

  if (act.startsWith('copyCmd-')) {
    const c = CONST.campaignCommands[parseInt(act.split('-')[1], 10)];
    if (!c) return;
    copyText(c.cmd).then(ok => toast(ok ? 'Comando copiado!' : 'Falha ao copiar.', ok ? 'success' : 'danger'));
    return;
  }

  if (act === 'time') { openTimeModal(); return; }
  if (act === 'level') { openLevelModal(); return; }
  if (act === 'salary') {
    confirmModal('Receber salário', 'Receber ' + money(p, cfg.salary[p.level]) + ' referente ao dia ' + cfg.salaryDay + '?', () => actionSalary(p), { time: true });
    return;
  }
  if (act === 'payEmployees') {
    const t = employeeTotalSalary(p);
    confirmModal('Pagar funcionários',
      'Pagar <strong>' + t.count + ' funcionário(s)</strong>:<br>' +
      '• Salários: ' + money(p, t.salary) + '<br>' +
      '• Encargos (' + Math.round(cfg.employeeChargesPct * 100) + '%): ' + money(p, t.charges) + '<br>' +
      '<strong>Total: ' + money(p, t.total) + '</strong>',
      () => payEmployeeSalaries(p), { time: true });
    return;
  }
  if (act === 'insurance') {
    confirmModal('Pagar seguro', 'Pagar ' + money(p, cfg.insuranceAts) + ' do seguro do veículo (ATS)?', () => actionInsurance(p), { time: true });
    return;
  }
  if (act === 'cargo') { openCargoModal(); return; }
  if (act === 'expense') { openExpenseModal(); return; }
  if (act === 'reposition') { openRepositionModal(); return; }
  if (act.startsWith('meal-')) {
    const kind = act.split('-')[1];
    const meal = cfg.meals[kind];
    const employer = employerPaysMeals(p) && isInTransit(p);
    confirmModal(meal.label,
      (employer ? 'Em trajeto — pago pelo empregador (sem débito).' : 'Debitar ' + money(p, meal.amount) + ' do seu saldo?') +
      ' <small class="d-block text-muted">Dia ' + p.day + ', ' + pad2(p.hour) + ':' + pad2(p.minute || 0) + '</small>',
      () => actionMeal(p, kind),
      { time: true, durationMin: meal.durationMin || 0 });
    return;
  }
  if (act === 'lodging') {
    const employer = employerPaysLodging(p) && isInTransit(p);
    confirmModal('Estadia',
      (employer ? 'Em trajeto — pago pelo empregador (sem débito).' : 'Debitar ' + money(p, cfg.lodging.amount) + ' do seu saldo?') +
      ' <small class="d-block text-muted">Dia ' + p.day + ', ' + pad2(p.hour) + ':' + pad2(p.minute || 0) + '</small>',
      () => actionLodging(p),
      { time: true, lodging: true });
    return;
  }
  if (act.startsWith('empTravel-')) {
    const emp = p.employees.find(e => e.id === act.slice(10));
    if (emp) {
      openExpenseModal();
      document.getElementById('exType').value = 'emp_travel';
      fillExpenseModal();
      document.getElementById('exNote').value = 'Despesas de viagem do funcionário ' + emp.name + ' (em trajeto).';
      document.getElementById('exAmount').focus();
    }
    return;
  }
  if (act.startsWith('deliver-')) {
    const c = p.cargo.find(x => x.id === act.slice(8));
    if (c) {
      confirmModal('Entregar carga', 'Entregar ' + c.from + ' → ' + c.to + ' e creditar comissão de ' + money(p, c.commission) + '?',
        () => deliverCargo(p, c),
        { time: true, durationMin: cfg.turno.deliveryMin });
    }
    return;
  }
}

document.addEventListener('keydown', (ev) => {
  if (!(ev.ctrlKey || ev.metaKey) || ev.key.toLowerCase() !== 'z') return;
  const t = ev.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
  if (document.querySelector('.modal.show')) return;
  ev.preventDefault();
  undoLast();
});

/* ---------------- Novos perfis / config ---------------- */

function updateNewProfileHint() {
  const el = document.getElementById('npHint');
  if (!el) return;
  const cur = document.getElementById('npGame').value === 'ATS' ? '$' : '€';
  el.textContent = 'Saldo inicial: ' + cur + (5000).toLocaleString('pt-BR') + '. Cidade-base e empresa serão definidas em seguida.';
}

function openNewProfile() {
  document.getElementById('npName').value = '';
  document.getElementById('npGame').value = 'ATS';
  updateNewProfileHint();
  modal('NewProfile').show();
}

document.getElementById('btnNewProfile').addEventListener('click', openNewProfile);
document.getElementById('npGame').addEventListener('change', updateNewProfileHint);

document.getElementById('btnCreateProfile').addEventListener('click', () => {
  const name = document.getElementById('npName').value.trim() || ('Campanha ' + Date.now());
  const game = document.getElementById('npGame').value;
  const p = makeProfile(name, game);
  pushUndo();
  state.profiles.push(p);
  state.activeProfileId = p.id;
  saveState();
  modal('NewProfile').hide();
  renderAll();
  showProfileTab();
});

function fillProfileForm() {
  const p = currentProfile();
  if (!p) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('cfgName', p.name);
  set('cfgGame', p.game);
  populateCitySelect(document.getElementById('cfgCity'), p.baseCity, p.game);
  populateCompanySelect(document.getElementById('cfgCompany'), p.company, p.game);
  set('cfgStart', p.startBalance);
}

function showProfileTab() {
  const btn = document.querySelector('#mainTabs [data-bs-target="#tab-perfil"]');
  if (btn && window.bootstrap) bootstrap.Tab.getOrCreateInstance(btn).show();
}

document.getElementById('cfgGame').addEventListener('change', () => {
  const p = currentProfile();
  if (!p) return;
  const game = document.getElementById('cfgGame').value;
  populateCitySelect(document.getElementById('cfgCity'), p.baseCity, game);
  populateCompanySelect(document.getElementById('cfgCompany'), p.company, game);
});

function renderProfile() {
  fillProfileForm();
}

document.getElementById('btnSaveSettings').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  pushUndo();
  const wasEmpty = p.log.length === 0;
  p.name = document.getElementById('cfgName').value.trim() || p.name;
  p.game = document.getElementById('cfgGame').value;
  p.currency = p.game === 'ATS' ? '$' : '€';
  p.baseCity = document.getElementById('cfgCity').value.trim();
  p.company = document.getElementById('cfgCompany').value.trim();
  const newStart = parseFloat(document.getElementById('cfgStart').value);
  if (wasEmpty && !isNaN(newStart)) {
    p.startBalance = newStart;
    p.balance = newStart;
  }
  if (!p.currentCity) p.currentCity = p.baseCity;
  saveState();
  renderAll();
});

document.getElementById('btnDeleteProfile').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  confirmModal('Excluir perfil', 'Excluir <strong>' + p.name + '</strong> e todos os seus dados? (Você pode desfazer com o botão Desfazer.)', () => {
    pushUndo();
    state.profiles = state.profiles.filter(x => x.id !== p.id);
    state.activeProfileId = null;
    saveState();
    renderAll();
  });
});

/* ---------------- Carga ---------------- */

function openCargoModal() {
  const p = currentProfile();
  if (!p) return;
  populateCitySelect(document.getElementById('cgFrom'), p.currentCity || p.baseCity || '', p.game);
  populateCitySelect(document.getElementById('cgTo'), '', p.game);
  document.getElementById('cgDist').value = '';
  document.getElementById('cgFreight').value = '';
  document.getElementById('cgTime').value = pad2(p.hour) + ':' + pad2(p.minute || 0);
  document.getElementById('cgPct').textContent = pct(p) + '%';

  const driverWrap = document.getElementById('driverWrap');
  const driverSel = document.getElementById('cgDriver');
  if (p.level >= 4 && p.employees.length > 0) {
    driverWrap.classList.remove('d-none');
    driverSel.innerHTML = '<option value="player">Você (recebe ' + pct(p) + '%)</option>' +
      p.employees.map(e => '<option value="' + e.id + '">' + e.name + ' (você recebe ' + pct(p) + '%, funcionário recebe 5%)</option>').join('');
  } else {
    driverWrap.classList.add('d-none');
    driverSel.innerHTML = '<option value="player">Você</option>';
  }

  const hint = document.getElementById('cargoHint');
  if (p.level <= 2) {
    hint.innerHTML = 'Níveis 1–2: cargas <strong>somente da sua empresa</strong> (' + (p.company || '—') + '). Pegue a primeira disponível.';
  } else if (p.level === 3) {
    hint.innerHTML = 'Nível 3: transporte livre para qualquer empresa.';
  } else {
    hint.innerHTML = 'Nível 4: ao dirigir você recebe ' + Math.round(cfg.commission[4] * 100) + '% do frete; nos caminhões dos funcionários, você recebe ' + Math.round(cfg.commission[4] * 100) + '% e paga ' + Math.round(cfg.employeeCommission * 100) + '% de comissão a eles.';
  }
  modal('Cargo').show();
}

document.getElementById('btnSaveCargo').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  const from = document.getElementById('cgFrom').value.trim();
  const to = document.getElementById('cgTo').value.trim();
  const freight = parseFloat(document.getElementById('cgFreight').value);
  if (!from || !to || isNaN(freight) || freight <= 0) {
    toast('Preencha origem, destino e valor do frete.', 'danger');
    return;
  }
  const dist = parseFloat(document.getElementById('cgDist').value) || 0;
  const timeParts = String(document.getElementById('cgTime').value || '').split(':');
  const th = parseInt(timeParts[0], 10);
  const hour = isNaN(th) ? p.hour : Math.min(23, Math.max(0, th));
  const minute = isNaN(parseInt(timeParts[1], 10)) ? 0 : Math.min(59, Math.max(0, parseInt(timeParts[1], 10)));
  const driver = document.getElementById('cgDriver').value || 'player';
  modal('Cargo').hide();
  pushUndo();
  if (!isNaN(th)) applyActionTime(p, hour, minute, 0);
  startCargo(p, { from, to, distance: dist, freight, hour, minute, driver });
});

/* ---------------- Deslocamento vazio (modal) ---------------- */

function addMinutesToHM(h, m, addMin) {
  const total = (((h * 60 + m + (addMin || 0)) % 1440) + 1440) % 1440;
  return { h: Math.floor(total / 60), m: total % 60 };
}

function openRepositionModal() {
  const p = currentProfile();
  if (!p) return;
  populateCitySelect(document.getElementById('rpFrom'), p.currentCity || p.baseCity || '', p.game);
  populateCitySelect(document.getElementById('rpTo'), '', p.game);
  const h = p.hour;
  const m = p.minute || 0;
  document.getElementById('rpTime').value = pad2(h) + ':' + pad2(m);
  const arr = addMinutesToHM(h, m, 60);
  document.getElementById('rpTimeIn').value = pad2(arr.h) + ':' + pad2(arr.m);
  const hint = document.getElementById('rpHint');
  hint.innerHTML = p.level <= 2
    ? 'Rodando <strong>vazio</strong> até a filial mais próxima da sua empresa. Refeições e estadia em trajeto continuam por conta do empregador (N1–2).'
    : 'Rodando <strong>vazio</strong> (sem carga) para reposicionar o caminhão. Tudo por sua conta (N3–4).';
  modal('Reposition').show();
}

document.getElementById('rpTime').addEventListener('change', () => {
  const parts = String(document.getElementById('rpTime').value || '').split(':');
  const h = parseInt(parts[0], 10);
  if (isNaN(h)) return;
  const m = isNaN(parseInt(parts[1], 10)) ? 0 : parseInt(parts[1], 10);
  const arr = addMinutesToHM(h, m, 60);
  document.getElementById('rpTimeIn').value = pad2(arr.h) + ':' + pad2(arr.m);
});

document.getElementById('btnSaveReposition').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  const from = document.getElementById('rpFrom').value.trim();
  const to = document.getElementById('rpTo').value.trim();
  if (!to) { toast('Informe o destino do deslocamento.', 'danger'); return; }
  const toMin = (str) => {
    const parts = String(str || '').split(':');
    const h = parseInt(parts[0], 10);
    if (isNaN(h)) return null;
    const mm = isNaN(parseInt(parts[1], 10)) ? 0 : Math.min(59, Math.max(0, parseInt(parts[1], 10)));
    return Math.min(23, Math.max(0, h)) * 60 + mm;
  };
  const depMin = toMin(document.getElementById('rpTime').value);
  const arrMin = toMin(document.getElementById('rpTimeIn').value);
  if (depMin === null || arrMin === null) { toast('Hora inválida.', 'danger'); return; }
  const depAbs = timeToAbsolute(p, Math.floor(depMin / 60), depMin % 60);
  const arrAbs = timeToAbsolute(p, Math.floor(arrMin / 60), arrMin % 60);
  if (arrAbs <= depAbs) { toast('A hora de chegada deve ser depois da de saída.', 'danger'); return; }
  modal('Reposition').hide();
  pushUndo();
  doReposition(p, { from, to, depAbs, arrAbs });
});

/* ---------------- Despesa ---------------- */

function expandNote(note, p) {
  return note
    .replace(/\{C\}/g, p.currency)
    .replace('{BREAKFAST}', cfg.meals.breakfast.amount)
    .replace('{LUNCH}', cfg.meals.lunch.amount)
    .replace('{DINNER}', cfg.meals.dinner.amount)
    .replace('{LODGING}', cfg.lodging.amount)
    .replace('{TAG}', cfg.tag)
    .replace('{INSURANCE}', cfg.insuranceAts)
    .replace('{SALARY1}', cfg.salary[1])
    .replace('{SALARY2}', cfg.salary[2])
    .replace('{SALARYDAY}', cfg.salaryDay)
    .replace('{COMM1}', Math.round(cfg.commission[1] * 100))
    .replace('{COMM2}', Math.round(cfg.commission[2] * 100))
    .replace('{COMM3}', Math.round(cfg.commission[3] * 100));
}

function fillExpenseModal() {
  const sel = document.getElementById('exType');
  const id = sel.value;
  const t = EXPENSE_TYPES.find(e => e.id === id);
  if (!t) return;
  document.getElementById('exDir').value = t.dir;
  const p = currentProfile();
  if (!p) return;
  document.getElementById('exHint').textContent = expandNote(t.note, p);
  let def = t.def;
  if (id === 'salary') def = cfg.salary[p.level] || 0;
  else if (id === 'tag') def = cfg.tag;
  else if (id === 'insurance') def = cfg.insuranceAts;
  else if (id === 'emp_travel') def = cfg.lodging.amount;
  document.getElementById('exAmount').value = def;
}

function openExpenseModal() {
  const sel = document.getElementById('exType');
  sel.innerHTML = EXPENSE_TYPES.map(e => '<option value="' + e.id + '">' + e.label + '</option>').join('');
  document.getElementById('exNote').value = '';
  const p = currentProfile();
  document.getElementById('exTime').value = p ? pad2(p.hour) + ':' + pad2(p.minute || 0) : '';
  fillExpenseModal();
  modal('Expense').show();
}

document.getElementById('exType').addEventListener('change', fillExpenseModal);

document.getElementById('btnSaveExpense').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  const typeId = document.getElementById('exType').value;
  const t = EXPENSE_TYPES.find(e => e.id === typeId) || EXPENSE_TYPES[EXPENSE_TYPES.length - 1];
  const dir = document.getElementById('exDir').value;
  const amountRaw = parseFloat(document.getElementById('exAmount').value);
  const magnitude = isNaN(amountRaw) ? 0 : Math.abs(amountRaw);
  const signed = dir === 'in' ? magnitude : -magnitude;
  const note = document.getElementById('exNote').value.trim();
  const timeParts = String(document.getElementById('exTime').value || '').split(':');
  const th = parseInt(timeParts[0], 10);
  modal('Expense').hide();
  pushUndo();
  if (!isNaN(th)) {
    const tm = isNaN(parseInt(timeParts[1], 10)) ? 0 : Math.min(59, Math.max(0, parseInt(timeParts[1], 10)));
    applyActionTime(p, Math.min(23, Math.max(0, th)), tm, 0);
  }
  addExpense(p, typeId, signed, note);
});

/* ---------------- Resumo do dia ---------------- */

function showDaySummary(p, fromDay, toDayExclusive, fromWeekday, onClose) {
  const entries = p.log.filter(e => e.day >= fromDay && e.day < toDayExclusive);
  const sorted = entries.slice().sort((a, b) => (a.day - b.day) || (a.hour - b.hour) || ((a.minute || 0) - (b.minute || 0)));

  const priorSum = p.log.filter(e => e.day < fromDay).reduce((s, e) => s + e.amount, 0);
  const start = p.startBalance + priorSum;
  let inc = 0, out = 0;
  sorted.forEach(e => { if (e.amount > 0) inc += e.amount; else if (e.amount < 0) out += e.amount; });
  const result = inc + out;
  const end = start + result;

  const single = toDayExclusive - fromDay === 1;
  const title = single
    ? 'Resumo do dia ' + fromDay + ' · ' + CONST.weekdays[fromWeekday]
    : 'Resumo dos dias ' + fromDay + ' a ' + (toDayExclusive - 1);

  const badge = result > 0
    ? '<span class="badge text-bg-success">positivo</span>'
    : (result < 0 ? '<span class="badge text-bg-danger">negativo</span>' : '<span class="badge text-bg-secondary">neutro</span>');
  const resCls = result > 0 ? 'amount-pos' : (result < 0 ? 'amount-neg' : 'amount-zero');
  const resStr = result === 0 ? money(p, 0) : (result > 0 ? '+' : '−') + money(p, Math.abs(result));

  document.getElementById('dsTitle').textContent = title;
  document.getElementById('dsSummary').innerHTML =
    '<div class="row g-1 small">' +
      '<div class="col-6">Saldo inicial</div><div class="col-6 text-end">' + money(p, start) + '</div>' +
      '<div class="col-6">Entradas do dia</div><div class="col-6 text-end amount-pos">+' + money(p, inc) + '</div>' +
      '<div class="col-6">Saídas do dia</div><div class="col-6 text-end amount-neg">−' + money(p, Math.abs(out)) + '</div>' +
      '<div class="col-6 border-top pt-1"><strong>Resultado (entradas − saídas)</strong></div>' +
      '<div class="col-6 text-end border-top pt-1"><strong class="' + resCls + '">' + resStr + '</strong> ' + badge + '</div>' +
      '<div class="col-6"><strong>Saldo final</strong></div><div class="col-6 text-end"><strong>' + money(p, end) + '</strong></div>' +
    '</div>';

  const clKeys = [
    { type: 'meal_breakfast', label: cfg.meals.breakfast.label },
    { type: 'meal_lunch', label: cfg.meals.lunch.label },
    { type: 'meal_dinner', label: cfg.meals.dinner.label },
    { type: 'lodging', label: 'Estadia' }
  ];
  const clItem = (k, present) =>
    '<div class="check-item">' +
      '<span>' + (present ? '✅' : '⬜') + '</span>' +
      '<span class="flex-grow-1">' + k.label + '</span>' +
      '<span class="badge ' + (present ? 'text-bg-success' : 'text-bg-secondary') + '">' + (present ? 'feito' : 'faltando') + '</span>' +
    '</div>';
  let clHtml;
  if (single) {
    const present = {};
    sorted.forEach(e => { if (e.day === fromDay) present[e.type] = true; });
    const done = clKeys.filter(k => present[k.type]).length;
    clHtml =
      '<div class="d-flex justify-content-between align-items-center mb-2">' +
        '<strong class="small text-uppercase">Checklist do dia</strong>' +
        (done === clKeys.length
          ? '<span class="badge text-bg-success">Completo ✓</span>'
          : '<span class="badge text-bg-warning">' + (clKeys.length - done) + ' de ' + clKeys.length + ' ações faltando</span>') +
      '</div>' +
      clKeys.map(k => clItem(k, !!present[k.type])).join('');
  } else {
    const dayLines = [];
    let allOk = true;
    for (let d = fromDay; d < toDayExclusive; d++) {
      const present = {};
      sorted.forEach(e => { if (e.day === d) present[e.type] = true; });
      const done = clKeys.filter(k => present[k.type]).length;
      if (done !== clKeys.length) allOk = false;
      dayLines.push(
        '<div class="d-flex justify-content-between align-items-center">' +
          '<span>' + (done === clKeys.length ? '✅' : '⚠️') + ' Dia ' + d + ' · ' + CONST.weekdays[(fromWeekday + (d - fromDay)) % 7] + '</span>' +
          '<span class="badge ' + (done === clKeys.length ? 'text-bg-success' : 'text-bg-warning') + '">' + done + '/' + clKeys.length + '</span>' +
        '</div>'
      );
    }
    clHtml =
      '<div class="d-flex justify-content-between align-items-center mb-2">' +
        '<strong class="small text-uppercase">Checklist dos dias</strong>' +
        (allOk
          ? '<span class="badge text-bg-success">Completo ✓</span>'
          : '<span class="badge text-bg-warning">Pendências</span>') +
      '</div>' +
      '<div class="small">' + dayLines.join('') + '</div>';
  }
  document.getElementById('dsChecklist').innerHTML = clHtml;

  document.getElementById('dsMovements').innerHTML = sorted.length
    ? sorted.map(e => {
        const cls = e.amount > 0 ? 'amount-pos' : (e.amount < 0 ? 'amount-neg' : 'amount-zero');
        const sign = e.amount > 0 ? '+' : (e.amount < 0 ? '−' : '');
        const amountStr = e.amount === 0 ? '—' : sign + money(p, Math.abs(e.amount));
        return '<div class="entry-row">' +
          '<div class="d-flex justify-content-between align-items-center">' +
            '<div>' +
              '<div class="fw-semibold">' + e.label + '</div>' +
              '<small class="text-muted">' + (single ? '' : 'Dia ' + e.day + ' · ') + CONST.weekdays[e.weekday] + ' · ' + pad2(e.hour) + ':' + pad2(e.minute || 0) + '</small>' +
            '</div>' +
            '<span class="' + cls + '">' + amountStr + '</span>' +
          '</div>' +
          (e.note ? '<small class="text-muted d-block">' + e.note + '</small>' : '') +
        '</div>';
      }).join('')
    : '<p class="text-muted small mb-0">Nenhuma movimentação no período.</p>';

  const el = document.getElementById('modalDaySummary');
  if (onClose) {
    el.addEventListener('hidden.bs.modal', function handler() {
      el.removeEventListener('hidden.bs.modal', handler);
      onClose();
    });
  }
  modal('DaySummary').show();
}

function advanceDayFlow(p, cmd, fromDay, toDayExclusive, fromWeekday) {
  let copyOk = true;
  copyText(cmd).then(ok => { copyOk = ok; });
  showDaySummary(p, fromDay, toDayExclusive, fromWeekday, () => {
    renderAll();
    showCommandModal(cmd, copyOk);
  });
}

/* ---------------- Tempo ---------------- */

function refreshTimeModal() {
  const p = currentProfile();
  if (!p) return;
  const now = currentMinutes(p);
  const ev = nextEvent(p);
  document.getElementById('tmNow').innerHTML = '<span class="stat-big">Dia ' + p.day + ' · ' + CONST.weekdays[p.weekday] + ' · ' + pad2(p.hour) + ':' + pad2(p.minute || 0) + '</span>';
  const nextIn = ev ? ev.at - now : 0;
  const btn = document.getElementById('btnAddHour');
  const blocked = !ev || nextIn < 60;
  btn.disabled = blocked;
  btn.textContent = blocked ? '+1 hora (bloqueado — próxima ação chegou)' : '+1 hora';
  if (ev) {
    document.getElementById('tmNext').textContent = ev.label;
    document.getElementById('tmNextIn').textContent = nextIn > 0 ? '· falta ' + fmtDur(nextIn) : '· agora';
  } else {
    document.getElementById('tmNext').textContent = '—';
    document.getElementById('tmNextIn').textContent = '';
  }
}

function openTimeModal() {
  const p = currentProfile();
  if (!p) return;
  document.getElementById('tmCmd').textContent = '—';
  refreshTimeModal();
  modal('Time').show();
}

document.getElementById('btnAddHour').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  const now = currentMinutes(p);
  const ev = nextEvent(p);
  if (!ev || ev.at < now + 60) {
    toast('Próxima ação já chegou — registre-a antes de avançar.', 'warning');
    return;
  }
  pushUndo();
  fromAbs(p, toAbs(p) + 60);
  saveState();
  renderAll();
  const cmd = 'g_set_time ' + p.hour + (p.minute ? ' ' + p.minute : '');
  document.getElementById('tmCmd').textContent = cmd;
  copyText(cmd);
  refreshTimeModal();
});

/* ---------------- Nível ---------------- */

function openLevelModal() {
  const p = currentProfile();
  if (!p) return;
  const next = p.level + 1;
  const rules = {
    2: 'Nível 2 — Empregado com caminhão próprio.<br>• Salário ' + money(p, cfg.salary[2]) + '/mês<br>• Comissão ' + Math.round(cfg.commission[2] * 100) + '%<br>• Combustível e manutenção seus<br>• Tag ' + money(p, cfg.tag) + ' por país<br>• Financiamento: valor + 20% ÷ 12 meses',
    3: 'Nível 3 — Autônomo (caminhão + reboque).<br>• Sem salário; renda = ' + Math.round(cfg.commission[3] * 100) + '% do frete<br>• Tudo por sua conta<br>• Acidente leve = 2 dias · Tombamento = 30 dias<br>• Seguro ATS ' + money(p, cfg.insuranceAts) + '/' + cfg.salaryDay + ' dias',
    4: 'Nível 4 — Empresário.<br>• Regras do Nível 3<br>• Funcionários (módulo em versão futura)'
  };
  document.getElementById('lvHint').innerHTML = rules[next] ||
    '<span class="text-muted">Você já está no nível máximo.</span>';
  document.getElementById('btnLevelUp').disabled = !rules[next];
  modal('Level').show();
}

document.getElementById('btnLevelUp').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  if (p.level >= 4) return;
  pushUndo();
  p.level += 1;
  addEntry(p, { type: 'level', label: 'Promoção para Nível ' + p.level, amount: 0, note: CONST.levelNames[p.level] });
  saveState();
  modal('Level').hide();
  renderAll();
  toast('Nível atualizado: ' + CONST.levelNames[p.level], 'success');
});

document.getElementById('btnCmdCopy').addEventListener('click', () => {
  const cmd = document.getElementById('cmdText').value;
  copyText(cmd).then(ok => toast(ok ? 'Comando copiado!' : 'Falha ao copiar.', ok ? 'success' : 'danger'));
});

document.getElementById('modalCmd').addEventListener('hidden.bs.modal', () => {
  const chk = document.getElementById('chkAutoCopyCmd');
  if (chk && chk.checked) {
    cfg.autoCopyCmd = true;
    saveConfig();
    toast('Comando será copiado automaticamente nas próximas vezes.', 'info');
  }
});

/* ---------------- Export / Import ---------------- */

document.getElementById('btnExport').addEventListener('click', () => {
  const data = Object.assign({}, state, {
    config: cfg,
    appVersion: APP_VERSION,
    appVersionDate: APP_VERSION_DATE,
    exportedAt: new Date().toISOString()
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'campanha_realista_backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Backup exportado.', 'success');
});

document.getElementById('btnImport').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  ev.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.profiles)) throw new Error('formato inválido');
    } catch (e) {
      toast('Falha ao importar: arquivo inválido.', 'danger');
      return;
    }
    confirmModal(
      'Importar backup',
      '<p>Isto vai <b>substituir todos os perfis e configurações</b> atuais pelos dados do arquivo.</p>' +
      '<p class="mb-0 text-muted small">Perfis: ' + data.profiles.length + ' &middot; Backup de outro dispositivo.</p>',
      () => {
        pushUndo();
        state = data;
        saveState();
        if (data.config) {
          cfg = sanitizeConfig(data.config);
          saveConfig();
        }
        renderAll();
        toast('Backup importado com sucesso.', 'success');
      }
    );
  };
  reader.readAsText(file);
});

/* ---------------- Confirm genérica ---------------- */

let confirmCallback = null;
let pendingAction = null;

function confirmModal(title, bodyHtml, callback, opts) {
  opts = opts || {};
  document.getElementById('cfTitle').textContent = title;
  document.getElementById('cfBody').innerHTML = bodyHtml;
  const wrap = document.getElementById('cfTimeWrap');
  if (wrap) {
    if (opts.time) {
      const p = currentProfile();
      document.getElementById('cfTime').value = p ? pad2(p.hour) + ':' + pad2(p.minute || 0) : '';
      wrap.classList.remove('d-none');
    } else {
      wrap.classList.add('d-none');
    }
  }
  pendingAction = { time: !!opts.time, durationMin: opts.durationMin || 0, lodging: !!opts.lodging };
  confirmCallback = callback;
  modal('Confirm').show();
}

function applyPendingTime() {
  const p = currentProfile();
  if (!p || !pendingAction || !pendingAction.time) return;
  const parts = String(document.getElementById('cfTime').value || '').split(':');
  const h = parseInt(parts[0], 10);
  if (isNaN(h)) return;
  const m = isNaN(parseInt(parts[1], 10)) ? 0 : Math.min(59, Math.max(0, parseInt(parts[1], 10)));
  if (pendingAction.lodging) {
    const startAbs = timeToAbsolute(p, h, m);
    const fromDay = p.day;
    const fromWeekday = p.weekday;
    actionLodging(p);
    fromAbs(p, (Math.floor(startAbs / 1440) + 1) * 1440 + cfg.lodging.nextDayHour * 60);
    saveState();
    pendingAction = null;
    confirmCallback = null;
    advanceDayFlow(p, 'g_set_time ' + p.hour + (p.minute ? ' ' + p.minute : ''), fromDay, fromDay + 1, fromWeekday);
  } else {
    applyActionTime(p, h, m, pendingAction.durationMin);
  }
}

document.getElementById('btnConfirmOk').addEventListener('click', () => {
  modal('Confirm').hide();
  if (pendingAction && pendingAction.time) pushUndo();
  applyPendingTime();
  if (confirmCallback) confirmCallback();
  confirmCallback = null;
  pendingAction = null;
});

/* ---------------- Funcionário (adicionar) ---------------- */

function updateEmployeeHint(p) {
  const el = document.getElementById('empHint');
  if (!el) return;
  el.textContent = 'Salário ' + money(p, cfg.employeeSalary) + ' + ' + Math.round(cfg.employeeChargesPct * 100) + '% encargos a cada ' + cfg.salaryDay + ' dias · comissão ' + Math.round(cfg.employeeCommission * 100) + '% do frete · despesas de viagem por sua conta.';
}

document.getElementById('btnAddEmployee').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  if (p.level < 4) { toast('Disponível no Nível 4 (Empresário).', 'warning'); return; }
  document.getElementById('empName').value = '';
  updateEmployeeHint(p);
  modal('Employee').show();
});

document.getElementById('btnSaveEmployee').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  const name = document.getElementById('empName').value.trim();
  if (!name) { toast('Informe o nome do funcionário.', 'danger'); return; }
  pushUndo();
  addEmployee(p, name);
  saveState();
  modal('Employee').hide();
  renderAll();
  toast('Funcionário contratado: ' + name, 'success');
});

/* ---------------- Tema (dark / light) ---------------- */

function getTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

document.getElementById('btnTheme').addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  applyTheme(next);
});

/* ---------------- Cidades (lista da wiki) ---------------- */

const CITIES_KEY = 'realistic_campaign_cities';
let CITIES = { ATS: [], ETS2: [] };

async function loadCities() {
  try {
    const cached = JSON.parse(localStorage.getItem(CITIES_KEY) || 'null');
    if (cached && Array.isArray(cached.ATS) && Array.isArray(cached.ETS2)) {
      CITIES = cached;
    }
    const [ats, ets2] = await Promise.all([
      fetch('cities_ats.json').then(r => r.json()),
      fetch('cities_ets2.json').then(r => r.json())
    ]);
    if (Array.isArray(ats)) CITIES.ATS = ats;
    if (Array.isArray(ets2)) CITIES.ETS2 = ets2;
    try { localStorage.setItem(CITIES_KEY, JSON.stringify(CITIES)); } catch (e) { /* ignore */ }
  } catch (e) {
    if (CITIES.ATS.length === 0 && CITIES.ETS2.length === 0) {
      console.warn('Falha ao carregar cities_*.json — sirva via static server (ex.: npx serve .)');
    }
  }
}

function cityOptions(game) {
  const list = CITIES[game] || [];
  return list.map(c =>
    '<option value="' + escAttr(c.city) + '">' + escHtml(c.city) + (c.state ? ' — ' + escHtml(c.state) : '') + '</option>'
  ).join('');
}

function populateCitySelect(el, selectedValue, game) {
  if (!el) return;
  el.innerHTML = '<option value="">— selecionar —</option>' + cityOptions(game);
  if (selectedValue) el.value = selectedValue;
}

/* ---------------- Empresas (lista da wiki) ---------------- */

const COMPANIES_KEY = 'realistic_campaign_companies';
let COMPANIES = { ATS: [], ETS2: [] };

async function loadCompanies() {
  try {
    const cached = JSON.parse(localStorage.getItem(COMPANIES_KEY) || 'null');
    if (cached && Array.isArray(cached.ATS) && Array.isArray(cached.ETS2)) {
      COMPANIES = cached;
    }
    const [ats, ets2] = await Promise.all([
      fetch('companies_ats.json').then(r => r.json()),
      fetch('companies_ets2.json').then(r => r.json())
    ]);
    if (Array.isArray(ats)) COMPANIES.ATS = ats;
    if (Array.isArray(ets2)) COMPANIES.ETS2 = ets2;
    try { localStorage.setItem(COMPANIES_KEY, JSON.stringify(COMPANIES)); } catch (e) { /* ignore */ }
  } catch (e) {
    if (COMPANIES.ATS.length === 0 && COMPANIES.ETS2.length === 0) {
      console.warn('Falha ao carregar companies_*.json — sirva via static server (ex.: npx serve .)');
    }
  }
}

function companyOptions(game) {
  const list = COMPANIES[game] || [];
  return list.map(c => '<option value="' + escAttr(c.name) + '">' + escHtml(c.name) + '</option>').join('');
}

function populateCompanySelect(el, selectedValue, game) {
  if (!el) return;
  el.innerHTML = '<option value="">— selecionar —</option>' + companyOptions(game);
  if (selectedValue) el.value = selectedValue;
}

function escHtml(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

document.getElementById('btnUndo').addEventListener('click', undoLast);

/* ---------------- Abas principais ---------------- */

const TAB_KEY = 'realistic_campaign_active_tab';

document.querySelectorAll('#mainTabs [data-bs-toggle="tab"]').forEach(btn => {
  btn.addEventListener('shown.bs.tab', () => {
    try { localStorage.setItem(TAB_KEY, btn.getAttribute('data-bs-target')); } catch (e) { /* ignore */ }
  });
});

function restoreActiveTab() {
  let target = null;
  try { target = localStorage.getItem(TAB_KEY); } catch (e) { /* ignore */ }
  if (!target) return;
  if (target === '#tab-config') { try { localStorage.setItem(TAB_KEY, '#tab-hoje'); } catch (e) { /* ignore */ } target = '#tab-hoje'; }
  const btn = document.querySelector('#mainTabs [data-bs-target="' + target + '"]');
  if (btn && window.bootstrap) bootstrap.Tab.getOrCreateInstance(btn).show();
}

/* ---------------- Configurações globais (aba) ---------------- */

function timeToMin(str) {
  const parts = String(str || '').split(':');
  const h = parseInt(parts[0], 10);
  if (isNaN(h)) return null;
  const m = isNaN(parseInt(parts[1], 10)) ? 0 : parseInt(parts[1], 10);
  return Math.max(0, Math.min(1439, h * 60 + m));
}

function fillConfigForm() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  ['breakfast', 'lunch', 'dinner'].forEach(k => {
    const m = cfg.meals[k];
    set('cfg-meal-' + k + '-label', m.label);
    set('cfg-meal-' + k + '-start', fmtMin(m.startMin));
    set('cfg-meal-' + k + '-end', fmtMin(m.endMin));
    set('cfg-meal-' + k + '-duration', m.durationMin);
    set('cfg-meal-' + k + '-amount', m.amount);
  });
  set('cfg-lodging-amount', cfg.lodging.amount);
  set('cfg-lodging-nextday', fmtMin(cfg.lodging.nextDayHour * 60));
  set('cfg-turno-start', fmtMin(cfg.turno.startHour * 60));
  set('cfg-turno-employee-end', fmtMin(cfg.turno.employeeEndHour * 60));
  set('cfg-turno-free-rest', fmtMin(cfg.turno.freeRestHour * 60));
  set('cfg-turno-delivery', cfg.turno.deliveryMin);
  [1, 2, 3, 4].forEach(n => {
    set('cfg-salary-' + n, cfg.salary[n]);
    set('cfg-comm-' + n, Math.round(cfg.commission[n] * 100));
  });
  set('cfg-tag', cfg.tag);
  set('cfg-insurance', cfg.insuranceAts);
  set('cfg-emp-salary', cfg.employeeSalary);
  set('cfg-emp-charges', Math.round(cfg.employeeChargesPct * 100));
  set('cfg-emp-commission', Math.round(cfg.employeeCommission * 100));
  set('cfg-salary-day', cfg.salaryDay);
  const backupVer = document.getElementById('backupVersion');
  if (backupVer) backupVer.textContent = 'Backup v' + APP_VERSION + ' · gerado em ' + APP_VERSION_DATE;
}

function saveConfigForm() {
  const num = (id, min, max) => {
    const v = parseFloat(document.getElementById(id).value);
    if (isNaN(v)) return null;
    const lo = min === undefined ? -Infinity : min;
    const hi = max === undefined ? Infinity : max;
    return Math.min(hi, Math.max(lo, v));
  };

  const raw = { meals: {}, lodging: {}, turno: {}, salary: {}, commission: {} };
  let ok = true;

  ['breakfast', 'lunch', 'dinner'].forEach(k => {
    const start = timeToMin(document.getElementById('cfg-meal-' + k + '-start').value);
    const end = timeToMin(document.getElementById('cfg-meal-' + k + '-end').value);
    if (start === null || end === null || end <= start) { ok = false; return; }
    raw.meals[k] = {
      label: document.getElementById('cfg-meal-' + k + '-label').value.trim(),
      amount: num('cfg-meal-' + k + '-amount', 0),
      startMin: start,
      endMin: end,
      durationMin: num('cfg-meal-' + k + '-duration', 0)
    };
  });
  if (!ok) { toast('Janelas de refeição inválidas: o fim deve ser depois do início.', 'danger'); return; }

  const lodNext = timeToMin(document.getElementById('cfg-lodging-nextday').value);
  if (lodNext === null) { toast('Hora de avanço da estadia inválida.', 'danger'); return; }
  raw.lodging.amount = num('cfg-lodging-amount', 0);
  raw.lodging.nextDayHour = Math.floor(lodNext / 60);

  const tStart = timeToMin(document.getElementById('cfg-turno-start').value);
  const tEnd = timeToMin(document.getElementById('cfg-turno-employee-end').value);
  const tRest = timeToMin(document.getElementById('cfg-turno-free-rest').value);
  if (tStart === null || tEnd === null || tRest === null) { toast('Horários de turno inválidos.', 'danger'); return; }
  raw.turno.startHour = Math.floor(tStart / 60);
  raw.turno.employeeEndHour = Math.floor(tEnd / 60);
  raw.turno.freeRestHour = Math.floor(tRest / 60);
  raw.turno.deliveryMin = num('cfg-turno-delivery', 0);

  [1, 2, 3, 4].forEach(n => {
    raw.salary[n] = num('cfg-salary-' + n, 0);
    const pc = num('cfg-comm-' + n, 0, 100);
    raw.commission[n] = pc === null ? 0 : pc / 100;
  });

  raw.tag = num('cfg-tag', 0);
  raw.insuranceAts = num('cfg-insurance', 0);
  raw.employeeSalary = num('cfg-emp-salary', 0);
  const ch = num('cfg-emp-charges', 0, 100);
  raw.employeeChargesPct = ch === null ? 0 : ch / 100;
  const ec = num('cfg-emp-commission', 0, 100);
  raw.employeeCommission = ec === null ? 0 : ec / 100;
  raw.salaryDay = num('cfg-salary-day', 1, 90);

  cfg = sanitizeConfig(raw);
  saveConfig();
  renderAll();
  fillConfigForm();
  toast('Configurações salvas.', 'success');
}

document.getElementById('btnSaveConfig').addEventListener('click', saveConfigForm);

document.getElementById('btnResetConfig').addEventListener('click', () => {
  confirmModal('Restaurar padrões', 'Restaurar todas as configurações para os valores padrão?', () => {
    resetConfig();
    renderAll();
    fillConfigForm();
    toast('Configurações restauradas para o padrão.', 'success');
  });
});

/* ---------------- Init ---------------- */

applyTheme(getTheme());
updateUndoButton();
restoreActiveTab();
fillConfigForm();
bindStartScreen();

document.getElementById('btnLogout').addEventListener('click', () => {
  pushUndo();
  state.activeProfileId = null;
  saveState();
  renderAll();
});

renderAll();
loadCities().then(() => { renderAll(); fillProfileForm(); });
loadCompanies().then(() => { renderAll(); fillProfileForm(); });
