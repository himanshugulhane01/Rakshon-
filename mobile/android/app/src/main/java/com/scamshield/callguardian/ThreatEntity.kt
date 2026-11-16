package com.scamshield.callguardian

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "scam_threats",
    indices = [
        Index(value = ["value"], unique = true),
        Index(value = ["indicatorType"])
    ]
)
data class ThreatEntity(
    @PrimaryKey
    val id: Int,
    val indicatorType: String, // "PHONE_NUMBER", "PHONE_PREFIX", "UPI_HANDLE", etc.
    val value: String,         // e.g. "+919876543210" or "+92"
    val severity: String,      // "HIGH", "MEDIUM", "LOW"
    val description: String?,  // Context e.g. "Electricity bill impersonator"
    val language: String,
    val isActive: Boolean,
    val version: Int
)

