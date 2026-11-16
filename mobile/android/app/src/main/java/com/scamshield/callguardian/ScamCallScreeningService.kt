package com.scamshield.callguardian

import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import androidx.annotation.RequiresApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@RequiresApi(Build.VERSION_CODES.Q)
class ScamCallScreeningService : CallScreeningService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    companion object {
        private const val TAG = "ScamCallScreening"
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val rawHandle = callDetails.handle?.schemeSpecificPart
        Log.d(TAG, "Screening incoming call from: ${maskPhoneNumber(rawHandle)}")

        if (rawHandle.isNullOrBlank()) {
            // Safe fallback: allow call by default
            allowCall(callDetails)
            return
        }

        serviceScope.launch {
            try {
                val db = ScamShieldDatabase.getDatabase(applicationContext)
                val threatDao = db.threatDao()

                // 1. Check exact phone number match in local Room DB
                val exactThreat = threatDao.findByPhoneNumber(rawHandle)

                // 2. Check prefix matches (e.g. suspicious international prefixes)
                val isPrefixThreat = if (exactThreat == null) {
                    val prefixes = threatDao.getAllActivePrefixes()
                    prefixes.any { rawHandle.startsWith(it.value) }
                } else false

                val isThreat = (exactThreat != null) || isPrefixThreat

                if (isThreat) {
                    Log.w(TAG, "Blocked verified scam call: ${maskPhoneNumber(rawHandle)}")
                    blockThreatCall(callDetails)
                } else {
                    // Default behavior: Unknown callers are always allowed
                    allowCall(callDetails)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error screening call offline, defaulting to allow", e)
                allowCall(callDetails)
            }
        }
    }

    private fun allowCall(callDetails: Call.Details) {
        val response = CallResponse.Builder()
            .setDisallowCall(false)
            .setRejectCall(false)
            .setSilenceCall(false)
            .setSkipCallLog(false)
            .setSkipNotification(false)
            .build()
        respondToCall(callDetails, response)
    }

    private fun blockThreatCall(callDetails: Call.Details) {
        val response = CallResponse.Builder()
            .setDisallowCall(true)
            .setRejectCall(true)
            .setSkipCallLog(false) // Preserved in call log for caregiver review
            .setSkipNotification(false)
            .build()
        respondToCall(callDetails, response)
    }

    private fun maskPhoneNumber(number: String?): String {
        if (number == null || number.length < 5) return "***"
        return number.take(3) + "****" + number.takeLast(2)
    }
}

