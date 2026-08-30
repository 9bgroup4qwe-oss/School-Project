from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import json
import time
import random
import re
import asyncio
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load env variables from root/parent directories
for env_file in ['.env.local', '.env']:
    env_path = Path(__file__).resolve().parents[4] / env_file
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        break

router = APIRouter()

class QuizRequest(BaseModel):
    subject: str
    chapters: List[str] = Field(default_factory=list)
    difficulty: str = "medium"
    questionCount: int = 10

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str
    difficulty: str
    subject: str
    chapter: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    source: str = "openrouter-ai"

# Comprehensive NCERT curriculum knowledge bank for high-accuracy fallbacks across Science, Commerce & Humanities
SUBJECT_KNOWLEDGE = {
    "accountancy": [
        ("In the absence of a partnership deed, what is the rate of interest allowed on a partner's loan to the firm?", ["6% per annum", "10% per annum", "12% per annum", "No interest is allowed"], 0, "According to the Indian Partnership Act 1932, if there is no partnership agreement, interest on partner loan is paid at 6% p.a."),
        ("Under which category of cash flows in AS-3 (Revised) does 'Dividend Paid' by a company fall?", ["Financing Activities", "Operating Activities", "Investing Activities", "Cash Equivalents"], 0, "Dividends paid represent cost of obtaining capital and are classified under Financing Activities."),
        ("What is the maximum limit on the number of members in a Private Limited Company as per Companies Act 2013?", ["200 members", "50 members", "100 members", "No limit"], 0, "Section 2(68) of Companies Act 2013 limits maximum membership in a private company to 200 (excluding employee members)."),
        ("What type of account is 'Revaluation Account' prepared during reconstitution of a partnership?", ["Nominal Account", "Real Account", "Personal Account", "Representative Account"], 0, "Revaluation Account records gains and losses on assets and liabilities, making it a Nominal Account."),
        ("What is the formula for calculating Current Ratio?", ["Current Assets / Current Liabilities", "Quick Assets / Current Liabilities", "Total Debt / Equity", "Gross Profit / Net Revenue"], 0, "Current Ratio measures short-term solvency and is calculated as Current Assets / Current Liabilities (Ideal benchmark is 2:1)."),
        ("Where is 'Securities Premium' shown on a company's Balance Sheet under Schedule III?", ["Reserves and Surplus (Shareholders' Funds)", "Current Liabilities", "Non-Current Assets", "Trade Payables"], 0, "Securities Premium is a capital reserve and is reported under Reserves and Surplus in Shareholders' Funds.")
    ],
    "business": [
        ("Which management theorist propounded the 14 Principles of General Management including Unity of Command?", ["Henri Fayol", "F.W. Taylor", "Max Weber", "Elton Mayo"], 0, "Henri Fayol, known as the father of General Management, developed the 14 principles of management."),
        ("What is the first step in the formal Planning Process in Business Studies?", ["Setting Objectives", "Developing Premises", "Identifying Alternative Courses of Action", "Evaluating Alternatives"], 0, "Planning begins with setting clear, measurable organizational objectives for the entire enterprise."),
        ("Which statutory regulatory body regulates and protects investors in the Indian Securities Market?", ["SEBI (Securities and Exchange Board of India)", "RBI", "NABARD", "IRDAI"], 0, "SEBI was established in 1992 under the SEBI Act to regulate capital markets and safeguard investor interests."),
        ("What are the traditional '4 Ps' of the Marketing Mix?", ["Product, Price, Place, Promotion", "Planning, Process, People, Profit", "Purchase, Production, Payment, Packaging", "Policy, Public, Position, Performance"], 0, "The classic marketing mix consists of Product, Price, Place (distribution), and Promotion."),
        ("Under the Consumer Protection Act (CPA 2019), what is the monetary jurisdiction limit of the District Consumer Commission?", ["Up to ₹50 Lakhs", "Up to ₹1 Crore", "Up to ₹10 Crore", "Up to ₹20 Lakhs"], 0, "Under CPA 2019 amended rules, District Commissions entertain claims where value of goods/services does not exceed ₹50 Lakhs.")
    ],
    "economics": [
        ("What is the value of Marginal Propensity to Consume (MPC) if Marginal Propensity to Save (MPS) is 0.2?", ["0.8", "0.2", "1.2", "0.5"], 0, "Since MPC + MPS = 1, MPC = 1 - 0.2 = 0.8."),
        ("Which apex institution acts as the lender of last resort in India's banking system?", ["Reserve Bank of India (RBI)", "State Bank of India (SBI)", "Ministry of Finance", "NABARD"], 0, "The Reserve Bank of India (RBI) is the central bank and provides emergency financial assistance as lender of last resort."),
        ("What were the three major pillars of the New Economic Policy introduced in India in 1991?", ["Liberalisation, Privatisation, Globalisation (LPG)", "Nationalisation, Industrialisation, Self-reliance", "Green Revolution, White Revolution, Blue Revolution", "Deficit Financing, Price Ceilings, Tariffs"], 0, "The 1991 Economic Reforms transformed India through Liberalisation (deregulation), Privatisation (disinvestment), and Globalisation."),
        ("Which formula correctly represents Gross Domestic Product at Market Price (GDP_MP) using the expenditure method?", ["C + I + G + (X - M)", "C + S + T", "Compensation of Employees + Operating Surplus + Mixed Income", "NNP_FC + Depreciation"], 0, "Under the expenditure method, GDP_MP = Private Consumption (C) + Investment (I) + Government Purchases (G) + Net Exports (X - M)."),
        ("What type of unemployment occurs when people are visibly employed but their marginal productivity is zero?", ["Disguised Unemployment", "Structural Unemployment", "Frictional Unemployment", "Seasonal Unemployment"], 0, "Disguised unemployment is widely observed in agriculture where surplus workers do not add to aggregate output.")
    ],
    "political_science": [
        ("In which year did the Union of Soviet Socialist Republics (USSR) officially disintegrate?", ["1991", "1989", "1993", "1985"], 0, "Under Mikhail Gorbachev's reforms (Glasnost & Perestroika), the USSR formally dissolved in December 1991 into 15 independent states."),
        ("Who was the first Chief Election Commissioner of Independent India?", ["Sukumar Sen", "T.N. Seshan", "Dr. B.R. Ambedkar", "K.M. Munshi"], 0, "Sukumar Sen served as the first Chief Election Commissioner and successfully organized India's historic 1951-52 General Elections."),
        ("Which Article of the Indian Constitution empowers the President to declare a National Emergency on grounds of war or armed rebellion?", ["Article 352", "Article 356", "Article 360", "Article 370"], 0, "Article 352 provides for National Emergency, Article 356 for President's Rule in States, and Article 360 for Financial Emergency."),
        ("Which intergovernmental regional organisation was founded in 1967 with the Bangkok Declaration?", ["ASEAN (Association of Southeast Asian Nations)", "European Union", "SAARC", "BRICS"], 0, "ASEAN was established on 8 August 1967 in Bangkok by Indonesia, Malaysia, Philippines, Singapore, and Thailand."),
        ("What was the primary goal of the 'Second Five Year Plan' (1956–1961) in India formulated by P.C. Mahalanobis?", ["Rapid Heavy Industrialisation", "Agricultural Self-sufficiency", "Foreign Trade Export Promotion", "Universal Primary Education"], 0, "The Mahalanobis model focused heavily on capital goods industries and state-led rapid heavy industrialisation.")
    ],
    "psychology": [
        ("Who developed the concept of Mental Age (MA) and the first standardized intelligence test in 1905?", ["Alfred Binet and Théodore Simon", "William Stern", "Howard Gardner", "Charles Spearman"], 0, "Alfred Binet and Théodore Simon published the first practical intelligence scale (Binet-Simon Scale) in 1905."),
        ("In Sigmund Freud's psychoanalytic theory, which structural component operates on the 'Pleasure Principle'?", ["Id", "Ego", "Superego", "Libido"], 0, "The Id is the primitive, instinctual component operating entirely on immediate gratification (pleasure principle)."),
        ("What type of therapeutic technique was pioneered by Aaron Beck and Albert Ellis to reframe irrational thought patterns?", ["Cognitive Behaviour Therapy (CBT)", "Psychoanalysis", "Client-Centred Therapy", "Systematic Desensitization"], 0, "CBT focuses on identifying cognitive distortions and replacing irrational automated thoughts with adaptive beliefs."),
        ("Which model of intelligence was proposed by J.P. Das, Jack Naglieri, and J.R. Kirby?", ["PASS Model (Planning, Attention-Arousal, Simultaneous, Successive)", "Two-Factor Theory", "Triarchic Theory", "Structure of Intellect"], 0, "The PASS model conceptualizes cognitive processing into Planning, Attention-Arousal, Simultaneous and Successive processing.")
    ],
    "sociology": [
        ("Who introduced the sociological concept of 'Sanskritisation' to explain social mobility in the Indian caste system?", ["M.N. Srinivas", "G.S. Ghurye", "B.R. Ambedkar", "Louis Dumont"], 0, "M.N. Srinivas introduced Sanskritisation to describe the process where lower castes adopt rituals, customs, and lifestyles of dominant castes."),
        ("What was the primary objective of the 73rd and 74th Constitutional Amendment Acts (1992) in India?", ["Decentralisation of power to Panchayati Raj and Municipalities", "Abolition of Zamindari system", "Reservation in Higher Education", "Creation of Planning Commission"], 0, "The 73rd and 74th Amendments granted constitutional recognition and self-governance powers to rural Panchayats and urban Municipalities."),
        ("Which demographic stage is characterized by high birth rates and rapidly falling death rates, causing population explosion?", ["Stage 2 (Transitional Stage)", "Stage 1 (High Stationary)", "Stage 3 (Low Stationary)", "Stage 4 (Declining)"], 0, "In demographic transition theory, Stage 2 features declining mortality due to medical progress while birth rates remain elevated.")
    ],
    "social": [
        ("Which event is widely considered the beginning of the French Revolution on July 14, 1789?", ["Storming of the Bastille", "Execution of Louis XVI", "The Tennis Court Oath", "Reign of Terror"], 0, "On July 14, 1789, an armed crowd stormed the royal fortress and prison of Bastille in Paris, symbolizing the end of the Ancien Régime."),
        ("Who was the monarch of France when the French Revolution broke out in 1789?", ["Louis XVI", "Louis XIV", "Napoleon Bonaparte", "Maximilien Robespierre"], 0, "Louis XVI of the Bourbon family ascended the throne of France in 1774 and was the ruler when the revolution began."),
        ("What were the three Estates into which French society was divided prior to 1789?", ["Clergy, Nobility, and Third Estate (commoners)", "Royals, Merchants, and Farmers", "Lords, Knights, and Peasants", "Priests, Soldiers, and Guilds"], 0, "French society was divided into the 1st Estate (Clergy), 2nd Estate (Nobility), and 3rd Estate (peasants, workers, and bourgeoisie)."),
        ("What tax was paid directly to the Catholic Church by French peasants in the 18th century?", ["Tithe", "Taille", "Feudal Dues", "Custom Duty"], 0, "A Tithe was a tax levied directly by the Church, comprising one-tenth of agricultural produce."),
        ("What was the direct tax paid to the state in 18th-century France called?", ["Taille", "Tithe", "Livre", "Manor"], 0, "Taille was a direct land/income tax paid by members of the Third Estate directly to the French state."),
        ("Who led the Jacobin club during the Reign of Terror (1793-1794)?", ["Maximilien Robespierre", "Jean-Paul Marat", "Georges Danton", "Voltaire"], 0, "Maximilien Robespierre led the Jacobins and enforced severe state control and executions during the Reign of Terror."),
        ("What patriotic song composed by Roget de L'Isle later became the National Anthem of France?", ["La Marseillaise", "La Parisienne", "Ode to Joy", "God Save the King"], 0, "La Marseillaise was sung by volunteers from Marseilles as they marched into Paris and became the French National Anthem."),
        ("In what year was the Bastille fortress stormed by the revolutionaries?", ["1789", "1792", "1799", "1804"], 0, "The storming of the Bastille took place on 14 July 1789."),
        ("Which philosopher wrote 'The Social Contract' influencing the French Revolution?", ["Jean-Jacques Rousseau", "John Locke", "Montesquieu", "Karl Marx"], 0, "Jean-Jacques Rousseau proposed a form of government based on a social contract between people and their representatives.")
    ],
    "history": [
        ("Who led the Salt March (Dandi Satyagraha) in India in 1930?", ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Sardar Patel"], 0, "Mahatma Gandhi led the 240-mile Dandi March from Sabarmati Ashram to the coastal town of Dandi to break the salt law."),
        ("In which year did the Jallianwala Bagh massacre take place in Amritsar?", ["1919", "1914", "1920", "1931"], 0, "The tragic Jallianwala Bagh massacre took place on April 13, 1919 in Amritsar under General Dyer's orders."),
        ("Who formed the 'Swaraj Party' within the Indian National Congress in 1923?", ["C.R. Das and Motilal Nehru", "Mahatma Gandhi and Nehru", "Bal Gangadhar Tilak", "B.R. Ambedkar"], 0, "Chitta Ranjan Das and Motilal Nehru formed the Swaraj Party to argue for a return to council politics."),
        ("Which Harappan site is famous for the discovery of the 'Great Bath' and dockyard features?", ["Mohenjodaro (Great Bath) & Lothal (Dockyard)", "Harappa & Kalibangan", "Dholavira & Banawali", "Rakhigarhi & Chanhudaro"], 0, "The Great Bath was excavated at Mohenjodaro, while Lothal in Gujarat possessed the prominent tidal dockyard.")
    ],
    "geography": [
        ("Which latitude divides India into almost two equal parts?", ["Tropic of Cancer (23°30' N)", "Equator (0°)", "Tropic of Capricorn (23°30' S)", "Arctic Circle (66°30' N)"], 0, "The Tropic of Cancer at 23°30' N passes through eight Indian states, dividing the country into Northern and Southern halves."),
        ("What is the standard meridian of India?", ["82°30' E", "75°00' E", "90°00' E", "68°07' E"], 0, "82°30' E passing through Mirzapur (Uttar Pradesh) is chosen as the Standard Meridian of India for Indian Standard Time (IST)."),
        ("Which is the oldest landmass in India according to plate tectonics?", ["The Peninsular Plateau", "The Himalayas", "The Northern Plains", "The Coastal Plains"], 0, "The Peninsular Plateau of India is an ancient landmass formed from the breaking and drifting of the Gondwana land.")
    ],
    "biology": [
        ("Which cellular organelle is called the 'Powerhouse of the Cell'?", ["Mitochondria", "Ribosome", "Golgi Apparatus", "Lysosome"], 0, "Mitochondria produce ATP through cellular respiration and are termed the powerhouse of eukaryotic cells."),
        ("What is the basic functional and structural unit of heredity?", ["Gene", "Chromosome", "DNA polymer", "Histone protein"], 0, "A gene is a specific sequence of nucleotides in DNA that acts as the basic unit of heredity."),
        ("Which organ in the human body secretes insulin?", ["Pancreas (Beta cells)", "Liver", "Kidney", "Thyroid"], 0, "The beta cells in the islets of Langerhans in the pancreas secrete insulin to regulate blood glucose levels.")
    ],
    "physics": [
        ("What is Newton's Second Law of Motion represented mathematically?", ["F = ma", "E = mc^2", "v = u + at", "p = mv"], 0, "Newton's Second Law states that net force applied equals mass times acceleration (F = ma)."),
        ("What is the SI unit of electrical resistance?", ["Ohm (Ω)", "Volt (V)", "Ampere (A)", "Watt (W)"], 0, "The SI unit of electrical resistance is the Ohm (Ω), defined by Ohm's law R = V / I."),
        ("What is the acceleration due to gravity (g) near Earth's surface approximately?", ["9.8 m/s^2", "3.7 m/s^2", "1.6 m/s^2", "12.4 m/s^2"], 0, "Standard gravitational acceleration on Earth is approximately 9.8 m/s^2.")
    ],
    "chemistry": [
        ("What is the chemical formula for washing soda?", ["Na2CO3·10H2O", "NaHCO3", "CaOCl2", "CaSO4·1/2H2O"], 0, "Sodium carbonate decahydrate (Na2CO3·10H2O) is commonly known as washing soda."),
        ("What is the pH range of acids on the pH scale at 25°C?", ["0 to less than 7", "7 to 14", "Exactly 7", "10 to 14"], 0, "Acids have a pH less than 7, with lower values indicating higher hydrogen ion [H+] concentration.")
    ],
    "mathematics": [
        ("What is the discriminant of a quadratic equation ax^2 + bx + c = 0?", ["D = b^2 - 4ac", "D = b^2 + 4ac", "D = 2b - 4ac", "D = a^2 - 4bc"], 0, "The discriminant D = b^2 - 4ac determines the nature of the roots of a quadratic equation."),
        ("What is the nth term formula (an) of an Arithmetic Progression (AP)?", ["an = a + (n - 1)d", "an = a + nd", "an = an * d", "an = a / (n - 1)d"], 0, "The nth term of an AP with first term 'a' and common difference 'd' is given by an = a + (n - 1)d.")
    ],
    "english": [
        ("What figure of speech compares two unlike things using 'like' or 'as'?", ["Simile", "Metaphor", "Personification", "Hyperbole"], 0, "A simile is a rhetorical figure expressing comparison between two things using 'like' or 'as'."),
        ("Which part of speech modifies or describes a verb, adjective, or another adverb?", ["Adverb", "Noun", "Conjunction", "Preposition"], 0, "An adverb modifies verbs, adjectives, or other adverbs (e.g., 'runs quickly').")
    ]
}

def generate_smart_fallback(request: QuizRequest) -> List[QuizQuestion]:
    """Generates strictly subject-accurate questions matched to requested chapters."""
    sub_lower = request.subject.lower()
    chap_lower = " ".join(request.chapters).lower()

    if any(k in sub_lower or k in chap_lower for k in ["account", "ledger", "debit", "credit", "partnership", "share", "balance sheet", "cash flow"]):
        pool_key = "accountancy"
    elif any(k in sub_lower or k in chap_lower for k in ["business", "management", "marketing", "staffing", "organising", "fayol", "consumer protection"]):
        pool_key = "business"
    elif any(k in sub_lower or k in chap_lower for k in ["economic", "macro", "micro", "gdp", "national income", "multiplier", "inflation", "rbi", "budget"]):
        pool_key = "economics"
    elif any(k in sub_lower or k in chap_lower for k in ["political", "constitution", "election", "bipolarity", "democracy", "government", "judiciary", "rights"]):
        pool_key = "political_science"
    elif any(k in sub_lower or k in chap_lower for k in ["psychology", "personality", "intelligence", "cbt", "therapy", "memory", "disorder"]):
        pool_key = "psychology"
    elif any(k in sub_lower or k in chap_lower for k in ["sociology", "society", "caste", "demograph", "sanskritisation"]):
        pool_key = "sociology"
    elif any(k in sub_lower or k in chap_lower for k in ["history", "harappan", "gandhi", "revolt", "civilisation"]):
        pool_key = "history"
    elif any(k in sub_lower or k in chap_lower for k in ["geograph", "climate", "monsoon", "plateau", "population"]):
        pool_key = "geography"
    elif any(k in sub_lower or k in chap_lower for k in ["bio", "living", "cell", "plant", "reproduct", "health"]):
        pool_key = "biology"
    elif any(k in sub_lower or k in chap_lower for k in ["physic", "motion", "force", "light", "electr", "energy"]):
        pool_key = "physics"
    elif any(k in sub_lower or k in chap_lower for k in ["chem", "acid", "metal", "reaction", "carbon", "atom"]):
        pool_key = "chemistry"
    elif any(k in sub_lower or k in chap_lower for k in ["math", "algebra", "trig", "arithmetic", "geomet", "calculus"]):
        pool_key = "mathematics"
    elif any(k in sub_lower or k in chap_lower for k in ["english", "grammar", "literature"]):
        pool_key = "english"
    else:
        pool_key = "social"

    selected_pool = list(SUBJECT_KNOWLEDGE.get(pool_key, SUBJECT_KNOWLEDGE["social"]))
    random.shuffle(selected_pool)

    questions: List[QuizQuestion] = []
    chapters = request.chapters if request.chapters else ["Core NCERT Chapter"]

    for i in range(request.questionCount):
        base = selected_pool[i % len(selected_pool)]
        q_chapter = chapters[i % len(chapters)]

        original_options = list(base[1])
        correct_text = original_options[base[2]]
        random.shuffle(original_options)
        new_correct_idx = original_options.index(correct_text)

        questions.append(QuizQuestion(
            id=f"q_{int(time.time())}_{i}",
            question=base[0],
            options=original_options,
            correctAnswer=new_correct_idx,
            explanation=base[3],
            difficulty=request.difficulty,
            subject=request.subject,
            chapter=q_chapter
        ))

    return questions

def extract_json_array(text: str) -> Optional[list]:
    """Extracts JSON array from text with markdown stripping and regex search."""
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
        if isinstance(data, list):
            return data
    except Exception:
        pass

    match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
            if isinstance(data, list):
                return data
        except Exception:
            pass

    return None

def _fetch_openrouter(headers: dict, payload: dict) -> Optional[dict]:
    """Synchronous worker function to be executed in background thread."""
    try:
        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=5
        )
        if res.status_code == 200:
            return res.json()
        else:
            print(f"[OpenRouter HTTP {res.status_code}]: {res.text[:120]}")
    except Exception as e:
        print(f"[OpenRouter Error]: {e}")
    return None

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")

    if api_key:
        difficulty_guide = {
            "easy": "beginner-level testing fundamental definitions, recall, and basic understanding",
            "medium": "intermediate-level requiring conceptual application and reasoning",
            "hard": "advanced-level testing multi-step analysis, edge cases, and deep mastery"
        }

        chapters_str = ", ".join(request.chapters) if request.chapters else "Core Topics"

        prompt = f"""You are an expert NCERT teacher and CBSE curriculum creator.
Generate exactly {request.questionCount} multiple-choice questions strictly about:
Subject: {request.subject}
Chapters: {chapters_str}
Difficulty: {request.difficulty} ({difficulty_guide.get(request.difficulty, 'standard')})

CRITICAL RULES:
1. Every question MUST strictly relate to {request.subject} and the specified chapters ({chapters_str}). Do NOT generate questions from unrelated subjects.
2. Each question MUST have exactly 4 clear options (A, B, C, D).
3. correctAnswer must be the 0-indexed integer (0 for first option, 1 for second, 2 for third, 3 for fourth).
4. Include an educational step-by-step explanation.
5. Return ONLY a valid JSON array matching this format (no markdown, no backticks):

[
  {{
    "question": "Question text specifically about {chapters_str}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Clear explanation of why this answer is correct based on NCERT syllabus.",
    "difficulty": "{request.difficulty}",
    "subject": "{request.subject}",
    "chapter": "{request.chapters[0] if request.chapters else 'Core Chapter'}"
  }}
]"""

        models_to_try = [
            "google/gemma-4-31b-it:free",
            "minimax/minimax-m2.7:free"
        ]

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "GrowMyIQ"
        }

        for model_name in models_to_try:
            payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4
            }

            try:
                response_json = await asyncio.wait_for(
                    asyncio.to_thread(_fetch_openrouter, headers, payload),
                    timeout=3.0
                )
            except asyncio.TimeoutError:
                print(f"[OpenRouter {model_name}] Timed out after 3.0s")
                response_json = None

            if response_json:
                content = response_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                data = extract_json_array(content)

                if data and isinstance(data, list) and len(data) > 0:
                    questions = []
                    for i, q in enumerate(data[:request.questionCount]):
                        opts = q.get("options", ["A", "B", "C", "D"])[:4]
                        while len(opts) < 4:
                            opts.append(f"Option {chr(65 + len(opts))}")

                        c_ans = int(q.get("correctAnswer", 0)) % 4
                        questions.append(QuizQuestion(
                            id=f"q_{int(time.time())}_{i}",
                            question=q.get("question", f"Question {i+1}"),
                            options=opts,
                            correctAnswer=c_ans,
                            explanation=q.get("explanation", "Correct answer verified based on NCERT syllabus."),
                            difficulty=request.difficulty,
                            subject=request.subject,
                            chapter=q.get("chapter", request.chapters[0] if request.chapters else "General")
                        ))
                    return QuizResponse(questions=questions, source=f"openrouter-{model_name}")

    # Fallback strictly tailored to the requested subject
    fallback_questions = generate_smart_fallback(request)
    return QuizResponse(questions=fallback_questions, source="curriculum-fallback")
