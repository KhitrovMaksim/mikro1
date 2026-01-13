/**
 * Initializing the ORM
 */

import { MikroORM } from '@mikro-orm/sqlite'; // or any other driver package
import { wrap } from '@mikro-orm/core';

// initialize the ORM, loading the config file dynamically
import config from './mikro-orm.config.js';
import { User } from "./modules/user/user.entity.js";


const orm = await MikroORM.init(config);
const em = orm.em.fork(); // fork
await orm.schema.refreshDatabase(); // it will first drop the schema if it already exists and create it from scratch based on entity definition (metadata).


/**
 * Persist and Flush
 */

// create new user entity instance
const user = new User();
user.email = 'foo@bar.com';
user.fullName = 'Foo Bar';
user.password = '123456';

// first mark the entity with `persist()`, then `flush()`
em.persist(user);
await em.persist(user).flush();


/**
 * Fetching Entities
 */

// user entity is now managed, if we try to find it again, we get the same reference
const myUser = await em.findOne(User, user.id);
console.log('users are the same?', user === myUser)

// modifying the user and flushing yields update queries
user.bio = '...';
await em.flush();

// after the entity is flushed, it becomes managed, and has the PK available
console.log('user id is:', user.id);

// now try to create a new fork, does not matter if from `orm.em` or our existing `em` fork, as by default we get a clean one
const em2 = em.fork();
console.log('verify the EM ids are different:', em.id, em2.id);
const myUser2 = await em2.findOneOrFail(User, user.id);
console.log('users are no longer the same, as they came from different EM:', user === myUser2);


/**
 * Refreshing loaded entities
 */

// change the user
myUser2.bio = 'changed';

// reload user with `em.refresh()`
await em2.refresh(myUser2);
console.log('changes are lost', myUser2);

// let's try again
myUser2!.bio = 'some change, will be saved';
await em2.flush();

/**
 * Removing entities
 */

const myUser3 = new User();
user.email = 'foo3@bar.com';
user.fullName = 'Foo3 Bar';
user.password = '654321';

// finally, remove the entity
await em2.remove(myUser3!).flush();

/**
 * Entity references
 */

const userRef = em.getReference(User, 1);
await em.remove(userRef).flush();

/**
 * Entity state and WrappedEntity
 */

const myUser4 = new User();
myUser4.email = 'foo4@bar.com';
myUser4.fullName = 'Foo4 Bar';
myUser4.password = '123456';

// first mark the entity with `persist()`, then `flush()`
em.persist(myUser4);
await em.persist(myUser4).flush();
const em3 = em.fork();

const userRef2 = em3.getReference(User, 2);
console.log('userRef is initialized:', wrap(userRef2).isInitialized());
console.log('userRef:', userRef2);

await wrap(userRef2).init();
console.log('userRef is initialized:', wrap(userRef2).isInitialized());
console.log('userRef:', userRef2);
