package ru.atlas.weather.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColors = darkColorScheme(
    primary = Color(0xFF6EE7F9),
    secondary = Color(0xFFA78BFA),
    background = Color(0xFF080B16),
    surface = Color(0xFF131C30),
    surfaceVariant = Color(0xFF1B2540),
    onPrimary = Color(0xFF04121A),
    onBackground = Color(0xFFEEF2FF),
    onSurface = Color(0xFFEEF2FF),
    onSurfaceVariant = Color(0xFFC7D2FE),
    error = Color(0xFFFCA5A5),
)

/** Тёмная тема всегда: она совпадает с веб-дашбордом и виджетом. */
@Composable
fun AtlasTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColors,
        content = content,
    )
}
