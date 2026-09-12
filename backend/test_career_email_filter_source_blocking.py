from app.services.gmail_service import _career_message_score, _is_application_mail

cases = [
    (
        "DROP - Unstop job alert",
        "New internships matching your profile",
        "Unstop <updates@unstop.com>",
        "Recommended opportunities and hiring challenges for you.",
    ),
    (
        "DROP - Internshala newsletter",
        "Top internships this week",
        "Internshala <alerts@internshala.com>",
        "Jobs and internships picked for you. Manage job alerts.",
    ),
    (
        "DROP - Club ITC career mail",
        "Hiring opportunities for students",
        "Club ITC <hello@clubitc.example>",
        "Explore new openings and subscribe for weekly opportunities.",
    ),
    (
        "PASS - Amazon application confirmation",
        "Your application has been submitted",
        "Amazon Jobs <no-reply@amazon.jobs>",
        "Thank you for applying. We received your application for Software Development Engineer Intern.",
    ),
    (
        "PASS - Adobe assessment",
        "Adobe candidate assessment",
        "Adobe Talent Acquisition <talent@adobe.com>",
        "As the next step in your application, please complete the online assessment.",
    ),
]

for label, subject, sender, body in cases:
    score, reasons = _career_message_score(
        subject=subject,
        sender=sender,
        snippet=body,
        body_text=body,
    )
    accepted = _is_application_mail(
        subject=subject,
        sender=sender,
        snippet=body,
        body_text=body,
    )
    print(f"{label}: accepted={accepted} score={score} reasons={reasons}")
