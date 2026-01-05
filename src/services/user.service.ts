"use client";

import { doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getFirebaseClientDb } from '@/lib/firebase/client';
import { UserProfile, Address } from '@/models/user.model';

const getDb = () => {
    return getFirebaseClientDb();
};

// Generate unique ID for addresses
const generateAddressId = () => {
    return `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const userService = {
    createUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        const db = getDb();
        await setDoc(doc(db, 'users', uid), {
            ...data,
            uid,
            addresses: [],
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
    },

    // Address management methods
    addAddress: async (uid: string, addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> => {
        const db = getDb();
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data() as UserProfile;
        const existingAddresses = userData.addresses || [];

        // Create new address with ID
        const newAddress: Address = {
            ...addressData,
            id: generateAddressId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // If this is the first address or marked as default, update others
        let updatedAddresses = [...existingAddresses];
        if (newAddress.isDefault || existingAddresses.length === 0) {
            newAddress.isDefault = true;
            updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
        }

        updatedAddresses.push(newAddress);

        await updateDoc(doc(db, 'users', uid), {
            addresses: updatedAddresses,
            updatedAt: serverTimestamp()
        });

        return newAddress;
    },

    updateAddress: async (uid: string, addressId: string, addressData: Partial<Address>): Promise<void> => {
        const db = getDb();
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data() as UserProfile;
        let addresses = userData.addresses || [];

        const addressIndex = addresses.findIndex(addr => addr.id === addressId);
        if (addressIndex === -1) {
            throw new Error('Address not found');
        }

        // If setting this as default, remove default from others
        if (addressData.isDefault) {
            addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        addresses[addressIndex] = {
            ...addresses[addressIndex],
            ...addressData,
            updatedAt: new Date()
        };

        await updateDoc(doc(db, 'users', uid), {
            addresses,
            updatedAt: serverTimestamp()
        });
    },

    deleteAddress: async (uid: string, addressId: string): Promise<void> => {
        const db = getDb();
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data() as UserProfile;
        let addresses = userData.addresses || [];

        const addressToDelete = addresses.find(addr => addr.id === addressId);
        if (!addressToDelete) {
            throw new Error('Address not found');
        }

        addresses = addresses.filter(addr => addr.id !== addressId);

        // If we deleted the default address, set the first remaining as default
        if (addressToDelete.isDefault && addresses.length > 0) {
            addresses[0].isDefault = true;
        }

        await updateDoc(doc(db, 'users', uid), {
            addresses,
            updatedAt: serverTimestamp()
        });
    },

    setDefaultAddress: async (uid: string, addressId: string): Promise<void> => {
        const db = getDb();
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data() as UserProfile;
        let addresses = userData.addresses || [];

        const addressIndex = addresses.findIndex(addr => addr.id === addressId);
        if (addressIndex === -1) {
            throw new Error('Address not found');
        }

        // Set all to non-default, then set the selected one as default
        addresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
        }));

        await updateDoc(doc(db, 'users', uid), {
            addresses,
            updatedAt: serverTimestamp()
        });
    },

    getAddresses: async (uid: string): Promise<Address[]> => {
        const db = getDb();
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (!userDoc.exists()) {
            return [];
        }

        const userData = userDoc.data() as UserProfile;
        return userData.addresses || [];
    },

    getDefaultAddress: async (uid: string): Promise<Address | null> => {
        const addresses = await userService.getAddresses(uid);
        return addresses.find(addr => addr.isDefault) || addresses[0] || null;
    }
};
