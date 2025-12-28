import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: any): Promise<any> {
    return await this.authService.register(userData);
  }

  @Post('login')
  async login(
    @Body() loginData: any,
  ): Promise<{ access_token: string; role: string }> {
    return await this.authService.login(loginData);
  }
} // <--- Bu parantezin doğru kapandığından emin ol!
