from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
import re
from urllib.parse import urlparse

from docx import Document
from docx.oxml.ns import qn
from pypdf import PdfReader

try:
    import pymupdf
except ImportError:
    pymupdf = None

from app.schemas.resume import (
    CategorizedSkills,
    OtherSection,
    ParsedResumeV2,
    ParsingMetadata,
    ParsingWarning,
    PersonalInfo,
    RawSection,
    ResumeAchievement,
    ResumeCertification,
    ResumeCoursework,
    ResumeEducation,
    ResumeExperience,
    ResumeLanguage,
    ResumeLink,
    ResumeProject,
    ResumePublication,
    ResumeResearch,
    SkillItem,
)


class ResumeParsingError(Exception):
    pass


# =========================================================
# INTERNAL DOCUMENT METADATA
# =========================================================

@dataclass
class ExtractedHyperlink:
    label: str
    url: str
    paragraph_text: str


# =========================================================
# SECTION TAXONOMY
# =========================================================

SECTION_ALIASES: dict[str, set[str]] = {
    "summary": {
        "summary",
        "professional summary",
        "career summary",
        "profile",
        "professional profile",
        "objective",
        "career objective",
        "about me",
    },
    "skills": {
        "skills",
        "technical skills",
        "core skills",
        "key skills",
        "competencies",
        "technical competencies",
        "technologies",
        "tech stack",
    },
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "employment history",
        "internships",
        "internship experience",
        "work history",
    },
    "projects": {
        "projects",
        "technical projects",
        "academic projects",
        "personal projects",
        "selected projects",
        "project experience",
    },
    "education": {
        "education",
        "academic background",
        "academics",
        "education history",
        "qualifications",
    },
    "certifications": {
        "certification",
        "certifications",
        "licenses",
        "licenses & certifications",
        "licences",
        "licences & certifications",
        "certificates",
    },
    "publications_research": {
        "publications",
        "publication",
        "research",
        "publications & research",
        "research & publications",
        "papers",
        "research experience",
        "research work",
    },
    "achievements": {
        "achievements",
        "achievement",
        "awards",
        "awards & achievements",
        "honors",
        "honours",
        "accomplishments",
    },
    "languages": {
        "languages",
        "language",
        "language proficiency",
    },
    "coursework": {
        "coursework",
        "relevant coursework",
        "courses",
        "relevant courses",
    },
    "volunteering": {
        "volunteering",
        "volunteer experience",
        "community service",
    },
    "leadership": {
        "leadership",
        "leadership experience",
        "positions of responsibility",
        "responsibilities",
    },
    "interests": {
        "interests",
        "hobbies",
        "hobbies & interests",
    },
}

ALIAS_TO_SECTION: dict[str, str] = {
    alias: canonical
    for canonical, aliases in SECTION_ALIASES.items()
    for alias in aliases
}


# =========================================================
# SKILL TAXONOMY
# =========================================================

SKILL_CATEGORIES: dict[str, dict[str, list[str]]] = {
    "programming_languages": {
        "Python": ["python"],
        "Java": ["java"],
        "C": ["c language", "c programming"],
        "C++": ["c++", "cpp"],
        "C#": ["c#", "c sharp"],
        "JavaScript": ["javascript", "js"],
        "TypeScript": ["typescript", "ts"],
        "Go": ["golang", "go language"],
        "Rust": ["rust"],
        "Kotlin": ["kotlin"],
        "Swift": ["swift"],
        "PHP": ["php"],
        "Ruby": ["ruby"],
        "R": ["r programming", "r language"],
        "Dart": ["dart"],
        "SQL": ["sql"],
    },
    "frameworks": {
        "React": ["react", "react.js", "reactjs"],
        "Next.js": ["next.js", "nextjs"],
        "Node.js": ["node.js", "nodejs"],
        "Express.js": ["express.js", "expressjs", "express"],
        "NestJS": ["nestjs", "nest.js"],
        "FastAPI": ["fastapi"],
        "Django": ["django"],
        "Flask": ["flask"],
        "Spring Boot": ["spring boot"],
        "Angular": ["angular"],
        "Vue.js": ["vue.js", "vuejs"],
        "Tailwind CSS": ["tailwind css", "tailwind"],
        "Flutter": ["flutter"],
        "React Native": ["react native"],
    },
    "libraries": {
        "Pandas": ["pandas"],
        "NumPy": ["numpy"],
        "scikit-learn": ["scikit-learn", "sklearn"],
        "TensorFlow": ["tensorflow"],
        "PyTorch": ["pytorch"],
        "Transformers": ["hugging face transformers", "transformers"],
        "OpenCV": ["opencv"],
    },
    "databases": {
        "PostgreSQL": ["postgresql", "postgres"],
        "MySQL": ["mysql"],
        "SQLite": ["sqlite"],
        "MongoDB": ["mongodb"],
        "Redis": ["redis"],
        "DynamoDB": ["dynamodb", "amazon dynamodb"],
    },
    "cloud": {
        "AWS": ["aws", "amazon web services"],
        "GCP": ["gcp", "google cloud", "google cloud platform"],
        "Azure": ["azure", "microsoft azure"],
        "Firebase": ["firebase"],
        "Supabase": ["supabase"],
        "Vercel": ["vercel"],
        "Render": ["render"],
        "Aiven": ["aiven"],
    },
    "devops": {
        "Docker": ["docker"],
        "Kubernetes": ["kubernetes", "k8s"],
        "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
        "GitHub Actions": ["github actions"],
        "Terraform": ["terraform"],
        "Jenkins": ["jenkins"],
        "Linux": ["linux"],
    },
    "developer_tools": {
        "Git": ["git"],
        "GitHub": ["github"],
        "Prisma ORM": ["prisma orm", "prisma"],
        "PostGIS": ["postgis"],
        "Socket.IO": ["socket.io", "socketio"],
        "Postman": ["postman"],
        "VS Code": ["visual studio code", "vs code", "vscode"],
        "Unity": ["unity"],
    },
    "ai_ml": {
        "Machine Learning": ["machine learning"],
        "Deep Learning": ["deep learning"],
        "Generative AI": ["generative ai", "genai"],
        "LLMs": ["llm", "llms", "large language model", "large language models"],
        "NLP": ["nlp", "natural language processing"],
        "Computer Vision": ["computer vision"],
        "RAG": ["retrieval augmented generation", "rag"],
        "AI Agents": ["ai agents", "agentic ai", "agents"],
        "Gemini": ["gemini"],
        "Reinforcement Learning": ["reinforcement learning", "q-learning"],
    },
    "data": {
        "Data Analysis": ["data analysis"],
        "Data Analytics": ["data analytics"],
        "Data Visualization": ["data visualization"],
        "ETL": ["etl"],
    },
    "mobile": {},
    "web": {
        "REST APIs": ["rest api", "rest apis", "restful api", "restful apis"],
        "WebSockets": ["websocket", "websockets"],
        "JWT": ["jwt", "json web token"],
        "RBAC": ["rbac", "role based access control", "role-based access control"],
    },
    "concepts": {
        "DSA": ["dsa", "data structures and algorithms"],
        "DAA": ["daa", "design and analysis of algorithms"],
        "DBMS": ["dbms", "database management systems"],
        "Operating Systems": ["operating systems", "operating system"],
        "Object-Oriented Programming": [
            "object-oriented programming",
            "object oriented programming",
            "oop",
        ],
        "Cloud Computing": ["cloud computing"],
        "Distributed Systems": ["distributed systems"],
        "System Design": ["system design"],
        "Microservices": ["microservices"],
        "Data Structures": ["data structures"],
        "Algorithms": ["algorithms"],
    },
    "soft_skills": {},
    "other": {},
}


# =========================================================
# DOCUMENT EXTRACTION
# =========================================================

def _repair_internal_hyphens(text: str) -> str:
    """
    Repair common PDF extraction artifacts without variable-width
    look-behind expressions.

    Examples:
      full -stack       -> full-stack
      AI- driven        -> AI-driven
      tenant- aware     -> tenant-aware
      end - to-end      -> end-to-end

    Structural separators such as date ranges and project title separators
    are preserved by only joining when the right-hand token starts lowercase.
    """
    value = text

    # "full -stack", "Vision -Language" is intentionally conservative:
    # join only when RHS begins lowercase. Title separators usually begin
    # uppercase and therefore remain untouched.
    value = re.sub(
        r"\b([A-Za-z]{2,})\s+-\s+([a-z][A-Za-z0-9-]*)\b",
        r"\1-\2",
        value,
    )

    # "tenant- aware" -> "tenant-aware"
    value = re.sub(
        r"\b([A-Za-z]{2,})-\s+([a-z][A-Za-z0-9-]*)\b",
        r"\1-\2",
        value,
    )

    # "end - to-end" -> "end-to-end"
    value = re.sub(
        r"\b([A-Za-z]{2,})\s+-\s+([a-z]{2,}-[A-Za-z][A-Za-z0-9-]*)\b",
        r"\1-\2",
        value,
    )

    # PDF line-wrap artifact after a hyphen:
    # "tenant-\naware" is handled after line joining as "tenant- aware".
    return value


def _clean_line(text: str) -> str:
    text = (
        text.replace("\x00", " ")
        .replace("\u200b", "")
        .replace("\ufeff", "")
        .replace("\u00ad", "")
    )

    text = re.sub(r"\s+", " ", text).strip()
    text = _repair_internal_hyphens(text)

    return text


def _clean_text(text: str) -> str:
    return "\n".join(
        line
        for line in (_clean_line(x) for x in text.splitlines())
        if line
    )


