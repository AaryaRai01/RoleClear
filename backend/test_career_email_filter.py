from app.services.gmail_service import _career_message_score

cases = [
    (
        "PASS - Amazon confirmation",
        "Your application has been submitted",
        "Amazon Jobs",
        "Thank you for applying. We received your application for Software Development Engineer Intern.",
    ),
    (
        "PASS - Adobe assessment",
        "Adobe candidate assessment",
        "Adobe Talent Acquisition",
        "As the next step in your application, please complete the online assessment.",
    ),
    (
        "PASS - Walmart interview",
        "Interview Invitation",
        "Walmart Recruiting",
        "We would like to invite you to interview for the position you applied for.",
    ),
    (
        "PASS - recruiter reply",
        "Re: Application for Software Engineer Intern",
        "Jane Recruiter",
        "Thanks for reaching out regarding your application for the Software Engineer Intern position.",
    ),
    (
        "DROP - ProPeers newsletter",
        "Jobs for you this week",
        "ProPeers",
        "Recommended opportunities based on your profile. Browse jobs and subscribe for weekly updates.",
    ),
    (
        "DROP - generic job alert",
        "20 new Software Engineer jobs",
        "Career Alerts",
        "New jobs for you. View all jobs and similar roles.",
    ),
]

for label, subject, sender, body in cases:
    score, reasons = _career_message_score(
        subject=subject,
        sender=sender,
        snippet=body,
        body_text=body,
    )
    print(f"{label}: score={score} reasons={reasons}")
