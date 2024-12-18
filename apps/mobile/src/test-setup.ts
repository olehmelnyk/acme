import { cleanup } from '@testing-library/react-native';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock react-native modules
vi.mock('react-native', () => ({
  Platform: { 
    OS: 'ios', 
    select: vi.fn((obj) => obj.ios) 
  },
  StyleSheet: {
    create: (styles: Record<string, any>) => styles,
  },
  Text: ({ children, testID }: any) => children,
  View: ({ children, testID }: any) => children,
  Image: ({ source, testID }: any) => null,
  ScrollView: ({ children, testID }: any) => children,
  Dimensions: {
    get: vi.fn().mockReturnValue({ width: 375, height: 812 }),
  },
}));
