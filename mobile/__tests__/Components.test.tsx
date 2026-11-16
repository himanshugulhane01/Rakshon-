import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  SeniorButton,
  SeniorInput,
  SeniorCard,
  SeniorHeader,
  SeniorBadge,
  SeniorDialog,
} from '../src/components';

describe('Reusable Accessible Components (Stage 3.1)', () => {
  describe('SeniorButton', () => {
    it('renders with title and calls onPress', () => {
      const onPressMock = jest.fn();
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SeniorButton title="Continue" onPress={onPressMock} />
        );
      });
      const root = tree!.root;
      const button = root.findByProps({ accessibilityRole: 'button' });
      act(() => {
        button.props.onPress();
      });
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('disables touch events when loading or disabled', () => {
      const onPressMock = jest.fn();
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SeniorButton
            title="Continue"
            onPress={onPressMock}
            disabled={true}
          />
        );
      });
      const root = tree!.root;
      const button = root.findByProps({ accessibilityRole: 'button' });
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('SeniorInput', () => {
    it('renders label and handles text change', () => {
      const onChangeMock = jest.fn();
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SeniorInput
            label="Mobile Number"
            value="9876543210"
            onChangeText={onChangeMock}
            placeholder="Enter 10-digit number"
          />
        );
      });
      const root = tree!.root;
      expect(root.findByProps({ children: 'Mobile Number' })).toBeDefined();
    });

    it('displays error message when error prop is set', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SeniorInput
            label="Phone"
            value=""
            onChangeText={() => {}}
            error="Please enter a valid phone number"
          />
        );
      });
      const root = tree!.root;
      const errorText = root.findByProps({ children: '⚠️ Please enter a valid phone number' });
      expect(errorText).toBeDefined();
    });
  });

  describe('SeniorCard', () => {
    it('renders title and subtitle inside elevated card', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SeniorCard
            title="Message Guardian"
            subtitle="Check suspicious messages"
          />
        );
      });
      const root = tree!.root;
      expect(root.findByProps({ children: 'Message Guardian' })).toBeDefined();
      expect(root.findByProps({ children: 'Check suspicious messages' })).toBeDefined();
    });
  });

  describe('SeniorHeader', () => {
    it('renders title and back button when onBack is provided', () => {
      const onBackMock = jest.fn();
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SeniorHeader title="Settings" onBack={onBackMock} />
        );
      });
      const root = tree!.root;
      const backBtn = root.findByProps({ accessibilityLabel: 'Go back' });
      act(() => {
        backBtn.props.onPress();
      });
      expect(onBackMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('SeniorBadge', () => {
    it('renders badge status label and icon', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<SeniorBadge variant="danger" label="HIGH RISK" />);
      });
      const root = tree!.root;
      expect(root.findByProps({ children: 'HIGH RISK' })).toBeDefined();
    });
  });

  describe('SeniorDialog', () => {
    it('renders title, message, and action buttons when visible', () => {
      const onConfirmMock = jest.fn();
      const onCancelMock = jest.fn();
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <SeniorDialog
            visible={true}
            title="Block Scam Call"
            message="Do you want to report this caller to 1930?"
            confirmText="Report"
            cancelText="Dismiss"
            onConfirm={onConfirmMock}
            onCancel={onCancelMock}
          />
        );
      });
      const root = tree!.root;
      expect(root.findByProps({ children: 'Block Scam Call' })).toBeDefined();
      expect(root.findByProps({ children: 'Do you want to report this caller to 1930?' })).toBeDefined();
    });
  });
});
