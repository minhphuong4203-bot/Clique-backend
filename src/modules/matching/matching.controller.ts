import { Controller, Post, Get, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    @Post('like/:userId')
    @ApiOperation({ summary: 'Send a Like to a user' })
    @ApiResponse({ status: 201, description: 'Like sent, might result in a Match' })
    async likeUser(
        @Req() req: any,
        @Param('userId', ParseIntPipe) toUserId: number
    ) {
        return this.matchingService.likeUser(req.user.id, toUserId);
    }

    @Get('likes')
    @ApiOperation({ summary: 'Get list of user IDs that current user has liked' })
    async getMyLikes(@Req() req: any) {
        return this.matchingService.getMyLikes(req.user.id);
    }

    @Get('matches')
    @ApiOperation({ summary: 'Get all matched profiles for current user' })
    async getMyMatches(@Req() req: any) {
        return this.matchingService.getMyMatches(req.user.id);
    }
}
