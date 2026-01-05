"use client";

// This page uses client-side cart context which depends on cookies
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, MapPin, Star, ChevronDown, ChevronUp } from "lucide-react";
import { indianStates, getCitiesByState, getPinCodeByCity } from "@/data/india-locations";
import { OrderCreateInput, calculateItemSubtotal } from "@/models/Order";
import { PaymentMethod } from "@/models/OrderStatus";
import { userService } from "@/services/user.service";
import { Address } from "@/models/user.model";

export default function Checkout() {
  const { items, getTotal, clearCart, isLoaded } = useCart();
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: user?.phoneNumber || "",
  });

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("Home");

  // Fetch saved addresses on load
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!firebaseUser) {
        setIsLoadingAddresses(false);
        return;
      }
      try {
        const addresses = await userService.getAddresses(firebaseUser.uid);
        setSavedAddresses(addresses);

        // Auto-select default address if available
        const defaultAddr = addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          selectAddress(defaultAddr);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [firebaseUser]);

  // Select an address and populate form
  const selectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setFormData(prev => ({
      ...prev,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
    }));
  };

  // Clear selection and form for entering new address
  const enterNewAddress = () => {
    setSelectedAddressId(null);
    setFormData(prev => ({
      ...prev,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: user?.phoneNumber || "",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddressId(null); // Clear selection when manually editing
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Get available cities based on selected state
  const availableCities = getCitiesByState(formData.state);

  // Handle state change - reset city and zipCode
  const handleStateChange = (value: string) => {
    setSelectedAddressId(null); // Clear selection when manually editing
    setFormData((prev) => ({
      ...prev,
      state: value,
      city: "",
      zipCode: "",
    }));
  };

  // Handle city change - auto-populate zipCode
  const handleCityChange = (value: string) => {
    setSelectedAddressId(null); // Clear selection when manually editing
    const pinCode = getPinCodeByCity(formData.state, value);
    setFormData((prev) => ({
      ...prev,
      city: value,
      zipCode: pinCode,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user || !firebaseUser) {
      toast.error("Please sign in to place an order");
      router.push("/sign-in?redirect=/checkout");
      return;
    }

    // Validate required shipping fields
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.address) {
      toast.error("Please enter your street address");
      return;
    }
    if (!formData.state) {
      toast.error("Please select a state");
      return;
    }
    if (!formData.city) {
      toast.error("Please select a city");
      return;
    }
    if (!formData.zipCode) {
      toast.error("Please ensure city is selected for PIN code");
      return;
    }
    if (!formData.phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate totals
      const subtotal = getTotal();
      const shipping = 0; // Free shipping
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + shipping + tax;

      // Save new address if user opted to
      if (saveNewAddress && !selectedAddressId) {
        try {
          await userService.addAddress(firebaseUser.uid, {
            label: newAddressLabel,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            phone: formData.phone,
            isDefault: savedAddresses.length === 0
          });
        } catch (error) {
          console.error("Error saving address:", error);
          // Don't fail the order, just log the error
        }
      }

      // Prepare order data
      const orderData: OrderCreateInput = {
        customer: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: "IN",
        },
        items: items.map((item) => ({
          productId: item.id,
          title: item.title,
          slug: item.slug,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          subtotal: calculateItemSubtotal(item.price, item.quantity),
        })),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        total: Number(total.toFixed(2)),
        payment: {
          method: PaymentMethod.COD, // Default to COD as payment gateway is not yet implemented
        },
      };

      // Get auth token
      const token = await firebaseUser.getIdToken();

      console.log("=== Checkout: Creating Order ===");
      console.log("Order Data:", orderData);

      // Create order via API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log("API Response Status:", response.status, response.statusText);
      const text = await response.text();
      console.log("API Response Text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse API response as JSON:", e);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error("Order creation failed:", data);
        const errorMessage = data.message || data.error || "Failed to create order";
        const errorDetails = data.details ? JSON.stringify(data.details, null, 2) : "";
        throw new Error(`${errorMessage}${errorDetails ? `\n\nDetails:\n${errorDetails}` : ""}`);
      }

      // Success!
      toast.success("Order placed successfully!");
      clearCart();

      // Redirect to order confirmation page
      router.push(
        `/order-confirmation?orderNumber=${data.order.orderNumber}`
      );
    } catch (error) {
      console.error("=== Checkout Error ===");
      console.error("Error creating order:", error);

      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to place order. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to cart if empty (client-side only)
  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push("/cart");
    }
  }, [isLoaded, items, router]);

  // Show loading state during SSR or when cart is empty/loading
  if (!isLoaded || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Checkout
          </h1>
          <p className="text-lg text-muted-foreground">Complete your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="p-6">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </Card>

              {/* Saved Addresses Section */}
              {firebaseUser && (
                <Card className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-serif font-bold text-foreground">
                        Saved Addresses
                      </h2>
                      {savedAddresses.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({savedAddresses.length})
                        </span>
                      )}
                    </div>
                    {showSavedAddresses ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {showSavedAddresses && (
                    <div className="mt-4">
                      {isLoadingAddresses ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : savedAddresses.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No saved addresses. Fill in the form below and check "Save this address" to save for future orders.
                        </p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          {savedAddresses.map((address) => (
                            <div
                              key={address.id}
                              onClick={() => selectAddress(address)}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === address.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                                }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-sm">{address.label}</span>
                                {address.isDefault && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                                    <Star className="h-2.5 w-2.5" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium">
                                {address.firstName} {address.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {address.address}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {address.city}, {address.state} - {address.zipCode}
                              </p>
                            </div>
                          ))}

                          {/* Enter New Address Card */}
                          <div
                            onClick={enterNewAddress}
                            className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${selectedAddressId === null && formData.address === ""
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                              }`}
                          >
                            <MapPin className="h-6 w-6 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Enter New Address
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {/* Shipping Address */}
              <Card className="p-6">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      {selectedAddressId ? (
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          placeholder="State"
                          className="bg-muted/50"
                        />
                      ) : (
                        <Select
                          value={formData.state}
                          onValueChange={handleStateChange}
                          required
                        >
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map((state) => (
                              <SelectItem key={state.code} value={state.name}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      {selectedAddressId ? (
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          placeholder="City"
                          className="bg-muted/50"
                        />
                      ) : (
                        <Select
                          value={formData.city}
                          onValueChange={handleCityChange}
                          disabled={!formData.state}
                          required
                        >
                          <SelectTrigger id="city">
                            <SelectValue placeholder={formData.state ? "Select City" : "Select State first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCities.map((city) => (
                              <SelectItem key={city.name} value={city.name}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">PIN Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        placeholder={selectedAddressId ? "PIN Code" : "Select city to auto-fill"}
                        readOnly={!selectedAddressId}
                        className={selectedAddressId ? "bg-muted/50" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Save Address Option */}
                  {firebaseUser && !selectedAddressId && (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveAddress"
                          checked={saveNewAddress}
                          onCheckedChange={(checked) => setSaveNewAddress(checked as boolean)}
                        />
                        <Label htmlFor="saveAddress" className="text-sm font-normal cursor-pointer">
                          Save this address for future orders
                        </Label>
                      </div>

                      {saveNewAddress && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="addressLabel" className="text-sm">Address Label</Label>
                          <Select
                            value={newAddressLabel}
                            onValueChange={setNewAddressLabel}
                          >
                            <SelectTrigger id="addressLabel" className="w-40">
                              <SelectValue placeholder="Select label" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Office">Office</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 space-y-4">
                <h2 className="text-xl font-serif font-bold text-foreground">
                  Order Summary
                </h2>

                <Separator />

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-premium"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
