# SAT Coach AI (Digital SAT 2024 Prep)

This is a practice environment designed to mirror the 2024 Bluebook experience. It uses the official College Board blueprint with adaptive module logic and integrated tools.

## Key Features

### Integrated Test Environment
- Adaptive Modules: Logic that automatically transitions students to Module 2 (Easy/Hard) based on Module 1 performance.
- Official Navigation: question grids with status indicators for Answered, Current, and Untouched questions.
- Proctored Mode (Focus Test): Anti-cheat window detection and distraction tracking.

### Desmos Integration (Non-CAS Approved)
- Floating PIP Mode: Moveable and resizable calculator that stays active across all math questions.
- Dual-Mode Toggle: Switch between Graphing and Scientific calculators.
- Secure Architecture: 100% Non-CAS compliant — no symbolic manipulation allowed.
- Iframe Engine: High-reliability fallback if official API keys are restricted.

### AI-Generated Assessments
- Blueprint Alignment: 
  - Reading & Writing: 50/50 split between Reading and Writing concepts.
  - Math: Precise weights for Algebra (35%), Advanced Math (30%), Data Analysis, and Geometry.
- Smart Difficulty: controlled difficulty levels (Easy, Medium, Hard).
- Explanation Engine: Every question includes a detailed breakdown of the correct strategy.

## Tech Stack
- Frontend: React 18 / Vite / Tailwind CSS
- State/Logic: Framer Motion, Lucide, Supabase Client
- Authentication: Supabase Auth
- AI Backend: OpenAI GPT-4o Integration
- Database: Supabase PostgreSQL

## Getting Started

1. Clone the repo
2. Install dependencies: npm install
3. Set Environment Variables: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
4. Run Dev Server: npm run dev

## SAT Calibration Notes
This application follows the College Board's restricted calculator policy:
- No symbolic manipulation (CAS)
- 44 Total Math Questions (22 per module)
- 54 Total Reading/Writing Questions (27 per module)
- 50/50 MCQ and Student-Produced Response (Grid-in) split for Math

---
Project calibrated for 2024 Digital SAT standards.