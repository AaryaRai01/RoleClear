import re
from collections import Counter

from app.schemas.smart_apply import ExtractedJob, JobAnalysisResponse, MatchBreakdown
from app.services.job_extractor import extract_skills

STOP = {"the","and","for","with","that","this","from","your","you","our","are","will","have","has","job","role","work","team","experience"}

def tokens(text):
    return [x.lower() for x in re.findall(r"[A-Za-z][A-Za-z0-9+#.\-]{2,}", text) if x.lower() not in STOP]

def keyword_score(job_text, resume_text):
    words = [w for w,_ in Counter(tokens(job_text)).most_common(40) if len(w) >= 4]
    if not words: return 0
    resume = set(tokens(resume_text))
    return round(sum(w in resume for w in words) / len(words) * 100)

def analyze_job_against_resume(job: ExtractedJob, resume_text: str):
    job_text = " ".join([job.title or "", job.description, " ".join(job.qualifications), " ".join(job.responsibilities)])
    required = job.skills or extract_skills(job_text)
    resume_skills = set(extract_skills(resume_text))
    matched = [s for s in required if s in resume_skills]
    missing = [s for s in required if s not in resume_skills]
    skills = round(len(matched) / len(required) * 100) if required else 0
    keywords = keyword_score(job_text, resume_text)
    lower = resume_text.lower()
    project_markers = sum(x in lower for x in ["project","built","developed","implemented","created","designed","deployed"])
    projects = min(100, round((skills * .7) + min(project_markers * 6, 30)))
    experience = min(100, 45 + sum(x in lower for x in ["internship","intern","experience","developed","built","implemented"]) * 9)
    fit = round(skills*.40 + experience*.25 + projects*.20 + keywords*.15)

    risk_points = 0
    reasons = []
    if len(job.description.strip()) < 350:
        risk_points += 2; reasons.append("The job description is unusually short.")
    if not job.company:
        risk_points += 1; reasons.append("Company could not be verified from page metadata.")
    if not job.location:
        risk_points += 1; reasons.append("No clear location was detected.")
    for phrase in ["pay to apply","registration fee","processing fee","whatsapp only","guaranteed job"]:
        if phrase in job.description.lower():
            risk_points += 3; reasons.append(f"Suspicious phrase detected: {phrase}.")
    risk = "high" if risk_points >= 5 else "medium" if risk_points >= 2 else "low"
    if not reasons: reasons = ["No major risk signals were detected from available page data."]

    verdict = "Strong match" if fit >= 80 else "Worth considering" if fit >= 60 else "Possible, but needs tailoring" if fit >= 40 else "Weak current match"
    explanation = f"Your resume shows {len(matched)} of {len(required)} detected job skills. Weighted fit: {fit}%." if required else f"No reliable structured skill list was found; fit {fit}% relies on keyword, experience and project evidence."

    return JobAnalysisResponse(
        resume_fit=fit, ghost_risk=risk, ghost_risk_reasons=reasons,
        required_skills=required, matched_skills=matched, missing_skills=missing,
        verdict=verdict, explanation=explanation,
        breakdown=MatchBreakdown(skills=skills, keywords=keywords, experience=experience, projects=projects),
    )
