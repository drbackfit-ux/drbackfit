import { Timestamp } from 'firebase/firestore';

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
