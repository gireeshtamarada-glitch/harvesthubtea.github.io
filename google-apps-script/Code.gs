// Google Apps Script for Harvest Hub Order Management
// This script handles:
// 1. Receiving orders from the website
// 2. Saving orders to Google Sheets
// 3. Sending email notifications to admin and customers

// Configuration
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your Google Sheet ID
const ADMIN_EMAIL = 'harvesthubassamtea@gmail.com';
const SHEET_NAME = 'Orders';

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
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        
        // If sheet doesn't exist, create it
        if (!sheet) {
            return createNewSheet(orderData);
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
            new Date().toLocaleString('en-IN') // Added timestamp
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

// Create new sheet with headers if it doesn't exist
function createNewSheet(orderData) {
    try {
        const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
        const newSheet = spreadsheet.insertSheet(SHEET_NAME);
        
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
        
        newSheet.appendRow(headers);
        
        // Add order data
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
        
        newSheet.appendRow(rowData);
        
        Logger.log('New sheet created and order saved: ' + orderData.orderId);
        return { success: true };
        
    } catch (error) {
        Logger.log('Error creating sheet: ' + error);
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
                        ${itemsList.replace(/"/g, '').replace(/,/g, '<br>')}
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
                        ${itemsList.replace(/"/g, '').replace(/,/g, '<br>')}
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
                        <li>You can track your order anytime at: <a href="https://harvesthubtea.com/tracking.html?orderId=${orderData.orderId}" style="color: #c89b3c; text-decoration: none;">Track Order</a></li>
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

// Function to update order status and send notification
function updateOrderStatus(orderId, newStatus) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === orderId) {
                sheet.getRange(i + 1, 12).setValue(newStatus); // Status is in column 12
                
                // Send status update notification
                const order = {
                    orderId: data[i][0],
                    customerName: data[i][1],
                    email: data[i][2],
                    status: newStatus
                };
                
                sendStatusUpdateEmail(order);
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

// Send status update email to customer
function sendStatusUpdateEmail(order) {
    try {
        const statusMessages = {
            'pending': 'Your order is being processed',
            'confirmed': 'Your order has been confirmed',
            'shipped': 'Your order is on its way',
            'delivered': 'Your order has been delivered',
            'cancelled': 'Your order has been cancelled'
        };
        
        const subject = `Order Update: ${order.orderId} - ${statusMessages[order.status] || order.status}`;
        
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0b3f23 0%, #082314 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #d4af37;">🍵 Harvest Hub</h1>
                    <p style="margin: 10px 0 0 0;">Order Status Update</p>
                </div>
                
                <div style="background: #f8f7f2; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #0b3f23;">Dear ${order.customerName},</h2>
                    
                    <p style="color: #333; line-height: 1.6;">
                        We have an update on your order:
                    </p>
                    
                    <div style="background: #fff; padding: 20px; border-left: 4px solid #c89b3c; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #0b3f23;">Order ID: ${order.orderId}</h3>
                        <p style="font-size: 18px; color: #c89b3c; font-weight: bold;">
                            Status: ${statusMessages[order.status] || order.status}
                        </p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="https://harvesthubtea.com/tracking.html?orderId=${order.orderId}" style="background: #0b5d3d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Track Your Order</a>
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #082314; color: #d4af37; border-radius: 0 0 8px 8px; font-size: 12px;">
                    <p>© 2026 Harvest Hub Assam Tea. All rights reserved.</p>
                </div>
            </div>
        `;
        
        GmailApp.sendEmail(
            order.email,
            subject,
            '',
            { htmlBody: htmlBody }
        );
        
        Logger.log('Status update email sent to: ' + order.email);
        
    } catch (error) {
        Logger.log('Error sending status update email: ' + error);
    }
}

// Test function to verify the script is working
function testScript() {
    const testOrder = {
        orderId: 'HH_TEST_001',
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
