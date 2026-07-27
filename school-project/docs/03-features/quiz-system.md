# Quiz System Documentation

The Quiz System is a comprehensive feature that allows users to generate, take, and review quizzes across multiple subjects with AI-powered question generation.

## 📋 Overview

The Quiz System consists of three main components:
1. **Quizzer** - Configuration interface for creating quizzes
2. **Quiz Engine** - Core logic for quiz generation and management
3. **Quiz Taking Interface** - Interactive UI for taking quizzes
4. **Analytics & Review** - Performance tracking and mistake review

## 🎯 Features

### Core Features
- ✅ **Multi-subject Support** - 8 subjects with multiple chapters each
- ✅ **Difficulty Levels** - Easy, Medium, Hard
- ✅ **AI-Powered Generation** - Google Gemini 2.0 Flash integration
- ✅ **Real-time Progress Tracking** - Live score and time tracking
- ✅ **Detailed Explanations** - Every question includes explanations
- ✅ **Performance Analytics** - Subject and chapter-wise statistics
- ✅ **Mistake Review** - Review incorrect answers with explanations
- ✅ **Session Management** - Complete quiz session tracking

### Advanced Features
- ✅ **Question Deduplication** - MD5 hash-based duplicate prevention
- ✅ **Time Tracking** - Per-question and total quiz time
- ✅ **Adaptive Interface** - Smooth transitions and animations
- ✅ **Responsive Design** - Works on all device sizes
- ✅ **Glassmorphism UI** - Modern, beautiful design

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Quizzer UI    │    │   Quiz Taking   │    │   Quiz Review   │
│                 │    │                 │    │                 │
│ • Subject Select│    │ • Question      │    │ • Score Display │
│ • Chapter Select│    │ • Timer         │    │ • Mistakes      │
│ • Difficulty    │    │ • Progress Bar  │    │ • Statistics    │
│ • Question Count│    │ • Navigation    │    │ • Export        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Quiz Service   │
                    │                 │
                    │ • Session Mgmt  │
                    │ • Question Gen  │
                    │ • Answer Tracking│
                    │ • Statistics    │
                    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gemini AI     │    │   Supabase DB   │    │   Browser      │
│                 │    │                 │    │                 │
│ • Question Gen  │    │ • Sessions      │    │ • Local State  │
│ • Prompt Eng    │    │ • Questions     │    │ • Caching      │
│ • Response Parse│    │ • Answers       │    │ • Persistence  │
│ • Error Handling│    │ • Statistics    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Quiz Configuration**
   ```
   User selects options → Quizzer UI → Quiz Service → Save configuration
   ```

2. **Quiz Generation**
   ```
   Start Quiz → API Request → Gemini AI → Parse Response → Save Questions → Display Quiz
   ```

3. **Quiz Taking**
   ```
   User answers → Real-time save → Update progress → Track time → Complete quiz
   ```

4. **Results & Analytics**
   ```
   Calculate score → Update statistics → Show results → Store for review
   ```

## 📚 Component Breakdown

### 1. Quizzer Page (`/quizzer`)

**File**: `src/app/quizzer/page.tsx`

**Purpose**: Interface for configuring quizzes

**Components**:
- `SubjectGrid` - Visual subject selection
- `ChapterList` - Multi-select chapter picker
- `QuizConfig` - Difficulty and question count settings
- `QuizProgress` - Step indicator

**State Management**:
```typescript
interface QuizData {
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}
```

**Flow**:
1. Select subject from visual grid
2. Choose one or more chapters
3. Set difficulty and number of questions
4. Click "Start Quiz" to begin

### 2. Quiz Service

**File**: `src/services/quizSessionService.ts`

**Purpose**: Manages quiz sessions and data persistence

**Key Methods**:
- `createSession()` - Creates new quiz session
- `saveQuestions()` - Stores generated questions
- `saveAnswer()` - Records user answers
- `completeSession()` - Finalizes quiz and updates stats

**Features**:
- Singleton pattern for global state
- Automatic retry for failed saves
- Session cleanup on abandonment
- Real-time answer tracking