def _extract_pdf(
    content: bytes,
) -> tuple[str, int | None, list[ExtractedHyperlink]]:
    try:
        # Prefer PyMuPDF when available because it exposes hyperlink
        # rectangles and nearby text, which lets us associate project links
        # with the correct project header.
        if pymupdf is not None:
            document = pymupdf.open(
                stream=content,
                filetype="pdf",
            )

            pages: list[str] = []
            links: list[ExtractedHyperlink] = []

            for page in document:
                # -----------------------------------------------------
                # LAYOUT-AWARE TEXT EXTRACTION
                # -----------------------------------------------------
                # page.get_text("text") can flatten visually separate
                # resume rows into one logical line. That is exactly what
                # caused multiple experience/project headers to be absorbed
                # into previous bullets.
                #
                # PyMuPDF words expose:
                # x0, y0, x1, y1, text, block_no, line_no, word_no
                #
                # Reconstruct each visual line from those coordinates,
                # preserving left-to-right word order and top-to-bottom
                # line order.
                words = page.get_text("words") or []

                line_map: dict[
                    tuple[int, int],
                    list[tuple[float, float, str]],
                ] = {}

                line_y: dict[
                    tuple[int, int],
                    float,
                ] = {}

                for word in words:
                    (
                        x0,
                        y0,
                        x1,
                        y1,
                        token,
                        block_no,
                        line_no,
                        word_no,
                    ) = word

                    key = (
                        int(block_no),
                        int(line_no),
                    )

                    line_map.setdefault(
                        key,
                        [],
                    ).append(
                        (
                            float(x0),
                            float(y0),
                            str(token),
                        )
                    )

                    if key not in line_y:
                        line_y[key] = float(y0)
                    else:
                        line_y[key] = min(
                            line_y[key],
                            float(y0),
                        )

                visual_lines: list[
                    tuple[float, float, str]
                ] = []

                for key, tokens in line_map.items():
                    tokens.sort(
                        key=lambda item: item[0]
                    )

                    line_text = _clean_line(
                        " ".join(
                            token
                            for _, _, token in tokens
                        )
                    )

                    if not line_text:
                        continue

                    first_x = min(
                        item[0]
                        for item in tokens
                    )

                    visual_lines.append(
                        (
                            line_y.get(key, 0.0),
                            first_x,
                            line_text,
                        )
                    )

                # Primary sort: vertical position.
                # Secondary sort: left-most x position.
                visual_lines.sort(
                    key=lambda item: (
                        round(item[0], 1),
                        item[1],
                    )
                )

                page_text = "\n".join(
                    line_text
                    for _, _, line_text
                    in visual_lines
                )

                if page_text.strip():
                    pages.append(
                        page_text
                    )

                # -----------------------------------------------------
                # HYPERLINK EXTRACTION
                # -----------------------------------------------------
                for link in page.get_links():
                    uri = link.get("uri")
                    rect = link.get("from")

                    if not uri or rect is None:
                        continue

                    nearby_words: list[
                        tuple[float, str]
                    ] = []

                    for word in words:
                        (
                            x0,
                            y0,
                            x1,
                            y1,
                            token,
                            *_,
                        ) = word

                        same_band = (
                            y1 >= rect.y0 - 10
                            and y0 <= rect.y1 + 10
                        )

                        horizontal_near = (
                            x1 >= rect.x0 - 350
                            and x0 <= rect.x1 + 350
                        )

                        if (
                            same_band
                            and horizontal_near
                        ):
                            nearby_words.append(
                                (
                                    float(x0),
                                    str(token),
                                )
                            )

                    nearby_words.sort(
                        key=lambda item: item[0]
                    )

                    context = _clean_line(
                        " ".join(
                            token
                            for _, token
                            in nearby_words
                        )
                    )

                    links.append(
                        ExtractedHyperlink(
                            label=(
                                context
                                or str(uri)
                            ),
                            url=str(uri),
                            paragraph_text=context,
                        )
                    )

            return (
                _clean_text(
                    "\n".join(pages)
                ),
                len(document),
                links,
            )

        # Fallback: pypdf text + raw URI annotations.
        reader = PdfReader(BytesIO(content))
        pages: list[str] = []
        links: list[ExtractedHyperlink] = []

        for page in reader.pages:
            page_text = page.extract_text() or ""

            if page_text.strip():
                pages.append(page_text)

            annotations = page.get("/Annots")

            if annotations:
                for annotation_ref in annotations:
                    try:
                        annotation = annotation_ref.get_object()
                        action = annotation.get("/A")

                        if not action:
                            continue

                        uri = action.get("/URI")

                        if not uri:
                            continue

                        links.append(
                            ExtractedHyperlink(
                                label=str(uri),
                                url=str(uri),
                                paragraph_text="",
                            )
                        )
                    except Exception:
                        continue

        return (
            _clean_text("\n".join(pages)),
            len(reader.pages),
            links,
        )

    except Exception as exc:
        raise ResumeParsingError(
            f"Could not read PDF resume: {exc}"
        ) from exc


def _docx_hyperlinks(document: Document) -> list[ExtractedHyperlink]:
    links: list[ExtractedHyperlink] = []

    for paragraph in document.paragraphs:
        paragraph_text = _clean_line(paragraph.text)

        for hyperlink in paragraph._p.xpath(".//w:hyperlink"):
            rel_id = hyperlink.get(qn("r:id"))

            if not rel_id or rel_id not in document.part.rels:
                continue

            target = document.part.rels[rel_id].target_ref

            text_nodes = hyperlink.xpath(".//w:t")
            label = _clean_line(
                "".join(node.text or "" for node in text_nodes)
            )

            if target:
                links.append(
                    ExtractedHyperlink(
                        label=label or target,
                        url=target,
                        paragraph_text=paragraph_text,
                    )
                )

    return links


def _extract_docx(
    content: bytes,
) -> tuple[str, int | None, list[ExtractedHyperlink]]:
    try:
        document = Document(BytesIO(content))
        blocks: list[str] = []

        for paragraph in document.paragraphs:
            value = _clean_line(paragraph.text)
            if value:
                blocks.append(value)

        for table in document.tables:
            for row in table.rows:
                cells = [
                    _clean_line(cell.text)
                    for cell in row.cells
                    if _clean_line(cell.text)
                ]
                if cells:
                    blocks.append(" | ".join(cells))

        return (
            _clean_text("\n".join(blocks)),
            None,
            _docx_hyperlinks(document),
        )

    except Exception as exc:
        raise ResumeParsingError(
            f"Could not read DOCX resume: {exc}"
        ) from exc


def _extract_txt(
    content: bytes,
) -> tuple[str, int | None, list[ExtractedHyperlink]]:
    try:
        return (
            _clean_text(content.decode("utf-8", errors="ignore")),
            None,
            [],
        )
    except Exception as exc:
        raise ResumeParsingError(
            f"Could not read TXT resume: {exc}"
        ) from exc


def extract_resume_text(
    file_name: str,
    content: bytes,
) -> tuple[str, str, int | None, list[ExtractedHyperlink]]:
    lower_name = file_name.lower()

    if lower_name.endswith(".pdf"):
        text, page_count, links = _extract_pdf(content)
        return text, "pdf", page_count, links

    if lower_name.endswith(".docx"):
        text, page_count, links = _extract_docx(content)
        return text, "docx", page_count, links

    if lower_name.endswith(".txt"):
        text, page_count, links = _extract_txt(content)
        return text, "txt", page_count, links

    raise ResumeParsingError(
        "Unsupported resume format. Use PDF, DOCX or TXT."
    )


# =========================================================
# SECTION DETECTION
# =========================================================

def _normalize_heading(text: str) -> str:
    return _clean_line(text).strip(" :|-–—").lower()


def _canonical_section(line: str) -> str | None:
    return ALIAS_TO_SECTION.get(_normalize_heading(line))


def _is_known_section_heading(line: str) -> bool:
    return _canonical_section(line) is not None


def _prepare_text_for_section_detection(
    raw_text: str,
) -> str:
    """
    Repair PDF layout flattening before structural resume parsing.

    Major headings and skill labels are handled with single-pass regex
    alternations. This prevents a longer heading such as
    "TECHNICAL PROJECTS" from later being split again by "PROJECTS".
    """
    value = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    # Restore visible bullet boundaries.
    value = re.sub(
        r"[ \t]*([•●▪◦])[ \t]*",
        r"\n\1 ",
        value,
    )

    # Repair common headings split across two physical PDF lines.
    split_heading_repairs = [
        (
            r"(?im)^\s*TECHNICAL\s*\n\s*PROJECTS\s*$",
            "TECHNICAL PROJECTS",
        ),
        (
            r"(?im)^\s*PROFESSIONAL\s*\n\s*EXPERIENCE\s*$",
            "PROFESSIONAL EXPERIENCE",
        ),
        (
            r"(?im)^\s*INTERNSHIP\s*\n\s*EXPERIENCE\s*$",
            "INTERNSHIP EXPERIENCE",
        ),
        (
            r"(?im)^\s*RELEVANT\s*\n\s*COURSEWORK\s*$",
            "RELEVANT COURSEWORK",
        ),
        (
            r"(?im)^\s*AWARDS\s*&?\s*\n\s*ACHIEVEMENTS\s*$",
            "AWARDS & ACHIEVEMENTS",
        ),
    ]

    for pattern, replacement in split_heading_repairs:
        value = re.sub(pattern, replacement, value)

    # Restore inline Skills subsection labels in one pass.
    skill_labels = [
        "Programming Languages",
        "Technologies/Frameworks",
        "Developer Tools",
        "Cloud Platforms",
        "Frameworks",
        "Technologies",
        "Databases",
        "Libraries",
        "Coursework",
        "DevOps",
        "AI/ML",
        "Cloud",
    ]

    skill_label_pattern = re.compile(
        r"(?i)(?<![A-Za-z0-9])("
        + "|".join(
            re.escape(label)
            for label in sorted(
                skill_labels,
                key=len,
                reverse=True,
            )
        )
        + r")\s*:"
    )

    value = skill_label_pattern.sub(
        lambda match: f"\n{match.group(0)}",
        value,
    )

    # Restore major section boundaries in one pass.
    strong_headings = [
        "PUBLICATIONS & RESEARCH",
        "RESEARCH & PUBLICATIONS",
        "PROFESSIONAL EXPERIENCE",
        "INTERNSHIP EXPERIENCE",
        "TECHNICAL PROJECTS",
        "SELECTED PROJECTS",
        "RELEVANT COURSEWORK",
        "AWARDS & ACHIEVEMENTS",
        "LICENSES & CERTIFICATIONS",
        "LICENCES & CERTIFICATIONS",
        "CERTIFICATIONS",
        "ACHIEVEMENTS",
        "PUBLICATIONS",
        "EXPERIENCE",
        "EDUCATION",
        "PROJECTS",
        "RESEARCH",
        "SUMMARY",
        "SKILLS",
        "LANGUAGES",
        "COURSEWORK",
    ]

    heading_pattern = re.compile(
        r"(?<![A-Z0-9])("
        + "|".join(
            re.escape(heading)
            for heading in sorted(
                strong_headings,
                key=len,
                reverse=True,
            )
        )
        + r")(?![A-Z0-9])"
    )

    value = heading_pattern.sub(
        lambda match: f"\n{match.group(1)}\n",
        value,
    )

    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)

    return value


