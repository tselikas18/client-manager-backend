# Client Manager Backend

A TypeScript-based REST API for managing clients and suppliers with user authentication and dashboard analytics.

## 🚀 Overview

Client Manager Backend is a full-featured REST API built with TypeScript, Express.js, and MongoDB. It provides comprehensive CRUD operations for managing users, clients, and suppliers with secure authentication and detailed analytics through a dashboard interface.

## ✨ Key Features

### User Management
- User registration and authentication
- Session-based authentication with secure cookies
- Password hashing with salt
- User profile management

### Client Management
- Create, read, update, delete client records
- Search clients by name, email, or phone
- Track the amount owed by clients
- User-specific client isolation (users can only manage their own clients)
- Duplicate prevention for email, phone, and name within user scope

### Supplier Management
- Complete CRUD operations for suppliers
- Search and filter capabilities
- Track amounts owed to suppliers
- User-specific supplier management

### Dashboard & Analytics
- Financial overview (total money owed to user vs. money user owes)
- Net position calculation
- Recent clients and suppliers tracking
- Client and supplier count statistics

### Data Validation & Security
- Comprehensive input validation using Zod
- Email format validation
- Phone number validation (minimum 8 characters)
- Ownership verification middleware
- Authentication middleware for protected routes

## 🛠 Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js (20.x+ recommended)
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod
- **Authentication**: JWT
- **Development**: Nodemon for hot reloading

## 📁 Project Structure

```
src/
├── controllers/           # Request handlers
│   ├── authenticationController.ts
│   ├── clientControllers.ts
│   ├── supplierController.ts
│   ├── dashboardController.ts
│   └── usersController.ts
├── db/                   # Database models and helpers
│   ├── client.ts
│   ├── supplier.ts
│   └── users.ts
├── middlewares/          # Authentication and authorization
│   └── index.ts
├── router/              # Route definitions
│   ├── authenticationRouter.ts
│   ├── clientRouter.ts
│   ├── supplierRouter.ts
│   ├── dashboardRouter.ts
│   ├── usersRouter.ts
│   └── indexRouter.ts
├── helpers/             # Utility functions
│   └── index.ts
├── types.ts             # TypeScript interfaces
└── index.ts             # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- MongoDB instance
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tselikas18/client-manager-backend.git
   cd client-manager-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory (Check config.ts for environment variable validation):
   ```env
   MONGODB_URL=mongodb://localhost:27017/client-manager
   API_KEY=your-secret-api-key-here
   PORT=8000
   JWT_SECRET=your-secret-jwt-key-here
   NODE_ENV=development or production or test
   ```
   

4. **Start the development server**
   ```bash
   nodemon
   ```

The server will start on `http://localhost:8000`

### Build for Production
```bash
npm install && tsc
```

## 🔐 Security Features

- **Password Security**: JWT Authentication
- **Session Management**: Secure cookie-based authentication with configurable expiration
- **Input Validation**: Comprehensive validation using Zod schemas
- **Ownership Protection**: Users can only access their own resources
- **CORS Configuration**: Configured for frontend integration
- **SQL Injection Prevention**: MongoDB with Mongoose provides built-in protection

## 🔧 Configuration

### Environment Variables

| Variable      | Description                   | Required | Default     |
|---------------|-------------------------------|----------|-------------|
| `MONGODB_URL` | MongoDB connection string     | Yes      | -           |
| `API_KEY`     | Secret key for authentication | Yes      | -           |
| `PORT`        | Server port                   | Yes      | -           |
| `JWT_SECRET`  | JWT Authentication String     | Yes      | -           |
| `NODE_ENV`    | JWT Authentication String     | No       | development |

## 🧪 Validation Rules

### Client/Supplier Validation
- **Name**: Required, minimum 1 character
- **Email**: Optional, must be valid email format if provided
- **Phone**: Optional, minimum 8 characters if provided
- **Amount Owed**: Must be a positive number
- **Notes**: Optional string

### User Validation
- **Username**: Required
- **Email**: Required, valid email format
- **Password**: Required for registration

## 🚦 Error Handling
The API returns consistent error responses.

## Swagger API Documentation
- http://localhost:8000/api-docs/

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## 🚀 Deployment On Render
- Deploying the backend as Web Service on Render:

**Create a new Web Service on Render**
**Connect your GitHub repository**
**Configure the service:**
- **Environment: Node**
- **Build Command: npm install && tsc**
- **Start Command: node dist/src/index.js**
- **Environment Variables:**
- - **JWT_SECRET: Secret key for JWT token generation**
- - **MONGODB_URL: MongoDB connection string**
- - **API_KEY: API key for authentication**
- - **FRONTEND_URL: URL of your frontend (e.g., https://your-frontend-name.onrender.com/)**
- - **NODE_ENV: production**
**Click "Create Web Service"**
- The API will be available at your Render service URL.



