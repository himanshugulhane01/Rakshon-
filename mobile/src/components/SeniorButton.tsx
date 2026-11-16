import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme } from '../theme';

export interface SeniorButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'accent';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const SeniorButton: React.FC<SeniorButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return SeniorTheme.colors.textDim;
    switch (variant) {
      case 'secondary':
      case 'outline':
        return SeniorTheme.colors.white;
      case 'danger':
        return SeniorTheme.colors.riskDanger;
      case 'accent':
        return SeniorTheme.colors.emeraldLight;
      default:
        return SeniorTheme.colors.richEmerald;
    }
  };

  const getTextColor = () => {
    if (disabled) return SeniorTheme.colors.white;
    switch (variant) {
      case 'secondary':
      case 'outline':
        return SeniorTheme.colors.richEmerald;
      case 'accent':
        return SeniorTheme.colors.deepForest;
      default:
        return SeniorTheme.colors.white;
    }
  };

  const getBorderColor = () => {
    if (variant === 'secondary' || variant === 'outline') {
      return disabled ? SeniorTheme.colors.textDim : SeniorTheme.colors.richEmerald;
    }
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'secondary' || variant === 'outline' ? 2 : 0,
          opacity: disabled ? 0.7 : 1.0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="large" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: SeniorTheme.dimensions.minTouchTarget,
    height: SeniorTheme.dimensions.buttonHeight,
    borderRadius: SeniorTheme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.lg,
    marginVertical: SeniorTheme.spacing.sm,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
