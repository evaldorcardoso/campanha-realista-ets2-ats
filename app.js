'use strict';

/* ============================================================
   CAMPANHA REALISTA — ETS2 / ATS
   App simples: HTML + JS + localStorage
   ============================================================ */

const STORAGE_KEY = 'realistic_campaign_app';
const THEME_KEY = 'realistic_campaign_theme';
const CONFIG_KEY = 'realistic_campaign_config';
const SEEN_VERSION_KEY = 'realistic_campaign_seen_version';

const CONST = {
  campaignCommands: [
    { cmd: 'g_brake_intensity 0.3' },
    { cmd: 'g_traffic 2' },
    { cmd: 'warp 0.92' },
    { cmd: 'g_set_time H [M]' }
  ]
};

function weekdayName(i) { return t('common.weekday.' + i); }
function levelName(n) { return t('common.level.' + n); }
function campaignCmd(i) {
  return { cmd: CONST.campaignCommands[i].cmd, desc: t('rules.cmd.' + i + '.desc') };
}

const MEAL_DEFAULT_LABELS = {
  pt: { breakfast: 'Café da manhã', lunch: 'Almoço', dinner: 'Jantar' },
  en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }
};

function mealLabel(k) {
  const cur = cfg.meals[k].label;
  if (cur === MEAL_DEFAULT_LABELS.pt[k] || cur === MEAL_DEFAULT_LABELS.en[k]) return t('meal.' + k);
  return cur;
}

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
  { id: 'toll',        dir: 'out', def: 0 },
  { id: 'fuel',        dir: 'out', def: 0 },
  { id: 'maintenance', dir: 'out', def: 0 },
  { id: 'ferry',       dir: 'out', def: 0 },
  { id: 'tag',         dir: 'out', def: 'tag' },
  { id: 'fine',        dir: 'out', def: 0 },
  { id: 'insurance',   dir: 'out', def: 'insurance' },
  { id: 'financing',   dir: 'out', def: 0 },
  { id: 'repairL',     dir: 'out', def: 0 },
  { id: 'rollover',    dir: 'out', def: 0 },
  { id: 'emp_travel',  dir: 'out', def: 'emp_travel' },
  { id: 'salary',      dir: 'in',  def: 0 },
  { id: 'commission',  dir: 'in',  def: 0 },
  { id: 'other',       dir: 'out', def: 0 }
];

function expenseLabel(id) {
  return t('expense.' + id + '.label');
}
function expenseNote(id) {
  return t('expense.' + id + '.note');
}

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
  p.financing = p.financing || [];
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
  if (!lastSnapshot) { toast(t('toast.nothingUndo'), 'warning'); return; }
  state.activeProfileId = lastSnapshot.activeProfileId;
  state.profiles = lastSnapshot.profiles;
  lastSnapshot = null;
  updateUndoButton();
  saveState();
  renderAll();
  toast(t('toast.undone'), 'success');
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
    log: [], cargo: [], employees: [], financing: []
  };
}

/* ---------------- Helpers ---------------- */

function pct(p) { return Math.round(cfg.commission[p.level] * 100); }
function isInTransit(p) { return p.cargo.some(c => c.status === 'active' && c.driver === 'player'); }
function money(p, v) { return p.currency + fmtNum(v); }
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
function employerCoversExpense(p, typeId) {
  if (typeId === 'toll' || typeId === 'ferry') return p.level <= 2;
  if (typeId === 'fuel' || typeId === 'maintenance') return p.level <= 1;
  return false;
}

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
      ? t('cmd.toastOk')
      : t('cmd.toastFail', { cmd: cmd }),
      ok ? 'success' : 'danger');
    return;
  }
  const t2 = document.getElementById('cmdText');
  if (t2) t2.value = cmd;
  const chk = document.getElementById('chkAutoCopyCmd');
  if (chk) chk.checked = false;
  const st = document.getElementById('cmdStatus');
  if (st) {
    st.textContent = ok
      ? t('cmd.copied')
      : t('cmd.failed');
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

/* ---------------- Changelog ----------------
   O changelog é mantido em version.js (APP_CHANGELOG, mais recente primeiro).
   O modal abre automaticamente quando APP_VERSION muda e ao clicar na versão (navbar).
   Só o botão Ok marca a versão como vista — fechar pelo X reabre no próximo load. */

function getSeenVersion() {
  try { return localStorage.getItem(SEEN_VERSION_KEY) || ''; } catch (e) { return ''; }
}

function setSeenVersion() {
  try { localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION); } catch (e) { /* ignore */ }
}

function sortVersionsDesc(a, b) {
  const pa = String(a.version).split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b.version).split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const d = (pb[i] || 0) - (pa[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

function renderChangelogHtml(highlightNewest) {
  const list = (APP_CHANGELOG || []).slice().sort(sortVersionsDesc);
  if (list.length === 0) return '<p class="text-muted mb-0">' + t('changelog.empty') + '</p>';
  const en = getLang() === 'en';
  return list.map((item, i) => {
    const isNew = highlightNewest && i === 0;
    const changes = en && Array.isArray(item.changesEn) && item.changesEn.length > 0 ? item.changesEn : (item.changes || []);
    const head = '<div class="d-flex align-items-center gap-2">' +
      '<strong>' + escapeHtml(item.version) + '</strong>' +
      '<span class="text-muted small">' + escapeHtml(item.date) + '</span>' +
      (isNew ? '<span class="badge text-bg-primary">' + t('changelog.new') + '</span>' : '') +
    '</div>';
    const changesHtml = changes.map(c => '<li>' + escapeHtml(c) + '</li>').join('');
    return '<div class="changelog-item' + (isNew ? ' changelog-item--new' : '') + '">' +
      head + '<ul class="mb-0 mt-1">' + changesHtml + '</ul></div>';
  }).join('');
}

function openChangelog(automatic) {
  const title = document.getElementById('chgTitle');
  if (title) title.textContent = automatic
    ? t('changelog.titleUpdated', { v: APP_VERSION })
    : t('changelog.title', { v: APP_VERSION });
  const body = document.getElementById('chgBody');
  if (body) body.innerHTML = renderChangelogHtml(!!automatic);
  try { modal('Changelog').show(); } catch (e) { /* ignore */ }
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
    type: 'meal_' + kind, label: mealLabel(kind),
    amount, note: (employer ? t('entry.mealEmployer') : (inT ? t('entry.mealInTransit') : t('entry.mealOutTransit'))) +
      (pendingCity ? t('entry.city', { c: pendingCity }) : '')
  });
  afterTransaction(p, 'meal_' + kind);
}

function actionLodging(p) {
  const inT = isInTransit(p);
  const employer = employerPaysLodging(p) && inT;
  const amount = employer ? 0 : -cfg.lodging.amount;
  addEntry(p, {
    type: 'lodging', label: t('entry.lodging'),
    amount, note: (employer ? t('entry.mealEmployer') : (inT ? t('entry.mealInTransit') : t('entry.lodgingOutTransit'))) +
      (pendingCity ? t('entry.city', { c: pendingCity }) : '')
  });
  afterTransaction(p, 'lodging');
}

function openQuickExpenseConfirm(p, typeId) {
  const t2 = EXPENSE_TYPES.find(e => e.id === typeId);
  if (!t2) return;
  const covered = employerCoversExpense(p, typeId);
  const lab = expenseLabel(typeId);
  confirmModal(lab,
    t('confirm.enterAmount', { label: lab }) +
    (covered ? ' <small class="d-block text-muted">' + t('confirm.coveredNote') + '</small>' : ' <small class="d-block text-muted">' + t('confirm.yourCost') + '</small>') +
    ' <small class="d-block text-muted">' + t('confirm.dayTime', { d: p.day, t: pad2(p.hour) + ':' + pad2(p.minute || 0) }) + '</small>',
    () => actionQuickExpense(p, typeId),
    { time: true, amount: true, city: true });
}

function actionQuickExpense(p, typeId) {
  const covered = employerCoversExpense(p, typeId);
  const magnitude = pendingAmount > 0 ? pendingAmount : 0;
  const amount = covered ? 0 : -magnitude;
  let note = covered ? t('entry.quickCovered') : t('entry.quickYourCost');
  if (covered && magnitude) note += ' ' + t('entry.quickValue', { m: money(p, magnitude) });
  if (pendingCity) note += t('entry.city', { c: pendingCity });
  addEntry(p, { type: typeId, label: expenseLabel(typeId), amount, note });
  afterTransaction(p, typeId);
}

function actionSalary(p) {
  const amount = cfg.salary[p.level] || 0;
  addEntry(p, { type: 'salary', label: t('entry.salaryLabel'), amount: amount, note: t('entry.salaryNote', { d: cfg.salaryDay }) });
  p.lastSalaryDay = p.day;
  afterTransaction(p, 'salary');
}

function actionInsurance(p) {
  addEntry(p, { type: 'insurance', label: t('entry.insuranceLabel'), amount: -cfg.insuranceAts, note: t('entry.insuranceNote', { d: cfg.salaryDay }) });
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
    ? t('entry.cargoNoteEmp', { m: money(p, data.freight), p: ownerPct, c: money(p, ownerCommission), name: emp.name, e: Math.round(cfg.employeeCommission * 100), ec: money(p, employeeCommission) })
    : t('entry.cargoNoteOwn', { m: money(p, data.freight), p: ownerPct, c: money(p, ownerCommission) });
  addEntry(p, {
    type: 'cargo_start', label: t('entry.cargoLabel', { from: data.from, to: data.to, emp: emp ? ' (' + emp.name + ')' : '' }),
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
      type: 'commission', label: t('entry.commYouLabel', { from: cargo.from, to: cargo.to }),
      amount: cargo.commission, note: t('entry.commNote', { p: pct(p), m: money(p, cargo.freight) })
    });
    addEntry(p, {
      type: 'emp_commission', label: t('entry.commEmpLabel', { name: emp ? emp.name : '—' }),
      amount: -cargo.employeeCommission, note: t('entry.commEmpNote', { p: Math.round(cfg.employeeCommission * 100), m: money(p, cargo.freight), name: emp ? emp.name : '—' })
    });
  } else {
    addEntry(p, {
      type: 'commission', label: t('entry.commPlayerLabel', { from: cargo.from, to: cargo.to }),
      amount: cargo.commission, note: t('entry.commNote', { p: pct(p), m: money(p, cargo.freight) })
    });
    p.currentCity = cargo.to;
  }
  afterTransaction(p, 'commission');
}

