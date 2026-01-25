"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: "general",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", enquiryType: "general", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Have questions about our furniture or need assistance? We're here to help.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="p-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enquiryType">Enquiry Type *</Label>
                  <Select
                    value={formData.enquiryType}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, enquiryType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select enquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Enquiry</SelectItem>
                      <SelectItem value="showroom">Showroom Visit</SelectItem>
                      <SelectItem value="custom">Custom Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your project or inquiry..."
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full btn-premium" size="lg">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <Card className="p-6 flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      123 Furniture Lane<br />
                      Design District<br />
                      New York, NY 10001
                    </p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">
                      +91 8937905906<br />
                      Mon-Sat: 10am - 6pm IST
                    </p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">
                      info@beigeandoak.com<br />
                      sales@beigeandoak.com
                    </p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Showroom Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 10am - 7pm<br />
                      Saturday: 10am - 6pm<br />
                      Sunday: 12pm - 5pm
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}