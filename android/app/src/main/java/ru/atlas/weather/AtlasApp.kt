package ru.atlas.weather

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import ru.atlas.weather.data.Repository
import ru.atlas.weather.data.SettingsStore
import ru.atlas.weather.widget.WidgetUpdater

class AtlasApp : Application() {

    companion object {
        const val ALERT_CHANNEL = "atlas_alerts"
    }

    lateinit var settings: SettingsStore
        private set
    lateinit var repository: Repository
        private set

    override fun onCreate() {
        super.onCreate()
        settings = SettingsStore(this)
        repository = Repository(settings)
        createAlertChannel()
        WidgetUpdater.schedulePeriodic(this)
    }

    private fun createAlertChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(
            ALERT_CHANNEL,
            "Погодные предупреждения",
            NotificationManager.IMPORTANCE_DEFAULT,
        )
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }
}
