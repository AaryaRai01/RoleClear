# RoleClear

> **Stop Guessing. Start Applying Smarter.**

![Status](https://img.shields.io/badge/status-active%20development-orange)
![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20TypeScript%20%2B%20Vite-646CFF)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![ML](https://img.shields.io/badge/ML-MiniLM%20Semantic%20Ranking-blue)
![Resume Export](https://img.shields.io/badge/resume%20export-DOCX-2B579A)

## Overview

**RoleClear** is a personal career operating system for students, interns, fresh graduates, and early-career applicants.

It is not a job board. RoleClear is designed to help users bring in opportunities they discover elsewhere, understand the role, compare it against their resume, improve their application, apply through the original source, and track the outcome.

### Core Workflow

**Find → Understand → Match → Improve → Apply → Track → Learn**

---

## Product Vision

Applying for jobs is fragmented across job portals, resumes, email, spreadsheets, notes, and application trackers.

RoleClear brings those workflows together into one application journey:

1. Import a job opportunity.
2. Parse the job description.
3. Parse the candidate resume.
4. Measure resume-to-job alignment.
5. Identify missing or weak evidence.
6. Tailor the resume without fabricating claims.
7. Download a job-specific editable resume.
8. Apply through the original employer page.
9. Track the exact resume version used.
10. Learn from application outcomes over time.

---

# Core Features

## Smart Apply

Smart Apply is the primary application workflow.

Users can bring a job into RoleClear using:

- Public job URL
- Pasted job description
- Uploaded job document

### Smart Apply Pipeline

```text
Job URL / Description
        ↓
Job Extraction
        ↓
Job Normalization
        ↓
Resume Parsing
        ↓
Resume ↔ Job Matching
        ↓
Resume Fit
        ↓
Skill & Evidence Gaps
        ↓
Resume Tailoring
        ↓
Claim Validation
        ↓
Editable Word Resume
        ↓
Original Application Page
        ↓
Application Tracker
```

### Smart Apply Capabilities

- Public career-page job extraction
- Structured job-title, company, location and description extraction
- Required vs preferred qualification identification
- Job requirement normalization
- Resume upload and parsing
- Resume Fit scoring
- Matched requirement detection
- Missing requirement detection
- Experience relevance analysis
- Project relevance analysis
- Job-quality signals
- Ghost-job risk indicators
- Job-specific resume tailoring
- Safe claim validation
- Editable `.docx` generation
- Resume version tracking
- Original application-source linking
- Application creation in tracker

---

## Resume Fit Analysis

RoleClear compares a candidate resume with a normalized job profile.

The system evaluates:

- Technical skills
- Programming languages
- Frameworks and tools
- Education
- Internship and work experience
- Projects
- Responsibilities
- Job-domain relevance
- Preferred qualifications
- Role-family alignment

### Current Scoring Direction

The current Resume Fit engine is being recalibrated toward a **market-style hybrid score**.

The next scoring version will balance:

- Keyword overlap
- Skill coverage
- Semantic similarity
- Education alignment
- Experience alignment
- Project relevance
- Role-family match
- Preferred qualifications
- Evidence strength

The goal is to produce a score that is useful and intuitive for applicants while still keeping explainable evidence underneath.

> Resume Fit is an alignment score, not a prediction of whether a recruiter or ATS will select the candidate.

---

## 🤖 Machine Learning

RoleClear uses machine learning primarily for semantic evidence retrieval and ranking.

## Current ML Model

**Model:** `sentence-transformers/all-MiniLM-L6-v2`

### Purpose

The ML model is used to rank which parts of the resume best support a job requirement.

Example:

```text
Job Requirement
"Experience developing scalable backend APIs"

        ↓ MiniLM semantic ranking

Resume Evidence

1. Vistalane backend APIs
2. Adonmo NestJS services
3. RoleClear FastAPI backend
4. Pingit serverless APIs
```

The ML model does **not** create experience or alter candidate facts.

It ranks existing resume evidence.

---

## ML Pipeline

```text
Job Requirement
      ↓
Requirement normalization
      ↓
Resume evidence extraction
      ↓
Sentence embeddings
      ↓
Cosine similarity
      ↓
Evidence ranking
      ↓
Top evidence returned
```

Resume evidence units include:

- Summary
- Skills
- Experience
- Experience bullets
- Projects
- Project bullets
- Education

Planned expansion:

- Certifications
- Research
- Publications
- Achievements

---

## ML Evaluation

RoleClear's current semantic evidence ranker was evaluated on a small development/silver dataset.

### MiniLM Results

| Metric | Result |
|---|---:|
| NDCG@3 | 0.7767 |
| NDCG@5 | 0.8661 |
| Precision@1 | 0.7500 |
| Precision@3 | 0.5625 |
| Recall@3 | 0.7938 |
| MRR | 0.8562 |

Evaluation size:

```text
16 requirement queries
```

These values are development metrics used to compare ranking approaches. They are **not production accuracy claims**.

A LambdaMART experiment was also tested, but the MiniLM ranking approach performed better for the current dataset and was selected for V1.

---

## 📄 Resume Intelligence

RoleClear converts uploaded resumes into structured candidate profiles.

## Parsed Resume Sections

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
- Languages
- Coursework
- Other sections

## Supported Workflows

- Resume upload
- PDF parsing
- DOCX parsing
- Structured profile generation
- Skills extraction
- Experience extraction
- Education extraction
- Project extraction
- Resume-to-job matching
- Job-specific resume versions

---

## 🧩 Resume Studio

Resume Studio is the candidate's resume workspace.

## Master Resume

Users maintain one primary resume profile containing:

- Personal details
- Education
- Experience
- Projects
- Skills
- Certifications
- Achievements
- Research
- Publications
- Links

## Targeted Resume Versions

RoleClear creates job-specific resume snapshots without overwriting the Master Resume.

Each version can store:

- Job title
- Company
- Job URL
- Resume Fit score
- Tailored resume snapshot
- Backend version ID
- Claim-validation status
- Date created

---

## 🛡️ Safe Resume Tailoring

RoleClear currently uses a **selection and reordering** tailoring strategy.

The system may:

- Reorder skills
- Prioritize relevant experience
- Reorder existing experience bullets
- Select relevant projects
- Reorder project bullets
- Reduce less-relevant content

The system must not:

- Invent skills
- Invent work experience
- Invent project outcomes
- Invent certifications
- Invent education
- Fabricate metrics
- Add unsupported claims

---

## Claim Validation

Every tailored resume is checked against the original parsed resume.

The validator verifies that generated content comes from existing candidate evidence.

Example response:

```text
Claim Validation: passed
Unsupported claims: []
```

This safety layer is a core part of the tailoring pipeline.

---

## 📝 Editable Word Resume Generation

RoleClear generates ATS-friendly editable Word resumes.

Backend endpoint:

```text
POST /api/v1/resume-export/tailored-docx
```

The generated resume uses:

- Standard headings
- Simple text layout
- Bullet lists
- ATS-friendly formatting
- Editable `.docx` output
- No tables
- No text boxes
- No complex graphics
- No multi-column layout

The downloaded Word file can be edited locally before submission.

---

## ✅ ATS Checker

RoleClear includes a deterministic ATS-readiness checker.

It can analyze:

- Resume structure
- Section presence
- Contact information
- Experience content
- Action-oriented bullets
- Date consistency
- Education
- Job-specific relevance
- Resume content completeness

The ATS score is intended as a resume-readiness indicator and not as a prediction of a specific employer ATS.

---

## 📋 Application Tracker

RoleClear tracks job applications after the user applies.

## Supported Statuses

- Draft
- Applied
- Screening
- Interview
- Offer
- Rejected
- Withdrawn

## Tracked Information

- Company
- Role
- Job URL
- Application status
- Date applied
- Resume version used
- Notes
- Follow-up information
- Application history

---

## 📬 Career Inbox

Career Inbox helps users organize job-related email updates.

## Current Direction

- Gmail integration
- Career-email filtering
- Application-related email detection
- Interview notifications
- Recruiter communication
- Rejection emails
- Application updates

RoleClear is not designed to replace Gmail or Outlook.

It provides a career-specific view of relevant messages.

---

## 🏠 Dashboard

The RoleClear dashboard brings together:

- Active applications
- Recent opportunities
- Resume activity
- Career Inbox updates
- Application progress
- Interview activity
- Resume versions
- Smart Apply activity

---

## 📊 Career Analytics

Planned and partially implemented analytics include:

- Applications submitted
- Response rate
- Interviews
- Offers
- Rejections
- Resume-version performance
- Application conversion
- Common skill gaps
- Role-category performance
- Application trends

---

## 👻 Ghost Job Risk

RoleClear includes rule-based job-quality signals.

Signals may include:

- Missing posting date
- Missing company metadata
- Weak job-description structure
- Missing responsibilities
- Missing candidate requirements
- Other posting-quality anomalies

Ghost Risk is independent from Resume Fit.

---

## 🏗️ Architecture

## Frontend

- React 18
- TypeScript
- Vite
- Zustand
- Lucide Icons
- Custom CSS
- Progressive Web App direction

## Backend

- FastAPI
- Python
- Pydantic v2
- HTTPX
- BeautifulSoup
- PyMuPDF
- python-docx

### 🤖 Machine Learning

- Sentence Transformers
- MiniLM
- Semantic similarity
- Evidence ranking

## Persistence

Current MVP persistence includes:

- Browser `localStorage`
- Resume version storage
- Application state

Planned production persistence:

- Supabase / PostgreSQL
- User authentication
- Cloud-backed resume storage
- Persistent application data

---

## 📁 Current Project Structure

```text
roleclear_final/
│
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── test_tailoring.py
│   └── test_docx_export.py
│
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚙️ Important Backend Components

```text
job_extractor.py
```

Extracts structured information from public job pages.

```text
job_normalizer.py
```

Converts extracted job data into canonical requirements.

```text
resume_parser.py
```

Converts uploaded resumes into structured profiles.

```text
resume_normalizer.py
```

Creates the canonical resume representation used by the matcher.

```text
match_engine.py
```

Calculates resume-to-job alignment.

```text
ml_evidence_ranker.py
```

Uses MiniLM to rank resume evidence against job requirements.

```text
resume_tailor.py
```

Builds targeted resumes using safe selection and reordering.

```text
resume_docx.py
```

Generates editable ATS-friendly Word resumes.

---

## 🔌 API Flow

## Job Extraction

```text
POST /api/v1/smart-apply/extract
```

## Resume Parsing

```text
POST /api/v2/resumes/parse
```

## Job Analysis

```text
POST /api/v1/smart-apply/analyze
```

## Resume Tailoring

```text
POST /api/v1/smart-apply/tailor
```

## Word Resume Export

```text
POST /api/v1/resume-export/tailored-docx
```

---

## 🚧 Development Status

## Working

- Smart Apply frontend
- Public job extraction
- Resume parsing
- Canonical resume model
- Canonical job model
- Deterministic matching
- MiniLM semantic evidence ranking
- Resume Fit pipeline
- Experience relevance
- Project relevance
- Ghost-risk signals
- ATS Checker
- Resume Tailoring
- Claim Validation
- Resume Studio foundation
- Editable Word resume generation
- Application Tracker
- Career Inbox foundation
- Dashboard

## Currently Improving

- Resume Fit score calibration
- Cross-site job extraction consistency
- Required/preferred requirement classification
- Hybrid market-style scoring
- Smart Apply Step 2 UX
- Resume Studio end-to-end frontend integration
- Production persistence

---

## 🎯 Current Development Focus — Smart Apply V2

Smart Apply V2 is focused on making the match score more intuitive and useful while keeping the system explainable.

The next scoring approach will combine:

```text
Keyword Match
+ Skill Coverage
+ Semantic Similarity
+ Education Match
+ Experience Match
+ Project Match
+ Role-Family Match
+ Preferred Qualification Match
```

Semantic evidence will remain available for explanations, but the main Resume Fit score will no longer rely too heavily on strict evidence thresholds.

---

## 💻 Local Development

## Frontend

```bash
npm install
npm run dev
```

or:

```bash
npx vite --port 4001
```

Default development URL:

```text
http://localhost:4001
```

---

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Health check:

```text
GET /health
```

---

## 🧭 Product Principles

RoleClear is being built around the following principles:

1. **User evidence first**  
   Resume tailoring should never invent candidate facts.

2. **Explainable scoring**  
   Users should understand why a score was given.

3. **Original-source applications**  
   RoleClear helps users prepare, but applications are submitted on the employer's original website.

4. **Career workflow, not job aggregation**  
   RoleClear is a personal career operating system, not another job board.

5. **Privacy-conscious design**  
   Career data and resumes should be handled with minimal unnecessary exposure.

---

## 🗺️ Roadmap

## Smart Apply

- [x] Job URL import
- [x] Job extraction
- [x] Resume parsing
- [x] Requirement matching
- [x] Semantic evidence ranking
- [x] Ghost-risk signals
- [x] Resume tailoring
- [x] Claim validation
- [x] Word export
- [ ] Hybrid Resume Fit V2
- [ ] Compact Step 2 UX
- [ ] Production persistence

### 🧩 Resume Studio

- [x] Master profile foundation
- [x] Targeted resume snapshots
- [x] Resume version IDs
- [x] DOCX export backend
- [ ] Complete frontend persistence
- [ ] Version comparison
- [ ] Re-upload edited Word resumes

## Applications

- [x] Application tracking
- [x] Resume-version association
- [ ] Follow-up automation
- [ ] Calendar integration

### 📬 Career Inbox

- [x] Gmail integration foundation
- [x] Career-email filtering
- [ ] Application-to-email linking improvements
- [ ] Outlook integration

## Analytics

- [ ] Response-rate analytics
- [ ] Resume-version performance
- [ ] Skill-gap trends
- [ ] Application funnel analytics

---

## ⚠️ Disclaimer

RoleClear is an applicant productivity and career-management tool.

Resume Fit, ATS readiness, Ghost Risk, and other generated signals are advisory and should not be interpreted as guarantees of recruiter decisions, interview selection, or hiring outcomes.

---

## 📜 License

License information will be added before public release.
