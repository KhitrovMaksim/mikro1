import { EntityManager, EntityRepository, MikroORM, Options } from '@mikro-orm/sqlite';
import {Article} from "./modules/article/article.entity.js";
import {Comment} from "./modules/article/comment.entity.js";
import {User} from "./modules/user/user.entity.js";
import {Tag} from "./modules/article/tag.entity.js";
import {UserRepository} from "./modules/user/user.repository.js";

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  user: UserRepository;
  article: EntityRepository<Article>;
  comment: EntityRepository<Comment>;
  tag: EntityRepository<Tag>;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
  if (cache) {
    return cache;
  }

  const orm = await MikroORM.init(options);

  // save to cache before returning
  return cache = {
    orm,
    em: orm.em,
    user: orm.em.getRepository(User),
    article: orm.em.getRepository(Article),
    comment: orm.em.getRepository(Comment),
    tag: orm.em.getRepository(Tag),
  };
}
