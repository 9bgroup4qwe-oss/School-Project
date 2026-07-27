# Learn.ai - Technical Architecture

## 🏗️ System Architecture Overview

Learn.ai uses a modern, scalable architecture combining Next.js for the frontend, Supabase for the database and backend, and Python for AI integration and automation.

### Architecture Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase       │    │  Python Backend │
│   (Frontend)    │◄──►│ (DB + Auth + RLS)│◄──►│ + AI Services   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │  Google Gemini   │
                    │     API          │
                    └──────────────────┘
```

### High-Level Architecture (Text Representation)
```
[User Browser]
     |
     v
[Next.js Frontend (TypeScript)]
     |
     v
[Python Backend API]
     |
     |------> [Supabase Database]
     |
     |------> [Google Gemini API] (for quiz generation)
     |
     v
[Email Service / Notification System]
```

---

## 🎯 Technology Stack

### Frontend (Next.js)
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** React Context + Hooks
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Real-time Subscriptions

### Backend & Database (Supabase)
- **Database:** PostgreSQL (managed by Supabase)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Real-time
- **File Storage:** Supabase Storage
- **API:** Supabase Auto-generated REST API
- **Security:** Row Level Security (RLS)

### AI Services (Python Backend)
- **Language:** Python 3.11+
- **AI Integration:** Google Gemini API
- **Task Queue:** Celery + Redis (for async tasks)
- **Email Service:** SMTP integration
- **File Processing:** OCR libraries for PDF/image processing
- **Scheduling:** Python cron jobs and task scheduling

### External Services
- **AI Provider:** Google Gemini API
- **Database:** Supabase (PostgreSQL)
- **Email:** SMTP service provider
- **File Processing:** OCR libraries (Tesseract, PyPDF2)
- **Monitoring:** Application logging and error tracking

---

## 🗄️ Database Architecture (Supabase)

### Core Tables Structure

#### 1. Users Table (`profiles`)
```sql
- id: uuid (primary key, references auth.users)
- email: text
- full_name: text
- avatar_url: text
- grade_level: integer (1-12)
- school_name: text
- created_at: timestamp
- updated_at: timestamp
- preferences: jsonb (notification settings, theme, etc.)
```

#### 2. Subjects Table (`subjects`)
```sql
- id: uuid (primary key)
- name: text (Mathematics, Science, etc.)
- grade_level: integer
- ncert_code: text
- description: text
- is_active: boolean
```

#### 3. Chapters Table (`chapters`)
```sql
- id: uuid (primary key)
- subject_id: uuid (foreign key)
- name: text
- chapter_number: integer
- description: text
- estimated_hours: integer
- is_active: boolean
```

#### 4. Topics Table (`topics`)
```sql
- id: uuid (primary key)
- chapter_id: uuid (foreign key)
- name: text
- content: text
- difficulty_level: integer (1-5)
- prerequisites: uuid[] (array of topic IDs)
```

#### 5. Questions Table (`questions`)
```sql
- id: uuid (primary key)
- topic_id: uuid (foreign key)
- question_type: enum ('mcq', 'multi_select', 'match', 'paragraph')
- question_text: text
- options: jsonb (array of options for MCQ/multi-select)
- correct_answer: text or jsonb
- explanation: text
- difficulty_level: integer (1-5)
- ai_generated: boolean
- created_at: timestamp
```

#### 6. Quiz Attempts Table (`quiz_attempts`)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- quiz_type: enum ('short', 'medium', 'long', 'custom')
- questions: uuid[] (array of question IDs)
- score: integer
- total_questions: integer
- time_taken: integer (seconds)
- completed_at: timestamp
- is_retry: boolean
```

#### 7. User Answers Table (`user_answers`)
```sql
- id: uuid (primary key)
- quiz_attempt_id: uuid (foreign key)
- question_id: uuid (foreign key)
- user_answer: text or jsonb
- is_correct: boolean
- time_spent: integer (seconds)
- answered_at: timestamp
```

#### 8. Study Progress Table (`study_progress`)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- topic_id: uuid (foreign key)
- status: enum ('not_started', 'in_progress', 'completed')
- completion_percentage: integer (0-100)
- time_spent: integer (minutes)
- last_studied: timestamp
- understanding_level: integer (1-5)
```

#### 9. Study Plans Table (`study_plans`)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- name: text
- description: text
- start_date: date
- end_date: date
- target_goals: jsonb
- is_active: boolean
- created_at: timestamp
```

#### 10. Study Sessions Table (`study_sessions`)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- study_plan_id: uuid (foreign key, optional)
- topic_id: uuid (foreign key)
- duration: integer (minutes)
- notes: text
- session_type: enum ('planned', 'spontaneous')
- completed_at: timestamp
```

#### 11. User Streaks Table (`user_streaks`)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- current_streak: integer
- longest_streak: integer
- last_activity_date: date
- streak_freeze_available: boolean
```

