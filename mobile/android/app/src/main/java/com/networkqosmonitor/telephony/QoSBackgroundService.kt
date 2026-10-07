package com.networkqosmonitor.telephony

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

/**
 * Headless JS Background Service for periodic QoS sampling (RF-07)
 * Runs even when app is closed or device is locked
 */
class QoSBackgroundService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        val extras = intent.extras
        return HeadlessJsTaskConfig(
            "QoSPeriodicSamplingTask",
            if (extras != null) Arguments.fromBundle(extras) else Arguments.createMap(),
            20000, // 20s task execution timeout
            true   // allowed in foreground / doze mode
        )
    }
}
