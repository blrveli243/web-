import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static'; // <-- EKLENDİ
import { join } from 'path'; // <-- EKLENDİ

import { AuthModule } from './auth/auth.module';
import { NeedsModule } from './needs/needs.module';
import { User } from './auth/entities/user.entity';
import { Need } from './needs/entities/need.entity';
import { Category } from './needs/entities/category.entity';
import { Comment } from './auth/comments/entities/comment.entity';

@Module({
  imports: [
    // 1. SPA (Frontend) Dosyalarını Sunma Ayarı
    // Bu kısım sayfa yenilendiğinde 404 hatası almanı engeller.
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'), // 'public' klasörünü ana dizinde arar
      exclude: ['/api/(.*)'], // /api ile başlayan isteklere dokunmaz (Backend çalışır)
    }),

    // 2. Veritabanı Ayarları
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Need, Category, Comment],
      synchronize: true,
    }),

    // 3. Uygulama Modülleri
    AuthModule,
    NeedsModule,
  ],
})
export class AppModule {}