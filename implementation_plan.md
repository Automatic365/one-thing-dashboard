The One Thing - Detailed Build Plan
Project Overview
This web app helps users focus on their "ONE Thing" by implementing the book's core frameworks: Goal Setting to the Now (drilling down from Someday to Daily goals) and Time Blocking (dedicating 4 hours to the ONE Thing).

Architecture & Tech Stack
Core Stack
Framework: React 19 (via Vite)
Language: JavaScript (for rapid iteration, unless TypeScript is strictly preferred)
Styling: Tailwind CSS v4 (Custom "Focus" Design System)
State Management: React Context (AppContext for global data)
Persistence: localStorage (Privacy-first, zero-config persistence)
Icons: lucide-react
Routing: react-router-dom
Data Model (JSON Structure)
The app will revolve around a single OneThingData object persisted to localStorage.

{
  "userProfile": {
    "name": "User",
    "theme": "light" // or "dark"
  },
  "goals": {
    // Each goal connects to a parent.
    // hierarchy: someday -> five_year -> one_year -> monthly -> weekly -> daily
    "someday": [
      {
        "id": "goal-1",
        "category": "Business", // Business, Personal, Financial, etc.
        "text": "Build a $100M Company",
        "createdAt": "2026-01-12"
      }
    ],
    "five_year": [
      {
        "id": "goal-2",
        "parentId": "goal-1",
        "text": "Launch 3 successful product lines",
        "targetDate": "2031-01-12"
      }
    ],
    // ... continues down to daily
    "daily": [
      {
        "id": "goal-6",
        "parentId": "goal-5", // connects to Weekly
        "text": "Draft the product roadmap",
        "isOneThing": true, // The primary focus
        "completed": false,
        "date": "2026-01-12",
        "timeBlock": {
          "start": "08:00",
          "end": "12:00"
        }
      }
    ]
  }
}
Detailed Implementation Steps
Phase 1: Foundation & Design System (setup)
Initialize Project: npm create vite@latest one-thing-app -- --template react (we will use npx equivalent).
Tailwind Setup: Configure index.css with a custom color palette.
Backgrounds: bg-slate-50 (paper-like), bg-white (cards).
Accents: text-orange-600 (The One Thing color), text-slate-900 (Primary Text).
Layout Shell: Create Layout.jsx with a minimal sidebar/nav:
"The Now" (Dashboard)
"Dominoes" (Goal Setting to the Now)
"Calendar" (Time Blocking)
Phase 2: "Dominoes" - Goal Setting to the Now (feature-dominoes)
Goal Context: Create GoalContext.jsx to load/save the JSON model.
Horizontal Stepper View:
A view /dominoes that displays columns/cards for each timeline: Someday | 5 Years | 1 Year | Monthly | Weekly | Daily.
Connection UI:
When you click a "Someday" goal, it highlights (or filters) the "5-Year" column to show only connected goals.
Add Goal Modal: "What's the ONE Thing I can do in [Timeframe] such that by doing it, the [Parent Goal] will be easier or unnecessary?"
Phase 3: "The Now" - Daily Execution Dashboard (feature-dashboard)
Hero Component:
Display TODAY'S ONE THING in huge typography.
Checkbox for completion (triggers confetti/reward animation).
Context Section:
Show the parent "Weekly Goal" right above it, effectively reminding the user why they are doing this task (The "Why").
Focus Timer: optional, but a simple "Start Block" button that starts a 4-hour countdown.
Phase 4: Time Blocking Scheduler (feature-calendar)
Day View: A vertical timeline from 6 AM to 10 PM.
The Block: A visual "solid block" representing the 4-hour deep work session.
Draggable/Resizable (if possible, or just standard inputs to edit).
Conflict Detection: (Bonus) "You have a meeting during your One Thing block!" (If we integrate with external cals, but for now just internal).
Verification Plan
Manual Test Flows
The "Alignment" Test:

Enter a Someday Goal ("Retire on a boat").
... add children goals down to Today ...
Enter Today's Goal ("Check savings rates").
Verify that checking off Today's Goal implies progress toward "Retire on a boat".
Browser Refresh:

Refresh the page.
Ensure all goals and completion states persist.
