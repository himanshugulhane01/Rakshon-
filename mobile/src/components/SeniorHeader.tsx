import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SeniorTheme, getFontFamily } from '../theme';

export interface SeniorHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
  isDevanagari?: boolean;
}

export const SeniorHeader: React.FC<SeniorHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
  isDevanagari = false,
}) => {
  const titleFont = getFontFamily('600', isDevanagari);
  const subtitleFont = getFontFamily('400', isDevanagari);

  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.contentRow}>
        {/* Back Button */}
        {Boolean(onBack) && (
          <TouchableOpacity
            onPress={onBack}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigates to the previous screen"
            style={styles.backButton}
          >
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
        )}

        {/* Title & Subtitle */}
        <View style={styles.titleContainer}>
          <Text
            accessible={true}
            accessibilityRole="header"
            style={[styles.titleText, { fontFamily: titleFont }]}
            numberOfLines={2}
            allowFontScaling={true}
          >
            {title}
          </Text>
          {Boolean(subtitle) && (
            <Text
              style={[styles.subtitleText, { fontFamily: subtitleFont }]}
              allowFontScaling={true}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Action Slot */}
        {Boolean(rightAction) && (
          <View style={styles.rightActionContainer}>{rightAction}</View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: SeniorTheme.dimensions.headerHeight,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderRadius: 14,
    backgroundColor: SeniorTheme.colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  backArrowText: {
    fontSize: 24,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: SeniorTheme.typography.screenTitle,
    fontWeight: '600',
    color: SeniorTheme.colors.deepForest,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: SeniorTheme.typography.helper,
    color: '#64748B',
    marginTop: 2,
  },
  rightActionContainer: {
    marginLeft: SeniorTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

