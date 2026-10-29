# Code Review — `9bgroup4qwe-oss/School-Project`

**Reviewed:** commit `cb8afe3` (main) · 221 files · ~18.6k lines TS/JS/Python
**Stack:** Next.js 15.5.4 (App Router, `src/`) · React 19 · Tailwind v4 · Supabase · FastAPI · Gemini/OpenRouter

Everything below was **verified by running the code**, not just read. Commands used:
`npm install` → `npx tsc --noEmit` → `npx next build` → `npx next lint` → `python3 -m py_compile` → import/dependency audit → dead-code reachability graph → JWT decode → DNS probe.

---

## Verdict

The repo does not build, the backend does not import, the AI features cannot work, and a
Supabase **`service_role` master key is committed to a public repository**. Four of these are
independently fatal on their own.

| Check | Result |
|---|---|
| `npm install` | ✅ 722 packages |
| `npx tsc --noEmit` | ❌ **83 errors** |
| `npx next build` | ❌ **fails** — prerender crash on `/auth` |
| `npx next lint` | ❌ 8 errors, 8 warnings |
| Python backend imports | ❌ **`ModuleNotFoundError: requests`** |
| Tests | ❌ none exist |
| CI gate (build/lint/typecheck) | ❌ none — only 2 AI-review bots |

---

## 🔴 CRITICAL

### 1. Supabase `service_role` secret key committed to a public repo
`scripts/run-migration.js:8`
```js
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIs...';
```
Decoded payload: `{"iss":"supabase","ref":"ibmdiynievtxkucgrkun","role":"service_role","exp":2075910539}`
→ **valid until 13 Oct 2035.**

`service_role` **bypasses every Row Level Security policy** the team wrote. Anyone holding it can
read, modify and delete every row of every table — all users' quiz history, answers and timetables.

Also committed:
- `scripts/setup-supabase.js:5` and `scripts/verify-migration.js:5` — hardcoded **anon** key (same project, same 2035 expiry)
- Project ref `ibmdiynievtxkucgrkun` in 4 scripts + `SUPABASE_SETUP.md` + migration headers