def _split_sections(
    raw_text: str,
) -> tuple[dict[str, list[str]], dict[str, RawSection], list[str]]:
    prepared_text = _prepare_text_for_section_detection(
        raw_text
    )

    lines = [
        _clean_line(line)
        for line in prepared_text.splitlines()
        if _clean_line(line)
    ]

    sections: dict[str, list[str]] = {}
    raw_sections: dict[str, RawSection] = {}
    preamble: list[str] = []

    current_key: str | None = None
    current_raw_key: str | None = None

    for line in lines:
        canonical = _canonical_section(line)

        if canonical is not None:
            current_key = canonical
            sections.setdefault(current_key, [])

            raw_key = current_key
            suffix = 2

            while raw_key in raw_sections:
                raw_key = f"{current_key}_{suffix}"
                suffix += 1

            raw_sections[raw_key] = RawSection(
                heading=line,
                normalized_heading=canonical,
                lines=[],
                page_numbers=[],
            )
            current_raw_key = raw_key
            continue

        if current_key is None:
            preamble.append(line)
            continue

        sections[current_key].append(line)

        if current_raw_key:
            raw_sections[current_raw_key].lines.append(line)

    return sections, raw_sections, preamble


# =========================================================
# RAW-TEXT STRUCTURAL FALLBACK
# =========================================================

def _raw_section_lines(
    raw_text: str,
    section: str,
) -> list[str]:
    """
    Recover one major section directly from the original extracted text.

    This is a fallback for PDFs where the generic section-preparation pass
    accidentally changes layout boundaries. It only uses headings that are
    explicitly present in the source text.

    The direct raw-text path is especially useful for conventional one-column
    resumes where headings such as EXPERIENCE and TECHNICAL PROJECTS already
    appear on their own lines.
    """
    heading_sets: dict[str, set[str]] = {
        "experience": {
            "experience",
            "work experience",
            "professional experience",
            "internships",
            "internship experience",
            "work history",
            "employment",
            "employment history",
        },
        "projects": {
            "projects",
            "technical projects",
            "academic projects",
            "personal projects",
            "selected projects",
            "project experience",
        },
    }

    target_headings = heading_sets.get(section, set())

    if not target_headings:
        return []

    all_major_headings = {
        alias
        for aliases in SECTION_ALIASES.values()
        for alias in aliases
    }

    lines = [
        _clean_line(line)
        for line in raw_text.splitlines()
        if _clean_line(line)
    ]

    collecting = False
    result: list[str] = []

    for line in lines:
        normalized = _normalize_heading(line)

        if not collecting:
            if normalized in target_headings:
                collecting = True
            continue

        # Once target section has started, the next explicit known section
        # heading closes it.
        if normalized in all_major_headings:
            break

        result.append(line)

    return result


# =========================================================
# PERSONAL INFORMATION
# =========================================================

EMAIL_RE = re.compile(
    r"\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b",
    re.IGNORECASE,
)

PHONE_RE = re.compile(
    r"(?:\+\d{1,3}[\s\-]?)?(?:\(?\d{2,4}\)?[\s\-]?)?\d[\d\s\-]{7,}\d"
)

URL_RE = re.compile(
    r"(https?://[^\s|]+|www\.[^\s|]+)",
    re.IGNORECASE,
)

NON_NAME_WORDS = {
    "resume",
    "curriculum",
    "vitae",
    "cv",
    "email",
    "phone",
    "mobile",
    "linkedin",
    "github",
    "portfolio",
    "address",
}


def _looks_like_person_name(line: str) -> bool:
    value = _clean_line(line).strip(".,|")

    if not value or len(value) > 80:
        return False

    if EMAIL_RE.search(value) or PHONE_RE.search(value) or URL_RE.search(value):
        return False

    if _is_known_section_heading(value):
        return False

    words = value.split()

    if not 2 <= len(words) <= 6:
        return False

    if any(word.lower().strip(".,:") in NON_NAME_WORDS for word in words):
        return False

    alpha_chars = sum(ch.isalpha() for ch in value)
    visible_chars = sum(ch.isalnum() for ch in value)

    if visible_chars == 0 or alpha_chars / visible_chars < 0.75:
        return False

    # All-caps names such as "AARYA RAI" are valid and common in resumes.
    if value.isupper():
        return True

    capitalized = sum(
        1
        for word in words
        if word and word[0].isupper()
    )

    return capitalized >= max(2, len(words) - 1)


def _resume_link_type(url: str, label: str = "") -> str:
    lower = f"{url} {label}".lower()

    if "linkedin" in lower:
        return "linkedin"

    if "github" in lower:
        return "github"

    if any(
        token in lower
        for token in [
            "portfolio",
            "personal website",
            "personal site",
            "my website",
        ]
    ):
        return "portfolio"

    return "website"


def _dedupe_resume_links(
    links: list[ResumeLink],
) -> list[ResumeLink]:
    result: list[ResumeLink] = []
    seen: set[str] = set()

    for link in links:
        key = link.url.lower().rstrip("/")

        if key in seen:
            continue

        seen.add(key)
        result.append(link)

    return result


def _github_profile_url(url: str) -> bool:
    """
    A GitHub profile has exactly one path segment:
      github.com/username

    Repository links such as:
      github.com/username/project
    are project links, not personal profile links.
    """
    try:
        parsed = urlparse(url)
    except Exception:
        return False

    host = parsed.netloc.lower()

    if host not in {"github.com", "www.github.com"}:
        return False

    segments = [
        part
        for part in parsed.path.split("/")
        if part
    ]

    return len(segments) == 1


def _explicit_portfolio_link(
    url: str,
    label: str,
    preamble_text: str,
) -> bool:
    """
    Do not guess that an arbitrary deployed project is the candidate's
    portfolio. Only classify a website as portfolio when the resume itself
    explicitly labels it as portfolio/personal website.
    """
    label_lower = label.lower()
    preamble_lower = preamble_text.lower()

    explicit_labels = {
        "portfolio",
        "personal website",
        "personal site",
        "website",
        "my website",
    }

    if any(token in label_lower for token in explicit_labels):
        return True

    if (
        ("portfolio" in preamble_lower or "website" in preamble_lower)
        and "linkedin" not in url.lower()
        and "github.com" not in url.lower()
    ):
        return True

    return False


def _extract_personal_info(
    preamble: list[str],
    raw_text: str,
    hyperlinks: list[ExtractedHyperlink],
) -> PersonalInfo:
    raw_top = [
        _clean_line(line)
        for line in raw_text.splitlines()[:20]
        if _clean_line(line)
    ]

    top: list[str] = []
    seen_top: set[str] = set()

    for line in [*preamble[:10], *raw_top]:
        key = line.lower()
        if key in seen_top:
            continue
        seen_top.add(key)
        top.append(line)

    top = top[:20]
    top_text = "\n".join(top)

    email_match = EMAIL_RE.search(top_text)
    phone_match = PHONE_RE.search(top_text)

    full_name = next(
        (line for line in top if _looks_like_person_name(line)),
        None,
    )

    # PDF flattening can merge the candidate name with the contact row:
    # "AARYA RAI Phone - ... | Mail - ..."
    # Recover only the visible prefix before a known contact label.
    if full_name is None:
        top_blob = " ".join(top[:5])

        prefix_match = re.match(
            r"^\s*([A-Za-z][A-Za-z .'-]{1,70}?)"
            r"\s+(?:Phone|Mobile|Mail|Email|Github|GitHub|LinkedIn)\b",
            top_blob,
            flags=re.IGNORECASE,
        )

        if prefix_match:
            candidate_name = _clean_line(
                prefix_match.group(1)
            ).strip(" |,-")

            if _looks_like_person_name(candidate_name):
                full_name = candidate_name

    # Final conservative fallback for all-caps names at the start of the PDF.
    if full_name is None:
        first_text = _clean_line(
            raw_text[:250]
        )

        caps_match = re.match(
            r"^([A-Z][A-Z .'-]{2,60}?)(?=\s+(?:Phone|Mobile|Mail|Email|Github|GitHub|LinkedIn)\b)",
            first_text,
        )

        if caps_match:
            candidate_name = _clean_line(
                caps_match.group(1)
            ).strip(" |,-")

            if _looks_like_person_name(candidate_name):
                full_name = candidate_name

    personal_links: list[ResumeLink] = []

    for item in hyperlinks:
        url = item.url.strip()
        label = item.label.strip()
        lower_url = url.lower()

        if "linkedin.com" in lower_url:
            personal_links.append(
                ResumeLink(
                    label=label or "LinkedIn",
                    url=url,
                    type="linkedin",
                )
            )
            continue

        if _github_profile_url(url):
            personal_links.append(
                ResumeLink(
                    label=label or "GitHub",
                    url=url,
                    type="github",
                )
            )
            continue

        paragraph_is_preamble = bool(
            item.paragraph_text
            and item.paragraph_text in top_text
        )

        if paragraph_is_preamble and _explicit_portfolio_link(
            url,
            label,
            top_text,
        ):
            personal_links.append(
                ResumeLink(
                    label=label or "Portfolio",
                    url=url,
                    type="portfolio",
                )
            )

    for match in URL_RE.findall(top_text):
        url = match.rstrip(".,);]")

        if url.lower().startswith("www."):
            url = f"https://{url}"

        lower_url = url.lower()

        if "linkedin.com" in lower_url:
            personal_links.append(
                ResumeLink(
                    label="LinkedIn",
                    url=url,
                    type="linkedin",
                )
            )

        elif _github_profile_url(url):
            personal_links.append(
                ResumeLink(
                    label="GitHub",
                    url=url,
                    type="github",
                )
            )

        elif _explicit_portfolio_link(
            url,
            "website",
            top_text,
        ):
            personal_links.append(
                ResumeLink(
                    label="Portfolio",
                    url=url,
                    type="portfolio",
                )
            )

    personal_links = _dedupe_resume_links(personal_links)

    linkedin = next(
        (
            link.url
            for link in personal_links
            if link.type == "linkedin"
        ),
        None,
    )

    github = next(
        (
            link.url
            for link in personal_links
            if link.type == "github"
        ),
        None,
    )

    portfolio = next(
        (
            link.url
            for link in personal_links
            if link.type == "portfolio"
        ),
        None,
    )

    return PersonalInfo(
        full_name=full_name,
        email=email_match.group(0) if email_match else None,
        phone=_clean_line(phone_match.group(0)) if phone_match else None,
        location=None,
        linkedin=linkedin,
        github=github,
        portfolio=portfolio,
        links=personal_links,
    )


