import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme, getFontFamily } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorHeader } from '../components/SeniorHeader';
import { StorageService } from '../services/storage';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface LanguageSelectionScreenProps {
  onLanguageSelected: (lang: SupportedLanguage) => void;
  onBack?: () => void;
  isInitialSetup?: boolean;
}

interface LanguageItem {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  greeting: string;
  flag: string;
}

const LANGUAGES: LanguageItem[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greeting: 'Welcome & Stay Safe',
    flag: '🇬🇧',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    greeting: 'स्वागत है और सुरक्षित रहें',
    flag: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    greeting: 'स्वागत आणि सुरक्षित राहा',
    flag: '🚩',
  },
];

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  onLanguageSelected,
  onBack,
  isInitialSetup = false,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) || 'en'
  );
  const [isSaving, setIsSaving] = useState(false);
  const isDevanagari = selectedLang === 'hi' || selectedLang === 'mr';

  useEffect(() => {
    const current = i18n.language;
    if (current === 'hi' || current === 'mr' || current === 'en') {
      setSelectedLang(current);
    }
  }, [i18n.language]);

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    setSelectedLang(code);
    await i18n.changeLanguage(code);
  };

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      await StorageService.setLanguage(selectedLang);
      await i18n.changeLanguage(selectedLang);
      onLanguageSelected(selectedLang);
    } catch {
      onLanguageSelected(selectedLang);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {!isInitialSetup && (
        <SeniorHeader
          title={t('common.language')}
          onBack={onBack}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Icon Badge: Green Speech Bubble matching Mockup #3 */}
        <View style={styles.headerArea}>
          <View style={styles.speechBadge}>
            <Text style={styles.speechBadgeIcon}>💬</Text>
          </View>

          <Text
            style={[
              styles.title,
              { fontFamily: getFontFamily('700', isDevanagari) },
            ]}
            accessible={true}
            accessibilityRole="header"
            allowFontScaling={true}
          >
            Choose Your Language
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontFamily: getFontFamily('400', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            Pick your preferred language to continue
          </Text>
        </View>

        {/* 3 Trilingual Selection Cards */}
        <View style={styles.optionsList}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            const itemIsDev = lang.code === 'hi' || lang.code === 'mr';

            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${lang.nativeName} (${lang.name})`}
                accessibilityHint={`Selects ${lang.name} as application language`}
                activeOpacity={0.8}
                style={[
                  styles.languageCard,
                  isSelected && styles.languageCardSelected,
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <View style={styles.flagBadge}>
                      <Text style={styles.flagIcon}>{lang.flag}</Text>
                    </View>
                    <View style={styles.textColumn}>
                      <Text
                        style={[
                          styles.nativeNameText,
                          { fontFamily: getFontFamily('700', itemIsDev) },
                          isSelected && styles.nativeNameTextSelected,
                        ]}
                        allowFontScaling={true}
                      >
                        {lang.nativeName}
                      </Text>
                      {lang.code !== 'en' && (
                        <Text
                          style={[
                            styles.englishSubtext,
                            { fontFamily: getFontFamily('500', false) },
                          ]}
                          allowFontScaling={true}
                        >
                          {lang.name}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Radio Button Indicator matching Mockup #3 */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Confirmation Button */}
        <View style={styles.buttonContainer}>
          <SeniorButton
            title="Continue"
            onPress={handleConfirm}
            loading={isSaving}
            accessibilityLabel={t('languageSelect.confirmButton')}
            accessibilityHint="Saves language choice and continues to login"
            style={styles.confirmButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerArea: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  speechBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#C8E6D8',
  },
  speechBadgeIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    color: SeniorTheme.colors.deepForest,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: SeniorTheme.colors.textDim, // #939E99
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  optionsList: {
    gap: 14,
    marginBottom: 28,
  },
  languageCard: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 74,
    justifyContent: 'center',
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  languageCardSelected: {
    borderColor: SeniorTheme.colors.richEmerald, // #2D6B51
    backgroundColor: '#F4FAF7',
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flagBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flagIcon: {
    fontSize: 24,
  },
  textColumn: {
    justifyContent: 'center',
  },
  nativeNameText: {
    fontSize: 19,
    color: SeniorTheme.colors.deepForest,
    letterSpacing: 0.2,
  },
  nativeNameTextSelected: {
    color: SeniorTheme.colors.deepForest,
  },
  englishSubtext: {
    fontSize: 13,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: SeniorTheme.colors.richEmerald,
    backgroundColor: SeniorTheme.colors.richEmerald,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SeniorTheme.colors.white,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 16,
    paddingBottom: 8,
  },
  confirmButton: {
    minHeight: 54,
    borderRadius: 16,
  },
});
