"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";

export default function CustomOrder() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    furnitureType: "",
    dimensions: "",
    materials: [] as string[],
    budget: "",
    description: "",
    timeline: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Custom order request submitted! We'll contact you within 24 hours.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      furnitureType: "",
      dimensions: "",
      materials: [],
      budget: "",
      description: "",
      timeline: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material]
    }));
  };

  const materials = ["Oak", "Walnut", "Maple", "Cherry", "Leather", "Linen", "Velvet"];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Custom Order
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Create your dream furniture piece. Our artisans will work with you to bring your vision to life.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="furnitureType">Furniture Type *</Label>
                    <Select
                      value={formData.furnitureType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, furnitureType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="bed">Bed</SelectItem>
                        <SelectItem value="sofa">Sofa</SelectItem>
                        <SelectItem value="couch">Couch</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="chair">Chair</SelectItem>
                        <SelectItem value="cabinet">Cabinet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    placeholder="e.g., 80&quot; W x 36&quot; D x 32&quot; H"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Preferred Materials</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {materials.map((material) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={material}
                          checked={formData.materials.includes(material)}
                          onCheckedChange={() => toggleMaterial(material)}
                        />
                        <Label htmlFor={material} className="cursor-pointer">
                          {material}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select
                      value={formData.budget}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="under-5k">Under $5,000</SelectItem>
                        <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10k-20k">$10,000 - $20,000</SelectItem>
                        <SelectItem value="over-20k">Over $20,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Desired Timeline</Label>
                    <Select
                      value={formData.timeline}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="2-3-months">2-3 months</SelectItem>
                        <SelectItem value="3-6-months">3-6 months</SelectItem>
                        <SelectItem value="6-plus-months">6+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your vision, style preferences, and any specific requirements..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Inspiration Images (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop<br />
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full btn-premium" size="lg">
                  Submit Custom Order Request
                </Button>
              </form>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                How It Works
              </h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Submit Request", desc: "Fill out the form with your requirements" },
                  { step: "2", title: "Consultation", desc: "We'll schedule a call to discuss details" },
                  { step: "3", title: "Design & Quote", desc: "Receive detailed designs and pricing" },
                  { step: "4", title: "Crafting", desc: "Our artisans bring your vision to life" },
                  { step: "5", title: "Delivery", desc: "White-glove delivery and setup" }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-secondary/20">
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                Why Custom?
              </h3>
              <ul className="space-y-3">
                {[
                  "Perfect fit for your space",
                  "Choose your materials",
                  "Unique, one-of-a-kind piece",
                  "Lifetime warranty"
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}