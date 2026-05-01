# FitTrack — Fitness App Design Spec

**Date:** 2026-05-01  
**Status:** Approved

---

## Overview

FitTrack is a multi-user web-based fitness and nutrition tracking application. Users can log what they eat each day, track calories and macros against automatically calculated personal targets, and receive AI-powered food recommendations based on their eating patterns and goals.

The three primary fitness goals supported are **cutting** (weight loss), **maintaining**, and **bulking** (muscle gain). The app calculates personalised calorie and macro targets from the user's body stats without requiring any nutrition knowledge from the user.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (React), TailwindCSS, Recharts |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Database | SQLite (development) → PostgreSQL (production) |
| Auth | NextAuth.js — email + password, JWT sessions |
| Food APIs | USDA FoodData Central API + Open Food Facts API |
| AI | Anthropic Claude API (food recommendations) |
| Language | TypeScript throughout |

---

## Database Schema

### `users`
Stores account info and all fitness profile data.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| email | String | Unique |
| password_hash | String | bcrypt hashed |
| name | String | Display name |
| weight_kg | Float | Current weight |
| height_cm | Float | Height |
| age | Int | |
| gender | Enum | male / female |
| activity_level | Enum | sedentary / light / moderate / active / very_active |
| goal_type | Enum | cut / maintain / bulk |
| calorie_target | Int | Auto-calculated from stats + goal |
| protein_target_g | Int | Auto-calculated (2g × kg bodyweight) |
| carbs_target_g | Int | Auto-calculated from remaining calories |
| fat_target_g | Int | Auto-calculated (1g × kg bodyweight) |
| created_at | DateTime | |

### `food_items`
Shared food library — populated from APIs or created by users.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | |
| calories | Float | Per serving |
| protein_g | Float | |
| carbs_g | Float | |
| fat_g | Float | |
| fiber_g | Float | Nullable |
| serving_size | Float | |
| serving_unit | String | e.g. "g", "ml", "piece" |
| source | Enum | usda / open_food_facts / custom |
| external_id | String | Nullable — original API ID |
| created_by | String | Nullable — user id for custom foods |

### `diary_entries`
What a user ate on a given day.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| user_id | String | FK → users |
| food_item_id | String | FK → food_items |
| date | DateTime | Day of entry |
| meal_type | Enum | breakfast / lunch / dinner / snack |
| quantity | Float | Number of servings |
| calories | Float | Calculated at insert |
| protein_g | Float | Calculated at insert |
| carbs_g | Float | Calculated at insert |
| fat_g | Float | Calculated at insert |

### `user_preferences`
Tracks which foods a user likes/dislikes and how often they log them — used to feed Claude recommendations.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| user_id | String | FK → users |
| food_item_id | String | FK → food_items |
| preference | Enum | liked / disliked / neutral |
| frequency_count | Int | How many times logged |

### `recommendations`
Stores AI recommendation history per user.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| user_id | String | FK → users |
| date | DateTime | |
| suggestion_text | String | Claude's recommendation |
| reasoning | String | Claude's explanation |
| foods_suggested | String | JSON array of food names |
| was_accepted | Boolean | Did user log a suggested food |

### `daily_summaries`
Aggregated daily totals — computed and cached each day.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| user_id | String | FK → users |
| date | DateTime | |
| total_calories | Float | |
| total_protein | Float | |
| total_carbs | Float | |
| total_fat | Float | |
| goal_met | Boolean | Did user hit calorie target (±100 kcal) |

### `weight_logs`
User's weight history over time.

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| user_id | String | FK → users |
| date | DateTime | |
| weight_kg | Float | |
| notes | String | Nullable |

### `custom_meals`
Saved meal templates — e.g. "My breakfast bowl".

| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| user_id | String | FK → users |
| name | String | |
| items | String | JSON array of {food_item_id, quantity} |
| total_calories | Float | |
| total_protein | Float | |
| total_carbs | Float | |
| total_fat | Float | |

---

## Calorie & Macro Calculation

On signup and whenever the user updates their profile, the app recalculates targets using:

**Step 1 — BMR (Mifflin-St Jeor):**
- Male: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5`
- Female: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161`

**Step 2 — TDEE:**
- Sedentary × 1.2
- Light × 1.375
- Moderate × 1.55
- Active × 1.725
- Very Active × 1.9

**Step 3 — Goal adjustment:**
- Cut: TDEE - 400 kcal
- Maintain: TDEE
- Bulk: TDEE + 400 kcal

**Step 4 — Macros:**
- Protein: `2 × weight_kg` grams → `protein_g × 4` kcal
- Fat: `1 × weight_kg` grams → `fat_g × 9` kcal
- Carbs: `(calorie_target - protein_kcal - fat_kcal) / 4` grams

---

## Pages & Routes

| Route | Description |
|---|---|
| `/auth/signup` | Register + onboarding wizard (stats, goal) — triggers auto-calculation |
| `/auth/login` | Email + password login |
| `/dashboard` | Daily calorie ring, macro progress bars, quick-add food button, today's summary |
| `/diary` | Full food log for selected day, grouped by meal (breakfast/lunch/dinner/snack) |
| `/search` | Food search — queries USDA + Open Food Facts in parallel, shows merged results |
| `/recommendations` | Claude AI suggestions based on eating history, remaining macros, preferences |
| `/progress` | Weight log graph, calorie history chart, streak tracking |
| `/profile` | Edit stats, change goal, recalculate targets |
| `/foods/custom` | Create and manage custom foods and saved meal templates |

---

## Food Search

When a user searches for a food:
1. The API route queries **USDA FoodData Central** and **Open Food Facts** in parallel
2. Results are merged, deduplicated by name similarity, and ranked by relevance
3. Selecting a food saves it to `food_items` (if not already cached) and adds a `diary_entry`

Custom foods entered manually are stored directly in `food_items` with `source = custom`.

---

## AI Recommendations (Claude)

When a user visits `/recommendations`, the app:
1. Fetches their remaining macros for today (targets minus logged)
2. Fetches their top 20 most-logged foods from `user_preferences`
3. Fetches their last 7 days of diary entries
4. Sends a structured prompt to Claude with this context
5. Claude returns 3–5 food suggestions with explanations
6. Suggestions are saved to `recommendations` table
7. If the user logs a suggested food, `was_accepted` is marked true

The Claude prompt includes: goal type, remaining calories/macros, favourite foods, recent meals, and an instruction to suggest practical foods the user already likes.

---

## Auth Flow

- Signup → onboarding form (name, email, password, then stats + goal) → redirect to dashboard
- Login → JWT session via NextAuth → all API routes protected by session middleware
- Passwords hashed with bcrypt
- Sessions stored as HTTP-only cookies

---

## Error Handling

- Food API failures are handled gracefully — if USDA times out, Open Food Facts results still show, and vice versa
- Claude API errors show a friendly fallback message ("Recommendations unavailable right now")
- All API routes return consistent `{ data, error }` JSON shapes
- Form validation on the frontend (zod schemas) and repeated server-side

---

## Testing

- Unit tests for the calorie/macro calculation logic (pure functions — easy to test)
- Integration tests for the food search merge/dedup logic
- API route tests for diary CRUD operations
- Auth flow tested end-to-end with a test user

---

## Future Considerations (out of scope for v1)

- Barcode scanning (Open Food Facts supports it)
- Exercise logging and calorie burn tracking
- Mobile app (React Native) consuming the same API
- Switch SQLite → PostgreSQL for production deployment
- Email notifications / weekly reports
