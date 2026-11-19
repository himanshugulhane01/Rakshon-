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

export type BottomNavTab = 'home' | 'protect' | 'learn' | 'family' | 'profile';

export interface BottomNavigationProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  style?: StyleProp<ViewStyle>;
  isDevanagari?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  style,
  isDevanagari = false,
}) => {
  const tabs: Array<{ id: BottomNavTab; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'protect', label: 'Protect', icon: '🛡️' },
    { id: 'learn', label: 'Learn', icon: '🎓' },
    { id: 'family', label: 'Family', icon: '👥' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const labelFont = getFontFamily('600', isDevanagari);

  return (
    <View
      accessible={true}
      accessibilityRole="tablist"
      style={[styles.container, style]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={`${tab.label} tab`}
            accessibilityState={{ selected: isActive }}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && styles.activeIconWrapper,
              ]}
            >
              <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
                {tab.icon}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              allowFontScaling={true}
              style={[
                styles.tabLabel,
                { fontFamily: labelFont },
                isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: SeniorTheme.colors.white,
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    minHeight: 64,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    marginBottom: 2,
  },
  activeIconWrapper: {
    backgroundColor: '#E8F5EE',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: SeniorTheme.colors.richEmerald,
    fontWeight: '700',
  },
  inactiveTabLabel: {
    color: SeniorTheme.colors.textDim,
  },
});
