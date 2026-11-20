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
  const { t, i18n } = useTranslation();
  const isDevanagari = i18n?.language === 'hi' || i18n?.language === 'mr';
  const isMarathi = i18n?.language === 'mr';
  const isHindi = i18n?.language === 'hi';
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
  const [darkMode, setDarkMode] = useState(false);

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
      title: isMarathi ? 'माझे खाते' : isDevanagari ? 'मेरा खाता' : 'My Account',
      icon: '👤',
      action: () => setActiveModal('editProfile'),
    },
    {
      id: 'settings',
      title: isMarathi ? 'अॅप सेटिंग्ज' : isDevanagari ? 'ऐप सेटिंग्स' : 'App Settings',
      icon: '⚙️',
      action: () => setActiveModal('settings'),
    },
    {
      id: 'language',
      title: isMarathi ? 'भाषा' : isDevanagari ? 'भाषा' : 'Language',
      icon: '🌐',
      subtext: isMarathi ? 'मराठी' : isHindi ? 'हिंदी' : 'English',
      action: onChangeLanguage,
    },
    {
      id: 'activity',
      title: isMarathi ? 'माझी कृती' : isDevanagari ? 'मेरी गतिविधि' : 'My Activity',
      icon: '🕒',
      action: () => setActiveModal('activity'),
    },
    {
      id: 'help',
      title: isMarathi ? 'मदत आणि पाठिंबा' : isDevanagari ? 'मदद और सहायता' : 'Help & Support',
      icon: '❓',
      action: () => setActiveModal('help'),
    },
    {
      id: 'about',
      title: isMarathi ? 'रक्षणबद्दल' : isDevanagari ? 'रक्षण के बारे में' : 'About Rakshon',
      icon: 'ℹ️',
      action: () => setActiveModal('about'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Header */}
      <SeniorHeader
        title={isMarathi ? 'माझी प्रोफाइल' : isDevanagari ? 'मेरी प्रोफ़ाइल' : 'My Profile'}
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

          <Text style={styles.userNameText}>
            {userName && userName !== 'Rakshon User'
              ? userName
              : isMarathi
              ? 'रक्षण वापरकर्ता'
              : isDevanagari
              ? 'रक्षण उपयोगकर्ता'
              : 'Rakshon User'}
          </Text>
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
          <Text style={styles.logoutText}>
            {isMarathi ? 'लॉगआउट' : isDevanagari ? 'लॉगआउट' : 'Logout'}
          </Text>
        </TouchableOpacity>

        {/* Safe Privacy Disclaimer */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            {isMarathi
              ? '🔒 रक्षण स्थानिक-प्रथम तंत्रज्ञानासह आपल्या गोपनीयतेचे रक्षण करते. कोणताही एसएमएस किंवा वैयक्तिक पासवर्ड कधीही क्लाउड सर्व्हरवर पाठवला जात नाही.'
              : isDevanagari
              ? '🔒 रक्षण स्थानीय-प्रथम तकनीक के साथ आपकी गोपनीयता की रक्षा करता है। कोई भी एसएमएस या व्यक्तिगत पासवर्ड कभी भी क्लाउड सर्वर पर नहीं भेजा जाता है।'
              : '🔒 Rakshon protects your privacy with local-first processing. No SMS or personal passwords are ever sent to cloud servers.'}
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
            <Text style={styles.modalTitle}>
              {isMarathi ? 'प्रोफाइल संपादित करा' : isDevanagari ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>
                {isMarathi ? 'पूर्ण नाव' : isDevanagari ? 'पूरा नाम' : 'Full Name'}
              </Text>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                style={styles.modalTextInput}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>
                {isMarathi ? 'आपत्कालीन संपर्क क्रमांक' : isDevanagari ? 'आपातकालीन संपर्क नंबर' : 'Emergency Contact Number'}
              </Text>
              <TextInput
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                keyboardType="phone-pad"
                style={styles.modalTextInput}
              />
            </View>

            <SeniorButton
              title={isMarathi ? 'बदल जतन करा' : isDevanagari ? 'बदलाव सहेजें' : 'Save Changes'}
              onPress={handleSaveProfile}
              style={styles.modalActionBtn}
            />
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={styles.modalCancelTouch}
            >
              <Text style={styles.modalCancelText}>
                {isMarathi ? 'रद्द करा' : isDevanagari ? 'रद्द करें' : 'Cancel'}
              </Text>
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
            <Text style={styles.modalTitle}>
              {isMarathi ? 'अॅप सेटिंग्ज' : isDevanagari ? 'ऐप सेटिंग्स' : 'App Settings'}
            </Text>

            <TouchableOpacity
              onPress={() => setVibrationAlerts(!vibrationAlerts)}
              style={styles.settingToggleRow}
            >
              <Text style={styles.settingLabel}>
                {isMarathi ? 'स्कॅम आढळल्यास कंपन' : isDevanagari ? 'स्कैम का पता चलने पर कंपन' : 'Vibration on Scam Detection'}
              </Text>
              <View style={[styles.togglePill, vibrationAlerts && styles.togglePillActive]}>
                <View style={[styles.toggleKnob, vibrationAlerts && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setHighContrast(!highContrast)}
              style={styles.settingToggleRow}
            >
              <Text style={styles.settingLabel}>
                {isMarathi ? 'हाय कॉन्ट्रास्ट मोड' : isDevanagari ? 'उच्च कंट्रास्ट मोड' : 'High Contrast Mode'}
              </Text>
              <View style={[styles.togglePill, highContrast && styles.togglePillActive]}>
                <View style={[styles.toggleKnob, highContrast && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDarkMode(!darkMode)}
              style={styles.settingToggleRow}
            >
              <Text style={styles.settingLabel}>
                {isMarathi ? 'डार्क मोड' : isDevanagari ? 'डार्क मोड' : 'Dark Mode'}
              </Text>
              <View style={[styles.togglePill, darkMode && styles.togglePillActive]}>
                <View style={[styles.toggleKnob, darkMode && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            <SeniorButton
              title={isMarathi ? 'पूर्ण' : isDevanagari ? 'पूर्ण' : 'Done'}
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
            <Text style={styles.modalTitle}>
              {isMarathi ? 'मदत आणि पाठिंबा' : isDevanagari ? 'मदद और सहायता' : 'Help & Support'}
            </Text>
            <Text style={styles.helpText}>
              {isMarathi
                ? 'मदत हवी आहे? आमची सुरक्षा टीम आणि अधिकृत राष्ट्रीय आपत्कालीन सेवा आपल्या संरक्षणासाठी उपलब्ध आहेत.'
                : isDevanagari
                ? 'मदद चाहिए? हमारी सुरक्षा टीम और आधिकारिक राष्ट्रीय आपातकालीन सेवाएं आपकी सुरक्षा के लिए उपस्थित हैं।'
                : 'Need assistance? Our safety team and official national emergency services are here to protect you.'}
            </Text>

            <View style={styles.helpItem}>
              <Text style={styles.helpItemTitle}>
                {isMarathi ? 'राष्ट्रीय सायबर हेल्पलाइन' : isDevanagari ? 'राष्ट्रीय साइबर हेल्पलाइन' : 'National Cyber Helpline'}
              </Text>
              <Text style={styles.helpItemVal}>
                {isMarathi ? '1930 वर डायल करा (टोल फ्री • 24x7)' : isDevanagari ? '1930 पर डायल करें (टोल फ्री • 24x7)' : 'Dial 1930 (Toll Free • 24x7)'}
              </Text>
            </View>

            <View style={styles.helpItem}>
              <Text style={styles.helpItemTitle}>
                {isMarathi ? 'अधिकृत गुन्हे नोंदणी' : isDevanagari ? 'आधिकारिक अपराध रिपोर्टिंग' : 'Official Crime Reporting'}
              </Text>
              <Text style={styles.helpItemVal}>https://cybercrime.gov.in</Text>
            </View>

            <SeniorButton
              title={isMarathi ? 'बंद करा' : isDevanagari ? 'बंद करें' : 'Close'}
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
            <Text style={styles.modalTitle}>
              {isMarathi ? 'रक्षणबद्दल' : isDevanagari ? 'रक्षण के बारे में' : 'About Rakshon'}
            </Text>
            <Text style={styles.aboutVersion}>
              {isMarathi ? 'आवृत्ती 1.0.0 (उत्पादन)' : isDevanagari ? 'संस्करण 1.0.0 (उत्पादन)' : 'Version 1.0.0 (Production)'}
            </Text>
            <Text style={styles.helpText}>
              {isMarathi
                ? 'रक्षण हे ज्येष्ठ नागरिकांसाठी डिझाइन केलेले डिजिटल सुरक्षा साधन आहे. एआय धोका शोधणे, स्थानिक कॉल स्क्रीनिंग, ऑफलाइन डेटाबेस आणि 1930 हेल्पलाइनसह सुसज्ज.'
                : isDevanagari
                ? 'रक्षण वरिष्ठ नागरिकों के लिए डिज़ाइन किया गया डिजिटल सुरक्षा साथी है। एआई खतरा पहचान, स्थानीय कॉल स्क्रीनिंग, ऑफ़लाइन डेटाबेस और तुरंत 1930 एकीकरण द्वारा संचालित।'
                : 'Rakshon is a senior-first digital safety companion engineered for Indian citizens. Powered by AI threat detection, local Android Call Screening, offline threat database, and instant 1930 integration.'}
            </Text>
            <SeniorButton
              title={isMarathi ? 'बंद करा' : isDevanagari ? 'बंद करें' : 'Close'}
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
            <Text style={styles.modalTitle}>
              {isMarathi ? 'माझी सुरक्षा कृती' : isDevanagari ? 'मेरी सुरक्षा गतिविधि' : 'My Safety Activity'}
            </Text>
            <View style={styles.activityStatsRow}>
              <View style={styles.activityStatBox}>
                <Text style={styles.statNum}>14</Text>
                <Text style={styles.statLabel}>
                  {isMarathi ? 'तपासलेले संदेश' : isDevanagari ? 'जांचे गए संदेश' : 'Messages Verified'}
                </Text>
              </View>
              <View style={styles.activityStatBox}>
                <Text style={styles.statNum}>23</Text>
                <Text style={styles.statLabel}>
                  {isMarathi ? 'रोखलेले स्कॅम कॉल्स' : isDevanagari ? 'रोके गए स्कैम कॉल्स' : 'Scam Calls Filtered'}
                </Text>
              </View>
            </View>
            <SeniorButton
              title={isMarathi ? 'बंद करा' : isDevanagari ? 'बंद करें' : 'Close'}
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

