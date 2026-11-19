import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';

export interface RakshonLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'shieldOnly' | 'horizontal' | 'stacked';
  showTagline?: boolean;
  showAccent?: boolean;
  theme?: 'dark' | 'light';
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const RakshonLogo: React.FC<RakshonLogoProps> = ({
  size = 'md',
  variant = 'shieldOnly',
  showTagline = false,
  showAccent = false,
  theme = 'dark',
  textColor,
  style,
}) => {
  const resolvedTextColor = textColor || (theme === 'light' ? '#152720' : '#FFFFFF');
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { shield: 32, fontR: 18, text: 18, sub: 8, stroke: 2 };
      case 'lg':
        return { shield: 64, fontR: 36, text: 32, sub: 12, stroke: 3 };
      case 'xl':
        return { shield: 96, fontR: 54, text: 44, sub: 14, stroke: 4 };
      case 'md':
      default:
        return { shield: 44, fontR: 24, text: 24, sub: 10, stroke: 2.5 };
    }
  };

  const dims = getDimensions();

  const renderShield = () => (
    <View
      style={[
        styles.shieldOuter,
        {
          width: dims.shield,
          height: dims.shield * 1.08,
          borderRadius: dims.shield * 0.28,
        },
      ]}
    >
      <View
        style={[
          styles.shieldInner,
          {
            borderRadius: dims.shield * 0.24,
            borderWidth: dims.stroke,
          },
        ]}
      >
        <Text
          style={[
            styles.letterR,
            {
              fontSize: dims.fontR,
              lineHeight: dims.fontR * 1.15,
            },
          ]}
        >
          R
        </Text>
      </View>
    </View>
  );

  if (variant === 'shieldOnly') {
    return <View style={[styles.container, style]}>{renderShield()}</View>;
  }

  if (variant === 'horizontal') {
    return (
      <View style={[styles.horizontalRow, style]}>
        {renderShield()}
        <View style={styles.horizontalTextCol}>
          <View style={styles.brandTitleRow}>
            <Text style={[styles.brandNameText, { fontSize: dims.text, color: resolvedTextColor }]}>
              Rakshon
            </Text>
            {showAccent && <View style={styles.cyanCurveAccent} />}
          </View>
          {showTagline && (
            <Text style={[styles.taglineText, { fontSize: dims.sub }]}>
              DIGITAL SAFETY COMPANION
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.stackedContainer, style]}>
      {renderShield()}
      <View style={styles.brandTitleRow}>
        <Text style={[styles.brandNameText, { fontSize: dims.text, color: resolvedTextColor }]}>
          Rakshon
        </Text>
        {showAccent && <View style={styles.cyanCurveAccent} />}
      </View>
      {showTagline && (
        <Text style={[styles.taglineText, { fontSize: dims.sub }]}>
          DIGITAL SAFETY COMPANION
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalTextCol: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  stackedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldOuter: {
    backgroundColor: '#0F2537', // Deep navy outer frame
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  shieldInner: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0284C7', // Vibrant Rakshon cyan-blue
    borderColor: '#38BDF8', // Cyan highlight border
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  letterR: {
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'sans-serif-black',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  brandTitleRow: {
    position: 'relative',
  },
  brandNameText: {
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    fontFamily: 'sans-serif-medium',
  },
  cyanCurveAccent: {
    position: 'absolute',
    bottom: -2,
    left: '25%',
    width: '50%',
    height: 2.5,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  taglineText: {
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

