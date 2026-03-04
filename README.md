# SATCOACH

> **AI-powered Digital SAT prep platform** — adaptive practice tests, instant scoring, personalized study plans, and a built-in AI tutor. Built to mirror the real 2024 College Board Bluebook experience.

---

## What is SATCOACH?

SATCOACH is a full-stack web application that helps high school students prepare for the Digital SAT. Instead of buying expensive prep books or paying for tutors, students get an intelligent, adaptive practice environment that works exactly like the real exam — inside a browser.

The core idea: every time you take a practice test, the app learns what you're bad at, tells you immediately, and builds a study plan around it. The more you use it, the better it gets at pointing you toward what actually needs work.

---

## The Problem It Solves

- Official SAT practice tests are few and not adaptive
- Expensive tutors and courses aren't accessible to most students
- Static prep books don't give instant feedback or adapt to your level
- No free tool currently mirrors the 2024 Digital SAT's adaptive module system

SATCOACH fills this gap with AI-generated, adaptive questions that match the real College Board blueprint — for free.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Radix UI |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Backend / DB | Supabase (Postgres + Auth + Edge Functions) |
| AI Questions | Supabase Edge Functions (Deno) → AI model |
| AI Tutor | Supabase Edge Functions → AI model |
| Charts | Recharts |
| PDF Export | react-to-pdf |
| Form Handling | React Hook Form + Zod |
| State/Data | TanStack React Query |

---

## Project Structure

```
sat-coach-ai/
├── src/
│   ├── pages/          # All page-level components (14 pages)
│   ├── components/     # Shared UI components
│   ├── services/       # AI question generation service
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # Auth context
│   ├── data/           # Mock question data and types
│   └── integrations/   # Supabase client setup
├── supabase/
│   ├── functions/      # Edge Functions (AI question gen, tutor, study plan)
│   └── migrations/     # Database schema SQL
```

---

## Database Schema

Four tables, all secured with Row Level Security (RLS):

### `user_profiles`
Stores each user's SAT goals and progress metadata.
- `user_id` — links to Supabase Auth
- `current_score`, `target_score` — their starting point and goal
- `exam_date` — when they're sitting the real test
- `preferred_subjects`, `strengths`, `weaknesses` — topic preferences
- `onboarding_completed` — gates access to the dashboard

### `test_results`
One row per completed practice test session.
- `score` — overall predicted SAT score (200–1600)
- `reading_score`, `math_score` — section scores (200–800 each)
- `weak_topics` — array of topics where accuracy was below 70%
- `time_spent`, `total_questions`, `correct_answers`
- `test_date`

### `question_responses`
One row per individual question answered in any test.
- `question_id`, `section`, `topic`, `difficulty`
- `user_answer`, `correct_answer`, `is_correct`
- Links to `test_results` via `test_result_id`

### `study_plan_tasks`
AI-generated weekly study tasks.
- `topic`, `task_type` (practice, review, etc.)
- `duration` — minutes per session
- `day_of_week` — which day of the week (0=Monday, 6=Sunday)
- `completed`, `completed_at`

**Triggers:**
- `on_auth_user_created` — auto-creates a `user_profiles` row when a new user signs up
- `update_user_profiles_updated_at` — keeps the `updated_at` timestamp current

---

## Supabase Edge Functions

Three AI-powered backend functions deployed on Deno:

| Function | What It Does |
|---|---|
| `generate-questions` | Generates SAT questions given section, module, difficulty, and count. Uses the College Board blueprint to ensure topic distribution accuracy. |
| `ask-ai-tutor` | Powers the AI Tutor chat interface. Accepts a user question and returns a markdown-formatted reply from the AI. |
| `generate-study-plan` | Takes the user's current score, target score, exam date, and weak topics — returns a structured weekly schedule of tasks. |

---

## What's Working Right Now

### ✅ Authentication
- Email/password sign up and sign in (`/auth`)
- Forgot password flow with email link (`/forgot-password`)
- Reset password page (`/reset-password`)
- Supabase Auth with JWT session management
- Protected routes — unauthenticated users get redirected
- Auto-profile creation on sign up (via DB trigger)

### ✅ Onboarding (`/onboarding`)
3-step wizard shown to new users before they reach the dashboard:
1. Set current SAT score and target score (with slider)
2. Set their exam date
3. Pick which SAT topics they want to focus on

Saves to `user_profiles` and marks `onboarding_completed = true`.

### ✅ Dashboard (`/dashboard`)
Main home screen after login. Shows:
- Current and target score side by side
- Section score rings (Reading/Writing vs Math, each out of 800)
- Level system based on score (NOOB → ROOKIE → PRODIGY → ADVANCED → ELITE → MASTER)
- Score trend chart (area chart over all past tests)
- Focus areas: topics where accuracy is below 70%, sorted worst first
- Total tests taken, daily streak counter

### ✅ Practice Test (`/practice`) — The Core Feature
Full-length adaptive practice tests powered by AI-generated questions.

**Three modes:**
- **Full Test** — Complete 2 hr 14 min simulation: Reading/Writing (2 modules × 27 questions) + break + Math (2 modules × 22 questions)
- **Reading & Writing only** — Just the RW section
- **Math only** — Just the Math section

**How the adaptive system works:**
- Module 1 is always medium difficulty
- After Module 1, your score is calculated
- If you got ≥70% correct → Module 2 is **hard** (higher scoring ceiling)
- If you got <70% correct → Module 2 is **easy** (lower scoring ceiling)
- This exactly mirrors how the real 2024 Digital SAT works

