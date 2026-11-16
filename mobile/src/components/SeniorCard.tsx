import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme } from '../theme';

export interface SeniorCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'accent' | 'elevated';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const SeniorCard: React.FC<SeniorCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'default',
  accessibilityLabel,
  accessibilityHint,
  style,
  children,
}) => {
  const isPressable = typeof onPress === 'function';

  const getBorderColor = () => {
    switch (variant) {
      case 'outlined':
        return '#CBD5E1';
      case 'accent':
        return SeniorTheme.colors.emeraldLight;
      default:
        return 'transparent';
    }
  };

  const content = (
    <View
      style={[
        styles.card,
        {
          borderColor: variant === 'default' ? '#E2E8F0' : getBorderColor(),
          borderWidth: variant === 'outlined' || variant === 'accent' ? 2 : 1,
        },
        variant === 'elevated' && styles.elevated,
        style,
      ]}
    >
      {(title || subtitle || icon) && (
        <View style={styles.headerRow}>
          {Boolean(icon) && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            {Boolean(title) && <Text style={styles.title}>{title}</Text>}
            {Boolean(subtitle) && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      )}
      {children}
    </View>
  );

  if (isPressable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        style={styles.pressableWrapper}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel || title}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  pressableWrapper: {
    marginVertical: SeniorTheme.spacing.sm,
  },
  card: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.lg,
    padding: SeniorTheme.spacing.lg,
    marginVertical: SeniorTheme.spacing.xs,
  },
  elevated: {
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 4 },
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
    marginRight: SeniorTheme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  subtitle: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.8,
    marginTop: SeniorTheme.spacing.xs,
    lineHeight: 24,
  },
});
