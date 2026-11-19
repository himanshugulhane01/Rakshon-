import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme } from '../theme';
import { SeniorBadge, SeniorBadgeProps } from './SeniorBadge';

export interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: string | React.ReactNode;
  onPress: () => void;
  statusBadge?: string;
  badgeVariant?: SeniorBadgeProps['variant'];
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  statusBadge,
  badgeVariant = 'info',
  accessibilityHint,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint={accessibilityHint || `Opens ${title}`}
      style={[styles.card, style]}
    >
      <View style={styles.contentRow}>
        {/* Leading Icon Container */}
        <View style={styles.iconContainer}>
          {typeof icon === 'string' ? (
            <Text style={styles.iconEmoji}>{icon}</Text>
          ) : (
            icon
          )}
        </View>

        {/* Text Details */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {Boolean(statusBadge) && (
              <SeniorBadge
                label={statusBadge!}
                variant={badgeVariant}
                style={styles.badge}
              />
            )}
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>

        {/* Trailing Chevron Button */}
        <View style={styles.chevronContainer}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.card,
    padding: SeniorTheme.spacing.md,
    marginVertical: SeniorTheme.spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 76,
    justifyContent: 'center',
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: SeniorTheme.radii.button,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconEmoji: {
    fontSize: 26,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    flex: 1,
  },
  badge: {
    marginLeft: SeniorTheme.spacing.xs,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.75,
    lineHeight: 20,
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SeniorTheme.spacing.sm,
  },
  chevronText: {
    fontSize: 24,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    lineHeight: 26,
  },
});

