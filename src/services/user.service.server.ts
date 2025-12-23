import { getFirebaseAdminDb } from "@/lib/firebase/server";
import type { UserProfile } from "@/models/user.model";

const USERS_COLLECTION = "users";

// Convert Firestore timestamps to Date objects
const convertTimestamp = (timestamp: FirebaseFirestore.Timestamp | Date | null | undefined): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        return timestamp.toDate();
    }
    return new Date();
};

// Convert Firestore doc to UserProfile
const convertFirestoreDocToUser = (
    doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
): UserProfile & { id: string } => {
    const data = doc.data();
    if (!data) {
        throw new Error("Document data is undefined");
    }

    return {
        id: doc.id,
        uid: data.uid || doc.id,
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        displayName: data.displayName || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown",
        photoURL: data.photoURL || null,
        authMethod: data.authMethod || "email",
        emailVerified: data.emailVerified || false,
        phoneVerified: data.phoneVerified || false,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        lastLoginAt: convertTimestamp(data.lastLoginAt),
        isActive: data.isActive !== false, // Default to true
    };
};

export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "active" | "inactive";
    sortBy?: "createdAt" | "lastLoginAt" | "displayName" | "email";
    sortOrder?: "asc" | "desc";
}

export interface CustomerWithStats extends UserProfile {
    id: string;
    totalOrders?: number;
    totalSpent?: number;
}

export const userServiceServer = {
    /**
     * Get all customers with pagination and filtering
     */
    async getCustomers(
        params: CustomerQueryParams = {}
    ): Promise<{ customers: CustomerWithStats[]; total: number; hasMore: boolean }> {
        try {
            const db = getFirebaseAdminDb();

            const {
                limit: pageLimit = 20,
                sortBy = "createdAt",
                sortOrder = "desc",
                status = "all",
                search = "",
            } = params;

            // Get all users - we fetch all and filter client-side because
            // Firestore queries don't match documents where isActive is undefined,
            // but we want to treat undefined as active (same as getCustomerStats logic)
            let queryRef: FirebaseFirestore.Query = db.collection(USERS_COLLECTION);

            // Apply sorting
            queryRef = queryRef.orderBy(sortBy, sortOrder);

            const snapshot = await queryRef.get();

            let customers: CustomerWithStats[] = snapshot.docs.map(doc => {
                const user = convertFirestoreDocToUser(doc);
                return {
                    ...user,
                    totalOrders: 0,
                    totalSpent: 0,
                };
            });

            // Apply status filter (client-side to handle undefined isActive consistently)
            // The convertFirestoreDocToUser function normalizes isActive to true if undefined
            if (status === "active") {
                customers = customers.filter(customer => customer.isActive === true);
            } else if (status === "inactive") {
                customers = customers.filter(customer => customer.isActive === false);
            }

            // Apply search filter (client-side for flexibility)
            if (search) {
                const searchLower = search.toLowerCase();
                customers = customers.filter(customer =>
                    customer.displayName?.toLowerCase().includes(searchLower) ||
                    customer.email?.toLowerCase().includes(searchLower) ||
                    customer.phoneNumber?.includes(search) ||
                    customer.firstName?.toLowerCase().includes(searchLower) ||
                    customer.lastName?.toLowerCase().includes(searchLower)
                );
            }

            const total = customers.length;
            const hasMore = customers.length > pageLimit;

            // Apply pagination
            customers = customers.slice(0, pageLimit);

            return { customers, total, hasMore };
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw new Error(
                `Failed to fetch customers: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get a single customer by ID
     */
    async getCustomerById(uid: string): Promise<CustomerWithStats | null> {
        try {
            const db = getFirebaseAdminDb();
            const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();

            if (!userDoc.exists) {
                return null;
            }

            const user = convertFirestoreDocToUser(userDoc);
            return {
                ...user,
                totalOrders: 0,
                totalSpent: 0,
            };
        } catch (error) {
            console.error("Error fetching customer:", error);
            throw new Error(
                `Failed to fetch customer: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Get customer statistics
     */
    async getCustomerStats(): Promise<{
        totalCustomers: number;
        activeCustomers: number;
        newCustomersThisMonth: number;
    }> {
        try {
            const db = getFirebaseAdminDb();
            const snapshot = await db.collection(USERS_COLLECTION).get();

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let totalCustomers = 0;
            let activeCustomers = 0;
            let newCustomersThisMonth = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                totalCustomers++;

                if (data.isActive !== false) {
                    activeCustomers++;
                }

                const createdAt = convertTimestamp(data.createdAt);
                if (createdAt >= startOfMonth) {
                    newCustomersThisMonth++;
                }
            });

            return {
                totalCustomers,
                activeCustomers,
                newCustomersThisMonth,
            };
        } catch (error) {
            console.error("Error fetching customer stats:", error);
            throw new Error(
                `Failed to fetch customer stats: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Update customer status (active/inactive)
     */
    async updateCustomerStatus(uid: string, isActive: boolean): Promise<void> {
        try {
            const db = getFirebaseAdminDb();
            await db.collection(USERS_COLLECTION).doc(uid).update({
                isActive,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error("Error updating customer status:", error);
            throw new Error(
                `Failed to update customer status: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },

    /**
     * Delete a customer permanently (hard delete)
     */
    async deleteCustomer(uid: string): Promise<void> {
        try {
            const db = getFirebaseAdminDb();

            // Check if customer exists
            const customerDoc = await db.collection(USERS_COLLECTION).doc(uid).get();
            if (!customerDoc.exists) {
                throw new Error("Customer not found");
            }

            // Delete the customer document from Firestore
            await db.collection(USERS_COLLECTION).doc(uid).delete();

            console.log(`Customer ${uid} deleted successfully`);
        } catch (error) {
            console.error("Error deleting customer:", error);
            throw new Error(
                `Failed to delete customer: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    },
};
