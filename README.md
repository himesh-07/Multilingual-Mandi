# Multilingual Mandi

A real-time linguistic and pricing bridge that empowers local vendors with AI-driven fair trade.

## Features

- **Multilingual Support**: Real-time translation for vendor-buyer communication
- **Fair Pricing Algorithm**: AI-driven pricing that ensures fair compensation for vendors
- **Real-time Chat**: Live communication with automatic translation
- **Vendor Portal**: Easy registration and product management
- **Global Marketplace**: Browse products from local vendors worldwide

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

### For Vendors
1. Go to the "Vendor Portal" section
2. Register as a vendor with your location and language
3. Add products with base pricing
4. The system automatically calculates fair prices based on your region and product category

### For Buyers
1. Browse the "Marketplace" section
2. Filter products by language and category
3. Contact vendors directly through the live chat
4. Messages are automatically translated between languages

### Live Chat
- Join chat rooms to communicate with vendors
- Select your preferred language
- Messages are automatically translated for all participants

## Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Real-time Communication**: WebSockets
- **Translation**: Mock API (ready for Google Translate integration)

## Fair Pricing Algorithm

The platform uses a multi-factor algorithm to ensure fair compensation:
- Base price set by vendor
- Regional multiplier (rural areas get higher margins)
- Category-specific adjustments
- Fair trade markup to support local communities

## Future Enhancements

- Integration with Google Translate API
- Payment processing with Stripe
- Vendor verification system
- Mobile app development
- Blockchain-based fair trade certification