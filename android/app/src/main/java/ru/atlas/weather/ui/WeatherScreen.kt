package ru.atlas.weather.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import ru.atlas.weather.AtlasApp
import ru.atlas.weather.data.City
import ru.atlas.weather.data.WeatherSnapshot
import ru.atlas.weather.util.dayName
import ru.atlas.weather.util.weatherAlerts
import ru.atlas.weather.util.weatherInfo
import ru.atlas.weather.widget.WidgetUpdater
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WeatherScreen() {
    val context = LocalContext.current
    val app = context.applicationContext as AtlasApp
    val repository = app.repository
    val settings = app.settings
    val scope = rememberCoroutineScope()

    var snapshot by remember { mutableStateOf<WeatherSnapshot?>(null) }
    var query by remember { mutableStateOf("") }
    var found by remember { mutableStateOf<List<City>>(emptyList()) }
    var rates by remember { mutableStateOf<Map<String, Double>>(emptyMap()) }
    var base by remember { mutableStateOf("USD") }
    var unit by remember { mutableStateOf("c") }

    LaunchedEffect(Unit) {
        val stored = settings.snapshot()
        base = stored.base
        unit = stored.unit
        snapshot = runCatching { repository.loadWeather(stored.city) }
            .getOrElse { repository.cachedWeather() }
        rates = runCatching { repository.rates(stored.base) }.getOrDefault(emptyMap())
    }

    LaunchedEffect(query) {
        if (query.trim().length < 2) {
            found = emptyList()
            return@LaunchedEffect
        }
        delay(350)
        found = runCatching { repository.searchCities(query.trim()) }
            .getOrDefault(emptyList())
            .take(6)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Атлас") },
                actions = {
                    TextButton(onClick = {
                        scope.launch {
                            snapshot = runCatching { repository.loadWeather(settings.snapshot().city) }
                                .getOrElse { snapshot }
                            WidgetUpdater.updateNow(context)
                        }
                    }) { Text("↻") }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
        ) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                label = { Text("Поиск города") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            if (found.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                found.forEach { city ->
                    TextButton(
                        onClick = {
                            scope.launch {
                                settings.saveCity(city)
                                snapshot = runCatching { repository.loadWeather(city) }
                                    .getOrElse { repository.cachedWeather() }
                                WidgetUpdater.updateNow(context)
                                query = ""
                                found = emptyList()
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("${city.name}, ${city.country}")
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            snapshot?.let { snap ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp)) {
                        Text(
                            text = listOfNotNull(snap.cityName, snap.country).joinToString(", "),
                            style = MaterialTheme.typography.titleMedium,
                        )
                        Text(
                            text = "${snap.temperature}° · ${weatherInfo(snap.code).second}",
                            style = MaterialTheme.typography.displaySmall,
                        )
                        Text(
                            text = "Ощущается ${snap.feelsLike}° · влажность ${snap.humidity}% · ветер ${snap.wind} " +
                                if (unit == "f") "mph" else "км/ч",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        Text("Макс ${snap.maxToday}° / мин ${snap.minToday}°")
                        if (snap.uvIndex > 0) Text("УФ-индекс: ${snap.uvIndex}")
                        if (snap.sunrise.isNotEmpty() && snap.sunset.isNotEmpty()) {
                            Text("Восход ${snap.sunrise} · закат ${snap.sunset}")
                        }
                        if (snap.visibilityKm > 0 || snap.pressure > 0) {
                            Text("Видимость ${snap.visibilityKm} км · давление ${snap.pressure} гПа")
                        }
                        weatherAlerts(snap).forEach { alert ->
                            Text("⚠ $alert", color = MaterialTheme.colorScheme.error)
                        }
                        Text("Обновлено: ${java.text.SimpleDateFormat("HH:mm", Locale.getDefault()).format(snap.fetchedAt)}")
                    }
                }

                Spacer(Modifier.height(20.dp))
                Text("Ближайшие 24 часа", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Row(modifier = Modifier.horizontalScroll(rememberScrollState())) {
                    snap.hourly.forEach { hour ->
                        Column(Modifier.padding(end = 14.dp)) {
                            Text(hour.time, style = MaterialTheme.typography.labelSmall)
                            Text("${hour.temp}°", style = MaterialTheme.typography.titleMedium)
                            Text("${hour.pop}%", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }

                Spacer(Modifier.height(20.dp))
                Text("Прогноз на 7 дней", style = MaterialTheme.typography.titleMedium)
                snap.daily.forEach { day ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                    ) {
                        Text(dayName(day.date), Modifier.width(52.dp))
                        Text(weatherInfo(day.code).first, Modifier.width(34.dp))
                        Text("${day.pop}%", Modifier.width(44.dp))
                        Text("${day.max}° / ${day.min}°")
                    }
                }
            }

            Spacer(Modifier.height(24.dp))
            Text("Единицы", style = MaterialTheme.typography.titleMedium)
            Row {
                listOf("c" to "°C", "f" to "°F").forEach { (value, label) ->
                    Button(
                        onClick = {
                            scope.launch {
                                settings.saveUnit(value)
                                unit = value
                                snapshot = runCatching { repository.loadWeather(settings.snapshot().city) }
                                    .getOrElse { snapshot }
                                WidgetUpdater.updateNow(context)
                            }
                        },
                    ) { Text(label) }
                    Spacer(Modifier.width(8.dp))
                }
            }

            Spacer(Modifier.height(24.dp))
            Text("Курсы валют", style = MaterialTheme.typography.titleMedium)
            Row {
                listOf("USD", "EUR", "GBP", "RUB").forEach { code ->
                    Button(
                        onClick = {
                            scope.launch {
                                settings.saveBase(code)
                                base = code
                                rates = runCatching { repository.rates(code) }.getOrDefault(emptyMap())
                            }
                        },
                    ) { Text(code) }
                    Spacer(Modifier.width(8.dp))
                }
            }
            Spacer(Modifier.height(8.dp))
            rates.filterKeys { it != base }.entries.take(10).forEach { (code, value) ->
                Row(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Text(code, Modifier.width(60.dp))
                    Text(String.format(Locale("ru"), "%.4f", value))
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}