# =========================================================
# SKILL EXTRACTION
# =========================================================

def _contains_alias(text: str, alias: str) -> bool:
    escaped = re.escape(alias.lower())
    pattern = rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"
    return re.search(pattern, text.lower()) is not None


def _taxonomy_skills(text: str) -> CategorizedSkills:
    kwargs: dict[str, list[SkillItem]] = {
        category: []
        for category in CategorizedSkills.model_fields
    }

    for category, items in SKILL_CATEGORIES.items():
        for normalized_name, aliases in items.items():
            found_aliases = [
                alias
                for alias in aliases
                if _contains_alias(text, alias)
            ]

            if not found_aliases:
                continue

            kwargs[category].append(
                SkillItem(
                    name=normalized_name,
                    normalized_name=normalized_name,
                    aliases_found=sorted(set(found_aliases)),
                    confidence=0.98,
                )
            )

    return CategorizedSkills(**kwargs)


def _split_csv_like(value: str) -> list[str]:
    parts = re.split(r",|;|\s+\|\s+", value)

    return [
        _clean_line(part)
        for part in parts
        if _clean_line(part)
    ]


def _canonical_skill_match(
    candidate: str,
) -> tuple[str, str] | None:
    clean = _clean_line(candidate).strip(" .")

    if not clean:
        return None

    lower = clean.lower()

    # Normalize common UI/tool wording into the actual underlying skill.
    explicit_aliases = {
        "firebase console": ("Firebase", "cloud"),
        "supabase console": ("Supabase", "cloud"),
        "aws console": ("AWS", "cloud"),
        "amazon web services console": ("AWS", "cloud"),
        "gcp console": ("GCP", "cloud"),
        "google cloud console": ("GCP", "cloud"),
        "github console": ("GitHub", "developer_tools"),
    }

    if lower in explicit_aliases:
        return explicit_aliases[lower]

    for category, items in SKILL_CATEGORIES.items():
        for normalized_name, aliases in items.items():
            candidates = [normalized_name, *aliases]

            if any(lower == item.lower() for item in candidates):
                return normalized_name, category

    return None


def _expand_explicit_skill_candidate(
    candidate: str,
) -> list[str]:
    clean = _clean_line(candidate)

    if not clean:
        return []

    # Compound phrases such as "AWS & GCP Console" represent two skills,
    # not a third artificial skill named "AWS & GCP Console".
    lower = clean.lower()

    if (
        ("aws" in lower or "amazon web services" in lower)
        and ("gcp" in lower or "google cloud" in lower)
    ):
        return ["AWS", "GCP"]

    return [clean]


def _merge_explicit_skills(
    categorized: CategorizedSkills,
    skill_section: list[str],
) -> CategorizedSkills:
    category_map = {
        "programming languages": "programming_languages",
        "technologies/frameworks": "frameworks",
        "technologies": "frameworks",
        "frameworks": "frameworks",
        "libraries": "libraries",
        "databases": "databases",
        "database": "databases",
        "cloud": "cloud",
        "cloud platforms": "cloud",
        "developer tools": "developer_tools",
        "tools": "developer_tools",
        "devops": "devops",
        "ai/ml": "ai_ml",
        "machine learning": "ai_ml",
        "coursework": "concepts",
        "concepts": "concepts",
    }

    existing = {
        (item.normalized_name or item.name).lower()
        for field_name in CategorizedSkills.model_fields
        for item in getattr(categorized, field_name)
    }

    for line in skill_section:
        if ":" in line:
            label, values = line.split(":", 1)
            normalized_label = _normalize_heading(label)

            # Human languages are parsed separately.
            if normalized_label == "languages":
                continue

            default_target = category_map.get(normalized_label, "other")
            raw_candidates = _split_csv_like(values)

        else:
            default_target = "other"
            raw_candidates = _split_csv_like(line)

        candidates: list[str] = []

        for raw_candidate in raw_candidates:
            candidates.extend(
                _expand_explicit_skill_candidate(raw_candidate)
            )

        for candidate in candidates:
            if not candidate or len(candidate) > 80:
                continue

            canonical = _canonical_skill_match(candidate)

            if canonical:
                key, target = canonical
            else:
                key = candidate.strip()
                target = default_target

            lower_key = key.lower()

            if lower_key in existing:
                continue

            destination: list[SkillItem] = getattr(categorized, target)

            destination.append(
                SkillItem(
                    name=key,
                    normalized_name=key,
                    aliases_found=[candidate.strip()],
                    confidence=0.9,
                )
            )
            existing.add(lower_key)

    return categorized




SKILL_SOURCE_PRIORITY = {
    "skills": 100,
    "experience": 90,
    "project": 85,
    "certification": 70,
    "coursework": 65,
    "research": 55,
    "publication": 50,
    "summary": 40,
    "achievement": 35,
    "education": 30,
    "other": 10,
}


def _skill_items(
    skills: CategorizedSkills,
) -> list[SkillItem]:
    result: list[SkillItem] = []

    for field_name in CategorizedSkills.model_fields:
        result.extend(
            getattr(skills, field_name)
        )

    return result


def _add_skill_source(
    item: SkillItem,
    source: str,
    evidence: str | None = None,
) -> None:
    if source not in item.sources:
        item.sources.append(source)

    if evidence:
        clean_evidence = _clean_line(evidence)

        if (
            clean_evidence
            and clean_evidence not in item.evidence
            and len(item.evidence) < 5
        ):
            item.evidence.append(
                clean_evidence[:240]
            )


def _skill_present(
    item: SkillItem,
    text: str,
) -> bool:
    candidates = [
        item.name,
        item.normalized_name or "",
        *item.aliases_found,
    ]

    return any(
        candidate
        and _contains_alias(
            text,
            candidate,
        )
        for candidate in candidates
    )


def _annotate_skill_provenance(
    skills: CategorizedSkills,
    sections: dict[str, list[str]],
    experience: list[ResumeExperience],
    projects: list[ResumeProject],
    publications: list[ResumePublication],
    research: list[ResumeResearch],
    summary: str | None,
) -> CategorizedSkills:
    """
    Classify each skill by the strength of evidence in the resume.

    explicit:
        Directly declared in the SKILLS section.

    demonstrated:
        Used in experience or projects. This is strong hiring evidence even
        if the candidate forgot to list it in SKILLS.

    mentioned:
        Only appears in weaker-context sections such as summary/publication.
    """
    explicit_text = "\n".join(
        sections.get("skills", [])
    )

    coursework_text = "\n".join(
        sections.get("coursework", [])
    )

    certification_text = "\n".join(
        sections.get("certifications", [])
    )

    achievement_text = "\n".join(
        sections.get("achievements", [])
    )

    education_text = "\n".join(
        sections.get("education", [])
    )

    for item in _skill_items(skills):
        item.sources = []
        item.evidence = []
        item.explicit = False
        item.demonstrated = False
        item.mentioned = False

        if explicit_text and _skill_present(
            item,
            explicit_text,
        ):
            item.explicit = True
            _add_skill_source(
                item,
                "skills",
                f"Listed in Skills: {item.name}",
            )

        for entry in experience:
            entry_text = " ".join([
                entry.title or "",
                *entry.bullets,
                *entry.technologies,
            ])

            if _skill_present(
                item,
                entry_text,
            ):
                item.demonstrated = True
                _add_skill_source(
                    item,
                    "experience",
                    (
                        f"Experience: "
                        f"{entry.title or entry.company or 'role'}"
                    ),
                )

        for project in projects:
            project_text = " ".join([
                project.name or "",
                project.subtitle or "",
                project.description or "",
                *project.bullets,
                *project.technologies,
            ])

            if _skill_present(
                item,
                project_text,
            ):
                item.demonstrated = True
                _add_skill_source(
                    item,
                    "project",
                    (
                        f"Project: "
                        f"{project.name or 'project'}"
                    ),
                )

        if certification_text and _skill_present(
            item,
            certification_text,
        ):
            _add_skill_source(
                item,
                "certification",
                f"Certification evidence: {item.name}",
            )

        if coursework_text and _skill_present(
            item,
            coursework_text,
        ):
            _add_skill_source(
                item,
                "coursework",
                f"Coursework evidence: {item.name}",
            )

        for publication in publications:
            publication_text = " ".join([
                publication.title or "",
                publication.description or "",
            ])

            if _skill_present(
                item,
                publication_text,
            ):
                _add_skill_source(
                    item,
                    "publication",
                    (
                        f"Publication: "
                        f"{publication.title or item.name}"
                    ),
                )

        for research_entry in research:
            research_text = " ".join([
                research_entry.title or "",
                research_entry.description or "",
                *research_entry.bullets,
                *research_entry.technologies,
            ])

            if _skill_present(
                item,
                research_text,
            ):
                _add_skill_source(
                    item,
                    "research",
                    (
                        f"Research: "
                        f"{research_entry.title or item.name}"
                    ),
                )

        if summary and _skill_present(
            item,
            summary,
        ):
            _add_skill_source(
                item,
                "summary",
                f"Summary mention: {item.name}",
            )

        if achievement_text and _skill_present(
            item,
            achievement_text,
        ):
            _add_skill_source(
                item,
                "achievement",
                f"Achievement mention: {item.name}",
            )

        if education_text and _skill_present(
            item,
            education_text,
        ):
            _add_skill_source(
                item,
                "education",
                f"Education mention: {item.name}",
            )

        if item.explicit:
            item.provenance = "explicit"
        elif item.demonstrated:
            item.provenance = "demonstrated"
        elif item.sources:
            item.provenance = "mentioned"
        else:
            item.provenance = "unknown"

        item.mentioned = (
            bool(item.sources)
            and not item.explicit
            and not item.demonstrated
        )

        # Confidence now describes evidence quality, not merely dictionary
        # detection confidence.
        if item.explicit and item.demonstrated:
            item.confidence = 1.0
        elif item.explicit:
            item.confidence = max(
                item.confidence,
                0.95,
            )
        elif item.demonstrated:
            item.confidence = max(
                item.confidence,
                0.90,
            )
        elif item.sources:
            item.confidence = min(
                item.confidence,
                0.70,
            )
        else:
            item.confidence = min(
                item.confidence,
                0.50,
            )

        item.sources.sort(
            key=lambda source:
                SKILL_SOURCE_PRIORITY.get(
                    source,
                    0,
                ),
            reverse=True,
        )

    return skills

