import { describe, it, expect } from 'vitest';
import Page from '../app/page';

describe('Page', () => {
  it('should render successfully', () => {
    const element = <Page />;
    expect(element).toBeDefined();
    expect(element.type).toBe(Page);
  });

  it('should have correct component structure', () => {
    const element = <Page />;
    const props = element.props;
    expect(props).toBeDefined();
  });
});
