"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ContactFormSchema,
  CustomOrderSchema,
  NewsletterSchema,
  type ContactFormPayload,
  type CustomOrderPayload,
  type NewsletterPayload,
} from "@/models/Common";
import { CACHE_TAGS } from "@/services/products.service";

// Generic action result type
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Contact form submission action
 */
export async function submitContactForm(
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const validatedData = ContactFormSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        error: "Please check your input and try again.",
        fieldErrors: validatedData.error.flatten().fieldErrors,
      };
    }

    // In a real app, you would send email/save to database here
    console.log("Contact form submitted:", validatedData.data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to success page
    redirect("/contact?submitted=true");
  } catch (error) {
    console.error("Contact form submission error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

/**
 * Custom order form submission action
 */
export async function submitCustomOrder(
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      projectType: formData.get("projectType"),
      budget: formData.get("budget"),
      timeline: formData.get("timeline"),
      description: formData.get("description"),
    };

    const validatedData = CustomOrderSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        error: "Please check your input and try again.",
        fieldErrors: validatedData.error.flatten().fieldErrors,
      };
    }

    // In a real app, you would save to database and send notifications
    console.log("Custom order submitted:", validatedData.data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to success page
    redirect("/custom-order?submitted=true");
  } catch (error) {
    console.error("Custom order submission error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

/**
 * Newsletter subscription action
 */
export async function subscribeToNewsletter(
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get("email"),
    };

    const validatedData = NewsletterSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        error: "Please enter a valid email address.",
        fieldErrors: validatedData.error.flatten().fieldErrors,
      };
    }

    // In a real app, you would add to newsletter service
    console.log("Newsletter subscription:", validatedData.data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

/**
 * Generic form action that can handle different form types
 */
export async function handleFormSubmission(
  formType: "contact" | "custom-order" | "newsletter",
  formData: FormData
): Promise<ActionResult> {
  switch (formType) {
    case "contact":
      return submitContactForm(formData);
    case "custom-order":
      return submitCustomOrder(formData);
    case "newsletter":
      return subscribeToNewsletter(formData);
    default:
      return {
        success: false,
        error: "Invalid form type.",
      };
  }
}
