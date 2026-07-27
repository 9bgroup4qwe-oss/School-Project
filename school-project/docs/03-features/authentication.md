# Authentication System Documentation

LearnDash uses Supabase Authentication for complete user management, including sign up, sign in, session management, and protected routes.

## 📋 Overview

The authentication system provides:
- ✅ User registration with email/password
- ✅ Secure login with session persistence
- ✅ Password reset functionality
- ✅ Session management with middleware
- ✅ Protected routes with automatic redirects
- ✅ User profile management
- ✅ Social auth ready (UI prepared)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Page     │    │   Middleware    │    │  Protected     │
│                 │    │                 │    │     Routes     │
│ • Sign In Form  │◄──►│ • Validate      │◄──►│ • Dashboard     │
│ • Sign Up Form  │    │   JWT Token     │    │ • Quizzer       │
│ • Error Display │    │ • Refresh Token │    │ • Timetable     │
│ • Success Msg   │    │ • Redirect      │    │ • Quiz         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │    Cookies      │    │   User State    │
│   Auth          │    │                 │    │                 │
│ • JWT Tokens    │    │ • HTTP-Only     │    │ • Session Data  │
│ • User Metadata │    │ • Secure Flag   │    │ • Profile Info  │
│ • RLS Policies  │    │ • SameSite      │    │ • Preferences   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Security Features

### Authentication Security
- **JWT Tokens**: Short-lived access tokens (1 hour)
- **Refresh Tokens**: Long-lived refresh tokens (30 days)
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS only in production
- **SameSite**: CSRF protection
- **Row Level Security**: Database-level access control

### Session Management
- **Automatic Refresh**: Tokens refresh seamlessly
- **Session Persistence**: "Remember me" functionality
- **Multiple Sessions**: Support for multiple devices
- **Session Invalidation**: Sign out from all devices

## 📱 Components

### 1. Auth Page (`/auth`)

**Location**: `src/app/auth/page.tsx`

Features:
- Toggle between Sign In and Sign Up
- Email and password fields
- Remember me checkbox
- Real-time validation
- Error/success message display
- Glassmorphism design with dark theme

#### Form Validation
```typescript
interface AuthFormData {
  email: string;
  password: string;
  username?: string; // For registration
  rememberMe?: boolean;
}

// Validation rules
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;
const usernameMinLength = 3;
```

#### Error Handling
```typescript
const [message, setMessage] = useState<{
  type: 'success' | 'error';
  text: string;
} | null>(null);
```

### 2. AuthGuard Component

**Location**: `src/components/auth/AuthGuard.tsx`

Higher-order component that protects routes:
```typescript
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Usage
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

Features:
- Checks authentication status
- Redirects unauthenticated users
- Shows loading state during check
- Listens to auth state changes

### 3. AuthenticatedSidebar

**Location**: `src/components/layout/AuthenticatedSidebar.tsx`

Sidebar component for authenticated users:
- Displays user information
- Shows user avatar or initials
- Includes sign out functionality
- Updates on auth state changes

### 4. Middleware

**Location**: `middleware.ts`

Route protection middleware:
```typescript
export async function middleware(request: NextRequest) {
  // Skip auth page and static files
  // Validate session
  // Redirect unauthenticated users
  // Refresh session if needed
}
```

Protected routes:
- `/dashboard`
- `/quizzer`
- `/quiz`
- `/timetable`

## 🔧 Implementation Details

### Supabase Client Configuration

#### Server Client
**Location**: `src/lib/supabase/server.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

#### Browser Client
**Location**: `src/lib/supabase/client.ts`

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () =>
  createClientComponentClient<Database>()
```

### Authentication Flow

#### Sign Up
```typescript
const handleSignUp = async (formData: AuthFormData) => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
        display_name: formData.username,
      },
    },
  });

  if (error) {
    setMessage({ type: 'error', text: error.message });
  } else {
    setMessage({
      type: 'success',
      text: 'Account created! Please check your email to verify.'
    });
  }
};
```

#### Sign In
```typescript
const handleSignIn = async (formData: AuthFormData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
    options: formData.rememberMe ? { expiresIn: '4w' } : {}
  });

  if (error) {
    setMessage({ type: 'error', text: error.message });
  } else {
    router.push('/dashboard');
  }
};
```

#### Sign Out
```typescript
const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = '/auth';
};
```

### Session Management

#### Session Validation
```typescript
const { data: { session }, error } = await supabase.auth.getSession();

if (!session || error) {
  // Redirect to auth
  return NextResponse.redirect(new URL('/auth', request.url));
}
```

#### Session Refresh
```typescript
// In middleware
await updateSession(request);

