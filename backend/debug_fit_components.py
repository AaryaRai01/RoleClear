"""
RoleClear Smart Apply scoring diagnostic.

Run from backend/ after replacing match_engine.py:

    python debug_fit_components.py

This module is intentionally small. Paste/import the exact CanonicalResume and
CanonicalJob objects used by your existing regression test, then call
print_fit_debug(resume, job).
"""

from app.services.match_engine import (
    _concept_coverage_score,
    _required_alignment_score,
    _preferred_alignment_score,
    _required_capability_score,
    _required_eligibility_score,
    _score_experience_entries,
    _score_responsibilities,
    _match_requirement,
    match_resume_to_job,
)


def print_fit_debug(resume, job):
    requirement_matches = [
        _match_requirement(req, resume)
        for req in job.requirements
    ]

    exp_score, _ = _score_experience_entries(job, resume)

    print("\n=== ROLECLEAR FIT V2 DEBUG ===")
    print("Job:", job.title)
    print("Role family:", job.role_family)
    print("Requirements:", len(job.requirements))
    print("Responsibilities:", len(job.responsibilities))

    print("\n--- REQUIREMENTS ---")
    for row in requirement_matches:
        print(
            f"[{row.level:9}] "
            f"[{row.category:12}] "
            f"score={row.score:.3f} "
            f"matched={row.matched} | "
            f"{row.requirement}"
        )

    print("\n--- COMPONENTS ---")
    print(
        "Concept coverage:",
        _concept_coverage_score(job, resume),
    )
    print(
        "Required alignment:",
        _required_alignment_score(requirement_matches),
    )
    print(
        "Preferred alignment:",
        _preferred_alignment_score(requirement_matches),
    )
    print(
        "Strict capability:",
        _required_capability_score(job, resume),
    )
    print(
        "Experience:",
        exp_score,
    )
    print(
        "Responsibilities:",
        _score_responsibilities(job, resume),
    )
    print(
        "Eligibility:",
        _required_eligibility_score(job, resume),
    )

    result = match_resume_to_job(resume, job)

    print("\n--- FINAL ---")
    print("Resume Fit:", result.score)
    print("Verdict:", result.verdict)
    print("Breakdown:", result.breakdown)
    print("Matched required:", len(result.matched_required))
    print("Missing required:", len(result.missing_required))
