# Architecture Overview

This document provides a high-level overview of LearnDash's architecture, design decisions, and system components.

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                             │
│                (Next.js 15 + React 19)                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │   Hooks & Utils     │  │
│  │             │  │             │  │                     │  │
│  │ • Dashboard │  │ • UI Library │  │ • useState          │  │
│  │ • Quizzer   │  │ • Auth       │  │ • useEffect         │  │
│  │ • Timetable │  │ • Layout     │  │ • Custom Hooks      │  │
│  │ • Auth      │  │ • Forms      │  │ • Services          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ API Routes (Next.js)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                              │
│                (Next.js API Routes)                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Auth API  │  │  Quiz API   │  │    AI Integration    │  │
│  │             │  │             │  │                     │  │
│  │ • Login     │  │ • Sessions  │  │ • Gemini 2.0 Flash  │  │
│  │ • Register  │  │ • Questions │  │ • Prompt Engineering│  │
│  │ • Logout    │  │ • Answers   │  │ • Response Parsing   │  │
│  │ • Session   │  │ • Stats     │  │ • Error Handling     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│                                                             │
│  ┌─────────────┐              ┌─────────────────────┐      │
│  │  Supabase   │◄────────────►│   Google Gemini AI   │      │
│  │             │              │                     │      │
│  │ • Database  │              │ • Quiz Generation   │      │
│  │ • Auth      │              │ • Timetable AI      │      │
│  │ • Storage   │              │ • NLP Processing    │      │
│  │ • Realtime  │              │                     │      │
│  └─────────────┘              └─────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🧱 Component Architecture

### 1. Presentation Layer (Frontend)

#### Page Components
```typescript
src/app/
├── dashboard/     # Dashboard with learning analytics
├── quizzer/       # Quiz configuration interface
├── quiz/          # Quiz taking interface
├── timetable/     # AI-powered timetable generator
└── auth/          # Authentication pages
```

#### Shared Components
```typescript
src/components/
├── ui/            # Reusable UI components (shadcn/ui)
├── layout/        # Layout components (Sidebar, Header)
├── auth/          # Authentication components
└── quiz/          # Quiz-specific components
```

#### Business Logic
```typescript
src/
├── services/      # Service layer for business logic
├── lib/           # Utility libraries and configurations
└── types/         # TypeScript type definitions
```

### 2. API Layer (Backend)

#### Route Structure
```
src/app/api/
├── auth/          # Authentication endpoints
├── quiz/          # Quiz management endpoints
└── ai/            # AI integration endpoints
```

#### API Design Principles
- **RESTful design** following HTTP standards
- **Consistent response format** across all endpoints
- **Proper error handling** with meaningful messages
- **Type safety** with TypeScript throughout
- **Security** with authentication and authorization

### 3. Data Layer

#### Database Schema
- **Users**: Authentication and profile data
- **Quiz Sessions**: Quiz attempt tracking
- **Questions**: Generated quiz questions
- **Answers**: User responses and performance
- **Stats**: Aggregated performance metrics

#### Data Flow
```
User Action → Frontend Component → API Route → Service Layer → Database
                                    ↓
Response ← Frontend Component ← API Route ← Service Layer ← Database
```

## 🔄 Request Flow

### Authentication Flow
```
1. User enters credentials in auth form
2. Frontend sends POST to /api/auth/signin
3. API validates with Supabase
4. Supabase returns JWT token
5. API sets secure HTTP-only cookie
6. Frontend redirects to dashboard
7. Middleware validates token on protected routes
```

### Quiz Generation Flow
```
1. User configures quiz in quizzer
2. Frontend sends configuration to /api/ai/quiz
3. API formats prompt for Gemini AI
4. Gemini generates questions
5. API parses and validates response
6. Questions saved to database
7. Frontend receives questions and starts quiz
```

### Quiz Taking Flow
```
1. User answers question
2. Answer saved to database in real-time
3. Progress tracked in quiz session
4. On completion:
   - Calculate final score
   - Update user statistics
   - Mark session as complete
5. Show results with detailed feedback
```

## 🎨 Design System Architecture

### Theme System
```typescript
// Centralized color management
src/lib/theme.ts
├── Colors
│   ├── Primary palette
│   ├── Semantic colors
│   └── Dark theme variants
├── Typography
│   ├── Font families
│   ├── Size scale
│   └── Line heights
└── Spacing
    ├── Margin/padding scale
    └── Layout breakpoints
```

### Component Library
```
src/components/ui/
├── Primitive Components
│   ├── Button       # Core button with variants
│   ├── Input        # Form input with validation
│   ├── Card         # Glass-effect card
│   └── Modal        # Overlay dialogs
├── Composite Components
│   ├── Form         # Form with validation
│   ├── DataTable    # Sortable data table
│   └── Chart        # Data visualization
└── Layout Components
    ├── Container    # Responsive container
    ├── Grid         # CSS grid wrapper
    └── Flex         # Flexbox wrapper
```

## 🔒 Security Architecture

