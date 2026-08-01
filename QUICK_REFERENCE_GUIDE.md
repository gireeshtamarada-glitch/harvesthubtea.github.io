# Quick Reference Guide - Harvest Hub Google Apps Script Integration
## Complete Setup with Troubleshooting

---

## 🚀 QUICK START (5 Steps)

### Step 1: Create Google Apps Script
```
1. Go to https://script.google.com
2. Click "+ New Project"
3. Name it: "Harvest Hub Order Management"
4. Click Create
```

### Step 2: Create Google Sheet
```
1. Go to https://sheets.google.com
2. Click "+ Create New Spreadsheet"
3. Name it: "Harvest Hub Orders"
4. Add headers in Row 1:
   Order ID | Customer Name | Email | Phone | Address | City | State | Pincode | Items | Total Amount | Order Date | Status | Payment Method | Notes | Created At
5. COPY YOUR SHEET ID from URL (the part after /d/ and before /edit)
```

### Step 3: Add Code to Google Apps Script
```
1. Go back to https://script.google.com
2. Open your project
3. Delete existing code in Code.gs
4. Paste the code below
5. Update SHEET_ID and ADMIN_EMAIL with your values
6. Press Ctrl+S to save
```

### Step 4: Deploy as Web App
```
1. Click Deploy (top right)
2. Select "New Deployment"
3. Select Type: "Web app"
4. Execute as: [Your Gmail Account]
5. Who has access: "Anyone"
6. Click Deploy
7. Authorize when prompted
8. COPY THE WEB APP URL
```

### Step 5: Update shop.js
```
1. Open assets/js/shop.js
2. Find: this.googleAppsScriptUrl = '...'
3. Replace with your Web App URL
4. Save and deploy
```

---

## 📝 COMPLETE GOOGLE APPS SCRIPT CODE

Copy this entire code and paste it in Google Apps Script (delete everything first):

