import { create } from 'zustand';

import type { ImportedJob } from '../types/job';
import type { JobAnalysisResult } from '../types/analysis';

export type TrackedApplicationStatus =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export type CareerInboxEventType =
  | 'Application'
  | 'Interview'
  | 'Offer'
  | 'Rejection'
  | 'Recruiter'
  | 'Other';

export interface CareerInboxEvent {
  id: string;
  applicationId: string | null;
  type: CareerInboxEventType;
  title: string;
  sender?: string;
  snippet?: string;
  receivedAt: string;
  suggestedStatus?:
    | TrackedApplicationStatus
    | null;
  read: boolean;
  source: 'manual' | 'gmail';
  externalMessageId?: string;
}

export interface TrackedApplication {
  id: string;
  jobId: string;
  company: string;
  role: string;
  source: string;
  url?: string;
  status: TrackedApplicationStatus;
  fit: number;
  ghostRisk: 'low' | 'medium' | 'high';
  appliedAt: string;
  date: string;
  resumeLabel: string;
  createdAt: string;
  updatedAt?: string;
  importedFromGmail?: boolean;
  externalApplicationId?: string;
  lastSyncedEmailId?: string;
}

interface CareerStore {
  currentJob: ImportedJob | null;
  currentAnalysis: JobAnalysisResult | null;
  currentResume: Record<string, unknown> | null;

  savedJobs: ImportedJob[];

  trackedApplications: TrackedApplication[];
  selectedApplicationId: string | null;

  careerInboxEvents: CareerInboxEvent[];

  setCurrentJob: (job: ImportedJob) => void;
  setCurrentAnalysis: (analysis: JobAnalysisResult) => void;
  setCurrentResume: (resume: Record<string, unknown>) => void;

  saveJob: (job: ImportedJob) => void;

  addTrackedApplication: (
    application: TrackedApplication,
  ) => void;

  updateTrackedApplicationStatus: (
    id: string,
    status: TrackedApplicationStatus,
  ) => void;

  updateTrackedApplication: (
    id: string,
    changes: Partial<
      Pick<
        TrackedApplication,
        | 'company'
        | 'role'
        | 'source'
        | 'url'
        | 'status'
        | 'appliedAt'
        | 'date'
        | 'resumeLabel'
        | 'updatedAt'
        | 'externalApplicationId'
        | 'lastSyncedEmailId'
      >
    >,
  ) => void;

  deleteTrackedApplication: (
    id: string,
  ) => void;

  addCareerInboxEvent: (
    event: CareerInboxEvent,
  ) => void;

  markCareerInboxEventRead: (
    id: string,
  ) => void;

  deleteCareerInboxEvent: (
    id: string,
  ) => void;

  applyCareerInboxEventStatus: (
    eventId: string,
  ) => void;

  setSelectedApplication: (
    id: string | null,
  ) => void;

  clearCurrentJob: () => void;
  clearAnalysis: () => void;
  resetSmartApply: () => void;
}

function readTrackedApplications(): TrackedApplication[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      'roleclear_tracked_applications',
    );

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function persistTrackedApplications(
  applications: TrackedApplication[],
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    'roleclear_tracked_applications',
    JSON.stringify(applications),
  );
}


function readCareerInboxEvents(): CareerInboxEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      'roleclear_career_inbox_events',
    );

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function persistCareerInboxEvents(
  events: CareerInboxEvent[],
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    'roleclear_career_inbox_events',
    JSON.stringify(events),
  );
}

