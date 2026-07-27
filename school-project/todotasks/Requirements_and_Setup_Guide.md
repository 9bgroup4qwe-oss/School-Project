# Learning App - Requirements and Setup Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Required Dependencies](#required-dependencies)
4. [Development Setup](#development-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Project Structure](#project-structure)
8. [Common Issues and Solutions](#common-issues-and-solutions)

## Project Overview

This is a modern learning management application built with:
- **Framework**: Next.js 15 (React Framework)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Language**: TypeScript
- **Authentication**: Supabase (to be integrated)
- **Database**: Supabase PostgreSQL (to be integrated)

## System Requirements

### Prerequisites
Before you begin, ensure you have the following installed:

1. **Node.js** (version 18.0 or higher)
   - Download from: https://nodejs.org/
   - Check version: `node --version`

2. **npm** (version 8.0 or higher) or **yarn** (version 1.22+)
   - Usually comes with Node.js
   - Check version: `npm --version` or `yarn --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Check version: `git --version`

4. **Code Editor** (recommended)
   - Visual Studio Code: https://code.visualstudio.com/
   - Recommended extensions:
     - ES7+ React/Redux/React-Native snippets
     - Tailwind CSS IntelliSense
     - TypeScript Importer
     - Prettier - Code formatter

## Required Dependencies

### Production Dependencies
These are automatically installed when you run `npm install`:

```json
{
  "@radix-ui/react-accordion": "^1.2.12",
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@tailwindcss/postcss": "^4.1.13",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.544.0",
  "next": "^15.5.4",
  "ogl": "^1.0.11",
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "tailwind-merge": "^3.3.1",
  "tailwindcss-animate": "^1.0.7",
  "typescript": "^5.0.0"
}
```

### Development Dependencies
```json
{
  "autoprefixer": "^10.4.21",
  "eslint": "^8.0.0",
  "eslint-config-next": "^15.0.0",
  "postcss": "^8.5.6",
  "shadcn": "^3.3.1",
  "tailwindcss": "^4.0.0"
}
```

## Development Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/learning-app.git
cd learning-app
```

### Step 2: Install Dependencies
Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### Step 3: Setup Environment Variables
Create a new file called `.env.local` in the root directory:
```bash
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Initialize Tailwind CSS
The project uses Tailwind CSS v4. If you face any issues:
```bash
npx tailwindcss init -p
```

### Step 5: Setup shadcn/ui Components
The project uses shadcn/ui components. To add new components:
```bash
npx shadcn@latest add [component-name]
```

## Environment Configuration

### Environment Variables
Create the following files in the root directory:

#### `.env.local` (not committed to git)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Learning App

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

#### `.env.example` (committed to git as reference)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Learning App
```

## Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at: http://localhost:3000

### Production Build
```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Code Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

### Export for Static Deployment (Optional)
```bash
npm run export
```
This creates a static version in the `out` directory.

## Project Structure

```
learning-app/
├── public/                    # Static assets
│   ├── favicon.ico
│   └── ...
├── src/                       # Source code
│   ├── app/                   # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── csstest/           # CSS testing page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   └── layout/            # Layout components
│   └── types/                 # TypeScript type definitions
├── todotasks/                 # Documentation and PRDs
├── .gitignore                 # Git ignore file
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts development server with hot reload |
| `npm run build` | Creates production build |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint to check code quality |
| `npm run export` | Creates static export of the app |

## Key Features Implemented

### 1. Authentication Pages
- Login/Register forms
- Dark theme design
- Form validation
- Social auth buttons (UI ready)

### 2. Dashboard
- Course progress tracking
- Today's tasks view
- Statistics display
- Calendar integration
- Dark theme matching auth pages

### 3. Landing Page
- Hero section
- Feature cards
- Responsive design
- Smooth animations

### 4. CSS Testing Page
- Color scheme testing
- Component showcase
- Dark theme variables

## Common Issues and Solutions

### Issue 1: "Module not found: Can't resolve 'react'"
**Solution**: Install dependencies
```bash
npm install
# or
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Tailwind CSS classes not working
**Solution**: Ensure PostCSS is configured correctly
1. Check `postcss.config.js` exists
2. Run `npm install postcss autoprefixer`
3. Restart development server

### Issue 3: TypeScript errors
**Solution**: Check TypeScript configuration
```bash
npm run lint
# Fix automatically
npm run lint:fix
```

### Issue 4: Port already in use
**Solution**: Kill the process or use different port
```bash
# Kill process on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Use different port
npm run dev -- -p 3001
```

### Issue 5: shadcn/ui components not working
**Solution**: Reinstall components
```bash
npx shadcn@latest add button
npx shadcn@latest add card
# etc.
```

## Development Best Practices

1. **Code Style**: Follow the existing code patterns
2. **Components**: Keep components small and reusable
3. **TypeScript**: Use TypeScript for all new files
4. **Styling**: Use Tailwind CSS classes, avoid inline styles
5. **Commits**: Write clear, descriptive commit messages
6. **Branches**: Create feature branches for new features

## Getting Help

If you encounter issues:
1. Check the console for error messages
2. Look at the [Next.js documentation](https://nextjs.org/docs)
3. Check [Tailwind CSS docs](https://tailwindcss.com/docs)
4. Review shadcn/ui documentation
5. Ask in the project's GitHub Issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Netlify
- AWS Amplify
- Railway
- Docker (custom setup)

## Future Dependencies (To Be Added)

When implementing the backend:
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "zod": "^3.22.0",
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "nanoid": "^5.0.0"
}
```

---

For any questions or clarification, please reach out to the project maintainer.