# Client Manager Backend

A comprehensive REST API backend for managing clients and suppliers, built with TypeScript, Express.js, and MongoDB. This application provides secure user authentication, CRUD operations for client/supplier management, and robust data validation.

## Features

- **User Management**: Secure user registration and authentication with session-based cookies
- **Client Management**: Full CRUD operations for client records with search functionality
- **Supplier Management**: Complete supplier lifecycle management with data validation
- **Authentication**: Cookie-based authentication with secure password hashing and session tokens
- **Data Validation**: Input validation using Zod schemas for type safety
- **Search Functionality**: Search clients and suppliers by name, email, or phone
- **Dashboard Statistics**: Overview of user's clients and suppliers data
- **Ownership Validation**: Middleware to ensure users can only access their own data
- **CORS Support**: Configured for frontend integration
- **RESTful Design**: Clean, consistent API endpoints following REST principles

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js (v20.x+ recommended)
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schemas for input validation
- **Authentication**: Crypto module for password hashing and session management
- **Middleware**: Custom authentication and ownership validation
- **Development**: nodemon for hot reloading, TypeScript compiler

### Dependencies

- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling for Node.js
- **zod**: TypeScript-first schema validation
- **cookie-parser**: Parse HTTP cookies
- **cors**: Enable Cross-Origin Resource Sharing
- **body-parser**: Parse incoming request bodies
- **compression**: Compress response bodies
- **dotenv**: Load environment variables from .env file

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js**: Version 20.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

## Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/tselikas18/client-manager-backend.git
cd client-manager-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URL=mongodb://localhost:27017/client-manager
API_KEY=your-secret-api-key-here
PORT=8000
```

**Environment Variables Explained:**
- `MONGODB_URL`: MongoDB connection string (local or MongoDB Atlas)
- `API_KEY`: Secret key used for password hashing and authentication
- `PORT`: Port number for the server (optional, defaults to 8000)

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition from [MongoDB Official Site](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URL` in `.env`

### 5. Build and Start the Server

```bash
# Build TypeScript to JavaScript
npm run build

# Start in development mode with hot reload
npm start
```

The server will start on `http://localhost:8000` (or your configured PORT).

## Configuration

### CORS Configuration
The API is configured to accept requests from `http://localhost:5173` (common Vite development server port). To modify this:

1. Edit `src/index.ts`
2. Update the `cors` middleware configuration:

```typescript
app.use(cors({
  origin: 'http://your-frontend-url:port',
  credentials: true,
}));
```

### Cookie Configuration
Session cookies are configured with:
- `httpOnly: true` - Prevents XSS attacks
- `sameSite: "lax"` - CSRF protection (changes to "none" in production)
- `secure: false` - Set to `true` in production for HTTPS
- `maxAge: 7 days` - Cookie expiration time

