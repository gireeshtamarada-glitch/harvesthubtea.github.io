# Complete Google Apps Script Setup Guide for Harvest Hub
## Automated Order Management & Email Notifications

---

## 📋 Table of Contents
1. [Step 1: Create Google Apps Script Project](#step-1-create-google-apps-script-project)
2. [Step 2: Create Google Sheet](#step-2-create-google-sheet)
3. [Step 3: Copy & Paste the Code](#step-3-copy--paste-the-code)
4. [Step 4: Deploy as Web App](#step-4-deploy-as-web-app)
5. [Step 5: Get Your Deployment URL](#step-5-get-your-deployment-url)
6. [Step 6: Update shop.js](#step-6-update-shopjs)
7. [Step 7: Test the System](#step-7-test-the-system)
8. [Troubleshooting](#troubleshooting)

---

## Step 1: Create Google Apps Script Project

### Instructions:
1. Go to **Google Apps Script** → https://script.google.com
2. Click the **+ New Project** button
3. Give it a name: `Harvest Hub Order Management`
4. Click **Create**

**You should now see a blank editor with a file called `Code.gs`**

---

## Step 2: Create Google Sheet

### Instructions:
1. Go to **Google Sheets** → https://sheets.google.com
2. Click **+ Create New Spreadsheet**
3. Name it: `Harvest Hub Orders`
4. Open the sheet
5. **IMPORTANT**: Copy the Sheet ID from the URL
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy everything after `/d/` and before `/edit`
   - **Save this ID - you'll need it in Step 3**

### Create Headers in Google Sheet:
In the first row (Row 1) of your Google Sheet, add these column headers:
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Order ID | Customer Name | Email | Phone | Address | City | State | Pincode | Items | Total Amount | Order Date | Status | Payment Method | Notes | Created At |

---

## Step 3: Copy & Paste the Code

### In Google Apps Script:

1. **Delete the existing code** in the `Code.gs` file
2. **Copy the complete code below**
3. **Paste it into the Google Apps Script editor**
4. **Find these lines and replace them with YOUR information:**

```javascript
// Line 5-6: Replace with your actual Sheet ID and admin email
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your Google Sheet ID
const ADMIN_EMAIL = 'harvesthubassamtea@gmail.com'; // Already correct
```

### Complete Code to Paste:

```javascript
// Google Apps Script for Harvest Hub Order Management
// This script handles:
// 1. Receiving orders from the website
// 2. Saving orders to Google Sheets
// 3. Sending email notifications to admin and customers

// Configuration - REPLACE SHEET_ID WITH YOUR ACTUAL ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your Google Sheet ID
const ADMIN_EMAIL = 'harvesthubassamtea@gmail.com';
const SHEET_NAME = 'Sheet1'; // Default sheet name

// Main doPost function - Entry point for POST requests from the website
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        
        // Save order to Google Sheets
        const saveResult = saveOrderToSheet(data);
        
        if (saveResult.success) {
            // Send admin notification email
            sendAdminNotificationEmail(data);
            
            // Send customer confirmation email
            sendCustomerConfirmationEmail(data);
            
            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: 'Order saved successfully',
                orderId: data.orderId
            })).setMimeType(ContentService.MimeType.JSON);
        } else {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                message: 'Failed to save order',
                error: saveResult.error
            })).setMimeType(ContentService.MimeType.JSON);
        }
        
    } catch (error) {
        Logger.log('Error in doPost: ' + error);
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Server error',
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Save order to Google Sheets
function saveOrderToSheet(orderData) {
    try {
        const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
        let sheet = spreadsheet.getSheetByName(SHEET_NAME);
        
        // If sheet doesn't exist, create it
        if (!sheet) {
            sheet = spreadsheet.insertSheet(SHEET_NAME);
            
            // Add headers
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
            orderData.status,
            orderData.paymentMethod,
            orderData.notes || '',
            new Date().toLocaleString('en-IN')
        ];
        
        // Add row to sheet
        sheet.appendRow(rowData);
        
        Logger.log('Order saved: ' + orderData.orderId);
        return { success: true };
        
    } catch (error) {
        Logger.log('Error saving to sheet: ' + error);
        return { success: false, error: error.toString() };
    }
}

// Send email to admin when new order is placed
function sendAdminNotificationEmail(orderData) {
    try {
        const itemsList = typeof orderData.items === 'string' ? 
            orderData.items : JSON.stringify(orderData.items);
        
        const subject = `🎉 New Order Received - ${orderData.orderId}`;
        
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0b3f23 0%, #082314 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #d4af37;">🍵 Harvest Hub</h1>
                    <p style="margin: 10px 0 0 0;">New Order Notification</p>
                </div>
                
                <div style="background: #f8f7f2; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #0b3f23; margin-top: 0;">Order Details</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: #fff;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Order ID:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.orderId}</td>
                        </tr>
                        <tr style="background: #f0f2f5;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Customer Name:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.customerName}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Email:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.email}</td>
                        </tr>
                        <tr style="background: #f0f2f5;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Phone:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.phone}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Address:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.address}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}</td>
                        </tr>
                        <tr style="background: #f0f2f5;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Total Amount:</td>
                            <td style="padding: 10px; border: 1px solid #ddd; color: #c89b3c; font-weight: bold; font-size: 16px;">₹${orderData.totalAmount}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Payment Method:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.paymentMethod}</td>
                        </tr>
                        <tr style="background: #f0f2f5;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Order Date:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.orderDate}</td>
                        </tr>
                    </table>
                    
                    <h3 style="color: #0b3f23; margin-top: 20px;">Items Ordered:</h3>
                    <p style="background: #fff; padding: 15px; border-left: 4px solid #c89b3c; margin: 10px 0;">
                        ${itemsList}
                    </p>
                    
                    ${orderData.notes ? `
                        <h3 style="color: #0b3f23;">Customer Notes:</h3>
                        <p style="background: #fff; padding: 15px; border-left: 4px solid #c89b3c; margin: 10px 0;">
                            ${orderData.notes}
                        </p>
                    ` : ''}
                    
                    <p style="text-align: center; margin-top: 30px; color: #666;">
                        <strong>Action Required:</strong> Process this order and update the Google Sheet status.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #082314; color: #d4af37; border-radius: 0 0 8px 8px; font-size: 12px;">
                    <p>© 2026 Harvest Hub Assam Tea. All rights reserved.</p>
                </div>
            </div>
        `;
        
        GmailApp.sendEmail(
            ADMIN_EMAIL,
            subject,
            '',
            { htmlBody: htmlBody }
        );
        
        Logger.log('Admin notification sent for order: ' + orderData.orderId);
        
    } catch (error) {
        Logger.log('Error sending admin email: ' + error);
    }
}

// Send confirmation email to customer
function sendCustomerConfirmationEmail(orderData) {
    try {
        const itemsList = typeof orderData.items === 'string' ? 
            orderData.items : JSON.stringify(orderData.items);
        
        const subject = `Order Confirmation - ${orderData.orderId}`;
        
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0b3f23 0%, #082314 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #d4af37;">🍵 Harvest Hub</h1>
                    <p style="margin: 10px 0 0 0;">Order Confirmation</p>
                </div>
                
                <div style="background: #f8f7f2; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #0b3f23;">Dear ${orderData.customerName},</h2>
                    
                    <p style="color: #333; line-height: 1.6;">
                        Thank you for your order! We're excited to deliver our premium Assam tea to you.
                    </p>
                    
                    <h3 style="color: #0b3f23; margin-top: 20px;">Order Summary</h3>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: #fff;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Order ID:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.orderId}</td>
                        </tr>
                        <tr style="background: #f0f2f5;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Order Date:</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${orderData.orderDate}</td>
                        </tr>
                        <tr style="background: #fff;">
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #0b3f23;">Total Amount:</td>
                            <td style="padding: 10px; border: 1px solid #ddd; color: #c89b3c; font-weight: bold; font-size: 16px;">₹${orderData.totalAmount}</td>
                        </tr>
                    </table>
                    
                    <h3 style="color: #0b3f23;">Items Ordered:</h3>
                    <p style="background: #fff; padding: 15px; border-left: 4px solid #c89b3c;">
                        ${itemsList}
                    </p>
                    
                    <h3 style="color: #0b3f23; margin-top: 20px;">Delivery Address:</h3>
                    <p style="background: #fff; padding: 15px; border-left: 4px solid #c89b3c;">
                        ${orderData.address}<br>
                        ${orderData.city}, ${orderData.state} - ${orderData.pincode}
                    </p>
                    
                    <h3 style="color: #0b3f23; margin-top: 20px;">What's Next?</h3>
                    <ul style="color: #333; line-height: 1.8;">
                        <li>Your order will be processed within 24 hours</li>
                        <li>You'll receive a shipping notification with tracking details</li>
                        <li>Estimated delivery: 5-7 business days</li>
                    </ul>
                    
                    <p style="text-align: center; margin-top: 30px; color: #666;">
                        If you have any questions, please don't hesitate to <a href="mailto:harvesthubassamtea@gmail.com" style="color: #c89b3c; text-decoration: none;">contact us</a>.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #082314; color: #d4af37; border-radius: 0 0 8px 8px; font-size: 12px;">
                    <p>Best regards,<br>Harvest Hub Team</p>
                    <p>© 2026 Harvest Hub Assam Tea. All rights reserved.</p>
                </div>
            </div>
        `;
        
        GmailApp.sendEmail(
            orderData.email,
            subject,
            '',
            { htmlBody: htmlBody }
        );
        
        Logger.log('Customer confirmation email sent to: ' + orderData.email);
        
    } catch (error) {
        Logger.log('Error sending customer email: ' + error);
    }
}

// Function to update order status
function updateOrderStatus(orderId, newStatus) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === orderId) {
                sheet.getRange(i + 1, 12).setValue(newStatus); // Status is in column 12
                Logger.log('Order status updated: ' + orderId + ' -> ' + newStatus);
                return true;
            }
        }
        
        return false;
        
    } catch (error) {
        Logger.log('Error updating status: ' + error);
        return false;
    }
}

// Test function to verify the script is working
function testScript() {
    const testOrder = {
        orderId: 'HH_TEST_' + Date.now(),
        customerName: 'Test Customer',
        email: ADMIN_EMAIL,
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        pincode: '123456',
        items: 'Premium Assam Tea (250g) × 2, Wild Flush Tea (500g) × 1',
        totalAmount: 1500,
        orderDate: new Date().toLocaleString('en-IN'),
        status: 'pending',
        paymentMethod: 'upi',
        notes: 'This is a test order'
    };
    
    Logger.log('Sending test email...');
    sendAdminNotificationEmail(testOrder);
    Logger.log('Test completed. Check your email!');
}
```

---

## Step 4: Deploy as Web App

### Instructions:

1. **Save the script** by pressing `Ctrl+S` (or `Cmd+S` on Mac)
2. Click **Deploy** (top right) → **New Deployment**
3. Select **Type**: Click the dropdown and select **Web app**
4. Fill in:
   - **Description**: `Harvest Hub Order Handler`
   - **Execute as**: Select your Gmail account
   - **Who has access**: Select **Anyone**
5. Click **Deploy**
6. **IMPORTANT**: A dialog will appear asking to authorize. Click the link and grant permissions
   - Select your Google account
   - Click "Advanced"
   - Click "Go to Harvest Hub Order Management (unsafe)"
   - Review the permissions and click "Allow"

---

## Step 5: Get Your Deployment URL

### Instructions:

1. After deployment, you'll see a dialog with:
   - **Deployment ID**
   - **Web app URL** (this is what you need!)
2. **Copy the Web app URL** - It looks like:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercallable
   ```
3. **Save this URL - you'll need it in Step 6**

---

## Step 6: Update shop.js

### Instructions:

1. Open your `assets/js/shop.js` file in your GitHub repository
2. Find this line (around line 33):
   ```javascript
   this.googleAppsScriptUrl = 'https://script.google.com/macros/d/YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_ID/usercallable';
   ```
3. **Replace it with your actual Web app URL** from Step 5:
   ```javascript
   this.googleAppsScriptUrl = 'https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/usercallable';
   ```
4. **Save the file**

### Example:
If your deployment URL is:
```
https://script.google.com/macros/s/AKfycbw123456789abcdef_xyz123/usercallable
```

Then update line 33 to:
```javascript
this.googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbw123456789abcdef_xyz123/usercallable';
```

---

## Step 7: Test the System

### Test in Google Apps Script:

1. Go back to your Google Apps Script editor
2. Select the function **`testScript`** from the dropdown
3. Click **Run** (play button)
4. Check your email (harvesthubassamtea@gmail.com) for a test order email

### Test from Your Website:

1. Go to your Harvest Hub website
2. Add an item to the cart
3. Go to checkout
4. Fill in a test order with your information
5. Submit the form
6. Check:
   - **Google Sheet**: Should have a new row with order details
   - **Your Email**: Should receive order confirmation and admin notification

---

## Summary of What Happens

### When a customer places an order:

1. ✅ **Order saved to Google Sheets** - Instantly
2. ✅ **Email to Admin** (harvesthubassamtea@gmail.com) - Detailed order info
3. ✅ **Email to Customer** - Order confirmation with tracking link
4. ✅ **Order ID generated** - Unique tracking number
5. ✅ **Status tracked** - Can be updated in Google Sheet

### The system automatically sends:

- **Admin Email**: Includes all order details, customer info, items, total amount
- **Customer Email**: Confirmation with order summary and delivery address
- **Status Updates**: When you change the status in Google Sheet (pending → confirmed → shipped → delivered)

---

## Troubleshooting

### Issue: "Error saving to Google Sheets"
**Solution**: 
- Check that your SHEET_ID is correct
- Make sure the sheet name matches (default is "Sheet1")
- Verify you've granted permissions

### Issue: "Email not sending"
**Solution**:
- Check Gmail account has email enabled
- Verify the email addresses are correct
- Check Google Apps Script logs for errors

### Issue: "Deployment URL not working"
**Solution**:
- Make sure you deployed as "Web app" not "Web app (HEAD)"
- Verify "Who has access" is set to "Anyone"
- Re-authorize if needed

### Issue: "CORS error when sending orders"
**Solution**:
- This is normal - Google Apps Script blocks direct calls
- The data is still being saved
- Check your Google Sheet to confirm

---

## Key Information to Save

Save these for future reference:

```
Google Sheet ID: _______________________
Deployment URL: _______________________
Admin Email: harvesthubassamtea@gmail.com
```

---

## File Locations in Your Repository

After setup, you have these files:

- `assets/js/shop.js` - Main shop system (updated with deployment URL)
- `assets/js/tracking.js` - Order tracking page
- `assets/js/notifications.js` - Notification service
- `google-apps-script/Code.gs` - Google Apps Script (in Apps Script editor, not in repo)

---

**Your order management system is now complete! Every order will automatically be saved to Google Sheets and you'll receive email notifications.**

