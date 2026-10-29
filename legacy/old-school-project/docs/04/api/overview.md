# API Overview

This document provides a comprehensive overview of all APIs in LearnDash, including authentication, quiz management, and AI integration endpoints.

## 📡 Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

## 🔐 Authentication

All API endpoints (except auth endpoints) require authentication via JWT tokens passed in HTTP-only cookies.

### Authentication Flow
1. User signs in via `/api/auth/signin`
2. Server sets secure `sb-access-token` cookie
3. Subsequent requests include the cookie automatically
4. Middleware validates the token on protected routes

### Error Responses
```json
{
  "error": "Unauthorized",
  "message": "Please sign in to continue"
}
```

## 📚 API Categories

### 1. Authentication APIs
Handle user authentication and session management.

### 2. Quiz APIs
Manage quiz sessions, questions, answers, and statistics.

### 3. AI APIs
Integrate with Google Gemini AI for content generation.

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🔄 HTTP Status Codes

| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 🛡️ Security

### Rate Limiting
- Auth endpoints: 5 requests per minute
- Quiz generation: 10 requests per minute
- General APIs: 100 requests per minute

### CORS Configuration
```json
{
  "origin": ["http://localhost:3001", "https://yourdomain.com"],
  "methods": ["GET", "POST", "PUT", "DELETE"],
  "credentials": true
}
```

### Input Validation
All inputs are validated using Zod schemas:
```typescript
const QuizRequestSchema = z.object({
  subject: z.string().min(1),
  chapters: z.array(z.string()).min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionCount: z.number().min(1).max(50)
});
```

## 📊 Monitoring & Logging

### Request Logging
```typescript
console.log({
  method: request.method,
  url: request.url,
  userAgent: request.headers.get('user-agent'),
  timestamp: new Date().toISOString(),
  userId: user?.id
});
```

### Error Tracking
All errors are logged with context:
```typescript
console.error('API Error:', {
  error: error.message,
  stack: error.stack,
  userId: session?.user?.id,
  path: request.nextUrl.pathname
});
```

## 🧪 Testing APIs

### Using cURL
```bash
# Health check
curl http://localhost:3001/api/health

# Generate quiz (requires auth cookie)
curl -X POST http://localhost:3001/api/ai/quiz \
  -H "Content-Type: application/json" \
  -d '{"subject":"Math","chapters":["Algebra"],"difficulty":"medium","questionCount":5}'
```

### Using JavaScript
```javascript
// Fetch with authentication
const response = await fetch('/api/quiz/history', {
  method: 'GET',
  credentials: 'include', // Important: includes cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

## 📝 Best Practices

### For API Consumers
1. **Always check response status** before processing data
2. **Handle errors gracefully** with user-friendly messages
3. **Implement retry logic** for transient failures
4. **Cache responses** where appropriate
5. **Use the full URL** in production

### For API Developers
1. **Validate all inputs** at the entry point
2. **Use meaningful error messages**
3. **Log all errors** with context
4. **Document all endpoints**
5. **Version APIs when making breaking changes**

## 🔍 Debugging

### Common Issues

#### CORS Errors
```json
{
  "error": "CORS policy violation"
}
```
**Solution**: Ensure your domain is in the CORS allowlist

#### Authentication Errors
```json
{
  "error": "Invalid token"
}
```
**Solution**: Check that cookies are being sent

#### Validation Errors
```json
{
  "error": "Validation failed",
  "details": {
    "field": "questionCount",
    "message": "Must be between 1 and 50"
  }
}
```
**Solution**: Fix the invalid field in your request

### Debug Tools
- **Browser DevTools**: Network tab to see requests/responses
- **Supabase Dashboard**: Check database operations
- **Vercel/Hosting Logs**: Server-side error logs
- **Postman/Insomnia**: Test APIs manually

## 📚 Related Documentation

- [Authentication Endpoints](./authentication-endpoints.md)
- [Quiz API Reference](./quiz-endpoints.md)
- [AI Integration Guide](./ai-integration.md)
- [Error Codes Reference](./error-codes.md)

## 🔄 Version History

### v1.0.0 (Current)
- Initial API release
- Authentication endpoints
- Quiz management APIs
- AI integration

### v1.1.0 (Planned)
- Real-time features
- Advanced analytics
- Performance optimizations

---

## 📞 Support

For API-related issues:
1. Check the documentation first
2. Look at existing GitHub issues
3. Create a new issue with:
   - Request URL
   - Request payload
   - Response received
   - Expected behavior

Remember to never include sensitive data like API keys or passwords in issues! 🔒