#### 12. Notifications Table (`notifications`)
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- type: enum ('quiz_reminder', 'study_reminder', 'achievement', 'system')
- title: text
- message: text
- is_read: boolean
- scheduled_for: timestamp
- sent_at: timestamp
```

### Row Level Security (RLS) Policies
- Users can only access their own data
- Students can only view content for their grade level
- Quiz attempts are isolated per user
- Study progress is user-specific

---

## 🔐 Authentication & Security

### Supabase Auth Integration
- **JWT Tokens:** Stateless authentication
- **Google OAuth:** Third-party authentication
- **Email/Password:** Traditional authentication
- **Email Verification:** Mandatory verification
- **Password Reset:** Secure email-based reset

### Security Measures
- **Rate Limiting:** Supabase rate limiting on API calls
- **Data Encryption:** Encrypted data at rest and in transit
- **Row Level Security:** Automatic data isolation
- **Input Validation:** Client and server-side validation
- **CORS:** Proper cross-origin configuration

---

## 🤖 AI Integration Architecture

### Google Gemini API Integration
```python
# Python Backend AI Service
class AIService:
    def generate_questions(self, topic, difficulty, count):
        # Call Google Gemini API
        # Parse and validate response
        # Store in Supabase
        pass

    def grade_paragraph_answer(self, question, answer):
        # AI-based evaluation
        # Provide feedback and score
        pass

    def generate_study_plan(self, user_data, deadlines):
        # Optimal schedule generation
        # Consider difficulty and time constraints
        pass
```

### AI Processing Pipeline
1. **Content Analysis:** Analyze uploaded materials and syllabus
2. **Question Generation:** Create questions using AI
3. **Validation:** Ensure questions meet NCERT standards
4. **Storage:** Store validated questions in database
5. **Personalization:** Adapt based on user performance

---

## 📊 Real-time Features

### Supabase Real-time Subscriptions
- **Live Updates:** Real-time quiz scoring
- **Progress Tracking:** Live progress updates
- **Notifications:** Real-time notification delivery
- **Collaboration:** Future multiplayer features

### WebSocket Alternatives
- **Supabase Realtime:** Built-in real-time functionality
- **Server-sent Events:** For notifications
- **Polling:** Fallback for older browsers

---

## 📧 Notification System (Python Backend)

### Email Service Architecture
```python
# Python Notification Service
class NotificationService:
    def send_quiz_reminder(self, user_id):
        # Send daily quiz reminder
        pass

    def send_study_reminder(self, user_id, study_plan):
        # Send study session reminder
        pass

    def send_achievement_notification(self, user_id, achievement):
        # Send achievement unlocked notification
        pass
