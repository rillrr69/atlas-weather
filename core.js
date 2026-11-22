'use strict';

/* Чистые функции, общие для браузера и тестов. */

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
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

  function weatherInfo(code) {
    return WEATHER[code] || ['🌡️', 'Неизвестно'];
  }

  function convertTemp(celsius, unit) {
    const value = Number.isFinite(celsius) ? celsius : 0;
    return Math.round(unit === 'f' ? value * 9 / 5 + 32 : value);
  }

  function convertWind(kmh, unit) {
    const value = Number.isFinite(kmh) ? kmh : 0;
    return Math.round(unit === 'f' ? value * 0.621371 : value);
  }

  function windUnit(unit) {
    return unit === 'f' ? 'mph' : 'км/ч';
  }

  /** Возвращает список предупреждений по текущей погоде. */
  function weatherAlerts(weather, unit) {
    if (!weather || !weather.current) return [];
    const current = weather.current;
    const alerts = [];
    const celsius = unit === 'f' ? (current.temperature_2m - 32) * 5 / 9 : current.temperature_2m;
    const kmh = unit === 'f' ? current.wind_speed_10m / 0.621371 : current.wind_speed_10m;

    if (celsius <= -15) alerts.push(`Сильный мороз: ${convertTemp(celsius, 'c')}°C`);
    if (celsius >= 35) alerts.push(`Сильная жара: ${convertTemp(celsius, 'c')}°C`);
    if (kmh >= 40) alerts.push(`Сильный ветер: ${Math.round(kmh)} км/ч`);
    if ([65, 67, 82, 95, 96, 99].includes(current.weather_code)) {
      alerts.push(`Опасные осадки: ${weatherInfo(current.weather_code)[1]}`);
    }

    const todayPop = weather.daily && Math.max(...(weather.daily.precipitation_probability_max || [0]));
    if (todayPop >= 80) alerts.push(`Вероятность осадков сегодня: ${todayPop}%`);
    return alerts;
  }

  return { weatherInfo, convertTemp, convertWind, windUnit, weatherAlerts };
});
