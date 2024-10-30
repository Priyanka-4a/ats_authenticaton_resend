/*
  Warnings:

  - You are about to drop the column `userSpecificId` on the `Candidate` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Candidate_userId_userSpecificId_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "userSpecificId";
