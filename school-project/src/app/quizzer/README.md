# Quizzer Page

The Quizzer page is the configuration interface where users can set up their quizzes before taking them. It provides an intuitive, step-by-step process for customizing quiz parameters.

## 📍 Location
- **URL**: `/quizzer`
- **File**: `src/app/quizzer/page.tsx`
- **Styles**: `src/app/quizzer/quizzer.css`

## 🎯 Purpose

The Quizzer page serves as the entry point for creating personalized quizzes. Users can:
1. Select a subject from available options
2. Choose specific chapters to focus on
3. Set difficulty level
4. Determine the number of questions
5. Launch the quiz with a single click

## 🧩 Component Structure

```
quizzer/
├── page.tsx              # Main page component
├── quizzer.css           # Styling for the page
└── components/
    ├── QuizProgress.tsx  # Step indicator component
    ├── SubjectGrid.tsx   # Subject selection grid
    ├── ChapterList.tsx   # Chapter selection list
    └── QuizConfig.tsx    # Configuration form
```

## 🎨 UI Components

### 1. SubjectGrid Component
**Location**: `src/app/quizzer/components/SubjectGrid.tsx`

Displays available subjects in a responsive grid layout with:
- Visual icons for each subject
- Subject name and description
- Hover effects and selection states
- Smooth transitions

**Available Subjects**:
```typescript
const subjects = [
  { id: 'math', name: 'Mathematics', icon: '∑', description: 'Algebra, Calculus, Geometry' },
  { id: 'physics', name: 'Physics', icon: '⚛', description: 'Mechanics, Thermodynamics, Quantum' },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗', description: 'Organic, Inorganic, Physical' },
  { id: 'biology', name: 'Biology', icon: '🧬', description: 'Cell, Genetics, Ecology' },
  { id: 'computer-science', name: 'Computer Science', icon: '💻', description: 'Algorithms, Data Structures, AI' },
  { id: 'history', name: 'History', icon: '📚', description: 'World, Ancient, Modern' },
  { id: 'geography', name: 'Geography', icon: '🌍', description: 'Physical, Human, Regional' },
  { id: 'literature', name: 'Literature', icon: '📖', description: 'Classic, Contemporary, Poetry' }
];
```

### 2. ChapterList Component
**Location**: `src/app/quizzer/components/ChapterList.tsx`

Multi-select interface for choosing chapters:
- Checkbox selection for multiple chapters
- Select all functionality
- Visual feedback for selected items
- Chapter count display

**Chapter Data Structure**:
```typescript
const chaptersData: Record<string, string[]> = {
  'math': [
    'Algebra Basics',
    'Linear Equations',
    'Quadratic Equations',
    'Calculus I',
    'Calculus II',
    'Geometry',
    'Trigonometry',
    'Statistics'
  ],
  // ... other subjects
};
```

### 3. QuizConfig Component
**Location**: `src/app/quizzer/components/QuizConfig.tsx`

Configuration form for:
- **Difficulty Level**:
  - Easy: Basic concepts, straightforward questions
  - Medium: Moderate complexity, requires thinking
  - Hard: Challenging, tests deep understanding
- **Question Count**: Slider with min/max limits (5-50)

### 4. QuizProgress Component
**Location**: `src/app/quizzer/components/QuizProgress.tsx`

Visual step indicator showing:
- Current step highlighting
- Completed step checkmarks
- Clickable steps for navigation
- Smooth transitions between steps

## 📊 State Management

### QuizData Interface
```typescript
interface QuizData {
  subject: string;           // Selected subject ID
  chapters: string[];        // Array of selected chapter IDs
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;     // Number of questions (5-50)
}
```

### State Flow
1. **Initial State**: All fields empty or default
2. **Step Progression**: User moves through 3 steps
3. **Validation**: Each step must be completed before proceeding
4. **Final State**: Complete configuration ready for quiz generation

## 🔄 Flow Logic

### Step 1: Subject Selection
- **Entry Point**: Default view on page load
- **Validation**: Must select exactly one subject
- **Navigation**: Can proceed to chapters or jump back

### Step 2: Chapter Selection
- **Prerequisite**: Subject must be selected
- **Validation**: Must select at least one chapter
- **Features**:
  - Individual chapter checkboxes
  - Select/Deselect all option
  - Selected count display

### Step 3: Configuration
- **Prerequisites**: Subject and chapters selected
- **Options**:
  - Difficulty selector (Easy/Medium/Hard)
  - Question count slider (5-50)
- **Summary Card**: Shows all selected options

### Quiz Launch
- **Trigger**: "Start Quiz" button
- **Action**:
  1. Convert chapter IDs to names
  2. Create quiz configuration object
  3. Encode as URL parameter
  4. Navigate to quiz page

## 🎨 Styling

### Design System
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Cosmic Theme**: Purple/magenta gradient accents
- **Dark Background**: High contrast for readability

