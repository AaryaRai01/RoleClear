import os
import requests


BASE_URL = "http://127.0.0.1:8000"

JOB_URL = (
    "https://salesforce.wd12.myworkdayjobs.com/"
    "External_Career_Site/job/India---Bangalore/"
    "Summer-2027-Intern---Software-Engineer_JR337715"
    "?source=LinkedIn_Jobs"
)

RESUME_PATH = os.path.expanduser(
    "~/Documents/Resume/AARYA RAI_SRM IST.pdf"
)


print("=" * 60)
print("STEP 1: EXTRACT JOB")
print("=" * 60)

job_response = requests.post(
    f"{BASE_URL}/api/v1/smart-apply/extract",
    json={
        "url": JOB_URL,
    },
    timeout=120,
)

job_response.raise_for_status()
job = job_response.json()

print(
    "Job:",
    job.get("title"),
    "@",
    job.get("company"),
)


print("\n" + "=" * 60)
print("STEP 2: PARSE RESUME")
print("=" * 60)

with open(
    RESUME_PATH,
    "rb",
) as file:
    resume_response = requests.post(
        f"{BASE_URL}/api/v2/resumes/parse",
        files={
            "file": (
                os.path.basename(
                    RESUME_PATH
                ),
                file,
                "application/pdf",
            )
        },
        timeout=120,
    )

resume_response.raise_for_status()
resume = resume_response.json()

print(
    "Candidate:",
    resume.get(
        "personal_info",
        {},
    ).get(
        "full_name"
    ),
)


print("\n" + "=" * 60)
print("STEP 3: GENERATE WORD RESUME")
print("=" * 60)

payload = {
    "job": job,
    "resume": resume,
    "max_experience_bullets": 4,
    "max_project_bullets": 3,
    "max_projects": 3,
}

export_response = requests.post(
    f"{BASE_URL}/api/v1/resume-export/tailored-docx",
    json=payload,
    timeout=120,
)

if not export_response.ok:
    print(
        "DOCX EXPORT FAILED:",
        export_response.status_code,
    )
    print(
        export_response.text
    )
    raise SystemExit(1)


output_file = (
    "RoleClear_Salesforce_Tailored_Resume.docx"
)

with open(
    output_file,
    "wb",
) as file:
    file.write(
        export_response.content
    )


print(
    "DOCX generated successfully"
)

print(
    "Saved to:",
    os.path.abspath(
        output_file
    )
)

print(
    "Version ID:",
    export_response.headers.get(
        "X-RoleClear-Version-Id"
    ),
)

print(
    "Claim Validation:",
    export_response.headers.get(
        "X-RoleClear-Claim-Validation"
    ),
)

print("\nDONE")