def _flatten_skill_names(
    skills: CategorizedSkills,
) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for field_name in CategorizedSkills.model_fields:
        for item in getattr(skills, field_name):
            name = item.normalized_name or item.name
            key = name.lower()

            if key not in seen:
                seen.add(key)
                result.append(name)

    return result


# =========================================================
# GENERIC HELPERS
# =========================================================

BULLET_RE = re.compile(r"^[•●▪◦]\s*")

MONTHS = (
    "jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|"
    "january|february|march|april|june|july|august|september|"
    "october|november|december"
)

DATE_TOKEN = (
    rf"(?:"
    rf"(?:{MONTHS})?\s*\d{{4}}"
    rf"|(?:0?[1-9]|1[0-2])[/.-]\d{{4}}"
    rf")"
)

DATE_RANGE_RE = re.compile(
    rf"(?P<start>{DATE_TOKEN})\s*[-–—]\s*"
    rf"(?P<end>present|current|{DATE_TOKEN})",
    re.IGNORECASE,
)


def _is_bullet(line: str) -> bool:
    return BULLET_RE.match(line.strip()) is not None


def _strip_bullet(line: str) -> str:
    return _clean_line(BULLET_RE.sub("", line))


def _merge_wrapped_bullets(
    lines: list[str],
) -> list[str]:
    """
    Reconstruct PDF/DOCX bullets that were wrapped across physical lines.

    A new bullet starts a new logical entry. Non-bullet lines following a
    bullet are appended to the current bullet until another bullet begins.
    """
    result: list[str] = []
    current: str | None = None

    for line in lines:
        clean = _clean_line(line)

        if not clean:
            continue

        if _is_bullet(clean):
            if current:
                result.append(_clean_line(current))

            current = _strip_bullet(clean)
            continue

        if current is not None:
            current = _clean_line(f"{current} {clean}")
        else:
            result.append(clean)

    if current:
        result.append(_clean_line(current))

    return result


def _extract_date_range(
    text: str,
) -> tuple[str | None, str | None, bool]:
    match = DATE_RANGE_RE.search(text)

    if not match:
        return None, None, False

    start = _clean_line(match.group("start"))
    end = _clean_line(match.group("end"))
    is_current = end.lower() in {"present", "current"}

    return start, end, is_current


def _extract_work_mode(text: str) -> str:
    lower = text.lower()

    if "hybrid" in lower:
        return "hybrid"

    if "remote" in lower:
        return "remote"

    if any(x in lower for x in ["on-site", "onsite", "on site"]):
        return "onsite"

    return "unknown"


def _split_trailing_location(
    text: str,
) -> tuple[str, str | None]:
    """
    Extract conservative location text only when it appears after a vertical
    bar or after an obvious comma-separated location fragment.
    """
    value = _clean_line(text)

    pipe_parts = [part.strip() for part in value.split("|") if part.strip()]

    if len(pipe_parts) >= 2:
        for candidate in pipe_parts[1:]:
            if DATE_RANGE_RE.search(candidate):
                continue

            if candidate.lower() in {
                "remote",
                "hybrid",
                "onsite",
                "on-site",
                "on site",
            }:
                continue

            if "," in candidate and len(candidate) <= 80:
                return pipe_parts[0], candidate

    return value, None


def _extract_technologies(
    text: str,
    skills: CategorizedSkills,
    exclude: set[str] | None = None,
) -> list[str]:
    exclude = {x.lower() for x in (exclude or set())}

    return [
        skill
        for skill in _flatten_skill_names(skills)
        if skill.lower() not in exclude
        and _contains_alias(text, skill)
    ]


# =========================================================
# EXPERIENCE PARSER
# =========================================================

ROLE_WORDS = {
    "intern",
    "engineer",
    "developer",
    "analyst",
    "consultant",
    "manager",
    "researcher",
    "scientist",
    "associate",
    "architect",
    "lead",
    "specialist",
    "designer",
    "administrator",
    "coordinator",
}


def _looks_like_experience_header(line: str) -> bool:
    """
    Detect a complete one-line experience header such as:
        Company — Software Engineer | Jan 2025 – Present

    This remains supported, but many resumes use a two-line pattern:
        Company Name                 Jan 2025 – Present
        Software Engineer (Remote)

    Two-line detection is handled separately in _parse_experience().
    """
    lower = line.lower()
    has_role = any(word in lower for word in ROLE_WORDS)
    has_year = re.search(r"\b(?:19|20)\d{2}\b", line) is not None
    has_separator = any(
        sep in line
        for sep in [" – ", " — ", " - ", " | "]
    )

    has_date_range = DATE_RANGE_RE.search(line) is not None

    return (
        has_role
        and has_year
        and (has_separator or has_date_range)
        and not _is_bullet(line)
    )


def _looks_like_role_line(line: str) -> bool:
    """
    Detect a standalone job-title line used immediately beside/after a
    company + date line.

    Reject sentence fragments such as:
        "prototype. Developer"
    which can occur when a wrapped bullet ends immediately before the next
    experience header.
    """
    if not line or _is_bullet(line):
        return False

    clean = _clean_line(line)
    lower = clean.lower()

    if _normalize_heading(clean) in SECTION_ALIASES:
        return False

    # A genuine standalone title should not contain a completed prose
    # sentence followed by another token.
    if re.search(r"[.!?]\s+\S", clean):
        return False

    # Reject obvious bullet-continuation phrasing.
    if lower.startswith(
        (
            "and ",
            "or ",
            "with ",
            "using ",
            "through ",
            "across ",
            "enabling ",
            "allowing ",
            "including ",
        )
    ):
        return False

    has_role = any(
        re.search(rf"\b{re.escape(word)}\b", lower)
        for word in ROLE_WORDS
    )

    return has_role and len(clean.split()) <= 12


def _looks_like_company_date_line(line: str) -> bool:
    """
    Detect lines such as:
        Codec Technologies India Dec 2025 – Jan 2026
        AdOnMo Private Limited May 2026 – June 2026

    We require a recognizable date range but do NOT require a role word,
    because the role can be on the following line.
    """
    if not line or _is_bullet(line):
        return False

    if _normalize_heading(line) in SECTION_ALIASES:
        return False

    start, end, _ = _extract_date_range(line)

    if start is None:
        return False

    without_dates = DATE_RANGE_RE.sub("", line).strip(" |,-–—")

    # A valid company line needs some non-date text left.
    if len(without_dates.split()) < 1:
        return False

    # Avoid treating an Education line as experience unless a nearby role
    # line confirms it in _parse_experience().
    return True


def _parse_company_title(
    header: str,
) -> tuple[str | None, str | None, str | None]:
    without_dates = DATE_RANGE_RE.sub("", header).strip(" |,-–—")
    without_mode = re.sub(
        r"\b(Remote|Hybrid|On-site|Onsite|On site)\b",
        "",
        without_dates,
        flags=re.IGNORECASE,
    )

    clean, location = _split_trailing_location(without_mode)
    clean = _clean_line(clean)

    separator_match = re.search(
        r"\s+[–—-]\s+",
        clean,
    )

    if separator_match:
        company = clean[:separator_match.start()]
        title = clean[separator_match.end():]

        return (
            company.strip() or None,
            title.strip(" |.") or None,
            location,
        )

    # Common resume form:
    # "CERT-In: AI/ML and cybersecurity Intern"
    # "Vistalane Dynamic Solutions: Software Engineering Intern."
    if ":" in clean:
        company, title = clean.split(":", 1)

        if (
            company.strip()
            and title.strip()
            and any(
                re.search(
                    rf"\b{re.escape(word)}\b",
                    title.lower(),
                )
                for word in ROLE_WORDS
            )
        ):
            return (
                company.strip() or None,
                title.strip(" |.") or None,
                location,
            )

    return None, clean or None, location


def _strip_trailing_role_artifact(
    text: str,
) -> str:
    """
    Remove a visually detached next-line role token that PyMuPDF may append to
    the end of the previous bullet, e.g.:
        "... AR/VR prototype. Developer"

    Only strips a single capitalized role word following sentence punctuation
    at the very end of a bullet.
    """
    clean = _clean_line(text)

    return re.sub(
        r"([.!?])\s+"
        r"(?:Developer|Engineer|Intern|Manager|Analyst|Consultant|"
        r"Researcher|Designer|Architect|Lead|Coordinator)"
        r"\s*$",
        r"\1",
        clean,
    )


