from pathlib import Path
import shutil

ROOT = Path.cwd()
APP = ROOT / "src" / "App.tsx"

if not APP.exists():
    raise FileNotFoundError(f"Not found: {APP}")

backup = APP.with_suffix(".tsx.bak_before_canonical_ui")
shutil.copy2(APP, backup)

text = APP.read_text()

# Job Analysis wording + canonical field migration.
replacements = {
    "REQUIRED CAPABILITIES": "REQUIRED REQUIREMENTS",
    "PREFERRED CAPABILITIES": "PREFERRED QUALIFICATIONS",
    "No explicit required capabilities were extracted from the posting.":
        "No explicit required requirements were extracted from the posting.",
    "matched capabilities": "matched requirements",
    "Matching claims are backed by evidence found in the parsed resume.":
        "Each match is supported by evidence found in the parsed resume.",
    "No separate preferred capabilities were detected.":
        "No separate preferred qualifications were detected.",
    "No major required capability gaps were detected.":
        "No major required requirement gaps were detected.",
    "A gap means RoleClear could not find strong evidence in this resume. It does not prove that you do not have the capability.":
        "A gap means RoleClear could not find strong evidence in this resume. It does not prove that you do not meet the requirement.",
    "currentAnalysis.breakdown.skills":
        "currentAnalysis.canonicalBreakdown.capabilities",
    "currentAnalysis.breakdown.experience":
        "currentAnalysis.canonicalBreakdown.experience",
    "currentAnalysis.breakdown.projects":
        "currentAnalysis.canonicalBreakdown.responsibilities",
    'label="Projects / work evidence"':
        'label="Responsibilities"',
    "currentAnalysis.requiredSkills":
        "currentAnalysis.requiredRequirements",
    "currentAnalysis.preferredSkills":
        "currentAnalysis.preferredRequirements",
    "currentAnalysis.missingSkills":
        "currentAnalysis.missingRequired",
    "currentAnalysis.matchedSkills":
        "currentAnalysis.matchedRequired",
    "item.company":
        "item.organization",
    "item.matched_skills":
        "item.matchedTerms",
    "currentAnalysis.projectMatches":
        "currentAnalysis.workSampleMatches",
}

for old, new in replacements.items():
    text = text.replace(old, new)

start_marker = "function ResumeMatch({"
end_marker = "\nfunction MatchBar({"

start = text.find(start_marker)
end = text.find(end_marker, start)

if start == -1 or end == -1:
    raise RuntimeError(
        "Could not locate ResumeMatch() block in App.tsx"
    )

