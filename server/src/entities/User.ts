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

@ObjectType()
@Entity()
class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[]

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
