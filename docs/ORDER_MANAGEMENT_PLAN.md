# Order Management System - Implementation Plan

## 📋 Overview

This document outlines the comprehensive plan for implementing a complete order management system for the Dr Backfit e-commerce platform. The system will enable users to place orders, view order history, track order status, and manage their orders seamlessly.

## 🎯 Objectives

1. **Order Creation**: Convert cart items into orders with complete customer and payment information
2. **Order Storage**: Store orders in Firebase Firestore with proper structure and relationships
3. **Order History**: Allow users to view their complete order history
4. **Order Details**: Provide detailed view of individual orders with status tracking 
5. **Order Status Management**: Track order lifecycle from placement to delivery 
6. **Admin Order Management**: Enable admins to view and manage all orders
7. **Email Notifications**: Send order confirmation and status update emails

## 🏗️ Architecture

### Data Models

#### 1. Order Model (`src/models/Order.ts`)
```typescript
interface Order {
  id: string;
  orderNumber: string; // Unique order number (e.g., ORD-20231214-001)
  userId: string; // Firebase Auth UID
  
  // Customer Information
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  
  // Shipping Address
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Order Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  
  // Payment Information (stored securely)
  payment: {
    method: 'card' | 'paypal' | 'cod';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    lastFourDigits?: string; // Only last 4 digits of card
  };
  
  // Order Status
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  
  // Timestamps
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  
  // Additional
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date | Timestamp;
}

interface OrderItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

type OrderStatus = 
  | 'pending'           // Order placed, awaiting payment confirmation
  | 'confirmed'         // Payment confirmed, processing order
  | 'processing'        // Order is being prepared
  | 'shipped'           // Order has been shipped
  | 'out_for_delivery'  // Order is out for delivery
  | 'delivered'         // Order delivered successfully
  | 'cancelled'         // Order cancelled
  | 'refunded';         // Order refunded

interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: Date | Timestamp;
  note?: string;
  updatedBy?: string; // Admin UID if updated by admin
}
```

#### 2. Order Summary Model (for list views)
```typescript
interface OrderSummary {
  id: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  itemCount: number;
  createdAt: Date | Timestamp;
  thumbnailImage: string; // First product image
}
```

### Firestore Structure

```
/orders
  /{orderId}
    - All order fields
    
/users/{userId}/orders (subcollection)
  /{orderId}
    - Order summary for quick user queries
    
/orderNumbers (for generating unique order numbers)
  /counter
    - lastNumber: number
    - lastDate: string
```

### API Routes

#### 1. Create Order
- **Route**: `POST /api/orders`
- **Auth**: Required
- **Body**: Order creation data
- **Response**: Created order with order number

#### 2. Get User Orders
- **Route**: `GET /api/orders`
- **Auth**: Required
- **Query**: `?page=1&limit=10&status=all`
- **Response**: Paginated list of user's orders

#### 3. Get Order Details
- **Route**: `GET /api/orders/[orderId]`
- **Auth**: Required (must be order owner or admin)
- **Response**: Complete order details

#### 4. Update Order Status (Admin)
- **Route**: `PATCH /api/orders/[orderId]/status`
- **Auth**: Admin only
- **Body**: New status and note
- **Response**: Updated order

#### 5. Cancel Order
- **Route**: `POST /api/orders/[orderId]/cancel`
- **Auth**: Required (must be order owner)
- **Response**: Cancelled order

#### 6. Get All Orders (Admin)
- **Route**: `GET /api/admin/orders`
- **Auth**: Admin only
- **Query**: `?page=1&limit=20&status=all&search=`
- **Response**: Paginated list of all orders

## 📁 File Structure

```
src/
├── models/
│   ├── Order.ts                    # Order type definitions and schemas
│   └── OrderStatus.ts              # Order status enums and helpers
│
├── services/
│   ├── order.service.ts            # Order business logic
│   └── orderNumber.service.ts      # Order number generation
│
├── app/
│   ├── api/
│   │   ├── orders/
│   │   │   ├── route.ts           # Create & list orders
│   │   │   ├── [orderId]/
│   │   │   │   ├── route.ts       # Get order details
│   │   │   │   ├── cancel/
│   │   │   │   │   └── route.ts   # Cancel order
│   │   │   │   └── status/
│   │   │   │       └── route.ts   # Update status (admin)
│   │   └── admin/
│   │       └── orders/
│   │           └── route.ts        # Admin order management
│   │
│   ├── account/
│   │   └── orders/
│   │       ├── page.tsx            # Order history page
│   │       └── [orderId]/
│   │           └── page.tsx        # Order details page
│   │
│   └── admin/
│       └── orders/
│           ├── page.tsx            # Admin orders list
│           └── [orderId]/
│               └── page.tsx        # Admin order details
│
├── components/
│   ├── orders/
│   │   ├── OrderCard.tsx           # Order summary card
│   │   ├── OrderDetails.tsx        # Detailed order view
│   │   ├── OrderStatusBadge.tsx    # Status badge component
│   │   ├── OrderTimeline.tsx       # Status history timeline
│   │   ├── OrderItemsList.tsx      # Order items display
│   │   └── CancelOrderDialog.tsx   # Cancel order confirmation
│   │
│   └── admin/
│       └── orders/
│           ├── OrdersTable.tsx     # Admin orders table
│           ├── OrderFilters.tsx    # Filter and search
│           └── UpdateStatusDialog.tsx # Update order status
│
└── hooks/
    ├── use-orders.ts               # Orders data fetching
    └── use-order-actions.ts        # Order actions (cancel, etc.)
```

