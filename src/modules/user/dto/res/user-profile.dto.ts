import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: 25, required: false })
  age?: number;

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @ApiProperty({ example: 'Yêu thích cà phê và những buổi chiều thong thả', required: false })
  bio?: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', required: false })
  avatarUrl?: string;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
