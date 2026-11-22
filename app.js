'use strict';

/* ---------- утилиты ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const last = (arr) => arr[arr.length - 1];
const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

const POPULAR = ['EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'RUB', 'KZT', 'TRY', 'INR', 'KRW', 'UAH', 'PLN', 'SEK', 'NZD'];
const BASES = ['USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CHF', 'CNY', 'KZT', 'TRY', 'UAH'];
const ECB_BASES = new Set(['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'SEK', 'NOK', 'NZD', 'DKK', 'PLN', 'HUF', 'CZK', 'RON', 'BGN', 'TRY', 'ISK']);

const NAMES = {
  USD: 'Доллар США', EUR: 'Евро', GBP: 'Фунт стерлингов', JPY: 'Йена', CNY: 'Юань',
  CHF: 'Швейцарский франк', CAD: 'Канадский доллар', AUD: 'Австралийский доллар',
  RUB: 'Российский рубль', KZT: 'Казахстанский тенге', TRY: 'Турецкая лира',
  INR: 'Индийская рупия', KRW: 'Южнокорейский вон', UAH: 'Украинская гривна',
  PLN: 'Польский злотый', SEK: 'Шведская крона', NZD: 'Новозеландский доллар',
  NOK: 'Норвежская крона', DKK: 'Датская крона', CZK: 'Чешская крона',
  HUF: 'Венгерский форинт', RON: 'Румынский лей', BGN: 'Болгарский лев',
  BRL: 'Бразильский реал', MXN: 'Мексиканское песо', SGD: 'Сингапурский доллар',
  HKD: 'Гонконгский доллар', ZAR: 'Южноафриканский рэнд', AED: 'Дирхам ОАЭ',
  SAR: 'Саудовский риял', ILS: 'Израильский шекель', ISK: 'Исландская крона',
};

const FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CNY: '🇨🇳', CHF: '🇨🇭', CAD: '🇨🇦',
  AUD: '🇦🇺', RUB: '🇷🇺', KZT: '🇰🇿', TRY: '🇹🇷', INR: '🇮🇳', KRW: '🇰🇷', UAH: '🇺🇦',
  PLN: '🇵🇱', SEK: '🇸🇪', NZD: '🇳🇿', NOK: '🇳🇴', DKK: '🇩🇰', CZK: '🇨🇿', HUF: '🇭🇺',
  RON: '🇷🇴', BGN: '🇧🇬', BRL: '🇧🇷', MXN: '🇲🇽', SGD: '🇸🇬', HKD: '🇭🇰', ZAR: '🇿🇦',
  AED: '🇦🇪', SAR: '🇸🇦', ILS: '🇮🇱', ISK: '🇮🇸',
};

const WEATHER = {
  0: ['☀️', 'Ясно'],
  1: ['🌤️', 'Малооблачно'], 2: ['⛅', 'Переменная облачность'], 3: ['☁️', 'Пасмурно'],
  45: ['🌫️', 'Туман'], 48: ['🌫️', 'Изморозь'],
  51: ['🌦️', 'Лёгкая морось'], 53: ['🌦️', 'Морось'], 55: ['🌧️', 'Сильная морось'],
  56: ['🌧️', 'Ледяная морось'], 57: ['🌧️', 'Сильная ледяная морось'],
  61: ['🌦️', 'Небольшой дождь'], 63: ['🌧️', 'Дождь'], 65: ['🌧️', 'Сильный дождь'],
  66: ['🌧️', 'Ледяной дождь'], 67: ['🌧️', 'Сильный ледяной дождь'],
  71: ['🌨️', 'Небольшой снег'], 73: ['🌨️', 'Снег'], 75: ['❄️', 'Сильный снег'],
  77: ['🌨️', 'Снежные зёрна'],
  80: ['🌦️', 'Небольшой ливень'], 81: ['🌧️', 'Ливень'], 82: ['⛈️', 'Сильный ливень'],
  85: ['🌨️', 'Небольшой снегопад'], 86: ['❄️', 'Сильный снегопад'],
  95: ['⛈️', 'Гроза'], 96: ['⛈️', 'Гроза с градом'], 99: ['⛈️', 'Сильная гроза с градом'],
};

const weatherInfo = (code) => WEATHER[code] || ['🌡️', 'Неизвестно'];
const DEFAULT_CITY = { name: 'Москва', country: 'Россия', admin1: '', latitude: 55.7558, longitude: 37.6173 };

function readPrefs() {
  try { return JSON.parse(localStorage.getItem('atlas:prefs')) || {}; } catch { return {}; }
}

const prefs = readPrefs();
const state = {
  city: prefs.city && Number.isFinite(prefs.city.latitude) ? prefs.city : DEFAULT_CITY,
  unit: prefs.unit === 'f' ? 'f' : 'c',
  base: BASES.includes(prefs.base) ? prefs.base : 'USD',
  trendTarget: prefs.trendTarget || 'EUR',
  rateFilter: '',
  weather: null,
  rates: null,
  trend: null,
  loading: { weather: false, rates: false, trend: false },
};

function savePrefs() {
  try {
    localStorage.setItem('atlas:prefs', JSON.stringify({
      city: state.city, unit: state.unit, base: state.base, trendTarget: state.trendTarget,
    }));
  } catch { /* приватный режим — работаем без сохранения */ }
}

