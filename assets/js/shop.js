// Harvest Hub Shop - Complete E-commerce System
// Includes order management, checkout, and email notification integration

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartDisplay();
    }

    loadCart() {
        const saved = localStorage.getItem('harvestHubCart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('harvestHubCart', JSON.stringify(this.items));
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity || 1,
                image: product.image
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Item added to cart!', 'success');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }

        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) {
            cartTotal.textContent = '₹' + this.getTotal().toFixed(2);
        }
    }

    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Order Management System
class OrderManager {
    constructor() {
        this.orders = this.loadOrders();
        this.googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbzr72ItVbHYKJtjlAQf6JK5v8wD2qN4EKhO8Bkw_kHReejJWL3nQgsel_1VUh_g2HkRaA/exec';
        this.adminEmail = 'harvesthubassamtea@gmail.com';
    }

    loadOrders() {
        const saved = localStorage.getItem('harvestHubOrders');
        return saved ? JSON.parse(saved) : [];
    }

    saveOrders() {
        localStorage.setItem('harvestHubOrders', JSON.stringify(this.orders));
    }

    generateOrderId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        return `HH${timestamp}${random}`;
    }

    createOrder(customerData, cartItems) {
        const order = {
            orderId: this.generateOrderId(),
            orderDate: new Date().toISOString(),
            status: 'pending',
            customerName: customerData.fullName,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            city: customerData.city,
            state: customerData.state,
            pincode: customerData.pincode,
            items: cartItems,
            totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            paymentMethod: customerData.paymentMethod || 'upi',
            paymentStatus: 'pending',
            notes: customerData.notes || ''
        };

        this.orders.push(order);
        this.saveOrders();

        return order;
    }

    getOrderById(orderId) {
        return this.orders.find(order => order.orderId === orderId);
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.getOrderById(orderId);
        if (order) {
            order.status = newStatus;
            this.saveOrders();
            
            // Send status update notification
            NotificationManager.notifyOrderStatusUpdate(order, newStatus);
            
            return order;
        }
        return null;
    }

    getAllOrders() {
        return this.orders;
    }
}

// Checkout Handler
class CheckoutHandler {
    constructor() {
        this.cart = new ShoppingCart();
        this.orderManager = new OrderManager();
    }

    async processCheckout(formData) {
        try {
            // Validate form data
            if (!this.validateCheckoutForm(formData)) {
                this.cart.showNotification('Please fill in all required fields', 'error');
                return false;
            }

            // Create order
            const order = this.orderManager.createOrder(formData, this.cart.items);

            // Save to Google Sheets via Google Apps Script
            await this.saveOrderToGoogleSheets(order);

            // Send confirmation email
            await NotificationManager.notifyOrderConfirmation(order);

            // Send admin notification
            await this.sendAdminNotification(order);

            // Clear cart
            this.cart.clear();

            // Show success message
            this.cart.showNotification('Order placed successfully! Check your email for confirmation.', 'success');

            // Redirect to confirmation page
            window.location.href = `order-confirmation.html?orderId=${order.orderId}`;

            return true;

        } catch (error) {
            console.error('Checkout error:', error);
            this.cart.showNotification('Error processing order. Please try again.', 'error');
            return false;
        }
    }

    validateCheckoutForm(formData) {
        const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
        return required.every(field => formData[field] && formData[field].trim());
    }

    async saveOrderToGoogleSheets(order) {
        try {
            const payload = {
                orderId: order.orderId,
                customerName: order.customerName,
                email: order.email,
                phone: order.phone,
                address: order.address,
                city: order.city,
                state: order.state,
                pincode: order.pincode,
                items: JSON.stringify(order.items),
                totalAmount: order.totalAmount,
                orderDate: new Date(order.orderDate).toLocaleString('en-IN'),
                status: order.status,
                paymentMethod: order.paymentMethod,
                notes: order.notes
            };

            // Send to Google Apps Script
            const response = await fetch(this.orderManager.googleAppsScriptUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
});

const result = await response.json();

console.log('Google Apps Script Response:', result);

if (result.success) {
    console.log('Order saved to Google Sheets successfully');
    return true;
} else {
    console.error('Google Sheet Error:', result.message);
    return false;
}

    async sendAdminNotification(order) {
        try {
            const adminEmailData = {
                to_email: this.orderManager.adminEmail,
                to_name: 'Harvest Hub Admin',
                subject: `New Order - ${order.orderId}`,
                order_id: order.orderId,
                customer_name: order.customerName,
                customer_email: order.email,
                customer_phone: order.phone,
                total_amount: order.totalAmount,
                items_list: order.items.map(item => `${item.name} × ${item.quantity}`).join(', '),
                delivery_address: `${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
                status_type: 'admin_notification'
            };

            // Log to console (in production, this would call the email service)
            console.log('Admin notification:', adminEmailData);
            
            return true;

        } catch (error) {
            console.error('Error sending admin notification:', error);
            return false;
        }
    }
}

// Payment Handler
class PaymentHandler {
    constructor() {
        this.razorpayKeyId = 'YOUR_RAZORPAY_KEY_ID'; // Add your Razorpay key
    }

    initializeRazorpay(order, onSuccess, onError) {
        const options = {
            key: this.razorpayKeyId,
            amount: order.totalAmount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            name: 'Harvest Hub Assam Tea',
            description: `Order ${order.orderId}`,
            image: 'assets/images/logo.png',
            order_id: order.orderId,
            handler: function(response) {
                console.log('Payment successful:', response);
                onSuccess(response);
            },
            prefill: {
                name: order.customerName,
                email: order.email,
                contact: order.phone
            },
            theme: {
                color: '#0b5d3d'
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment modal dismissed');
                    onError('Payment cancelled');
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    window.cart = new ShoppingCart();
    window.orderManager = new OrderManager();
    window.checkoutHandler = new CheckoutHandler();
    window.paymentHandler = new PaymentHandler();

    setupShopEventListeners();
});

// Setup event listeners
function setupShopEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.dataset.productId,
                name: productCard.querySelector('.product-name').textContent,
                price: parseFloat(productCard.dataset.price),
                image: productCard.querySelector('.product-image').src,
                quantity: parseInt(productCard.querySelector('.quantity-input')?.value || 1)
            };
            window.cart.addItem(product);
        });
    });

    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                fullName: document.getElementById('fullName')?.value,
                email: document.getElementById('email')?.value,
                phone: document.getElementById('phone')?.value,
                address: document.getElementById('address')?.value,
                city: document.getElementById('city')?.value,
                state: document.getElementById('state')?.value,
                pincode: document.getElementById('pincode')?.value,
                paymentMethod: document.getElementById('paymentMethod')?.value || 'upi',
                notes: document.getElementById('notes')?.value || ''
            };

            await window.checkoutHandler.processCheckout(formData);
        });
    }

    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the cart?')) {
                window.cart.clear();
            }
        });
    }
}

// Utility: Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Utility: Show toast notification
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #323232;
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        font-family: Roboto, sans-serif;
        z-index: 9999;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart, OrderManager, CheckoutHandler, PaymentHandler };
}