def _parse_experience(
    lines: list[str],
    all_skills: CategorizedSkills,
) -> list[ResumeExperience]:
    if not lines:
        return []

    clean_lines = [
        _clean_line(line)
        for line in lines
        if _clean_line(line)
    ]

    groups: list[tuple[str, list[str]]] = []
    current_header: str | None = None
    current_body: list[str] = []

    def flush() -> None:
        nonlocal current_header, current_body

        if current_header:
            groups.append(
                (
                    current_header,
                    current_body[:],
                )
            )

        current_header = None
        current_body = []

    def explicit_header(line: str) -> bool:
        if not line or _is_bullet(line):
            return False

        if _is_known_section_heading(line):
            return False

        lower = line.lower()

        has_role = any(
            re.search(
                rf"\b{re.escape(word)}\b",
                lower,
            )
            for word in ROLE_WORDS
        )

        has_date = DATE_RANGE_RE.search(line) is not None

        return has_role and has_date

    i = 0

    while i < len(clean_lines):
        line = clean_lines[i]

        next_line = (
            clean_lines[i + 1]
            if i + 1 < len(clean_lines)
            else None
        )

        if explicit_header(line):
            flush()
            current_header = line
            i += 1
            continue

        if (
            _looks_like_company_date_line(line)
            and next_line
            and _looks_like_role_line(next_line)
        ):
            flush()
            current_header = f"{line} — {next_line}"
            i += 2
            continue

        if (
            _looks_like_role_line(line)
            and next_line
            and _looks_like_company_date_line(next_line)
        ):
            flush()
            current_header = f"{next_line} — {line}"
            i += 2
            continue

        if current_header is not None:
            normalized = _normalize_heading(line)

            if normalized not in {
                "technical",
                "project",
                "projects",
                "technical projects",
                "education",
                "certifications",
                "achievements",
            }:
                current_body.append(line)

        i += 1

    flush()

    experiences: list[ResumeExperience] = []

    for header, body in groups:
        company, title, location = _parse_company_title(
            header
        )

        start_date, end_date, is_current = _extract_date_range(
            header
        )

        bullets = _merge_wrapped_bullets(
            body
        )

        combined = " ".join(
            [
                header,
                *bullets,
            ]
        )

        technologies = _extract_technologies(
            combined,
            all_skills,
            exclude={"github"},
        )

        confidence_parts = [
            company is not None,
            title is not None,
            start_date is not None,
            bool(bullets),
        ]

        experiences.append(
            ResumeExperience(
                company=company,
                title=title,
                location=location,
                work_mode=_extract_work_mode(header),
                employment_type=None,
                start_date=start_date,
                end_date=end_date,
                is_current=is_current,
                bullets=bullets,
                technologies=technologies,
                raw_header=header,
                raw_text="\n".join(
                    [
                        header,
                        *body,
                    ]
                ),
                confidence=round(
                    sum(confidence_parts)
                    / len(confidence_parts),
                    2,
                ),
            )
        )

    return experiences


# =========================================================
# PROJECT PARSER
# =========================================================

PROJECT_LINK_LABEL_RE = re.compile(
    r"\((?:try it here|github|gitlab|demo|live|website|link)\)",
    re.IGNORECASE,
)


def _looks_like_project_header(line: str) -> bool:
    if _is_bullet(line):
        return False

    clean = _clean_line(line)

    if not clean or len(clean) > 220:
        return False

    lower = clean.lower()

    # Strongest signal: explicit project links/labels.
    if any(
        token in lower
        for token in [
            "github",
            "try it here",
            "gitlab",
            "(demo)",
            "(live)",
            "(website)",
        ]
    ):
        return True

    # A continuation sentence should never become a project merely because it
    # contains "high-performance" or another hyphenated adjective.
    sentence_starters = (
        "and ",
        "or ",
        "with ",
        "using ",
        "for ",
        "to ",
        "while ",
        "including ",
        "enabling ",
        "allowing ",
        "across ",
        "through ",
    )

    if lower.startswith(sentence_starters):
        return False

    if clean.endswith((".", ",", ";", ":")):
        return False

    # Header-like pattern: short left-hand project name + descriptive subtitle.
    match = re.match(
        r"^(?P<name>[A-Za-z0-9][A-Za-z0-9 ._+&#/]{1,60}?)"
        r"\s*[–—-]\s*"
        r"(?P<subtitle>[A-Za-z][^.!?]{3,160})$",
        clean,
    )

    if not match:
        return False

    name = match.group("name").strip()
    subtitle = match.group("subtitle").strip()

    # Require a compact project-like name, not arbitrary prose.
    if len(name.split()) > 7:
        return False

    if len(subtitle.split()) < 2:
        return False

    return True


def _project_name_subtitle(
    header: str,
) -> tuple[str | None, str | None]:
    cleaned = _clean_line(PROJECT_LINK_LABEL_RE.sub("", header)).strip()

    # Prefer spaced separators first.
    for separator in [" – ", " — ", " - "]:
        if separator in cleaned:
            name, subtitle = cleaned.split(separator, 1)

            return (
                name.strip() or None,
                subtitle.strip() or None,
            )

    # Some PDF extractors collapse "Pingit - Serverless..." to
    # "Pingit-Serverless...". Only split an unspaced separator when the left
    # side looks like a short project name and the right side is descriptive.
    match = re.match(
        r"^(?P<name>[A-Za-z0-9][A-Za-z0-9 ._+&#/]{0,60})[-–—]"
        r"(?P<subtitle>[A-Za-z][A-Za-z0-9 /&+().,:]{4,})$",
        cleaned,
    )

    if match:
        return (
            match.group("name").strip() or None,
            match.group("subtitle").strip() or None,
        )

    return cleaned or None, None


def _links_for_project(
    header: str,
    hyperlinks: list[ExtractedHyperlink],
) -> list[ResumeLink]:
    project_name, _ = _project_name_subtitle(header)

    if not project_name:
        return []

    result: list[ResumeLink] = []
    project_key = project_name.lower()

    for item in hyperlinks:
        context = (
            f"{item.label} {item.paragraph_text}"
        ).lower()

        if project_key not in context:
            continue

        lower_url = item.url.lower()

        if "github.com" in lower_url:
            kind = "github"
        else:
            kind = "website"

        result.append(
            ResumeLink(
                label=(
                    "GitHub"
                    if kind == "github"
                    else "Live"
                ),
                url=item.url,
                type=kind,
            )
        )

    return _dedupe_resume_links(result)


def _parse_projects(
    lines: list[str],
    all_skills: CategorizedSkills,
    hyperlinks: list[ExtractedHyperlink],
) -> list[ResumeProject]:
    if not lines:
        return []

    clean_lines = [
        _clean_line(line)
        for line in lines
        if _clean_line(line)
    ]

    groups: list[tuple[str, list[str]]] = []
    current_header: str | None = None
    current_body: list[str] = []

    def flush() -> None:
        nonlocal current_header, current_body

        if current_header:
            groups.append(
                (
                    current_header,
                    current_body[:],
                )
            )

        current_header = None
        current_body = []

    for line in clean_lines:
        if _looks_like_project_header(line):
            flush()
            current_header = line
            continue

        if current_header is not None:
            if not _is_known_section_heading(line):
                current_body.append(line)

    flush()

    projects: list[ResumeProject] = []

    for header, body in groups:
        name, subtitle = _project_name_subtitle(
            header
        )

        bullets = _merge_wrapped_bullets(
            body
        )

        technology_text = " ".join(
            [
                subtitle or "",
                *bullets,
            ]
        )

        technologies = _extract_technologies(
            technology_text,
            all_skills,
            exclude={"github"},
        )

        projects.append(
            ResumeProject(
                name=name,
                subtitle=subtitle,
                description=(
                    " ".join(bullets)
                    if bullets
                    else None
                ),
                bullets=bullets,
                technologies=technologies,
                links=_links_for_project(
                    header,
                    hyperlinks,
                ),
                raw_header=header,
                raw_text="\n".join(
                    [
                        header,
                        *body,
                    ]
                ),
                confidence=(
                    0.92
                    if name and bullets
                    else 0.65
                ),
            )
        )

    return projects


# =========================================================
# EDUCATION PARSER
# =========================================================

DEGREE_PATTERNS = (
    r"\bb\.?\s*tech\b",
    r"\bbtech\b",
    r"\bb\.?\s*e\.?\b",
    r"\bbachelor",
    r"\bm\.?\s*tech\b",
    r"\bmtech\b",
    r"\bmaster",
    r"\bmba\b",
    r"\bbsc\b",
    r"\bmsc\b",
    r"\bph\.?d\b",
    r"\bclass\s+xii\b",
    r"\bclass\s+x\b",
    r"\b12th\b",
    r"\b10th\b",
    r"\bsecondary\b",
    r"\bhigher secondary\b",
)


def _looks_like_degree_line(line: str) -> bool:
    lower = line.lower()

    return (
        any(re.search(pattern, lower) for pattern in DEGREE_PATTERNS)
        or bool(
            re.search(
                r"\b(CGPA|GPA|percentage)\b|[0-9]+(?:\.[0-9]+)?\s*%",
                line,
                flags=re.IGNORECASE,
            )
        )
    )


def _split_institution_location(
    line: str,
) -> tuple[str, str | None]:
    value = _clean_line(line)

    # Use the last dash-like separator whose suffix resembles a location.
    # This handles both "Institution - City, State" and
    # "Institution-City, State" without globally destroying hyphen spacing.
    matches = list(re.finditer(r"[-–—]", value))

    for match in reversed(matches):
        left = value[: match.start()].strip()
        right = value[match.end() :].strip()

        if (
            left
            and right
            and "," in right
            and len(right) <= 80
            and not re.search(r"\b(CGPA|GPA)\b|\d+%", right, re.IGNORECASE)
        ):
            return left, right

    return value, None


def _grade_from_text(
    text: str,
) -> tuple[str | None, str | None]:
    grade_match = re.search(
        r"\b(CGPA|GPA)\s*:?\s*([0-9]+(?:\.[0-9]+)?)",
        text,
        flags=re.IGNORECASE,
    )

    if grade_match:
        return grade_match.group(2), grade_match.group(1).upper()

    percentage_match = re.search(
        r"([0-9]+(?:\.[0-9]+)?)\s*%",
        text,
    )

    if percentage_match:
        return percentage_match.group(1), "percentage"

    return None, None


