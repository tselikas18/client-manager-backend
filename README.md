Pre-Release: v0.1.0-alpha — Backend API v1.0.0: Foundation Release Overview
First stable pre-release of the backend API. Provides core CRUD operations to manage users and their associated clients or suppliers. Built with TypeScript, Express, and MongoDB.

Highlights

Stable v0.1.0 API surface for user and client/supplier management.
Type-safe implementation using TypeScript.
Persistent storage with MongoDB (Mongoose schemas).
Lightweight REST endpoints implemented with Express.
Basic validation and error handling for core flows.

Key Features

Users
Create, read, update, delete users.
Input validation and consistent response shapes.

Clients / Suppliers
Create, read, update, delete client and supplier records associated with users.
Relationship modelling so each client/supplier links to an owner user.

API structure
RESTful routes, clear resource naming, and consistent status codes.

Developer experience
TypeScript types/interfaces for models and DTOs.
Organized controllers, services, and data-access layers.

Technologies

Language: TypeScript
Web framework: Express
Database: MongoDB (Mongoose)
Recommended Node version: 20.x+

Breaking changes

None — initial stable release.

Upgrade / Migration notes

No migrations required for fresh installs. If upgrading from a pre-release, back up MongoDB before switching to v1.0.0.
Ensure environment variables (MongoDB URI, PORT, any auth secrets) are set.

Getting started (example)

Install dependencies: npm install
Configure environment: set MONGODB_URI, PORT and API_KEY.
Start server (dev): npm start for build
