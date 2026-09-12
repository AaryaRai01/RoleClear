from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

from app.schemas.canonical import (
    CanonicalJob,
    CanonicalRequirement,
)
from app.services.job_extractor import (
    JobExtractionError,
    extract_job_from_url,
)
from app.services.job_normalizer import normalize_job
from app.services.match_engine import match_resume_to_job
from app.services.resume_normalizer import normalize_resume
from app.services.resume_parser import parse_resume


# =========================================================
# CONFIG
# =========================================================

RESUME_PATH = Path(
    "/Users/aaryarai/Documents/Resume/Aarya Rai 1P Resume.pdf"
)

OUTPUT_PATH = Path(
    "regression_results_v2.json"
)


# =========================================================
# DETERMINISTIC FIXTURES
# =========================================================

def req(
    name: str,
    *,
    level: str = "required",
    category: str = "competency",
    source_text: str | None = None,
    importance: float = 1.0,
) -> CanonicalRequirement:
    return CanonicalRequirement(
        name=name,
        normalized_name=None,
        level=level,
        category=category,
        source_text=source_text or name,
        source_section="fixture",
        importance=importance,
    )


FIXTURE_JOBS: list[dict[str, Any]] = [
    {
        "id": "swe_intern",
        "name": "Fixture — Software Engineering Intern",
        "job": CanonicalJob(
            title="Software Engineering Intern",
            company="FixtureCo",
            role_family="engineering",
            responsibilities=[
                "Develop and test software features.",
                "Collaborate with engineers to design reliable solutions.",
                "Write and maintain APIs and backend services.",
            ],
            requirements=[
                req(
                    "Currently pursuing a Bachelor's degree in Computer Science or Engineering.",
                    category="education",
                ),
                req(
                    "Object-oriented programming experience.",
                    category="experience",
                ),
                req(
                    "Understanding of data structures and algorithms.",
                    category="competency",
                ),
                req(
                    "Software development experience.",
                    category="experience",
                ),
                req(
                    "Cloud or backend development exposure.",
                    level="preferred",
                    category="competency",
                ),
            ],
            minimum_experience_months=0,
            education_requirements=[
                "Currently pursuing a Bachelor's degree in Computer Science or Engineering."
            ],
            raw_description=(
                "Software Engineering Intern role requiring programming, "
                "data structures, algorithms, backend development and teamwork."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "engineering",
    },
    {
        "id": "senior_swe",
        "name": "Fixture — Senior Software Engineer",
        "job": CanonicalJob(
            title="Senior Software Engineer",
            company="FixtureCo",
            role_family="engineering",
            responsibilities=[
                "Lead architecture for distributed backend systems.",
                "Own production reliability and system design decisions.",
                "Mentor engineers and drive large-scale technical delivery.",
            ],
            requirements=[
                req(
                    "5 years of professional software development experience.",
                    category="experience",
                ),
                req(
                    "Distributed systems and system design.",
                    category="competency",
                ),
                req(
                    "Technical leadership and mentoring.",
                    category="soft_skill",
                ),
                req(
                    "Production reliability and observability.",
                    category="competency",
                ),
                req(
                    "Kubernetes experience.",
                    level="preferred",
                    category="technical_skill",
                ),
            ],
            minimum_experience_months=60,
            raw_description=(
                "Senior engineering role requiring five years of professional "
                "software experience, distributed systems, leadership and "
                "production ownership."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "engineering",
    },
    {
        "id": "data_analyst",
        "name": "Fixture — Data Analyst",
        "job": CanonicalJob(
            title="Data Analyst",
            company="Fixture Analytics",
            role_family="data",
            responsibilities=[
                "Analyze datasets and generate business insights.",
                "Build SQL queries and dashboards.",
                "Communicate findings to stakeholders.",
            ],
            requirements=[
                req(
                    "SQL and data analysis skills.",
                    category="competency",
                ),
                req(
                    "Analytical problem solving.",
                    category="soft_skill",
                ),
                req(
                    "Dashboarding or reporting experience.",
                    category="experience",
                ),
                req(
                    "Python or spreadsheet analysis.",
                    level="preferred",
                    category="tool",
                ),
            ],
            raw_description=(
                "Data analyst role focused on SQL, analysis, reporting and "
                "stakeholder communication."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "data",
    },
    {
        "id": "business_analyst",
        "name": "Fixture — Business Analyst",
        "job": CanonicalJob(
            title="Business Analyst",
            company="Fixture Consulting",
            role_family="operations",
            responsibilities=[
                "Gather and document business requirements.",
                "Analyze workflows and recommend process improvements.",
                "Coordinate with business and technical stakeholders.",
            ],
            requirements=[
                req(
                    "Business requirements analysis.",
                    category="domain_skill",
                ),
                req(
                    "Stakeholder management and communication.",
                    category="soft_skill",
                ),
                req(
                    "Process analysis and documentation.",
                    category="domain_skill",
                ),
                req(
                    "SQL or data analysis exposure.",
                    level="preferred",
                    category="tool",
                ),
            ],
            raw_description=(
                "Business analyst role focused on requirements gathering, "
                "process improvement, documentation and stakeholder coordination."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "operations",
    },
    {
        "id": "finance_analyst",
        "name": "Fixture — Financial Analyst",
        "job": CanonicalJob(
            title="Financial Analyst",
            company="Fixture Finance",
            role_family="finance",
            responsibilities=[
                "Prepare budgets and financial forecasts.",
                "Perform variance and financial analysis.",
                "Build financial models and management reports.",
            ],
            requirements=[
                req(
                    "Financial analysis and financial modeling.",
                    category="domain_skill",
                ),
                req(
                    "Budgeting and forecasting.",
                    category="domain_skill",
                ),
                req(
                    "Accounting fundamentals.",
                    category="competency",
                ),
                req(
                    "Advanced Excel skills.",
                    category="tool",
                ),
                req(
                    "Bachelor's degree in Finance, Accounting or Economics.",
                    category="education",
                ),
            ],
            education_requirements=[
                "Bachelor's degree in Finance, Accounting or Economics."
            ],
            raw_description=(
                "Financial analyst role requiring finance, accounting, "
                "budgeting, forecasting, modeling and Excel."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "finance",
    },
    {
        "id": "marketing",
        "name": "Fixture — Marketing Associate",
        "job": CanonicalJob(
            title="Marketing Associate",
            company="Fixture Media",
            role_family="marketing",
            responsibilities=[
                "Plan and execute digital marketing campaigns.",
                "Analyze campaign performance and audience metrics.",
                "Create content and support brand growth.",
            ],
            requirements=[
                req(
                    "Digital marketing and campaign management.",
                    category="domain_skill",
                ),
                req(
                    "Content strategy or brand marketing.",
                    category="domain_skill",
                ),
                req(
                    "Marketing analytics.",
                    category="competency",
                ),
                req(
                    "SEO experience.",
                    level="preferred",
                    category="tool",
                ),
            ],
            raw_description=(
                "Marketing associate role requiring campaign execution, "
                "content, brand, SEO and marketing analytics."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "marketing",
    },
    {
        "id": "hr",
        "name": "Fixture — Talent Acquisition Associate",
        "job": CanonicalJob(
            title="Talent Acquisition Associate",
            company="Fixture People",
            role_family="human_resources",
            responsibilities=[
                "Source and screen candidates.",
                "Coordinate interviews and recruitment workflows.",
                "Maintain candidate records and support onboarding.",
            ],
            requirements=[
                req(
                    "Recruitment and candidate sourcing.",
                    category="domain_skill",
                ),
                req(
                    "Interview coordination.",
                    category="competency",
                ),
                req(
                    "Applicant tracking system experience.",
                    category="tool",
                ),
                req(
                    "Stakeholder communication.",
                    category="soft_skill",
                ),
            ],
            raw_description=(
                "Talent acquisition role requiring recruiting, sourcing, "
                "screening, interview coordination and ATS experience."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "human_resources",
    },
    {
        "id": "operations",
        "name": "Fixture — Operations Analyst",
        "job": CanonicalJob(
            title="Operations Analyst",
            company="Fixture Ops",
            role_family="operations",
            responsibilities=[
                "Analyze operational workflows and process performance.",
                "Coordinate vendors and internal stakeholders.",
                "Improve operational efficiency and reporting.",
            ],
            requirements=[
                req(
                    "Operations and process improvement.",
                    category="domain_skill",
                ),
                req(
                    "Data analysis and reporting.",
                    category="competency",
                ),
                req(
                    "Vendor or stakeholder management.",
                    category="soft_skill",
                ),
                req(
                    "SQL or spreadsheet skills.",
                    level="preferred",
                    category="tool",
                ),
            ],
            raw_description=(
                "Operations analyst role focused on process improvement, "
                "reporting, vendors and operational efficiency."
            ),
            extraction_quality="structured",
        ),
        "expected_family": "operations",
    },
]


# =========================================================
# LIVE URL TESTS
# =========================================================

LIVE_JOBS: list[dict[str, Any]] = [
    {
        "id": "live_microsoft_swe",
        "name": "Live — Microsoft SWE Intern",
        "url": (
            "https://apply.careers.microsoft.com/careers/job/"
            "1970393556911730?domain=microsoft.com&hl=en"
        ),
        "expected_role_family": "engineering",
        "expect_extraction_error": False,
    },
    {
        "id": "live_google_gdc",
        "name": "Live — Google GDC AI",
        "url": (
            "https://www.google.com/about/careers/applications/jobs/results/"
            "126988379509138118-software-engineer-gdc-ai-applications-and-agents"
        ),
        "expected_role_family": "engineering",
        "expect_extraction_error": False,
    },
    {
        "id": "live_google_signin",
        "name": "Live — Google Sign-in Guard",
        "url": (
            "https://www.google.com/about/careers/applications/jobs/"
            "recommendations/74698303731573446-software-engineer-youtube-full-stack"
        ),
        "expected_role_family": None,
        "expect_extraction_error": True,
    },
]


# =========================================================
# SERIALIZATION
# =========================================================

def _round(value: float | int | None) -> float | None:
    if value is None:
        return None

    return round(
        float(value),
        2,
    )


def serialize_match(result: Any) -> dict[str, Any]:
    return {
        "score": _round(result.score),
        "verdict": result.verdict,
        "breakdown": {
            "capabilities": _round(
                result.breakdown.capabilities
            ),
            "experience": _round(
                result.breakdown.experience
            ),
            "responsibilities": _round(
                result.breakdown.responsibilities
            ),
            "eligibility": _round(
                result.breakdown.eligibility
            ),
            "preferred": _round(
                result.breakdown.preferred
            ),
        },
        "matched_required": list(
            result.matched_required
        ),
        "missing_required": list(
            result.missing_required
        ),
        "matched_preferred": list(
            result.matched_preferred
        ),
        "requirements": [
            {
                "requirement": item.requirement,
                "level": item.level,
                "category": item.category,
                "score": _round(item.score),
                "matched": item.matched,
                "evidence": list(item.evidence),
            }
            for item
            in result.requirement_matches
        ],
        "experience": [
            {
                "title": item.title,
                "organization": item.organization,
                "score": _round(item.score),
                "matched_terms": list(
                    item.matched_terms
                ),
                "reasons": list(
                    item.reasons
                ),
            }
            for item
            in result.experience_matches
        ],
        "work_samples": [
            {
                "name": item.name,
                "sample_type": item.sample_type,
                "score": _round(item.score),
                "matched_terms": list(
                    item.matched_terms
                ),
                "reasons": list(
                    item.reasons
                ),
            }
            for item
            in result.work_sample_matches
        ],
        "explanation": list(
            result.explanation
        ),
    }


# =========================================================
# SANITY CHECKS
# =========================================================

def generic_sanity_checks(
    result: Any,
) -> list[str]:
    failures: list[str] = []

    if not (
        0 <= result.score <= 100
    ):
        failures.append(
            "final score outside 0-100"
        )

    for name in (
        "capabilities",
        "experience",
        "responsibilities",
        "eligibility",
        "preferred",
    ):
        value = getattr(
            result.breakdown,
            name,
        )

        if not (
            0 <= value <= 100
        ):
            failures.append(
                f"{name} outside 0-100"
            )

    requirement_scores = [
        round(
            item.score,
            2,
        )
        for item
        in result.requirement_matches
    ]

    if (
        len(
            requirement_scores
        )
        >= 3
        and len(
            set(
                requirement_scores
            )
        )
        == 1
    ):
        failures.append(
            "all requirement scores are identical"
        )

    experience_scores = [
        round(
            item.score,
            2,
        )
        for item
        in result.experience_matches
    ]

    if (
        len(
            experience_scores
        )
        >= 3
        and len(
            set(
                experience_scores
            )
        )
        == 1
    ):
        failures.append(
            "all experience scores are identical"
        )


    return failures


# =========================================================
# FIXTURE TESTS
# =========================================================

def run_fixture_tests(
    resume: Any,
) -> list[dict[str, Any]]:
    print(
        "\n"
        + "=" * 92
    )
    print(
        "LAYER A — DETERMINISTIC CROSS-SECTOR MATCHER TESTS"
    )
    print(
        "=" * 92
    )

    results: list[
        dict[str, Any]
    ] = []

    for config in FIXTURE_JOBS:
        job = config["job"]

        result = match_resume_to_job(
            resume,
            job,
        )

        failures = generic_sanity_checks(
            result
        )

        print(
            f"\n{config['name']}"
        )

        print(
            f"  SCORE: {result.score:.2f}"
            f" | {result.verdict}"
        )

        print(
            "  BREAKDOWN:"
            f" cap={result.breakdown.capabilities:.2f}"
            f" exp={result.breakdown.experience:.2f}"
            f" resp={result.breakdown.responsibilities:.2f}"
            f" elig={result.breakdown.eligibility:.2f}"
            f" pref={result.breakdown.preferred:.2f}"
        )

        if failures:
            print(
                "  SANITY: FAIL"
            )

            for failure in failures:
                print(
                    "   -",
                    failure,
                )
        else:
            print(
                "  SANITY: PASS"
            )

        results.append({
            "id": config["id"],
            "name": config["name"],
            "kind": "fixture",
            "status": "ok",
            "role_family": job.role_family,
            "match": serialize_match(
                result
            ),
            "sanity_failures": failures,
        })

    return results


# =========================================================
# CROSS-ROLE RANKING ASSERTIONS
# =========================================================

def result_by_id(
    results: list[dict[str, Any]],
    fixture_id: str,
) -> dict[str, Any]:
    return next(
        item
        for item in results
        if item["id"] == fixture_id
    )


def run_ranking_assertions(
    fixture_results: list[dict[str, Any]],
) -> list[str]:
    print(
        "\n"
        + "=" * 92
    )
    print(
        "LAYER B — CROSS-ROLE RANKING ASSERTIONS"
    )
    print(
        "=" * 92
    )

    failures: list[str] = []

    def score(
        fixture_id: str,
    ) -> float:
        return float(
            result_by_id(
                fixture_results,
                fixture_id,
            )["match"]["score"]
        )

    assertions = [
        (
            "Relevant SWE internship should outrank senior SWE",
            score("swe_intern")
            > score("senior_swe"),
        ),
        (
            "Relevant SWE internship should outrank finance",
            score("swe_intern")
            > score("finance_analyst"),
        ),
        (
            "Relevant SWE internship should outrank HR",
            score("swe_intern")
            > score("hr"),
        ),
        (
            "Relevant SWE internship should outrank marketing",
            score("swe_intern")
            > score("marketing"),
        ),
        (
            "Data Analyst should outrank Finance Analyst "
            "for a technical SQL/Python resume",
            score("data_analyst")
            > score("finance_analyst"),
        ),
    ]

    swe_result = result_by_id(
        fixture_results,
        "swe_intern",
    )

    swe_sample_scores = [
        round(
            item["score"],
            2,
        )
        for item
        in swe_result[
            "match"
        ][
            "work_samples"
        ]
    ]

    assertions.append(
        (
            "Relevant SWE work samples should not collapse "
            "to one artificial identical score",
            (
                len(
                    set(
                        swe_sample_scores
                    )
                )
                > 1
            ),
        )
    )

    # This is intentionally a margin check, not a target-score check.
    # It catches an engine that gives unrelated domains almost the same score.
    unrelated_best = max(
        score("finance_analyst"),
        score("marketing"),
        score("hr"),
    )

    assertions.append(
        (
            "SWE Intern should beat unrelated-domain fixtures "
            "by at least 10 points",
            (
                score("swe_intern")
                - unrelated_best
                >= 10
            ),
        )
    )

    for description, passed in assertions:
        print(
            "PASS"
            if passed
            else "FAIL",
            "|",
            description,
        )

        if not passed:
            failures.append(
                description
            )

    return failures


# =========================================================
# REQUIRED VS PREFERRED BEHAVIOR
# =========================================================

def run_requirement_behavior_tests(
    resume: Any,
) -> list[str]:
    print(
        "\n"
        + "=" * 92
    )
    print(
        "LAYER C — REQUIRED / PREFERRED SEMANTICS"
    )
    print(
        "=" * 92
    )

    failures: list[str] = []

    baseline = CanonicalJob(
        title="Backend Developer",
        company="Fixture",
        role_family="engineering",
        responsibilities=[
            "Build backend APIs.",
        ],
        requirements=[
            req(
                "Software development experience.",
                category="experience",
            ),
        ],
        raw_description=(
            "Backend role requiring software development."
        ),
        extraction_quality="structured",
    )

    preferred_extra = CanonicalJob(
        title="Backend Developer",
        company="Fixture",
        role_family="engineering",
        responsibilities=[
            "Build backend APIs.",
        ],
        requirements=[
            req(
                "Software development experience.",
                category="experience",
            ),
            req(
                "Master's degree in Computer Science.",
                level="preferred",
                category="education",
            ),
        ],
        raw_description=(
            "Backend role requiring software development; "
            "Master's degree preferred."
        ),
        extraction_quality="structured",
    )

    hard_missing = CanonicalJob(
        title="Backend Developer",
        company="Fixture",
        role_family="engineering",
        responsibilities=[
            "Build backend APIs.",
        ],
        requirements=[
            req(
                "Software development experience.",
                category="experience",
            ),
            req(
                "Active nursing license.",
                category="license",
            ),
        ],
        license_requirements=[
            "Active nursing license."
        ],
        raw_description=(
            "Backend role requiring software development "
            "and an active nursing license."
        ),
        extraction_quality="structured",
    )

    baseline_result = (
        match_resume_to_job(
            resume,
            baseline,
        )
    )

    preferred_result = (
        match_resume_to_job(
            resume,
            preferred_extra,
        )
    )

    hard_result = (
        match_resume_to_job(
            resume,
            hard_missing,
        )
    )

    checks = [
        (
            "Missing preferred Master's must not destroy the score",
            (
                preferred_result.score
                >= baseline_result.score
                - 10
            ),
        ),
        (
            "Missing required hard eligibility must materially penalize score",
            (
                hard_result.score
                < baseline_result.score
            ),
        ),
    ]

    for description, passed in checks:
        print(
            "PASS"
            if passed
            else "FAIL",
            "|",
            description,
        )

        if not passed:
            failures.append(
                description
            )

    print(
        "Baseline:",
        baseline_result.score,
    )

    print(
        "Preferred Master's added:",
        preferred_result.score,
    )

    print(
        "Missing hard license added:",
        hard_result.score,
    )

    return failures


# =========================================================
# LIVE EXTRACTION TESTS
# =========================================================

async def run_live_tests(
    resume: Any,
) -> list[dict[str, Any]]:
    print(
        "\n"
        + "=" * 92
    )
    print(
        "LAYER D — LIVE EXTRACTION TESTS"
    )
    print(
        "=" * 92
    )

    results: list[
        dict[str, Any]
    ] = []

    for config in LIVE_JOBS:
        print(
            f"\n{config['name']}"
        )

        expect_error = bool(
            config.get(
                "expect_extraction_error",
                False,
            )
        )

        try:
            extracted = (
                await extract_job_from_url(
                    config["url"]
                )
            )

            job = normalize_job(
                extracted
            )

            match = (
                match_resume_to_job(
                    resume,
                    job,
                )
            )

            failures = (
                generic_sanity_checks(
                    match
                )
            )

            if expect_error:
                failures.append(
                    "expected extraction rejection, "
                    "but extraction succeeded"
                )

            expected_family = (
                config.get(
                    "expected_role_family"
                )
            )

            if (
                expected_family
                and job.role_family
                != expected_family
            ):
                failures.append(
                    "role-family mismatch: "
                    f"expected={expected_family}, "
                    f"actual={job.role_family}"
                )

            print(
                "  EXTRACTED:",
                job.title,
                "|",
                job.company,
            )

            print(
                "  SCORE:",
                f"{match.score:.2f}",
                "|",
                match.verdict,
            )

            print(
                "  RESULT:",
                "PASS"
                if not failures
                else "CHECK",
            )

            results.append({
                "id": config["id"],
                "name": config["name"],
                "kind": "live",
                "status": "ok",
                "job": {
                    "title": job.title,
                    "company": job.company,
                    "role_family": job.role_family,
                    "extraction_quality": (
                        job.extraction_quality
                    ),
                    "requirements_count": len(
                        job.requirements
                    ),
                    "responsibilities_count": len(
                        job.responsibilities
                    ),
                },
                "match": serialize_match(
                    match
                ),
                "sanity_failures": failures,
            })

        except JobExtractionError as exc:
            passed = expect_error

            print(
                "  EXTRACTION ERROR:",
                str(exc),
            )

            print(
                "  RESULT:",
                "PASS"
                if passed
                else "FAIL",
            )

            results.append({
                "id": config["id"],
                "name": config["name"],
                "kind": "live",
                "status": (
                    "expected_error"
                    if passed
                    else "unexpected_error"
                ),
                "error": str(exc),
                "sanity_failures": (
                    []
                    if passed
                    else [
                        "unexpected JobExtractionError"
                    ]
                ),
            })

        except Exception as exc:
            print(
                "  UNEXPECTED ERROR:",
                type(exc).__name__,
                str(exc),
            )

            results.append({
                "id": config["id"],
                "name": config["name"],
                "kind": "live",
                "status": "unexpected_error",
                "error_type": (
                    type(exc).__name__
                ),
                "error": str(exc),
                "sanity_failures": [
                    "unexpected exception"
                ],
            })

    return results


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

    print(
        "=" * 92
    )
    print(
        "ROLECLEAR REGRESSION SUITE V2"
    )
    print(
        "=" * 92
    )
    print(
        "Candidate:",
        resume.candidate_name,
    )
    print(
        "Resume:",
        RESUME_PATH,
    )

    fixture_results = (
        run_fixture_tests(
            resume
        )
    )

    ranking_failures = (
        run_ranking_assertions(
            fixture_results
        )
    )

    semantic_failures = (
        run_requirement_behavior_tests(
            resume
        )
    )

    live_results = (
        await run_live_tests(
            resume
        )
    )

    all_results = {
        "candidate": (
            resume.candidate_name
        ),
        "fixture_results": (
            fixture_results
        ),
        "ranking_failures": (
            ranking_failures
        ),
        "semantic_failures": (
            semantic_failures
        ),
        "live_results": (
            live_results
        ),
    }

    OUTPUT_PATH.write_text(
        json.dumps(
            all_results,
            indent=2,
            ensure_ascii=False,
        )
    )

    fixture_sanity_failures = [
        failure
        for item
        in fixture_results
        for failure
        in item[
            "sanity_failures"
        ]
    ]

    live_sanity_failures = [
        failure
        for item
        in live_results
        for failure
        in item.get(
            "sanity_failures",
            [],
        )
    ]

    total_failures = (
        len(
            fixture_sanity_failures
        )
        + len(
            ranking_failures
        )
        + len(
            semantic_failures
        )
        + len(
            live_sanity_failures
        )
    )

    print(
        "\n"
        + "=" * 92
    )
    print(
        "FINAL REGRESSION SUMMARY"
    )
    print(
        "=" * 92
    )

    print(
        "Fixture sanity failures:",
        len(
            fixture_sanity_failures
        ),
    )

    print(
        "Ranking assertion failures:",
        len(
            ranking_failures
        ),
    )

    print(
        "Required/preferred semantic failures:",
        len(
            semantic_failures
        ),
    )

    print(
        "Live-test failures:",
        len(
            live_sanity_failures
        ),
    )

    print(
        "\nTOTAL FAILURES:",
        total_failures,
    )

    print(
        "OVERALL:",
        (
            "PASS"
            if total_failures == 0
            else "CHECK"
        ),
    )

    print(
        "\nDetailed output:",
        OUTPUT_PATH,
    )


asyncio.run(main())