def _degree_and_field(
    line: str,
) -> tuple[str | None, str | None]:
    value = _clean_line(line)

    # Remove grades/dates from the degree text.
    value = re.sub(
        r"\b(CGPA|GPA)\s*:?\s*[0-9]+(?:\.[0-9]+)?",
        "",
        value,
        flags=re.IGNORECASE,
    )
    value = re.sub(
        r"[0-9]+(?:\.[0-9]+)?\s*%",
        "",
        value,
    )
    value = DATE_RANGE_RE.sub("", value)
    value = _clean_line(value).strip(" -–—")

    if " in " in value.lower():
        parts = re.split(
            r"\s+in\s+",
            value,
            maxsplit=1,
            flags=re.IGNORECASE,
        )

        if len(parts) == 2:
            return parts[0].strip() or None, parts[1].strip() or None

    # Support degree + major without the word "in", e.g.
    # "B.Tech. Computer Science & Engineering"
    degree_prefix = re.match(
        r"^(?P<degree>"
        r"B\.?\s*Tech\.?|BTech|B\.?\s*E\.?|BE|"
        r"M\.?\s*Tech\.?|MTech|"
        r"Bachelor(?:'s)?(?:\s+of\s+\w+)?|"
        r"Master(?:'s)?(?:\s+of\s+\w+)?"
        r")\s+(?P<field>.+)$",
        value,
        flags=re.IGNORECASE,
    )

    if degree_prefix:
        return (
            degree_prefix.group("degree").strip() or None,
            degree_prefix.group("field").strip(" .") or None,
        )

    return value or None, None


def _extract_single_date(
    text: str,
) -> str | None:
    match = re.search(
        rf"\b(?:{MONTHS})\s+(?:19|20)\d{{2}}\b",
        text,
        flags=re.IGNORECASE,
    )

    if match:
        return _clean_line(match.group(0))

    year = re.search(
        r"\b(?:19|20)\d{2}\b",
        text,
    )

    return year.group(0) if year else None


def _remove_grade_and_dates(
    text: str,
) -> str:
    value = text

    value = re.sub(
        r"\b(?:Cum\.?\s*)?(CGPA|GPA)\s*:?\s*[0-9]+(?:\.[0-9]+)?",
        "",
        value,
        flags=re.IGNORECASE,
    )

    value = re.sub(
        r"[0-9]+(?:\.[0-9]+)?\s*%",
        "",
        value,
    )

    value = DATE_RANGE_RE.sub(
        "",
        value,
    )

    value = re.sub(
        rf"\b(?:{MONTHS})\s+(?:19|20)\d{{2}}\b",
        "",
        value,
        flags=re.IGNORECASE,
    )

    return _clean_line(value).strip(" -–—")


def _split_location_suffix(
    line: str,
) -> tuple[str, str | None]:
    value = _clean_line(line)

    # First try explicit separator handling.
    institution, location = _split_institution_location(
        value
    )

    if location:
        return institution, location

    # Then support forms such as:
    # "SRM INSTITUTE ... Chennai, Tamil Nadu"
    # "INDIRAPURAM PUBLIC SCHOOL Ghaziabad, Uttar Pradesh"
    match = re.match(
        r"^(?P<institution>.+?)\s+"
        r"(?P<city>[A-Z][A-Za-z .'-]{1,50}),\s*"
        r"(?P<state>[A-Z][A-Za-z .'-]{1,50})$",
        value,
    )

    if match:
        return (
            match.group("institution").strip(),
            f"{match.group('city').strip()}, "
            f"{match.group('state').strip()}",
        )

    return value, None


def _looks_like_institution_line(
    line: str,
) -> bool:
    lower = line.lower()

    signals = [
        "university",
        "institute",
        "college",
        "school",
        "academy",
        "polytechnic",
    ]

    return any(signal in lower for signal in signals)


def _parse_education(
    lines: list[str],
) -> list[ResumeEducation]:
    if not lines:
        return []

    entries: list[ResumeEducation] = []

    current_institution: str | None = None
    current_location: str | None = None
    current_degree_line: str | None = None
    current_extra_lines: list[str] = []

    def flush() -> None:
        nonlocal current_institution
        nonlocal current_location
        nonlocal current_degree_line
        nonlocal current_extra_lines

        if not current_institution:
            current_degree_line = None
            current_extra_lines = []
            return

        combined = " ".join(
            x
            for x in [
                current_degree_line,
                *current_extra_lines,
            ]
            if x
        )

        grade, grade_type = _grade_from_text(
            combined
        )

        start, end, _ = _extract_date_range(
            combined
        )

        single_date = (
            None
            if start or end
            else _extract_single_date(combined)
        )

        clean_degree_source = (
            current_degree_line
            or combined
        )

        clean_degree_source = _remove_grade_and_dates(
            clean_degree_source
        )

        degree, field = _degree_and_field(
            clean_degree_source
        )

        if not degree and combined:
            degree = _remove_grade_and_dates(
                combined
            ) or None

        entries.append(
            ResumeEducation(
                institution=current_institution,
                degree=degree,
                field_of_study=field,
                location=current_location,
                grade=grade,
                grade_type=grade_type,
                start_date=start,
                end_date=end or single_date,
                raw_text="\n".join(
                    x
                    for x in [
                        current_institution,
                        current_degree_line,
                        *current_extra_lines,
                    ]
                    if x
                ),
                confidence=(
                    0.95
                    if current_institution and degree
                    else 0.7
                ),
            )
        )

        current_degree_line = None
        current_extra_lines = []

    for line in lines:
        clean = _clean_line(line)

        if not clean:
            continue

        if _looks_like_institution_line(clean):
            # A new institution means the previous education block is done.
            flush()

            (
                current_institution,
                current_location,
            ) = _split_location_suffix(clean)

            continue

        if current_institution is None:
            continue

        if _looks_like_degree_line(clean):
            # If we already have a degree line and this is another genuine
            # credential (e.g. Class X after Class XII at the same school),
            # finish the previous one first.
            if (
                current_degree_line
                and any(
                    token in clean.lower()
                    for token in [
                        "class x",
                        "class xii",
                        "b.tech",
                        "btech",
                        "bachelor",
                        "master",
                        "m.tech",
                        "mba",
                        "phd",
                    ]
                )
            ):
                flush()

            if current_degree_line is None:
                current_degree_line = clean
            else:
                current_extra_lines.append(clean)

            continue

        current_extra_lines.append(clean)

    flush()

    return entries


# =========================================================
# CERTIFICATIONS / LANGUAGES / COURSEWORK
# =========================================================

def _parse_certifications(
    lines: list[str],
) -> list[ResumeCertification]:
    logical_lines = _merge_wrapped_bullets(lines)
    result: list[ResumeCertification] = []

    for text in logical_lines:
        text = _clean_line(text)

        if not text:
            continue

        issue_date = None
        year_match = re.search(r"\b(?:19|20)\d{2}\b", text)

        if year_match:
            issue_date = year_match.group(0)

        name = text
        issuer = None

        for separator in [" — ", " – ", " - "]:
            if separator not in text:
                continue

            name, tail = text.split(separator, 1)
            issuer = re.sub(
                r"\b(?:"
                + MONTHS
                + r")?\s*(?:19|20)\d{2}\b.*$",
                "",
                tail,
                flags=re.IGNORECASE,
            ).strip()
            break

        result.append(
            ResumeCertification(
                name=name.strip() or None,
                issuer=issuer or None,
                issue_date=issue_date,
                raw_text=text,
            )
        )

    return result


def _parse_languages(
    lines: list[str],
) -> list[ResumeLanguage]:
    values: list[str] = []

    for line in lines:
        if ":" in line:
            _, right = line.split(":", 1)
            values.extend(_split_csv_like(right))
        else:
            values.extend(_split_csv_like(line))

    result: list[ResumeLanguage] = []

    for value in values:
        match = re.match(
            r"(?P<lang>[A-Za-z][A-Za-z ]+?)\s*\((?P<prof>[^)]+)\)$",
            value,
        )

        if match:
            language = match.group("lang").strip()
            proficiency = match.group("prof").strip()
        else:
            parts = value.split("-", 1)

            if len(parts) == 2 and len(parts[0].split()) <= 3:
                language = parts[0].strip()
                proficiency = parts[1].strip()
            else:
                language = value.strip()
                proficiency = None

        if language:
            result.append(
                ResumeLanguage(
                    language=language,
                    proficiency=proficiency,
                )
            )

    return result


def _parse_coursework(
    lines: list[str],
) -> list[ResumeCoursework]:
    values: list[str] = []

    for line in lines:
        if ":" in line:
            _, right = line.split(":", 1)
            values.extend(_split_csv_like(right))
        else:
            values.extend(_split_csv_like(line))

    return [
        ResumeCoursework(name=value)
        for value in values
        if value
    ]


# =========================================================
# ACHIEVEMENTS
# =========================================================

def _parse_achievements(
    lines: list[str],
) -> list[ResumeAchievement]:
    logical_entries = _merge_wrapped_bullets(lines)
    result: list[ResumeAchievement] = []

    for text in logical_entries:
        if not text:
            continue

        if ":" in text:
            title, description = text.split(":", 1)
            title = title.strip() or None
            description = description.strip()
        else:
            title = None
            description = text.strip()

        year_match = re.search(r"\b(?:19|20)\d{2}\b", text)

        result.append(
            ResumeAchievement(
                title=title,
                description=description,
                date=year_match.group(0) if year_match else None,
                raw_text=text,
            )
        )

    return result


# =========================================================
# PUBLICATIONS / RESEARCH
# =========================================================

PUBLICATION_SIGNALS = {
    "conference",
    "journal",
    "published",
    "accepted",
    "proceedings",
    "doi",
    "paper",
    "publication",
}