// In API routes
const { data: { user }, error } = await supabase.auth.getUser();
```

## 📊 User Data Structure

### Auth Schema
```typescript
interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}
```

### User Profile
```typescript
interface UserProfile {
  name: string;
  handle: string;
  email: string;
  avatar_url?: string | null;
}
```

## 🔄 State Management

### Auth Context (Planned)
Future enhancement for global auth state:
```typescript
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signUp: () => {},
  signIn: () => {},
  signOut: () => {},
});
```

### Client-Side Checks
```typescript
// Check if user is authenticated
const { data: { session } } = useSupabaseSession();

// Listen to auth changes
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // Handle sign in
      } else if (event === 'SIGNED_OUT') {
        // Handle sign out
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

## 🛡️ Security Best Practices

### 1. Token Management
- Short-lived access tokens (1 hour)
- Secure HTTP-only cookies
- Automatic token refresh
- Invalidate on password change

### 2. Password Security
- Minimum 8 characters
- No password storage (handled by Supabase)
- Rate limiting on auth endpoints
- Password reset via email

### 3. Session Security
- Unique session IDs
- Session invalidation on sign out
- Concurrent session limits (optional)
- Device tracking (planned)

### 4. Data Protection
- RLS policies on all user data
- Encrypt sensitive data
- GDPR compliance
- Data export/deletion tools

## 🔍 User Experience

### Auth Flow
1. **Landing Page**: Click "Get Started" or "Sign In"
2. **Auth Page**: Choose Sign In or Sign Up
3. **Form**: Enter credentials
4. **Validation**: Real-time feedback
5. **Success**: Redirect to dashboard
6. **Error**: Clear error messages

### Error Messages
- Invalid credentials: "Invalid email or password"
- User not found: "No account found with this email"
- Weak password: "Password must be at least 8 characters"
- Email in use: "An account already exists with this email"

### Loading States
- Form submission: Loading spinner
- Page transitions: Skeleton screens
- Auth check: Full-page loader

## 📱 Mobile Considerations

### Responsive Design
- Full-width forms on mobile
- Larger touch targets (44px min)
- Mobile-optimized keyboard
- Smooth scrolling

### Mobile Auth Flow
- Native app feel
- Biometric authentication (future)
- Deep linking support
- Offline sign-in (planned)

## 🔧 Configuration

### Supabase Settings

#### Auth Configuration
```javascript
// In Supabase Dashboard
const authConfig = {
  site_url: 'http://localhost:3001',
  redirect_urls: [
    'http://localhost:3001/auth/callback',
    'http://localhost:3001'
  ],
  enable_email_signups: true,
  enable_phone_signups: false,
  session_timeout: 3600, // 1 hour
};
```

#### RLS Policies
```sql
-- Enable RLS on user tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Optional
NEXT_PUBLIC_ENABLE_SIGNUP=true
NEXT_PUBLIC_PASSWORD_MIN_LENGTH=8
```

## 🧪 Testing

### Authentication Testing
```typescript
// Test sign up
const signUpResponse = await POST('/api/auth/signup', {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser'
});

// Test sign in
const signInResponse = await POST('/api/auth/signin', {
  email: 'test@example.com',
  password: 'password123'
});

// Test protected route
const protectedResponse = await GET('/api/user/profile', {
  headers: { Cookie: 'sb-access-token=...' }
});
```

### Middleware Testing
```bash
# Test unauthenticated access
curl http://localhost:3001/dashboard
# Should redirect to /auth

# Test authenticated access
curl http://localhost:3001/dashboard \
  -H "Cookie: sb-access-token=valid_token"
# Should return dashboard
```

## 🔄 Future Enhancements

### Phase 1 (Near Future)
- [ ] Social auth (Google, GitHub)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Two-factor authentication

### Phase 2 (Future)
- [ ] Magic link authentication
- [ ] SSO/SAML support
- [ ] Role-based access control
- [ ] Multi-tenant support

### Phase 3 (Long-term)
- [ ] Biometric authentication
- [ ] Hardware security keys
- [ ] Advanced session management
- [ ] Audit logging

## 📚 Related Documentation

- [Getting Started Guide](../../01-getting-started/installation.md)
- [Environment Setup](../../01-getting-started/environment-setup.md)
- [Supabase Documentation](https://supabase.com/docs)
- [API Reference](../04/api/authentication-endpoints.md)

## 🆘 Troubleshooting

### Common Issues

#### "Invalid login credentials"
- Verify email and password are correct
- Check if email is verified
- Try password reset

#### "Session expired"
- Automatic refresh should handle this
- Manual sign out and sign in if needed
- Check cookie settings

#### "Redirect loop"
- Check middleware configuration
- Verify auth callback URLs
- Clear browser cookies

#### CORS errors
- Verify site URL in Supabase settings
- Check environment variables
- Ensure HTTPS in production

### Debug Commands
```typescript
// Check auth state
console.log('Auth state:', await supabase.auth.getSession());

// Check user data
console.log('User:', await supabase.auth.getUser());

// Check cookies
console.log('Cookies:', document.cookie);
```

---

The authentication system is designed to be secure, user-friendly, and easily extensible for future authentication methods.