function cacheGet(key, maxAgeMs) {
  try {
    const raw = localStorage.getItem(`atlas:${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || Date.now() - entry.t > maxAgeMs) return null;
    return entry.d;
  } catch { return null; }
}

function cacheSet(key, data) {
  try { localStorage.setItem(`atlas:${key}`, JSON.stringify({ t: Date.now(), d: data })); } catch { /* ignore */ }
}

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Сервер ответил ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const toF = (c) => c * 9 / 5 + 32;
const temp = (c) => Math.round(Number.isFinite(c) ? (state.unit === 'f' ? toF(c) : c) : 0);
const windSpeed = (kmh) => Math.round(Number.isFinite(kmh) ? (state.unit === 'f' ? kmh * 0.621371 : kmh) : 0);
const speedUnit = () => (state.unit === 'f' ? 'mph' : 'км/ч');
const num = (v, digits = 2) => new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: Math.min(digits, 2), maximumFractionDigits: digits,
}).format(Number(v) || 0);

function flag(code) {
  if (FLAGS[code]) return FLAGS[code];
  if (/^[A-Z]{2}$/.test(code)) return String.fromCodePoint(...[...code].map((ch) => 127397 + ch.charCodeAt(0)));
  return '💱';
}

/* ---------- общие UI ---------- */

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3600);
}

function setLoading(key, on) {
  state.loading[key] = on;
  document.body.classList.toggle('busy', Object.values(state.loading).some(Boolean));
  const card = (key === 'weather') ? $('.weather') : $('.rates');
  if (card) card.setAttribute('aria-busy', String(on));
}

function showStatus(which, message, isError = false) {
  $(`#${which}Status`).innerHTML = `<div class="alert ${isError ? 'alert--error' : ''}">
    <span>${esc(message)}</span>
    <button type="button" data-retry="${which}">Повторить</button>
  </div>`;
}

function clearStatus(which) { $(`#${which}Status`).innerHTML = ''; }

function skeleton(kind) {
  if (kind === 'chart') return '<div class="skeleton sk-chart"></div>';
  if (kind === 'list') return Array.from({ length: 7 }, () => '<div class="skeleton sk-row"></div>').join('');
  return `<div class="skeleton sk-line sk-line--lg"></div>
          <div class="skeleton sk-line sk-line--sm"></div>
          <div class="skeleton sk-line"></div>`;
}

function renderClock() {
  const tz = state.weather && state.weather.timezone;
  const now = new Date();
  let cityTime, date, weekday;
  try {
    cityTime = new Intl.DateTimeFormat('ru-RU', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now);
    date = new Intl.DateTimeFormat('ru-RU', { timeZone: tz, day: 'numeric', month: 'long' }).format(now);
    weekday = new Intl.DateTimeFormat('ru-RU', { timeZone: tz, weekday: 'long' }).format(now);
  } catch {
    cityTime = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(now);
    date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(now);
    weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(now);
  }
  const localTime = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(now);

  $('#clockCity').textContent = cityTime;
  $('#clockCityLabel').textContent = state.city.name;
  $('#clockDate').textContent = date;
  $('#clockLocal').textContent = localTime;

  if (document.body.classList.contains('widget-mode')) renderWidget(cityTime, date, weekday, localTime);
}

function renderWidget(cityTime, date, weekday, localTime) {
  const card = $('#widgetCard');
  if (!card) return;
  const cur = state.weather && state.weather.current;
  const [icon, label] = cur ? weatherInfo(cur.weather_code) : ['⏳', 'Загрузка…'];
  const place = [state.city.name, state.city.country].filter(Boolean).join(', ');

  card.innerHTML = `
    <div class="widget-card__top">
      <div class="widget-card__time">${esc(cityTime)}</div>
      <div class="widget-card__meta">
        <div class="widget-card__date">${esc(weekday)}, ${esc(date)}</div>
        <div class="widget-card__city">${esc(place)}</div>
      </div>
    </div>
    <div class="widget-card__weather">
      <span class="widget-card__icon" aria-hidden="true">${icon}</span>
      <span class="widget-card__temp">${cur ? `${temp(cur.temperature_2m)}°` : '—'}</span>
      <span class="widget-card__desc">${esc(label)}</span>
    </div>
    <div class="widget-card__local">У вас сейчас ${esc(localTime)}</div>`;
}

/* ---------- погода ---------- */

async function loadWeather(force = false) {
  const c = state.city;
  const key = `weather:${c.latitude.toFixed(3)}:${c.longitude.toFixed(3)}`;
  setLoading('weather', true);
  if (!state.weather) $('#current').innerHTML = skeleton('current');

  if (!force) {
    const cached = cacheGet(key, 10 * 60 * 1000);
    if (cached) {
      state.weather = cached;
      renderWeather();
      clearStatus('weather');
      setLoading('weather', false);
      return;
    }
  }

  try {
    const params = new URLSearchParams({
      latitude: String(c.latitude),
      longitude: String(c.longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
      hourly: 'temperature_2m,precipitation_probability',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '7',
    });
    const data = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!data.current || !data.daily || !data.hourly) throw new Error('Погодный сервис вернул неполные данные');
    state.weather = data;
    cacheSet(key, data);
    clearStatus('weather');
    renderWeather();
  } catch (error) {
    const message = error.name === 'AbortError' ? 'Превышено время ожидания ответа' : error.message;
    showStatus('weather', message, true);
    if (state.weather) renderWeather();
    toast('Не удалось обновить погоду — показаны сохранённые данные');
  } finally {
    setLoading('weather', false);
  }
}

function renderWeather() {
  const w = state.weather;
  if (!w) return;

  const place = [state.city.name, state.city.country].filter(Boolean).join(', ');
  $('#weatherTitle').textContent = place;

  const cur = w.current;
  const [icon, label] = weatherInfo(cur.weather_code);
  const today = w.daily;
  $('#current').innerHTML = `
    <div class="current__main">
      <div class="current__icon" aria-hidden="true">${icon}</div>
      <div>
        <div class="current__temp">${temp(cur.temperature_2m)}<sup>°</sup></div>
        <div class="current__desc">${esc(label)}${cur.is_day === 0 ? ' · ночью' : ''}</div>
        <div class="current__place">Макс ${temp(today.temperature_2m_max[0])}° · мин ${temp(today.temperature_2m_min[0])}°</div>
      </div>
    </div>
    <div class="current__stats">
      <div class="stat"><span><svg class="ico"><use href="#i-thermo"></use></svg>Ощущается</span><b>${temp(cur.apparent_temperature)}°</b></div>
      <div class="stat"><span><svg class="ico"><use href="#i-drop"></use></svg>Влажность</span><b>${Math.round(cur.relative_humidity_2m)}%</b></div>
      <div class="stat"><span><svg class="ico"><use href="#i-wind"></use></svg>Ветер</span><b>${windSpeed(cur.wind_speed_10m)} ${speedUnit()}</b></div>
      <div class="stat"><span><svg class="ico"><use href="#i-drop"></use></svg>Осадки</span><b>${Math.round(cur.precipitation || 0)} мм</b></div>
    </div>`;

  renderHourly(w);
  renderDaily(today);
  renderClock();
}

function renderHourly(w) {
  const hourly = w.hourly;
  let start = hourly.time.indexOf(w.current.time);
  if (start < 0) start = hourly.time.findIndex((t) => t >= w.current.time);
  if (start < 0) start = 0;

  const times = hourly.time.slice(start, start + 24);
  const temps = hourly.temperature_2m.slice(start, start + 24);
  const pops = hourly.precipitation_probability.slice(start, start + 24);
  if (!temps.length) { $('#hourlyChart').innerHTML = '<div class="chart-empty">Нет почасовых данных</div>'; return; }

  const W = 720, H = 196, P = 22, baseY = H - 30;
  const min = Math.min(...temps), max = Math.max(...temps), span = max - min || 1;
  const pts = temps.map((v, i) => ({
    x: P + i * (W - 2 * P) / Math.max(times.length - 1, 1),
    y: P + (1 - (v - min) / span) * (baseY - P),
  }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${last(pts).x.toFixed(1)} ${baseY} L ${pts[0].x.toFixed(1)} ${baseY} Z`;
  const bars = pops.map((v, i) => {
    const h = Math.max(2, ((v || 0) / 100) * 30);
    return `<rect x="${(pts[i].x - 6).toFixed(1)}" y="${(baseY - h).toFixed(1)}" width="12" height="${h.toFixed(1)}" rx="3" fill="rgba(125,211,252,.15)"/>`;
  }).join('');
  const xLabels = times.map((t, i) => ((i % 6 === 0) || i === times.length - 1)
    ? `<text x="${pts[i].x.toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(t.slice(11, 16))}</text>` : '').join('');
  const tLabels = pts.map((p, i) => (i % 6 === 0)
    ? `<text x="${p.x.toFixed(1)}" y="${(p.y - 9).toFixed(1)}" text-anchor="middle" style="fill:#eef2ff;font-weight:700">${temp(temps[i])}°</text>` : '').join('');

  $('#hourlyChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="График температуры на ближайшие 24 часа">
    <defs><linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ee7f9" stop-opacity=".35"/><stop offset="100%" stop-color="#6ee7f9" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="M ${P} ${baseY} H ${W - P}" stroke="rgba(255,255,255,.09)" stroke-dasharray="4 6" vector-effect="non-scaling-stroke"/>
    ${bars}
    <path d="${area}" fill="url(#hourlyFill)"/>
    <path d="${line}" fill="none" stroke="#6ee7f9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    ${tLabels}${xLabels}
  </svg>`;
  $('#hourlyMeta').textContent = `мин ${temp(min)}° · макс ${temp(max)}°`;
}

function renderDaily(daily) {
  const allMin = Math.min(...daily.temperature_2m_min);
  const allMax = Math.max(...daily.temperature_2m_max);
  const range = allMax - allMin || 1;

  $('#dailyForecast').innerHTML = daily.time.map((date, i) => {
    const [icon, label] = weatherInfo(daily.weather_code[i]);
    const min = daily.temperature_2m_min[i];
    const max = daily.temperature_2m_max[i];
    const left = Math.max(0, Math.min(100, (min - allMin) / range * 100));
    const width = Math.max(10, Math.min(100 - left, (max - min) / range * 100));
    const name = i === 0 ? 'Сегодня' : new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(new Date(`${date}T00:00:00`));
    return `<div class="day ${i === 0 ? 'is-today' : ''}">
      <span class="day__name">${esc(name).replace('.', '')}</span>
      <span class="day__icon" title="${esc(label)}" aria-label="${esc(label)}">${icon}</span>
      <span class="day__pop"><svg class="ico"><use href="#i-drop"></use></svg>${Math.round(daily.precipitation_probability_max[i] || 0)}%</span>
      <span class="day__bar"><span style="left:${left.toFixed(1)}%;width:${width.toFixed(1)}%"></span></span>
      <span class="day__temps"><b>${temp(max)}°</b><i>${temp(min)}°</i></span>
    </div>`;
  }).join('');
}

/* ---------- валюты ---------- */

async function loadRates(force = false) {
  const key = `rates:${state.base}`;
  setLoading('rates', true);
  if (!state.rates) $('#rateList').innerHTML = skeleton('list');

  if (!force) {
    const cached = cacheGet(key, 30 * 60 * 1000);
    if (cached) {
      state.rates = cached;
      renderRates();
      clearStatus('rates');
      setLoading('rates', false);
      loadTrend(false);
      return;
    }
  }

  try {
    const data = await fetchJson(`https://open.er-api.com/v6/latest/${encodeURIComponent(state.base)}`);
    if (data.result !== 'success' || !data.rates) throw new Error(data['error-type'] || 'Сервис курсов вернул неполные данные');
    state.rates = data;
    cacheSet(key, data);
    clearStatus('rates');
    renderRates();
    loadTrend(force);
  } catch (error) {
    const message = error.name === 'AbortError' ? 'Превышено время ожидания ответа' : error.message;
    showStatus('rates', message, true);
    if (state.rates) renderRates();
    toast('Не удалось обновить курсы — показаны сохранённые данные');
  } finally {
    setLoading('rates', false);
  }
}

function renderRates() {
  const data = state.rates;
  if (!data) return;

  const updated = data.time_last_update_utc ? new Date(data.time_last_update_utc) : null;
  let updatedText = '';
  if (updated && !Number.isNaN(updated.getTime())) {
    updatedText = ` · ${new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(updated)}`;
  }
  $('#ratesMeta').textContent = `1 ${state.base} = … · ExchangeRate-API${updatedText}`;

  const query = state.rateFilter.trim().toLocaleUpperCase('ru-RU');
  const codes = query
    ? Object.keys(data.rates).filter((code) => code !== state.base && (code.includes(query) || (NAMES[code] || '').toLocaleUpperCase('ru-RU').includes(query))).slice(0, 40)
    : POPULAR.filter((code) => code !== state.base && Number.isFinite(data.rates[code]));

  const list = $('#rateList');
  if (!codes.length) {
    list.innerHTML = '<div class="rate-empty">Валюта не найдена</div>';
    return;
  }

  list.innerHTML = codes.map((code) => `<button class="rate-row ${code === state.trendTarget ? 'is-active' : ''}" type="button" data-code="${esc(code)}" title="Показать динамику ${esc(code)}">
    <span class="rate-flag" aria-hidden="true">${flag(code)}</span>
    <span class="rate-code">${esc(code)}</span>
    <span class="rate-name">${esc(NAMES[code] || code)}</span>
    <span class="rate-value">${num(data.rates[code], data.rates[code] >= 100 ? 2 : 4)}</span>
  </button>`).join('');
}

async function loadTrend(force = false) {
  const base = state.base;
  const target = state.trendTarget;
  $('#trendPair').textContent = `${base} → ${target}`;
  const chart = $('#trendChart');
  state.trend = null;

  if (!ECB_BASES.has(base) || !ECB_BASES.has(target)) {
    chart.innerHTML = '<div class="chart-empty">Динамика доступна для валют, публикуемых ЕЦБ (USD, EUR, GBP, JPY, CHF и др.)</div>';
    return;
  }

  const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const key = `trend:${base}:${target}:${start}`;
  setLoading('trend', true);
  if (!chart.querySelector('svg')) chart.innerHTML = '<div class="skeleton sk-chart"></div>';

  if (!force) {
    const cached = cacheGet(key, 6 * 60 * 60 * 1000);
    if (cached) {
      state.trend = cached;
      renderTrend();
      setLoading('trend', false);
      return;
    }
  }

  try {
    const params = new URLSearchParams({ from: base, to: target, start });
    let data;
    try {
      data = await fetchJson(`/api/trend?${params}`, 12000);
    } catch {
      // Если страница открыта без нашего сервера — пробуем прямой запрос к API.
      data = await fetchJson(`https://api.frankfurter.app/${start}..?from=${base}&to=${target}`, 12000);
    }
    const entries = Object.entries(data.rates || {})
      .map(([date, values]) => [date, values[target]])
      .filter(([, value]) => Number.isFinite(value))
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length < 2) throw new Error('Недостаточно данных за период');
    state.trend = { entries, base, target };
    cacheSet(key, state.trend);
    renderTrend();
  } catch {
    chart.innerHTML = '<div class="chart-empty">Не удалось загрузить динамику за 30 дней</div>';
  } finally {
    setLoading('trend', false);
  }
}

function renderTrend() {
  const trend = state.trend;
  if (!trend) return;
  const values = trend.entries.map((entry) => entry[1]);
  const W = 520, H = 158, P = 18, baseY = H - 26;
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: P + i * (W - 2 * P) / Math.max(values.length - 1, 1),
    y: P + (1 - (v - min) / span) * (baseY - P),
  }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${last(pts).x.toFixed(1)} ${baseY} L ${pts[0].x.toFixed(1)} ${baseY} Z`;
  const change = (last(values) / values[0] - 1) * 100;
  const changeText = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always',
  }).format(change);
  const color = change >= 0 ? 'var(--ok)' : 'var(--danger)';
  const tip = last(pts);

  $('#trendChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Динамика курса ${trend.base} к ${trend.target} за 30 дней">
    <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a78bfa" stop-opacity=".32"/><stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="M ${P} ${baseY} H ${W - P}" stroke="rgba(255,255,255,.08)" stroke-dasharray="4 6" vector-effect="non-scaling-stroke"/>
    <path d="${area}" fill="url(#trendFill)"/>
    <path d="${line}" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${tip.x.toFixed(1)}" cy="${tip.y.toFixed(1)}" r="3.5" fill="#a78bfa" stroke="#0b0f1e" stroke-width="2"/>
  </svg>
  <div class="chart-foot" style="display:flex;justify-content:space-between;gap:12px;margin-top:6px">
    <span class="muted">${esc(trend.entries[0][0])} → ${esc(last(trend.entries)[0])}</span>
    <strong style="color:${color};font-size:12px">${changeText}%</strong>
  </div>`;
}

/* ---------- поиск города ---------- */

let searchTimer;
function hideSuggestions() {
  const box = $('#suggestions');
  box.hidden = true;
  box.innerHTML = '';
  box._items = [];
  $('#cityInput').setAttribute('aria-expanded', 'false');
}

async function searchCity(query) {
  try {
    const params = new URLSearchParams({ name: query, count: '6', language: 'ru', format: 'json' });
    const data = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`, 8000);
    const items = (data.results || []).map((r) => ({
      name: r.name, admin1: r.admin1 || '', country: r.country || '',
      latitude: r.latitude, longitude: r.longitude,
    }));
    const box = $('#suggestions');
    box._items = items;
    box.innerHTML = items.length
      ? items.map((c, i) => `<button class="suggestion" type="button" role="option" data-index="${i}">
          <span class="suggestion__pin" aria-hidden="true">⌖</span>
          <span><b>${esc(c.name)}</b><small>${esc([c.admin1, c.country].filter(Boolean).join(', '))}</small></span>
        </button>`).join('')
      : '<div class="suggestion suggestion--empty">Ничего не найдено</div>';
    box.hidden = false;
    $('#cityInput').setAttribute('aria-expanded', 'true');
  } catch {
    hideSuggestions();
  }
}

function setCity(city) {
  state.city = city;
  savePrefs();
  $('#cityInput').value = '';
  hideSuggestions();
  $('#weatherTitle').textContent = [city.name, city.country].filter(Boolean).join(', ');
  loadWeather(true);
}

/* ---------- события ---------- */

function bindEvents() {
  $('#refreshBtn').addEventListener('click', () => {
    loadWeather(true);
    loadRates(true);
    toast('Обновляю данные…');
  });

  $$('.seg__btn').forEach((btn) => btn.addEventListener('click', () => {
    state.unit = btn.dataset.unit;
    savePrefs();
    $$('.seg__btn').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    renderWeather();
  }));

  $('#baseSelect').addEventListener('change', (event) => {
    state.base = event.target.value;
    if (!ECB_BASES.has(state.trendTarget) || state.trendTarget === state.base) {
      state.trendTarget = state.base === 'USD' ? 'EUR' : 'USD';
    }
    savePrefs();
    loadRates(true);
  });

  $('#rateSearch').addEventListener('input', (event) => {
    state.rateFilter = event.target.value;
    renderRates();
  });

  $('#rateList').addEventListener('click', (event) => {
    const row = event.target.closest('[data-code]');
    if (!row) return;
    state.trendTarget = row.dataset.code;
    savePrefs();
    renderRates();
    loadTrend(true);
  });

  $('#cityInput').addEventListener('input', (event) => {
    const query = event.target.value.trim();
    clearTimeout(searchTimer);
    if (query.length < 2) { hideSuggestions(); return; }
    searchTimer = setTimeout(() => searchCity(query), 300);
  });

  $('#suggestions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-index]');
    if (!button) return;
    const items = $('#suggestions')._items || [];
    const city = items[Number(button.dataset.index)];
    if (city) setCity(city);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideSuggestions();
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search')) hideSuggestions();
    const retry = event.target.closest('[data-retry]');
    if (!retry) return;
    if (retry.dataset.retry === 'weather') loadWeather(true);
    else if (retry.dataset.retry === 'rates') loadRates(true);
    else loadTrend(true);
  });

  $('#geoBtn').addEventListener('click', () => {
    if (!navigator.geolocation) { toast('Геолокация недоступна в этом браузере'); return; }
    const btn = $('#geoBtn');
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCity({
          name: 'Моё местоположение', country: '',
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
        });
        btn.disabled = false;
      },
      () => { toast('Не удалось определить местоположение'); btn.disabled = false; },
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}

/* ---------- старт ---------- */

function init() {
  const widgetMode = new URLSearchParams(window.location.search).has('widget');
  if (widgetMode) document.body.classList.add('widget-mode');

  if (!ECB_BASES.has(state.trendTarget) || state.trendTarget === state.base) {
    state.trendTarget = state.base === 'USD' ? 'EUR' : 'USD';
  }

  $('#baseSelect').innerHTML = BASES.map((code) =>
    `<option value="${code}" ${code === state.base ? 'selected' : ''}>${code} · ${esc(NAMES[code])}</option>`).join('');

  $$('.seg__btn').forEach((btn) => {
    const active = btn.dataset.unit === state.unit;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  $('#weatherTitle').textContent = [state.city.name, state.city.country].filter(Boolean).join(', ');
  $('#current').innerHTML = skeleton('current');
  $('#rateList').innerHTML = skeleton('list');
  $('#hourlyChart').innerHTML = skeleton('chart');
  $('#trendChart').innerHTML = skeleton('chart');

  bindEvents();
  renderClock();
  setInterval(renderClock, 1000);
  loadWeather();
  if (!widgetMode) loadRates();

  // PWA: офлайн-оболочка и кнопка установки на главный экран Android.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    $('#installBtn').hidden = false;
  });
  $('#installBtn').addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    $('#installBtn').hidden = true;
  });
}

init();
