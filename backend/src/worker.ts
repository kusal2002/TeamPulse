import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { AppModule, ObserveInstrument } from './app.module.js';

let cachedExpressApp: Express | null = null;

async function getExpressApp(): Promise<Express> {
  if (!cachedExpressApp) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        instrument: ObserveInstrument,
      },
    );
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

          resolve(new Response(body, { status: res.statusCode, headers }));
          return res;
        };

        expressApp(req, res);

        if (bodyBuffer && bodyBuffer.length > 0) {
          req.push(bodyBuffer);
        }
        req.push(null);
      } catch (err) {
        reject(err);
      }
    });
  },
};
