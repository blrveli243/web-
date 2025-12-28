import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; // Bunu ekle
import { NeedsModule } from './needs/needs.module'; // Bunu ekle
import { User } from './auth/entities/user.entity';
import { Need } from './needs/entities/need.entity';
import { Category } from './needs/entities/category.entity';
import { Comment } from './auth/comments/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Need, Category, Comment],
      synchronize: true,
    }),
    AuthModule, // SİSTEME TANIT
    NeedsModule, // SİSTEME TANIT
  ],
})
export class AppModule {}