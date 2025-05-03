# Heart Transplant System

A secure heart transplant management system with blockchain-style data structure for immutable record-keeping. The system allows hospitals to register donors and recipients, and provides automated matching based on compatibility and urgency.

## Features

- **Secure Authentication**: Hospital-based authentication system
- **Blockchain-Style Records**: Each record maintains a hash of its data and links to previous records
- **Genesis Blocks**: System automatically creates genesis blocks in the database
- **Automated Matching**: Intelligent donor-recipient matching based on:
  - Blood type compatibility
  - Age proximity
  - Urgency level
  - HLA matching (simplified)
  - Time on waiting list
- **Modern UI**: Clean, responsive interface for all screens

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Frontend**: EJS templates, Bootstrap 5, Vanilla JavaScript
- **Authentication**: Express-session with MongoDB store
- **Hashing**: SHA-256 via Node.js crypto module

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd transplant-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create `src/config/config.env` file with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/transplant
PORT=3000
SESSION_SECRET=heart_transplant_secure_session
```

4. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Project Structure

```
transplant-system/
├── public/                  # Static files
│   ├── css/                 # CSS styles
│   ├── js/                  # JavaScript files 
│   └── img/                 # Image assets
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   └── views/               # EJS templates
├── server.js                # Main application entry
├── package.json             # Project metadata
└── README.md                # Documentation
```

## Usage

1. Register your hospital through the registration page
2. Login with your hospital credentials
3. Use the dashboard to view donor and recipient status
4. Register new donors and recipients
5. View matches when they occur

## Security Features

- Password hashing with bcrypt
- Session management with secure cookies
- Blockchain-style record integrity
- Each record is linked to previous records by hash
- Records can be retrieved only by their hash IDs

## Future Improvements

- Migration to AWS QLDB for full immutability
- Full HLA matching implementation
- Advanced allocation algorithms
- Administrative dashboard
- Transaction signing with digital signatures
- Multi-factor authentication

## License

[ISC License](LICENSE) 