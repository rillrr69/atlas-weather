package ru.atlas.weather.data

import com.google.gson.annotations.SerializedName

data class City(
    val name: String = "Москва",
    val country: String = "Россия",
    val lat: Double = 55.7558,
    val lon: Double = 37.6173,
)

data class DayInfo(
    val date: String = "",
    val code: Int = 0,
    val min: Int = 0,
    val max: Int = 0,
    val pop: Int = 0,
)

data class HourInfo(
    val time: String = "",
    val temp: Int = 0,
    val pop: Int = 0,
)

/** Что сохраняем в DataStore и показываем в виджете без сети. */
data class WeatherSnapshot(
    val cityName: String = "",
    val country: String = "",
    val lat: Double = 0.0,
    val lon: Double = 0.0,
    val timezone: String = "UTC",
    val temperature: Int = 0,
    val feelsLike: Int = 0,
    val code: Int = 0,
    val humidity: Int = 0,
    val wind: Int = 0,
    val isDay: Boolean = true,
    val unit: String = "c",
    val maxToday: Int = 0,
    val minToday: Int = 0,
    val visibilityKm: Int = 0,
    val pressure: Int = 0,
    val uvIndex: Int = 0,
    val sunrise: String = "",
    val sunset: String = "",
    val fetchedAt: Long = 0L,
    val daily: List<DayInfo> = emptyList(),
    val hourly: List<HourInfo> = emptyList(),
)

/* ---------- ответы API ---------- */

data class WeatherResponse(
    @SerializedName("timezone") val timezone: String? = null,
    @SerializedName("current") val current: CurrentDto? = null,
    @SerializedName("hourly") val hourly: HourlyDto? = null,
    @SerializedName("daily") val daily: DailyDto? = null,
)

data class CurrentDto(
    @SerializedName("time") val time: String? = null,
    @SerializedName("temperature_2m") val temperature: Double? = null,
    @SerializedName("apparent_temperature") val feelsLike: Double? = null,
    @SerializedName("relative_humidity_2m") val humidity: Int? = null,
    @SerializedName("weather_code") val code: Int? = null,
    @SerializedName("wind_speed_10m") val wind: Double? = null,
    @SerializedName("is_day") val isDay: Int? = null,
    @SerializedName("visibility") val visibility: Double? = null,
    @SerializedName("surface_pressure") val pressure: Double? = null,
)

data class HourlyDto(
    @SerializedName("time") val time: List<String>? = null,
    @SerializedName("temperature_2m") val temperature: List<Double>? = null,
    @SerializedName("precipitation_probability") val pop: List<Int>? = null,
)

data class DailyDto(
    @SerializedName("time") val time: List<String>? = null,
    @SerializedName("weather_code") val code: List<Int>? = null,
    @SerializedName("temperature_2m_max") val max: List<Double>? = null,
    @SerializedName("temperature_2m_min") val min: List<Double>? = null,
    @SerializedName("precipitation_probability_max") val pop: List<Int>? = null,
    @SerializedName("sunrise") val sunrise: List<String>? = null,
    @SerializedName("sunset") val sunset: List<String>? = null,
    @SerializedName("uv_index_max") val uvIndex: List<Double>? = null,
)

data class GeocodingResponse(
    @SerializedName("results") val results: List<GeoDto>? = null,
)

data class GeoDto(
    @SerializedName("name") val name: String? = null,
    @SerializedName("country") val country: String? = null,
    @SerializedName("admin1") val admin1: String? = null,
    @SerializedName("latitude") val lat: Double? = null,
    @SerializedName("longitude") val lon: Double? = null,
)

data class RatesResponse(
    @SerializedName("result") val result: String? = null,
    @SerializedName("provider") val provider: String? = null,
    @SerializedName("time_last_update_utc") val updated: String? = null,
    @SerializedName("rates") val rates: Map<String, Double>? = null,
)

data class TrendResponse(
    @SerializedName("rates") val rates: Map<String, Map<String, Double>>? = null,
)
