import { Timestamp } from 'firebase/firestore';

// Address interface for saved shipping addresses
export interface Address {
  id: string;
  label: string;          // e.g., "Home", "Office", "Other"
  firstName: string;
  lastName: string;
  address: string;        // Street address
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string | null;
  authMethod: 'email' | 'phone';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
  isActive: boolean;
  role?: 'user' | 'admin';
  addresses?: Address[];  // User's saved shipping addresses
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  authMethod: 'email' | 'phone';
}

export interface AuthMethod {
  type: 'email' | 'phone';
  label: string;
  icon: string;
  description: string;
}
