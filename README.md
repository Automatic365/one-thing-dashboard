# The ONE Thing - Productivity Dashboard

A complete web-based productivity app based on "The ONE Thing" by Gary Keller and Jay Papasan. Focus on what matters most and achieve extraordinary results.

## Quick Start - How to Use

### Option 1: Open Directly in Browser (Simplest)
1. Locate the `index.html` file in this folder
2. Double-click the file
3. It will open in your default web browser
4. Start using the app immediately!

### Option 2: Using Python (If double-click doesn't work)
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to this folder:
   ```
   cd /Users/jhanna/Repo/one-thing-dashboard
   ```
3. Run this command:
   ```
   python3 -m http.server 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

## Cross-Device Sync (Optional but Recommended!)

By default, your data is stored locally on your device. To sync across ALL your devices:

1. **Follow the Firebase Setup Guide**: Open `FIREBASE_SETUP.md` (takes ~10 minutes)
2. **Create a free Firebase account** and get your config
3. **Paste the config** into `index.html` (clear instructions in the guide)
4. **Done!** Your data now syncs in real-time across all devices

**Benefits:**
- Access your goals from phone, tablet, laptop, work computer - anywhere!
- Real-time sync - changes appear instantly on all devices
- Automatic cloud backup - never lose your data
- 100% free forever (generous free tier you'll never exceed)
- Still completely private - only you can access your data

**Without Firebase:** The app works perfectly on a single device using localStorage

## Features

### 1. Dashboard (The Now)
- See today's ONE Thing prominently displayed
- Mark your daily goal as complete
- View inspirational quotes from the book
- Quick overview of your weekly, monthly, and yearly goals
- Visual domino effect showing how goals connect

### 2. Goals (Goal Setting to the Now)
Set up your complete goal hierarchy:
- **Someday Goal**: Your ultimate vision
- **5-Year Goal**: Major milestone toward your dream
- **1-Year Goal**: This year's priority
- **Monthly Goal**: This month's focus
- **Weekly Goal**: This week's target
- **Daily Goal**: Today's ONE Thing

Each level includes the Focusing Question to guide your thinking.

### 3. Time Blocking
- Schedule dedicated time blocks for your ONE Thing
- Recommended 4-hour blocks for maximum focus and deep work
- Visual calendar to see your commitments
- Mark blocks as complete when done
- Quick-add today's ONE Thing as a time block from any active life area

### 4. Progress Tracking
- Track your daily completion streak
- See completion rate over the last 30 days
- Visual calendar showing completed days
- Recent completions history
- Celebrate your wins!

### 5. Settings
- **Export Data**: Download a backup of all your goals and progress
- **Import Data**: Restore from a backup file
- All data stored locally in your browser for privacy

## How to Use The ONE Thing Method

### Step 1: Start with Your Someday Goal
1. Go to the "Goals" tab
2. Answer the question: "What's the ONE Thing I want to do someday?"
3. This is your big dream - don't hold back!

### Step 2: Work Backwards
Fill in each level, asking yourself:
- "What's the ONE Thing I can do [in this timeframe] such that by doing it, everything else will be easier or unnecessary?"

### Step 3: Focus on Today
1. Set your daily ONE Thing
2. Go to "Time Blocking" and schedule a 4-hour block
3. Protect this time - it's your path to extraordinary results

### Step 4: Complete and Track
1. Work on your ONE Thing during your time block
2. Mark it complete on the Dashboard
3. Watch your progress grow in the Progress tab

### Step 5: Maintain the Chain
- Each day, set a new ONE Thing aligned with your weekly goal
- Each week, update your weekly ONE Thing aligned with your monthly goal
- Keep the domino effect going!

## The 4-1-1 Goal Setting System

The app implements the 4-1-1 execution rhythm from The ONE Thing book:

### The 4-1-1 Framework

**4 = Four Weekly Goals**
- List the 4 most important outcomes you want to accomplish this week
- These should directly support your monthly and yearly goals
- Forces you to identify what truly matters

**1 = One Weekly ONE Thing**
- Select THE single most important goal from your 4 weekly goals
- This is your weekly priority - the one that makes everything else easier or unnecessary
- Click the radio button next to it in the Goals tab

**1 = One Daily Goal**
- Each day, ask: "What's the ONE Thing I can do today that makes my weekly ONE Thing easier or unnecessary?"
- This creates direct alignment: Daily → Weekly ONE → Monthly → Yearly → 5-Year → Someday

### Why 4-1-1 Works

**Prevents Priority Dilution**: You can't have 10 priorities - you identify the 4 that matter most

**Creates Forced Trade-Offs**: Selecting THE ONE from 4 options forces real prioritization

**Aligns Daily Effort with Results**: Your daily action directly supports your most important weekly goal

**Repeatable Habit**: Weekly goal-setting becomes a simple, consistent routine

### How to Use 4-1-1 in the App

1. **Go to Goals Tab** → Select a life area
2. **Set Your 4 Weekly Goals** (Step 5 in the hierarchy)
3. **Select THE ONE** by clicking the radio button next to your most important weekly goal
4. **Set Today's Daily Goal** that makes your weekly ONE Thing easier or unnecessary
5. **Track on Dashboard** - see both your weekly ONE Thing and daily goal displayed together

The system is designed for weekly use - update your 4 goals each week, pick THE ONE, and execute daily.

## Tips for Success

1. **Be Specific**: Make your goals concrete and actionable
2. **Start Big, Go Small**: Don't limit your Someday goal, but make your daily goal achievable
3. **Protect Your Time**: Treat your time blocks as sacred appointments
4. **Review Regularly**: Update your goals as you progress
5. **Celebrate Wins**: Use the Progress tab to see how far you've come

## Data & Privacy

- All data is stored locally in your browser (localStorage)
- No information is sent to any server
- Your data never leaves your computer
- Use Export/Import to backup or transfer between devices

## Troubleshooting

### App doesn't load?
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check that JavaScript is enabled

### Lost my data?
- Data is stored in browser's localStorage
- Export regularly to create backups
- Clearing browser data will erase app data

### Want to use on multiple devices?
1. Export your data on device 1
2. Transfer the .json file to device 2
3. Import the data on device 2

## The Focusing Question

At the heart of The ONE Thing is this powerful question:

**"What's the ONE Thing I can do [timeframe] such that by doing it everything else will be easier or unnecessary?"**

This question is built into every level of your goals. Use it to guide your decisions and maintain laser focus.

## About The ONE Thing

This app implements the core concepts from "The ONE Thing" by Gary Keller and Jay Papasan:
- Goal Setting to the Now
- The Focusing Question
- Time Blocking
- The Domino Effect
- Purpose, Priority, and Productivity

For more information, read the book or visit the official website.

---

**Built with**: React, Tailwind CSS, and localStorage for a fast, privacy-first experience.

**No installation required** - just open and use!

Enjoy focusing on your ONE Thing! 🎯
# Deployment trigger
