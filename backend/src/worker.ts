import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { AppModule, ObserveInstrument } from './app.module.js';

let cachedExpressApp: Express | null = null;

async function getExpressApp(): Promise<Express> {
  if (!cachedExpressApp) {
    const expressApp = express();
    expressApp.use((req, res, next) => {
      if ((req as any).body !== undefined) {
        return next();
      }
      express.json({ limit: '10mb' })(req, res, next);
    });
    expressApp.use(express.urlencoded({ extended: true }));
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        instrument: ObserveInstrument,
      },
    );
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.enableCors({
      origin: true,
      credentials: true,
    });
    await app.init();
    cachedExpressApp = expressApp;
  }
  return cachedExpressApp;
}

export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string') {
          process.env[key] = value;
        }
      }
    }

    const expressApp = await getExpressApp();
    const url = new URL(request.url);

    return new Promise<Response>(async (resolve, reject) => {
      try {
        const socket = new Socket();
        const req = new IncomingMessage(socket);
        req.url = url.pathname + url.search;
        req.method = request.method;
        req.headers = Object.fromEntries(request.headers.entries());

        const bodyBuffer = request.body ? Buffer.from(await request.arrayBuffer()) : null;

        const res = new ServerResponse(req);
        const chunks: Buffer[] = [];

        res.write = (chunk: any) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        };

        res.end = (chunk?: any) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          const body = Buffer.concat(chunks);
          const headers = new Headers();

          for (const [key, val] of Object.entries(res.getHeaders())) {
            if (val !== undefined) {
              if (Array.isArray(val)) {
                val.forEach((v) => headers.append(key, String(v)));
              } else {
                headers.set(key, String(val));
              }
            }
          }

          const reqOrigin = request.headers.get('origin');
          if (reqOrigin && !headers.has('access-control-allow-origin')) {
            headers.set('access-control-allow-origin', reqOrigin);
            headers.set('access-control-allow-credentials', 'true');
          }

          resolve(new Response(body, { status: res.statusCode, headers }));
          return res;
        };

        if (bodyBuffer && bodyBuffer.length > 0) {
          try {
            const contentType = (req.headers['content-type'] || '').toString();
            if (contentType.includes('application/json')) {
              (req as any).body = JSON.parse(bodyBuffer.toString('utf-8'));
            }
          } catch (e) {}
          req.push(bodyBuffer);
        }
        req.push(null);

        expressApp(req, res);
      } catch (err) {
        reject(err);
      }
    });
  },
};
