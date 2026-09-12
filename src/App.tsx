import { useCareerStore } from './store/useCareerStore';

import {
  analyzeJob,
  createImportedJob,
  extractJobFromUrl,
  importedJobFromExtraction,
  parseResumeFile,
  validateJobDescription,
  validateJobUrl,
} from './lib/smartApply';

import { useEffect, useState, type ReactNode } from 'react';

import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Cloud,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  Mail,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Trash2,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react';

import type { AuthView, View } from './types/navigation';

/* =========================================================
   NAVIGATION
========================================================= */

const navItems: {
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'apply', label: 'Smart Apply', icon: Zap },
  { id: 'feed', label: 'Career Feed', icon: BookOpen },
  { id: 'applications', label: 'Applications', icon: BriefcaseBusiness },
  { id: 'resumes', label: 'Resume Studio', icon: FileText },
  { id: 'ats-check', label: 'ATS Checker', icon: ShieldCheck },
  { id: 'inbox', label: 'Career Inbox', icon: Inbox },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/* =========================================================
   SHARED UI
========================================================= */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-mark">
        <span />
      </span>

      <span>ROLECLEAR</span>
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

function Button({
  children,
  variant = 'primary',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

function PageTitle({
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
    <div className="page-title">
      <div>
        <div className="section-kicker">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function BackLink({
  onClick,
  label = 'Back',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button className="back-link" onClick={onClick}>
      <ArrowLeft size={15} />
      {label}
    </button>
  );
}

/* =========================================================
   LANDING
========================================================= */

function Landing({
  onAuth,
}: {
  onAuth: (view: AuthView) => void;
}) {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Logo />

        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
        </div>

        <div className="nav-actions">
          <Button variant="ghost" onClick={() => onAuth('signin')}>
            Sign in
          </Button>

          <Button onClick={() => onAuth('signup')}>
            Get started
            <ArrowUpRight size={16} />
          </Button>
        </div>

        <button className="mobile-menu">
          <Menu size={22} />
        </button>
      </header>

      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Your personal career operating system
            </div>

            <h1>
              Stop guessing.
              <br />
              <em>Start applying</em> smarter.
            </h1>

            <p className="hero-sub">
              From confusion to confidence. One application at a time.
            </p>

            <p className="hero-description">
              Find opportunities anywhere. Bring them to RoleClear. Understand
              where you stand, improve your edge, and keep moving forward.
            </p>

            <div className="hero-actions">
              <Button onClick={() => onAuth('signup')}>
                Build your career system
                <ArrowUpRight size={17} />
              </Button>

              <button
                className="text-link"
                onClick={() =>
                  document.getElementById('how')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
              >
                See how it works
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="trust-line">
              <div className="avatar-stack">
                <i>AK</i>
                <i>RS</i>
                <i>NM</i>
              </div>

              <span>Built for the next 10,000 careers</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />

            <div className="hero-card main-flow">
              <div className="flow-head">
                <span className="mini-label">YOUR NEXT MOVE</span>

                <span className="live-pill">
                  <span />
                  Live
                </span>
              </div>

              <h3>Smart Apply</h3>

              <p>Turn any opportunity into a clear, confident next step.</p>

              <div className="flow-list">
                <FlowItem number="01" label="Opportunity found" done />
                <FlowItem number="02" label="Resume matched" active />
                <FlowItem number="03" label="Ready to apply" />
              </div>

              <div className="flow-footer">
                <span>Current match</span>
                <strong>82%</strong>
              </div>

              <div className="flow-progress">
                <span />
              </div>
            </div>

            <div className="floating-card fit-card">
              <div className="fit-ring">
                <strong>82</strong>
                <small>%</small>
              </div>

              <div>
                <b>Resume fit</b>
                <span>Strong match</span>
              </div>
            </div>

            <div className="floating-card mission-card">
              <span className="mission-icon">
                <Target size={15} />
              </span>

              <div>
                <span>Today's mission</span>
                <b>Tailor your Stripe resume</b>
              </div>

              <Check size={17} className="mission-check" />
            </div>
          </div>
        </section>

        <section className="proof-strip">
          <div className="wrap proof-inner">
            <span>ONE CLEAR LOOP</span>

            <div className="proof-flow">
              <b>Find</b>
              <i>→</i>
              <b>Understand</b>
              <i>→</i>
              <b>Match</b>
              <i>→</i>
              <b>Improve</b>
              <i>→</i>
              <b>Apply</b>
              <i>→</i>
              <b>Learn</b>
            </div>
          </div>
        </section>

        <section id="how" className="section wrap how-section">
          <div className="section-kicker">A calmer way forward</div>

          <div className="section-heading">
            <h2>
              Your career deserves
              <br />
              <em>a system, not more noise.</em>
            </h2>

            <p>
              RoleClear is where scattered opportunities become a focused plan.
              You bring the opportunity. We help you understand what to do next.
            </p>
          </div>

          <div className="feature-grid">
            <Feature
              number="01"
              icon={<Link2 />}
              title="Bring your opportunities"
              text="Paste a link, a description, or upload a job you found anywhere. RoleClear never posts or owns job listings."
            />

            <Feature
              number="02"
              icon={<Sparkles />}
              title="Know where you stand"
              text="See your resume fit, skill gaps, and ghost risk before investing your time. Every score comes with context."
            />

            <Feature
              number="03"
              icon={<Flame />}
              title="Move with intention"
              text="Tailor truthfully, apply on the original site, and track what happens next. Every application teaches you something."
            />
          </div>
        </section>

        <section id="features" className="dark-section">
          <div className="wrap product-section">
            <div className="section-kicker light-kicker">
              The command center
            </div>

            <div className="section-heading light-heading">
              <h2>
                One place for
                <br />
                <em>your next yes.</em>
              </h2>

              <p>
                Less tab switching. More forward motion. Your complete
                application journey, designed around one question: what should I
                do next?
              </p>
            </div>

            <div className="product-grid">
              <div className="product-panel panel-large">
                <div className="panel-label">
                  SMART APPLY
                  <ArrowUpRight size={15} />
                </div>

                <h3>
                  From “maybe”
                  <br />
                  to “ready”.
                </h3>

                <p>
                  Understand every opportunity before you spend an hour
                  tailoring for it.
                </p>

                <div className="score-preview">
                  <div>
                    <span>RESUME FIT</span>
                    <strong>82%</strong>
                  </div>

                  <div>
                    <span>GHOST RISK</span>
                    <b>Low risk</b>
                  </div>
                </div>
              </div>

              <div className="product-panel panel-track">
                <div className="panel-label">
                  APPLICATIONS
                  <ArrowUpRight size={15} />
                </div>

                <h3>
                  Keep the
                  <br />
                  story moving.
                </h3>

                <div className="mini-kanban">
                  <span>
                    Applied <b>08</b>
                  </span>
                  <span>
                    Interview <b>02</b>
                  </span>
                  <span>
                    Offer <b>01</b>
                  </span>
                </div>
              </div>

              <div className="product-panel panel-resume">
                <div className="panel-label">
                  RESUME INTELLIGENCE
                  <ArrowUpRight size={15} />
                </div>

                <h3>
                  Make your
                  <br />
                  edge visible.
                </h3>

                <div className="resume-bars">
                  <span style={{ width: '88%' }} />
                  <span style={{ width: '71%' }} />
                  <span style={{ width: '63%' }} />
                </div>

                <small>
                  Health score <b>88 / 100</b>
                </small>
              </div>

              <div className="product-panel panel-inbox">
                <div className="panel-label">
                  CAREER INBOX
                  <ArrowUpRight size={15} />
                </div>

                <h3>
                  Never miss
                  <br />
                  the signal.
                </h3>

                <div className="mail-preview">
                  <span className="mail-avatar">S</span>

                  <div>
                    <b>Interview update</b>
                    <small>Stripe · 12 min ago</small>
                  </div>

                  <span className="unread-dot" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="privacy" className="privacy-section wrap">
          <div className="privacy-icon">
            <LockKeyhole size={24} />
          </div>

          <div>
            <div className="section-kicker">Your data. Your rules.</div>

            <h2>
              Private by default.
              <br />
              <em>Always in your control.</em>
            </h2>

            <p>
              Your resume and application history belong to you. We never apply
              to jobs automatically, and external applications always happen on
              the original website.
            </p>
          </div>

          <Button variant="secondary" onClick={() => onAuth('signup')}>
            Start with confidence
            <ArrowUpRight size={16} />
          </Button>
        </section>

        <section className="final-cta">
          <div className="wrap">
            <div className="section-kicker">
              Your next chapter starts here
            </div>

            <h2>
              Make every application
              <br />
              <em>count.</em>
            </h2>

            <Button variant="dark" onClick={() => onAuth('signup')}>
              Get started free
              <ArrowUpRight size={17} />
            </Button>

            <p>No job listings. No noise. Just a clearer path forward.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer wrap">
        <Logo />

        <span>
          © {new Date().getFullYear()} RoleClear. A clearer path forward.
        </span>

        <div>
          <a href="#privacy">Privacy</a>
          <a href="#how">About</a>
          <a href="#features">Features</a>
        </div>
      </footer>
    </div>
  );
}

function FlowItem({
  number,
  label,
  done,
  active,
}: {
  number: string;
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className={`flow-item ${active ? 'active' : ''}`}>
      <span className="flow-number">
        {done ? <Check size={12} /> : number}
      </span>

      <span>{label}</span>

      {active && <small>Now</small>}
    </div>
  );
}

function Feature({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="feature-card">
      <div className="feature-top">
        <span>{number}</span>
        <div className="feature-icon">{icon}</div>
      </div>

      <h3>{title}</h3>
      <p>{text}</p>

      <ArrowUpRight className="feature-arrow" size={19} />
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function Auth({
  mode,
  onAuth,
  onEnter,
}: {
  mode: 'signin' | 'signup' | 'otp';
  onAuth: (view: AuthView) => void;
  onEnter: () => void;
}) {
  const [otp, setOtp] = useState('');
  const [sentTo, setSentTo] = useState('aarya@example.com');

  const signIn = mode === 'signin';
  const otpMode = mode === 'otp';

  if (otpMode) {
    return (
      <div className="auth-page">
        <div className="auth-side">
          <Logo light />

          <div className="auth-quote">
            <span>“</span>

            <h2>
              One small step
              <br />
              <em>forward.</em>
            </h2>

            <p>Verify once. Then build your career system.</p>

            <div className="auth-line" />
          </div>

          <div className="auth-side-footer">
            PRIVATE <i>→</i> SIMPLE <i>→</i> YOURS
          </div>
        </div>

        <div className="auth-main">
          <button className="auth-back" onClick={() => onAuth('signup')}>
            ← Back
          </button>

          <div className="auth-form-wrap">
            <div className="auth-mobile-logo">
              <Logo />
            </div>

            <div className="section-kicker">Email verification</div>

            <h1>Check your inbox.</h1>

            <p className="auth-intro">
              We sent a 6-digit code to <b>{sentTo}</b>.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();

                if (otp.length === 6) {
                  onEnter();
                }
              }}
            >
              <label>
                Verification code

                <input
                  className="otp-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ''))
                  }
                  placeholder="000000"
                  autoFocus
                />
              </label>

              <Button
                type="submit"
                className="full-button"
                disabled={otp.length !== 6}
              >
                Verify email
                <CheckCircle2 size={17} />
              </Button>
            </form>

            <div className="otp-meta">
              <button onClick={() => setOtp('')}>Resend code</button>
              <span>Code expires in 10 minutes</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <Logo light />

        <div className="auth-quote">
          <span>“</span>

          <h2>
            A clearer path
            <br />
            <em>forward.</em>
          </h2>

          <p>RoleClear helps you turn every application into momentum.</p>

          <div className="auth-line" />
        </div>

        <div className="auth-side-footer">
          FIND <i>→</i> UNDERSTAND <i>→</i> MATCH <i>→</i> GROW
        </div>
      </div>

      <div className="auth-main">
        <button className="auth-back" onClick={() => onAuth('landing')}>
          ← Back to home
        </button>

        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <Logo />
          </div>

          <div className="section-kicker">
            {signIn ? 'Welcome back' : 'Start your journey'}
          </div>

          <h1>
            {signIn ? 'Good to see you.' : 'Welcome to RoleClear.'}
          </h1>

          <p className="auth-intro">
            {signIn
              ? 'Your next move is waiting.'
              : 'Build a career system that moves with you.'}
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              if (signIn) {
                onEnter();
                return;
              }

              const emailElement =
                event.currentTarget.elements.namedItem(
                  'email',
                ) as HTMLInputElement | null;

              setSentTo(emailElement?.value || 'your email');
              onAuth('otp');
            }}
          >
            {!signIn && (
              <label>
                Full name
                <input name="name" placeholder="Your name" required />
              </label>
            )}

            {!signIn && (
              <label>
                Mobile number
                <input
                  name="mobile"
                  inputMode="tel"
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder={signIn ? 'Your password' : 'Create a password'}
                required
              />
            </label>

            {signIn && (
              <div className="forgot">
                <a href="#forgot">Forgot password?</a>
              </div>
            )}

            <Button type="submit" className="full-button">
              {signIn ? 'Sign in' : 'Create your account'}
              <ArrowUpRight size={17} />
            </Button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <Button
            variant="secondary"
            className="full-button google-button"
            onClick={onEnter}
          >
            <span className="google-g">G</span>
            Continue with Google
          </Button>

          <p className="auth-switch">
            {signIn ? 'New to RoleClear?' : 'Already have an account?'}{' '}
            <button
              onClick={() => onAuth(signIn ? 'signup' : 'signin')}
            >
              {signIn ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APP SHELL
========================================================= */

function AppShell({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const careerInboxEvents =
    useCareerStore(
      (state) =>
        state.careerInboxEvents,
    );

  const unreadInboxCount =
    careerInboxEvents.filter(
      (event) => !event.read,
    ).length;

  const go = (next: View) => {
    setView(next);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo />

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace">
          <span>MY WORKSPACE</span>

          <button className="workspace-button">
            <span className="workspace-avatar">A</span>
            <b>Aarya's space</b>
            <ChevronRight size={15} />
          </button>
        </div>

        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${view === id ? 'active' : ''} ${
                id === 'apply' ? 'apply-nav' : ''
              }`}
              onClick={() => go(id)}
            >
              <Icon size={18} />

              <span>{label}</span>

              {id === 'inbox' &&
                unreadInboxCount > 0 && (
                  <i className="nav-count">
                    {unreadInboxCount > 99
                      ? '99+'
                      : unreadInboxCount}
                  </i>
                )}

              {id === 'apply' && (
                <span className="nav-new">NEW</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="tip-card">
            <Sparkles size={16} />

            <span>
              <b>Small steps compound.</b> You're on a 4-day streak.
            </span>
          </div>

          <button className="profile-button" onClick={() => go('profile')}>
            <span className="profile-avatar">AK</span>

            <span>
              <b>Aarya Rai</b>
              <small>Personal account</small>
            </span>

            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="app-header">
          <button
            className="open-sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft size={20} />
          </button>

          <div className="header-actions header-actions-right">
            <button className="icon-button" title="Help">
              <CircleHelp size={19} />
            </button>

            <button
              className="icon-button notification"
              title="Notifications"
              onClick={() => go('notifications')}
            >
              <Bell size={19} />
              <i />
            </button>

            <button className="header-avatar" onClick={() => go('profile')}>
              AR
            </button>
          </div>
        </header>

        <main className="app-content">
          {view === 'dashboard' && <Dashboard setView={go} />}
          {view === 'apply' && <SmartApply setView={go} />}
          {view === 'analysis' && <JobAnalysis setView={go} />}
          {view === 'resume-match' && <ResumeMatch setView={go} />}
          {view === 'resume-tailor' && <ResumeTailor setView={go} />}
          {view === 'external-apply' && <ExternalApply setView={go} />}
          {view === 'applications' && <Applications setView={go} />}
          {view === 'application-detail' && (
            <ApplicationDetail setView={go} />
          )}
          {view === 'resumes' && <Resumes setView={go} />}
          {view === 'ats-check' && <ATSChecker setView={go} />}
          {view === 'resume-detail' && <ResumeDetail setView={go} />}
          {view === 'inbox' && <InboxView setView={go} />}
          {view === 'email-connect' && <EmailConnect setView={go} />}
          {view === 'analytics' && <Analytics />}
          {view === 'feed' && <Feed setView={go} />}
          {view === 'settings' && <SettingsView onLogout={onLogout} />}
          {view === 'notifications' && <Notifications setView={go} />}
          {view === 'profile' && <Profile setView={go} />}
          {view === 'security' && <Security setView={go} />}
        </main>

        <MobileNav view={view} setView={go} />
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const [selectedDashboardMetric, setSelectedDashboardMetric] =
    useState<'applications' | 'responses' | 'interviews' | 'offers' | null>(
      null,
    );
  const trackedApplications = useCareerStore(
    (state) => state.trackedApplications,
  );

  const careerInboxEvents = useCareerStore(
    (state) => state.careerInboxEvents,
  );

  const currentResume = useCareerStore(
    (state) => state.currentResume,
  );

  const setSelectedApplication = useCareerStore(
    (state) => state.setSelectedApplication,
  );

  const normalizeDashboardText = (value?: string | null) =>
    String(value ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const gmailApplicationConfirmationSignals = [
    'thank you for applying',
    'application received',
    'application submitted',
    'application successfully submitted',
    'received your application',
    'we received your application',
    'application confirmation',
    'thanks for applying',
  ];

  const gmailBlockedApplicationSources = [
    'parallels',
    'unstop',
    'internshala',
    'propeers',
    'naukri',
    'indeed',
    'linkedin jobs',
    'foundit',
    'monster',
    'cutshort',
    'hirist',
    'wellfound',
    'glassdoor',
    'freshersworld',
    'apna',
    'shine',
    'jobhai',
    'timesjobs',
    'careerjet',
    'simplyhired',
    'placementindia',
    'prosple',
  ];

  const gmailDetectedApplicationEvents = careerInboxEvents.filter(
    (event) => {
      const searchable = normalizeDashboardText(
        [
          event.subject,
          event.title,
          event.sender,
          event.company,
          event.snippet,
        ]
          .filter(Boolean)
          .join(' '),
      );

      const blocked = gmailBlockedApplicationSources.some((source) =>
        searchable.includes(source),
      );

      if (blocked) return false;

      return gmailApplicationConfirmationSignals.some((signal) =>
        searchable.includes(signal),
      );
    },
  );

  const trackedApplicationKeys = new Set(
    trackedApplications.map((application) =>
      [
        normalizeDashboardText(application.company),
        normalizeDashboardText(application.role),
      ].join('|'),
    ),
  );

  const gmailDetectedApplicationKeys = new Set<string>();

  for (const event of gmailDetectedApplicationEvents) {
    const company = normalizeDashboardText(event.company);
    const role = normalizeDashboardText(
      (event as { role?: string }).role,
    );

    /*
     * Prefer company+role for dedupe when both are available.
     * Otherwise use sender + normalized subject so repeated renders
     * do not inflate the dashboard count.
     */
    const fallbackSubject = normalizeDashboardText(
      event.subject || event.title,
    );
    const fallbackSender = normalizeDashboardText(event.sender);

    const key =
      company && role
        ? `${company}|${role}`
        : `${fallbackSender}|${fallbackSubject}`;

    if (!key || key === '|') continue;

    if (company && role && trackedApplicationKeys.has(key)) {
      continue;
    }

    gmailDetectedApplicationKeys.add(key);
  }

  const gmailDetectedApplicationCount =
    gmailDetectedApplicationKeys.size;

  const totalApplicationCount =
    trackedApplications.length +
    gmailDetectedApplicationCount;

  const dashboardEventSearchText = (
    event: (typeof careerInboxEvents)[number],
  ) =>
    normalizeDashboardText(
      [
        event.subject,
        event.title,
        event.sender,
        event.company,
        event.snippet,
      ]
        .filter(Boolean)
        .join(' '),
    );

  const isBlockedDashboardEvent = (
    event: (typeof careerInboxEvents)[number],
  ) => {
    const searchable =
      dashboardEventSearchText(event);

    return gmailBlockedApplicationSources.some((source) =>
      searchable.includes(source),
    );
  };

  const gmailResponseSignals = [
    'assessment',
    'coding challenge',
    'online assessment',
    'online test',
    'interview',
    'next round',
    'next step',
    'moving forward',
    'shortlisted',
    'recruiter',
    'offer',
    'rejected',
    'rejection',
    'not moving forward',
    'application status',
    'status update',
  ];

  const gmailInterviewSignals = [
    'interview invitation',
    'interview invite',
    'schedule your interview',
    'schedule an interview',
    'interview scheduled',
    'interview',
  ];

  const gmailOfferSignals = [
    'offer letter',
    'employment offer',
    'job offer',
    'offer of employment',
    'pleased to offer',
    'delighted to offer',
    'congratulations on your offer',
  ];

  const makeDashboardEventKey = (
    event: (typeof careerInboxEvents)[number],
    kind: 'response' | 'interview' | 'offer',
  ) => {
    const company =
      normalizeDashboardText(event.company);

    const role =
      normalizeDashboardText(
        (event as { role?: string }).role,
      );

    if (company && role) {
      return `${kind}|${company}|${role}`;
    }

    /*
     * For events where structured company/role extraction is unavailable,
     * use sender + normalized subject. This prevents duplicate copies of
     * the same Gmail event from inflating a metric.
     */
    return [
      kind,
      normalizeDashboardText(event.sender),
      normalizeDashboardText(
        event.subject || event.title,
      ),
    ].join('|');
  };

  const gmailMetricKeys = (
    kind: 'response' | 'interview' | 'offer',
    signals: string[],
  ) => {
    const keys = new Set<string>();

    for (const event of careerInboxEvents) {
      if (isBlockedDashboardEvent(event)) {
        continue;
      }

      const searchable =
        dashboardEventSearchText(event);

      const type =
        normalizeDashboardText(
          String(event.type ?? ''),
        );

      const typeMatches =
        kind === 'response'
          ? [
              'assessment',
              'interview',
              'offer',
              'rejection',
              'status',
            ].includes(type)
          : kind === 'interview'
            ? type === 'interview'
            : type === 'offer';

      const textMatches =
        signals.some((signal) =>
          searchable.includes(signal),
        );

      if (!typeMatches && !textMatches) {
        continue;
      }

      const key =
        makeDashboardEventKey(
          event,
          kind,
        );

      if (
        key &&
        !key.endsWith('||')
      ) {
        keys.add(key);
      }
    }

    return keys;
  };

  const trackedResponseApplications =
    trackedApplications.filter(
      (application) =>
        ![
          'Applied',
          'Withdrawn',
        ].includes(
          application.status,
        ),
    );

  const trackedInterviewApplications =
    trackedApplications.filter(
      (application) =>
        application.status ===
        'Interview',
    );

  const trackedOfferApplications =
    trackedApplications.filter(
      (application) =>
        application.status ===
        'Offer',
    );

  const trackedMetricKeys = (
    applications: typeof trackedApplications,
    kind: 'response' | 'interview' | 'offer',
  ) =>
    new Set(
      applications.map(
        (application) =>
          `${kind}|${normalizeDashboardText(
            application.company,
          )}|${normalizeDashboardText(
            application.role,
          )}`,
      ),
    );

  const uniqueGmailMetricCount = (
    gmailKeys: Set<string>,
    trackedKeys: Set<string>,
  ) =>
    [...gmailKeys].filter(
      (key) => !trackedKeys.has(key),
    ).length;

  const gmailResponseKeys =
    gmailMetricKeys(
      'response',
      gmailResponseSignals,
    );

  const gmailInterviewKeys =
    gmailMetricKeys(
      'interview',
      gmailInterviewSignals,
    );

  const gmailOfferKeys =
    gmailMetricKeys(
      'offer',
      gmailOfferSignals,
    );

  const gmailMetricEvents = (
    kind: 'applications' | 'responses' | 'interviews' | 'offers',
  ) =>
    careerInboxEvents
      .filter((event) => {
        if (isBlockedDashboardEvent(event)) {
          return false;
        }

        const searchable = dashboardEventSearchText(event);
        const type = normalizeDashboardText(
          String(event.type ?? ''),
        );

        if (kind === 'applications') {
          return gmailApplicationConfirmationSignals.some((signal) =>
            searchable.includes(signal),
          );
        }

        if (kind === 'responses') {
          return (
            ['assessment', 'interview', 'offer', 'rejection', 'status'].includes(type) ||
            gmailResponseSignals.some((signal) =>
              searchable.includes(signal),
            )
          );
        }

        if (kind === 'interviews') {
          return (
            type === 'interview' ||
            gmailInterviewSignals.some((signal) =>
              searchable.includes(signal),
            )
          );
        }

        return (
          type === 'offer' ||
          gmailOfferSignals.some((signal) =>
            searchable.includes(signal),
          )
        );
      })
      .sort(
        (a, b) =>
          new Date(b.receivedAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.receivedAt ?? a.createdAt ?? 0).getTime(),
      );

  const gmailResponseCount =
    uniqueGmailMetricCount(
      gmailResponseKeys,
      trackedMetricKeys(
        trackedResponseApplications,
        'response',
      ),
    );

  const gmailInterviewCount =
    uniqueGmailMetricCount(
      gmailInterviewKeys,
      trackedMetricKeys(
        trackedInterviewApplications,
        'interview',
      ),
    );

  const gmailOfferCount =
    uniqueGmailMetricCount(
      gmailOfferKeys,
      trackedMetricKeys(
        trackedOfferApplications,
        'offer',
      ),
    );

  const responseCount =
    trackedResponseApplications.length +
    gmailResponseCount;

  const interviewCount =
    trackedInterviewApplications.length +
    gmailInterviewCount;

  const offerCount =
    trackedOfferApplications.length +
    gmailOfferCount;

  const responseRate =
    totalApplicationCount > 0
      ? Math.min(
          100,
          Math.round(
            (responseCount /
              totalApplicationCount) *
              100,
          ),
        )
      : 0;

  const recentApplications = [...trackedApplications]
    .sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() -
        new Date(a.appliedAt).getTime(),
    )
    .slice(0, 5);

  const dashboardBlockedCareerSources = [
    'parallels',
    'unstop',
    'internshala',
    'propeers',
    'naukri',
    'indeed',
    'linkedin jobs',
    'foundit',
    'monster',
    'cutshort',
    'hirist',
    'wellfound',
    'glassdoor',
    'freshersworld',
    'apna',
    'shine',
    'jobhai',
    'timesjobs',
    'careerjet',
    'simplyhired',
    'placementindia',
    'prosple',
  ];

  const dashboardCareerSignals = [
    'thank you for applying',
    'application received',
    'application submitted',
    'application confirmation',
    'received your application',
    'assessment',
    'coding challenge',
    'online test',
    'interview',
    'next round',
    'next step',
    'recruiter',
    'offer',
    'rejected',
    'rejection',
    'not moving forward',
    'application status',
  ];

  const isValidatedDashboardCareerEvent = (
    event: (typeof careerInboxEvents)[number],
  ) => {
    const searchable = [
      event.subject,
      event.title,
      event.sender,
      event.company,
      event.snippet,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const hasBlockedSource =
      dashboardBlockedCareerSources.some((source) =>
        searchable.includes(source),
      );

    const hasStrongCareerSignal =
      dashboardCareerSignals.some((signal) =>
        searchable.includes(signal),
      );

    const recognizedEventType = [
      'application',
      'assessment',
      'interview',
      'offer',
      'rejection',
      'status',
    ].includes(
      String(event.type ?? '').toLowerCase(),
    );

    // Old localStorage events may pre-date the backend Gmail filter.
    // Never surface known promotional/platform sources on the Dashboard.
    if (hasBlockedSource) {
      return false;
    }

    return hasStrongCareerSignal || recognizedEventType;
  };

  const recentInboxEvents = [...careerInboxEvents]
    .filter(isValidatedDashboardCareerEvent)
    .sort(
      (a, b) =>
        new Date(b.receivedAt ?? b.createdAt ?? 0).getTime() -
        new Date(a.receivedAt ?? a.createdAt ?? 0).getTime(),
    )
    .slice(0, 3);

  const ats = calculateAtsReadiness(currentResume);

  const resumeHealthLabel =
    !currentResume
      ? 'No resume loaded'
      : ats.score >= 90
        ? 'Excellent readiness'
        : ats.score >= 80
          ? 'Strong foundation'
          : ats.score >= 70
            ? 'Good foundation'
            : 'Needs refinement';

  const missionApplication =
    trackedApplications
      .filter((application) =>
        ['Applied', 'Screening'].includes(application.status),
      )
      .sort(
        (a, b) =>
          new Date(a.appliedAt).getTime() -
          new Date(b.appliedAt).getTime(),
      )[0] ?? null;

  const openApplication = (applicationId: string) => {
    setSelectedApplication(applicationId);
    setView('application-detail');
  };

  return (
    <>
      <PageTitle
        eyebrow={new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date())}
        title="Good to see you."
        subtitle="Here’s what needs your attention across your applications."
        action={
          <Button onClick={() => setView('apply')}>
            <Zap size={17} />
            Smart Apply
          </Button>
        }
      />

      <section className="mission-banner">
        <div className="mission-copy">
          <div className="mission-mark">
            <Target size={20} />
          </div>

          <div>
            <span className="mini-label">TODAY'S MISSION</span>
            <h2>
              {missionApplication
                ? `Review your ${missionApplication.company} application.`
                : 'Add your next opportunity.'}
            </h2>
            <p>
              {missionApplication
                ? `${missionApplication.role} is currently marked ${missionApplication.status}. Check for an update or add one if something changed.`
                : 'Bring a real opportunity into Smart Apply, understand your fit, and track it from one place.'}
            </p>
          </div>
        </div>

        <Button
          variant="dark"
          onClick={() =>
            missionApplication
              ? openApplication(missionApplication.id)
              : setView('apply')
          }
        >
          {missionApplication ? 'Open application' : 'Start Smart Apply'}
          <ArrowUpRight size={16} />
        </Button>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="section-row">
            <h2>Application snapshot</h2>
            <button
              className="view-link"
              onClick={() => setView('applications')}
            >
              View tracker
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="stats-grid">
            <Stat
              label="Applications"
              onClick={() =>
                setSelectedDashboardMetric(
                  selectedDashboardMetric === 'applications'
                    ? null
                    : 'applications',
                )
              }
              value={String(totalApplicationCount).padStart(2, '0')}
              trend={
                totalApplicationCount > 0
                  ? gmailDetectedApplicationCount > 0
                    ? `${trackedApplications.length} tracked · ${gmailDetectedApplicationCount} detected from Gmail`
                    : 'Tracked in RoleClear'
                  : 'No applications yet'
              }
              icon={<BriefcaseBusiness />}
            />

            <Stat
              label="Responses"
              onClick={() =>
                setSelectedDashboardMetric(
                  selectedDashboardMetric === 'responses'
                    ? null
                    : 'responses',
                )
              }
              value={String(responseCount).padStart(2, '0')}
              trend={
                responseCount > 0
                  ? gmailResponseCount > 0
                    ? `${responseRate}% rate · ${gmailResponseCount} from Gmail`
                    : `${responseRate}% response rate`
                  : 'No responses yet'
              }
              icon={<Inbox />}
            />

            <Stat
              label="Interviews"
              onClick={() =>
                setSelectedDashboardMetric(
                  selectedDashboardMetric === 'interviews'
                    ? null
                    : 'interviews',
                )
              }
              value={String(interviewCount).padStart(2, '0')}
              trend={
                interviewCount > 0
                  ? gmailInterviewCount > 0
                    ? `${gmailInterviewCount} detected from Gmail`
                    : 'Active interview stage'
                  : 'No interviews yet'
              }
              icon={<Clock3 />}
            />

            <Stat
              label="Offers"
              onClick={() =>
                setSelectedDashboardMetric(
                  selectedDashboardMetric === 'offers'
                    ? null
                    : 'offers',
                )
              }
              value={String(offerCount).padStart(2, '0')}
              trend={
                offerCount > 0
                  ? gmailOfferCount > 0
                    ? `${gmailOfferCount} detected from Gmail`
                    : 'Offer stage reached'
                  : 'Keep building momentum'
              }
              icon={<Flame />}
            />
          </div>

          {selectedDashboardMetric && (
            <div
              className="detail-card dashboard-metric-drilldown"
              style={{
                marginTop: '18px',
                padding: '20px',
              }}
            >
              <div className="section-row" style={{ marginBottom: '14px' }}>
                <div>
                  <span className="mini-label">
                    {selectedDashboardMetric.toUpperCase()}
                  </span>
                  <h3 style={{ margin: '5px 0 0' }}>
                    {selectedDashboardMetric === 'applications'
                      ? `${totalApplicationCount} applications detected`
                      : selectedDashboardMetric === 'responses'
                        ? `${responseCount} responses detected`
                        : selectedDashboardMetric === 'interviews'
                          ? `${interviewCount} interviews detected`
                          : `${offerCount} offers detected`}
                  </h3>
                </div>

                <button
                  className="view-link"
                  onClick={() =>
                    setSelectedDashboardMetric(null)
                  }
                >
                  Close
                </button>
              </div>

              {selectedDashboardMetric === 'applications' &&
                trackedApplications.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <b style={{ display: 'block', marginBottom: '8px' }}>
                      Tracked in RoleClear
                    </b>

                    {trackedApplications.slice(0, 5).map((application) => (
                      <button
                        key={application.id}
                        type="button"
                        onClick={() => openApplication(application.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 0',
                          background: 'transparent',
                          border: 0,
                          borderBottom: '1px solid rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                        }}
                      >
                        <b>{application.company}</b>
                        <div style={{ opacity: 0.7, marginTop: '3px' }}>
                          {application.role} · {application.status}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

              {gmailMetricEvents(selectedDashboardMetric).length > 0 ? (
                <div>
                  <b style={{ display: 'block', marginBottom: '8px' }}>
                    Detected from Gmail
                  </b>

                  {gmailMetricEvents(selectedDashboardMetric)
                    .slice(0, 8)
                    .map((event) => (
                      <div
                        key={event.id}
                        style={{
                          padding: '11px 0',
                          borderBottom: '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <b>
                          {event.subject ||
                            event.title ||
                            'Career update'}
                        </b>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '14px',
                            marginTop: '4px',
                            fontSize: '0.82rem',
                            opacity: 0.65,
                          }}
                        >
                          <span>
                            {event.company ||
                              event.sender ||
                              'Gmail'}
                          </span>

                          <span>
                            {event.receivedAt
                              ? new Date(
                                  event.receivedAt,
                                ).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                selectedDashboardMetric !== 'applications' && (
                  <p style={{ margin: 0, opacity: 0.65 }}>
                    No matching Gmail signals were found.
                  </p>
                )
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '16px',
                  flexWrap: 'wrap',
                }}
              >
                {selectedDashboardMetric === 'applications' &&
                  trackedApplications.length > 0 && (
                    <Button
                      variant="secondary"
                      onClick={() => setView('applications')}
                    >
                      Open tracker
                      <ArrowUpRight size={15} />
                    </Button>
                  )}

                <Button
                  variant="secondary"
                  onClick={() => setView('inbox')}
                >
                  Open Career Inbox
                  <ArrowUpRight size={15} />
                </Button>
              </div>
            </div>
          )}

          <div className="section-row recent-row">
            <h2>Recent applications</h2>
            <button
              className="view-link"
              onClick={() => setView('applications')}
            >
              See all
              <ArrowUpRight size={15} />
            </button>
          </div>

          {recentApplications.length > 0 ? (
            <div className="application-table">
              <div className="table-head">
                <span>COMPANY & ROLE</span>
                <span>STATUS</span>
                <span>APPLIED</span>
                <span>FIT</span>
              </div>

              {recentApplications.map((application) => (
                <ApplicationRow
                  key={application.id}
                  company={application.company}
                  role={application.role}
                  date={application.date}
                  status={application.status}
                  fit={application.fit}
                />
              ))}
            </div>
          ) : (
            <div
              className="detail-card"
              style={{ padding: '28px 22px' }}
            >
              <b>No applications tracked yet</b>
              <p>
                Applications you add through Smart Apply will appear here
                automatically.
              </p>
              <Button
                variant="secondary"
                onClick={() => setView('apply')}
              >
                Analyze a job
                <ArrowUpRight size={15} />
              </Button>
            </div>
          )}

          <div className="updates-card dashboard-updates-main">
            <div className="aside-head">
              <div>
                <span className="mini-label">CAREER UPDATES</span>
                <h3>Recent signals</h3>
              </div>

              <button
                className="view-link"
                onClick={() => setView('inbox')}
              >
                View all
              </button>
            </div>

            {recentInboxEvents.length > 0 ? (
              recentInboxEvents.map((event) => (
                <Update
                  key={event.id}
                  icon={
                    event.type === 'interview' ? (
                      <Clock3 />
                    ) : event.type === 'offer' ? (
                      <Flame />
                    ) : event.type === 'rejection' ? (
                      <Bell />
                    ) : (
                      <BriefcaseBusiness />
                    )
                  }
                  title={event.subject || event.title || 'Career update'}
                  text={
                    event.sender ||
                    event.company ||
                    event.snippet ||
                    'Gmail update'
                  }
                  time={
                    event.receivedAt
                      ? new Date(event.receivedAt).toLocaleDateString()
                      : 'Recent'
                  }
                />
              ))
            ) : (
              <p
                style={{
                  fontSize: '0.86rem',
                  opacity: 0.65,
                  margin: 0,
                }}
              >
                No career updates yet. Gmail signals will appear here after
                sync.
              </p>
            )}
          </div>


        </div>

        <aside className="dashboard-aside">
          <div className="resume-health">
            <div className="aside-head">
              <div>
                <span className="mini-label">RESUME HEALTH</span>
                <h3>{resumeHealthLabel}</h3>
              </div>

              <button
                onClick={() => setView('ats-check')}
                title="Open ATS Checker"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="simple-health">
              <strong>{currentResume ? `${ats.score}/100` : '—'}</strong>

              <div>
                <b>
                  {currentResume
                    ? 'Live ATS readiness'
                    : 'Upload a resume'}
                </b>
                <p>
                  {currentResume
                    ? `${ats.recommendations.length} improvement ${
                        ats.recommendations.length === 1 ? 'area' : 'areas'
                      } detected`
                    : 'Run the standalone ATS check to see verified resume signals.'}
                </p>
              </div>
            </div>

            <div className="health-bar">
              <span
                style={{
                  width: currentResume ? `${ats.score}%` : '0%',
                }}
              />
            </div>

            <ul>
              {currentResume ? (
                <>
                  <li>
                    <Check size={15} />
                    ATS score derived from parsed resume
                  </li>
                  <li>
                    <Check size={15} />
                    {ats.breakdown.length} scoring categories evaluated
                  </li>

                  {ats.recommendations.slice(0, 1).map((recommendation) => (
                    <li className="muted" key={recommendation.id}>
                      <Clock3 size={15} />
                      {recommendation.label}
                    </li>
                  ))}
                </>
              ) : (
                <li className="muted">
                  <Clock3 size={15} />
                  No resume analyzed yet
                </li>
              )}
            </ul>

            <Button
              variant="secondary"
              className="full-button"
              onClick={() => setView('ats-check')}
            >
              {currentResume ? 'Open ATS report' : 'Check ATS score'}
              <ArrowUpRight size={15} />
            </Button>
          </div>

        </aside>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  trend,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  trend: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="stat-card stat-card-clickable"
      onClick={onClick}
      aria-label={`Open ${label.toLowerCase()} details`}
    >
      <div className="stat-top">
        <span>{label}</span>
        <i>{icon}</i>
      </div>

      <strong>{value}</strong>
      <small>{trend}</small>
    </button>
  );
}

function ApplicationRow({
  company,
  role,
  date,
  status,
  fit,
}: {
  company: string;
  role: string;
  date: string;
  status: string;
  fit: number;
}) {
  return (
    <div className="application-row">
      <div className="company-cell no-company-logo">
        <div>
          <b>{company}</b>
          <span>{role}</span>
        </div>
      </div>

      <span className={`status status-${status.toLowerCase()}`}>
        {status}
      </span>

      <span className="date-cell">{date}</span>

      <span className="fit-cell">{fit}%</span>
    </div>
  );
}

function Update({
  icon,
  title,
  text,
  time,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  time: string;
}) {
  return (
    <div className="update">
      <span>{icon}</span>

      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>

      <small>{time}</small>
    </div>
  );
}

/* =========================================================
   SMART APPLY
========================================================= */

function SmartApply({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const [input, setInput] = useState('');

  const [mode, setMode] =
    useState<'url' | 'text' | 'file'>('url');

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [statusMessage, setStatusMessage] =
    useState('');

  const setCurrentJob = useCareerStore(
    (state) => state.setCurrentJob,
  );

  const setCurrentAnalysis = useCareerStore(
    (state) => state.setCurrentAnalysis,
  );

  const setCurrentResume = useCareerStore(
    (state) => state.setCurrentResume,
  );

  const handleModeChange = (
    nextMode: 'url' | 'text' | 'file',
  ) => {
    setMode(nextMode);
    setInput('');
    setSelectedFile(null);
    setError('');
    setStatusMessage('');
  };

  const handleAnalyze = async () => {
    setError('');
    setStatusMessage('');

    if (!resumeFile) {
      setError(
        'Upload the resume you want RoleClear to match against this opportunity.',
      );
      return;
    }

    if (mode === 'url') {
      if (!input.trim()) {
        setError('Paste a job URL first.');
        return;
      }

      if (!validateJobUrl(input)) {
        setError(
          'Enter a valid job URL beginning with http:// or https://',
        );
        return;
      }
    }

    if (mode === 'text') {
      if (!input.trim()) {
        setError('Paste the job description first.');
        return;
      }

      if (!validateJobDescription(input)) {
        setError(
          'The job description is too short. Paste at least 100 characters.',
        );
        return;
      }

      setError(
        'Live structured matching for pasted job descriptions is the next backend connector. Use a job URL for the fully verified Smart Apply flow right now.',
      );
      return;
    }

    if (mode === 'file') {
      if (!selectedFile) {
        setError('Choose a job description file first.');
        return;
      }

      setError(
        'Job-description file parsing is not connected to the live requirement reader yet. Use a job URL for the fully verified Smart Apply flow right now.',
      );
      return;
    }

    try {
      setAnalyzing(true);

      setStatusMessage(
        'Reading the job posting…',
      );

      const extracted =
        await extractJobFromUrl(
          input.trim(),
        );

      const job =
        importedJobFromExtraction(
          extracted,
        );

      setCurrentJob(job);

      setStatusMessage(
        'Parsing your resume…',
      );

      const parsedResume =
        await parseResumeFile(
          resumeFile,
        );

      setCurrentResume(
        parsedResume,
      );

      setStatusMessage(
        'Comparing requirements with resume evidence…',
      );

      const result =
        await analyzeJob(
          job,
          parsedResume,
          extracted,
        );

      setCurrentAnalysis(result);

      setStatusMessage('');

      setView('analysis');
    } catch (err) {
      console.error(
        'Smart Apply error:',
        err,
      );

      setStatusMessage('');

      setError(
        err instanceof Error
          ? err.message
          : 'We could not analyze this opportunity. Please try again.',
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="apply-page">
      <PageTitle
        eyebrow="Smart Apply · Step 01"
        title="What are you applying for?"
        subtitle="Bring an opportunity from anywhere. RoleClear reads the real posting and compares it with evidence from your resume."
      />

      <div className="apply-layout">
        <div className="apply-card">
          <div className="apply-tabs">
            <button
              className={mode === 'url' ? 'active' : ''}
              onClick={() =>
                handleModeChange('url')
              }
            >
              Paste a job URL
            </button>

            <button
              className={mode === 'text' ? 'active' : ''}
              onClick={() =>
                handleModeChange('text')
              }
            >
              Paste description
            </button>

            <button
              className={mode === 'file' ? 'active' : ''}
              onClick={() =>
                handleModeChange('file')
              }
            >
              Upload file
            </button>
          </div>

          {mode === 'url' && (
            <div className="url-input-wrap">
              <Link2 size={19} />

              <input
                type="url"
                value={input}
                onChange={(event) => {
                  setInput(
                    event.target.value,
                  );

                  if (error) {
                    setError('');
                  }
                }}
                placeholder="https://careers.company.com/jobs/..."
              />

              <span>⌘ V</span>
            </div>
          )}

          {mode === 'text' && (
            <textarea
              className="job-textarea"
              value={input}
              onChange={(event) => {
                setInput(
                  event.target.value,
                );

                if (error) {
                  setError('');
                }
              }}
              placeholder="Paste the complete job description here..."
            />
          )}

          {mode === 'file' && (
            <label className="drop-zone clickable">
              <Upload size={22} />

              {selectedFile ? (
                <>
                  <b>
                    {selectedFile.name}
                  </b>

                  <span>
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{' '}
                    MB
                  </span>
                </>
              ) : (
                <>
                  <b>
                    Choose a job description
                  </b>

                  <span>
                    PDF, DOCX or TXT · max 10MB
                  </span>
                </>
              )}

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ??
                    null;

                  if (!file) {
                    setSelectedFile(null);
                    return;
                  }

                  if (
                    file.size >
                    10 * 1024 * 1024
                  ) {
                    setSelectedFile(null);

                    setError(
                      'The file is larger than 10MB.',
                    );

                    event.target.value =
                      '';

                    return;
                  }

                  setSelectedFile(file);
                  setError('');
                }}
              />
            </label>
          )}

          <div
            style={{
              marginTop: '18px',
            }}
          >
            <span className="mini-label">
              RESUME FOR THIS MATCH
            </span>

            <label
              className="drop-zone clickable"
              style={{
                marginTop: '8px',
              }}
            >
              <FileText size={22} />

              {resumeFile ? (
                <>
                  <b>{resumeFile.name}</b>

                  <span>
                    {(
                      resumeFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{' '}
                    MB · ready to parse
                  </span>
                </>
              ) : (
                <>
                  <b>
                    Upload your resume
                  </b>

                  <span>
                    PDF or DOCX · RoleClear parses it before every match
                  </span>
                </>
              )}

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ??
                    null;

                  if (!file) {
                    setResumeFile(null);
                    return;
                  }

                  if (
                    file.size >
                    10 * 1024 * 1024
                  ) {
                    setResumeFile(null);

                    setError(
                      'The resume is larger than 10MB.',
                    );

                    event.target.value =
                      '';

                    return;
                  }

                  setResumeFile(file);
                  setError('');
                }}
              />
            </label>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                border:
                  '1px solid #fecaca',
                background:
                  '#fef2f2',
                color: '#b91c1c',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              {error}
            </div>
          )}

          {statusMessage && (
            <div
              role="status"
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                border:
                  '1px solid #dbeafe',
                background:
                  '#eff6ff',
                color: '#1d4ed8',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              {statusMessage}
            </div>
          )}

          <div className="apply-note">
            <LockKeyhole size={15} />

            <span>
              Your opportunity and resume stay private. Scores are generated from the submitted posting and resume evidence.
            </span>
          </div>

          <Button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <span className="button-loader" />
                Analyzing opportunity…
              </>
            ) : (
              <>
                Analyze opportunity
                <ArrowUpRight
                  size={17}
                />
              </>
            )}
          </Button>
        </div>

        <div className="apply-side">
          <div className="workflow-card">
            <span className="mini-label">
              THE SMART APPLY LOOP
            </span>

            <div className="workflow-steps">
              <WorkflowStep
                num="01"
                label="Verify"
                active
              />

              <WorkflowStep
                num="02"
                label="Match"
              />

              <WorkflowStep
                num="03"
                label="Optimize"
              />

              <WorkflowStep
                num="04"
                label="Apply"
              />

              <WorkflowStep
                num="05"
                label="Track"
              />
            </div>
          </div>

          <div className="why-card">
            <Sparkles size={18} />

            <div>
              <b>
                Evidence-first matching
              </b>

              <p>
                RoleClear separates required and preferred capabilities, parses your resume, and scores the overlap using skills, experience and relevant work evidence.
              </p>

              <button
                onClick={() =>
                  setView('feed')
                }
              >
                Learn more
                <ArrowUpRight
                  size={14}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-opportunities">
        <div className="section-row">
          <h2>Recently analyzed</h2>

          <button className="view-link">
            View history
            <ArrowUpRight size={15} />
          </button>
        </div>

        <p
          style={{
            fontSize: '13px',
            opacity: 0.65,
          }}
        >
          Your analyzed opportunities will appear here.
        </p>
      </div>
    </div>
  );
}

function WorkflowStep({
  num,
  label,
  active,
}: {
  num: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className={`workflow-step ${active ? 'active' : ''}`}>
      <span>{num}</span>
      <b>{label}</b>
    </div>
  );
}

/* =========================================================
   APPLICATIONS
========================================================= */

function Applications({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const trackedApplications =
    useCareerStore(
      (state) =>
        state.trackedApplications,
    );

  const setSelectedApplication =
    useCareerStore(
      (state) =>
        state.setSelectedApplication,
    );

  const deleteTrackedApplication =
    useCareerStore(
      (state) =>
        state.deleteTrackedApplication,
    );

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<
      | 'All'
      | 'Applied'
      | 'Screening'
      | 'Interview'
      | 'Offer'
      | 'Rejected'
      | 'Withdrawn'
    >('All');

  const [sortOrder, setSortOrder] =
    useState<'newest' | 'oldest'>(
      'newest',
    );

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  const filteredApplications =
    [...trackedApplications]
      .filter((application) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            application.company,
            application.role,
            application.source,
            application.status,
          ]
            .join(' ')
            .toLowerCase()
            .includes(
              normalizedSearch,
            );

        const matchesStatus =
          statusFilter === 'All' ||
          application.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        const aTime = new Date(
          a.appliedAt,
        ).getTime();

        const bTime = new Date(
          b.appliedAt,
        ).getTime();

        return sortOrder ===
          'newest'
          ? bTime - aTime
          : aTime - bTime;
      });

  const openApplication = (
    id: string,
  ) => {
    setSelectedApplication(id);
    setView(
      'application-detail',
    );
  };

  const handleDelete = (
    id: string,
    company: string,
    role: string,
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${role} at ${company} from your tracker? This cannot be undone.`,
      );

    if (!confirmed) return;

    deleteTrackedApplication(id);
  };

  const statusCount = (
    status:
      | 'Applied'
      | 'Screening'
      | 'Interview'
      | 'Offer'
      | 'Rejected'
      | 'Withdrawn',
  ) =>
    String(
      filteredApplications.filter(
        (application) =>
          application.status ===
          status,
      ).length,
    ).padStart(2, '0');

  const toCard = (
    status:
      | 'Applied'
      | 'Screening'
      | 'Interview'
      | 'Offer'
      | 'Rejected'
      | 'Withdrawn',
  ) =>
    filteredApplications
      .filter(
        (application) =>
          application.status ===
          status,
      )
      .map((application) => ({
        id: application.id,
        company:
          application.company,
        role: application.role,
        date: application.date,
        status:
          application.status,
        fit: application.fit,
        color: 'green',
      }));

  return (
    <>
      <PageTitle
        eyebrow="Your application journey"
        title="Application tracker"
        subtitle="Only applications you actually add through RoleClear appear here."
        action={
          <Button
            onClick={() =>
              setView('apply')
            }
          >
            <Plus size={17} />
            Add application
          </Button>
        }
      />

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={17} />
          <input
            placeholder="Search applications"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as typeof statusFilter,
            )
          }
          style={{
            minHeight: '40px',
            border:
              '1px solid rgba(0,0,0,0.12)',
            borderRadius: '8px',
            padding: '0 12px',
            background: 'white',
          }}
        >
          <option value="All">
            All statuses
          </option>
          <option value="Applied">
            Applied
          </option>
          <option value="Screening">
            Screening
          </option>
          <option value="Interview">
            Interview
          </option>
          <option value="Offer">
            Offer
          </option>
          <option value="Rejected">
            Rejected
          </option>
          <option value="Withdrawn">
            Withdrawn
          </option>
        </select>

        <Button
          variant="secondary"
          onClick={() =>
            setSortOrder((current) =>
              current === 'newest'
                ? 'oldest'
                : 'newest',
            )
          }
        >
          {sortOrder ===
          'newest'
            ? 'Newest first'
            : 'Oldest first'}
          <ChevronRight size={15} />
        </Button>
      </div>

      {trackedApplications.length ===
      0 ? (
        <div
          className="detail-card"
          style={{
            textAlign: 'center',
            padding: '44px 24px',
          }}
        >
          <BriefcaseBusiness
            size={32}
            style={{
              marginBottom: '12px',
            }}
          />

          <h2>
            No applications yet.
          </h2>

          <p>
            Complete Smart Apply and confirm “I’ve applied” to add your first real application.
          </p>

          <Button
            onClick={() =>
              setView('apply')
            }
          >
            Start Smart Apply
            <ArrowUpRight size={15} />
          </Button>
        </div>
      ) : filteredApplications.length ===
        0 ? (
        <div
          className="detail-card"
          style={{
            textAlign: 'center',
            padding: '32px 24px',
          }}
        >
          <h3>
            No applications match these filters.
          </h3>

          <Button
            variant="secondary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter(
                'All',
              );
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          className="kanban"
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns:
              'minmax(245px, 1fr)',
            gap: '12px',
            overflowX: 'auto',
            alignItems: 'start',
            paddingBottom: '8px',
          }}
        >
          <Kanban
            title="Applied"
            count={statusCount(
              'Applied',
            )}
            items={toCard(
              'Applied',
            )}
            onOpen={openApplication}
            onDelete={
              handleDelete
            }
          />

          <Kanban
            title="Screening"
            count={statusCount(
              'Screening',
            )}
            items={toCard(
              'Screening',
            )}
            onOpen={openApplication}
            onDelete={
              handleDelete
            }
          />

          <Kanban
            title="Interview"
            count={statusCount(
              'Interview',
            )}
            items={toCard(
              'Interview',
            )}
            onOpen={openApplication}
            onDelete={
              handleDelete
            }
          />

          <Kanban
            title="Offer"
            count={statusCount(
              'Offer',
            )}
            items={toCard(
              'Offer',
            )}
            onOpen={openApplication}
            onDelete={
              handleDelete
            }
          />

          <Kanban
            title="Rejected"
            count={statusCount(
              'Rejected',
            )}
            items={toCard(
              'Rejected',
            )}
            onOpen={openApplication}
            onDelete={
              handleDelete
            }
          />

          <Kanban
            title="Withdrawn"
            count={statusCount(
              'Withdrawn',
            )}
            items={toCard(
              'Withdrawn',
            )}
            onOpen={openApplication}
            onDelete={
              handleDelete
            }
          />
        </div>
      )}
    </>
  );
}

function Kanban({
  title,
  count,
  items,
  onOpen,
  onDelete,
}: {
  title: string;
  count: string;
  items: {
    id: string;
    company: string;
    role: string;
    date: string;
    status: string;
    fit: number;
    color: string;
  }[];
  onOpen: (id: string) => void;
  onDelete: (
    id: string,
    company: string,
    role: string,
  ) => void;
}) {
  return (
    <div
      className="kanban-column"
      style={{
        minWidth: '245px',
        padding: '14px',
        borderRadius: '14px',
        background:
          'rgba(15, 23, 42, 0.035)',
        border:
          '1px solid rgba(15, 23, 42, 0.06)',
      }}
    >
      <div
        className="kanban-heading"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: '12px',
          padding:
            '2px 2px 12px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '0.96rem',
            fontWeight: 700,
            letterSpacing:
              '-0.01em',
          }}
        >
          {title}
        </span>

        <span
          style={{
            minWidth: '28px',
            height: '28px',
            padding: '0 8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '999px',
            background:
              'rgba(15, 23, 42, 0.07)',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      </div>

      <div
        className="kanban-items"
        style={{
          display: 'grid',
          gap: '10px',
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              minHeight: '78px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              color:
                'rgba(15, 23, 42, 0.48)',
              fontSize: '0.84rem',
              textAlign: 'center',
              border:
                '1px dashed rgba(15, 23, 42, 0.12)',
              background:
                'rgba(255, 255, 255, 0.58)',
              borderRadius: '10px',
            }}
          >
            No applications
          </div>
        ) : (
          items.map(
            (application) => (
              <article
                className="application-card"
                key={
                  application.id
                }
                style={{
                  padding: '14px',
                  background: '#fff',
                  border:
                    '1px solid rgba(15, 23, 42, 0.09)',
                  borderRadius:
                    '12px',
                  boxShadow:
                    '0 1px 2px rgba(15, 23, 42, 0.03)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    onOpen(
                      application.id,
                    )
                  }
                  style={{
                    width: '100%',
                    border: 0,
                    background:
                      'transparent',
                    padding: 0,
                    textAlign:
                      'left',
                    cursor:
                      'pointer',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap: '10px',
                      marginBottom:
                        '12px',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '8px',
                        minWidth: 0,
                      }}
                    >
                      <span
                        className={`company-dot dot-${application.color}`}
                        style={{
                          flexShrink: 0,
                        }}
                      />

                      <strong
                        style={{
                          fontSize:
                            '0.88rem',
                          lineHeight:
                            1.25,
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {
                          application.company
                        }
                      </strong>
                    </div>

                    <ChevronRight
                      size={15}
                      style={{
                        flexShrink: 0,
                        opacity: 0.45,
                      }}
                    />
                  </div>

                  <h3
                    style={{
                      margin:
                        '0 0 12px',
                      fontSize:
                        '1rem',
                      lineHeight:
                        1.35,
                      fontWeight:
                        650,
                    }}
                  >
                    {
                      application.role
                    }
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      gap: '10px',
                      alignItems:
                        'center',
                      paddingTop:
                        '10px',
                      borderTop:
                        '1px solid rgba(15, 23, 42, 0.07)',
                      fontSize:
                        '0.78rem',
                      color:
                        'rgba(15, 23, 42, 0.62)',
                    }}
                  >
                    <span>
                      {
                        application.date
                      }
                    </span>

                    <span
                      style={{
                        padding:
                          '3px 7px',
                        borderRadius:
                          '999px',
                        background:
                          'rgba(34, 197, 94, 0.08)',
                        color:
                          'rgba(21, 128, 61, 1)',
                        fontWeight:
                          700,
                      }}
                    >
                      {
                        application.fit
                      }
                      % fit
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  aria-label={`Delete ${application.role} at ${application.company}`}
                  title="Delete application"
                  onClick={(event) => {
                    event.stopPropagation();

                    onDelete(
                      application.id,
                      application.company,
                      application.role,
                    );
                  }}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    minHeight:
                      '34px',
                    border:
                      '1px solid rgba(220, 38, 38, 0.14)',
                    background:
                      'transparent',
                    color:
                      'rgba(185, 28, 28, 0.82)',
                    borderRadius:
                      '8px',
                    cursor:
                      'pointer',
                    display:
                      'inline-flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    gap: '7px',
                    fontSize:
                      '0.82rem',
                    fontWeight:
                      600,
                  }}
                >
                  <Trash2
                    size={13}
                  />
                  Delete
                </button>
              </article>
            ),
          )
        )}
      </div>
    </div>
  );
}

