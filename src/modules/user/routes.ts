import { FastifyInstance } from 'fastify';
import { initORM } from '../../db.js';
import {EntityData, RequiredEntityData, wrap} from "@mikro-orm/core";
import {Social, User} from "./user.entity.js";
import {getUserFromToken} from "../common/utils.js";
import {z} from "zod";

export async function registerUserRoutes(app: FastifyInstance) {
  const db = await initORM();

  const socialSchema = z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
  });

  const userSchema = z.object({
    email: z.string(),
    fullName: z.string(),
    password: z.string(),
    bio: z.string().optional(),
    social: socialSchema.optional(),
  });

  // register new user
  app.post('/sign-up', async request => {
    const dto = userSchema.parse(request.body);

    if (await db.user.exists(dto.email)) {
      throw new Error('This email is already registered, maybe you want to sign in?');
    }

    // const user = db.user.create(request.body as RequiredEntityData<User>)
    // await db.em.persist(user).flush();

    // thanks to zod, our `dto` is fully typed and passes the `em.create()` checks
    const user = db.user.create(dto);
    await db.em.flush(); // no need for explicit `em.persist()` when we use `em.create()`

    // after flush, we have the `user.id` set
    console.log(`User ${user.id} created`);
    user.token = app.jwt.sign({ id: user.id })
    return user;
  });

  app.post('/sign-in', async request => {
    const { email, password } = request.body as { email: string; password: string };
    const user = await db.user.login(email, password);
    user.token = app.jwt.sign({ id: user.id })
    return user;
  });

  app.get('/profile', async request => {
    const user = getUserFromToken(request);
    return user;
  });

  app.patch('/profile', async request => {
    const user = getUserFromToken(request);
    wrap(user).assign(request.body as User);
    await db.em.flush();
    return user;
  });
}
