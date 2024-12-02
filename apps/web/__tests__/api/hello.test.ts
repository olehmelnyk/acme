import { describe, it, expect } from 'vitest';
import { GET } from '../../app/api/hello/route';

describe('Hello API', () => {
  it('should return the correct response', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Hello from API' });
  });
});