### Authentication & Authorization
```
1. JWT-based authentication with Supabase
2. Secure HTTP-only cookies for tokens
3. Row-Level Security (RLS) in database
4. Middleware for route protection
5. CSRF protection with sameSite cookies
```

### Data Protection
```
1. Environment variables for secrets
2. API key rotation policy
3. Input validation with Zod schemas
4. SQL injection prevention with ORMs
5. XSS prevention with React's built-in protection
```

### API Security
```
1. Rate limiting on sensitive endpoints
2. Request validation middleware
3. Error message sanitization
4. CORS configuration
5. HTTPS enforcement in production
```

## ⚡ Performance Architecture

### Frontend Optimizations
```
1. Code splitting with Next.js dynamic imports
2. Image optimization with next/image
3. Font optimization with next/font
4. Lazy loading for heavy components
5. Memoization for expensive computations
```

### Database Optimizations
```
1. Indexed columns for frequent queries
2. Connection pooling with Supabase
3. Query optimization with EXPLAIN ANALYZE
4. Caching strategies for frequently accessed data
5. Database views for complex queries
```

### API Performance
```
1. Response caching where appropriate
2. Request compression with gzip
3. Minimal data transfer (selective fields)
4. Async operations for long-running tasks
5. Pagination for large datasets
```

## 🔄 State Management

### Client-Side State
```typescript
// React state for UI
- useState for component state
- useContext for global state
- useReducer for complex state logic
- useMemo/useCallback for optimization
```

### Server State
```typescript
// Data fetching and caching
- Server Components for static data
- Client Components for interactive data
- SWR/React Query for data synchronization
```

### Session Management
```typescript
// User session tracking
- HTTP-only cookies for JWT
- Client-side session validation
- Automatic token refresh
- Session persistence across reloads
```

## 📊 Analytics & Monitoring

### Performance Metrics
```
1. Page load times
2. API response times
3. Database query performance
4. Error rates
5. User interaction metrics
```

### User Analytics
```
1. Quiz completion rates
2. Time spent on questions
3. Subject preferences
4. Learning progress
5. Feature usage statistics
```

### Error Tracking
```
1. Client-side errors with Sentry (planned)
2. Server-side error logging
3. Database error monitoring
4. API failure alerts
5. Performance regression detection
```

## 🔮 Scalability Architecture

### Horizontal Scaling
```
1. Stateless API design
2. Load balancer ready
3. CDN for static assets
4. Database read replicas
5. Microservice-ready structure
```

### Vertical Scaling
```
1. Efficient code architecture
2. Resource monitoring
3. Performance profiling
4. Database query optimization
5. Memory usage optimization
```

## 🧪 Testing Architecture

### Unit Tests (Planned)
```
1. Component testing with React Testing Library
2. Utility function testing with Jest
3. API endpoint testing
4. Type checking with TypeScript
```

### Integration Tests (Planned)
```
1. API integration testing
2. Database integration testing
3. Authentication flow testing
4. End-to-end user journeys
```

### Performance Tests (Planned)
```
1. Load testing with k6
2. Performance profiling
3. Bundle size analysis
4. Memory leak detection
```

## 📝 Architectural Decisions & Rationale

### 1. Next.js 15 with App Router
**Decision**: Use latest Next.js features
**Rationale**:
- Improved performance with server components
- Better SEO with streaming SSR
- Nested layouts and routing
- Built-in optimizations

### 2. Supabase as Backend
**Decision**: Use Supabase instead of custom backend
**Rationale**:
- Rapid development
- Built-in authentication
- Real-time capabilities
- Managed database

### 3. Tailwind CSS v4
**Decision**: Use utility-first CSS framework
**Rationale**:
- Consistent design system
- No custom CSS to maintain
- Highly optimizable
- Developer productivity

### 4. TypeScript Everywhere
**Decision**: Full TypeScript adoption
**Rationale**:
- Type safety across stack
- Better IDE support
- Self-documenting code
- Reduced runtime errors

### 5. Component-Based Architecture
**Decision**: Modular, reusable components
**Rationale**:
- Maintainability
- Reusability
- Testing isolation
- Team collaboration

## 🔄 Future Architecture Evolution

### Phase 1: Current State
- ✅ Core functionality
- ✅ Authentication
- ✅ Quiz system
- ✅ AI integration

### Phase 2: Enhancements (Planned)
- 🔄 Real-time features
- 🔄 Advanced analytics
- 🔄 Mobile app
- 🔄 Offline support

### Phase 3: Scaling (Future)
- ⏳ Microservices
- ⏳ Multi-tenant architecture
- ⏳ Edge computing
- ⏳ AI-powered recommendations

## 📚 Architecture Documentation

- [Database Schema](./database-schema.md)
- [Design System](./design-system.md)
- [API Architecture](../04/api/overview.md)
- [Security Architecture](../03-features/authentication.md)

---

This architecture is designed to be scalable, maintainable, and performant. It follows modern web development best practices while prioritizing developer experience and code quality.