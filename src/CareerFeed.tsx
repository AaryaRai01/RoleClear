import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Inbox,
  Sparkles,
} from 'lucide-react';

import { useCareerStore } from './store/useCareerStore';
import type { View } from './types/navigation';

type FeedFilter =
  | 'All'
  | 'Opportunities'
  | 'Applications'
  | 'Signals';

function FeedButton({
  children,
  onClick,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      className={`button ${
        secondary
          ? 'button-secondary'
          : 'button-primary'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="section-kicker">
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function toTime(
  value?: string | null,
) {
  if (!value) return 0;

  const parsed = Date.parse(value);

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}

function formatRelativeDate(
  value?: string | null,
) {
  if (!value) return 'Recent';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recent';
  }

  const diff =
    Date.now() - date.getTime();

  const days = Math.floor(
    diff / 86_400_000,
  );

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  );
}

export default function CareerFeed({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const savedJobs = useCareerStore(
    (state) => state.savedJobs,
  );

  const trackedApplications =
    useCareerStore(
      (state) =>
        state.trackedApplications,
    );

  const careerInboxEvents =
    useCareerStore(
      (state) =>
        state.careerInboxEvents,
    );

  const setCurrentJob =
    useCareerStore(
      (state) =>
        state.setCurrentJob,
    );

  const setSelectedApplication =
    useCareerStore(
      (state) =>
        state.setSelectedApplication,
    );

  const [filter, setFilter] =
    useState<FeedFilter>('All');

  const items = useMemo(() => {
    const opportunityItems =
      savedJobs.map((job) => ({
        id: `job-${job.id}`,
        kind:
          'opportunity' as const,
        timestamp:
          toTime(
            (job as any).createdAt,
          ),
        title:
          job.title ??
          'Imported opportunity',
        company:
          job.company ??
          'Company',
        source:
          job.source ??
          'Imported opportunity',
        fit:
          typeof (job as any).fit ===
          'number'
            ? (job as any).fit
            : null,
        risk:
          (job as any).ghostRisk ??
          null,
        raw: job,
      }));

    const applicationItems =
      trackedApplications.map(
        (application) => ({
          id:
            `application-${application.id}`,
          kind:
            'application' as const,
          timestamp:
            toTime(
              application.appliedAt ??
                application.createdAt,
            ),
          title:
            application.role,
          company:
            application.company,
          source:
            `Application · ${application.status}`,
          fit:
            application.fit,
          risk:
            application.ghostRisk,
          raw: application,
        }),
      );

    const signalItems =
      careerInboxEvents
        .filter(
          (event) =>
            [
              'Interview',
              'Offer',
              'Recruiter',
              'Rejection',
            ].includes(
              String(event.type),
            ),
        )
        .map((event) => ({
          id: `signal-${event.id}`,
          kind: 'signal' as const,
          timestamp:
            toTime(
              event.receivedAt,
            ),
          title:
            event.title ||
            'Career update',
          company:
            event.sender ||
            'Career Inbox',
          source:
            String(event.type),
          snippet:
            event.snippet ?? '',
          raw: event,
        }));

    return [
      ...opportunityItems,
      ...applicationItems,
      ...signalItems,
    ].sort(
      (a, b) =>
        b.timestamp - a.timestamp,
    );
  }, [
    savedJobs,
    trackedApplications,
    careerInboxEvents,
  ]);

  const filtered = items.filter(
    (item) =>
      filter === 'All' ||
      (filter === 'Opportunities' &&
        item.kind === 'opportunity') ||
      (filter === 'Applications' &&
        item.kind === 'application') ||
      (filter === 'Signals' &&
        item.kind === 'signal'),
  );

  const nextApplication =
    [...trackedApplications]
      .filter(
        (item) =>
          item.status === 'Applied' ||
          item.status === 'Screening',
      )
      .sort(
        (a, b) =>
          toTime(a.appliedAt) -
          toTime(b.appliedAt),
      )[0] ?? null;

  return (
    <div className="rc-page-enter">
      <PageHeader
        eyebrow="Your focused career feed"
        title="Career Feed"
        subtitle="A live stream built from the opportunities, applications, and career signals already inside RoleClear."
      />

      <div className="feed-layout">
        <div className="feed-list">
          <div className="feed-filter">
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {(
                [
                  'All',
                  'Opportunities',
                  'Applications',
                  'Signals',
                ] as FeedFilter[]
              ).map((item) => (
                <FeedButton
                  key={item}
                  secondary={
                    filter !== item
                  }
                  onClick={() =>
                    setFilter(item)
                  }
                >
                  {item}
                </FeedButton>
              ))}
            </div>

            <span>
              {filtered.length}{' '}
              update
              {filtered.length === 1
                ? ''
                : 's'}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="detail-card">
              <span className="mini-label">
                NOTHING HERE YET
              </span>
              <h3>
                Your feed will build itself as you use RoleClear.
              </h3>
              <p>
                Analyze an opportunity,
                track an application, or
                sync Career Inbox to create
                useful activity here.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              if (
                item.kind ===
                'signal'
              ) {
                return (
                  <div
                    className="feed-event"
                    key={item.id}
                  >
                    <span>
                      <Sparkles
                        size={16}
                      />
                    </span>

                    <div>
                      <small>
                        {item.source.toUpperCase()}{' '}
                        ·{' '}
                        {formatRelativeDate(
                          item.raw
                            .receivedAt,
                        )}
                      </small>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.snippet ||
                          item.company}
                      </p>

                      <button
                        className="feed-open-inbox"
                        type="button"
                        onClick={() =>
                          setView(
                            'inbox',
                          )
                        }
                      >
                        <span>Open inbox</span>
                        <ArrowUpRight
                          size={13}
                        />
                      </button>
                    </div>
                  </div>
                );
              }

              if (
                item.kind ===
                'application'
              ) {
                return (
                  <div
                    className="opportunity-card"
                    key={item.id}
                  >
                    <span className="company-logo blue">
                      {item.company[0]}
                    </span>

                    <div className="opportunity-info">
                      <div>
                        <b>
                          {item.title}
                        </b>
                        <span>
                          {
                            item.company
                          }
                        </span>
                      </div>

                      <p>
                        {item.source} ·{' '}
                        {formatRelativeDate(
                          item.raw
                            .appliedAt,
                        )}
                      </p>
                    </div>

                    <div className="opportunity-score">
                      <span>
                        RESUME FIT
                      </span>
                      <b>
                        {item.fit ?? 0}%
                      </b>
                    </div>

                    <div
                      className={`risk-badge ${
                        item.risk ===
                        'medium'
                          ? 'medium'
                          : ''
                      }`}
                    >
                      {String(
                        item.risk ??
                          'low',
                      )}{' '}
                      risk
                    </div>

                    <button
                      onClick={() => {
                        setSelectedApplication(
                          item.raw.id,
                        );
                        setView(
                          'applications',
                        );
                      }}
                    >
                      Track
                      <ArrowUpRight
                        size={15}
                      />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  className="opportunity-card"
                  key={item.id}
                >
                  <span className="company-logo orange">
                    {item.company[0]}
                  </span>

                  <div className="opportunity-info">
                    <div>
                      <b>
                        {item.title}
                      </b>
                      <span>
                        {item.company}
                      </span>
                    </div>

                    <p>
                      {item.source}
                    </p>
                  </div>

                  {item.fit !== null && (
                    <div className="opportunity-score">
                      <span>
                        RESUME FIT
                      </span>
                      <b>
                        {item.fit}%
                      </b>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setCurrentJob(
                        item.raw,
                      );
                      setView('apply');
                    }}
                  >
                    Analyze
                    <ArrowUpRight
                      size={15}
                    />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="feed-aside">
          <div className="feed-aside-card">
            <span className="mini-label">
              KEEP IT MOVING
            </span>

            <h3>
              Your next best action
            </h3>

            {nextApplication ? (
              <>
                <p>
                  Check the latest status
                  for{' '}
                  <b>
                    {
                      nextApplication.role
                    }
                  </b>{' '}
                  at{' '}
                  {
                    nextApplication.company
                  }.
                </p>

                <FeedButton
                  secondary
                  onClick={() => {
                    setSelectedApplication(
                      nextApplication.id,
                    );
                    setView(
                      'applications',
                    );
                  }}
                >
                  <BriefcaseBusiness
                    size={15}
                  />
                  Open application
                </FeedButton>
              </>
            ) : careerInboxEvents.length >
              0 ? (
              <>
                <p>
                  Review your newest Career
                  Inbox update and keep your
                  tracker current.
                </p>

                <FeedButton
                  secondary
                  onClick={() =>
                    setView('inbox')
                  }
                >
                  <Inbox size={15} />
                  Open inbox
                </FeedButton>
              </>
            ) : (
              <>
                <p>
                  Bring in an opportunity
                  and start your next Smart
                  Apply flow.
                </p>

                <FeedButton
                  secondary
                  onClick={() =>
                    setView('apply')
                  }
                >
                  <CheckCircle2
                    size={15}
                  />
                  Analyze a job
                </FeedButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
