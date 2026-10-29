# API Endpoints Product Requirements Document (PRD)

## Project Overview
**Product**: Learning App Authentication & User Management API
**Version**: 1.0
**Date**: October 8, 2025
**Status**: Ready for Development

## 1. Introduction

### 1.1 Purpose
This PRD outlines the technical requirements for implementing authentication and user management API endpoints for the Learning App. The implementation will use Supabase as the backend solution with Next.js API routes as the middleware layer.

### 1.2 Scope
- User authentication (registration, login, logout)
- Session management
- User profile management
- Password reset functionality
- Future extensibility for OAuth providers

## 2. Technical Architecture

### 2.1 Tech Stack
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Error Handling**: Custom error middleware
- **Security**: CORS, Rate limiting, Input sanitization

### 2.2 API Specifications
- **Type**: REST API
- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token (JWT from Supabase)

## 3. Endpoints Specification

### 3.1 Authentication Endpoints

#### 3.1.1 User Registration
```
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "created_at": "ISO8601",
      "email_confirmed_at": "null"
    },
    "session": {
      "access_token": "string",
      "refresh_token": "string",
      "expires_at": "number"
    }
  }
}
```

**Error Responses:**
- 400: Validation error
- 409: User already exists
- 500: Server error

#### 3.1.2 User Login
```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    },
    "session": {
      "access_token": "string",
      "refresh_token": "string",
      "expires_at": "number"
    }
  }
}
```

**Error Responses:**
- 400: Invalid credentials
- 401: Unverified email
- 500: Server error

#### 3.1.3 User Logout
```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### 3.1.4 Refresh Token
```
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "expires_at": "number"
  }
}
```

#### 3.1.5 Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  }
}
```

### 3.2 User Management Endpoints

#### 3.2.1 Get User Profile
```
GET /api/v1/users/profile
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar_url": "string|null",
    "bio": "string|null",
    "preferences": {
      "theme": "dark|light",
      "notifications": "boolean"
    },
    "created_at": "ISO8601"
  }
}
```

#### 3.2.2 Update User Profile
```
PUT /api/v1/users/profile
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "username": "string (optional)",
  "avatar_url": "string (optional)",
  "bio": "string (optional, max 500 chars)",
  "preferences": {
    "theme": "dark|light (optional)",
    "notifications": "boolean (optional)"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar_url": "string",
    "bio": "string",
    "preferences": {
      "theme": "string",
      "notifications": "boolean"
    },
    "updated_at": "ISO8601"
  }
}
```

#### 3.2.3 Delete User Account
```
DELETE /api/v1/users/account
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "string (confirmation)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account successfully deleted"
}
```

### 3.3 Password Reset Endpoints

#### 3.3.1 Request Password Reset
```
POST /api/v1/forgot-password/request
```

**Request Body:**
```json
{
  "email": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### 3.3.2 Reset Password
```
POST /api/v1/forgot-password/reset
```

**Request Body:**
```json
{
  "token": "string",
  "new_password": "string (min 8 chars)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password successfully reset"
}
```

### 3.4 OAuth Callback Endpoints (Future)
```
GET /api/v1/auth/callback/google
GET /api/v1/auth/callback/github
```

## 4. Database Schema

### 4.1 Users Table (Supabase Auth.users)
- id (uuid, primary key)
- email (text, unique)
- username (text, unique, 3-50 chars)
- password_hash (text, handled by Supabase)
- created_at (timestamp)
- updated_at (timestamp)
- email_confirmed_at (timestamp, nullable)
- avatar_url (text, nullable)
- bio (text, nullable, max 500 chars)

### 4.2 User Preferences Table
```sql
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  theme varchar(10) DEFAULT 'dark',
  notifications boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 4.3 Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  token varchar(255) UNIQUE,
  expires_at timestamp,
  used_at timestamp,
  created_at timestamp DEFAULT NOW()
);
```

## 5. Security Requirements

### 5.1 Authentication & Authorization
- JWT tokens with 1-hour expiration
- Refresh tokens with 30-day expiration
- Secure HTTP-only cookies for refresh tokens (optional)
- Bearer token validation on protected routes

### 5.2 Security Headers
```typescript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

### 5.3 Rate Limiting
- Auth endpoints: 5 requests per minute per IP
- General endpoints: 100 requests per minute per user
- Password reset: 3 requests per hour per email

### 5.4 Input Validation
- All inputs validated using Zod schemas
- SQL injection prevention via Supabase
- XSS prevention via input sanitization
- CSRF protection

## 6. Error Handling

### 6.1 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "object (optional)"
  }
}
```

### 6.2 Error Codes
- `VALIDATION_ERROR`: Invalid input
- `UNAUTHORIZED`: Invalid/missing token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## 7. Implementation Guidelines

### 7.1 Project Structure
```
/api/
  /v1/
    /auth/
      - register.ts
      - login.ts
      - logout.ts
      - refresh.ts
      - me.ts
    /users/
      - profile.ts
      - update.ts
      - delete.ts
    /forgot-password/
      - request.ts
      - reset.ts
  /middleware/
    - auth.ts
    - validation.ts
    - rate-limit.ts
    - error-handler.ts
  /lib/
    - supabase.ts
    - schemas.ts
    - types.ts
```

### 7.2 Environment Variables
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### 7.3 Dependencies
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "zod": "^3.22.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "nanoid": "^5.0.0"
}
```

## 8. Testing Requirements

### 8.1 Unit Tests
- All endpoint handlers
- Validation schemas
- Utility functions
- 90% code coverage required

### 8.2 Integration Tests
- Full auth flow (register → login → access protected route)
- Password reset flow
- Profile update flow
- Error scenarios

### 8.3 API Documentation
- OpenAPI/Swagger specification
- Postman collection
- Interactive API documentation

## 9. Deployment Considerations

### 9.1 Environment Setup
- Development: Local Supabase instance
- Staging: Separate Supabase project
- Production: Supabase Pro tier with backup

### 9.2 Monitoring & Logging
- Request/response logging
- Error tracking (Sentry recommended)
- Performance monitoring
- User activity audit logs

## 10. Future Enhancements

### 10.1 OAuth Providers
- Google OAuth implementation
- GitHub OAuth implementation
- Additional providers (Facebook, Twitter)

### 10.2 Advanced Features
- Two-factor authentication
- Email template customization
- Session management dashboard
- API versioning strategy
- GraphQL endpoint

## 11. Acceptance Criteria

1. All authentication endpoints working correctly
2. Secure session management
3. Complete CRUD operations for user profiles
4. Password reset functionality
5. Proper error handling and validation
6. Security measures implemented
7. Comprehensive test coverage
8. API documentation complete
9. Ready for frontend integration

## 12. Timeline Estimate

- **Phase 1**: Core Auth (register, login, logout) - 3 days
- **Phase 2**: User Management - 2 days
- **Phase 3**: Password Reset - 2 days
- **Phase 4**: Security & Testing - 3 days
- **Phase 5**: Documentation & Deployment - 1 day

**Total Estimated Time**: 11 working days

---

## Contact Information
**Product Manager**: [Your Name]
**Technical Lead**: [To be assigned]
**Start Date**: [To be determined]