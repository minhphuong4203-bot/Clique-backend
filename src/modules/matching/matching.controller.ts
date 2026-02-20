import { Controller, Post, Get, Param, ParseIntPipe, UseGuards, Req, Body, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitAvailabilityDto } from './dto/submit-availability.dto';

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

    @Get('matches/:matchId')
    @ApiOperation({ summary: 'Get a specific match details' })
    async getMatch(
        @Req() req: any,
        @Param('matchId', ParseIntPipe) matchId: number
    ) {
        return this.matchingService.getMatch(matchId, req.user.id);
    }

    @Post('matches/:matchId/availability')
    @ApiOperation({ summary: 'Submit availability times for a match' })
    async submitAvailability(
        @Req() req: any,
        @Param('matchId', ParseIntPipe) matchId: number,
        @Body() dto: SubmitAvailabilityDto
    ) {
        return this.matchingService.submitAvailability(req.user.id, matchId, dto);
    }

    @Put('availability/:id')
    @ApiOperation({ summary: 'Update a specific availability slot' })
    async updateAvailability(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SubmitAvailabilityDto
    ) {
        // Here we can re-use SubmitAvailabilityDto or a part of it.
        // For simplicity, we assume we update one slot at a time, but the dto expects an array.
        // Wait, if it's one slot, the DTO could just be the start/end time, or we can use the same array but just take the first element.
        // Let's create an inline type or just use any for now to keep it simple, or define it in service.
        return this.matchingService.updateAvailability(req.user.id, id, dto);
    }

    @Delete('availability/:id')
    @ApiOperation({ summary: 'Delete a specific availability slot' })
    async deleteAvailability(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.matchingService.deleteAvailability(req.user.id, id);
    }
}
