import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  SeniorHeader,
  SeniorCard,
  SeniorButton,
  SeniorInput,
  SeniorBadge,
  BottomNavigation,
  BottomNavTab,
} from '../components';
import { SeniorTheme } from '../theme';

export interface ComponentShowcaseScreenProps {
  onBack?: () => void;
}

export const ComponentShowcaseScreen: React.FC<ComponentShowcaseScreenProps> = ({
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [inputValue, setInputValue] = useState('Rajesh Kumar');
  const [errorInputValue, setErrorInputValue] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      {/* 1. SeniorHeader */}
      <SeniorHeader
        title="Batch 1 Components"
        subtitle="Typography & Reusable Design System"
        onBack={onBack || (() => {})}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: SeniorBadge */}
        <Text style={styles.sectionHeading}>1. SeniorBadge (12dp Pill, 13sp Metadata)</Text>
        <View style={styles.badgeRow}>
          <SeniorBadge label="Active" variant="safe" />
          <SeniorBadge label="Syncing" variant="info" />
          <SeniorBadge label="Review" variant="caution" />
          <SeniorBadge label="Threat" variant="danger" />
        </View>

        {/* Section: SeniorCard */}
        <Text style={styles.sectionHeading}>2. SeniorCard (20dp Radius, Flexible Height)</Text>
        <SeniorCard
          variant="elevated"
          title="On-Device Security Shield"
          subtitle="Real-time heuristic threat detection running 100% offline with zero cloud dependency."
          icon={<Text style={styles.cardEmoji}>🛡️</Text>}
        >
          <View style={styles.cardInnerBox}>
            <Text style={styles.cardInnerText}>
              Cards automatically expand with Android font scaling. No text is clipped or truncated.
            </Text>
          </View>
        </SeniorCard>

        {/* Section: SeniorInput */}
        <Text style={styles.sectionHeading}>3. SeniorInput (56dp Height, 14dp Radius)</Text>
        <SeniorInput
          label="Full Name (Legal Identity)"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter your full name"
          helperText="Standard 16sp body text with 14sp label and accessible touch targets."
        />

        <SeniorInput
          label="Mobile Number (Validation State)"
          value={errorInputValue}
          onChangeText={setErrorInputValue}
          placeholder="Enter 10-digit mobile number"
          error="Please enter a valid 10-digit Indian mobile number"
        />

        {/* Section: SeniorButton */}
        <Text style={styles.sectionHeading}>4. SeniorButton (54dp Height, 16dp Radius, 16sp SemiBold)</Text>
        <SeniorButton
          title="Primary Action (Rich Emerald)"
          variant="primary"
          onPress={() => {}}
        />

        <SeniorButton
          title="Secondary Action (Fintech Outline)"
          variant="outline"
          onPress={() => {}}
        />

        <SeniorButton
          title="🚨 Emergency Action (Crimson)"
          variant="danger"
          onPress={() => {}}
        />
      </ScrollView>

      {/* 5. BottomNavigation */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  scrollContent: {
    paddingHorizontal: SeniorTheme.dimensions.screenPadding,
    paddingVertical: SeniorTheme.spacing.md,
    paddingBottom: 20,
  },
  sectionHeading: {
    fontSize: SeniorTheme.typography.helper,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardInnerBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F0F9F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cardInnerText: {
    fontSize: 13,
    color: '#152720',
    fontWeight: '500',
    lineHeight: 18,
  },
});

