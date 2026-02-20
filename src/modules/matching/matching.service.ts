import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchingService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Send a like to another user.
     * If they already liked the current user, it creates a Match.
     */
    async likeUser(fromUserId: number, toUserId: number) {
        if (fromUserId === toUserId) {
            throw new BadRequestException('Bạn không thể tự like bản thân.');
        }

        const targetUser = await this.prisma.user.findUnique({ where: { id: toUserId } });
        if (!targetUser) {
            throw new NotFoundException('Không tìm thấy người dùng này.');
        }

        // Check if like already exists
        const existingLike = await this.prisma.like.findUnique({
            where: {
                fromUserId_toUserId: { fromUserId, toUserId },
            },
        });

        if (existingLike) {
            throw new BadRequestException('Bạn đã tương tác với người dùng này rồi.');
        }

        // Create the like
        await this.prisma.like.create({
            data: {
                fromUserId,
                toUserId,
                status: 'LIKED',
            },
        });

        // Check if the target user has already liked the current user
        const reciprocalLike = await this.prisma.like.findUnique({
            where: {
                fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId },
            },
        });

        if (reciprocalLike && reciprocalLike.status === 'LIKED') {
            // Create a match
            // Ensure userAId is always the smaller ID
            const userAId = Math.min(fromUserId, toUserId);
            const userBId = Math.max(fromUserId, toUserId);

            // Check if match already exists (just in case)
            let match = await this.prisma.match.findUnique({
                where: { userAId_userBId: { userAId, userBId } },
            });

            if (!match) {
                match = await this.prisma.match.create({
                    data: {
                        userAId,
                        userBId,
                        status: 'MATCHED',
                    },
                });
            }

            return {
                isMatch: true,
                message: 'It\'s a Match!',
                match,
            };
        }

        return {
            isMatch: false,
            message: 'Đã gửi Like thành công.',
        };
    }

    /**
     * Get all matched profiles for the current user
     */
    async getMyMatches(userId: number) {
        const matches = await this.prisma.match.findMany({
            where: {
                OR: [{ userAId: userId }, { userBId: userId }],
                status: 'MATCHED',
            },
            include: {
                userA: {
                    select: { id: true, name: true, avatarUrl: true, age: true, gender: true, bio: true }
                },
                userB: {
                    select: { id: true, name: true, avatarUrl: true, age: true, gender: true, bio: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map matches to just return the profile of the *other* person
        return matches.map(match => {
            const otherUser = match.userAId === userId ? match.userB : match.userA;
            return {
                matchId: match.id,
                matchedAt: match.createdAt,
                profile: otherUser,
            };
        });
    }

    /**
     * Get IDs of users that the current user has already liked
     */
    async getMyLikes(userId: number) {
        const likes = await this.prisma.like.findMany({
            where: { fromUserId: userId },
            select: { toUserId: true }
        });
        return likes.map(like => like.toUserId);
    }
}
