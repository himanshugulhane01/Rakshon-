import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SupportedLanguage } from '../i18n';
import { StorageService } from '../services/storage';

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
];

export interface LanguageSelectorProps {
  onLanguageChanged?: (code: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChanged,
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = (i18n.language || 'en') as SupportedLanguage;

  const handleSelect = async (code: SupportedLanguage) => {
    await i18n.changeLanguage(code);
    await StorageService.setLanguage(code);
    onLanguageChanged?.(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('common.language')}</Text>
      <View style={styles.buttonRow}>
        {languages.map((lang) => {
          const isSelected = currentLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleSelect(lang.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${lang.nativeLabel} (${lang.label})`}
              style={[
                styles.langButton,
                isSelected && styles.langButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.nativeLabelText,
                  isSelected && styles.labelTextSelected,
                ]}
              >
                {lang.nativeLabel}
              </Text>
              <Text
                style={[
                  styles.subLabelText,
                  isSelected && styles.labelTextSelected,
                ]}
              >
                {lang.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SeniorTheme.spacing.md,
  },
  header: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SeniorTheme.spacing.sm,
  },
  langButton: {
    flex: 1,
    minHeight: SeniorTheme.dimensions.minTouchTarget,
    backgroundColor: SeniorTheme.colors.white,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: SeniorTheme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SeniorTheme.spacing.sm,
  },
  langButtonSelected: {
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  nativeLabelText: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  subLabelText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
  },
  labelTextSelected: {
    color: SeniorTheme.colors.white,
  },
});