/* ---------------- Deslocamento vazio (viagem sem carga) ---------------- */

function doReposition(p, data) {
  const hint = p.level <= 2
    ? t('repositionModal.hint3', { c: p.company || '—' })
    : t('repositionModal.hint4');

  fromAbs(p, data.depAbs);
  addEntry(p, {
    type: 'reposition_start',
    label: t('repositionModal.labelStart', { from: data.from, to: data.to }),
    amount: 0,
    note: hint + ' ' + t('repositionModal.departureAt', { t: pad2(p.hour) + ':' + pad2(p.minute || 0) }) + '.'
  });

  const durMin = data.arrAbs - data.depAbs;
  fromAbs(p, data.arrAbs);
  addEntry(p, {
    type: 'reposition_arrive',
    label: t('repositionModal.labelArrive', { to: data.to }),
    amount: 0,
    note: t('repositionModal.noteArrive', { from: data.from, to: data.to, d: fmtDur(durMin) })
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
        type: 'emp_salary', label: t('entry.empSalaryLabel', { name: e.name }),
        amount: -cfg.employeeSalary, note: t('entry.empSalaryNote', { d: cfg.salaryDay })
      });
      addEntry(p, {
        type: 'emp_charges', label: t('entry.empChargesLabel', { p: Math.round(cfg.employeeChargesPct * 100), name: e.name }),
        amount: -Math.round(cfg.employeeSalary * cfg.employeeChargesPct), note: t('entry.empChargesNote', { p: Math.round(cfg.employeeChargesPct * 100) })
      });
      e.lastSalaryDay = p.day;
    }
  });
  afterTransaction(p, 'emp_salary');
}

function addEmployee(p, name) {
  p.employees.push({ id: uid(), name: name, lastSalaryDay: 0 });
}

function createFinancing(p, data) {
  const { amount, description, installments, interest, downPayment } = data;
  const financedAmount = Math.max(0, amount - (downPayment || 0));
  const totalAmount = Math.round(financedAmount * (1 + (interest || 20) / 100) * 100) / 100;
  const monthlyPayment = Math.round(totalAmount / Math.max(1, installments || 12) * 100) / 100;

  const contract = {
    id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    description: description || '',
    principal: financedAmount,
    interestRate: (interest || 20) / 100,
    totalAmount: totalAmount,
    monthlyPayment: monthlyPayment,
    installments: Math.max(1, installments || 12),
    paidPayments: 0,
    startDay: p.day,
    nextPaymentDay: p.day + (cfg.salaryDay || 30),
    level: p.level,
    createdAt: new Date().toISOString()
  };

  p.financing.push(contract);

  if ((downPayment || 0) > 0) {
    addEntry(p, {
      type: 'financing',
      label: t('entry.financingEntry', { desc: description }),
      amount: -(downPayment || 0),
      note: t('entry.financingDownPayment', { m: money(p, downPayment || 0) })
    });
  }

  return contract;
}

function financingDueContracts(p) {
  return p.financing.filter(f =>
    f.paidPayments < f.installments && p.day >= f.nextPaymentDay
  );
}

function financingOverdueContracts(p) {
  return p.financing.filter(f =>
    f.paidPayments < f.installments && p.day >= f.nextPaymentDay
  );
}

function financingTotalPaid(p, contract) {
  return contract.paidPayments * contract.monthlyPayment;
}

function financingRemainingCount(p, contract) {
  return Math.max(0, (contract.installments || 12) - (contract.paidPayments || 0));
}

function payFinancingInstallment(p, contractId) {
  const contract = p.financing.find(f => f.id === contractId);
  if (!contract || contract.paidPayments >= contract.installments) return false;

  addEntry(p, {
    type: 'financing',
    label: t('entry.financingPayment', { n: contract.paidPayments + 1, total: contract.installments }),
    amount: -contract.monthlyPayment,
    note: t('entry.financingNote', {
      n: contract.paidPayments + 1,
      total: contract.installments,
      m: money(p, contract.monthlyPayment)
    })
  });

  contract.paidPayments += 1;
  contract.nextPaymentDay += (cfg.salaryDay || 30);

  return true;
}

function addExpense(p, typeId, amount, note) {
  addEntry(p, { type: typeId, label: labelOfExpense(typeId), amount: amount, note: note });
  afterTransaction(p, typeId);
}

function labelOfExpense(id) {
  const t2 = EXPENSE_TYPES.find(e => e.id === id);
  return t2 ? expenseLabel(id) : t('expense.entry');
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
    list.innerHTML = '<li><span class="dropdown-item-text text-muted">' + t('nav.noProfilesList') + '</span></li>';
    btn.textContent = t('nav.noProfiles');
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
  btn.textContent = cur ? cur.name + ' — ' + t('fin.levelBadge', { n: cur.level }) : t('nav.selectProfile');
}

/* ---------------- Render: hoje ---------------- */

function renderToday() {
  const row = document.getElementById('todayRow');
  const p = currentProfile();
  if (!p) {
    row.innerHTML = '<div class="col"><div class="card shadow-sm"><div class="card-body text-center py-5">' +
      '<h4>' + t('today.noProfile') + '</h4>' +
      '<button class="btn btn-primary mt-2" id="btnNewProfileHero">' + t('today.createProfileBtn') + '</button>' +
      '<p class="text-muted small mt-3 mb-0">' + t('today.heroIntro') + '</p></div></div></div>';
    document.getElementById('btnNewProfileHero').addEventListener('click', openNewProfile);
    return;
  }

  const suggestion = suggestAction(p);
  const inTransitBadge = isInTransit(p)
    ? '<span class="badge text-bg-warning"><span class="status-dot bg-dark me-1"></span>' + t('today.inTransit') + '</span>'
    : '<span class="badge text-bg-secondary"><span class="status-dot bg-light me-1"></span>' + t('today.outTransit') + '</span>';
  const truckBadge = p.level === 1
    ? '<span class="badge text-bg-light border">' + t('today.companyTruck') + '</span>'
    : '<span class="badge text-bg-light border">' + t('today.ownTruck') + '</span>';

  row.innerHTML =
    '<div class="col-lg-8">' +
      '<div class="card shadow-sm h-100">' +
        '<div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">' +
          '<span class="fw-bold">' + p.name + '</span>' +
          '<span>' +
            '<span class="badge text-bg-primary me-1">' + t('today.levelBadge', { n: p.level, name: levelName(p.level) }) + '</span>' +
            truckBadge + ' ' +
            inTransitBadge +
          '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="row text-center mb-3">' +
            '<div class="col"><small class="text-muted d-block">' + t('today.dayLabel') + '</small><span class="stat-big">' + p.day + '</span></div>' +
            '<div class="col"><small class="text-muted d-block">' + t('today.weekdayLabel') + '</small><span class="stat-big">' + weekdayName(p.weekday) + '</span></div>' +
            '<div class="col"><small class="text-muted d-block">' + t('today.hourLabel') + '</small><span class="stat-big">' + pad2(p.hour) + ':' + pad2(p.minute || 0) + '</span></div>' +
            '<div class="col"><small class="text-muted d-block">' + t('today.cityLabel') + '</small><span class="stat-big stat-big--city">' + (p.currentCity || '—') + '</span></div>' +
          '</div>' +
          '<div class="next-action-callout"><strong>' + t('today.whatNow') + '</strong><br>' + suggestion.text +
          (suggestion.next ? '<div class="next-action-sub mt-2"><strong>' + t('today.nextAction') + '</strong> ' + suggestion.next + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="col-lg-4">' +
      '<div class="card shadow-sm h-100">' +
        '<div class="card-header fw-bold">' + t('today.baseCard') + '</div>' +
        '<div class="card-body">' +
          '<p class="mb-1"><span class="text-muted">' + t('today.baseCity') + '</span> <strong>' + (p.baseCity || '—') + '</strong></p>' +
          '<p class="mb-1"><span class="text-muted">' + t('today.company') + '</span> <strong>' + (p.company || '—') + '</strong></p>' +
          '<p class="mb-1"><span class="text-muted">' + t('today.commission') + '</span> <strong>' + t('today.pctOfFreight', { p: pct(p) }) + '</strong></p>' +
          '<p class="mb-0"><span class="text-muted">' + t('today.shift') + '</span> <strong>' + fmtTurno() + '</strong></p>' +
          '<hr class="my-2">' +
          '<button class="btn btn-outline-primary btn-sm w-100" data-act="time">' + t('today.advanceTime') + '</button>' +
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
      cand.push({ at: w.startMin, label: mealLabel(k) + ' (' + fmtMin(w.startMin) + '–' + fmtMin(w.endMin) + ')' });
    }
  });

  const restAt = p.level <= 2 ? cfg.turno.employeeEndHour * 60 : cfg.turno.freeRestHour * 60;
  if (now < restAt) {
    cand.push({ at: restAt, label: p.level <= 2
      ? t('timeModal.rest', { t: fmtMin(cfg.turno.employeeEndHour * 60) })
      : t('timeModal.restFree', { t: fmtMin(cfg.turno.freeRestHour * 60) }) });
  }

  if (p.level <= 2) {
    cand.push({ at: 24 * 60 + cfg.turno.startHour * 60, label: t('timeModal.shiftTomorrow', { t: fmtMin(cfg.turno.startHour * 60) }) });
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
      cand.push({ at: w.startMin, label: mealLabel(k) + ' (' + fmtMin(w.startMin) + '–' + fmtMin(w.endMin) + ')' });
    } else if (now <= w.endMin) {
      cand.push({ at: now, label: t('timeModal.regNow', { label: mealLabel(k) }) });
    }
  });

  if (dailyStepDone(p, 'lodging')) {
    cand.push({ at: 24 * 60 + cfg.lodging.nextDayHour * 60, label: t('timeModal.sleepTomorrow', { t: fmtMin(cfg.lodging.nextDayHour * 60) }) });
  } else {
    const restAt = p.level <= 2 ? cfg.turno.employeeEndHour * 60 : cfg.turno.freeRestHour * 60;
    if (now < restAt) {
      cand.push({ at: restAt, label: t('timeModal.rest', { t: fmtMin(restAt) }) });
    } else {
      cand.push({ at: now, label: t('timeModal.restNow') });
    }
    if (p.level <= 2) {
      cand.push({ at: 24 * 60 + cfg.turno.startHour * 60, label: t('timeModal.shiftTomorrow', { t: fmtMin(cfg.turno.startHour * 60) }) });
    }
  }

  cand.sort((a, b) => a.at - b.at);
  return cand[0] || null;
}

