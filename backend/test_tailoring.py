import json
import os
import requests


BASE_URL = "http://127.0.0.1:8000"

JOB_URL = (
    "https://salesforce.wd12.myworkdayjobs.com/External_Career_Site/"
    "job/India---Bangalore/"
    "Summer-2027-Intern---Software-Engineer_JR337715"
    "?source=LinkedIn_Jobs"
)

# Resume to use for this test.
RESUME_PATH = os.path.expanduser(
    "~/Documents/Resume/AARYA RAI_SRM IST.pdf"
)


def print_section(title: str) -> None:
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def fail_response(label: str, response: requests.Response) -> None:
    print(f"{label} FAILED")
    print("Status:", response.status_code)
    print(response.text)
    raise SystemExit(1)


# =========================================================
# STEP 1: EXTRACT REAL SALESFORCE JOB
# =========================================================

print_section("STEP 1: EXTRACTING REAL SALESFORCE JOB")

print("JOB_URL =", repr(JOB_URL))

extract_response = requests.post(
    f"{BASE_URL}/api/v1/smart-apply/extract",
    json={
        "url": JOB_URL,
    },
    timeout=60,
)

if not extract_response.ok:
    fail_response(
        "JOB EXTRACTION",
        extract_response,
    )

job = extract_response.json()

print("Job extracted successfully")
print("Title:", job.get("title"))
print("Company:", job.get("company"))
print("Location:", job.get("location"))
print("Source:", job.get("source"))
print(
    "Extraction method:",
    job.get("extraction_method"),
)

print("\nSkills:")
print(
    json.dumps(
        job.get("skills", []),
        indent=2,
        ensure_ascii=False,
    )
)

print("\nQualifications:")
print(
    json.dumps(
        job.get("qualifications", []),
        indent=2,
        ensure_ascii=False,
    )
)

print("\nResponsibilities:")
print(
    json.dumps(
        job.get("responsibilities", []),
        indent=2,
        ensure_ascii=False,
    )
)

print("\nDescription preview:")
print(
    (job.get("description") or "")[:1200]
)


# =========================================================
# STEP 2: CHECK RESUME FILE
# =========================================================

print_section("STEP 2: CHECKING RESUME FILE")

if not os.path.exists(RESUME_PATH):
    print("Resume file not found:")
    print(RESUME_PATH)

    print("\nFiles with a similar name in Downloads:")
    downloads = os.path.expanduser("~/Downloads")

    if os.path.isdir(downloads):
        matches = [
            name
            for name in os.listdir(downloads)
            if (
                "aarya" in name.lower()
                and name.lower().endswith(".pdf")
            )
        ]

        for name in matches:
            print(
                " -",
                os.path.join(
                    downloads,
                    name,
                ),
            )

    raise SystemExit(1)

print("Resume found:")
print(RESUME_PATH)


# =========================================================
# STEP 3: PARSE REAL RESUME
# =========================================================

print_section("STEP 3: PARSING REAL RESUME")

with open(
    RESUME_PATH,
    "rb",
) as resume_file:
    resume_response = requests.post(
        f"{BASE_URL}/api/v2/resumes/parse",
        files={
            "file": (
                os.path.basename(
                    RESUME_PATH
                ),
                resume_file,
                "application/pdf",
            )
        },
        timeout=60,
    )

if not resume_response.ok:
    fail_response(
        "RESUME PARSING",
        resume_response,
    )

resume = resume_response.json()

print("Resume parsed successfully")

personal_info = resume.get(
    "personal_info",
    {},
)

print(
    "Candidate:",
    personal_info.get(
        "full_name"
    ),
)

print(
    "Experience entries:",
    len(
        resume.get(
            "experience",
            [],
        )
    ),
)

print(
    "Project entries:",
    len(
        resume.get(
            "projects",
            [],
        )
    ),
)

metadata = resume.get(
    "parsing_metadata",
    {},
)

print(
    "Parser version:",
    metadata.get(
        "parser_version"
    ),
)


# =========================================================
# STEP 4: RUN SMART APPLY ANALYSIS FIRST
# =========================================================

print_section(
    "STEP 4: RUNNING SMART APPLY ANALYSIS"
)

analysis_payload = {
    "job": job,
    "resume": resume,
}

analysis_response = requests.post(
    f"{BASE_URL}/api/v1/smart-apply/analyze",
    json=analysis_payload,
    timeout=120,
)

if not analysis_response.ok:
    fail_response(
        "SMART APPLY ANALYSIS",
        analysis_response,
    )

analysis = analysis_response.json()

print(
    "Resume Fit:",
    analysis.get(
        "resume_fit"
    ),
    "/100",
)

print(
    "Verdict:",
    analysis.get(
        "verdict"
    ),
)

print(
    "Ghost Risk:",
    analysis.get(
        "ghost_risk"
    ),
)

