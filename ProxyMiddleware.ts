import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { Request, Response, NextFunction } from 'express';

type ProxyMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function createProxy(targetBase: string): ProxyMiddleware {
    const targetBaseUrl = new URL(targetBase);

    return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetPath = req.originalUrl.replace(req.baseUrl, '') || '/';
            const query = req.url.includes('?') ? req.url.split('?')[1] : '';
            const targetUrl = new URL(targetPath, targetBaseUrl);
            // console.log('Proxying request to:', targetUrl.href);    
            if (query) targetUrl.search = '?' + query;

            const client = targetUrl.protocol === 'https:' ? https : http;

            const chunks: Buffer[] = [];
            req.on('data', (chunk: Buffer) => chunks.push(chunk));
            req.on('end', () => {
                const body = Buffer.concat(chunks);

                const options: http.RequestOptions = {
                    method: req.method,
                    headers: {
                        ...req.headers,
                        host: targetUrl.host,
                    },
                };

                const proxyReq = client.request(targetUrl, options, (proxyRes: http.IncomingMessage) => {
                    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                    proxyRes.pipe(res);
                });

                proxyReq.on('error', (err: Error) => {
                    console.error('Proxy error:', err);
                    res.statusCode = 502;
                    res.end('Proxy Error');
                });

                if (body.length) {
                    proxyReq.write(body);
                }

                proxyReq.end();
            });
        } catch (err) {
            console.error('Internal proxy error:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    };
}

export default createProxy;
