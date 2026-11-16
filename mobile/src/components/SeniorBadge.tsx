import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SeniorTheme } from '../theme';

export interface SeniorBadgeProps {
  label: string;
  variant?: 'safe' | 'caution' | 'danger' | 'info';
  icon?: string;
  style?: ViewStyle;
}

export const SeniorBadge: React.FC<SeniorBadgeProps> = ({
  label,
  variant = 'info',
  icon,
  style,
}) => {
  const getBadgeScheme = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: SeniorTheme.colors.riskDangerSurface,
          text: SeniorTheme.colors.riskDanger,
          border: SeniorTheme.colors.riskDangerBorder,
          defaultIcon: '🚨',
        };
      case 'caution':
        return {
          bg: SeniorTheme.colors.riskWarningSurface,
          text: SeniorTheme.colors.riskWarning,
          border: SeniorTheme.colors.riskWarningBorder,
          defaultIcon: '⚠️',
        };
      case 'safe':
        return {
          bg: SeniorTheme.colors.riskSafeSurface,
          text: SeniorTheme.colors.riskSafe,
          border: SeniorTheme.colors.riskSafeBorder,
          defaultIcon: '🛡️',
        };
      default:
        return {
          bg: SeniorTheme.colors.backgroundMain,
          text: SeniorTheme.colors.richEmerald,
          border: SeniorTheme.colors.emeraldLight,
          defaultIcon: 'ℹ️',
        };
    }
  };

  const scheme = getBadgeScheme();
  const displayIcon = icon ?? scheme.defaultIcon;

  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
        },
        style,
      ]}
    >
      <Text style={styles.iconText}>{displayIcon}</Text>
      <Text style={[styles.labelText, { color: scheme.text }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SeniorTheme.spacing.xs + 2,
    paddingHorizontal: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.sm,
    borderWidth: 1.5,
  },
  iconText: {
    fontSize: SeniorTheme.typography.bodySmall,
    marginRight: SeniorTheme.spacing.xs,
  },
  labelText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

