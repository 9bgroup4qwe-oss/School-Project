import { TimetableData } from '@/types/timetable';

export const mockTimetableData: TimetableData = {
  id: 'mock-timetable-1',
  name: 'Study Schedule - Mock',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
  schedule: {
    monday: [
      { time: '06:00-07:00', activity: 'Morning Exercise', type: 'activity', location: 'Park' },
      { time: '07:00-08:00', activity: 'Breakfast', type: 'meal', location: 'Home' },
      { time: '08:00-09:00', activity: 'Mathematics - Sets', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '09:00-10:00', activity: 'Mathematics - Relations', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '10:00-10:15', activity: 'Tea Break', type: 'break', location: 'Kitchen' },
      { time: '10:15-11:15', activity: 'Physics - Units & Measurements', type: 'study', location: 'Study Room', priority: 'medium' },
      { time: '11:15-12:15', activity: 'Physics - Dimensional Analysis', type: 'study', location: 'Study Room', priority: 'medium' },
      { time: '12:00-13:00', activity: 'Lunch', type: 'meal', location: 'Home' },
      { time: '13:00-14:00', activity: 'Chemistry - Basic Concepts', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '14:00-15:00', activity: 'Chemistry - Mole Concept', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '15:00-15:15', activity: 'Snack Break', type: 'break', location: 'Kitchen' },
      { time: '15:15-16:15', activity: 'Mathematics Practice', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '16:00-18:00', activity: 'Free Time / Sports', type: 'activity', location: 'Playground' },
      { time: '18:00-19:00', activity: 'Dinner', type: 'meal', location: 'Home' },
      { time: '19:00-20:00', activity: 'Review Physics', type: 'study', location: 'Study Room', priority: 'medium' },
      { time: '20:00-21:00', activity: 'Leisure Reading', type: 'personal', location: 'Bedroom' },
      { time: '21:00-06:00', activity: 'Sleep', type: 'personal', location: 'Bedroom' }
    ],
    tuesday: [
      { time: '06:00-07:00', activity: 'Morning Exercise', type: 'activity', location: 'Park' },
      { time: '07:00-08:00', activity: 'Breakfast', type: 'meal', location: 'Home' },
      { time: '08:00-09:30', activity: 'Mathematics - Functions', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '09:30-09:45', activity: 'Tea Break', type: 'break', location: 'Kitchen' },
      { time: '09:45-11:15', activity: 'Physics - Motion in Straight Line', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '11:15-12:45', activity: 'Chemistry - Structure of Atom', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '12:45-13:45', activity: 'Lunch', type: 'meal', location: 'Home' },
      { time: '13:45-15:15', activity: 'Mathematics - Trigonometry', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '15:15-15:30', activity: 'Snack Break', type: 'break', location: 'Kitchen' },
      { time: '15:30-17:00', activity: 'Problem Solving Session', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '17:00-18:00', activity: 'Music Practice', type: 'activity', location: 'Music Room' },
      { time: '18:00-19:00', activity: 'Dinner', type: 'meal', location: 'Home' },
      { time: '19:00-20:00', activity: 'Review Chemistry', type: 'study', location: 'Study Room', priority: 'medium' },
      { time: '20:00-21:00', activity: 'Movie Time', type: 'personal', location: 'Living Room' },
      { time: '21:00-06:00', activity: 'Sleep', type: 'personal', location: 'Bedroom' }
    ],
    wednesday: [
      { time: '06:00-07:00', activity: 'Morning Exercise', type: 'activity', location: 'Park' },
      { time: '07:00-08:00', activity: 'Breakfast', type: 'meal', location: 'Home' },
      { time: '08:00-09:00', activity: 'Mathematics Revision', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '09:00-10:30', activity: 'Physics - Graphical Analysis', type: 'study', location: 'Study Room', priority: 'medium' },
      { time: '10:30-10:45', activity: 'Tea Break', type: 'break', location: 'Kitchen' },
      { time: '10:45-12:15', activity: 'Chemistry - Chemical Bonding', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '12:15-13:15', activity: 'Lunch', type: 'meal', location: 'Home' },
      { time: '13:15-14:45', activity: 'Mock Test - Mathematics', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '14:45-15:00', activity: 'Snack Break', type: 'break', location: 'Kitchen' },
      { time: '15:00-16:30', activity: 'Mock Test Analysis', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '16:30-18:00', activity: 'Basketball', type: 'activity', location: 'Court' },
      { time: '18:00-19:00', activity: 'Dinner', type: 'meal', location: 'Home' },
      { time: '19:00-20:00', activity: 'Review Weak Topics', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '20:00-21:00', activity: 'Call Family', type: 'personal', location: 'Bedroom' },
      { time: '21:00-06:00', activity: 'Sleep', type: 'personal', location: 'Bedroom' }
    ],
    thursday: [
      { time: '06:00-07:00', activity: 'Morning Exercise', type: 'activity', location: 'Park' },
      { time: '07:00-08:00', activity: 'Breakfast', type: 'meal', location: 'Home' },
      { time: '08:00-09:30', activity: 'Physics - Equations of Motion', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '09:30-11:00', activity: 'Chemistry - States of Matter', type: 'study', location: 'Study Room', priority: 'medium' },
      { time: '11:00-11:15', activity: 'Tea Break', type: 'break', location: 'Kitchen' },
      { time: '11:15-12:45', activity: 'Mathematics - Binomial Theorem', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '12:45-13:45', activity: 'Lunch', type: 'meal', location: 'Home' },
      { time: '13:45-15:15', activity: 'Physics Practice Problems', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '15:15-15:30', activity: 'Snack Break', type: 'break', location: 'Kitchen' },
      { time: '15:30-17:00', activity: 'Chemistry Numericals', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '17:00-18:00', activity: 'Art Class', type: 'activity', location: 'Art Room' },
      { time: '18:00-19:00', activity: 'Dinner', type: 'meal', location: 'Home' },
      { time: '19:00-20:00', activity: 'Daily Review', type: 'study', location: 'Study Room', priority: 'medium' },
      { time: '20:00-21:00', activity: 'Gaming', type: 'personal', location: 'Bedroom' },
      { time: '21:00-06:00', activity: 'Sleep', type: 'personal', location: 'Bedroom' }
    ],
    friday: [
      { time: '06:00-07:00', activity: 'Morning Exercise', type: 'activity', location: 'Park' },
      { time: '07:00-08:00', activity: 'Breakfast', type: 'meal', location: 'Home' },
      { time: '08:00-09:00', activity: 'Weekly Test - Physics', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '09:00-10:00', activity: 'Weekly Test - Chemistry', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '10:00-10:15', activity: 'Tea Break', type: 'break', location: 'Kitchen' },
      { time: '10:15-11:15', activity: 'Weekly Test - Mathematics', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '11:15-12:15', activity: 'Test Discussion', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '12:15-13:15', activity: 'Lunch', type: 'meal', location: 'Home' },
      { time: '13:15-14:15', activity: 'Error Analysis', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '14:15-15:15', activity: 'Weak Topic Practice', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '15:15-15:30', activity: 'Snack Break', type: 'break', location: 'Kitchen' },
      { time: '15:30-17:00', activity: 'Weekend Planning', type: 'personal', location: 'Study Room' },
      { time: '17:00-18:00', activity: 'Friends Meetup', type: 'activity', location: 'Cafe' },
      { time: '18:00-19:00', activity: 'Dinner', type: 'meal', location: 'Home' },
      { time: '19:00-21:00', activity: 'Movie Night', type: 'personal', location: 'Living Room' },
      { time: '21:00-06:00', activity: 'Sleep', type: 'personal', location: 'Bedroom' }
    ],
    saturday: [
      { time: '07:00-08:00', activity: 'Breakfast', type: 'meal', location: 'Home' },
      { time: '08:00-09:30', activity: 'Full Syllabus Revision - Math', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '09:30-09:45', activity: 'Tea Break', type: 'break', location: 'Kitchen' },
      { time: '09:45-11:15', activity: 'Full Syllabus Revision - Physics', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '11:15-12:45', activity: 'Full Syllabus Revision - Chemistry', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '12:45-13:45', activity: 'Lunch', type: 'meal', location: 'Home' },
      { time: '13:45-16:00', activity: 'Practice Previous Year Papers', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '16:00-18:00', activity: 'Outdoor Games', type: 'activity', location: 'Ground' },
      { time: '18:00-19:00', activity: 'Dinner', type: 'meal', location: 'Home' },
      { time: '19:00-21:00', activity: 'Family Time', type: 'personal', location: 'Living Room' },
      { time: '21:00-06:00', activity: 'Sleep', type: 'personal', location: 'Bedroom' }
    ],
    sunday: [
      { time: '07:00-08:00', activity: 'Breakfast', type: 'meal', location: 'Home' },
      { time: '08:00-10:00', activity: 'Mock Test - Full Syllabus', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '10:00-10:15', activity: 'Tea Break', type: 'break', location: 'Kitchen' },
      { time: '10:15-12:00', activity: 'Mock Test Evaluation', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '12:00-13:00', activity: 'Lunch', type: 'meal', location: 'Home' },
      { time: '13:00-15:00', activity: 'Weak Area Improvement', type: 'study', location: 'Study Room', priority: 'high' },
      { time: '15:00-16:00', activity: 'Plan Next Week', type: 'personal', location: 'Study Room' },
      { time: '16:00-18:00', activity: 'Hobby Time', type: 'activity', location: 'Hobby Room' },
      { time: '18:00-19:00', activity: 'Dinner', type: 'meal', location: 'Home' },
      { time: '19:00-21:00', activity: 'Relax / Entertainment', type: 'personal', location: 'Living Room' },
      { time: '21:00-06:00', activity: 'Sleep', type: 'personal', location: 'Bedroom' }
    ]
  },
  metadata: {
    totalStudyHours: 45,
    examDate: '2025-03-15',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    goals: [
      'Complete syllabus by February 28',
      'Score 90%+ in exams',
      'Daily revision of topics'
    ]
  }
};

