package com.scamshield

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "ScamShield"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIncomingShareIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingShareIntent(intent)
    }

    /**
     * Extracts shared SMS text or screenshot URI shared via Android Sharesheet
     * Avoids needing invasive READ_SMS permissions
     */
    private fun handleIncomingShareIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_SEND) {
            val type = intent.type
            if ("text/plain" == type) {
                val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
                // Shared SMS or message text ready for Message Guardian analysis
            }
        }
    }
}

