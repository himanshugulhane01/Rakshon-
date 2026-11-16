import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SeniorTheme } from '../theme';

export interface SeniorHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const SeniorHeader: React.FC<SeniorHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}) => {
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
            style={styles.titleText}
            numberOfLines={2}
          >
            {title}
          </Text>
          {Boolean(subtitle) && (
            <Text style={styles.subtitleText}>{subtitle}</Text>
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
    paddingHorizontal: SeniorTheme.spacing.md,
    paddingVertical: SeniorTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: SeniorTheme.dimensions.headerHeight,
  },
  backButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.sm,
    borderRadius: SeniorTheme.radii.sm,
    backgroundColor: SeniorTheme.colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backArrowText: {
    fontSize: 28,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    lineHeight: 32,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  subtitleText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
  },
  rightActionContainer: {
    marginLeft: SeniorTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

