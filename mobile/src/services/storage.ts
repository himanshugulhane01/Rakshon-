/**
 * ScamShield Local Storage Service
 *
 * Separates ordinary UI preferences from secure application credentials.
 * Strictly forbids storing private OTPs, PINs, or passwords anywhere in persistent storage.
 */

import { SimulatorScenario } from './scamScenarios';

export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityViolationError';
  }
}

// In-memory key-value fallback cache (provides instant synchronous reads and Jest test compatibility)
const preferencesCache = new Map<string, string>();
const secureCache = new Map<string, string>();

// Forbidden credential patterns that must NEVER be persisted
const FORBIDDEN_STORAGE_KEYS = [/otp/i, /pin/i, /password/i, /passcode/i, /cvv/i, /secret/i];

export const PreferencesKeys = {
  APP_LANGUAGE: 'scamshield_pref_language',
  ONBOARDING_COMPLETED: 'scamshield_pref_onboarding_completed',
  USER_FULL_NAME: 'rakshon_pref_user_full_name',
  HIGH_CONTRAST_ENABLED: 'scamshield_pref_high_contrast',
  CALL_SCREENING_ROLE_GRANTED: 'scamshield_pref_call_screening_role_granted',
  LAST_THREAT_SYNC_TIMESTAMP: 'scamshield_pref_last_threat_sync_timestamp',
  THREAT_DATABASE_VERSION: 'scamshield_pref_threat_database_version',
  THREAT_DATABASE_RECORD_COUNT: 'scamshield_pref_threat_database_record_count',
  FAMILY_CAREGIVER_NAME: 'scamshield_pref_family_caregiver_name',
  FAMILY_CAREGIVER_RELATION: 'scamshield_pref_family_caregiver_relation',
  FAMILY_CAREGIVER_STATUS: 'scamshield_pref_family_caregiver_status',
  FAMILY_PAIRING_EXPIRES_AT: 'scamshield_pref_family_pairing_expires_at',
  FAMILY_CONSENT_GRANTED: 'scamshield_pref_family_consent_granted',
  FAMILY_PAIRED_AT: 'scamshield_pref_family_paired_at',
  SCAM_SIMULATOR_COMPLETED_IDS: 'scamshield_pref_simulator_completed_ids',
  SCAM_SIMULATOR_RESULTS: 'scamshield_pref_simulator_results',
  BANKING_SANDBOX_STATS: 'scamshield_pref_banking_sandbox_stats',
  AUDIO_VISUAL_PROGRESS: 'scamshield_pref_audiovisual_learning_progress',
  SAFE_BROWSING_STATS: 'scamshield_pref_safe_browsing_stats',
  CAREGIVER_PERMISSIONS: 'scamshield_pref_caregiver_permissions',
  CAREGIVER_ALERTS_LOG: 'scamshield_pref_caregiver_alerts_log',
} as const;

export interface AudioVisualModuleProgress {
  moduleId: string;
  completedAt?: string;
  quizScore: number;
  isCompleted: boolean;
  lastSlideIndex: number;
}

export interface AudioVisualLearningStats {
  totalModules: number;
  completedCount: number;
  lastActiveModuleId?: string;
  modules: Record<string, AudioVisualModuleProgress>;
}

export interface SafeBrowsingRecord {
  scenarioId: string;
  domain: string;
  choiceId: string;
  isSafe: boolean;
  timestamp: string;
}

export interface SafeBrowsingStats {
  totalScenarios: number;
  completedScenarios: number;
  correctAnswers: number;
  accuracyPercentage: number;
  isComplete: boolean;
  records: SafeBrowsingRecord[];
}

export interface CaregiverPermissionSettings {
  shareLearningProgress: boolean;
  shareSecurityStatus: boolean;
  shareHighRiskAlerts: boolean;
  consentGrantedAt: string | null;
}

export interface CaregiverSafetyAlert {
  id: string;
  timestamp: string;
  category: string;
  title: string;
  riskLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  description: string;
}

export interface BankingSandboxRecord {
  scenarioId: string;
  category: string;
  choiceId: string;
  isSafe: boolean;
  timestamp: string;
}

export interface BankingSandboxStats {
  totalScenarios: number;
  completedScenarios: number;
  correctAnswers: number;
  accuracyPercentage: number;
  isComplete: boolean;
  lastAttemptTimestamp?: string;
  records: BankingSandboxRecord[];
}