### 3. Quiz Taking Page (`/quiz`)

**File**: `src/app/quiz/page.tsx`

**Purpose**: Interactive interface for taking quizzes

**Features**:
- Question display with options
- Real-time timer (30 minutes default)
- Progress bar with visual feedback
- Navigation between questions
- Answer submission with validation
- Results display with detailed feedback

**UI Components**:
- Question header with subject/chapter tags
- Four-option multiple choice
- Submit button for each answer
- Previous/Next navigation
- Timer with warning at 5 minutes

### 4. Quiz Generation API

**File**: `src/app/api/ai/quiz/route.ts`

**Purpose**: Integrates with Gemini AI for question generation

**Process**:
1. Receive quiz configuration
2. Format prompt for Gemini
3. Send request to AI
4. Parse response into structured data
5. Validate and return questions

**Prompt Structure**:
```text
Generate {questionCount} multiple-choice questions for {subject}.

Chapters: {chapters.join(', ')}
Difficulty: {difficulty}

Requirements:
- 4 options per question (A, B, C, D)
- Clear correct answer indication
- Brief explanation for each answer
- JSON format output
```

### 5. Database Schema

**Tables**:
- `quiz_sessions` - Quiz attempt metadata
- `quiz_questions` - Generated questions
- `quiz_answers` - User responses
- `user_subject_stats` - Subject performance
- `user_chapter_stats` - Chapter performance

**Relationships**:
```
auth.users (1) → (N) quiz_sessions (1) → (N) quiz_questions (1) → (1) quiz_answers
quiz_sessions (1) → (N) user_subject_stats
quiz_sessions (1) → (N) user_chapter_stats
```

## 🎨 UI/UX Design

### Design Principles
1. **Glassmorphism Effects** - Modern, layered design
2. **Smooth Animations** - 60fps transitions
3. **Clear Visual Hierarchy** - Important elements stand out
4. **Responsive Design** - Works on all devices
5. **Accessibility** - WCAG compliant

### Color Scheme
- **Primary**: Cosmic purple/magenta gradients
- **Background**: Dark with glass effects
- **Text**: High contrast for readability
- **Interactive**: Hover states and transitions

### Component Library
- **Cards**: Glass-effect with backdrop blur
- **Buttons**: Gradient backgrounds with hover effects
- **Progress**: Animated fill with color changes
- **Modals**: Overlay with blur background

## 📊 Performance Tracking

### Metrics Tracked

#### Per Quiz
- Total questions answered
- Correct/incorrect answers
- Time taken per question
- Total quiz time
- Final score percentage

#### Per Subject
- Total quizzes completed
- Average score
- Best score
- Recent activity (last 30 days)
- Improvement trends

#### Per Chapter
- Accuracy rate
- Total questions attempted
- Weak area identification (< 60% accuracy)
- Last review date

### Analytics Display

#### Dashboard Widgets
- Recent quiz scores
- Subject performance chart
- Weak areas highlight
- Study streak tracking

#### Detailed Statistics
- Historical performance graph
- Chapter-wise accuracy heatmap
- Time spent per subject
- Progress over time

## 🔧 Implementation Details

### Question Generation Algorithm

```typescript
class QuizAIService {
  async generateQuiz(request: QuizRequest): Promise<QuizQuestion[]> {
    // 1. Build comprehensive prompt
    const prompt = this.buildQuizPrompt(request);

    // 2. Call Gemini API
    const response = await model.generateContent(prompt);

    // 3. Parse structured response
    const questions = this.parseQuizResponse(response);

    // 4. Validate and return
    return this.validateQuestions(questions);
  }
}
```

### Answer Validation

```typescript
const validateAnswer = (
  selectedOption: number,
  correctAnswer: number
): boolean => {
  // Ensure valid option range
  if (selectedOption < 0 || selectedOption > 3) return false;

  // Check correctness
  return selectedOption === correctAnswer;
};
```

### Statistics Calculation

