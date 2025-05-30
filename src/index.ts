import { Elysia, redirect } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { staticPlugin } from '@elysiajs/static';
import { logger } from '@tqman/nice-logger';
import { rateLimit } from 'elysia-rate-limit';
import fs from 'node:fs/promises';
import { join } from '@std/path';

import comcigan from './routes/comcigan.ts';
import neis from './routes/neis.ts';
import notifications from './routes/notifications.ts';
import fcm from './routes/fcm.ts';
import { refreshCache } from './libraries/cache.ts';
import { sendFcm } from './libraries/fcm.ts';

const logsDir = join(__dirname, '..', 'logs');
fs.access(logsDir).catch(() => fs.mkdir(logsDir));

const susVideo = (): string => {
  const videos = ['FlUKCD2G0N0', 'jjDL_zySJv4', 'a8uyilHatBA'];
  return `https://youtu.be/${videos[Math.floor(Math.random() * videos.length)]}`;
};

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: { title: 'Slunch-V2 API', description: 'API for slunch-v2', version: '1.0.0' },
        servers: [
          { url: 'https://slunch-v2.ny64.kr', description: 'Production server' },
          { url: 'http://localhost:3000', description: 'Local server' },
        ],
      },
    })
  )
  .use(logger({ mode: 'live', withTimestamp: true }))
  .use(staticPlugin({ assets: 'public', noCache: true }))
  .use(
    rateLimit({
      errorResponse: new Response(`You are rate limited!\nvideo for you: https://youtu.be/${[susVideo()]}`, {
        status: 429,
        statusText: 'Rate Limit Exceeded',
        headers: { 'Content-Type': 'text/plain' },
      }),
      max: 100,
      duration: 60 * 1000,
      // 100 requests per 1 minute
    })
  )

  .use(refreshCache)
  .use(sendFcm)

  .use(comcigan)
  .use(neis)
  .use(notifications)
  .use(fcm)

  .onError(({ code }: { code: string }) => {
    if (code === 'NOT_FOUND') return redirect(susVideo());
  })
  .listen(Number(Deno.env.get("PORT")) ?? 3000);

console.log(`
🍤 Slunch-V2 backend is running at ${app.server!.url}
📄 Swagger documentation is available at ${app.server!.url}swagger
`);