export interface SimulatorAnswerRecord {
  scenarioId: string;
  category: string;
  choiceId: string;
  isSafe: boolean;
  timestamp: string;
}

export interface SimulatorImprovementArea {
  category: string;
  topicTitleEn: string;
  topicTitleHi: string;
  topicTitleMr: string;
  adviceEn: string;
  adviceHi: string;
  adviceMr: string;
}

export interface SimulatorLearningStats {
  totalScenarios: number;
  totalCompleted: number;
  correctAnswers: number;
  accuracyPercentage: number;
  completedCategories: string[];
  masteredCategories: string[];
  needsImprovementAreas: SimulatorImprovementArea[];
  isComplete: boolean;
}

export const SecureKeys = {
  AUTH_SESSION_TOKEN: 'scamshield_sec_auth_token',
  USER_PHONE_HASH: 'scamshield_sec_user_phone_hash',
  FAMILY_PAIRING_CODE: 'scamshield_sec_family_pairing_code',
} as const;

/**
 * Basic obfuscation layer for secure tokens (XOR masking)
 * Prevents raw token strings from sitting in clear text.
 */
function obfuscate(value: string): string {
  const salt = 0x5a;
  return Array.from(value)
    .map((char) => (char.charCodeAt(0) ^ salt).toString(16).padStart(2, '0'))
    .join('');
}

function deobfuscate(hex: string): string {
  const salt = 0x5a;
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substring(i, i + 2), 16) ^ salt;
    result += String.fromCharCode(code);
  }
  return result;
}

