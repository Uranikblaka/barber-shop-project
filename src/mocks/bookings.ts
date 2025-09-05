import type { Booking } from '../types';

export const bookings: Booking[] = [
  {
    id: "booking_001",
    customerId: "customer_001",
    serviceId: "svc_signature_cut",
    barberId: "barber_marcus",
    date: "2025-01-15",
    time: "10:00",
    status: "confirmed",
    notes: "Regular customer, prefers scissors over clippers",
    totalPrice: 65,
    createdAt: "2025-01-12T14:30:00Z"
  },
  {
    id: "booking_002",
    customerId: "customer_002",
    serviceId: "svc_beard_trim",
    barberId: "barber_david",
    date: "2025-01-15",
    time: "14:30",
    status: "pending",
    totalPrice: 35,
    createdAt: "2025-01-13T09:15:00Z"
  }
];