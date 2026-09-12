from __future__ import annotations

import json
import re
from html import unescape
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup, Tag

from app.core.config import get_settings
from app.schemas.smart_apply import ExtractedJob


class JobExtractionError(Exception):
    pass


# =========================================================
# TEXT HELPERS
# =========================================================

def _clean(value: object | None) -> str:
    if value is None:
        return ""

    return re.sub(
        r"\s+",
        " ",
        unescape(str(value)),
    ).strip()


def _html_text(value: object | None) -> str:
    if not value:
        return ""

    return _clean(
        BeautifulSoup(
            str(value),
            "html.parser",
        ).get_text(
            " ",
            strip=True,
        )
    )


def _normalize_heading(value: str) -> str:
    value = _clean(value).lower()
    value = re.sub(
        r"[^a-z0-9]+",
        " ",
        value,
    )
    return re.sub(
        r"\s+",
        " ",
        value,
    ).strip()


def _dedupe_strings(
    values: list[str],
) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for value in values:
        clean = _clean(value)

        if not clean:
            continue

        key = clean.lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(clean)

    return result


def _split_sentences(value: str) -> list[str]:
    clean = _clean(value)

    if not clean:
        return []

    pieces = re.split(
        r"(?<=[.!?])\s+(?=[A-Z0-9])",
        clean,
    )

    return [
        _clean(piece)
        for piece in pieces
        if len(_clean(piece)) >= 20
    ]


# =========================================================
# SOURCE / DOMAIN HELPERS
# =========================================================

def _host(url: str) -> str:
    return (
        urlparse(url)
        .netloc
        .lower()
        .removeprefix("www.")
    )


def _source(url: str) -> str:
    host = _host(url)

    if host.endswith("google.com"):
        return "Google Careers"

    if host.endswith("linkedin.com"):
        return "LinkedIn"

    if host.endswith("indeed.com"):
        return "Indeed"

    if host.endswith("naukri.com"):
        return "Naukri"

    if host.endswith("internshala.com"):
        return "Internshala"

    if host.endswith("wellfound.com"):
        return "Wellfound"

    if host.endswith("greenhouse.io"):
        return "Greenhouse"

    if host.endswith("lever.co"):
        return "Lever"

    return host or "Unknown source"


JOB_BOARD_HOST_HINTS = {
    "linkedin.com",
    "indeed.com",
    "naukri.com",
    "internshala.com",
    "wellfound.com",
    "greenhouse.io",
    "lever.co",
    "workdayjobs.com",
    "myworkdayjobs.com",
}


def _company_from_corporate_host(
    url: str,
) -> str | None:
    """
    Conservative fallback only.

    For a direct corporate-careers URL such as google.com/... or
    careers.microsoft.com/..., derive the company from the corporate domain.

    Never use this fallback for general job boards.
    """
    host = _host(url)

    if not host:
        return None

    if any(
        host.endswith(board)
        for board in JOB_BOARD_HOST_HINTS
    ):
        return None

    parts = [
        part
        for part in host.split(".")
        if part
    ]

    if len(parts) < 2:
        return None

    # careers.company.com -> company
    if parts[0] in {
        "careers",
        "jobs",
        "job",
        "career",
    } and len(parts) >= 3:
        candidate = parts[-2]
    else:
        candidate = parts[-2]

    if not candidate:
        return None

    return candidate.replace("-", " ").title()


# =========================================================
# JSON-LD
# =========================================================

def _walk(value: object):
    if isinstance(value, list):
        for item in value:
            yield from _walk(item)

    elif isinstance(value, dict):
        yield value

        for key in (
            "@graph",
            "mainEntity",
            "itemListElement",
        ):
            nested = value.get(key)

            if nested is not None:
                yield from _walk(nested)


def _json_payloads(
    soup: BeautifulSoup,
) -> list[object]:
    payloads: list[object] = []

    for script in soup.find_all(
        "script",
        attrs={
            "type": "application/ld+json",
        },
    ):
        raw = (
            script.string
            or script.get_text()
            or ""
        ).strip()

        if not raw:
            continue

        try:
            payloads.append(
                json.loads(raw)
            )
            continue
        except Exception:
            pass

        # Some sites wrap JSON-LD in comments or malformed whitespace.
        raw = re.sub(
            r"^\s*<!--|-->\s*$",
            "",
            raw,
        ).strip()

        try:
            payloads.append(
                json.loads(raw)
            )
        except Exception:
            continue

    return payloads


def _jobposting(
    soup: BeautifulSoup,
) -> dict | None:
    for payload in _json_payloads(soup):
        for item in _walk(payload):
            kind = item.get("@type")

            if (
                kind == "JobPosting"
                or (
                    isinstance(kind, list)
                    and "JobPosting" in kind
                )
            ):
                return item

    return None


