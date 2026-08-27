# Backend Email Notification API

## Requirement
When admin marks an order as "Delivered", the customer should receive an email notification.

## API Endpoint

### Mark Orders as Delivered with Email Notification

**Method:** `PATCH`

**Endpoint:** `/api/admin/orders/bulk-status`

**Request Body:**
```json
{
  "orderIds": ["ORD-85", "ORD-81", "ORD-82"],
  "status": "delivered",
  "sendNotification": true,
  "notificationType": "email"
}
```

**Fields:**
- `orderIds` (array): List of order numbers to mark as delivered
- `status` (string): "delivered"
- `sendNotification` (boolean): true = send email to customer
- `notificationType` (string): "email" or "sms"

**Response:**
```json
{
  "success": true,
  "updatedCount": 3,
  "emailsSent": 1,
  "message": "3 orders marked as delivered. Email sent to customer."
}
```

## Email Content

**To:** Customer email address

**Subject:** `Your order has been delivered - Order ID: ORD-85`

**Body:**
```
Hi [Customer Name],

Good news! Your order has been delivered.

Order Details:
- Order ID: ORD-85
- Delivery Date: 31 Aug 2026
- Items: Friday test dish × 1
- Amount: £12.00

Thank you for your order!

Subtle Kitchen Team
```

## Implementation Notes

1. When admin marks selected delivery dates as delivered, frontend sends only the selected order IDs
2. Backend should:
   - Update order status to "delivered"
   - Fetch customer email from order data
   - Send email notification
   - Log email send status
   - Return updated count and email confirmation

3. Email should include:
   - Customer name
   - Order ID
   - Delivery date
   - Items ordered
   - Total amount

## Frontend Integration

The frontend will:
1. Show checkboxes for each delivery date in grouped orders
2. Admin selects specific delivery dates
3. Admin clicks "Mark as Delivered"
4. Frontend sends only selected order IDs to backend
5. Backend sends email to customer
6. UI shows confirmation: "3 orders marked as delivered. Emails sent."

## Additional Considerations

- Handle cases where customer email is missing
- Add retry logic for failed emails
- Log all email sends for audit trail
- Support bulk email sending to multiple customers if multiple orders selected