type AtsCheckSeverity =
  | 'pass'
  | 'medium'
  | 'high';

type AtsDiagnosticCheck = {
  id: string;
  category: string;
  label: string;
  score: number;
  max: number;
  severity: AtsCheckSeverity;
  reason: string;
  solution: string;
  evidence?: string;
};

type AtsReadinessResult = {
  score: number;
  breakdown: {
    label: string;
    score: number;
    max: number;
  }[];
  checks: AtsDiagnosticCheck[];
  recommendations: AtsDiagnosticCheck[];
  optionalSignals: string[];
};

function calculateAtsReadiness(
  rawResume: Record<string, unknown> | null,
): AtsReadinessResult {
  if (!rawResume) {
    return {
      score: 0,
      breakdown: [],
      checks: [],
      recommendations: [],
      optionalSignals: [],
    };
  }

  type WarningLike =
    | string
    | {
        code?: string;
        message?: string;
        severity?: string;
      };

  const resume = rawResume as {
    personal_info?: {
      full_name?: string | null;
      email?: string | null;
      phone?: string | null;
      linkedin?: string | null;
      github?: string | null;
      location?: string | null;
    };
    summary?: string | null;
    skills?: Record<
      string,
      {
        name?: string | null;
        normalized_name?: string | null;
        explicit?: boolean;
      }[]
    >;
    experience?: {
      title?: string | null;
      company?: string | null;
      location?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      is_current?: boolean;
      bullets?: string[];
    }[];
    projects?: {
      name?: string | null;
      description?: string | null;
      bullets?: string[];
      technologies?: string[];
    }[];
    education?: {
      institution?: string | null;
      degree?: string | null;
      field_of_study?: string | null;
      location?: string | null;
      start_date?: string | null;
      end_date?: string | null;
    }[];
    certifications?: unknown[];
    achievements?: unknown[];
    publications?: unknown[];
    research?: unknown[];
    raw_text?: string;
    raw_sections?: Record<string, unknown>;
    parsing_metadata?: {
      extraction_method?: string | null;
      file_name?: string | null;
      file_size_bytes?: number | null;
      page_count?: number | null;
      character_count?: number | null;
      section_count?: number | null;
      overall_confidence?: number | null;
      warnings?: WarningLike[];
    };
  };

  const personal = resume.personal_info ?? {};
  const experience = resume.experience ?? [];
  const projects = resume.projects ?? [];
  const education = resume.education ?? [];
  const rawText = resume.raw_text ?? '';
  const rawSections = resume.raw_sections ?? {};
  const metadata = resume.parsing_metadata ?? {};

  const skills = Object.values(resume.skills ?? {})
    .flatMap((items) => items ?? [])
    .map((item) => ({
      name: item.name?.trim() ?? '',
      normalized:
        item.normalized_name?.trim().toLowerCase() ??
        item.name?.trim().toLowerCase() ??
        '',
      explicit: Boolean(item.explicit),
    }))
    .filter((item) => item.name);

  const experienceBullets = experience.flatMap(
    (item) => item.bullets ?? [],
  );
  const projectBullets = projects.flatMap(
    (item) => item.bullets ?? [],
  );
  const allBullets = [
    ...experienceBullets,
    ...projectBullets,
  ];

  const checks: AtsDiagnosticCheck[] = [];

  const addCheck = (
    check: Omit<
      AtsDiagnosticCheck,
      'severity'
    >,
  ) => {
    const lost = check.max - check.score;
    const severity: AtsCheckSeverity =
      lost <= 0
        ? 'pass'
        : lost >= Math.max(3, check.max * 0.5)
          ? 'high'
          : 'medium';

    checks.push({
      ...check,
      severity,
    });
  };

  const monthMap: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };

  const dateValue = (
    value?: string | null,
  ): number | null => {
    if (!value) return null;

    const lower = value.trim().toLowerCase();

    if (
      lower === 'present' ||
      lower === 'current'
    ) {
      return 999999;
    }

    const monthYear = lower.match(
      /\b([a-z]{3,9})\s+((?:19|20)\d{2})\b/,
    );

    if (monthYear) {
      const month =
        monthMap[monthYear[1]] ?? 1;
      return (
        Number(monthYear[2]) * 100 +
        month
      );
    }

    const iso = lower.match(
      /\b((?:19|20)\d{2})[-/](0?[1-9]|1[0-2])\b/,
    );

    if (iso) {
      return (
        Number(iso[1]) * 100 +
        Number(iso[2])
      );
    }

    const yearOnly = lower.match(
      /\b((?:19|20)\d{2})\b/,
    );

    return yearOnly
      ? Number(yearOnly[1]) * 100 + 1
      : null;
  };

  /*
   * Resume bullet analysis is intentionally sentence-aware.
   *
   * ATS parsing itself does not "grade" action verbs. This is a
   * resume-readiness heuristic layered on top of parsed resume data.
   * We therefore inspect:
   *   1. whether the bullet opens actively,
   *   2. whether it contains a concrete contribution/action anywhere,
   *   3. whether it contains measurable scope/results,
   *   4. whether it relies on weak/filler phrasing.
   */
  const strongActionVerbBases = new Set([
    'achieve',
    'administer',
    'analyze',
    'architect',
    'automate',
    'build',
    'calculate',
    'collaborate',
    'configure',
    'consolidate',
    'contribute',
    'coordinate',
    'create',
    'cut',
    'deliver',
    'deploy',
    'design',
    'develop',
    'direct',
    'document',
    'drive',
    'engineer',
    'establish',
    'evaluate',
    'execute',
    'expand',
    'generate',
    'identify',
    'implement',
    'improve',
    'increase',
    'integrate',
    'launch',
    'lead',
    'maintain',
    'manage',
    'migrate',
    'negotiate',
    'optimize',
    'organize',
    'plan',
    'produce',
    'program',
    'reduce',
    'research',
    'resolve',
    'scale',
    'secure',
    'solve',
    'spearhead',
    'streamline',
    'test',
    'train',
    'upgrade',
    'validate',
  ]);

  const irregularActionVerbForms: Record<string, string> = {
    built: 'build',
    led: 'lead',
    drove: 'drive',
    cut: 'cut',
  };

  const normalizeActionVerb = (
    token: string,
  ): string | null => {
    const word = token
      .toLowerCase()
      .replace(/[^a-z]/g, '');

    if (!word) return null;

    if (strongActionVerbBases.has(word)) {
      return word;
    }

    const irregular =
      irregularActionVerbForms[word];

    if (
      irregular &&
      strongActionVerbBases.has(
        irregular,
      )
    ) {
      return irregular;
    }

    const candidates = new Set<string>();

    if (word.endsWith('ing')) {
      const stem = word.slice(0, -3);
      candidates.add(stem);
      candidates.add(`${stem}e`);

      if (
        stem.length >= 2 &&
        stem.at(-1) === stem.at(-2)
      ) {
        candidates.add(
          stem.slice(0, -1),
        );
      }
    }

    if (word.endsWith('ied')) {
      candidates.add(
        `${word.slice(0, -3)}y`,
      );
    } else if (
      word.endsWith('ed')
    ) {
      const stem = word.slice(0, -2);
      candidates.add(stem);
      candidates.add(`${stem}e`);

      if (
        stem.length >= 2 &&
        stem.at(-1) === stem.at(-2)
      ) {
        candidates.add(
          stem.slice(0, -1),
        );
      }
    }

    if (word.endsWith('es')) {
      candidates.add(
        word.slice(0, -2),
      );
      candidates.add(
        `${word.slice(0, -2)}e`,
      );
    }

    if (word.endsWith('s')) {
      candidates.add(
        word.slice(0, -1),
      );
    }

    for (const candidate of candidates) {
      if (
        strongActionVerbBases.has(
          candidate,
        )
      ) {
        return candidate;
      }
    }

    return null;
  };

  const bulletTokens = (
    bullet: string,
  ) =>
    bullet
      .trim()
      .split(/\s+/)
      .map((token) =>
        token.replace(
          /^[^A-Za-z]+|[^A-Za-z]+$/g,
          '',
        ),
      )
      .filter(Boolean);

  const getBulletActionSignals = (
    bullet: string,
  ) => {
    const tokens = bulletTokens(
      bullet,
    );

    const opener =
      tokens[0] ?? '';

    const openerVerb =
      normalizeActionVerb(
        opener,
      );

    const actionVerbs = tokens
      .map(normalizeActionVerb)
      .filter(
        (
          verb,
        ): verb is string =>
          Boolean(verb),
      );

    const uniqueActionVerbs = [
      ...new Set(actionVerbs),
    ];

    return {
      opener,
      openerVerb,
      actionVerbs:
        uniqueActionVerbs,
      hasActionAnywhere:
        uniqueActionVerbs.length > 0,
    };
  };

  const weakStyleRegex =
    /\b(responsible for|worked on|helped with|assisted with|participated in|tasked with|successfully|effectively|hardworking|team player|detail[- ]oriented|results[- ]driven)\b/i;

  const personalPronounRegex =
    /\b(i|me|my|mine|we|our|ours)\b/i;

  /*
   * Count evidence of measurable scale/results, not arbitrary digits.
   * This intentionally avoids technology-version false positives such as
   * "Next.js 15" and "Qwen2.5-VL".
   */
  const quantifiedRegex =
    /(?:\b\d+(?:\.\d+)?%|\$\s?\d+(?:[.,]\d+)?|\b\d{1,3}(?:,\d{3})+\+?\b|\b\d+(?:\.\d+)?\+?\s?(?:ms|milliseconds|sec|seconds|minutes|hours|days|weeks|months|users|customers|requests|records|teams|projects|features|apis|models|samples|transactions|screens|endpoints|runs|inference runs|deployments|workflows|roles|markets|countries|cities|locations)\b)/i;

  const standardSectionNames = new Set([
    'experience',
    'work experience',
    'professional experience',
    'skills',
    'technical skills',
    'core skills',
    'education',
    'projects',
    'certifications',
    'achievements',
    'research',
    'publications',
    'publications research',
    'research publications',
    'publications & research',
    'research & publications',
    'coursework',
    'languages',
    'summary',
    'professional summary',
    'profile',
  ]);

  const normalizedRawSectionNames =
    Object.keys(rawSections).map((key) =>
      key
        .replace(/_/g, ' ')
        .trim()
        .toLowerCase(),
    );

  // =====================================================
  // CATEGORY 1 — ATS PARSING & STRUCTURE (30)
  // =====================================================

  const extractionMethod = (
    metadata.extraction_method ?? ''
  ).toLowerCase();

  const supportedFile =
    extractionMethod === 'pdf' ||
    extractionMethod === 'docx';

  addCheck({
    id: 'file-format',
    category: 'ATS parsing & structure',
    label: 'Supported file format',
    score: supportedFile ? 4 : 0,
    max: 4,
    reason: supportedFile
      ? `RoleClear parsed this as ${extractionMethod.toUpperCase()}.`
      : 'The resume is not a standard PDF or DOCX file.',
    solution:
      'Use a standard PDF or .docx unless the employer explicitly requests another format.',
    evidence:
      metadata.file_name ??
      metadata.extraction_method ??
      'Unknown file type',
  });

  const confidence =
    metadata.overall_confidence ?? 0;

  const confidenceScore =
    confidence >= 0.9
      ? 6
      : confidence >= 0.8
        ? 5
        : confidence >= 0.7
          ? 3
          : confidence > 0
            ? 1
            : 0;

  addCheck({
    id: 'parser-confidence',
    category: 'ATS parsing & structure',
    label: 'Parser confidence',
    score: confidenceScore,
    max: 6,
    reason:
      confidence > 0
        ? `Structured extraction confidence is ${Math.round(
            confidence * 100,
          )}%.`
        : 'The parser did not expose a confidence value.',
    solution:
      confidenceScore < 6
        ? 'Use simpler structure and standard headings so important fields extract consistently.'
        : 'No change needed.',
    evidence:
      confidence > 0
        ? `${Math.round(confidence * 100)}% confidence`
        : 'No confidence metadata',
  });

  const warningCount =
    metadata.warnings?.length ?? 0;

  addCheck({
    id: 'parser-warnings',
    category: 'ATS parsing & structure',
    label: 'Parsing warnings',
    score:
      warningCount === 0
        ? 4
        : warningCount === 1
          ? 2
          : 0,
    max: 4,
    reason:
      warningCount === 0
        ? 'No parser warnings were raised.'
        : `${warningCount} parser warning${
            warningCount === 1 ? '' : 's'
          } detected.`,
    solution:
      warningCount === 0
        ? 'No change needed.'
        : 'Review the flagged sections and simplify any ambiguous or non-standard formatting.',
    evidence:
      warningCount === 0
        ? '0 warnings'
        : `${warningCount} warning(s)`,
  });

  const coreSectionsParsed = [
    experience.length > 0,
    skills.length > 0,
    education.length > 0,
  ].filter(Boolean).length;

  addCheck({
    id: 'core-section-extraction',
    category: 'ATS parsing & structure',
    label: 'Core section extraction',
    score:
      coreSectionsParsed === 3
        ? 5
        : coreSectionsParsed === 2
          ? 3
          : coreSectionsParsed === 1
            ? 1
            : 0,
    max: 5,
    reason: `${coreSectionsParsed}/3 core sections were structurally parsed: Work Experience, Skills and Education.`,
    solution:
      coreSectionsParsed === 3
        ? 'No change needed.'
        : 'Use standard headings such as Work Experience, Skills and Education.',
    evidence: `${experience.length} experience entries · ${skills.length} skills · ${education.length} education entries`,
  });

  const topLines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10)
    .join(' ')
    .toLowerCase();

  const topContactSignals = [
    personal.full_name &&
      topLines.includes(
        personal.full_name.toLowerCase(),
      ),
    personal.email &&
      topLines.includes(
        personal.email.toLowerCase(),
      ),
    personal.phone &&
      topLines.replace(/\D/g, '').includes(
        personal.phone.replace(/\D/g, ''),
      ),
  ].filter(Boolean).length;

  addCheck({
    id: 'contact-at-top',
    category: 'ATS parsing & structure',
    label: 'Contact details near the top',
    score:
      topContactSignals >= 3
        ? 4
        : topContactSignals === 2
          ? 3
          : topContactSignals === 1
            ? 1
            : 0,
    max: 4,
    reason: `${topContactSignals}/3 essential contact signals were found near the top of the extracted resume.`,
    solution:
      topContactSignals >= 3
        ? 'No change needed.'
        : 'Keep name, email and phone in the main body at the top of the resume.',
    evidence: 'Checks first 10 extracted lines',
  });

  const structuredExperience =
    experience.filter(
      (item) =>
        item.title &&
        item.company &&
        item.start_date &&
        (item.end_date || item.is_current),
    ).length;

  const structuredRatio =
    experience.length > 0
      ? structuredExperience /
        experience.length
      : 0;

  addCheck({
    id: 'experience-field-extraction',
    category: 'ATS parsing & structure',
    label: 'Experience field extraction',
    score:
      experience.length === 0
        ? 0
        : structuredRatio >= 0.95
          ? 4
          : structuredRatio >= 0.7
            ? 2
            : 0,
    max: 4,
    reason:
      experience.length > 0
        ? `${structuredExperience}/${experience.length} experience entries include title, company and dates.`
        : 'No structured work experience entries were parsed.',
    solution:
      structuredRatio >= 0.95
        ? 'No change needed.'
        : 'Use a consistent Job Title, Company, Month Year – Month Year structure for each role.',
    evidence:
      experience.length > 0
        ? `${Math.round(structuredRatio * 100)}% structured`
        : 'No experience parsed',
  });

  const datedExperience =
    experience.filter(
      (item) =>
        dateValue(item.start_date) !== null &&
        (item.is_current ||
          dateValue(item.end_date) !== null),
    ).length;

  addCheck({
    id: 'date-parseability',
    category: 'ATS parsing & structure',
    label: 'Date parseability',
    score:
      experience.length === 0
        ? 0
        : datedExperience ===
            experience.length
          ? 3
          : datedExperience >=
              Math.ceil(
                experience.length * 0.7,
              )
            ? 2
            : 0,
    max: 3,
    reason:
      experience.length > 0
        ? `${datedExperience}/${experience.length} experience date ranges were machine-readable.`
        : 'No experience dates were available to validate.',
    solution:
      datedExperience === experience.length &&
      experience.length > 0
        ? 'No change needed.'
        : 'Use consistent Month Year – Month Year or Month Year – Present dates.',
    evidence: `${datedExperience}/${experience.length} readable date ranges`,
  });

  // =====================================================
  // CATEGORY 2 — EXPERIENCE IMPACT & BULLETS (30)
  // =====================================================

  const expBulletCount =
    experienceBullets.length;

  const rolesWithEnoughBullets =
    experience.filter(
      (item) =>
        (item.bullets?.length ?? 0) >= 2,
    ).length;

  addCheck({
    id: 'experience-depth',
    category: 'Experience impact',
    label: 'Experience bullet depth',
    score:
      experience.length === 0
        ? 0
        : rolesWithEnoughBullets ===
            experience.length
          ? 4
          : rolesWithEnoughBullets >=
              Math.ceil(
                experience.length * 0.6,
              )
            ? 2
            : 0,
    max: 4,
    reason:
      experience.length > 0
        ? `${rolesWithEnoughBullets}/${experience.length} roles have at least two evidence bullets.`
        : 'No work-experience bullets were parsed.',
    solution:
      rolesWithEnoughBullets === experience.length &&
      experience.length > 0
        ? 'No change needed.'
        : 'Give substantive roles 2–4 concise bullets focused on contribution and outcome.',
    evidence: `${expBulletCount} total experience bullets`,
  });

  const experienceActionSignals =
    experienceBullets.map(
      (bullet) => ({
        bullet,
        ...getBulletActionSignals(
          bullet,
        ),
      }),
    );

  const strongOpenerCount =
    experienceActionSignals.filter(
      (item) =>
        Boolean(
          item.openerVerb,
        ),
    ).length;

  const actionAnywhereCount =
    experienceActionSignals.filter(
      (item) =>
        item.hasActionAnywhere,
    ).length;

  const openerRatio =
    expBulletCount > 0
      ? strongOpenerCount /
        expBulletCount
      : 0;

  const actionCoverageRatio =
    expBulletCount > 0
      ? actionAnywhereCount /
        expBulletCount
      : 0;

  /*
   * Full-sentence scoring:
   * - 4 points: concrete contribution/action appears somewhere in the bullet.
   * - 2 points: the bullet also opens with a strong action verb.
   *
   * This prevents a sentence such as
   * "Worked with databases to manage, retrieve and integrate..."
   * from receiving zero action credit simply because "Worked" is generic.
   */
  const actionCoverageScore =
    actionCoverageRatio >= 0.8
      ? 4
      : actionCoverageRatio >= 0.6
        ? 3
        : actionCoverageRatio >= 0.4
          ? 2
          : actionCoverageRatio > 0
            ? 1
            : 0;

  const openerScore =
    openerRatio >= 0.75
      ? 2
      : openerRatio >= 0.3
        ? 1
        : 0;

  const actionScore =
    actionCoverageScore +
    openerScore;

  const weakOnlyBullets =
    experienceActionSignals.filter(
      (item) =>
        !item.hasActionAnywhere,
    );

  addCheck({
    id: 'action-verbs',
    category: 'Experience impact',
    label:
      'Action-oriented experience bullets',
    score: actionScore,
    max: 6,
    reason:
      expBulletCount > 0
        ? `${actionAnywhereCount}/${expBulletCount} experience bullets contain a concrete contribution/action; ${strongOpenerCount}/${expBulletCount} also begin with a strong action verb.`
        : 'No experience bullets were available to assess.',
    solution:
      actionScore === 6
        ? 'No change needed.'
        : weakOnlyBullets.length > 0
          ? `${weakOnlyBullets.length} bullet${
              weakOnlyBullets.length ===
              1
                ? ''
                : 's'
            } describe experience without a clear contribution verb. Rewrite only those bullets to state what was analyzed, built, implemented, improved, managed, tested or delivered, while keeping every claim truthful.`
          : 'The bullets contain clear actions. Where natural, move the main contribution verb closer to the beginning so a recruiter can scan it faster.',
    evidence:
      expBulletCount > 0
        ? `${Math.round(
            actionCoverageRatio *
              100,
          )}% action coverage · ${Math.round(
            openerRatio * 100,
          )}% strong openers`
        : 'No bullets',
  });

  const quantifiedBullets =
    experienceBullets.filter((bullet) =>
      quantifiedRegex.test(bullet),
    ).length;

  const quantifiedRatio =
    expBulletCount > 0
      ? quantifiedBullets / expBulletCount
      : 0;

  addCheck({
    id: 'quantified-impact',
    category: 'Experience impact',
    label: 'Quantified impact',
    score:
      quantifiedRatio >= 0.4
        ? 7
        : quantifiedRatio >= 0.25
          ? 5
          : quantifiedRatio >= 0.1
            ? 3
            : quantifiedRatio > 0
              ? 1
              : 0,
    max: 7,
    reason:
      expBulletCount > 0
        ? `${quantifiedBullets}/${expBulletCount} experience bullets contain measurable scale or results.`
        : 'No experience bullets were available to assess.',
    solution:
      quantifiedRatio >= 0.4
        ? 'No change needed.'
        : 'Where supported by facts, add scale, counts, percentages, latency, users, samples, revenue, cost or time saved.',
    evidence:
      expBulletCount > 0
        ? `${Math.round(
            quantifiedRatio * 100,
          )}% quantified`
        : 'No bullets',
  });

  const conciseBullets =
    experienceBullets.filter(
      (bullet) =>
        bullet
          .trim()
          .split(/\s+/)
          .filter(Boolean).length <= 35,
    ).length;

  const conciseRatio =
    expBulletCount > 0
      ? conciseBullets / expBulletCount
      : 0;

  addCheck({
    id: 'bullet-brevity',
    category: 'Experience impact',
    label: 'Bullet brevity',
    score:
      conciseRatio >= 0.85
        ? 5
        : conciseRatio >= 0.65
          ? 3
          : conciseRatio > 0
            ? 1
            : 0,
    max: 5,
    reason:
      expBulletCount > 0
        ? `${conciseBullets}/${expBulletCount} experience bullets are 35 words or fewer.`
        : 'No experience bullets were available to assess.',
    solution:
      conciseRatio >= 0.85
        ? 'No change needed.'
        : 'Keep each bullet focused on one contribution and one outcome; split long bullets.',
    evidence:
      expBulletCount > 0
        ? `${Math.round(conciseRatio * 100)}% concise`
        : 'No bullets',
  });

  const cleanStyleBullets =
    experienceBullets.filter(
      (bullet) =>
        !weakStyleRegex.test(bullet) &&
        !personalPronounRegex.test(bullet),
    ).length;

  const cleanStyleRatio =
    expBulletCount > 0
      ? cleanStyleBullets /
        expBulletCount
      : 0;

  addCheck({
    id: 'bullet-style',
    category: 'Experience impact',
    label: 'Direct, professional bullet style',
    score:
      cleanStyleRatio >= 0.9
        ? 3
        : cleanStyleRatio >= 0.7
          ? 2
          : cleanStyleRatio > 0
            ? 1
            : 0,
    max: 3,
    reason:
      expBulletCount > 0
        ? `${cleanStyleBullets}/${expBulletCount} experience bullets avoid generic filler phrases and personal pronouns.`
        : 'No experience bullets were available to assess.',
    solution:
      cleanStyleRatio >= 0.9
        ? 'No change needed.'
        : 'Some bullets contain generic responsibility/filler phrasing. Keep the factual content, but make the actual task, method or outcome explicit.',
    evidence:
      expBulletCount > 0
        ? `${Math.round(
            cleanStyleRatio * 100,
          )}% clean style`
        : 'No bullets',
  });

  const openers = experienceBullets
    .map(
      (bullet) =>
        bullet
          .trim()
          .split(/\s+/)[0]
          ?.toLowerCase() ?? '',
    )
    .filter(Boolean);

  const openerCounts =
    openers.reduce<Record<string, number>>(
      (acc, opener) => {
        acc[opener] =
          (acc[opener] ?? 0) + 1;
        return acc;
      },
      {},
    );

  const mostRepeatedOpener =
    Object.values(openerCounts).length > 0
      ? Math.max(
          ...Object.values(openerCounts),
        )
      : 0;

  const repeatedOpenerRatio =
    openers.length > 0
      ? mostRepeatedOpener /
        openers.length
      : 0;

  addCheck({
    id: 'verb-repetition',
    category: 'Experience impact',
    label: 'Bullet opener variety',
    score:
      repeatedOpenerRatio <= 0.4
        ? 2
        : repeatedOpenerRatio <= 0.6
          ? 1
          : 0,
    max: 2,
    reason:
      openers.length > 0
        ? `The most repeated bullet opener appears in ${Math.round(
            repeatedOpenerRatio * 100,
          )}% of experience bullets.`
        : 'No bullet openers were available to assess.',
    solution:
      repeatedOpenerRatio <= 0.3
        ? 'No change needed.'
        : 'Vary repeated action verbs while keeping wording truthful.',
    evidence:
      openers.length > 0
        ? `${mostRepeatedOpener}/${openers.length} same-opener maximum`
        : 'No bullets',
  });

  const punctuationEnding =
    experienceBullets.filter((bullet) =>
      /[.!?]$/.test(bullet.trim()),
    ).length;

  const punctuationRatio =
    expBulletCount > 0
      ? punctuationEnding / expBulletCount
      : 0;

  const punctuationConsistent =
    expBulletCount === 0 ||
    punctuationRatio >= 0.8 ||
    punctuationRatio <= 0.2;

  addCheck({
    id: 'bullet-consistency',
    category: 'Experience impact',
    label: 'Bullet punctuation consistency',
    score: punctuationConsistent ? 3 : 1,
    max: 3,
    reason:
      expBulletCount > 0
        ? `${Math.round(
            punctuationRatio * 100,
          )}% of experience bullets end with punctuation.`
        : 'No experience bullets were available to assess.',
    solution:
      punctuationConsistent
        ? 'No change needed.'
        : 'Use one consistent bullet punctuation style across the resume.',
    evidence:
      expBulletCount > 0
        ? `${punctuationEnding}/${expBulletCount} punctuated`
        : 'No bullets',
  });

  // =====================================================
  // CATEGORY 3 — CORE INFORMATION (25)
  // =====================================================

  const contactScore =
    (personal.full_name ? 4 : 0) +
    (personal.email ? 4 : 0) +
    (personal.phone ? 2 : 0);

  const missingContact = [
    !personal.full_name
      ? 'full name'
      : null,
    !personal.email ? 'email' : null,
    !personal.phone ? 'phone' : null,
  ].filter(Boolean);

  addCheck({
    id: 'essential-contact',
    category: 'Core information',
    label: 'Essential contact information',
    score: contactScore,
    max: 10,
    reason:
      missingContact.length === 0
        ? 'Full name, email and phone were detected.'
        : `Missing: ${missingContact.join(
            ', ',
          )}.`,
    solution:
      missingContact.length === 0
        ? 'No change needed. Location and LinkedIn are optional and do not affect this score.'
        : 'Place the missing essential contact field in plain text near the top of the resume.',
    evidence:
      missingContact.length === 0
        ? 'Name + email + phone detected'
        : `${10 - contactScore} points lost`,
  });

  const normalizedSkills = skills.map(
    (item) => item.normalized,
  );

  const uniqueSkills = new Set(
    normalizedSkills,
  ).size;

  const hardSkillRegex =
    /python|java|javascript|typescript|sql|aws|gcp|azure|react|node|fastapi|nest|spring|postgres|mysql|redis|docker|kubernetes|git|github|excel|tableau|power bi|figma|autocad|salesforce|sap|marketing|finance|accounting|operations|project management|data analysis|machine learning|cloud|api|prisma|firebase|supabase/i;

  const hardSkillCount = skills.filter(
    (item) =>
      hardSkillRegex.test(item.name),
  ).length;

  let coreSkillScore = 0;
  if (skills.length > 0) coreSkillScore += 3;
  if (skills.length >= 6) coreSkillScore += 2;
  else if (skills.length >= 3)
    coreSkillScore += 1;
  if (hardSkillCount >= 4)
    coreSkillScore += 2;
  else if (hardSkillCount > 0)
    coreSkillScore += 1;
  if (
    skills.length > 0 &&
    uniqueSkills === skills.length &&
    skills.length <= 45
  ) {
    coreSkillScore += 1;
  }

  addCheck({
    id: 'core-skills',
    category: 'Core information',
    label: 'Core skills section',
    score: Math.min(coreSkillScore, 8),
    max: 8,
    reason:
      skills.length > 0
        ? `${skills.length} skills detected, including ${hardSkillCount} recognizable hard-skill signals.`
        : 'No dedicated skills content was parsed.',
    solution:
      coreSkillScore >= 7
        ? 'No change needed. Job-specific keyword matching is handled separately in Smart Apply.'
        : 'Use a concise Skills section with defensible hard skills, tools and methodologies. Avoid duplicates and keyword stuffing.',
    evidence:
      skills.length > 0
        ? `${uniqueSkills} unique skills`
        : 'No skills parsed',
  });

  let educationScore = 0;
  const hasInstitution = education.some(
    (item) => item.institution,
  );
  const hasDegree = education.some(
    (item) => item.degree,
  );
  const hasMajor = education.some(
    (item) => item.field_of_study,
  );
  const hasGradDate = education.some(
    (item) => item.end_date,
  );

  if (education.length > 0)
    educationScore += 1;
  if (hasInstitution)
    educationScore += 2;
  if (hasDegree)
    educationScore += 2;
  if (hasMajor)
    educationScore += 1;
  if (hasGradDate)
    educationScore += 1;

  addCheck({
    id: 'education',
    category: 'Core information',
    label: 'Education completeness',
    score: educationScore,
    max: 7,
    reason: `Detected institution: ${
      hasInstitution ? 'yes' : 'no'
    }, degree: ${
      hasDegree ? 'yes' : 'no'
    }, major: ${
      hasMajor ? 'yes' : 'no'
    }, graduation date: ${
      hasGradDate ? 'yes' : 'no'
    }.`,
    solution:
      educationScore === 7
        ? 'No change needed.'
        : 'Use a standard Education entry with institution, degree, major and expected/completed graduation date.',
    evidence: `${education.length} education entr${
      education.length === 1
        ? 'y'
        : 'ies'
    } parsed`,
  });

  // =====================================================
  // CATEGORY 4 — CONSISTENCY & READABILITY (15)
  // =====================================================

  const chronologicalValues =
    experience.map((item) => {
      if (item.is_current)
        return 999999;
      return (
        dateValue(item.end_date) ??
        dateValue(item.start_date)
      );
    });

  const validChronological =
    chronologicalValues.filter(
      (
        value,
      ): value is number =>
        value !== null,
    );

  const reverseChronological =
    validChronological.every(
      (value, index) =>
        index === 0 ||
        validChronological[index - 1] >=
          value,
    );

  addCheck({
    id: 'reverse-chronological',
    category:
      'Consistency & readability',
    label: 'Reverse-chronological experience',
    score:
      experience.length <= 1 ||
      reverseChronological
        ? 4
        : 0,
    max: 4,
    reason:
      experience.length <= 1
        ? 'There are not enough roles to require chronology validation.'
        : reverseChronological
          ? 'Experience entries appear to be ordered from most recent to oldest.'
          : 'Experience dates do not appear to be in reverse-chronological order.',
    solution:
      experience.length <= 1 ||
      reverseChronological
        ? 'No change needed.'
        : 'Order experience from the most recent/current role backward.',
    evidence: `${experience.length} role(s) checked`,
  });

  const dateStrings = experience.flatMap(
    (item) =>
      [
        item.start_date,
        item.end_date,
      ].filter(
        (value): value is string =>
          Boolean(value),
      ),
  );

  const monthYearFormatted =
    dateStrings.filter(
      (value) =>
        /^(?:(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2}|(?:0?[1-9]|1[0-2])[/. -](?:19|20)\d{2}|present|current)$/i.test(
          value.trim(),
        ),
    ).length;

  const dateFormatRatio =
    dateStrings.length > 0
      ? monthYearFormatted /
        dateStrings.length
      : 1;

  addCheck({
    id: 'date-format-consistency',
    category:
      'Consistency & readability',
    label: 'Consistent date formatting',
    score:
      dateFormatRatio >= 0.9
        ? 3
        : dateFormatRatio >= 0.7
          ? 2
          : 0,
    max: 3,
    reason:
      dateStrings.length > 0
        ? `${monthYearFormatted}/${dateStrings.length} parsed dates follow a simple Month Year / Year / Present pattern.`
        : 'No dates were available to assess.',
    solution:
      dateFormatRatio >= 0.9
        ? 'No change needed.'
        : 'Use one consistent date style throughout the resume, such as “May 2026 – August 2026”, “05/2026 – 08/2026”, or a corresponding Present format.',
    evidence:
      dateStrings.length > 0
        ? `${Math.round(
            dateFormatRatio * 100,
          )}% consistent`
        : 'No dates',
  });

  const pageCount =
    metadata.page_count ?? null;

  addCheck({
    id: 'resume-length',
    category:
      'Consistency & readability',
    label: 'Resume length',
    score:
      pageCount === null ||
      pageCount <= 2
        ? 2
        : pageCount === 3
          ? 1
          : 0,
    max: 2,
    reason:
      pageCount === null
        ? 'Page count was not available; no penalty applied.'
        : `Resume length is ${pageCount} page${
            pageCount === 1 ? '' : 's'
          }.`,
    solution:
      pageCount === null ||
      pageCount <= 2
        ? 'No change needed.'
        : 'For student and early-career resumes, keep only relevant evidence and aim for 1–2 pages.',
    evidence:
      pageCount === null
        ? 'Page count unavailable'
        : `${pageCount} page(s)`,
  });

  const longParagraphs = rawText
    .split('\n')
    .map((line) =>
      line.trim().split(/\s+/).filter(Boolean)
        .length,
    )
    .filter((count) => count > 55).length;

  addCheck({
    id: 'dense-text',
    category:
      'Consistency & readability',
    label: 'Dense paragraph control',
    score:
      longParagraphs === 0
        ? 2
        : longParagraphs <= 2
          ? 1
          : 0,
    max: 2,
    reason:
      longParagraphs === 0
        ? 'No unusually dense extracted text lines were detected.'
        : `${longParagraphs} unusually dense text block${
            longParagraphs === 1 ? '' : 's'
          } detected.`,
    solution:
      longParagraphs === 0
        ? 'No change needed.'
        : 'Break dense resume content into concise bullets or shorter lines.',
    evidence: `${longParagraphs} dense block(s)`,
  });

  const nonStandardSections =
    normalizedRawSectionNames.filter(
      (name) =>
        name &&
        !standardSectionNames.has(name),
    );

  addCheck({
    id: 'standard-headings',
    category:
      'Consistency & readability',
    label: 'Standard section headings',
    score:
      nonStandardSections.length === 0
        ? 2
        : nonStandardSections.length <= 1
          ? 1
          : 0,
    max: 2,
    reason:
      nonStandardSections.length === 0
        ? 'Parsed section headings are standard or recognized.'
        : `Potential non-standard headings: ${nonStandardSections
            .slice(0, 3)
            .join(', ')}.`,
    solution:
      nonStandardSections.length === 0
        ? 'No change needed.'
        : 'Prefer conventional headings such as Work Experience, Skills, Education, Projects and Certifications.',
    evidence:
      normalizedRawSectionNames.length > 0
        ? normalizedRawSectionNames.join(
            ' · ',
          )
        : 'Section metadata unavailable',
  });

  const score = checks.reduce(
    (sum, check) => sum + check.score,
    0,
  );

  const categoryOrder = [
    'ATS parsing & structure',
    'Experience impact',
    'Core information',
    'Consistency & readability',
  ];

  const breakdown =
    categoryOrder.map((category) => {
      const categoryChecks =
        checks.filter(
          (check) =>
            check.category === category,
        );

      return {
        label: category,
        score: categoryChecks.reduce(
          (sum, check) =>
            sum + check.score,
          0,
        ),
        max: categoryChecks.reduce(
          (sum, check) =>
            sum + check.max,
          0,
        ),
      };
    });

  const recommendations = checks
    .filter(
      (check) =>
        check.score < check.max,
    )
    .sort((a, b) => {
      const lostA = a.max - a.score;
      const lostB = b.max - b.score;

      if (lostB !== lostA)
        return lostB - lostA;

      if (
        a.severity !== b.severity
      ) {
        return a.severity === 'high'
          ? -1
          : 1;
      }

      return a.label.localeCompare(
        b.label,
      );
    });

  const optionalSignals: string[] = [];

  if (
    (resume.certifications?.length ??
      0) > 0
  ) {
    optionalSignals.push(
      `${resume.certifications?.length} certification${
        resume.certifications?.length ===
        1
          ? ''
          : 's'
      } detected`,
    );
  }

  if (
    (resume.achievements?.length ??
      0) > 0
  ) {
    optionalSignals.push(
      `${resume.achievements?.length} achievement${
        resume.achievements?.length ===
        1
          ? ''
          : 's'
      } detected`,
    );
  }

  const researchCount =
    (resume.research?.length ?? 0) +
    (resume.publications?.length ?? 0);

  if (researchCount > 0) {
    optionalSignals.push(
      `${researchCount} research/publication signal${
        researchCount === 1
          ? ''
          : 's'
      } detected`,
    );
  }

  return {
    score,
    breakdown,
    checks,
    recommendations,
    optionalSignals,
  };
}


