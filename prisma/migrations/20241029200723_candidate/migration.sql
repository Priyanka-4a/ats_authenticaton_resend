/*
  Warnings:

  - A unique constraint covering the columns `[userId,userSpecificId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userSpecificId` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "userSpecificId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_userId_userSpecificId_key" ON "Candidate"("userId", "userSpecificId");
