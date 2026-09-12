import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Bell,
  Check,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  Sparkles,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { useCareerStore } from './store/useCareerStore';

const EMAIL_API_BASE =
  'http://127.0.0.1:8000/api/v1/email';

type SettingsTab =
  | 'Account'
  | 'Career preferences'
  | 'Integrations'
  | 'Notifications'
  | 'Privacy & security';

type GmailConnectionStatus = {
  connected: boolean;
  email: string | null;
};

type AccountSettings = {
  fullName: string;
  email: string;
  mobile: string;
};

type CareerPreferences = {
  targetRoles: string;
  preferredLocations: string;
  workMode: string;
  minFit: number;
};

type NotificationSettings = {
  applicationUpdates: boolean;
  interviews: boolean;
  offers: boolean;
  recruiterMessages: boolean;
};

const ACCOUNT_KEY =
  'roleclear_settings_account_v1';

const CAREER_KEY =
  'roleclear_settings_career_v1';

const NOTIFICATION_KEY =
  'roleclear_settings_notifications_v1';

function readLocal<T>(
  key: string,
  fallback: T,
): T {
  if (
    typeof window ===
    'undefined'
  ) {
    return fallback;
  }

  try {
    const raw =
      window.localStorage.getItem(
        key,
      );

    return raw
      ? {
          ...fallback,
          ...JSON.parse(raw),
        }
      : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(
  key: string,
  value: unknown,
) {
  window.localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}

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

  const data =
    await response.json();

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
      'Popup blocked. Allow popups for RoleClear and try again.',
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
    Date.now() - startedAt <
    timeoutMs
  ) {
    await new Promise(
      (resolve) =>
        window.setTimeout(
          resolve,
          1000,
        ),
    );

    try {
      const status =
        await fetchGmailStatus();

      if (status.connected) {
        return status;
      }
    } catch {
      // OAuth callback may briefly make the API unavailable.
    }

    if (popup.closed) {
      const finalStatus =
        await fetchGmailStatus();

      if (
        finalStatus.connected
      ) {
        return finalStatus;
      }

      throw new Error(
        'Google sign-in closed before the connection completed.',
      );
    }
  }

  throw new Error(
    'Gmail connection timed out.',
  );
}

async function disconnectGmail() {
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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (
    value: boolean,
  ) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() =>
        onChange(!checked)
      }
      style={{
        width: '44px',
        height: '24px',
        border: 0,
        padding: '3px',
        borderRadius: '999px',
        background: checked
          ? '#16a34a'
          : 'rgba(15,23,42,.12)',
        cursor: 'pointer',
        transition:
          'background 160ms ease',
      }}
    >
      <span
        style={{
          display: 'block',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          transform: checked
            ? 'translateX(20px)'
            : 'translateX(0)',
          transition:
            'transform 160ms ease',
        }}
      />
    </button>
  );
}

