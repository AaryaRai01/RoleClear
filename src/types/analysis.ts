export type AnalysisStatus =
  | 'idle'
  | 'analyzing'
  | 'success'
  | 'error';


export type GhostRiskLevel =
  | 'low'
  | 'medium'
  | 'high';


export type RequirementLevel =
  | 'required'
  | 'preferred'
  | 'context';


export interface CanonicalBreakdown {
  capabilities: number;
  experience: number;
  responsibilities: number;
  eligibility: number;
  preferred: number;
}


export interface RequirementMatchResult {
  requirement: string;
  level: RequirementLevel | string;
  category: string;
  score: number;
  matched: boolean;
  evidence: string[];
}


export interface ExperienceMatchResult {
  index: number;
  title: string | null;
  organization: string | null;
  score: number;
  matchedTerms: string[];
  reasons: string[];
}


export interface WorkSampleMatchResult {
  index: number;
  name: string | null;
  sampleType: string;
  score: number;
  matchedTerms: string[];
  reasons: string[];
}


export interface JobAnalysisResult {
  jobId: string;

  resumeFit: number;

  ghostRisk: GhostRiskLevel;
  ghostRiskReasons: string[];

  verdict: string;
  explanation: string;

  canonicalBreakdown: CanonicalBreakdown;

  requiredRequirements: string[];
  preferredRequirements: string[];

  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];

  requirementMatches: RequirementMatchResult[];

  experienceMatches: ExperienceMatchResult[];
  workSampleMatches: WorkSampleMatchResult[];

  roleFamily: string | null;
  extractionQuality: string | null;
  normalizationWarnings: string[];
}
