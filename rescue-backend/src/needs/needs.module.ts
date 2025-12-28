import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedsService } from './needs.service';
import { NeedsController } from './needs.controller';
import { Need } from './entities/need.entity';
import { Category } from './entities/category.entity';
import { User } from '../auth/entities/user.entity';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need, Category, User]),
    AuthModule,
  ],
  controllers: [NeedsController, CategoriesController],
  providers: [NeedsService, CategoriesService],
})
export class NeedsModule {}
