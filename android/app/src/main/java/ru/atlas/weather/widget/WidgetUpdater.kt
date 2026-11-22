package ru.atlas.weather.widget

import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import ru.atlas.weather.AtlasApp
import ru.atlas.weather.util.weatherAlerts
import java.util.concurrent.TimeUnit

class WidgetUpdater(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = try {
        val app = applicationContext as AtlasApp
        val city = app.settings.snapshot().city
        val snapshot = app.repository.loadWeather(city)
        maybeNotify(app, weatherAlerts(snapshot))
        refreshWidgets()
        Result.success()
    } catch (exception: Exception) {
        Result.retry()
    }

    /** Не чаще одного предупреждения в час, чтобы не спамить. */
    private suspend fun maybeNotify(app: AtlasApp, alerts: List<String>) {
        if (alerts.isEmpty()) return
        if (System.currentTimeMillis() - app.settings.lastNotified() < 60 * 60 * 1000L) return
        app.settings.saveNotified(System.currentTimeMillis())

        val notification = NotificationCompat.Builder(applicationContext, AtlasApp.ALERT_CHANNEL)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Атлас · погодное предупреждение")
            .setContentText(alerts.joinToString("; "))
            .setStyle(NotificationCompat.BigTextStyle().bigText(alerts.joinToString("\n")))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()
        NotificationManagerCompat.from(applicationContext).notify(1001, notification)
    }

    private suspend fun refreshWidgets() {
        val manager = GlanceAppWidgetManager(applicationContext)
        manager.getGlanceIds(AtlasWidget::class.java).forEach { id ->
            AtlasWidget().update(applicationContext, id)
        }
    }

    companion object {
        private const val PERIODIC_NAME = "atlas-widget-periodic"
        private const val ONCE_NAME = "atlas-widget-now"

        fun schedulePeriodic(context: Context) {
            val request = PeriodicWorkRequestBuilder<WidgetUpdater>(15, TimeUnit.MINUTES)
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .setBackoffCriteria(BackoffPolicy.LINEAR, 10, TimeUnit.MINUTES)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                PERIODIC_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                request,
            )
        }

        fun updateNow(context: Context) {
            val request = OneTimeWorkRequestBuilder<WidgetUpdater>()
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                ONCE_NAME,
                ExistingWorkPolicy.REPLACE,
                request,
            )
        }
    }
}
