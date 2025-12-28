import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    // HATALI YER BURASIYDI: Repository<Repository<User>> kısmını düzelttik
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role ?? 'Victim',
    });

    const savedUser = await this.userRepository.save(newUser);

    // Şifreyi güvenlik için geri dönüşten çıkarıyoruz
    const { password, ...result } = savedUser;
    return result;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{
    access_token: string;
    role: string;
    id: number;
    email: string;
  }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Frontend'in (VictimDashboard) beklediği id'yi burada ekledik
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      id: user.id, // BU SATIR ŞART!
      email: user.email,
    };
  }
}