function suggestAction(p) {
  const now = currentMinutes(p);
  const inBase = p.currentCity === p.baseCity;

  if (!p.baseCity || !p.company) {
    return { text: t('suggest.config') };
  }

  if (!nextDailyStep(p)) {
    return { text: t('suggest.allDone', { t: fmtMin(cfg.lodging.nextDayHour * 60) }) };
  }

  const finDue = financingDueContracts(p);
  if (finDue.length > 0) {
    const totalDue = finDue.reduce((s, f) => s + f.monthlyPayment, 0);
    return { text: t('suggest.financingDue', { n: finDue.length, m: money(p, totalDue) }) };
  }

  if (p.level <= 2 && now >= cfg.turno.employeeEndHour * 60) {
    const dinnerMissing = !mealRegisteredToday(p, 'dinner');
    return {
      text: t('suggest.shiftEnd', { t: fmtMin(cfg.turno.employeeEndHour * 60), dinner: dinnerMissing ? t('suggest.dinnerMissing') : '', start: fmtMin(cfg.turno.startHour * 60) })
    };
  }

  if (p.level >= 3 && now >= cfg.turno.freeRestHour * 60) {
    const dinnerMissing = !mealRegisteredToday(p, 'dinner');
    return {
      text: t('suggest.restTime', { dinner: dinnerMissing ? t('suggest.dinnerParenthetical') : '' })
    };
  }

  for (const [kind, w] of Object.entries(cfg.meals)) {
    if (now >= w.startMin && now <= w.endMin && !mealRegisteredToday(p, kind)) {
      const head = kind === 'breakfast' ? t('suggest.mealHeadBreakfast') : t('suggest.mealHead', { label: mealLabel(kind).toLowerCase() });
      const actionLabel = mealLabel(kind).toLowerCase();
      const employerNote = employerPaysMeals(p) && isInTransit(p) ? t('suggest.mealEmployerNote') : '';
      return {
        text: head + '. ' + t('suggest.mealDo', { label: actionLabel }) + employerNote
      };
    }
  }

  if (employeeSalaryDue(p)) {
    const t2 = employeeTotalSalary(p);
    return { text: t('suggest.empPayday', { d: cfg.salaryDay, n: t2.count, s: money(p, cfg.employeeSalary), p: Math.round(cfg.employeeChargesPct * 100), total: money(p, t2.total) }) };
  }

  if (p.day % cfg.salaryDay === 0 && p.lastSalaryDay !== p.day && (cfg.salary[p.level] || 0) > 0) {
    return { text: t('suggest.salaryDay', { d: cfg.salaryDay, m: money(p, cfg.salary[p.level]) }) };
  }

  if (p.game === 'ATS' && p.level >= 3 && p.day % cfg.salaryDay === 0 && p.lastInsuranceDay !== p.day) {
    return { text: t('suggest.insuranceDay', { d: cfg.salaryDay, m: money(p, cfg.insuranceAts) }) };
  }

  if (p.level <= 2 && p.weekday === 6) {
    return { text: t('suggest.sunday') };
  }

  if (isInTransit(p)) {
    const active = p.cargo.find(c => c.status === 'active' && c.driver === 'player');
    if (active) return { text: t('suggest.inTransit', { from: active.from, to: active.to, m: money(p, active.freight) }) };
  }

  const hasActivePlayerCargo = p.cargo.some(c => c.status === 'active' && c.driver === 'player');

  if (p.level <= 2 && now < cfg.turno.startHour * 60) {
    return { text: t('suggest.beforeShift', { t: fmtMin(cfg.turno.startHour * 60) }) };
  }

  if (p.level <= 2 && p.hour === cfg.turno.startHour && inBase) {
    return { text: t('suggest.shiftStart', { c: p.company || '' }) };
  }

  if (!hasActivePlayerCargo) {
    if (p.level <= 2) {
      return { text: inBase
        ? t('suggest.noCargoBase', { c: p.company || '' })
        : t('suggest.noCargoBranch', { c: p.company || '' }) };
    }
    return { text: t('suggest.noCargoFree') };
  }

  return { text: t('suggest.shiftRunning') };
}

/* ---------------- Render: ações ---------------- */

function renderActions() {
  const panel = document.getElementById('actionPanel');
  const p = currentProfile();
  if (!p) { panel.innerHTML = '<p class="text-muted small mb-0">' + t('actions.noProfile') + '</p>'; return; }

  const salaryDue = p.day % cfg.salaryDay === 0 && p.lastSalaryDay !== p.day && (cfg.salary[p.level] || 0) > 0;
  const insDue = p.game === 'ATS' && p.level >= 3 && p.day % cfg.salaryDay === 0 && p.lastInsuranceDay !== p.day;
  const empDue = employeeSalaryDue(p);
  const activeCargos = p.cargo.filter(c => c.status === 'active');

  let html = '';
  const nextStep = nextDailyStep(p);
  const stepBtns = [
    { key: 'breakfast', act: 'meal-breakfast', icon: '☕', label: t('actions.breakfast'), cost: money(p, cfg.meals.breakfast.amount) },
    { key: 'lunch', act: 'meal-lunch', icon: '🍽', label: t('actions.lunch'), cost: money(p, cfg.meals.lunch.amount) },
    { key: 'dinner', act: 'meal-dinner', icon: '🌙', label: t('actions.dinner'), cost: money(p, cfg.meals.dinner.amount) },
    { key: 'lodging', act: 'lodging', icon: '🛏', label: t('actions.lodging'), cost: money(p, cfg.lodging.amount) }
  ];
  if (nextStep === null) {
    html += '<div class="d-grid gap-2 mb-3">' +
      '<button class="btn btn-info" data-act="sleep">' + t('actions.sleep') +
      '<small class="d-block">' + t('actions.sleepHint', { t: fmtMin(cfg.lodging.nextDayHour * 60) }) + '</small></button>' +
    '</div>';
  }

  html += '<div class="d-grid gap-2">';
  if (nextStep) {
    const s = stepBtns.find(b => b.key === nextStep);
    html += '<button class="btn btn-outline-warning btn-sm" data-act="' + s.act + '">' + s.icon + ' ' + s.label +
      '<small class="d-block">' + s.cost + '</small></button>';
  }
  if (salaryDue) html += '<button class="btn btn-success" data-act="salary">' + t('actions.salary', { m: money(p, cfg.salary[p.level]) }) + '</button>';
  if (empDue) {
    const t2 = employeeTotalSalary(p);
    html += '<button class="btn btn-danger" data-act="payEmployees">' + t('actions.payEmployees', { n: t2.count, m: money(p, t2.total), s: money(p, t2.salary), c: money(p, t2.charges) }) + '</button>';
  }
  if (insDue) html += '<button class="btn btn-danger" data-act="insurance">' + t('actions.insurance', { m: money(p, cfg.insuranceAts) }) + '</button>';
  const finDue = financingDueContracts(p);
  if (finDue.length > 0) {
    const totalDue = finDue.reduce((s, f) => s + f.monthlyPayment, 0);
    html += '<button class="btn btn-warning" data-act="financingPay">' + t('actions.payFinancing', { m: money(p, totalDue) }) + '</button>';
  }
  if (!isInTransit(p)) html += '<button class="btn btn-primary" data-act="cargo">' + t('actions.newCargo') + '</button>';
  if (activeCargos.length) {
    activeCargos.forEach(c => {
      html += '<button class="btn btn-outline-success" data-act="deliver-' + c.id + '">' + t('actions.deliver', { from: c.from, to: c.to, m: money(p, c.commission) }) + '</button>';
    });
  }
  if (!isInTransit(p)) {
    html += '<button class="btn btn-outline-secondary" data-act="reposition">' + t('actions.reposition') + '</button>';
  }
  html += '<button class="btn btn-outline-secondary" data-act="toll">' + t('actions.toll') + '</button>';
  html += '<button class="btn btn-outline-secondary" data-act="fuel">' + t('actions.fuel') + '</button>';
  html += '<button class="btn btn-outline-secondary" data-act="expense">' + t('actions.expense') + '</button>';
  html += '</div>';

  panel.innerHTML = html;
}

/* ---------------- Render: checklist ---------------- */

