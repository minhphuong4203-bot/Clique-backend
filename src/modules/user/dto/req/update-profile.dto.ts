import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 25, minimum: 18, maximum: 99, required: false })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(99)
  age?: number;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 'Yêu thích cà phê và những buổi chiều thong thả', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'https://...', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
