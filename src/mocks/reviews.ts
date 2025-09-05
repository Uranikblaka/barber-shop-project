import type { Review } from '../types';

export const reviews: Review[] = [
  {
    id: "review_001",
    customerId: "customer_001",
    customerName: "John S.",
    customerAvatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
    rating: 5,
    comment: "Marcus gave me the best haircut I've had in years. Attention to detail is incredible, and the atmosphere is perfect. Highly recommend!",
    serviceId: "svc_signature_cut",
    barberId: "barber_marcus",
    createdAt: "2025-01-08T15:30:00Z"
  },
  {
    id: "review_002",
    customerId: "customer_002",
    customerName: "Michael J.",
    rating: 5,
    comment: "The hot towel shave experience was amazing. Very relaxing and professional service. Will definitely be back.",
    serviceId: "svc_hot_towel_shave",
    barberId: "barber_marcus",
    createdAt: "2025-01-05T11:20:00Z"
  },
  {
    id: "review_003",
    customerId: "customer_003",
    customerName: "David W.",
    rating: 4,
    comment: "Great fade by David! He really knows modern styles and gave me exactly what I was looking for.",
    barberId: "barber_david",
    createdAt: "2025-01-03T14:45:00Z"
  },
  {
    id: "review_004",
    customerId: "customer_004",
    customerName: "Carlos M.",
    customerAvatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg",
    rating: 5,
    comment: "Antonio's creativity is unmatched. He transformed my look completely and I couldn't be happier with the result.",
    barberId: "barber_antonio",
    createdAt: "2024-12-28T16:15:00Z"
  },
  {
    id: "review_005",
    customerId: "customer_005",
    customerName: "Robert K.",
    rating: 5,
    comment: "Exceptional service and quality. The attention to detail and professional atmosphere make this place stand out.",
    createdAt: "2024-12-25T09:30:00Z"
  }
];