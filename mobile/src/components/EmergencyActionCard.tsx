import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme } from '../theme';

export interface EmergencyActionCardProps {
  onCall1930: () => void;
  onOpenPortal?: () => void;
  onFreezeGuide?: () => void;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

export const EmergencyActionCard: React.FC<EmergencyActionCardProps> = ({
  onCall1930,
  onOpenPortal,
  onFreezeGuide,
  title = 'Suspect Financial Fraud?',
  subtitle = 'Call Cyber Fraud Helpline 1930 immediately to freeze unauthorized transactions.',
  style,
}) => {
  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Emergency Assistance: ${title}. ${subtitle}`}
      style={[styles.card, style]}
    >
      {/* Header with Emergency Emblem */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>🚨</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.badgeText}>OFFICIAL GOVT HELPLINE • 24x7</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Primary 1930 Dial Action Button */}
      <TouchableOpacity
        onPress={onCall1930}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Call Cyber Helpline 1930"
        accessibilityHint="Opens your phone dialer to call 1930"
        style={styles.callButton}
      >
        <Text style={styles.callIcon}>📞</Text>
        <Text style={styles.callButtonText}>CALL 1930 (TOLL-FREE)</Text>
      </TouchableOpacity>

      {/* Secondary Actions Row */}
      {(Boolean(onOpenPortal) || Boolean(onFreezeGuide)) && (
        <View style={styles.secondaryActionsRow}>
          {Boolean(onOpenPortal) && (
            <TouchableOpacity
              onPress={onOpenPortal}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open National Cybercrime Portal"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>🌐 Cybercrime Portal</Text>
            </TouchableOpacity>
          )}

          {Boolean(onFreezeGuide) && (
            <TouchableOpacity
              onPress={onFreezeGuide}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Bank Contact Directory & Freeze Steps"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>🏦 Bank Directory</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.card,
    padding: SeniorTheme.spacing.lg,
    marginVertical: SeniorTheme.spacing.sm,
    borderWidth: 2,
    borderColor: SeniorTheme.colors.riskDangerBorder,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.xs,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: SeniorTheme.radii.button,
    backgroundColor: SeniorTheme.colors.riskDangerSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
  },
  iconEmoji: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  badgeText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '800',
    color: SeniorTheme.colors.riskDanger,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  subtitle: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    marginVertical: SeniorTheme.spacing.sm,
    opacity: 0.85,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: SeniorTheme.colors.riskDanger,
    height: SeniorTheme.dimensions.buttonHeight,
    borderRadius: SeniorTheme.radii.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SeniorTheme.spacing.xs,
    shadowColor: SeniorTheme.colors.riskDanger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  callIcon: {
    fontSize: 20,
    color: SeniorTheme.colors.white,
    marginRight: SeniorTheme.spacing.sm,
  },
  callButtonText: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.white,
    letterSpacing: 0.6,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    marginTop: SeniorTheme.spacing.md,
    gap: SeniorTheme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: SeniorTheme.radii.button,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.sm,
  },
  secondaryButtonText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
});