resume_match = '''function ResumeMatch({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const currentJob = useCareerStore(
    (state) => state.currentJob,
  );

  const currentAnalysis = useCareerStore(
    (state) => state.currentAnalysis,
  );

  if (!currentJob || !currentAnalysis) {
    return (
      <div className="detail-page">
        <BackLink
          onClick={() =>
            setView('apply')
          }
          label="Back to Smart Apply"
        />

        <div className="detail-card">
          <span className="mini-label">
            NO MATCH DATA
          </span>

          <h2>
            Analyze an opportunity first.
          </h2>

          <p>
            Resume Match needs a parsed resume and analyzed opportunity before it can show your evidence.
          </p>

          <Button
            onClick={() =>
              setView('apply')
            }
          >
            Go to Smart Apply
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  const fit =
    currentAnalysis.resumeFit;

  const fitLabel =
    fit >= 80
      ? 'Strong match'
      : fit >= 60
        ? 'Moderate match'
        : fit >= 40
          ? 'Partial match'
          : 'Low match';

  const breakdown =
    currentAnalysis.canonicalBreakdown;

  const strongestRequirements =
    currentAnalysis.requirementMatches
      .filter(
        (item) =>
          item.matched &&
          item.score >= 60,
      )
      .slice()
      .sort(
        (a, b) =>
          b.score - a.score,
      );

  return (
    <div className="detail-page">
      <BackLink
        onClick={() =>
          setView('analysis')
        }
        label="Back to job analysis"
      />

      <PageTitle
        eyebrow="Smart Apply · Step 03"
        title="Your resume match"
        subtitle={`Evidence-level alignment with ${
          currentJob.title ??
          'this opportunity'
        }${
          currentJob.company
            ? ` at ${currentJob.company}`
            : ''
        }.`}
        action={
          <Button
            onClick={() =>
              setView(
                'resume-tailor',
              )
            }
          >
            Optimize resume
            <Sparkles size={15} />
          </Button>
        }
      />

      <div className="match-score">
        <div>
          <span className="mini-label">
            OVERALL MATCH
          </span>

          <strong>{fit}%</strong>
          <p>{fitLabel}</p>
        </div>

        <div className="match-bars">
          <MatchBar
            label="Capabilities"
            value={`${Math.round(
              breakdown.capabilities,
            )}%`}
            width={`${Math.round(
              breakdown.capabilities,
            )}%`}
          />

          <MatchBar
            label="Experience"
            value={`${Math.round(
              breakdown.experience,
            )}%`}
            width={`${Math.round(
              breakdown.experience,
            )}%`}
          />

          <MatchBar
            label="Responsibilities"
            value={`${Math.round(
              breakdown.responsibilities,
            )}%`}
            width={`${Math.round(
              breakdown.responsibilities,
            )}%`}
          />

          <MatchBar
            label="Eligibility"
            value={`${Math.round(
              breakdown.eligibility,
            )}%`}
            width={`${Math.round(
              breakdown.eligibility,
            )}%`}
          />

          {breakdown.preferred > 0 && (
            <MatchBar
              label="Preferred qualifications"
              value={`${Math.round(
                breakdown.preferred,
              )}%`}
              width={`${Math.round(
                breakdown.preferred,
              )}%`}
            />
          )}
        </div>
      </div>

      <div className="analysis-grid">
        <div className="detail-card">
          <span className="mini-label">
            EVIDENCE-BACKED MATCHES
          </span>

          <h3>
            What is already working in your favor
          </h3>

          {strongestRequirements.length >
          0 ? (
            <ul className="check-list">
              {strongestRequirements.map(
                (item) => (
                  <li
                    key={`${item.level}-${item.category}-${item.requirement}`}
                  >
                    <CheckCircle2
                      size={16}
                    />

                    <span>
                      <b>
                        {item.requirement}
                      </b>

                      {' · '}

                      {Math.round(
                        item.score,
                      )}
                      % match

                      {item.evidence.length >
                      0
                        ? ` · ${item.evidence[0]}`
                        : ''}
                    </span>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p>
              No strong evidence-backed requirement matches were detected.
            </p>
          )}
        </div>

        <div className="detail-card">
          <span className="mini-label">
            REQUIRED GAPS
          </span>

          <h3>
            Evidence worth strengthening
          </h3>

          {currentAnalysis
            .missingRequired.length >
          0 ? (
            <ul className="gap-list">
              {currentAnalysis
                .missingRequired
                .map((requirement) => (
                  <li key={requirement}>
                    <span>
                      {requirement}
                    </span>

                    <small>
                      Required · insufficient evidence
                    </small>
                  </li>
                ))}
            </ul>
          ) : (
            <p>
              No major required requirement gaps were detected.
            </p>
          )}
        </div>
      </div>

      <div className="analysis-grid">
        <div className="detail-card">
          <span className="mini-label">
            EXPERIENCE RELEVANCE
          </span>

          <h3>
            Which roles support this application
          </h3>

          {currentAnalysis
            .experienceMatches.length >
          0 ? (
            currentAnalysis
              .experienceMatches
              .slice()
              .sort(
                (a, b) =>
                  b.score - a.score,
              )
              .map((item) => (
                <div
                  className="analysis-row"
                  key={`resume-exp-${item.index}`}
                >
                  <BriefcaseBusiness
                    size={15}
                  />

                  <div>
                    <b>
                      {item.title ??
                        'Experience'}
                      {item.organization
                        ? ` · ${item.organization}`
                        : ''}
                    </b>

                    <p>
                      {Math.round(
                        item.score,
                      )}
                      % relevance
                      {item.matchedTerms
                        .length > 0
                        ? ` · ${item.matchedTerms
                            .slice(0, 5)
                            .join(', ')}`
                        : ''}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p>
              No structured experience entries were available for this resume.
            </p>
          )}
        </div>

        <div className="detail-card">
          <span className="mini-label">
            PROJECT / WORK-SAMPLE RELEVANCE
          </span>

          <h3>
            Supporting evidence beyond job titles
          </h3>

          {currentAnalysis
            .workSampleMatches.length >
          0 ? (
            currentAnalysis
              .workSampleMatches
              .slice()
              .sort(
                (a, b) =>
                  b.score - a.score,
              )
              .map((item) => (
                <div
                  className="analysis-row"
                  key={`resume-project-${item.index}`}
                >
                  <Sparkles
                    size={15}
                  />

                  <div>
                    <b>
                      {item.name ??
                        'Project / work sample'}
                    </b>

                    <p>
                      {Math.round(
                        item.score,
                      )}
                      % relevance
                      {item.matchedTerms
                        .length > 0
                        ? ` · ${item.matchedTerms
                            .slice(0, 5)
                            .join(', ')}`
                        : ''}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p>
              This resume does not contain structured project or work-sample evidence. RoleClear does not penalize roles where such evidence is not normally expected.
            </p>
          )}
        </div>
      </div>

      <div className="recommendation">
        <Sparkles size={18} />

        <div>
          <span className="mini-label">
            RECOMMENDATION
          </span>

          <h3>
            Strengthen evidence for missing required requirements before tailoring.
          </h3>

          <p>
            RoleClear should only suggest truthful changes supported by your actual experience, projects, coursework, certifications or other resume evidence.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() =>
            setView(
              'resume-tailor',
            )
          }
        >
          Start tailoring
          <ArrowUpRight
            size={15}
          />
        </Button>
      </div>
    </div>
  );
}
'''

text = text[:start] + resume_match + text[end:]
APP.write_text(text)

print(f"Backup created: {backup}")
print("Updated: src/App.tsx")
print("Now run: npm run typecheck")
