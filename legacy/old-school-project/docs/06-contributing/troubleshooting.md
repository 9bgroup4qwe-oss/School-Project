# Troubleshooting Guide

This comprehensive guide helps you diagnose and resolve common issues you might encounter while developing or using LearnDash.

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Problems](#authentication-problems)
- [Quiz System Issues](#quiz-system-issues)
- [AI Integration Problems](#ai-integration-problems)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Styling and UI Issues](#styling-and-ui-issues)
- [API and Backend Issues](#api-and-backend-issues)
- [Deployment Issues](#deployment-issues)
- [Debugging Tools](#debugging-tools)

## 🔧 Installation Issues

### Node.js Version Errors

**Error**: `Node.js version 16.x.x is not supported`
```bash
# Check your version
node --version

# Solution: Upgrade to Node.js 18+
# Download from https://nodejs.org or use version manager
nvm install 18
nvm use 18
```

### Port Already in Use

**Error**: `Port 3000 is in use, using 3001 instead`
```bash
# Find what's using the port
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Kill the process (replace PID)
taskkill /PID 18864 /F

# Or use a different port
npm run dev -- -p 3002
```

### Dependency Installation Errors

**Error**: `npm ERR! peer dep missing`
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### TypeScript Errors

**Error**: `TypeScript errors in build`
```bash
# Check TypeScript version
npx tsc --version

# Update to latest
npm install typescript@latest --save-dev

# Run type check
npm run type-check
```

## 🔐 Authentication Problems

### Supabase Connection Issues

**Error**: `Invalid Supabase credentials`
```bash
# 1. Verify your .env.local exists
ls -la .env.local

# 2. Check your credentials are correct
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Test connection in browser console
# Open browser console and run:
supabase = createClient('your-url', 'your-key')
supabase.from('users').select('*')
```

### RLS Policy Errors

**Error**: `permission denied for relation "quiz_sessions"`
```sql
-- Run in Supabase SQL Editor
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('quiz_sessions', 'quiz_questions', 'quiz_answers');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('quiz_sessions', 'quiz_questions', 'quiz_answers');

-- Re-run migration if needed
-- Copy contents from supabase/migrations/002_quiz_rls_policies.sql
```

### Auth Cookies Not Working

**Error**: "Not authenticated" when signed in
```javascript
// Check cookies in browser console
console.log(document.cookie);

// Should contain:
// sb-access-token=...
// sb-refresh-token=...

// Check middleware is working
// Add debug log to middleware.ts
console.log('Middleware executing...');
```

### Email Confirmation Required

**Error**: "Email not confirmed"
```sql
-- Manually confirm user in Supabase
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

## 📝 Quiz System Issues

### Quiz Generation Fails

**Error**: "Failed to generate quiz questions"
```bash
# 1. Check Gemini API key
echo $GEMINI_API_KEY

# 2. Test API directly
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# 3. Check API quota
# Visit Google AI Studio dashboard
```

### Questions Not Saving

**Error**: "Failed to save questions to database"
```typescript
// Debug in browser console
// Open quiz page, run:
localStorage.getItem('quizData');

// Check network requests in DevTools
// Look for failed requests to /api/quiz/questions
```

### Quiz Progress Not Saving

**Error**: "Answers not being saved"
```javascript
// Add debug logging to quizSessionService
console.log('Saving answer:', {
  questionId,
  selectedOption,
  isCorrect,
  sessionId: quizSessionService.getCurrentSession()?.id
});

// Check in Supabase
SELECT * FROM quiz_answers WHERE session_id = 'your-session-id';
```

### Quiz Results Not Showing

**Error**: "Quiz completed but no results displayed"
```typescript
// Check the quiz completion logic
// In quiz/page.tsx, add:
console.log('Quiz answers:', answers);
console.log('Quiz questions:', questions);
console.log('Calculated score:', calculateScore());
```

## 🤖 AI Integration Problems

### Gemini API Errors

**Error**: `400 Bad Request - Invalid JSON payload`
```javascript
// Check the API call format
// Should be single string, not conversation array:
const prompt = "Your prompt here"; // ✅ Correct
const prompt = [{ role: "user", parts: "text" }]; // ❌ Wrong

// Check the model name
// Should be: gemini-2.0-flash-exp
```

### API Quota Exceeded

**Error**: `429 Too Many Requests - Quota exceeded`
```bash
# Check quota usage
# Visit Google Cloud Console > APIs & Services > Gemini API

# Request quota increase if needed
# Or implement rate limiting
```

### Invalid Prompt Format

**Error**: Questions not generating correctly
```typescript
// Check the prompt structure in /api/ai/quiz/route.ts
const prompt = `
Generate ${questionCount} multiple-choice questions...

Requirements:
1. Each question must have 4 options
2. Include explanation
3. JSON format output
`;
```

## 🗄️ Database Issues

### Migration Failures

**Error**: `Migration "xxx" failed to execute`
```sql
-- Check migration status
SELECT * FROM supabase_migrations.schema_migrations;

-- Run failed migration manually
-- Copy-paste SQL from migration file
-- Run in Supabase SQL Editor
```

### Data Inconsistencies

**Error**: Statistics not calculating correctly
```sql
-- Recalculate user stats
DELETE FROM user_subject_stats WHERE user_id = 'your-user-id';

-- Trigger function to recalculate
SELECT complete_quiz_session('your-session-id');
```

### Connection Pool Exhausted

**Error**: "Too many connections"
```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND query = '<IDLE>';
```

## ⚡ Performance Issues

### Slow Page Loads

**Check**: Page takes >3 seconds to load
```javascript
// Add performance logging
console.time('Page load');
window.addEventListener('load', () => {
  console.timeEnd('Page load');
});

// Check bundle size
npm run build
# Check dist folder size
```

### Quiz Generation Slow

**Check**: Quiz generation takes >30 seconds
```javascript
// Add timing logs
console.time('Quiz generation');
// After generation
console.timeEnd('Quiz generation');

// Optimize by:
// - Reducing question count
// - Implementing caching
// - Using streaming responses
```

### Memory Leaks

**Check**: Browser memory increasing
```javascript
// Monitor in DevTools > Performance > Memory
// Look for:
// - Detached DOM nodes
// - Large objects not being cleaned up
// - Event listeners not removed
```

## 🎨 Styling and UI Issues

### Tailwind CSS Not Working

**Error**: Styles not applying
```bash
# Check Tailwind config
npx tailwindcss --help

# Rebuild CSS
npm run build

# Check if classes are in purged list
# Add to tailwind.config.js:
safelist: [
  'bg-gradient-to-br',
  'backdrop-blur-xl',
  // Other dynamic classes
]
```

### Glassmorphism Effects Missing

**Issue**: No glass effect visible
```css
/* Check these CSS properties are present */
.glass-name {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Dark Theme Not Applying

**Issue**: Light colors showing
```css
/* Check globals.css has dark theme variables */
:root {
  --colorp: #f9f9f9;
  --colorbody: #1e1e1e;
  /* etc */
}

/* Check body has dark class */
body {
  color: var(--colorp);
  background: var(--colorbody);
}
```

### Responsive Design Broken

**Issue**: Mobile layout not working
```css
/* Check responsive breakpoints */
@media (max-width: 768px) {
  /* Mobile styles */
}

/* Test with browser dev tools */
/* Toggle device toolbar */
```

## 🌐 API and Backend Issues

### CORS Errors

**Error**: `Access-Control-Allow-Origin`
```javascript
// Check CORS middleware in middleware.ts
// Should include your domain

// Test with curl
curl -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS http://localhost:3001/api/quiz
```

### 500 Internal Server Error

**Error**: Server crashes
```bash
# Check server logs
npm run dev 2>&1 | tee server.log

# Look for:
# - Unhandled exceptions
# - Database connection errors
# - Missing environment variables
```

### API Response Format Issues

**Error**: Unexpected response structure
```javascript
// Add response validation
const response = await fetch('/api/endpoint');
const data = await response.json();
console.log('API Response:', data);

// Check against expected schema
```

## 🚀 Deployment Issues

### Build Errors

**Error**: Build fails with TypeScript errors
```bash
# Run type checking
npm run type-check

# Fix errors one by one
# Common issues:
// - Missing types
// - Incorrect imports
// - Type mismatches
```

### Environment Variables Missing

**Error**: `undefined environment variable`
```bash
# Verify all variables in production
printenv | grep NEXT_PUBLIC
printenv | grep SUPABASE
printenv | grep GEMINI

# Check .env files
ls -la .env*
```

### Supabase Connection in Production

**Error**: Database connection refused
```bash
# Check:
# 1. Supabase project is active
# 2. Migration scripts have run
# 3. RLS policies are applied
# 4. Service role key is correct
```

## 🛠️ Debugging Tools

### Browser DevTools

#### Console Debugging
```javascript
// Debug auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});

// Debug API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args[0], args[1]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status);
  return response;
};
```

#### Network Debugging
1. Open DevTools > Network
2. Clear network log
3. Perform action
4. Check:
   - Request URL
   - Request payload
   - Response status
   - Response body

#### Performance Debugging
1. DevTools > Performance
2. Record performance
3. Analyze:
   - Script evaluation time
   - Rendering time
   - Memory usage

### VS Code Debugging

#### TypeScript Debugging
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true
}
```

#### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

### Database Debugging

#### Supabase SQL Editor
```sql
-- Check user data
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Check quiz sessions
SELECT * FROM quiz_sessions
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'quiz_sessions';
```

### API Testing

#### Using curl
```bash
# Test protected endpoint
curl -X GET http://localhost:3001/api/quiz/history \
  -H "Cookie: sb-access-token=your-token"

# Test with body
curl -X POST http://localhost:3001/api/ai/quiz \
  -H "Content-Type: application/json" \
  -d '{"subject":"Math","chapters":["Algebra"],"difficulty":"medium","questionCount":10}'
```

#### Using Postman
1. Create new collection
2. Set base URL
3. Add cookies in Headers
4. Save requests for reuse

## 📱 Mobile-Specific Issues

### iOS Safari Issues
- Check WebKit compatibility
- Test touch interactions
- Verify scrolling behavior

### Android Chrome Issues
- Test on various devices
- Check Chrome version compatibility
- Verify viewport settings

### Responsive Testing
```html
<!-- Add to layout.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

## 🔄 Recovery Procedures

### Database Recovery
```sql
-- Reset user statistics
TRUNCATE user_subject_stats;
TRUNCATE user_chapter_stats;

-- Recalculate from existing data
SELECT update_all_user_stats();
```

### Session Recovery
```javascript
// Clear local storage
localStorage.clear();
sessionStorage.clear();

// Clear cookies
document.cookie.split(";").forEach(function(c) {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Full Reset
```bash
# Remove all user data
rm -rf .next
rm -rf node_modules
rm -rf .env.local

# Reinstall
npm install

# Reconfigure
cp .env.example .env.local
# Fill in your values
```

## 📞 Getting Help

### Before Asking for Help
1. Check existing documentation
2. Search for similar issues
3. Try basic troubleshooting
4. Gather error messages
5. Note exact steps to reproduce

### Creating a Good Issue Report
```markdown
## Issue Description
Brief description of the problem

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
Add screenshots if applicable

## Environment
- OS: Windows/macOS/Linux
- Browser: Chrome/Firefox/Safari
- Node.js version:
- URL: localhost:3001

## Console Errors
```
Paste console errors here
```
```

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [GitHub Issues](https://github.com/your-repo/issues)

---

Remember: Most issues have simple solutions. Start with the basics and work your way up. Happy debugging! 🐛