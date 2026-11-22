package ru.atlas.weather

import android.app.Application
import ru.atlas.weather.data.Repository
import ru.atlas.weather.data.SettingsStore
import ru.atlas.weather.widget.WidgetUpdater

class AtlasApp : Application() {

    lateinit var settings: SettingsStore
        private set
    lateinit var repository: Repository
        private set

    override fun onCreate() {
        super.onCreate()
        settings = SettingsStore(this)
        repository = Repository(settings)
        WidgetUpdater.schedulePeriodic(this)
    }
}
