package com.scamshield.callguardian

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface ThreatDao {

    @Query("SELECT * FROM scam_threats WHERE indicatorType = 'PHONE_NUMBER' AND value = :phoneNumber AND isActive = 1 LIMIT 1")
    fun findByPhoneNumber(phoneNumber: String): ThreatEntity?

    @Query("SELECT * FROM scam_threats WHERE indicatorType = 'PHONE_PREFIX' AND isActive = 1")
    fun getAllActivePrefixes(): List<ThreatEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsertAll(threats: List<ThreatEntity>)

    @Query("SELECT MAX(version) FROM scam_threats")
    fun getLatestVersion(): Int?

    @Query("SELECT COUNT(*) FROM scam_threats WHERE isActive = 1")
    fun countActiveThreats(): Int
}

