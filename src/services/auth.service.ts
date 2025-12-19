"use client";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut as firebaseSignOut,
    ConfirmationResult,
    User,
    Auth
} from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { getFirebaseClientApp } from '@/lib/firebase/client';

let auth: Auth;

// Initialize auth lazily to avoid SSR issues
const getAuthInstance = () => {
    if (!auth) {
        auth = getAuth(getFirebaseClientApp());
    }
    return auth;
};

// Helper function to convert phone number to pseudo-email for password auth
// This allows phone users to have password-based authentication
export const phoneToEmail = (phoneNumber: string): string => {
    // Remove non-digit characters and create pseudo email
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `phone_${cleanPhone}@drbackfit.local`;
};

// Helper function to check if email is a phone-based pseudo email
export const isPhoneEmail = (email: string): boolean => {
    return email.startsWith('phone_') && email.endsWith('@drbackfit.local');
};

export const authService = {
    // Email authentication
    signUpWithEmail: async (email: string, password: string) => {
        const authInstance = getAuthInstance();
        return await createUserWithEmailAndPassword(authInstance, email, password);
    },

    signInWithEmail: async (email: string, password: string) => {
        const authInstance = getAuthInstance();
        return await signInWithEmailAndPassword(authInstance, email, password);
    },

    sendEmailVerification: async (user: User) => {
        return await sendEmailVerification(user);
    },

    // Phone authentication
    setupRecaptcha: (containerId: string): RecaptchaVerifier => {
        try {
            const authInstance = getAuthInstance();
            console.log('🔧 Setting up reCAPTCHA with container:', containerId);

            // Check if container exists
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('❌ reCAPTCHA container not found:', containerId);
                throw new Error(`reCAPTCHA container '${containerId}' not found in DOM`);
            }

            console.log('✅ reCAPTCHA container found:', container);

            // Firebase v9+ modular SDK: new RecaptchaVerifier(auth, containerId, parameters)
            const verifier = new RecaptchaVerifier(authInstance, containerId, {
                size: 'invisible',
                callback: () => {
                    // reCAPTCHA solved
                    console.log('✅ reCAPTCHA verified successfully');
                },
                'expired-callback': () => {
                    console.warn('⚠️ reCAPTCHA expired');
                }
            });

            console.log('✅ RecaptchaVerifier created successfully');
            return verifier;
        } catch (error: any) {
            console.error('❌ Error setting up reCAPTCHA:', error);
            throw error;
        }
    },

    sendPhoneOTP: async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
        try {
            const authInstance = getAuthInstance();
            console.log('📱 Sending OTP to:', phoneNumber);
            console.log('🔑 Firebase Project ID:', authInstance.app.options.projectId);
            console.log('🔑 Firebase Auth Domain:', authInstance.app.options.authDomain);

            const result = await signInWithPhoneNumber(authInstance, phoneNumber, recaptchaVerifier);
            console.log('✅ OTP sent successfully');
            return result;
        } catch (error: any) {
            console.error('❌ Error sending OTP:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // Provide more helpful error messages
            if (error.code === 'auth/internal-error') {
                console.error('🔍 DIAGNOSIS: auth/internal-error usually means:');
                console.error('1. Phone authentication is NOT enabled in Firebase Console');
                console.error('2. Go to: https://console.firebase.google.com/project/dr-backfit/authentication/providers');
                console.error('3. Enable the "Phone" sign-in method');
                console.error('4. Add localhost to authorized domains');
            } else if (error.code === 'auth/captcha-check-failed') {
                console.error('🔍 DIAGNOSIS: auth/captcha-check-failed usually means:');
                console.error('1. "localhost" is NOT in the authorized domains list');
                console.error('2. Go to: https://console.firebase.google.com/project/dr-backfit/authentication/settings');
                console.error('3. Click "Authorized domains" tab');
                console.error('4. Add "localhost" to the list');
                console.error('5. Save and try again');
            }

            throw error;
        }
    },

    verifyPhoneOTP: async (confirmationResult: ConfirmationResult, code: string) => {
        return await confirmationResult.confirm(code);
    },

    // Session management
    getCurrentUser: () => {
        const authInstance = getAuthInstance();
        return authInstance.currentUser;
    },

    signOut: async () => {
        const authInstance = getAuthInstance();
        return await firebaseSignOut(authInstance);
    },

    onAuthStateChanged: (callback: (user: User | null) => void) => {
        const authInstance = getAuthInstance();
        return authInstance.onAuthStateChanged(callback);
    }
};
