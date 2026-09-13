<div align="center">

<img src="roleclear.png" alt="RoleClear" width="260" />

**Every Step Closer to Your First Yes.**

RoleClear is a personal career operating system for students and early-career candidates. It brings the complete application journey into one place:

**Discover Opportunity → Verify Authenticity → Analyze Resume Match → Generate Tailored Resume → Apply → Track Progress → Learn from Outcomes**

## Core Philosophy

RoleClear is built around an **evidence-first** approach.

It prioritizes:
- Explainable scoring over opaque match percentages
- Evidence-backed recommendations over generic advice
- Safe resume tailoring without unsupported claims
- Actionable career signals instead of disconnected tools
- A complete application workflow from opportunity discovery to outcome tracking

## Main ML & Matching Features

### Resume–Job Matching
RoleClear compares a parsed resume with a job description across:
- Required and preferred qualifications
- Skills and capabilities
- Experience relevance
- Responsibility alignment
- Education and eligibility
- Projects and work evidence

The production system uses a deterministic matching engine for reliable scoring, with optional semantic evidence ranking using **Sentence Transformers / MiniLM**.

### Evidence-First Matching
Each job requirement is mapped back to real resume evidence from:
- Skills
- Experience
- Projects
- Education
- Certifications
- Achievements
- Publications
- Resume summary

This makes the match score explainable: users can see **why** something matched and what is still missing.

### ATS Readiness Checker
The standalone ATS Checker evaluates resumes without requiring a job description.

It checks:
- Structure and section completeness
- Contact information
- Experience quality
- Bullet strength
- Quantified impact
- Date consistency
- Education
- Readability
- ATS-friendly formatting

### Safe Resume Tailoring
RoleClear creates job-specific resume versions by selecting and reordering existing candidate evidence based on relevance.

It can:
- Prioritize relevant skills
- Reorder experience by relevance
- Select stronger project content
- Trim lower-value bullets
- Preserve the Master Resume
- Validate claims before returning the tailored version

No unsupported candidate claim is intentionally introduced.

## Product Features

### Smart Apply
Bring a role into RoleClear using a job URL, pasted job description, or uploaded job file. Smart Apply verifies the opportunity, parses the resume, analyzes fit, identifies gaps, and prepares the candidate for the next step.

### Resume Studio
Manage the Master Resume and job-specific resume versions with:
- Master Profile
- Target-role versions
- Tailored resumes
- Resume version history
- Editable ATS-friendly `.docx` export
- Claim validation

### Career Feed
A focused space for career opportunities and relevant application signals.

### Application Tracker
Track applications across:
- Draft
- Applied
- Screening
- Interview
- Offer
- Rejected
- Withdrawn

Tracked data can include company, role, job URL, status, dates, resume version, notes, and progress history.

### Career Inbox
Connect Gmail to surface career-related messages such as:
- Application confirmations
- Recruiter communication
- Interview updates
- Offers
- Rejections
- Hiring-process updates

The integration uses Google OAuth and the Gmail API with read-only access.

### Dashboard
A single view of:
- Applications
- Responses
- Interviews
- Offers
- Resume health
- ATS readiness
- Career Inbox signals
- Recent activity

### Analytics
RoleClear turns application activity into career metrics such as:
- Application volume
- Response rate
- Interview conversion
- Offer conversion
- Rejection trends
- Resume-version performance
- Application outcomes
- Skill-gap patterns

### Ghost Job Risk
RoleClear evaluates posting-quality signals separately from Resume Fit, including:
- Missing company information
- Missing posting date
- Weak or incomplete job descriptions
- Missing responsibilities
- Missing candidate requirements
- Other low-quality posting signals

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Zustand, Supabase Auth, Lucide Icons, Custom CSS  
**Backend:** FastAPI, Python, Pydantic, HTTPX, BeautifulSoup, PyMuPDF, python-docx  
**ML:** Sentence Transformers, MiniLM, Semantic Similarity, Evidence Ranking, Deterministic Matching  
**Integrations & Infrastructure:** Supabase, Google OAuth, Gmail API, Vercel, Render

## Production

- **Frontend:** Vercel
- **Backend API:** Render
- **Authentication:** Supabase
- **Career Inbox:** Gmail OAuth + Gmail API

## Links

- **Live App:** https://role-clear.vercel.app/
- **Repository:** https://github.com/AaryaRai01/RoleClear

---

Built to make the application process clearer, more explainable, and more useful from the first opportunity to the final outcome.
