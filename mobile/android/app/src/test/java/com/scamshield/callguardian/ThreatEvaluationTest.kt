package com.scamshield.callguardian

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ThreatEvaluationTest {

    // Helper evaluation logic matching ScamCallScreeningService offline rules
    private fun evaluateCall(
        rawNumber: String?,
        knownThreatNumbers: Set<String>,
        knownPrefixes: List<String>
    ): Boolean {
        if (rawNumber.isNullOrBlank()) return false
        if (knownThreatNumbers.contains(rawNumber)) return true
        return knownPrefixes.any { rawNumber.startsWith(it) }
    }

    private fun maskPhoneNumber(number: String?): String {
        if (number == null || number.length < 5) return "***"
        return number.take(3) + "****" + number.takeLast(2)
    }

    @Test
    fun unknownCaller_isAllowedByDefault() {
        val knownThreats = setOf("+919876543210")
        val knownPrefixes = listOf("+92")

        val result = evaluateCall("+919811122233", knownThreats, knownPrefixes)
        assertFalse("Unknown phone number should be allowed by default", result)
    }

    @Test
    fun exactScamNumber_isIdentifiedAsThreat() {
        val knownThreats = setOf("+919876543210")
        val knownPrefixes = listOf("+92")

        val result = evaluateCall("+919876543210", knownThreats, knownPrefixes)
        assertTrue("Verified scam phone number must be flagged", result)
    }

    @Test
    fun suspiciousPrefix_isIdentifiedAsThreat() {
        val knownThreats = setOf("+919876543210")
        val knownPrefixes = listOf("+92")

        val result = evaluateCall("+923001234567", knownThreats, knownPrefixes)
        assertTrue("Phone number matching suspicious prefix must be flagged", result)
    }

    @Test
    fun phoneNumberMasking_protectsPrivacy() {
        val masked = maskPhoneNumber("+919876543210")
        assertEquals("+91****10", masked)
        assertFalse(masked.contains("98765432"))
    }
}

