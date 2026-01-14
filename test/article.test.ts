import { afterAll, beforeAll, expect, test } from 'vitest';
import { FastifyInstance } from 'fastify';
import { initTestApp } from './utils.js';

let app: FastifyInstance;

beforeAll(async () => {
  // we use different ports to allow parallel testing
  app = await initTestApp(30001);
});

afterAll(async () => {
  // we close only the fastify app - it will close the database connection via onClose hook automatically
  await app.close();
});

test('list all articles', async () => {
  // mimic the http request via `app.inject()`
  const res = await app.inject({
    method: 'get',
    url: '/article',
  });

  // assert it was successful response
  expect(res.statusCode).toBe(200);

  // with expected shape
  expect(res.json()).toMatchObject({
    items: [
      { author: 1, slug: 'title-13', title: 'title 1/3' },
      { author: 1, slug: 'title-23', title: 'title 2/3' },
      { author: 1, slug: 'title-33', title: 'title 3/3' },
    ],
    total: 3,
  });
});
