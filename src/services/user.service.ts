"use client";

import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseClientDb } from '@/lib/firebase/client';
import { UserProfile } from '@/models/user.model';

const getDb = () => {
    return getFirebaseClientDb();
};

export const userService = {
    createUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        const db = getDb();
        await setDoc(doc(db, 'users', uid), {
            ...data,
            uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            isActive: true
        });
    },

    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const db = getDb();
        const docSnap = await getDoc(doc(db, 'users', uid));
        return docSnap.exists() ? docSnap.data() as UserProfile : null;
    },

    updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        const db = getDb();
        await updateDoc(doc(db, 'users', uid), {
            ...data,
            updatedAt: serverTimestamp()
        });
    },

    updateLastLogin: async (uid: string) => {
        const db = getDb();
        await updateDoc(doc(db, 'users', uid), {
            lastLoginAt: serverTimestamp()
        });
    }
};
