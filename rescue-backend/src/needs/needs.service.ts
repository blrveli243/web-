import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Need } from './entities/need.entity';
import { Category } from './entities/category.entity';
import { User } from '../auth/entities/user.entity';
import { CreateNeedDto } from './dto/create-need.dto';

@Injectable()
export class NeedsService implements OnModuleInit {
  constructor(
    @InjectRepository(Need) private needsRepository: Repository<Need>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.categoryRepository.count();
    if (count === 0) {
      await this.categoryRepository.save({ name: 'Genel Yardım' });
    }
  }

  async create(createNeedDto: CreateNeedDto) {
    // Eğer categoryId gönderilmemişse, varsayılan kategoriyi (Genel Yardım) kullan
    if (!createNeedDto.categoryId) {
      const defaultCategory = await this.categoryRepository.findOne({
        where: { name: 'Genel Yardım' },
      });
      if (defaultCategory) {
        createNeedDto.categoryId = defaultCategory.id;
      } else {
        // Eğer varsayılan kategori yoksa oluştur
        const newCategory = await this.categoryRepository.save({
          name: 'Genel Yardım',
        });
        createNeedDto.categoryId = newCategory.id;
      }
    }

    const newNeed = this.needsRepository.create(createNeedDto);
    return await this.needsRepository.save(newNeed);
  }

  async findAll() {
    return await this.needsRepository.find({
      relations: ['user', 'category', 'volunteers'],
      order: { id: 'DESC' },
    });
  }

  async findByUserId(userId: number) {
    return await this.needsRepository.find({
      where: { userId },
      relations: ['user', 'category', 'volunteers'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.needsRepository.findOne({
      where: { id },
      relations: ['user', 'category', 'volunteers'],
    });
  }

  async updateStatus(id: number, status: string) {
    const need = await this.needsRepository.findOne({ where: { id } });
    if (!need) throw new NotFoundException('Talep bulunamadı.');
    need.status = status;
    return await this.needsRepository.save(need);

  }// --- GENEL GÜNCELLEME FONKSİYONU ---
  async update(id: number, attrs: any) {
    const need = await this.findOne(id);
    if (!need) {
      throw new NotFoundException('Talep bulunamadı.');
    }
    // Gelen yeni verileri (attrs) mevcut verinin (need) üstüne yaz
    Object.assign(need, attrs);
    return this.needsRepository.save(need);
  }

  async remove(id: number) {
    const need = await this.needsRepository.findOne({ where: { id } });
    if (!need) throw new NotFoundException('Talep bulunamadı.');
    return await this.needsRepository.remove(need);
  }

  async addVolunteer(needId: number, userId: number) {
    const need = await this.needsRepository.findOne({
      where: { id: needId },
      relations: ['volunteers'],
    });
    if (!need) {
      throw new NotFoundException('Talep bulunamadı');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Zaten volunteer olarak ekli mi kontrol et
    if (need.volunteers.some((v) => v.id === userId)) {
      return need; // Zaten ekli
    }

    need.volunteers.push(user);
    return await this.needsRepository.save(need);
  }

  async removeVolunteer(needId: number, userId: number) {
    const need = await this.needsRepository.findOne({
      where: { id: needId },
      relations: ['volunteers'],
    });
    if (!need) {
      throw new NotFoundException('Talep bulunamadı');
    }

    need.volunteers = need.volunteers.filter((v) => v.id !== userId);
    return await this.needsRepository.save(need);
  }
}
