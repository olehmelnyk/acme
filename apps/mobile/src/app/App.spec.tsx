import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

describe('Basic test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('renders a component', () => {
    const { getByTestId } = render(
      <View testID="test">
        <Text>Test</Text>
      </View>
    );
    const element = getByTestId('test');
    expect(element).toBeDefined();
  });
});
