const CLERK_FAPI =
  'https://frontend-api.clerk.dev';

export default async function handler(
  req,
  res,
) {
  const secretKey =
    process.env.CLERK_SECRET_KEY;

  const proxyUrl =
    process.env.CLERK_PROXY_URL;

  if (!secretKey || !proxyUrl) {
    return res.status(500).json({
      error:
        'Clerk proxy environment variables are missing.',
    });
  }

  const pathParam =
    req.query.path || '';

  const path = Array.isArray(pathParam)
    ? pathParam.join('/')
    : pathParam;

  const searchParams =
    new URLSearchParams();

  for (const [key, value] of Object.entries(
    req.query,
  )) {
    if (key === 'path') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(
          key,
          String(item),
        );
      }
    } else if (
      value !== undefined
    ) {
      searchParams.append(
        key,
        String(value),
      );
    }
  }

  const query =
    searchParams.toString();

  const targetUrl =
    `${CLERK_FAPI}/${path}` +
    (query ? `?${query}` : '');

  const forwardedFor =
    String(
      req.headers[
        'x-forwarded-for'
      ] ||
        req.socket?.remoteAddress ||
        '',
    )
      .split(',')[0]
      .trim();

  const headers = {
    ...req.headers,
    'clerk-proxy-url':
      proxyUrl,
    'clerk-secret-key':
      secretKey,
    'x-forwarded-for':
      forwardedFor,
  };

  delete headers.host;
  delete headers['content-length'];

  let body;

  if (
    req.method !== 'GET' &&
    req.method !== 'HEAD'
  ) {
    if (
      typeof req.body === 'string' ||
      Buffer.isBuffer(req.body)
    ) {
      body = req.body;
    } else if (
      req.body !== undefined
    ) {
      body = JSON.stringify(
        req.body,
      );

      if (
        !headers['content-type']
      ) {
        headers['content-type'] =
          'application/json';
      }
    }
  }

  try {
    const response =
      await fetch(
        targetUrl,
        {
          method: req.method,
          headers,
          body,
          redirect: 'manual',
        },
      );

    response.headers.forEach(
      (value, key) => {
        if (
          key.toLowerCase() ===
          'content-encoding'
        ) {
          return;
        }

        res.setHeader(
          key,
          value,
        );
      },
    );

    const buffer =
      Buffer.from(
        await response.arrayBuffer(),
      );

    return res
      .status(response.status)
      .send(buffer);
  } catch (error) {
    console.error(
      'Clerk proxy error:',
      error,
    );

    return res.status(502).json({
      error:
        'Clerk proxy request failed.',
    });
  }
}