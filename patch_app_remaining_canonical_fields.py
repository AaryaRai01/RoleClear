from pathlib import Path
import shutil

ROOT = Path.cwd()
APP = ROOT / "src" / "App.tsx"

if not APP.exists():
    raise FileNotFoundError(f"Not found: {APP}")

backup = APP.with_suffix(".tsx.bak_before_remaining_field_fix")
shutil.copy2(APP, backup)

text = APP.read_text()

replacements = [
    ("currentAnalysis\n            .requiredSkills", "currentAnalysis\n            .requiredRequirements"),
    ("currentAnalysis\n                    .matchedSkills", "currentAnalysis\n                    .matchedRequired"),
    ("currentAnalysis\n            .preferredSkills", "currentAnalysis\n            .preferredRequirements"),
    ("currentAnalysis\n                .preferredSkills", "currentAnalysis\n                .preferredRequirements"),
    ("currentAnalysis\n            .missingSkills", "currentAnalysis\n            .missingRequired"),
    ("currentAnalysis\n                .missingSkills", "currentAnalysis\n                .missingRequired"),
    ("currentAnalysis\n            .projectMatches", "currentAnalysis\n            .workSampleMatches"),
]

for old, new in replacements:
    text = text.replace(old, new)

# Also replace any simple same-line variants just in case.
text = text.replace("currentAnalysis.requiredSkills", "currentAnalysis.requiredRequirements")
text = text.replace("currentAnalysis.matchedSkills", "currentAnalysis.matchedRequired")
text = text.replace("currentAnalysis.preferredSkills", "currentAnalysis.preferredRequirements")
text = text.replace("currentAnalysis.missingSkills", "currentAnalysis.missingRequired")
text = text.replace("currentAnalysis.projectMatches", "currentAnalysis.workSampleMatches")

APP.write_text(text)

print(f"Backup created: {backup}")
print("Updated remaining canonical field references in src/App.tsx")
print("Now run: npm run typecheck")