def _organization_name(
    job: dict,
) -> str | None:
    organization = job.get(
        "hiringOrganization"
    )

    if isinstance(
        organization,
        dict,
    ):
        return (
            _clean(
                organization.get("name")
            )
            or None
        )

    return _clean(
        organization
    ) or None

def _location_from_jobposting(
    job: dict,
) -> str | None:
    locations = job.get(
        "jobLocation"
    )

    if isinstance(
        locations,
        dict,
    ):
        locations = [locations]

    if not isinstance(
        locations,
        list,
    ):
        return None

    found: list[str] = []

    country_map = {
        "IN": "India",
        "US": "United States",
        "GB": "United Kingdom",
        "UK": "United Kingdom",
        "CA": "Canada",
        "AU": "Australia",
        "SG": "Singapore",
        "DE": "Germany",
        "FR": "France",
    }

    for item in locations:
        if not isinstance(
            item,
            dict,
        ):
            continue

        address = item.get(
            "address",
            {},
        )

        if isinstance(
            address,
            str,
        ):
            text = _clean(address)

        elif isinstance(
            address,
            dict,
        ):
            locality = _clean(
                address.get(
                    "addressLocality"
                )
            )

            region = _clean(
                address.get(
                    "addressRegion"
                )
            )

            country_value = address.get(
                "addressCountry"
            )

            if isinstance(
                country_value,
                dict,
            ):
                country = _clean(
                    country_value.get(
                        "name"
                    )
                    or country_value.get(
                        "addressCountry"
                    )
                )
            else:
                country = _clean(
                    country_value
                )

            if country:
                country = country_map.get(
                    country.upper(),
                    country,
                )

            parts = [
                locality,
                region,
                country,
            ]

            text = ", ".join(
                part
                for part in parts
                if part
            )

        else:
            text = ""

        if text:
            found.append(text)

    found = _dedupe_strings(
        found
    )

    return (
        " / ".join(found)
        if found
        else None
    )

def _employment_type(
    value: object | None,
) -> str | None:
    if isinstance(
        value,
        list,
    ):
        result = ", ".join(
            _clean(item)
            for item in value
            if _clean(item)
        )
        return result or None

    return _clean(value) or None


# =========================================================
# META / TITLE
# =========================================================

def _meta_content(
    soup: BeautifulSoup,
    *,
    name: str | None = None,
    prop: str | None = None,
) -> str:
    attrs: dict[str, str] = {}

    if name:
        attrs["name"] = name

    if prop:
        attrs["property"] = prop

    tag = soup.find(
        "meta",
        attrs=attrs,
    )

    if not tag:
        return ""

    return _clean(
        tag.get("content")
    )


def _clean_title(
    value: str | None,
) -> str | None:
    title = _clean(value)

    if not title:
        return None

    # Remove common careers-site suffixes without touching the role itself.
    suffix_patterns = [
        r"\s*[-|–—]\s*Google Careers\s*$",
        r"\s*[-|–—]\s*Careers\s*$",
        r"\s*[-|–—]\s*Jobs\s*$",
    ]

    for pattern in suffix_patterns:
        title = re.sub(
            pattern,
            "",
            title,
            flags=re.IGNORECASE,
        ).strip()

    return title or None


def _title_from_page(
    soup: BeautifulSoup,
) -> str | None:
    candidates = [
        _meta_content(
            soup,
            prop="og:title",
        ),
        _meta_content(
            soup,
            name="twitter:title",
        ),
    ]

    h1 = soup.find("h1")

    if h1:
        candidates.append(
            _clean(
                h1.get_text(
                    " ",
                    strip=True,
                )
            )
        )

    if soup.title:
        candidates.append(
            _clean(
                soup.title.get_text()
            )
        )

    for candidate in candidates:
        title = _clean_title(
            candidate
        )

        if title:
            return title

    return None


# =========================================================
# HTML SECTION EXTRACTION
# =========================================================

QUALIFICATION_HEADINGS = {
    "minimum qualifications",
    "qualifications",
    "basic qualifications",
    "required qualifications",
    "requirements",
    "what you need",
    "what you will need",
}

PREFERRED_HEADINGS = {
    "preferred qualifications",
    "preferred requirements",
    "nice to have",
    "nice to haves",
    "bonus qualifications",
}

RESPONSIBILITY_HEADINGS = {
    "responsibilities",
    "job responsibilities",
    "what you will do",
    "what youll do",
    "what you ll do",
    "your responsibilities",
    "the role",
}

LOCATION_HEADINGS = {
    "location",
    "locations",
    "job location",
    "job locations",
}