/* =========================================================
   RESUMES
========================================================= */

type MasterProfileEducation = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  cgpa: string;
};

type MasterProfileExperience = {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  technologies: string[];
};

type MasterProfileProject = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  bullets: string[];
  technologies: string[];
  link: string;
};

type MasterResumeProfile = {
  id: string;
  source: 'uploaded' | 'manual';
  updatedAt: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  education: MasterProfileEducation[];
  experience: MasterProfileExperience[];
  projects: MasterProfileProject[];
  skills: string[];
  certifications: string[];
  achievements: string[];
  research: string[];
  publications: string[];
};

type StudioResumeVersion = {
  id: string;
  name: string;
  targetRole: string;
  company: string;
  jobDescription: string;
  createdAt: string;
  updatedAt: string;
  sourceProfileUpdatedAt: string;
  source: 'manual' | 'smart-apply';
  fitScore?: number;
  profileSnapshot: MasterResumeProfile;

  // Live Smart Apply / backend generation metadata.
  backendVersionId?: string;
  claimValidationPassed?: boolean;
  jobUrl?: string;
  generatedDocx?: boolean;
  tailoredResume?: Record<string, unknown>;
};

const MASTER_PROFILE_STORAGE_KEY =
  'roleclear_master_resume_profile_v1';

const RESUME_STUDIO_STORAGE_KEY =
  'roleclear_resume_versions_v2';

