import { Field, Int, ObjectType } from 'type-graphql';
import {
	Entity,
	CreateDateColumn,
	UpdateDateColumn,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
  OneToMany,
} from 'typeorm';
import Post from './Post';
import Updoot from './Updoot';

@ObjectType()
@Entity()
class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[]

  @OneToMany(() => Updoot, updoot => updoot.user)
  updoots: Updoot[]

	@Field()
	@Column({ unique: true })
	username!: string;

	@Field()
	@Column({ unique: true })
	email!: string;

	@Column()
	password!: string;

  @Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}

export default User;
