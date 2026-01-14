import { RequestContext } from '@mikro-orm/core';
import { fastify } from 'fastify';
import { initORM } from './db.js';

export async function bootstrap(port = 3001, migrate = true) {
  const db = await initORM();

  if (migrate) {
    // sync the schema
    await db.orm.migrator.up();
  }

  const app = fastify();

  // register request context hook
  app.addHook('onRequest', (request, reply, done) => {
    RequestContext.create(db.em, done);
  });

  // shut down the connection when closing the app
  app.addHook('onClose', async () => {
    await db.orm.close();
  });

  // register routes here
  app.get('/article', async request => {
    const { limit, offset } = request.query as { limit?: number; offset?: number };
    const [items, total] = await db.article.findAndCount({}, {
      limit, offset,
    });

    return { items, total };
  });

  const url = await app.listen({ port });

  return { app, url };
}