function renderChecklist() {
  const panel = document.getElementById('checklistPanel');
  const p = currentProfile();
  if (!p) { panel.innerHTML = '<p class="text-muted small mb-0">' + t('checklist.empty') + '</p>'; return; }

  const today = p.log.filter(e => e.day === p.day && (e.type.startsWith('meal_') || e.type === 'lodging'));

  const done = (kind) => {
    const found = today.find(e => e.type === kind);
    return found ? found : null;
  };

  const item = (key, label, cost, hint) => {
    const e = done(key);
    const employerNote = e && e.amount === 0 ? t('checklist.companyPays') : '';
    const icon = e ? '✅' : '⬜';
    return '<div class="check-item">' +
      '<span>' + icon + '</span>' +
      '<span class="flex-grow-1">' + label + employerNote + '</span>' +
      '<span class="badge text-bg-light border">' + (e ? t('checklist.done') : hint) + '</span>' +
      '</div>';
  };

  panel.innerHTML =
    item('meal_breakfast', mealLabel('breakfast'), money(p, cfg.meals.breakfast.amount), money(p, cfg.meals.breakfast.amount)) +
    item('meal_lunch', mealLabel('lunch'), money(p, cfg.meals.lunch.amount), money(p, cfg.meals.lunch.amount)) +
    item('meal_dinner', mealLabel('dinner'), money(p, cfg.meals.dinner.amount), money(p, cfg.meals.dinner.amount)) +
    item('lodging', t('checklist.lodging'), money(p, cfg.lodging.amount), money(p, cfg.lodging.amount)) +
    '<hr class="my-2">' +
    '<div class="small text-muted">' + t('checklist.footer', { n: p.day, w: weekdayName(p.weekday) }) +
    (isInTransit(p) ? ' · ' + t('checklist.inTransit') : ' · ' + t('checklist.outTransit')) + '</div>';
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
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">' + t('fin.noProfile') + '</p>';
    return;
  }

  bv.textContent = money(p, p.balance);
  bb.textContent = t('fin.levelBadge', { n: p.level });
  sv.textContent = money(p, p.startBalance);

  if (p.log.length === 0) {
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">' + t('fin.empty', { m: money(p, p.startBalance) }) + '</p>';
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
          '<small class="text-muted">' + t('fin.dayPrefix', { n: e.day }) + ' · ' + weekdayName(e.weekday) + ' · ' + pad2(e.hour) + ':' + pad2(e.minute || 0) + '</small>' +
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
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">' + t('cargo.empty2') + '</p>';
    const btn0 = document.getElementById('btnNewLoad');
    if (btn0) btn0.style.display = 'none';
    return;
  }
  if (p.cargo.length === 0) {
    panel.innerHTML = '<p class="text-muted small p-3 mb-0">' + t('cargo.empty') + '</p>';
    const btn0 = document.getElementById('btnNewLoad');
    if (btn0) btn0.style.display = '';
    return;
  }
  panel.innerHTML = p.cargo.map(c => {
    const active = c.status === 'active';
    const emp = c.driver && c.driver !== 'player' ? p.employees.find(e => e.id === c.driver) : null;
    const driverName = emp ? emp.name : (c.driver && c.driver !== 'player' ? t('cargo.employee') : t('cargo.you'));
    return '<div class="entry-row">' +
      '<div class="d-flex justify-content-between align-items-center">' +
      '<div>' +
        '<div class="fw-semibold">' + c.from + ' → ' + c.to +
          (active ? ' <span class="badge text-bg-warning">' + t('cargo.activeBadge') + '</span>' : ' <span class="badge text-bg-success">' + t('cargo.deliveredBadge') + '</span>') +
        '</div>' +
        '<small class="text-muted">' + t('cargo.driver', { name: driverName }) + ' · ' + t('cargo.freight', { m: money(p, c.freight) }) + ' · ' + t('cargo.yourCommission', { p: c.pct, m: money(p, c.commission) }) +
        (c.employeeCommission ? ' · ' + t('cargo.empCommission', { m: money(p, c.employeeCommission) }) : '') +
        (c.distance ? ' · ' + t('cargo.km', { n: c.distance }) : '') +
        (c.deliveredDay ? ' · ' + t('cargo.deliveredDay', { n: c.deliveredDay }) : ' · ' + t('cargo.startedDay', { n: c.day })) +
        '</small>' +
      '</div>' +
      (active ? '<button class="btn btn-sm btn-outline-success" data-act="deliver-' + c.id + '">' + t('cargo.deliverBtn') + '</button>' : '') +
    '</div>';
  }).join('');

  const hasActivePlayerCargo = p.cargo.some(c => c.status === 'active' && c.driver === 'player');
  const btn = document.getElementById('btnNewLoad');
  if (btn) btn.style.display = hasActivePlayerCargo ? 'none' : '';
}

/* ---------------- Render: financiamentos ---------------- */

function renderFinancing() {
  const p = currentProfile();
  if (!p || !p.financing || p.financing.length === 0) {
    const panel = document.getElementById('financingPanel');
    if (panel) panel.innerHTML = '<p class="text-muted small mb-0">' + t('financing.noContracts') + '</p>';
    return;
  }

  let html = '';
  const activeContracts = p.financing.filter(f => f.paidPayments < f.installments);
  const completedContracts = p.financing.filter(f => f.paidPayments >= f.installments);

  // Financiamentos ativos
  if (activeContracts.length > 0) {
    html += '<h6>' + t('financing.header') + '</h6>';
    activeContracts.forEach(contract => {
      const dueStatus = contract.paidPayments >= contract.installments ? '' : t('financing.overdueBadge');
      const remaining = financingRemainingCount(p, contract);
      const nextDay = contract.nextPaymentDay || '—';
      html += `
      <div class="mb-3 border-start border-warning ps-2">
        <div class="d-flex justify-content-between align-items-center small">
          <span>${contract.description || t('financing.noContracts')}</span>
          <span class="badge bg-warning ${dueStatus ? 'd-inline' : 'd-none'}" title="${t('financing.overdueBadge')}">${dueStatus}</span>
        </div>
        <div class="d-flex justify-content-between small text-muted mb-1">
          <span>${t('financing.contractProgress', { paid: contract.paidPayments, total: contract.installments })}</span>
          <span>${t('financing.contractNextDay', { day: nextDay })}</span>
        </div>
        <div class="d-flex justify-content-between small">
          <span>${t('financing.contractMonthly', { m: money(p, contract.monthlyPayment) })}</span>
          <span>${t('financing.contractRemaining', { n: remaining })}</span>
        </div>
      </div>`;
    });
  }

  // Financiamentos concluídos
  if (completedContracts.length > 0) {
    html += '<h6>' + t('financing.upcomingHeader') + '</h6>';
    completedContracts.forEach(contract => {
      html += `
      <div class="mb-2 text-success small">
        <strong>${contract.description}</strong> — ${t('financing.contractProgress', { paid: contract.installments, total: contract.installments })} • ${t('financing.payBtn')}
      </div>`;
    });
  }

  // Se não houver ativos nem completos
  if (html === '') {
    html = '<p class="text-muted small mb-0">' + t('financing.noContracts') + '</p>';
  }

  document.getElementById('financingPanel').innerHTML = html;
  renderFinancingAlert();
}

function renderFinancingAlert() {
  const p = currentProfile();
  const container = document.getElementById('financingAlertContainer');
  if (!container || !p || !p.financing) return;

  const overdue = financingOverdueContracts(p);
  if (overdue.length === 0) {
    container.innerHTML = '';
    return;
  }

  const totalDue = overdue.reduce((s, f) => s + f.monthlyPayment, 0);
  container.innerHTML =
    '<div class="alert alert-danger d-flex justify-content-between align-items-center" role="alert">' +
      '<span>' + t('financingAlert.overdue', { n: overdue.length, m: money(p, totalDue) }) + '</span>' +
      '<button class="btn btn-sm btn-danger" data-act="financingPay">' +
        '<i class="bi bi-cash"></i> ' + t('financingAlert.payBtn') +
      '</button>' +
    '</div>';
}

function openFinancingModal() {
  const p = currentProfile();
  if (!p) return;

  modal('Financing').show();
  const descInput = document.getElementById('fcDesc');
  if (descInput) descInput.value = '';

  const amountInput = document.getElementById('fcAmount');
  if (amountInput) amountInput.value = '';

  const downInput = document.getElementById('fcDown');
  if (downInput) downInput.value = '0';

  const installmentsInput = document.getElementById('fcInstallments');
  if (installmentsInput) installmentsInput.value = '12';

  const interestInput = document.getElementById('fcInterest');
  if (interestInput) interestInput.value = '20';

  updateFinancingSummary();
}

function updateFinancingSummary() {
  const p = currentProfile();
  if (!p) return;

  const amount = parseFloat(document.getElementById('fcAmount').value) || 0;
  const downPayment = parseFloat(document.getElementById('fcDown').value) || 0;
  const installments = parseInt(document.getElementById('fcInstallments').value) || 12;
  const interest = parseFloat(document.getElementById('fcInterest').value) || 20;

  if (amount <= 0) {
    document.getElementById('fcSummary').innerHTML = '';
    return;
  }

  const financedAmount = Math.max(0, amount - downPayment);
  const totalAmount = Math.round(financedAmount * (1 + interest / 100) * 100) / 100;
  const monthlyPayment = Math.round(totalAmount / Math.max(1, installments) * 100) / 100;

  document.getElementById('fcSummary').innerHTML =
    t('financingModal.summary', {
      total: money(p, totalAmount),
      monthly: money(p, monthlyPayment),
      installments: installments
    });
}

function handleFinancingPay() {
  const p = currentProfile();
  if (!p || !p.financing) return;

  const due = financingDueContracts(p);
  if (due.length === 0) return;

  if (due.length === 1) {
    confirmModal(
      t('confirm.financingPaymentTitle'),
      t('confirm.financingPaymentBody', { m: money(p, due[0].monthlyPayment) }),
      () => payFinancingInstallment(p, due[0].id),
      { time: true }
    );
  } else {
    const totalDue = due.reduce((s, f) => s + f.monthlyPayment, 0);
    confirmModal(
      t('confirm.financingPaymentTitle'),
      t('confirm.financingPaymentBody', { m: money(p, totalDue) }),
      () => {
        due.forEach(contract => payFinancingInstallment(p, contract.id));
      },
      { time: true }
    );
  }
}

/* ---------------- Render: funcionários ---------------- */

