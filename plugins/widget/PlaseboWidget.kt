package com.plasebo.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONObject
import java.io.File

/**
 * Ana ekran widget'ı.
 *
 * Uygulama, her açılışında `files/widget.json` dosyasına o günün özetini
 * yazıyor (bkz. `src/utils/widget.ts`); widget da yalnızca o dosyayı
 * okuyor. Böylece formül mantığı tek yerde — JavaScript tarafında —
 * kalıyor, Kotlin tarafına kopyalanmıyor.
 *
 * Dosya yoksa (uygulama hiç açılmadıysa) widget tanıtım metnini gösterir.
 */
class PlaseboWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        manager: AppWidgetManager,
        ids: IntArray
    ) {
        for (id in ids) {
            manager.updateAppWidget(id, buildViews(context))
        }
    }

    private fun buildViews(context: Context): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.plasebo_widget)

        var title = context.getString(R.string.widget_default_title)
        var subtitle = context.getString(R.string.widget_default_subtitle)
        var streak = ""

        try {
            val file = File(context.filesDir, "widget.json")
            if (file.exists()) {
                val json = JSONObject(file.readText())
                title = json.optString("formula", title)
                subtitle = json.optString("state", subtitle)
                val days = json.optInt("streak", 0)
                if (days > 0) {
                    streak = json.optString("streakLabel", "")
                }
            }
        } catch (_: Exception) {
            // Bozuk ya da yarım yazılmış dosya widget'ı düşürmesin.
        }

        views.setTextViewText(R.id.widget_title, title)
        views.setTextViewText(R.id.widget_subtitle, subtitle)
        views.setTextViewText(R.id.widget_streak, streak)

        // Widget'a dokunmak uygulamayı açar.
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
        if (launch != null) {
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            val pending = PendingIntent.getActivity(
                context,
                0,
                launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pending)
        }

        return views
    }
}
