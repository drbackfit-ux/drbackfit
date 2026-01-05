"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Package, Heart, Settings, LogOut, MapPin, Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { Address } from "@/models/user.model";
import { indianStates, getCitiesByState, getPinCodeByCity } from "@/data/india-locations";

const ADDRESS_LABELS = ["Home", "Office", "Other"];

export default function Account() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get the redirect URL that was passed (where user was before clicking account)
  const redirectAfterLogin = searchParams.get('redirect') || '/account';
  const { user, firebaseUser, isAuthenticated, isLoading, signOut, updateProfile, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    label: "Home",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    isDefault: false
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Pass the original page URL to sign-in so after login, user goes back there
      router.push(`/sign-in?redirect=${encodeURIComponent(redirectAfterLogin)}`);
    } else if (user) {
      setProfileData({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phoneNumber ?? ""
      });
      fetchOrders();
      fetchAddresses();
    }
  }, [isAuthenticated, isLoading, user, router, redirectAfterLogin]);

  const fetchOrders = async () => {
    try {
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      if (!firebaseUser) return;
      const userAddresses = await userService.getAddresses(firebaseUser.uid);
      setAddresses(userAddresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: "Cancelled by user via account page" })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Order cancelled successfully");
        fetchOrders(); // Refresh list
      } else {
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  // Address handlers
  const resetAddressForm = () => {
    setAddressFormData({
      label: "Home",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: user?.phoneNumber ?? "",
      isDefault: addresses.length === 0
    });
    setEditingAddress(null);
  };

  const openAddAddressDialog = () => {
    resetAddressForm();
    setIsAddressDialogOpen(true);
  };

  const openEditAddressDialog = (address: Address) => {
    setEditingAddress(address);
    setAddressFormData({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setIsAddressDialogOpen(true);
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Get available cities based on selected state
  const availableCities = getCitiesByState(addressFormData.state);

  // Handle state change - reset city and zipCode
  const handleStateChange = (value: string) => {
    setAddressFormData(prev => ({
      ...prev,
      state: value,
      city: "",
      zipCode: "",
    }));
  };

  // Handle city change - auto-populate zipCode
  const handleCityChange = (value: string) => {
    const pinCode = getPinCodeByCity(addressFormData.state, value);
    setAddressFormData(prev => ({
      ...prev,
      city: value,
      zipCode: pinCode,
    }));
  };

  const handleSaveAddress = async () => {
    if (!firebaseUser) return;

    // Validation
    if (!addressFormData.firstName || !addressFormData.lastName || !addressFormData.address ||
      !addressFormData.city || !addressFormData.state || !addressFormData.zipCode || !addressFormData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        // Update existing address
        await userService.updateAddress(firebaseUser.uid, editingAddress.id, addressFormData);
        toast.success("Address updated successfully");
      } else {
        // Add new address
        await userService.addAddress(firebaseUser.uid, addressFormData);
        toast.success("Address added successfully");
      }
      setIsAddressDialogOpen(false);
      fetchAddresses();
      resetAddressForm();
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!firebaseUser) return;
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await userService.deleteAddress(firebaseUser.uid, addressId);
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error(error.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!firebaseUser) return;

    try {
      await userService.setDefaultAddress(firebaseUser.uid, addressId);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error: any) {
      console.error("Error setting default address:", error);
      toast.error(error.message || "Failed to set default address");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Phone number handler - only allow digits and + sign
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow digits and + at the start
    value = value.replace(/[^\d+]/g, '');
    // Ensure + is only at the start
    if (value.includes('+')) {
      value = '+' + value.replace(/\+/g, '');
    }
    // Limit to 13 characters (+XX followed by 10 digits)
    value = value.slice(0, 13);
    setProfileData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number if provided
    if (profileData.phone) {
      const phoneDigits = profileData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 12) {
        toast.error("Phone number must be 10-12 digits (including country code)");
        return;
      }
    }

    setIsSaving(true);

    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email || null,
        phoneNumber: profileData.phone || null,
      });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const defaultAddress = addresses.find(addr => addr.isDefault);
  const otherAddresses = addresses.filter(addr => !addr.isDefault);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            My Account
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your profile, orders, and preferences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-1 p-1">
            <TabsTrigger
              value="profile"
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[10px] sm:text-xs md:flex-row md:gap-2 md:text-sm"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[10px] sm:text-xs md:flex-row md:gap-2 md:text-sm"
            >
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[10px] sm:text-xs md:flex-row md:gap-2 md:text-sm"
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[10px] sm:text-xs md:flex-row md:gap-2 md:text-sm"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile Information Card */}
              <Card className="p-8">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Profile Information
                </h2>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handlePhoneChange}
                      placeholder="+919876543210"
                      pattern="[+]?[0-9]{10,12}"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter 10-12 digits with country code (e.g., +919876543210)
                    </p>
                  </div>

                  <Separator />

                  <div className="flex gap-4">
                    <Button type="submit" className="btn-premium" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" disabled={isSaving}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Saved Addresses Card */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                      Saved Addresses
                    </h2>
                  </div>
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openAddAddressDialog} className="btn-premium">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAddress ? "Edit Address" : "Add New Address"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingAddress ? "Update your address details below." : "Fill in your shipping address details."}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        {/* Address Label */}
                        <div className="space-y-2">
                          <Label htmlFor="addressLabel">Address Label</Label>
                          <Select
                            value={addressFormData.label}
                            onValueChange={(value) => setAddressFormData(prev => ({ ...prev, label: value }))}
                          >
                            <SelectTrigger id="addressLabel">
                              <SelectValue placeholder="Select label" />
                            </SelectTrigger>
                            <SelectContent>
                              {ADDRESS_LABELS.map((label) => (
                                <SelectItem key={label} value={label}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addrFirstName">First Name *</Label>
                            <Input
                              id="addrFirstName"
                              name="firstName"
                              value={addressFormData.firstName}
                              onChange={handleAddressFormChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addrLastName">Last Name *</Label>
                            <Input
                              id="addrLastName"
                              name="lastName"
                              value={addressFormData.lastName}
                              onChange={handleAddressFormChange}
                              required
                            />
                          </div>
                        </div>

                        {/* Street Address */}
                        <div className="space-y-2">
                          <Label htmlFor="addrAddress">Street Address *</Label>
                          <Input
                            id="addrAddress"
                            name="address"
                            value={addressFormData.address}
                            onChange={handleAddressFormChange}
                            placeholder="House/Flat No., Building, Street"
                            required
                          />
                        </div>

                        {/* State, City, PIN */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addrState">State *</Label>
                            <Select
                              value={addressFormData.state}
                              onValueChange={handleStateChange}
                            >
                              <SelectTrigger id="addrState">
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
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addrCity">City *</Label>
                            <Select
                              value={addressFormData.city}
                              onValueChange={handleCityChange}
                              disabled={!addressFormData.state}
                            >
                              <SelectTrigger id="addrCity">
                                <SelectValue placeholder={addressFormData.state ? "Select City" : "Select State first"} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCities.map((city) => (
                                  <SelectItem key={city.name} value={city.name}>
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addrZipCode">PIN Code *</Label>
                            <Input
                              id="addrZipCode"
                              name="zipCode"
                              value={addressFormData.zipCode}
                              onChange={handleAddressFormChange}
                              placeholder="PIN Code"
                              readOnly
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <Label htmlFor="addrPhone">Phone *</Label>
                          <Input
                            id="addrPhone"
                            name="phone"
                            type="tel"
                            value={addressFormData.phone}
                            onChange={handleAddressFormChange}
                            placeholder="+919876543210"
                            required
                          />
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="addrIsDefault"
                            checked={addressFormData.isDefault}
                            onCheckedChange={(checked) =>
                              setAddressFormData(prev => ({ ...prev, isDefault: checked as boolean }))
                            }
                          />
                          <Label htmlFor="addrIsDefault" className="text-sm font-normal cursor-pointer">
                            Set as default address
                          </Label>
                        </div>
                      </div>

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="button"
                          className="btn-premium"
                          onClick={handleSaveAddress}
                          disabled={isSavingAddress}
                        >
                          {isSavingAddress ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoadingAddresses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Saved Addresses
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first address for faster checkout
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Default Address */}
                    {defaultAddress && (
                      <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-foreground">{defaultAddress.label}</span>
                              <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                <Star className="h-3 w-3" />
                                Default
                              </span>
                            </div>
                            <p className="text-foreground font-medium">
                              {defaultAddress.firstName} {defaultAddress.lastName}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {defaultAddress.address}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.zipCode}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Phone: {defaultAddress.phone}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditAddressDialog(defaultAddress)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAddress(defaultAddress.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Addresses */}
                    {otherAddresses.length > 0 && (
                      <>
                        {defaultAddress && (
                          <h3 className="text-sm font-medium text-muted-foreground mt-6">Other Addresses</h3>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                          {otherAddresses.map((address) => (
                            <div key={address.id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-foreground">{address.label}</span>
                                  </div>
                                  <p className="text-foreground font-medium">
                                    {address.firstName} {address.lastName}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    {address.address}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    {address.city}, {address.state} - {address.zipCode}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    Phone: {address.phone}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditAddressDialog(address)}
                                    className="h-8 w-8"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="mt-3 text-xs"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Set as Default
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                Order History
              </h2>
              {isLoadingOrders ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">
                            Order #{order.orderNumber}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                            }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-primary">
                            ${order.total.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <Button
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button variant="outline" asChild>
                            <Link href={`/order-confirmation?orderNumber=${order.orderNumber}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Orders Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Button asChild className="btn-premium">
                    <Link href="/catalog">Browse Catalog</Link>
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your Wishlist is Empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Save your favorite items for later
              </p>
              <Button asChild className="btn-premium">
                <Link href="/catalog">Browse Catalog</Link>
              </Button>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">

              <Card className="p-6">
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates about your orders</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive exclusive offers and news</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      signOut();
                      toast.success("Signed out successfully");
                      router.push('/');
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}