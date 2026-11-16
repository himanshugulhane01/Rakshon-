import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeniorTheme } from '../theme';
import { SeniorBadge } from './SeniorBadge';

interface StatusCardProps {
  status: 'safe' | 'caution' | 'danger';
  title: string;
  subtitle: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  title,
  subtitle,
}) => {
  const getScheme = () => {
    switch (status) {
      case 'danger':
        return {
          bg: SeniorTheme.colors.riskDangerSurface,
          border: SeniorTheme.colors.riskDangerBorder,
          badgeVariant: 'danger' as const,
          badgeLabel: 'HIGH RISK',
        };
      case 'caution':
        return {
          bg: SeniorTheme.colors.riskWarningSurface,
          border: SeniorTheme.colors.riskWarningBorder,
          badgeVariant: 'caution' as const,
          badgeLabel: 'CAUTION',
        };
      default:
        return {
          bg: SeniorTheme.colors.riskSafeSurface,
          border: SeniorTheme.colors.riskSafeBorder,
          badgeVariant: 'safe' as const,
          badgeLabel: 'PROTECTED',
        };
    }
  };

  const scheme = getScheme();

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      style={[
        styles.card,
        { backgroundColor: scheme.bg, borderColor: scheme.border },
      ]}
    >
      <View style={styles.badgeRow}>
        <SeniorBadge variant={scheme.badgeVariant} label={scheme.badgeLabel} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SeniorTheme.radii.lg,
    borderWidth: 2,
    padding: SeniorTheme.spacing.lg,
    marginVertical: SeniorTheme.spacing.md,
  },
  badgeRow: {
    marginBottom: SeniorTheme.spacing.sm,
  },
  title: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.xs,
  },
  subtitle: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 26,
    opacity: 0.9,
  },
});
