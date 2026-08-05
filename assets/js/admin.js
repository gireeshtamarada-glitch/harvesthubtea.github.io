// Admin Dashboard Functionality

let allOrders = [];

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async function () {

    await loadOrders();

    setupMenuListeners();

    updateDateTime();

    setInterval(updateDateTime, 1000);

});

// ******** GOOGLE SHEETS ********
const API_URL = "https://script.google.com/macros/s/AKfycbzEeoGBMHJgHkgN4AAx7viPtVUOCUSeyDdE8n7x1Ta-DkRsxOi2pQ9KSJ38M0a7iwBl/exec";

async function loadOrders() {

    try {

        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.success) {

            allOrders = result.orders.map(order => ({

                orderId: order["Order ID"],
                customerName: order["Customer Name"],
                email: order["Email"],
                phone: order["Phone"],
                address: order["Address"],
                city: order["City"],
                state: order["State"],
                pincode: order["Pincode"],

                items: (() => {
                    try {
                        if (!order["Items"]) return [];
                        return typeof order["Items"] === "string"
                            ? JSON.parse(order["Items"])
                            : order["Items"];
                    } catch (e) {
                        console.warn("Invalid Items JSON:", order["Items"]);
                        return [];
                    }
                })(),

                totalAmount: Number(order["Total Amount"]) || 0,
                orderDate: order["Order Date"],
                status: (order["Status"] || "pending").toLowerCase(),
                paymentMethod: order["Payment Method"]

            }));

        } else {

            allOrders = [];

        }

        displayDashboard();
        displayOrders();

    } catch (error) {

        console.error(error);
        alert("Unable to load orders from Google Sheets.");

    }

}

// Update date and time
function updateDateTime() {
    const dateTimeElement = document.getElementById('dateTime');
    if (dateTimeElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        dateTimeElement.textContent = now.toLocaleDateString('en-IN', options);
    }
}

// Setup sidebar menu listeners
function setupMenuListeners() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            if (sectionId === 'dashboard' || sectionId === 'orders' || sectionId === 'products' || sectionId === 'settings') {
                showSection(sectionId);
            }
        });
    });

    // Close modal listener
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });

    // Filter and search
    document.getElementById('statusFilter')?.addEventListener('change', filterOrders);
    document.getElementById('searchOrder')?.addEventListener('input', filterOrders);
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Add active class to menu item
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

    // Load content for the section
    if (sectionId === 'dashboard') {
        displayDashboard();
    } else if (sectionId === 'orders') {
        displayOrders();
    } else if (sectionId === 'products') {
        displayProducts();
    }
}

// Display Dashboard
function displayDashboard() {
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = allOrders.filter(order => order.status === 'delivered').length;
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;

    displayRecentOrders();
}

// Display Recent Orders
function displayRecentOrders() {
    const recentList = document.getElementById('recentOrdersList');
    const recent = allOrders.slice(-5).reverse();

    if (recent.length === 0) {
        recentList.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">No orders yet</p>';
        return;
    }

    let html = '';
    recent.forEach(order => {
        const date = new Date(order.orderDate).toLocaleDateString('en-IN');
        html += `
            <div class="recent-order-item">
                <strong>${order.orderId || 'N/A'}</strong>
                <span>${order.customerName}</span>
                <span>₹${order.totalAmount}</span>
                <span class="order-status status-${order.status || 'pending'}">${order.status || 'pending'}</span>
                <span>${date}</span>
            </div>
        `;
    });

    recentList.innerHTML = html;
}

