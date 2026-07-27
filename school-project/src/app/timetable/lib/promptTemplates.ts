export const PROMPT_TEMPLATES = {
  WELCOME: (schoolType?: string) => `
    You are an AI timetable assistant specializing in creating personalized study schedules.

    ${schoolType ?
      `Great! I see you're attending ${schoolType}. Now, what grade/year are you in?` :
      "Hi! I'm your AI timetable assistant. I'll help you create the perfect study schedule. Let's start with something simple - what type of school do you attend?"
    }

    Please respond in a friendly, conversational manner and provide appropriate quick reply options.
  `,

  GRADE_LEVEL: (gradeLevel: string) => `
    Thanks for sharing! Now let's talk about your classes. What's your Monday schedule like?

    Please provide specific times for each class. For example:
    - Mathematics: 9:00 AM - 10:00 AM
    - English: 10:30 AM - 11:30 AM

    I'll collect your classes day by day to build your perfect timetable.
  `,

  COLLECT_CLASSES: (day: string, existingClasses: any[]) => `
    Let's continue building your schedule. What classes do you have on ${day}?

    ${existingClasses.length > 0 ? `So far, I have:\n${existingClasses.map(c => `- ${c.name}: ${c.startTime} - ${c.endTime}`).join('\n')}` : ''}

    Please share your ${day} classes with specific times. If you don't have classes on ${day}, just let me know.
  `,

  STUDY_PREFERENCES: () => `
    Great! Now I need to understand your study preferences to create the perfect schedule.

    When do you prefer studying - morning, afternoon, or evening? And how many hours of study do you aim for each day?

    This helps me optimize your timetable for maximum productivity.
  `,

  DIFFICULT_SUBJECTS: () => `
    Which subjects do you find most challenging? I'll schedule extra study time for them when you're most alert.

    Also, do you prefer studying difficult subjects early when you're fresh, or later in the day?
  `,

  EXTRACURRICULARS: () => `
    Almost done! Do you have any extracurricular activities, sports, or hobbies I should include in your timetable?

    These could be:
    - Sports practices
    - Music lessons
    - Club meetings
    - Part-time job
    - Exercise/gym time
    - Family commitments
  `,

  PERSONAL_TIME: () => `
    Just a few more details to perfect your schedule:

    1. What time do you usually wake up and go to sleep?
    2. How often do you need breaks during study sessions?
    3. Do you study on weekends?
    4. Any specific lunch/dinner times?
  `,

  OPTIMIZATION: (collectedData: any) => `
    Based on everything you've shared, I'm ready to create your optimized timetable. Here's what I have:

    ${JSON.stringify(collectedData, null, 2)}

    I'll create a balanced schedule that:
    - Maximizes your study efficiency
    - Includes regular breaks
    - Accounts for your energy levels throughout the day
    - Ensures you have time for activities and relaxation

    Would you like me to generate your timetable now, or would you like to make any adjustments?
  `,

  GENERATE_TIMETABLE: (allData: any) => `
    Generate a complete weekly timetable based on this information:

    ${JSON.stringify(allData, null, 2)}

    Create a structured timetable that:
    1. Includes all fixed classes and activities
    2. Adds optimal study blocks for each subject
    3. Includes breaks every 45-60 minutes during study sessions
    4. Schedules difficult subjects during user's preferred high-energy times
    5. Ensures work-life balance

    Format the output as:
    [TIMETABLE]
    {
      "monday": [
        {"time": "06:00-07:00", "activity": "Morning Routine", "type": "personal"},
        {"time": "07:00-08:00", "activity": "Breakfast", "type": "meal"},
        {"time": "08:00-09:00", "activity": "Mathematics Study", "type": "study", "subject": "Mathematics"},
        {"time": "09:00-10:00", "activity": "Mathematics Class", "type": "class", "location": "Room 101"}
      ],
      "tuesday": [...],
      ...etc for all 7 days
    }
    [/TIMETABLE]

    Also provide a brief summary of the schedule and any tips for success.
  `
};

export const QUICK_REPLY_OPTIONS = {
  SCHOOL_TYPES: ['High School', 'University/College', 'Middle School', 'Homeschool', 'Other'],
  GRADE_LEVELS: {
    'High School': ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    'University/College': ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Graduate'],
    'Middle School': ['Grade 6', 'Grade 7', 'Grade 8']
  },
  DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  STUDY_TIMES: [
    'Morning person (6AM-12PM)',
    'Afternoon person (12PM-6PM)',
    'Evening person (6PM-11PM)',
    'Flexible/Night owl'
  ],
  ACTIVITIES: [
    'Sports team practice',
    'Music lessons',
    'Art/Drawing',
    'Gym/Exercise',
    'Part-time job',
    'Club meetings',
    'Volunteering',
    'Family time',
    'None at the moment'
  ],
  BREAK_FREQUENCY: [
    'Every 30 minutes',
    'Every 45 minutes',
    'Every hour',
    'Every 2 hours'
  ],
  WEEKEND_STUDY: [
    'Yes, both days',
    'Just Saturday',
    'Just Sunday',
    'No weekend study'
  ]
};