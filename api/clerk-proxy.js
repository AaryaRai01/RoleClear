const CLERK_FAPI = 'https://frontend-api.clerk.dev';

function firstHeaderValue(value) {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return String(value || '');
}

function serializeRequestBody(req, headers) {
  if (
    req.method === 'GET' ||
    req.method === 'HEAD' ||
    req.body === undefined ||
    req.body === null
  ) {
    return undefined;
  }

  if (
    typeof req.body === 'string' ||
    Buffer.isBuffer(req.body)
  ) {
    return req.body;
  }

  const contentType =
    firstHeaderValue(
      headers['content-type'],
    ).toLowerCase();

  if (
    contentType.includes(
      'application/x-www-form-urlencoded',
    )
  ) {
    const params =
      new URLSearchParams();

    for (
      const [key, value]
      of Object.entries(req.body)
    ) {
      if (Array.isArray(value)) {
        for (const item of value) {
          params.append(
            key,
            String(item),
          );
        }
      } else if (
        value !== undefined &&
        value !== null
      ) {
        params.append(
          key,
          String(value),
        );
      }
    }

    return params.toString();
  }

  if (
    contentType.includes(
      'application/json',
    )
  ) {
    return JSON.stringify(req.body);
  }

  return JSON.stringify(req.body);
}

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
      hasSecretKey:
        Boolean(secretKey),
      hasProxyUrl:
        Boolean(proxyUrl),
    });
  }

  const rawPath =
    req.query.path || '';

  const path =
    Array.isArray(rawPath)
      ? rawPath.join('/')
      : String(rawPath);

  const query =
    new URLSearchParams();

  for (
    const [key, value]
    of Object.entries(req.query)
  ) {
    if (key === 'path') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(
          key,
          String(item),
        );
      }
    } else if (
      value !== undefined
    ) {
      query.append(
        key,
        String(value),
      );
    }
  }

  const targetUrl =
    `${CLERK_FAPI}/${path}` +
    (
      query.toString()
        ? `?${query.toString()}`
        : ''
    );

  const headers = {
    ...req.headers,
  };

  delete headers.host;
  delete headers['content-length'];

  headers['clerk-proxy-url'] =
    proxyUrl;

  headers['clerk-secret-key'] =
    secretKey;

  headers['x-forwarded-for'] =
    firstHeaderValue(
      req.headers[
        'x-forwarded-for'
      ],
    ) ||
    firstHeaderValue(
      req.headers['x-real-ip'],
    ) ||
    req.socket?.remoteAddress ||
    '';

  const body =
    serializeRequestBody(
      req,
      headers,
    );

  try {
    const response =
      await fetch(
        targetUrl,
        {
          method:
            req.method,
          headers,
          body,
          redirect:
            'manual',
        },
      );

    response.headers.forEach(
      (value, key) => {
        const lower =
          key.toLowerCase();

        if (
          lower ===
            'content-encoding' ||
          lower ===
            'content-length' ||
          lower ===
            'transfer-encoding'
        ) {
          return;
        }

        res.setHeader(
          key,
          value,
        );
      },
    );

    const payload =
      Buffer.from(
        await response.arrayBuffer(),
      );

    return res
      .status(response.status)
      .send(payload);
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