import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

import { useCareerStore } from './store/useCareerStore';

type AnalyticsWindow = '30d' | '90d' | 'all';

function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title analytics-page-title">
      <div>
        <div className="section-kicker">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({
  label,
  value,
  trend,
  icon,
  tone,
}: {
  label: string;
  value: string;
  trend: string;
  icon: ReactNode;
  tone: 'blue' | 'orange' | 'yellow' | 'red';
}) {
  return (
    <div className={`analytics-stat analytics-stat-${tone}`}>
      <div className="analytics-stat-top">
        <span>{label}</span>
        <span className="analytics-stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{trend}</small>
    </div>
  );
}

function eventTime(value?: string | null) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function roleFamily(role?: string | null) {
  const value = String(role ?? '').trim().toLowerCase();

  if (value.includes('backend') || value.includes('back-end')) return 'Backend';
  if (value.includes('frontend') || value.includes('front-end')) return 'Frontend';
  if (
    value.includes('full stack') ||
    value.includes('full-stack') ||
    value.includes('fullstack')
  ) return 'Full stack';
  if (
    value.includes('data') ||
    value.includes('ml') ||
    value.includes('machine learning') ||
    value.includes('ai')
  ) return 'AI / Data';

  return 'Software engineering';
}

export default function Analytics() {
  const trackedApplications =
    useCareerStore((state) => state.trackedApplications) ?? [];
  const careerInboxEvents =
    useCareerStore((state) => state.careerInboxEvents) ?? [];

  const [windowKey, setWindowKey] = useState<AnalyticsWindow>('90d');

  const filteredApplications = useMemo(() => {
    const now = Date.now();
    const cutoff =
      windowKey === '30d'
        ? now - 30 * 86_400_000
        : windowKey === '90d'
          ? now - 90 * 86_400_000
          : 0;

    return trackedApplications.filter(
      (item) => eventTime(item.appliedAt) >= cutoff,
    );
  }, [trackedApplications, windowKey]);

  const total = filteredApplications.length;
  const responses = filteredApplications.filter((item) => {
    const status = String(item.status ?? '');
    return status !== 'Applied' && status !== 'Withdrawn' && status !== '';
  }).length;

  const interviews = filteredApplications.filter((item) => {
    const status = String(item.status ?? '');
    return status === 'Interview' || status === 'Offer';
  }).length;

  const offers = filteredApplications.filter(
    (item) => String(item.status ?? '') === 'Offer',
  ).length;

  const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const bestFit = total > 0
    ? Math.max(...filteredApplications.map((item) => Number(item.fit) || 0))
    : 0;

  const bestFitRole = filteredApplications
    .slice()
    .sort((a, b) => (Number(b.fit) || 0) - (Number(a.fit) || 0))[0]?.role ??
    'No application yet';

  const monthBuckets = useMemo(() => {
    const map = new Map<string, number>();

    filteredApplications.forEach((item) => {
      const date = new Date(item.appliedAt);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, count]) => {
        const [year, month] = key.split('-');
        return {
          key,
          count,
          label: new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
            'en-US',
            { month: 'short' },
          ),
        };
      });
  }, [filteredApplications]);

  const maxMonth = Math.max(1, ...monthBuckets.map((item) => item.count));

  const cumulativeBuckets = useMemo(() => {
    let running = 0;
    return monthBuckets.map((item) => {
      running += item.count;
      return { ...item, cumulative: running };
    });
  }, [monthBuckets]);

  const maxCumulative = Math.max(
    1,
    ...cumulativeBuckets.map((item) => item.cumulative),
  );

  const linePoints = cumulativeBuckets.map((item, index) => {
    const x = cumulativeBuckets.length <= 1
      ? 50
      : 8 + (index / (cumulativeBuckets.length - 1)) * 84;
    const y = 86 - (item.cumulative / maxCumulative) * 66;
    return { ...item, x, y };
  });

  const familyMap = new Map<string, { total: number; replies: number }>();
  filteredApplications.forEach((item) => {
    const family = roleFamily(item.role);
    const current = familyMap.get(family) ?? { total: 0, replies: 0 };
    current.total += 1;

    const status = String(item.status ?? '');
    if (status && status !== 'Applied' && status !== 'Withdrawn') {
      current.replies += 1;
    }
    familyMap.set(family, current);
  });

  const rolePatterns = [...familyMap.entries()]
    .map(([label, value]) => ({
      label,
      rate: value.total > 0
        ? Math.round((value.replies / value.total) * 100)
        : 0,
      total: value.total,
    }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total)
    .slice(0, 4);

  const strongestPattern = rolePatterns[0];

  const positiveSignals = careerInboxEvents.filter((event) =>
    ['Interview', 'Offer', 'Recruiter'].includes(String(event.type)),
  ).length;

  return (
    <div className="rc-page-enter analytics-refined">
      <PageHeader
        eyebrow="Patterns, not vanity metrics"
        title="Career analytics"
        subtitle="A compact view of how your applications are progressing and where momentum is building."
        action={
          <div className="analytics-window-tabs">
            {([
              ['30d', '30 days'],
              ['90d', '90 days'],
              ['all', 'All time'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                className={`analytics-window-button ${windowKey === key ? 'active' : ''}`}
                onClick={() => setWindowKey(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="analytics-stat-grid">
        <Stat
          label="Response rate"
          value={`${responseRate}%`}
          trend={total > 0 ? `${responses} of ${total} applications progressed` : 'No tracked applications yet'}
          icon={<TrendingUp size={17} />}
          tone="blue"
        />
        <Stat
          label="Interview conversion"
          value={`${interviewRate}%`}
          trend={total > 0 ? `${interviews} interview / offer outcomes` : 'Waiting for application data'}
          icon={<Target size={17} />}
          tone="orange"
        />
        <Stat
          label="Best fit score"
          value={`${bestFit}%`}
          trend={bestFitRole}
          icon={<Sparkles size={17} />}
          tone="yellow"
        />
        <Stat
          label="Offers"
          value={String(offers)}
          trend={total > 0 ? `From ${total} tracked applications` : 'No tracked applications yet'}
          icon={<BriefcaseBusiness size={17} />}
          tone="red"
        />
      </div>

      <div className="analytics-graph-grid">
        <section className="analytics-graph-card analytics-bar-card">
          <div className="analytics-card-head">
            <div>
              <span className="mini-label">APPLICATIONS BY MONTH</span>
              <h3>{total} application{total === 1 ? '' : 's'} in this period</h3>
            </div>
            <span className="analytics-card-icon blue"><TrendingUp size={17} /></span>
          </div>

          {monthBuckets.length > 0 ? (
            <div className="analytics-bars">
              {monthBuckets.map((item) => (
                <div className="analytics-bar-item" key={item.key}>
                  <span className="analytics-bar-value">{item.count}</span>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{ height: `${Math.max(18, (item.count / maxMonth) * 100)}%` }}
                    />
                  </div>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty-graph">Track an application to populate this chart.</div>
          )}
        </section>

        <section className="analytics-graph-card analytics-trend-card">
          <div className="analytics-card-head">
            <div>
              <span className="mini-label">APPLICATION TREND</span>
              <h3>Cumulative application momentum</h3>
            </div>
            <span className="analytics-card-icon orange"><Target size={17} /></span>
          </div>

          {linePoints.length > 1 ? (
            <div className="analytics-line-wrap">
              <svg
                className="analytics-line-chart"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                role="img"
                aria-label="Cumulative applications line chart"
              >
                <line x1="7" y1="86" x2="94" y2="86" className="analytics-axis" />
                <line x1="7" y1="54" x2="94" y2="54" className="analytics-gridline" />
                <line x1="7" y1="22" x2="94" y2="22" className="analytics-gridline" />
                <polyline
                  className="analytics-line"
                  points={linePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                />
                {linePoints.map((point) => (
                  <circle
                    key={point.key}
                    className="analytics-line-dot"
                    cx={point.x}
                    cy={point.y}
                    r="1.6"
                  />
                ))}
              </svg>
              <div className="analytics-line-labels">
                {linePoints.map((point) => (
                  <span key={point.key}>{point.label}</span>
                ))}
              </div>
              <div className="analytics-trend-summary">
                <strong>{linePoints[linePoints.length - 1]?.cumulative ?? 0}</strong>
                <span>cumulative applications</span>
              </div>
            </div>
          ) : linePoints.length === 1 ? (
            <div className="analytics-trend-placeholder">
              <div>
                <strong>{linePoints[0].cumulative}</strong>
                <span>application tracked in {linePoints[0].label}</span>
              </div>
              <p>A trend needs at least two time periods. Add applications in another month and this card will automatically become a line chart.</p>
            </div>
          ) : (
            <div className="analytics-empty-graph">Track an application to start building your trend.</div>
          )}
        </section>
      </div>

      <div className="analytics-insight-row">
        <div className="analytics-insight-icon"><Sparkles size={17} /></div>
        <div>
          <span className="mini-label">STRONGEST PATTERN</span>
          <h3>
            {strongestPattern
              ? `${strongestPattern.label} currently performs best at ${strongestPattern.rate}%.`
              : 'More application history will reveal your strongest role pattern.'}
          </h3>
          <p>
            {positiveSignals > 0
              ? `${positiveSignals} positive career signal${positiveSignals === 1 ? '' : 's'} are visible in Career Inbox.`
              : 'RoleClear will surface response and conversion patterns as your tracker grows.'}
          </p>
        </div>
        <ArrowUpRight size={17} />
      </div>
    </div>
  );
}
