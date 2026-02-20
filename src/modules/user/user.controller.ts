import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
  Query,
  Put,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileDto, UpdateProfileDto, ChangePasswordDto } from './dto/index';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // ─── GET ALL ─────────────────────────────────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user profiles' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [UserProfileDto] })
  async getAllUsers(@Query('isActive') isActive?: boolean) {
    return this.userService.findAll(isActive);
  }

  // ─── GET ME ───────────────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async getCurrentUser(@Req() req: any) {
    return this.userService.findById(req.user.id);
  }

  // ─── GET BY ID ────────────────────────────────────────────────────────────────
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.findById(id);
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update current user profile (name, age, gender, bio, avatar)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer', minimum: 18, maximum: 99 },
        gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
        bio: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async updateCurrentUserProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.userService.updateProfile(req.user.id, updateProfileDto, avatar);
  }

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200 })
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }
}