export const StorageService = {
  // --- Ordinary User Preferences ---
  async getPreference(key: string, defaultValue: string = ''): Promise<string> {
    return preferencesCache.get(key) ?? defaultValue;
  },

  async setPreference(key: string, value: string): Promise<void> {
    preferencesCache.set(key, value);
  },

  async getLanguage(): Promise<'en' | 'hi' | 'mr'> {
    const lang = await this.getPreference(PreferencesKeys.APP_LANGUAGE, 'en');
    if (lang === 'hi' || lang === 'mr') return lang;
    return 'en';
  },

  async setLanguage(lang: 'en' | 'hi' | 'mr'): Promise<void> {
    await this.setPreference(PreferencesKeys.APP_LANGUAGE, lang);
  },

  async isOnboardingCompleted(): Promise<boolean> {
    const val = await this.getPreference(PreferencesKeys.ONBOARDING_COMPLETED, 'false');
    return val === 'true';
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setPreference(PreferencesKeys.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
  },

  async getCallScreeningRoleGranted(): Promise<boolean> {
    const val = await this.getPreference(PreferencesKeys.CALL_SCREENING_ROLE_GRANTED, 'false');
    return val === 'true';
  },

  async setCallScreeningRoleGranted(granted: boolean): Promise<void> {
    await this.setPreference(
      PreferencesKeys.CALL_SCREENING_ROLE_GRANTED,
      granted ? 'true' : 'false'
    );
  },

  async getThreatDatabaseInfo(): Promise<{
    lastSync: string | null;
    version: number;
    count: number;
  }> {
    const lastSync = await this.getPreference(PreferencesKeys.LAST_THREAT_SYNC_TIMESTAMP, '');
    const versionStr = await this.getPreference(PreferencesKeys.THREAT_DATABASE_VERSION, '0');
    const countStr = await this.getPreference(PreferencesKeys.THREAT_DATABASE_RECORD_COUNT, '0');

    return {
      lastSync: lastSync || null,
      version: parseInt(versionStr, 10) || 0,
      count: parseInt(countStr, 10) || 0,
    };
  },

  async setLastThreatSync(timestamp: string, version: number, count: number): Promise<void> {
    await this.setPreference(PreferencesKeys.LAST_THREAT_SYNC_TIMESTAMP, timestamp);
    await this.setPreference(PreferencesKeys.THREAT_DATABASE_VERSION, version.toString());
    await this.setPreference(PreferencesKeys.THREAT_DATABASE_RECORD_COUNT, count.toString());
  },

  // --- Family Safety Circle & Consent ---
  async getFamilyCircleInfo(): Promise<{
    status: 'ACTIVE' | 'PENDING' | 'NOT_PAIRED';
    caregiverName: string;
    caregiverRelation: string;
    pairingCode: string | null;
    expiresAt: string | null;
    pairedAt: string | null;
    consentGranted: boolean;
  }> {
    const status = (await this.getPreference(
      PreferencesKeys.FAMILY_CAREGIVER_STATUS,
      'NOT_PAIRED'
    )) as 'ACTIVE' | 'PENDING' | 'NOT_PAIRED';
    const caregiverName = await this.getPreference(PreferencesKeys.FAMILY_CAREGIVER_NAME, '');
    const caregiverRelation = await this.getPreference(PreferencesKeys.FAMILY_CAREGIVER_RELATION, '');
    const expiresAt = await this.getPreference(PreferencesKeys.FAMILY_PAIRING_EXPIRES_AT, '');
    const pairedAt = await this.getPreference(PreferencesKeys.FAMILY_PAIRED_AT, '');
    const consentGranted =
      (await this.getPreference(PreferencesKeys.FAMILY_CONSENT_GRANTED, 'false')) === 'true';
    const pairingCode = await this.getSecureCredential(SecureKeys.FAMILY_PAIRING_CODE);

    return {
      status,
      caregiverName,
      caregiverRelation,
      pairingCode,
      expiresAt: expiresAt || null,
      pairedAt: pairedAt || null,
      consentGranted,
    };
  },

  async generateFamilyPairingCode(): Promise<string> {
    // Generate clean 6-digit random pairing code
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    await this.setSecureCredential(SecureKeys.FAMILY_PAIRING_CODE, randomDigits);
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_STATUS, 'PENDING');
    // 15-minute expiration timestamp
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await this.setPreference(PreferencesKeys.FAMILY_PAIRING_EXPIRES_AT, expiresAt);
    return randomDigits;
  },

  async initiateFamilyInvitation(caregiverName: string, relation: string = ''): Promise<string> {
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_NAME, caregiverName.trim());
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_RELATION, relation.trim());
    await this.setPreference(PreferencesKeys.FAMILY_CONSENT_GRANTED, 'true');
    return this.generateFamilyPairingCode();
  },

  async confirmCaregiverPairing(caregiverName: string, relation?: string): Promise<void> {
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_NAME, caregiverName.trim());
    if (relation !== undefined) {
      await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_RELATION, relation.trim());
    }
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_STATUS, 'ACTIVE');
    await this.setPreference(PreferencesKeys.FAMILY_PAIRED_AT, new Date().toISOString());
  },

  async revokeFamilyCircle(): Promise<void> {
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_STATUS, 'NOT_PAIRED');
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_NAME, '');
    await this.setPreference(PreferencesKeys.FAMILY_CAREGIVER_RELATION, '');
    await this.setPreference(PreferencesKeys.FAMILY_PAIRING_EXPIRES_AT, '');
    await this.setPreference(PreferencesKeys.FAMILY_CONSENT_GRANTED, 'false');
    await this.setPreference(PreferencesKeys.FAMILY_PAIRED_AT, '');
    await this.setSecureCredential(SecureKeys.FAMILY_PAIRING_CODE, 'REVOKED');
  },

  // --- Scam Simulator Progress & Learning ---
  async getCompletedSimulatorScenarios(): Promise<string[]> {
    const raw = await this.getPreference(PreferencesKeys.SCAM_SIMULATOR_COMPLETED_IDS, '[]');
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async recordSimulatorScenarioCompleted(scenarioId: string): Promise<string[]> {
    const existing = await this.getCompletedSimulatorScenarios();
    if (!existing.includes(scenarioId)) {
      const updated = [...existing, scenarioId];
      await this.setPreference(
        PreferencesKeys.SCAM_SIMULATOR_COMPLETED_IDS,
        JSON.stringify(updated)
      );
      return updated;
    }
    return existing;
  },

  async getSimulatorAnswerRecords(): Promise<SimulatorAnswerRecord[]> {
    const raw = await this.getPreference(PreferencesKeys.SCAM_SIMULATOR_RESULTS, '[]');
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) => item && typeof item.scenarioId === 'string' && typeof item.isSafe === 'boolean'
        );
      }
      return [];
    } catch {
      return [];
    }
  },

  async recordSimulatorAnswer(
    scenarioId: string,
    category: string,
    choiceId: string,
    isSafe: boolean
  ): Promise<SimulatorAnswerRecord[]> {
    const existing = await this.getSimulatorAnswerRecords();
    const updated = existing.filter((r) => r.scenarioId !== scenarioId);
    updated.push({
      scenarioId,
      category,
      choiceId,
      isSafe,
      timestamp: new Date().toISOString(),
    });

    await this.setPreference(
      PreferencesKeys.SCAM_SIMULATOR_RESULTS,
      JSON.stringify(updated)
    );

    // Also persist scenarioId in completed IDs
    await this.recordSimulatorScenarioCompleted(scenarioId);

    return updated;
  },

  async getSimulatorLearningStats(
    scenarios: SimulatorScenario[]
  ): Promise<SimulatorLearningStats> {
    const records = await this.getSimulatorAnswerRecords();
    const totalScenarios = scenarios.length;
    const totalCompleted = records.length;
    const correctAnswers = records.filter((r) => r.isSafe).length;
    const accuracyPercentage =
      totalCompleted > 0 ? Math.round((correctAnswers / totalCompleted) * 100) : 0;

    const completedCategories = Array.from(new Set(records.map((r) => r.category)));
    const masteredCategories = records
      .filter((r) => r.isSafe)
      .map((r) => r.category);

    const needsImprovementAreas: SimulatorImprovementArea[] = [];
    const unsafeRecords = records.filter((r) => !r.isSafe);

    for (const record of unsafeRecords) {
      const scenario = scenarios.find((s) => s.id === record.scenarioId);
      if (scenario) {
        needsImprovementAreas.push({
          category: record.category,
          topicTitleEn: scenario.topicTitleEn,
          topicTitleHi: scenario.topicTitleHi,
          topicTitleMr: scenario.topicTitleMr,
          adviceEn: scenario.safeTipEn,
          adviceHi: scenario.safeTipHi,
          adviceMr: scenario.safeTipMr,
        });
      }
    }

    return {
      totalScenarios,
      totalCompleted,
      correctAnswers,
      accuracyPercentage,
      completedCategories,
      masteredCategories,
      needsImprovementAreas,
      isComplete: totalCompleted >= totalScenarios && totalScenarios > 0,
    };
  },

  async resetSimulatorProgress(): Promise<void> {
    await this.setPreference(PreferencesKeys.SCAM_SIMULATOR_COMPLETED_IDS, '[]');
    await this.setPreference(PreferencesKeys.SCAM_SIMULATOR_RESULTS, '[]');
  },

  // --- Dynamic User Profile & Session Methods ---
  getUserProfileKey(userId: string): string {
    const sanitized = (userId || 'anonymous').replace(/[^a-zA-Z0-9]/g, '_');
    return `rakshon_user_profile_${sanitized}`;
  },

  async getUserFullNameForUser(userId: string): Promise<string> {
    if (!userId) return '';
    const scopedKey = this.getUserProfileKey(userId);
    const scopedName = await this.getPreference(scopedKey, '');
    if (scopedName) return scopedName;
    return this.getPreference(PreferencesKeys.USER_FULL_NAME, '');
  },

  async setUserFullNameForUser(userId: string, name: string): Promise<void> {
    const trimmed = name ? name.trim() : '';
    if (userId) {
      const scopedKey = this.getUserProfileKey(userId);
      await this.setPreference(scopedKey, trimmed);
    }
    await this.setPreference(PreferencesKeys.USER_FULL_NAME, trimmed);
  },

  async getUserFullName(): Promise<string> {
    const userPhone = await this.getSecureCredential(SecureKeys.USER_PHONE_HASH);
    if (userPhone) {
      const scopedName = await this.getPreference(this.getUserProfileKey(userPhone), '');
      if (scopedName !== undefined && scopedName !== '') {
        return scopedName;
      }
    }
    return this.getPreference(PreferencesKeys.USER_FULL_NAME, '');
  },

  async setUserFullName(name: string): Promise<void> {
    const trimmed = name ? name.trim() : '';
    const userPhone = await this.getSecureCredential(SecureKeys.USER_PHONE_HASH);
    if (userPhone) {
      await this.setPreference(this.getUserProfileKey(userPhone), trimmed);
    }
    await this.setPreference(PreferencesKeys.USER_FULL_NAME, trimmed);
  },

  async hasActiveSession(): Promise<boolean> {
    const phone = await this.getSecureCredential(SecureKeys.USER_PHONE_HASH);
    return Boolean(phone);
  },

  async clearUserSession(): Promise<void> {
    await this.clearSecureCredentials();
    await this.setPreference(PreferencesKeys.USER_FULL_NAME, '');
  },

  // --- Banking & UPI Practice Sandbox ---
  async getBankingSandboxStats(): Promise<BankingSandboxStats> {
    const raw = await this.getPreference(PreferencesKeys.BANKING_SANDBOX_STATS, '');
    if (!raw) {
      return {
        totalScenarios: 4,
        completedScenarios: 0,
        correctAnswers: 0,
        accuracyPercentage: 0,
        isComplete: false,
        records: [],
      };
    }
    try {
      return JSON.parse(raw) as BankingSandboxStats;
    } catch {
      return {
        totalScenarios: 4,
        completedScenarios: 0,
        correctAnswers: 0,
        accuracyPercentage: 0,
        isComplete: false,
        records: [],
      };
    }
  },

  async recordBankingSandboxAnswer(
    scenarioId: string,
    category: string,
    choiceId: string,
    isSafe: boolean
  ): Promise<BankingSandboxStats> {
    const stats = await this.getBankingSandboxStats();
    const existingFiltered = stats.records.filter((r) => r.scenarioId !== scenarioId);
    existingFiltered.push({
      scenarioId,
      category,
      choiceId,
      isSafe,
      timestamp: new Date().toISOString(),
    });

    const totalScenarios = 4;
    const completedScenarios = existingFiltered.length;
    const correctAnswers = existingFiltered.filter((r) => r.isSafe).length;
    const accuracyPercentage =
      completedScenarios > 0 ? Math.round((correctAnswers / completedScenarios) * 100) : 0;
    const isComplete = completedScenarios >= totalScenarios;

    const newStats: BankingSandboxStats = {
      totalScenarios,
      completedScenarios,
      correctAnswers,
      accuracyPercentage,
      isComplete,
      lastAttemptTimestamp: new Date().toISOString(),
      records: existingFiltered,
    };

    await this.setPreference(
      PreferencesKeys.BANKING_SANDBOX_STATS,
      JSON.stringify(newStats)
    );
    return newStats;
  },

  async resetBankingSandboxStats(): Promise<void> {
    await this.setPreference(PreferencesKeys.BANKING_SANDBOX_STATS, '');
  },

  // --- Audio-Visual Learning Centre ---
  async getAudioVisualProgress(): Promise<AudioVisualLearningStats> {
    const raw = await this.getPreference(PreferencesKeys.AUDIO_VISUAL_PROGRESS);
    if (!raw) {
      return {
        totalModules: 8,
        completedCount: 0,
        modules: {},
      };
    }
    try {
      return JSON.parse(raw) as AudioVisualLearningStats;
    } catch {
      return {
        totalModules: 8,
        completedCount: 0,
        modules: {},
      };
    }
  },

  async saveAudioVisualModuleProgress(
    moduleId: string,
    lastSlideIndex: number,
    isCompleted: boolean,
    quizScore: number = 0
  ): Promise<AudioVisualLearningStats> {
    const stats = await this.getAudioVisualProgress();
    const existing = stats.modules[moduleId] || {
      moduleId,
      quizScore: 0,
      isCompleted: false,
      lastSlideIndex: 0,
    };

    const newlyCompleted = isCompleted || existing.isCompleted;
    stats.modules[moduleId] = {
      moduleId,
      lastSlideIndex,
      isCompleted: newlyCompleted,
      quizScore: Math.max(existing.quizScore, quizScore),
      completedAt: newlyCompleted ? (existing.completedAt || new Date().toISOString()) : undefined,
    };

    stats.lastActiveModuleId = moduleId;
    stats.completedCount = Object.values(stats.modules).filter((m) => m.isCompleted).length;

    await this.setPreference(
      PreferencesKeys.AUDIO_VISUAL_PROGRESS,
      JSON.stringify(stats)
    );
    return stats;
  },

  async resetAudioVisualProgress(): Promise<void> {
    await this.setPreference(PreferencesKeys.AUDIO_VISUAL_PROGRESS, '');
  },

  // --- Safe-Browsing Simulator ---
  async getSafeBrowsingStats(): Promise<SafeBrowsingStats> {
    const raw = await this.getPreference(PreferencesKeys.SAFE_BROWSING_STATS);
    if (!raw) {
      return {
        totalScenarios: 4,
        completedScenarios: 0,
        correctAnswers: 0,
        accuracyPercentage: 0,
        isComplete: false,
        records: [],
      };
    }
    try {
      return JSON.parse(raw) as SafeBrowsingStats;
    } catch {
      return {
        totalScenarios: 4,
        completedScenarios: 0,
        correctAnswers: 0,
        accuracyPercentage: 0,
        isComplete: false,
        records: [],
      };
    }
  },

  async recordSafeBrowsingAnswer(
    scenarioId: string,
    domain: string,
    choiceId: string,
    isSafe: boolean
  ): Promise<SafeBrowsingStats> {
    const stats = await this.getSafeBrowsingStats();
    const existing = stats.records.filter((r) => r.scenarioId !== scenarioId);
    existing.push({
      scenarioId,
      domain,
      choiceId,
      isSafe,
      timestamp: new Date().toISOString(),
    });

    const totalScenarios = 4;
    const completedScenarios = existing.length;
    const correctAnswers = existing.filter((r) => r.isSafe).length;
    const accuracyPercentage =
      completedScenarios > 0 ? Math.round((correctAnswers / completedScenarios) * 100) : 0;
    const isComplete = completedScenarios >= totalScenarios;

    const newStats: SafeBrowsingStats = {
      totalScenarios,
      completedScenarios,
      correctAnswers,
      accuracyPercentage,
      isComplete,
      records: existing,
    };

    await this.setPreference(
      PreferencesKeys.SAFE_BROWSING_STATS,
      JSON.stringify(newStats)
    );
    return newStats;
  },

  async resetSafeBrowsingStats(): Promise<void> {
    await this.setPreference(PreferencesKeys.SAFE_BROWSING_STATS, '');
  },

  // --- Caregiver Dashboard & Consent ---
  async getCaregiverPermissions(): Promise<CaregiverPermissionSettings> {
    const raw = await this.getPreference(PreferencesKeys.CAREGIVER_PERMISSIONS);
    if (!raw) {
      return {
        shareLearningProgress: true,
        shareSecurityStatus: true,
        shareHighRiskAlerts: true,
        consentGrantedAt: null,
      };
    }
    try {
      return JSON.parse(raw) as CaregiverPermissionSettings;
    } catch {
      return {
        shareLearningProgress: true,
        shareSecurityStatus: true,
        shareHighRiskAlerts: true,
        consentGrantedAt: null,
      };
    }
  },

  async setCaregiverPermissions(settings: CaregiverPermissionSettings): Promise<void> {
    await this.setPreference(
      PreferencesKeys.CAREGIVER_PERMISSIONS,
      JSON.stringify(settings)
    );
  },

  async getCaregiverAlertsLog(): Promise<CaregiverSafetyAlert[]> {
    const raw = await this.getPreference(PreferencesKeys.CAREGIVER_ALERTS_LOG);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CaregiverSafetyAlert[];
    } catch {
      return [];
    }
  },

  async recordCaregiverAlert(
    category: string,
    title: string,
    riskLevel: 'HIGH' | 'CRITICAL' | 'MEDIUM',
    description: string
  ): Promise<CaregiverSafetyAlert[]> {
    const logs = await this.getCaregiverAlertsLog();
    const newAlert: CaregiverSafetyAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      category,
      title,
      riskLevel,
      description,
    };
    const updated = [newAlert, ...logs].slice(0, 20); // Keep last 20 alerts
    await this.setPreference(PreferencesKeys.CAREGIVER_ALERTS_LOG, JSON.stringify(updated));
    return updated;
  },

  // --- Secure Credentials ---
  async setSecureCredential(key: string, value: string): Promise<void> {
    // Strict Guardrail: Refuse to store OTPs, PINs, or passwords
    for (const pattern of FORBIDDEN_STORAGE_KEYS) {
      if (pattern.test(key) || pattern.test(value)) {
        throw new SecurityViolationError(
          `Privacy Violation: ScamShield policy forbids storing OTPs, PINs, or passwords.`
        );
      }
    }

    secureCache.set(key, obfuscate(value));
  },

  async getSecureCredential(key: string): Promise<string | null> {
    const obfuscated = secureCache.get(key);
    if (!obfuscated) return null;
    try {
      return deobfuscate(obfuscated);
    } catch {
      return null;
    }
  },

  async clearSecureCredentials(): Promise<void> {
    secureCache.clear();
  },

  // For test isolation
  _resetAllForTesting(): void {
    preferencesCache.clear();
    secureCache.clear();
  },
};

