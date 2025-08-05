export interface Address {
  street: string;
  city: string;
  district: string;
  province: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatar: string;
  address: Address;
  role: 'user' | 'admin';
  isActive: boolean;
  registeredAt: string;
  lastLogin: string;
}
