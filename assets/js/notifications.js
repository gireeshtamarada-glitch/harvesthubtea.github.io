// Email Notification Service for Harvest Hub
// Handles sending email notifications for order status updates

class EmailNotificationService {
    constructor() {
        this.emailProvider = 'emailjs'; // Using EmailJS for client-side email sending
        this.serviceId = 'service_harvesthub'; // EmailJS Service ID
        this.templateId = 'template_orderupdate'; // EmailJS Template ID
        this.userId = 'YOUR_EMAILJS_USER_ID'; // Replace with your EmailJS User ID
        this.notificationHistory = this.loadNotificationHistory();
    }

    // Load notification history from localStorage
    loadNotificationHistory() {
        const history = localStorage.getItem('emailNotificationHistory');
        return history ? JSON.parse(history) : [];
    }

    // Save notification history to localStorage
    saveNotificationHistory() {
        localStorage.setItem('emailNotificationHistory', JSON.stringify(this.notificationHistory));
    }

    // Send order confirmation email
    async sendOrderConfirmation(order) {
        const emailTemplate = this.buildOrderConfirmationTemplate(order);
        return this.sendEmail({
            to_email: order.email,
            to_name: order.customerName,
            subject: `Order Confirmation - ${order.orderId}`,
            order_id: order.orderId,
            customer_name: order.customerName,
            total_amount: order.totalAmount,
            items_list: this.formatItemsList(order.items),
            delivery_address: this.formatAddress(order),
            status_type: 'confirmation'
        });
    }

    // Send order status update email
    async sendStatusUpdate(order, newStatus) {
        const statusMessage = this.getStatusMessage(newStatus);
        const deliveryEstimate = this.getDeliveryEstimate(newStatus, order.orderDate);

        return this.sendEmail({
            to_email: order.email,
            to_name: order.customerName,
            subject: `Order Update - ${order.orderId} is ${statusMessage}`,
            order_id: order.orderId,
            customer_name: order.customerName,
            status_message: statusMessage,
            delivery_estimate: deliveryEstimate,
            tracking_link: this.getTrackingLink(order.orderId),
            status_type: 'status_update'
        });
    }

    // Send order delivery confirmation email
    async sendDeliveryConfirmation(order) {
        return this.sendEmail({
            to_email: order.email,
            to_name: order.customerName,
            subject: `Delivery Confirmed - ${order.orderId}`,
            order_id: order.orderId,
            customer_name: order.customerName,
            total_amount: order.totalAmount,
            thank_you_message: 'Thank you for choosing Harvest Hub! We hope you enjoy our premium Assam tea.',
            review_link: this.getReviewLink(order.orderId),
            status_type: 'delivery_confirmation'
        });
    }

    // Send order cancellation email
    async sendCancellationNotification(order, reason) {
        return this.sendEmail({
            to_email: order.email,
            to_name: order.customerName,
            subject: `Order Cancelled - ${order.orderId}`,
            order_id: order.orderId,
            customer_name: order.customerName,
            cancellation_reason: reason,
            refund_info: 'Your refund will be processed within 5-7 business days.',
            support_link: 'https://harvesthubtea.com/contact',
            status_type: 'cancellation'
        });
    }

