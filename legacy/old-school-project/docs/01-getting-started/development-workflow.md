# Development Workflow Guide

This guide explains how to contribute to LearnDash following our development standards and best practices.

## 📋 Prerequisites

Before starting development, ensure you have:
- Completed the [Installation Guide](./installation.md)
- Set up your [Environment](./environment-setup.md)
- Read the [Code Style Guidelines](#code-style-guidelines)

## 🌳 Git Workflow

### Branch Strategy

We use a simplified Git flow:

```
main
├── feature/quiz-history
├── feature/timetable-improvements
├── fix/authentication-bug
└── hotfix/security-patch
```

### 1. Create a Feature Branch

```bash
# Always start from the latest main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name

# Good branch name examples:
# - feature/quiz-history-page
# - feature/timetable-ai-improvements
# - fix/auth-validation-error
# - docs/update-api-documentation
```

### 2. Make Your Changes

- Follow the code style guidelines
- Write meaningful commit messages
- Test your changes thoroughly

### 3. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a meaningful message
git commit -m "feat: add quiz history page with filters"

# Commit message format:
# type(scope): description
#
# Types:
# - feat: New feature
# - fix: Bug fix
# - docs: Documentation changes
# - style: Code formatting (no logic change)
# - refactor: Code refactoring
# - test: Adding tests
# - chore: Maintenance tasks
```

### 4. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
# Fill out the PR template
```

## 💻 Development Process

### 1. Start the Development Server

```bash
# Always run from the project root
npm run dev
```

The server will start at `http://localhost:3001`

### 2. Make Changes

#### Creating a New Page

```bash
# Create a new directory in src/app/
mkdir src/app/new-feature

# Create page.tsx
touch src/app/new-feature/page.tsx

# Optional: Create page-specific CSS
touch src/app/new-feature/page.css
```

#### Creating Components

```bash
# For page-specific components
mkdir src/app/new-feature/components

# For shared components
mkdir src/components/new-feature

# Create your component
touch src/components/new-feature/YourComponent.tsx
```

#### Creating API Routes

```bash
# Create API route directory
mkdir src/app/api/your-endpoint

# Create route handler
touch src/app/api/your-endpoint/route.ts
```

### 3. TypeScript Best Practices

```typescript
// Always define interfaces for your data
interface QuizData {
  id: string;
  title: string;
  questions: Question[];
}

// Use proper typing for props
interface QuizComponentProps {
  quiz: QuizData;
  onComplete: (score: number) => void;
}

// Export types when needed
export type QuizStatus = 'pending' | 'active' | 'completed';
```

### 4. Styling Guidelines

```typescript
// ✅ GOOD: Import colors from theme
import { colors } from '@/lib/theme';

const MyComponent = () => {
  return (
    <div className="p-6" style={{ backgroundColor: colors.background.primary }}>
      <h2 style={{ color: colors.text.primary }}>Hello World</h2>
    </div>
  );
};

// ❌ BAD: Hardcoded colors
const MyComponent = () => {
  return (
    <div className="p-6 bg-purple-900">
      <h2 className="text-white">Hello World</h2>
    </div>
  );
};
```

## 🧪 Testing Your Changes

### 1. Manual Testing Checklist

Before submitting a PR:

- [ ] Page loads without errors
- [ ] All buttons and links work
- [ ] Forms validate correctly
- [ ] Mobile responsive design works
- [ ] Dark mode is applied correctly
- [ ] No console errors

### 2. Testing Authentication

```bash
# Test auth flows:
# 1. Sign up with new account
# 2. Sign in with existing account
# 3. Sign out
# 4. Try accessing protected pages while signed out
```

### 3. Testing API Endpoints

```bash
# Use curl or Postman to test your APIs
curl -X POST http://localhost:3001/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📝 Code Style Guidelines

### TypeScript

1. **Use explicit types**
   ```typescript
   // ✅ Explicit
   const userName: string = user.name;

   // ❌ Implicit
   const userName = user.name;
   ```

2. **Prefer interfaces over types for objects**
   ```typescript
   // ✅ Interface
   interface User {
     name: string;
     age: number;
   }

   // ✅ Type for unions
   type Status = 'pending' | 'completed';
   ```

3. **Use functional components with hooks**
   ```typescript
   // ✅ Functional component
   const MyComponent: React.FC<Props> = ({ prop }) => {
     const [state, setState] = useState<Type>(initialValue);

     return <div>{prop}</div>;
   };
   ```

### React Best Practices

1. **Use meaningful component names**
   ```typescript
   // ✅ Descriptive
   const QuizQuestionCard = () => { ... };

   // ❌ Generic
   const Card = () => { ... };
   ```

2. **Destructure props**
   ```typescript
   // ✅ Destructured
   const QuizCard = ({ title, questions, difficulty }: QuizProps) => {
     return <div>{title}</div>;
   };
   ```

3. **Use memo for performance**
   ```typescript
   const ExpensiveComponent = React.memo(({ data }) => {
     // Component logic
   });
   ```

### CSS/Styling

1. **Follow Tailwind conventions**
   ```typescript
   // ✅ Mobile-first responsive
   <div className="p-4 md:p-6 lg:p-8">

   // ✅ Use spacing scale
   <div className="m-4 p-6 gap-4">

   // ❌ Arbitrary values (avoid unless necessary)
   <div className="p-[23px]">
   ```

2. **Use semantic HTML**
   ```typescript
   // ✅ Semantic
   <article>
     <header>
       <h1>Quiz Title</h1>
     </header>
     <section>
       <p>Quiz content</p>
     </section>
   </article>

   // ❌ Non-semantic
   <div>
     <div>
       <h1>Quiz Title</h1>
     </div>
     <div>
       <p>Quiz content</p>
     </div>
   </div>
   ```

## 🔧 Common Development Tasks

### Adding a New API Endpoint

1. **Create the route file**
   ```typescript
   // src/app/api/your-feature/route.ts
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest) {
     // Handle GET request
   }

   export async function POST(request: NextRequest) {
     // Handle POST request
   }
   ```

2. **Add error handling**
   ```typescript
   try {
     // Your logic
     return NextResponse.json({ success: true, data });
   } catch (error) {
     console.error('API Error:', error);
     return NextResponse.json(
       { error: 'Internal server error' },
       { status: 500 }
     );
   }
   ```

### Adding a New Page with Authentication

1. **Create the page component**
   ```typescript
   // src/app/your-feature/page.tsx
   'use client';

   import { AuthGuard } from '@/components/auth/AuthGuard';

   export default function YourFeaturePage() {
     return (
       <AuthGuard>
         <div>
           {/* Your content */}
         </div>
       </AuthGuard>
     );
   }
   ```

2. **Add to sidebar navigation**
   ```typescript
   // src/components/layout/AuthenticatedSidebar.tsx
   const navItems: NavItem[] = [
     // ... existing items
     {
       id: 'your-feature',
       label: 'Your Feature',
       icon: 'icon-name',
       href: '/your-feature',
       isActive: activeItem === 'your-feature'
     }
   ];
   ```

### Working with Supabase

1. **Server-side operations**
   ```typescript
   // In API routes or server components
   import { createClient } from '@/lib/supabase/server';

   const supabase = createClient();
   const { data, error } = await supabase
     .from('your_table')
     .select('*');
   ```

2. **Client-side operations**
   ```typescript
   // In client components
   import { createClient } from '@/lib/supabase/client';

   const supabase = createClient();
   const { data, error } = await supabase
     .from('your_table')
     .select('*');
   ```

## 🐛 Debugging Tips

### 1. Use Console Logging

```typescript
// For debugging
console.log('Data:', data);
console.error('Error:', error);
console.warn('Warning:', warning);

