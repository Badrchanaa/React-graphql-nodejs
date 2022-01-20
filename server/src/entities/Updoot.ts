import {
	Entity,
	BaseEntity,
  ManyToOne,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import User from './User';
import Post from './Post';

@ObjectType()
@Entity()
class Updoot extends BaseEntity {

  @Field()
  @Column({type: 'int'})
  value: number

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.updoots)
  user: User;

  @Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.updoots)
  post: Post;

}

export default Updoot;
