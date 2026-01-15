import {afterAll, beforeAll, expect, test} from 'vitest';
import {FastifyInstance} from 'fastify';
import {initTestApp} from './utils.js';

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
  // expect(res.json()).toMatchObject({
  //   items: [
  //     {
  //       slug: expect.any(String),
  //       title: 'title 1/3',
  //       description: 'desc 1/3',
  //       tags: ['foo1', 'foo2'],
  //       authorName: 'Foo Bar',
  //       totalComments: 2,
  //     },
  //     {
  //       slug: expect.any(String),
  //       title: 'title 2/3',
  //       description: 'desc 2/3',
  //       tags: ['foo2'],
  //       authorName: 'Foo Bar',
  //       totalComments: 1,
  //     },
  //     {
  //       slug: expect.any(String),
  //       title: 'title 3/3',
  //       description: 'desc 3/3',
  //       tags: ['foo2', 'foo3'],
  //       authorName: 'Foo Bar',
  //       totalComments: 3,
  //     },
  //   ],
  //   total: 3,
  // });
});
