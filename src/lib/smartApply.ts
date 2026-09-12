import type {
  ImportedJob,
  JobSource,
} from '../types/job';

import type {
  JobAnalysisResult,
} from '../types/analysis';


const API_BASE_URL =
  'http://127.0.0.1:8000';


export type ParsedResumePayload =
  Record<string, unknown>;


export interface ExtractedJobResponse {
  url: string;
  source: string;
  title: string | null;
  company: string | null;
  location: string | null;
  description: string;
  employment_type: string | null;
  date_posted: string | null;
  valid_through: string | null;
  qualifications: string[];
  minimum_qualifications?: string[];
  preferred_qualifications?: string[];
  responsibilities: string[];
  skills: string[];
  extraction_method: string;
}


interface BackendCanonicalBreakdown {
  capabilities: number;
  experience: number;
  responsibilities: number;
  eligibility: number;
  preferred: number;
}


interface BackendRequirementMatch {
  requirement: string;
  level: string;
  category: string;
  score: number;
  matched: boolean;
  evidence: string[];
}


interface BackendExperienceMatch {
  index: number;
  title: string | null;
  organization: string | null;
  score: number;
  matched_terms: string[];
  reasons: string[];
}


interface BackendWorkSampleMatch {
  index: number;
  name: string | null;
  sample_type: string;
  score: number;
  matched_terms: string[];
  reasons: string[];
}


interface BackendAnalysisResponse {
  resume_fit: number;

  ghost_risk:
    | 'low'
    | 'medium'
    | 'high';

  ghost_risk_reasons: string[];

  verdict: string;
  explanation: string;

  canonical_breakdown:
    BackendCanonicalBreakdown;

  required_requirements: string[];
  preferred_requirements: string[];

  matched_required: string[];
  missing_required: string[];
  matched_preferred: string[];

  requirement_matches:
    BackendRequirementMatch[];

  experience_matches:
    BackendExperienceMatch[];

  work_sample_matches:
    BackendWorkSampleMatch[];

  role_family: string | null;
  extraction_quality: string | null;
  normalization_warnings: string[];
}