# Headings that mark the end of useful requirement/responsibility content
# on many corporate career pages. These are deliberately generic rather
# than company-specific.
SECTION_BOUNDARY_HEADINGS = {
    "in office expectations",
    "office location",
    "employment type",
    "apply",
    "apply for this role",
    "pay and benefits",
    "compensation",
    "benefits",
    "salary",
    "about us",
    "about the company",
    "equal opportunity",
    "privacy and terms",
    "privacy",
    "products and pricing",
    "developers",
    "resources",
    "support",
    "contact sales",
    "get support",
    "more resources",
}

SECTION_NOISE_EXACT = {
    "university",
    "office location",
    "employment type",
    "apply for this role",
    "products and pricing",
    "developers",
    "documentation",
    "api reference",
    "api status",
    "api changelog",
    "libraries and sdks",
    "developer blog",
    "customer stories",
    "privacy and terms",
    "cookie settings",
    "your privacy choices",
    "more resources",
    "stripe press",
    "contact sales",
    "get support",
    "managed support plans",
    "united states",
}

SECTION_NOISE_MARKERS = (
    "ca residents:",
    "cookie settings",
    "your privacy choices",
    "privacy and terms",
    "prohibited and restricted businesses",
    "contact sales",
    "get support",
    "managed support plans",
)


def _sanitize_section_items(
    values: list[str],
) -> list[str]:
    """
    Keep only content that plausibly belongs to the active career-page
    section. Stop when a known page-level boundary is reached.

    This prevents a broad parent container from leaking footer/navigation
    links into qualifications or responsibilities.
    """
    result: list[str] = []

    for value in values:
        clean = _clean(value)

        if not clean:
            continue

        # If one DOM node contains a real section followed by page chrome,
        # keep only the part before the earliest boundary phrase.
        lower = clean.lower()
        cut_at: int | None = None

        for boundary in SECTION_BOUNDARY_HEADINGS:
            match = re.search(
                rf"(?<![a-z0-9]){re.escape(boundary)}(?![a-z0-9])",
                lower,
                flags=re.IGNORECASE,
            )

            if match and match.start() > 0:
                if cut_at is None or match.start() < cut_at:
                    cut_at = match.start()

        if cut_at is not None:
            clean = _clean(clean[:cut_at])
            lower = clean.lower()

        normalized = _normalize_heading(clean)

        if not clean:
            continue

        if normalized in SECTION_BOUNDARY_HEADINGS:
            break

        if normalized in SECTION_NOISE_EXACT:
            continue

        if any(
            marker in lower
            for marker in SECTION_NOISE_MARKERS
        ):
            continue

        # Navigation/footer labels are usually very short. Preserve short
        # genuine requirements such as "Experience with Python" by requiring
        # a known noise exact-match above rather than dropping all short text.
        result.append(clean)

    return _dedupe_strings(result)


def _heading_kind(
    text: str,
) -> str | None:
    normalized = _normalize_heading(
        text
    )

    if normalized in QUALIFICATION_HEADINGS:
        return "qualifications"

    if normalized in PREFERRED_HEADINGS:
        return "preferred"

    if normalized in RESPONSIBILITY_HEADINGS:
        return "responsibilities"

    if normalized in LOCATION_HEADINGS:
        return "location"

    return None


def _extract_list_items_from_container(
    container: Tag,
) -> list[str]:
    items: list[str] = []

    for li in container.find_all(
        "li",
        recursive=True,
    ):
        text = _clean(
            li.get_text(
                " ",
                strip=True,
            )
        )

        if text:
            items.append(text)

    if items:
        return _dedupe_strings(
            items
        )

    # Fallback to paragraphs/divs if the site is not using lists.
    for child in container.find_all(
        ["p", "div"],
        recursive=True,
    ):
        text = _clean(
            child.get_text(
                " ",
                strip=True,
            )
        )

        if (
            text
            and len(text) >= 20
        ):
            items.append(text)

    return _dedupe_strings(
        items
    )


def _section_from_heading(
    heading: Tag,
) -> list[str]:
    """
    Gather content after a heading until the next heading of equal/higher
    structural level. Works for normal semantic HTML and many componentized
    careers pages.
    """
    result: list[str] = []

    # First try the heading's parent container.
    parent = heading.parent

    if isinstance(
        parent,
        Tag,
    ):
        children = list(
            parent.children
        )

        try:
            start = children.index(
                heading
            )
        except ValueError:
            start = -1

        if start >= 0:
            for sibling in children[
                start + 1:
            ]:
                if not isinstance(
                    sibling,
                    Tag,
                ):
                    continue

                if sibling.name in {
                    "h1",
                    "h2",
                    "h3",
                    "h4",
                    "h5",
                    "h6",
                }:
                    break

                result.extend(
                    _extract_list_items_from_container(
                        sibling
                    )
                )

    if result:
        return _dedupe_strings(
            result
        )

    # Fallback: walk next siblings.
    current = heading.find_next_sibling()

    while current is not None:
        if (
            isinstance(current, Tag)
            and current.name
            in {
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
            }
        ):
            break

        if isinstance(
            current,
            Tag,
        ):
            result.extend(
                _extract_list_items_from_container(
                    current
                )
            )

        current = (
            current.find_next_sibling()
            if isinstance(
                current,
                Tag,
            )
            else None
        )

    return _dedupe_strings(
        result
    )



