/**
 * Initializing the ORM
 */

import {LoadStrategy, MikroORM} from '@mikro-orm/sqlite'; // or any other driver package
import { wrap } from '@mikro-orm/core';

// initialize the ORM, loading the config file dynamically
import config from './mikro-orm.config.js';
import { User } from "./modules/user/user.entity.js";
import { Article } from "./modules/article/article.entity.js";
import {Tag} from "./modules/article/tag.entity.js";


const orm = await MikroORM.init(config);
const em = orm.em.fork(); // fork
await orm.schema.refreshDatabase(); // it will first drop the schema if it already exists and create it from scratch based on entity definition (metadata).


/**
 * Persist and Flush
 */

// create new user entity instance
const user = new User('Foo Bar', 'foo@bar.com', '123456');

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

const myUser3 = new User('Foo Bar', 'foo3@bar.com', '123456');

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

const myUser4 = new User('Foo Bar', 'foo4@bar.com', '123456');

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

/**
 * Working with relations
 */

// create new user entity instance via constructor
const myUser5 = new User('Foo Bar', 'foo5@bar.com', '123456');

// fork first to have a separate context
const em4 = orm.em.fork();

// first mark the entity with `persist()`, then `flush()`
await em4.persist(myUser5).flush();

// clear the context to simulate fresh request
em4.clear();

// create the article instance
const article = em4.create(Article, {
  title: 'Foo is Bar',
  text: 'Lorem impsum dolor sit amet',
  author: myUser5.id,
});

// `em.create` calls `em.persist` automatically, so flush is enough
await em4.flush();
console.log(article);
console.log('it really is a User', article.author instanceof User); // true
console.log('but not initialized', wrap(article.author).isInitialized()); // false
console.log('article.author', article.author); // { id: 3 }
em4.clear();

/**
 * Populating relationships
 */

// find article by id and populate its author
const articleWithAuthor = await em4.findOne(Article, article.id, { populate: ['author'] });
console.log({articleWithAuthor});

await em4.populate(articleWithAuthor!, ['text']);
console.log({articleWithAuthor});

em4.clear();

/**
 * Loading strategies
 * (loading strategy globally via loadStrategy option in the ORM config.)
 */

const articleWithAuthorJoined = await em4.findOne(Article, article.id, {
  populate: ['author', 'text'],
  strategy: LoadStrategy.JOINED,
});

console.log({articleWithAuthorJoined});

/**
 * Serialization
 */

const myUser6 = new User('Foo Bar', 'foo@bar.com', '123456');
console.log(myUser6);


/**
 * Closing the ORM
 */

// clear the context to simulate fresh request
em.clear();

// populating User.articles collection
const foundUser = await em.findOneOrFail(User, 3, { populate: ['articles'] });
console.log(foundUser);

// or you could lazy load the collection later via `init()` method
if (!foundUser.articles.isInitialized()) {
  await foundUser.articles.init();
}

// to ensure collection is loaded (but do nothing if it already is), use `loadItems()` method
await foundUser.articles.loadItems();

for (const userArticle of foundUser.articles) {
  console.log(userArticle.title);
  console.log(userArticle.author.fullName); // the `article.author` is linked automatically thanks to the Identity Map
}

// create some tags and assign them to the first article
const [userArticle] = foundUser.articles;
const newTag = em.create(Tag, { name: 'new' });
const oldTag = em.create(Tag, { name: 'old' });
userArticle.tags.add(newTag, oldTag);
await em.flush();
console.log(userArticle.tags);

// to remove items from collection, we first need to initialize it, we can use `init()`, `loadItems()` or `em.populate()`
await em.populate(userArticle, ['tags']);

// remove 'old' tag by reference
userArticle.tags.remove(oldTag);

// or via callback
userArticle.tags.remove(t => t.id === oldTag.id);

await em.flush();

await orm.close();
