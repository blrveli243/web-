import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { Need } from '../../needs/entities/need.entity';
import { Comment } from '../comments/entities/comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'Victim' })
  role: string;

  // Afetzedenin oluşturduğu talepler
  @OneToMany(() => Need, (need) => need.user)
  myNeeds: Need[];

  // Gönüllünün yardım etmeyi kabul ettiği talepler (Symmetry Fix)
  @ManyToMany(() => Need, (need) => need.volunteers)
  needs: Need[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}