```

### Notification Types
- **Quiz Reminders:** Daily quiz notifications
- **Study Reminders:** Study session reminders
- **Achievement Notifications:** Milestone celebrations
- **System Notifications:** Account and security updates

---

## 📁 File Processing & Storage

### File Upload Pipeline
1. **Client Upload:** Upload to Supabase Storage
2. **Processing Queue:** Python backend processes files
3. **OCR Extraction:** Extract text from PDF/images
4. **Content Analysis:** AI analyzes content
5. **Database Storage:** Store processed content

### Supabase Storage Structure
```
storage/
├── user-uploads/
│   ├── timetables/
│   ├── syllabi/
│   └── textbooks/
├── generated-content/
│   ├── questions/
│   └── explanations/
└── profile-images/
```

---

## 🚀 Deployment Architecture

### Frontend Deployment
- **Platform:** Vercel (recommended for Next.js)
- **Build Process:** Static generation + API routes
- **CDN:** Global content delivery
- **Environment Variables:** Secure configuration

### Backend Deployment
- **Python Backend:** Docker containers on cloud platform
- **Supabase:** Managed service
- **Database:** Automated backups and scaling
- **Monitoring:** Application performance monitoring

### CI/CD Pipeline
- **Automated Testing:** Unit and integration tests
- **Build Automation:** Automated build and deployment
- **Rollback:** Easy rollback capabilities
- **Monitoring:** Health checks and alerts

---

## 📈 Monitoring & Analytics

### Application Monitoring
- **Performance:** Response times and error rates
- **User Analytics:** Feature usage and engagement
- **Error Tracking:** Real-time error monitoring
- **Database Performance:** Query optimization insights

### Business Metrics
- **User Growth:** Registration and retention rates
- **Feature Usage:** Quiz completion, study time
- **AI Performance:** Question quality and accuracy
- **User Satisfaction:** Feedback and ratings

---

## 🔧 Development Environment

### Local Development Setup
- **Frontend:** Next.js development server
- **Database:** Supabase local development
- **Backend:** Python development server
- **AI Services:** Mocked AI responses for development
- **Environment:** Docker Compose for consistent environment

### Development Tools
- **Version Control:** Git
- **Code Quality:** ESLint, Prettier
- **Testing:** Jest, React Testing Library
- **Documentation:** Markdown with consistent format
- **API Documentation:** Auto-generated from code

---

## 🎛️ Configuration Management

### Environment Variables
- **Frontend:** NEXT_PUBLIC_* variables
- **Backend:** Environment variables for Python
- **Supabase:** Project configuration and keys
- **AI Services:** Google Gemini API keys
- **Email:** SMTP configuration

### Feature Flags
- **A/B Testing:** Feature flag system
- **Gradual Rollout:** Phased feature releases
- **Environment-specific:** Different configs per environment

---

## 🛡️ Scalability & Performance

### Performance Requirements
- **API Response Time:** ≤ 500ms for quiz fetch, planner updates, dashboard stats
- **Frontend Load Time:** ≤ 2s on average devices
- **Throughput:** Support ~100 concurrent users on free-tier infrastructure
- **Transaction Rate:** Quiz submissions ~1/sec, Planner updates ~0.5/sec
- **Reminder Triggers:** ~100/day via Python backend

### Frontend Optimization
- **Code Splitting:** Automatic code splitting with Next.js
- **Image Optimization:** Next.js Image component optimization
- **Caching:** Browser and CDN caching strategies
- **Bundle Size:** Optimized with tree-shaking and code analysis
- **Horizontal Scaling:** Easily scalable via Vercel/Next.js architecture

### Backend Optimization
- **Database:** Query optimization and indexing in Supabase
- **API:** Efficient REST API design with response caching
- **Background Jobs:** Async processing for heavy AI tasks
- **Vertical Scaling:** Python API and PostgreSQL scaling capabilities
- **Horizontal Scaling:** Future-ready with stateless API containers + load balancer

### Automation & Processing
- **Python Backend:** Self-hosted automation via Docker containers
- **Worker Clustering:** Scalable background job processing
- **Task Queues:** Celery + Redis for distributed task processing
- **Monitoring:** Performance metrics and alerting

### Disaster Recovery
- **Data Persistence:** PostgreSQL backups weekly via Supabase
- **Automated Restart:** Docker restart policies on crash
- **Manual Backup/Restore:** Scripts for critical data recovery
- **Cloud Storage:** Future S3-style object storage integration

---

## 🔒 Security & Compliance

### Authentication & Authorization
- **Google OAuth:** Secure third-party authentication
- **Email/Password:** Bcrypt or Argon2 hashed credentials
- **Rate Limiting:** Protection against brute force attacks
- **Email Verification:** Mandatory verification process
- **Role-based Access:** Student-only for now, expandable to teacher roles
- **Data Isolation:** User-specific data enforcement on API layer

### Security Measures
- **OWASP Top 10:** Protection against common vulnerabilities
- **HTTPS/TLS:** Encrypted data in transit
- **Input Validation:** Client and server-side validation
- **SQL Injection Prevention:** Parameterized queries via Supabase
- **XSS Protection:** Content Security Policy and input sanitization
- **CSRF Protection:** Token-based request validation

### Abuse Protection
- **Rate Limiting:** API endpoint rate limiting
- **Account Lockout:** Temporary lockout after failed attempts
- **IP Blocking:** Suspicious activity detection
- **Captcha:** Optional future implementation for enhanced security
- **Audit Logging:** Security event logging and monitoring

---

## 🔧 Maintainability & Development

### Code Standards & Quality
- **TypeScript:** Type safety on frontend
- **Python:** Backend with docstrings and modular design
- **Linting & Formatting:** ESLint, Prettier, Black (Python)
- **Git Branching:** Enforced branching strategy
- **Code Reviews:** Peer review process for quality assurance

### Dependency Management
- **Frontend:** package.json with locked versions
- **Backend:** requirements.txt with pinned dependencies
- **Security Audits:** Regular dependency vulnerability scanning
- **Update Management:** Automated outdated package notifications
- **License Compliance:** Open-source license verification

### Infrastructure & Deployment
- **Dockerization:** Containerized services for consistency
- **Local Development:** Parity with production environment
- **Self-hosted Automation:** Reduced vendor lock-in
- **Configuration Management:** Environment-specific configurations
- **Documentation:** Comprehensive technical documentation

---

## 📊 Monitoring & Reliability

### Uptime & Reliability
- **Uptime Goal:** 99.5% (considering free hosting limitations)
- **Health Checks:** Application health monitoring
- **Error Tracking:** Real-time error alerting and reporting
- **Performance Monitoring:** Response time and throughput tracking
- **Log Aggregation:** Centralized logging system

### Business Continuity
- **Data Backups:** Weekly automated PostgreSQL backups
- **Recovery Procedures:** Documented disaster recovery steps
- **High Availability:** Future multi-region redundancy planning
- **Capacity Planning:** Resource usage monitoring and scaling alerts

---

**Last Updated:** September 30, 2024
**Next Review:** Upon completion of API specifications