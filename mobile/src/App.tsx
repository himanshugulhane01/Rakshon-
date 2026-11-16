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
  SupportedLanguage,
} from './screens';
import { StorageService } from './services/storage';
import { MessageAnalysisResponse } from './services/analysisApi';

export type AppScreen =
  | 'Splash'
  | 'LanguageSelect'
  | 'Onboarding'
  | 'Login'
  | 'Home'
  | 'MessageGuardian'
  | 'AnalysisResult'
  | 'CallGuardian'
  | 'ScamLens'
  | 'Emergency'
  | 'FamilyCircle'
  | 'ScamSimulator'
  | 'VoiceGuardian';

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
      return <CallGuardianScreen onBack={() => setCurrentScreen('Home')} />;

    case 'ScamLens':
      return <ScamLensScreen onBack={() => setCurrentScreen('Home')} />;

    case 'Emergency':
      return <EmergencyScreen onBack={() => setCurrentScreen('Home')} />;

    case 'FamilyCircle':
      return <FamilyCircleScreen onBack={() => setCurrentScreen('Home')} />;

    case 'ScamSimulator':
      return <ScamSimulatorScreen onBack={() => setCurrentScreen('Home')} />;

    case 'VoiceGuardian':
      return (
        <VoiceGuardianScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigateToEmergency={() => navigateTo('Emergency')}
        />
      );

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
          onChangeLanguage={() => navigateTo('LanguageSelect')}
        />
      );
  }
};

export default App;