function renderEmployees() {
  const panel = document.getElementById('employeePanel');
  const btn = document.getElementById('btnAddEmployee');
  const p = currentProfile();
  if (!p) {
    if (btn) btn.disabled = true;
    panel.innerHTML = '<p class="text-muted small mb-0">' + t('emp.empty') + '</p>';
    return;
  }
  if (btn) btn.disabled = p.level < 4;
  if (p.level < 4) {
    panel.innerHTML = '<p class="text-muted small mb-0">' + t('emp.locked', { s: money(p, cfg.employeeSalary), p: Math.round(cfg.employeeChargesPct * 100), d: cfg.salaryDay, c: Math.round(cfg.employeeCommission * 100) }) + '</p>';
    return;
  }
  if (p.employees.length === 0) {
    panel.innerHTML = '<p class="text-muted small mb-0">' + t('emp.noEmployees') + '</p>';
    return;
  }
  panel.innerHTML = p.employees.map(e => {
    const due = (e.lastSalaryDay || 0) !== p.day;
    return '<div class="entry-row">' +
      '<div class="d-flex justify-content-between align-items-center">' +
        '<div>' +
          '<div class="fw-semibold">' + e.name + '</div>' +
          '<small class="text-muted">' + t('emp.salaryLine', { s: money(p, cfg.employeeSalary), p: Math.round(cfg.employeeChargesPct * 100), d: cfg.salaryDay }) +
            (due ? ' · <span class="text-danger fw-semibold">' + t('emp.pending') + '</span>' : ' · ' + t('emp.paid')) +
          '</small>' +
        '</div>' +
        '<button class="btn btn-sm btn-outline-secondary" data-act="empTravel-' + e.id + '">' + t('emp.travelExpense') + '</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ---------------- Render: regras ---------------- */

function buildStartSetupHtml() {
  return t('rules.setup');
}

function buildCampaignCommandsHtml() {
  return t('rules.cmdIntro') +
    '<ul class="mb-0 list-unstyled">' +
    CONST.campaignCommands.map((c, i) =>
      '<li class="d-flex align-items-center gap-2 mb-2">' +
        '<button class="btn btn-sm btn-outline-secondary btn-copy-cmd" type="button" data-act="copyCmd-' + i + '" title="' + t('rules.copyCmdTitle') + '">📋</button>' +
        '<code>' + c.cmd + '</code>' +
        '<span class="text-muted small">→ ' + campaignCmd(i).desc + '</span>' +
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
      '<li>' + t('rules.custos.0', { b: mealLabel('breakfast'), mb: m(cfg.meals.breakfast.amount), db: fmtDur(cfg.meals.breakfast.durationMin), l: mealLabel('lunch'), ml: m(cfg.meals.lunch.amount), dl: fmtDur(cfg.meals.lunch.durationMin), d: mealLabel('dinner'), md: m(cfg.meals.dinner.amount), dd: fmtDur(cfg.meals.dinner.durationMin) }) + '</li>' +
      '<li>' + t('rules.custos.1', { m: m(cfg.lodging.amount), t: fmtMin(cfg.lodging.nextDayHour * 60) }) + '</li>' +
      '<li>' + t('rules.custos.2', { t: fmtTurno() }) + '</li>' +
      '<li>' + t('rules.custos.3', { d: fmtDur(cfg.turno.deliveryMin) }) + '</li>' +
      '<li>' + t('rules.custos.4', { m: m(cfg.tag), m2: m(cfg.insuranceAts), d: cfg.salaryDay }) + '</li>' +
      '</ul>',
    rulesNiveisBody: '<ul class="mb-0">' +
      '<li>' + t('rules.niveis.0', { s: m(cfg.salary[1]), c: Math.round(cfg.commission[1] * 100) }) + '</li>' +
      '<li>' + t('rules.niveis.1', { s: m(cfg.salary[2]), c: Math.round(cfg.commission[2] * 100), t: m(cfg.tag) }) + '</li>' +
      '<li>' + t('rules.niveis.2', { c: Math.round(cfg.commission[3] * 100), s: m(cfg.insuranceAts), d: cfg.salaryDay }) + '</li>' +
      '<li>' + t('rules.niveis.3', { c: Math.round(cfg.commission[4] * 100), s: m(cfg.employeeSalary), p: Math.round(cfg.employeeChargesPct * 100), d: cfg.salaryDay, e: Math.round(cfg.employeeCommission * 100) }) + '</li>' +
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
  renderFinancing();
  renderFinancingAlert();
  const navVer = document.getElementById('appVersion');
  if (navVer) navVer.textContent = 'v' + APP_VERSION;
  const startVer = document.getElementById('startAppVersion');
  if (startVer) startVer.textContent = 'v' + APP_VERSION + ' · ver changelog';
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
    list.innerHTML = '<div class="text-muted text-center py-3">' + t('selectProfile.empty') + '</div>';
    return;
  }
  list.innerHTML = '';
  state.profiles.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
    btn.innerHTML =
      '<span><strong>' + escapeHtml(p.name) + '</strong> <span class="text-muted small">— ' + t('fin.levelBadge', { n: p.level }) + ' · ' + escapeHtml(levelName(p.level)) + '</span></span>' +
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
    copyText(c.cmd).then(ok => toast(ok ? t('cmd.copiedToast') : t('cmd.failToast'), ok ? 'success' : 'danger'));
    return;
  }

  if (act === 'time') { openTimeModal(); return; }
  if (act === 'level') { openLevelModal(); return; }
  if (act === 'sleep') {
    if (!nextDailyStep(p)) {
      const fromDay = p.day;
      const fromWeekday = p.weekday;
      confirmModal(t('confirm.sleepTitle'),
        t('confirm.sleepBody', { t: fmtMin(cfg.lodging.nextDayHour * 60) }),
        () => {
          fromAbs(p, (Math.floor(toAbs(p) / 1440) + 1) * 1440 + cfg.lodging.nextDayHour * 60);
          saveState();
          advanceDayFlow(p, 'g_set_time ' + p.hour + (p.minute ? ' ' + p.minute : ''), fromDay, fromDay + 1, fromWeekday);
        },
        { time: false, city: true, undo: true });
    }
    return;
  }
  if (act === 'salary') {
    confirmModal(t('confirm.salaryTitle'), t('confirm.salaryBody', { m: money(p, cfg.salary[p.level]), d: cfg.salaryDay }), () => actionSalary(p), { time: true });
    return;
  }
  if (act === 'payEmployees') {
    const t2 = employeeTotalSalary(p);
    confirmModal(t('confirm.payEmpTitle'),
      t('confirm.payEmpBody', { n: t2.count, s: money(p, t2.salary), p: Math.round(cfg.employeeChargesPct * 100), c: money(p, t2.charges), t: money(p, t2.total) }),
      () => payEmployeeSalaries(p), { time: true });
    return;
  }
  if (act === 'insurance') {
    confirmModal(t('confirm.insuranceTitle'), t('confirm.insuranceBody', { m: money(p, cfg.insuranceAts) }), () => actionInsurance(p), { time: true });
    return;
  }
  if (act === 'cargo') { openCargoModal(); return; }
  if (act === 'expense') { openExpenseModal(); return; }
  if (act === 'toll' || act === 'fuel') { openQuickExpenseConfirm(p, act); return; }
  if (act === 'reposition') { openRepositionModal(); return; }
  if (act === 'financing') { openFinancingModal(); return; }
  if (act === 'financingPay') { handleFinancingPay(); return; }
  if (act.startsWith('payFinancing-')) {
    const id = act.slice(13);
    const contract = p.financing.find(f => f.id === id);
    if (contract) {
      confirmModal(
        t('confirm.financingPaymentTitle'),
        t('confirm.financingPaymentBody', { m: money(p, contract.monthlyPayment) }),
        () => payFinancingInstallment(p, id),
        { time: true }
      );
    }
    return;
  }
  if (act.startsWith('meal-')) {
    const kind = act.split('-')[1];
    const meal = cfg.meals[kind];
    const employer = employerPaysMeals(p) && isInTransit(p);
    confirmModal(mealLabel(kind),
      (employer ? t('confirm.employerNoDebit') : t('confirm.debit', { m: money(p, meal.amount) })) +
      ' <small class="d-block text-muted">' + t('confirm.dayTime', { d: p.day, t: pad2(p.hour) + ':' + pad2(p.minute || 0) }) + '</small>',
      () => actionMeal(p, kind),
      { time: true, durationMin: meal.durationMin || 0, city: true });
    return;
  }
  if (act === 'lodging') {
    const employer = employerPaysLodging(p) && isInTransit(p);
    confirmModal(t('confirm.lodgingTitle'),
      (employer ? t('confirm.employerNoDebit') : t('confirm.debit', { m: money(p, cfg.lodging.amount) })) +
      ' <small class="d-block text-muted">' + t('confirm.dayTime', { d: p.day, t: pad2(p.hour) + ':' + pad2(p.minute || 0) }) + '</small>',
      () => actionLodging(p),
      { time: true, lodging: true, city: true });
    return;
  }
  if (act.startsWith('empTravel-')) {
    const emp = p.employees.find(e => e.id === act.slice(10));
    if (emp) {
      openExpenseModal();
      document.getElementById('exType').value = 'emp_travel';
      fillExpenseModal();
      document.getElementById('exNote').value = t('confirm.empTravelNote', { name: emp.name });
      document.getElementById('exAmount').focus();
    }
    return;
  }
  if (act.startsWith('deliver-')) {
    const c = p.cargo.find(x => x.id === act.slice(8));
    if (c) {
      confirmModal(t('confirm.deliverTitle'), t('confirm.deliverBody', { from: c.from, to: c.to, m: money(p, c.commission) }),
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
  el.textContent = t('newProfile.hint', { c: cur, n: fmtNum(5000) });
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
  const name = document.getElementById('npName').value.trim() || t('newProfile.defaultName', { n: Date.now() });
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
  populateCompanyCombo(document.getElementById('cfgCompany'), p.company, p.game);
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
  populateCompanyCombo(document.getElementById('cfgCompany'), p.company, game);
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
  confirmModal(t('profile.deleteConfirmTitle'), t('profile.deleteConfirmBody', { name: p.name }), () => {
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
  populateCitySelect(document.getElementById('cgFrom'), p.currentCity || '', p.game);
  populateCitySelect(document.getElementById('cgTo'), '', p.game);
  document.getElementById('cgDist').value = '';
  document.getElementById('cgFreight').value = '';
  document.getElementById('cgTime').value = pad2(p.hour) + ':' + pad2(p.minute || 0);
  document.getElementById('cgPct').textContent = pct(p) + '%';

  const driverWrap = document.getElementById('driverWrap');
  const driverSel = document.getElementById('cgDriver');
  if (p.level >= 4 && p.employees.length > 0) {
    driverWrap.classList.remove('d-none');
    driverSel.innerHTML = '<option value="player">' + t('cargoModal.driverYou', { p: pct(p) }) + '</option>' +
      p.employees.map(e => '<option value="' + e.id + '">' + t('cargoModal.driverEmp', { name: e.name, p: pct(p), e: Math.round(cfg.employeeCommission * 100) }) + '</option>').join('');
  } else {
    driverWrap.classList.add('d-none');
    driverSel.innerHTML = '<option value="player">' + t('cargoModal.driverYou2') + '</option>';
  }

  const hint = document.getElementById('cargoHint');
  if (p.level <= 2) {
    hint.innerHTML = t('cargoModal.hint1', { c: p.company || '—' });
  } else if (p.level === 3) {
    hint.innerHTML = t('cargoModal.hint2');
  } else {
    hint.innerHTML = t('cargoModal.hint3', { p: Math.round(cfg.commission[4] * 100), e: Math.round(cfg.employeeCommission * 100) });
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
    toast(t('cargoModal.fillToast'), 'danger');
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
    ? t('repositionModal.hint1')
    : t('repositionModal.hint2');
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
  if (!to) { toast(t('repositionModal.destToast'), 'danger'); return; }
  const toMin = (str) => {
    const parts = String(str || '').split(':');
    const h = parseInt(parts[0], 10);
    if (isNaN(h)) return null;
    const mm = isNaN(parseInt(parts[1], 10)) ? 0 : Math.min(59, Math.max(0, parseInt(parts[1], 10)));
    return Math.min(23, Math.max(0, h)) * 60 + mm;
  };
  const depMin = toMin(document.getElementById('rpTime').value);
  const arrMin = toMin(document.getElementById('rpTimeIn').value);
  if (depMin === null || arrMin === null) { toast(t('repositionModal.timeToast'), 'danger'); return; }
  const depAbs = timeToAbsolute(p, Math.floor(depMin / 60), depMin % 60);
  const arrAbs = timeToAbsolute(p, Math.floor(arrMin / 60), arrMin % 60);
  if (arrAbs <= depAbs) { toast(t('repositionModal.arrAfterDep'), 'danger'); return; }
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
  const t2 = EXPENSE_TYPES.find(e => e.id === id);
  if (!t2) return;
  document.getElementById('exDir').value = t2.dir;
  const p = currentProfile();
  if (!p) return;
  let hint = expandNote(expenseNote(id), p);
  if (t2.dir === 'out' && employerCoversExpense(p, id)) {
    hint += (hint ? ' ' : '') + t('expenseModal.employerPays');
  }
  document.getElementById('exHint').textContent = hint;
  const cityLabel = document.getElementById('exCityLabel');
  if (cityLabel) cityLabel.textContent = (id === 'ferry') ? t('expenseModal.cityDest') : t('expenseModal.city');
  let def = t2.def;
  if (id === 'salary') def = cfg.salary[p.level] || 0;
  else if (id === 'tag') def = cfg.tag;
  else if (id === 'insurance') def = cfg.insuranceAts;
  else if (id === 'emp_travel') def = cfg.lodging.amount;
  document.getElementById('exAmount').value = def;
}

function openExpenseModal() {
  const sel = document.getElementById('exType');
  sel.innerHTML = EXPENSE_TYPES.filter(e => e.id !== 'toll' && e.id !== 'fuel').map(e => '<option value="' + e.id + '">' + expenseLabel(e.id) + '</option>').join('');
  document.getElementById('exNote').value = '';
  const p = currentProfile();
  populateCitySelect(document.getElementById('exCity'), p ? (p.currentCity || p.baseCity || '') : '', p ? p.game : 'ATS');
  document.getElementById('exTime').value = p ? pad2(p.hour) + ':' + pad2(p.minute || 0) : '';
  fillExpenseModal();
  modal('Expense').show();
}

document.getElementById('exType').addEventListener('change', fillExpenseModal);

document.getElementById('btnSaveExpense').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  const typeId = document.getElementById('exType').value;
  const t2 = EXPENSE_TYPES.find(e => e.id === typeId) || EXPENSE_TYPES[EXPENSE_TYPES.length - 1];
  const dir = document.getElementById('exDir').value;
  const amountRaw = parseFloat(document.getElementById('exAmount').value);
  const magnitude = isNaN(amountRaw) ? 0 : Math.abs(amountRaw);
  const signed = dir === 'in' ? magnitude : -magnitude;
  const covered = dir === 'out' && magnitude > 0 && employerCoversExpense(p, typeId);
  const finalAmount = covered ? 0 : signed;
  const note = document.getElementById('exNote').value.trim();
  const city = document.getElementById('exCity').value.trim();
  const timeParts = String(document.getElementById('exTime').value || '').split(':');
  const th = parseInt(timeParts[0], 10);
  modal('Expense').hide();
  pushUndo();
  if (city) p.currentCity = city;
  if (!isNaN(th)) {
    const tm = isNaN(parseInt(timeParts[1], 10)) ? 0 : Math.min(59, Math.max(0, parseInt(timeParts[1], 10)));
    applyActionTime(p, Math.min(23, Math.max(0, th)), tm, 0);
  }
  addExpense(p, typeId, finalAmount, note + (city ? t('entry.city', { c: city }) : '') + (covered ? ' · ' + t('entry.quickCovered') : ''));
  if (covered) toast(t('expenseModal.coveredToast'), 'success');
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
    ? t('daySummary.titleSingle', { n: fromDay, w: weekdayName(fromWeekday) })
    : t('daySummary.titleRange', { a: fromDay, b: toDayExclusive - 1 });

  const badge = result > 0
    ? '<span class="badge text-bg-success">' + t('daySummary.positive') + '</span>'
    : (result < 0 ? '<span class="badge text-bg-danger">' + t('daySummary.negative') + '</span>' : '<span class="badge text-bg-secondary">' + t('daySummary.neutral') + '</span>');
  const resCls = result > 0 ? 'amount-pos' : (result < 0 ? 'amount-neg' : 'amount-zero');
  const resStr = result === 0 ? money(p, 0) : (result > 0 ? '+' : '−') + money(p, Math.abs(result));

  document.getElementById('dsTitle').textContent = title;
  document.getElementById('dsSummary').innerHTML =
    '<div class="row g-1 small">' +
      '<div class="col-6">' + t('daySummary.start') + '</div><div class="col-6 text-end">' + money(p, start) + '</div>' +
      '<div class="col-6">' + t('daySummary.income') + '</div><div class="col-6 text-end amount-pos">+' + money(p, inc) + '</div>' +
      '<div class="col-6">' + t('daySummary.outgo') + '</div><div class="col-6 text-end amount-neg">−' + money(p, Math.abs(out)) + '</div>' +
      '<div class="col-6 border-top pt-1"><strong>' + t('daySummary.result') + '</strong></div>' +
      '<div class="col-6 text-end border-top pt-1"><strong class="' + resCls + '">' + resStr + '</strong> ' + badge + '</div>' +
      '<div class="col-6"><strong>' + t('daySummary.final') + '</strong></div><div class="col-6 text-end"><strong>' + money(p, end) + '</strong></div>' +
    '</div>';

  const clKeys = [
    { type: 'meal_breakfast', label: mealLabel('breakfast') },
    { type: 'meal_lunch', label: mealLabel('lunch') },
    { type: 'meal_dinner', label: mealLabel('dinner') },
    { type: 'lodging', label: t('checklist.lodging') }
  ];
  const clItem = (k, present) =>
    '<div class="check-item">' +
      '<span>' + (present ? '✅' : '⬜') + '</span>' +
      '<span class="flex-grow-1">' + k.label + '</span>' +
      '<span class="badge ' + (present ? 'text-bg-success' : 'text-bg-secondary') + '">' + (present ? t('daySummary.done') : t('daySummary.missing')) + '</span>' +
    '</div>';
  let clHtml;
  if (single) {
    const present = {};
    sorted.forEach(e => { if (e.day === fromDay) present[e.type] = true; });
    const done = clKeys.filter(k => present[k.type]).length;
    clHtml =
      '<div class="d-flex justify-content-between align-items-center mb-2">' +
        '<strong class="small text-uppercase">' + t('daySummary.checklistTitle') + '</strong>' +
        (done === clKeys.length
          ? '<span class="badge text-bg-success">' + t('daySummary.complete') + '</span>'
          : '<span class="badge text-bg-warning">' + t('daySummary.missingCount', { n: clKeys.length - done, total: clKeys.length }) + '</span>') +
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
          '<span>' + (done === clKeys.length ? '✅' : '⚠️') + ' ' + t('daySummary.dayPrefix', { n: d }) + ' · ' + weekdayName((fromWeekday + (d - fromDay)) % 7) + '</span>' +
          '<span class="badge ' + (done === clKeys.length ? 'text-bg-success' : 'text-bg-warning') + '">' + done + '/' + clKeys.length + '</span>' +
        '</div>'
      );
    }
    clHtml =
      '<div class="d-flex justify-content-between align-items-center mb-2">' +
        '<strong class="small text-uppercase">' + t('daySummary.checklistRangeTitle') + '</strong>' +
        (allOk
          ? '<span class="badge text-bg-success">' + t('daySummary.complete') + '</span>'
          : '<span class="badge text-bg-warning">' + t('daySummary.pending') + '</span>') +
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
              '<small class="text-muted">' + (single ? '' : t('daySummary.dayPrefix', { n: e.day }) + ' · ') + weekdayName(e.weekday) + ' · ' + pad2(e.hour) + ':' + pad2(e.minute || 0) + '</small>' +
            '</div>' +
            '<span class="' + cls + '">' + amountStr + '</span>' +
          '</div>' +
          (e.note ? '<small class="text-muted d-block">' + e.note + '</small>' : '') +
        '</div>';
      }).join('')
    : '<p class="text-muted small mb-0">' + t('daySummary.empty') + '</p>';

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
  document.getElementById('tmNow').innerHTML = '<span class="stat-big">' + t('timeModal.nowBig', { d: p.day, w: weekdayName(p.weekday), t: pad2(p.hour) + ':' + pad2(p.minute || 0) }) + '</span>';
  const nextIn = ev ? ev.at - now : 0;
  const btn = document.getElementById('btnAddHour');
  const blocked = !ev || nextIn < 60;
  btn.disabled = blocked;
  btn.textContent = blocked ? t('timeModal.addHourBlocked') : t('timeModal.addHour');
  if (ev) {
    document.getElementById('tmNext').textContent = ev.label;
    document.getElementById('tmNextIn').textContent = nextIn > 0 ? t('timeModal.dueIn', { d: fmtDur(nextIn) }) : t('timeModal.now2');
  } else {
    document.getElementById('tmNext').textContent = t('timeModal.nextNone');
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
    toast(t('timeModal.arrivedToast'), 'warning');
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
    2: t('levelModal.rules2', { s: money(p, cfg.salary[2]), c: Math.round(cfg.commission[2] * 100), t: money(p, cfg.tag) }),
    3: t('levelModal.rules3', { c: Math.round(cfg.commission[3] * 100), s: money(p, cfg.insuranceAts), d: cfg.salaryDay }),
    4: t('levelModal.rules4')
  };
  document.getElementById('lvHint').innerHTML = rules[next] || t('levelModal.max');
  document.getElementById('btnLevelUp').disabled = !rules[next];
  modal('Level').show();
}

document.getElementById('btnLevelUp').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  if (p.level >= 4) return;
  pushUndo();
  p.level += 1;
  addEntry(p, { type: 'level', label: t('levelModal.entry', { n: p.level }), amount: 0, note: levelName(p.level) });
  saveState();
  modal('Level').hide();
  renderAll();
  toast(t('levelModal.toast', { name: levelName(p.level) }), 'success');
});

document.getElementById('btnCmdCopy').addEventListener('click', () => {
  const cmd = document.getElementById('cmdText').value;
  copyText(cmd).then(ok => toast(ok ? t('cmd.copiedToast') : t('cmd.failToast'), ok ? 'success' : 'danger'));
});

document.getElementById('modalCmd').addEventListener('hidden.bs.modal', () => {
  const chk = document.getElementById('chkAutoCopyCmd');
  if (chk && chk.checked) {
    cfg.autoCopyCmd = true;
    saveConfig();
    toast(t('cmd.autoToast'), 'info');
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
  a.download = t('backup.fileName');
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('backup.exported'), 'success');
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
      toast(t('backup.invalid'), 'danger');
      return;
    }
    confirmModal(
      t('backup.title'),
      t('backup.body', { n: data.profiles.length }),
      () => {
        pushUndo();
        state = data;
        saveState();
        if (data.config) {
          cfg = sanitizeConfig(data.config);
          saveConfig();
        }
        renderAll();
        toast(t('backup.done'), 'success');
      }
    );
  };
  reader.readAsText(file);
});