```javascript
// ============================================
// HARVEST HUB ORDER MANAGEMENT SYSTEM
// Google Apps Script - Complete Code
// ============================================

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';  // REQUIRED: Replace with your Sheet ID
const ADMIN_EMAIL = 'harvesthubassamtea@gmail.com';
const SHEET_NAME = 'Sheet1';

// ============================================
// MAIN HANDLER - Receives orders from website
// ============================================
function doPost(e) {
    try {
        // Parse incoming order data
        const data = JSON.parse(e.postData.contents);
        
        // Log the received order
        Logger.log('Received order: ' + JSON.stringify(data));
        
        // Save order to Google Sheets
        const saveResult = saveOrderToSheet(data);
        
        if (saveResult.success) {
            // Send admin notification
            sendAdminNotificationEmail(data);
            
            // Send customer confirmation
            sendCustomerConfirmationEmail(data);
            
            // Return success response
            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: 'Order saved successfully',
                orderId: data.orderId
            })).setMimeType(ContentService.MimeType.JSON);
        } else {
            // Return error response
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                message: 'Failed to save order',
                error: saveResult.error
            })).setMimeType(ContentService.MimeType.JSON);
        }
        
    } catch (error) {
        Logger.log('ERROR in doPost: ' + error.toString());
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Server error: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================
// SAVE ORDER TO GOOGLE SHEETS
// ============================================
function saveOrderToSheet(orderData) {
    try {
        // Open spreadsheet
        const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
        let sheet = spreadsheet.getSheetByName(SHEET_NAME);
        
        // Create sheet if it doesn't exist
        if (!sheet) {
            Logger.log('Sheet not found. Creating new sheet: ' + SHEET_NAME);
            sheet = spreadsheet.insertSheet(SHEET_NAME);
            
            // Add column headers
            const headers = [
                'Order ID',
                'Customer Name',
                'Email',
                'Phone',
                'Address',
                'City',
                'State',
                'Pincode',
                'Items',
                'Total Amount',
                'Order Date',
                'Status',
                'Payment Method',
                'Notes',
                'Created At'
            ];
            sheet.appendRow(headers);
            Logger.log('Headers added to new sheet');
        }
        
        // Prepare row data
        const rowData = [
            orderData.orderId,
            orderData.customerName,
            orderData.email,
            orderData.phone,
            orderData.address,
            orderData.city,
            orderData.state,
            orderData.pincode,
            orderData.items,
            orderData.totalAmount,
            orderData.orderDate,
            orderData.status || 'pending',
            orderData.paymentMethod || 'upi',
            orderData.notes || '',
            new Date().toLocaleString('en-IN')
        ];
        
        // Add row to sheet
        sheet.appendRow(rowData);
        Logger.log('Order saved to sheet: ' + orderData.orderId);
        
        return { success: true };
        
    } catch (error) {
        Logger.log('ERROR saving to sheet: ' + error.toString());
        return { success: false, error: error.toString() };
    }
}

// ============================================
// SEND ADMIN NOTIFICATION EMAIL
// ============================================
function sendAdminNotificationEmail(orderData) {
    try {
        // Format items list
        const itemsList = typeof orderData.items === 'string' ? 
            orderData.items : JSON.stringify(orderData.items);
        
        // Create subject
        const subject = '🎉 New Order Received - ' + orderData.orderId;
        
        // Create HTML email body
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0b3f23 0%, #082314 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #d4af37; font-size: 28px;">🍵 HARVEST HUB</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">Premium Assam Tea</p>
                </div>
                
                <!-- Main Content -->
                <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
                    <h2 style="color: #0b3f23; margin-top: 0; border-bottom: 2px solid #c89b3c; padding-bottom: 10px;">
                        📦 NEW ORDER NOTIFICATION
                    </h2>
                    
                    <!-- Order Details Table -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">Order Information:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background: #f9f9f9;">
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23; width: 40%;">Order ID:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-family: monospace; color: #c89b3c;">${orderData.orderId}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23;">Order Date:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0;">${orderData.orderDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23;">Order Time:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0;">${new Date().toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                    
                    <!-- Customer Details -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">Customer Information:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background: #f9f9f9;">
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23; width: 40%;">Name:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0;">${orderData.customerName}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23;">Email:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0;"><a href="mailto:${orderData.email}" style="color: #c89b3c; text-decoration: none;">${orderData.email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23;">Phone:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0;"><a href="tel:${orderData.phone}" style="color: #c89b3c; text-decoration: none;">${orderData.phone}</a></td>
                        </tr>
                    </table>
                    
                    <!-- Delivery Address -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">Delivery Address:</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c89b3c; margin: 15px 0;">
                        <p style="margin: 0; color: #333;">
                            <strong>${orderData.address}</strong><br>
                            ${orderData.city}, ${orderData.state} - ${orderData.pincode}
                        </p>
                    </div>
                    
                    <!-- Items -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">Items Ordered:</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c89b3c; margin: 15px 0;">
                        <p style="margin: 0; color: #333; white-space: pre-wrap;">
                            ${itemsList}
                        </p>
                    </div>
                    
                    <!-- Order Summary -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">Order Summary:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background: #f9f9f9;">
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23; width: 40%;">Total Amount:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #c89b3c; font-weight: bold; font-size: 18px;">₹${orderData.totalAmount}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23;">Payment Method:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0;">${orderData.paymentMethod || 'UPI'}</td>
                        </tr>
                    </table>
                    
                    <!-- Notes if present -->
                    ${orderData.notes ? `
                        <h3 style="color: #0b3f23; margin-top: 20px;">Customer Notes:</h3>
                        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0;">
                            <p style="margin: 0; color: #333;">
                                ${orderData.notes}
                            </p>
                        </div>
                    ` : ''}
                    
                    <!-- Action Required -->
                    <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
                        <p style="margin: 0; color: #1b5e20; font-weight: bold;">
                            ✅ ACTION REQUIRED: Review this order and update the status in Google Sheets
                        </p>
                    </div>
                    
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px; background: #082314; color: #d4af37; border-radius: 0 0 8px 8px; font-size: 12px;">
                    <p style="margin: 5px 0;">© 2026 Harvest Hub Assam Tea</p>
                    <p style="margin: 5px 0;">Premium Quality Tea Delivered to Your Doorstep</p>
                </div>
            </div>
        `;
        
        // Send email
        GmailApp.sendEmail(
            ADMIN_EMAIL,
            subject,
            '',
            { htmlBody: htmlBody }
        );
        
        Logger.log('✅ Admin notification email sent to: ' + ADMIN_EMAIL);
        
    } catch (error) {
        Logger.log('❌ ERROR sending admin email: ' + error.toString());
    }
}

