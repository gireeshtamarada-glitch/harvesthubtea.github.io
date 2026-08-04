// Order Tracking Functionality

let allOrders = [];

// Initialize tracking on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    displayDemoOrders();
    setupEventListeners();
});

// Load orders from localStorage
function loadOrders() {
    const savedOrders = localStorage.getItem('harvestHubOrders');
    if (savedOrders) {
        allOrders = JSON.parse(savedOrders);
    } else {
        allOrders = [];
    }
}

// Setup event listeners
function setupEventListeners() {
    // Enter key on order ID input
    document.getElementById('orderIdInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchOrder();
        }
    });

    // Enter key on email input
    document.getElementById('emailInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchByEmail();
        }
    });
}

// Search order by Order ID
async function searchOrder() {

    const orderId = document.getElementById('orderIdInput').value.trim();

    if (!orderId) {
        showError('Please enter an Order ID');
        return;
    }

    try {

        const response = await fetch(
             "https://script.google.com/macros/s/AKfycbzEeoGBMHJgHkgN4AAx7viPtVUOCUSeyDdE8n7x1Ta-DkRsxOi2pQ9KSJ38M0a7iwBl/exec?orderId=" + encodeURIComponent(orderId)
);

        const result = await response.json();

        if (result.success) {

            displayOrderStatus({
                orderId: result.order.orderId,
                customerName: result.order.customerName,
                email: result.order.email,
                phone: result.order.phone,
                address: result.order.address,
                city: "",
                state: "",
                pincode: "",
                orderDate: result.order.date,
                totalAmount: result.order.amount,
                status: result.order.status,
                items: [
                    {
                        name: result.order.product,
                        quantity: result.order.quantity,
                        price: result.order.amount
                    }
                ]
            });

        } else {

            showError(result.message);

        }

    } catch (err) {

        console.error(err);
        showError("Unable to connect to the server.");

    }

}

// Search order by Email
function searchByEmail() {
    const email = document.getElementById('emailInput').value.trim();

    if (!email) {
        showError('Please enter an email address');
        return;
    }

    const orders = allOrders.filter(o => o.email && o.email.toLowerCase() === email.toLowerCase());

    if (orders.length === 0) {
        showError(`No orders found for email: ${email}`);
    } else if (orders.length === 1) {
        displayOrderStatus(orders[0]);
    } else {
        // Multiple orders for same email - show the most recent
        displayOrderStatus(orders[orders.length - 1]);
    }
}

// Display order status
function displayOrderStatus(order) {
    // Hide error and search sections
    document.getElementById('errorContainer').style.display = 'none';
    document.getElementById('orderStatusContainer').style.display = 'block';

    // Fill in order details
    document.getElementById('displayOrderId').textContent = order.orderId || 'N/A';
    document.getElementById('displayName').textContent = order.customerName || 'N/A';
    document.getElementById('displayEmail').textContent = order.email || 'N/A';

    const date = new Date(order.orderDate);
    const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('displayDate').textContent = formattedDate;

    document.getElementById('displayAmount').textContent = '₹' + order.totalAmount;

    // Display delivery address
    document.getElementById('displayAddress').textContent = order.address || 'N/A';
    document.getElementById('displayCity').textContent = `${order.city || 'N/A'}, ${order.state || 'N/A'} - ${order.pincode || 'N/A'}`;
    document.getElementById('displayContact').textContent = `Phone: ${order.phone || 'N/A'}`;

    // Display order items
    displayOrderItems(order.items);

    // Update timeline
    updateTimeline(order.status || 'pending', order.orderDate);

    // Display current status badge
    displayStatusBadge(order.status || 'pending');

    // Display delivery estimate
    displayDeliveryEstimate(order.status || 'pending', order.orderDate);

    // Scroll to results
    document.getElementById('orderStatusContainer').scrollIntoView({ behavior: 'smooth' });
}

