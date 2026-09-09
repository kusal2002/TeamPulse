import { Body, Controller, Get, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
}

class UpdatePasswordDto {
  @IsString() currentPassword?: string;
  @IsString() @MinLength(6) newPassword?: string;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getUserProfile(user.id);
  }

  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  getUserDetail(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/password')
  updatePassword(
    @CurrentUser() user: any,
    @Body(ValidationPipe) dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(user.id, dto);
  }
}
