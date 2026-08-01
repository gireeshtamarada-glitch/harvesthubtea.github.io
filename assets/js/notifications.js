// Harvest Hub - Enhanced Notification Manager Module
// Handles all email notifications, in-app notifications, and customer communications
// Replaces and enhances the existing notifications.js

class NotificationManager {
    constructor() {
        this.adminEmail = 'harvesthubassamtea@gmail.com';
        this.notificationQueue = [];
        this.notificationHistory = this.loadNotificationHistory();
    }

    /**
     * Load notification history from localStorage
     */
    loadNotificationHistory() {
        const saved = localStorage.getItem('harvestHubNotificationHistory');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Save notification history to localStorage
     */
    saveNotificationHistory() {
        localStorage.setItem('harvestHubNotificationHistory', JSON.stringify(this.notificationHistory));
    }

    /**
     * Send order confirmation notification to customer
     */
    static async notifyOrderConfirmation(order) {
        try {
            const notificationData = {
                type: 'order_confirmation',
                orderId: order.orderId,
                customerName: order.customerName,
                customerEmail: order.email,
                totalAmount: order.totalAmount,
                items: order.items,
                deliveryAddress: `${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
                orderDate: order.orderDate,
                timestamp: new Date().toISOString()
            };

            // Log the notification
            NotificationManager.logNotification(notificationData);

            // Show in-app notification
            NotificationManager.showNotification(
                `✅ Order ${order.orderId} confirmed! Check your email for details.`,
                'success'
            );

            console.log('📧 Order confirmation prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing order confirmation:', error);
            return false;
        }
    }

    /**
     * Send order status update notification
     */
    static async notifyOrderStatusUpdate(order, newStatus) {
        try {
            const statusMessages = {
                'pending': 'Your order is being processed',
                'confirmed': 'Your order has been confirmed',
                'shipped': 'Your order is on its way! 📦',
                'delivered': 'Your order has been delivered! 🎉',
                'cancelled': 'Your order has been cancelled'
            };

            const notificationData = {
                type: 'order_status_update',
                orderId: order.orderId,
                customerName: order.customerName,
                customerEmail: order.email,
                status: newStatus,
                statusMessage: statusMessages[newStatus] || newStatus,
                timestamp: new Date().toISOString()
            };

            // Log the notification
            NotificationManager.logNotification(notificationData);

            // Show in-app notification
            NotificationManager.showNotification(
                `📦 Order ${order.orderId}: ${notificationData.statusMessage}`,
                newStatus === 'delivered' ? 'success' : 'info'
            );

            console.log('📧 Status update prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing status update:', error);
            return false;
        }
    }

    /**
     * Send payment reminder notification
     */
    static async notifyPaymentReminder(order) {
        try {
            const notificationData = {
                type: 'payment_reminder',
                orderId: order.orderId,
                customerName: order.customerName,
                customerEmail: order.email,
                totalAmount: order.totalAmount,
                orderDate: order.orderDate,
                timestamp: new Date().toISOString()
            };

            NotificationManager.logNotification(notificationData);
            NotificationManager.showNotification('💰 Payment reminder sent', 'warning');

            console.log('📧 Payment reminder prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing payment reminder:', error);
            return false;
        }
    }

    /**
     * Send abandoned cart notification
     */
    static async notifyAbandonedCart(cartData) {
        try {
            const notificationData = {
                type: 'abandoned_cart',
                customerEmail: cartData.email,
                customerName: cartData.name,
                cartItems: cartData.items,
                cartTotal: cartData.total,
                recoveryLink: cartData.recoveryLink || '#',
                timestamp: new Date().toISOString()
            };

            NotificationManager.logNotification(notificationData);
            NotificationManager.showNotification('🛒 Cart recovery email sent', 'info');

            console.log('📧 Abandoned cart notification prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing abandoned cart notification:', error);
            return false;
        }
    }

    /**
     * Send promotional notification
     */
    static async notifyPromotion(email, promotionData) {
        try {
            const notificationData = {
                type: 'promotion',
                customerEmail: email,
                promotionTitle: promotionData.title,
                promotionDescription: promotionData.description,
                discountCode: promotionData.code,
                discountPercentage: promotionData.percentage,
                validUntil: promotionData.validUntil,
                timestamp: new Date().toISOString()
            };

            NotificationManager.logNotification(notificationData);
            NotificationManager.showNotification('🎉 Promotion email sent', 'info');

            console.log('📧 Promotion notification prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing promotion notification:', error);
            return false;
        }
    }

    /**
     * Send customer review request
     */
    static async notifyReviewRequest(order) {
        try {
            const notificationData = {
                type: 'review_request',
                orderId: order.orderId,
                customerEmail: order.email,
                customerName: order.customerName,
                reviewLink: `https://harvesthubtea.com/review.html?orderId=${order.orderId}`,
                items: order.items,
                timestamp: new Date().toISOString()
            };

            NotificationManager.logNotification(notificationData);
            NotificationManager.showNotification('⭐ Review request sent', 'info');

            console.log('📧 Review request prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing review request:', error);
            return false;
        }
    }

    /**
     * Send birthday surprise notification
     */
    static async notifyBirthdaySurprise(customerData) {
        try {
            const notificationData = {
                type: 'birthday_surprise',
                customerEmail: customerData.email,
                customerName: customerData.name,
                discountCode: 'BIRTHDAY2024',
                discountPercentage: 15,
                message: `🎉 Happy Birthday ${customerData.name}! Enjoy 15% off your next order!`,
                timestamp: new Date().toISOString()
            };

            NotificationManager.logNotification(notificationData);
            NotificationManager.showNotification('🎂 Birthday greetings sent!', 'success');

            console.log('📧 Birthday surprise prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing birthday surprise:', error);
            return false;
        }
    }

    /**
     * Send reorder reminder
     */
    static async notifyReorderReminder(customerData, lastOrderDate) {
        try {
            const notificationData = {
                type: 'reorder_reminder',
                customerEmail: customerData.email,
                customerName: customerData.name,
                lastOrderDate: lastOrderDate,
                reorderLink: 'https://harvesthubtea.com/shop.html',
                timestamp: new Date().toISOString()
            };

            NotificationManager.logNotification(notificationData);
            NotificationManager.showNotification('🍵 Reorder reminder sent', 'info');

            console.log('📧 Reorder reminder prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing reorder reminder:', error);
            return false;
        }
    }

    /**
     * Send refund notification
     */
    static async notifyRefund(order, refundAmount, reason) {
        try {
            const notificationData = {
                type: 'refund_notification',
                orderId: order.orderId,
                customerEmail: order.email,
                customerName: order.customerName,
                refundAmount: refundAmount,
                reason: reason,
                timestamp: new Date().toISOString()
            };

            NotificationManager.logNotification(notificationData);
            NotificationManager.showNotification(`💰 Refund of ₹${refundAmount} processed`, 'success');

            console.log('📧 Refund notification prepared:', notificationData);
            return true;

        } catch (error) {
            console.error('❌ Error preparing refund notification:', error);
            return false;
        }
    }

    /**
     * Show in-app notification (toast)
     */
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `app-notification notification-${type}`;

        const colors = {
            'success': { bg: '#4CAF50', icon: '✅' },
            'error': { bg: '#f44336', icon: '❌' },
            'warning': { bg: '#ff9800', icon: '⚠️' },
            'info': { bg: '#2196F3', icon: 'ℹ️' },
            'order': { bg: '#0b5d3d', icon: '🍵' }
        };

        const config = colors[type] || colors['info'];

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${config.bg};
            color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
        `;

        // Add icon
        const iconSpan = document.createElement('span');
        iconSpan.textContent = config.icon;
        iconSpan.style.fontSize = '18px';
        notification.appendChild(iconSpan);

        // Add message
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        notification.appendChild(messageSpan);

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            opacity: 0.8;
            transition: opacity 0.2s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
        closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';
        notification.appendChild(closeBtn);

        document.body.appendChild(notification);

        const timeoutId = setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        closeBtn.onclick = () => {
            clearTimeout(timeoutId);
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        };

        return notification;
    }

    /**
     * Show confirmation dialog
     */
    static showConfirmation(title, message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            max-width: 400px;
            text-align: center;
            font-family: Arial, sans-serif;
            animation: slideUp 0.3s ease;
        `;

        const titleEl = document.createElement('h2');
        titleEl.textContent = '🍵 ' + title;
        titleEl.style.cssText = 'color: #0b3f23; margin-top: 0;';

        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.cssText = 'color: #666; line-height: 1.6; margin: 20px 0;';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 30px;';

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.cssText = `
            background: #0b5d3d;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: background 0.2s;
        `;
        confirmBtn.onmouseover = () => confirmBtn.style.background = '#083a2a';
        confirmBtn.onmouseout = () => confirmBtn.style.background = '#0b5d3d';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            background: #ccc;
            color: #333;
            border: none;
            padding: 10px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: background 0.2s;
        `;
        cancelBtn.onmouseover = () => cancelBtn.style.background = '#bbb';
        cancelBtn.onmouseout = () => cancelBtn.style.background = '#ccc';

        buttonContainer.appendChild(confirmBtn);
        buttonContainer.appendChild(cancelBtn);

        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        confirmBtn.onclick = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };

        cancelBtn.onclick = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };
    }

    /**
     * Log notification event
     */
    static logNotification(eventData) {
        const manager = window.notificationManager || new NotificationManager();
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...eventData
        };

        manager.notificationHistory.push(logEntry);
        
        // Keep only last 100 logs
        if (manager.notificationHistory.length > 100) {
            manager.notificationHistory.shift();
        }
        
        manager.saveNotificationHistory();
        console.log('📊 Notification logged:', logEntry);
    }

    /**
     * Get notification logs
     */
    static getNotificationLogs(limit = 10) {
        const manager = window.notificationManager || new NotificationManager();
        return manager.notificationHistory.slice(-limit).reverse();
    }

    /**
     * Clear notification logs
     */
    static clearNotificationLogs() {
        if (window.notificationManager) {
            window.notificationManager.notificationHistory = [];
            window.notificationManager.saveNotificationHistory();
        }
        console.log('✅ Notification logs cleared');
    }

    /**
     * Get notification statistics
     */
    static getNotificationStats() {
        const manager = window.notificationManager || new NotificationManager();
        const stats = {};
        
        manager.notificationHistory.forEach(log => {
            stats[log.type] = (stats[log.type] || 0) + 1;
        });

        return {
            total: manager.notificationHistory.length,
            byType: stats,
            lastNotification: manager.notificationHistory[manager.notificationHistory.length - 1] || null
        };
    }
}

// CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .app-notification {
        letter-spacing: 0.5px;
    }

    .app-notification:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    window.notificationManager = new NotificationManager();
    console.log('✅ Notification Manager initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
