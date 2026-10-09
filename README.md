# Faith Path

Create a mobile-first web application called Faith Journey.

The app helps new Christians or people interested in Jesus understand the Gospel and develop spiritual habits.

The target audience are people who:

are curious about Christianity

recently converted

have little biblical knowledge

want guidance on how to live a Christian life

The app should be simple, welcoming and beginner friendly.

Main concept

The app is a gamified spiritual journey where users progress through levels while learning about Christianity.

Users complete:

lessons

reflections

quizzes

small spiritual challenges

Examples:

read a Bible passage

watch a short teaching video

write a reflection

say a short prayer

Progress unlocks new levels and achievements.

Learning Path Structure

Level 0 — Introduction to Christianity

Goal: help users reflect about life and spiritual values.

Lessons:

1 What does it mean to be a Christian today
2 Material success vs spiritual purpose
3 What people truly seek in life
4 Reflection quiz: "What do you really want for your life?"

The quiz should present three attractive choices:

A – spiritual values
B – balanced lifestyle
C – pleasure, success and personal ambition

All answers should have some appealing benefit, but reflect different priorities.

Level 1 — First Steps in Faith

Lessons:

The plan of salvation

Who Jesus is

What sin means

What it means to be born again

Beginning a relationship with God

Each lesson should include:

simple explanation

Bible verses

reflection question

optional embedded YouTube video

Level 2 — Spiritual Habits

Lessons:

How to pray

How to read the Bible

Understanding Scripture

Creating a spiritual journal

Listening to God

Level 3 — Living the Christian Life

Lessons:

Facing temptation

Faith in everyday life

Family and faith

Christian community

Sharing your faith

App Features

The app must include:

Dashboard
Learning path
Daily challenge
Quiz system
Spiritual journal
Bible reading plans
Achievements system

Dashboard

Show:

current level

progress bar

daily challenge

verse of the day

Content Lessons

Each lesson page should include:

Title
Short explanation
Bible verse
Embedded YouTube video
Reflection question
Completion button

Quiz Pages

Multiple choice questions with 3 options.

Each option reflects a different life priority.

Spiritual Journal

Users can write:

prayers

reflections

thoughts about lessons

Entries should be stored in the user account.

Bible Reading Plans

Suggested reading plans:

Gospel of John

Gospel of Mark

Psalms

Proverbs

Gamification

Include:

Levels
XP points
Badges
Streaks

Example badges:

First Prayer
First Week Reading the Bible
Reflection Completed

Design Style

The design should feel:

calm
modern
minimalist
welcoming

Colors:

soft blue
soft green
beige

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **Internationalization**: Custom i18n (PT, ES, EN)

## Features

✅ Google OAuth authentication  
✅ Email/password authentication  
✅ Gamified learning path (3 levels, 15+ lessons)  
✅ Quiz system with spiritual reflection  
✅ Spiritual journal (prayers, reflections, thoughts)  
✅ Bible reading plans  
✅ Achievement system  
✅ XP and streak tracking  
✅ Real-time progress sync  
✅ Responsive mobile-first design  
✅ Multi-language support (PT, ES, EN)  

## Live App

**GitHub Pages**: https://rogerio-s-ono.github.io/spirit-start-journey/

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/rogerio-s-ono/spirit-start-journey.git
cd spirit-start-journey
npm install
npm run dev
```

The app will be available at `http://localhost:8080`

## Build for Production

```sh
npm run build
```

The production build will be in the `dist/` folder.

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## Database Setup

The app uses Supabase for authentication and data persistence. Run the migrations in `supabase/migrations/` to set up the database schema.

## Contributing

This is an open-source project. Feel free to fork, submit issues, and create pull requests.

## License

MIT
