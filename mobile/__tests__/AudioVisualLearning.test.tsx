import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AudioVisualLearningScreen } from '../src/screens/AudioVisualLearningScreen';
import { AUDIO_VISUAL_MODULES, LearningModule } from '../src/services/learningCentreData';
import { StorageService } from '../src/services/storage';
import { VoiceGuardianService } from '../src/services/voiceGuardianService';
import i18n from '../src/i18n';

describe('Feature 2: Audio-Visual Learning Centre', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    StorageService._resetAllForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    StorageService._resetAllForTesting();
  });

  it('1. Provides all 8 required fraud awareness modules', () => {
    expect(AUDIO_VISUAL_MODULES.length).toBe(8);
    const moduleIds = AUDIO_VISUAL_MODULES.map((m) => m.id);
    expect(moduleIds).toEqual([
      'kyc_update',
      'otp_theft',
      'lottery_prize',
      'upi_fraud',
      'fake_officer',
      'phishing_links',
      'digital_arrest',
      'customer_support',
    ]);

    // Check multilingual content & quiz present in every module
    AUDIO_VISUAL_MODULES.forEach((mod: LearningModule) => {
      expect(mod.title.en).toBeTruthy();
      expect(mod.title.hi).toBeTruthy();
      expect(mod.title.mr).toBeTruthy();
      expect(mod.goldenRule.en).toBeTruthy();
      expect(mod.slides.length).toBeGreaterThanOrEqual(1);
      expect(mod.quiz.options.length).toBeGreaterThanOrEqual(2);
      expect(mod.quiz.options.some((o) => o.isCorrect)).toBe(true);
    });
  });

  it('2. Renders list of modules with progress bar and accessible controls', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(<AudioVisualLearningScreen onBack={jest.fn()} />);
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('Audio-Visual Learning Centre');
    expect(str).toContain('KYC Update Scams');
    expect(str).toContain('Digital Arrest Scams');
    expect(str).toContain('0%');
    expect(str).toContain('Mastered');
  });

  it('3. Opens module detail view and renders slides with audio controls', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <AudioVisualLearningScreen onBack={jest.fn()} initialModuleId="kyc_update" />
      );
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('KYC Update Scams');
    expect(str).toContain('Play Audio');
    expect(str).toContain('Replay');
    expect(str).toContain('Next Step');
  });

  it('4. Persists module learning progress in StorageService', async () => {
    await StorageService.saveAudioVisualModuleProgress('kyc_update', 1, true, 100);
    const stats = await StorageService.getAudioVisualProgress();
    expect(stats.completedCount).toBe(1);
    expect(stats.modules.kyc_update.isCompleted).toBe(true);
    expect(stats.modules.kyc_update.quizScore).toBe(100);
  });

  it('5. Supports English, Hindi, and Marathi translations', async () => {
    let tree: any;
    await act(async () => {
      await i18n.changeLanguage('hi');
      tree = renderer.create(<AudioVisualLearningScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('ऑडियो-विजुअल लर्निंग सेंटर');

    await act(async () => {
      await i18n.changeLanguage('mr');
      tree = renderer.create(<AudioVisualLearningScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('ऑडिओ-व्हिज्युअल लर्निंग सेंटर');
  });
});
