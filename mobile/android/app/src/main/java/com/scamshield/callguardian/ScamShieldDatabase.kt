package com.scamshield.callguardian

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [ThreatEntity::class], version = 1, exportSchema = false)
abstract class ScamShieldDatabase : RoomDatabase() {
    abstract fun threatDao(): ThreatDao

    companion object {
        @Volatile
        private var INSTANCE: ScamShieldDatabase? = null

        fun getDatabase(context: Context): ScamShieldDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ScamShieldDatabase::class.java,
                    "scamshield_offline_threats.db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

