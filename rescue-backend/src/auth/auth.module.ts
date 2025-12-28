import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { Comment } from './comments/entities/comment.entity';
import { CommentsService } from './comments/comments.service';
import { CommentsController } from './comments/comments.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Comment]),
    PassportModule,
    JwtModule.register({
      secret: 'gizli_anahtar', // Raporunda bunu çevresel değişken yapacağını belirtebilirsin
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, CommentsService, JwtStrategy],
  controllers: [AuthController, CommentsController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