/* ---------------- Confirm genérica ---------------- */

let confirmCallback = null;
let pendingAction = null;
let pendingCity = '';
let pendingAmount = 0;

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
  const cw = document.getElementById('cfCityWrap');
  if (cw) {
    if (opts.city) {
      const p = currentProfile();
      populateCitySelect(document.getElementById('cfCity'), p ? (p.currentCity || p.baseCity || '') : '', p ? p.game : 'ATS');
      cw.classList.remove('d-none');
    } else {
      cw.classList.add('d-none');
    }
  }
  const aw = document.getElementById('cfAmountWrap');
  if (aw) {
    if (opts.amount) {
      document.getElementById('cfAmount').value = opts.amountDef !== undefined ? opts.amountDef : '';
      aw.classList.remove('d-none');
    } else {
      aw.classList.add('d-none');
    }
  }
  pendingAction = { time: !!opts.time, durationMin: opts.durationMin || 0, lodging: !!opts.lodging, city: !!opts.city, amount: !!opts.amount, undo: !!opts.undo };
  confirmCallback = callback;
  modal('Confirm').show();
}

function applyPendingCity() {
  const p = currentProfile();
  pendingCity = '';
  if (!p || !pendingAction || !pendingAction.city) return;
  const city = document.getElementById('cfCity').value.trim();
  if (city) {
    p.currentCity = city;
    pendingCity = city;
  }
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
  if (pendingAction && pendingAction.amount) {
    const raw = parseFloat(document.getElementById('cfAmount').value);
    if (isNaN(raw) || raw <= 0) { toast(t('confirm.amountToast'), 'danger'); return; }
    pendingAmount = raw;
  }
  modal('Confirm').hide();
  if (pendingAction && (pendingAction.time || pendingAction.undo)) pushUndo();
  applyPendingCity();
  applyPendingTime();
  if (confirmCallback) confirmCallback();
  confirmCallback = null;
  pendingAction = null;
  pendingCity = '';
  pendingAmount = 0;
});

