from pathlib import Path

CSS_FILE = Path("src/index.css")

START = "/* ROLECLEAR_FORMATTING_PASS_START */"
END = "/* ROLECLEAR_FORMATTING_PASS_END */"

BLOCK = r"""
/* =========================================================
   ROLECLEAR — COMPLETED CORE PAGES FORMATTING PASS
   Smart Apply · ATS Checker · Application Tracker
   Visual-only overrides. No feature/business logic changes.
   ========================================================= */

:root {
  --rc-page-gap: 34px;
  --rc-card-pad: 26px;
  --rc-card-radius: 10px;
  --rc-soft-shadow: 0 8px 26px rgba(20, 32, 27, 0.035);
}

/* ---------- Shared page rhythm ---------- */

.app-content {
  line-height: 1.55;
}

.page-title {
  gap: 32px;
  align-items: flex-end;
  margin-bottom: 34px;
}

.page-title > div:first-child {
  max-width: 760px;
}

.page-title .section-kicker {
  display: block;
  margin-bottom: 11px;
  line-height: 1.25;
}

.page-title h1 {
  margin: 0 0 11px !important;
  line-height: 1.08;
  letter-spacing: -0.045em;
}

.page-title p {
  max-width: 690px;
  margin: 0 !important;
  font-size: 13px;
  line-height: 1.65;
}

.page-title > .button,
.page-title > div:last-child:not(:first-child) {
  flex: none;
}

.section-row {
  gap: 18px;
}

.section-row h2,
.section-row h3 {
  margin-top: 0;
}

.detail-card {
  border-radius: var(--rc-card-radius);
  box-shadow: var(--rc-soft-shadow);
}

.detail-card > :first-child {
  margin-top: 0;
}

.detail-card > :last-child {
  margin-bottom: 0;
}

.detail-card h2 {
  margin: 10px 0 8px;
  line-height: 1.2;
}

.detail-card h3 {
  margin: 8px 0 14px;
  line-height: 1.3;
}

.detail-card p {
  margin: 7px 0 0;
  line-height: 1.65;
}

.button {
  gap: 8px;
}

/* =========================================================
   SMART APPLY
   ========================================================= */

.apply-page {
  max-width: 1180px;
  margin: 0 auto;
}

.apply-page .page-title {
  margin-bottom: 31px;
}

.apply-layout {
  gap: 24px;
  align-items: start;
}

.apply-card {
  padding: 29px 30px 30px;
  border-radius: var(--rc-card-radius);
  box-shadow: var(--rc-soft-shadow);
}

.apply-tabs {
  gap: 27px;
  margin-bottom: 27px;
  padding-bottom: 1px;
}

.apply-tabs button {
  padding: 0 0 12px;
  line-height: 1.35;
}

.url-input-wrap {
  min-height: 54px;
  margin-top: 2px;
}

.url-input-wrap input {
  font-size: 13px;
}

.job-textarea {
  min-height: 170px;
  padding: 17px 18px;
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 1.65;
}

.drop-zone {
  padding: 26px 22px;
  border-radius: 9px;
}

.apply-note {
  margin: 17px 0 0;
  line-height: 1.6;
}

.analyze-button {
  min-height: 48px;
  margin-top: 22px;
}

.apply-side {
  display: grid;
  gap: 16px;
}

.workflow-card,
.why-card {
  border-radius: var(--rc-card-radius);
  padding: 24px;
}

.workflow-card h3,
.why-card h3 {
  margin: 9px 0 14px;
  line-height: 1.3;
}

.workflow-card p,
.why-card p {
  line-height: 1.6;
}

.workflow-steps {
  margin-top: 18px;
}

.workflow-steps > * {
  line-height: 1.45;
}

.recent-opportunities {
  margin-top: 38px;
}

.recent-opportunities .section-row {
  margin-bottom: 16px;
}

/* =========================================================
   APPLICATION TRACKER
   ========================================================= */

.toolbar {
  min-height: 50px;
  gap: 12px;
  margin-top: 0 !important;
  margin-bottom: 27px !important;
}

.toolbar-search {
  flex: 1 1 390px;
  max-width: 520px;
}

.toolbar-search input {
  min-height: 48px;
  border-radius: 9px;
  font-size: 12.5px;
}

.toolbar select {
  min-height: 48px !important;
  border-radius: 9px !important;
  padding: 0 38px 0 14px !important;
  font-size: 12px;
}

.toolbar > .button {
  min-height: 48px;
  white-space: nowrap;
}

.kanban {
  gap: 15px;
  align-items: start;
  padding: 2px 1px 12px;
}

.kanban-column {
  border-radius: 10px;
  padding: 14px;
  min-height: 280px;
}

.kanban-heading {
  min-height: 34px;
  gap: 10px;
  margin-bottom: 13px;
  padding: 0 2px;
}

.kanban-heading > div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.kanban-heading h3,
.kanban-heading b {
  margin: 0;
  line-height: 1.25;
}

.kanban-items {
  display: grid;
  gap: 10px;
}

.application-card {
  min-height: 132px;
  padding: 16px 16px 14px;
  border-radius: 9px;
  box-shadow: 0 4px 14px rgba(20, 32, 27, 0.025);
}

.application-card > div:first-child {
  gap: 10px;
  margin-bottom: 11px;
}

.application-card h3,
.application-card h4 {
  margin: 0;
  line-height: 1.35;
}

.application-card p {
  margin: 6px 0 0;
  line-height: 1.5;
}

.application-card small {
  line-height: 1.4;
}

.application-card .button {
  min-height: 34px;
}

.empty-column {
  padding: 24px 12px;
  line-height: 1.5;
}

/* Empty tracker state */
.toolbar + .detail-card,
.page-title + .toolbar + .detail-card {
  border-radius: 10px;
}

.page-title + .toolbar + .detail-card h2 {
  margin: 10px 0 7px;
}

.page-title + .toolbar + .detail-card p {
  max-width: 620px;
  margin: 0 auto 18px;
}

/* =========================================================
   ATS CHECKER
   ========================================================= */

.ats-top-grid {
  gap: 18px !important;
  margin-bottom: 25px !important;
}

.ats-top-grid > .detail-card {
  padding: 24px 25px !important;
  min-height: 184px !important;
}

.ats-top-grid .file-icon {
  flex: none;
}

.ats-top-grid h3 {
  margin: 0 !important;
  line-height: 1.25;
}

.ats-top-grid p {
  margin-top: 5px !important;
  line-height: 1.5;
}

.ats-top-grid strong {
  letter-spacing: -0.025em;
}

.resume-detail-grid {
  gap: 20px;
  align-items: start;
}

.resume-detail-grid > * {
  min-width: 0;
}

.resume-detail-grid .detail-card {
  padding: 25px;
}

.resume-detail-grid .section-row {
  margin-bottom: 17px;
  align-items: flex-start;
}

.resume-detail-grid .section-row h2,
.resume-detail-grid .section-row h3 {
  margin-bottom: 0;
}

.plain-list {
  margin-top: 14px;
}

.plain-list li {
  padding: 10px 0;
  line-height: 1.55;
}

.version-grid {
  gap: 14px;
}

.version-card {
  padding: 17px;
  border-radius: 9px;
}

.version-card > div {
  min-width: 0;
}

.version-card h3,
.version-card b {
  line-height: 1.35;
}

.version-card p,
.version-card small {
  line-height: 1.55;
}

.full-button {
  margin-top: 16px;
}

/* ATS recommendation / diagnostic cards that use generic detail-card */
.ats-top-grid ~ .detail-card {
  margin-bottom: 16px;
}

/* =========================================================
   RESPONSIVE RHYTHM
   ========================================================= */

@media (max-width: 1050px) {
  .apply-layout {
    gap: 18px;
  }

  .apply-card {
    padding: 25px;
  }

  .kanban {
    gap: 12px;
  }

  .kanban-column {
    min-width: 235px;
  }
}

@media (max-width: 900px) {
  .page-title {
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 28px;
  }

  .apply-layout {
    gap: 16px;
  }

  .apply-side {
    margin-top: 16px;
  }

  .toolbar {
    flex-wrap: wrap;
  }

  .toolbar-search {
    flex-basis: 100%;
    max-width: none;
  }

  .kanban {
    overflow-x: auto;
    padding-bottom: 16px;
  }

  .kanban-column {
    min-width: 245px;
  }
}

@media (max-width: 580px) {
  .page-title {
    margin-bottom: 24px;
  }

  .page-title .section-kicker {
    margin-bottom: 9px;
  }

  .page-title p {
    font-size: 12px;
    line-height: 1.6;
  }

  .apply-card {
    padding: 20px;
  }

  .apply-tabs {
    gap: 17px;
    overflow-x: auto;
    margin-bottom: 22px;
  }

  .apply-tabs button {
    white-space: nowrap;
  }

  .workflow-card,
  .why-card {
    padding: 20px;
  }

  .toolbar {
    gap: 9px;
    margin-bottom: 21px !important;
  }

  .toolbar-search {
    flex-basis: 100%;
  }

  .toolbar select,
  .toolbar > .button {
    flex: 1 1 auto;
  }

  .ats-top-grid > .detail-card,
  .resume-detail-grid .detail-card {
    padding: 20px !important;
  }
}
"""

if not CSS_FILE.exists():
    raise SystemExit(
        "Could not find src/index.css. Run this script from the RoleClear project root."
    )

text = CSS_FILE.read_text(encoding="utf-8")

wrapped = (
    "\n\n"
    + START
    + "\n"
    + BLOCK.strip()
    + "\n"
    + END
    + "\n"
)

if START in text and END in text:
    before = text.split(START, 1)[0].rstrip()
    after = text.split(END, 1)[1].lstrip()
    updated = before + wrapped + ("\n" + after if after else "")
else:
    updated = text.rstrip() + wrapped

CSS_FILE.write_text(updated, encoding="utf-8")

print("Updated src/index.css")
print("Formatting applied to:")
print("- Smart Apply")
print("- ATS Checker")
print("- Application Tracker")
print("No TypeScript or feature logic was changed.")
