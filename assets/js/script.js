// Shopping Cart and Checkout Functionality

let cart = [];

// Load cart from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productName = this.getAttribute('data-product');
            const price = parseInt(this.getAttribute('data-price'));
            addToCart(productName, price);
        });
    });

    // Cart modal close button
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

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            document.getElementById('cartModal').classList.remove('show');
            openCheckout();
        });
    }

    // Checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            placeOrder();
        });
    }

    // Order Now button in header
    const orderBtn = document.querySelector('.btn[href="#products"]');
    if (orderBtn) {
        orderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }
}

// Add item to cart
function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartDisplay();
    openCart();
    showNotification(`${productName} added to cart!`);
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartDisplay();
}

// Update quantity
function updateQuantity(index, quantity) {
    if (quantity > 0) {
        cart[index].quantity = quantity;
    } else {
        removeFromCart(index);
    }
    saveCartToStorage();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p><p>Add some premium Assam tea to get started!</p></div>';
        cartTotal.textContent = '0';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${itemTotal}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    cartTotal.textContent = total;
}

// Update checkout summary
function updateCheckoutSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summaryTotal = document.getElementById('summaryTotal');

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="summary-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });

    html += `<div class="summary-item"><span>Total</span><span>₹${total}</span></div>`;

    summaryItems.innerHTML = html;
    summaryTotal.textContent = total;
}

// Open cart modal
function openCart() {
    updateCartDisplay();
    document.getElementById('cartModal').classList.add('show');
}

// Open checkout
function openCheckout() {
    if (cart.length === 0) {
        alert('Please add items to your cart before checking out.');
        openCart();
        return;
    }
    updateCheckoutSummary();
    document.getElementById('checkoutModal').classList.add('show');
}

// Place order
function placeOrder() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);

   const orderData = {
    orderId: generateOrderId(),
    customerName: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    pincode: formData.get('pincode'),

    items: JSON.stringify(cart),

    totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),

    orderDate: new Date().toLocaleString("en-IN"),

    status: "Pending",

    paymentMethod: formData.get('paymentMethod'),

    notes: ""
};

    // Save order to localStorage (in a real app, this would be sent to a server)
    saveOrder(orderData);

    // Show success message
    alert('Order placed successfully!\n\nOrder ID: ' + generateOrderId() + '\n\nYou will receive a confirmation email shortly.');

    // Clear cart
    cart = [];
    saveCartToStorage();

    // Close modals and reset form
    document.getElementById('checkoutModal').classList.remove('show');
    form.reset();
    updateCartDisplay();

    // Redirect or show order confirmation
    showOrderConfirmation(orderData);
}

// Save order to localStorage
function saveOrder(orderData) {

    fetch("https://script.google.com/macros/s/AKfycbyaeFFZhV3VcXFIUdD3GsiRwWyLN9BuVDU5dZxdG-aIFpfEIwCgEpvp1QZnx_Zvp8T7/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain"
        },
        body: JSON.stringify({
            ...orderData,
            items: JSON.stringify(orderData.items)
        })
    })
    .then(() => {
        console.log("Order sent successfully");
    })
    .catch(error => {
        console.error("Error sending order:", error);
    });

}

// Generate order ID
function generateOrderId() {
    return 'HH' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Show order confirmation
function showOrderConfirmation(orderData) {
    
    const confirmationHTML = `
        <div class="modal show" style="display: flex;">
            <div class="modal-content">
                <h2 style="color: #0b5d3d; text-align: center;">✓ Order Confirmed!</h2>
                <div style="background: #f0f8f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                    <p><strong>Customer Name:</strong> ${orderData.customerName}</p>
                    <p><strong>Email:</strong> ${orderData.email}</p>
                    <p><strong>Delivery Address:</strong> ${orderData.address}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}</p>
                    <p><strong>Payment Method:</strong> ${getPaymentMethodLabel(orderData.paymentMethod)}</p>
                    <h3 style="color: #c89b3c;">Total Amount: ₹${orderData.totalAmount}</h3>
                </div>
                <p style="color: #666; text-align: center; font-size: 14px;">A confirmation email has been sent to ${orderData.email}</p>
                <button class="btn" style="width: 100%; margin-top: 20px;" onclick="location.reload()">Continue Shopping</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
}

// Get payment method label
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

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('harvestHubCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('harvestHubCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #0b5d3d;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {

        const href = this.getAttribute('href');

        if (!href || href === "#") {
            return;
        }

        const target = document.querySelector(href);

                if (target) {
            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });
        }

    });
});
