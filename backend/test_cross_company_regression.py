from __future__ import annotations

import asyncio
import json
from dataclasses import asdict
from pathlib import Path
from typing import Any

from app.services.job_extractor import extract_job_from_url
from app.services.job_normalizer import normalize_job
from app.services.resume_parser import parse_resume
from app.services.resume_normalizer import normalize_resume
from app.services.match_engine import match_resume_to_job


# =========================================================
# CONFIG
# =========================================================

RESUME_PATH = Path(
    "/Users/aaryarai/Documents/Resume/Aarya Rai 1P Resume.pdf"
)

# Add/remove jobs here. Keep the same resume for cross-job regression.
JOBS = [
    {
        "name": "Microsoft SWE Intern",
        "url": (
            "https://apply.careers.microsoft.com/careers/job/"
            "1970393556911730?domain=microsoft.com&hl=en"
        ),
        "expected_role_family": "engineering",
    },
    {
        "name": "Google GDC AI Applications",
        "url": (
            "https://www.google.com/about/careers/applications/jobs/results/"
            "126988379509138118-software-engineer-gdc-ai-applications-and-agents"
        ),
        "expected_role_family": "engineering",
    },
    {
        "name": "Google YouTube Full Stack",
        "url": (
            "https://www.google.com/about/careers/applications/jobs/"
            "recommendations/74698303731573446-software-engineer-youtube-full-stack"
        ),
        "expected_role_family": "engineering",
    },
]


# =========================================================
# HELPERS
# =========================================================

def _round(value: float | int | None) -> float | None:
    if value is None:
        return None
    return round(float(value), 2)


def _serialize_match(result: Any) -> dict[str, Any]:
    return {
        "score": _round(result.score),
        "verdict": result.verdict,
        "breakdown": {
            "capabilities": _round(result.breakdown.capabilities),
            "experience": _round(result.breakdown.experience),
            "responsibilities": _round(result.breakdown.responsibilities),
            "eligibility": _round(result.breakdown.eligibility),
            "preferred": _round(result.breakdown.preferred),
        },
        "matched_required": list(result.matched_required),
        "missing_required": list(result.missing_required),
        "matched_preferred": list(result.matched_preferred),
        "requirements": [
            {
                "requirement": item.requirement,
                "level": item.level,
                "category": item.category,
                "score": _round(item.score),
                "matched": item.matched,
                "evidence": list(item.evidence),
            }
            for item in result.requirement_matches
        ],
        "experience": [
            {
                "title": item.title,
                "organization": item.organization,
                "score": _round(item.score),
                "matched_terms": list(item.matched_terms),
                "reasons": list(item.reasons),
            }
            for item in result.experience_matches
        ],
        "work_samples": [
            {
                "name": item.name,
                "sample_type": item.sample_type,
                "score": _round(item.score),
                "matched_terms": list(item.matched_terms),
                "reasons": list(item.reasons),
            }
            for item in result.work_sample_matches
        ],
        "explanation": list(result.explanation),
    }


def _sanity_checks(
    *,
    job_name: str,
    job: Any,
    result: Any,
    expected_role_family: str | None,
) -> list[str]:
    failures: list[str] = []

    if not job.title:
        failures.append("missing normalized job title")

    if not job.raw_description or len(job.raw_description.strip()) < 80:
        failures.append("job description too short")

    if not job.requirements:
        failures.append("no normalized requirements")

    if expected_role_family and job.role_family != expected_role_family:
        failures.append(
            f"role-family mismatch: expected={expected_role_family}, "
            f"actual={job.role_family}"
        )

    if result.score < 0 or result.score > 100:
        failures.append("final score outside 0-100")

    breakdown = result.breakdown
    for name in (
        "capabilities",
        "experience",
        "responsibilities",
        "eligibility",
        "preferred",
    ):
        value = getattr(breakdown, name)
        if value < 0 or value > 100:
            failures.append(f"{name} breakdown outside 0-100")

    # Detect the old artificial-floor/bucket bug.
    sample_scores = [
        round(item.score, 2)
        for item in result.work_sample_matches
    ]
    if len(sample_scores) >= 3 and len(set(sample_scores)) == 1:
        failures.append(
            f"all work samples have identical score {sample_scores[0]}"
        )

    exp_scores = [
        round(item.score, 2)
        for item in result.experience_matches
    ]
    if len(exp_scores) >= 3 and len(set(exp_scores)) == 1:
        failures.append(
            f"all experience entries have identical score {exp_scores[0]}"
        )

    # If every requirement gets exactly the same score, something is likely
    # bucketed again.
    req_scores = [
        round(item.score, 2)
        for item in result.requirement_matches
    ]
    if len(req_scores) >= 3 and len(set(req_scores)) == 1:
        failures.append(
            f"all requirements have identical score {req_scores[0]}"
        )

    return failures