## 🔄 Implementation Phases

### Phase 1: Core Order Models & Services (Foundation)
**Files to create:**
1. `src/models/Order.ts` - Order type definitions with Zod schemas
2. `src/models/OrderStatus.ts` - Status enums and helpers
3. `src/services/order.service.ts` - Order CRUD operations
4. `src/services/orderNumber.service.ts` - Unique order number generation

**Key Features:**
- Complete TypeScript interfaces
- Zod validation schemas
- Firestore service methods
- Order number generation logic

### Phase 2: Order Creation API & Checkout Integration
**Files to create/modify:**
1. `src/app/api/orders/route.ts` - Create order endpoint
2. `src/app/checkout/page.tsx` - Update to create orders
3. `src/components/orders/OrderConfirmation.tsx` - Success page

**Key Features:**
- Convert checkout form to order
- Validate and save to Firestore
- Clear cart after successful order
- Redirect to order confirmation
- Send confirmation email (optional)

### Phase 3: User Order History & Details
**Files to create:**
1. `src/app/account/orders/page.tsx` - Order history page
2. `src/app/account/orders/[orderId]/page.tsx` - Order details page
3. `src/components/orders/OrderCard.tsx` - Order summary card
4. `src/components/orders/OrderDetails.tsx` - Detailed order view
5. `src/components/orders/OrderStatusBadge.tsx` - Status badge
6. `src/components/orders/OrderTimeline.tsx` - Status timeline
7. `src/hooks/use-orders.ts` - Orders data fetching hook

**Key Features:**
- List all user orders with pagination
- Filter by status
- Search orders
- View detailed order information
- Track order status
- Cancel order functionality

### Phase 4: Order Status Management
**Files to create:**
1. `src/app/api/orders/[orderId]/status/route.ts` - Update status
2. `src/app/api/orders/[orderId]/cancel/route.ts` - Cancel order
3. `src/components/orders/CancelOrderDialog.tsx` - Cancel confirmation

**Key Features:**
- Status update with history tracking
- Cancel order with validation
- Status change notifications
- Refund handling (if applicable)

### Phase 5: Admin Order Management
**Files to create:**
1. `src/app/api/admin/orders/route.ts` - Admin orders API
2. `src/app/admin/orders/page.tsx` - Admin orders list
3. `src/app/admin/orders/[orderId]/page.tsx` - Admin order details
4. `src/components/admin/orders/OrdersTable.tsx` - Orders table
5. `src/components/admin/orders/OrderFilters.tsx` - Filters
6. `src/components/admin/orders/UpdateStatusDialog.tsx` - Status update

**Key Features:**
- View all orders
- Advanced filtering and search
- Bulk status updates
- Export orders
- Order analytics

### Phase 6: Email Notifications (Optional Enhancement)
**Files to create:**
1. `src/services/email/order-emails.service.ts` - Email templates
2. Email templates for:
   - Order confirmation
   - Order shipped
   - Order delivered
   - Order cancelled

## 🎨 UI/UX Design Principles

### Order History Page
- **Clean card-based layout** for order summaries
- **Status badges** with color coding
- **Quick actions** (view details, reorder, cancel)
- **Filters** for status and date range
- **Search** by order number or product name
- **Pagination** for large order lists

### Order Details Page
- **Order header** with order number and status
- **Timeline view** of status changes
- **Product list** with images and details
- **Shipping information** clearly displayed
- **Payment summary** breakdown
- **Action buttons** (cancel, contact support, download invoice)

### Admin Order Management
- **Data table** with sorting and filtering
- **Bulk actions** for efficiency
- **Quick status updates** with dropdown
- **Order search** with autocomplete
- **Analytics dashboard** with key metrics
- **Export functionality** for reporting

## 🔒 Security Considerations 

1. **Authentication**: All order endpoints require authentication
2. **Authorization**: Users can only access their own orders (except admins)
3. **Data Validation**: Strict Zod schema validation on all inputs
4. **Payment Security**: Never store full card numbers, only last 4 digits
5. **Admin Verification**: Verify admin role before allowing order management
6. **Rate Limiting**: Prevent order spam and abuse
7. **Audit Trail**: Track all order modifications with timestamps and user IDs

## 🧪 Testing Strategy

1. **Unit Tests**: Test order service methods
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test complete order flow
4. **Security Tests**: Verify authorization rules
5. **Performance Tests**: Test with large order volumes

## 📊 Success Metrics

1. **Order Completion Rate**: % of checkouts that become orders
2. **Order Processing Time**: Time from order to shipment
3. **Customer Satisfaction**: Based on order experience
4. **Error Rate**: Failed orders or payment issues
5. **Admin Efficiency**: Time to process orders

## 🚀 Future Enhancements

1. **Order Tracking**: Real-time tracking integration
2. **Reorder Functionality**: Quick reorder from history
3. **Order Reviews**: Allow customers to review orders
4. **Subscription Orders**: Recurring order support
5. **Gift Orders**: Gift wrapping and messages
6. **Split Payments**: Multiple payment methods
7. **International Orders**: Multi-currency support
8. **Order Analytics**: Advanced reporting and insights

## 📝 Notes

- All timestamps should use Firebase serverTimestamp() for consistency
- Order numbers should be sequential and date-based for easy tracking
- Status changes should always be recorded in history
- Consider implementing soft deletes for orders (never hard delete)
- Implement proper error handling and user feedback
- Use optimistic updates for better UX
- Cache order data appropriately to reduce Firestore reads

---

**Ready to implement?** Let's start with Phase 1! 🚀