function studioId(prefix: string) {
  return typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

function emptyMasterProfile(): MasterResumeProfile {
  return {
    id: studioId('profile'),
    source: 'manual',
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    research: [],
    publications: [],
  };
}

function textLines(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function csvValues(value: string) {
  return value
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsedResumeToMasterProfile(
  resume: Record<string, unknown>,
): MasterResumeProfile {
  const parsed = resume as {
    personal_info?: {
      full_name?: string | null;
      email?: string | null;
      phone?: string | null;
      location?: string | null;
      linkedin?: string | null;
      github?: string | null;
      portfolio?: string | null;
    };
    summary?: string | null;
    skills?: Record<string, { name?: string }[]>;
    experience?: {
      company?: string | null;
      title?: string | null;
      location?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      bullets?: string[];
      technologies?: string[];
    }[];
    projects?: {
      name?: string | null;
      subtitle?: string | null;
      description?: string | null;
      bullets?: string[];
      technologies?: string[];
      link?: string | null;
    }[];
    education?: {
      institution?: string | null;
      degree?: string | null;
      field_of_study?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      cgpa?: string | number | null;
      gpa?: string | number | null;
    }[];
    certifications?: (
      | string
      | { name?: string; issuer?: string }
    )[];
    achievements?: string[];
    research?: string[];
    publications?: string[];
  };

  const personal = parsed.personal_info ?? {};

  const skills = Array.from(
    new Set(
      Object.values(parsed.skills ?? {})
        .flatMap((items) => items ?? [])
        .map((item) => item.name?.trim() ?? '')
        .filter(Boolean),
    ),
  );

  const certifications = (parsed.certifications ?? [])
    .map((item) =>
      typeof item === 'string'
        ? item
        : [item.name, item.issuer]
            .filter(Boolean)
            .join(' — '),
    )
    .filter(Boolean);

  return {
    id: studioId('profile'),
    source: 'uploaded',
    updatedAt: new Date().toISOString(),
    personal: {
      fullName: personal.full_name ?? '',
      email: personal.email ?? '',
      phone: personal.phone ?? '',
      location: personal.location ?? '',
      linkedin: personal.linkedin ?? '',
      github: personal.github ?? '',
      portfolio: personal.portfolio ?? '',
    },
    summary: parsed.summary ?? '',
    education: (parsed.education ?? []).map((item) => ({
      id: studioId('edu'),
      institution: item.institution ?? '',
      degree: item.degree ?? '',
      field: item.field_of_study ?? '',
      startDate: item.start_date ?? '',
      endDate: item.end_date ?? '',
      cgpa: String(item.cgpa ?? item.gpa ?? ''),
    })),
    experience: (parsed.experience ?? []).map((item) => ({
      id: studioId('exp'),
      company: item.company ?? '',
      title: item.title ?? '',
      location: item.location ?? '',
      startDate: item.start_date ?? '',
      endDate: item.end_date ?? '',
      bullets: [...(item.bullets ?? [])],
      technologies: [...(item.technologies ?? [])],
    })),
    projects: (parsed.projects ?? []).map((item) => ({
      id: studioId('project'),
      name: item.name ?? '',
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      bullets: [...(item.bullets ?? [])],
      technologies: [...(item.technologies ?? [])],
      link: item.link ?? '',
    })),
    skills,
    certifications,
    achievements: [...(parsed.achievements ?? [])],
    research: [...(parsed.research ?? [])],
    publications: [...(parsed.publications ?? [])],
  };
}

function profileCompletion(profile: MasterResumeProfile) {
  const checks = [
    Boolean(profile.personal.fullName),
    Boolean(profile.personal.email),
    profile.education.length > 0,
    profile.skills.length > 0,
    profile.experience.length > 0 ||
      profile.projects.length > 0,
    profile.experience.some(
      (item) => item.bullets.length > 0,
    ) ||
      profile.projects.some(
        (item) => item.bullets.length > 0,
      ),
  ];

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );
}

function MasterProfileEditor({
  profile,
  onChange,
  onSave,
  onCancel,
}: {
  profile: MasterResumeProfile;
  onChange: (profile: MasterResumeProfile) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const updatePersonal = (
    key: keyof MasterResumeProfile['personal'],
    value: string,
  ) => {
    onChange({
      ...profile,
      personal: {
        ...profile.personal,
        [key]: value,
      },
    });
  };

  const updateEducation = (
    id: string,
    patch: Partial<MasterProfileEducation>,
  ) => {
    onChange({
      ...profile,
      education: profile.education.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  };

  const updateExperience = (
    id: string,
    patch: Partial<MasterProfileExperience>,
  ) => {
    onChange({
      ...profile,
      experience: profile.experience.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  };

  const updateProject = (
    id: string,
    patch: Partial<MasterProfileProject>,
  ) => {
    onChange({
      ...profile,
      projects: profile.projects.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  };

  return (
    <section className="master-profile-editor">
      <div className="master-profile-editor-head">
        <div>
          <span className="mini-label">MASTER RESUME PROFILE</span>
          <h2>
            {profile.source === 'uploaded'
              ? 'Review imported resume data'
              : 'Build your resume profile'}
          </h2>
          <p>
            This verified profile becomes the source of truth for every
            resume you create in RoleClear.
          </p>
        </div>

        <button className="view-link" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <ProfileSection
        number="01"
        title="Personal information"
        subtitle="Contact details used across resume versions."
      >
        <div className="profile-form-grid">
          <ProfileInput
            label="Full name"
            value={profile.personal.fullName}
            onChange={(value) => updatePersonal('fullName', value)}
          />
          <ProfileInput
            label="Email"
            value={profile.personal.email}
            onChange={(value) => updatePersonal('email', value)}
          />
          <ProfileInput
            label="Phone"
            value={profile.personal.phone}
            onChange={(value) => updatePersonal('phone', value)}
          />
          <ProfileInput
            label="Location"
            value={profile.personal.location}
            onChange={(value) => updatePersonal('location', value)}
          />
          <ProfileInput
            label="LinkedIn"
            value={profile.personal.linkedin}
            onChange={(value) => updatePersonal('linkedin', value)}
          />
          <ProfileInput
            label="GitHub"
            value={profile.personal.github}
            onChange={(value) => updatePersonal('github', value)}
          />
          <ProfileInput
            label="Portfolio"
            value={profile.personal.portfolio}
            onChange={(value) => updatePersonal('portfolio', value)}
          />
        </div>
      </ProfileSection>

      <ProfileSection
        number="02"
        title="Professional summary"
        subtitle="Keep this factual. Role-specific versions can refine it later."
      >
        <textarea
          className="profile-textarea"
          value={profile.summary}
          onChange={(event) =>
            onChange({
              ...profile,
              summary: event.target.value,
            })
          }
          rows={5}
          placeholder="Optional master professional summary..."
        />
      </ProfileSection>

      <ProfileSection
        number="03"
        title="Education"
        subtitle="Add every degree you may want available to a future resume."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              onChange({
                ...profile,
                education: [
                  ...profile.education,
                  {
                    id: studioId('edu'),
                    institution: '',
                    degree: '',
                    field: '',
                    startDate: '',
                    endDate: '',
                    cgpa: '',
                  },
                ],
              })
            }
          >
            <Plus size={14} />
            Add education
          </Button>
        }
      >
        {profile.education.length === 0 ? (
          <ProfileEmpty text="No education added yet." />
        ) : (
          profile.education.map((item, index) => (
            <div className="profile-record" key={item.id}>
              <div className="profile-record-head">
                <b>Education {index + 1}</b>
                <button
                  onClick={() =>
                    onChange({
                      ...profile,
                      education: profile.education.filter(
                        (entry) => entry.id !== item.id,
                      ),
                    })
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="profile-form-grid">
                <ProfileInput
                  label="Institution"
                  value={item.institution}
                  onChange={(value) =>
                    updateEducation(item.id, {
                      institution: value,
                    })
                  }
                />
                <ProfileInput
                  label="Degree"
                  value={item.degree}
                  onChange={(value) =>
                    updateEducation(item.id, {
                      degree: value,
                    })
                  }
                />
                <ProfileInput
                  label="Field / Major"
                  value={item.field}
                  onChange={(value) =>
                    updateEducation(item.id, {
                      field: value,
                    })
                  }
                />
                <ProfileInput
                  label="CGPA / GPA"
                  value={item.cgpa}
                  onChange={(value) =>
                    updateEducation(item.id, {
                      cgpa: value,
                    })
                  }
                />
                <ProfileInput
                  label="Start date"
                  value={item.startDate}
                  onChange={(value) =>
                    updateEducation(item.id, {
                      startDate: value,
                    })
                  }
                />
                <ProfileInput
                  label="End date"
                  value={item.endDate}
                  onChange={(value) =>
                    updateEducation(item.id, {
                      endDate: value,
                    })
                  }
                />
              </div>
            </div>
          ))
        )}
      </ProfileSection>

      <ProfileSection
        number="04"
        title="Experience"
        subtitle="Store factual responsibilities, contributions and measurable outcomes."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              onChange({
                ...profile,
                experience: [
                  ...profile.experience,
                  {
                    id: studioId('exp'),
                    company: '',
                    title: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    bullets: [],
                    technologies: [],
                  },
                ],
              })
            }
          >
            <Plus size={14} />
            Add experience
          </Button>
        }
      >
        {profile.experience.length === 0 ? (
          <ProfileEmpty text="No experience added yet. This is optional for students." />
        ) : (
          profile.experience.map((item, index) => (
            <div className="profile-record" key={item.id}>
              <div className="profile-record-head">
                <b>Experience {index + 1}</b>
                <button
                  onClick={() =>
                    onChange({
                      ...profile,
                      experience: profile.experience.filter(
                        (entry) => entry.id !== item.id,
                      ),
                    })
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="profile-form-grid">
                <ProfileInput
                  label="Company"
                  value={item.company}
                  onChange={(value) =>
                    updateExperience(item.id, {
                      company: value,
                    })
                  }
                />
                <ProfileInput
                  label="Role / Title"
                  value={item.title}
                  onChange={(value) =>
                    updateExperience(item.id, {
                      title: value,
                    })
                  }
                />
                <ProfileInput
                  label="Location"
                  value={item.location}
                  onChange={(value) =>
                    updateExperience(item.id, {
                      location: value,
                    })
                  }
                />
                <ProfileInput
                  label="Start date"
                  value={item.startDate}
                  onChange={(value) =>
                    updateExperience(item.id, {
                      startDate: value,
                    })
                  }
                />
                <ProfileInput
                  label="End date"
                  value={item.endDate}
                  onChange={(value) =>
                    updateExperience(item.id, {
                      endDate: value,
                    })
                  }
                />
              </div>

              <ProfileTextList
                label="Bullets"
                hint="One bullet per line"
                value={item.bullets.join('\n')}
                onChange={(value) =>
                  updateExperience(item.id, {
                    bullets: textLines(value),
                  })
                }
              />

              <ProfileTextList
                label="Technologies / tools"
                hint="Comma separated"
                value={item.technologies.join(', ')}
                onChange={(value) =>
                  updateExperience(item.id, {
                    technologies: csvValues(value),
                  })
                }
                rows={2}
              />
            </div>
          ))
        )}
      </ProfileSection>

      <ProfileSection
        number="05"
        title="Projects"
        subtitle="Projects are especially important when professional experience is limited."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              onChange({
                ...profile,
                projects: [
                  ...profile.projects,
                  {
                    id: studioId('project'),
                    name: '',
                    subtitle: '',
                    description: '',
                    bullets: [],
                    technologies: [],
                    link: '',
                  },
                ],
              })
            }
          >
            <Plus size={14} />
            Add project
          </Button>
        }
      >
        {profile.projects.length === 0 ? (
          <ProfileEmpty text="No projects added yet." />
        ) : (
          profile.projects.map((item, index) => (
            <div className="profile-record" key={item.id}>
              <div className="profile-record-head">
                <b>Project {index + 1}</b>
                <button
                  onClick={() =>
                    onChange({
                      ...profile,
                      projects: profile.projects.filter(
                        (entry) => entry.id !== item.id,
                      ),
                    })
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="profile-form-grid">
                <ProfileInput
                  label="Project name"
                  value={item.name}
                  onChange={(value) =>
                    updateProject(item.id, {
                      name: value,
                    })
                  }
                />
                <ProfileInput
                  label="Subtitle"
                  value={item.subtitle}
                  onChange={(value) =>
                    updateProject(item.id, {
                      subtitle: value,
                    })
                  }
                />
                <ProfileInput
                  label="Link"
                  value={item.link}
                  onChange={(value) =>
                    updateProject(item.id, {
                      link: value,
                    })
                  }
                />
              </div>

              <ProfileTextList
                label="Description"
                hint="Optional short description"
                value={item.description}
                onChange={(value) =>
                  updateProject(item.id, {
                    description: value,
                  })
                }
                rows={3}
              />

              <ProfileTextList
                label="Bullets"
                hint="One bullet per line"
                value={item.bullets.join('\n')}
                onChange={(value) =>
                  updateProject(item.id, {
                    bullets: textLines(value),
                  })
                }
              />

              <ProfileTextList
                label="Technologies / tools"
                hint="Comma separated"
                value={item.technologies.join(', ')}
                onChange={(value) =>
                  updateProject(item.id, {
                    technologies: csvValues(value),
                  })
                }
                rows={2}
              />
            </div>
          ))
        )}
      </ProfileSection>

      <ProfileSection
        number="06"
        title="Skills"
        subtitle="Store the full verified skill inventory. RoleClear will prioritize relevant skills later."
      >
        <ProfileTextList
          label="Skills"
          hint="Comma separated"
          value={profile.skills.join(', ')}
          onChange={(value) =>
            onChange({
              ...profile,
              skills: csvValues(value),
            })
          }
          rows={4}
        />
      </ProfileSection>

      <ProfileSection
        number="07"
        title="Additional evidence"
        subtitle="Certifications, achievements and research can be selectively included later."
      >
        <div className="profile-form-grid profile-form-grid-lists">
          <ProfileTextList
            label="Certifications"
            hint="One per line"
            value={profile.certifications.join('\n')}
            onChange={(value) =>
              onChange({
                ...profile,
                certifications: textLines(value),
              })
            }
          />

          <ProfileTextList
            label="Achievements"
            hint="One per line"
            value={profile.achievements.join('\n')}
            onChange={(value) =>
              onChange({
                ...profile,
                achievements: textLines(value),
              })
            }
          />

          <ProfileTextList
            label="Research"
            hint="One per line"
            value={profile.research.join('\n')}
            onChange={(value) =>
              onChange({
                ...profile,
                research: textLines(value),
              })
            }
          />

          <ProfileTextList
            label="Publications"
            hint="One per line"
            value={profile.publications.join('\n')}
            onChange={(value) =>
              onChange({
                ...profile,
                publications: textLines(value),
              })
            }
          />
        </div>
      </ProfileSection>

      <div className="master-profile-savebar">
        <div>
          <ShieldCheck size={17} />
          <span>
            Save only information you can verify. Future tailoring will
            use this profile as its evidence boundary.
          </span>
        </div>

        <Button onClick={onSave}>
          <Save size={16} />
          Save Master Profile
        </Button>
      </div>
    </section>
  );
}

function ProfileSection({
  number,
  title,
  subtitle,
  action,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="profile-section">
      <div className="profile-section-head">
        <div className="profile-section-number">{number}</div>

        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        {action && (
          <div className="profile-section-action">{action}</div>
        )}
      </div>

      <div className="profile-section-body">{children}</div>
    </section>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="profile-input">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ProfileTextList({
  label,
  hint,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="profile-text-list">
      <div>
        <span>{label}</span>
        <small>{hint}</small>
      </div>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ProfileEmpty({ text }: { text: string }) {
  return <div className="profile-empty">{text}</div>;
}

function Resumes({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const currentResume = useCareerStore(
    (state) => state.currentResume,
  );
  const currentAnalysis = useCareerStore(
    (state) => state.currentAnalysis,
  );
  const currentJob = useCareerStore(
    (state) => state.currentJob,
  );

  const [masterProfile, setMasterProfile] =
    useState<MasterResumeProfile | null>(() => {
      try {
        const stored = localStorage.getItem(
          MASTER_PROFILE_STORAGE_KEY,
        );

        return stored
          ? (JSON.parse(stored) as MasterResumeProfile)
          : null;
      } catch {
        return null;
      }
    });

  const [profileDraft, setProfileDraft] =
    useState<MasterResumeProfile | null>(null);

  const [profileMode, setProfileMode] =
    useState<
      'choose' | 'edit' | 'closed'
    >(masterProfile ? 'closed' : 'choose');

  const [versions, setVersions] = useState<
    StudioResumeVersion[]
  >(() => {
    try {
      const stored = localStorage.getItem(
        RESUME_STUDIO_STORAGE_KEY,
      );

      return stored
        ? (JSON.parse(stored) as StudioResumeVersion[])
        : [];
    } catch {
      return [];
    }
  });

  const [showBuilder, setShowBuilder] =
    useState(false);
  const [targetRole, setTargetRole] =
    useState('');
  const [company, setCompany] =
    useState('');
  const [jobDescription, setJobDescription] =
    useState('');
  const [resumeName, setResumeName] =
    useState('');

  const saveVersions = (
    next: StudioResumeVersion[],
  ) => {
    setVersions(next);
    localStorage.setItem(
      RESUME_STUDIO_STORAGE_KEY,
      JSON.stringify(next),
    );
  };

  const importUploadedResume = () => {
    if (!currentResume) return;

    const imported = parsedResumeToMasterProfile(
      currentResume as Record<string, unknown>,
    );

    setProfileDraft(imported);
    setProfileMode('edit');
  };

  const startManualProfile = () => {
    setProfileDraft(emptyMasterProfile());
    setProfileMode('edit');
  };

  const editMasterProfile = () => {
    if (!masterProfile) return;

    setProfileDraft(
      JSON.parse(
        JSON.stringify(masterProfile),
      ) as MasterResumeProfile,
    );
    setProfileMode('edit');
  };

  const saveMasterProfile = () => {
    if (!profileDraft) return;

    const saved: MasterResumeProfile = {
      ...profileDraft,
      updatedAt: new Date().toISOString(),
    };

    setMasterProfile(saved);
    localStorage.setItem(
      MASTER_PROFILE_STORAGE_KEY,
      JSON.stringify(saved),
    );
    setProfileDraft(null);
    setProfileMode('closed');
  };

  const deleteMasterProfile = () => {
    localStorage.removeItem(
      MASTER_PROFILE_STORAGE_KEY,
    );
    setMasterProfile(null);
    setProfileDraft(null);
    setProfileMode('choose');
    setShowBuilder(false);
  };

  const useLatestSmartApply = () => {
    if (!currentJob) return;

    setTargetRole(currentJob.title ?? '');
    setCompany(currentJob.company ?? '');
    setJobDescription(
      [
        currentJob.rawDescription,
        ...(currentJob.qualifications ?? []),
        ...(currentJob.responsibilities ?? []),
      ]
        .filter(Boolean)
        .join('\n'),
    );

    setResumeName(
      `${currentJob.title ?? 'Role'}${
        currentJob.company
          ? ` — ${currentJob.company}`
          : ''
      }`,
    );
  };

  const createVersion = () => {
    if (!masterProfile || !targetRole.trim()) {
      return;
    }

    const version: StudioResumeVersion = {
      id: studioId('resume'),
      name:
        resumeName.trim() ||
        `${targetRole.trim()} Resume`,
      targetRole: targetRole.trim(),
      company: company.trim(),
      jobDescription: jobDescription.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceProfileUpdatedAt:
        masterProfile.updatedAt,
      source:
        currentJob &&
        targetRole.trim() === currentJob.title
          ? 'smart-apply'
          : 'manual',
      fitScore:
        currentAnalysis &&
        currentJob &&
        targetRole.trim() === currentJob.title
          ? currentAnalysis.resumeFit
          : undefined,
      profileSnapshot: JSON.parse(
        JSON.stringify(masterProfile),
      ) as MasterResumeProfile,
    };

    saveVersions([version, ...versions]);

    setShowBuilder(false);
    setTargetRole('');
    setCompany('');
    setJobDescription('');
    setResumeName('');
  };

  const deleteVersion = (id: string) => {
    saveVersions(
      versions.filter((version) => version.id !== id),
    );
  };

  const completion = masterProfile
    ? profileCompletion(masterProfile)
    : 0;

  if (profileMode === 'edit' && profileDraft) {
    return (
      <MasterProfileEditor
        profile={profileDraft}
        onChange={setProfileDraft}
        onSave={saveMasterProfile}
        onCancel={() => {
          setProfileDraft(null);
          setProfileMode(
            masterProfile ? 'closed' : 'choose',
          );
        }}
      />
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Your career story"
        title="Resume Studio"
        subtitle="Maintain one verified career profile, then create tailored resumes for different jobs."
        action={
          masterProfile ? (
            <Button
              onClick={() => setShowBuilder(true)}
            >
              <Plus size={17} />
              Create Resume
            </Button>
          ) : undefined
        }
      />

      {!masterProfile && profileMode === 'choose' ? (
        <section className="resume-start-panel">
          <div className="resume-start-copy">
            <span className="mini-label">
              SET UP YOUR MASTER PROFILE
            </span>
            <h2>
              How would you like to start?
            </h2>
            <p>
              Your Master Profile is the verified source of truth for
              every resume you generate later.
            </p>
          </div>

          <div className="resume-start-options">
            <button
              className={`resume-start-option ${
                currentResume
                  ? ''
                  : 'resume-start-option-disabled'
              }`}
              disabled={!currentResume}
              onClick={importUploadedResume}
            >
              <div className="resume-start-icon">
                <Upload size={22} />
              </div>

              <div>
                <b>Use my uploaded resume</b>
                <span>
                  Import the resume already parsed by RoleClear, review
                  the extracted data, then save it as your Master
                  Profile.
                </span>
                {!currentResume && (
                  <small>
                    Upload a resume in ATS Checker or Smart Apply first.
                  </small>
                )}
              </div>

              <ArrowUpRight size={18} />
            </button>

            <button
              className="resume-start-option"
              onClick={startManualProfile}
            >
              <div className="resume-start-icon">
                <FileText size={22} />
              </div>

              <div>
                <b>Build from scratch</b>
                <span>
                  Enter your education, experience, projects, skills and
                  achievements directly in RoleClear. No upload is
                  required.
                </span>
              </div>

              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
      ) : (
        masterProfile && (
          <>
            <section className="master-profile-summary">
              <div className="master-profile-summary-main">
                <div className="master-profile-summary-icon">
                  <UserRound size={22} />
                </div>

                <div>
                  <span className="mini-label">
                    MASTER RESUME PROFILE
                  </span>
                  <h2>
                    {masterProfile.personal.fullName ||
                      'Your verified profile'}
                  </h2>
                  <p>
                    {masterProfile.source === 'uploaded'
                      ? 'Created from an uploaded resume and saved as structured RoleClear data.'
                      : 'Created manually inside Resume Studio.'}
                  </p>
                </div>
              </div>

              <div className="master-profile-completion">
                <strong>{completion}%</strong>
                <span>profile readiness</span>
                <div>
                  <i
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>
              </div>

              <div className="master-profile-actions">
                <Button
                  variant="secondary"
                  onClick={editMasterProfile}
                >
                  Edit Profile
                </Button>

                <Button
                  variant="ghost"
                  onClick={deleteMasterProfile}
                >
                  <Trash2 size={15} />
                  Reset
                </Button>
              </div>
            </section>

            <div className="profile-stat-grid">
              <ProfileStat
                label="Education"
                value={masterProfile.education.length}
              />
              <ProfileStat
                label="Experience"
                value={masterProfile.experience.length}
              />
              <ProfileStat
                label="Projects"
                value={masterProfile.projects.length}
              />
              <ProfileStat
                label="Skills"
                value={masterProfile.skills.length}
              />
              <ProfileStat
                label="Certifications"
                value={masterProfile.certifications.length}
              />
              <ProfileStat
                label="Achievements"
                value={masterProfile.achievements.length}
              />
            </div>

            {showBuilder && (
              <section className="resume-sheet-card">
                <div className="resume-sheet-header">
                  <div>
                    <span className="mini-label">
                      CREATE TARGETED RESUME
                    </span>
                    <h2>Choose the target job</h2>
                    <p>
                      This version will use only evidence from your saved
                      Master Profile.
                    </p>
                  </div>

                  <button
                    className="view-link"
                    onClick={() => setShowBuilder(false)}
                  >
                    Cancel
                  </button>
                </div>

                {currentJob && (
                  <div className="resume-sheet-smart-apply">
                    <div>
                      <Zap size={18} />
                      <div>
                        <b>Use latest Smart Apply job</b>
                        <span>
                          Prefill role, company and JD from your latest
                          analysis.
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={useLatestSmartApply}
                    >
                      Use job
                      <ArrowUpRight size={15} />
                    </Button>
                  </div>
                )}

                <div className="resume-sheet-grid">
                  <div className="resume-sheet-row">
                    <div className="resume-sheet-label">
                      Target role
                      <span>*</span>
                    </div>
                    <div className="resume-sheet-cell">
                      <input
                        value={targetRole}
                        onChange={(event) =>
                          setTargetRole(event.target.value)
                        }
                        placeholder="e.g. Global Investment Banking Summer Analyst"
                      />
                    </div>
                  </div>

                  <div className="resume-sheet-row">
                    <div className="resume-sheet-label">
                      Company
                    </div>
                    <div className="resume-sheet-cell">
                      <input
                        value={company}
                        onChange={(event) =>
                          setCompany(event.target.value)
                        }
                        placeholder="e.g. Bank of America"
                      />
                    </div>
                  </div>

                  <div className="resume-sheet-row">
                    <div className="resume-sheet-label">
                      Resume name
                    </div>
                    <div className="resume-sheet-cell">
                      <input
                        value={resumeName}
                        onChange={(event) =>
                          setResumeName(event.target.value)
                        }
                        placeholder="e.g. BofA Investment Banking Resume"
                      />
                    </div>
                  </div>

                  <div className="resume-sheet-row resume-sheet-row-large">
                    <div className="resume-sheet-label">
                      Job description
                      <small>
                        Paste full JD / requirements
                      </small>
                    </div>
                    <div className="resume-sheet-cell">
                      <textarea
                        value={jobDescription}
                        onChange={(event) =>
                          setJobDescription(event.target.value)
                        }
                        rows={10}
                        placeholder="Paste the complete job description here..."
                      />
                    </div>
                  </div>
                </div>

                <div className="resume-sheet-footer">
                  <div className="resume-sheet-safety">
                    <ShieldCheck size={16} />
                    <span>
                      Next, RoleClear will analyze this JD against the
                      Master Profile before any resume wording is
                      changed.
                    </span>
                  </div>

                  <Button
                    onClick={createVersion}
                    disabled={!targetRole.trim()}
                  >
                    <Save size={16} />
                    Save Target
                  </Button>
                </div>
              </section>
            )}

            <div className="section-row">
              <div>
                <h2>Saved resume targets</h2>
                <p
                  style={{
                    margin: '4px 0 0',
                    opacity: 0.62,
                    fontSize: '0.86rem',
                  }}
                >
                  Smart Apply generated versions are immutable snapshots.
                  Each version keeps its backend ID, fit score and source
                  profile so you know exactly what you used.
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowBuilder(true)}
              >
                <Plus size={15} />
                Create Resume
              </Button>
            </div>

            {versions.length > 0 ? (
              <div className="version-grid">
                {versions.map((version) => {
                  const profileChanged =
                    masterProfile.updatedAt !==
                    version.sourceProfileUpdatedAt;

                  return (
                    <div className="version-card" key={version.id}>
                      <div className="version-icon">
                        <FileText size={20} />
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <b>{version.name}</b>
                        <span>
                          {[version.targetRole, version.company]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                        <small>
                          Created{' '}
                          {new Date(
                            version.createdAt,
                          ).toLocaleDateString()}
                        </small>

                        {version.backendVersionId && (
                          <small
                            style={{
                              display: 'block',
                              marginTop: '5px',
                              opacity: 0.7,
                            }}
                          >
                            Version {version.backendVersionId.slice(0, 8)}
                            {version.claimValidationPassed
                              ? ' · claim validation passed'
                              : ''}
                          </small>
                        )}

                        {profileChanged && (
                          <small
                            style={{
                              display: 'block',
                              marginTop: '5px',
                              color: '#a66600',
                            }}
                          >
                            Master Profile changed since this target was
                            created.
                          </small>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '10px',
                          }}
                        >
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setTargetRole(version.targetRole);
                              setCompany(version.company);
                              setJobDescription(
                                version.jobDescription,
                              );
                              setResumeName(version.name);
                              setShowBuilder(true);
                            }}
                          >
                            Open Target
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={() =>
                              deleteVersion(version.id)
                            }
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {version.fitScore !== undefined && (
                        <strong>{version.fitScore}%</strong>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                className="new-version"
                onClick={() => setShowBuilder(true)}
              >
                <Plus size={20} />
                <b>Create your first targeted resume</b>
                <span>
                  Add a role and JD. RoleClear will compare it with your
                  Master Profile in the next stage.
                </span>
              </button>
            )}
          </>
        )
      )}
    </>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="profile-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   INBOX
========================================================= */

const EMAIL_API_BASE =
  'http://127.0.0.1:8000/api/v1/email';

type GmailConnectionStatus = {
  connected: boolean;
  email: string | null;
};

type GmailSyncedMessage = {
  id: string;
  thread_id: string;
  subject: string;
  sender: string;
  date: string;
  snippet: string;
  body_text: string;
};

async function fetchGmailStatus(): Promise<GmailConnectionStatus> {
  const response = await fetch(
    `${EMAIL_API_BASE}/gmail/status`,
  );

  if (!response.ok) {
    throw new Error(
      'Could not read Gmail connection status.',
    );
  }

  return response.json();
}

async function startGmailOAuth(): Promise<Window> {
  const response = await fetch(
    `${EMAIL_API_BASE}/gmail/authorize`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ??
        'Could not start Gmail connection.',
    );
  }

  const popup = window.open(
    data.authorization_url,
    'roleclear-gmail-oauth',
    'popup,width=560,height=720',
  );

  if (!popup) {
    throw new Error(
      'Browser blocked the Gmail sign-in popup. Allow popups for RoleClear and try again.',
    );
  }

  return popup;
}

async function waitForGmailConnection(
  popup: Window,
  timeoutMs = 120000,
): Promise<GmailConnectionStatus> {
  const startedAt = Date.now();

  while (
    Date.now() - startedAt < timeoutMs
  ) {
    await new Promise((resolve) =>
      window.setTimeout(resolve, 1000),
    );

    try {
      const status =
        await fetchGmailStatus();

      if (status.connected) {
        return status;
      }
    } catch {
      // Backend may briefly be unavailable during OAuth callback.
    }

    if (popup.closed) {
      const finalStatus =
        await fetchGmailStatus();

      if (finalStatus.connected) {
        return finalStatus;
      }

      throw new Error(
        'Gmail sign-in window closed before the connection completed.',
      );
    }
  }

  throw new Error(
    'Gmail connection timed out. Please try again.',
  );
}

async function syncGmailMessages(): Promise<GmailSyncedMessage[]> {
  const response = await fetch(
    `${EMAIL_API_BASE}/gmail/sync?max_results=60`,
    {
      method: 'POST',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ??
        'Could not sync Gmail.',
    );
  }

  return data.messages ?? [];
}

function openGmailMessage(
  messageId: string,
  accountEmail?: string | null,
) {
  const authUser = accountEmail
    ? `?authuser=${encodeURIComponent(accountEmail)}`
    : '';

  const url =
    `https://mail.google.com/mail/u/0/${authUser}#all/${encodeURIComponent(messageId)}`;

  window.open(
    url,
    '_blank',
    'noopener,noreferrer',
  );
}

async function disconnectGmail(): Promise<void> {
  const response = await fetch(
    `${EMAIL_API_BASE}/gmail/disconnect`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(
      'Could not disconnect Gmail.',
    );
  }
}

function InboxView({
  setView,
}: {
  setView: (view: View) => void;
}) {
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

  const addCareerInboxEvent =
    useCareerStore(
      (state) =>
        state.addCareerInboxEvent,
    );

  const markCareerInboxEventRead =
    useCareerStore(
      (state) =>
        state.markCareerInboxEventRead,
    );

  const deleteCareerInboxEvent =
    useCareerStore(
      (state) =>
        state.deleteCareerInboxEvent,
    );

  const applyCareerInboxEventStatus =
    useCareerStore(
      (state) =>
        state.applyCareerInboxEventStatus,
    );

  const setSelectedApplication =
    useCareerStore(
      (state) =>
        state.setSelectedApplication,
    );

  const [activeTab, setActiveTab] =
    useState<
      | 'All'
      | 'Application'
      | 'Interview'
      | 'Offer'
      | 'Rejection'
      | 'Recruiter'
    >('All');

  const [showImporter, setShowImporter] =
    useState(false);

  const [applicationId, setApplicationId] =
    useState('');

  const [title, setTitle] =
    useState('');

  const [sender, setSender] =
    useState('');

  const [snippet, setSnippet] =
    useState('');

  const [gmailStatus, setGmailStatus] =
    useState<GmailConnectionStatus>({
      connected: false,
      email: null,
    });

  const [gmailBusy, setGmailBusy] =
    useState(false);

  const [gmailMessage, setGmailMessage] =
    useState('');

  const inferUpdate = (
    input: string,
  ): {
    type:
      | 'Application'
      | 'Interview'
      | 'Offer'
      | 'Rejection'
      | 'Recruiter'
      | 'Other';
    suggestedStatus:
      | 'Applied'
      | 'Screening'
      | 'Interview'
      | 'Offer'
      | 'Rejected'
      | 'Withdrawn'
      | null;
  } => {
    const value =
      input.toLowerCase();

    if (
      /\b(reject|rejected|unfortunately|not moving forward|other candidates|position has been filled)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Rejection',
        suggestedStatus:
          'Rejected',
      };
    }

    if (
      /\b(offer|congratulations|pleased to offer|offer letter)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Offer',
        suggestedStatus:
          'Offer',
      };
    }

    if (
      /\b(interview|technical round|coding round|assessment|schedule a call|availability for|next round)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Interview',
        suggestedStatus:
          'Interview',
      };
    }

    if (
      /\b(screening|under review|shortlisted|reviewing your application|moved forward)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Application',
        suggestedStatus:
          'Screening',
      };
    }

    if (
      /\b(recruiter|talent acquisition|sourcing|opportunity|reach out)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Recruiter',
        suggestedStatus: null,
      };
    }

    return {
      type: 'Application',
      suggestedStatus: null,
    };
  };

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const findLinkedApplication = (
    message: GmailSyncedMessage,
  ) => {
    const haystack = normalize(
      [
        message.subject,
        message.sender,
        message.snippet,
        message.body_text,
      ].join(' '),
    );

    const ranked =
      trackedApplications
        .map((application) => {
          const company =
            normalize(
              application.company,
            );

          const role =
            normalize(
              application.role,
            );

          let score = 0;

          if (
            company &&
            haystack.includes(company)
          ) {
            score += 4;
          }

          const companyTokens =
            company
              .split(' ')
              .filter(
                (token) =>
                  token.length >= 4,
              );

          score += Math.min(
            2,
            companyTokens.filter(
              (token) =>
                haystack.includes(token),
            ).length,
          );

          const roleTokens =
            role
              .split(' ')
              .filter(
                (token) =>
                  token.length >= 5,
              );

          score += Math.min(
            2,
            roleTokens.filter(
              (token) =>
                haystack.includes(token),
            ).length,
          );

          return {
            application,
            score,
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    return ranked[0]?.score >= 3
      ? ranked[0].application
      : null;
  };

  const refreshGmailStatus = async () => {
    try {
      const status =
        await fetchGmailStatus();

      setGmailStatus(status);
    } catch {
      setGmailStatus({
        connected: false,
        email: null,
      });
    }
  };

  useEffect(() => {
    void refreshGmailStatus();

    const onFocus = () => {
      void refreshGmailStatus();
    };

    window.addEventListener(
      'focus',
      onFocus,
    );

    const onMessage = (
      event: MessageEvent,
    ) => {
      if (
        event.origin !==
        'http://127.0.0.1:8000'
      ) {
        return;
      }

      if (
        event.data?.type ===
        'roleclear:gmail-connected'
      ) {
        void refreshGmailStatus();
        setGmailMessage(
          'Gmail connected. Sync when you are ready.',
        );
      }
    };

    window.addEventListener(
      'message',
      onMessage,
    );

    return () => {
      window.removeEventListener(
        'focus',
        onFocus,
      );

      window.removeEventListener(
        'message',
        onMessage,
      );
    };
  }, []);

  const connectGmail = async () => {
    setGmailBusy(true);
    setGmailMessage('');

    try {
      const popup =
        await startGmailOAuth();

      setGmailMessage(
        'Complete Google sign-in in the popup...',
      );

      const status =
        await waitForGmailConnection(
          popup,
        );

      setGmailStatus(status);

      setGmailMessage(
        `Gmail connected${status.email ? ` · ${status.email}` : ''}.`,
      );
    } catch (error) {
      setGmailMessage(
        error instanceof Error
          ? error.message
          : 'Could not connect Gmail.',
      );
    } finally {
      setGmailBusy(false);
    }
  };

  const syncGmail = async () => {
    setGmailBusy(true);
    setGmailMessage('');

    try {
      const messages =
        await syncGmailMessages();

      let imported = 0;

      for (const message of messages) {
        const combined = [
          message.subject,
          message.sender,
          message.snippet,
          message.body_text,
        ].join(' ');

        const inferred =
          inferUpdate(combined);

        const linked =
          findLinkedApplication(
            message,
          );

        const before =
          useCareerStore
            .getState()
            .careerInboxEvents.length;

        addCareerInboxEvent({
          id: `gmail-${message.id}`,
          applicationId:
            linked?.id ?? null,
          type: inferred.type,
          title:
            message.subject ||
            'Career email update',
          sender:
            message.sender ||
            undefined,
          snippet:
            message.snippet ||
            undefined,
          receivedAt:
            Number.isNaN(
              Date.parse(
                message.date,
              ),
            )
              ? new Date().toISOString()
              : new Date(
                  message.date,
                ).toISOString(),
          suggestedStatus:
            inferred.suggestedStatus,
          read: false,
          source: 'gmail',
          externalMessageId:
            message.id,
        });

        const after =
          useCareerStore
            .getState()
            .careerInboxEvents.length;

        if (after > before) {
          imported += 1;
        }
      }

      setGmailMessage(
        imported > 0
          ? `Imported ${imported} new career email${imported === 1 ? '' : 's'}.`
          : 'Gmail is up to date. No new career emails were added.',
      );

      await refreshGmailStatus();
    } catch (error) {
      setGmailMessage(
        error instanceof Error
          ? error.message
          : 'Could not sync Gmail.',
      );
    } finally {
      setGmailBusy(false);
    }
  };

  const saveUpdate = () => {
    if (!title.trim()) {
      window.alert(
        'Add the email subject or update title first.',
      );
      return;
    }

    const combined = [
      title,
      sender,
      snippet,
    ].join(' ');

    const inferred =
      inferUpdate(combined);

    const now = new Date();

    addCareerInboxEvent({
      id: `career-event-${now.getTime()}`,
      applicationId:
        applicationId || null,
      type: inferred.type,
      title: title.trim(),
      sender:
        sender.trim() ||
        undefined,
      snippet:
        snippet.trim() ||
        undefined,
      receivedAt:
        now.toISOString(),
      suggestedStatus:
        inferred.suggestedStatus,
      read: false,
      source: 'manual',
    });

    setApplicationId('');
    setTitle('');
    setSender('');
    setSnippet('');
    setShowImporter(false);
  };

  const filteredEvents =
    careerInboxEvents.filter(
      (event) =>
        activeTab === 'All' ||
        event.type === activeTab,
    );

  const countFor = (
    type:
      | 'Application'
      | 'Interview'
      | 'Offer'
      | 'Rejection'
      | 'Recruiter',
  ) =>
    careerInboxEvents.filter(
      (event) =>
        event.type === type,
    ).length;

  const formatTime = (
    value: string,
  ) =>
    new Date(value).toLocaleString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      },
    );

  const openApplication = (
    linkedApplicationId:
      | string
      | null,
  ) => {
    if (!linkedApplicationId) return;

    setSelectedApplication(
      linkedApplicationId,
    );

    setView(
      'application-detail',
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="Signals worth your attention"
        title="Career Inbox"
        subtitle="Employer emails become application-progress signals only after RoleClear links and classifies them."
        action={
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {gmailStatus.connected ? (
              <Button
                variant="secondary"
                disabled={gmailBusy}
                onClick={() =>
                  void syncGmail()
                }
              >
                <RefreshCw
                  size={16}
                />
                {gmailBusy
                  ? 'Syncing...'
                  : 'Sync Gmail'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled={gmailBusy}
                onClick={() =>
                  void connectGmail()
                }
              >
                <Link2 size={16} />
                {gmailBusy
                  ? 'Opening Gmail...'
                  : 'Connect Gmail'}
              </Button>
            )}

            <Button
              onClick={() =>
                setShowImporter(
                  (value) => !value,
                )
              }
            >
              <Plus size={16} />
              Add email update
            </Button>
          </div>
        }
      />

      <div
        className="detail-card"
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent:
            'space-between',
          gap: '14px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span className="mini-label">
            GMAIL
          </span>
          <div
            style={{
              marginTop: '4px',
            }}
          >
            <b>
              {gmailStatus.connected
                ? `Connected${gmailStatus.email ? ` · ${gmailStatus.email}` : ''}`
                : 'Not connected'}
            </b>
          </div>

          {gmailMessage && (
            <small
              style={{
                display: 'block',
                marginTop: '5px',
              }}
            >
              {gmailMessage}
            </small>
          )}
        </div>

        {gmailStatus.connected && (
          <Button
            variant="secondary"
            onClick={() =>
              setView(
                'email-connect',
              )
            }
          >
            Manage connection
          </Button>
        )}
      </div>

      {showImporter && (
        <div
          className="detail-card"
          style={{
            marginBottom: '18px',
          }}
        >
          <span className="mini-label">
            ADD CAREER UPDATE
          </span>

          <h3>
            Import an application email manually
          </h3>

          <p>
            Use this only when an employer email is not available through Gmail sync.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '10px',
            }}
          >
            <label>
              <small>
                Link to application
              </small>
              <select
                value={
                  applicationId
                }
                onChange={(event) =>
                  setApplicationId(
                    event.target.value,
                  )
                }
                style={{
                  width: '100%',
                  minHeight: '42px',
                  marginTop: '5px',
                }}
              >
                <option value="">
                  Not linked
                </option>

                {trackedApplications.map(
                  (application) => (
                    <option
                      key={
                        application.id
                      }
                      value={
                        application.id
                      }
                    >
                      {
                        application.company
                      }{' '}
                      —{' '}
                      {
                        application.role
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <small>
                Sender
              </small>
              <input
                value={sender}
                onChange={(event) =>
                  setSender(
                    event.target.value,
                  )
                }
                placeholder="e.g. Microsoft Recruiting"
                style={{
                  width: '100%',
                  minHeight: '42px',
                  marginTop: '5px',
                }}
              />
            </label>
          </div>

          <label
            style={{
              display: 'block',
              marginTop: '10px',
            }}
          >
            <small>
              Email subject
            </small>
            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="e.g. Interview invitation"
              style={{
                width: '100%',
                minHeight: '42px',
                marginTop: '5px',
              }}
            />
          </label>

          <label
            style={{
              display: 'block',
              marginTop: '10px',
            }}
          >
            <small>
              Relevant email text
            </small>
            <textarea
              value={snippet}
              onChange={(event) =>
                setSnippet(
                  event.target.value,
                )
              }
              placeholder="Paste the relevant part of the email..."
              rows={4}
              style={{
                width: '100%',
                marginTop: '5px',
              }}
            />
          </label>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <Button
              onClick={saveUpdate}
            >
              Save update
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                setShowImporter(false)
              }
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="inbox-tabs">
        {(
          [
            'All',
            'Application',
            'Interview',
            'Offer',
            'Rejection',
            'Recruiter',
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveTab(tab)
            }
          >
            {tab ===
            'Application'
              ? 'Applications'
              : tab ===
                  'Interview'
                ? 'Interviews'
                : tab ===
                    'Rejection'
                  ? 'Rejections'
                  : tab ===
                      'Recruiter'
                    ? 'Recruiters'
                    : tab ===
                        'Offer'
                      ? 'Offers'
                      : 'All'}{' '}
            <b>
              {tab === 'All'
                ? careerInboxEvents.length
                : countFor(tab)}
            </b>
          </button>
        ))}
      </div>

      {careerInboxEvents.length ===
      0 ? (
        <div
          className="detail-card"
          style={{
            textAlign: 'center',
            padding: '42px 24px',
          }}
        >
          <Inbox
            size={32}
            style={{
              marginBottom: '12px',
            }}
          />

          <h2>
            No career updates yet.
          </h2>

          <p>
            Connect Gmail and sync employer messages, or add an update manually.
          </p>
        </div>
      ) : filteredEvents.length ===
        0 ? (
        <div className="detail-card">
          No updates in this category.
        </div>
      ) : (
        <div className="mail-list">
          {filteredEvents.map(
            (event) => {
              const linkedApplication =
                trackedApplications.find(
                  (item) =>
                    item.id ===
                    event.applicationId,
                );

              return (
                <div
                  className={`mail-item ${
                    !event.read
                      ? 'unread'
                      : ''
                  }`}
                  key={event.id}
                >
                  <span className="mail-avatar">
                    {(
                      linkedApplication?.company ??
                      event.sender ??
                      'U'
                    )[0].toUpperCase()}
                  </span>

                  <div className="mail-content">
                    <div>
                      <b>
                        {event.type}
                      </b>

                      <small>
                        {formatTime(
                          event.receivedAt,
                        )}
                        {' · '}
                        {event.source ===
                        'gmail'
                          ? 'Gmail'
                          : 'Manual'}
                      </small>
                    </div>

                    <h3>
                      {event.title}
                    </h3>

                    <p>
                      {linkedApplication
                        ? `${linkedApplication.company} · ${linkedApplication.role}`
                        : event.sender ??
                          'Unlinked career update'}
                    </p>

                    {event.snippet && (
                      <p
                        style={{
                          opacity: 0.72,
                        }}
                      >
                        {
                          event.snippet
                        }
                      </p>
                    )}

                    {event.suggestedStatus && (
                      <div
                        style={{
                          display:
                            'flex',
                          gap: '8px',
                          alignItems:
                            'center',
                          flexWrap:
                            'wrap',
                          marginTop:
                            '8px',
                        }}
                      >
                        <span className="mini-label">
                          Suggested tracker update:
                          {' '}
                          {
                            event.suggestedStatus
                          }
                        </span>

                        {event.applicationId && (
                          <Button
                            variant="secondary"
                            onClick={() =>
                              applyCareerInboxEventStatus(
                                event.id,
                              )
                            }
                          >
                            Apply status
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'flex-end',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {event.source ===
                      'gmail' &&
                      event.externalMessageId && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            openGmailMessage(
                              event.externalMessageId!,
                              gmailStatus.email,
                            )
                          }
                        >
                          <ExternalLink
                            size={14}
                          />
                          View mail
                        </Button>
                      )}

                    {event.applicationId && (
                      <button
                        className="mail-action"
                        title="Open application"
                        aria-label="Open application"
                        onClick={() => {
                          markCareerInboxEventRead(
                            event.id,
                          );

                          openApplication(
                            event.applicationId,
                          );
                        }}
                      >
                        <ArrowUpRight
                          size={17}
                        />
                      </button>
                    )}

                    <button
                      className="mail-action"
                      title="Delete update"
                      aria-label="Delete update"
                      onClick={() =>
                        deleteCareerInboxEvent(
                          event.id,
                        )
                      }
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics() {
  return (
    <>
      <PageTitle
        eyebrow="Patterns, not vanity metrics"
        title="Career analytics"
        subtitle="See what your application history is teaching you."
        action={
          <Button variant="secondary">
            This month
            <ChevronRight size={15} />
          </Button>
        }
      />

      <div className="analytics-stats">
        <Stat
          label="Response rate"
          value="33%"
          trend="+8% vs last month"
          icon={<TrendingUp />}
        />

        <Stat
          label="Interview conversion"
          value="17%"
          trend="Based on 12 applications"
          icon={<Target />}
        />

        <Stat
          label="Best fit score"
          value="91%"
          trend="Software engineering"
          icon={<Sparkles />}
        />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <span className="mini-label">APPLICATIONS OVER TIME</span>
              <h3>12 applications</h3>
            </div>

            <TrendingUp size={19} />
          </div>

          <div className="chart">
            <div className="chart-gridlines">
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg viewBox="0 0 600 170" preserveAspectRatio="none">
              <path d="M0 145 C60 142, 64 122, 112 128 S165 80, 216 105 S265 112, 320 82 S365 91, 418 52 S480 75, 530 28 S570 40, 600 15" />
            </svg>

            <div className="chart-labels">
              <span>May 1</span>
              <span>May 15</span>
              <span>Jun 1</span>
              <span>Jun 16</span>
            </div>
          </div>
        </div>

        <div className="chart-card insight-chart">
          <div className="chart-head">
            <div>
              <span className="mini-label">STRONGEST PATTERN</span>
              <h3>Backend roles perform best</h3>
            </div>

            <Sparkles size={19} />
          </div>

          <div className="role-bars">
            <RoleBar label="Backend" value="75%" width="75%" />
            <RoleBar label="Full stack" value="48%" width="48%" />
            <RoleBar label="Frontend" value="33%" width="33%" />
          </div>

          <p className="chart-footnote">
            Observed from your last 12 applications.
          </p>
        </div>
      </div>

      <div className="observed-card">
        <div className="observed-icon">
          <Sparkles size={18} />
        </div>

        <div>
          <span className="mini-label">AN INSIGHT FOR YOU</span>

          <h3>Tailored resumes are getting more replies.</h3>

          <p>
            3 of 4 responses came from applications using a job-specific
            version. Keep tailoring truthfully.
          </p>
        </div>

        <ArrowUpRight size={18} />
      </div>
    </>
  );
}

function RoleBar({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div className="role-bar">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <i>
        <em style={{ width }} />
      </i>
    </div>
  );
}

/* =========================================================
   CAREER FEED
========================================================= */

function Feed({
  setView,
}: {
  setView: (view: View) => void;
}) {
  return (
    <>
      <PageTitle
        eyebrow="Your focused career feed"
        title="Career Feed"
        subtitle="A calm stream of opportunities, updates, and useful signals."
      />

      <div className="feed-layout">
        <div className="feed-list">
          <div className="feed-filter">
            <Button variant="secondary">
              All updates
              <ChevronRight size={15} />
            </Button>

            <span>
              Showing your activity and imported opportunities
            </span>
          </div>

          <OpportunityFeedCard
            company="Stripe"
            role="Software Engineer Intern"
            source="LinkedIn · Imported opportunity"
            fit="91"
            risk="Low risk"
            color="orange"
            onClick={() => setView('apply')}
          />

          <OpportunityFeedCard
            company="Razorpay"
            role="Frontend Engineer"
            source="Razorpay careers · Imported opportunity"
            fit="84"
            risk="Medium risk"
            color="blue"
            onClick={() => setView('apply')}
          />

          <div className="feed-event">
            <span>
              <Sparkles size={16} />
            </span>

            <div>
              <small>RESUME INSIGHT · JUN 13</small>

              <h3>Docker appears frequently in your target roles.</h3>

              <p>
                Consider making your experience with Docker more visible in your
                next tailored version.
              </p>
            </div>
          </div>
        </div>

        <div className="feed-aside">
          <div className="feed-aside-card">
            <span className="mini-label">KEEP IT MOVING</span>

            <h3>Your next best action</h3>

            <p>Complete the follow-up on your Stripe application.</p>

            <Button variant="secondary">
              Take action
              <ArrowUpRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function OpportunityFeedCard({
  company,
  role,
  source,
  fit,
  risk,
  color,
  onClick,
}: {
  company: string;
  role: string;
  source: string;
  fit: string;
  risk: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <div className="opportunity-card">
      <span className={`company-logo ${color}`}>{company[0]}</span>

      <div className="opportunity-info">
        <div>
          <b>{role}</b>
          <span>{company}</span>
        </div>

        <p>{source}</p>
      </div>

      <div className="opportunity-score">
        <span>RESUME FIT</span>
        <b>{fit}%</b>
      </div>

      <div
        className={`risk-badge ${
          risk === 'Medium risk' ? 'medium' : ''
        }`}
      >
        {risk}
      </div>

      <button onClick={onClick}>
        Analyze
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsView({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <>
      <PageTitle
        eyebrow="Your space, your rules"
        title="Settings"
        subtitle="Manage your preferences, connections, and data."
      />

      <div className="settings-layout">
        <div className="settings-nav">
          <button className="active">Account</button>
          <button>Career preferences</button>
          <button>Integrations</button>
          <button>Notifications</button>
          <button>Privacy & security</button>
        </div>

        <div className="settings-panels">
          <div className="settings-panel">
            <div>
              <span className="mini-label">ACCOUNT</span>
              <h3>Personal information</h3>
              <p>Keep your basics up to date.</p>
            </div>

            <label>
              Full name
              <input value="Aarya Rai" readOnly />
            </label>

            <label>
              Email
              <input value="aarya@example.com" readOnly />
            </label>

            <label>
              Mobile number
              <input value="+91 98765 43210" readOnly />
            </label>

            <Button variant="secondary">Edit details</Button>
          </div>

          <div className="settings-panel">
            <div>
              <span className="mini-label">INTEGRATIONS</span>
              <h3>Connected accounts</h3>

              <p>
                Connections are always optional and can be removed.
              </p>
            </div>

            <div className="integration-row">
              <span className="integration-logo">G</span>

              <div>
                <b>Google</b>
                <small>Not connected</small>
              </div>

              <Button variant="secondary">Connect</Button>
            </div>

            <div className="integration-row">
              <span className="integration-logo outlook">O</span>

              <div>
                <b>Outlook</b>
                <small>Not connected</small>
              </div>

              <Button variant="secondary">Connect</Button>
            </div>
          </div>

          <div className="settings-panel danger-panel">
            <div>
              <span className="mini-label">ACCOUNT ACCESS</span>

              <h3>Sign out of RoleClear</h3>

              <p>
                You'll need to sign in again to access your career space.
              </p>
            </div>

            <Button variant="secondary" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   JOB ANALYSIS
========================================================= */

function JobAnalysis({
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

  const savedJobs = useCareerStore(
    (state) => state.savedJobs,
  );

  const saveJob = useCareerStore(
    (state) => state.saveJob,
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
            NO ANALYSIS AVAILABLE
          </span>

          <h2>
            Analyze an opportunity first.
          </h2>

          <p>
            Smart Apply needs a verified job and parsed resume before it can show the analysis.
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

  const isSaved =
    savedJobs.some(
      (job) =>
        job.id === currentJob.id,
    );

  const ghostRiskLabel =
    currentAnalysis.ghostRisk ===
    'low'
      ? 'LOW'
      : currentAnalysis.ghostRisk ===
          'medium'
        ? 'MEDIUM'
        : 'HIGH';

  const fitCaption =
    currentAnalysis.resumeFit >= 80
      ? 'Strong match'
      : currentAnalysis.resumeFit >=
          60
        ? 'Moderate match'
        : currentAnalysis.resumeFit >=
            40
          ? 'Partial match'
          : 'Low match';

  const handleSaveJob = () => {
    if (!isSaved) {
      saveJob(currentJob);
    }
  };

  const handleOpenOriginal = () => {
    if (!currentJob.url) {
      return;
    }

    window.open(
      currentJob.url,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="detail-page">
      <BackLink
        onClick={() =>
          setView('apply')
        }
        label="Back to Smart Apply"
      />

      <PageTitle
        eyebrow="Smart Apply · Step 02"
        title={
          currentJob.title ??
          'Imported opportunity'
        }
        subtitle={[
          currentJob.company,
          currentJob.location,
          currentJob.source
            ? `Source: ${currentJob.source}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')}
        action={
          currentJob.url ? (
            <Button
              variant="secondary"
              onClick={
                handleOpenOriginal
              }
            >
              View original
              <ExternalLink
                size={15}
              />
            </Button>
          ) : undefined
        }
      />

      <div className="analysis-hero">
        <div>
          <span className="mini-label">
            VERDICT
          </span>

          <h2>
            {currentAnalysis.verdict}.
          </h2>

          <p>
            {currentAnalysis.explanation}
          </p>
        </div>

        <div className="score-duo">
          <ScoreBlock
            label="RESUME FIT"
            value={`${currentAnalysis.resumeFit}%`}
            caption={fitCaption}
          />

          <ScoreBlock
            label="GHOST RISK"
            value={ghostRiskLabel}
            caption="Posting signal assessment"
          />
        </div>
      </div>

      <div
        className="analysis-grid"
        style={{
          marginBottom: '20px',
        }}
      >
        <div className="detail-card">
          <span className="mini-label">
            MATCH BREAKDOWN
          </span>

          <h3>
            Where the score comes from
          </h3>

          <div
            style={{
              display: 'grid',
              gap: '10px',
              marginTop: '16px',
            }}
          >
            <DetailPair
              label="Capabilities"
              value={`${currentAnalysis.canonicalBreakdown.capabilities}%`}
            />

            <DetailPair
              label="Experience"
              value={`${currentAnalysis.canonicalBreakdown.experience}%`}
            />

            <DetailPair
              label="Responsibilities"
              value={`${currentAnalysis.canonicalBreakdown.responsibilities}%`}
            />
          </div>
        </div>

        <div className="detail-card">
          <span className="mini-label">
            POSTING SIGNALS
          </span>

          <h3>
            Why ghost risk is {ghostRiskLabel.toLowerCase()}
          </h3>

          {currentAnalysis
            .ghostRiskReasons.length >
          0 ? (
            <ul className="gap-list">
              {currentAnalysis
                .ghostRiskReasons
                .map((reason) => (
                  <li key={reason}>
                    <span>
                      {reason}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p>
              No major posting-quality warning signals were detected by the current rule set.
            </p>
          )}
        </div>
      </div>

      <div className="analysis-grid">
        <div className="detail-card">
          <span className="mini-label">
            REQUIRED REQUIREMENTS
          </span>

          <h3>
            What the role requires
          </h3>

          {currentAnalysis
            .requiredRequirements.length >
          0 ? (
            <div className="chip-list">
              {currentAnalysis.requiredRequirements.map(
                (skill) => {
                  const missing =
                    currentAnalysis.missingRequired.includes(
                      skill,
                    );

                  return (
                    <span
                      key={skill}
                      className={
                        missing
                          ? 'gap'
                          : ''
                      }
                    >
                      {skill}
                    </span>
                  );
                },
              )}
            </div>
          ) : (
            <p>
              No explicit required requirements were extracted from the posting.
            </p>
          )}

          <div className="analysis-row">
            <Check size={15} />

            <div>
              <b>
                {
                  currentAnalysis
                    .matchedRequired
                    .length
                }{' '}
                matched requirements
              </b>

              <p>
                Each match is supported by evidence found in the parsed resume.
              </p>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <span className="mini-label">
            PREFERRED QUALIFICATIONS
          </span>

          <h3>
            Helpful, but not mandatory
          </h3>

          {currentAnalysis
            .preferredRequirements.length >
          0 ? (
            <div className="chip-list">
              {currentAnalysis
                .preferredRequirements
                .map((skill) => (
                  <span
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
            </div>
          ) : (
            <p>
              No separate preferred qualifications were detected.
            </p>
          )}
        </div>

        <div className="detail-card">
          <span className="mini-label">
            GAPS
          </span>

          <h3>
            Required evidence not found
          </h3>

          {currentAnalysis
            .missingRequired.length >
          0 ? (
            <div className="chip-list">
              {currentAnalysis
                .missingRequired
                .map((skill) => (
                  <span
                    key={skill}
                    className="gap"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          ) : (
            <p>
              No major required requirement gaps were detected.
            </p>
          )}

          <p className="disclaimer">
            A gap means RoleClear could not find strong evidence in this resume. It does not prove that you do not meet the requirement.
          </p>
        </div>

        <div className="detail-card">
          <span className="mini-label">
            STRONGEST EVIDENCE
          </span>

          <h3>
            Experience and work that support this match
          </h3>

          {currentAnalysis
            .experienceMatches
            .filter(
              (item) =>
                item.score > 0,
            )
            .sort(
              (a, b) =>
                b.score - a.score,
            )
            .slice(0, 3)
            .map((item) => (
              <div
                className="analysis-row"
                key={`experience-${item.index}`}
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
                          .slice(0, 3)
                          .join(', ')}`
                      : ''}
                  </p>
                </div>
              </div>
            ))}

          {currentAnalysis
            .workSampleMatches
            .filter(
              (item) =>
                item.score > 0,
            )
            .sort(
              (a, b) =>
                b.score - a.score,
            )
            .slice(0, 2)
            .map((item) => (
              <div
                className="analysis-row"
                key={`project-${item.index}`}
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
                          .slice(0, 3)
                          .join(', ')}`
                      : ''}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="analysis-actions">
        <Button
          onClick={() =>
            setView('resume-match')
          }
        >
          See detailed resume match
          <ArrowUpRight size={16} />
        </Button>

        {currentJob.url && (
          <Button
            variant="secondary"
            onClick={
              handleOpenOriginal
            }
          >
            View original posting
            <ExternalLink
              size={15}
            />
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={handleSaveJob}
          disabled={isSaved}
        >
          {isSaved ? (
            <>
              Saved
              <Check size={15} />
            </>
          ) : (
            <>
              Save opportunity
              <Save size={15} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ScoreBlock({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="score-block">
      <span className="mini-label">{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  );
}

/* =========================================================
   RESUME MATCH
========================================================= */

function ResumeMatch({
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

function MatchBar({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div className="match-bar">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <i>
        <em style={{ width }} />
      </i>
    </div>
  );
}

/* =========================================================
   RESUME TAILOR
========================================================= */

type TailorResume = {
  personal_info?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
  };
  summary?: string | null;
  skills?: Record<string, { name?: string }[]>;
  experience?: {
    company?: string | null;
    title?: string | null;
    location?: string | null;
    work_mode?: string | null;
    employment_type?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    is_current?: boolean;
    bullets?: string[];
    technologies?: string[];
  }[];
  projects?: {
    name?: string | null;
    subtitle?: string | null;
    description?: string | null;
    bullets?: string[];
    technologies?: string[];
  }[];
  education?: {
    institution?: string | null;
    degree?: string | null;
    field_of_study?: string | null;
    location?: string | null;
    grade?: string | null;
    grade_type?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  }[];
  certifications?: {
    name?: string | null;
    issuer?: string | null;
    issue_date?: string | null;
  }[];
  publications?: {
    title?: string | null;
    venue?: string | null;
    year?: number | null;
    description?: string | null;
  }[];
  research?: {
    title?: string | null;
    organization?: string | null;
    description?: string | null;
    bullets?: string[];
  }[];
  achievements?: {
    title?: string | null;
    description?: string | null;
  }[];
};

type TailorApiResponse = {
  version_id: string;
  job_title: string | null;
  company: string | null;
  tailoring_mode?: string;
  tailored_resume: TailorResume;
  selected_evidence?: {
    requirement: string;
    section: string;
    source_index?: number | null;
    evidence: string;
    similarity: number;
  }[];
  changes?: {
    section: string;
    action: string;
    detail: string;
  }[];
  claim_validation: {
    passed: boolean;
    checked_claims: number;
    unsupported_claims: string[];
  };
};

const RESUME_EXPORT_API_BASE =
  'http://127.0.0.1:8000/api/v1';

const ACTIVE_TAILORED_VERSION_KEY =
  'roleclear_active_tailored_version_v1';

function ResumeTailor({
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
  const currentResume = useCareerStore(
    (state) => state.currentResume,
  );

  const [tailoredResult, setTailoredResult] =
    useState<TailorApiResponse | null>(null);
  const [tailoring, setTailoring] =
    useState(false);
  const [tailorError, setTailorError] =
    useState('');
  const [reverted, setReverted] =
    useState(false);
  const [saved, setSaved] =
    useState(false);
  const [downloading, setDownloading] =
    useState(false);

  const generateTailoredResume = async () => {
    if (!currentJob || !currentResume) {
      return;
    }

    if (!currentJob.url) {
      setTailorError(
        'This live tailoring flow needs the original job URL. Re-import the opportunity from Smart Apply.',
      );
      return;
    }

    try {
      setTailoring(true);
      setTailorError('');
      setSaved(false);

      const extracted = await extractJobFromUrl(
        currentJob.url,
      );

      const response = await fetch(
        `${RESUME_EXPORT_API_BASE}/smart-apply/tailor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job: extracted,
            resume: currentResume,
            max_experience_bullets: 4,
            max_project_bullets: 3,
            max_projects: 3,
          }),
        },
      );

      if (!response.ok) {
        let message =
          'The tailored resume could not be generated safely.';

        try {
          const payload = await response.json();
          message =
            payload?.detail || message;
        } catch {
          // Keep the safe fallback message.
        }

        throw new Error(message);
      }

      const result =
        (await response.json()) as TailorApiResponse;

      if (
        !result.claim_validation?.passed
      ) {
        throw new Error(
          'RoleClear blocked this tailored resume because claim validation did not pass.',
        );
      }

      setTailoredResult(result);
      setReverted(false);
    } catch (error) {
      console.error(
        'Resume tailoring error:',
        error,
      );

      setTailoredResult(null);
      setTailorError(
        error instanceof Error
          ? error.message
          : 'The tailored resume could not be generated safely.',
      );
    } finally {
      setTailoring(false);
    }
  };

  useEffect(() => {
    if (
      currentJob &&
      currentResume &&
      currentAnalysis
    ) {
      void generateTailoredResume();
    }
    // Generate once when the active Smart Apply job changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJob?.id]);

  if (!currentJob || !currentAnalysis || !currentResume) {
    return (
      <div className="detail-page">
        <BackLink
          onClick={() => setView('apply')}
          label="Back to Smart Apply"
        />

        <div className="detail-card">
          <span className="mini-label">NO RESUME DATA</span>
          <h2>Analyze an opportunity first.</h2>
          <p>
            Resume Tailor needs the parsed resume and the live Smart Apply match.
          </p>
          <Button onClick={() => setView('apply')}>
            Go to Smart Apply
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  const originalResume =
    currentResume as TailorResume;

  const tailoredResume =
    tailoredResult?.tailored_resume ??
    originalResume;

  const displayResume =
    reverted
      ? originalResume
      : tailoredResume;

  const experiences =
    displayResume.experience ?? [];
  const projects =
    displayResume.projects ?? [];
  const education =
    displayResume.education ?? [];

  const skillRows = Object.entries(
    displayResume.skills ?? {},
  )
    .map(([category, items]) => ({
      category,
      names: (items ?? [])
        .map(
          (item) =>
            item.name?.trim() ?? '',
        )
        .filter(Boolean),
    }))
    .filter(
      (row) => row.names.length > 0,
    );

  const name =
    displayResume.personal_info
      ?.full_name ?? 'Resume candidate';

  const subtitle = [
    education[0]?.degree,
    education[0]?.field_of_study,
  ]
    .filter(Boolean)
    .join(' · ');

  const jobDescription = [
    currentJob.rawDescription,
    ...(currentJob.qualifications ?? []),
    ...(currentJob.responsibilities ?? []),
  ]
    .filter(Boolean)
    .join('\n');

  const persistVersion = () => {
    if (!tailoredResult) {
      return null;
    }

    const now =
      new Date().toISOString();

    let masterProfile:
      | MasterResumeProfile
      | null = null;

    try {
      const stored =
        window.localStorage.getItem(
          MASTER_PROFILE_STORAGE_KEY,
        );

      masterProfile = stored
        ? (JSON.parse(
            stored,
          ) as MasterResumeProfile)
        : null;
    } catch {
      masterProfile = null;
    }

    if (!masterProfile) {
      masterProfile =
        parsedResumeToMasterProfile(
          currentResume as Record<
            string,
            unknown
          >,
        );

      window.localStorage.setItem(
        MASTER_PROFILE_STORAGE_KEY,
        JSON.stringify(
          masterProfile,
        ),
      );
    }

    const versionName =
      `${currentJob.title ?? 'Target Role'}${
        currentJob.company
          ? ` — ${currentJob.company}`
          : ''
      }`;

    const version: StudioResumeVersion = {
      id: tailoredResult.version_id,
      backendVersionId:
        tailoredResult.version_id,
      name: versionName,
      targetRole:
        currentJob.title ??
        'Opportunity',
      company:
        currentJob.company ?? '',
      jobDescription,
      createdAt: now,
      updatedAt: now,
      sourceProfileUpdatedAt:
        masterProfile.updatedAt,
      source: 'smart-apply',
      fitScore:
        currentAnalysis.resumeFit,
      profileSnapshot:
        JSON.parse(
          JSON.stringify(
            masterProfile,
          ),
        ) as MasterResumeProfile,
      claimValidationPassed:
        tailoredResult
          .claim_validation
          .passed,
      jobUrl:
        currentJob.url,
      tailoredResume:
        tailoredResult.tailored_resume as Record<
          string,
          unknown
        >,
    };

    let existingVersions:
      StudioResumeVersion[] = [];

    try {
      const stored =
        window.localStorage.getItem(
          RESUME_STUDIO_STORAGE_KEY,
        );

      existingVersions = stored
        ? (JSON.parse(
            stored,
          ) as StudioResumeVersion[])
        : [];
    } catch {
      existingVersions = [];
    }

    const withoutSameVersion =
      existingVersions.filter(
        (item) =>
          item.id !== version.id,
      );

    window.localStorage.setItem(
      RESUME_STUDIO_STORAGE_KEY,
      JSON.stringify([
        version,
        ...withoutSameVersion,
      ]),
    );

    window.localStorage.setItem(
      ACTIVE_TAILORED_VERSION_KEY,
      JSON.stringify({
        versionId:
          tailoredResult.version_id,
        jobId:
          currentJob.id,
        jobTitle:
          currentJob.title,
        company:
          currentJob.company,
        name:
          versionName,
        fitScore:
          currentAnalysis.resumeFit,
        savedAt: now,
      }),
    );

    setSaved(true);

    return version;
  };

  const handleDownloadWord =
    async () => {
      if (!currentJob.url) {
        setTailorError(
          'The original job URL is required to generate the Word resume.',
        );
        return;
      }

      try {
        setDownloading(true);
        setTailorError('');

        const extracted =
          await extractJobFromUrl(
            currentJob.url,
          );

        const response = await fetch(
          `${RESUME_EXPORT_API_BASE}/resume-export/tailored-docx`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              job: extracted,
              resume: currentResume,
              max_experience_bullets:
                4,
              max_project_bullets:
                3,
              max_projects: 3,
            }),
          },
        );

        if (!response.ok) {
          let message =
            'The Word resume could not be generated.';

          try {
            const payload =
              await response.json();
            message =
              payload?.detail ||
              message;
          } catch {
            // Keep fallback.
          }

          throw new Error(message);
        }

        const blob =
          await response.blob();

        const contentDisposition =
          response.headers.get(
            'Content-Disposition',
          );

        const filenameMatch =
          contentDisposition?.match(
            /filename\*=UTF-8''([^;]+)/i,
          );

        const filename = filenameMatch
          ? decodeURIComponent(
              filenameMatch[1],
            )
          : `RoleClear_${(
              currentJob.company ??
              'Target'
            ).replace(
              /[^a-z0-9]+/gi,
              '_',
            )}_Resume.docx`;

        const url =
          URL.createObjectURL(blob);

        const anchor =
          document.createElement('a');

        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(
          anchor,
        );
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);

        // Persist the previewed immutable version in Resume Studio.
        persistVersion();
      } catch (error) {
        console.error(
          'DOCX download error:',
          error,
        );

        setTailorError(
          error instanceof Error
            ? error.message
            : 'The Word resume could not be downloaded.',
        );
      } finally {
        setDownloading(false);
      }
    };

  const handleReadyToApply = () => {
    if (!tailoredResult) {
      setTailorError(
        'Generate the tailored resume before continuing.',
      );
      return;
    }

    persistVersion();
    setView('external-apply');
  };

  return (
    <div className="detail-page">
      <BackLink
        onClick={() =>
          setView('resume-match')
        }
        label="Back to resume match"
      />

      <PageTitle
        eyebrow="Smart Apply · Step 04"
        title="Tailor your resume"
        subtitle={`Generate a truth-preserving resume for ${
          currentJob.title ??
          'this opportunity'
        }${
          currentJob.company
            ? ` at ${currentJob.company}`
            : ''
        }.`}
        action={
          <Button
            onClick={
              handleReadyToApply
            }
            disabled={
              tailoring ||
              !tailoredResult
            }
          >
            Ready to apply
            <ArrowUpRight
              size={16}
            />
          </Button>
        }
      />

      <div className="tailor-toolbar">
        <span>
          <ShieldCheck size={16} />
          {tailoredResult
            ?.claim_validation
            .passed
            ? `Claim validation passed · ${tailoredResult.claim_validation.checked_claims} claims checked`
            : 'Truth-preserving edits only'}
        </span>

        <div>
          <Button
            variant="secondary"
            onClick={() =>
              setView('ats-check')
            }
          >
            <ShieldCheck
              size={15}
            />
            Check Resume
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              setReverted(
                (value) => !value,
              )
            }
            disabled={
              !tailoredResult
            }
          >
            <span className="rotate-icon">
              ↶
            </span>
            {reverted
              ? 'Show tailored'
              : 'Compare original'}
          </Button>

          <Button
            variant="secondary"
            onClick={
              handleDownloadWord
            }
            disabled={
              tailoring ||
              downloading ||
              !tailoredResult
            }
          >
            <Download size={15} />
            {downloading
              ? 'Generating…'
              : 'Download Word'}
          </Button>

          <Button
            variant="secondary"
            onClick={
              persistVersion
            }
            disabled={
              tailoring ||
              !tailoredResult
            }
          >
            {saved ? (
              <>
                <Check size={15} />
                Saved
              </>
            ) : (
              <>
                <Save size={15} />
                Save version
              </>
            )}
          </Button>
        </div>
      </div>

      {tailoring && (
        <div
          className="detail-card"
          style={{
            marginBottom:
              '14px',
          }}
        >
          <span className="mini-label">
            GENERATING TARGETED RESUME
          </span>
          <h3>
            Ranking your strongest evidence…
          </h3>
          <p>
            RoleClear is using the live backend tailoring pipeline and will keep only claims already supported by your parsed resume.
          </p>
        </div>
      )}

      {tailorError && (
        <div
          className="detail-card"
          style={{
            marginBottom:
              '14px',
            border:
              '1px solid rgba(180, 55, 55, 0.26)',
          }}
        >
          <span className="mini-label">
            TAILORING ERROR
          </span>
          <p
            style={{
              marginBottom:
                '12px',
            }}
          >
            {tailorError}
          </p>

          <Button
            variant="secondary"
            onClick={() =>
              void generateTailoredResume()
            }
          >
            <RefreshCw
              size={15}
            />
            Retry
          </Button>
        </div>
      )}

      {tailoredResult && (
        <div
          className="detail-card"
          style={{
            marginBottom:
              '14px',
          }}
        >
          <span className="mini-label">
            GENERATED VERSION
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              marginTop: '10px',
            }}
          >
            <div>
              <small>
                Version ID
              </small>
              <strong
                style={{
                  display:
                    'block',
                  marginTop:
                    '3px',
                }}
              >
                {tailoredResult.version_id.slice(
                  0,
                  8,
                )}
              </strong>
            </div>

            <div>
              <small>
                Resume fit
              </small>
              <strong
                style={{
                  display:
                    'block',
                  marginTop:
                    '3px',
                }}
              >
                {
                  currentAnalysis.resumeFit
                }
                %
              </strong>
            </div>

            <div>
              <small>
                Safety
              </small>
              <strong
                style={{
                  display:
                    'block',
                  marginTop:
                    '3px',
                }}
              >
                Validation passed
              </strong>
            </div>

            <div>
              <small>
                Tailoring mode
              </small>
              <strong
                style={{
                  display:
                    'block',
                  marginTop:
                    '3px',
                }}
              >
                Selection + reordering
              </strong>
            </div>
          </div>
        </div>
      )}

      <div
        className="detail-card"
        style={{
          marginBottom:
            '14px',
        }}
      >
        <span className="mini-label">
          ATS + JOB FIT
        </span>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '10px',
          }}
        >
          <div>
            <small>
              ATS readiness
            </small>
            <strong
              style={{
                display:
                  'block',
                fontSize:
                  '28px',
              }}
            >
              {
                calculateAtsReadiness(
                  currentResume,
                ).score
              }
              /100
            </strong>
          </div>

          <div>
            <small>
              Job-specific fit
            </small>
            <strong
              style={{
                display:
                  'block',
                fontSize:
                  '28px',
              }}
            >
              {
                currentAnalysis.resumeFit
              }
              %
            </strong>
          </div>

          <div>
            <small>
              Required matches
            </small>
            <strong
              style={{
                display:
                  'block',
                fontSize:
                  '28px',
              }}
            >
              {
                currentAnalysis
                  .matchedRequired
                  .length
              }
              /
              {
                currentAnalysis
                  .requiredRequirements
                  .length
              }
            </strong>
          </div>
        </div>

        <p
          style={{
            marginBottom: 0,
            marginTop:
              '10px',
          }}
        >
          ATS readiness measures resume structure and parseability. Job fit measures evidence alignment with this specific role.
        </p>
      </div>

      <div className="resume-editor">
        <div className="resume-pane">
          <div className="pane-head">
            <span>
              {reverted
                ? 'ORIGINAL RESUME'
                : 'TAILORED VERSION'}
            </span>
            <small>
              {reverted
                ? 'Parsed source'
                : tailoredResult
                  ? `Version ${tailoredResult.version_id.slice(0, 8)}`
                  : 'Generating…'}
            </small>
          </div>

          <div className="resume-paper edited">
            <h2>{name}</h2>
            <p>{subtitle}</p>

            {displayResume.summary && (
              <>
                <hr />
                <h4
                  style={{
                    marginBottom:
                      '8px',
                  }}
                >
                  SUMMARY
                </h4>
                <p>
                  {
                    displayResume.summary
                  }
                </p>
              </>
            )}

            {skillRows.length >
              0 && (
              <>
                <h4
                  style={{
                    marginBottom:
                      '10px',
                  }}
                >
                  SKILLS
                </h4>

                {skillRows.map(
                  (row) => (
                    <p
                      key={
                        row.category
                      }
                      style={{
                        marginBottom:
                          '5px',
                      }}
                    >
                      <b>
                        {row.category
                          .replace(
                            /_/g,
                            ' ',
                          )
                          .replace(
                            /\b\w/g,
                            (value) =>
                              value.toUpperCase(),
                          )}
                        :
                      </b>{' '}
                      {row.names.join(
                        ', ',
                      )}
                    </p>
                  ),
                )}
              </>
            )}

            {experiences.length >
              0 && (
              <>
                <h4
                  style={{
                    marginBottom:
                      '10px',
                  }}
                >
                  EXPERIENCE
                </h4>

                {experiences.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={`resume-exp-${index}`}
                      style={{
                        marginBottom:
                          '18px',
                      }}
                    >
                      <h3
                        style={{
                          marginBottom:
                            '2px',
                        }}
                      >
                        {item.title ||
                          'Experience'}
                      </h3>

                      <p
                        style={{
                          margin:
                            '0 0 5px',
                          fontWeight:
                            600,
                          opacity:
                            0.72,
                        }}
                      >
                        {[
                          item.company,
                          item.location,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            ' · ',
                          )}
                      </p>

                      <p>
                        {[
                          item.start_date,
                          item.is_current
                            ? 'Present'
                            : item.end_date,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            ' - ',
                          )}
                      </p>

                      {(
                        item.bullets ??
                        []
                      ).map(
                        (
                          bullet,
                          bulletIndex,
                        ) => (
                          <p
                            key={`resume-exp-${index}-${bulletIndex}`}
                          >
                            •{' '}
                            {bullet}
                          </p>
                        ),
                      )}
                    </div>
                  ),
                )}
              </>
            )}

            {projects.length >
              0 && (
              <>
                <h4
                  style={{
                    marginBottom:
                      '10px',
                  }}
                >
                  PROJECTS
                </h4>

                {projects.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={`resume-project-${index}`}
                      style={{
                        marginBottom:
                          '18px',
                      }}
                    >
                      <h3
                        style={{
                          marginBottom:
                            '2px',
                        }}
                      >
                        {item.name ||
                          'Project'}
                      </h3>

                      {item.subtitle && (
                        <p
                          style={{
                            margin:
                              '0 0 6px',
                            fontWeight:
                              600,
                            opacity:
                              0.72,
                          }}
                        >
                          {
                            item.subtitle
                          }
                        </p>
                      )}

                      {item.description && (
                        <p>
                          {
                            item.description
                          }
                        </p>
                      )}

                      {(
                        item.bullets ??
                        []
                      ).map(
                        (
                          bullet,
                          bulletIndex,
                        ) => (
                          <p
                            key={`resume-project-${index}-${bulletIndex}`}
                          >
                            •{' '}
                            {bullet}
                          </p>
                        ),
                      )}
                    </div>
                  ),
                )}
              </>
            )}

            {education.length >
              0 && (
              <>
                <h4
                  style={{
                    marginBottom:
                      '10px',
                  }}
                >
                  EDUCATION
                </h4>

                {education.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={`resume-education-${index}`}
                      style={{
                        marginBottom:
                          '12px',
                      }}
                    >
                      <h3
                        style={{
                          marginBottom:
                            '2px',
                        }}
                      >
                        {item.institution ||
                          'Education'}
                      </h3>

                      <p>
                        {[
                          item.degree,
                          item.field_of_study,
                          item.grade,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            ' · ',
                          )}
                      </p>

                      <p>
                        {[
                          item.start_date,
                          item.end_date,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            ' - ',
                          )}
                      </p>
                    </div>
                  ),
                )}
              </>
            )}

            {(displayResume
              .certifications ??
              []).length >
              0 && (
              <>
                <h4
                  style={{
                    marginBottom:
                      '10px',
                  }}
                >
                  CERTIFICATIONS
                </h4>

                {(
                  displayResume.certifications ??
                  []
                ).map(
                  (
                    item,
                    index,
                  ) => (
                    <p
                      key={`resume-cert-${index}`}
                    >
                      •{' '}
                      {[
                        item.name,
                        item.issuer,
                        item.issue_date,
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          ' · ',
                        )}
                    </p>
                  ),
                )}
              </>
            )}

            {(displayResume
              .achievements ??
              []).length >
              0 && (
              <>
                <h4
                  style={{
                    marginBottom:
                      '10px',
                  }}
                >
                  ACHIEVEMENTS
                </h4>

                {(
                  displayResume.achievements ??
                  []
                ).map(
                  (
                    item,
                    index,
                  ) => (
                    <p
                      key={`resume-achievement-${index}`}
                    >
                      •{' '}
                      {[
                        item.title,
                        item.description,
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          ': ',
                        )}
                    </p>
                  ),
                )}
              </>
            )}
          </div>
        </div>

        <div className="resume-pane">
          <div className="pane-head">
            <span>
              WHY THIS VERSION
            </span>
            <small>
              Backend evidence
            </small>
          </div>

          <div className="resume-paper">
            <h3>
              Truth-preserving changes
            </h3>

            {tailoredResult
              ?.changes?.length ? (
              tailoredResult.changes.map(
                (
                  change,
                  index,
                ) => (
                  <div
                    key={`${change.section}-${change.action}-${index}`}
                    style={{
                      marginBottom:
                        '14px',
                    }}
                  >
                    <b>
                      {change.section.toUpperCase()}
                    </b>
                    <p
                      style={{
                        margin:
                          '4px 0 0',
                      }}
                    >
                      {
                        change.detail
                      }
                    </p>
                  </div>
                ),
              )
            ) : (
              <p>
                {tailoring
                  ? 'RoleClear is generating the version now.'
                  : 'No ordering changes were required.'}
              </p>
            )}

            {currentAnalysis
              .missingRequired
              .length > 0 && (
              <>
                <hr />
                <h4>
                  STILL MISSING
                </h4>
                {currentAnalysis
                  .missingRequired
                  .map(
                    (
                      requirement,
                    ) => (
                      <p
                        key={
                          requirement
                        }
                      >
                        •{' '}
                        {
                          requirement
                        }
                      </p>
                    ),
                  )}
              </>
            )}

            {tailoredResult
              ?.selected_evidence
              ?.length ? (
              <>
                <hr />
                <h4>
                  TOP EVIDENCE
                </h4>
                {tailoredResult
                  .selected_evidence
                  .slice(0, 8)
                  .map(
                    (
                      evidence,
                      index,
                    ) => (
                      <div
                        key={`${evidence.requirement}-${index}`}
                        style={{
                          marginBottom:
                            '12px',
                        }}
                      >
                        <b>
                          {Math.round(
                            evidence.similarity *
                              100,
                          )}
                          % ·{' '}
                          {
                            evidence.section
                          }
                        </b>
                        <p
                          style={{
                            margin:
                              '3px 0 0',
                          }}
                        >
                          {
                            evidence.evidence
                          }
                        </p>
                      </div>
                    ),
                  )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <p className="tailor-note">
        RoleClear generated this version through the live backend tailoring pipeline. It may reorder or select existing evidence, but it does not invent technologies, metrics, achievements or experience.
      </p>
    </div>
  );
}


/* =========================================================
   EXTERNAL APPLY
========================================================= */

function ExternalApply({
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

  const trackedApplications =
    useCareerStore(
      (state) =>
        state.trackedApplications,
    );

  const addTrackedApplication =
    useCareerStore(
      (state) =>
        state.addTrackedApplication,
    );

  const setSelectedApplication =
    useCareerStore(
      (state) =>
        state.setSelectedApplication,
    );

  const [openedOriginal, setOpenedOriginal] =
    useState(false);

  const activeTailoredVersion = (() => {
    try {
      const stored =
        window.localStorage.getItem(
          ACTIVE_TAILORED_VERSION_KEY,
        );

      if (!stored) return null;

      const parsed = JSON.parse(
        stored,
      ) as {
        versionId?: string;
        jobId?: string;
        name?: string;
      };

      return parsed.jobId ===
        currentJob?.id
        ? parsed
        : null;
    } catch {
      return null;
    }
  })();

  if (!currentJob || !currentAnalysis) {
    return (
      <div className="detail-page narrow-detail">
        <BackLink
          onClick={() =>
            setView('apply')
          }
          label="Back to Smart Apply"
        />

        <div className="detail-card">
          <span className="mini-label">
            SMART APPLY · STEP 05
          </span>

          <h2>
            No active application.
          </h2>

          <p>
            Analyze and tailor a job first, then return here to apply and track it.
          </p>

          <Button
            onClick={() =>
              setView('apply')
            }
          >
            Start Smart Apply
            <ArrowUpRight size={15} />
          </Button>
        </div>
      </div>
    );
  }

  const company =
    currentJob.company ??
    'Company';

  const role =
    currentJob.title ??
    'Opportunity';

  const source =
    currentJob.source ??
    'Original posting';

  const existing =
    trackedApplications.find(
      (application) =>
        application.jobId ===
        currentJob.id,
    );

  const openOriginal = () => {
    if (!currentJob.url) {
      return;
    }

    window.open(
      currentJob.url,
      '_blank',
      'noopener,noreferrer',
    );

    setOpenedOriginal(true);
  };

  const confirmApplied = () => {
    if (existing) {
      setSelectedApplication(
        existing.id,
      );

      setView(
        'application-detail',
      );

      return;
    }

    const now = new Date();

    const tracked = {
      id: `application-${currentJob.id}`,
      jobId: currentJob.id,
      company,
      role,
      source,
      url: currentJob.url,
      status: 'Applied' as const,
      fit:
        currentAnalysis.resumeFit,
      ghostRisk:
        currentAnalysis.ghostRisk,
      appliedAt:
        now.toISOString(),
      date: now.toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: '2-digit',
        },
      ),
      resumeLabel:
        activeTailoredVersion?.name ??
        `Tailored for ${company}`,
      resumeVersionId:
        activeTailoredVersion?.versionId,
      createdAt:
        now.toISOString(),
    };

    addTrackedApplication(
      tracked,
    );

    setSelectedApplication(
      tracked.id,
    );

    setView(
      'application-detail',
    );
  };

  return (
    <div className="detail-page narrow-detail">
      <BackLink
        onClick={() =>
          setView('resume-tailor')
        }
        label="Back to tailored resume"
      />

      <PageTitle
        eyebrow="Smart Apply · Step 05"
        title="Apply"
        subtitle={`Complete the application on the original site, then confirm it here so RoleClear can start tracking it.`}
      />

      <div className="ready-card">
        <div
          className="ready-mark"
          style={{
            marginBottom: '12px',
          }}
        >
          <CheckCircle2
            size={30}
          />
        </div>

        <h2
          style={{
            marginBottom: '6px',
          }}
        >
          Your application package is ready.
        </h2>

        <p
          style={{
            marginTop: 0,
          }}
        >
          RoleClear does not submit the application for you. It opens the employer's original application page and records the application only after you confirm submission.
        </p>

        <div className="ready-details">
          <div>
            <span>COMPANY</span>
            <b>{company}</b>
          </div>

          <div>
            <span>ROLE</span>
            <b>{role}</b>
          </div>

          <div>
            <span>SOURCE</span>
            <b>{source}</b>
          </div>

          <div>
            <span>RESUME VERSION</span>
            <b>
              {activeTailoredVersion?.versionId
                ? activeTailoredVersion.versionId.slice(0, 8)
                : 'Current tailored version'}
            </b>
          </div>

          <div>
            <span>RESUME FIT</span>
            <b>
              {
                currentAnalysis.resumeFit
              }
              %
            </b>
          </div>
        </div>

        <div
          className="detail-card"
          style={{
            marginTop: '16px',
            textAlign: 'left',
          }}
        >
          <span className="mini-label">
            BEFORE YOU SUBMIT
          </span>

          <div
            style={{
              display: 'grid',
              gap: '9px',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '9px',
                alignItems: 'flex-start',
              }}
            >
              <Check
                size={15}
                style={{
                  marginTop: '2px',
                }}
              />
              <span>
                Use the tailored resume you just reviewed.
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '9px',
                alignItems: 'flex-start',
              }}
            >
              <Check
                size={15}
                style={{
                  marginTop: '2px',
                }}
              />
              <span>
                Review any employer-specific questions before submission.
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '9px',
                alignItems: 'flex-start',
              }}
            >
              <Check
                size={15}
                style={{
                  marginTop: '2px',
                }}
              />
              <span>
                Confirm the application here only after the employer site says it was submitted.
              </span>
            </div>
          </div>
        </div>

        {currentJob.url ? (
          <Button
            className="full-button"
            onClick={
              openOriginal
            }
          >
            {openedOriginal
              ? 'Open original site again'
              : 'Apply on original site'}
            <ExternalLink
              size={16}
            />
          </Button>
        ) : (
          <div
            className="detail-card"
            style={{
              marginTop: '14px',
            }}
          >
            <b>
              No original application URL is available.
            </b>
            <p
              style={{
                marginBottom: 0,
              }}
            >
              Return to Smart Apply and import the opportunity from its original job URL.
            </p>
          </div>
        )}

        <button
          className="after-apply"
          onClick={
            confirmApplied
          }
        >
          {existing
            ? 'Already tracked — open application'
            : "I've applied — add to tracker"}
          <ArrowUpRight
            size={15}
          />
        </button>

        {!openedOriginal &&
          !existing && (
            <small
              style={{
                display:
                  'block',
                marginTop:
                  '10px',
                opacity: 0.62,
              }}
            >
              Open the employer site first. RoleClear will not mark this application as submitted automatically.
            </small>
          )}
      </div>
    </div>
  );
}

/* =========================================================
   APPLICATION DETAIL
========================================================= */

function ApplicationDetail({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const trackedApplications =
    useCareerStore(
      (state) =>
        state.trackedApplications,
    );

  const selectedApplicationId =
    useCareerStore(
      (state) =>
        state.selectedApplicationId,
    );

  const updateTrackedApplicationStatus =
    useCareerStore(
      (state) =>
        state.updateTrackedApplicationStatus,
    );

  const deleteTrackedApplication =
    useCareerStore(
      (state) =>
        state.deleteTrackedApplication,
    );

  const selected =
    trackedApplications.find(
      (application) =>
        application.id ===
        selectedApplicationId,
    );

  if (!selected) {
    return (
      <div className="detail-page">
        <BackLink
          onClick={() =>
            setView(
              'applications',
            )
          }
          label="Back to tracker"
        />

        <div className="detail-card">
          <span className="mini-label">
            APPLICATION TRACKER
          </span>

          <h2>
            Select a tracked application.
          </h2>

          <p>
            Applications confirmed through Smart Apply appear here with their live details.
          </p>

          <Button
            onClick={() =>
              setView(
                'applications',
              )
            }
          >
            Open tracker
          </Button>
        </div>
      </div>
    );
  }

  const appliedDate =
    new Date(
      selected.appliedAt,
    ).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    );

  const openOriginal = () => {
    if (!selected.url) return;

    window.open(
      selected.url,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const deleteApplication = () => {
    const confirmed =
      window.confirm(
        `Delete ${selected.role} at ${selected.company} from your tracker? This cannot be undone.`,
      );

    if (!confirmed) return;

    deleteTrackedApplication(
      selected.id,
    );

    setView(
      'applications',
    );
  };

  return (
    <div className="detail-page">
      <BackLink
        onClick={() =>
          setView(
            'applications',
          )
        }
        label="Back to tracker"
      />

      <PageTitle
        eyebrow="Application detail"
        title={
          selected.company
        }
        subtitle={`${selected.role} · ${selected.source}`}
        action={
          selected.url ? (
            <Button
              variant="secondary"
              onClick={
                openOriginal
              }
            >
              Open original
              <ExternalLink
                size={15}
              />
            </Button>
          ) : undefined
        }
      />

      <div className="application-detail-grid">
        <div>
          <div className="detail-card">
            <span className="mini-label">
              CURRENT STATUS
            </span>

            <div className="big-status">
              <span
                className={`status status-${selected.status.toLowerCase()}`}
              >
                {
                  selected.status
                }
              </span>

              <b>
                Application is being tracked by RoleClear.
              </b>
            </div>

            <div className="timeline">
              <TimelineItem
                date={
                  selected.date
                }
                title="Applied"
                text={`Confirmed manually after submission on the original ${selected.source} page.`}
                done
              />

              <TimelineItem
                date="Next"
                title="Watch for updates"
                text="Move the application to Screening, Interview, Offer or Rejected when the employer responds."
                active
              />
            </div>
          </div>

          <div
            className="detail-card"
            style={{
              marginTop: '14px',
            }}
          >
            <span className="mini-label">
              UPDATE STATUS
            </span>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '10px',
              }}
            >
              {[
                'Applied',
                'Screening',
                'Interview',
                'Offer',
                'Rejected',
                'Withdrawn',
              ].map((status) => (
                <Button
                  key={status}
                  variant={
                    selected.status ===
                    status
                      ? 'primary'
                      : 'secondary'
                  }
                  onClick={() =>
                    updateTrackedApplicationStatus(
                      selected.id,
                      status as
                        | 'Applied'
                        | 'Screening'
                        | 'Interview'
                        | 'Offer'
                        | 'Rejected'
                        | 'Withdrawn',
                    )
                  }
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="detail-card">
            <span className="mini-label">
              APPLICATION DATA
            </span>

            <DetailPair
              label="Source"
              value={
                selected.source
              }
            />

            <DetailPair
              label="Applied"
              value={
                appliedDate
              }
            />

            <DetailPair
              label="Resume"
              value={
                selected.resumeLabel
              }
            />

            <DetailPair
              label="Resume Fit"
              value={`${selected.fit}%`}
            />

            <DetailPair
              label="Ghost Risk"
              value={
                selected.ghostRisk
                  .charAt(0)
                  .toUpperCase() +
                selected.ghostRisk.slice(
                  1,
                )
              }
            />
          </div>

          <div className="detail-card">
            <span className="mini-label">
              NEXT ACTION
            </span>

            <h3>
              Keep the application status current.
            </h3>

            <p>
              RoleClear will use this application record for your tracker and later analytics.
            </p>

            {selected.url && (
              <Button
                variant="secondary"
                className="full-button"
                onClick={
                  openOriginal
                }
              >
                Open job posting
                <ExternalLink
                  size={15}
                />
              </Button>
            )}

            <button
              type="button"
              onClick={
                deleteApplication
              }
              style={{
                marginTop: '10px',
                width: '100%',
                minHeight: '40px',
                border:
                  '1px solid rgba(220, 38, 38, 0.22)',
                borderRadius: '8px',
                background:
                  'rgba(220, 38, 38, 0.05)',
                cursor: 'pointer',
                display:
                  'inline-flex',
                justifyContent:
                  'center',
                alignItems:
                  'center',
                gap: '7px',
                fontWeight: 600,
              }}
            >
              <Trash2 size={15} />
              Delete application
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TimelineItem({
  date,
  title,
  text,
  done,
  active,
}: {
  date: string;
  title: string;
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className={`timeline-item ${active ? 'active' : ''}`}>
      <div className="timeline-dot">
        {done ? <Check size={11} /> : active ? <span /> : null}
      </div>

      <div>
        <small>{date}</small>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

function DetailPair({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-pair">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

/* =========================================================
   RESUME DETAIL
========================================================= */

function ATSChecker({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const currentResume = useCareerStore(
    (state) => state.currentResume,
  );
  const setCurrentResume = useCareerStore(
    (state) => state.setCurrentResume,
  );

  const [uploading, setUploading] =
    useState(false);
  const [uploadError, setUploadError] =
    useState('');

  const ats =
    calculateAtsReadiness(
      currentResume,
    );

  const scoreLabel =
    ats.score >= 90
      ? 'Excellent resume readiness'
      : ats.score >= 80
        ? 'Strong resume readiness'
        : ats.score >= 70
          ? 'Good, with important fixes'
          : ats.score >= 55
            ? 'Needs refinement'
            : 'Needs improvement';

  const handleResumeUpload = async (
    file: File | null,
  ) => {
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const parsed =
        await parseResumeFile(file);
      setCurrentResume(parsed);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Could not parse this resume.',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 820px) {
          .ats-top-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PageTitle
        eyebrow="Standalone resume analysis"
        title="ATS Checker"
        subtitle="Check the ATS readiness of any resume without selecting or importing a job."
        action={
          <label
            className="button"
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Upload size={17} />

            {uploading
              ? 'Analyzing...'
              : currentResume
                ? 'Check another resume'
                : 'Upload resume'}

            <input
              type="file"
              accept=".pdf,.docx"
              hidden
              disabled={uploading}
              onChange={(event) => {
                void handleResumeUpload(
                  event.target.files?.[0] ??
                    null,
                );
                event.currentTarget.value =
                  '';
              }}
            />
          </label>
        }
      />

      {uploadError && (
        <div
          className="detail-card"
          style={{
            marginBottom: '14px',
          }}
        >
          <b>Resume analysis failed</b>
          <p>{uploadError}</p>
        </div>
      )}

      {!currentResume ? (
        <div
          className="detail-card"
          style={{
            textAlign: 'center',
            padding: '42px 24px',
          }}
        >
          <ShieldCheck
            size={34}
            style={{
              marginBottom: '12px',
            }}
          />

          <h2>
            Upload a resume to check ATS readiness
          </h2>

          <p>
            No job description is required. RoleClear checks ATS parseability, core information, experience impact, bullet quality, consistency and readability using only signals it can verify from the uploaded resume.
          </p>

          <label
            className="button"
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Upload size={17} />
            Select resume

            <input
              type="file"
              accept=".pdf,.docx"
              hidden
              disabled={uploading}
              onChange={(event) => {
                void handleResumeUpload(
                  event.target.files?.[0] ??
                    null,
                );
                event.currentTarget.value =
                  '';
              }}
            />
          </label>
        </div>
      ) : (
        <>
          <div
            className="ats-top-grid"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '14px',
              marginBottom: '22px',
              alignItems: 'stretch',
            }}
          >
            <div
              className="detail-card"
              style={{
                padding: '20px 22px',
                minHeight: '190px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div className="file-icon">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    ATS Readiness
                  </h3>
                  <p
                    style={{
                      margin:
                        '3px 0 0',
                    }}
                  >
                    Resume-level score
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'auto 1fr',
                  gap: '22px',
                  alignItems: 'end',
                  marginTop: '18px',
                }}
              >
                <div>
                  <span
                    style={{
                      display:
                        'block',
                      fontSize:
                        '0.78rem',
                      opacity: 0.68,
                      marginBottom:
                        '3px',
                    }}
                  >
                    Overall score
                  </span>

                  <strong
                    style={{
                      fontSize:
                        '34px',
                      lineHeight: 1,
                    }}
                  >
                    {ats.score}
                    <small
                      style={{
                        fontSize:
                          '13px',
                        opacity:
                          0.55,
                        marginLeft:
                          '5px',
                      }}
                    >
                      / 100
                    </small>
                  </strong>

                  <small
                    style={{
                      display:
                        'block',
                      marginTop:
                        '7px',
                    }}
                  >
                    {scoreLabel}
                  </small>
                </div>

                <div
                  style={{
                    alignSelf:
                      'center',
                  }}
                >
                  <div
                    style={{
                      height: '7px',
                      width: '100%',
                      background:
                        'rgba(0,0,0,0.08)',
                      borderRadius:
                        '999px',
                      overflow:
                        'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${ats.score}%`,
                        height:
                          '100%',
                        background:
                          'currentColor',
                        borderRadius:
                          '999px',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop:
                        '7px',
                      fontSize:
                        '0.78rem',
                      opacity: 0.58,
                    }}
                  >
                    0 &nbsp; Needs work
                    &nbsp;&nbsp; 70 &nbsp; Good
                    &nbsp;&nbsp; 90+ &nbsp; Excellent
                  </div>
                </div>
              </div>
            </div>

            <div
              className="detail-card"
              style={{
                padding: '20px 22px',
                minHeight: '190px',
                background:
                  'rgba(34, 197, 94, 0.07)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: '9px',
                    marginBottom:
                      '12px',
                  }}
                >
                  <Target size={18} />

                  <span className="mini-label">
                    PRIORITY FIX
                  </span>
                </div>

                <h3
                  style={{
                    margin:
                      '0 0 8px',
                    maxWidth:
                      '520px',
                    lineHeight:
                      1.28,
                  }}
                >
                  {ats.recommendations[0]?.solution ??
                    'No scored issue is currently reducing this resume-readiness score.'}
                </h3>
              </div>

              <div
                style={{
                  borderTop:
                    '1px solid rgba(0,0,0,0.08)',
                  paddingTop:
                    '10px',
                  marginTop:
                    '12px',
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <small>
                  Independent of any job description
                </small>

                <small>
                  Exact total of scored checks below
                </small>
              </div>
            </div>
          </div>

          <div className="section-row">
            <h2>Score breakdown</h2>

            <span className="mini-label">
              Resume only
            </span>
          </div>

          <div className="version-grid">
            {ats.breakdown.map(
              (item) => (
                <div
                  className="version-card"
                  key={item.label}
                >
                  <div className="version-icon">
                    <Target size={20} />
                  </div>

                  <div>
                    <b>
                      {item.label}
                    </b>
                    <span>
                      Research-backed resume signal
                    </span>
                  </div>

                  <strong>
                    {item.score}/
                    {item.max}
                  </strong>
                </div>
              ),
            )}
          </div>

          <div
            className="detail-card"
            style={{
              marginTop: '18px',
            }}
          >
            <span className="mini-label">
              RECOMMENDATIONS
            </span>

            {ats.recommendations.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  marginTop: '12px',
                }}
              >
                {ats.recommendations.map(
                  (check, index) => {
                    const lost =
                      check.max -
                      check.score;

                    const priority =
                      index === 0 ||
                      check.severity ===
                        'high'
                        ? 'HIGH'
                        : index <= 3
                          ? 'MEDIUM'
                          : 'LOW';

                    return (
                      <div
                        key={check.id}
                        style={{
                          padding: '15px',
                          border:
                            '1px solid rgba(0,0,0,0.09)',
                          borderRadius:
                            '10px',
                          background:
                            priority ===
                            'HIGH'
                              ? 'rgba(255, 122, 0, 0.07)'
                              : 'rgba(0,0,0,0.015)',
                        }}
                      >
                        <div
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            gap: '12px',
                            alignItems:
                              'flex-start',
                            marginBottom:
                              '8px',
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              gap: '8px',
                              alignItems:
                                'center',
                              flexWrap:
                                'wrap',
                            }}
                          >
                            <span
                              style={{
                                display:
                                  'inline-block',
                                fontSize:
                                  '0.72rem',
                                fontWeight:
                                  800,
                                letterSpacing:
                                  '0.06em',
                                padding:
                                  '4px 7px',
                                borderRadius:
                                  '999px',
                                background:
                                  priority ===
                                  'HIGH'
                                    ? 'rgba(255, 122, 0, 0.14)'
                                    : 'rgba(0,0,0,0.06)',
                              }}
                            >
                              {priority}
                            </span>

                            <b>
                              {check.label}
                            </b>
                          </div>

                          <strong>
                            -{lost}{' '}
                            point
                            {lost === 1
                              ? ''
                              : 's'}
                          </strong>
                        </div>

                        <div
                          style={{
                            display:
                              'grid',
                            gap: '7px',
                          }}
                        >
                          <div>
                            <span className="mini-label">
                              WHY
                            </span>
                            <div>
                              {check.reason}
                            </div>
                          </div>

                          {check.evidence && (
                            <div>
                              <span className="mini-label">
                                DETECTED
                              </span>
                              <div>
                                {
                                  check.evidence
                                }
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="mini-label">
                              FIX
                            </span>
                            <div>
                              {
                                check.solution
                              }
                            </div>
                          </div>

                          <div
                            style={{
                              opacity:
                                0.68,
                              fontSize:
                                '0.84rem',
                            }}
                          >
                            {check.score}/
                            {check.max} in{' '}
                            {check.category}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <p>
                Every currently verifiable scored check passed. This still does not mean an employer ATS will rank the resume highly for a specific job; use Smart Apply for job-specific matching.
              </p>
            )}

            {ats.optionalSignals.length > 0 && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '13px 14px',
                  borderRadius: '10px',
                  background:
                    'rgba(34, 197, 94, 0.07)',
                }}
              >
                <b>
                  Optional enrichment detected
                </b>
                <div
                  style={{
                    marginTop: '5px',
                  }}
                >
                  {ats.optionalSignals.join(
                    ' · ',
                  )}
                </div>
                <small
                  style={{
                    display: 'block',
                    marginTop: '5px',
                    opacity: 0.7,
                  }}
                >
                  These sections can strengthen a profile but never add points to ATS Readiness.
                </small>
              </div>
            )}

            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop:
                  '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <b
                style={{
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                How to use this report
              </b>
              <p
                style={{
                  margin: 0,
                  opacity: 0.72,
                }}
              >
                Fix the largest point deductions first. Every deduction above shows the exact rule, evidence and correction. RoleClear does not score unverified claims such as font family, margins, tables, images or column count until the backend can inspect those layout properties directly. This is a deterministic resume-readiness score, not an employer ATS ranking.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '18px',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="secondary"
              onClick={() =>
                setView('resumes')
              }
            >
              Resume Studio
            </Button>

            <Button
              onClick={() =>
                setView('apply')
              }
            >
              Check job-specific fit
              <ArrowUpRight size={15} />
            </Button>
          </div>
        </>
      )}
    </>
  );
}

function ResumeDetail({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const currentResume = useCareerStore(
    (state) => state.currentResume,
  );
  const currentAnalysis = useCareerStore(
    (state) => state.currentAnalysis,
  );

  if (!currentResume) {
    return (
      <div className="detail-page">
        <BackLink
          onClick={() =>
            setView('resumes')
          }
          label="Back to Resume Studio"
        />

        <div className="detail-card">
          <span className="mini-label">
            ATS READINESS
          </span>
          <h2>No resume analyzed yet.</h2>
          <p>
            Upload a resume in Resume Studio to generate the ATS readiness report.
          </p>
          <Button
            onClick={() =>
              setView('resumes')
            }
          >
            Go to Resume Studio
          </Button>
        </div>
      </div>
    );
  }

  const ats =
    calculateAtsReadiness(
      currentResume,
    );

  return (
    <div className="detail-page">
      <BackLink
        onClick={() =>
          setView('resumes')
        }
        label="Back to Resume Studio"
      />

      <PageTitle
        eyebrow="Resume intelligence"
        title="ATS readiness report"
        subtitle="A resume-level quality score based on structure, parseability, evidence and keyword coverage."
      />

      <div className="resume-detail-grid">
        <div>
          <div
            className="detail-card"
            style={{
              marginBottom: '14px',
            }}
          >
            <span className="mini-label">
              ATS READINESS
            </span>
            <strong
              style={{
                display: 'block',
                fontSize: '40px',
                margin: '8px 0',
              }}
            >
              {ats.score} / 100
            </strong>
            <p>
              This is a RoleClear readiness estimate, not a score returned by a specific employer ATS.
            </p>
          </div>

          <div className="detail-card">
            <span className="mini-label">
              SCORE BREAKDOWN
            </span>

            {ats.breakdown.map(
              (item) => (
                <DetailPair
                  key={item.label}
                  label={item.label}
                  value={`${item.score} / ${item.max}`}
                />
              ),
            )}
          </div>
        </div>

        <aside>
          <div className="detail-card">
            <span className="mini-label">
              PRIORITY IMPROVEMENTS
            </span>

            {ats.recommendations.length > 0 ? (
              <ul className="plain-list">
                {ats.recommendations
                  .slice(0, 5)
                  .map((item) => (
                    <li key={item.id}>
                      <b>{item.label}:</b>{' '}
                      {item.solution}
                    </li>
                  ))}
              </ul>
            ) : (
              <p>
                No scored issue is currently reducing this resume-readiness score.
              </p>
            )}
          </div>

          <div className="detail-card">
            <span className="mini-label">
              JOB-SPECIFIC SCORE
            </span>

            {currentAnalysis ? (
              <>
                <DetailPair
                  label="Current Resume Fit"
                  value={`${currentAnalysis.resumeFit}%`}
                />
                <DetailPair
                  label="Capabilities"
                  value={`${currentAnalysis.canonicalBreakdown.capabilities}%`}
                />
                <DetailPair
                  label="Experience"
                  value={`${currentAnalysis.canonicalBreakdown.experience}%`}
                />
              </>
            ) : (
              <p>
                Run Smart Apply against a job to calculate role-specific fit.
              </p>
            )}

            <Button
              className="full-button"
              onClick={() =>
                setView(
                  currentAnalysis
                    ? 'resume-tailor'
                    : 'apply',
                )
              }
            >
              {currentAnalysis
                ? 'Open Tailor Studio'
                : 'Start Smart Apply'}
              <Sparkles size={15} />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================================
   EMAIL CONNECT
========================================================= */

function EmailConnect({
  setView,
}: {
  setView: (view: View) => void;
}) {
  const [status, setStatus] =
    useState<GmailConnectionStatus>({
      connected: false,
      email: null,
    });

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const refresh = async () => {
    const next =
      await fetchGmailStatus();

    setStatus(next);
  };

  useEffect(() => {
    void refresh();

    const onFocus = () => {
      void refresh();
    };

    window.addEventListener(
      'focus',
      onFocus,
    );

    const onMessage = (
      event: MessageEvent,
    ) => {
      if (
        event.origin !==
        'http://127.0.0.1:8000'
      ) {
        return;
      }

      if (
        event.data?.type ===
        'roleclear:gmail-connected'
      ) {
        void refresh();
        setMessage(
          'Gmail connected successfully.',
        );
      }
    };

    window.addEventListener(
      'message',
      onMessage,
    );

    return () => {
      window.removeEventListener(
        'focus',
        onFocus,
      );

      window.removeEventListener(
        'message',
        onMessage,
      );
    };
  }, []);

  const connect = async () => {
    setBusy(true);
    setMessage('');

    try {
      const popup =
        await startGmailOAuth();

      setMessage(
        'Complete Google sign-in in the popup...',
      );

      const nextStatus =
        await waitForGmailConnection(
          popup,
        );

      setStatus(nextStatus);

      setMessage(
        `Gmail connected${nextStatus.email ? ` · ${nextStatus.email}` : ''}.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not connect Gmail.',
      );
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    const confirmed =
      window.confirm(
        'Disconnect Gmail from RoleClear?',
      );

    if (!confirmed) return;

    setBusy(true);
    setMessage('');

    try {
      await disconnectGmail();
      await refresh();
      setMessage(
        'Gmail disconnected.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not disconnect Gmail.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="detail-page narrow-detail">
      <BackLink
        onClick={() =>
          setView('inbox')
        }
        label="Back to Career Inbox"
      />

      <PageTitle
        eyebrow="Career Inbox"
        title="Email connections"
        subtitle="Connect a mailbox so RoleClear can read career-related emails and convert them into reviewable tracker signals."
      />

      <div className="email-connect-card">
        <div className="email-security">
          <ShieldCheck size={22} />

          <div>
            <b>
              Gmail read-only access
            </b>

            <p>
              RoleClear requests Gmail read-only access for Career Inbox V1. It does not request permission to send, delete, or modify your email.
            </p>
          </div>
        </div>

        <div className="integration-choice">
          <span className="integration-logo">
            G
          </span>

          <div>
            <b>Gmail</b>
            <small>
              {status.connected
                ? `Connected${status.email ? ` · ${status.email}` : ''}`
                : 'Not connected'}
            </small>
          </div>

          {status.connected ? (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() =>
                void disconnect()
              }
            >
              Disconnect
            </Button>
          ) : (
            <Button
              disabled={busy}
              onClick={() =>
                void connect()
              }
            >
              Connect Gmail
            </Button>
          )}
        </div>

        <div className="integration-choice">
          <span className="integration-logo">
            O
          </span>

          <div>
            <b>Outlook</b>
            <small>
              Microsoft OAuth integration is not implemented yet
            </small>
          </div>

          <Button
            variant="secondary"
            disabled
          >
            Next
          </Button>
        </div>

        {message && (
          <p className="email-disclaimer">
            {message}
          </p>
        )}

        <p className="email-disclaimer">
          Synced messages are classified into application, interview, offer, rejection and recruiter signals. RoleClear never changes a tracker status merely because an email was found; the user confirms the suggested status.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function Notifications({
  setView,
}: {
  setView: (view: View) => void;
}) {
  return (
    <div className="detail-page">
      <BackLink
        onClick={() => setView('dashboard')}
        label="Back to dashboard"
      />

      <PageTitle
        eyebrow="Stay informed, not interrupted"
        title="Notifications"
        subtitle="Only the career events that require your attention."
      />

      <div className="notification-list">
        <NotificationItem
          title="Interview update"
          text="Stripe moved your application forward."
          time="12 min ago"
          priority="Action required"
        />

        <NotificationItem
          title="Follow-up reminder"
          text="Razorpay has been waiting 7 days."
          time="Yesterday"
          priority="Action required"
        />

        <NotificationItem
          title="Resume insight"
          text="Docker appears frequently in your target roles."
          time="Jun 13"
          priority="Informational"
        />
      </div>
    </div>
  );
}

function NotificationItem({
  title,
  text,
  time,
  priority,
}: {
  title: string;
  text: string;
  time: string;
  priority: string;
}) {
  return (
    <div className="notification-item">
      <span className="notification-icon">
        <Bell size={17} />
      </span>

      <div>
        <span className="mini-label">{priority}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <small>{time}</small>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile({
  setView,
}: {
  setView: (view: View) => void;
}) {
  return (
    <div className="detail-page">
      <PageTitle
        eyebrow="Your RoleClear identity"
        title="Profile"
        subtitle="The minimum personal information needed to run your career workspace."
      />

      <div className="profile-grid">
        <div className="profile-card">
          <span className="profile-large">AR</span>

          <h2>Aarya Rai</h2>

          <p>aarya@example.com</p>

          <span className="profile-phone">
            <Smartphone size={14} />
            +91 ••••• ••210
          </span>
        </div>

        <div className="detail-card">
          <span className="mini-label">CAREER PREFERENCES</span>

          <DetailPair
            label="Looking for"
            value="Internships + Full-time"
          />

          <DetailPair
            label="Target roles"
            value="Software Engineering"
          />

          <DetailPair
            label="Work preference"
            value="Hybrid / Remote"
          />

          <DetailPair
            label="Locations"
            value="Bangalore · Chennai · Remote"
          />

          <Button variant="secondary" className="full-button">
            Edit preferences
          </Button>
        </div>

        <div className="detail-card">
          <span className="mini-label">ACCOUNT</span>

          <DetailPair label="Authentication" value="Email + Google" />
          <DetailPair label="Resumes stored" value="3 / 5" />
          <DetailPair label="Email connector" value="Optional" />

          <Button
            variant="secondary"
            className="full-button"
            onClick={() => setView('security')}
          >
            Privacy & security
            <ShieldCheck size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECURITY
========================================================= */

function Security({
  setView,
}: {
  setView: (view: View) => void;
}) {
  return (
    <div className="detail-page">
      <BackLink
        onClick={() => setView('profile')}
        label="Back to profile"
      />

      <PageTitle
        eyebrow="Your data. Your rules."
        title="Privacy & Security"
        subtitle="Controls for resumes, applications, sessions and connected accounts."
      />

      <div className="security-grid">
        <SecurityItem
          icon={<ShieldCheck />}
          title="Private career data"
          text="Resumes, applications and analysis results are scoped to your account."
        />

        <SecurityItem
          icon={<Mail />}
          title="Optional email access"
          text="Gmail or Outlook connections can be disconnected at any time."
        />

        <SecurityItem
          icon={<KeyRound />}
          title="Account sessions"
          text="Review and revoke active sessions from your account controls."
        />

        <SecurityItem
          icon={<Cloud />}
          title="Data controls"
          text="Delete resumes, applications or your complete account when you choose."
        />
      </div>

      <div className="danger-zone">
        <span className="mini-label">DANGER ZONE</span>

        <h3>Delete your RoleClear data</h3>

        <p>
          This permanently removes your career workspace and stored application
          data.
        </p>

        <Button variant="secondary">
          Delete account
        </Button>
      </div>
    </div>
  );
}

function SecurityItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="security-item">
      <span>{icon}</span>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <CheckCircle2 size={17} />
    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */

function MobileNav({
  view,
  setView,
}: {
  view: View;
  setView: (view: View) => void;
}) {
  const items: {
    id: View;
    label: string;
    icon: typeof LayoutDashboard;
  }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'apply', label: 'Apply', icon: Zap },
    { id: 'applications', label: 'Tracker', icon: BriefcaseBusiness },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'profile', label: 'Profile', icon: UserRound },
  ];

  return (
    <nav className="mobile-nav">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={view === id ? 'active' : ''}
          onClick={() => setView(id)}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* =========================================================
   ROOT
========================================================= */

export default function App() {
  const [auth, setAuth] = useState<AuthView>('landing');
  const [entered, setEntered] = useState(false);

  const handleLogout = () => {
    setEntered(false);
    setAuth('landing');
  };

  if (entered) {
    return <AppShell onLogout={handleLogout} />;
  }

  if (auth === 'landing') {
    return <Landing onAuth={setAuth} />;
  }

  return (
    <Auth
      mode={auth as 'signin' | 'signup' | 'otp'}
      onAuth={setAuth}
      onEnter={() => setEntered(true)}
    />
  );
}
