import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Logger,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { NeedsService } from './needs.service';
import { CreateNeedDto } from './dto/create-need.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('needs')
@UseGuards(JwtAuthGuard)
export class NeedsController {
  private readonly logger = new Logger(NeedsController.name);

  constructor(private readonly needsService: NeedsService) {}

  @Post()
  async create(@Body() createNeedDto: CreateNeedDto, @Request() req) {
    this.logger.log('POST /needs çağrıldı');
    this.logger.log('Gelen veri:', JSON.stringify(createNeedDto));

    // Token'dan gelen userId ile frontend'den gelen userId'yi karşılaştır
    if (createNeedDto.userId !== req.user.id) {
      throw new ForbiddenException('Başkası adına talep oluşturamazsınız');
    }

    try {
      const result = await this.needsService.create(createNeedDto);
      this.logger.log('Talep başarıyla oluşturuldu:', result.id);
      return result;
    } catch (error) {
      this.logger.error('Talep oluşturma hatası:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Request() req) {
    // Eğer kullanıcı Victim rolündeyse sadece kendi taleplerini getir
    if (req.user.role === 'Victim') {
      return this.needsService.findByUserId(req.user.id);
    }
    // Volunteer rolü tüm talepleri görebilir
    return this.needsService.findAll();
  }

  // Spesifik route'lar önce tanımlanmalı (daha spesifik olan önce)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req,
  ) {
    // Sadece Volunteer rolü veya talep sahibi durum güncelleyebilir
    const need = await this.needsService.findOne(+id);
    if (!need) {
      throw new ForbiddenException('Talep bulunamadı');
    }

    if (req.user.role !== 'Volunteer' && need.userId !== req.user.id) {
      throw new ForbiddenException('Bu talebin durumunu güncelleyemezsiniz');
    }

    return this.needsService.updateStatus(+id, status);
  }

  // --- GÜNCELLEME KAPISI ---
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    this.logger.log(`PATCH /needs/${id} çağrıldı`);
    this.logger.log('Gelen veri:', JSON.stringify(body));
    this.logger.log('Kullanıcı ID:', req.user.id);

    // Önce talebi bul
    const need = await this.needsService.findOne(+id);
    if (!need) {
      this.logger.error(`Talep bulunamadı: ${id}`);
      throw new NotFoundException('Talep bulunamadı');
    }

    this.logger.log(`Talep sahibi ID: ${need.userId}, İstek yapan ID: ${req.user.id}`);

    // Sadece talep sahibi güncelleyebilir
    if (need.userId !== req.user.id) {
      this.logger.error(`Yetkisiz güncelleme denemesi: Talep ${id} için kullanıcı ${req.user.id}`);
      throw new ForbiddenException('Bu talebi güncelleyemezsiniz');
    }

    try {
      const result = await this.needsService.update(+id, body);
      this.logger.log(`Talep ${id} başarıyla güncellendi`);
      return result;
    } catch (error) {
      this.logger.error(`Talep güncelleme hatası: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const need = await this.needsService.findOne(+id);
    if (!need) {
      throw new ForbiddenException('Talep bulunamadı');
    }

    // Sadece talep sahibi silebilir
    if (need.userId !== req.user.id) {
      throw new ForbiddenException('Bu talebi silemezsiniz');
    }

    return this.needsService.remove(+id);
  }

  @Post(':id/volunteers')
  async addVolunteer(@Param('id') id: string, @Request() req) {
    // Sadece Volunteer rolü volunteer olarak eklenebilir
    if (req.user.role !== 'Volunteer') {
      throw new ForbiddenException('Sadece gönüllüler yardım edebilir');
    }

    return this.needsService.addVolunteer(+id, req.user.id);
  }

  @Delete(':id/volunteers/:userId')
  async removeVolunteer(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    // Sadece kendi volunteer kaydını silebilir veya talep sahibi
    const need = await this.needsService.findOne(+id);
    if (!need) {
      throw new ForbiddenException('Talep bulunamadı');
    }

    if (req.user.id !== +userId && need.userId !== req.user.id) {
      throw new ForbiddenException('Bu işlemi yapamazsınız');
    }

    return this.needsService.removeVolunteer(+id, +userId);
  }
}
