# RATSO- RATING STORE SYSTEM BACKEND

--------------------------------------------------------------------------------

## Project Overview

**Ratso - Rating Store System Backend**

A Node.js/Express TypeScript API for a store rating system. Enables users to register stores (requiring admin approval), write reviews, and manage their profiles. Built with Prisma ORM and PostgreSQL.

## Development Commands

### Core Development
- **Start development server**: `npm run dev` (uses ts-node with nodemon)
- **Build for production**: `npm run build` (compiles TypeScript to `dist/`)
- **Start production server**: `npm start` (runs compiled JavaScript)

### Database Operations
- **Generate Prisma client**: `npx prisma generate`
- **Apply database migrations**: `npx prisma db push`
- **View database in browser**: `npx prisma studio`
- **Create new migration**: `npx prisma migrate dev --name <migration-name>`

### Environment Setup
- Copy `.env.sample` to `.env` and configure:
  - `DATABASE_URL` (PostgreSQL/Neon database)
  - `JWT_SECRET` (for authentication)
  - `RESEND_API_KEY` (for email verification)
  - `CLOUDINARY_*` variables (for image uploads)
  - `FRONTEND_URL` (CORS configuration)

## Architecture

### Database Schema (3-Entity System)
- **User**: Supports USER, ADMIN, STORE_OWNER roles with email verification
- **Store**: Created by store owners, requires admin approval (PENDING/APPROVED/REJECTED status)
- **Review**: One review per user per store, with rating constraints

### Project Structure
```
├── controllers/           # Business logic organized by domain
│   ├── auth/             # Authentication (signup, login, password reset)
│   ├── Stores/           # Store management (CRUD + admin approval)
│   ├── review/           # Review management 
│   ├── user/             # User profile management
│   └── Filters/          # Search functionality
├── routes/               # Express route definitions
├── middleware/           # Authentication and file upload middleware
├── helpers/              # Utility functions (JWT, email, Cloudinary)
├── Types/                # TypeScript definitions
├── config/               # Environment configuration
└── prisma/               # Database schema and types
```

### API Architecture Patterns
- **Centralized Controller Exports**: All controllers exported through `controllers/index.ts`
- **Middleware-Protected Routes**: Authentication required for most CRUD operations
- **Role-Based Access**: Admin approval workflow for store creation
- **JWT Authentication**: Bearer token in Authorization header
- **Consistent API Response**: Uses `ApiResponse` interface for standardized responses

### Key Technical Features
- **ES Modules**: Project uses `"type": "module"` with `.js` imports in TypeScript files
- **Strict TypeScript**: Configured with strict type checking and modern ES features
- **Prisma Custom Output**: Generated client outputs to `../generated/prisma`
- **Image Upload Pipeline**: Multer → Cloudinary integration
- **Email System**: Resend API for verification and password reset emails

### Authentication Flow
1. User registration creates unverified account
2. Email verification required before full access
3. JWT tokens for session management
4. Role-based permissions for admin functions

### Store Approval Workflow
1. Store owners create stores (status: PENDING)
2. Admin users can approve/reject stores
3. Only APPROVED stores appear in public listings
4. Reviews only allowed on approved stores

### Database Relationships
- Users → Stores (one-to-many, owner relationship)
- Users → Reviews (one-to-many)
- Stores → Reviews (one-to-many)
- Unique constraint: one review per user per store

## Development Notes

### File Extensions
- TypeScript files use `.ts` extension
- Import statements use `.js` extension (ESM requirement)
- Prisma client generated to custom path

### Testing Routes
Server runs on port from `process.env.PORT` (default 3000). API endpoints follow RESTful patterns under `/api/v1/` prefix.

### Common Gotchas
- Prisma client must be regenerated after schema changes
- Image uploads require Cloudinary configuration
- Email features require Resend API key
- Database migrations needed for schema changes
