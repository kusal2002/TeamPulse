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
    const origin = request.headers.get('origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (env) {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string') {
          process.env[key] = value;
        }
      }
    }

    try {
      const expressApp = await getExpressApp();
      const url = new URL(request.url);

      return await new Promise<Response>((resolve) => {
        try {
          const socket = new Socket();
          const req = new IncomingMessage(socket);
          req.url = url.pathname + url.search;
          req.method = request.method;
          req.headers = Object.fromEntries(request.headers.entries());

          request.arrayBuffer().then((buffer) => {
            const bodyBuffer = buffer.byteLength > 0 ? Buffer.from(buffer) : null;
            const res = new ServerResponse(req);
            const chunks: Buffer[] = [];

            res.write = (chunk: any) => {
              if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              return true;
            };

            res.end = (chunk?: any) => {
              if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              const body = Buffer.concat(chunks);
              const responseHeaders = new Headers();

              for (const [key, val] of Object.entries(res.getHeaders())) {
                if (val !== undefined) {
                  if (Array.isArray(val)) {
                    val.forEach((v) => responseHeaders.append(key, String(v)));
                  } else {
                    responseHeaders.set(key, String(val));
                  }
                }
              }

              for (const [k, v] of Object.entries(corsHeaders)) {
                if (!responseHeaders.has(k)) {
                  responseHeaders.set(k, v);
                }
              }

              resolve(new Response(body, { status: res.statusCode, headers: responseHeaders }));
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
          }).catch((err) => {
            resolve(
              new Response(
                JSON.stringify({ statusCode: 500, message: err?.message || 'Internal Server Error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            );
          });
        } catch (err: any) {
          resolve(
            new Response(
              JSON.stringify({ statusCode: 500, message: err?.message || 'Internal Server Error' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          );
        }
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ statusCode: 500, message: err?.message || 'Internal Server Error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};
