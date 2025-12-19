/**
 * Pin Code Validator for Delhi NCR and Nearby States
 * 
 * This utility validates whether a pin code is serviceable for delivery.
 * Serviceable areas include: Delhi, Haryana, Uttar Pradesh, Rajasthan, and Punjab
 */

interface PinCodeRange {
    state: string;
    ranges: { start: number; end: number }[];
}

/**
 * Serviceable pin code ranges for Delhi NCR and nearby states
 */
const SERVICEABLE_REGIONS: PinCodeRange[] = [
    {
        state: "Delhi",
        ranges: [
            { start: 110001, end: 110097 }
        ]
    },
    {
        state: "Haryana",
        ranges: [
            { start: 120001, end: 136156 }
        ]
    },
    {
        state: "Uttar Pradesh",
        ranges: [
            { start: 200001, end: 285223 }
        ]
    },
    {
        state: "Rajasthan",
        ranges: [
            { start: 300001, end: 345034 }
        ]
    },
    {
        state: "Punjab",
        ranges: [
            { start: 140001, end: 160104 }
        ]
    }
];

/**
 * Validates if a pin code is serviceable for delivery
 * @param pincode - The pin code to validate (string)
 * @returns boolean - true if serviceable, false otherwise
 */
export function isPincodeServiceable(pincode: string): boolean {
    // Remove any whitespace and validate format
    const cleanPincode = pincode.trim();

    // Check if pincode is 6 digits
    if (!/^\d{6}$/.test(cleanPincode)) {
        return false;
    }

    const pincodeNumber = parseInt(cleanPincode, 10);

    // Check if pincode falls within any serviceable range
    for (const region of SERVICEABLE_REGIONS) {
        for (const range of region.ranges) {
            if (pincodeNumber >= range.start && pincodeNumber <= range.end) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Gets the state/region name for a given pin code
 * @param pincode - The pin code to check
 * @returns string - State name or "Unknown" if not in serviceable areas
 */
export function getRegionFromPincode(pincode: string): string {
    const cleanPincode = pincode.trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
        return "Unknown";
    }

    const pincodeNumber = parseInt(cleanPincode, 10);

    for (const region of SERVICEABLE_REGIONS) {
        for (const range of region.ranges) {
            if (pincodeNumber >= range.start && pincodeNumber <= range.end) {
                return region.state;
            }
        }
    }

    return "Unknown";
}

/**
 * Gets a list of all serviceable states
 * @returns string[] - Array of serviceable state names
 */
export function getServiceableStates(): string[] {
    return SERVICEABLE_REGIONS.map(region => region.state);
}
