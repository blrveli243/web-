import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    // Token'dan gelen userId ile frontend'den gelen userId'yi karşılaştır
    if (createCommentDto.userId !== req.user.id) {
      throw new ForbiddenException('Başkası adına yorum yapamazsınız');
    }

    return this.commentsService.create(createCommentDto);
  }

  @Get('need/:needId')
  findByNeed(@Param('needId') needId: string) {
    return this.commentsService.findByNeed(+needId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const comment = await this.commentsService.findOne(+id);
    if (!comment) {
      throw new ForbiddenException('Yorum bulunamadı');
    }

    // Sadece yorum sahibi silebilir
    if (comment.user.id !== req.user.id) {
      throw new ForbiddenException('Bu yorumu silemezsiniz');
    }

    return this.commentsService.remove(+id);
  }
}

