import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAvailabilityDto } from './dto/submit-availability.dto';

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
    /**
     * Get a specific match
     */
    async getMatch(matchId: number, userId: number) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: { userA: true, userB: true, availabilities: true }
        });

        if (!match) throw new NotFoundException('Match not found');
        if (match.userAId !== userId && match.userBId !== userId) {
            throw new BadRequestException('Not your match');
        }

        return match;
    }

    /**
     * Submit availability for a match
     */
    async submitAvailability(userId: number, matchId: number, dto: SubmitAvailabilityDto) {
        const match = await this.prisma.match.findUnique({ where: { id: matchId } });
        if (!match) throw new NotFoundException('Match not found');

        const isUserA = match.userAId === userId;
        const isUserB = match.userBId === userId;

        if (!isUserA && !isUserB) {
            throw new BadRequestException('Bản lưu match này không thuộc về bạn.');
        }

        // Xóa các availability cũ của user này trong match
        await this.prisma.availability.deleteMany({
            where: { matchId, userId }
        });

        // Thêm các khoảng rảnh mới
        if (dto.slots && dto.slots.length > 0) {
            await this.prisma.availability.createMany({
                data: dto.slots.map(s => ({
                    matchId,
                    userId,
                    date: new Date(s.date),
                    startTime: new Date(s.startTime),
                    endTime: new Date(s.endTime)
                }))
            });
        }

        // Đánh dấu đã submit
        await this.prisma.match.update({
            where: { id: matchId },
            data: {
                ...(isUserA ? { userAAvailabilitySubmitted: true } : {}),
                ...(isUserB ? { userBAvailabilitySubmitted: true } : {})
            }
        });

        // Kiểm tra xem cả hai đã submit chưa
        const updatedMatch = await this.prisma.match.findUnique({ where: { id: matchId } });
        if (updatedMatch && updatedMatch.userAAvailabilitySubmitted && updatedMatch.userBAvailabilitySubmitted) {
            return await this.checkAndFindCommonSlot(matchId);
        }

        return { message: 'Đã lưu thời gian rảnh. Đang chờ đối phương chọn...', match: updatedMatch };

        return { message: 'Đã lưu thời gian rảnh. Đang chờ đối phương chọn...', match: updatedMatch };
    }

    /**
     * Find a common slot and update dateScheduledAt
     */
    async checkAndFindCommonSlot(matchId: number) {
        const match = await this.prisma.match.findUnique({ where: { id: matchId } });
        if (!match) return;

        const availabilities = await this.prisma.availability.findMany({
            where: { matchId },
            orderBy: { startTime: 'asc' }
        });

        const userAAvails = availabilities.filter(a => a.userId === match.userAId);
        const userBAvails = availabilities.filter(a => a.userId === match.userBId);

        let commonSlot: Date | null = null;
        for (const a of userAAvails) {
            for (const b of userBAvails) {
                // Kiểm tra cùng ngày
                if (a.date.getTime() !== b.date.getTime()) continue;

                const startA = a.startTime.getTime();
                const endA = a.endTime.getTime();
                const startB = b.startTime.getTime();
                const endB = b.endTime.getTime();

                // overlap: max(startA, startB) < min(endA, endB)
                const overlapStart = Math.max(startA, startB);
                const overlapEnd = Math.min(endA, endB);

                // Nếu có khoảng trùng ít nhất 30 phút (tùy chỉnh nếu cần), hoặc chỉ cần trùng
                if (overlapStart < overlapEnd) {
                    commonSlot = new Date(overlapStart);
                    break;
                }
            }
            if (commonSlot) break;
        }

        if (commonSlot) {
            await this.prisma.match.update({
                where: { id: matchId },
                data: { dateScheduledAt: commonSlot }
            });
            return {
                isCommonSlotFound: true,
                message: `Hai bạn có date hẹn vào: ${commonSlot.toLocaleString()}`,
                dateScheduledAt: commonSlot
            };
        } else {
            // Reset status để họ chọn lại
            await this.prisma.match.update({
                where: { id: matchId },
                data: {
                    userAAvailabilitySubmitted: false,
                    userBAvailabilitySubmitted: false,
                    dateScheduledAt: null,
                }
            });
            await this.prisma.availability.deleteMany({ where: { matchId } });

            return {
                isCommonSlotFound: false,
                message: 'Chưa tìm được thời gian trùng. Vui lòng chọn lại.',
                dateScheduledAt: null
            };
        }
    }
}