def _parse_publications_research(
    lines: list[str],
    skills: CategorizedSkills,
) -> tuple[list[ResumePublication], list[ResumeResearch]]:
    if not lines:
        return [], []

    raw_title = next(
        (
            _clean_line(line)
            for line in lines
            if line and not _is_bullet(line)
        ),
        None,
    )

    body_start = (
        1
        if raw_title and lines and _clean_line(lines[0]) == raw_title
        else 0
    )

    body = _merge_wrapped_bullets(lines[body_start:])

    raw_text = "\n".join(lines)
    lower = raw_text.lower()

    year_match = re.search(
        r"\b(?:19|20)\d{2}\b",
        raw_text,
    )

    year = int(year_match.group(0)) if year_match else None

    is_publication = any(
        signal in lower
        for signal in PUBLICATION_SIGNALS
    )

    venue = None
    clean_title = raw_title

    if raw_title:
        trailing_venue = re.search(
            r"\s+[–—-]\s*(?P<venue>[A-Z][A-Z0-9.-]{2,})"
            r"\s+(?P<year>(?:19|20)\d{2})\s*$",
            raw_title,
        )

        if trailing_venue:
            venue = trailing_venue.group("venue")
            year = int(trailing_venue.group("year"))
            clean_title = raw_title[: trailing_venue.start()].strip()
            is_publication = True

    # Venue can be present in a separate line such as:
    # "Accepted at International Conference ... (ICICCS) 2026"
    if venue is None:
        for body_line in body:
            venue_match = re.match(
                r"Accepted at\s+(?P<venue>.+?)\s+(?P<year>(?:19|20)\d{2})$",
                body_line,
                flags=re.IGNORECASE,
            )

            if venue_match:
                venue = _clean_line(
                    venue_match.group("venue")
                )
                year = int(
                    venue_match.group("year")
                )
                is_publication = True
                break

    technologies = _extract_technologies(
        " ".join(body),
        skills,
        exclude={"github"},
    )

    if is_publication:
        return (
            [
                ResumePublication(
                    title=clean_title,
                    venue=venue,
                    year=year,
                    authors=[],
                    description=" ".join(body) or None,
                    url=None,
                    raw_text=raw_text,
                )
            ],
            [],
        )

    return (
        [],
        [
            ResumeResearch(
                title=clean_title,
                organization=None,
                description=" ".join(body) or None,
                bullets=body,
                technologies=technologies,
                raw_text=raw_text,
            )
        ],
    )


# =========================================================
# MAIN PARSER
# =========================================================

def parse_resume(
    file_name: str,
    content: bytes,
) -> ParsedResumeV2:
    (
        raw_text,
        extraction_method,
        page_count,
        hyperlinks,
    ) = extract_resume_text(
        file_name,
        content,
    )

    if len(raw_text.strip()) < 50:
        raise ResumeParsingError(
            "The resume contains too little readable text."
        )

    sections, raw_sections, preamble = _split_sections(
        raw_text
    )

    major_structured_sections = {
        "experience",
        "projects",
        "education",
        "certifications",
        "achievements",
    }

    if not any(
        sections.get(section)
        for section in major_structured_sections
    ):
        recovered_text = _prepare_text_for_section_detection(
            raw_text
        )

        (
            recovered_sections,
            recovered_raw_sections,
            recovered_preamble,
        ) = _split_sections(
            recovered_text
        )

        if any(
            recovered_sections.get(section)
            for section in major_structured_sections
        ):
            sections = recovered_sections
            raw_sections = recovered_raw_sections
            preamble = recovered_preamble

    personal_info = _extract_personal_info(
        preamble,
        raw_text,
        hyperlinks,
    )

    summary_lines = sections.get("summary", [])
    summary = " ".join(summary_lines).strip() or None

    skills = _taxonomy_skills(raw_text)
    skills = _merge_explicit_skills(
        skills,
        sections.get("skills", []),
    )

    embedded_languages: list[str] = []
    embedded_coursework: list[str] = []

    for line in sections.get("skills", []):
        lower = line.lower()

        if lower.startswith("languages:"):
            embedded_languages.append(line)

        elif lower.startswith("coursework:"):
            embedded_coursework.append(line)

    experience = _parse_experience(
        sections.get("experience", []),
        skills,
    )

    # Direct raw-text fallback:
    # If generic preprocessing merges several jobs into one entry, parse the
    # original EXPERIENCE block and keep whichever result has more distinct
    # structured entries.
    raw_experience_lines = _raw_section_lines(
        raw_text,
        "experience",
    )

    raw_experience = _parse_experience(
        raw_experience_lines,
        skills,
    )

    if len(raw_experience) > len(experience):
        experience = raw_experience

    projects = _parse_projects(
        sections.get("projects", []),
        skills,
        hyperlinks,
    )

    # Same fallback for projects. This prevents RoleClear/BiasLens/Pingit
    # from being collapsed into a single project when PDF layout recovery
    # joins a project header to the previous bullet.
    raw_project_lines = _raw_section_lines(
        raw_text,
        "projects",
    )

    raw_projects = _parse_projects(
        raw_project_lines,
        skills,
        hyperlinks,
    )

    if len(raw_projects) > len(projects):
        projects = raw_projects

    education = _parse_education(
        sections.get("education", []),
    )

    certifications = _parse_certifications(
        sections.get("certifications", []),
    )

    publications, research = _parse_publications_research(
        sections.get("publications_research", []),
        skills,
    )

    achievements = _parse_achievements(
        sections.get("achievements", []),
    )

    skills = _annotate_skill_provenance(
        skills=skills,
        sections=sections,
        experience=experience,
        projects=projects,
        publications=publications,
        research=research,
        summary=summary,
    )

    languages = _parse_languages(
        sections.get("languages", []) + embedded_languages,
    )

    coursework = _parse_coursework(
        sections.get("coursework", []) + embedded_coursework,
    )

    known = {
        "summary",
        "skills",
        "experience",
        "projects",
        "education",
        "certifications",
        "publications_research",
        "achievements",
        "languages",
        "coursework",
    }

    other_sections: list[OtherSection] = []

    for raw_section in raw_sections.values():
        canonical = raw_section.normalized_heading

        if canonical in known:
            continue

        other_sections.append(
            OtherSection(
                original_heading=raw_section.heading,
                normalized_heading=canonical,
                content=list(raw_section.lines),
                raw_text="\n".join(raw_section.lines),
            )
        )

    warnings: list[ParsingWarning] = []

    if personal_info.full_name is None:
        warnings.append(
            ParsingWarning(
                code="NAME_NOT_DETECTED",
                message="Could not confidently detect the candidate name.",
                section="personal_info",
            )
        )

    if personal_info.email is None:
        warnings.append(
            ParsingWarning(
                code="EMAIL_NOT_DETECTED",
                message="Could not detect an email address.",
                section="personal_info",
                severity="info",
            )
        )

    if (
        raw_experience_lines
        and len(experience) == 1
        and sum(
            1
            for line in raw_experience_lines
            if DATE_RANGE_RE.search(line)
            and any(
                re.search(
                    rf"\b{re.escape(word)}\b",
                    line.lower(),
                )
                for word in ROLE_WORDS
            )
        ) >= 2
    ):
        warnings.append(
            ParsingWarning(
                code="EXPERIENCE_ENTRIES_MERGED",
                message=(
                    "Multiple experience headers were visible in the source "
                    "text but were merged into one structured entry."
                ),
                section="experience",
            )
        )

    if (
        raw_project_lines
        and len(projects) == 1
        and sum(
            1
            for line in raw_project_lines
            if _looks_like_project_header(line)
        ) >= 2
    ):
        warnings.append(
            ParsingWarning(
                code="PROJECT_ENTRIES_MERGED",
                message=(
                    "Multiple project headers were visible in the source "
                    "text but were merged into one structured entry."
                ),
                section="projects",
            )
        )

    if not experience and sections.get("experience"):
        warnings.append(
            ParsingWarning(
                code="EXPERIENCE_STRUCTURE_LOW_CONFIDENCE",
                message=(
                    "An experience section was found, but individual "
                    "experience entries could not be structured confidently."
                ),
                section="experience",
            )
        )

    if not projects and sections.get("projects"):
        warnings.append(
            ParsingWarning(
                code="PROJECT_STRUCTURE_LOW_CONFIDENCE",
                message=(
                    "A projects section was found, but individual project "
                    "entries could not be structured confidently."
                ),
                section="projects",
            )
        )

    personal_score_parts = [
        personal_info.full_name is not None,
        personal_info.email is not None,
        personal_info.phone is not None,
    ]
    personal_score = (
        sum(personal_score_parts)
        / len(personal_score_parts)
    )

    section_scores: list[float] = []

    if sections.get("experience"):
        section_scores.append(
            (
                sum(item.confidence for item in experience)
                / len(experience)
            )
            if experience
            else 0.0
        )

    if sections.get("projects"):
        section_scores.append(
            (
                sum(item.confidence for item in projects)
                / len(projects)
            )
            if projects
            else 0.0
        )

    if sections.get("education"):
        section_scores.append(
            (
                sum(item.confidence for item in education)
                / len(education)
            )
            if education
            else 0.0
        )

    if sections.get("certifications"):
        section_scores.append(
            1.0 if certifications else 0.0
        )

    if sections.get("achievements"):
        section_scores.append(
            1.0 if achievements else 0.0
        )

    structure_score = (
        sum(section_scores) / len(section_scores)
        if section_scores
        else 0.75
    )

    skills_score = (
        1.0
        if _flatten_skill_names(skills)
        else 0.0
    )

    link_score = (
        1.0
        if personal_info.links
        else 0.7
    )

    overall_confidence = round(
        (
            personal_score * 0.25
            + structure_score * 0.45
            + skills_score * 0.20
            + link_score * 0.10
        ),
        2,
    )

    return ParsedResumeV2(
        personal_info=personal_info,
        summary=summary,
        skills=skills,
        experience=experience,
        projects=projects,
        education=education,
        certifications=certifications,
        publications=publications,
        research=research,
        achievements=achievements,
        languages=languages,
        coursework=coursework,
        other_sections=other_sections,
        raw_sections=raw_sections,
        raw_text=raw_text,
        parsing_metadata=ParsingMetadata(
            parser_version="2.5.7",
            extraction_method=extraction_method,
            file_name=file_name,
            file_size_bytes=len(content),
            page_count=page_count,
            character_count=len(raw_text),
            section_count=len(raw_sections),
            overall_confidence=overall_confidence,
            warnings=warnings,
        ),
    )