def _extract_semantic_heading_list(
    soup: BeautifulSoup,
    heading_names: set[str],
) -> list[str]:
    """
    Extract list items that belong to an exact semantic heading.

    Walk document order from the matched heading until the next heading of
    equal or higher rank. This is more reliable than parent-container scans
    on modern componentized career pages where a large wrapper can contain
    multiple sections.
    """
    result: list[str] = []

    heading_tags = {
        "h1", "h2", "h3",
        "h4", "h5", "h6",
    }

    for heading in soup.find_all(
        list(heading_tags)
    ):
        normalized = _normalize_heading(
            heading.get_text(
                " ",
                strip=True,
            )
        )

        if normalized not in heading_names:
            continue

        try:
            current_rank = int(
                heading.name[1]
            )
        except Exception:
            current_rank = 6

        node = heading.find_next()

        while isinstance(node, Tag):
            if node.name in heading_tags:
                try:
                    next_rank = int(
                        node.name[1]
                    )
                except Exception:
                    next_rank = 6

                if next_rank <= current_rank:
                    break

            if node.name == "li":
                value = _clean(
                    node.get_text(
                        " ",
                        strip=True,
                    )
                )

                if value:
                    result.append(value)

            node = node.find_next()

    return _dedupe_strings(result)


def _extract_html_sections(
    soup: BeautifulSoup,
) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {
        "qualifications": [],
        "preferred": [],
        "responsibilities": [],
        "location": [],
    }

    for heading in soup.find_all(
        [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "strong",
            "b",
        ]
    ):
        text = _clean(
            heading.get_text(
                " ",
                strip=True,
            )
        )

        kind = _heading_kind(
            text
        )

        if not kind:
            continue

        values = _section_from_heading(
            heading
        )

        sections[kind].extend(
            values
        )

    for key in sections:
        sections[key] = _sanitize_section_items(
            _dedupe_strings(
                sections[key]
            )
        )

    return sections


# =========================================================
# PLAIN-TEXT SECTION EXTRACTION
# =========================================================

def _line_heading_kind(
    line: str,
) -> str | None:
    return _heading_kind(
        line.rstrip(":")
    )


def _extract_text_sections(
    text: str,
) -> dict[str, list[str]]:
    """
    Fallback for JavaScript-heavy pages where the final visible text survives
    but semantic HTML structure does not.
    """
    lines = [
        _clean(line)
        for line in text.splitlines()
        if _clean(line)
    ]

    sections: dict[str, list[str]] = {
        "qualifications": [],
        "preferred": [],
        "responsibilities": [],
        "location": [],
    }

    active: str | None = None

    for line in lines:
        kind = _line_heading_kind(
            line
        )

        if kind:
            active = kind
            continue

        normalized = _normalize_heading(
            line
        )

        # Stop a section at common unrelated headings.
        if normalized in {
            "about the job",
            "about us",
            "about google",
            "equal opportunity",
            "benefits",
            "salary",
            "compensation",
            "apply",
        }:
            active = None
            continue

        if active:
            if len(line) >= 10:
                sections[active].append(
                    line
                )

    for key in sections:
        sections[key] = _sanitize_section_items(
            _dedupe_strings(
                sections[key]
            )
        )

    return sections


def _merge_sections(
    first: dict[str, list[str]],
    second: dict[str, list[str]],
) -> dict[str, list[str]]:
    keys = {
        *first.keys(),
        *second.keys(),
    }

    return {
        key: _sanitize_section_items(
            _dedupe_strings([
                *first.get(
                    key,
                    [],
                ),
                *second.get(
                    key,
                    [],
                ),
            ])
        )
        for key in keys
    }


# =========================================================
# SKILL EXTRACTION
# =========================================================

