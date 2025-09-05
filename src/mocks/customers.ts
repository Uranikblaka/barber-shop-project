import type { Customer } from '../types';

export const customers: Customer[] = [
  {
    id: "customer_001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
    preferences: {
      preferredBarber: "barber_marcus",
      favoriteServices: ["svc_signature_cut", "svc_beard_trim"],
      notifications: true
    },
    addresses: [
      {
        id: "addr_001",
        type: "home",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        isDefault: true
      }
    ],
    createdAt: "2024-06-15T10:00:00Z"
  },
  {
    id: "customer_002",
    name: "Michael Johnson",
    email: "mike.johnson@email.com",
    phone: "+1 (555) 987-6543",
    preferences: {
      favoriteServices: ["svc_hot_towel_shave"],
      notifications: false
    },
    addresses: [],
    createdAt: "2024-08-22T14:30:00Z"
  }
];