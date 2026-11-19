import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SeniorTheme, getFontFamily } from '../theme';

export interface SeniorBadgeProps {
  label: string;
  variant?: 'safe' | 'caution' | 'danger' | 'info';
  icon?: string;
  style?: ViewStyle;
  isDevanagari?: boolean;
}

export const SeniorBadge: React.FC<SeniorBadgeProps> = ({
  label,
  variant = 'info',
  icon,
  style,
  isDevanagari = false,
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
          bg: '#F0F9F5',
          text: SeniorTheme.colors.richEmerald,
          border: SeniorTheme.colors.emeraldLight,
          defaultIcon: 'ℹ️',
        };
    }
  };

  const scheme = getBadgeScheme();
  const displayIcon = icon ?? scheme.defaultIcon;
  const labelFont = getFontFamily('600', isDevanagari);

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
      <Text
        style={[
          styles.labelText,
          {
            color: scheme.text,
            fontFamily: labelFont,
          },
        ]}
        allowFontScaling={true}
      >
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
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  iconText: {
    fontSize: 13,
    marginRight: 6,
  },
  labelText: {
    fontSize: SeniorTheme.typography.metadata,
    fontWeight: '600',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
});