**Question loading:**
- First 3 questions load immediately so you can start right away
- Remaining questions load in background batches of 6 to avoid blocking
- Questions are cached in `sessionStorage` for the review screen

**During the test:**
- Live countdown timer (32 min RW / 35 min Math per module)
- Question navigation grid showing answered/unanswered status
- Built-in Desmos-style calculator (Math sections)
- Question type label: "Single choice question — Select one option"
- Support for grid-in (student-produced response) question type
- Section break screen between RW and Math for Full Test mode
- "Preparing your test" loading overlay with rotating SAT tips

**On submission:**
- Calculates overall score (scaled to 200–1600 range)
- Identifies weak topics (any topic with <70% accuracy)
- Saves test result and all individual question responses to Supabase
- Navigates to detailed review screen

**Test review:**
- Shows final score in big numbers
- Lists every wrong answer with: your answer, correct answer, full explanation
- Shows focus areas (weak topics) with topic priority callouts
- Overall accuracy percentage with progress bar
- Back to previous tests from the lobby (loads from `test_results` table)

### ✅ Focus Test (`/focus-test`)
A shorter, distraction-free test mode using a curated set of mock questions.
- Full-screen black interface (immersive mode)
- Tab-switch detection — if you leave the window, it logs it and shows a warning overlay with the count of infractions
- Automatic timer (35 min)
- Calculator support for Math questions
- Saves results to the same `test_results` + `question_responses` tables
- Updates `user_profiles.weaknesses` after the test

### ✅ Analytics (`/analytics`)
Detailed progress report for all completed tests.
- Latest score, personal best, average accuracy, total questions solved
- Score over time chart (area chart, 0–1600 range)
- Reading & Writing vs Math breakdown with animated progress bars
- Topic accuracy bar chart (top 5 topics)
- **Export to PDF** — one-click download of the full analytics page as a PDF

### ✅ Topic Review / Weak Areas (`/weak-areas`)
Breaks down performance by every SAT topic you've answered questions in.
- Filter by All / Weak (< 70%) / Strong (≥ 70%)
- Shows topic name, section, accuracy, questions attempted
- Summary stats: total topics, % mastered, topics needing review, avg accuracy
- Click any topic card to jump straight into practice

### ✅ Study Plan (`/study-plan`)
AI-generated weekly study schedule personalized to your goals.
- Button to generate or regenerate your plan (calls `generate-study-plan` edge function)
- Passes your current score, target, exam date, and weak topics to the AI
- Displays tasks grouped by day of week (Monday–Sunday)
- Each task shows: topic, task type, duration in minutes
- Toggle tasks complete/incomplete (persists to `study_plan_tasks` table)
- Progress bar showing tasks done / total tasks
- Goal score and weekly practice time shown as overview stats

### ✅ AI Tutor (`/tutor`)
Conversational AI chat interface for SAT help.
- Persistent chat history within the session
- Supports markdown formatting in AI replies (bold, lists, code, etc.)
- Animated message bubbles with user/AI distinction
- Loading indicator while AI is thinking
- Powered by the `ask-ai-tutor` edge function
- Press Enter or click Send to submit

### ✅ Profile (`/profile`)
User profile management page.
- Update display name, target score, exam date, and subject preferences

### ✅ Built-in Calculator
A functional calculator component available during Math sections:
- Accessible from Practice Test and Focus Test
- Toggle button shows/hides it
- Positioned for non-intrusive use alongside questions

### ✅ UI/UX System
- Dark mode default with light mode toggle (`next-themes`)
- Bold brutalist design system: thick borders, uppercase typography, high contrast
- Framer Motion animations throughout (staggered lists, page transitions, loading states)
- Responsive layout (mobile + desktop)
- Space Grotesk as the display font
- Toast notifications for success/error feedback (Sonner)

---

## Routes

| Path | Page | Auth Required |
|---|---|---|
| `/` | Landing page | No |
| `/auth` | Sign in / Sign up | No |
| `/forgot-password` | Forgot password | No |
| `/reset-password` | Reset password | No |
| `/dashboard` | Main dashboard | Yes |
| `/onboarding` | First-time setup wizard | Yes |
| `/practice` | Practice test center | Yes |
| `/focus-test` | Immersive focus test | Yes |
| `/analytics` | Progress analytics | Yes |
| `/weak-areas` | Topic-by-topic review | Yes |
| `/study-plan` | Weekly study schedule | Yes |
| `/tutor` | AI Tutor chat | Yes |
| `/profile` | Profile settings | Yes |

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Supabase project with the migration applied and edge functions deployed
- A `.env` file with your Supabase URL and anon key

### Setup

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database

Apply the migration in `/supabase/migrations/` to your Supabase project, either via the Supabase CLI or by running the SQL directly in the SQL editor.

### Edge Functions

Deploy the three edge functions in `/supabase/functions/` to your Supabase project:
- `generate-questions`
- `ask-ai-tutor`
- `generate-study-plan`

---

## What's Not Done Yet (Planned)

- [ ] Real score normalization (currently uses a linear approximation of 200–1600)
- [ ] Passage-based Reading questions (currently mostly standalone questions)
- [ ] Streak tracking backed by a database (currently a mock value)
- [ ] Social features / leaderboards
- [ ] Email digest / progress reports
- [ ] Mobile app wrapper

---

## License

MIT — built for student success.