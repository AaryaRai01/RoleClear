import { useCareerStore } from './store/useCareerStore';
import './roleclear-refine.css';
import './roleclear-motion-ui.css';
import './smart-apply-ui.css';
import './resume-studio-ui.css';
import './career-inbox-ui.css';
import './ats-checker-ui.css';
import './roleclear-final-fixes.css';
import './roleclear-final-cleanup.css';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const EMAIL_API_BASE =
  `${API_BASE_URL}/api/v1/email`;

const API_ORIGIN =
  new URL(API_BASE_URL).origin;

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
  AlertTriangle,
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
  LogOut,
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

import CareerFeed from './CareerFeed';
import Analytics from './Analytics';
import SettingsView from './SettingsView';

type CareerInboxEventBase =
  ReturnType<
    typeof useCareerStore.getState
  >['careerInboxEvents'][number];

type CareerInboxEventCompat =
  Omit<CareerInboxEventBase, 'type'> & {
    type: string;
    subject?: string;
    company?: string;
    role?: string;
    createdAt?: string;
  };

import {
  AuthenticateWithRedirectCallback,
  useAuth,
  useClerk,
  useSignIn,
  useSignUp,
  useUser,
} from '@clerk/react';

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
      <img
        className="roleclear-brand-icon"
        src="/roleclear-icon.svg"
        alt="RoleClear"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
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
}: {
  mode: 'signin' | 'signup' | 'otp';
  onAuth: (view: AuthView) => void;
}) {
  const signInMode = mode === 'signin';

  const {
    signIn,
    fetchStatus: signInFetchStatus,
  } = useSignIn();

  const {
    signUp,
    fetchStatus: signUpFetchStatus,
  } = useSignUp();

  const [submitting, setSubmitting] =
    useState(false);
  const [authError, setAuthError] =
    useState('');
  const [authMessage, setAuthMessage] =
    useState('');
  const [verificationCode, setVerificationCode] =
    useState('');

  const errorText = (
    error: unknown,
    fallback: string,
  ) => {
    if (
      typeof error === 'object' &&
      error !== null
    ) {
      const value = error as {
        message?: string;
        longMessage?: string;
        errors?: Array<{
          message?: string;
          longMessage?: string;
        }>;
      };

      return (
        value.longMessage ||
        value.message ||
        value.errors?.[0]?.longMessage ||
        value.errors?.[0]?.message ||
        fallback
      );
    }

    return fallback;
  };

  const finishSignIn =
    async () => {
      if (
        signIn.status ===
        'complete'
      ) {
        const { error } =
          await signIn.finalize();

        if (error) {
          throw error;
        }
      }
    };

  const finishSignUp =
    async () => {
      if (
        signUp.status ===
        'complete'
      ) {
        const { error } =
          await signUp.finalize();

        if (error) {
          throw error;
        }
      }
    };

  const handleEmailAuth = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setAuthError('');
    setAuthMessage('');

    const form =
      new FormData(
        event.currentTarget,
      );

    const email =
      String(
        form.get('email') ?? '',
      ).trim();

    const password =
      String(
        form.get('password') ?? '',
      );

    try {
      if (signInMode) {
        const {
          error,
        } =
          await signIn.password({
            emailAddress: email,
            password,
          });

        if (error) {
          throw error;
        }

        if (
          signIn.status ===
          'complete'
        ) {
          await finishSignIn();
          return;
        }

        if (
          signIn.status ===
            'needs_client_trust' ||
          signIn.status ===
            'needs_second_factor'
        ) {
          const {
            error: codeError,
          } =
            await signIn.mfa
              .sendEmailCode();

          if (codeError) {
            throw codeError;
          }

          setAuthMessage(
            'We sent a verification code to your email.',
          );
          onAuth('otp');
          return;
        }

        throw new Error(
          'Additional sign-in verification is required.',
        );
      }

      const fullName =
        String(
          form.get('name') ?? '',
        ).trim();

      const mobile =
        String(
          form.get('mobile') ?? '',
        ).trim();

      const nameParts =
        fullName
          .split(/\s+/)
          .filter(Boolean);

      const firstName =
        nameParts[0] ?? '';

      const lastName =
        nameParts
          .slice(1)
          .join(' ');

      const {
        error,
      } =
        await signUp.password({
          emailAddress: email,
          password,
          firstName,
          lastName,
          unsafeMetadata: {
            full_name: fullName,
            mobile,
          },
        });

      if (error) {
        throw error;
      }

      const {
        error: verificationError,
      } =
        await signUp.verifications
          .sendEmailCode();

      if (verificationError) {
        throw verificationError;
      }

      setAuthMessage(
        'We sent a verification code to your email.',
      );

      onAuth('otp');
    } catch (error) {
      setAuthError(
        errorText(
          error,
          signInMode
            ? 'Sign-in failed.'
            : 'Account creation failed.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode =
    async (
      event:
        React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setSubmitting(true);
      setAuthError('');
      setAuthMessage('');

      try {
        const code =
          verificationCode.trim();

        if (!code) {
          throw new Error(
            'Enter the verification code.',
          );
        }

        if (
          signUp.status ===
            'missing_requirements' &&
          signUp.unverifiedFields.includes(
            'email_address',
          )
        ) {
          const {
            error,
          } =
            await signUp.verifications
              .verifyEmailCode({
                code,
              });

          if (error) {
            throw error;
          }

          await finishSignUp();
          return;
        }

        if (
          signIn.status ===
            'needs_client_trust' ||
          signIn.status ===
            'needs_second_factor'
        ) {
          const {
            error,
          } =
            await signIn.mfa
              .verifyEmailCode({
                code,
              });

          if (error) {
            throw error;
          }

          await finishSignIn();
          return;
        }

        throw new Error(
          'No active verification request was found. Start sign-in or sign-up again.',
        );
      } catch (error) {
        setAuthError(
          errorText(
            error,
            'Verification failed.',
          ),
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleGoogleAuth =
    async () => {
      setSubmitting(true);
      setAuthError('');
      setAuthMessage('');

      try {
        const origin =
          window.location.origin;

        const {
          error,
        } =
          await signIn.sso({
            strategy:
              'oauth_google',
            redirectCallbackUrl:
              `${origin}/sso-callback`,
            redirectUrl:
              origin,
          });

        if (error) {
          throw error;
        }
      } catch (error) {
        setAuthError(
          errorText(
            error,
            'Google sign-in failed.',
          ),
        );
        setSubmitting(false);
      }
    };

  const handleForgotPassword =
    async () => {
      const email =
        window.prompt(
          'Enter the email for your RoleClear account:',
        );

      if (!email?.trim()) {
        return;
      }

      setSubmitting(true);
      setAuthError('');
      setAuthMessage('');

      try {
        const {
          error: createError,
        } =
          await signIn.create({
            identifier:
              email.trim(),
          });

        if (createError) {
          throw createError;
        }

        const {
          error: sendError,
        } =
          await signIn
            .resetPasswordEmailCode
            .sendCode();

        if (sendError) {
          throw sendError;
        }

        const code =
          window.prompt(
            'Enter the password reset code sent to your email:',
          );

        if (!code?.trim()) {
          return;
        }

        const {
          error: verifyError,
        } =
          await signIn
            .resetPasswordEmailCode
            .verifyCode({
              code:
                code.trim(),
            });

        if (verifyError) {
          throw verifyError;
        }

        const newPassword =
          window.prompt(
            'Enter your new password (minimum 15 characters):',
          );

        if (
          !newPassword ||
          newPassword.length < 15
        ) {
          throw new Error(
            'Password must be at least 15 characters.',
          );
        }

        const {
          error: passwordError,
        } =
          await signIn
            .resetPasswordEmailCode
            .submitPassword({
              password:
                newPassword,
              signOutOfOtherSessions:
                true,
            });

        if (passwordError) {
          throw passwordError;
        }

        await finishSignIn();
      } catch (error) {
        setAuthError(
          errorText(
            error,
            'Password reset failed.',
          ),
        );
      } finally {
        setSubmitting(false);
      }
    };

  if (mode === 'otp') {
    return (
      <div className="auth-page">
        <div className="auth-side">
          <Logo light />

          <div className="auth-quote">
            <span>“</span>

            <h2>
              One last step.
              <br />
              <em>Verify your email.</em>
            </h2>

            <p>
              Enter the code Clerk sent to your email to continue to RoleClear.
            </p>

            <div className="auth-line" />
          </div>

          <div className="auth-side-footer">
            FIND <i>→</i> UNDERSTAND <i>→</i>{' '}
            MATCH <i>→</i> GROW
          </div>
        </div>

        <div className="auth-main">
          <button
            className="auth-back"
            onClick={() => {
              void signIn.reset();
              void signUp.reset();
              onAuth('signin');
            }}
            type="button"
          >
            ← Back to sign in
          </button>

          <div className="auth-form-wrap">
            <div className="auth-mobile-logo">
              <Logo />
            </div>

            <div className="section-kicker">
              Verification
            </div>

            <h1>
              Check your email.
            </h1>

            <p className="auth-intro">
              Enter the verification code to finish securely.
            </p>

            {authError && (
              <div
                style={{
                  marginBottom: '14px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background:
                    'rgba(220,38,38,.06)',
                  border:
                    '1px solid rgba(220,38,38,.14)',
                  color: '#b91c1c',
                  fontSize: '.82rem',
                }}
              >
                {authError}
              </div>
            )}

            {authMessage && (
              <div
                style={{
                  marginBottom: '14px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background:
                    'rgba(22,163,74,.06)',
                  border:
                    '1px solid rgba(22,163,74,.14)',
                  color: '#15803d',
                  fontSize: '.82rem',
                }}
              >
                {authMessage}
              </div>
            )}

            <form
              onSubmit={
                handleVerifyCode
              }
            >
              <label>
                Verification code
                <input
                  name="code"
                  value={
                    verificationCode
                  }
                  onChange={(event) =>
                    setVerificationCode(
                      event.target.value,
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter code"
                  required
                />
              </label>

              <Button
                type="submit"
                className="full-button"
                disabled={
                  submitting ||
                  signInFetchStatus ===
                    'fetching' ||
                  signUpFetchStatus ===
                    'fetching'
                }
              >
                {submitting
                  ? 'Verifying...'
                  : 'Verify and continue'}
                <ArrowUpRight
                  size={17}
                />
              </Button>
            </form>
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

          <p>
            RoleClear helps you turn every
            application into momentum.
          </p>

          <div className="auth-line" />
        </div>

        <div className="auth-side-footer">
          FIND <i>→</i> UNDERSTAND <i>→</i>{' '}
          MATCH <i>→</i> GROW
        </div>
      </div>

      <div className="auth-main">
        <button
          className="auth-back"
          onClick={() =>
            onAuth('landing')
          }
          type="button"
        >
          ← Back to home
        </button>

        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <Logo />
          </div>

          <div className="section-kicker">
            {signInMode
              ? 'Welcome back'
              : 'Start your journey'}
          </div>

          <h1>
            {signInMode
              ? 'Good to see you.'
              : 'Welcome to RoleClear.'}
          </h1>

          <p className="auth-intro">
            {signInMode
              ? 'Your next move is waiting.'
              : 'Build a career system that moves with you.'}
          </p>

          {authError && (
            <div
              style={{
                marginBottom: '14px',
                padding: '10px 12px',
                borderRadius: '10px',
                background:
                  'rgba(220,38,38,.06)',
                border:
                  '1px solid rgba(220,38,38,.14)',
                color: '#b91c1c',
                fontSize: '.82rem',
              }}
            >
              {authError}
            </div>
          )}

          {authMessage && (
            <div
              style={{
                marginBottom: '14px',
                padding: '10px 12px',
                borderRadius: '10px',
                background:
                  'rgba(22,163,74,.06)',
                border:
                  '1px solid rgba(22,163,74,.14)',
                color: '#15803d',
                fontSize: '.82rem',
              }}
            >
              {authMessage}
            </div>
          )}

          <form
            onSubmit={
              handleEmailAuth
            }
          >
            {!signInMode && (
              <label>
                Full name
                <input
                  name="name"
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </label>
            )}

            {!signInMode && (
              <label>
                Mobile number
                <input
                  name="mobile"
                  inputMode="tel"
                  placeholder="+91 98765 43210"
                  required
                  autoComplete="tel"
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
                autoComplete="email"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder={
                  signInMode
                    ? 'Your password'
                    : 'Create a password (15+ characters)'
                }
                required
                minLength={15}
                autoComplete={
                  signInMode
                    ? 'current-password'
                    : 'new-password'
                }
              />
            </label>

            {signInMode && (
              <div className="forgot">
                <button
                  type="button"
                  onClick={
                    handleForgotPassword
                  }
                  style={{
                    border: 0,
                    background:
                      'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                    color: 'inherit',
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {!signInMode && (
              <div
                id="clerk-captcha"
                style={{
                  marginBottom: '12px',
                }}
              />
            )}

            <Button
              type="submit"
              className="full-button"
              disabled={
                submitting ||
                signInFetchStatus ===
                  'fetching' ||
                signUpFetchStatus ===
                  'fetching'
              }
            >
              {submitting
                ? 'Please wait...'
                : signInMode
                  ? 'Sign in'
                  : 'Create your account'}
              <ArrowUpRight
                size={17}
              />
            </Button>
          </form>

          <div className="auth-divider">
            <span>
              or continue with
            </span>
          </div>

          <Button
            variant="secondary"
            className="full-button google-button"
            onClick={
              handleGoogleAuth
            }
            disabled={submitting}
          >
            <span className="google-g">
              G
            </span>
            Continue with Google
          </Button>

          <p className="auth-switch">
            {signInMode
              ? 'New to RoleClear?'
              : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() =>
                onAuth(
                  signInMode
                    ? 'signup'
                    : 'signin',
                )
              }
            >
              {signInMode
                ? 'Create an account'
                : 'Sign in'}
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
  const {
    user,
    isLoaded: userLoaded,
  } = useUser();
  const [view, setView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [accountName, setAccountName] =
    useState('RoleClear User');
  const [accountEmail, setAccountEmail] =
    useState('');

  const currentResume =
    useCareerStore(
      (state) =>
        state.currentResume,
    );

  const setCurrentResume =
    useCareerStore(
      (state) =>
        state.setCurrentResume,
    );

  const [resumeStorageKey, setResumeStorageKey] =
    useState('');
  const [resumeStorageReady, setResumeStorageReady] =
    useState(false);

  useEffect(() => {
    if (
      !userLoaded ||
      !user
    ) {
      return;
    }

    const name =
      user.fullName ||
      [
        user.firstName,
        user.lastName,
      ]
        .filter(Boolean)
        .join(' ') ||
      user.primaryEmailAddress
        ?.emailAddress
        .split('@')[0] ||
      'RoleClear User';

    const email =
      user.primaryEmailAddress
        ?.emailAddress ?? '';

    setAccountName(name);
    setAccountEmail(email);

    const storageKey =
      `roleclear_current_resume_${user.id}`;

    setResumeStorageKey(
      storageKey,
    );

    try {
      const stored =
        window.localStorage.getItem(
          storageKey,
        );

      if (stored) {
        const parsed =
          JSON.parse(stored);

        if (
          parsed &&
          typeof parsed ===
            'object'
        ) {
          setCurrentResume(
            parsed,
          );
        }
      } else {
        const existingResume =
          useCareerStore
            .getState()
            .currentResume;

        if (existingResume) {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify(
              existingResume,
            ),
          );
        } else {
          useCareerStore.setState({
            currentResume: null,
          });
        }
      }
    } catch {
      // Storage failure should not block RoleClear.
    } finally {
      setResumeStorageReady(
        true,
      );
    }
  }, [
    userLoaded,
    user,
    setCurrentResume,
  ]);

  /*
   * Persist the parsed resume per authenticated Clerk user.
   * ATS readiness is deterministic from currentResume, so restoring the
   * resume also restores the same ATS score/report after sign-out/sign-in.
   */
  useEffect(() => {
    if (
      !resumeStorageReady ||
      !resumeStorageKey ||
      !currentResume
    ) {
      return;
    }

    try {
      window.localStorage.setItem(
        resumeStorageKey,
        JSON.stringify(
          currentResume,
        ),
      );
    } catch {
      // Storage failure should not break the resume workflow.
    }
  }, [
    currentResume,
    resumeStorageKey,
    resumeStorageReady,
  ]);

  const initials =
    accountName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join('') || 'RC';

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
          <button
            className="profile-button"
            onClick={() => go('settings')}
            type="button"
            title="Open account settings"
          >
            <span className="profile-avatar">
              {initials}
            </span>

            <span>
              <b>{accountName}</b>
              <small>
                {accountEmail || 'Personal account'}
              </small>
            </span>

            <MoreHorizontal size={18} />
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            style={{
              width: '100%',
              marginTop: '8px',
              minHeight: '38px',
              border: '1px solid rgba(15, 23, 42, .08)',
              background: 'transparent',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'rgba(15, 23, 42, .72)',
              fontSize: '.8rem',
              fontWeight: 600,
            }}
          >
            <LogOut size={15} />
            Sign out
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
            <button
              className="icon-button"
              title="Help & FAQ"
              onClick={() => setShowHelp(true)}
              type="button"
            >
              <CircleHelp size={19} />
            </button>

            <button
              className="icon-button notification"
              title="Notifications"
              onClick={() => go('notifications')}
              type="button"
            >
              <Bell size={19} />
              {unreadInboxCount > 0 && <i />}
            </button>

            <button
              className="header-avatar"
              onClick={() => go('settings')}
              title="Account settings"
            >
              {initials}
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
          {view === 'feed' && <CareerFeed setView={go} />}
          {view === 'settings' && <SettingsView onLogout={onLogout} />}
          {view === 'notifications' && <Notifications setView={go} />}
          {view === 'profile' && <Profile setView={go} />}
          {view === 'security' && <Security setView={go} />}
        </main>

        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}

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

  const careerInboxEvents =
    useCareerStore(
      (state) =>
        state.careerInboxEvents,
    ) as CareerInboxEventCompat[];

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

  const [analysisProgress, setAnalysisProgress] =
    useState(0);

  const [analysisStage, setAnalysisStage] =
    useState('Ready to analyze');

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

    let progressTimer: number | undefined;

    try {
      setAnalyzing(true);
      setAnalysisProgress(6);
      setAnalysisStage('Verifying the opportunity');
      setStatusMessage(
        'Reading the job posting…',
      );

      progressTimer = window.setInterval(() => {
        setAnalysisProgress((value) => {
          if (value >= 92) {
            return value;
          }

          const step =
            value < 35
              ? 3
              : value < 70
                ? 2
                : 1;

          return Math.min(92, value + step);
        });
      }, 420);

      const extracted =
        await extractJobFromUrl(
          input.trim(),
        );

      setAnalysisProgress((value) =>
        Math.max(value, 34),
      );
      setAnalysisStage('Reading role requirements');

      const job =
        importedJobFromExtraction(
          extracted,
        );

      setCurrentJob(job);

      setStatusMessage(
        'Parsing your resume…',
      );
      setAnalysisProgress((value) =>
        Math.max(value, 48),
      );
      setAnalysisStage('Parsing your resume');

      // Keep the uploaded resume available for Step 4 preview during
      // this browser session. Blob URLs are session-only by design.
      try {
        const previousUrl =
          window.sessionStorage.getItem(
            'roleclear-uploaded-resume-url',
          );

        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }

        const resumeUrl =
          URL.createObjectURL(resumeFile);

        window.sessionStorage.setItem(
          'roleclear-uploaded-resume-url',
          resumeUrl,
        );

        window.sessionStorage.setItem(
          'roleclear-uploaded-resume-name',
          resumeFile.name,
        );

        window.sessionStorage.setItem(
          'roleclear-uploaded-resume-type',
          resumeFile.type || '',
        );
      } catch {
        // Preview caching is optional. Parsing should still proceed.
      }

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
      setAnalysisProgress((value) =>
        Math.max(value, 68),
      );
      setAnalysisStage('Matching skills and experience');

      const result =
        await analyzeJob(
          job,
          parsedResume,
          extracted,
        );

      setCurrentAnalysis(result);

      setAnalysisProgress(96);
      setAnalysisStage('Preparing your match summary');
      setStatusMessage(
        'Preparing your match summary…',
      );

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 260);
      });

      setAnalysisProgress(100);
      setAnalysisStage('Analysis complete');

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 220);
      });

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
      if (progressTimer !== undefined) {
        window.clearInterval(progressTimer);
      }

      setAnalyzing(false);

      window.setTimeout(() => {
        setAnalysisProgress(0);
        setAnalysisStage('Ready to analyze');
      }, 350);
    }
  };

  return (
    <div className="apply-page rc-page-enter">
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

          {analyzing && (
            <div
              className="smart-apply-progress"
              role="status"
              aria-live="polite"
            >
              <div className="smart-apply-progress-head">
                <div>
                  <span className="mini-label">
                    ROLECLEAR IS WORKING
                  </span>
                  <b>{analysisStage}</b>
                  <small>
                    {statusMessage ||
                      'Building your match summary…'}
                  </small>
                </div>

                <strong>
                  {analysisProgress}%
                </strong>
              </div>

              <div
                className="smart-apply-progress-track"
                aria-label={`Analysis progress ${analysisProgress}%`}
              >
                <span
                  style={{
                    width: `${analysisProgress}%`,
                  }}
                />
              </div>

              <div className="smart-apply-progress-steps">
                <span
                  className={
                    analysisProgress >= 10
                      ? 'done'
                      : 'active'
                  }
                >
                  Verify
                </span>
                <span
                  className={
                    analysisProgress >= 48
                      ? 'done'
                      : analysisProgress >= 34
                        ? 'active'
                        : ''
                  }
                >
                  Parse
                </span>
                <span
                  className={
                    analysisProgress >= 68
                      ? 'done'
                      : analysisProgress >= 48
                        ? 'active'
                        : ''
                  }
                >
                  Match
                </span>
                <span
                  className={
                    analysisProgress >= 96
                      ? 'done'
                      : analysisProgress >= 68
                        ? 'active'
                        : ''
                  }
                >
                  Summarize
                </span>
              </div>
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
                Analyzing · {analysisProgress}%
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
        subtitle="Applications you confirm in RoleClear or verified application confirmations imported from Gmail appear here."
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
            Confirm “I’ve applied” through Smart Apply or sync Gmail to import verified application confirmations.
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
        stem[stem.length - 1] === stem[stem.length - 2]
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
        stem[stem.length - 1] === stem[stem.length - 2]
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

  /*
   * Keep this deliberately lightweight. There is no universal ATS date
   * standard, but a resume should use one visible convention consistently.
   * We only flag clearly mixed month styles / separators.
   */
  const dateStyleKinds = new Set<string>();

  dateStrings.forEach((value) => {
    const clean = value
      .trim()
      .toLowerCase();

    if (
      clean === 'present' ||
      clean === 'current'
    ) {
      return;
    }

    if (
      /^(jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(
        clean,
      )
    ) {
      dateStyleKinds.add(
        'abbreviated-month',
      );
      return;
    }

    if (
      /^(january|february|march|april|may|june|july|august|september|october|november|december)\b/.test(
        clean,
      )
    ) {
      dateStyleKinds.add(
        'full-month',
      );
      return;
    }

    if (
      /^\d{1,2}[/. -]\d{4}$/.test(
        clean,
      )
    ) {
      dateStyleKinds.add(
        'numeric-month',
      );
      return;
    }

    if (/^\d{4}$/.test(clean)) {
      dateStyleKinds.add(
        'year-only',
      );
    }
  });

  const rawDateRanges =
    rawText.match(
      /(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2}\s*[-–—]\s*(?:Present|Current|(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2})/gi,
    ) ?? [];

  const separatorStyles =
    new Set(
      rawDateRanges.map(
        (range) => {
          const separator =
            range.match(
              /\s*([-–—])\s*/,
            );

          if (!separator) {
            return 'unknown';
          }

          const dash =
            separator[1];

          const hasLeftSpace =
            /\s[-–—]/.test(
              separator[0],
            );

          const hasRightSpace =
            /[-–—]\s/.test(
              separator[0],
            );

          return `${dash}:${hasLeftSpace ? 1 : 0}:${hasRightSpace ? 1 : 0}`;
        },
      ),
    );

  const dateStyleConsistent =
    dateStyleKinds.size <= 1 &&
    separatorStyles.size <= 1;

  /*
   * Detect only obvious text artifacts: a completed sentence followed by one
   * unexplained trailing capitalized token, e.g. "... prototype. Developer".
   * This is intentionally narrow to avoid pretending to inspect visual layout.
   */
  const suspiciousTextArtifacts = [
    ...experienceBullets,
    ...projectBullets,
  ].filter((bullet) =>
    /[.!?]\s+[A-Z][A-Za-z+#.-]{2,20}\s*$/.test(
      bullet.trim(),
    ),
  );

  let formattingScore =
    dateFormatRatio >= 0.9
      ? 3
      : dateFormatRatio >= 0.7
        ? 2
        : 0;

  if (
    !dateStyleConsistent &&
    formattingScore > 0
  ) {
    formattingScore -= 1;
  }

  if (
    suspiciousTextArtifacts.length > 0 &&
    formattingScore > 0
  ) {
    formattingScore -= 1;
  }

  addCheck({
    id: 'date-format-consistency',
    category:
      'Consistency & readability',
    label: 'Date & text consistency',
    score: formattingScore,
    max: 3,
    reason:
      dateStrings.length === 0
        ? 'No dates were available to assess.'
        : [
            `${monthYearFormatted}/${dateStrings.length} parsed dates are machine-readable.`,
            dateStyleConsistent
              ? 'Date styling appears consistent.'
              : 'Mixed date styles or date-range separators were detected.',
            suspiciousTextArtifacts.length > 0
              ? `${suspiciousTextArtifacts.length} possible stray text artifact${
                  suspiciousTextArtifacts.length === 1
                    ? ''
                    : 's'
                } detected.`
              : 'No obvious stray text artifact was detected.',
          ].join(' '),
    solution:
      formattingScore === 3
        ? 'No change needed.'
        : 'Use one date convention throughout the resume and remove any obvious stray words or pasted-text artifacts.',
    evidence:
      dateStrings.length > 0
        ? `${dateStyleKinds.size || 1} date style(s) · ${separatorStyles.size || 1} separator style(s) · ${suspiciousTextArtifacts.length} possible artifact(s)`
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

  const quantifiedProjectSignals =
    projectBullets.filter(
      (bullet) =>
        quantifiedRegex.test(
          bullet,
        ),
    ).length;

  const quantifiedAchievementSignals =
    (resume.achievements ?? []).filter(
      (item) => {
        const value =
          typeof item === 'string'
            ? item
            : JSON.stringify(
                item,
              );

        return quantifiedRegex.test(
          value,
        );
      },
    ).length;

  const quantifiedOutsideExperience =
    quantifiedProjectSignals +
    quantifiedAchievementSignals;

  if (
    quantifiedOutsideExperience > 0
  ) {
    optionalSignals.push(
      `${quantifiedOutsideExperience} quantified project/achievement signal${
        quantifiedOutsideExperience ===
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
                  These are saved targeting records. JD refinement and
                  the editable resume document are the next processing
                  stage.
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
  _popup: Window,
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

    /*
     * Do not read popup.closed here. Google uses Cross-Origin-Opener-Policy,
     * which makes that access noisy/unreliable in Chrome. Poll the backend
     * connection status instead.
     */
  }

  throw new Error(
    'Gmail connection timed out. Complete Google consent, then try Connect Gmail again.',
  );
}

class GmailSyncError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = 'GmailSyncError';
    this.status = status;
  }
}

async function syncGmailMessages(): Promise<GmailSyncedMessage[]> {
  const response = await fetch(
    `${EMAIL_API_BASE}/gmail/sync?max_results=20`,
    {
      method: 'POST',
    },
  );

  let data: {
    detail?: string;
    messages?: GmailSyncedMessage[];
  } = {};

  try {
    data = await response.json();
  } catch {
    // Keep a clean fallback when the backend returns a non-JSON error.
  }

  if (!response.ok) {
    throw new GmailSyncError(
      data?.detail ??
        (response.status === 401
          ? 'Gmail authorization expired. Reconnect Gmail.'
          : 'Could not sync Gmail.'),
      response.status,
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

  const cleanExtractedText = (
    value: string,
  ) =>
    value
      .replace(/&(?:#39|apos);/gi, "'")
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .replace(
        /^[\s:;,.\-–—]+|[\s:;,.\-–—]+$/g,
        '',
      )
      .trim();

  const messageText = (
    message: GmailSyncedMessage,
  ) =>
    [
      message.subject,
      message.sender,
      message.snippet,
      message.body_text,
    ].join(' ');

  const extractExternalApplicationId = (
    message: GmailSyncedMessage,
  ) => {
    const value =
      messageText(message);

    const patterns = [
      /\b(?:job\s*)?id\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})\b/i,
      /\breq(?:uisition)?\s*(?:id|number)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})\b/i,
      /\breference\s*(?:id|number)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})\b/i,
    ];

    for (const pattern of patterns) {
      const match = value.match(
        pattern,
      );

      if (match?.[1]) {
        return match[1];
      }
    }

    return undefined;
  };

  const isStrongApplicationConfirmation = (
    message: GmailSyncedMessage,
  ) => {
    const value =
      normalize(
        messageText(message),
      );

    const hasApplicationWord =
      /\b(application|applications|applied|applying|apply)\b/.test(
        value,
      );

    if (!hasApplicationWord) {
      return false;
    }

    return [
      /\bthank you for applying\b/,
      /\bthanks for applying\b/,
      /\bsuccessfully applied\b/,
      /\byou have officially applied\b/,
      /\bapplication received\b/,
      /\bapplication submitted\b/,
      /\bapplication successfully submitted\b/,
      /\bwe received your application\b/,
      /\bwe have received your application\b/,
      /\bwe ve received your application\b/,
      /\byour application has been received\b/,
      /\byour application was received\b/,
      /\bthis email confirms.{0,80}received your application\b/,
    ].some(
      (pattern) =>
        pattern.test(value),
    );
  };

  const inferCompanyFromMessage = (
    message: GmailSyncedMessage,
  ) => {
    const subject =
      cleanExtractedText(
        message.subject,
      );

    const body =
      cleanExtractedText(
        `${message.snippet} ${message.body_text}`,
      );

    const subjectPatterns = [
      /(?:applying|applied)\s+to\s+([A-Z][A-Za-z0-9&.' -]{1,60})(?:!|$)/i,
      /application\s+(?:to|with)\s+([A-Z][A-Za-z0-9&.' -]{1,60})(?:!|$)/i,
      /we\s+(?:have\s+)?received\s+your\s+([A-Z][A-Za-z0-9&.' -]{1,40})\s+application\b/i,
      /application\s+for\s+.{3,100}?\s+at\s+([A-Z][A-Za-z0-9&.' -]{1,60})(?:!|$)/i,
    ];

    for (
      const pattern of
      subjectPatterns
    ) {
      const match =
        subject.match(pattern);

      if (match?.[1]) {
        return cleanExtractedText(
          match[1],
        );
      }
    }

    const bodyPatterns = [
      /(?:opening|role|position)\s+at\s+([A-Z][A-Za-z0-9&.' -]{1,60})/i,
      /interest\s+in\s+joining\s+([A-Z][A-Za-z0-9&.' -]{1,60})/i,
      /future\s+with\s+([A-Z][A-Za-z0-9&.' -]{1,60})/i,
    ];

    for (
      const pattern of
      bodyPatterns
    ) {
      const match =
        body.match(pattern);

      if (match?.[1]) {
        const candidate =
          cleanExtractedText(
            match[1],
          ).split(
            /(?:\.|,|\s+the\s+world|\s+recruiting\s+team)/i,
          )[0];

        if (
          candidate &&
          candidate.length <= 60
        ) {
          return candidate;
        }
      }
    }

    const displayName =
      message.sender.match(
        /^\s*"?([^"<]+?)"?\s*</,
      )?.[1];

    if (
      displayName &&
      !/^(no[- ]?reply|noreply|do[- ]?not[- ]?reply|notification)$/i.test(
        displayName.trim(),
      )
    ) {
      return cleanExtractedText(
        displayName,
      );
    }

    const email =
      message.sender.match(
        /<?([A-Z0-9._%+-]+)@([A-Z0-9.-]+)>?/i,
      );

    if (email) {
      const local =
        email[1].replace(
          /^(no[-_.]?reply|do[-_.]?not[-_.]?reply)[-_.]?/i,
          '',
        );

      const domainParts =
        email[2]
          .toLowerCase()
          .split('.');

      const genericDomains =
        new Set([
          'myworkday',
          'greenhouse-mail',
          'smartrecruiters',
          'lever',
          'workablemail',
          'gmail',
          'outlook',
        ]);

      const localCandidate =
        local
          .split(/[._-]+/)
          .filter(Boolean)
          .join(' ');

      if (
        localCandidate &&
        localCandidate.length >= 3 &&
        !/^(jobs?|careers?|recruiting|talent|notification)$/i.test(
          localCandidate,
        )
      ) {
        return localCandidate
          .split(' ')
          .map(
            (part) =>
              part.charAt(0).toUpperCase() +
              part.slice(1),
          )
          .join(' ');
      }

      const domainCandidate =
        domainParts.find(
          (part) =>
            part.length >= 3 &&
            !genericDomains.has(
              part,
            ) &&
            ![
              'com',
              'org',
              'net',
              'co',
              'in',
              'jobs',
              'mail',
            ].includes(part),
        );

      if (domainCandidate) {
        return (
          domainCandidate
            .charAt(0)
            .toUpperCase() +
          domainCandidate.slice(1)
        );
      }
    }

    return 'Company';
  };

  const inferRoleFromMessage = (
    message: GmailSyncedMessage,
  ) => {
    const value =
      cleanExtractedText(
        `${message.subject} ${message.snippet} ${message.body_text}`,
      );

    const patterns = [
      /application\s+for\s+the\s+(.{3,120}?)\s*\((?:job\s*)?id\s*[:#-]?/i,
      /application\s+for\s+the\s+(.{3,120}?)\s+position\b/i,
      /applied\s+for\s+the\s+(.{3,120}?)\s+(?:opening|position|role)\b/i,
      /applied\s+for\s+(.{3,120}?)\s+(?:at|with)\s+[A-Z]/i,
      /apply\s+for\s+the\s+(.{3,120}?)\s+role\b/i,
      /position\s+of\s+(.{3,120}?)\s*\((?:job\s*)?id\s*[:#-]?/i,
      /(?:position|role)\s*[:\-]\s*(.{3,120}?)(?:\.|,|$)/i,
    ];

    for (
      const pattern of patterns
    ) {
      const match =
        value.match(pattern);

      if (match?.[1]) {
        const candidate =
          cleanExtractedText(
            match[1],
          );

        if (
          candidate.length >= 3 &&
          candidate.length <= 120
        ) {
          return candidate;
        }
      }
    }

    const subjectCandidate =
      message.subject.match(
        /application\s+for\s+(.{3,100}?)(?:\s+at\s+|$)/i,
      )?.[1];

    return subjectCandidate
      ? cleanExtractedText(
          subjectCandidate,
        )
      : 'Role';
  };

  const findLinkedApplication = (
    message: GmailSyncedMessage,
  ) => {
    const currentApplications =
      useCareerStore
        .getState()
        .trackedApplications;

    const externalApplicationId =
      extractExternalApplicationId(
        message,
      );

    if (externalApplicationId) {
      const exact =
        currentApplications.find(
          (application) =>
            application.externalApplicationId ===
            externalApplicationId,
        );

      if (exact) {
        return exact;
      }
    }

    const haystack = normalize(
      messageText(message),
    );

    const ranked =
      currentApplications
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
            3,
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

    return ranked[0]?.score >= 4
      ? ranked[0].application
      : null;
  };

  const getAutomaticLifecycleUpdate = (
    message: GmailSyncedMessage,
  ) => {
    const value =
      normalize(
        messageText(message),
      );

    if (
      /\b(rejected|regret to inform|not moving forward|will not be moving forward|decided not to move forward|position has been filled)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Rejection' as const,
        status:
          'Rejected' as const,
      };
    }

    if (
      /\b(offer letter|employment offer|job offer|pleased to offer|we are pleased to offer)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Offer' as const,
        status: 'Offer' as const,
      };
    }

    if (
      /\b(interview invitation|invite you to interview|schedule an interview|technical interview|phone interview|virtual interview|onsite interview|next round|technical round|coding round)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Interview' as const,
        status:
          'Interview' as const,
      };
    }

    if (
      /\b(screening|phone screen|screening call|online assessment|coding assessment|technical assessment|assessment invitation|complete the assessment|shortlisted|under review|reviewing your application)\b/.test(
        value,
      )
    ) {
      return {
        type: 'Application' as const,
        status:
          'Screening' as const,
      };
    }

    return null;
  };

  const createApplicationFromGmail = (
    message: GmailSyncedMessage,
  ) => {
    const parsedDate =
      Number.isNaN(
        Date.parse(
          message.date,
        ),
      )
        ? new Date()
        : new Date(
            message.date,
          );

    const company =
      inferCompanyFromMessage(
        message,
      );

    const role =
      inferRoleFromMessage(
        message,
      );

    const externalApplicationId =
      extractExternalApplicationId(
        message,
      );

    const normalizedIdentity =
      [
        normalize(company),
        normalize(role),
      ]
        .filter(Boolean)
        .join('-')
        .slice(0, 120);

    const tracked = {
      id:
        `gmail-application-${externalApplicationId ?? message.id}`,
      jobId:
        externalApplicationId
          ? `gmail-${externalApplicationId}`
          : role === 'Role'
            ? `gmail-${message.id}`
            : `gmail-${normalizedIdentity || message.id}`,
      company,
      role,
      source: 'Gmail',
      status: 'Applied' as const,
      fit: 0,
      ghostRisk:
        'low' as const,
      appliedAt:
        parsedDate.toISOString(),
      date:
        parsedDate.toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: '2-digit',
          },
        ),
      resumeLabel:
        'Imported from Gmail',
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
      importedFromGmail: true,
      externalApplicationId,
      lastSyncedEmailId:
        message.id,
    };

    const existing =
      useCareerStore
        .getState()
        .trackedApplications.find(
          (application) =>
            application.id ===
              tracked.id ||
            application.jobId ===
              tracked.jobId,
        );

    if (existing) {
      return {
        application: existing,
        created: false,
      };
    }

    useCareerStore
      .getState()
      .addTrackedApplication(
        tracked,
      );

    return {
      application:
        useCareerStore
          .getState()
          .trackedApplications.find(
            (application) =>
              application.id ===
                tracked.id ||
              application.jobId ===
                tracked.jobId,
          ) ?? tracked,
      created: true,
    };
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
        event.origin !== API_ORIGIN      ) {
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

      let importedEmails = 0;
      let createdApplications = 0;
      let updatedApplications = 0;

      for (const message of messages) {
        let linked =
          findLinkedApplication(
            message,
          );

        const isConfirmation =
          isStrongApplicationConfirmation(
            message,
          );

        const lifecycleUpdate =
          getAutomaticLifecycleUpdate(
            message,
          );

        /*
         * Strict import rule:
         * 1) A new tracker item is created only from a real application
         *    confirmation (application/applied + received/submitted/etc.).
         * 2) Screening/interview/offer/rejection emails are imported only
         *    when they can be linked to an existing tracked application.
         * 3) Generic recruiter/newsletter/job-alert mail is ignored.
         */
        if (
          !linked &&
          isConfirmation
        ) {
          const created =
            createApplicationFromGmail(
              message,
            );

          linked =
            created.application;

          if (created.created) {
            createdApplications += 1;
          }
        }

        /*
         * Career Inbox and Applications have different responsibilities:
         * - Career Inbox keeps relevant application-related mail visible.
         * - Applications changes only on strong confirmations or recognised
         *   lifecycle updates.
         *
         * Therefore reminder/incomplete/status-check emails remain visible
         * without changing the tracker. Unlinked lifecycle emails are also
         * kept in the Inbox for review instead of being silently discarded.
         */

        if (
          linked &&
          lifecycleUpdate &&
          linked.status !==
            lifecycleUpdate.status
        ) {
          useCareerStore
            .getState()
            .updateTrackedApplication(
              linked.id,
              {
                status:
                  lifecycleUpdate.status,
                lastSyncedEmailId:
                  message.id,
              },
            );

          updatedApplications += 1;
        } else if (linked) {
          useCareerStore
            .getState()
            .updateTrackedApplication(
              linked.id,
              {
                lastSyncedEmailId:
                  message.id,
              },
            );
        }

        const inferred =
          lifecycleUpdate
            ? {
                type:
                  lifecycleUpdate.type,
                suggestedStatus:
                  linked
                    ? lifecycleUpdate.status
                    : null,
              }
            : isConfirmation
              ? {
                  type:
                    'Application' as const,
                  suggestedStatus:
                    'Applied' as const,
                }
              : {
                  type:
                    'Application' as const,
                  suggestedStatus: null,
                };

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
          importedEmails += 1;
        }
      }

      const summary: string[] = [];

      if (
        createdApplications > 0
      ) {
        summary.push(
          `${createdApplications} application${createdApplications === 1 ? '' : 's'} added to Applications`,
        );
      }

      if (
        updatedApplications > 0
      ) {
        summary.push(
          `${updatedApplications} status update${updatedApplications === 1 ? '' : 's'} applied`,
        );
      }

      if (importedEmails > 0) {
        summary.push(
          `${importedEmails} relevant email${importedEmails === 1 ? '' : 's'} synced`,
        );
      }

      setGmailMessage(
        summary.length > 0
          ? `${summary.join(' · ')}.`
          : 'Gmail is up to date. No new application confirmations or linked status updates were found.',
      );

      await refreshGmailStatus();
    } catch (error) {
      if (
        error instanceof GmailSyncError &&
        error.status === 401
      ) {
        setGmailStatus({
          connected: false,
          email: null,
        });

        try {
          await disconnectGmail();
        } catch {
          // The backend may already consider the token invalid/disconnected.
        }

        setGmailMessage(
          'Gmail authorization expired or was revoked. Reconnect Gmail, approve Gmail read access, then sync again.',
        );
      } else {
        setGmailMessage(
          error instanceof Error
            ? error.message
            : 'Could not sync Gmail.',
        );

        await refreshGmailStatus();
      }
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

  const eventTimestamp = (
    value?: string | null,
  ) => {
    if (!value) {
      return 0;
    }

    const parsed =
      Date.parse(value);

    return Number.isNaN(parsed)
      ? 0
      : parsed;
  };

  // Career Inbox is always newest-first, independent of the order in which
  // Gmail sync/import inserted messages into Zustand/localStorage.
  const filteredEvents = [
    ...careerInboxEvents,
  ]
    .filter(
      (event) =>
        activeTab === 'All' ||
        event.type === activeTab,
    )
    .sort(
      (a, b) =>
        eventTimestamp(
          b.receivedAt,
        ) -
        eventTimestamp(
          a.receivedAt,
        ),
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

                    {(event.suggestedStatus ||
                      event.source ===
                        'gmail') && (
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
                          {event.source ===
                          'gmail'
                            ? event.applicationId &&
                              event.suggestedStatus
                              ? `✓ ${
                                  event.suggestedStatus ===
                                  'Applied'
                                    ? 'Synced to Applications'
                                    : 'Application updated'
                                } · ${
                                  event.suggestedStatus
                                }`
                              : event.applicationId
                                ? 'Application mail · No tracker change'
                                : 'Needs review · Not linked to an application'
                            : event.suggestedStatus
                              ? `Suggested tracker update: ${
                                  event.suggestedStatus
                                }`
                              : ''}
                        </span>
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
   CAREER FEED / ANALYTICS / SETTINGS
   Moved to separate component files.
========================================================= */

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
      <div className="detail-page rc-page-enter">
        <BackLink
          onClick={() => setView('apply')}
          label="Back to Smart Apply"
        />

        <div className="detail-card">
          <span className="mini-label">
            NO ANALYSIS AVAILABLE
          </span>
          <h2>Analyze an opportunity first.</h2>
          <p>
            Smart Apply needs a verified job and parsed resume before it can show the analysis.
          </p>
          <Button onClick={() => setView('apply')}>
            Go to Smart Apply
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  const isSaved = savedJobs.some(
    (job) => job.id === currentJob.id,
  );

  const ghostRiskLabel =
    currentAnalysis.ghostRisk === 'low'
      ? 'LOW'
      : currentAnalysis.ghostRisk === 'medium'
        ? 'MEDIUM'
        : 'HIGH';

  const fitCaption =
    currentAnalysis.resumeFit >= 80
      ? 'Strong match'
      : currentAnalysis.resumeFit >= 65
        ? 'Good match'
        : currentAnalysis.resumeFit >= 50
          ? 'Moderate match'
          : currentAnalysis.resumeFit >= 35
            ? 'Partial match'
            : 'Weak match';

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

  const strongestMatches =
    currentAnalysis.requirementMatches
      .filter(
        (item) =>
          item.level === 'required' &&
          item.matched,
      )
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

  const topGaps =
    currentAnalysis.missingRequired.slice(0, 3);

  const evidenceItems = [
    ...currentAnalysis.experienceMatches
      .filter((item) => item.score > 0)
      .map((item) => ({
        key: `exp-${item.index}`,
        icon: 'experience' as const,
        title: item.title ?? 'Experience',
        subtitle: item.organization ?? '',
        score: item.score,
        terms: item.matchedTerms,
      })),
    ...currentAnalysis.workSampleMatches
      .filter((item) => item.score > 0)
      .map((item) => ({
        key: `work-${item.index}`,
        icon: 'project' as const,
        title:
          item.name ?? 'Project / work sample',
        subtitle: '',
        score: item.score,
        terms: item.matchedTerms,
      })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="detail-page rc-page-enter compact-analysis-page">
      <BackLink
        onClick={() => setView('apply')}
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
      />

      <section className="compact-decision-card">
        <div className="compact-decision-copy">
          <span className="mini-label">
            YOUR DECISION SNAPSHOT
          </span>

          <h2>{currentAnalysis.verdict}.</h2>

          <p>
            {currentAnalysis.matchedRequired.length} of{' '}
            {currentAnalysis.requiredRequirements.length}{' '}
            required requirements show supporting evidence.
            {currentAnalysis.missingRequired.length > 0
              ? ` Focus on ${currentAnalysis.missingRequired.length} gap${
                  currentAnalysis.missingRequired.length === 1
                    ? ''
                    : 's'
                } before applying.`
              : ' No major required gaps were detected.'}
          </p>
        </div>

        <div className="compact-score-row">
          <div className="compact-score primary">
            <span>Resume Fit</span>
            <strong>
              {currentAnalysis.resumeFit}%
            </strong>
            <small>{fitCaption}</small>
          </div>

          <div className="compact-score">
            <span>Ghost Risk</span>
            <strong>{ghostRiskLabel}</strong>
            <small>Posting signals</small>
          </div>

          <div className="compact-score">
            <span>Eligibility</span>
            <strong>
              {Math.round(
                currentAnalysis
                  .canonicalBreakdown
                  .eligibility,
              )}
              %
            </strong>
            <small>Required gates</small>
          </div>
        </div>
      </section>

      <div className="compact-insight-grid">
        <section className="compact-insight-card">
          <div className="compact-card-heading">
            <div>
              <span className="mini-label">
                STRONGEST FIT
              </span>
              <h3>What already works</h3>
            </div>
            <CheckCircle2 size={20} />
          </div>

          {strongestMatches.length > 0 ? (
            <div className="compact-point-list">
              {strongestMatches.map(
                (item) => (
                  <div
                    className="compact-point positive"
                    key={`${item.level}-${item.category}-${item.requirement}`}
                  >
                    <Check size={15} />
                    <div>
                      <b>{item.requirement}</b>
                      <span>
                        {Math.round(item.score)}% evidence match
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="compact-empty">
              No strong required matches were detected yet.
            </p>
          )}
        </section>

        <section className="compact-insight-card">
          <div className="compact-card-heading">
            <div>
              <span className="mini-label">
                WHAT TO FIX
              </span>
              <h3>Highest-priority gaps</h3>
            </div>
            <AlertTriangle size={20} />
          </div>

          {topGaps.length > 0 ? (
            <div className="compact-point-list">
              {topGaps.map(
                (requirement) => (
                  <div
                    className="compact-point gap"
                    key={requirement}
                  >
                    <span className="compact-dot" />
                    <div>
                      <b>{requirement}</b>
                      <span>
                        Required · weak or missing evidence
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="compact-point positive">
              <Check size={15} />
              <div>
                <b>No major required gaps</b>
                <span>
                  Your resume covers the extracted minimum requirements.
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="compact-evidence-strip">
        <div className="compact-card-heading">
          <div>
            <span className="mini-label">
              BEST SUPPORTING EVIDENCE
            </span>
            <h3>Top resume evidence</h3>
          </div>

          <button
            className="compact-text-button"
            onClick={() =>
              setView('resume-match')
            }
          >
            Full match
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="compact-evidence-grid">
          {evidenceItems.map(
            (item) => (
              <div
                className="compact-evidence-item"
                key={item.key}
              >
                {item.icon === 'experience' ? (
                  <BriefcaseBusiness size={16} />
                ) : (
                  <Sparkles size={16} />
                )}

                <div>
                  <b>{item.title}</b>
                  {item.subtitle && (
                    <span>{item.subtitle}</span>
                  )}
                  <small>
                    {Math.round(item.score)}% relevance
                    {item.terms.length > 0
                      ? ` · ${item.terms
                          .slice(0, 2)
                          .join(', ')}`
                      : ''}
                  </small>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <details className="compact-details">
        <summary>
          <div>
            <span className="mini-label">
              WHY THIS SCORE?
            </span>
            <b>
              View breakdown and extracted requirements
            </b>
          </div>
          <span className="details-chevron">⌄</span>
        </summary>

        <div className="compact-details-body">
          <div className="compact-breakdown">
            <DetailPair
              label="Capabilities"
              value={`${Math.round(
                currentAnalysis
                  .canonicalBreakdown
                  .capabilities,
              )}%`}
            />
            <DetailPair
              label="Experience"
              value={`${Math.round(
                currentAnalysis
                  .canonicalBreakdown
                  .experience,
              )}%`}
            />
            <DetailPair
              label="Responsibilities"
              value={`${Math.round(
                currentAnalysis
                  .canonicalBreakdown
                  .responsibilities,
              )}%`}
            />
            <DetailPair
              label="Eligibility"
              value={`${Math.round(
                currentAnalysis
                  .canonicalBreakdown
                  .eligibility,
              )}%`}
            />
          </div>

          <div className="compact-details-columns">
            <div>
              <h4>Required requirements</h4>
              <ul>
                {currentAnalysis.requiredRequirements.map(
                  (requirement) => (
                    <li key={requirement}>
                      {requirement}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4>Preferred qualifications</h4>
              {currentAnalysis.preferredRequirements.length >
              0 ? (
                <ul>
                  {currentAnalysis.preferredRequirements.map(
                    (requirement) => (
                      <li key={requirement}>
                        {requirement}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p>
                  No separate preferred qualifications were detected.
                </p>
              )}
            </div>
          </div>

          <p className="disclaimer">
            A gap means RoleClear could not find strong evidence in this resume. It does not prove that you do not meet the requirement.
          </p>
        </div>
      </details>

      <div className="compact-action-bar">
        <Button
          onClick={() =>
            setView('resume-tailor')
          }
        >
          Tailor resume
          <Sparkles size={16} />
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            setView('resume-match')
          }
        >
          Detailed match
          <ArrowUpRight size={15} />
        </Button>

        {currentJob.url && (
          <Button
            variant="secondary"
            onClick={handleOpenOriginal}
          >
            View original
            <ExternalLink size={15} />
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
              Save
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
      <div className="detail-page rc-page-enter">
        <BackLink
          onClick={() => setView('apply')}
          label="Back to Smart Apply"
        />
        <div className="detail-card">
          <span className="mini-label">
            NO MATCH DATA
          </span>
          <h2>Analyze an opportunity first.</h2>
          <p>
            Resume Match needs a parsed resume and analyzed opportunity before it can show your evidence.
          </p>
          <Button onClick={() => setView('apply')}>
            Go to Smart Apply
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  const fit = currentAnalysis.resumeFit;

  const fitLabel =
    fit >= 80
      ? 'Strong match'
      : fit >= 65
        ? 'Good match'
        : fit >= 50
          ? 'Moderate match'
          : fit >= 35
            ? 'Partial match'
            : 'Weak match';

  const breakdown =
    currentAnalysis.canonicalBreakdown;

  const strongestRequirements =
    currentAnalysis.requirementMatches
      .filter(
        (item) =>
          item.matched &&
          item.level === 'required',
      )
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

  const topExperience =
    currentAnalysis.experienceMatches
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

  const topProjects =
    currentAnalysis.workSampleMatches
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

  return (
    <div className="detail-page rc-page-enter compact-match-page">
      <BackLink
        onClick={() => setView('analysis')}
        label="Back to job analysis"
      />

      <PageTitle
        eyebrow="Smart Apply · Step 03"
        title="Your resume match"
        subtitle={`The evidence that matters most for ${
          currentJob.title ??
          'this opportunity'
        }.`}
        action={
          <Button
            onClick={() =>
              setView('resume-tailor')
            }
          >
            Tailor resume
            <Sparkles size={15} />
          </Button>
        }
      />

      <section className="compact-match-score">
        <div className="compact-match-score-main">
          <span className="mini-label">
            OVERALL MATCH
          </span>
          <strong>{fit}%</strong>
          <p>{fitLabel}</p>
        </div>

        <div className="compact-match-metrics">
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
        </div>
      </section>

      <div className="compact-insight-grid">
        <section className="compact-insight-card">
          <div className="compact-card-heading">
            <div>
              <span className="mini-label">
                BEST MATCHES
              </span>
              <h3>Evidence to lead with</h3>
            </div>
            <CheckCircle2 size={20} />
          </div>

          <div className="compact-point-list">
            {strongestRequirements.map(
              (item) => (
                <div
                  className="compact-point positive"
                  key={`${item.level}-${item.category}-${item.requirement}`}
                >
                  <Check size={15} />
                  <div>
                    <b>{item.requirement}</b>
                    <span>
                      {Math.round(item.score)}% match
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="compact-insight-card">
          <div className="compact-card-heading">
            <div>
              <span className="mini-label">
                REQUIRED GAPS
              </span>
              <h3>Evidence to strengthen</h3>
            </div>
            <AlertTriangle size={20} />
          </div>

          {currentAnalysis.missingRequired.length >
          0 ? (
            <div className="compact-point-list">
              {currentAnalysis.missingRequired
                .slice(0, 4)
                .map((requirement) => (
                  <div
                    className="compact-point gap"
                    key={requirement}
                  >
                    <span className="compact-dot" />
                    <div>
                      <b>{requirement}</b>
                      <span>
                        Required · insufficient evidence
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="compact-point positive">
              <Check size={15} />
              <div>
                <b>No major required gaps</b>
                <span>
                  Focus on clarity and relevance while tailoring.
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="compact-insight-grid">
        <section className="compact-insight-card">
          <div className="compact-card-heading">
            <div>
              <span className="mini-label">
                EXPERIENCE
              </span>
              <h3>Most relevant roles</h3>
            </div>
            <BriefcaseBusiness size={20} />
          </div>

          <div className="compact-evidence-grid single-column">
            {topExperience.map(
              (item) => (
                <div
                  className="compact-evidence-item"
                  key={`resume-exp-${item.index}`}
                >
                  <BriefcaseBusiness size={16} />
                  <div>
                    <b>
                      {item.title ?? 'Experience'}
                    </b>
                    {item.organization && (
                      <span>
                        {item.organization}
                      </span>
                    )}
                    <small>
                      {Math.round(item.score)}% relevance
                    </small>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="compact-insight-card">
          <div className="compact-card-heading">
            <div>
              <span className="mini-label">
                PROJECTS
              </span>
              <h3>Most relevant work samples</h3>
            </div>
            <Sparkles size={20} />
          </div>

          <div className="compact-evidence-grid single-column">
            {topProjects.map(
              (item) => (
                <div
                  className="compact-evidence-item"
                  key={`resume-project-${item.index}`}
                >
                  <Sparkles size={16} />
                  <div>
                    <b>
                      {item.name ??
                        'Project / work sample'}
                    </b>
                    <small>
                      {Math.round(item.score)}% relevance
                    </small>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      </div>

      <div className="compact-action-bar">
        <Button
          onClick={() =>
            setView('resume-tailor')
          }
        >
          Tailor resume
          <Sparkles size={16} />
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            setView('analysis')
          }
        >
          Back to summary
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
  raw_text?: string | null;
  personal_info?: {
    full_name?: string | null;
    email?: string | null;
    location?: string | null;
  };
  summary?: string | null;
  skills?: Record<string, { name?: string }[]>;
  experience?: {
    company?: string | null;
    title?: string | null;
    location?: string | null;
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
    end_date?: string | null;
  }[];
};

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

  const [activePanel, setActivePanel] =
    useState<'edit' | 'original' | 'suggestions'>(
      'edit',
    );

  const [saved, setSaved] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [downloadError, setDownloadError] =
    useState('');

  const [editableResume, setEditableResume] =
    useState<TailorResume | null>(() => {
      if (!currentResume) {
        return null;
      }

      return JSON.parse(
        JSON.stringify(
          currentResume,
        ),
      ) as TailorResume;
    });

  useEffect(() => {
    if (!currentResume) {
      return;
    }

    setEditableResume(
      JSON.parse(
        JSON.stringify(
          currentResume,
        ),
      ) as TailorResume,
    );
  }, [
    currentJob?.id,
    currentResume,
  ]);

  if (
    !currentJob ||
    !currentAnalysis ||
    !currentResume ||
    !editableResume
  ) {
    return (
      <div className="detail-page rc-page-enter">
        <BackLink
          onClick={() => setView('apply')}
          label="Back to Smart Apply"
        />

        <div className="detail-card">
          <span className="mini-label">
            NO RESUME DATA
          </span>
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

  const sourceResume =
    currentResume as TailorResume;

  const uploadedResumeUrl =
    window.sessionStorage.getItem(
      'roleclear-uploaded-resume-url',
    );

  const uploadedResumeName =
    window.sessionStorage.getItem(
      'roleclear-uploaded-resume-name',
    ) ??
    'Uploaded resume';

  const uploadedResumeType =
    window.sessionStorage.getItem(
      'roleclear-uploaded-resume-type',
    ) ??
    '';

  const allSkills = Array.from(
    new Set(
      Object.values(
        editableResume.skills ?? {},
      )
        .flatMap(
          (items) =>
            items ?? [],
        )
        .map(
          (item) =>
            item.name?.trim() ?? '',
        )
        .filter(Boolean),
    ),
  );

  const missingRequired =
    currentAnalysis.missingRequired;

  const strongestRequirements =
    currentAnalysis.requirementMatches
      .filter(
        (item) =>
          item.level === 'required' &&
          item.matched,
      )
      .slice()
      .sort(
        (a, b) =>
          b.score - a.score,
      )
      .slice(0, 3);

  const updateSummary = (
    value: string,
  ) => {
    setEditableResume((resume) =>
      resume
        ? {
            ...resume,
            summary: value,
          }
        : resume,
    );
    setSaved(false);
  };

  const updateExperienceBullet = (
    experienceIndex: number,
    bulletIndex: number,
    value: string,
  ) => {
    setEditableResume((resume) => {
      if (!resume) {
        return resume;
      }

      const next =
        JSON.parse(
          JSON.stringify(resume),
        ) as TailorResume;

      const item =
        next.experience?.[
          experienceIndex
        ];

      if (!item) {
        return resume;
      }

      item.bullets =
        item.bullets ?? [];

      item.bullets[
        bulletIndex
      ] = value;

      return next;
    });

    setSaved(false);
  };

  const updateProjectBullet = (
    projectIndex: number,
    bulletIndex: number,
    value: string,
  ) => {
    setEditableResume((resume) => {
      if (!resume) {
        return resume;
      }

      const next =
        JSON.parse(
          JSON.stringify(resume),
        ) as TailorResume;

      const item =
        next.projects?.[
          projectIndex
        ];

      if (!item) {
        return resume;
      }

      item.bullets =
        item.bullets ?? [];

      item.bullets[
        bulletIndex
      ] = value;

      return next;
    });

    setSaved(false);
  };

  const resetResume = () => {
    setEditableResume(
      JSON.parse(
        JSON.stringify(
          sourceResume,
        ),
      ) as TailorResume,
    );
    setSaved(false);
  };

  const saveVersion = () => {
    const record = {
      versionId:
        `tailored-${currentJob.id}-${Date.now()}`,
      jobId:
        currentJob.id,
      jobTitle:
        currentJob.title,
      company:
        currentJob.company,
      savedAt:
        new Date().toISOString(),
      resume:
        editableResume,
      resumeFit:
        currentAnalysis.resumeFit,
      missingRequirements:
        currentAnalysis.missingRequired,
    };

    window.localStorage.setItem(
      `roleclear-tailored-${currentJob.id}`,
      JSON.stringify(
        record,
      ),
    );

    window.localStorage.setItem(
      'roleclear-latest-tailored-resume',
      JSON.stringify(
        record,
      ),
    );

    setSaved(true);
  };

  const downloadWord = async () => {
    setDownloading(true);
    setDownloadError('');

    try {
      const exportPayload = {
        version_id:
          `frontend-${currentJob.id}-${Date.now()}`,
        job_title:
          currentJob.title,
        company:
          currentJob.company,
        tailored_resume:
          editableResume,
        claim_validation: {
          passed: true,
          checked_claims: 0,
          unsupported_claims: [],
        },
      };

      const response =
        await fetch(
          `${API_BASE_URL}/api/v1/resume-export/tailored-docx`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              exportPayload,
            ),
          },
        );

      if (!response.ok) {
        let detail =
          'Could not generate the Word file.';

        try {
          const errorBody =
            await response.json();

          detail =
            errorBody?.detail ??
            detail;
        } catch {
          // Keep fallback message.
        }

        throw new Error(detail);
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          'a',
        );

      const safeCompany = (
        currentJob.company ??
        'Company'
      )
        .replace(
          /[^a-z0-9]+/gi,
          '_',
        )
        .replace(
          /^_+|_+$/g,
          '',
        );

      const safeRole = (
        currentJob.title ??
        'Tailored_Resume'
      )
        .replace(
          /[^a-z0-9]+/gi,
          '_',
        )
        .replace(
          /^_+|_+$/g,
          '',
        );

      link.href = url;
      link.download =
        `${safeCompany}_${safeRole}_RoleClear.docx`;

      document.body.appendChild(
        link,
      );

      link.click();
      link.remove();

      window.setTimeout(
        () =>
          URL.revokeObjectURL(
            url,
          ),
        1000,
      );

      saveVersion();
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : 'Could not generate the Word file.',
      );
    } finally {
      setDownloading(false);
    }
  };

  const openUploadedResume = () => {
    if (!uploadedResumeUrl) {
      setActivePanel(
        'original',
      );
      return;
    }

    window.open(
      uploadedResumeUrl,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const experiences =
    editableResume.experience ??
    [];

  const projects =
    editableResume.projects ??
    [];

  const education =
    editableResume.education ??
    [];

  const name =
    editableResume
      .personal_info
      ?.full_name ??
    'Resume candidate';

  const subtitle = [
    education[0]?.degree,
    education[0]
      ?.field_of_study,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="detail-page rc-page-enter tailor-v3-page">
      <BackLink
        onClick={() =>
          setView('resume-match')
        }
        label="Back to resume match"
      />

      <PageTitle
        eyebrow="Smart Apply · Step 04"
        title="Tailor your resume"
        subtitle={`Review RoleClear's suggestions, edit the resume yourself, save a targeted version, and export it as Word.`}
      />

      <div className="tailor-v3-topbar">
        <div className="tailor-v3-status">
          <span>
            <ShieldCheck size={15} />
            Truth-preserving workflow
          </span>

          <span>
            <Target size={15} />
            {currentAnalysis.resumeFit}% job fit
          </span>

          <span>
            <FileText size={15} />
            {uploadedResumeName}
          </span>
        </div>

        <div className="tailor-v3-actions">
          <Button
            variant="secondary"
            onClick={openUploadedResume}
          >
            <FileText size={15} />
            View uploaded resume
          </Button>

          <Button
            variant="secondary"
            onClick={saveVersion}
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

          <Button
            variant="secondary"
            onClick={downloadWord}
            disabled={downloading}
          >
            <Download size={15} />
            {downloading
              ? 'Generating Word…'
              : 'Download Word'}
          </Button>

          <Button
            onClick={() =>
              setView(
                'external-apply',
              )
            }
          >
            Continue to apply
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>

      {downloadError && (
        <div className="tailor-v3-error">
          {downloadError}
        </div>
      )}

      <div className="tailor-v3-layout">
        <aside className="tailor-v3-sidebar">
          <div className="tailor-v3-tabs">
            <button
              className={
                activePanel ===
                'edit'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActivePanel(
                  'edit',
                )
              }
            >
              <Sparkles size={15} />
              Edit tailored
            </button>

            <button
              className={
                activePanel ===
                'original'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActivePanel(
                  'original',
                )
              }
            >
              <FileText size={15} />
              Original
            </button>

            <button
              className={
                activePanel ===
                'suggestions'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActivePanel(
                  'suggestions',
                )
              }
            >
              <Target size={15} />
              Suggestions
            </button>
          </div>

          <div className="tailor-v3-sidecard">
            <span className="mini-label">
              TOP PRIORITIES
            </span>

            {missingRequired.length >
            0 ? (
              <div className="tailor-v3-priority-list">
                {missingRequired
                  .slice(0, 3)
                  .map(
                    (
                      requirement,
                      index,
                    ) => (
                      <div
                        key={
                          requirement
                        }
                      >
                        <span>
                          {index + 1}
                        </span>
                        <p>
                          {
                            requirement
                          }
                        </p>
                      </div>
                    ),
                  )}
              </div>
            ) : (
              <div className="tailor-v3-all-good">
                <CheckCircle2 size={18} />
                No major required gaps detected.
              </div>
            )}
          </div>

          <div className="tailor-v3-sidecard">
            <span className="mini-label">
              STRONGEST EVIDENCE
            </span>

            {strongestRequirements.map(
              (item) => (
                <div
                  className="tailor-v3-match"
                  key={
                    item.requirement
                  }
                >
                  <Check size={14} />
                  <div>
                    <b>
                      {
                        item.requirement
                      }
                    </b>
                    <small>
                      {Math.round(
                        item.score,
                      )}
                      % evidence
                    </small>
                  </div>
                </div>
              ),
            )}
          </div>

          <button
            className="tailor-v3-reset"
            onClick={resetResume}
          >
            <RefreshCw size={14} />
            Reset edits
          </button>
        </aside>

        <main className="tailor-v3-workspace">
          {activePanel ===
            'edit' && (
            <>
              <div className="tailor-v3-workspace-head">
                <div>
                  <span className="mini-label">
                    EDITABLE RESUME
                  </span>
                  <h3>
                    Make final changes
                  </h3>
                  <p>
                    Edit only claims you can verify. RoleClear highlights what to strengthen; you control the final wording.
                  </p>
                </div>

                <span className="tailor-v3-live-badge">
                  Live preview
                </span>
              </div>

              <div className="tailor-v3-editor-grid">
                <section className="tailor-v3-form">
                  <div className="tailor-v3-field">
                    <label>
                      Professional summary
                    </label>
                    <textarea
                      value={
                        editableResume
                          .summary ??
                        ''
                      }
                      onChange={(
                        event,
                      ) =>
                        updateSummary(
                          event
                            .target
                            .value,
                        )
                      }
                      rows={5}
                    />
                    <small>
                      Keep this concise and aligned with the target role.
                    </small>
                  </div>

                  {experiences.map(
                    (
                      item,
                      experienceIndex,
                    ) => (
                      <div
                        className="tailor-v3-edit-section"
                        key={`edit-exp-${experienceIndex}`}
                      >
                        <div className="tailor-v3-edit-heading">
                          <div>
                            <span className="mini-label">
                              EXPERIENCE
                            </span>
                            <h4>
                              {
                                item.title ??
                                'Experience'
                              }
                            </h4>
                            <small>
                              {
                                item.company ??
                                ''
                              }
                            </small>
                          </div>
                        </div>

                        <div className="tailor-v3-bullet-editor">
                          {(item.bullets ??
                            []).map(
                            (
                              bullet,
                              bulletIndex,
                            ) => (
                              <label
                                key={`edit-exp-${experienceIndex}-${bulletIndex}`}
                              >
                                <span>
                                  Bullet{' '}
                                  {bulletIndex +
                                    1}
                                </span>
                                <textarea
                                  value={
                                    bullet
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateExperienceBullet(
                                      experienceIndex,
                                      bulletIndex,
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  rows={3}
                                />
                              </label>
                            ),
                          )}
                        </div>
                      </div>
                    ),
                  )}

                  {projects.map(
                    (
                      item,
                      projectIndex,
                    ) => (
                      <div
                        className="tailor-v3-edit-section"
                        key={`edit-project-${projectIndex}`}
                      >
                        <div className="tailor-v3-edit-heading">
                          <div>
                            <span className="mini-label">
                              PROJECT
                            </span>
                            <h4>
                              {
                                item.name ??
                                'Project'
                              }
                            </h4>
                            {item.subtitle && (
                              <small>
                                {
                                  item.subtitle
                                }
                              </small>
                            )}
                          </div>
                        </div>

                        <div className="tailor-v3-bullet-editor">
                          {(item.bullets ??
                            []).map(
                            (
                              bullet,
                              bulletIndex,
                            ) => (
                              <label
                                key={`edit-project-${projectIndex}-${bulletIndex}`}
                              >
                                <span>
                                  Bullet{' '}
                                  {bulletIndex +
                                    1}
                                </span>
                                <textarea
                                  value={
                                    bullet
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateProjectBullet(
                                      projectIndex,
                                      bulletIndex,
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  rows={3}
                                />
                              </label>
                            ),
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </section>

                <section className="tailor-v3-preview">
                  <div className="tailor-v3-preview-head">
                    <span>
                      PREVIEW
                    </span>
                    <small>
                      Word export preview
                    </small>
                  </div>

                  <div className="tailor-v3-paper">
                    <h2>{name}</h2>
                    <p>{subtitle}</p>

                    {editableResume.summary && (
                      <>
                        <h4>
                          SUMMARY
                        </h4>
                        <p>
                          {
                            editableResume.summary
                          }
                        </p>
                      </>
                    )}

                    {experiences.length >
                      0 && (
                      <>
                        <h4>
                          EXPERIENCE
                        </h4>
                        {experiences.map(
                          (
                            item,
                            index,
                          ) => (
                            <div
                              className="tailor-v3-resume-item"
                              key={`preview-exp-${index}`}
                            >
                              <b>
                                {
                                  item.title ??
                                  'Experience'
                                }
                              </b>
                              <span>
                                {
                                  item.company ??
                                  ''
                                }
                              </span>
                              {(item.bullets ??
                                []).map(
                                (
                                  bullet,
                                  bulletIndex,
                                ) => (
                                  <p
                                    key={`preview-exp-${index}-${bulletIndex}`}
                                  >
                                    •{' '}
                                    {
                                      bullet
                                    }
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
                        <h4>
                          PROJECTS
                        </h4>
                        {projects.map(
                          (
                            item,
                            index,
                          ) => (
                            <div
                              className="tailor-v3-resume-item"
                              key={`preview-project-${index}`}
                            >
                              <b>
                                {
                                  item.name ??
                                  'Project'
                                }
                              </b>
                              {(item.bullets ??
                                []).map(
                                (
                                  bullet,
                                  bulletIndex,
                                ) => (
                                  <p
                                    key={`preview-project-${index}-${bulletIndex}`}
                                  >
                                    •{' '}
                                    {
                                      bullet
                                    }
                                  </p>
                                ),
                              )}
                            </div>
                          ),
                        )}
                      </>
                    )}

                    {allSkills.length >
                      0 && (
                      <>
                        <h4>
                          SKILLS
                        </h4>
                        <p>
                          {allSkills.join(
                            ' · ',
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {activePanel ===
            'original' && (
            <div className="tailor-v3-original">
              <div className="tailor-v3-workspace-head">
                <div>
                  <span className="mini-label">
                    ORIGINAL UPLOAD
                  </span>
                  <h3>
                    {uploadedResumeName}
                  </h3>
                  <p>
                    Compare the source resume with your edited version before exporting.
                  </p>
                </div>

                {uploadedResumeUrl && (
                  <Button
                    variant="secondary"
                    onClick={
                      openUploadedResume
                    }
                  >
                    Open original file
                    <ExternalLink size={15} />
                  </Button>
                )}
              </div>

              {uploadedResumeUrl &&
              (
                uploadedResumeType.includes(
                  'pdf',
                ) ||
                uploadedResumeName
                  .toLowerCase()
                  .endsWith('.pdf')
              ) ? (
                <iframe
                  className="tailor-v3-original-frame"
                  src={uploadedResumeUrl}
                  title="Uploaded resume"
                />
              ) : (
                <div className="tailor-v3-paper original-parsed">
                  <h2>{name}</h2>
                  <p>{subtitle}</p>
                  <pre>
                    {
                      sourceResume.raw_text ??
                      ''
                    }
                  </pre>
                </div>
              )}
            </div>
          )}

          {activePanel ===
            'suggestions' && (
            <div className="tailor-v3-suggestions">
              <div className="tailor-v3-workspace-head">
                <div>
                  <span className="mini-label">
                    ROLECLEAR SUGGESTIONS
                  </span>
                  <h3>
                    What to improve before applying
                  </h3>
                  <p>
                    Suggestions are based on extracted requirements and evidence already present in your resume.
                  </p>
                </div>
              </div>

              <div className="tailor-v3-suggestion-grid">
                <div className="tailor-v3-suggestion-card">
                  <span className="mini-label">
                    REQUIRED GAPS
                  </span>
                  <h4>
                    Strengthen evidence for
                  </h4>

                  {missingRequired.length >
                  0 ? (
                    <ol>
                      {missingRequired
                        .slice(0, 5)
                        .map(
                          (
                            item,
                          ) => (
                            <li
                              key={
                                item
                              }
                            >
                              {
                                item
                              }
                            </li>
                          ),
                        )}
                    </ol>
                  ) : (
                    <p>
                      No major required gaps were detected.
                    </p>
                  )}
                </div>

                <div className="tailor-v3-suggestion-card">
                  <span className="mini-label">
                    EDITING RULE
                  </span>
                  <h4>
                    Improve wording, not facts
                  </h4>
                  <ul>
                    <li>
                      Lead bullets with strong action verbs.
                    </li>
                    <li>
                      Put job-relevant technologies earlier.
                    </li>
                    <li>
                      Keep measurable outcomes only when they are true.
                    </li>
                    <li>
                      Do not add experience, tools, metrics, or achievements you cannot verify.
                    </li>
                  </ul>
                </div>

                <div className="tailor-v3-suggestion-card wide">
                  <span className="mini-label">
                    STRONGEST MATCHES
                  </span>
                  <h4>
                    Keep these prominent
                  </h4>

                  <div className="tailor-v3-keep-list">
                    {strongestRequirements.map(
                      (
                        item,
                      ) => (
                        <div
                          key={
                            item.requirement
                          }
                        >
                          <CheckCircle2 size={16} />
                          <span>
                            {
                              item.requirement
                            }
                          </span>
                          <b>
                            {Math.round(
                              item.score,
                            )}
                            %
                          </b>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="tailor-v3-bottom-bar">
        <div>
          <ShieldCheck size={16} />
          <span>
            Save your final version before applying. The saved version stays linked to this opportunity.
          </span>
        </div>

        <div>
          <Button
            variant="secondary"
            onClick={saveVersion}
          >
            <Save size={15} />
            {saved
              ? 'Saved'
              : 'Save version'}
          </Button>

          <Button
            variant="secondary"
            onClick={downloadWord}
            disabled={downloading}
          >
            <Download size={15} />
            Download Word
          </Button>

          <Button
            onClick={() =>
              setView(
                'external-apply',
              )
            }
          >
            Ready to apply
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
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

  const savedJobs = useCareerStore(
    (state) => state.savedJobs,
  );

  const saveJob = useCareerStore(
    (state) => state.saveJob,
  );

  const [openedOriginal, setOpenedOriginal] =
    useState(false);

  const [confirmed, setConfirmed] =
    useState(false);

  if (!currentJob || !currentAnalysis) {
    return (
      <div className="detail-page narrow-detail rc-page-enter">
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

  const savedTailored =
    window.localStorage.getItem(
      `roleclear-tailored-${currentJob.id}`,
    );

  const hasSavedResume =
    Boolean(savedTailored);

  const isJobSaved =
    savedJobs.some(
      (job) =>
        job.id ===
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
    if (!isJobSaved) {
      saveJob(currentJob);
    }

    if (existing) {
      setSelectedApplication(
        existing.id,
      );
      setConfirmed(true);
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
        hasSavedResume
          ? `Tailored for ${company}`
          : 'Smart Apply resume',
      createdAt:
        now.toISOString(),
    };

    addTrackedApplication(
      tracked,
    );

    setSelectedApplication(
      tracked.id,
    );

    setConfirmed(true);
  };

  const openTrackedApplication = () => {
    const application =
      existing ??
      trackedApplications.find(
        (item) =>
          item.jobId ===
          currentJob.id,
      );

    if (
      application
    ) {
      setSelectedApplication(
        application.id,
      );
    }

    setView(
      'applications',
    );
  };

  return (
    <div className="detail-page rc-page-enter apply-final-page">
      <BackLink
        onClick={() =>
          setView('resume-tailor')
        }
        label="Back to tailored resume"
      />

      <PageTitle
        eyebrow="Smart Apply · Step 05"
        title="Apply & track"
        subtitle="Finish the employer application, confirm submission, and RoleClear will add it to your Applications tracker."
      />

      <section className="apply-final-summary">
        <div>
          <span className="mini-label">
            READY TO APPLY
          </span>
          <h2>
            {role}
          </h2>
          <p>
            {company} · {source}
          </p>
        </div>

        <div className="apply-final-score">
          <span>Resume fit</span>
          <strong>
            {currentAnalysis.resumeFit}%
          </strong>
        </div>
      </section>

      <div className="apply-final-grid">
        <section
          className={`apply-final-step ${
            hasSavedResume
              ? 'complete'
              : ''
          }`}
        >
          <div className="apply-final-step-number">
            1
          </div>

          <div className="apply-final-step-copy">
            <span className="mini-label">
              RESUME
            </span>
            <h3>
              Finalize your tailored resume
            </h3>
            <p>
              Save the version you want to use for this application and download the Word file from Step 04.
            </p>

            <div className="apply-final-step-status">
              {hasSavedResume ? (
                <>
                  <CheckCircle2 size={16} />
                  Tailored version saved
                </>
              ) : (
                <>
                  <Clock3 size={16} />
                  Save a tailored version before applying
                </>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                setView(
                  'resume-tailor',
                )
              }
            >
              Review resume
              <ArrowUpRight size={15} />
            </Button>
          </div>
        </section>

        <section
          className={`apply-final-step ${
            openedOriginal
              ? 'complete'
              : ''
          }`}
        >
          <div className="apply-final-step-number">
            2
          </div>

          <div className="apply-final-step-copy">
            <span className="mini-label">
              EMPLOYER SITE
            </span>
            <h3>
              Submit the application
            </h3>
            <p>
              RoleClear opens the original employer page. Complete and submit the form there.
            </p>

            <div className="apply-final-step-status">
              {openedOriginal ? (
                <>
                  <CheckCircle2 size={16} />
                  Employer site opened
                </>
              ) : (
                <>
                  <ExternalLink size={16} />
                  Application page not opened yet
                </>
              )}
            </div>

            {currentJob.url ? (
              <Button
                onClick={
                  openOriginal
                }
              >
                {openedOriginal
                  ? 'Open site again'
                  : 'Apply on original site'}
                <ExternalLink size={15} />
              </Button>
            ) : (
              <div className="apply-final-warning">
                No original application URL is available for this opportunity.
              </div>
            )}
          </div>
        </section>

        <section
          className={`apply-final-step ${
            confirmed ||
            existing
              ? 'complete'
              : ''
          }`}
        >
          <div className="apply-final-step-number">
            3
          </div>

          <div className="apply-final-step-copy">
            <span className="mini-label">
              TRACK
            </span>
            <h3>
              Confirm & save to Applications
            </h3>
            <p>
              After the employer site confirms submission, add the application to RoleClear so it can be tracked.
            </p>

            <div className="apply-final-step-status">
              {confirmed ||
              existing ? (
                <>
                  <CheckCircle2 size={16} />
                  Application tracked
                </>
              ) : (
                <>
                  <BriefcaseBusiness size={16} />
                  Waiting for your confirmation
                </>
              )}
            </div>

            {confirmed ||
            existing ? (
              <Button
                onClick={
                  openTrackedApplication
                }
              >
                Open Applications
                <ArrowUpRight size={15} />
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={
                  confirmApplied
                }
              >
                I've applied — save to Applications
                <Save size={15} />
              </Button>
            )}
          </div>
        </section>
      </div>

      <div className="apply-final-note">
        <ShieldCheck size={16} />
        RoleClear never submits the employer form automatically. It records the application only after you confirm that you submitted it.
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

  const updateTrackedApplication =
    useCareerStore(
      (state) =>
        state.updateTrackedApplication,
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

  const editApplicationDetails = () => {
    const company =
      window.prompt(
        'Company',
        selected.company,
      );

    if (company === null) {
      return;
    }

    const role =
      window.prompt(
        'Role',
        selected.role,
      );

    if (role === null) {
      return;
    }

    const nextCompany =
      company.trim();

    const nextRole =
      role.trim();

    if (
      !nextCompany ||
      !nextRole
    ) {
      window.alert(
        'Company and role cannot be empty.',
      );
      return;
    }

    updateTrackedApplication(
      selected.id,
      {
        company: nextCompany,
        role: nextRole,
      },
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
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="secondary"
              onClick={
                editApplicationDetails
              }
            >
              Edit details
            </Button>

            {selected.url && (
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
            )}
          </div>
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
                text={
                  selected.importedFromGmail
                    ? 'Verified from an application confirmation email synced from Gmail.'
                    : `Confirmed manually after submission on the original ${selected.source} page.`
                }
                done
              />

              <TimelineItem
                date="Next"
                title="Watch for updates"
                text="RoleClear can sync linked screening, interview, offer and rejection emails automatically. You can still override the status manually."
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
              value={
                selected.importedFromGmail
                  ? 'Not analyzed'
                  : `${selected.fit}%`
              }
            />

            <DetailPair
              label="Ghost Risk"
              value={
                selected.importedFromGmail
                  ? 'Not analyzed'
                  : selected.ghostRisk
                      .charAt(0)
                      .toUpperCase() +
                    selected.ghostRisk.slice(
                      1,
                    )
              }
            />

            {selected.externalApplicationId && (
              <DetailPair
                label="Application ID"
                value={
                  selected.externalApplicationId
                }
              />
            )}

            {selected.importedFromGmail && (
              <DetailPair
                label="Imported"
                value="Verified from Gmail"
              />
            )}
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
        event.origin !== API_ORIGIN      ) {
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
  const careerInboxEvents =
    useCareerStore(
      (state) => state.careerInboxEvents,
    ) ?? [];

  const markCareerInboxEventRead =
    useCareerStore(
      (state) =>
        state.markCareerInboxEventRead,
    );

  const setSelectedApplication =
    useCareerStore(
      (state) =>
        state.setSelectedApplication,
    );

  const notifications = [
    ...careerInboxEvents,
  ]
    .sort(
      (a, b) =>
        Date.parse(b.receivedAt) -
        Date.parse(a.receivedAt),
    )
    .slice(0, 30);

  const formatNotificationTime = (
    value: string,
  ) => {
    const parsed = new Date(value);

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return 'Recent';
    }

    const diff =
      Date.now() -
      parsed.getTime();

    const minutes =
      Math.floor(
        diff / 60000,
      );

    if (minutes < 1) {
      return 'Now';
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(
        minutes / 60,
      );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days =
      Math.floor(
        hours / 24,
      );

    if (days < 7) {
      return `${days}d ago`;
    }

    return parsed.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
      },
    );
  };

  const priorityFor = (
    type: string,
  ) =>
    ['Interview', 'Offer', 'Rejection'].includes(
      type,
    )
      ? 'Action required'
      : type === 'Recruiter'
        ? 'Worth reviewing'
        : 'Application update';

  const openNotification = (
    event: (typeof notifications)[number],
  ) => {
    markCareerInboxEventRead(
      event.id,
    );

    if (
      event.applicationId
    ) {
      setSelectedApplication(
        event.applicationId,
      );
      setView(
        'application-detail',
      );
      return;
    }

    setView('inbox');
  };

  return (
    <div className="detail-page">
      <BackLink
        onClick={() => setView('dashboard')}
        label="Back to dashboard"
      />

      <PageTitle
        eyebrow="Stay informed, not interrupted"
        title="Notifications"
        subtitle="Recent application, interview, recruiter and offer signals from Career Inbox."
      />

      {notifications.length === 0 ? (
        <div
          className="detail-card"
          style={{
            textAlign: 'center',
            padding: '42px 24px',
          }}
        >
          <Bell
            size={26}
            style={{
              marginBottom: '12px',
              opacity: .45,
            }}
          />
          <h3>No notifications yet.</h3>
          <p>
            When Career Inbox detects an application update,
            interview, offer, rejection or recruiter message,
            it will appear here.
          </p>
          <Button
            variant="secondary"
            onClick={() =>
              setView('inbox')
            }
          >
            Open Career Inbox
          </Button>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(
            (event) => (
              <button
                key={event.id}
                type="button"
                className="notification-item"
                onClick={() =>
                  openNotification(
                    event,
                  )
                }
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid rgba(15,23,42,.08)',
                  cursor: 'pointer',
                  opacity: event.read ? .72 : 1,
                }}
              >
                <span className="notification-icon">
                  <Bell size={17} />
                </span>

                <div>
                  <span className="mini-label">
                    {priorityFor(
                      String(
                        event.type,
                      ),
                    )}
                  </span>

                  <h3>
                    {event.title ||
                      'Career update'}
                  </h3>

                  <p>
                    {event.snippet ||
                      event.sender ||
                      'Open Career Inbox to review this update.'}
                  </p>
                </div>

                <small>
                  {formatNotificationTime(
                    event.receivedAt,
                  )}
                </small>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function HelpModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const faqs = [
    {
      q: 'What does Smart Apply do?',
      a: 'It analyzes an external job against your resume, explains fit and gaps, helps tailor your resume truthfully, then sends you to the original employer site to apply.',
    },
    {
      q: 'Does RoleClear apply to jobs for me?',
      a: 'No. RoleClear does not auto-submit employer forms. You stay in control and apply on the original employer site.',
    },
    {
      q: 'What is Career Inbox?',
      a: 'Career Inbox reads connected Gmail messages with read-only permission and turns relevant employer emails into application, interview, offer, rejection and recruiter signals.',
    },
    {
      q: 'Is ATS Checker the same as Resume Fit?',
      a: 'No. ATS Checker evaluates general resume readiness. Resume Fit is job-specific and compares your resume with one role.',
    },
    {
      q: 'Can I disconnect Gmail?',
      a: 'Yes. Go to Settings → Integrations or Career Inbox → Manage connection.',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="RoleClear help"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background:
          'rgba(15, 23, 42, .34)',
        backdropFilter:
          'blur(5px)',
      }}
    >
      <div
        style={{
          width: 'min(620px, 100%)',
          maxHeight: '82vh',
          overflowY: 'auto',
          borderRadius: '18px',
          background: '#fff',
          border:
            '1px solid rgba(15,23,42,.08)',
          boxShadow:
            '0 28px 70px rgba(15,23,42,.22)',
          padding: '22px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '16px',
            alignItems:
              'flex-start',
            marginBottom: '18px',
          }}
        >
          <div>
            <span className="mini-label">
              ROLECLEAR HELP
            </span>
            <h2
              style={{
                margin:
                  '5px 0 4px',
              }}
            >
              Quick FAQ
            </h2>
            <p
              style={{
                margin: 0,
                opacity: .68,
              }}
            >
              The essentials about how RoleClear works.
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '10px',
          }}
        >
          {faqs.map(
            (item) => (
              <details
                key={item.q}
                style={{
                  border:
                    '1px solid rgba(15,23,42,.08)',
                  borderRadius:
                    '12px',
                  padding:
                    '12px 14px',
                  background:
                    'rgba(248,250,252,.72)',
                }}
              >
                <summary
                  style={{
                    cursor:
                      'pointer',
                    fontWeight: 700,
                  }}
                >
                  {item.q}
                </summary>
                <p
                  style={{
                    margin:
                      '9px 0 0',
                    lineHeight: 1.55,
                    opacity: .74,
                  }}
                >
                  {item.a}
                </p>
              </details>
            ),
          )}
        </div>
      </div>
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
  const {
    isLoaded,
    isSignedIn,
  } = useAuth();

  const {
    signOut,
  } = useClerk();

  useEffect(() => {
    let link =
      document.querySelector<HTMLLinkElement>(
        'link[rel~="icon"]',
      );

    if (!link) {
      link =
        document.createElement(
          'link',
        );
      link.rel = 'icon';
      document.head.appendChild(
        link,
      );
    }

    link.type =
      'image/svg+xml';
    link.href =
      '/roleclear-icon.svg';
  }, []);

  const [
    auth,
    setAuth,
  ] =
    useState<AuthView>(
      'landing',
    );

  const handleLogout =
    async () => {
      await signOut();

      setAuth(
        'landing',
      );

      window.requestAnimationFrame(
        () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto',
          });
        },
      );
    };

  if (
    window.location.pathname ===
    '/sso-callback'
  ) {
    return (
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        continueSignUpUrl="/"
      />
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily:
            'Inter, system-ui, sans-serif',
          color: '#0f172a',
        }}
      >
        Loading RoleClear…
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <AppShell
        onLogout={
          handleLogout
        }
      />
    );
  }

  if (
    auth ===
    'landing'
  ) {
    return (
      <Landing
        onAuth={
          setAuth
        }
      />
    );
  }

  return (
    <Auth
      mode={
        auth as
          | 'signin'
          | 'signup'
          | 'otp'
      }
      onAuth={
        setAuth
      }
    />
  );
}
