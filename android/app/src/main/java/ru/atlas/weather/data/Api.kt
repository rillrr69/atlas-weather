package ru.atlas.weather.data

import com.google.gson.GsonBuilder
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

private interface WeatherApi {
    @GET("v1/forecast")
    suspend fun forecast(
        @Query("latitude") lat: Double,
        @Query("longitude") lon: Double,
        @Query("current") current: String = "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day,visibility,surface_pressure,time",
        @Query("hourly") hourly: String = "temperature_2m,precipitation_probability",
        @Query("daily") daily: String = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max",
        @Query("timezone") timezone: String = "auto",
        @Query("forecast_days") days: Int = 7,
    ): WeatherResponse
}

private interface GeoApi {
    @GET("v1/search")
    suspend fun search(
        @Query("name") query: String,
        @Query("count") count: Int = 6,
        @Query("language") language: String = "ru",
        @Query("format") format: String = "json",
    ): GeocodingResponse
}

private interface RatesApi {
    @GET("v6/latest/{base}")
    suspend fun latest(@Path("base") base: String): RatesResponse
}

private interface TrendApi {
    @GET("{start}..")
    suspend fun series(
        @Path("start", encoded = true) start: String,
        @Query("from") from: String,
        @Query("to") to: String,
    ): TrendResponse
}

object Api {
    private val gson = GsonBuilder().serializeNulls().create()

    private fun retrofit(baseUrl: String): Retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(GsonConverterFactory.create(gson))
        .build()

    private val weather by lazy { retrofit("https://api.open-meteo.com/").create(WeatherApi::class.java) }
    private val geo by lazy { retrofit("https://geocoding-api.open-meteo.com/").create(GeoApi::class.java) }
    private val rates by lazy { retrofit("https://open.er-api.com/").create(RatesApi::class.java) }
    private val trend by lazy { retrofit("https://api.frankfurter.app/").create(TrendApi::class.java) }

    suspend fun forecast(lat: Double, lon: Double) = weather.forecast(lat, lon)
    suspend fun searchCities(query: String) = geo.search(query)
    suspend fun latestRates(base: String) = rates.latest(base)
    suspend fun trend(start: String, from: String, to: String) = trend.series(start, from, to)
}
