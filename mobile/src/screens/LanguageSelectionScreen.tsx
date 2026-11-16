import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorCard } from '../components/SeniorCard';
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
  icon: string;
}

const LANGUAGES: LanguageItem[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greeting: 'Welcome & Stay Safe',
    icon: '🗣️',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    greeting: 'स्वागत है और सुरक्षित रहें',
    icon: '🇮🇳',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    greeting: 'स्वागत आणि सुरक्षित राहा',
    icon: '🚩',
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
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

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
        {/* Header Branding Area */}
        <View style={styles.headerArea}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🌐</Text>
          </View>
          <Text style={styles.title} accessible={true} accessibilityRole="header">
            {t('languageSelect.title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('languageSelect.subtitle')}
          </Text>
        </View>

        {/* Trilingual Selection Cards reusing SeniorCard */}
        <View style={styles.optionsList}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;

            return (
              <SeniorCard
                key={lang.code}
                variant={isSelected ? 'accent' : 'outlined'}
                onPress={() => handleSelectLanguage(lang.code)}
                accessibilityLabel={`${lang.nativeName} (${lang.name})`}
                accessibilityHint={`Selects ${lang.name} as application language`}
                style={[
                  styles.languageCard,
                  isSelected && styles.languageCardSelected,
                ]}
              >
                <View style={styles.cardInner}>
                  <View style={styles.cardLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        isSelected && styles.iconCircleSelected,
                      ]}
                    >
                      <Text style={styles.langIcon}>{lang.icon}</Text>
                    </View>
                    <View style={styles.textColumn}>
                      <Text
                        style={[
                          styles.nativeNameText,
                          isSelected && styles.nativeNameTextSelected,
                        ]}
                      >
                        {lang.nativeName}
                      </Text>
                      <Text style={styles.englishNameText}>
                        {lang.name}
                      </Text>
                      <Text style={styles.greetingText}>
                        {lang.greeting}
                      </Text>
                    </View>
                  </View>

                  {/* Radio / Checkmark Indicator */}
                  <View
                    style={[
                      styles.radioIndicator,
                      isSelected && styles.radioIndicatorSelected,
                    ]}
                  >
                    {isSelected && <Text style={styles.checkText}>✓</Text>}
                  </View>
                </View>
              </SeniorCard>
            );
          })}
        </View>

        {/* Reusable SeniorButton for Confirmation */}
        <View style={styles.buttonContainer}>
          <SeniorButton
            title={t('languageSelect.confirmButton')}
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
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  scrollContent: {
    paddingHorizontal: SeniorTheme.spacing.lg,
    paddingVertical: SeniorTheme.spacing.xl,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.xl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SeniorTheme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SeniorTheme.colors.emeraldLight,
    marginBottom: SeniorTheme.spacing.md,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: SeniorTheme.typography.titleLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.sm,
  },
  subtitle: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  optionsList: {
    marginVertical: SeniorTheme.spacing.sm,
  },
  languageCard: {
    minHeight: 80,
    marginVertical: SeniorTheme.spacing.xs,
  },
  languageCardSelected: {
    backgroundColor: '#F0F9F5',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
  },
  iconCircleSelected: {
    backgroundColor: SeniorTheme.colors.white,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  langIcon: {
    fontSize: 24,
  },
  textColumn: {
    flex: 1,
  },
  nativeNameText: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  nativeNameTextSelected: {
    color: SeniorTheme.colors.deepForest,
  },
  englishNameText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
    fontWeight: '600',
  },
  greetingText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.richEmerald,
    marginTop: 2,
    fontWeight: '600',
  },
  radioIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SeniorTheme.spacing.md,
    backgroundColor: SeniorTheme.colors.white,
  },
  radioIndicatorSelected: {
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  checkText: {
    color: SeniorTheme.colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  buttonContainer: {
    marginTop: SeniorTheme.spacing.xl,
    paddingBottom: SeniorTheme.spacing.lg,
  },
  confirmButton: {
    minHeight: SeniorTheme.dimensions.minTouchTarget + 8,
  },
});
