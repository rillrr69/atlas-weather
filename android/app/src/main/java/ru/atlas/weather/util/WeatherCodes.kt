package ru.atlas.weather.util

fun weatherInfo(code: Int): Pair<String, String> = when (code) {
    0 -> "☀️" to "Ясно"
    1 -> "🌤️" to "Малооблачно"
    2 -> "⛅" to "Переменная облачность"
    3 -> "☁️" to "Пасмурно"
    45, 48 -> "🌫️" to "Туман"
    51, 53 -> "🌦️" to "Морось"
    55 -> "🌧️" to "Сильная морось"
    56, 57 -> "🌧️" to "Ледяная морось"
    61 -> "🌦️" to "Небольшой дождь"
    63 -> "🌧️" to "Дождь"
    65 -> "🌧️" to "Сильный дождь"
    66, 67 -> "🌧️" to "Ледяной дождь"
    71, 73 -> "🌨️" to "Снег"
    75, 77, 85, 86 -> "❄️" to "Сильный снег"
    80 -> "🌦️" to "Ливень"
    81, 82 -> "🌧️" to "Сильный ливень"
    95, 96, 99 -> "⛈️" to "Гроза"
    else -> "🌡️" to "Неизвестно"
}

fun dayName(date: String): String = runCatching {
    java.time.LocalDate.parse(date).dayOfWeek.getDisplayName(
        java.time.format.TextStyle.SHORT,
        java.util.Locale("ru"),
    )
}.getOrDefault(date)
