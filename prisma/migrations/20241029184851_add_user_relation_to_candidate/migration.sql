/*
  Warnings:

  - Added the required column `userId` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