// Display order items
function displayOrderItems(items) {
    const itemsList = document.getElementById('orderItemsList');
    
    if (!items || items.length === 0) {
        itemsList.innerHTML = '<p>No items found</p>';
        return;
    }

    let html = '';
    let subtotal = 0;

    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="item-row">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantity: ${item.quantity}</div>
                </div>
                <div class="item-price">₹${itemTotal}</div>
            </div>
        `;
    });

    html += `
        <div class="item-row" style="background: #e8eaed; font-weight: 700;">
            <div class="item-name">Subtotal</div>
            <div class="item-price">₹${subtotal}</div>
        </div>
    `;

    itemsList.innerHTML = html;
}

// Update timeline based on status
function updateTimeline(status, orderDate) {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const statusIndex = statuses.indexOf(status.toLowerCase());

    const date = new Date(orderDate);

    // Reset all timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
    item.style.opacity = '0.5';
    item.classList.remove('active');
});

    // Activate timeline items up to current status
    for (let i = 0; i <= statusIndex; i++) {
        const timelineItem = document.getElementById(`timeline-${statuses[i]}`);
        if (timelineItem) {
            timelineItem.style.opacity = '1';
            timelineItem.classList.add('active');

            // Add timestamp
            let timeElement = document.getElementById(`time-${statuses[i]}`);
            if (timeElement) {
                if (i === 0) {
                    // Order placed - use actual order date
                    timeElement.textContent = date.toLocaleDateString('en-IN') + ' at ' + date.toLocaleTimeString('en-IN');
                } else {
                    // Estimated dates for other statuses
                    const estimatedDate = new Date(date);
                    estimatedDate.setDate(estimatedDate.getDate() + i);
                    timeElement.textContent = 'Estimated: ' + estimatedDate.toLocaleDateString('en-IN');
                }
            }
        }
    }
}

// Display status badge
function displayStatusBadge(status) {
    const badge = document.getElementById('currentStatusBadge');
    const statusLower = status.toLowerCase();
    
    badge.className = `status-badge ${statusLower}`;
    
    const statusLabels = {
        'pending': 'Order Placed',
        'confirmed': 'Order Confirmed',
        'shipped': 'In Transit',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };

    badge.textContent = statusLabels[statusLower] || status;
}

// Display delivery estimate
function displayDeliveryEstimate(status, orderDate) {
    const estimateText = document.getElementById('estimateText');
    const date = new Date(orderDate);

    const estimates = {
        'pending': `Your order is being processed. Expected delivery: ${new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`,
        'confirmed': `Your order has been confirmed. Expected delivery: ${new Date(date.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`,
        'shipped': `Your order is on the way! Expected delivery: ${new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`,
        'delivered': `Your order has been delivered. Thank you for shopping with us!`,
        'cancelled': `This order has been cancelled. Please contact support for more information.`
    };

    estimateText.textContent = estimates[status.toLowerCase()] || 'Status information unavailable';
}

// Show error message
function showError(message) {
    document.getElementById('errorContainer').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('orderStatusContainer').style.display = 'none';

    document.getElementById('errorContainer').scrollIntoView({ behavior: 'smooth' });
}

// Reset tracking
function resetTracking() {
    document.getElementById('orderIdInput').value = '';
    document.getElementById('emailInput').value = '';
    document.getElementById('orderStatusContainer').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'none';
    document.getElementById('orderIdInput').focus();
}

// Update notification preference
function updateNotificationPreference() {
    const isChecked = document.getElementById('emailNotifCheckbox').checked;
    alert('Notification preference ' + (isChecked ? 'enabled' : 'disabled') + ' successfully!');
}

// Display demo orders
function displayDemoOrders() {
    const demoList = document.getElementById('demoOrdersList');

    // Get recent orders as demo
    const recentOrders = allOrders.slice(-3).reverse();

    if (recentOrders.length === 0) {
        demoList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No orders available yet. Place an order to track it here!</p>';
        return;
    }

    let html = '';
    recentOrders.forEach(order => {
        html += `
            <div class="demo-order-card" onclick="searchByDemoOrder('${order.orderId || ''}')">
                <div class="demo-order-id">${order.orderId || 'HH-DEMO'}</div>
                <div class="demo-order-email">${order.email || 'N/A'}</div>
                <div class="demo-order-amount">₹${order.totalAmount}</div>
            </div>
        `;
    });

    demoList.innerHTML = html;
}

// Search by demo order
function searchByDemoOrder(orderId) {
    document.getElementById('orderIdInput').value = orderId;
    searchOrder();
}

// Email notification integration (mock)
function sendEmailNotification(order, status) {
    // This is a mock function - in production, this would call an email service
    console.log(`Sending email notification to ${order.email} for order ${order.orderId} with status: ${status}`);
    
    const emailData = {
        to: order.email,
        subject: `Order ${order.orderId} - ${status} Update`,
        body: `Your order ${order.orderId} status has been updated to: ${status}`
    };

    // In production, you would send this to a backend service
    // fetch('/api/send-email', { method: 'POST', body: JSON.stringify(emailData) });
}

// Auto-update demo orders (refresh every 30 seconds)
setInterval(function() {
    loadOrders();
    displayDemoOrders();
}, 30000);

// Keyboard shortcut: Press 'T' to focus on tracking input
document.addEventListener('keydown', function(e) {
    if (e.key === 't' || e.key === 'T') {
        document.getElementById('orderIdInput')?.focus();
    }
});
