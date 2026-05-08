# Hivago Project Context (AI Agent Handoff)

This document provides essential context for AI coding assistants working on the Hivago project.

## 1. Project Overview
Hivago is a premium food delivery platform. The frontend is built with React/TypeScript, and the backend (RallyAPI) follows an OpenAPI schema.

## 2. Core Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Lucide Icons.
- **Styling**: Vanilla CSS with a focus on premium, dynamic aesthetics.
- **State Management**: React Context (`CartContext`, `AuthContext`, `LocationContext`).
- **Communication**: Custom `authFetch` wrapper in `api.ts` for authenticated backend calls.

## 3. Order Lifecycle Flow (Standardized)
The following sequence must be maintained for order processing:

1.  **Cart Initialization**: `GET /api/cart` (handles `204 No Content` for empty carts).
2.  **Cart Sync**: `POST /api/cart/sync` merges guest items into the customer account after login.
3.  **Checkout**: Uses `DemoCheckoutPage.tsx` or `CheckoutPage.tsx`.
4.  **Order Placement**: `POST /api/orders`
    - **CRITICAL**: Must include an `Idempotency-Key` header to prevent double-charging.
    - **Payload**: Requires `items` and `pricing` objects.
5.  **Payment Processing (PayU)**:
    - `initiatePayment(orderId)`: Calls `/api/payments/initiate`.
    - `redirectToPayU(params)`: Opens a centered popup for the PayU payment page.
    - `verifyPayment(txnId)`: Frontend polls `/api/payments/verify` every 3s while the popup is open.
6.  **Tracking**: `OrderTrackingPage.tsx` uses `getOrderById(orderId)`.

## 4. Key Implementation Patterns & Gotchas

### 📍 Address Handling
- **Sanitization**: All addresses are passed through a `cleanAddress` regex utility to remove professional placeholders like `000000` or `Unknown Street`.
- **Formatting**: The system uses `formattedAddress` from the backend when available, otherwise concatenates `street` and `city`.

### 💰 Pricing & Mappings
- **Item Names**: Backend schema uses `itemName` (not `name`). Ensure `item.itemName || item.name` is used in tracking/summary views.
- **Total Amount**: If the backend's `pricing.total` differs significantly from the frontend's item calculation (due to mocked item IDs or backend discounts), the UI recalculates it locally for visual consistency.
- **Pricing Fallbacks**: `getOrderTotal()` checks `totalAmount` -> `total` -> `pricing.total` -> manual summation.

### 🚴 Rider Logic
- **Real-Time Only**: Rider details are hidden by default and only display when `riderId` or `riderName` is explicitly assigned by a 3PL provider (no demo/placeholder riders).

### 💳 Payment Cleanup
- **Automatic Cancellation**: If a payment fails or is cancelled by the user (closing popup), the backend handles order cancellation automatically. The frontend does **not** call a separate failure endpoint.

## 5. Directory Structure
- `src/data/api.ts`: Central hub for all API definitions and payment logic.
- `src/presentation/context/`: Core business logic and global state.
- `src/presentation/pages/`: Main views (Tracking, Checkout, etc.).
- `src/assets/`: SVG icons and branding assets.

## 6. API Quirks
- `/api/orders/active`: Returns an array of `OrderSummaryDto`. Note that this DTO **does not** contain the full `items` array; you must fetch specific orders via `getOrderById` for details.
- `/api/cart`: Returns `204` if empty; frontend must catch this to avoid JSON parse errors.
