export type JobImportMethod =
  | 'url'
  | 'text'
  | 'file';

export type JobSource =
  | 'LinkedIn'
  | 'Company Website'
  | 'Naukri'
  | 'Internshala'
  | 'Indeed'
  | 'Other';

export interface ImportedJob {
  id: string;

  importMethod: JobImportMethod;

  url?: string;
  rawDescription?: string;
  fileName?: string;

  company?: string;
  title?: string;
  location?: string;
  source?: JobSource;

  employmentType?: string;

  datePosted?: string;
  validThrough?: string;

  qualifications?: string[];
  responsibilities?: string[];
  skills?: string[];

  extractionMethod?: string;

  createdAt: string;
}