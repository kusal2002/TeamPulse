import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { AuthService } from './auth.service.js';
import { Public } from '../common/decorators/public.decorator.js';

class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsIn(['TEAM_MEMBER', 'MANAGER']) role?: 'TEAM_MEMBER' | 'MANAGER';
}

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name, dto.role);
  }

  @Public()
  @Post('login')
  login(@Body(ValidationPipe) dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
