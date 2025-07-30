import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = "http://localhost:3456";

export const config = {
  api: {
    bodyParser: false, // Permet de forwarder les bodies bruts (utile pour fichiers, etc.)
  },
};

function filterHeaders(headers: Record<string, any>) {
  // Supprime les headers qui posent problème
  const excluded = ["host", "connection", "content-length", "accept-encoding"];
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!excluded.includes(key.toLowerCase())) {
      result[key] = value;
    }
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug = [], ...query } = req.query;
  let url = `${API_URL}/${Array.isArray(slug) ? slug.join("/") : slug}`;

  // Ajoute les query params à l'URL
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else {
      searchParams.append(key, value as string);
    }
  }
  if ([...searchParams].length > 0) {
    url += `?${searchParams.toString()}`;
  }

  // Récupère le body brut (pour POST/PUT/PATCH/DELETE)
  let body: any = undefined;
  if (!["GET", "HEAD"].includes(req.method || "")) {
    body = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: {
      ...filterHeaders(req.headers as Record<string, any>),
      'x-forwarded-for':
        req.socket.remoteAddress ||
        (Array.isArray(req.headers['x-forwarded-for'])
          ? req.headers['x-forwarded-for'].join(', ')
          : req.headers['x-forwarded-for']) ||
        'unknown',
      'x-real-ip':
        req.socket.remoteAddress ||
        (Array.isArray(req.headers['x-real-ip'])
          ? req.headers['x-real-ip'].join(', ')
          : req.headers['x-real-ip']) ||
        'unknown',
    },
    body: body && body.length > 0 ? body : undefined,
    // Pas de redirect automatique
  };

  // Forward la requête
  const apiRes = await fetch(url, fetchOptions);

  // Forward le status et les headers
  res.status(apiRes.status);
  apiRes.headers.forEach((value, key) => {
    // Certains headers sont interdits par Next.js (ex: transfer-encoding)
    if (
      ![
        "transfer-encoding",
        "content-encoding",
        "content-length",
        "connection",
      ].includes(key.toLowerCase())
    ) {
      res.setHeader(key, value);
    }
  });

  // Stream la réponse
  const buffer = await apiRes.arrayBuffer();
  res.send(Buffer.from(buffer));
}