print("\nMissing required requirements:")
print(
    json.dumps(
        analysis.get(
            "missing_required",
            [],
        ),
        indent=2,
        ensure_ascii=False,
    )
)


# =========================================================
# STEP 5: RUN STEP 4 TAILORING
# =========================================================

print_section(
    "STEP 5: RUNNING RESUME TAILORING"
)

tailor_payload = {
    "job": job,
    "resume": resume,
    "max_experience_bullets": 4,
    "max_project_bullets": 3,
    "max_projects": 3,
}

tailor_response = requests.post(
    f"{BASE_URL}/api/v1/smart-apply/tailor",
    json=tailor_payload,
    timeout=120,
)

if not tailor_response.ok:
    fail_response(
        "RESUME TAILORING",
        tailor_response,
    )

tailored = tailor_response.json()

print("Tailoring completed successfully")
print(
    "Version ID:",
    tailored.get(
        "version_id"
    ),
)
print(
    "Job:",
    tailored.get(
        "job_title"
    ),
)
print(
    "Company:",
    tailored.get(
        "company"
    ),
)
print(
    "Tailoring mode:",
    tailored.get(
        "tailoring_mode"
    ),
)


# =========================================================
# STEP 6: CLAIM VALIDATION
# =========================================================

print_section(
    "STEP 6: CLAIM VALIDATION"
)

validation = tailored.get(
    "claim_validation",
    {},
)

print(
    "Passed:",
    validation.get(
        "passed"
    ),
)

print(
    "Claims checked:",
    validation.get(
        "checked_claims"
    ),
)

print(
    "Unsupported claims:",
    json.dumps(
        validation.get(
            "unsupported_claims",
            [],
        ),
        indent=2,
        ensure_ascii=False,
    ),
)


# =========================================================
# STEP 7: SHOW TAILORING CHANGES
# =========================================================

print_section(
    "STEP 7: TAILORING CHANGES"
)

changes = tailored.get(
    "changes",
    [],
)

if not changes:
    print("No ordering changes were required.")
else:
    for change in changes:
        print(
            f"[{change.get('section')}] "
            f"{change.get('action')}"
        )
        print(
            " ",
            change.get(
                "detail"
            ),
        )
        print("-" * 40)


# =========================================================
# STEP 8: SHOW TAILORED EXPERIENCE
# =========================================================

print_section(
    "STEP 8: TAILORED EXPERIENCE"
)

tailored_resume = tailored.get(
    "tailored_resume",
    {},
)

for index, item in enumerate(
    tailored_resume.get(
        "experience",
        [],
    ),
    start=1,
):
    print(
        f"{index}. "
        f"{item.get('title')} "
        f"@ {item.get('company')}"
    )

    for bullet in item.get(
        "bullets",
        [],
    ):
        print(
            "   -",
            bullet,
        )

    print("-" * 40)


# =========================================================
# STEP 9: SHOW TAILORED PROJECTS
# =========================================================

print_section(
    "STEP 9: TAILORED PROJECTS"
)

for index, item in enumerate(
    tailored_resume.get(
        "projects",
        [],
    ),
    start=1,
):
    print(
        f"{index}. "
        f"{item.get('name')}"
    )

    for bullet in item.get(
        "bullets",
        [],
    ):
        print(
            "   -",
            bullet,
        )

    print("-" * 40)


# =========================================================
# STEP 10: TOP ML EVIDENCE
# =========================================================

print_section(
    "STEP 10: TOP ML EVIDENCE"
)

selected_evidence = tailored.get(
    "selected_evidence",
    [],
)

for item in selected_evidence[:20]:
    similarity = item.get(
        "similarity",
        0,
    )

    print(
        f"[{item.get('section')}] "
        f"{similarity:.2f}"
    )

    print(
        "Requirement:",
        item.get(
            "requirement"
        ),
    )

    print(
        "Evidence:",
        item.get(
            "evidence"
        ),
    )

    print("-" * 40)


# =========================================================
# STEP 11: SAVE RESPONSES
# =========================================================

analysis_output = (
    "smart_apply_test_result.json"
)

tailoring_output = (
    "tailored_resume_test_result.json"
)

with open(
    analysis_output,
    "w",
    encoding="utf-8",
) as file:
    json.dump(
        analysis,
        file,
        indent=2,
        ensure_ascii=False,
    )

with open(
    tailoring_output,
    "w",
    encoding="utf-8",
) as file:
    json.dump(
        tailored,
        file,
        indent=2,
        ensure_ascii=False,
    )


print_section("DONE")

print(
    "Smart Apply result saved to:",
    analysis_output,
)

print(
    "Tailored resume result saved to:",
    tailoring_output,
)

print("\nFINAL SAFETY CHECK")

if validation.get("passed") is True:
    print("PASS: No unsupported claims were introduced.")
else:
    print("FAIL: Tailored resume contains unsupported claims.")
    raise SystemExit(1)
