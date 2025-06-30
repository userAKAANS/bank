# NSG Bank - Digital Banking Application

## Overview

NSG Bank is a modern fake digital banking web application built with Node.js/Express backend and vanilla HTML/CSS/JavaScript frontend. The application features a sleek black and gray design aesthetic and supports bilingual Arabic-English interface with complete RTL support.

## System Architecture

**Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- Responsive mobile-first design with modern gradients and glassmorphism effects
- Client-side routing and state management
- Real-time language switching with RTL support
- JWT token-based authentication

**Backend**: Node.js with Express.js
- RESTful API architecture
- JWT authentication with bcrypt password hashing
- JSON file-based data persistence
- CORS-enabled for cross-origin requests

**Database**: JSON file storage
- users.json: User accounts, balances, card details
- transactions.json: Transaction history and records

## Key Components

### Authentication System
- Name + 4-digit PIN login/signup
- JWT token management with localStorage persistence
- Secure password hashing with bcryptjs
- Session management with automatic token validation

### Dashboard Features
- Real-time balance display with visibility toggle
- Account number display with masking option
- Recent transactions list with filtering
- Quick action buttons for core banking functions

### Money Transfer System
- User selection from registered accounts
- Real-time balance validation
- Transaction recording for both sender and recipient
- Transfer history with detailed descriptions

### Virtual Credit Card Generator
- Dynamic card number generation (4-digit groups)
- Automatic expiry date and CVV assignment
- Card regeneration functionality
- Secure card detail display with masking

### Bilingual Support
- Complete English/Arabic language switching
- RTL layout support for Arabic
- Dynamic text translation system
- Cultural-appropriate number and date formatting

## Data Flow

1. **Authentication Flow**: Client submits credentials → Server validates → JWT token issued → Client stores token → Authenticated requests include Bearer token
2. **Dashboard Load**: Token validation → User data retrieval → Transaction history fetch → UI population
3. **Transfer Process**: Recipient selection → Amount validation → Balance check → Database updates → Transaction logging
4. **Card Generation**: User request → New card details generation → Database update → UI refresh

## External Dependencies

**Backend Dependencies**:
- express: Web server framework
- cors: Cross-origin resource sharing
- body-parser: Request body parsing
- bcryptjs: Password hashing
- jsonwebtoken: JWT token management

**Frontend Dependencies**:
- Font Awesome 6.0.0: Icons and visual elements
- Google Fonts (Inter): Typography
- No additional JavaScript frameworks

## Deployment Strategy

**Current Setup**: 
- Single-port deployment on port 3000
- Static file serving through Express
- JSON file persistence in ./data directory
- Environment variable support for JWT secrets

**Production Considerations**:
- Database migration to PostgreSQL recommended
- SSL/TLS certificate implementation
- Environment-based configuration
- Rate limiting and security headers

## Changelog

- June 30, 2025: Complete NSG Bank application implemented
  - Full authentication system with name/PIN login
  - Dashboard with balance and transaction display
  - Money transfer functionality between users
  - Credit card generator with dynamic details
  - Bilingual Arabic/English support with RTL
  - Modern black/gray UI design
  - JSON-based data persistence

## User Preferences

Preferred communication style: Simple, everyday language.