export default function SettingsView({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const currentResume =
    useCareerStore(
      (state) =>
        state.currentResume,
    );

  const resumePersonal =
    useMemo(() => {
      const parsed =
        currentResume as
          | {
              personal_info?: {
                full_name?: string | null;
                email?: string | null;
                phone?: string | null;
              };
            }
          | null;

      return (
        parsed?.personal_info ??
        {}
      );
    }, [currentResume]);

  const [tab, setTab] =
    useState<SettingsTab>(
      'Account',
    );

  const [savedMessage, setSavedMessage] =
    useState('');

  const [account, setAccount] =
    useState<AccountSettings>(
      () =>
        readLocal(
          ACCOUNT_KEY,
          {
            fullName:
              resumePersonal.full_name ??
              '',
            email:
              resumePersonal.email ??
              '',
            mobile:
              resumePersonal.phone ??
              '',
          },
        ),
    );

  const [career, setCareer] =
    useState<CareerPreferences>(
      () =>
        readLocal(
          CAREER_KEY,
          {
            targetRoles:
              'Software Engineer, Backend Engineer',
            preferredLocations:
              'Bengaluru, Chennai, Hyderabad',
            workMode:
              'Hybrid / Remote',
            minFit: 65,
          },
        ),
    );

  const [
    notifications,
    setNotifications,
  ] =
    useState<NotificationSettings>(
      () =>
        readLocal(
          NOTIFICATION_KEY,
          {
            applicationUpdates:
              true,
            interviews: true,
            offers: true,
            recruiterMessages:
              true,
          },
        ),
    );

  const [
    gmailStatus,
    setGmailStatus,
  ] =
    useState<GmailConnectionStatus>(
      {
        connected: false,
        email: null,
      },
    );

  const [gmailBusy, setGmailBusy] =
    useState(false);

  const [integrationMessage, setIntegrationMessage] =
    useState('');

  useEffect(() => {
    fetchGmailStatus()
      .then(setGmailStatus)
      .catch(() => {
        // Settings still works when backend is offline.
      });
  }, []);

  const save = (
    label: string,
    key: string,
    value: unknown,
  ) => {
    saveLocal(key, value);
    setSavedMessage(
      `${label} saved`,
    );

    window.setTimeout(
      () =>
        setSavedMessage(''),
      1800,
    );
  };

  const connectGoogle =
    async () => {
      setGmailBusy(true);
      setIntegrationMessage('');

      try {
        const popup =
          await startGmailOAuth();

        const status =
          await waitForGmailConnection(
            popup,
          );

        setGmailStatus(status);
        setIntegrationMessage(
          `Connected${
            status.email
              ? ` · ${status.email}`
              : ''
          }`,
        );
      } catch (error) {
        setIntegrationMessage(
          error instanceof Error
            ? error.message
            : 'Could not connect Gmail.',
        );
      } finally {
        setGmailBusy(false);
      }
    };

  const disconnectGoogle =
    async () => {
      setGmailBusy(true);
      setIntegrationMessage('');

      try {
        await disconnectGmail();

        setGmailStatus({
          connected: false,
          email: null,
        });

        setIntegrationMessage(
          'Google disconnected.',
        );
      } catch (error) {
        setIntegrationMessage(
          error instanceof Error
            ? error.message
            : 'Could not disconnect Gmail.',
        );
      } finally {
        setGmailBusy(false);
      }
    };

  const tabs: SettingsTab[] = [
    'Account',
    'Career preferences',
    'Integrations',
    'Notifications',
    'Privacy & security',
  ];

  return (
    <div className="rc-page-enter">
      <PageHeader
        eyebrow="Your space, your rules"
        title="Settings"
        subtitle="Manage your preferences, connections, notifications, and local RoleClear data."
      />

      <div className="settings-layout">
        <div className="settings-nav">
          {tabs.map((item) => (
            <button
              key={item}
              className={
                tab === item
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setTab(item)
              }
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="settings-panels">
          {savedMessage && (
            <div
              className="settings-panel"
              style={{
                padding:
                  '10px 14px',
                borderColor:
                  'rgba(34,197,94,.25)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  gap: '7px',
                  alignItems:
                    'center',
                  color:
                    '#15803d',
                  fontSize:
                    '.78rem',
                }}
              >
                <Check size={15} />
                {savedMessage}
              </span>
            </div>
          )}

          {tab === 'Account' && (
            <div className="settings-panel">
              <div>
                <span className="mini-label">
                  ACCOUNT
                </span>
                <h3>
                  Personal information
                </h3>
                <p>
                  Keep your basics up to
                  date.
                </p>
              </div>

              <label>
                Full name
                <input
                  value={
                    account.fullName
                  }
                  onChange={(event) =>
                    setAccount({
                      ...account,
                      fullName:
                        event
                          .target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={
                    account.email
                  }
                  onChange={(event) =>
                    setAccount({
                      ...account,
                      email:
                        event
                          .target
                          .value,
                    })
                  }
                />
              </label>

              <label>
                Mobile number
                <input
                  value={
                    account.mobile
                  }
                  onChange={(event) =>
                    setAccount({
                      ...account,
                      mobile:
                        event
                          .target
                          .value,
                    })
                  }
                />
              </label>

              <button
                className="button button-secondary"
                onClick={() =>
                  save(
                    'Account',
                    ACCOUNT_KEY,
                    account,
                  )
                }
                type="button"
              >
                <Save size={15} />
                Save details
              </button>
            </div>
          )}

          {tab ===
            'Career preferences' && (
            <div className="settings-panel">
              <div>
                <span className="mini-label">
                  CAREER PREFERENCES
                </span>
                <h3>
                  What are you targeting?
                </h3>
                <p>
                  These preferences help
                  RoleClear prioritize your
                  own workspace. They do
                  not change employer ATS
                  scores.
                </p>
              </div>

              <label>
                Target roles
                <input
                  value={
                    career.targetRoles
                  }
                  onChange={(event) =>
                    setCareer({
                      ...career,
                      targetRoles:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Software Engineer, Backend Engineer"
                />
              </label>

              <label>
                Preferred locations
                <input
                  value={
                    career.preferredLocations
                  }
                  onChange={(event) =>
                    setCareer({
                      ...career,
                      preferredLocations:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Bengaluru, Chennai"
                />
              </label>

              <label>
                Work mode
                <select
                  value={
                    career.workMode
                  }
                  onChange={(event) =>
                    setCareer({
                      ...career,
                      workMode:
                        event
                          .target
                          .value,
                    })
                  }
                >
                  <option>
                    Hybrid / Remote
                  </option>
                  <option>
                    Hybrid
                  </option>
                  <option>
                    Remote
                  </option>
                  <option>
                    On-site
                  </option>
                  <option>
                    Any
                  </option>
                </select>
              </label>

              <label>
                Minimum fit worth
                reviewing:{' '}
                {career.minFit}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={
                    career.minFit
                  }
                  onChange={(event) =>
                    setCareer({
                      ...career,
                      minFit:
                        Number(
                          event
                            .target
                            .value,
                        ),
                    })
                  }
                />
              </label>

              <button
                className="button button-secondary"
                onClick={() =>
                  save(
                    'Career preferences',
                    CAREER_KEY,
                    career,
                  )
                }
                type="button"
              >
                <Save size={15} />
                Save preferences
              </button>
            </div>
          )}

          {tab ===
            'Integrations' && (
            <div className="settings-panel">
              <div>
                <span className="mini-label">
                  INTEGRATIONS
                </span>
                <h3>
                  Connected accounts
                </h3>
                <p>
                  Connections are optional
                  and can be removed at any
                  time.
                </p>
              </div>

              <div className="integration-row">
                <span className="integration-logo">
                  G
                </span>

                <div>
                  <b>
                    Google / Gmail
                  </b>
                  <small>
                    {gmailStatus.connected
                      ? `Connected${
                          gmailStatus.email
                            ? ` · ${gmailStatus.email}`
                            : ''
                        }`
                      : 'Not connected'}
                  </small>
                </div>

                <button
                  className="button button-secondary"
                  disabled={
                    gmailBusy
                  }
                  onClick={
                    gmailStatus.connected
                      ? disconnectGoogle
                      : connectGoogle
                  }
                  type="button"
                >
                  {gmailBusy
                    ? 'Please wait…'
                    : gmailStatus.connected
                      ? 'Disconnect'
                      : 'Connect'}
                </button>
              </div>

              <div className="integration-row">
                <span className="integration-logo outlook">
                  O
                </span>

                <div>
                  <b>Outlook</b>
                  <small>
                    Not available in this
                    build
                  </small>
                </div>

                <button
                  className="button button-secondary"
                  disabled
                  type="button"
                >
                  Coming soon
                </button>
              </div>

              {integrationMessage && (
                <p
                  style={{
                    margin: 0,
                    fontSize:
                      '.76rem',
                    opacity: .7,
                  }}
                >
                  {
                    integrationMessage
                  }
                </p>
              )}
            </div>
          )}

          {tab ===
            'Notifications' && (
            <div className="settings-panel">
              <div>
                <span className="mini-label">
                  NOTIFICATIONS
                </span>
                <h3>
                  Career signals
                </h3>
                <p>
                  Choose which events
                  should be surfaced
                  prominently inside
                  RoleClear.
                </p>
              </div>

              {[
                [
                  'Application updates',
                  'applicationUpdates',
                  Mail,
                ],
                [
                  'Interviews',
                  'interviews',
                  Bell,
                ],
                [
                  'Offers',
                  'offers',
                  Sparkles,
                ],
                [
                  'Recruiter messages',
                  'recruiterMessages',
                  UserRound,
                ],
              ].map(
                ([
                  label,
                  key,
                  Icon,
                ]) => (
                  <div
                    className="integration-row"
                    key={
                      key as string
                    }
                  >
                    <Icon
                      size={17}
                    />
                    <div>
                      <b>
                        {label as string}
                      </b>
                      <small>
                        Show this signal in
                        your workspace
                      </small>
                    </div>

                    <Toggle
                      checked={
                        notifications[
                          key as keyof NotificationSettings
                        ]
                      }
                      onChange={(
                        value,
                      ) =>
                        setNotifications(
                          {
                            ...notifications,
                            [key as keyof NotificationSettings]:
                              value,
                          },
                        )
                      }
                    />
                  </div>
                ),
              )}

              <button
                className="button button-secondary"
                onClick={() =>
                  save(
                    'Notifications',
                    NOTIFICATION_KEY,
                    notifications,
                  )
                }
                type="button"
              >
                <Save size={15} />
                Save notifications
              </button>
            </div>
          )}

          {tab ===
            'Privacy & security' && (
            <>
              <div className="settings-panel">
                <div>
                  <span className="mini-label">
                    PRIVACY
                  </span>
                  <h3>
                    Your local RoleClear
                    data
                  </h3>
                  <p>
                    Smart Apply,
                    applications, resume
                    versions, and settings
                    may use browser local
                    storage in this build.
                  </p>
                </div>

                <div className="integration-row">
                  <ShieldCheck
                    size={18}
                  />
                  <div>
                    <b>
                      Employer forms
                    </b>
                    <small>
                      RoleClear does not
                      submit employer
                      applications
                      automatically.
                    </small>
                  </div>
                </div>

                <div className="integration-row">
                  <LockKeyhole
                    size={18}
                  />
                  <div>
                    <b>
                      Connected Gmail
                    </b>
                    <small>
                      You can disconnect
                      Google from
                      Integrations at any
                      time.
                    </small>
                  </div>
                </div>
              </div>

              <div className="settings-panel danger-panel">
                <div>
                  <span className="mini-label">
                    ACCOUNT ACCESS
                  </span>
                  <h3>
                    Sign out of RoleClear
                  </h3>
                  <p>
                    You'll need to sign in
                    again to access your
                    career space.
                  </p>
                </div>

                <button
                  className="button button-secondary"
                  onClick={onLogout}
                  type="button"
                >
                  <KeyRound
                    size={15}
                  />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
