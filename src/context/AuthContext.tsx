"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, ConfirmationResult } from 'firebase/auth';
import { authService, phoneToEmail } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { UserProfile, SignUpData } from '@/models/user.model';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Email methods
  signUpWithEmail: (data: SignUpData) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;

  // Phone OTP methods (for verification during signup/password reset)
  sendPhoneOTP: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPhoneOTPAndCreateAccount: (confirmationResult: ConfirmationResult, code: string, userData: SignUpData) => Promise<void>;

  // Phone password methods
  signInWithPhone: (phoneNumber: string, password: string) => Promise<void>;

  // Profile management
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Session management
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (fbUser: FirebaseUser | null) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const profile = await userService.getUserProfile(fbUser.uid);
          setUser(profile);

          // Update last login
          if (profile) {
            await userService.updateLastLogin(fbUser.uid);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email signup
  const signUpWithEmail = async (data: SignUpData) => {
    if (!data.email) throw new Error('Email is required');

    try {
      const userCredential = await authService.signUpWithEmail(data.email, data.password);
      await authService.sendEmailVerification(userCredential.user);

      await userService.createUserProfile(userCredential.user.uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`,
        authMethod: 'email',
        emailVerified: false,
        phoneVerified: false,
        phoneNumber: null,
        photoURL: null,
        uid: userCredential.user.uid,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
    } catch (error: any) {
      console.error('Email signup error:', error);
      throw new Error(error.message || 'Failed to sign up with email');
    }
  };

  // Email signin
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await authService.signInWithEmail(email, password);

      // Verify user profile exists in Firestore
      if (userCredential?.user) {
        const profile = await userService.getUserProfile(userCredential.user.uid);
        if (!profile) {
          // User exists in Firebase Auth but not in Firestore - sign them out
          await authService.signOut();
          throw new Error('Account not found. Please sign up first.');
        }
      }
    } catch (error: any) {
      // Re-throw custom errors we created (like 'Account not found')
      if (error?.message?.includes('Account not found') ||
        error?.message?.includes('Please sign up')) {
        throw error;
      }

      // Handle specific Firebase error codes
      const errorCode = error?.code || '';

      if (errorCode === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      }
      if (errorCode === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
      }
      if (errorCode === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      }
      if (errorCode === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      if (errorCode === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      // For any error that contains "not found" or "invalid" in the message
      if (error?.message?.toLowerCase().includes('not found') ||
        error?.message?.toLowerCase().includes('invalid')) {
        throw new Error('Invalid credentials. Please check your email and password or sign up if you don\'t have an account.');
      }
      throw new Error(error?.message || 'Failed to sign in. Please try again.');
    }
  };

  // Send OTP for phone verification (used during signup and password reset)
  const sendPhoneOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      const recaptcha = authService.setupRecaptcha('recaptcha-container');
      const confirmationResult = await authService.sendPhoneOTP(phoneNumber, recaptcha);
      return confirmationResult;
    } catch (error: any) {
      console.error('Send phone OTP error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  // Verify OTP and create account with phone+password
  const verifyPhoneOTPAndCreateAccount = async (confirmationResult: ConfirmationResult, code: string, userData: SignUpData) => {
    if (!userData.phoneNumber) throw new Error('Phone number is required');

    try {
      // First verify the OTP
      await authService.verifyPhoneOTP(confirmationResult, code);

      // Now sign out from phone auth (we'll create email-based account)
      await authService.signOut();

      // Create a pseudo-email from phone number
      const pseudoEmail = phoneToEmail(userData.phoneNumber);

      // Create Firebase user with email (pseudo) and password
      const userCredential = await authService.signUpWithEmail(pseudoEmail, userData.password);

      // Create user profile in Firestore
      await userService.createUserProfile(userCredential.user.uid, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: pseudoEmail, // Store the pseudo email
        displayName: `${userData.firstName} ${userData.lastName}`,
        authMethod: 'phone',
        emailVerified: false,
        phoneVerified: true,
        photoURL: null,
        uid: userCredential.user.uid,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
    } catch (error: any) {
      console.error('Phone signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Phone + password signin
  const signInWithPhone = async (phoneNumber: string, password: string) => {
    try {
      // Convert phone to pseudo email
      const pseudoEmail = phoneToEmail(phoneNumber);
      // Sign in with the pseudo email and password
      const userCredential = await authService.signInWithEmail(pseudoEmail, password);

      // Verify user profile exists in Firestore
      if (userCredential?.user) {
        const profile = await userService.getUserProfile(userCredential.user.uid);
        if (!profile) {
          // User exists in Firebase Auth but not in Firestore - sign them out
          await authService.signOut();
          throw new Error('Account not found. Please sign up first.');
        }
      }
    } catch (error: any) {
      // Re-throw custom errors we created (like 'Account not found')
      if (error?.message?.includes('Account not found') ||
        error?.message?.includes('Please sign up')) {
        throw error;
      }

      // Handle specific Firebase error codes
      const errorCode = error?.code || '';

      if (errorCode === 'auth/user-not-found') {
        throw new Error('No account found with this phone number. Please sign up first.');
      }
      if (errorCode === 'auth/invalid-credential') {
        throw new Error('Invalid phone number or password. Please check your credentials or sign up if you don\'t have an account.');
      }
      if (errorCode === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      }
      if (errorCode === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      // For any error that contains "not found" or "invalid" in the message
      if (error?.message?.toLowerCase().includes('not found') ||
        error?.message?.toLowerCase().includes('invalid')) {
        throw new Error('Invalid credentials. Please check your phone number and password or sign up if you don\'t have an account.');
      }
      throw new Error(error?.message || 'Failed to sign in. Please try again.');
    }
  };

  // Refresh user profile from Firestore
  const refreshUser = async () => {
    if (!firebaseUser) return;
    try {
      const profile = await userService.getUserProfile(firebaseUser.uid);
      setUser(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser) throw new Error('Not authenticated');
    try {
      await userService.updateUserProfile(firebaseUser.uid, data);
      // Refresh local state
      await refreshUser();
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      isAuthenticated: !!user,
      isLoading,
      signUpWithEmail,
      signInWithEmail,
      sendPhoneOTP,
      verifyPhoneOTPAndCreateAccount,
      signInWithPhone,
      updateProfile,
      refreshUser,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};