```typescript
const calculateStatistics = async (sessionId: string) => {
  // 1. Fetch all answers for session
  const answers = await getQuizAnswers(sessionId);

  // 2. Calculate metrics
  const total = answers.length;
  const correct = answers.filter(a => a.isCorrect).length;
  const score = (correct / total) * 100;

  // 3. Update user stats
  await updateUserStats(sessionId, { total, correct, score });
};
```

## 🧪 Testing Strategy

### Unit Tests (Planned)
```typescript
describe('QuizService', () => {
  it('should create quiz session', async () => {
    const session = await quizService.createSession(mockData);
    expect(session.id).toBeDefined();
  });

  it('should save answers correctly', async () => {
    await quizService.saveAnswer(questionId, option, isCorrect);
    const saved = await getAnswer(questionId);
    expect(saved.selectedOption).toBe(option);
  });
});
```

### Integration Tests
- Full quiz flow from creation to completion
- API endpoint testing
- Database operations
- AI integration testing

### E2E Tests (Planned)
- User journey testing
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

## 🚀 Future Enhancements

### Phase 1 (In Progress)
- [ ] Quiz history page with filters
- [ ] Detailed analytics dashboard
- [ ] Mistake review with practice mode

### Phase 2 (Planned)
- [ ] Adaptive difficulty based on performance
- [ ] Question bookmarking
- [ ] Shareable quiz results
- [ ] Competitive quizzes with leaderboards

### Phase 3 (Future)
- [ ] Multiplayer quiz mode
- [ ] Custom question creation
- [ ] Quiz templates marketplace
- [ ] Voice-enabled questions

## 🔍 Troubleshooting

### Common Issues

#### Questions Not Generating
**Symptoms**: Loading spinner, no questions appear
**Solutions**:
1. Check Gemini API key validity
2. Verify API quota not exceeded
3. Check network connectivity
4. Review prompt formatting

#### Answers Not Saving
**Symptoms**: Progress lost on refresh
**Solutions**:
1. Check Supabase connection
2. Verify RLS policies
3. Check browser console for errors
4. Ensure user is authenticated

#### Performance Issues
**Symptoms**: Slow quiz loading
**Solutions**:
1. Optimize question generation
2. Implement caching
3. Reduce animation complexity
4. Check database query performance

### Debug Commands

```bash
# Check quiz sessions in database
SELECT * FROM quiz_sessions WHERE user_id = 'your-user-id';

# Verify question generation
curl -X POST http://localhost:3001/api/ai/quiz \
  -H "Content-Type: application/json" \
  -d '{"subject":"Math","chapters":["Algebra"],"difficulty":"medium","questionCount":5}'

# Check Supabase connection
npx supabase status
```

## 📚 API Reference

### Endpoints

#### POST `/api/ai/quiz`
Generate quiz questions
```typescript
// Request
{
  subject: string;
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

// Response
{
  questions: QuizQuestion[];
}
```

#### POST `/api/quiz/session`
Create new quiz session
```typescript
// Request
{
  subject: string;
  chapters: string[];
  difficulty: string;
  questionCount: number;
}

// Response
{
  sessionId: string;
  session: QuizSession;
}
```

#### GET `/api/quiz/history`
Get user's quiz history
```typescript
// Query params
?page=1&limit=10&subject=Math&status=completed

// Response
{
  sessions: QuizSession[];
  pagination: PaginationInfo;
}
```

For complete API documentation, see [API Documentation](../04/api/quiz-endpoints.md).

## 🤝 Contributing

### Adding New Subjects

1. Update `subjects` array in `src/app/quizzer/page.tsx`
2. Add chapters data to `chaptersData` object
3. Update prompt templates if needed
4. Test with various chapter combinations

### Modifying Question Generation

1. Update prompt template in `src/app/api/ai/quiz/route.ts`
2. Modify parsing logic if structure changes
3. Update validation in `parseQuizResponse()`
4. Test with sample outputs

### Adding New Features

1. Create feature branch
2. Update types if needed
3. Implement UI components
4. Add API endpoints
5. Update database schema
6. Add tests
7. Update documentation

---

The Quiz System is designed to be engaging, educational, and performant. It leverages modern web technologies and AI to provide a superior learning experience.