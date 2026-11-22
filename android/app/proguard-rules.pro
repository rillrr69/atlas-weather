# Gson models use reflection; keep them if minifyEnabled is turned on.
-keep class ru.atlas.weather.data.** { *; }
-dontwarn com.google.gson.**
