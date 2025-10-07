import { z } from "zod";

// Testimonial schema
export const TestimonialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  avatar: z.string().url().optional(),
});

export const TestimonialsSchema = z.array(TestimonialSchema);

// Contact form schema
export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Custom order form schema
export const CustomOrderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  projectType: z.enum(["furniture", "renovation", "consultation"]),
  budget: z.enum(["under-5k", "5k-15k", "15k-30k", "30k-plus"]),
  timeline: z.enum(["flexible", "3-months", "6-months", "12-months"]),
  description: z
    .string()
    .min(20, "Please provide more details about your project"),
  images: z.array(z.string().url()).optional(),
});

// Newsletter subscription schema
export const NewsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// TypeScript types
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type Testimonials = z.infer<typeof TestimonialsSchema>;
export type ContactFormPayload = z.infer<typeof ContactFormSchema>;
export type CustomOrderPayload = z.infer<typeof CustomOrderSchema>;
export type NewsletterPayload = z.infer<typeof NewsletterSchema>;
