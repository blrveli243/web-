import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Need } from './need.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Need, (need) => need.category)
  needs: Need[]; // 1:N İlişkisi [cite: 8]
}
