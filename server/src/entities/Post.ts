import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import User from './User';
import Updoot from './Updoot';

@ObjectType()
@Entity()
class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	title!: string;

	@Field()
	@Column()
	text!: string;

	@Field()
	@Column({ type: 'int', default: 0 })
	points!: number;

	@Field()
	@Column()
	creatorId: number;

	@OneToMany(() => Updoot, (updoot) => updoot.post)
	updoots: Updoot[];

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => Int, { nullable: true })
	voteStatus: number | null;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}

export default Post;