SKILLS: dict[str, list[str]] = {
    "Python": [
        r"\bpython\b",
    ],
    "Java": [
        r"\bjava\b",
    ],
    "C": [
        r"(?<![A-Za-z0-9+#.])C(?![A-Za-z0-9+#.])",
    ],
    "C++": [
        r"(?<![A-Za-z0-9])C\+\+(?![A-Za-z0-9])",
    ],
    "Go": [
        r"\bgolang\b",
        r"(?<![A-Za-z0-9])Go(?![A-Za-z0-9])",
    ],
    "JavaScript": [
        r"\bjavascript\b",
    ],
    "TypeScript": [
        r"\btypescript\b",
    ],
    "React": [
        r"\breact(?:\.js|js)?\b",
    ],
    "Node.js": [
        r"\bnode(?:\.js|js)?\b",
    ],
    "SQL": [
        r"\bsql\b",
    ],
    "PostgreSQL": [
        r"\bpostgres(?:ql)?\b",
    ],
    "AWS": [
        r"\baws\b",
        r"\bamazon web services\b",
    ],
    "GCP": [
        r"\bgcp\b",
        r"\bgoogle cloud\b",
    ],
    "Azure": [
        r"\bazure\b",
    ],
    "Docker": [
        r"\bdocker\b",
    ],
    "Kubernetes": [
        r"\bkubernetes\b",
        r"\bk8s\b",
    ],
    "REST APIs": [
        r"\brest(?:ful)? api(?:s)?\b",
    ],
    "Machine Learning": [
        r"\bmachine learning\b",
    ],
    "Artificial Intelligence": [
        r"\bartificial intelligence\b",
    ],
    "Generative AI": [
        r"\bgenerative ai\b",
        r"\bgenai\b",
        r"\bgen ai\b",
    ],
    "LLMs": [
        r"\bllm(?:s)?\b",
        r"\blarge language model(?:s)?\b",
    ],
    "NLP": [
        r"\bnlp\b",
        r"\bnatural language processing\b",
    ],
    "Computer Vision": [
        r"\bcomputer vision\b",
    ],
    "TensorFlow": [
        r"\btensorflow\b",
    ],
    "PyTorch": [
        r"\bpytorch\b",
    ],
    "RAG": [
        r"\brag\b",
        r"\bretrieval[- ]augmented generation\b",
    ],
    "Agents": [
        r"\bai agents?\b",
        r"\bagentic ai\b",
        r"\bagentic\b",
        r"\bagents?\b",
    ],
    "Distributed Systems": [
        r"\bdistributed computing\b",
        r"\bdistributed systems?\b",
    ],
    "System Design": [
        r"\bsystem design\b",
        r"\blarge[- ]scale system design\b",
    ],
    "Networking": [
        r"\bnetworking\b",
    ],
    "Data Storage": [
        r"\bdata storage\b",
    ],
    "Security": [
        r"\bsecurity\b",
    ],
    "Full-Stack Development": [
        r"\bfull[- ]stack\b",
    ],
    "Backend Development": [
        r"\bbackend\b",
        r"\bback[- ]end\b",
    ],
    "Frontend Development": [
        r"\bfrontend\b",
        r"\bfront[- ]end\b",
    ],
    "Mobile Development": [
        r"\bmobile development\b",
        r"\bmobile applications?\b",
    ],
    "UI Design": [
        r"\bui design\b",
        r"\buser interface design\b",
    ],
    "Information Retrieval": [
        r"\binformation retrieval\b",
    ],
}


def extract_skills(
    text: str,
) -> list[str]:
    found: list[str] = []

    for name, patterns in SKILLS.items():
        if any(
            re.search(
                pattern,
                text,
                flags=re.IGNORECASE,
            )
            for pattern in patterns
        ):
            found.append(name)

    return found


# =========================================================
# FALLBACK LOCATION / COMPANY
# =========================================================

def _location_from_sections(
    sections: dict[str, list[str]],
) -> str | None:
    candidates = sections.get(
        "location",
        [],
    )

    if not candidates:
        return None

    return " / ".join(
        _dedupe_strings(
            candidates[:5]
        )
    ) or None


def _company_from_meta(
    soup: BeautifulSoup,
) -> str | None:
    site_name = _meta_content(
        soup,
        prop="og:site_name",
    )

    if site_name:
        normalized = site_name.lower()

        # Reject obvious generic job-platform names.
        if normalized not in {
            "linkedin",
            "indeed",
            "naukri",
            "internshala",
            "wellfound",
        }:
            return site_name

    return None



# =========================================================
# BOILERPLATE FILTERING
# =========================================================

RESPONSIBILITY_BOILERPLATE_MARKERS = (
    "privacy policy",
    "equal opportunity",
    "affirmative action",
    "workplace discrimination",
    "belonging at google",
    "how we hire",
    "accommodation",
    "recruitment agencies",
    "agency resumes",
    "equity is granted",
    "alphabet inc.",
    "follow life at google",
    "more about us",
)


def _filter_responsibilities(
    values: list[str],
) -> list[str]:
    result: list[str] = []

    for value in values:
        clean = _clean(value)
        lower = clean.lower()

        if not clean:
            continue

        if any(
            marker in lower
            for marker in RESPONSIBILITY_BOILERPLATE_MARKERS
        ):
            continue

        if len(clean) < 25:
            continue

        result.append(clean)

    return _dedupe_strings(result)


# =========================================================
# DESCRIPTION
# =========================================================

