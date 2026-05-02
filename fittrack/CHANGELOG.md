# FitTrack — Changelog & Project Status

## What's been built

### Task 1 — Project Scaffold
- Next.js 14 App Router project with TypeScript and Tailwind CSS
- Vitest test runner configured with path aliases
- Prisma 7 + LibSQL driver adapter for SQLite
- Environment config (`.env.local`, `.env.example`)

### Task 2 — Database Schema
- 8 Prisma models: `User`, `FoodItem`, `DiaryEntry`, `UserPreference`, `Recommendation`, `DailySummary`, `WeightLog`, `CustomMeal`
- SQLite database migrated and ready

### Task 3 — Calculations Library
- `src/lib/calculations.ts` — BMR (Mifflin-St Jeor), TDEE, calorie target (±400 kcal for cut/bulk), macro targets
- 13 unit tests, all passing

### Task 4 — Auth Setup
- NextAuth v4 with CredentialsProvider (email + password)
- JWT sessions, bcrypt password hashing
- Route middleware protecting all app pages
- `/api/auth/[...nextauth]` handler

### Task 5 — Signup, Onboarding & Login
- `/auth/signup` — 2-step wizard: account details → fitness profile
- `/auth/login` — email + password login with "Forgot password?" link
- `/api/user/register` — creates user, calculates and stores targets
- Responsive navbar with hamburger menu on mobile, active link highlighting, logout
- Root redirect (logged in → dashboard, logged out → landing page)

### Task 6 — Dashboard
- `/dashboard` — calorie ring (SVG, green/red), macro progress bars (Protein/Carbs/Fat)
- `/api/summary` — aggregates today's diary entries vs user targets
- Quick-nav cards to Diary, AI Suggestions, Progress

### Task 7 — Food Search
- `/search` — live food search, select food, choose servings + meal, add to diary
- `src/lib/food-search.ts` — queries USDA FoodData Central + Open Food Facts in parallel
- `/api/foods/search` — search endpoint with auth guard and length validation
- `/api/diary` (GET + POST) — fetch diary entries by date, log food with macro calculation
- `UserPreference` frequency tracking on every food log
- 5 unit tests for `mergeResults` deduplication logic
- AbortController for race-condition-safe search input

### Landing Page & Forgot Password
- `/` — marketing landing page (hero, feature cards, how-it-works, CTA → sign up)
- `/auth/forgot-password` — request password reset email
- `/auth/reset-password` — set new password via token link
- `/api/auth/forgot-password` + `/api/auth/reset-password` — token generation, email via Nodemailer
- Dev mode: reset URL logged to console if no SMTP configured

### Task 8 — Diary Page
- `/diary` — view all logged meals grouped by type (breakfast/lunch/dinner/snack)
- `/api/diary/[id]` DELETE endpoint to remove individual entries
- Daily macro totals summary, date picker, meal-specific "+ Add" links

### Task 9 — AI Recommendations
- `/recommendations` — Claude AI suggests foods based on remaining macros + eating history
- `src/lib/claude.ts` — queries top 20 logged foods + 7 days of diary, calls Claude API (claude-sonnet-4-6)
- `/api/recommendations` — rate-limited (60s cooldown), saves suggestions to DB
- JSON response validation, API key guard, unknown goal_type fallback

### Task 10 — Progress Page
- `/progress` — weight log line chart + daily calorie bar chart (Recharts)
- `/api/weight` — GET all weight entries, POST to log/upsert today's weight
- Streak tracker: consecutive days with at least one diary entry
- Diary API extended with `?start=&end=` date range query params

### Task 11 — Profile Page
- `/profile` — edit name, age, height, weight, goal, activity level
- `/api/profile` — GET profile + PATCH with full target recalculation after save
- Displays updated daily targets (kcal, protein, carbs, fat) below the form

### Task 12 — Custom Foods
- `/foods/custom` — create custom food entries, view your existing custom foods
- `/api/foods/custom` — POST to create (source='custom'), GET to list user's custom foods
- Custom foods appear at the top of search results
- Search page includes "Create custom food →" link

---

## Known bugs / improvements to make

- Food search has no debounce — fires a request on every keystroke (minor performance issue)
- Diary date boundaries use server local time, not user timezone
- No loading skeleton on the dashboard (shows blank briefly on first load)
- Custom food search does a full table scan in JS (acceptable at small scale, replace with raw SQL LIKE for large datasets)
- WeightLog has no unique constraint on (user_id, date) — concurrent requests could create duplicate rows
