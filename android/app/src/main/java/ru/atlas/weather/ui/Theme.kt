package ru.atlas.weather.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColors = darkColorScheme(
    primary = Color(0xFF6EE7F9),
    secondary = Color(0xFFA78BFA),
    background = Color(0xFF080B16),
    surface = Color(0xFF131C30),
    onPrimary = Color(0xFF04121A),
    onBackground = Color(0xFFEEF2FF),
    onSurface = Color(0xFFEEF2FF),
)

private val LightColors = lightColorScheme(
    primary = Color(0xFF0891B2),
    secondary = Color(0xFF7C3AED),
    background = Color(0xFFF6F8FF),
    surface = Color(0xFFFFFFFF),
)

@Composable
fun AtlasTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        content = content,
    )
}