def _page_text(
    soup: BeautifulSoup,
) -> str:
    clone = BeautifulSoup(
        str(soup),
        "html.parser",
    )

    for tag in clone(
        [
            "script",
            "style",
            "noscript",
            "svg",
            "template",
        ]
    ):
        tag.decompose()

    return "\n".join(
        line
        for line in (
            _clean(line)
            for line in clone.get_text(
                "\n"
            ).splitlines()
        )
        if line
    )


def _description_from_page(
    soup: BeautifulSoup,
    page_text: str,
) -> str:
    # Prefer sufficiently rich metadata only if it looks like the full JD.
    meta_candidates = [
        _meta_content(
            soup,
            name="description",
        ),
        _meta_content(
            soup,
            prop="og:description",
        ),
    ]

    for candidate in meta_candidates:
        if len(candidate) >= 500:
            return candidate

    # Otherwise page text is more complete.
    return _clean(
        page_text
    )



# =========================================================
# JOB PAGE VALIDATION
# =========================================================

INVALID_JOB_TITLES = {
    "sign in",
    "signin",
    "log in",
    "login",
    "home",
    "careers",
    "jobs",
    "job search",
    "search jobs",
    "page not found",
    "access denied",
    "forbidden",
    "error",
}

INVALID_PAGE_MARKERS = (
    "sign in to continue",
    "please sign in",
    "log in to continue",
    "access denied",
    "you do not have permission",
    "page not found",
    "job not found",
    "this job is no longer available",
    "this position is no longer available",
    "the job you are looking for is no longer available",
)

JOB_TEXT_SIGNALS = (
    "qualification",
    "qualifications",
    "responsibilities",
    "requirements",
    "experience",
    "degree",
    "skills",
    "role",
    "position",
    "you will",
    "we are looking",
    "what you'll do",
    "what you will do",
)


def _validate_job_page(
    *,
    title: str | None,
    description: str,
    has_jobposting: bool,
    sections: dict[str, list[str]],
    final_url: str,
) -> None:
    """
    Reject authentication, navigation, unavailable-job and generic careers
    pages before they can enter normalization/scoring.

    A genuine JobPosting JSON-LD object is a strong signal, but even that path
    must still contain a usable title and description.
    """

    clean_title = _clean(title)
    title_lower = clean_title.lower()
    description_clean = _clean(description)
    description_lower = description_clean.lower()

    if title_lower in INVALID_JOB_TITLES:
        raise JobExtractionError(
            "This URL did not return an actual job posting "
            f"(page title: {clean_title or 'unknown'}). "
            "Open the public job-posting URL or paste the job description."
        )

    if any(
        marker in title_lower
        for marker in (
            "sign in",
            "log in",
            "access denied",
            "page not found",
        )
    ):
        raise JobExtractionError(
            "This URL appears to require authentication or does not expose "
            "the job posting publicly. Paste the job description instead."
        )

    if any(
        marker in description_lower
        for marker in INVALID_PAGE_MARKERS
    ):
        raise JobExtractionError(
            "The page was fetched, but it appears to be a sign-in, unavailable, "
            "or error page rather than a job posting."
        )

    if len(description_clean) < 80:
        raise JobExtractionError(
            "The page was fetched, but the job description could not be "
            "extracted reliably."
        )

    structured_count = sum(
        len(sections.get(key, []))
        for key in (
            "qualifications",
            "preferred",
            "responsibilities",
        )
    )

    job_signal_count = sum(
        1
        for signal in JOB_TEXT_SIGNALS
        if signal in description_lower
    )

    # Fallback HTML pages need stronger evidence than a valid JSON-LD
    # JobPosting page because generic careers/auth pages can contain lots of text.
    if not has_jobposting:
        if structured_count == 0 and job_signal_count < 2:
            raise JobExtractionError(
                "Could not verify that this URL contains a public job posting. "
                "Paste the job description instead."
            )

        if (
            not clean_title
            or len(clean_title) < 4
        ):
            raise JobExtractionError(
                "Could not reliably identify the job title from this page."
            )

    # Defensive guard against a careers home/search page masquerading as a JD.
    if (
        not has_jobposting
        and title_lower in {
            "google careers",
            "microsoft careers",
            "careers home",
            "job search",
        }
    ):
        raise JobExtractionError(
            "This URL points to a careers/search page, not a specific job posting."
        )

# =========================================================
# DESCRIPTION REQUIREMENT FALLBACK
# =========================================================

QUALIFICATION_CUES = (
    "currently pursuing",
    "bachelor",
    "master",
    "degree",
    "must have",
    "required",
    "minimum",
    "at least",
    "years of experience",
    "year of experience",
    "programming experience",
    "ability to demonstrate",
    "proficiency in",
    "experience with",
    "knowledge of",
    "understanding of",
)

RESPONSIBILITY_CUES = (
    "apply ",
    "build ",
    "develop ",
    "design ",
    "implement ",
    "maintain ",
    "work with",
    "collaborate",
    "review ",
    "support ",
    "manage ",
    "lead ",
    "drive ",
    "analyze ",
    "create ",
    "improve ",
    "seek feedback",
    "proactively ",
)


