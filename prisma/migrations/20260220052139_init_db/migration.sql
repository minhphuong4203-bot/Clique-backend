/*
  Warnings:

  - The values [UNSET] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - The values [LEARNER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dob` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `streakDays` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Attempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttemptDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExerciseOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Flashcard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PronunciationScore` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sentence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SentenceImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StreakLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `XPLog` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `isVerified` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."LikeStatus" AS ENUM ('LIKED', 'PASSED');

-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('PENDING', 'MATCHED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Gender_new" AS ENUM ('MALE', 'FEMALE', 'OTHER');
ALTER TABLE "public"."User" ALTER COLUMN "gender" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "gender" TYPE "public"."Gender_new" USING ("gender"::text::"public"."Gender_new");
ALTER TYPE "public"."Gender" RENAME TO "Gender_old";
ALTER TYPE "public"."Gender_new" RENAME TO "Gender";
DROP TYPE "public"."Gender_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Attempt" DROP CONSTRAINT "Attempt_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attempt" DROP CONSTRAINT "Attempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttemptDetail" DROP CONSTRAINT "AttemptDetail_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttemptDetail" DROP CONSTRAINT "AttemptDetail_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttemptDetail" DROP CONSTRAINT "AttemptDetail_selectedOption2Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttemptDetail" DROP CONSTRAINT "AttemptDetail_selectedOptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatHistory" DROP CONSTRAINT "ChatHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Exercise" DROP CONSTRAINT "Exercise_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExerciseOption" DROP CONSTRAINT "ExerciseOption_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Flashcard" DROP CONSTRAINT "Flashcard_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LearningProgress" DROP CONSTRAINT "LearningProgress_flashcardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LearningProgress" DROP CONSTRAINT "LearningProgress_sentenceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LearningProgress" DROP CONSTRAINT "LearningProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PronunciationScore" DROP CONSTRAINT "PronunciationScore_attemptDetailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sentence" DROP CONSTRAINT "Sentence_sentenceImageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SentenceImage" DROP CONSTRAINT "SentenceImage_topicId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StreakLog" DROP CONSTRAINT "StreakLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."XPLog" DROP CONSTRAINT "XPLog_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "dob",
DROP COLUMN "grade",
DROP COLUMN "streakDays",
DROP COLUMN "xp",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bio" TEXT,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "gender" DROP DEFAULT,
ALTER COLUMN "role" SET DEFAULT 'USER',
ALTER COLUMN "isVerified" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Attempt";

-- DropTable
DROP TABLE "public"."AttemptDetail";

-- DropTable
DROP TABLE "public"."ChatHistory";

-- DropTable
DROP TABLE "public"."Exercise";

-- DropTable
DROP TABLE "public"."ExerciseOption";

-- DropTable
DROP TABLE "public"."Flashcard";

-- DropTable
DROP TABLE "public"."LearningProgress";

-- DropTable
DROP TABLE "public"."Lesson";

-- DropTable
DROP TABLE "public"."PronunciationScore";

-- DropTable
DROP TABLE "public"."Sentence";

-- DropTable
DROP TABLE "public"."SentenceImage";

-- DropTable
DROP TABLE "public"."StreakLog";

-- DropTable
DROP TABLE "public"."Topic";

-- DropTable
DROP TABLE "public"."XPLog";

-- DropEnum
DROP TYPE "public"."ExerciseType";

-- DropEnum
DROP TYPE "public"."GradeLevel";

-- DropEnum
DROP TYPE "public"."LearningContentType";

-- DropEnum
DROP TYPE "public"."LessonStatus";

-- DropEnum
DROP TYPE "public"."MediaType";

-- DropEnum
DROP TYPE "public"."XPSource";

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" SERIAL NOT NULL,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "status" "public"."LikeStatus" NOT NULL DEFAULT 'LIKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" SERIAL NOT NULL,
    "userAId" INTEGER NOT NULL,
    "userBId" INTEGER NOT NULL,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'MATCHED',
    "userAAvailabilitySubmitted" BOOLEAN NOT NULL DEFAULT false,
    "userBAvailabilitySubmitted" BOOLEAN NOT NULL DEFAULT false,
    "dateScheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Availability" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Like_fromUserId_idx" ON "public"."Like"("fromUserId");

-- CreateIndex
CREATE INDEX "Like_toUserId_idx" ON "public"."Like"("toUserId");

-- CreateIndex
CREATE INDEX "Like_toUserId_status_idx" ON "public"."Like"("toUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Like_fromUserId_toUserId_key" ON "public"."Like"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "Match_userAId_idx" ON "public"."Match"("userAId");

-- CreateIndex
CREATE INDEX "Match_userBId_idx" ON "public"."Match"("userBId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "public"."Match"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userAId_userBId_key" ON "public"."Match"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "Availability_matchId_userId_idx" ON "public"."Availability"("matchId", "userId");

-- CreateIndex
CREATE INDEX "Availability_matchId_idx" ON "public"."Availability"("matchId");

-- CreateIndex
CREATE INDEX "Availability_userId_idx" ON "public"."Availability"("userId");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
