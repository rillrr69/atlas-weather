'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');

test('weatherInfo известные и неизвестные коды', () => {
  assert.deepEqual(core.weatherInfo(0), ['☀️', 'Ясно']);
  assert.deepEqual(core.weatherInfo(95), ['⛈️', 'Гроза']);
  assert.equal(core.weatherInfo(999)[1], 'Неизвестно');
});

test('перевод температуры в °F и обратно в °C', () => {
  assert.equal(core.convertTemp(0, 'c'), 0);
  assert.equal(core.convertTemp(0, 'f'), 32);
  assert.equal(core.convertTemp(100, 'f'), 212);
  assert.equal(core.convertTemp(-40, 'f'), -40);
});

test('перевод скорости ветра', () => {
  assert.equal(core.convertWind(10, 'c'), 10);
  assert.equal(core.convertWind(10, 'f'), 6);
  assert.equal(core.windUnit('f'), 'mph');
  assert.equal(core.windUnit('c'), 'км/ч');
});

test('предупреждения по погоде', () => {
  const weather = {
    current: { temperature_2m: -18, wind_speed_10m: 45, weather_code: 95 },
    daily: { precipitation_probability_max: [90] },
  };
  const alerts = core.weatherAlerts(weather, 'c');
  assert.ok(alerts.some((a) => a.includes('мороз')));
  assert.ok(alerts.some((a) => a.includes('ветер')));
  assert.ok(alerts.some((a) => a.includes('Гроза')));
  assert.ok(alerts.some((a) => a.includes('90%')));

  assert.deepEqual(core.weatherAlerts({ current: { temperature_2m: 20, wind_speed_10m: 5, weather_code: 0 }, daily: {} }, 'c'), []);
});
