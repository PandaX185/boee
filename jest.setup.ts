import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import type ReactType from 'react';
import type * as RNType from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({
    exists: false,
    uri: 'file:///cache/test.md',
    delete: jest.fn(),
    create: jest.fn(),
    write: jest.fn(),
  })),
  Paths: { cache: { uri: 'file:///cache' } },
}));

jest.mock('@react-native-community/slider', () => {
  const React = jest.requireActual('react') as typeof ReactType;
  const RN = jest.requireActual('react-native') as typeof RNType;
  return function MockSlider(props: { testID?: string; [key: string]: unknown }) {
    return React.createElement(RN.View, {
      ...props,
      testID: props.testID ?? 'mock-slider',
    } as never);
  };
});
