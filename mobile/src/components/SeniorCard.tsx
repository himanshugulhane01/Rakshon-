import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme, getFontFamily } from '../theme';

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
  isDevanagari?: boolean;
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
  isDevanagari = false,
}) => {
  const isPressable = typeof onPress === 'function';

  const getBorderColor = () => {
    switch (variant) {
      case 'outlined':
        return '#CBD5E1';
      case 'accent':
        return SeniorTheme.colors.emeraldLight;
      default:
        return '#E2E8F0';
    }
  };

  const titleFont = getFontFamily('600', isDevanagari);
  const subtitleFont = getFontFamily('400', isDevanagari);

  const content = (
    <View
      style={[
        styles.card,
        {
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' || variant === 'accent' ? 2 : 1.5,
        },
        variant === 'elevated' && styles.elevated,
        style,
      ]}
    >
      {(title || subtitle || icon) && (
        <View style={styles.headerRow}>
          {Boolean(icon) && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            {Boolean(title) && (
              <Text style={[styles.title, { fontFamily: titleFont }]} allowFontScaling={true}>
                {title}
              </Text>
            )}
            {Boolean(subtitle) && (
              <Text style={[styles.subtitle, { fontFamily: subtitleFont }]} allowFontScaling={true}>
                {subtitle}
              </Text>
            )}
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
    marginVertical: SeniorTheme.spacing.xs,
  },
  card: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.card,
    padding: 18,
    marginVertical: SeniorTheme.spacing.xs,
  },
  elevated: {
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: SeniorTheme.typography.cardTitle,
    fontWeight: '600',
    color: SeniorTheme.colors.deepForest,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: SeniorTheme.typography.helper,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 20,
  },
});
