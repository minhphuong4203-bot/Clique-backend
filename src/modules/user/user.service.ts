import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { UpdateProfileDto, ChangePasswordDto } from './dto/index';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  age: true,
  gender: true,
  bio: true,
  avatarUrl: true,
  role: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(isActive?: boolean) {
    const where: Prisma.UserWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: USER_SELECT,
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateStatus(id: number, isActive: boolean) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: USER_SELECT,
    });
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Không thể xác thực người dùng');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { success: true, message: 'Đổi mật khẩu thành công' };
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'clique/avatars',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException(`Upload thất bại: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new BadRequestException('Upload thất bại'));
          }
        },
      );

      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async updateProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
    avatarFile?: Express.Multer.File,
  ) {
    await this.findById(id);

    const updateData: Prisma.UserUpdateInput = {};

    if (updateProfileDto.name !== undefined) updateData.name = updateProfileDto.name;
    if (updateProfileDto.age !== undefined) updateData.age = updateProfileDto.age;
    if (updateProfileDto.gender !== undefined) updateData.gender = updateProfileDto.gender;
    if (updateProfileDto.bio !== undefined) updateData.bio = updateProfileDto.bio;

    if (avatarFile) {
      updateData.avatarUrl = await this.uploadToCloudinary(avatarFile);
    } else if (updateProfileDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateProfileDto.avatarUrl;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });
  }
}