/* ---------------- Funcionário (adicionar) ---------------- */

function updateEmployeeHint(p) {
  const el = document.getElementById('empHint');
  if (!el) return;
  el.textContent = t('employeeModal.hint', { s: money(p, cfg.employeeSalary), p: Math.round(cfg.employeeChargesPct * 100), d: cfg.salaryDay, c: Math.round(cfg.employeeCommission * 100) });
}

document.getElementById('btnAddEmployee').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  if (p.level < 4) { toast(t('levelModal.onlyLevel4'), 'warning'); return; }
  document.getElementById('empName').value = '';
  updateEmployeeHint(p);
  modal('Employee').show();
});

document.getElementById('btnSaveEmployee').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;
  const name = document.getElementById('empName').value.trim();
  if (!name) { toast(t('employeeModal.nameToast'), 'danger'); return; }
  pushUndo();
  addEmployee(p, name);
  saveState();
  modal('Employee').hide();
  renderAll();
  toast(t('employeeModal.hiredToast', { name: name }), 'success');
});

document.getElementById('btnSaveFinancing').addEventListener('click', () => {
  const p = currentProfile();
  if (!p) return;

  const amount = parseFloat(document.getElementById('fcAmount').value) || 0;
  const description = document.getElementById('fcDesc').value.trim();
  const downPayment = parseFloat(document.getElementById('fcDown').value) || 0;
  const installments = parseInt(document.getElementById('fcInstallments').value) || 12;
  const interest = parseFloat(document.getElementById('fcInterest').value) || 20;

  if (amount <= 0) {
    toast(t('financingModal.amountToast'), 'danger');
    return;
  }
  if (p.level < 2) {
    toast(t('financing.lvl2Required'), 'warning');
    return;
  }

  pushUndo();
  createFinancing(p, { amount, description, installments, interest, downPayment });
  saveState();
  modal('Financing').hide();
  renderAll();
  toast(t('financingModal.createdToast'), 'success');
});

['fcAmount', 'fcDown', 'fcInstallments', 'fcInterest'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateFinancingSummary);
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
const CUSTOM_CITIES_KEY = 'realistic_campaign_custom_cities';
let CITIES = { ATS: [], ETS2: [] };
let CUSTOM_CITIES = { ATS: [], ETS2: [] };

function loadCustomList(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (raw && Array.isArray(raw.ATS) && Array.isArray(raw.ETS2)) return raw;
  } catch (e) { /* ignore */ }
  return { ATS: [], ETS2: [] };
}

function saveCustomList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* ignore */ }
}

/* Mantém apenas customizados que não colidem com a lista oficial (sem acentos/caixa). */
function customEntries(officialList, customList, nameOf) {
  const names = new Set(officialList.map(o => normSearch(nameOf(o))));
  return customList.filter(c => !names.has(normSearch(nameOf(c))));
}

async function loadCities() {
  try {
    const cached = JSON.parse(localStorage.getItem(CITIES_KEY) || 'null');
    if (cached && Array.isArray(cached.ATS) && Array.isArray(cached.ETS2)) {
      CITIES = cached;
    }
    CUSTOM_CITIES = loadCustomList(CUSTOM_CITIES_KEY);
    const [ats, ets2] = await Promise.all([
      fetch('cities_ats.json').then(r => r.json()),
      fetch('cities_ets2.json').then(r => r.json())
    ]);
    if (Array.isArray(ats)) CITIES.ATS = ats;
    if (Array.isArray(ets2)) CITIES.ETS2 = ets2;
    CUSTOM_CITIES.ATS = customEntries(CITIES.ATS, CUSTOM_CITIES.ATS, c => c.city);
    CUSTOM_CITIES.ETS2 = customEntries(CITIES.ETS2, CUSTOM_CITIES.ETS2, c => c.city);
    saveCustomList(CUSTOM_CITIES_KEY, CUSTOM_CITIES);
    try { localStorage.setItem(CITIES_KEY, JSON.stringify(CITIES)); } catch (e) { /* ignore */ }
  } catch (e) {
    if (CITIES.ATS.length === 0 && CITIES.ETS2.length === 0) {
      console.warn('Falha ao carregar cities_*.json — sirva via static server (ex.: npx serve .)');
    }
  }
}

/* ---------------- Combobox de cidade (busca) ----------------
   Substitui os antigos <select> de cidade. Cada combobox é um
   <div class="city-combo"> com um <input class="city-combo-input">
   e um <ul class="city-combo-list">. O valor lido é o texto do input
   (`.value`), então a lógica existente não muda. A lista filtra em
   tempo real (sem acentos) e o blur restaura a última seleção válida
   ou esvazia — sem texto livre, como o select nativo.
*/

