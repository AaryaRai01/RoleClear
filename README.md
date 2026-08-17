# RoleClear

> **Stop Guessing. Start Applying Smarter.**

[![Status](https://img.shields.io/badge/status-in%20development-orange.svg)](#project-status)
[![Frontend](https://img.shields.io/badge/frontend-Next.js-black.svg)](#tech-stack)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688.svg)](#tech-stack)
[![Database](https://img.shields.io/badge/database-Supabase-3ECF8E.svg)](#tech-stack)
[![License](https://img.shields.io/badge/license-TBD-lightgrey.svg)](#license)

**RoleClear** is a personal career operating system designed for college students, interns, graduates, and freshers.

Instead of being another job board, RoleClear helps users manage opportunities they discover across external platforms — from understanding a job and checking resume fit to tailoring their application, tracking progress, and learning from outcomes.

### Core Workflow

**Find → Understand → Match → Improve → Apply → Track → Learn**

---

## ✨ Features

### 🎯 Smart Apply
Bring a job opportunity into RoleClear using a URL, job description, or document and analyze it before applying.

- Job requirement extraction
- Resume-fit analysis
- Skill-gap identification
- Job-quality signals
- Ghost-job risk assessment
- Job-specific resume tailoring
- Link to the original application source

### 📄 Resume Intelligence

Manage resumes and create job-specific versions.

- Resume upload and parsing
- Resume health analysis
- Skills and experience extraction
- Resume-to-job matching
- Version history
- Tailored resume generation
- Downloadable resume versions

> AI-assisted tailoring must not fabricate skills, experience, achievements, or qualifications.

### 📋 Application Tracker

Keep every application organized in one place.

- Application status tracking
- Application timeline
- Kanban/list views
- Follow-up reminders
- Notes
- Resume version tracking
- Original job-source links

### 📬 Career Inbox

Connect a career email account and automatically organize relevant career updates.

- Gmail integration
- Outlook integration
- Application updates
- Interview notifications
- Rejection emails
- Recruiter-related updates
- Application-to-email association

RoleClear is **not intended to replace Gmail or Outlook**.

### 📊 Career Analytics

Understand how your applications are performing.

- Applications
- Responses
- Interviews
- Offers
- Response rate
- Interview conversion
- Resume-version performance

### 💡 Career Insights

Turn application history into actionable insights.

Examples:

- Roles producing the highest response rates
- Resume versions performing better
- Frequently requested missing skills
- Follow-up patterns
- Application trends

---

## 🏗️ Project Structure

```text
RoleClear/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── workers/
│   │   └── core/
│   ├── migrations/
│   └── tests/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── design/
│
├── .env.example
├── docker-compose.yml
└── README.md
