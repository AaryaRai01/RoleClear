<div align="center">

# RoleClear

### From job discovery to application outcome — in one career workspace.

**RoleClear is a personal career operating system for students and fresh graduates that analyzes job opportunities against their resumes, identifies skill gaps and application risks, and helps them tailor, apply, and track applications smarter.**

<br/>

![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=flat-square&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white)
![Gmail API](https://img.shields.io/badge/Gmail-API-EA4335?style=flat-square&logo=gmail&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=flat-square)

</div>

---

## Why RoleClear?

Students often apply to dozens of internships and entry-level roles without knowing:

- whether their resume actually matches the role,
- which requirements they already satisfy,
- which requirements are genuine gaps,
- whether their resume is ATS-readable,
- how to tailor their resume without exaggerating experience,
- where each application currently stands,
- or whether an important recruiter email has been missed.

Most tools solve only one part of this process.

**RoleClear connects the complete application journey.**

```text
Find Job
   ↓
Import into RoleClear
   ↓
Analyze Job
   ↓
Resume Fit
   ↓
Requirements & Skill Gaps
   ↓
Ghost Risk
   ↓
Tailor Resume
   ↓
Apply on Original Website
   ↓
Track Application
   ↓
Career Inbox
   ↓
Interview / Offer / Rejection
   ↓
Learn from Outcomes
```

> RoleClear is **not a job board**.  
> You find opportunities wherever you normally search and bring the role into RoleClear for analysis.

---

# Core Workflow

## 1. Smart Apply

Bring an external job posting into RoleClear using its original URL.

RoleClear extracts and normalizes the job information before comparing it with the candidate's parsed resume.

The analysis considers multiple dimensions instead of performing a simple keyword count:

- capabilities,
- experience,
- responsibilities,
- eligibility,
- preferred qualifications,
- relevant work samples/projects.

The result is presented as a structured application decision rather than a generic similarity percentage.

---

## 2. Resume Fit Analysis

RoleClear compares the normalized job requirements against evidence found in the candidate's resume.

The analysis provides:

- overall Resume Fit,
- matched requirements,
- missing requirements,
- preferred requirement alignment,
- experience alignment,
- responsibility alignment,
- relevant project/work-sample evidence,
- eligibility alignment,
- explanation of why the score was produced.

### Evidence-first matching

RoleClear does not assume that mentioning a technology automatically proves every related requirement.

For example:

```text
Requirement
1 year of object-oriented programming experience

Resume evidence
9 months of verified relevant experience

Result
Partially satisfied
```

Quantified requirements can therefore be evaluated separately from general capability matches.

---

## 3. Requirement Gap Analysis

Instead of only showing a score, RoleClear separates:

```text
Matched Requirements
Partial Matches
Missing Requirements
Preferred Qualifications
```

This helps candidates understand **why** they are or are not a strong fit before spending time on an application.

---

## 4. Ghost Risk

RoleClear includes a Ghost Risk layer designed to surface signals that may indicate a lower-quality or potentially stale opportunity.

The feature is intended to help candidates prioritize where they spend their application effort.

Ghost Risk is presented separately from Resume Fit because:

> **“Am I qualified?” and “Is this opportunity worth applying to?” are different questions.**

This component is being developed further as RoleClear evolves.

---

# Resume Intelligence

## Resume Parser

RoleClear includes its own structured resume parsing pipeline for:

- PDF
- DOCX
- TXT

The parser extracts:

```text
Personal Information
Summary
Skills
Work Experience
Projects
Education
Certifications
Research / Publications
Achievements
Coursework
Links
Additional Sections
```

It also handles resume structures such as:

```text
Company Name                     Dec 2025 – Jan 2026
Cloud Computing Intern
• Built ...
• Implemented ...
```

rather than requiring every experience field to appear on a single line.

### Parsing pipeline

```text
Resume File
     ↓
Text + Link Extraction
     ↓
Section Detection
     ↓
Structured Entity Extraction
     ↓
Normalization
     ↓
Canonical Resume Representation
     ↓
Job Matching Engine
```

The parser also retains parsing metadata and warnings so downstream scoring does not silently treat uncertain extraction as verified evidence.

---

# ATS Checker

RoleClear includes an independent **ATS Readiness Checker**.

It does not claim to reproduce a proprietary employer ATS score. Instead, it evaluates deterministic resume-readiness criteria that RoleClear can actually verify.

### ATS Readiness

The current scoring model evaluates:

| Category | Weight |
|---|---:|
| ATS Parsing & Structure | 30 |
| Experience Impact | 30 |
| Core Information | 25 |
| Consistency & Readability | 15 |
| **Total** | **100** |

Checks include:

- supported file format,
- parser confidence,
- successful section extraction,
- contact information,
- structured experience,
- machine-readable dates,
- bullet quality,
- action verbs,
- quantified achievements,
- bullet length,
- repeated sentence openings,
- punctuation consistency,
- skill-section quality,
- education completeness,
- chronological experience ordering,
- date consistency,
- excessive text density.

Each failed or partial check includes:

```text
Problem
↓
Detected Evidence
↓
Point Deduction
↓
Recommended Fix
```

### No artificial penalties

RoleClear does **not** penalize candidates for optional resume elements such as:

- professional summary,
- full address/location,
- LinkedIn,
- certifications,
- achievements,
- publications/research.

The score focuses on core ATS readability and resume quality.

---

# Resume Tailor

RoleClear provides a job-specific tailoring workspace after the match analysis.

The core rule is simple:

> **Tailor presentation — never fabricate experience.**

RoleClear can prioritize:

- relevant existing skills,
- relevant experience,
- relevant projects,
- relevant technologies,
- stronger existing bullets.

It can reorder existing resume evidence according to the target role while preserving the original information.

### What RoleClear does not do

It does not silently invent:

- skills,
- employment,
- projects,
- certifications,
- achievements,
- experience duration.

Missing requirements remain visible as genuine gaps.

---

# Application Tracker

Once the candidate completes an application on the employer's original website, they can confirm:

```text
I've applied
```

RoleClear then creates a real tracked application.

Current statuses include:

```text
Applied
Screening
Interview
Offer
Rejected
Withdrawn
```

The tracker uses a Kanban-style workflow to provide a clear view of the candidate's application pipeline.

Applications can be:

- searched,
- filtered,
- sorted,
- opened individually,
- updated,
- deleted.

Only applications actually added by the user appear in the tracker.

---

# Career Inbox

Application tracking should not depend entirely on manually remembering to update a Kanban card.

RoleClear's **Career Inbox** connects employer communication with application progress.

```text
Gmail
   ↓
RoleClear Career Inbox
   ↓
Career Email Detection
   ↓
Signal Classification
   ↓
Application Matching
   ↓
Suggested Status
   ↓
User Confirmation
   ↓
Application Tracker Updated
```

RoleClear can classify career-related communication into signals such as:

```text
Application Update
Screening
Interview
Recruiter Outreach
Offer
Rejection
```

For example:

```text
Microsoft Recruiting

Subject:
Invitation to Technical Interview

RoleClear:
Detected → Interview
Linked Application → Microsoft Software Engineering Intern
Suggested Status → Interview
```

The candidate then confirms the change before RoleClear modifies the tracker.

### Gmail Integration

Gmail integration is currently being developed using:

- Google OAuth 2.0,
- Gmail API,
- read-only Gmail permission,
- FastAPI OAuth callback,
- refresh-token support,
- duplicate message protection.

RoleClear requests read-only mailbox access for this workflow and does not require permission to send or delete emails.

---

# Canonical Matching Architecture

One of the core engineering decisions in RoleClear is converting both resumes and job descriptions into normalized representations before matching them.

```text
JOB DESCRIPTION
      │
      ▼
Job Extraction
      │
      ▼
Job Normalization
      │
      ├── Capabilities
      ├── Experience
      ├── Responsibilities
      ├── Eligibility
      └── Preferred Requirements
      │
      ▼
┌───────────────────────┐
│    MATCHING ENGINE    │
└───────────────────────┘
      ▲
      │
Resume Normalization
      ▲
      │
Structured Resume Parser
      ▲
      │
RESUME
```

This prevents the application from depending entirely on brittle raw keyword comparisons.

The representation is designed to remain usable across different role families including:

- Software Engineering
- AI / Data
- Finance
- Accounting
- Marketing
- Sales
- Operations
- HR
- Product
- Design
- Healthcare

---

# Current Technology Stack

### Frontend

| Technology | Usage |
|---|---|
| React 18 | Application UI |
| TypeScript | Type-safe frontend |
| Vite | Development/build tooling |
| Zustand | Client-side application state |
| Lucide React | UI iconography |
| Custom CSS | RoleClear design system |

### Backend

| Technology | Usage |
|---|---|
| Python | Core backend and analysis |
| FastAPI | REST API |
| Pydantic | Validation and canonical schemas |
| HTTPX | External HTTP/OAuth requests |
| BeautifulSoup | Job-page extraction |
| PyMuPDF | PDF resume extraction |
| python-docx | DOCX resume parsing |

### Integrations

| Integration | Purpose |
|---|---|
| Google OAuth 2.0 | Gmail authorization |
| Gmail API | Career email synchronization |
| Employer career sites | External job source |

### Planned Infrastructure

RoleClear is being designed to move persistent user data from local prototype storage into production-ready storage/authentication as development progresses.

---

# Project Architecture

```text
roleclear_final/
│
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── store/
│   │   └── useCareerStore.ts
│   ├── lib/
│   │   └── smartApply.ts
│   └── types/
│       └── analysis.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── smart_apply.py
│   │   │       ├── resumes.py
│   │   │       └── email.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── canonical.py
│   │   │   ├── resume.py
│   │   │   └── smart_apply.py
│   │   │
│   │   ├── services/
│   │   │   ├── job_extractor.py
│   │   │   ├── job_normalizer.py
│   │   │   ├── resume_parser.py
│   │   │   ├── resume_normalizer.py
│   │   │   ├── match_engine.py
│   │   │   └── gmail_service.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
└── README.md
```

---

# Current Development Status

RoleClear is under **active development**.

### Implemented / Functional

- [x] External job URL import
- [x] Job-page extraction
- [x] Job normalization
- [x] PDF/DOCX/TXT resume parsing
- [x] Structured resume normalization
- [x] Canonical job-resume matching
- [x] Resume Fit analysis
- [x] Required requirement matching
- [x] Preferred requirement matching
- [x] Quantified experience comparison
- [x] Requirement gap detection
- [x] Ghost Risk V1
- [x] ATS Readiness Checker
- [x] Evidence-preserving Resume Tailor V1
- [x] External application handoff
- [x] Application confirmation
- [x] Persistent Application Tracker V1
- [x] Application status workflow
- [x] Career Inbox event model
- [x] Career email classification V1
- [x] Application ↔ email signal linking V1

### In Progress

- [ ] Gmail OAuth integration testing
- [ ] Gmail Career Inbox synchronization
- [ ] Improved employer-email ↔ application matching
- [ ] Persistent database layer
- [ ] User authentication
- [ ] Dashboard migration from prototype data
- [ ] Career analytics
- [ ] Improved Ghost Risk intelligence
- [ ] Production deployment architecture

---

# Design Principles

RoleClear is being developed around five principles.

### 1. Evidence over assumptions

Scores should be explainable from actual resume and job evidence.

### 2. Never fabricate candidate experience

Resume tailoring must preserve factual candidate information.

### 3. Separate candidate fit from job quality

Resume Fit and Ghost Risk answer different questions.

### 4. User confirmation for consequential actions

An email suggesting an interview should not silently change an application state.

### 5. Build for early-career candidates

RoleClear is specifically designed around:

- college students,
- final-year students,
- fresh graduates,
- internship applicants,
- entry-level job seekers.

---

# Example Journey

```text
A student finds a Software Engineering Internship
on an employer's careers website.

                    ↓

Copies the URL into RoleClear Smart Apply

                    ↓

RoleClear extracts the job description

                    ↓

Student uploads their resume

                    ↓

RoleClear returns:

Resume Fit                  64%
Capabilities                87%
Experience                  45%
Responsibilities            30%
Eligibility                 89%

3 / 4 required requirements strongly supported

Experience:
9 / 12 required months verified

                    ↓

Student reviews the missing requirement

                    ↓

RoleClear prioritizes relevant existing resume evidence

                    ↓

Student applies on the employer's original website

                    ↓

Clicks "I've applied"

                    ↓

Application enters RoleClear Tracker

                    ↓

Recruiter sends an interview email

                    ↓

Career Inbox detects:

"Interview"

                    ↓

Student confirms the suggested status

                    ↓

Application moves:

Applied → Interview
```

That end-to-end feedback loop is the core idea behind **RoleClear**.

---

# Running Locally

## Frontend

```bash
npm install
npm run typecheck
npx vite --port 4001
```

Frontend:

```text
http://localhost:4001
```

## Backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

---

# Gmail Development Setup

The Career Inbox Gmail integration requires a Google OAuth 2.0 Web Application and Gmail API access.

Create:

```text
backend/.env
```

with:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/v1/email/gmail/callback
GMAIL_TOKEN_PATH=.roleclear_gmail_tokens.json
```

Never commit OAuth secrets or token files.

Add to `.gitignore`:

```gitignore
backend/.env
.roleclear_gmail_tokens.json
backend/.roleclear_gmail_tokens.json
```

---

# What RoleClear Is Not

RoleClear is intentionally **not**:

- another job listing aggregator,
- an auto-apply spam tool,
- a resume keyword-stuffing tool,
- a fake universal ATS predictor,
- a system that invents candidate qualifications.

The objective is to help candidates make **better application decisions with clearer evidence**.

---

# Roadmap

The next development phases focus on connecting the currently functional modules into a persistent production system:

```text
Gmail Career Inbox
        ↓
Persistent User Accounts
        ↓
Database-backed Applications
        ↓
Career Analytics
        ↓
Improved Risk Intelligence
        ↓
Outcome Learning
        ↓
Production Deployment
```

Longer term, application outcomes can become useful feedback for helping candidates understand which types of opportunities produce better responses for their profile.

---

# Project Status

> **RoleClear is currently under active development.**

The repository represents an evolving working product. Some modules are fully functional locally, while integrations and production infrastructure are still being developed and tested.

The focus is currently on completing the full:

**Job → Resume → Analysis → Tailor → Apply → Track → Inbox → Outcome**

pipeline before expanding the platform further.

---

<div align="center">

### Stop guessing. Start applying smarter.

**RoleClear**

Built for students and fresh graduates navigating their first serious job search.

</div>