// Display All Orders
function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    
    if (allOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No orders yet</td></tr>';
        return;
    }

    let html = '';
    allOrders.forEach((order, index) => {
        const date = new Date(order.orderDate).toLocaleDateString('en-IN');
        html += `
            <tr>
                <td><strong>${order.orderId || 'HH-' + index}</strong></td>
                <td>${order.customerName}</td>
                <td>${order.email}</td>
                <td>₹${order.totalAmount}</td>
                <td><span class="order-status status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                <td>${date}</td>
                <td><button class="btn-view" onclick="viewOrderDetails(${index})">View</button></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// View Order Details
function viewOrderDetails(index) {
    const order = allOrders[index];
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');

    const date = new Date(order.orderDate).toLocaleDateString('en-IN');
    const time = new Date(order.orderDate).toLocaleTimeString('en-IN');

    let items = order.items;

if (typeof items === "string") {
    try {
        items = JSON.parse(items);
    } catch (e) {
        items = [];
    }
}

if (!Array.isArray(items)) {
    items = [];
}

let itemsHtml = '';

items.forEach(item => {

    let html = `
        <div class="detail-section">
            <div class="detail-label">Order ID</div>
            <div class="detail-value">${order.orderId || 'HH-' + index}</div>
        </div>

        <div class="detail-section">
            <div class="detail-label">Customer Information</div>
            <div class="detail-value">
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-label">Delivery Address</div>
            <div class="detail-value">
                <p>${order.address}</p>
                <p>${order.city}, ${order.state} - ${order.pincode}</p>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-label">Order Items</div>
            <ul class="order-items">
                ${itemsHtml}
            </ul>
        </div>

        <div class="detail-section">
            <div class="detail-label">Payment Details</div>
            <div class="detail-value">
                <p><strong>Payment Method:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</p>
                <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-label">Order Date & Time</div>
            <div class="detail-value">
                <p>${date} at ${time}</p>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-label">Order Status</div>
            <div class="status-selector">
                <select id="orderStatus" value="${order.status || 'pending'}">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <button class="btn-update-status" onclick="updateOrderStatus(${index})">Update</button>
            </div>
        </div>
    `;

    content.innerHTML = html;
    document.getElementById('orderStatus').value = order.status || 'pending';
    modal.classList.add('show');
}

// Update Order Status
async function updateOrderStatus(index) {

    const newStatus = document.getElementById("orderStatus").value;
    const order = allOrders[index];

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "updateStatus",
                orderId: order.orderId,
                status: newStatus
            })
        });

        const result = await response.json();

        if (result.success) {

            alert("Order status updated successfully.");

            document.getElementById("orderDetailModal").classList.remove("show");

            await loadOrders();

        } else {

            alert(result.message);

        }

    } catch (error) {

        console.error(error);
        alert("Failed to update order status.");

    }

}

// Filter Orders
function filterOrders() {
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchOrder').value.toLowerCase();
    const tbody = document.getElementById('ordersTableBody');

    let filtered = allOrders.filter(order => {
        const matchStatus = !status || order.status === status;
        const matchSearch = !search || 
                          order.orderId?.toLowerCase().includes(search) ||
                          order.email?.toLowerCase().includes(search);
        return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">No orders found</td></tr>';
        return;
    }

    let html = '';
    filtered.forEach((order, index) => {
        const date = new Date(order.orderDate).toLocaleDateString('en-IN');
        const actualIndex = allOrders.indexOf(order);
        html += `
            <tr>
                <td><strong>${order.orderId || 'HH-' + actualIndex}</strong></td>
                <td>${order.customerName}</td>
                <td>${order.email}</td>
                <td>₹${order.totalAmount}</td>
                <td><span class="order-status status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
                <td>${date}</td>
                <td><button class="btn-view" onclick="viewOrderDetails(${actualIndex})">View</button></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Display Products
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const products = [
        { name: 'Harvest Hub Assam Tea - 250g', price: 599, stock: 25 },
        { name: 'Harvest Hub Assam Tea - 500g', price: 1099, stock: 15 },
        { name: 'Harvest Hub Assam Tea - 1kg', price: 1999, stock: 10 }
    ];

    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-card-header">
                    🍵
                </div>
                <div class="product-card-body">
                    <h3>${product.name}</h3>
                    <div class="product-price">₹${product.price}</div>
                    <div class="product-stock">Stock: ${product.stock} units</div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

// Save Settings
function saveSettings() {
    const settings = {
        email: document.getElementById('storeEmail').value,
        phone: document.getElementById('storePhone').value,
        address: document.getElementById('shippingAddress').value
    };
    localStorage.setItem('harvestHubSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

// Load Settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('harvestHubSettings')) || {};
    document.getElementById('storeEmail').value = settings.email || '';
    document.getElementById('storePhone').value = settings.phone || '';
    document.getElementById('shippingAddress').value = settings.address || '';
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to clear all orders? This action cannot be undone.')) {
        localStorage.removeItem('harvestHubOrders');
        allOrders = [];
        alert('All orders have been cleared.');
        displayDashboard();
        displayOrders();
    }
}

// Save Orders
function saveOrders() {
    localStorage.setItem('harvestHubOrders', JSON.stringify(allOrders));
}

// Get Payment Method Label
function getPaymentMethodLabel(method) {
    const methods = {
        'creditCard': 'Credit Card',
        'debitCard': 'Debit Card',
        'upi': 'UPI',
        'netBanking': 'Net Banking',
        'cod': 'Cash on Delivery'
    };
    return methods[method] || method;
}

// Load settings on page load
document.addEventListener('DOMContentLoaded', function() {
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
        settingsSection.addEventListener('click', loadSettings);
    }
});

// Update orders with order ID if missing
function ensureOrderIds() {
    allOrders.forEach((order, index) => {
        if (!order.orderId) {
            order.orderId = 'HH' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase() + index;
        }
        if (!order.status) {
            order.status = 'pending';
        }
    });
    saveOrders();
}

// Initialize order IDs on load
ensureOrderIds();