// For objects
console.table(data);
console.dir(object, { depth: null });
```

### 2. Use React DevTools

- Install React DevTools browser extension
- Inspect component state and props
- Profile component performance

### 3. Use Next.js Debugging

```typescript
// Add to next.config.js for debugging
module.exports = {
  webpack: (config) => {
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'eval-source-map';
    }
    return config;
  }
};
```

### 4. Check Network Requests

- Use browser DevTools Network tab
- Check API responses
- Look for failed requests

## 📦 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Database
npx supabase db push  # Push schema changes (if using CLI)
npx supabase db reset # Reset local database

# Git
git status           # Check status
git log --oneline    # See commits
git diff             # See changes
```

## 📋 Pull Request Template

When creating a PR, include:

### Description
- What does this PR do?
- Why is this change needed?
- How was it implemented?

### Testing
- [ ] Manual testing completed
- [ ] All tests pass
- [ ] Mobile responsive
- [ ] No console errors

### Screenshots
- Add screenshots for UI changes
- Include before/after if applicable

### Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Documentation updated
- [ ] Environment variables documented (if needed)

## 🚀 Deploying Your Changes

### Preview Deployments

- Vercel automatically creates preview deployments for PRs
- Share the preview link for review

### Production Deployment

1. **Merge to main branch**
2. **CI/CD automatically deploys**
3. **Verify deployment**

## 🆘 Getting Help

1. **Check existing documentation**
2. **Search existing issues**
3. **Ask in Discord**
4. **Create an issue** with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if relevant

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

---

Happy coding! Remember to write clean, documented code that future developers can understand. 🎉