# =========================================================
# ONE JOB
# =========================================================

async def run_job(
    config: dict[str, Any],
    resume: Any,
) -> dict[str, Any]:
    name = config["name"]
    url = config["url"]

    print("\n" + "=" * 88)
    print(name)
    print("=" * 88)

    try:
        extracted = await extract_job_from_url(url)
        job = normalize_job(extracted)
        result = match_resume_to_job(
            resume,
            job,
        )

        failures = _sanity_checks(
            job_name=name,
            job=job,
            result=result,
            expected_role_family=config.get(
                "expected_role_family"
            ),
        )

        print("Title:", job.title)
        print("Company:", job.company)
        print("Role family:", job.role_family)
        print("Extraction quality:", job.extraction_quality)
        print("Requirements:", len(job.requirements))
        print("Responsibilities:", len(job.responsibilities))
        print()
        print(
            "FINAL:",
            f"{result.score:.2f}",
            "|",
            result.verdict,
        )
        print(
            "Breakdown:",
            f"cap={result.breakdown.capabilities:.2f}",
            f"exp={result.breakdown.experience:.2f}",
            f"resp={result.breakdown.responsibilities:.2f}",
            f"elig={result.breakdown.eligibility:.2f}",
            f"pref={result.breakdown.preferred:.2f}",
        )

        print("\nRequired matches:")
        for item in result.requirement_matches:
            if item.level == "required":
                print(
                    f"  {item.score:6.2f}",
                    "PASS" if item.matched else "MISS",
                    "|",
                    item.category,
                    "|",
                    item.requirement,
                )

        print("\nExperience:")
        for item in result.experience_matches:
            print(
                f"  {item.score:6.2f}",
                "|",
                item.title,
                "@",
                item.organization,
            )

        print("\nWork samples:")
        for item in result.work_sample_matches:
            print(
                f"  {item.score:6.2f}",
                "|",
                item.name,
            )

        if failures:
            print("\nSANITY CHECKS: FAIL")
            for failure in failures:
                print(" -", failure)
        else:
            print("\nSANITY CHECKS: PASS")

        return {
            "name": name,
            "url": url,
            "status": "ok",
            "job": {
                "title": job.title,
                "company": job.company,
                "role_family": job.role_family,
                "extraction_quality": job.extraction_quality,
                "requirements": [
                    {
                        "name": item.name,
                        "level": item.level,
                        "category": item.category,
                        "source_text": item.source_text,
                    }
                    for item in job.requirements
                ],
                "responsibilities": list(job.responsibilities),
                "minimum_experience_months": (
                    job.minimum_experience_months
                ),
                "warnings": list(job.normalization_warnings),
            },
            "match": _serialize_match(result),
            "sanity_failures": failures,
        }

    except Exception as exc:
        print("ERROR:", type(exc).__name__, str(exc))

        return {
            "name": name,
            "url": url,
            "status": "error",
            "error_type": type(exc).__name__,
            "error": str(exc),
        }


# =========================================================
# MAIN
# =========================================================

async def main() -> None:
    if not RESUME_PATH.exists():
        raise FileNotFoundError(
            f"Resume not found: {RESUME_PATH}"
        )

    parsed_resume = parse_resume(
        file_name=RESUME_PATH.name,
        content=RESUME_PATH.read_bytes(),
    )

    resume = normalize_resume(
        parsed_resume
    )

    print("=" * 88)
    print("ROLECLEAR CROSS-COMPANY REGRESSION SUITE")
    print("=" * 88)
    print("Candidate:", resume.candidate_name)
    print("Resume:", RESUME_PATH)
    print("Jobs:", len(JOBS))

    results: list[dict[str, Any]] = []

    # Sequential on purpose: easier to debug rate limits / page failures.
    for config in JOBS:
        results.append(
            await run_job(
                config,
                resume,
            )
        )

    print("\n" + "=" * 88)
    print("SUMMARY")
    print("=" * 88)

    successful = [
        item
        for item in results
        if item["status"] == "ok"
    ]

    for item in successful:
        match = item["match"]
        print(
            f"{item['name']:<32}",
            f"{match['score']:>6.2f}",
            f"{match['verdict']:<14}",
            (
                "PASS"
                if not item["sanity_failures"]
                else "CHECK"
            ),
        )

    failed = [
        item
        for item in results
        if item["status"] != "ok"
    ]

    for item in failed:
        print(
            f"{item['name']:<32}",
            "ERROR",
            item.get("error", ""),
        )

    output_path = Path(
        "regression_results.json"
    )

    output_path.write_text(
        json.dumps(
            results,
            indent=2,
            ensure_ascii=False,
        )
    )

    print(
        "\nDetailed results saved to:",
        output_path,
    )


asyncio.run(main())
