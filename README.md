<div align="center">

<img src="./public/roleclear-logo.svg" alt="RoleClear" width="260" />

### Every Step Closer to Your First Yes.

**A student-first Career Operating System for smarter applications, stronger resumes, cleaner tracking, and better career decisions.**

</div>

---

## Overview

**RoleClear** is a career operating system built for students, fresh graduates, and internship seekers.

Instead of acting like another job board, RoleClear focuses on the full application lifecycle:

**Discover → Verify → Analyze → Tailor → Apply → Track → Learn**

The platform combines resume intelligence, job-fit analysis, ATS checks, truthful resume tailoring, application tracking, career-focused email organization, and analytics in one workspace.

---

## Core Workflow

```text
Find an opportunity
        ↓
Bring it to RoleClear
        ↓
Analyze the job
        ↓
Check Resume Fit
        ↓
Review Skill Gaps + Requirements
        ↓
Check Ghost Job Risk
        ↓
Tailor Resume Safely
        ↓
Download ATS-Friendly Resume
        ↓
Apply
        ↓
Track Application
        ↓
Monitor Career Inbox
        ↓
Learn from Analytics
```

---

## Key Features

### Smart Apply

Smart Apply is the central workflow in RoleClear.

It can:

- Extract and normalize job information from a job URL or description
- Analyze job requirements
- Compare the job against the user's resume
- Calculate Resume Fit
- Surface missing or weak requirements
- Identify skill gaps
- Show job-quality / Ghost Risk signals
- Rank resume evidence against job requirements
- Generate a targeted resume version
- Preserve candidate truth through claim validation
- Export an editable ATS-friendly `.docx`
- Continue directly into application tracking

---

### Resume Intelligence

RoleClear parses uploaded resumes into a structured candidate profile.

Supported resume information includes:

- Personal information
- Professional summary
- Skills
- Experience
- Projects
- Education
- Certifications
- Publications
- Research
- Achievements
- Coursework
- Languages

Resume matching uses semantic similarity and evidence ranking to identify which parts of a candidate's profile best support a job requirement.

---

### Resume Studio

Resume Studio acts as the user's resume workspace.

Users can:

- Maintain a master resume
- Upload PDF and DOCX resumes
- Parse resume content
- Create job-specific resume versions
- View fit information
- Keep tailored versions separate from the master resume
- Download editable ATS-friendly Word resumes

A targeted version can retain metadata such as:

- Role
- Company
- Job URL
- Resume Fit
- Created date
- Tailoring state
- Claim-validation status

---

### Truthful Resume Tailoring

RoleClear is designed to improve presentation without fabricating candidate experience.

The tailoring pipeline may:

- Reorder skills
- Prioritize relevant experience
- Reorder existing bullets
- Select relevant projects
- Reorder project bullets
- Reduce less relevant content

It must **not** invent:

- Skills
- Work experience
- Project outcomes
- Certifications
- Education
- Metrics
- Unsupported achievements

Every tailored resume is checked against the original parsed resume through a **claim-validation layer**.

---

### ATS Checker

RoleClear includes a deterministic ATS-readiness checker.

It evaluates areas such as:

- Resume structure
- Section coverage
- Contact information
- Experience quality
- Action-oriented bullets
- Education
- Date consistency
- Content completeness
- Job-specific relevance

> The ATS score is a resume-readiness indicator. It is not presented as a prediction of any specific employer's ATS.

---

### Application Tracker

Applications can be organized across the full hiring pipeline.

Supported statuses include:

```text
Draft
Applied
Screening
Interview
Offer
Rejected
Withdrawn
```

Tracked information can include:

- Company
- Role
- Job URL
- Current status
- Date applied
- Resume version used
- Notes
- Follow-up information
- Application history

---

### Career Inbox

Career Inbox turns a noisy email inbox into a career-focused stream.

Current Gmail integration supports career-oriented workflows such as:

- Recruiter emails
- Application acknowledgements
- Screening updates
- Interview communication
- Rejection emails
- Hiring-process updates

RoleClear is not intended to replace Gmail. It provides a focused view of messages relevant to the user's job search.

---

### Career Feed

Career Feed brings together relevant career activity from the RoleClear workspace, including:

- Opportunities
- Application activity
- Career signals
- Inbox-driven updates

It is designed as an operational feed rather than an endless job-discovery feed.

---

### Dashboard

The dashboard serves as the user's command center.

It surfaces:

- Applications
- Responses
- Interviews
- Offers
- Resume health
- Recent applications
- Career Inbox updates
- Smart Apply activity
- Recent opportunities

---

### Analytics

RoleClear converts application history into useful feedback.

Current analytics include:

- Total applications
- Response rate
- Interviews
- Offers
- Application trends
- Role-family patterns
- Best-fit observations
- Career activity insights

Charts are generated from actual tracked application data rather than fabricated sample values.

---

### Ghost Job Risk

Ghost Job Risk is intentionally separate from Resume Fit.

Job-quality signals may consider:

- Missing posting dates
- Weak or incomplete company metadata
- Poorly structured job descriptions
- Missing responsibilities
- Missing candidate requirements
- Other posting-quality anomalies

A strong resume match does not automatically mean a job posting is high quality.

---

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Zustand
- Lucide React
- Custom responsive CSS
- Progressive Web App direction

### Backend

- FastAPI
- Python
- Pydantic
- HTTPX
- BeautifulSoup
- PyMuPDF
- python-docx

### AI / NLP

- Sentence Transformers
- MiniLM
- Semantic similarity
- Resume-to-job evidence ranking
- Requirement extraction
- Rule-based job-quality signals

### Authentication & Integrations

- Supabase Auth
- Google OAuth
- Gmail API

### Persistence

The current application uses a combination of:

- Zustand application state
- Browser persistence for local user workspace data
- Supabase-backed authentication/session handling

Production persistence is being finalized for deployment.

### Deployment

- Frontend target: **Vercel**
- Backend target: **Render**
- Production deployment: **in progress**

---

## Architecture

```text
                           ┌─────────────────────┐
                           │        User         │
                           └──────────┬──────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │ React + TypeScript + Vite│
                         │       Frontend          │
                         └───────────┬─────────────┘
                                     │
                   ┌─────────────────┼─────────────────┐
                   │                 │                 │
                   ▼                 ▼                 ▼
            Supabase Auth      FastAPI Backend   Local Workspace
                   │                 │               State
                   │                 │
                   │        ┌────────┼─────────┐
                   │        │        │         │
                   │        ▼        ▼         ▼
                   │     Resume    Job      Analytics
                   │     Engine   Analysis   Services
                   │        │        │
                   │        └────┬───┘
                   │             ▼
                   │      Matching / NLP
                   │
                   └─────────────┬──────────────
                                 │
                                 ▼
                         Google OAuth / Gmail
```

RoleClear is intentionally structured as a **modular monolith** for the MVP rather than unnecessary microservices.

---

## Important Backend Modules

```text
job_extractor.py
```

Extracts structured information from supported job pages.

```text
job_normalizer.py
```

Converts extracted job information into normalized requirements.

```text
resume_parser.py
```

Parses uploaded resumes into structured candidate information.

```text
resume_normalizer.py
```

Creates the normalized resume representation used during matching.

```text
match_engine.py
```

Calculates resume-to-job alignment.

```text
ml_evidence_ranker.py
```

Uses MiniLM-based semantic ranking to connect resume evidence with job requirements.

```text
resume_tailor.py
```

Builds targeted resume versions using safe selection and reordering.

```text
resume_docx.py
```

Creates editable ATS-friendly Word resumes.

---

## Selected API Flow

### Extract Job

```http
POST /api/v1/smart-apply/extract
```

### Parse Resume

```http
POST /api/v2/resumes/parse
```

### Analyze Job + Resume

```http
POST /api/v1/smart-apply/analyze
```

### Export Tailored Resume

```http
POST /api/v1/resume-export/tailored-docx
```

### Gmail OAuth

```text
GET /api/v1/email/gmail/authorize
GET /api/v1/email/gmail/callback
```

Additional endpoints are used for Gmail status, synchronization, and disconnect workflows.

---

## Project Structure

```text
roleclear_final/
│
├── public/
│   ├── roleclear-icon.svg
│   ├── roleclear-logo.svg
│   └── ...
│
├── src/
│   ├── App.tsx
│   ├── CareerFeed.tsx
│   ├── Analytics.tsx
│   ├── SettingsView.tsx
│   ├── useCareerStore.ts
│   ├── main.tsx
│   ├── index.css
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── schemas/
│   │   └── services/
│   ├── requirements.txt
│   └── ...
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Local Development

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd roleclear_final
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

---

## Backend Setup

### 1. Enter the backend directory

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python3 -m venv .venv
```

### 3. Activate it

macOS / Linux:

```bash
source .venv/bin/activate
```

Windows:

```bash
.venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Start FastAPI

```bash
uvicorn app.main:app --reload
```

Local backend:

```text
http://127.0.0.1:8000
```

---

## Environment Variables

Keep secrets outside Git.

Example backend variables:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/v1/email/gmail/callback

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Example frontend variables:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> Never expose `GOOGLE_CLIENT_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` through `VITE_*` variables.

---

## Google OAuth Development Redirect

For local Gmail integration, the Google OAuth Web Client must include the exact redirect URI:

```text
http://127.0.0.1:8000/api/v1/email/gmail/callback
```

OAuth redirect URIs must match exactly.

Production OAuth configuration will use the deployed backend callback URL.

---

## Security Principles

RoleClear is built around several important constraints:

- Never fabricate resume claims
- Validate tailored content against candidate evidence
- Keep OAuth secrets server-side
- Request only required Google scopes
- Keep secrets out of Git
- Treat Gmail data as user-sensitive
- Keep Resume Fit independent from Ghost Job Risk
- Avoid unsupported hiring-probability claims

---

## Product Philosophy

RoleClear is not intended to become another LinkedIn, Naukri, or Internshala clone.

Those platforms are primarily opportunity sources.

RoleClear is the **execution and intelligence layer around the application process**:

```text
Opportunity
   ↓
Decision
   ↓
Preparation
   ↓
Application
   ↓
Tracking
   ↓
Outcome
   ↓
Learning
```

The product is designed to help students spend less time guessing and more time making informed, high-quality applications.

---

## Current Status

### Completed

- Responsive landing experience
- Authentication flow
- Dashboard
- Smart Apply
- Job extraction and normalization
- Resume parsing
- Resume Fit analysis
- Semantic evidence ranking
- Skill-gap and requirement analysis
- Ghost Job Risk signals
- Resume Studio
- Safe resume tailoring
- Claim validation
- ATS-friendly Word export
- ATS Checker
- Application Tracker
- Career Feed
- Gmail-connected Career Inbox
- Career Analytics
- Settings and account interface
- RoleClear branding and app icon

### Next

- Production deployment
- Production OAuth configuration
- Production-grade per-user Gmail token persistence
- End-to-end production validation

---

## Why RoleClear?

Most job-search products stop at discovery.

RoleClear is built around what happens **after a student finds a job**.

> **Find the role. Understand the fit. Improve the application. Track the outcome. Learn from every attempt.**

---

<div align="center">

### ROLECLEAR

**Every Step Closer to Your First Yes.**

Built to make the first-job journey clearer.

</div>
