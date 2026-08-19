# RoleClear — design implementation

This package is the uploaded Bolt/Vite React project updated into a working frontend prototype following the supplied design direction.

## Included
- Existing editorial/premium RoleClear landing page retained.
- Responsive desktop/mobile app shell with sidebar and bottom navigation.
- Smart Apply workflow: import → analysis → resume match → tailoring → external apply → application tracking.
- Application tracker and application detail screen.
- Resume Studio, resume detail and job-specific tailoring workspace.
- Career Feed and Career Inbox.
- Gmail/Outlook connection prototype screen with permission-first messaging.
- Analytics, notifications, profile and privacy/security screens.
- Signup fields: name, mobile, email, password.
- Six-digit OTP verification prototype.
- Google sign-in prototype action.
- Basic PWA manifest, icon and service worker.

## Important
Authentication, email OAuth, AI analysis, database persistence and backend APIs are not wired to production services yet because no Supabase project credentials/OAuth configuration were supplied. The current flows are frontend prototypes designed so those services can be connected next.

## Run
`npm install`
`npm run dev`

Build with:
`npm run build`
