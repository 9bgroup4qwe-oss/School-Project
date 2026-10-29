// NCERT Curriculum Data across Grades 1 to 12 including Science, Commerce, and Humanities streams

export interface NCERTSubject {
  id: string;
  name: string;
  stream?: 'Science' | 'Commerce' | 'Humanities' | 'General';
  icon: string;
  color: string;
  chapters: string[];
}

export interface GradeCurriculum {
  grade: number;
  gradeLabel: string;
  category: 'Primary' | 'Middle School' | 'Secondary' | 'Senior Secondary';
  subjects: NCERTSubject[];
}

export const NCERT_CURRICULUM: Record<number, GradeCurriculum> = {
  1: {
    grade: 1,
    gradeLabel: 'Class 1',
    category: 'Primary',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics (Joyful)',
        stream: 'General',
        icon: '🔢',
        color: '#3b82f6',
        chapters: ['Shapes and Space', 'Numbers from One to Nine', 'Addition', 'Subtraction', 'Numbers from Ten to Twenty', 'Time', 'Measurement', 'Patterns', 'Money', 'How Many']
      },
      {
        id: 'english',
        name: 'English (Mridang / Marigold)',
        stream: 'General',
        icon: '📖',
        color: '#10b981',
        chapters: ['Two Little Hands', 'Greetings and Family', 'Picture Time', 'Animals and Birds', 'Fun with Rhymes', 'Letters and Phonics']
      },
      {
        id: 'evs',
        name: 'Environmental Studies',
        stream: 'General',
        icon: '🌱',
        color: '#f59e0b',
        chapters: ['My Family and Friends', 'Plants Around Us', 'Animals We See', 'Food We Eat', 'Water and Cleanliness', 'My Senses']
      }
    ]
  },
  2: {
    grade: 2,
    gradeLabel: 'Class 2',
    category: 'Primary',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics (Joyful Math)',
        stream: 'General',
        icon: '🔢',
        color: '#3b82f6',
        chapters: ['What is Long, What is Round?', 'Counting in Groups', 'How Much Can You Carry?', 'Counting in Tens', 'Patterns', 'Footprints', 'Jugs and Mugs', 'Tens and Ones', 'My Funday', 'Give and Take']
      },
      {
        id: 'english',
        name: 'English',
        stream: 'General',
        icon: '📖',
        color: '#10b981',
        chapters: ['First Day at School', 'Haldis Adventure', 'I am Lucky', 'I Want', 'A Smile', 'The Wind and the Sun', 'Rain', 'Storm in the Garden']
      },
      {
        id: 'evs',
        name: 'Environmental Studies',
        stream: 'General',
        icon: '🌱',
        color: '#f59e0b',
        chapters: ['Our Body and Health', 'Festivals of India', 'Seasons and Weather', 'Means of Transport', 'Good Habits', 'Safety Rules']
      }
    ]
  },
  3: {
    grade: 3,
    gradeLabel: 'Class 3',
    category: 'Primary',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics (Math-Magic)',
        stream: 'General',
        icon: '🔢',
        color: '#3b82f6',
        chapters: ['Where to Look From', 'Fun with Numbers', 'Give and Take', 'Long and Short', 'Shapes and Designs', 'Fun with Give and Take', 'Time Goes On', 'Who is Heavier?', 'How Many Times?', 'Play with Patterns', 'Jugs and Mugs', 'Can We Share?', 'Smart Charts', 'Rupees and Paise']
      },
      {
        id: 'evs',
        name: 'EVS (Looking Around)',
        stream: 'General',
        icon: '🌍',
        color: '#10b981',
        chapters: ['Poonams Day Out', 'The Plant Fairy', 'Water O Water', 'Our First School', 'Chhotus House', 'Foods We Eat', 'Saying without Speaking', 'Flying High', 'It’s Raining', 'What is Cooking', 'From Here to There', 'Work We Do', 'Sharing Our Feelings', 'The Story of Food', 'Making Pots', 'Games We Play', 'Here comes a Letter']
      },
      {
        id: 'english',
        name: 'English (Marigold)',
        stream: 'General',
        icon: '📖',
        color: '#f59e0b',
        chapters: ['Good Morning', 'The Magic Garden', 'Bird Talk', 'Nina and the Baby Sparrows', 'Little by Little', 'The Enormous Turnip', 'Sea Song', 'A Little Fish Story', 'The Balloon Man', 'The Yellow Butterfly']
      }
    ]
  },
  4: {
    grade: 4,
    gradeLabel: 'Class 4',
    category: 'Primary',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'General',
        icon: '🔢',
        color: '#3b82f6',
        chapters: ['Building with Bricks', 'Long and Short', 'A Trip to Bhopal', 'Tick-Tick-Tick', 'The Way The World Looks', 'The Junk Seller', 'Jugs and Mugs', 'Carts and Wheels', 'Halves and Quarters', 'Play with Patterns', 'Tables and Shares', 'How Heavy? How Light?', 'Fields and Fences', 'Smart Charts']
      },
      {
        id: 'evs',
        name: 'EVS (Looking Around)',
        stream: 'General',
        icon: '🌿',
        color: '#10b981',
        chapters: ['Going to School', 'Ear to Ear', 'A Day with Nandu', 'The Story of Amrita', 'Anita and the Honeybees', 'Omanas Journey', 'From the Window', 'Reaching Grandmothers House', 'Changing Families', 'Hu Tu Tu, Hu Tu Tu', 'The Valley of Flowers', 'Changing Times', 'A River’s Tale', 'Basva’s Farm', 'From Market to Home']
      },
      {
        id: 'english',
        name: 'English',
        stream: 'General',
        icon: '📖',
        color: '#f59e0b',
        chapters: ['Wake Up!', 'Neha’s Alarm Clock', 'Noses', 'The Little Fir Tree', 'Run!', 'Nasruddin’s Aim', 'Why?', 'Alice in Wonderland', 'Don’t be Afraid of the Dark', 'Helen Keller']
      }
    ]
  },
  5: {
    grade: 5,
    gradeLabel: 'Class 5',
    category: 'Primary',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'General',
        icon: '🔢',
        color: '#3b82f6',
        chapters: ['The Fish Tale', 'Shapes and Angles', 'How Many Squares?', 'Parts and Wholes', 'Does it Look the Same?', 'Be My Multiple, I’ll be Your Factor', 'Can You See the Pattern?', 'Mapping Your Way', 'Boxes and Sketches', 'Tenths and Hundredths', 'Area and its Boundary', 'Smart Charts', 'Ways to Multiply and Divide', 'How Big? How Heavy?']
      },
      {
        id: 'evs',
        name: 'EVS',
        stream: 'General',
        icon: '🌿',
        color: '#10b981',
        chapters: ['Super Senses', 'A Snake Charmer’s Story', 'From Tasting to Digesting', 'Mangoes Round the Year', 'Seeds and Seeds', 'Every Drop Counts', 'Experiments with Water', 'A Treat for Mosquitoes', 'Up You Go!', 'Walls Tell Stories', 'Sunita in Space', 'What if it Finishes...?', 'A Shelter so High!', 'When the Earth Shook!', 'Blow Hot, Blow Cold', 'Who will do this Work?', 'Across the Wall', 'No Place for Us?', 'A Seed tells a Farmer’s Story', 'Whose Forests?', 'Like Father, Like Daughter', 'On the Move Again']
      },
      {
        id: 'english',
        name: 'English',
        stream: 'General',
        icon: '📖',
        color: '#f59e0b',
        chapters: ['Ice-Cream Man', 'Wonderful Waste!', 'Teamwork', 'Flying Together', 'My Shadow', 'Robinson Crusoe', 'Crying', 'My Elder Brother', 'The Lazy Frog', 'Rip Van Winkle', 'Class Discussion', 'The Talkative Barber']
      }
    ]
  },
  6: {
    grade: 6,
    gradeLabel: 'Class 6',
    category: 'Middle School',
    subjects: [
      {
        id: 'science',
        name: 'Science (Curiosity)',
        stream: 'General',
        icon: '🔬',
        color: '#3b82f6',
        chapters: ['Components of Food', 'Sorting Materials into Groups', 'Separation of Substances', 'Getting to Know Plants', 'Body Movements', 'The Living Organisms — Characteristics and Habitats', 'Motion and Measurement of Distances', 'Light, Shadows and Reflections', 'Electricity and Circuits', 'Fun with Magnets', 'Air Around Us']
      },
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'General',
        icon: '📐',
        color: '#10b981',
        chapters: ['Knowing Our Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometrical Ideas', 'Understanding Elementary Shapes', 'Integers', 'Fractions', 'Decimals', 'Data Handling', 'Mensuration', 'Algebra', 'Ratio and Proportion', 'Symmetry', 'Practical Geometry']
      },
      {
        id: 'social-science',
        name: 'Social Science',
        stream: 'General',
        icon: '🏛️',
        color: '#f59e0b',
        chapters: ['What, Where, How and When?', 'From Hunting-Gathering to Growing Food', 'In the Earliest Cities', 'What Books and Burials Tell Us', 'Kingdoms, Kings and an Early Republic', 'New Questions and Ideas', 'Ashoka, The Emperor Who Gave Up War', 'Vital Villages, Thriving Towns', 'The Earth in the Solar System', 'Globe: Latitudes and Longitudes', 'Motions of the Earth', 'Maps', 'Major Domains of the Earth', 'Understanding Diversity', 'Diversity and Discrimination', 'What is Government?']
      },
      {
        id: 'english',
        name: 'English (Honeysuckle)',
        stream: 'General',
        icon: '📖',
        color: '#ec4899',
        chapters: ['Who Did Patrick’s Homework?', 'How the Dog Found Himself a New Master!', 'Taro’s Reward', 'An Indian-American Woman in Space: Kalpana Chawla', 'A Different Kind of School', 'Who I Am', 'Fair Play', 'The Banyan Tree']
      }
    ]
  },
  7: {
    grade: 7,
    gradeLabel: 'Class 7',
    category: 'Middle School',
    subjects: [
      {
        id: 'science',
        name: 'Science',
        stream: 'General',
        icon: '🔬',
        color: '#3b82f6',
        chapters: ['Nutrition in Plants', 'Nutrition in Animals', 'Heat', 'Acids, Bases and Salts', 'Physical and Chemical Changes', 'Respiration in Organisms', 'Transportation in Animals and Plants', 'Reproduction in Plants', 'Motion and Time', 'Electric Current and its Effects', 'Light', 'Forests: Our Lifeline', 'Wastewater Story']
      },
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'General',
        icon: '📐',
        color: '#10b981',
        chapters: ['Integers', 'Fractions and Decimals', 'Data Handling', 'Simple Equations', 'Lines and Angles', 'The Triangle and its Properties', 'Comparing Quantities', 'Rational Numbers', 'Perimeter and Area', 'Algebraic Expressions', 'Exponents and Powers', 'Symmetry', 'Visualising Solid Shapes']
      },
      {
        id: 'social-science',
        name: 'Social Science',
        stream: 'General',
        icon: '🏛️',
        color: '#f59e0b',
        chapters: ['Tracing Changes Through a Thousand Years', 'New Kings and Kingdoms', 'The Delhi Sultans', 'The Mughal Empire', 'Rulers and Buildings', 'Towns, Traders and Craftspersons', 'Environment', 'Inside Our Earth', 'Our Changing Earth', 'Air', 'Water', 'On Equality', 'Role of the Government in Health', 'How the State Government Works']
      }
    ]
  },
  8: {
    grade: 8,
    gradeLabel: 'Class 8',
    category: 'Middle School',
    subjects: [
      {
        id: 'science',
        name: 'Science',
        stream: 'General',
        icon: '🔬',
        color: '#3b82f6',
        chapters: ['Crop Production and Management', 'Microorganisms: Friend and Foe', 'Coal and Petroleum', 'Combustion and Flame', 'Conservation of Plants and Animals', 'Reproduction in Animals', 'Reaching the Age of Adolescence', 'Force and Pressure', 'Friction', 'Sound', 'Chemical Effects of Electric Current', 'Some Natural Phenomena', 'Light']
      },
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'General',
        icon: '📐',
        color: '#10b981',
        chapters: ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Data Handling', 'Squares and Square Roots', 'Cubes and Cube Roots', 'Comparing Quantities', 'Algebraic Expressions and Identities', 'Mensuration', 'Exponents and Powers', 'Direct and Inverse Proportions', 'Factorisation', 'Introduction to Graphs']
      },
      {
        id: 'social-science',
        name: 'Social Science',
        stream: 'General',
        icon: '🏛️',
        color: '#f59e0b',
        chapters: ['How, When and Where', 'From Trade to Territory', 'Ruling the Countryside', 'Tribals, Dikus and the Vision of a Golden Age', 'When People Rebel (1857 and After)', 'Civilising the "Native", Educating the Nation', 'Women, Caste and Reform', 'The Making of the National Movement: 1870s-1947', 'Resources', 'Land, Soil, Water, Natural Vegetation and Wildlife', 'Agriculture', 'Industries', 'Human Resources', 'The Indian Constitution', 'Understanding Secularism', 'Parliament and the Making of Laws', 'Judiciary', 'Understanding Marginalisation']
      }
    ]
  },
  9: {
    grade: 9,
    gradeLabel: 'Class 9',
    category: 'Secondary',
    subjects: [
      {
        id: 'science',
        name: 'Science (PCB)',
        stream: 'General',
        icon: '🔬',
        color: '#3b82f6',
        chapters: ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound', 'Improvement in Food Resources']
      },
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'General',
        icon: '📐',
        color: '#10b981',
        chapters: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', 'Introduction to Euclid’s Geometry', 'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Heron’s Formula', 'Surface Areas and Volumes', 'Statistics']
      },
      {
        id: 'social-science',
        name: 'Social Science (History, Civics, Geo, Eco)',
        stream: 'General',
        icon: '🏛️',
        color: '#f59e0b',
        chapters: ['The French Revolution', 'Socialism in Europe and the Russian Revolution', 'Nazism and the Rise of Hitler', 'India - Size and Location', 'Physical Features of India', 'Drainage', 'Climate', 'Natural Vegetation and Wildlife', 'Population', 'What is Democracy? Why Democracy?', 'Constitutional Design', 'Electoral Politics', 'Working of Institutions', 'Democratic Rights', 'The Story of Village Palampur', 'People as Resource', 'Poverty as a Challenge', 'Food Security in India']
      },
      {
        id: 'english',
        name: 'English (Beehive & Moments)',
        stream: 'General',
        icon: '📖',
        color: '#ec4899',
        chapters: ['The Fun They Had', 'The Sound of Music', 'The Little Girl', 'A Truly Beautiful Mind', 'The Snake and the Mirror', 'My Childhood', 'Reach for the Top', 'Kathmandu', 'If I Were You', 'The Lost Child', 'The Adventures of Toto', 'Iswaran the Storyteller', 'In the Kingdom of Fools', 'The Happy Prince', 'The Last Leaf', 'A House Is Not a Home', 'The Beggar']
      },
      {
        id: 'it',
        name: 'Information Technology (402)',
        stream: 'General',
        icon: '💻',
        color: '#06b6d4',
        chapters: ['Communication Skills', 'Self-Management Skills', 'ICT Skills', 'Entrepreneurial Skills', 'Green Skills', 'Introduction to IT-ITeS Industry', 'Data Entry & Keyboarding Skills', 'Digital Documentation', 'Electronic Spreadsheet', 'Digital Presentation']
      }
    ]
  },
  10: {
    grade: 10,
    gradeLabel: 'Class 10 (Board Exam)',
    category: 'Secondary',
    subjects: [
      {
        id: 'science',
        name: 'Science (Physics, Chemistry, Biology)',
        stream: 'General',
        icon: '🔬',
        color: '#3b82f6',
        chapters: [
          'Chemical Reactions and Equations',
          'Acids, Bases and Salts',
          'Metals and Non-metals',
          'Carbon and its Compounds',
          'Life Processes',
          'Control and Coordination',
          'How do Organisms Reproduce?',
          'Heredity and Evolution',
          'Light – Reflection and Refraction',
          'The Human Eye and the Colourful World',
          'Electricity',
          'Magnetic Effects of Electric Current',
          'Our Environment'
        ]
      },
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'General',
        icon: '📐',
        color: '#10b981',
        chapters: [
          'Real Numbers',
          'Polynomials',
          'Pair of Linear Equations in Two Variables',
          'Quadratic Equations',
          'Arithmetic Progressions (AP)',
          'Triangles',
          'Coordinate Geometry',
          'Introduction to Trigonometry',
          'Some Applications of Trigonometry',
          'Circles',
          'Areas Related to Circles',
          'Surface Areas and Volumes',
          'Statistics',
          'Probability'
        ]
      },
      {
        id: 'social-science',
        name: 'Social Science (SST - History, Civics, Geo, Eco)',
        stream: 'General',
        icon: '🏛️',
        color: '#f59e0b',
        chapters: [
          'The Rise of Nationalism in Europe',
          'Nationalism in India',
          'The Making of a Global World',
          'The Age of Industrialisation',
          'Print Culture and the Modern World',
          'Resources and Development',
          'Forest and Wildlife Resources',
          'Water Resources',
          'Agriculture',
          'Minerals and Energy Resources',
          'Manufacturing Industries',
          'Lifelines of National Economy',
          'Power Sharing',
          'Federalism',
          'Gender, Religion and Caste',
          'Political Parties',
          'Outcomes of Democracy',
          'Development',
          'Sectors of the Indian Economy',
          'Money and Credit',
          'Globalisation and the Indian Economy',
          'Consumer Rights'
        ]
      },
      {
        id: 'english',
        name: 'English (First Flight & Footprints)',
        stream: 'General',
        icon: '📖',
        color: '#ec4899',
        chapters: [
          'A Letter to God',
          'Nelson Mandela: Long Walk to Freedom',
          'Two Stories about Flying',
          'From the Diary of Anne Frank',
          'Glimpses of India',
          'Mijbil the Otter',
          'Madam Rides the Bus',
          'The Sermon at Benares',
          'The Proposal',
          'A Triumph of Surgery',
          'The Thief’s Story',
          'The Midnight Visitor',
          'A Question of Trust',
          'Footprints without Feet',
          'The Making of a Scientist',
          'The Necklace',
          'Bholi',
          'The Book That Saved the Earth'
        ]
      },
      {
        id: 'ai-it',
        name: 'Artificial Intelligence & IT (417/402)',
        stream: 'General',
        icon: '🤖',
        color: '#8b5cf6',
        chapters: [
          'Introduction to AI',
          'AI Project Cycle',
          'Advance Python Programming',
          'Data Sciences',
          'Computer Vision (CV)',
          'Natural Language Processing (NLP)',
          'Evaluation and Ethics of AI'
        ]
      }
    ]
  },
  11: {
    grade: 11,
    gradeLabel: 'Class 11 (Science, Commerce & Humanities)',
    category: 'Senior Secondary',
    subjects: [
      // Commerce Stream
      {
        id: 'accountancy',
        name: 'Accountancy (Financial Accounting)',
        stream: 'Commerce',
        icon: '📊',
        color: '#f59e0b',
        chapters: [
          'Introduction to Accounting',
          'Theory Base of Accounting & Standards',
          'Recording of Transactions - I (Journal & Ledger)',
          'Recording of Transactions - II (Special Journals & Cash Book)',
          'Bank Reconciliation Statement (BRS)',
          'Trial Balance and Rectification of Errors',
          'Depreciation, Provisions and Reserves',
          'Financial Statements of Sole Proprietorship (Without Adjustments)',
          'Financial Statements with Adjustments'
        ]
      },
      {
        id: 'business-studies',
        name: 'Business Studies',
        stream: 'Commerce',
        icon: '💼',
        color: '#3b82f6',
        chapters: [
          'Evolution and Fundamentals of Business',
          'Forms of Business Organisations (Sole Prop, Partnership, Company)',
          'Public, Private and Global Enterprises',
          'Business Services (Banking, Insurance, Postal)',
          'Emerging Modes of Business (e-Business & BPO)',
          'Social Responsibilities of Business and Business Ethics',
          'Sources of Business Finance (Equity, Debt, Retained Earnings)',
          'Small Business and Enterprises',
          'Internal Trade (Wholesale & Retail)',
          'International Business'
        ]
      },
      {
        id: 'economics',
        name: 'Economics (Micro & Statistics)',
        stream: 'Commerce',
        icon: '📈',
        color: '#10b981',
        chapters: [
          'Introduction to Microeconomics',
          'Consumer’s Equilibrium and Demand',
          'Producer Behaviour and Supply',
          'Forms of Market and Price Determination',
          'Introduction to Statistics for Economics',
          'Collection, Organisation and Presentation of Data',
          'Measures of Central Tendency (Mean, Median, Mode)',
          'Correlation',
          'Index Numbers'
        ]
      },
      // Humanities / SST Stream
      {
        id: 'history',
        name: 'History (Themes in World History)',
        stream: 'Humanities',
        icon: '🏛️',
        color: '#ec4899',
        chapters: [
          'Writing and City Life (Mesopotamia)',
          'An Empire Across Three Continents (Roman Empire)',
          'Nomadic Empires (Mongols & Genghis Khan)',
          'The Three Orders (Feudal Society)',
          'Changing Cultural Traditions (Renaissance)',
          'Displacing Indigenous Peoples',
          'Paths to Modernisation (China & Japan)'
        ]
      },
      {
        id: 'political-science',
        name: 'Political Science (Theory & Constitution)',
        stream: 'Humanities',
        icon: '⚖️',
        color: '#8b5cf6',
        chapters: [
          'Constitution: Why and How?',
          'Rights in the Indian Constitution',
          'Election and Representation',
          'Executive in Indian Government',
          'Legislature',
          'Judiciary',
          'Federalism',
          'Local Governments (Panchayats & Municipalities)',
          'Political Theory: An Introduction',
          'Freedom and Liberty',
          'Equality',
          'Social Justice',
          'Rights',
          'Citizenship',
          'Nationalism',
          'Secularism'
        ]
      },
      {
        id: 'geography',
        name: 'Geography (Physical & India Environment)',
        stream: 'Humanities',
        icon: '🌍',
        color: '#06b6d4',
        chapters: [
          'Geography as a Discipline',
          'The Earth: Origin, Evolution and Interior',
          'Distribution of Oceans and Continents (Plate Tectonics)',
          'Minerals and Rocks',
          'Geomorphic Processes',
          'Atmosphere: Composition, Solar Radiation & Temperature',
          'Atmospheric Circulation and Weather Systems',
          'Water in Atmosphere and Oceans',
          'Biodiversity and Conservation',
          'India: Location, Physiography & Drainage',
          'Climate of India and Monsoons',
          'Natural Vegetation and Soils of India',
          'Natural Hazards and Disasters'
        ]
      },
      {
        id: 'psychology',
        name: 'Psychology',
        stream: 'Humanities',
        icon: '🧠',
        color: '#a855f7',
        chapters: [
          'What is Psychology?',
          'Methods of Psychological Enquiry',
          'The Bases of Human Behaviour (Biological & Cultural)',
          'Human Development',
          'Sensory, Attentional and Perceptual Processes',
          'Learning (Classical & Operant Conditioning)',
          'Human Memory (Sensory, Short-Term, Long-Term)',
          'Thinking and Problem Solving',
          'Motivation and Emotion'
        ]
      },
      {
        id: 'sociology',
        name: 'Sociology (Introducing Society)',
        stream: 'Humanities',
        icon: '👥',
        color: '#14b8a6',
        chapters: [
          'Sociology and Society',
          'Terms, Concepts and their Use in Sociology',
          'Understanding Social Institutions (Family, Marriage, Kinship)',
          'Culture and Socialisation',
          'Doing Sociology: Research Methods',
          'Social Structure, Stratification and Processes in Society',
          'Social Change and Social Order in Rural and Urban Society',
          'Environment and Society',
          'Introducing Western Sociologists (Marx, Weber, Durkheim)',
          'Indian Sociologists (Ghurye, Srinivas, Mukherjee)'
        ]
      },
      // Science Stream
      {
        id: 'physics',
        name: 'Physics',
        stream: 'Science',
        icon: '⚛️',
        color: '#3b82f6',
        chapters: [
          'Units and Measurements',
          'Motion in a Straight Line',
          'Motion in a Plane',
          'Laws of Motion',
          'Work, Energy and Power',
          'System of Particles and Rotational Motion',
          'Gravitation',
          'Mechanical Properties of Solids',
          'Mechanical Properties of Fluids',
          'Thermal Properties of Matter',
          'Thermodynamics',
          'Kinetic Theory',
          'Oscillations',
          'Waves'
        ]
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        stream: 'Science',
        icon: '⚗️',
        color: '#10b981',
        chapters: [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'Classification of Elements and Periodicity in Properties',
          'Chemical Bonding and Molecular Structure',
          'Thermodynamics (Chemical Energetics)',
          'Equilibrium (Chemical & Ionic)',
          'Redox Reactions',
          'Organic Chemistry: Some Basic Principles & Techniques',
          'Hydrocarbons'
        ]
      },
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'Science',
        icon: '📐',
        color: '#f59e0b',
        chapters: [
          'Sets',
          'Relations and Functions',
          'Trigonometric Functions',
          'Complex Numbers and Quadratic Equations',
          'Linear Inequalities',
          'Permutations and Combinations',
          'Binomial Theorem',
          'Sequences and Series',
          'Straight Lines',
          'Conic Sections',
          'Introduction to Three Dimensional Geometry',
          'Limits and Derivatives',
          'Statistics',
          'Probability'
        ]
      },
      {
        id: 'biology',
        name: 'Biology',
        stream: 'Science',
        icon: '🧬',
        color: '#ec4899',
        chapters: [
          'The Living World',
          'Biological Classification',
          'Plant Kingdom',
          'Animal Kingdom',
          'Morphology of Flowering Plants',
          'Anatomy of Flowering Plants',
          'Structural Organisation in Animals',
          'Cell: The Unit of Life',
          'Biomolecules',
          'Cell Cycle and Cell Division',
          'Photosynthesis in Higher Plants',
          'Respiration in Plants',
          'Plant Growth and Development',
          'Breathing and Exchange of Gases',
          'Body Fluids and Circulation',
          'Excretory Products and their Elimination',
          'Locomotion and Movement',
          'Neural Control and Coordination',
          'Chemical Coordination and Integration'
        ]
      },
      {
        id: 'cs',
        name: 'Computer Science & IP (Python 083/065)',
        stream: 'Science',
        icon: '💻',
        color: '#06b6d4',
        chapters: [
          'Computer System Overview',
          'Data Representation and Boolean Logic',
          'Computational Thinking & Python Basics',
          'Conditional and Looping Constructs',
          'Strings, Lists and Tuples in Python',
          'Dictionaries and Sorting Techniques',
          'Database Concepts and SQL Queries',
          'Society, Law and Ethics, Cyber Safety'
        ]
      }
    ]
  },
  12: {
    grade: 12,
    gradeLabel: 'Class 12 (Board & Entrance Exams)',
    category: 'Senior Secondary',
    subjects: [
      // Commerce Stream
      {
        id: 'accountancy',
        name: 'Accountancy (Company & Partnership)',
        stream: 'Commerce',
        icon: '📊',
        color: '#f59e0b',
        chapters: [
          'Accounting for Partnership: Basic Concepts',
          'Reconstitution of Partnership: Admission of a Partner',
          'Retirement and Death of a Partner',
          'Dissolution of Partnership Firm',
          'Accounting for Share Capital (Issue & Forfeiture)',
          'Issue and Redemption of Debentures',
          'Financial Statements of a Company',
          'Financial Statement Analysis (Tools & Comparative)',
          'Accounting Ratios (Liquidity, Solvency, Activity, Profitability)',
          'Cash Flow Statement (AS-3 Revised)'
        ]
      },
      {
        id: 'business-studies',
        name: 'Business Studies',
        stream: 'Commerce',
        icon: '💼',
        color: '#3b82f6',
        chapters: [
          'Nature and Significance of Management',
          'Principles of Management (Taylor & Fayol)',
          'Business Environment (LPG & Dimensions)',
          'Planning (Types & Process)',
          'Organising (Structure & Delegation)',
          'Staffing (Recruitment & Selection)',
          'Directing (Supervision, Motivation, Leadership, Communication)',
          'Controlling',
          'Financial Management (Decisions & Capital Structure)',
          'Financial Markets (Money Market & Capital Market, SEBI)',
          'Marketing Management (4Ps & Philosophy)',
          'Consumer Protection (CPA 2019 & Redressal)'
        ]
      },
      {
        id: 'economics',
        name: 'Economics (Macro & Indian Economy)',
        stream: 'Commerce',
        icon: '📈',
        color: '#10b981',
        chapters: [
          'National Income and Related Aggregates (GDP, GNP, NNP)',
          'Money and Banking (Credit Creation & Central Bank RBI)',
          'Determination of Income and Employment (AD-AS, Multiplier)',
          'Government Budget and the Economy (Fiscal Deficit & Taxes)',
          'Balance of Payments (BOP & Foreign Exchange Rate)',
          'Indian Economy on the Eve of Independence (1947)',
          'Indian Economy (1950-1990: Five Year Plans)',
          'Economic Reforms Since 1991 (Liberalisation, Privatisation, Globalisation)',
          'Human Capital Formation in India',
          'Rural Development (Credit & Marketing)',
          'Employment: Growth, Informalisation and Other Issues',
          'Environment and Sustainable Development',
          'Comparative Development Experiences of India and Neighbours (China & Pakistan)'
        ]
      },
      // Humanities / SST Stream
      {
        id: 'history',
        name: 'History (Themes in Indian History I, II, III)',
        stream: 'Humanities',
        icon: '🏛️',
        color: '#ec4899',
        chapters: [
          'Bricks, Beads and Bones (Harappan Civilisation)',
          'Kings, Farmers and Towns (Early States & Economies)',
          'Kinship, Caste and Class (Early Societies)',
          'Thinkers, Beliefs and Buildings (Buddhism & Jainism)',
          'Through the Eyes of Travellers (Al-Biruni, Ibn Battuta)',
          'Bhakti-Sufi Traditions (Religious Beliefs & Devotional Texts)',
          'An Imperial Capital: Vijayanagara',
          'Peasants, Zamindars and the State (Agrarian Society & Mughal Empire)',
          'Colonialism and the Countryside (Permanent Settlement)',
          'Rebels and the Raj (1857 Revolt & Representations)',
          'Mahatma Gandhi and the Nationalist Movement (Civil Disobedience)',
          'Framing the Constitution (Beginning of a New Era)'
        ]
      },
      {
        id: 'political-science',
        name: 'Political Science (World Politics & Indian Politics)',
        stream: 'Humanities',
        icon: '⚖️',
        color: '#8b5cf6',
        chapters: [
          'The End of Bipolarity (Disintegration of USSR)',
          'Contemporary Centres of Power (European Union, ASEAN, China, BRICS)',
          'Contemporary South Asia (India, Pakistan, Bangladesh, Sri Lanka)',
          'International Organisations (United Nations & its Agencies)',
          'Security in the Contemporary World (Traditional & Non-Traditional)',
          'Environment and Natural Resources (Global Commons)',
          'Globalisation (Economic, Political, Cultural)',
          'Challenges of Nation-Building (Partition & Integration of States)',
          'Era of One-Party Dominance (Congress System)',
          'Politics of Planned Development (Five Year Plans & Planning Commission)',
          'India’s External Relations (Nehru Foreign Policy, Wars 1962/1965/1971)',
          'Challenges to and Restoration of the Congress System',
          'The Crisis of Democratic Order (Emergency 1975)',
          'Regional Aspirations (Kashmir, Punjab, North-East)',
          'Recent Developments in Indian Politics (Coalitions & NDA/UPA eras)'
        ]
      },
      {
        id: 'geography',
        name: 'Geography (Human Geography & India Economy)',
        stream: 'Humanities',
        icon: '🌍',
        color: '#06b6d4',
        chapters: [
          'Human Geography: Nature and Scope',
          'The World Population: Distribution, Density and Growth',
          'Human Development (HDI & Approaches)',
          'Primary Activities (Hunting, Agriculture, Mining)',
          'Secondary Activities (Manufacturing Industries)',
          'Tertiary and Quaternary Activities (Services & Tourism)',
          'Transport, Communication and Trade',
          'International Trade (Basis & WTO)',
          'India: Population Distribution, Density & Growth',
          'Human Settlements (Rural & Urban)',
          'Land Resources and Agriculture in India',
          'Water Resources of India (Watershed Management)',
          'Mineral and Energy Resources',
          'Planning and Sustainable Development in Indian Context',
          'Geographical Perspective on Selected Issues and Problems'
        ]
      },
      {
        id: 'psychology',
        name: 'Psychology',
        stream: 'Humanities',
        icon: '🧠',
        color: '#a855f7',
        chapters: [
          'Variations in Psychological Attributes (Intelligence, IQ, PASS Model)',
          'Self and Personality (Trait, Type, Psychodynamic Theories)',
          'Meeting Life Challenges (Stress Management & Coping Strategies)',
          'Psychological Disorders (Anxiety, Mood, Schizophrenia, OCD)',
          'Therapeutic Approaches (Psychodynamic, Behavioural, Cognitive CBT)',
          'Attitude and Social Cognition (Prejudice, Stereotypes, Impression Formation)',
          'Social Influence and Group Processes (Conformity, Compliance, Obedience)'
        ]
      },
      {
        id: 'sociology',
        name: 'Sociology (Indian Society & Social Change)',
        stream: 'Humanities',
        icon: '👥',
        color: '#14b8a6',
        chapters: [
          'The Demographic Structure of the Indian Society',
          'Social Institutions: Continuity and Change (Caste, Tribe, Family)',
          'Patterns of Social Inequality and Exclusion (Dalits, Tribals, Women)',
          'The Challenges of Cultural Diversity (Minorities, Secularism, Communalism)',
          'Structural Change (Colonialism, Industrialisation, Urbanisation)',
          'Cultural Change (Sanskritisation, Modernisation, Westernisation)',
          'The Story of Indian Democracy (Panchayati Raj, Constitution)',
          'Change and Development in Rural Society (Green Revolution)',
          'Change and Development in Industrial Society',
          'Social Movements (Peasant, Workers, Tribal, Women, Environmental Movements)'
        ]
      },
      // Science Stream
      {
        id: 'physics',
        name: 'Physics',
        stream: 'Science',
        icon: '⚛️',
        color: '#3b82f6',
        chapters: [
          'Electric Charges and Fields',
          'Electrostatic Potential and Capacitance',
          'Current Electricity',
          'Moving Charges and Magnetism',
          'Magnetism and Matter',
          'Electromagnetic Induction (EMI)',
          'Alternating Current (AC)',
          'Electromagnetic Waves (EM Waves)',
          'Ray Optics and Optical Instruments',
          'Wave Optics',
          'Dual Nature of Radiation and Matter',
          'Atoms',
          'Nuclei',
          'Semiconductor Electronics: Materials, Devices and Simple Circuits'
        ]
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        stream: 'Science',
        icon: '⚗️',
        color: '#10b981',
        chapters: [
          'Solutions',
          'Electrochemistry',
          'Chemical Kinetics',
          'The d- and f-Block Elements',
          'Coordination Compounds',
          'Haloalkanes and Haloarenes',
          'Alcohols, Phenols and Ethers',
          'Aldehydes, Ketones and Carboxylic Acids',
          'Amines (Organic Compounds Containing Nitrogen)',
          'Biomolecules'
        ]
      },
      {
        id: 'math',
        name: 'Mathematics',
        stream: 'Science',
        icon: '📐',
        color: '#f59e0b',
        chapters: [
          'Relations and Functions',
          'Inverse Trigonometric Functions',
          'Matrices',
          'Determinants',
          'Continuity and Differentiability',
          'Application of Derivatives (AOD)',
          'Integrals (Indefinite & Definite)',
          'Application of Integrals (Area Under Curve)',
          'Differential Equations',
          'Vector Algebra',
          'Three Dimensional Geometry (3D Geometry)',
          'Linear Programming Problems (LPP)',
          'Probability (Bayes Theorem & Distributions)'
        ]
      },
      {
        id: 'biology',
        name: 'Biology',
        stream: 'Science',
        icon: '🧬',
        color: '#ec4899',
        chapters: [
          'Sexual Reproduction in Flowering Plants',
          'Human Reproduction',
          'Reproductive Health',
          'Principles of Inheritance and Variation',
          'Molecular Basis of Inheritance',
          'Evolution',
          'Human Health and Disease',
          'Microbes in Human Welfare',
          'Biotechnology: Principles and Processes',
          'Biotechnology and its Applications',
          'Organisms and Populations',
          'Ecosystem',
          'Biodiversity and Conservation'
        ]
      },
      {
        id: 'cs',
        name: 'Computer Science & IP (Python 083/065)',
        stream: 'Science',
        icon: '💻',
        color: '#06b6d4',
        chapters: [
          'Python Revision Tour & Functions',
          'File Handling (Text, Binary, CSV)',
          'Using Python Libraries',
          'Data Structures: Linear Lists, Stacks & Queues',
          'Computer Networks (Topologies, Protocols, Web)',
          'Database Management Systems (SQL Queries & Joins)',
          'Interface Python with MySQL'
        ]
      }
    ]
  }
};
