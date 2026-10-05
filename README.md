# Talkora AI — Forgot Password

## Overview

Talkora AI includes a secure password-reset flow that allows users to recover access to their account if they forget their password.

The password-reset system follows this flow:

```text
User forgets password
        ↓
Enter registered email
        ↓
Backend generates secure reset token
        ↓
Reset link is sent to email
        ↓
User opens reset link
        ↓
Enter new password
        ↓
Backend validates token
        ↓
Password is updated securely
        ↓
User can log in with new password

```

```
alysis/
│   │   │   └── progress/
│   │   │
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── practice/
│   │   │   ├── analysis/
│   │   │   └── history/
│   │   │
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── ai/
│   ├── speech/
│   ├── language/
│   ├── pronunciation/
│   ├── vision/
│   ├── scoring/
│   ├── feedback/
│   ├── prompts/
│   └── evaluation/
│
├── workers/
│   ├── video_worker.py
│   ├── audio_worker.py
│   ├── analysis_worker.py
│   └── feedback_worker.py
│
├── storage/
│   ├── videos/
│   ├── audio/
│   └── frames/
│
├── migrations/
│
├── scripts/
│
├── infrastructure/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Makefile
└── README.md
```
Authentication

Talkora AI uses JWT-based authentication.

Authentication Flow
```
Signup
  ↓
Password → bcrypt hash
  ↓
PostgreSQL
  ↓
Login
  ↓
Credentials verified
  ↓
JWT generated
  ↓
Frontend stores access token
  ↓
Protected API requests
```
The frontend sends the JWT using:

Authorization: Bearer <access_token>
Password Recovery

Talkora AI also supports password recovery.
```
Forgot Password
       ↓
Enter Email
       ↓
Generate Secure Token
       ↓
Send Reset Email
       ↓
Open Reset Link
       ↓
Create New Password
       ↓
Update Password Hash
       ↓
Login
```
Reset tokens should be:

Cryptographically secure
Time-limited
Single-use
Stored securely
Invalidated after successful password reset
Database

Talkora AI uses PostgreSQL.

Current user structure:
```
users
├── id
├── name
├── email
└── password_hash
```
The database will later contain additional entities such as:

users
topics
practice_sessions
videos
transcripts
analyses
scores
progress
password_reset_tokens
Backend Setup
1. Clone the repository
git clone https://github.com/yourusername/talkora-ai.git
cd talkora-ai
2. Create Python virtual environment

Windows:
```
cd Backend

python -m venv .venv

Activate it:

.\.venv\Scripts\Activate.ps1
3. Install dependencies
pip install -r requirements.txt
4. Configure environment variables

Create:

Backend/.env
```
Example:
```
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/talkora

JWT_SECRET_KEY=your-super-secret-talkora-key

FRONTEND_URL=http://localhost:5173

Do not commit .env to GitHub.

PostgreSQL Setup

Create the database:

CREATE DATABASE talkora;

Make sure PostgreSQL is running.

The application expects PostgreSQL on:

localhost:5432
Run Backend

From the Backend directory:

python -m uvicorn app.main:app --reload --port 8001
```
Backend:
```
http://127.0.0.1:8001

Swagger API documentation:

http://127.0.0.1:8001/docs
Frontend Setup

Open another terminal.

cd talkora-ai-frontend

Install dependencies:

npm install

Run development server:

npm run dev
```
Frontend:
```
http://localhost:5173
Vite Proxy

The frontend uses Vite's development proxy to communicate with FastAPI.

vite.config.js:

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
});

Therefore frontend requests can use:

fetch("/api/auth/login")

instead of:

fetch("http://127.0.0.1:8001/api/auth/login")
API
Authentication
Signup
POST /api/auth/signup

Request:

{
  "name": "Mohit",
  "email": "mohit@example.com",
  "password": "Password123"
}
Login
POST /api/auth/login

Request:

{
  "email": "mohit@example.com",
  "password": "Password123"
}

Response:

{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Mohit",
    "email": "mohit@example.com"
  }
}
Current User
GET /api/auth/me
```
Requires:

Authorization: Bearer <token>
Forgot Password
POST /api/auth/forgot-password
Reset Password
POST /api/auth/reset-password
AI Analysis Pipeline

After a user uploads a speaking video:
```
Video
 │
 ├───────────────┐
 │               │
 ▼               ▼
Audio           Frames
 │               │
 ▼               ▼
Speech-to-Text   Vision Analysis
 │
 ▼
Transcript
 │
 ├──────────────┬──────────────┬──────────────┐
 ▼              ▼              ▼              ▼
Grammar      Vocabulary     Fluency      Relevance
 │              │              │              │
 └──────────────┴──────────────┴──────────────┘
                       │
                       ▼
                Scoring Engine
                       │
                       ▼
                 AI Feedback
                       │
                       ▼
                User Dashboard
```
Scoring System

The scoring engine should separate objective measurements from LLM-generated feedback.

Potential metrics include:

Metric	Example Measurement
Fluency	Speech rate, pauses, hesitation
Grammar	Grammar errors
Vocabulary	Vocabulary diversity and appropriateness
Pronunciation	Pronunciation analysis
Structure	Organization of response
Relevance	Relationship to assigned topic
Overall	Combined deterministic score

The exact scoring weights should be defined and tested independently rather than allowing an LLM to arbitrarily determine the final score.

Example Result

A practice session may eventually produce:

{
  "overall_score": 76,
  "fluency": 78,
  "grammar": 72,
  "vocabulary": 75,
  "pronunciation": 80,
  "structure": 74,
  "topic_relevance": 82
}

Along with feedback such as:

Strengths:
- Clear response structure
- Good topic relevance
- Consistent speaking pace

Areas to improve:
- Reduce filler words
- Use more varied vocabulary
- Improve sentence construction

Next practice:
Try answering the next topic for 90 seconds
without preparing your response beforehand.
Production Architecture

The development architecture can evolve into:

                     Internet
                        │
                        ▼
                 ┌──────────────┐
                 │    Frontend  │
                 │ React / Vite │
                 └───────┬──────┘
                         │
                         ▼
                 ┌──────────────┐
                 │    FastAPI   │
                 │     API      │
                 └───────┬──────┘
                         │
              ┌──────────┼───────────┐
              │          │           │
              ▼          ▼           ▼
         PostgreSQL    Redis     Object Storage
              │          │           │
              │          ▼           │
              │      Job Queue        │
              │          │           │
              └──────────┼───────────┘
                         ▼
                 Background Workers
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
            FFmpeg      STT       Vision
              │          │          │
              └──────────┼──────────┘
                         ▼
                    AI Analysis
                         │
                         ▼
                  Scoring Engine
                         │
                         ▼
                   AI Feedback
                         │
                         ▼
                    PostgreSQL