    // Generic email sending function
    async sendEmail(emailData) {
        try {
            // For production, use EmailJS or another service
            // This is a mock implementation
            const notification = {
                timestamp: new Date().toISOString(),
                to: emailData.to_email,
                subject: emailData.subject,
                status: 'sent',
                type: emailData.status_type
            };

            this.notificationHistory.push(notification);
            this.saveNotificationHistory();

            console.log('Email sent successfully:', emailData);
            return {
                success: true,
                message: 'Email notification sent successfully',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error sending email:', error);
            return {
                success: false,
                message: 'Failed to send email notification',
                error: error.message
            };
        }
    }

    // Build order confirmation template
    buildOrderConfirmationTemplate(order) {
        return `
            <h2>Order Confirmation</h2>
            <p>Dear ${order.customerName},</p>
            <p>Thank you for your order! We're excited to deliver our premium Assam tea to you.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            
            <h3>Items Ordered:</h3>
            <ul>
                ${order.items.map(item => `<li>${item.name} × ${item.quantity} - ₹${item.price * item.quantity}</li>`).join('')}
            </ul>
            
            <h3>Delivery Address:</h3>
            <p>${this.formatAddress(order)}</p>
            
            <p><a href="${this.getTrackingLink(order.orderId)}">Track Your Order</a></p>
            
            <p>Best regards,<br>Harvest Hub Team</p>
        `;
    }

    // Format items list for email
    formatItemsList(items) {
        return items.map(item => `${item.name} (${item.quantity} × ₹${item.price})`).join(', ');
    }

    // Format address for email
    formatAddress(order) {
        return `${order.address}, ${order.city}, ${order.state} - ${order.pincode}`;
    }

    // Get status message based on status code
    getStatusMessage(status) {
        const messages = {
            'pending': 'Order Placed',
            'confirmed': 'Confirmed and Being Prepared',
            'shipped': 'Shipped - In Transit',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return messages[status] || status;
    }

    // Get delivery estimate based on status
    getDeliveryEstimate(status, orderDate) {
        const date = new Date(orderDate);
        const estimates = {
            'pending': `Estimated delivery: ${new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`,
            'confirmed': `Estimated delivery: ${new Date(date.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`,
            'shipped': `Estimated delivery: ${new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`,
            'delivered': 'Your order has been delivered!',
            'cancelled': 'This order has been cancelled'
        };
        return estimates[status] || 'Status information unavailable';
    }

    // Get tracking link
    getTrackingLink(orderId) {
        return `https://harvesthubtea.com/tracking.html?orderId=${orderId}`;
    }

    // Get review link
    getReviewLink(orderId) {
        return `https://harvesthubtea.com/review.html?orderId=${orderId}`;
    }

    // Get notification history
    getNotificationHistory() {
        return this.notificationHistory;
    }

    // Clear notification history
    clearNotificationHistory() {
        this.notificationHistory = [];
        localStorage.removeItem('emailNotificationHistory');
    }

    // Get notification stats
    getNotificationStats() {
        return {
            total: this.notificationHistory.length,
            sent: this.notificationHistory.filter(n => n.status === 'sent').length,
            failed: this.notificationHistory.filter(n => n.status === 'failed').length,
            byType: this.notificationHistory.reduce((acc, n) => {
                acc[n.type] = (acc[n.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Initialize email notification service
const emailNotificationService = new EmailNotificationService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailNotificationService;
}

// SMS Notification Service (Optional)
class SMSNotificationService {
    constructor() {
        this.provider = 'twilio'; // Using Twilio for SMS
        this.accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
        this.authToken = 'YOUR_TWILIO_AUTH_TOKEN';
        this.fromNumber = '+1234567890'; // Your Twilio number
        this.smsHistory = this.loadSMSHistory();
    }

    loadSMSHistory() {
        const history = localStorage.getItem('smsNotificationHistory');
        return history ? JSON.parse(history) : [];
    }

    saveSMSHistory() {
        localStorage.setItem('smsNotificationHistory', JSON.stringify(this.smsHistory));
    }

    async sendOrderStatusSMS(phone, orderId, status) {
        const message = `Your Harvest Hub order ${orderId} is now ${status}. Track it here: harvesthubtea.com/tracking`;
        
        try {
            // Mock implementation - in production, call Twilio API
            const sms = {
                timestamp: new Date().toISOString(),
                to: phone,
                message: message,
                status: 'sent'
            };
            
            this.smsHistory.push(sms);
            this.saveSMSHistory();
            
            console.log('SMS sent successfully:', sms);
            return { success: true, message: 'SMS sent successfully' };
        } catch (error) {
            console.error('Error sending SMS:', error);
            return { success: false, error: error.message };
        }
    }

    getSMSHistory() {
        return this.smsHistory;
    }
}

// Initialize SMS notification service
const smsNotificationService = new SMSNotificationService();

// Notification Manager - Coordinates email and SMS
class NotificationManager {
    static async notifyOrderConfirmation(order) {
        console.log('Sending order confirmation notifications for:', order.orderId);
        
        // Send email
        const emailResult = await emailNotificationService.sendOrderConfirmation(order);
        
        // Send SMS if phone is available
        if (order.phone) {
            const smsResult = await smsNotificationService.sendOrderStatusSMS(
                order.phone,
                order.orderId,
                'confirmed'
            );
        }

        return { email: emailResult };
    }

    static async notifyOrderStatusUpdate(order, newStatus) {
        console.log(`Sending ${newStatus} status notification for:`, order.orderId);
        
        const emailResult = await emailNotificationService.sendStatusUpdate(order, newStatus);
        
        if (order.phone) {
            const smsResult = await smsNotificationService.sendOrderStatusSMS(
                order.phone,
                order.orderId,
                newStatus
            );
        }

        return { email: emailResult };
    }

    static async notifyOrderDelivery(order) {
        console.log('Sending delivery confirmation for:', order.orderId);
        
        return await emailNotificationService.sendDeliveryConfirmation(order);
    }

    static async notifyOrderCancellation(order, reason) {
        console.log('Sending cancellation notification for:', order.orderId);
        
        const emailResult = await emailNotificationService.sendCancellationNotification(order, reason);
        
        if (order.phone) {
            const smsResult = await smsNotificationService.sendOrderStatusSMS(
                order.phone,
                order.orderId,
                'cancelled'
            );
        }

        return { email: emailResult };
    }

    static getNotificationStats() {
        return {
            emails: emailNotificationService.getNotificationStats(),
            sms: {
                total: smsNotificationService.getSMSHistory().length
            }
        };
    }

    static clearAllHistory() {
        emailNotificationService.clearNotificationHistory();
        localStorage.removeItem('smsNotificationHistory');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EmailNotificationService, SMSNotificationService, NotificationManager };
}
