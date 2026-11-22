package ru.atlas.weather.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.atlasDataStore: DataStore<Preferences> by preferencesDataStore(name = "atlas_settings")

class SettingsStore(private val context: Context) {

    data class Snapshot(
        val city: City = City(),
        val unit: String = "c",
        val base: String = "USD",
        val intervalMinutes: Int = 15,
        val weatherJson: String? = null,
    )

    companion object {
        private val KEY_CITY_NAME = stringPreferencesKey("city_name")
        private val KEY_COUNTRY = stringPreferencesKey("city_country")
        private val KEY_LAT = stringPreferencesKey("city_lat")
        private val KEY_LON = stringPreferencesKey("city_lon")
        private val KEY_UNIT = stringPreferencesKey("unit")
        private val KEY_BASE = stringPreferencesKey("base")
        private val KEY_INTERVAL = intPreferencesKey("interval_minutes")
        private val KEY_WEATHER = stringPreferencesKey("weather_json")
    }

    suspend fun snapshot(): Snapshot {
        val p = context.atlasDataStore.data.first()
        return Snapshot(
            city = City(
                name = p[KEY_CITY_NAME] ?: "Москва",
                country = p[KEY_COUNTRY] ?: "Россия",
                lat = p[KEY_LAT]?.toDoubleOrNull() ?: 55.7558,
                lon = p[KEY_LON]?.toDoubleOrNull() ?: 37.6173,
            ),
            unit = p[KEY_UNIT] ?: "c",
            base = p[KEY_BASE] ?: "USD",
            intervalMinutes = p[KEY_INTERVAL] ?: 15,
            weatherJson = p[KEY_WEATHER],
        )
    }

    suspend fun saveCity(city: City) {
        context.atlasDataStore.edit { prefs ->
            prefs[KEY_CITY_NAME] = city.name
            prefs[KEY_COUNTRY] = city.country
            prefs[KEY_LAT] = city.lat.toString()
            prefs[KEY_LON] = city.lon.toString()
        }
    }

    suspend fun saveUnit(unit: String) {
        context.atlasDataStore.edit { it[KEY_UNIT] = unit }
    }

    suspend fun saveBase(base: String) {
        context.atlasDataStore.edit { it[KEY_BASE] = base }
    }

    suspend fun saveInterval(minutes: Int) {
        context.atlasDataStore.edit { it[KEY_INTERVAL] = minutes }
    }

    suspend fun saveWeather(json: String) {
        context.atlasDataStore.edit { it[KEY_WEATHER] = json }
    }
}
