import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme } from '../theme';
import { SeniorBadge } from './SeniorBadge';

export interface RiskResultCardProps {
  score: number;
  level: 'safe' | 'caution' | 'danger';
  title: string;
  summary: string;
  recommendation: string;
  indicators?: string[];
  style?: StyleProp<ViewStyle>;
}

export const RiskResultCard: React.FC<RiskResultCardProps> = ({
  score,
  level,
  title,
  summary,
  recommendation,
  indicators = [],
  style,
}) => {
  const getLevelDetails = () => {
    switch (level) {
      case 'danger':
        return {
          color: SeniorTheme.colors.riskDanger,
          surface: SeniorTheme.colors.riskDangerSurface,
          border: SeniorTheme.colors.riskDangerBorder,
          badgeLabel: 'HIGH RISK DETECTED',
          badgeVariant: 'danger' as const,
          icon: '🚨',
        };
      case 'caution':
        return {
          color: SeniorTheme.colors.riskWarning,
          surface: SeniorTheme.colors.riskWarningSurface,
          border: SeniorTheme.colors.riskWarningBorder,
          badgeLabel: 'PROCEED WITH CAUTION',
          badgeVariant: 'caution' as const,
          icon: '⚠️',
        };
      default:
        return {
          color: SeniorTheme.colors.riskSafe,
          surface: SeniorTheme.colors.riskSafeSurface,
          border: SeniorTheme.colors.riskSafeBorder,
          badgeLabel: 'VERIFIED SAFE',
          badgeVariant: 'safe' as const,
          icon: '🛡️',
        };
    }
  };

  const details = getLevelDetails();

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Risk analysis: ${details.badgeLabel}. Score ${score} out of 100. ${summary}`}
      style={[
        styles.card,
        { borderColor: details.border, backgroundColor: SeniorTheme.colors.white },
        style,
      ]}
    >
      {/* Top Level & Score Header */}
      <View style={styles.headerRow}>
        <SeniorBadge
          label={details.badgeLabel}
          variant={details.badgeVariant}
          icon={details.icon}
        />
        <View
          style={[
            styles.scorePill,
            { backgroundColor: details.surface, borderColor: details.border },
          ]}
        >
          <Text style={[styles.scoreValue, { color: details.color }]}>
            {score}
          </Text>
          <Text style={[styles.scoreScale, { color: details.color }]}>/100</Text>
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Plain Language Summary */}
      <Text style={styles.summary}>{summary}</Text>

      {/* Warning Indicators List */}
      {indicators.length > 0 && (
        <View style={styles.indicatorsSection}>
          <Text style={styles.indicatorsHeader}>DETECTED WARNING SIGNS:</Text>
          {indicators.map((indicator, index) => (
            <View key={index} style={styles.indicatorRow}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.indicatorText}>{indicator}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendation Action Box */}
      <View
        style={[
          styles.recommendationBox,
          { backgroundColor: SeniorTheme.colors.backgroundMain },
        ]}
      >
        <Text style={styles.recommendationHeader}>RECOMMENDED SAFE ACTION</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SeniorTheme.radii.card,
    padding: SeniorTheme.spacing.lg,
    borderWidth: 2,
    marginVertical: SeniorTheme.spacing.sm,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SeniorTheme.spacing.md,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: SeniorTheme.spacing.md,
    paddingVertical: 4,
    borderRadius: SeniorTheme.radii.full,
    borderWidth: 1.5,
  },
  scoreValue: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '900',
  },
  scoreScale: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '700',
    opacity: 0.8,
    marginLeft: 2,
  },
  title: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.xs,
  },
  summary: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 26,
    marginBottom: SeniorTheme.spacing.md,
  },
  indicatorsSection: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderRadius: SeniorTheme.radii.button,
    padding: SeniorTheme.spacing.md,
    marginBottom: SeniorTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  indicatorsHeader: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '800',
    color: SeniorTheme.colors.textDim,
    letterSpacing: 0.8,
    marginBottom: SeniorTheme.spacing.xs,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bulletIcon: {
    fontSize: 18,
    color: SeniorTheme.colors.riskDanger,
    marginRight: SeniorTheme.spacing.xs,
    lineHeight: 22,
  },
  indicatorText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    flex: 1,
    lineHeight: 22,
    fontWeight: '600',
  },
  recommendationBox: {
    borderRadius: SeniorTheme.radii.button,
    padding: SeniorTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: SeniorTheme.colors.richEmerald,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recommendationHeader: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    fontWeight: '600',
  },
});

