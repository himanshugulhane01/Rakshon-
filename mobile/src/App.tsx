import React, { useState } from 'react';
import './i18n';
import {
  SplashScreen,
  LanguageSelectionScreen,
  OnboardingScreen,
  LoginScreen,
  HomeScreen,
  MessageGuardianScreen,
  AnalysisResultScreen,
  CallGuardianScreen,
  ScamLensScreen,
  EmergencyScreen,
  FamilyCircleScreen,
  ScamSimulatorScreen,
  VoiceGuardianScreen,
  SignUpScreen,
  NotificationsScreen,
  ProfileScreen,
  BankingSandboxScreen,
  AudioVisualLearningScreen,
  SafeBrowsingSimulatorScreen,
  CaregiverDashboardScreen,
  UnifiedSafeCheckerScreen,
  SupportedLanguage,
} from './screens';
import { StorageService } from './services/storage';
import { MessageAnalysisResponse } from './services/analysisApi';
import { BottomNavTab } from './components/BottomNavigation';

import { ComponentShowcaseScreen } from './screens/ComponentShowcaseScreen';

export type AppScreen =
  | 'Splash'
  | 'ComponentShowcase'
  | 'LanguageSelect'
  | 'Onboarding'
  | 'Login'
  | 'SignUp'
  | 'Home'
  | 'MessageGuardian'
  | 'AnalysisResult'
  | 'CallGuardian'
  | 'ScamLens'
  | 'Emergency'
  | 'FamilyCircle'
  | 'ScamSimulator'
  | 'VoiceGuardian'
  | 'Notifications'
  | 'Profile'
  | 'BankingSandbox'
  | 'AudioVisualLearning'
  | 'SafeBrowsing'
  | 'CaregiverDashboard'
  | 'UnifiedChecker';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('Splash');
  const [previousScreen, setPreviousScreen] = useState<AppScreen | null>(null);
  const [_userPhone, setUserPhone] = useState<string>('');

  // Active analysis result state
  const [activeAnalysis, setActiveAnalysis] = useState<{
    result: MessageAnalysisResponse;
    text: string;
  } | null>(null);

  const navigateTo = (screen: AppScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const handleSplashReady = (
    destination: 'LanguageSelect' | 'Onboarding' | 'Login' | 'Home'
  ) => {
    setCurrentScreen(destination);
  };

  const handleLanguageSelected = async (_lang: SupportedLanguage) => {
    if (previousScreen === 'Login' || previousScreen === 'Home') {
      setCurrentScreen(previousScreen);
      return;
    }

    const onboardingCompleted = await StorageService.isOnboardingCompleted();
    if (!onboardingCompleted) {
      setCurrentScreen('Onboarding');
    } else {
      setCurrentScreen('Login');
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('Login');
  };

  const handleLoginSuccess = (phoneNumber: string) => {
    setUserPhone(phoneNumber);
    setCurrentScreen('Home');
  };

  const handleAnalysisSuccess = (result: MessageAnalysisResponse, originalText: string) => {
    setActiveAnalysis({ result, text: originalText });
    navigateTo('AnalysisResult');
  };

  const handleTabSelect = (tab: BottomNavTab) => {
    switch (tab) {
      case 'home':
        setCurrentScreen('Home');
        break;
      case 'protect':
        setCurrentScreen('CallGuardian');
        break;
      case 'learn':
        setCurrentScreen('ScamSimulator');
        break;
      case 'family':
        setCurrentScreen('FamilyCircle');
        break;
      case 'profile':
        setCurrentScreen('Profile');
        break;
    }
  };

  switch (currentScreen) {
    case 'Splash':
      return <SplashScreen onReady={handleSplashReady} />;

    case 'LanguageSelect':
      return (
        <LanguageSelectionScreen
          onLanguageSelected={handleLanguageSelected}
          onBack={previousScreen ? () => setCurrentScreen(previousScreen) : undefined}
          isInitialSetup={!previousScreen}
        />
      );

    case 'Onboarding':
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;

    case 'Login':
      return (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onChangeLanguage={() => navigateTo('LanguageSelect')}
          onNavigateToSignUp={() => navigateTo('SignUp')}
        />
      );

    case 'SignUp':
      return (
        <SignUpScreen
          onSignUpSuccess={handleLoginSuccess}
          onNavigateToLogin={() => navigateTo('Login')}
        />
      );

    case 'MessageGuardian':
      return (
        <MessageGuardianScreen
          onBack={() => setCurrentScreen('Home')}
          onAnalysisSuccess={handleAnalysisSuccess}
        />
      );

    case 'AnalysisResult':
      if (!activeAnalysis) {
        return (
          <MessageGuardianScreen
            onBack={() => setCurrentScreen('Home')}
            onAnalysisSuccess={handleAnalysisSuccess}
          />
        );
      }
      return (
        <AnalysisResultScreen
          result={activeAnalysis.result}
          originalMessage={activeAnalysis.text}
          onAnalyzeAnother={() => setCurrentScreen('MessageGuardian')}
          onReturnHome={() => setCurrentScreen('Home')}
          onBack={() => setCurrentScreen('MessageGuardian')}
        />
      );

    case 'CallGuardian':
      return (
        <CallGuardianScreen
          onBack={() => setCurrentScreen('Home')}
          onSelectTab={handleTabSelect}
          onNavigateToUnifiedChecker={() => navigateTo('UnifiedChecker')}
        />
      );

    case 'UnifiedChecker':
      return (
        <UnifiedSafeCheckerScreen
          onBack={() => setCurrentScreen('CallGuardian')}
          onSelectTab={handleTabSelect}
          onNavigateToEmergency={() => navigateTo('Emergency')}
        />
      );

    case 'ScamLens':
      return <ScamLensScreen onBack={() => setCurrentScreen('Home')} />;

    case 'Emergency':
      return <EmergencyScreen onBack={() => setCurrentScreen('Home')} />;

    case 'FamilyCircle':
      return (
        <FamilyCircleScreen
          onBack={() => setCurrentScreen('Home')}
          onSelectTab={handleTabSelect}
          onNavigateToCaregiverDashboard={() => navigateTo('CaregiverDashboard')}
        />
      );

    case 'CaregiverDashboard':
      return (
        <CaregiverDashboardScreen
          onBack={() => setCurrentScreen('FamilyCircle')}
          onSelectTab={handleTabSelect}
          onNavigateToEmergency={() => navigateTo('Emergency')}
        />
      );

    case 'ScamSimulator':
      return (
        <ScamSimulatorScreen
          onBack={() => setCurrentScreen('Home')}
          onSelectTab={handleTabSelect}
          onNavigateToBankingSandbox={() => navigateTo('BankingSandbox')}
          onNavigateToAudioVisualLearning={() => navigateTo('AudioVisualLearning')}
          onNavigateToSafeBrowsing={() => navigateTo('SafeBrowsing')}
        />
      );

    case 'AudioVisualLearning':
      return (
        <AudioVisualLearningScreen
          onBack={() => setCurrentScreen('ScamSimulator')}
        />
      );

    case 'SafeBrowsing':
      return (
        <SafeBrowsingSimulatorScreen
          onBack={() => setCurrentScreen('ScamSimulator')}
          onSelectTab={handleTabSelect}
        />
      );

    case 'BankingSandbox':
      return (
        <BankingSandboxScreen
          onBack={() => setCurrentScreen('ScamSimulator')}
          onSelectTab={handleTabSelect}
        />
      );

    case 'VoiceGuardian':
      return (
        <VoiceGuardianScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigateToEmergency={() => navigateTo('Emergency')}
        />
      );

    case 'Notifications':
      return <NotificationsScreen onBack={() => setCurrentScreen('Home')} />;

    case 'Profile':
      return (
        <ProfileScreen
          onBack={() => setCurrentScreen('Home')}
          onChangeLanguage={() => navigateTo('LanguageSelect')}
          onLogout={() => setCurrentScreen('Login')}
        />
      );

    case 'ComponentShowcase':
      return <ComponentShowcaseScreen onBack={() => setCurrentScreen('Home')} />;

    case 'Home':
    default:
      return (
        <HomeScreen
          onNavigateToMessageGuardian={() => navigateTo('MessageGuardian')}
          onNavigateToCallGuardian={() => navigateTo('CallGuardian')}
          onNavigateToScamLens={() => navigateTo('ScamLens')}
          onNavigateToScamSimulator={() => navigateTo('ScamSimulator')}
          onNavigateToFamilyCircle={() => navigateTo('FamilyCircle')}
          onNavigateToVoiceGuardian={() => navigateTo('VoiceGuardian')}
          onNavigateToEmergency={() => navigateTo('Emergency')}
          onNavigateToNotifications={() => navigateTo('Notifications')}
          onNavigateToProfile={() => navigateTo('Profile')}
          onChangeLanguage={() => navigateTo('LanguageSelect')}
          onOpenShowcase={() => navigateTo('ComponentShowcase')}
        />
      );
  }
};

export default App;