## API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "id": "user_id",
  "name": "john_doe",
  "email": "john@example.com"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authenticated successfully.",
  "user": {
    "id": "user_id",
    "name": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
```http
GET /auth/me
Cookie: authenticated=session_token
```

### Client Management Endpoints

#### Get All Clients
```http
GET /clients?search=optional_search_term
Cookie: authenticated=session_token
```

#### Create Client
```http
POST /clients
Content-Type: application/json
Cookie: authenticated=session_token

{
  "name": "Client Name",
  "phone": "1234567890",
  "email": "client@example.com",
  "amount_owed": 1500.50,
  "notes": "Important client notes"
}
```

#### Get Client by ID
```http
GET /clients/:id
Cookie: authenticated=session_token
```

#### Update Client
```http
PATCH /clients/:id
Content-Type: application/json
Cookie: authenticated=session_token

{
  "name": "Updated Client Name",
  "amount_owed": 2000.00
}
```

#### Delete Client
```http
DELETE /clients/:id
Cookie: authenticated=session_token
```

#### Search Clients
```http
GET /clients/email/:email
GET /clients/phone/:phone
GET /clients/name/:name
Cookie: authenticated=session_token
```

#### Delete Client by Search
```http
DELETE /clients/email/:email
DELETE /clients/phone/:phone
DELETE /clients/name/:name
Cookie: authenticated=session_token
```

### Supplier Management Endpoints

#### Get All Suppliers
```http
GET /suppliers
Cookie: authenticated=session_token
```

#### Create Supplier
```http
POST /suppliers
Content-Type: application/json
Cookie: authenticated=session_token

{
  "name": "Supplier Name",
  "phone": "1234567890",
  "email": "supplier@example.com",
  "amount_owed": 750.25,
  "notes": "Supplier notes"
}
```

#### Update Supplier
```http
PATCH /suppliers/:id
Content-Type: application/json
Cookie: authenticated=session_token

{
  "name": "Updated Supplier Name"
}
```

#### Delete Supplier
```http
DELETE /suppliers/:id
Cookie: authenticated=session_token
```

#### Search Suppliers
```http
GET /suppliers/email/:email
GET /suppliers/phone/:phone
GET /suppliers/name/:name
Cookie: authenticated=session_token
```

### Dashboard Endpoint

#### Get Dashboard Statistics
```http
GET /dashboard
Cookie: authenticated=session_token
```

**Response:**
```json
{
  "total_money_owed_to_me": 15000.50,
  "total_money_i_owe": 8500.25,
  "net_position": 6500.25,
  "total_clients": 25,
  "total_suppliers": 15,
  "recent_clients": [
    {
      "id": "client_id",
      "name": "Recent Client",
      "phone": "1234567890",
      "email": "client@example.com",
      "amount_owed": 1500.00
    }
  ],
  "recent_suppliers": [
    {
      "id": "supplier_id", 
      "name": "Recent Supplier",
      "phone": "0987654321",
      "email": "supplier@example.com",
      "amount_owed": 750.00
    }
  ]
}
```

### User Management Endpoints

#### Get All Users
```http
GET /users
Cookie: authenticated=session_token
```

#### Get Current User Profile
```http
GET /users/me
Cookie: authenticated=session_token
```

#### Update User
```http
PATCH /users/:id
Content-Type: application/json
Cookie: authenticated=session_token

{
  "username": "updated_username",
  "email": "new@example.com"
}
```

#### Delete User
```http
DELETE /users/:id
Cookie: authenticated=session_token
```

## Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  username: string,
  email: string (validated with regex),
  createdAt: Date,
  authentication: {
    password: string (hashed),
    salt: string,
    sessionToken: string
  }
}
```

### Client Model
```typescript
{
  _id: ObjectId,
  user_id: string (reference to User),
  name: string (required),
  phone: string (optional, min 10 chars),
  email: string (optional, validated),
  amount_owed: number (default: 0.0),
  notes: string (optional),
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `{ user_id: 1, email: 1 }` - Unique sparse index
- `{ user_id: 1, phone: 1 }` - Unique sparse index

### Supplier Model
```typescript
{
  _id: ObjectId,
  user_id: string (reference to User),
  name: string (required),
  phone: string (optional, min 10 chars),
  email: string (optional, validated),
  amount_owed: number (default: 0.0),
  notes: string (optional),
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
- `{ user_id: 1, email: 1 }` - Unique sparse index
- `{ user_id: 1, phone: 1 }` - Unique sparse index
- `{ user_id: 1, name: 1 }` - Non-unique index

## Development

### Running in Development Mode

```bash
# Install dependencies
npm install

# Start with hot reload
npm start
```

The development server uses nodemon for automatic restarts when files change.

### Building for Production

```bash
# Compile TypeScript
npm run build

# Start production server
node dist/src/index.js
```

### Development Scripts

- `npm start` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript

### Code Structure

```
src/
├── controllers/           # Request handlers
│   ├── authenticationController.ts
│   ├── clientControllers.ts
│   ├── supplierController.ts
│   ├── usersController.ts
│   └── dashboardController.ts
├── db/                   # Database models and queries
│   ├── users.ts
│   ├── client.ts
│   └── supplier.ts
├── middlewares/          # Custom middleware
│   └── index.ts
├── router/              # Route definitions
│   ├── indexRouter.ts
│   ├── authenticationRouter.ts
│   ├── clientRouter.ts
│   ├── supplierRouter.ts
│   ├── usersRouter.ts
│   └── dashboardRouter.ts
├── helpers/             # Utility functions
│   └── index.ts
├── types.ts            # TypeScript type definitions
└── index.ts           # Application entry point
```

### Key Middleware

- **isAuthenticated**: Validates session cookies and sets user identity
- **isOwner**: Ensures users can only access/modify their own resources
- **CORS**: Enables cross-origin requests from frontend
- **Validation**: Zod schemas validate all input data

## Project Structure

```
client-manager-backend/
├── src/                 # Source code
├── dist/               # Compiled JavaScript (gitignored)
├── node_modules/       # Dependencies (gitignored)
├── config.ts          # Environment configuration
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── nodemon.json       # Nodemon configuration
├── .gitignore        # Git ignore rules
├── .env              # Environment variables (gitignored)
└── README.md         # Project documentation
```

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the existing code style
4. Test your changes thoroughly
5. Commit with descriptive messages
6. Push to your fork and submit a pull request

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper error handling
- Validate all inputs using Zod schemas
- Include JSDoc comments for complex functions
- Maintain consistent indentation (2 spaces)

### Testing Guidelines

- Test all new endpoints manually
- Verify authentication and authorization work correctly
- Check that data validation prevents invalid inputs
- Ensure proper error responses for edge cases

### Pull Request Process

1. Ensure your code builds without errors: `npm run build`
2. Update documentation if needed
3. Describe your changes clearly in the PR description
4. Link any relevant issues

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running locally or check your connection string.

#### Port Already in Use
```
Error: listen EADDRINUSE :::8000
```
**Solution**: Change the PORT in your `.env` file or stop the process using port 8000.

#### Authentication Cookie Issues
```
401 Unauthorized on authenticated routes
```
**Solution**: Ensure you're sending cookies with requests and check CORS configuration.

#### TypeScript Build Errors
```
error TS2304: Cannot find name 'xyz'
```
**Solution**: Run `npm install` to ensure all dependencies are installed.

### Environment Issues

1. **Missing .env file**: Copy example above and fill in your values
2. **Wrong Node.js version**: Use Node.js 20.x or higher
3. **MongoDB not accessible**: Check connection string and network access

### Development Tips

- Use `console.debug` statements to trace authentication flow
- Check browser Network tab for cookie handling
- Verify MongoDB connection in the console logs
- Use MongoDB Compass for database inspection

## License

This project is proprietary software. All rights reserved.

For questions or support, please contact the development team.