export function validateJobUrl(
  value: string,
): boolean {
  try {
    const url =
      new URL(
        value.trim(),
      );

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
}


export function validateJobDescription(
  value: string,
): boolean {
  return (
    value.trim().length >= 100
  );
}


export function normalizeJobSource(
  source: string,
): JobSource {
  const normalized =
    source.toLowerCase();

  if (normalized.includes('linkedin')) {
    return 'LinkedIn';
  }

  if (normalized.includes('indeed')) {
    return 'Indeed';
  }

  if (normalized.includes('naukri')) {
    return 'Naukri';
  }

  if (normalized.includes('internshala')) {
    return 'Internshala';
  }

  if (
    normalized.includes('careers') ||
    normalized.includes('google') ||
    normalized.includes('microsoft') ||
    normalized.includes('jobs.') ||
    normalized.includes('greenhouse') ||
    normalized.includes('lever')
  ) {
    return 'Company Website';
  }

  return 'Other';
}


export function createImportedJob(
  data: Omit<
    ImportedJob,
    'id' | 'createdAt'
  >,
): ImportedJob {
  return {
    ...data,
    id:
      crypto.randomUUID(),
    createdAt:
      new Date()
        .toISOString(),
  };
}


async function parseApiError(
  response: Response,
): Promise<string> {
  try {
    const data =
      await response.json();

    if (
      typeof data?.detail ===
      'string'
    ) {
      return data.detail;
    }

    if (
      Array.isArray(
        data?.detail,
      )
    ) {
      return data.detail
        .map(
          (
            item: {
              msg?: string;
              loc?: unknown[];
            },
          ) => {
            const location =
              Array.isArray(
                item.loc,
              )
                ? item.loc.join('.')
                : '';

            if (
              item.msg &&
              location
            ) {
              return (
                `${location}: ` +
                `${item.msg}`
              );
            }

            return (
              item.msg ??
              JSON.stringify(item)
            );
          },
        )
        .join(', ');
    }

    return JSON.stringify(
      data?.detail ??
        data,
    );
  } catch {
    return (
      `Request failed with status ` +
      `${response.status}`
    );
  }
}


export async function extractJobFromUrl(
  url: string,
): Promise<ExtractedJobResponse> {
  const cleanUrl =
    url.trim();

  if (
    !validateJobUrl(
      cleanUrl,
    )
  ) {
    throw new Error(
      'Please enter a valid job URL.',
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/api/v1/smart-apply/extract`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            url:
              cleanUrl,
          }),
      },
    );

  if (!response.ok) {
    const message =
      await parseApiError(
        response,
      );

    throw new Error(
      message,
    );
  }

  return (
    await response.json()
  ) as ExtractedJobResponse;
}


export function importedJobFromExtraction(
  extracted:
    ExtractedJobResponse,
): ImportedJob {
  return createImportedJob({
    importMethod:
      'url',

    url:
      extracted.url,

    source:
      normalizeJobSource(
        extracted.source,
      ),

    title:
      extracted.title ??
      'Untitled role',

    company:
      extracted.company ??
      'Unknown company',

    location:
      extracted.location ??
      undefined,

    rawDescription:
      extracted.description,

    employmentType:
      extracted.employment_type ??
      undefined,

    datePosted:
      extracted.date_posted ??
      undefined,

    validThrough:
      extracted.valid_through ??
      undefined,

    qualifications:
      extracted.qualifications ??
      [],

    responsibilities:
      extracted.responsibilities ??
      [],

    skills:
      extracted.skills ??
      [],

    extractionMethod:
      extracted.extraction_method,
  });
}


export async function parseResumeFile(
  file: File,
): Promise<ParsedResumePayload> {
  const formData =
    new FormData();

  formData.append(
    'file',
    file,
  );

  const response =
    await fetch(
      `${API_BASE_URL}/api/v2/resumes/parse`,
      {
        method: 'POST',
        body:
          formData,
      },
    );

  if (!response.ok) {
    const message =
      await parseApiError(
        response,
      );

    throw new Error(
      message,
    );
  }

  return (
    await response.json()
  ) as ParsedResumePayload;
}


function buildBackendJobPayload(
  job: ImportedJob,

  extractedJob?:
    ExtractedJobResponse,
) {
  return {
    url:
      extractedJob?.url ??
      job.url ??
      '',

    source:
      extractedJob?.source ??
      job.source ??
      'Other',

    title:
      extractedJob?.title ??
      job.title ??
      null,

    company:
      extractedJob?.company ??
      job.company ??
      null,

    location:
      extractedJob?.location ??
      job.location ??
      null,

    description:
      extractedJob?.description ??
      job.rawDescription ??
      '',

    employment_type:
      extractedJob
        ?.employment_type ??
      job.employmentType ??
      null,

    date_posted:
      extractedJob
        ?.date_posted ??
      job.datePosted ??
      null,

    valid_through:
      extractedJob
        ?.valid_through ??
      job.validThrough ??
      null,

    qualifications:
      extractedJob
        ?.qualifications ??
      job.qualifications ??
      [],

    minimum_qualifications:
      extractedJob
        ?.minimum_qualifications ??
      [],

    preferred_qualifications:
      extractedJob
        ?.preferred_qualifications ??
      [],

    responsibilities:
      extractedJob
        ?.responsibilities ??
      job.responsibilities ??
      [],

    skills:
      extractedJob?.skills ??
      job.skills ??
      [],

    extraction_method:
      extractedJob
        ?.extraction_method ??
      job.extractionMethod ??
      'frontend-import',
  };
}


export async function analyzeJob(
  job: ImportedJob,

  parsedResume:
    ParsedResumePayload,

  extractedJob?:
    ExtractedJobResponse,
): Promise<JobAnalysisResult> {
  if (
    !job.rawDescription
      ?.trim() &&
    !extractedJob
      ?.description
      ?.trim()
  ) {
    throw new Error(
      'No job description is available for analysis.',
    );
  }

  if (
    !parsedResume ||
    Object.keys(
      parsedResume,
    ).length === 0
  ) {
    throw new Error(
      'No parsed resume is available for matching.',
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/api/v1/smart-apply/analyze`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            job:
              buildBackendJobPayload(
                job,
                extractedJob,
              ),

            resume:
              parsedResume,
          }),
      },
    );

  if (!response.ok) {
    const message =
      await parseApiError(
        response,
      );

    throw new Error(
      message,
    );
  }

  const data =
    (
      await response.json()
    ) as BackendAnalysisResponse;

  return {
    jobId:
      job.id,

    resumeFit:
      data.resume_fit,

    ghostRisk:
      data.ghost_risk,

    ghostRiskReasons:
      data.ghost_risk_reasons,

    verdict:
      data.verdict,

    explanation:
      data.explanation,

    canonicalBreakdown: {
      capabilities:
        data.canonical_breakdown
          .capabilities,

      experience:
        data.canonical_breakdown
          .experience,

      responsibilities:
        data.canonical_breakdown
          .responsibilities,

      eligibility:
        data.canonical_breakdown
          .eligibility,

      preferred:
        data.canonical_breakdown
          .preferred,
    },

    requiredRequirements:
      data.required_requirements,

    preferredRequirements:
      data.preferred_requirements,

    matchedRequired:
      data.matched_required,

    missingRequired:
      data.missing_required,

    matchedPreferred:
      data.matched_preferred,

    requirementMatches:
      data.requirement_matches.map(
        (item) => ({
          requirement:
            item.requirement,

          level:
            item.level,

          category:
            item.category,

          score:
            item.score,

          matched:
            item.matched,

          evidence:
            item.evidence,
        }),
      ),

    experienceMatches:
      data.experience_matches.map(
        (item) => ({
          index:
            item.index,

          title:
            item.title,

          organization:
            item.organization,

          score:
            item.score,

          matchedTerms:
            item.matched_terms,

          reasons:
            item.reasons,
        }),
      ),

    workSampleMatches:
      data.work_sample_matches.map(
        (item) => ({
          index:
            item.index,

          name:
            item.name,

          sampleType:
            item.sample_type,

          score:
            item.score,

          matchedTerms:
            item.matched_terms,

          reasons:
            item.reasons,
        }),
      ),

    roleFamily:
      data.role_family,

    extractionQuality:
      data.extraction_quality,

    normalizationWarnings:
      data.normalization_warnings,
  };
}
