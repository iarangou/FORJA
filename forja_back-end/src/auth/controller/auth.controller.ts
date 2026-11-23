import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

// El registro público fue retirado. El administrador crea usuarios por /users/create.