function normSearch(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function comboOpts(inputEl) {
  return inputEl._comboOpts || [];
}

function comboListEl(inputEl) {
  const w = inputEl.closest('.city-combo');
  return w ? w.querySelector('.city-combo-list') : null;
}

function comboRender(inputEl) {
  const ul = comboListEl(inputEl);
  if (!ul) return;
  const q = normSearch(inputEl.value);
  const opts = comboOpts(inputEl);
  let list;
  if (!q) {
    list = opts;
  } else {
    const starts = [];
    const contains = [];
    opts.forEach(o => {
      const n = normSearch(o.label);
      if (n.indexOf(q) === 0) starts.push(o);
      else if (n.indexOf(q) > 0) contains.push(o);
    });
    list = starts.concat(contains);
  }
  const typed = (inputEl.value || '').trim();
  const exact = !!typed && opts.some(o => normSearch(o.value) === normSearch(typed));
  const canCreate = !!typed && !exact && !inputEl.disabled;
  let html = '';
  if (list.length > 0) {
    html = list.map(o =>
      '<li class="city-combo-opt' + (o.custom ? ' city-combo-opt--custom' : '') + '" data-value="' + escAttr(o.value) + '">' + escHtml(o.label) + '</li>'
    ).join('');
  } else if (!canCreate) {
    html = '<li class="city-combo-empty">Nenhum resultado para “' + escHtml(inputEl.value) + '”</li>';
  }
  if (canCreate) {
    html += '<li class="city-combo-create" data-value="' + escAttr(typed) + '">+ Criar “' + escHtml(typed) + '”</li>';
  }
  ul.innerHTML = html;
  inputEl._comboIdx = -1;
}

function comboShow(inputEl) {
  if (inputEl.disabled) return;
  const ul = comboListEl(inputEl);
  if (!ul) return;
  comboRender(inputEl);
  ul.classList.remove('d-none');
  inputEl.setAttribute('aria-expanded', 'true');
}

function comboHide(inputEl) {
  const ul = comboListEl(inputEl);
  if (ul) ul.classList.add('d-none');
  inputEl.setAttribute('aria-expanded', 'false');
  inputEl._comboIdx = -1;
}

function comboCloseOthers(inputEl) {
  document.querySelectorAll('.city-combo-input').forEach(el => {
    if (el !== inputEl) comboHide(el);
  });
}

function comboCloseAll() {
  document.querySelectorAll('.city-combo-input').forEach(comboHide);
}

function comboSelect(inputEl, optEl) {
  const value = optEl.getAttribute('data-value');
  inputEl.value = value;
  inputEl._comboVal = value;
  comboHide(inputEl);
}

function populateCitySelect(inputEl, selectedValue, game) {
  if (!inputEl) return;
  inputEl._comboKind = 'city';
  inputEl._comboGame = game;
  const official = CITIES[game] || [];
  const customs = customEntries(official, CUSTOM_CITIES[game] || [], c => c.city);
  inputEl._comboOpts = official.map(c => ({
    value: c.city,
    label: c.city + (c.state ? ' — ' + c.state : '')
  })).concat(customs.map(c => ({
    value: c.city,
    label: c.city + t('combo.yours'),
    custom: true
  })));
  inputEl._comboVal = selectedValue || '';
  inputEl.value = selectedValue || '';
  comboHide(inputEl);
}

function populateCompanyCombo(inputEl, selectedValue, game) {
  if (!inputEl) return;
  inputEl._comboKind = 'company';
  inputEl._comboGame = game;
  const official = COMPANIES[game] || [];
  const customs = customEntries(official, CUSTOM_COMPANIES[game] || [], c => c.name);
  inputEl._comboOpts = official.map(c => ({
    value: c.name,
    label: c.name
  })).concat(customs.map(c => ({
    value: c.name,
    label: c.name + t('combo.yours'),
    custom: true
  })));
  inputEl._comboVal = selectedValue || '';
  inputEl.value = selectedValue || '';
  comboHide(inputEl);
}

function comboCreate(inputEl) {
  const typed = (inputEl.value || '').trim();
  if (!typed) return;
  const kind = inputEl._comboKind || 'city';
  const game = inputEl._comboGame;
  const existingOpt = comboOpts(inputEl).find(o => normSearch(o.value) === normSearch(typed));
  if (existingOpt) {
    inputEl.value = existingOpt.value;
    inputEl._comboVal = existingOpt.value;
    comboHide(inputEl);
    return;
  }
  if (kind === 'company') {
    CUSTOM_COMPANIES[game] = CUSTOM_COMPANIES[game] || [];
    CUSTOM_COMPANIES[game].push({ name: typed });
    saveCustomList(CUSTOM_COMPANIES_KEY, CUSTOM_COMPANIES);
    populateCompanyCombo(inputEl, typed, game);
  } else {
    CUSTOM_CITIES[game] = CUSTOM_CITIES[game] || [];
    CUSTOM_CITIES[game].push({ city: typed, state: '' });
    saveCustomList(CUSTOM_CITIES_KEY, CUSTOM_CITIES);
    populateCitySelect(inputEl, typed, game);
  }
  toast(t(kind === 'company' ? 'combo.companyCreated' : 'combo.cityCreated', { name: typed }), 'success');
}

document.addEventListener('focusin', (ev) => {
  const inputEl = ev.target.closest && ev.target.closest('.city-combo-input');
  if (!inputEl) { comboCloseAll(); return; }
  comboCloseOthers(inputEl);
  comboShow(inputEl);
});

document.addEventListener('input', (ev) => {
  const inputEl = ev.target.closest && ev.target.closest('.city-combo-input');
  if (inputEl) comboShow(inputEl);
});

document.addEventListener('blur', (ev) => {
  const inputEl = ev.target.closest && ev.target.closest('.city-combo-input');
  if (!inputEl) return;
  const valid = comboOpts(inputEl).some(o => o.value === inputEl.value.trim());
  if (!valid) inputEl.value = inputEl._comboVal || '';
  comboHide(inputEl);
}, true);

document.addEventListener('mousedown', (ev) => {
  if (ev.target.closest && ev.target.closest('.city-combo-list')) ev.preventDefault();
});

document.addEventListener('click', (ev) => {
  const li = ev.target.closest && ev.target.closest('.city-combo-opt');
  if (li) {
    const inputEl = li.closest('.city-combo') && li.closest('.city-combo').querySelector('.city-combo-input');
    if (inputEl) comboSelect(inputEl, li);
    return;
  }
  const createBtn = ev.target.closest && ev.target.closest('.city-combo-create');
  if (createBtn) {
    const inputEl = createBtn.closest('.city-combo') && createBtn.closest('.city-combo').querySelector('.city-combo-input');
    if (inputEl) comboCreate(inputEl);
    return;
  }
  if (ev.target.closest && ev.target.closest('.city-combo')) {
    const inputEl = ev.target.closest('.city-combo-input');
    if (inputEl) comboShow(inputEl);
    return;
  }
  comboCloseAll();
});

document.addEventListener('keydown', (ev) => {
  const inputEl = ev.target.closest && ev.target.closest('.city-combo-input');
  if (!inputEl) return;
  const ul = comboListEl(inputEl);
  if (ev.key === 'Escape') { comboHide(inputEl); return; }
  if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
    if (!ul || ul.classList.contains('d-none')) { comboShow(inputEl); return; }
    const items = Array.prototype.slice.call(ul.querySelectorAll('.city-combo-opt, .city-combo-create'));
    if (items.length === 0) return;
    ev.preventDefault();
    let idx = inputEl._comboIdx === undefined ? -1 : inputEl._comboIdx;
    idx = ev.key === 'ArrowDown' ? Math.min(items.length - 1, idx + 1) : Math.max(0, idx - 1);
    inputEl._comboIdx = idx;
    items.forEach((li, i) => li.classList.toggle('active', i === idx));
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
    return;
  }
  if (ev.key === 'Enter') {
    if (!ul || ul.classList.contains('d-none')) return;
    const items = ul.querySelectorAll('.city-combo-opt, .city-combo-create');
    const idx = inputEl._comboIdx;
    if (idx >= 0 && items[idx]) {
      ev.preventDefault();
      if (items[idx].classList.contains('city-combo-create')) comboCreate(inputEl);
      else comboSelect(inputEl, items[idx]);
    }
    return;
  }
  if (ev.key === 'Tab') comboHide(inputEl);
});

document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('hidden.bs.modal', comboCloseAll);
});

/* ---------------- Empresas (lista da wiki) ---------------- */

const COMPANIES_KEY = 'realistic_campaign_companies';
const CUSTOM_COMPANIES_KEY = 'realistic_campaign_custom_companies';
let COMPANIES = { ATS: [], ETS2: [] };
let CUSTOM_COMPANIES = { ATS: [], ETS2: [] };

async function loadCompanies() {
  try {
    const cached = JSON.parse(localStorage.getItem(COMPANIES_KEY) || 'null');
    if (cached && Array.isArray(cached.ATS) && Array.isArray(cached.ETS2)) {
      COMPANIES = cached;
    }
    CUSTOM_COMPANIES = loadCustomList(CUSTOM_COMPANIES_KEY);
    const [ats, ets2] = await Promise.all([
      fetch('companies_ats.json').then(r => r.json()),
      fetch('companies_ets2.json').then(r => r.json())
    ]);
    if (Array.isArray(ats)) COMPANIES.ATS = ats;
    if (Array.isArray(ets2)) COMPANIES.ETS2 = ets2;
    CUSTOM_COMPANIES.ATS = customEntries(COMPANIES.ATS, CUSTOM_COMPANIES.ATS, c => c.name);
    CUSTOM_COMPANIES.ETS2 = customEntries(COMPANIES.ETS2, CUSTOM_COMPANIES.ETS2, c => c.name);
    saveCustomList(CUSTOM_COMPANIES_KEY, CUSTOM_COMPANIES);
    try { localStorage.setItem(COMPANIES_KEY, JSON.stringify(COMPANIES)); } catch (e) { /* ignore */ }
  } catch (e) {
    if (COMPANIES.ATS.length === 0 && COMPANIES.ETS2.length === 0) {
      console.warn('Falha ao carregar companies_*.json — sirva via static server (ex.: npx serve .)');
    }
  }
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
  if (backupVer) backupVer.textContent = t('config.backupVersion', { v: APP_VERSION, d: APP_VERSION_DATE });
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
  if (!ok) { toast(t('config.mealsInvalid'), 'danger'); return; }

  const lodNext = timeToMin(document.getElementById('cfg-lodging-nextday').value);
  if (lodNext === null) { toast(t('config.lodgingInvalid'), 'danger'); return; }
  raw.lodging.amount = num('cfg-lodging-amount', 0);
  raw.lodging.nextDayHour = Math.floor(lodNext / 60);

  const tStart = timeToMin(document.getElementById('cfg-turno-start').value);
  const tEnd = timeToMin(document.getElementById('cfg-turno-employee-end').value);
  const tRest = timeToMin(document.getElementById('cfg-turno-free-rest').value);
  if (tStart === null || tEnd === null || tRest === null) { toast(t('config.shiftInvalid'), 'danger'); return; }
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
  toast(t('config.savedToast'), 'success');
}

document.getElementById('btnSaveConfig').addEventListener('click', saveConfigForm);

document.getElementById('btnResetConfig').addEventListener('click', () => {
  confirmModal(t('config.resetConfirmTitle'), t('config.resetConfirmBody'), () => {
    resetConfig();
    renderAll();
    fillConfigForm();
    toast(t('config.resetToast'), 'success');
  });
});

/* ---------------- Init ---------------- */

applyStaticI18n();
applyTheme(getTheme());
updateUndoButton();
restoreActiveTab();
fillConfigForm();
bindStartScreen();

document.querySelectorAll('[data-lang]').forEach(btn => {
  btn.addEventListener('click', () => {
    setLang(btn.getAttribute('data-lang'));
    applyStaticI18n();
    renderAll();
    fillConfigForm();
    toast(t('langToast.changed'), 'info');
  });
});

document.getElementById('btnChangelogOk').addEventListener('click', () => {
  setSeenVersion();
  try { modal('Changelog').hide(); } catch (e) { /* ignore */ }
});

document.getElementById('appVersion').addEventListener('click', () => openChangelog(false));
document.getElementById('startAppVersion').addEventListener('click', () => openChangelog(false));

document.getElementById('btnLogout').addEventListener('click', () => {
  pushUndo();
  state.activeProfileId = null;
  saveState();
  renderAll();
});

renderAll();
if (getSeenVersion() !== APP_VERSION) openChangelog(true);
loadCities().then(() => { renderAll(); fillProfileForm(); });
loadCompanies().then(() => { renderAll(); fillProfileForm(); });
