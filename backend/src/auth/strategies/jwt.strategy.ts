import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(ConfigService) config?: ConfigService) {
    const secret = config?.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'default-secret-key',
    });
  }

  // This method returns the payload that will be attached to req.user
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
