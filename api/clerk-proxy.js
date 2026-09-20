import express from 'express';
import { clerkMiddleware } from '@clerk/express';

const app = express();

/*
 * Vercel rewrites:
 *
 * /__clerk/:path*
 *      ↓
 * /api/clerk-proxy?path=:path*
 *
 * Reconstruct the original /__clerk URL before
 * Clerk's middleware sees the request.
 */
app.use((req, _res, next) => {
  const pathValue = req.query.path;

  let clerkPath = '';

  if (Array.isArray(pathValue)) {
    clerkPath = pathValue.join('/');
  } else if (typeof pathValue === 'string') {
    clerkPath = pathValue;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else if (value !== undefined) {
      params.append(key, String(value));
    }
  }

  const queryString = params.toString();

  const reconstructedUrl =
    `/__clerk/${clerkPath}` +
    (queryString ? `?${queryString}` : '');

  req.url = reconstructedUrl;
  req.originalUrl = reconstructedUrl;

  next();
});

/*
 * Clerk handles the Frontend API proxy.
 *
 * This includes:
 * - forwarding request headers
 * - forwarding request bodies
 * - Clerk proxy headers
 * - OAuth redirect rewriting
 * - authentication handshake proxy URL
 */
app.use(
  clerkMiddleware({
    frontendApiProxy: {
      enabled: true,
      path: '/__clerk',
    },
  }),
);

app.use((_req, res) => {
  res.status(404).json({
    error: 'Clerk proxy route was not handled.',
  });
});

export default app;