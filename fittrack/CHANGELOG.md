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
- `/auth/login` — email + password login
- `/api/user/register` — creates user, calculates and stores targets
- Navbar with active link highlighting and logout
- Root redirect (logged in → dashboard, logged out → login)

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

---

## What still needs to be built

### Task 8 — Diary Page
- `/diary` — view all logged meals grouped by type (breakfast/lunch/dinner/snack)
- DELETE endpoint to remove individual entries
- Daily macro totals summary

### Task 9 — AI Recommendations
- `/recommendations` — Claude AI suggests foods based on remaining macros + eating history
- `/api/recommendations` — fetches top 20 logged foods, last 7 days of diary, sends to Claude
- Saves suggestions to `recommendations` table, marks `was_accepted` when user logs a suggested food

### Task 10 — Progress Page
- `/progress` — weight log chart (Recharts), calorie history over time, streak tracking
- `/api/weight` — log and fetch weight entries

### Task 11 — Profile Page
- `/profile` — edit stats (weight, height, age, activity level, goal)
- Recalculates calorie and macro targets on save

### Task 12 — Custom Foods
- `/foods/custom` — create custom foods and saved meal templates
- Custom foods stored with `source = custom` in `food_items`

---

## Known bugs / improvements to make

- Food search has no debounce — fires a request on every keystroke (minor performance issue)
- Diary date boundaries use server local time, not user timezone
- No loading skeleton on the dashboard (shows blank briefly on first load)
- Navbar active link only matches exact paths (e.g. `/diary/2026-05-01` won't highlight Diary)
- No USDA API key set → USDA results will fail silently, Open Food Facts still works
