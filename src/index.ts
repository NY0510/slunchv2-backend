import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { Logestic } from 'logestic';

import comcigan from './routes/comcigan';
import neis from './routes/neis';
import pfp from './routes/pfp';
import notifications from './routes/notifications';
import { cronjob } from './libraries/cache';

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Slunch-V2 API',
          description: 'API for slunch-v2',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'https://slunch-v2.ny64.kr',
            description: 'Production server',
          },
          {
            url: 'http://localhost:3000',
            description: 'Local server',
          },
        ],
      },
    })
  )
  .use(Logestic.preset('fancy'))
  .use(cronjob)
  .use(comcigan)
  .use(neis)
  .use(notifications)
  .use(pfp)
  .listen(process.env.PORT ?? 3000);

console.log(`
🍤 Slunch-V2 backend is running at ${app.server!.url}
📄 Swagger documentation is available at ${app.server!.url}swagger
`);