**Mitigating fact I verified:** `ibmdiynievtxkucgrkun.supabase.co` currently returns **no DNS record**
(`supabase.co` itself resolves fine, so this isn't a sandbox network block). The project is likely
paused or deleted, so the exposure may be dormant *today*. It is still live for anyone who cloned
earlier, and it re-arms the moment the project is resumed.

**Fix:** rotate both keys in the Supabase dashboard → read from `process.env` with a hard failure
instead of a `||` fallback → purge from history with `git filter-repo` (a normal follow-up commit
does **not** remove it; it stays in all 10 commits).

### 2. The production build fails
```
Error occurred prerendering page "/auth"
Error: @supabase/ssr Your project's URL and API key are required to create a Supabase client!
Export encountered an error on /auth/page: /auth, exiting the build.
```
`src/app/auth/page.tsx:22` calls `createClient()` during render with `process.env...!`
non-null assertions and no guard. At build time there are no env vars, so prerendering throws and
the whole build aborts. **This repo cannot be deployed as-is.**

**Fix:** guard client creation, and/or `export const dynamic = 'force-dynamic'`.

### 3. 83 TypeScript errors, all deliberately hidden
`next.config.js`:
```js
typescript: { ignoreBuildErrors: true },
eslint:     { ignoreDuringBuilds: true },
```
Build output confirms: `Skipping validation of types` / `Skipping linting`. These two flags are why
nobody noticed #2, #4, #6, #7 or #15. Real errors include:

| Error | Meaning |
|---|---|
| `src/lib/supabase/middleware.ts:19` TS2345 | 3-element tuple — **the actual cookie bug, see #7** |
| `src/app/auth/page.tsx:94` TS2322 | `expiresIn` isn't a valid Supabase option — **see #27** |
| `quiz/history` + `quiz/mistakes` TS2802 ×4 | `Set` spread needs `target ≥ es2015` — **see #25** |
| `api/timetable/*` TS2339 ×16 | reading `.message/.code/.hint` off `{}` |
| `QuizStatistics.tsx` TS18047 ×7 | `'stats' is possibly null` — will throw at runtime |
| `TimetableWithAI.tsx` TS2345 | two **different** `TimetableData` types colliding |
| `InteractiveTimetableEditor.tsx` TS2740 | assigning `{}` where `TimetableSlot[]` required |

**Fix:** delete both flags, fix the 83 errors, add `tsc --noEmit` to CI so they can't come back.

### 4. The AI features cannot work — two independent reasons

**(a) `gemini-2.0-flash-exp` was shut down by Google on 1 June 2026.**
Google's own model page lists `gemini-2.0-flash-exp` as *"Shut down"*. Still used at:
- `src/app/api/ai/timetable/simple/route.ts:26`
- `src/app/api/ai/parse-syllabus/route.ts:152`

Every call 404s. `parse-syllabus` silently degrades to mock data (`route.ts:129,146`), so it *looks*
like it's working while returning fixtures.

**(b) The Python backend times out before the model can answer.**
`backend/app/api/endpoints/quiz.py:296-300`
```python
response_json = await asyncio.wait_for(
    asyncio.to_thread(_fetch_openrouter, headers, payload),
    timeout=3.0          # ← 3 seconds
)
```
A 31B model generating 10 MCQs *with step-by-step explanations* needs 15–40s. The 3s budget always
expires, for **both** models in `models_to_try`, so control always reaches:
```python
fallback_questions = generate_smart_fallback(request)
return QuizResponse(questions=fallback_questions, source="curriculum-fallback")
```
The "AI quiz generator" serves the same hardcoded question bank every time. Note the inner
`requests.post(..., timeout=5)` at `quiz.py:229` is *longer* than the outer 3s, so the outer
`wait_for` always fires first and the inner timeout is unreachable.

**Fix:** raise to 30–60s (and make it configurable), migrate `gemini-2.0-flash-exp` →
`gemini-3.5-flash`/`gemini-3.8-flash`, and swap `@google/generative-ai` → `@google/genai`
(legacy SDK lost support 2025-11-30). Surface `source` in the UI so a fallback is visible.

*(For the record: `google/gemma-4-31b-it:free` **is** a valid current OpenRouter model — that one
is fine.)*

### 5. The Python backend cannot start
Both endpoint modules do `import requests` (`quiz.py:12`, `timetable.py`), but
`backend/requirements.txt` is:
```
fastapi, uvicorn, google-generativeai, python-dotenv, pydantic, pdfplumber, pillow, python-multipart
```
**No `requests`.** A clean `pip install -r backend/requirements.txt && uvicorn app.main:app` dies
with `ModuleNotFoundError`. Meanwhile `google-generativeai` *is* declared but **never imported
anywhere** — a dead dependency, and Google's deprecated package to boot.

**Fix:** add `requests`, drop `google-generativeai`, and pin every version (see #22).

---

## 🟠 HIGH

### 6. `middleware.ts` is in the wrong directory — it never runs
It sits at `school-project/middleware.ts`, but the app lives in `src/app/`. When a project uses
`src/`, Next.js only loads **`src/middleware.ts`**. `src/middleware.ts` does not exist.
→ Session refresh, auth redirects and the `/api/timetable` guard are all dead code. The exported
`config.matcher` never applies.

### 7. Even if it ran, `updateSession` would not work
`src/lib/supabase/middleware.ts:17-20`
```js
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) =>
    request.cookies.set(name, value, options)   // ← writes to the REQUEST only
  )
}
```
The refreshed tokens are never written to `supabaseResponse.cookies`, so nothing is sent back to
the browser. Sessions silently fail to renew and users get logged out at expiry. This is precisely
the mistake Supabase's docs warn about — and `tsc` already flagged it as TS2345 (#3).

**Fix:**
```js
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  supabaseResponse = NextResponse.next({ request })
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options))
}
```

### 8. `server.ts` uses the removed `@supabase/ssr` cookie API
`src/lib/supabase/server.ts:12-20` implements `get`/`set`/`remove`. Package is `@supabase/ssr@^0.7`,
which requires `getAll`/`setAll`. (The middleware file uses the new API — the two disagree.)

### 9. The browser calls `http://127.0.0.1:8000` directly
- `src/components/timetable/PortionSheetUpload.tsx:75, 89` — file is `'use client'`
- `src/services/timetableAPI.ts:107` — consumed by `src/hooks/useTimetableState.ts`

These run in the **end user's browser**, so `127.0.0.1:8000` means *the user's own machine*, never
your server. Guaranteed failure in production, and blocked as mixed content on any HTTPS deploy.
Also `NEXT_PUBLIC_API_URL` defaults to `http://127.0.0.1:8000` in `api/ai/quiz/route.ts:6` — a
server-side fetch that can never succeed on Vercel, so every request pays the 15s
`AbortSignal.timeout` before falling back.

**Fix:** call your own Next.js route handlers (`/api/...`) from the browser and let the *server*
talk to FastAPI.

### 10. Quiz answers are shipped to the client and graded in the browser
`/api/ai/quiz` returns `correctAnswer` for **every** question up front; grading is
`optionIndex === question.correctAnswer` at `src/app/quiz/page.tsx:125`. Open DevTools → Network →
read the JSON → all answers. Line 324 even renders `Correct answer: B` straight into the DOM.
Scores are also computed client-side (`calculateScore`), so they're forgeable before they're saved.

**Fix:** keep `correctAnswer` server-side; submit selections and grade in the route handler.

### 11. No authentication on the AI endpoints
`/api/ai/quiz`, `/api/ai/timetable`, `/api/ai/timetable/simple`, `/api/ai/parse-portion`,
`/api/ai/parse-syllabus`, `/api/quizzer`, `/api/dashboard` — **zero** `getUser()`/`getSession()`
calls. Anyone on the internet can POST and spend your OpenRouter/Gemini credits.

Amplifier: `QuizRequest` (`quiz.py:23-27`) has **no bounds at all** —
`questionCount: int = 10` with no `Field(le=...)`, `difficulty: str` not an enum, `subject: str`
uncapped. `{"questionCount": 100000}` builds a monstrous prompt. The TS route clamps to 20
(`api/ai/quiz/route.ts:31`) but the Python route does not.

Related: `subject`/`chapters`/`difficulty` are interpolated raw into the prompt — trivial prompt
injection.

### 12. CORS wildcard combined with credentials
`backend/app/main.py:14-21`
```python
allow_origins=["http://localhost:3000", ..., "*"],
allow_credentials=True,
```
`"*"` makes the other four entries pointless, and with `allow_credentials=True` Starlette echoes the
caller's `Origin` back rather than emitting `*`. Net effect: **any website can make credentialed
cross-origin requests to this API.**

### 13. Blocking I/O inside `async def` freezes the whole server
`backend/app/api/endpoints/timetable.py:155` calls `requests.post(..., timeout=30)` **synchronously**
inside an `async` handler, in a loop over **4** models. Worst case ~120s with the event loop
blocked — one slow request stalls *every* concurrent user. (`quiz.py` gets this right via
`asyncio.to_thread`; `timetable.py` does not.)

**Fix:** `httpx.AsyncClient`, or wrap in `asyncio.to_thread`.

### 14. A database outage kills the quiz completely
`src/app/quiz/page.tsx:72-78` — `generateQuiz()` calls `createSession()` **first**, inside the same
`try` as the question fetch, with no fallback:
```js
await quizSessionService.createSession({...});   // throws if Supabase is down
const response = await fetch('/api/ai/quiz', ...); // never reached
```
Since the Supabase project doesn't currently resolve (#1), **no quiz can render at all right now** —
even though question generation doesn't need the database. `saveQuestions` then throws
`'No active session'` for the same reason.

**Fix:** generate and show questions first; persist opportunistically in a separate `try`.

---

## 🟡 MEDIUM

### 15. Next 15 async-`params` migration is half-finished
`[id]/route.ts` was correctly migrated to `Promise<{ id: string }>` + `await params`. Six sibling
routes still destructure synchronously and will misbehave on Next 15:
`[id]/share`, `[id]/favorite`, `[id]/history`, `[id]/export`, `[id]/duplicate`,
`quiz/session/[sessionId]` (2 handlers).

### 16. `.env.example` doesn't contain what the app needs
It has only `GEMINI_API_KEY` and `NEXT_PUBLIC_APP_URL`. **Missing:**
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`,
`NEXT_PUBLIC_API_URL`. The README instructs `cp .env.example .env.local` — following the docs
exactly reproduces the build failure in #2.

### 17. README contradicts the code
- Documents `SUPABASE_SERVICE_ROLE_KEY`; **no app code reads it** (only `scripts/run-migration.js`)
- Says port **3001**; `.env.example` says **3000**; FastAPI CORS allows both
- Badge claims Next.js "15.5.4" while `package.json` says `"next": "latest"`
- Prereq "Node 18.0+"; Next 15 needs 18.18+

### 18. `schema.sql` and `supabase/migrations/` are two conflicting sources of truth
- `schema.sql:408` grants `quiz_sessions` SELECT to everyone on rows where `user_id IS NULL`;
  the migrations don't
- `schema.sql:394` enables RLS on `timetable_activities` **and** adds a public-read policy;
  `002_create_timetable_tables.sql` does neither → depending on which file you run, that table is
  either world-readable or **completely unreadable**
- Two migrations share prefix `002_` (`002_create_timetable_tables`, `002_quiz_rls_policies`)
- `CREATE POLICY` has no `IF NOT EXISTS`, so applying both files errors on duplicates

### 19. `WITH CHECK (true)` on insert-only policies
`timetable_history` and `timetable_analytics` allow **any** caller to insert unlimited rows
referencing **any** `timetable_id`. Unbounded table growth and data pollution; the audit log can be
forged.

### 20. Three incompatible error-response shapes
20 routes return flat `{ error: 'Unauthorized' }`, 2 return nested `{ error: { message, code, hint } }`.
Clients read `errorData.message` (`quiz/page.tsx:89`, `timetable/lib/aiService.ts:70`) — which the
nested shape never provides at that path. Users always see a generic `HTTP error! status: 500` and
the real diagnostic is discarded.

### 21. `extract_text` crashes on ordinary PDFs
`backend/app/api/endpoints/timetable.py:207`
```python
extracted_text += page.extract_text() + "\n"
```
`pdfplumber`'s `extract_text()` returns **`None`** for blank or image-only pages →
`TypeError: unsupported operand type(s) for +: 'NoneType' and 'str'`. Also: no size limit, no
extension validation, whole file buffered into memory; and for any non-PDF it silently returns a
**hardcoded fake string** — `"Extracted topics: Algebra Basics, Mechanics, Chemical Bonding, Cell
Biology"` — pretending to have parsed the upload.

### 22. Nothing is pinned
`"next": "latest"`, `"react": "latest"`, `"react-dom": "latest"` in `package.json`;
`backend/requirements.txt` has **zero** version constraints. Two developers cloning the same commit
get different trees. `"latest"` for a framework is how #15 and #25 happen silently.

### 23. React 19 runtime against React 18 types
Installed `react@19.1.1` / `react-dom@19.1.1` vs `@types/react@^18` (18.3.24) and
`@types/react-dom@^18`. Also `uuid@13` (ships its own types) paired with `@types/uuid@10`.

### 24. Deprecated / mismatched tooling
- `@google/generative-ai` — support ended 2025-11-30, replaced by `@google/genai`
- `tailwindcss-animate` is a Tailwind **v3** plugin; project is on **v4**
- `images.domains` deprecated in Next 15 → use `remotePatterns`
- `experimental.optimizePackageImports: ['react-icons']` — `react-icons` is **not a dependency**
- `npm run export` → `next export`, **removed in Next 14+** (the script is dead)
- `npx next lint` is itself deprecated, slated for removal in Next 16

### 25. `tsconfig.json` targets `es5`
`"target": "es5"` with `"lib": ["dom","dom.iterable","es6"]` and `"moduleResolution": "node"` —
all wrong for Next 15 / React 19. This directly produces the four TS2802 `Set` iteration errors in
`api/quiz/history` and `api/quiz/mistakes`. Use `es2017`+ and `bundler`.

### 26. No tests and no CI gate
Zero test files, no `test` script, no jest/vitest/playwright config. The only workflows are
`claude.yml` and `claude-code-review.yml` (AI reviewers). `claude-code-review.yml` instructs the bot
to *"Use the repository's CLAUDE.md for guidance"* — **`CLAUDE.md` does not exist.** Nothing runs
build, lint or typecheck on a PR, which is exactly how #2 and #3 reached `main`.

### 27. "Remember me" does nothing
`src/app/auth/page.tsx:90-96` passes `options: { expiresIn: '4w' }` to `signInWithPassword`.
Not a real Supabase option (tsc flags it, TS2322). Session lifetime is set in the Supabase
dashboard, so the checkbox is cosmetic.

### 28. You cannot log in without typing a username that is then ignored
`validateForm()` (`auth/page.tsx:56-60`) requires `username.length >= 3` unconditionally — including
when `isLogin === true`. But sign-in uses only `email` + `password`. Returning users are blocked by a
required field the login path never reads.

### 29. `NaN%` on the results screen
`calculatePercentage()` = `Math.round((score / questions.length) * 100)`. With an empty array →
`0/0` → `NaN` → renders "NaN%".

### 30. Answer-index coercion silently produces wrong answers
`src/app/api/ai/quiz/route.ts:82`
```js
correctAnswer: Number(q.correctAnswer) || 0
```
If the model returns `"B"` or `"Answer: 2"`, `Number()` → `NaN` → `0`, so **option A is silently
marked correct**. The Python path has the mirror bug: `int(q.get("correctAnswer", 0)) % 4`
(`quiz.py:319`) raises `ValueError` on a non-numeric string, inside a block with no `try` → HTTP 500.

### 31. Second-resolution IDs collide
`q_{int(time.time())}_{i}` (`quiz.py:315`) and `q_${Date.now()}_${idx}` (`quiz/page.tsx:95`).
Two quizzes generated within the same second share question IDs — which then collide in
`quiz_questions` and corrupt per-question stats. Use the already-imported `uuidv4`.

---

## ⚪ LOW / HYGIENE

### 32. ~1,990 lines of unreachable code (verified by import graph)
| File | Lines | Status |
|---|---|---|
| `src/app/timetable/components/TimetableForm.tsx` | **1018** | zero importers — *largest file in the repo* |
| `src/app/timetable/components/SimpleChat.tsx` | 477 | zero importers |
| `src/app/timetable/components/TimetableGrid.tsx` | 258 | zero importers |
| `src/app/timetable/components/ChatInterface.tsx` | 152 | **duplicate** — app uses `src/components/timetable/ChatInterface.tsx` |
| `src/app/landing/GradientBackground.tsx` | — | zero importers |
| `src/components/timetable/SimpleCalendar.tsx` | 23 | zero importers |
| `src/components/layout/Header.tsx` | 1 | contains only `// Header component - to be implemented`, no export |
| `src/app/timetable/components/ProgressBar.tsx` | — | zero importers |

Two parallel component trees (`src/app/timetable/components/` vs `src/components/timetable/`) with a
same-named file in each is how the duplicate `ChatInterface` and the two divergent `TimetableData`
types (TS2345) came about.

### 33. Create React App leftovers inside a Next.js app
`public/index.html` (with unprocessed `%PUBLIC_URL%` tokens — served as a broken page at
`/index.html`), `public/manifest.json` (`"Web site created using create-react-app"`),
`logo192.png`, `logo512.png`, `src/logo.svg` (unreferenced).

### 34. Stray HTML at the repo root
`dashboard.html` (20 KB), `colorreference.html` (12 KB), `test-colors.html`, `test-theme.html`.
Not routed by Next — pure clutter.

### 35. The root `requirements.txt` is not a Python requirements file
It's a commented list of **npm** packages (`react@^19.1.1`, `next@^15.5.4`, …). Anyone running
`pip install -r requirements.txt` from the project root gets an error. It sits right next to the
real `backend/requirements.txt`.

### 36. `.mcp.json` and `.claude/settings.local.json` hardcode one developer's machine
`"cwd": "C:\\Users\\Aarush\\Desktop\\Cursor Code Projects\\learning-app"`, `Read(//c/Users/Aarush/**)`,
`cmd /c` wrappers, `taskkill`, `findstr`, `netstat`. Windows-only and single-user — broken for every
other contributor, and it leaks a personal path. `settings.local.json` is meant to be gitignored
(the `.gitignore` already excludes `.claude/agents/` but not this file).

### 37. The project has five names
Repo `School-Project` · directory `school-project` · `package.json` `"learning-app"` ·
README **"LearnDash"** · FastAPI **"GrowMyIQ"** (also the `X-Title` header sent to OpenRouter).

### 38. Docs duplicated under two numbering schemes
`01-project-overview.md` **and** `01-getting-started/` · `02-technical-architecture.md` **and**
`02-architecture/overview.md` · `03-features.md` **and** `03-features/` · `04-api-endpoints.md`
**and** `04/api/overview.md` · `05-database-schema.md` **and** `02-architecture/database-schema.md`.
Two drifting copies of every document.

### 39. 8 ESLint errors + 8 warnings
Unescaped `'`/`"` entities in `dashboard.tsx`, `Landing.tsx`, `NotificationSystem.tsx`,
`TimableViewFilters.tsx`; missing `useEffect`/`useCallback` deps in 6 files (stale-closure risk);
`<img>` instead of `next/image` in `AuthenticatedSidebar.tsx:148`.

### 40. Stub endpoints shipped to `main`
`src/app/api/dashboard/route.ts` returns
`{ message: 'Dashboard API - to be implemented by API subagent' }` for both GET and POST.

---

## Suggested order of work

**Today (before anyone touches the code)**
1. Rotate the Supabase `service_role` + `anon` keys; purge from git history with `git filter-repo`. (#1)
2. Move `middleware.ts` → `src/middleware.ts` and fix `setAll` to write the response cookies. (#6, #7)
3. Delete `ignoreBuildErrors` / `ignoreDuringBuilds`. (#3)

**This week — make it run**
4. Guard Supabase client creation so `/auth` can prerender. (#2)
5. Add `requests` to `backend/requirements.txt`, remove `google-generativeai`, pin all versions. (#5, #22)
6. Raise the OpenRouter timeout from 3s; move off `gemini-2.0-flash-exp`; migrate to `@google/genai`. (#4)
7. Complete `.env.example`; fix the README port/env contradictions. (#16, #17)

**This week — make it safe**
8. Add `getUser()` to all 7 unauthenticated routes; bound `questionCount`; sanitise prompt inputs. (#11)
9. Remove `"*"` from CORS; drop `allow_credentials` or name explicit origins. (#12)
10. Stop returning `correctAnswer` to the browser; grade server-side. (#10)
11. Replace the browser→`127.0.0.1:8000` calls with same-origin `/api` routes. (#9)
12. Fix `WITH CHECK (true)`; reconcile `schema.sql` with `migrations/`; renumber the duplicate `002_`. (#18, #19)

**Next**
13. Fix the 83 type errors, then the 6 sync-`params` routes. (#3, #15)
14. `await`-ify `timetable.py`'s blocking `requests` calls. (#13)
15. Unify the error envelope into one shape. (#20)
16. Add a CI workflow running `tsc --noEmit`, `next lint`, `next build`, `pytest`; add `CLAUDE.md`
    or stop referencing it. (#26)
17. Delete the ~2,000 dead lines, the CRA leftovers, the stray root HTML, and one of the two doc
    trees. (#32–34, #38)
