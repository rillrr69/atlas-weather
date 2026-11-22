package ru.atlas.weather.widget

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.background
import androidx.glance.appwidget.provideContent
import androidx.glance.color.ColorProvider
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import ru.atlas.weather.MainActivity
import ru.atlas.weather.data.Repository
import ru.atlas.weather.data.SettingsStore
import ru.atlas.weather.data.WeatherSnapshot
import ru.atlas.weather.util.weatherAlerts
import ru.atlas.weather.util.weatherInfo
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

class AtlasWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val settings = SettingsStore(context)
        val snapshot = Repository(settings).cachedWeather()
        val unit = settings.snapshot().unit

        provideContent { WidgetContent(context, snapshot, unit) }
    }
}

/** Плоский горизонтальный виджет: одна строка времени и погоды, одна строка деталей. */
@Composable
private fun WidgetContent(context: Context, snapshot: WeatherSnapshot?, unit: String) {
    val zone = snapshot?.timezone?.let { value ->
        runCatching { ZoneId.of(value) }.getOrNull()
    } ?: ZoneId.systemDefault()
    val now = ZonedDateTime.now(zone)
    val ru = Locale("ru")
    val time = DateTimeFormatter.ofPattern("HH:mm").format(now)
    val localTime = DateTimeFormatter.ofPattern("HH:mm").format(ZonedDateTime.now())
    val weekday = DateTimeFormatter.ofPattern("EEE", ru).format(now)
    val date = DateTimeFormatter.ofPattern("d MMM", ru).format(now)
    val city = snapshot?.cityName?.takeIf { it.isNotBlank() } ?: "Атлас"
    val (icon, description) = weatherInfo(snapshot?.code ?: 0)
    val temperature = snapshot?.let { "${it.temperature}°${if (unit == "f") "F" else "C"}" } ?: "—°"

    val white = ColorProvider(day = Color.White, night = Color.White)
    val muted = ColorProvider(day = Color(0xFFC7D2FE), night = Color(0xFFC7D2FE))
    val dim = ColorProvider(day = Color(0xFF98A2C4), night = Color(0xFF98A2C4))

    Column(
        modifier = GlanceModifier
            .fillMaxWidth()
            .background(
                day = Color(0xFF131C30),
                night = Color(0xFF0B1020),
            )
            .padding(horizontal = 12.dp, vertical = 8.dp)
            .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
    ) {
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.Vertical.CenterVertically,
        ) {
            Text(
                text = time,
                style = TextStyle(color = white, fontSize = 25.sp, fontWeight = FontWeight.Bold),
            )
            Spacer(GlanceModifier.width(8.dp))
            Text(
                text = icon,
                style = TextStyle(color = white, fontSize = 19.sp),
            )
            Spacer(GlanceModifier.width(4.dp))
            Text(
                text = temperature,
                style = TextStyle(color = white, fontSize = 20.sp, fontWeight = FontWeight.Bold),
            )
            Spacer(GlanceModifier.width(6.dp))
            Text(
                text = description,
                style = TextStyle(color = dim, fontSize = 10.sp),
            )
        }

        Spacer(GlanceModifier.height(2.dp))
        Text(
            text = "$weekday, $date · $city · у вас $localTime",
            style = TextStyle(color = muted, fontSize = 10.sp),
        )

        val alerts = weatherAlerts(snapshot ?: WeatherSnapshot())
        if (alerts.isNotEmpty()) {
            Spacer(GlanceModifier.height(2.dp))
            Text(
                text = "⚠ ${alerts.first()}",
                style = TextStyle(
                    color = ColorProvider(day = Color(0xFFFBBF24), night = Color(0xFFFBBF24)),
                    fontSize = 9.sp,
                ),
            )
        }
    }
}