### CSS Classes
```css
.quizzer-container          /* Main container with gradient orbs */
.quizzer-content           /* Content wrapper */
.quizzer-header            /* Page title and subtitle */
.quiz-step-container       /* Step content area */
.nav-button               /* Navigation buttons */
.quiz-summary            /* Configuration summary */
```

### Animations
- **Page Load**: Fade-in animation
- **Step Transitions**: Slide animations with opacity
- **Button Interactions**: Hover states with scale effects
- **Progress Updates**: Smooth fill animations

## 🚀 Navigation

### From Quizzer to Quiz
```typescript
const startQuiz = () => {
  // Convert selected data
  const subjectName = subjects.find(s => s.id === quizData.subject)?.name;
  const selectedChapters = quizData.chapters.map(id =>
    chaptersData[quizData.subject]?.findIndex(ch => ch === id)
  );

  // Create configuration
  const quizConfig = {
    subject: subjectName,
    chapters: selectedChapters,
    difficulty: quizData.difficulty,
    questionCount: quizData.questionCount
  };

  // Navigate with data
  router.push(`/quiz?quizData=${encodeURIComponent(JSON.stringify(quizConfig))}`);
};
```

### URL Structure
```
/quiz?quizData={
  "subject": "Mathematics",
  "chapters": ["Algebra Basics", "Linear Equations"],
  "difficulty": "medium",
  "questionCount": 20
}
```

## 🔧 Technical Implementation

### Key Features

1. **Responsive Design**:
   - Desktop: 3-column grid for subjects
   - Tablet: 2-column grid
   - Mobile: 1-column list

2. **Form Validation**:
   - Real-time validation feedback
   - Visual indicators for errors
   - Prevents progression without required fields

3. **Accessibility**:
   - ARIA labels for screen readers
   - Keyboard navigation support
   - Focus management

4. **Performance**:
   - Lazy loading of components
   - Optimized animations with CSS transforms
   - Minimal re-renders

### Event Handlers
```typescript
const handleSubjectSelect = (subjectId: string) => {
  setQuizData({
    ...quizData,
    subject: subjectId,
    chapters: [] // Reset chapters when subject changes
  });
  setCurrentStep(1); // Auto-advance to chapters
};

const handleChaptersChange = (chapters: string[]) => {
  setQuizData({ ...quizData, chapters });
};

const handleConfigChange = (data: Partial<QuizData>) => {
  setQuizData({ ...quizData, ...data });
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Chapters not loading**
   - Check that subject is selected
   - Verify chaptersData has entries for the subject
   - Check browser console for errors

2. **Navigation not working**
   - Verify quizData is complete
   - Check URL encoding/decoding
   - Ensure router is properly initialized

3. **Styling issues**
   - Verify quizzer.css is imported
   - Check Tailwind CSS compilation
   - Clear browser cache

### Debug Mode
Add console logs to track state changes:
```typescript
useEffect(() => {
  console.log('Quiz data updated:', quizData);
}, [quizData]);

useEffect(() => {
  console.log('Current step:', currentStep);
}, [currentStep]);
```

## 📱 Mobile Considerations

### Responsive Breakpoints
- **Mobile (< 768px)**: Single column, full-width components
- **Tablet (768px - 1024px)**: Two-column layouts
- **Desktop (> 1024px)**: Full three-column design

### Touch Interactions
- Larger tap targets (44px minimum)
- Touch-friendly sliders
- Swipe gestures for step navigation

## 🔄 Future Enhancements

### Planned Features
1. **Quiz Templates**: Pre-configured quiz combinations
2. **Recent Subjects**: Quick access to frequently used subjects
3. **Time Limits**: Option to set quiz duration
4. **Question Types**: Multiple choice, true/false, fill-in-the-blank

### UI Improvements
1. **Subject Categories**: Group subjects by domain
2. **Chapter Search**: Quick search within chapters
3. **Difficulty Preview**: Show example questions per level
4. **Save Configuration**: Save quiz setups for later

## 📚 Related Documentation

- [Quiz System Overview](../../../docs/03-features/quiz-system.md)
- [Quiz Taking Page](../quiz/README.md)
- [Quiz API Reference](../../../docs/04/api/quiz-endpoints.md)
- [Component Library](../../../components/ui/README.md)

## 🤝 Contributing

When modifying the Quizzer page:

1. **Maintain component structure**
2. **Follow existing naming conventions**
3. **Test responsive behavior**
4. **Update documentation**
5. **Consider accessibility**

### Adding New Subjects
1. Update `subjects` array with new subject
2. Add chapters to `chaptersData`
3. Test complete flow
4. Update documentation

### Changing UI Components
1. Maintain glassmorphism design
2. Use theme colors from theme system
3. Ensure smooth animations
4. Test cross-browser compatibility

---

The Quizzer page is designed to be intuitive, efficient, and visually appealing, providing users with a seamless experience for creating personalized quizzes.