import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorButton } from '../components/SeniorButton';
import { StorageService, SecureKeys } from '../services/storage';

export interface ProfileScreenProps {
  onBack: () => void;
  onChangeLanguage: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onChangeLanguage,
  onLogout,
}) => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');

  // Modal sub-views
  const [activeModal, setActiveModal] = useState<
    'editProfile' | 'settings' | 'activity' | 'help' | 'about' | null
  >(null);

  // Edit profile form
  const [tempName, setTempName] = useState(userName);
  const [emergencyContact, setEmergencyContact] = useState('+91 98111 22334');

  // Settings state
  const [vibrationAlerts, setVibrationAlerts] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceAssistance, setVoiceAssistance] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      try {
        const [savedPhone, savedName] = await Promise.all([
          StorageService.getSecureCredential(SecureKeys.USER_PHONE_HASH),
          StorageService.getUserFullName(),
        ]);
        if (isMounted) {
          setUserPhone(savedPhone || '+91 98765 43210');
          const finalName = savedName?.trim() ? savedName.trim() : 'Rakshon User';
          setUserName(finalName);
          setTempName(finalName);
        }
      } catch {
        if (isMounted) {
          setUserPhone('+91 98765 43210');
          setUserName('Rakshon User');
        }
      }
    };
    loadUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    if (tempName.trim()) {
      await StorageService.setUserFullName(tempName.trim());
      setUserName(tempName.trim());
    }
    setActiveModal(null);
  };

  const handleLogout = async () => {
    await StorageService.clearUserSession();
    onLogout();
  };

  const menuItems = [
    {
      id: 'account',
      title: 'My Account',
      icon: '👤',
      action: () => setActiveModal('editProfile'),
    },
    {
      id: 'settings',
      title: 'App Settings',
      icon: '⚙️',
      action: () => setActiveModal('settings'),
    },
    {
      id: 'language',
      title: 'Language',
      icon: '🌐',
      subtext: 'English',
      action: onChangeLanguage,
    },
    {
      id: 'activity',
      title: 'My Activity',
      icon: '🕒',
      action: () => setActiveModal('activity'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: '❓',
      action: () => setActiveModal('help'),
    },
    {
      id: 'about',
      title: 'About Rakshon',
      icon: 'ℹ️',
      action: () => setActiveModal('about'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Header */}
      <SeniorHeader
        title="My Profile"
        onBack={onBack}
        accessibilityLabel="My Profile screen"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card with Circular Avatar & Edit Badge */}
        <View style={styles.userHeroSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <TouchableOpacity
              onPress={() => setActiveModal('editProfile')}
              style={styles.editBadgeTouch}
              accessibilityLabel="Edit profile"
            >
              <Text style={styles.editBadgeIcon}>✎</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userNameText}>{userName}</Text>
          <Text style={styles.userPhoneText}>{userPhone}</Text>
        </View>

        {/* Grouped Settings List matching Mockup #10 */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.action}
              style={[
                styles.menuItemRow,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBadge}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>

              <View style={styles.menuRight}>
                {Boolean(item.subtext) && (
                  <Text style={styles.menuSubtext}>{item.subtext}</Text>
                )}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button matching Mockup #10 */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Safe Privacy Disclaimer */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            🔒 Rakshon protects your privacy with local-first processing. No SMS or personal passwords are ever sent to cloud servers.
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={activeModal === 'editProfile'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                style={styles.modalTextInput}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Emergency Contact Number</Text>
              <TextInput
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                keyboardType="phone-pad"
                style={styles.modalTextInput}
              />
            </View>

            <SeniorButton
              title="Save Changes"
              onPress={handleSaveProfile}
              style={styles.modalActionBtn}
            />
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCancelTouch}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* App Settings Modal */}
      <Modal
        visible={activeModal === 'settings'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>App Settings</Text>

            <TouchableOpacity
              onPress={() => setVibrationAlerts(!vibrationAlerts)}
              style={styles.settingToggleRow}
            >
              <Text style={styles.settingLabel}>Vibration on Scam Detection</Text>
              <View style={[styles.togglePill, vibrationAlerts && styles.togglePillActive]}>
                <View style={[styles.toggleKnob, vibrationAlerts && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setHighContrast(!highContrast)}
              style={styles.settingToggleRow}
            >
              <Text style={styles.settingLabel}>High Contrast Mode</Text>
              <View style={[styles.togglePill, highContrast && styles.togglePillActive]}>
                <View style={[styles.toggleKnob, highContrast && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVoiceAssistance(!voiceAssistance)}
              style={styles.settingToggleRow}
            >
              <Text style={styles.settingLabel}>Speech Guidance (TTS)</Text>
              <View style={[styles.togglePill, voiceAssistance && styles.togglePillActive]}>
                <View style={[styles.toggleKnob, voiceAssistance && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            <SeniorButton
              title="Done"
              onPress={() => setActiveModal(null)}
              style={styles.modalActionBtn}
            />
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={activeModal === 'help'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <Text style={styles.helpText}>
              Need assistance? Our safety team and official national emergency services are here to protect you.
            </Text>

            <View style={styles.helpItem}>
              <Text style={styles.helpItemTitle}>National Cyber Helpline</Text>
              <Text style={styles.helpItemVal}>Dial 1930 (Toll Free • 24x7)</Text>
            </View>

            <View style={styles.helpItem}>
              <Text style={styles.helpItemTitle}>Official Crime Reporting</Text>
              <Text style={styles.helpItemVal}>https://cybercrime.gov.in</Text>
            </View>

            <SeniorButton
              title="Close"
              onPress={() => setActiveModal(null)}
              style={styles.modalActionBtn}
            />
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={activeModal === 'about'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>About Rakshon</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0 (Production)</Text>
            <Text style={styles.helpText}>
              Rakshon is a senior-first digital safety companion engineered for Indian citizens. Powered by AI threat detection, local Android Call Screening, offline threat database, and instant 1930 integration.
            </Text>
            <SeniorButton
              title="Close"
              onPress={() => setActiveModal(null)}
              style={styles.modalActionBtn}
            />
          </View>
        </View>
      </Modal>

      {/* Activity Modal */}
      <Modal
        visible={activeModal === 'activity'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>My Safety Activity</Text>
            <View style={styles.activityStatsRow}>
              <View style={styles.activityStatBox}>
                <Text style={styles.statNum}>14</Text>
                <Text style={styles.statLabel}>Messages Verified</Text>
              </View>
              <View style={styles.activityStatBox}>
                <Text style={styles.statNum}>23</Text>
                <Text style={styles.statLabel}>Scam Calls Filtered</Text>
              </View>
            </View>
            <SeniorButton
              title="Close"
              onPress={() => setActiveModal(null)}
              style={styles.modalActionBtn}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userHeroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1E3B2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#A8D9C5',
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarIcon: {
    fontSize: 44,
  },
  editBadgeTouch: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D6B51',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  userPhoneText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 56,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#152720',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuSubtext: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  privacyNote: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  privacyNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#152720',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: '#152720',
    fontWeight: '600',
  },
  modalActionBtn: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 14,
  },
  modalCancelTouch: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  settingToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#152720',
  },
  togglePill: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    padding: 3,
  },
  togglePillActive: {
    backgroundColor: '#2D6B51',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  helpText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutVersion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6B51',
    textAlign: 'center',
    marginBottom: 12,
  },
  helpItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#152720',
  },
  helpItemVal: {
    fontSize: 13,
    color: '#2D6B51',
    fontWeight: '600',
    marginTop: 2,
  },
  activityStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  activityStatBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNum: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2D6B51',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});