// ============================================
// SEND CUSTOMER CONFIRMATION EMAIL
// ============================================
function sendCustomerConfirmationEmail(orderData) {
    try {
        // Format items list
        const itemsList = typeof orderData.items === 'string' ? 
            orderData.items : JSON.stringify(orderData.items);
        
        // Create subject
        const subject = 'Order Confirmation - ' + orderData.orderId;
        
        // Create HTML email body
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0b3f23 0%, #082314 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #d4af37; font-size: 28px;">🍵 HARVEST HUB</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">Premium Assam Tea</p>
                </div>
                
                <!-- Main Content -->
                <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
                    <h2 style="color: #0b3f23; margin-top: 0;">Dear ${orderData.customerName},</h2>
                    
                    <p style="color: #333; line-height: 1.6; font-size: 14px;">
                        Thank you for your order! We're delighted to send you our premium Assam tea. 
                        Your order has been received and is being processed.
                    </p>
                    
                    <!-- Order Summary -->
                    <h3 style="color: #0b3f23; margin-top: 20px; border-bottom: 2px solid #c89b3c; padding-bottom: 10px;">
                        📋 Order Summary
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background: #f9f9f9;">
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23; width: 40%;">Order ID:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-family: monospace; color: #c89b3c;">${orderData.orderId}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23;">Order Date:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0;">${orderData.orderDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: bold; color: #0b3f23;">Total Amount:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; color: #c89b3c; font-weight: bold; font-size: 16px;">₹${orderData.totalAmount}</td>
                        </tr>
                    </table>
                    
                    <!-- Items -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">Items Ordered:</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c89b3c; margin: 15px 0;">
                        <p style="margin: 0; color: #333; white-space: pre-wrap;">
                            ${itemsList}
                        </p>
                    </div>
                    
                    <!-- Delivery Address -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">Delivery Address:</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #c89b3c; margin: 15px 0;">
                        <p style="margin: 0; color: #333;">
                            ${orderData.address}<br>
                            ${orderData.city}, ${orderData.state} - ${orderData.pincode}
                        </p>
                    </div>
                    
                    <!-- What's Next -->
                    <h3 style="color: #0b3f23; margin-top: 20px;">What's Next?</h3>
                    <ul style="color: #333; line-height: 1.8; font-size: 14px;">
                        <li>✅ Order Confirmed - Your order has been received</li>
                        <li>🎁 Processing - We're preparing your tea for shipment (24-48 hours)</li>
                        <li>📦 Shipping - You'll receive a shipping notification with tracking details</li>
                        <li>🚚 Delivery - Expected delivery within 5-7 business days</li>
                    </ul>
                    
                    <!-- Contact -->
                    <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
                        <p style="margin: 0; color: #1565c0; font-size: 14px;">
                            <strong>Questions?</strong> Contact us at <a href="mailto:harvesthubassamtea@gmail.com" style="color: #c89b3c; text-decoration: none;">harvesthubassamtea@gmail.com</a>
                        </p>
                    </div>
                    
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px; background: #082314; color: #d4af37; border-radius: 0 0 8px 8px; font-size: 12px;">
                    <p style="margin: 5px 0;">Best regards,<br><strong>Harvest Hub Team</strong></p>
                    <p style="margin: 10px 0 5px 0;">© 2026 Harvest Hub Assam Tea</p>
                    <p style="margin: 5px 0;">Premium Quality Tea Delivered to Your Doorstep</p>
                </div>
            </div>
        `;
        
        // Send email
        GmailApp.sendEmail(
            orderData.email,
            subject,
            '',
            { htmlBody: htmlBody }
        );
        
        Logger.log('✅ Customer confirmation email sent to: ' + orderData.email);
        
    } catch (error) {
        Logger.log('❌ ERROR sending customer email: ' + error.toString());
    }
}

// ============================================
// UPDATE ORDER STATUS
// ============================================
function updateOrderStatus(orderId, newStatus) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        const data = sheet.getDataRange().getValues();
        
        // Find the order and update status
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === orderId) {
                sheet.getRange(i + 1, 12).setValue(newStatus);
                Logger.log('✅ Order status updated: ' + orderId + ' -> ' + newStatus);
                return true;
            }
        }
        
        Logger.log('❌ Order not found: ' + orderId);
        return false;
        
    } catch (error) {
        Logger.log('❌ ERROR updating status: ' + error.toString());
        return false;
    }
}

// ============================================
// TEST FUNCTION
// ============================================
function testScript() {
    Logger.log('🧪 Starting test...');
    
    const testOrder = {
        orderId: 'HH_TEST_' + Date.now(),
        customerName: 'Test Customer',
        email: ADMIN_EMAIL,
        phone: '9876543210',
        address: '123 Test Street, Test Apartment',
        city: 'Test City',
        state: 'TC',
        pincode: '123456',
        items: 'Premium Assam Tea (250g) × 2\nWild Flush Tea (500g) × 1',
        totalAmount: 1500,
        orderDate: new Date().toLocaleString('en-IN'),
        status: 'pending',
        paymentMethod: 'UPI',
        notes: 'This is a test order to verify the system is working'
    };
    
    Logger.log('📧 Sending test admin email...');
    sendAdminNotificationEmail(testOrder);
    
    Logger.log('📧 Sending test customer email...');
    sendCustomerConfirmationEmail(testOrder);
    
    Logger.log('✅ Test completed! Check your email for test messages.');
}
```

---

## 🔧 UPDATED shop.js CONFIGURATION

Update your `assets/js/shop.js` file. Find line 33 and replace:

```javascript
// OLD (line 33):
this.googleAppsScriptUrl = 'https://script.google.com/macros/d/YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID/usercallable';

// NEW (replace with your deployment URL):
this.googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbw_YOUR_DEPLOYMENT_ID_HERE/usercallable';
```

Example - if your deployment URL is:
```
https://script.google.com/macros/s/AKfycbwXYZ123456789abcdefghijk/usercallable
```

Update line 33 to:
```javascript
this.googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbwXYZ123456789abcdefghijk/usercallable';
```

---

## ❌ TROUBLESHOOTING GUIDE

### Problem 1: "Error saving to Google Sheets"

**Symptoms:**
- Order doesn't appear in Google Sheet
- Error message in browser console

**Solutions:**
1. Check SHEET_ID is correct (copy from URL)
2. Make sure sheet name is exactly "Sheet1"
3. Verify you have permission to edit the sheet
4. Check Google Apps Script logs (click "Logs" at bottom)

---

### Problem 2: "Email not sending"

**Symptoms:**
- No email received
- Script logs show email error

**Solutions:**
1. Verify email address is correct (harvesthubassamtea@gmail.com)
2. Check Gmail account settings allow sending
3. Review Apps Script authorization permissions
4. Check spam/junk folder

**Re-authorize:**
- Go to Google Apps Script
- Click "Review permissions"
- Select your account
- Click "Allow"

---

### Problem 3: "CORS error when placing order"

**Symptoms:**
- Console shows: "No 'Access-Control-Allow-Origin' header"
- But order IS saved in Google Sheet

**Solution:** This is normal! Google Apps Script blocks direct browser requests but the data is still saved. Data will appear in your sheet and emails will be sent.

---

### Problem 4: "Script returns 404 error"

**Symptoms:**
- Deployment URL not working
- Error: "404 - Not found"

**Solutions:**
1. Make sure deployment URL is correct
2. Re-deploy the script (Deploy → New Deployment)
3. Use the newest deployment URL
4. Verify "Who has access" is set to "Anyone"

---

### Problem 5: "Sheet ID is wrong error"

**Symptoms:**
- Error: "Cannot find sheet with ID"

**Solution:**
1. Open your Google Sheet
2. Copy the ID from URL: `https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit`
3. Go to Google Apps Script
4. Update SHEET_ID on line 7
5. Save and re-deploy

---

### Problem 6: "No orders appearing in Google Sheet"

**Symptoms:**
- Website checkout appears to work
- Nothing in Google Sheet

**Solutions:**
1. Check the sheet name (should be "Sheet1")
2. Verify sheet headers are correct
3. Check browser console for errors
4. Run testScript() in Google Apps Script to test
5. Check Google Apps Script logs for errors

---

### Problem 7: "Test email sends but real orders don't"

**Symptoms:**
- testScript() works fine
- Actual orders don't trigger emails

**Solutions:**
1. Check that shop.js has correct deployment URL
2. Verify order data is being sent correctly
3. Check browser console for JavaScript errors
4. Inspect network requests in Chrome DevTools
5. Run Google Apps Script > Logs to see if order is received

---

## 🧪 TESTING CHECKLIST

### Test 1: Google Apps Script
```
1. Go to your Apps Script project
2. Select testScript from dropdown
3. Click Run
4. Check logs (should see "Test completed!")
5. Check your email for test messages
```

### Test 2: Website Integration
```
1. Go to your Harvest Hub website
2. Add an item to cart
3. Click checkout
4. Fill in test order details
5. Submit order
6. Check:
   ✓ Order appears in Google Sheet within 30 seconds
   ✓ Admin email received at harvesthubassamtea@gmail.com
   ✓ Customer email received (if you used a test email)
```

### Test 3: Email Verification
```
✓ Admin email contains: Order ID, Customer name, Items, Total, Address
✓ Customer email contains: Order summary, Delivery address, What's next
✓ Both emails have Harvest Hub branding
✓ Email links are clickable
```

---

## 📊 ORDER STATUS MANAGEMENT

To update order status in Google Sheet:

1. Open your "Harvest Hub Orders" Google Sheet
2. Find the order in the Status column (Column L)
3. Change status to one of:
   - `pending` (default)
   - `confirmed`
   - `shipped`
   - `delivered`
   - `cancelled`

Or use this code in Google Apps Script to update programmatically:
```javascript
updateOrderStatus('HH_ORDER_ID_HERE', 'shipped');
```

---

## 📱 WHAT CUSTOMERS RECEIVE

### Order Confirmation Email:
- Order ID and date
- Items ordered with quantities
- Delivery address
- Total amount
- What to expect next

### Next Steps for You:
- Review order in Google Sheet
- Process payment
- Update status to "confirmed"
- Ship the package
- Update status to "shipped"
- Customer receives tracking
- Update to "delivered" when complete

---

## ✅ CHECKLIST FOR SUCCESS

- [ ] Google Sheet created with correct headers
- [ ] Sheet ID copied and added to Google Apps Script
- [ ] Code pasted into Google Apps Script
- [ ] Script saved (Ctrl+S)
- [ ] Apps Script deployed as Web App
- [ ] Deployment URL copied
- [ ] shop.js updated with deployment URL
- [ ] Test order created and verified in sheet
- [ ] Test admin email received
- [ ] Ready for customer orders!

---

## 🎉 YOU'RE ALL SET!

Your Harvest Hub order management system is now live:
- ✅ Orders saved to Google Sheets automatically
- ✅ Admin notifications sent to you
- ✅ Customer confirmations sent to them
- ✅ Order tracking available
- ✅ Status updates can be sent

**Start accepting orders and watch your business grow! 🍵**

