import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api';

// Mock fetch
global.fetch = vi.fn();

describe('Booking System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock auth token
    localStorage.setItem('auth_token', 'mock-token');
  });

  it('should create appointment successfully', async () => {
    const mockAppointment = {
      id: 1,
      user_id: 1,
      service_id: 1,
      date: '2024-01-25',
      time: '10:00',
      status: 'confirmed',
      total_price: 65.00
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockAppointment,
    });

    const result = await apiClient.createAppointment({
      service_id: '1',
      date: '2024-01-25',
      time: '10:00'
    });

    expect(result).toEqual(mockAppointment);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/appointments',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        }),
        body: JSON.stringify({
          service_id: '1',
          date: '2024-01-25',
          time: '10:00'
        }),
      })
    );
  });

  it('should handle time slot conflict', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'This time slot is already booked' }),
    });

    await expect(
      apiClient.createAppointment({
        service_id: '1',
        date: '2024-01-25',
        time: '10:00'
      })
    ).rejects.toThrow('This time slot is already booked');
  });

  it('should fetch available time slots', async () => {
    const mockSlots = ['09:00', '09:30', '10:00', '10:30'];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSlots,
    });

    const result = await apiClient.getAvailableSlots('2024-01-25', '1');

    expect(result).toEqual(mockSlots);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/availability?date=2024-01-25&serviceId=1',
      expect.any(Object)
    );
  });

  it('should fetch user appointments', async () => {
    const mockAppointments = [
      {
        id: 1,
        service_name: 'Signature Cut',
        date: '2024-01-25',
        time: '10:00',
        status: 'confirmed'
      }
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAppointments,
    });

    const result = await apiClient.getAppointments();

    expect(result).toEqual(mockAppointments);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/appointments',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token',
        }),
      })
    );
  });
});