package ru.atlas.weather.util

import ru.atlas.weather.data.WeatherSnapshot

/** Те же правила, что и в веб-версии (core.js), но для нативного снимка погоды. */
fun weatherAlerts(snapshot: WeatherSnapshot): List<String> {
    val result = mutableListOf<String>()
    val celsius = if (snapshot.unit == "f") {
        (snapshot.temperature - 32) * 5.0 / 9.0
    } else {
        snapshot.temperature.toDouble()
    }
    val kmh = if (snapshot.unit == "f") snapshot.wind / 0.621371 else snapshot.wind.toDouble()

    if (celsius <= -15) result.add("Сильный мороз: ${snapshot.temperature}°")
    if (celsius >= 35) result.add("Сильная жара: ${snapshot.temperature}°")
    if (kmh >= 40) result.add("Сильный ветер: ${snapshot.wind} км/ч")
    if (snapshot.code in setOf(65, 67, 82, 95, 96, 99)) {
        result.add("Опасные осадки: ${weatherInfo(snapshot.code).second}")
    }

    val todayPop = snapshot.daily.firstOrNull()?.pop ?: 0
    if (todayPop >= 80) result.add("Вероятность осадков сегодня: $todayPop%")
    return result
}