export const mockSyllabusData = {
  subjects: [
    {
      name: 'Mathematics',
      chapters: [
        { name: 'Sets and Relations', topics: ['Sets', 'Relations', 'Functions'], difficulty: 'medium', estimatedHours: 8 },
        { name: 'Functions', topics: ['Domain & Range', 'Types', 'Composition'], difficulty: 'medium', estimatedHours: 10 },
        { name: 'Trigonometric Functions', topics: ['Angles', 'Identities', 'Equations'], difficulty: 'hard', estimatedHours: 12 },
        { name: 'Binomial Theorem', topics: ['Expansion', 'General Term', 'Middle Term'], difficulty: 'medium', estimatedHours: 6 }
      ],
      totalChapters: 4,
      totalHours: 36
    },
    {
      name: 'Physics',
      chapters: [
        { name: 'Physical World', topics: ['Introduction', 'Scope', 'Excitement'], difficulty: 'easy', estimatedHours: 4 },
        { name: 'Units and Measurements', topics: ['SI Units', 'Dimensions', 'Errors'], difficulty: 'medium', estimatedHours: 8 },
        { name: 'Motion in Straight Line', topics: ['Kinematics', 'Graphs', 'Equations'], difficulty: 'medium', estimatedHours: 10 },
        { name: 'Motion in Plane', topics: ['Vectors', 'Projectile', 'Relative Motion'], difficulty: 'hard', estimatedHours: 12 }
      ],
      totalChapters: 4,
      totalHours: 34
    },
    {
      name: 'Chemistry',
      chapters: [
        { name: 'Basic Concepts', topics: ['Mole', 'Stoichiometry'], difficulty: 'medium', estimatedHours: 9 },
        { name: 'Structure of Atom', topics: ['Models', 'Quantum Numbers'], difficulty: 'hard', estimatedHours: 11 },
        { name: 'Chemical Bonding', topics: ['Ionic', 'Covalent', 'Hybridization'], difficulty: 'hard', estimatedHours: 10 }
      ],
      totalChapters: 3,
      totalHours: 30
    }
  ],
  examDate: '2025-03-15',
  daysUntilExam: 87,
  totalSubjects: 3,
  totalHours: 100,
  recommendations: [
    'Focus on Mathematics - 36 hours needed',
    'Physics and Chemistry need equal attention',
    'Practice 2-3 hours daily',
    'Revise weekends thoroughly'
  ]
};