export const useCareerStore = create<CareerStore>((set) => ({
  currentJob: null,
  currentAnalysis: null,
  currentResume: null,

  savedJobs: [],

  trackedApplications:
    readTrackedApplications(),

  selectedApplicationId: null,

  careerInboxEvents:
    readCareerInboxEvents(),

  setCurrentJob: (job) =>
    set({
      currentJob: job,
    }),

  setCurrentAnalysis: (analysis) =>
    set({
      currentAnalysis: analysis,
    }),

  setCurrentResume: (resume) =>
    set({
      currentResume: resume,
    }),

  saveJob: (job) =>
    set((state) => {
      const alreadySaved =
        state.savedJobs.some(
          (savedJob) =>
            savedJob.id === job.id,
        );

      if (alreadySaved) {
        return state;
      }

      return {
        savedJobs: [
          ...state.savedJobs,
          job,
        ],
      };
    }),

  addTrackedApplication: (application) =>
    set((state) => {
      const existing =
        state.trackedApplications.some(
          (item) =>
            item.id ===
              application.id ||
            item.jobId ===
              application.jobId,
        );

      if (existing) {
        return state;
      }

      const next = [
        application,
        ...state.trackedApplications,
      ];

      persistTrackedApplications(next);

      return {
        trackedApplications: next,
        selectedApplicationId:
          application.id,
      };
    }),

  updateTrackedApplicationStatus: (
    id,
    status,
  ) =>
    set((state) => {
      const next =
        state.trackedApplications.map(
          (application) =>
            application.id === id
              ? {
                  ...application,
                  status,
                  updatedAt:
                    new Date().toISOString(),
                }
              : application,
        );

      persistTrackedApplications(next);

      return {
        trackedApplications: next,
      };
    }),

  updateTrackedApplication: (
    id,
    changes,
  ) =>
    set((state) => {
      const next =
        state.trackedApplications.map(
          (application) =>
            application.id === id
              ? {
                  ...application,
                  ...changes,
                  updatedAt:
                    changes.updatedAt ??
                    new Date().toISOString(),
                }
              : application,
        );

      persistTrackedApplications(next);

      return {
        trackedApplications: next,
      };
    }),

  deleteTrackedApplication: (id) =>
    set((state) => {
      const next =
        state.trackedApplications.filter(
          (application) =>
            application.id !== id,
        );

      const nextEvents =
        state.careerInboxEvents.filter(
          (event) =>
            event.applicationId !== id,
        );

      persistTrackedApplications(next);
      persistCareerInboxEvents(nextEvents);

      return {
        trackedApplications: next,
        careerInboxEvents: nextEvents,
        selectedApplicationId:
          state.selectedApplicationId ===
          id
            ? null
            : state.selectedApplicationId,
      };
    }),

  addCareerInboxEvent: (event) =>
    set((state) => {
      if (
        event.externalMessageId &&
        state.careerInboxEvents.some(
          (existing) =>
            existing.externalMessageId ===
            event.externalMessageId,
        )
      ) {
        return state;
      }

      const next = [
        event,
        ...state.careerInboxEvents,
      ];

      persistCareerInboxEvents(next);

      return {
        careerInboxEvents: next,
      };
    }),

  markCareerInboxEventRead: (id) =>
    set((state) => {
      const next =
        state.careerInboxEvents.map(
          (event) =>
            event.id === id
              ? {
                  ...event,
                  read: true,
                }
              : event,
        );

      persistCareerInboxEvents(next);

      return {
        careerInboxEvents: next,
      };
    }),

  deleteCareerInboxEvent: (id) =>
    set((state) => {
      const next =
        state.careerInboxEvents.filter(
          (event) => event.id !== id,
        );

      persistCareerInboxEvents(next);

      return {
        careerInboxEvents: next,
      };
    }),

  applyCareerInboxEventStatus: (eventId) =>
    set((state) => {
      const event =
        state.careerInboxEvents.find(
          (item) =>
            item.id === eventId,
        );

      if (
        !event ||
        !event.applicationId ||
        !event.suggestedStatus
      ) {
        return state;
      }

      const nextApplications =
        state.trackedApplications.map(
          (application) =>
            application.id ===
            event.applicationId
              ? {
                  ...application,
                  status:
                    event.suggestedStatus!,
                }
              : application,
        );

      const nextEvents =
        state.careerInboxEvents.map(
          (item) =>
            item.id === eventId
              ? {
                  ...item,
                  read: true,
                }
              : item,
        );

      persistTrackedApplications(
        nextApplications,
      );
      persistCareerInboxEvents(
        nextEvents,
      );

      return {
        trackedApplications:
          nextApplications,
        careerInboxEvents:
          nextEvents,
      };
    }),

  setSelectedApplication: (id) =>
    set({
      selectedApplicationId: id,
    }),

  clearCurrentJob: () =>
    set({
      currentJob: null,
    }),

  clearAnalysis: () =>
    set({
      currentAnalysis: null,
    }),

  resetSmartApply: () =>
    set({
      currentJob: null,
      currentAnalysis: null,
    }),
}));
