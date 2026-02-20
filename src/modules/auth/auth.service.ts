import {
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/index';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        passwordHash: hashedPassword,
        isVerified: true, // Auto-verify for simple demo
      },
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new ForbiddenException('Email hoặc mật khẩu không đúng');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ForbiddenException('Email hoặc mật khẩu không đúng');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Tài khoản chưa được xác thực');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
        age: user.age || undefined,
        gender: user.gender || undefined,
        bio: user.bio || undefined,
      },
      tokens,
    };
  }

  async refreshTokens(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION_TIME', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION_TIME', '7d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
