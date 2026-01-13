import {Entity, PrimaryKey, Property, TextType} from '@mikro-orm/core';

@Entity()
export class User {

  @PrimaryKey()
  id!: number;

  @Property()
  fullName!: string;

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property({ type: TextType })
  bio = '';

}
