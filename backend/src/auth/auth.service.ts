import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string, role?: 'TEAM_MEMBER' | 'MANAGER') {
    const user = await this.usersService.createUser(email, password, name, role);
    return this.generateToken(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id, user.email, user.role);
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, email, name: '', role }, // You can fetch full user here if needed
    };
  }
}
