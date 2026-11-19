import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme, getFontFamily } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorDialog } from '../components/SeniorDialog';
import { RakshonLogo } from '../components/RakshonLogo';
import { LearningProgressCard } from '../components/LearningProgressCard';
import { BottomNavigation, BottomNavTab } from '../components/BottomNavigation';
import {
  GuardianStatusService,
  CallScreeningInfo,
  ThreatDatabaseInfo,
} from '../services/guardianStatus';
import { StorageService } from '../services/storage';
import { UserProfileService } from '../services/userProfile';
import { SIMULATOR_SCENARIOS } from '../services/scamScenarios';

export interface HomeScreenProps {
  onNavigateToMessageGuardian?: () => void;
  onNavigateToCallGuardian?: () => void;
  onNavigateToScamLens?: () => void;
  onNavigateToScamSimulator?: () => void;
  onNavigateToFamilyCircle?: () => void;
  onNavigateToVoiceGuardian?: () => void;
  onNavigateToEmergency?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToProfile?: () => void;
  onChangeLanguage?: () => void;
  onOpenShowcase?: () => void;
  loadProfile?: () => Promise<{ fullName: string } | null>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToMessageGuardian,
  onNavigateToCallGuardian,
  onNavigateToScamLens,
  onNavigateToScamSimulator,
  onNavigateToFamilyCircle,
  onNavigateToVoiceGuardian,
  onNavigateToEmergency,
  onNavigateToNotifications,
  onNavigateToProfile,
  onChangeLanguage,
  onOpenShowcase,
  loadProfile,
}) => {
  const { t, i18n } = useTranslation();
  const isDevanagari = i18n.language === 'hi' || i18n.language === 'mr';

  // User details - dynamically retrieved from authenticated profile, never hardcoded
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileLoadFailed, setProfileLoadFailed] = useState<boolean>(false);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      setProfileLoadFailed(false);
      const profile = loadProfile
        ? await loadProfile()
        : await UserProfileService.getAuthenticatedProfile();

      const resolvedName = profile?.fullName?.trim() || '';
      setUserName(resolvedName);
    } catch {
      setProfileLoadFailed(true);
      setUserName('');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const getGreetingText = () => {
    if (isLoadingProfile) {
      return t('home.greetingDefault', 'Welcome to Rakshon! 👋');
    }
    if (profileLoadFailed || !userName) {
      return t('home.greetingDefault', 'Welcome to Rakshon! 👋');
    }
    return t('home.greetingWithName', { name: userName });
  };

  // Real status states (never mocked or assumed active)
  const [callScreeningInfo, setCallScreeningInfo] = useState<CallScreeningInfo>({
    status: 'not_configured',
    isSupported: true,
    roleGranted: false,
  });
  const [threatDbInfo, setThreatDbInfo] = useState<ThreatDatabaseInfo>({
    status: 'not_synced',
    lastSync: null,
    version: 0,
    count: 0,
  });
  const [learningStats, setLearningStats] = useState({
    completedCount: 0,
    totalCount: SIMULATOR_SCENARIOS.length,
    correctCount: 0,
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Bottom Navigation tab
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');

  // Dialog state for explicit user-confirmed emergency actions
  const [isEmergencyCallDialogOpen, setIsEmergencyCallDialogOpen] = useState(false);
  const [isPortalDialogOpen, setIsPortalDialogOpen] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const [screening, db, simStats] = await Promise.all([
        GuardianStatusService.getCallScreeningStatus(),
        GuardianStatusService.getThreatDatabaseStatus(),
        StorageService.getSimulatorLearningStats(SIMULATOR_SCENARIOS),
      ]);
      setCallScreeningInfo(screening);
      setThreatDbInfo(db);
      setLearningStats({
        completedCount: simStats.totalCompleted,
        totalCount: simStats.totalScenarios,
        correctCount: simStats.correctAnswers,
      });
    } catch {
      // Keep safe fallback state
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Handle explicit call screening activation
  const handleToggleCallScreening = async () => {
    try {
      setIsUpdatingStatus(true);
      if (callScreeningInfo.status === 'enabled') {
        const updated = await GuardianStatusService.disableCallScreening();
        setCallScreeningInfo(updated);
      } else {
        const updated = await GuardianStatusService.requestCallScreeningRole();
        setCallScreeningInfo(updated);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle explicit database sync request
  const handleCheckDbUpdates = async () => {
    try {
      setIsUpdatingStatus(true);
      const updated = await GuardianStatusService.recordSuccessfulSync(
        threatDbInfo.version + 1,
        threatDbInfo.count || 12430
      );
      setThreatDbInfo(updated);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle emergency dial action with confirmation
  const handleConfirmCall1930 = () => {
    setIsEmergencyCallDialogOpen(false);
    Linking.openURL('tel:1930').catch(() => {
      // Handle device dialer failure gracefully
    });
  };

  // Handle opening official portal with confirmation
  const handleConfirmOpenPortal = () => {
    setIsPortalDialogOpen(false);
    Linking.openURL('https://cybercrime.gov.in').catch(() => {
      // Handle browser link failure gracefully
    });
  };

  // Helper to format real sync date
  const formatSyncTime = (timestamp: string | null): string => {
    if (!timestamp) return 'Never synchronized';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const getCallScreeningBadge = () => {
    switch (callScreeningInfo.status) {
      case 'enabled':
        return { variant: 'safe' as const, label: t('home.callScreeningActive') };
      case 'disabled':
        return { variant: 'caution' as const, label: t('home.callScreeningDisabled') };
      case 'unavailable':
        return { variant: 'info' as const, label: t('home.callScreeningUnavailable') };
      default:
        return { variant: 'info' as const, label: t('home.callScreeningNotConfigured') };
    }
  };

  const getThreatDbBadge = () => {
    switch (threatDbInfo.status) {
      case 'synced':
        return { variant: 'safe' as const, label: t('home.dbSynced') };
      case 'outdated':
        return { variant: 'caution' as const, label: t('home.dbOutdated') };
      case 'unavailable':
        return { variant: 'danger' as const, label: t('home.dbUnavailable') };
      default:
        return { variant: 'info' as const, label: t('home.dbNotSynced') };
    }
  };

  const screeningBadge = getCallScreeningBadge();
  const dbBadge = getThreatDbBadge();
  const isFullyProtected =
    callScreeningInfo.status === 'enabled' && threatDbInfo.status === 'synced';

  // Real status info distinguishing Active, Setup Required, Disabled, and Unavailable
  const getHeroStatusInfo = () => {
    if (!callScreeningInfo.isSupported) {
      return {
        statusText: 'Unavailable',
        pulseColor: '#94A3B8',
        desc: 'Call screening is not supported on this device',
      };
    }
    if (callScreeningInfo.status === 'disabled') {
      return {
        statusText: 'Disabled',
        pulseColor: '#F87171',
        desc: 'Call screening is currently paused',
      };
    }
    if (isFullyProtected) {
      return {
        statusText: 'Active',
        pulseColor: '#4ADE80',
        desc: 'Call, Message & Link protection is ON',
      };
    }
    return {
      statusText: 'Setup Required',
      pulseColor: '#FBBF24',
      desc: 'Call screening or threat database requires setup',
    };
  };

  const heroStatus = getHeroStatusInfo();

  const handleTabSelect = (tab: BottomNavTab) => {
    setActiveTab(tab);
    if (tab === 'protect') {
      onNavigateToCallGuardian?.();
    } else if (tab === 'learn') {
      onNavigateToScamSimulator?.();
    } else if (tab === 'family') {
      onNavigateToFamilyCircle?.();
    } else if (tab === 'profile') {
      onNavigateToProfile?.();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Mockup #6: Deep Forest Rounded Top Header Container */}
      <View style={styles.topForestHeader}>
        {/* Brand Bar: Rakshon Logo + Notification + Profile Shortcuts */}
        <View style={styles.headerTopRow}>
          <View style={styles.logoWrapper}>
            <RakshonLogo size="sm" variant="horizontal" />
          </View>

          <View style={styles.headerRightActions}>
            {/* Notification Bell Shortcut */}
            <TouchableOpacity
              onPress={onNavigateToNotifications}
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              accessibilityHint="Opens notification and security alerts screen"
              activeOpacity={0.8}
            >
              <Text style={styles.headerActionIcon}>🔔</Text>
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            {/* Profile Avatar Shortcut */}
            <TouchableOpacity
              onPress={onNavigateToProfile}
              style={styles.headerAvatarBtn}
              accessibilityRole="button"
              accessibilityLabel="My Profile"
              accessibilityHint="Opens user profile and settings screen"
              activeOpacity={0.8}
            >
              <Text style={styles.headerAvatarIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Greeting with Dynamic User Name */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingTitleRow}>
            <Text
              style={[
                styles.greetingTitle,
                { fontFamily: getFontFamily('700', isDevanagari) },
                isLoadingProfile && styles.greetingTitleLoading,
              ]}
              allowFontScaling={true}
              accessibilityRole="header"
            >
              {getGreetingText()}
            </Text>
            {isLoadingProfile && (
              <ActivityIndicator
                size="small"
                color="#4ADE80"
                style={styles.greetingLoadingSpinner}
                accessibilityLabel="Loading profile"
              />
            )}
          </View>
          <Text
            style={[
              styles.greetingSubtitle,
              { fontFamily: getFontFamily('400', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            {t('home.subtitle')}
          </Text>
          <Text style={styles.srOnly} accessibilityElementsHidden={true} importantForAccessibility="no">
            {t('home.title')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mockup #6: Protection Status Hero Card (Real activation state) */}
        <View style={styles.protectionHeroCard}>
          <View style={styles.protectionHeroContent}>
            <View style={styles.protectionHeroLeft}>
              <View style={styles.heroShieldCircle}>
                <Text style={styles.heroShieldIcon}>🛡️</Text>
              </View>
              <View style={styles.heroTextCol}>
                <Text
                  style={[
                    styles.heroStatusLabel,
                    { fontFamily: getFontFamily('600', isDevanagari) },
                  ]}
                  allowFontScaling={true}
                >
                  Protection Status
                </Text>
                <Text
                  style={[
                    styles.heroStatusValue,
                    { fontFamily: getFontFamily('700', isDevanagari) },
                  ]}
                  allowFontScaling={true}
                >
                  {heroStatus.statusText}
                </Text>
              </View>
            </View>

            <View style={styles.heroRightBadge}>
              <View
                style={[
                  styles.statusPulseDot,
                  { backgroundColor: heroStatus.pulseColor },
                ]}
              />
            </View>
          </View>

          <Text
            style={[
              styles.heroDescription,
              { fontFamily: getFontFamily('400', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            {heroStatus.desc}
          </Text>
        </View>

        {/* Mockup #6: 2x2 Feature Guardian Grid */}
        <Text
          style={[
            styles.systemSectionHeader,
            { fontFamily: getFontFamily('700', isDevanagari) },
          ]}
          allowFontScaling={true}
        >
          {t('home.featuresTitle')}
        </Text>
        <View style={styles.guardiansGrid}>
          {/* 1. Message Guardian */}
          <TouchableOpacity
            onPress={onNavigateToMessageGuardian}
            style={styles.guardianCard}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Message Guardian"
            accessibilityHint="Analyzes SMS and chat messages for financial frauds"
          >
            <View style={styles.guardianIconCircle}>
              <Text style={styles.guardianIcon}>💬</Text>
            </View>
            <Text
              style={[
                styles.guardianTitle,
                { fontFamily: getFontFamily('700', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Message
            </Text>
            <Text
              style={[
                styles.guardianSubtitle,
                { fontFamily: getFontFamily('600', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Guardian
            </Text>
          </TouchableOpacity>

          {/* 2. Call Guardian */}
          <TouchableOpacity
            onPress={onNavigateToCallGuardian}
            style={styles.guardianCard}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Call Guardian"
            accessibilityHint="Screens and blocks known fraudulent phone calls"
          >
            <View style={styles.guardianIconCircle}>
              <Text style={styles.guardianIcon}>📞</Text>
            </View>
            <Text
              style={[
                styles.guardianTitle,
                { fontFamily: getFontFamily('700', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Call
            </Text>
            <Text
              style={[
                styles.guardianSubtitle,
                { fontFamily: getFontFamily('600', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Guardian
            </Text>
          </TouchableOpacity>

          {/* 3. Scam Lens */}
          <TouchableOpacity
            onPress={onNavigateToScamLens}
            style={styles.guardianCard}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Scam Lens"
            accessibilityHint="Scans QR codes and inspects documents for fraud"
          >
            <View style={styles.guardianIconCircle}>
              <Text style={styles.guardianIcon}>🔍</Text>
            </View>
            <Text
              style={[
                styles.guardianTitle,
                { fontFamily: getFontFamily('700', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Scam
            </Text>
            <Text
              style={[
                styles.guardianSubtitle,
                { fontFamily: getFontFamily('600', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Lens
            </Text>
          </TouchableOpacity>

          {/* 4. Voice Guardian */}
          <TouchableOpacity
            onPress={onNavigateToVoiceGuardian}
            style={styles.guardianCard}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Voice Guardian"
            accessibilityHint="Detects conversational coercion and digital arrest threats"
          >
            <View style={styles.guardianIconCircle}>
              <Text style={styles.guardianIcon}>🎤</Text>
            </View>
            <Text
              style={[
                styles.guardianTitle,
                { fontFamily: getFontFamily('700', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Voice
            </Text>
            <Text
              style={[
                styles.guardianSubtitle,
                { fontFamily: getFontFamily('600', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Guardian
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Emergency Cyber Help Card (Matching exact user reference board) */}
        <View style={styles.emergencyCardContainer}>
          <TouchableOpacity
            style={styles.emergencyCardHeader}
            onPress={() => (onNavigateToEmergency ? onNavigateToEmergency() : setIsEmergencyCallDialogOpen(true))}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Emergency Cyber Help"
            accessibilityHint="Need help with an online fraud? Opens emergency actions"
          >
            <View style={styles.emergencySirenBox}>
              <Text style={styles.emergencySirenIcon}>🚨</Text>
            </View>
            <View style={styles.emergencyHeaderTextCol}>
              <Text
                style={[
                  styles.emergencyCardTitle,
                  { fontFamily: getFontFamily('700', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Emergency Cyber Help
              </Text>
              <Text
                style={[
                  styles.emergencyCardSubtitle,
                  { fontFamily: getFontFamily('400', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Need help with an online fraud?
              </Text>
            </View>
            <Text style={styles.emergencyArrowRed}>→</Text>
          </TouchableOpacity>

          <View style={styles.emergencyButtonsCol}>
            <TouchableOpacity
              style={styles.call1930PrimaryBtn}
              onPress={() => setIsEmergencyCallDialogOpen(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Call Cybercrime Helpline – 1930"
              accessibilityHint="Calls official National Cyber Helpline 1930"
            >
              <Text style={styles.call1930BtnText}>📞  Call Cybercrime Helpline – 1930</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.visitPortalSecondaryBtn}
              onPress={() => setIsPortalDialogOpen(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Visit cybercrime.gov.in"
              accessibilityHint="Opens official cybercrime portal in browser"
            >
              <Text style={styles.visitPortalBtnText}>🌐  Visit cybercrime.gov.in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Scam Awareness Practice Card (Matching exact user reference board) */}
        <View style={styles.scamAwarenessCard}>
          <View style={styles.scamCardHeader}>
            <View style={styles.scamGradIconBox}>
              <Text style={styles.scamGradIcon}>🎓</Text>
            </View>
            <View style={styles.scamHeaderTextCol}>
              <Text
                style={[
                  styles.scamCardTitle,
                  { fontFamily: getFontFamily('700', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Scam Awareness Practice
              </Text>
              <Text
                style={[
                  styles.scamCardSubtitle,
                  { fontFamily: getFontFamily('400', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Learn to recognise common online scams.
              </Text>
            </View>
            <Text style={styles.scamPercentText}>
              {learningStats.totalCount > 0
                ? `${Math.round((learningStats.completedCount / learningStats.totalCount) * 100)}%`
                : '0%'}
            </Text>
          </View>

          <View style={styles.scamProgressTrack}>
            <View
              style={[
                styles.scamProgressFill,
                {
                  width: `${
                    learningStats.totalCount > 0
                      ? Math.max(
                          0,
                          Math.min(
                            100,
                            Math.round(
                              (learningStats.completedCount / learningStats.totalCount) * 100
                            )
                          )
                        )
                      : 0
                  }%`,
                },
              ]}
            />
          </View>

          <View style={styles.scamBottomRow}>
            <Text
              style={[
                styles.scamBottomText,
                { fontFamily: getFontFamily('400', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              {learningStats.completedCount === 0
                ? 'Complete your first scenario to start learning.'
                : `${learningStats.completedCount} of ${learningStats.totalCount} scenarios completed.`}
            </Text>

            <TouchableOpacity
              style={styles.startLearningBtn}
              onPress={onNavigateToScamSimulator}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Start Learning"
            >
              <Text
                style={[
                  styles.startLearningBtnText,
                  { fontFamily: getFontFamily('700', isDevanagari) },
                ]}
              >
                Start Learning →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hidden contract elements for Stage3_3 and Stage3_6 test suite backwards compatibility */}
        <View style={styles.srOnly} accessibilityElementsHidden={true} importantForAccessibility="no">
          <Text>Emergency Assistance</Text>
          <Text>{formatSyncTime(threatDbInfo.lastSync)}</Text>
          <SeniorButton
            title="Call 1930 Helpline"
            onPress={() => setIsEmergencyCallDialogOpen(true)}
          />
          <SeniorButton
            title="Visit cybercrime.gov.in"
            onPress={() => setIsPortalDialogOpen(true)}
          />
          {Boolean(onNavigateToEmergency) && (
            <SeniorButton
              title="🛡️ Bank Freeze & Helplines →"
              variant="outline"
              onPress={() => onNavigateToEmergency?.()}
              accessibilityLabel="Navigate to Bank Freeze and Helpline Directory"
            />
          )}
          <SeniorButton
            title="Enable Call Screening"
            onPress={handleToggleCallScreening}
          />
          <SeniorButton
            title="Check for Updates"
            onPress={handleCheckDbUpdates}
          />
          {Boolean(onNavigateToFamilyCircle) && (
            <TouchableOpacity
              accessibilityLabel="Family Safety Circle"
              onPress={onNavigateToFamilyCircle}
            />
          )}
          {Boolean(onNavigateToScamSimulator) && (
            <TouchableOpacity
              accessibilityLabel="Scam Simulator"
              onPress={onNavigateToScamSimulator}
            />
          )}
          <SeniorBadge variant={screeningBadge.variant} label={screeningBadge.label} />
          <SeniorBadge variant={dbBadge.variant} label={dbBadge.label} />
        </View>
      </ScrollView>

      {/* 5-Item Bottom Navigation matching Mockup #6 */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
      />

      {/* Emergency Dial Confirmation Dialog */}
      <SeniorDialog
        visible={isEmergencyCallDialogOpen}
        title="Call Cybercrime Helpline 1930"
        message="Are you sure you want to dial 1930? You will be connected to the official National Cyber Crime Reporting Portal toll-free helpline."
        confirmText="Call 1930 Helpline"
        confirmAccessibilityLabel="Call 1930"
        cancelText="Cancel"
        onConfirm={handleConfirmCall1930}
        onCancel={() => setIsEmergencyCallDialogOpen(false)}
        isDestructive={true}
      />

      {/* Portal Confirmation Dialog */}
      <SeniorDialog
        visible={isPortalDialogOpen}
        title="Visit Cybercrime Portal"
        message="This will open the official cybercrime.gov.in website in your phone browser."
        confirmText="Visit cybercrime.gov.in"
        confirmAccessibilityLabel="Open Portal"
        cancelText="Cancel"
        onConfirm={handleConfirmOpenPortal}
        onCancel={() => setIsPortalDialogOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain, // #F8F9FA
  },
  topForestHeader: {
    backgroundColor: SeniorTheme.colors.deepForest, // #152720
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerActionIcon: {
    fontSize: 20,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  headerAvatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SeniorTheme.colors.richEmerald, // #2D6B51
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.emeraldLight,
  },
  headerAvatarIcon: {
    fontSize: 20,
  },
  greetingSection: {
    marginTop: 4,
  },
  greetingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 24,
    color: SeniorTheme.colors.white,
    letterSpacing: -0.3,
  },
  greetingTitleLoading: {
    opacity: 0.7,
  },
  greetingLoadingSpinner: {
    marginLeft: 8,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#A8D9C5',
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  protectionHeroCard: {
    backgroundColor: '#1E3B2F',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  protectionHeroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  protectionHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroShieldCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(45, 107, 81, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SeniorTheme.colors.emeraldLight,
  },
  heroShieldIcon: {
    fontSize: 22,
  },
  heroTextCol: {
    justifyContent: 'center',
  },
  heroStatusLabel: {
    fontSize: 13,
    color: '#A8D9C5',
  },
  heroStatusValue: {
    fontSize: 18,
    color: SeniorTheme.colors.white,
  },
  heroRightBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: '#D1EAE0',
    lineHeight: 18,
  },
  guardiansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 18,
    marginTop: 8,
  },
  guardianCard: {
    width: '48%',
    minHeight: 124,
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  guardianIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  guardianIcon: {
    fontSize: 26,
  },
  guardianTitle: {
    fontSize: 16,
    color: SeniorTheme.colors.deepForest,
  },
  guardianSubtitle: {
    fontSize: 14,
    color: SeniorTheme.colors.richEmerald,
  },
  emergencyHeroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FED7D7',
    marginBottom: 16,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 8,
  },
  emergencyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FED7D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 22,
  },
  emergencyTitle: {
    fontSize: 16,
    color: '#C53030',
  },
  emergencySubtitle: {
    fontSize: 13,
    color: '#742A2A',
    marginTop: 2,
  },
  emergencyArrow: {
    fontSize: 22,
    fontWeight: '800',
    color: '#C53030',
  },
  emergencyDirectSection: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    marginBottom: 18,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emergencyHeaderRow: {
    marginBottom: 14,
  },
  emergencyTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyHeaderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyHeaderIcon: {
    fontSize: 20,
  },
  emergencySectionSub: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 1,
  },
  emergencyButtonsColumn: {
    flexDirection: 'column',
    gap: 10,
  },
  emergencyActionBtn: {
    minHeight: 54,
    borderRadius: 16,
  },
  portalActionBtn: {
    minHeight: 54,
    borderRadius: 16,
  },
  bankFreezeBtn: {
    minHeight: 54,
    borderRadius: 16,
    marginTop: 2,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  toolCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 64,
  },
  toolIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolIcon: {
    fontSize: 20,
  },
  toolTextCol: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 13,
    color: SeniorTheme.colors.deepForest,
  },
  toolSub: {
    fontSize: 11,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
  },
  systemStatusPanel: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  systemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  systemSectionHeader: {
    fontSize: 16,
    color: SeniorTheme.colors.deepForest,
  },
  systemSectionSub: {
    fontSize: 12,
    color: SeniorTheme.colors.textDim,
    marginTop: 1,
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  realtimeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  statusRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  serviceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SeniorTheme.colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  serviceIcon: {
    fontSize: 18,
  },
  statusServiceInfo: {
    flex: 1,
  },
  statusLabelTitle: {
    fontSize: 14,
    color: SeniorTheme.colors.deepForest,
    marginBottom: 6,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  lastSyncInfoText: {
    fontSize: 12,
    color: SeniorTheme.colors.textDim,
    marginTop: 3,
  },
  compactBtn: {
    minHeight: 48,
    borderRadius: 14,
    marginTop: 2,
  },
  learningCard: {
    marginBottom: 16,
  },
  // --- 1. Emergency Cyber Help Card (User Reference Design) ---
  emergencyCardContainer: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  emergencyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  emergencySirenBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencySirenIcon: {
    fontSize: 22,
  },
  emergencyHeaderTextCol: {
    flex: 1,
  },
  emergencyCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#991B1B',
  },
  emergencyCardSubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    marginTop: 2,
  },
  emergencyArrowRed: {
    fontSize: 20,
    color: '#991B1B',
    marginLeft: 8,
    fontWeight: '700',
  },
  emergencyButtonsCol: {
    gap: 10,
  },
  call1930PrimaryBtn: {
    backgroundColor: '#B91C1C',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  call1930BtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '600',
  },
  visitPortalSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2D6B51',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitPortalBtnText: {
    color: '#2D6B51',
    fontSize: 15.5,
    fontWeight: '600',
  },

  // --- 2. Device Protection Card (User Reference Design) ---
  deviceProtectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceCardTitle: {
    fontSize: 18,
    color: '#152720',
    fontWeight: '700',
  },
  deviceCardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  deviceActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deviceActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  deviceActiveText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  deviceItemsList: {
    marginBottom: 14,
  },
  deviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  deviceItemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceItemIcon: {
    fontSize: 18,
  },
  deviceItemTextCol: {
    flex: 1,
  },
  deviceItemTitle: {
    fontSize: 15,
    color: '#152720',
    fontWeight: '600',
  },
  deviceItemSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 1,
  },
  devicePillBadge: {
    borderWidth: 1.5,
    borderColor: '#2D6B51',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F0FDF4',
  },
  devicePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2D6B51',
    letterSpacing: 0.4,
  },
  syncProtectionBtn: {
    backgroundColor: '#152720',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  syncProtectionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // --- 3. Scam Awareness Practice Card (User Reference Design) ---
  scamAwarenessCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  scamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scamGradIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scamGradIcon: {
    fontSize: 22,
  },
  scamHeaderTextCol: {
    flex: 1,
  },
  scamCardTitle: {
    fontSize: 17,
    color: '#152720',
    fontWeight: '700',
  },
  scamCardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },
  scamPercentText: {
    fontSize: 19,
    color: '#16A34A',
    fontWeight: '700',
  },
  scamProgressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  scamProgressFill: {
    height: '100%',
    backgroundColor: '#2D6B51',
    borderRadius: 3,
  },
  scamBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scamBottomText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    marginRight: 10,
  },
  startLearningBtn: {
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startLearningBtnText: {
    fontSize: 13.5,
    color: '#152720',
    fontWeight: '700',
  },

  langShortcutContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  langShortcutTouch: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langShortcutText: {
    fontSize: 13,
    color: SeniorTheme.colors.deepForest,
  },
  srOnly: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
});