def _looks_like_qualification(
    text: str,
) -> bool:
    lower = _clean(text).lower()

    return any(
        cue in lower
        for cue in QUALIFICATION_CUES
    )


def _looks_like_responsibility(
    text: str,
) -> bool:
    lower = _clean(text).lower()

    return any(
        cue in lower
        for cue in RESPONSIBILITY_CUES
    )


def _requirements_from_description(
    description: str,
) -> tuple[list[str], list[str]]:
    sentences = _split_sentences(
        description
    )

    qualifications: list[str] = []
    responsibilities: list[str] = []

    for sentence in sentences:
        if _looks_like_qualification(
            sentence
        ):
            qualifications.append(
                sentence
            )

        elif _looks_like_responsibility(
            sentence
        ):
            responsibilities.append(
                sentence
            )

    return (
        _dedupe_strings(
            qualifications
        ),
        _filter_responsibilities(
            responsibilities
        ),
    )


# =========================================================
# MAIN EXTRACTION
# =========================================================

async def extract_job_from_url(
    url: str,
) -> ExtractedJob:
    settings = get_settings()

    try:
        async with httpx.AsyncClient(
            timeout=
                settings.request_timeout_seconds,
            follow_redirects=True,
            headers={
                "User-Agent":
                    settings.user_agent,
                "Accept-Language":
                    "en-US,en;q=0.9",
                "Accept":
                    (
                        "text/html,application/xhtml+xml,"
                        "application/xml;q=0.9,*/*;q=0.8"
                    ),
            },
        ) as client:
            response = await client.get(
                url
            )
            response.raise_for_status()

    except httpx.HTTPError as exc:
        raise JobExtractionError(
            f"Could not fetch the job page: {exc}"
        ) from exc

    final_url = str(
        response.url
    )

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    job = _jobposting(
        soup
    )

    page_text = _page_text(
        soup
    )

    html_sections = (
        _extract_html_sections(
            soup
        )
    )

    text_sections = (
        _extract_text_sections(
            page_text
        )
    )

    sections = _merge_sections(
        html_sections,
        text_sections,
    )

    semantic_minimum = _extract_semantic_heading_list(
        soup,
        {
            "minimum requirements",
            "minimum qualifications",
            "basic qualifications",
            "required qualifications",
            "requirements",
        },
    )

    semantic_preferred = _extract_semantic_heading_list(
        soup,
        {
            "preferred qualifications",
            "preferred requirements",
            "nice to have",
            "nice to haves",
            "bonus qualifications",
        },
    )

    semantic_responsibilities = _extract_semantic_heading_list(
        soup,
        {
            "responsibilities",
            "job responsibilities",
            "what you will do",
            "what youll do",
            "what you ll do",
            "your responsibilities",
        },
    )

    # -----------------------------------------------------
    # JSON-LD PRIMARY PATH
    # -----------------------------------------------------

    if job:
        raw_job_description = job.get(
            "description"
        )

        description = _html_text(
            raw_job_description
        )

        description_sections = {
            "qualifications": [],
            "preferred": [],
            "responsibilities": [],
            "location": [],
        }

        if raw_job_description:
            description_soup = BeautifulSoup(
                str(raw_job_description),
                "html.parser",
            )

            description_sections = (
                _extract_html_sections(
                    description_soup
                )
            )

        if len(description) < 200:
            description = (
                _description_from_page(
                    soup,
                    page_text,
                )
            )

        company = (
            _organization_name(job)
            or _company_from_meta(
                soup
            )
            or _company_from_corporate_host(
                final_url
            )
        )

        location = (
            _location_from_jobposting(
                job
            )
            or _location_from_sections(
                sections
            )
        )

        generic_qualifications: list[str] = []
        dedicated_requirements: list[str] = []

        generic_text = _html_text(
            job.get(
                "qualifications"
            )
        )

        if generic_text:
            generic_qualifications.extend(
                _split_sentences(
                    generic_text
                )
                or [generic_text]
            )

        for value in (
            job.get(
                "experienceRequirements"
            ),
            job.get(
                "educationRequirements"
            ),
        ):
            requirement_text = _html_text(
                value
            )

            if requirement_text:
                dedicated_requirements.extend(
                    _split_sentences(
                        requirement_text
                    )
                    or [requirement_text]
                )

        # Prefer sections inside JobPosting.description because they are
        # naturally bounded to the JD. Whole-page sections are only a fallback.
        bounded_minimum = (
            semantic_minimum
            or description_sections.get(
                "qualifications",
                [],
            )
            or sections.get(
                "qualifications",
                [],
            )
        )

        bounded_preferred = (
            semantic_preferred
            or description_sections.get(
                "preferred",
                [],
            )
            or sections.get(
                "preferred",
                [],
            )
        )

        # If the JobPosting description exposes an explicit Minimum
        # requirements section, trust that boundary instead of the generic
        # schema.org "qualifications" field. Some sites place persona text,
        # minimum requirements and preferred qualifications together inside
        # that generic field.
        minimum_source = (
            [
                *bounded_minimum,
                *dedicated_requirements,
            ]
            if bounded_minimum
            else [
                *generic_qualifications,
                *dedicated_requirements,
            ]
        )

        minimum_qualifications = _sanitize_section_items(
            _dedupe_strings(
                minimum_source
            )
        )

        preferred_qualifications = _sanitize_section_items(
            _dedupe_strings(
                bounded_preferred
            )
        )

        responsibility_text = (
            _html_text(
                job.get(
                    "responsibilities"
                )
            )
        )

        responsibilities = (
            _split_sentences(
                responsibility_text
            )
            if responsibility_text
            else []
        )

        bounded_responsibilities = (
            semantic_responsibilities
            or description_sections.get(
                "responsibilities",
                [],
            )
            or sections.get(
                "responsibilities",
                [],
            )
        )

        responsibilities.extend(
            bounded_responsibilities
        )

        # Some career sites expose requirements/responsibilities only
        # inside the JobPosting description instead of dedicated fields.
        (
            description_qualifications,
            description_responsibilities,
        ) = _requirements_from_description(
            description
        )

        if not minimum_qualifications:
            minimum_qualifications = (
                description_qualifications
            )

        if not responsibilities:
            responsibilities = (
                description_responsibilities
            )

        qualifications = _dedupe_strings([
            *minimum_qualifications,
            *preferred_qualifications,
        ])

        responsibilities = (
            _filter_responsibilities(
                _dedupe_strings(
                    responsibilities
                )
            )
        )

        skill_text = " ".join([
            description,
            *qualifications,
            *responsibilities,
            _html_text(
                job.get(
                    "skills"
                )
            ),
        ])

        skills = extract_skills(
            skill_text
        )

        resolved_title = (
            _clean_title(
                _clean(
                    job.get(
                        "title"
                    )
                )
            )
            or _title_from_page(
                soup
            )
        )

        _validate_job_page(
            title=resolved_title,
            description=description,
            has_jobposting=True,
            sections=sections,
            final_url=final_url,
        )

        return ExtractedJob(
            url=final_url,
            source=_source(
                final_url
            ),
            title=resolved_title,
            company=company,
            location=location,
            description=description,
            employment_type=
                _employment_type(
                    job.get(
                        "employmentType"
                    )
                ),
            date_posted=(
                _clean(
                    job.get(
                        "datePosted"
                    )
                )
                or None
            ),
            valid_through=(
                _clean(
                    job.get(
                        "validThrough"
                    )
                )
                or None
            ),
            qualifications=
                qualifications,
            minimum_qualifications=
                minimum_qualifications,
            preferred_qualifications=
                preferred_qualifications,
            responsibilities=
                responsibilities,
            skills=skills,
            extraction_method=
                "json-ld",
        )

    # -----------------------------------------------------
    # HTML / JS-FALLBACK PATH
    # -----------------------------------------------------

    description = (
        _description_from_page(
            soup,
            page_text,
        )
    )

    title = _title_from_page(
        soup
    )

    company = (
        _company_from_meta(
            soup
        )
        or _company_from_corporate_host(
            final_url
        )
    )

    location = (
        _location_from_sections(
            sections
        )
    )

    minimum_qualifications = _sanitize_section_items(
        _dedupe_strings(
            sections.get(
                "qualifications",
                [],
            )
        )
    )

    preferred_qualifications = _sanitize_section_items(
        _dedupe_strings(
            sections.get(
                "preferred",
                [],
            )
        )
    )

    qualifications = _dedupe_strings([
        *minimum_qualifications,
        *preferred_qualifications,
    ])

    responsibilities = _filter_responsibilities(
        _dedupe_strings(
            sections.get(
                "responsibilities",
                [],
            )
        )
    )

    skill_text = " ".join([
        description,
        *qualifications,
        *responsibilities,
    ])

    skills = extract_skills(
        skill_text
    )

    _validate_job_page(
        title=title,
        description=description,
        has_jobposting=False,
        sections=sections,
        final_url=final_url,
    )

    return ExtractedJob(
        url=final_url,
        source=_source(
            final_url
        ),
        title=title,
        company=company,
        location=location,
        description=description,
        employment_type=None,
        date_posted=None,
        valid_through=None,
        qualifications=
            qualifications,
        minimum_qualifications=
            minimum_qualifications,
        preferred_qualifications=
            preferred_qualifications,
        responsibilities=
            responsibilities,
        skills=skills,
        extraction_method=
            "html-fallback-v2",
    )
