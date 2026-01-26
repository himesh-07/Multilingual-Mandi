// Initialize Socket.IO
const socket = io();

// Global variables
let currentRoom = 'general';
let currentUser = 'user_' + Math.random().toString(36).substr(2, 9);

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section-specific data
    if (sectionName === 'marketplace') {
        loadProducts();
    }
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// Vendor Registration
document.getElementById('vendorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const vendorData = {
        name: document.getElementById('vendorName').value,
        location: document.getElementById('vendorLocation').value,
        language: document.getElementById('vendorLanguage').value,
        region: document.getElementById('vendorRegion').value
    };
    
    try {
        const result = await apiCall('/vendors', 'POST', vendorData);
        alert(`Vendor registered successfully! Your ID: ${result.id}`);
        document.getElementById('vendorForm').reset();
    } catch (error) {
        alert('Error registering vendor: ' + error.message);
    }
});

// Product Addition with Fair Pricing
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const basePrice = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    
    // Calculate fair price first
    try {
        const fairPriceResult = await apiCall('/fair-price', 'POST', {
            basePrice,
            region: 'rural', // Default for demo
            category
        });
        
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            basePrice,
            fairPrice: fairPriceResult.fairPrice,
            category,
            vendorId: document.getElementById('productVendor').value
        };
        
        const result = await apiCall('/products', 'POST', productData);
        
        // Show fair price calculation
        document.getElementById('fairPriceResult').innerHTML = `
            <h4>Fair Price Calculation</h4>
            <p>Original Price: $${fairPriceResult.originalPrice}</p>
            <p>Fair Price: $${fairPriceResult.fairPrice}</p>
            <p>Fair Trade Markup: $${fairPriceResult.markup}</p>
        `;
        
        alert('Product added successfully!');
        document.getElementById('productForm').reset();
        loadProducts(); // Refresh product list
        
    } catch (error) {
        alert('Error adding product: ' + error.message);
    }
});

// Load and Display Products
async function loadProducts() {
    try {
        const products = await apiCall('/products');
        const productGrid = document.getElementById('productGrid');
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: white;">
                    <h3>No products available yet</h3>
                    <p>Add some products using the Vendor Portal!</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price-info">
                    <span class="original-price">$${product.basePrice}</span>
                    <span class="fair-price">$${product.fairPrice}</span>
                </div>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Vendor:</strong> ${product.vendorId}</p>
                <button onclick="startChat('${product.vendorId}')" style="
                    background: #48bb78; 
                    color: white; 
                    border: none; 
                    padding: 0.5rem 1rem; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    margin-top: 1rem;
                ">Contact Vendor</button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Chat Functions
function joinRoom() {
    const roomId = document.getElementById('roomId').value;
    currentRoom = roomId;
    socket.emit('join-room', roomId);
    document.getElementById('chatMessages').innerHTML = `
        <div style="text-align: center; color: #666; padding: 1rem;">
            Joined room: ${roomId}
        </div>
    `;
}

function startChat(vendorId) {
    showSection('chat');
    document.getElementById('roomId').value = `vendor_${vendorId}`;
    joinRoom();
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    const language = document.getElementById('chatLanguage').value;
    
    if (!message) return;
    
    const messageData = {
        roomId: currentRoom,
        sender: currentUser,
        message,
        language,
        timestamp: new Date()
    };
    
    socket.emit('send-message', messageData);
    messageInput.value = '';
}

// Handle Enter key in chat input
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Socket event listeners
socket.on('receive-message', async (data) => {
    const chatMessages = document.getElementById('chatMessages');
    const currentLanguage = document.getElementById('chatLanguage').value;
    
    // Translate message if needed
    let displayMessage = data.message;
    if (data.language !== currentLanguage) {
        try {
            const translation = await apiCall('/translate', 'POST', {
                text: data.message,
                from: data.language,
                to: currentLanguage
            });
            displayMessage = `${translation.translatedText} (translated from ${data.language})`;
        } catch (error) {
            console.error('Translation error:', error);
        }
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${data.sender === currentUser ? 'own' : 'other'}`;
    messageElement.innerHTML = `
        <div class="message-info">${data.sender} - ${new Date(data.timestamp).toLocaleTimeString()}</div>
        <div>${displayMessage}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    joinRoom(); // Join default room
    
    // Add some demo products if none exist
    setTimeout(async () => {
        const products = await apiCall('/products');
        if (products.length === 0) {
            // Add demo products
            const demoProducts = [
                {
                    name: "Handwoven Silk Scarf",
                    description: "Beautiful traditional silk scarf with intricate patterns",
                    basePrice: 25,
                    category: "textiles",
                    vendorId: "demo_vendor_1"
                },
                {
                    name: "Ceramic Pottery Set",
                    description: "Hand-crafted ceramic bowls and plates",
                    basePrice: 45,
                    category: "handicrafts",
                    vendorId: "demo_vendor_2"
                }
            ];
            
            for (const product of demoProducts) {
                const fairPriceResult = await apiCall('/fair-price', 'POST', {
                    basePrice: product.basePrice,
                    region: 'rural',
                    category: product.category
                });
                
                await apiCall('/products', 'POST', {
                    ...product,
                    fairPrice: fairPriceResult.fairPrice
                });
            }
            
            loadProducts();
        }
    }, 1000);
});