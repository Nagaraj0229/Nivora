import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly users: Model<User>, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async register(input: RegisterDto) {
    const email = input.email.toLowerCase().trim();
    if (await this.users.exists({ email })) throw new ConflictException('An account with this email already exists.');
    const user = await this.users.create({ name: input.name, email, phone: input.phone, passwordHash: await bcrypt.hash(input.password, 12) });
    return this.issue(user);
  }

  async login(input: LoginDto) {
    const user = await this.users.findOne({ email: input.email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new UnauthorizedException('Email or password is incorrect.');
    return this.issue(user);
  }

  private async issue(user: any) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role, societyId: user.societyId };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken, tokenType: 'Bearer', expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '1d'), user: { id: payload.sub, name: user.name, email: user.email, role: user.role, societyId: user.societyId } };
  }
}
