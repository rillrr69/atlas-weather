package ru.atlas.weather.data

import com.google.gson.Gson

class Repository(private val settings: SettingsStore) {

    private val gson = Gson()

    suspend fun searchCities(query: String): List<City> =
        Api.searchCities(query).results.orEmpty().mapNotNull { item ->
            val lat = item.lat ?: return@mapNotNull null
            val lon = item.lon ?: return@mapNotNull null
            City(
                name = item.name ?: "Город",
                country = listOfNotNull(item.admin1, item.country).distinct().joinToString(", "),
                lat = lat,
                lon = lon,
            )
        }

    suspend fun rates(base: String): Map<String, Double> {
        val response = Api.latestRates(base)
        if (response.result != "success") error("Курсы временно недоступны")
        return response.rates.orEmpty()
    }

    suspend fun trend(start: String, from: String, to: String): List<Pair<String, Double>> =
        Api.trend(start, from, to).rates.orEmpty()
            .mapNotNull { (date, values) -> values[to]?.let { date to it } }
            .sortedBy { it.first }

    suspend fun loadWeather(city: City): WeatherSnapshot {
        val unit = settings.snapshot().unit
        val response = Api.forecast(city.lat, city.lon)
        val current = response.current ?: error("Погодный API вернул пустой ответ")

        fun temperature(value: Double?): Int {
            val celsius = value ?: 0.0
            return Math.round(if (unit == "f") celsius * 9.0 / 5.0 + 32.0 else celsius).toInt()
        }

        fun speed(value: Double?): Int {
            val kmh = value ?: 0.0
            return Math.round(if (unit == "f") kmh * 0.621371 else kmh).toInt()
        }

        val hourlyRaw = response.hourly
        val startIndex = hourlyRaw?.time?.indexOf(current.time)?.takeIf { it >= 0 } ?: 0
        val hourly = hourlyRaw?.time.orEmpty().drop(startIndex).take(24).mapIndexed { offset, time ->
            HourInfo(
                time = time.takeLast(5),
                temp = temperature(hourlyRaw?.temperature?.getOrNull(startIndex + offset)),
                pop = hourlyRaw?.pop?.getOrNull(startIndex + offset) ?: 0,
            )
        }

        val dailyRaw = response.daily
        val daily = dailyRaw?.time.orEmpty().mapIndexed { index, date ->
            DayInfo(
                date = date,
                code = dailyRaw?.code?.getOrNull(index) ?: 0,
                min = temperature(dailyRaw?.min?.getOrNull(index)),
                max = temperature(dailyRaw?.max?.getOrNull(index)),
                pop = dailyRaw?.pop?.getOrNull(index) ?: 0,
            )
        }

        val snapshot = WeatherSnapshot(
            cityName = city.name,
            country = city.country,
            lat = city.lat,
            lon = city.lon,
            timezone = response.timezone ?: "UTC",
            temperature = temperature(current.temperature),
            feelsLike = temperature(current.feelsLike),
            code = current.code ?: 0,
            humidity = current.humidity ?: 0,
            wind = speed(current.wind),
            isDay = current.isDay != 0,
            unit = unit,
            maxToday = daily.firstOrNull()?.max ?: 0,
            minToday = daily.firstOrNull()?.min ?: 0,
            fetchedAt = System.currentTimeMillis(),
            daily = daily,
            hourly = hourly,
        )

        settings.saveWeather(gson.toJson(snapshot))
        return snapshot
    }

    suspend fun cachedWeather(): WeatherSnapshot? {
        val json = settings.snapshot().weatherJson ?: return null
        return runCatching { gson.fromJson(json, WeatherSnapshot::class.java) }.getOrNull()
    }
}
