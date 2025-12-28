import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Category } from './category.entity';
import { Comment } from '../../auth/comments/entities/comment.entity';

@Entity()
export class Need {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: 'Açık' })
  status: string;

  @Column()
  userId: number; // Frontend süzgeci için gerekli alan

  // Gereksinim: User ve Need arasında Bire Çok ilişki [cite: 8]
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  // Gereksinim: Need ve Comment arasında Bire Çok ilişki [cite: 7, 8]
  @OneToMany(() => Comment, (comment) => comment.need)
  comments: Comment[];

  // Gereksinim: Gönüllüler ve Talepler arasında Çoka Çok ilişki [cite: 9]
  @ManyToMany(() => User, (user) => user.needs)
  @JoinTable()
  volunteers: User[];

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.id)
  category: Category;
}
