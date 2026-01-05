import "server-only";

import { Order, OrderItem } from "@/models/Order";

/**
 * Format currency for display in emails
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount);
};

/**
 * Format date for display in emails
 */
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

/**
 * Generate product row HTML for email
 */
const generateProductRow = (item: OrderItem): string => `
    <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <strong style="color: #333;">${item.title}</strong>
            <br>
            <span style="color: #666; font-size: 14px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
            <strong style="color: #333;">${formatCurrency(item.subtotal)}</strong>
        </td>
    </tr>
`;

/**
 * Base email wrapper with consistent branding
 */
const emailWrapper = (content: string, preheader: string = ""): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarmsCraft</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse: collapse;}
        .fallback-font {font-family: Arial, sans-serif;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <!-- Preheader text (hidden but shows in email preview) -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        ${preheader}
    </div>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🌿 FarmsCraft
                            </h1>
                            <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                Premium Furniture, Crafted with Care
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    ${content}
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:support@farmscraft.com" style="color: #2d5a3d;">support@farmscraft.com</a>
                            </p>
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                © ${new Date().getFullYear()} FarmsCraft. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Generate Order Confirmation Email HTML
 */
export const generateOrderConfirmationEmail = (order: Order): { html: string; text: string; subject: string } => {
    const productRows = order.items.map(generateProductRow).join("");

    const content = `
        <!-- Success Banner -->
        <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px;">✓</span>
                </div>
                <h2 style="margin: 0 0 10px; color: #333; font-size: 24px;">Order Confirmed! 🎉</h2>
                <p style="margin: 0; color: #666; font-size: 16px;">
                    Thank you for your order, <strong>${order.customer.firstName}</strong>!
                </p>
            </td>
        </tr>
        
        <!-- Order Details -->
        <tr>
            <td style="padding: 20px 30px;">
                <table role="presentation" style="width: 100%; background-color: #f9f9f9; border-radius: 12px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Order Number</p>
                            <p style="margin: 0; color: #333; font-size: 18px; font-weight: 600;">#${order.orderNumber}</p>
                        </td>
                        <td style="text-align: right;">
                            <p style="margin: 0 0 5px; color: #666; font-size: 14px;">Order Date</p>
                            <p style="margin: 0; color: #333; font-size: 14px;">${formatDate(order.createdAt instanceof Date ? order.createdAt : new Date())}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Products -->
        <tr>
            <td style="padding: 20px 30px;">
                <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">Order Items</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    ${productRows}
                </table>
            </td>
        </tr>
        
        <!-- Order Summary -->
        <tr>
            <td style="padding: 20px 30px;">
                <table role="presentation" style="width: 100%; background-color: #f9f9f9; border-radius: 12px; padding: 20px;">
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Subtotal</td>
                        <td style="padding: 8px 0; text-align: right; color: #333;">${formatCurrency(order.subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Shipping</td>
                        <td style="padding: 8px 0; text-align: right; color: #333;">${order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Tax</td>
                        <td style="padding: 8px 0; text-align: right; color: #333;">${formatCurrency(order.tax)}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border-top: 2px solid #ddd; padding-top: 15px;"></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: 600;">Total</td>
                        <td style="padding: 8px 0; text-align: right; color: #2d5a3d; font-size: 20px; font-weight: 700;">${formatCurrency(order.total)}</td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Shipping Address -->
        <tr>
            <td style="padding: 20px 30px;">
                <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">📦 Shipping Address</h3>
                <div style="background-color: #f9f9f9; border-radius: 12px; padding: 20px;">
                    <p style="margin: 0; color: #333; line-height: 1.6;">
                        <strong>${order.customer.firstName} ${order.customer.lastName}</strong><br>
                        ${order.shippingAddress.address}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                        ${order.shippingAddress.country}
                    </p>
                </div>
            </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
            <td style="padding: 20px 30px 40px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://farmscraft.com"}/account/orders/${order.id}" 
                   style="display: inline-block; background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Track Your Order
                </a>
            </td>
        </tr>
    `;

    const plainText = `
Order Confirmed! 🎉

Thank you for your order, ${order.customer.firstName}!

Order Number: #${order.orderNumber}
Order Date: ${formatDate(order.createdAt instanceof Date ? order.createdAt : new Date())}

Order Items:
${order.items.map(item => `- ${item.title} (x${item.quantity}) - ${formatCurrency(item.subtotal)}`).join("\n")}

Subtotal: ${formatCurrency(order.subtotal)}
Shipping: ${order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}
Tax: ${formatCurrency(order.tax)}
Total: ${formatCurrency(order.total)}

Shipping Address:
${order.customer.firstName} ${order.customer.lastName}
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}

Track your order: ${process.env.NEXT_PUBLIC_BASE_URL || "https://farmscraft.com"}/account/orders/${order.id}

Thank you for shopping with FarmsCraft!
    `.trim();

    return {
        html: emailWrapper(content, `Your order #${order.orderNumber} has been confirmed! Thank you for shopping with FarmsCraft.`),
        text: plainText,
        subject: `Order Confirmed 🎉 - #${order.orderNumber}`,
    };
};

/**
 * Generate Order Cancellation Email HTML
 */
export const generateOrderCancellationEmail = (order: Order, reason?: string): { html: string; text: string; subject: string } => {
    const content = `
        <!-- Cancellation Banner -->
        <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px;">✗</span>
                </div>
                <h2 style="margin: 0 0 10px; color: #333; font-size: 24px;">Order Cancelled</h2>
                <p style="margin: 0; color: #666; font-size: 16px;">
                    Your order <strong>#${order.orderNumber}</strong> has been cancelled.
                </p>
            </td>
        </tr>
        
        <!-- Cancellation Reason -->
        ${reason ? `
        <tr>
            <td style="padding: 20px 30px;">
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px;">
                    <p style="margin: 0 0 5px; color: #991b1b; font-weight: 600;">Cancellation Reason:</p>
                    <p style="margin: 0; color: #666;">${reason}</p>
                </div>
            </td>
        </tr>
        ` : ""}
        
        <!-- Order Summary -->
        <tr>
            <td style="padding: 20px 30px;">
                <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">Cancelled Order Details</h3>
                <table role="presentation" style="width: 100%; background-color: #f9f9f9; border-radius: 12px; padding: 20px;">
                    <tr>
                        <td style="padding: 10px 0; color: #666;">Order Number</td>
                        <td style="padding: 10px 0; text-align: right; color: #333; font-weight: 600;">#${order.orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666;">Items</td>
                        <td style="padding: 10px 0; text-align: right; color: #333;">${order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666;">Total Amount</td>
                        <td style="padding: 10px 0; text-align: right; color: #333; font-weight: 600;">${formatCurrency(order.total)}</td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Refund Info -->
        <tr>
            <td style="padding: 20px 30px;">
                <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px;">
                    <p style="margin: 0 0 5px; color: #166534; font-weight: 600;">💰 Refund Information</p>
                    <p style="margin: 0; color: #666;">
                        If payment was processed, your refund of <strong>${formatCurrency(order.total)}</strong> will be credited back to your original payment method within 5-7 business days.
                    </p>
                </div>
            </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
            <td style="padding: 20px 30px 40px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://farmscraft.com"}/catalog" 
                   style="display: inline-block; background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Continue Shopping
                </a>
            </td>
        </tr>
    `;

    const plainText = `
Order Cancelled

Your order #${order.orderNumber} has been cancelled.

${reason ? `Cancellation Reason: ${reason}` : ""}

Cancelled Order Details:
- Order Number: #${order.orderNumber}
- Items: ${order.items.reduce((sum, item) => sum + item.quantity, 0)} items
- Total Amount: ${formatCurrency(order.total)}

Refund Information:
If payment was processed, your refund of ${formatCurrency(order.total)} will be credited back to your original payment method within 5-7 business days.

Continue Shopping: ${process.env.NEXT_PUBLIC_BASE_URL || "https://farmscraft.com"}/catalog

Thank you for considering FarmsCraft!
    `.trim();

    return {
        html: emailWrapper(content, `Your order #${order.orderNumber} has been cancelled.`),
        text: plainText,
        subject: `Order Cancelled - #${order.orderNumber}`,
    };
};

/**
 * Status display configuration
 */
const statusConfig: Record<string, { icon: string; color: string; bgColor: string; message: string }> = {
    pending: { icon: "⏳", color: "#f59e0b", bgColor: "#fef3c7", message: "Your order is being processed" },
    confirmed: { icon: "✓", color: "#22c55e", bgColor: "#f0fdf4", message: "Your order has been confirmed" },
    processing: { icon: "⚙️", color: "#3b82f6", bgColor: "#eff6ff", message: "Your order is being prepared" },
    shipped: { icon: "🚚", color: "#8b5cf6", bgColor: "#f5f3ff", message: "Your order is on its way" },
    out_for_delivery: { icon: "📦", color: "#06b6d4", bgColor: "#ecfeff", message: "Your order is out for delivery" },
    delivered: { icon: "🎉", color: "#22c55e", bgColor: "#f0fdf4", message: "Your order has been delivered" },
    cancelled: { icon: "✗", color: "#ef4444", bgColor: "#fef2f2", message: "Your order has been cancelled" },
};

/**
 * Generate Order Status Update Email HTML
 */
export const generateOrderStatusUpdateEmail = (
    order: Order,
    newStatus: string,
    trackingNumber?: string
): { html: string; text: string; subject: string } => {
    const status = statusConfig[newStatus.toLowerCase()] || statusConfig.pending;

    const content = `
        <!-- Status Banner -->
        <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
                <div style="width: 80px; height: 80px; background-color: ${status.bgColor}; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px;">${status.icon}</span>
                </div>
                <h2 style="margin: 0 0 10px; color: #333; font-size: 24px;">Order Update</h2>
                <p style="margin: 0; color: #666; font-size: 16px;">
                    ${status.message}
                </p>
            </td>
        </tr>
        
        <!-- Order Info -->
        <tr>
            <td style="padding: 20px 30px;">
                <table role="presentation" style="width: 100%; background-color: #f9f9f9; border-radius: 12px; padding: 20px;">
                    <tr>
                        <td style="padding: 10px 0; color: #666;">Order Number</td>
                        <td style="padding: 10px 0; text-align: right; color: #333; font-weight: 600;">#${order.orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #666;">New Status</td>
                        <td style="padding: 10px 0; text-align: right;">
                            <span style="background-color: ${status.bgColor}; color: ${status.color}; padding: 5px 12px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                                ${newStatus.replace(/_/g, " ").toUpperCase()}
                            </span>
                        </td>
                    </tr>
                    ${trackingNumber ? `
                    <tr>
                        <td style="padding: 10px 0; color: #666;">Tracking Number</td>
                        <td style="padding: 10px 0; text-align: right; color: #333; font-weight: 600;">${trackingNumber}</td>
                    </tr>
                    ` : ""}
                    ${order.estimatedDelivery ? `
                    <tr>
                        <td style="padding: 10px 0; color: #666;">Estimated Delivery</td>
                        <td style="padding: 10px 0; text-align: right; color: #333;">${formatDate(order.estimatedDelivery instanceof Date ? order.estimatedDelivery : new Date())}</td>
                    </tr>
                    ` : ""}
                </table>
            </td>
        </tr>
        
        <!-- Products Summary -->
        <tr>
            <td style="padding: 20px 30px;">
                <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">Order Summary</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    ${order.items.slice(0, 3).map(item => `
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                            <span style="color: #333;">${item.title}</span>
                            <span style="color: #666;"> × ${item.quantity}</span>
                        </td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #333;">
                            ${formatCurrency(item.subtotal)}
                        </td>
                    </tr>
                    `).join("")}
                    ${order.items.length > 3 ? `
                    <tr>
                        <td colspan="2" style="padding: 10px 0; color: #666; font-style: italic;">
                            + ${order.items.length - 3} more items
                        </td>
                    </tr>
                    ` : ""}
                </table>
            </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
            <td style="padding: 20px 30px 40px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://farmscraft.com"}/account/orders/${order.id}" 
                   style="display: inline-block; background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    View Order Details
                </a>
            </td>
        </tr>
    `;

    const plainText = `
Order Update

${status.message}

Order Number: #${order.orderNumber}
New Status: ${newStatus.replace(/_/g, " ").toUpperCase()}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ""}
${order.estimatedDelivery ? `Estimated Delivery: ${formatDate(order.estimatedDelivery instanceof Date ? order.estimatedDelivery : new Date())}` : ""}

Order Summary:
${order.items.map(item => `- ${item.title} × ${item.quantity} - ${formatCurrency(item.subtotal)}`).join("\n")}

View Order Details: ${process.env.NEXT_PUBLIC_BASE_URL || "https://farmscraft.com"}/account/orders/${order.id}

Thank you for shopping with FarmsCraft!
    `.trim();

    return {
        html: emailWrapper(content, `Order #${order.orderNumber} update: ${status.message}`),
        text: plainText,
        subject: `Order Update ${status.icon} - #${order.orderNumber}`,
    };
};
