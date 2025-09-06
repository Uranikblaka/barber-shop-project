import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api';

// Mock fetch
global.fetch = vi.fn();

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should login successfully with valid credentials', async () => {
    const mockResponse = {
      token: 'mock-jwt-token',
      user: { id: 1, username: 'testuser', role: 'USER' }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.login({
      username: 'testuser',
      password: 'password123'
    });

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        }),
      })
    );
  });

  it('should handle login failure', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    await expect(
      apiClient.login({
        username: 'invalid',
        password: 'wrong'
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should register new user successfully', async () => {
    const mockResponse = {
      token: 'mock-jwt-token',
      user: { id: 1, username: 'newuser', role: 'USER' }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockResponse,
    });

    const result = await apiClient.register({
      username: 'newuser',
      password: 'password123',
      role: 'USER'
    });

    expect(result).toEqual(mockResponse);
  });
});