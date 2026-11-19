import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { HomeScreen } from '../src/screens/HomeScreen';
import { StorageService, SecureKeys } from '../src/services/storage';
import { UserProfileService } from '../src/services/userProfile';
import i18n from '../src/i18n';

describe('RAKSHON – Dynamic User Name in Home Dashboard', () => {
  beforeEach(async () => {
    StorageService._resetAllForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  afterEach(() => {
    StorageService._resetAllForTesting();
  });

  it('1. Account A with saved name displays dynamic greeting "Namaste, Sarvadnya! 👋"', async () => {
    // Authenticate Account A
    await StorageService.setSecureCredential(SecureKeys.USER_PHONE_HASH, '+91 98765 00001');
    await StorageService.setUserFullNameForUser('+91 98765 00001', 'Sarvadnya');

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HomeScreen />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    const root = tree!.root;
    expect(root.findByProps({ children: 'Namaste, Sarvadnya! 👋' })).toBeDefined();
    expect(
      root.findByProps({
        children: "Your digital safety starts here. We're here to help you stay safe online.",
      })
    ).toBeDefined();
  });

  it('2. Account B with saved name displays dynamic greeting "Namaste, Rahul! 👋"', async () => {
    // Authenticate Account B
    await StorageService.setSecureCredential(SecureKeys.USER_PHONE_HASH, '+91 98765 00002');
    await StorageService.setUserFullNameForUser('+91 98765 00002', 'Rahul');

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HomeScreen />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    const root = tree!.root;
    expect(root.findByProps({ children: 'Namaste, Rahul! 👋' })).toBeDefined();
  });

  it('3. Account with empty or missing profile name displays "Welcome to Rakshon! 👋"', async () => {
    // Authenticate Account with no name set
    await StorageService.setSecureCredential(SecureKeys.USER_PHONE_HASH, '+91 98765 00003');
    await StorageService.setUserFullNameForUser('+91 98765 00003', '');

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HomeScreen />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    const root = tree!.root;
    expect(root.findByProps({ children: 'Welcome to Rakshon! 👋' })).toBeDefined();
  });

  it('4. Profile loading state does NOT display previous or another user\'s name', async () => {
    // Hang profile resolution
    let resolveProfile: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveProfile = resolve;
    });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <HomeScreen loadProfile={() => pendingPromise as Promise<any>} />
      );
    });

    const root = tree!.root;
    // Loading state shows safe default greeting, not leaking any other user's name
    expect(root.findByProps({ children: 'Welcome to Rakshon! 👋' })).toBeDefined();

    // Now resolve with name
    await act(async () => {
      resolveProfile!({ fullName: 'Priya' });
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    expect(root.findByProps({ children: 'Namaste, Priya! 👋' })).toBeDefined();
  });

  it('5. Profile API failure safely falls back to "Welcome to Rakshon! 👋" gracefully', async () => {
    const failingProfileLoader = async () => {
      throw new Error('Network timeout connecting to backend profile service');
    };

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HomeScreen loadProfile={failingProfileLoader} />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    const root = tree!.root;
    expect(root.findByProps({ children: 'Welcome to Rakshon! 👋' })).toBeDefined();
  });

  it('6. Logout from Account A and login as Account B: Account A name is never visible for Account B', async () => {
    // Step 1: User A logs in as Sarvadnya
    await StorageService.setSecureCredential(SecureKeys.USER_PHONE_HASH, '+91 98765 11111');
    await StorageService.setUserFullNameForUser('+91 98765 11111', 'Sarvadnya');

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HomeScreen />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });
    expect(tree!.root.findByProps({ children: 'Namaste, Sarvadnya! 👋' })).toBeDefined();

    // Step 2: User A logs out
    await act(async () => {
      await UserProfileService.logout();
    });

    // Verify session credentials are wiped
    const activePhone = await StorageService.getSecureCredential(SecureKeys.USER_PHONE_HASH);
    expect(activePhone).toBeNull();

    // Step 3: User B logs in as Priya
    await StorageService.setSecureCredential(SecureKeys.USER_PHONE_HASH, '+91 98765 22222');
    await StorageService.setUserFullNameForUser('+91 98765 22222', 'Priya');

    await act(async () => {
      tree = renderer.create(<HomeScreen />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    // Sarvadnya is NOT shown, Priya IS shown
    expect(tree!.root.findAllByProps({ children: 'Namaste, Sarvadnya! 👋' }).length).toBe(0);
    expect(tree!.root.findByProps({ children: 'Namaste, Priya! 👋' })).toBeDefined();
  });

  it('7. Localization: displays dynamic greeting in Hindi and Marathi correctly', async () => {
    await StorageService.setSecureCredential(SecureKeys.USER_PHONE_HASH, '+91 98765 88888');
    await StorageService.setUserFullNameForUser('+91 98765 88888', 'राहुल');

    // Hindi
    await act(async () => {
      await i18n.changeLanguage('hi');
    });

    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HomeScreen />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    expect(tree!.root.findByProps({ children: 'नमस्ते, राहुल! 👋' })).toBeDefined();
    expect(
      tree!.root.findByProps({
        children: 'आपकी डिजिटल सुरक्षा यहाँ से शुरू होती है। हम आपको ऑनलाइन सुरक्षित रखने के लिए यहाँ हैं।',
      })
    ).toBeDefined();

    // Marathi
    await act(async () => {
      await i18n.changeLanguage('mr');
    });

    await act(async () => {
      tree = renderer.create(<HomeScreen />);
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });

    expect(tree!.root.findByProps({ children: 'नमस्ते, राहुल! 👋' })).toBeDefined();
    expect(
      tree!.root.findByProps({
        children: 'तुमची डिजिटल सुरक्षितता येथून सुरू होते. आम्ही तुम्हाला ऑनलाइन सुरक्षित ठेवण्यासाठी येथे आहोत.',
      })
    ).toBeDefined();
  });
});
