import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme, getFontFamily } from '../theme';

export interface SeniorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  secureTextEntry?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  isDevanagari?: boolean;
}

export const SeniorInput: React.FC<SeniorInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  keyboardType = 'default',
  maxLength,
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  accessibilityLabel,
  accessibilityHint,
  style,
  isDevanagari = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const hasError = Boolean(error);

  const getBorderColor = () => {
    if (hasError) return SeniorTheme.colors.riskDanger;
    if (isFocused) return SeniorTheme.colors.richEmerald;
    return '#CBD5E1';
  };

  const labelFont = getFontFamily('600', isDevanagari);
  const inputFont = getFontFamily('400', isDevanagari);
  const helperFont = getFontFamily('400', isDevanagari);

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <Text
        style={[styles.label, { fontFamily: labelFont }]}
        accessible={true}
        accessibilityRole="text"
        allowFontScaling={true}
      >
        {label}
      </Text>

      {/* Input Row */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            borderWidth: isFocused || hasError ? 2 : 1.5,
            minHeight: multiline ? 100 : SeniorTheme.dimensions.inputHeight,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={SeniorTheme.colors.textDim}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          allowFontScaling={true}
          style={[
            styles.input,
            {
              fontFamily: inputFont,
              textAlignVertical: multiline ? 'top' : 'center',
              color: editable ? SeniorTheme.colors.deepForest : SeniorTheme.colors.textDim,
            },
          ]}
        />

        {/* Clear Button (appears when value exists and editable) */}
        {value.length > 0 && editable && !secureTextEntry && !multiline && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
            style={styles.iconButton}
          >
            <Text style={styles.clearIconText}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Password Visibility Toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide text' : 'Show text'}
            style={styles.iconButton}
          >
            <Text style={styles.toggleIconText}>
              {isPasswordVisible ? '👁️' : '🔒'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <View style={styles.errorContainer} accessible={true} accessibilityLiveRegion="polite">
          <Text style={[styles.errorText, { fontFamily: helperFont }]} allowFontScaling={true}>
            {`⚠️ ${error}`}
          </Text>
        </View>
      )}

      {/* Helper Text (when no error) */}
      {!hasError && Boolean(helperText) && (
        <Text style={[styles.helperText, { fontFamily: helperFont }]} allowFontScaling={true}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SeniorTheme.spacing.xs,
    width: '100%',
  },
  label: {
    fontSize: SeniorTheme.typography.helper,
    fontWeight: '600',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 6,
  },
  inputContainer: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: SeniorTheme.typography.bodyRegular,
    fontWeight: '400',
    paddingVertical: 12,
  },
  iconButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconText: {
    fontSize: 16,
    color: SeniorTheme.colors.textDim,
    fontWeight: '700',
  },
  toggleIconText: {
    fontSize: 18,
  },
  errorContainer: {
    marginTop: 4,
  },
  errorText: {
    fontSize: SeniorTheme.typography.metadata,
    color: SeniorTheme.colors.riskDanger,
    fontWeight: '600',
  },
  helperText: {
    fontSize: SeniorTheme.typography.metadata,
    color: '#64748B',
    marginTop: 4,
  },
});
