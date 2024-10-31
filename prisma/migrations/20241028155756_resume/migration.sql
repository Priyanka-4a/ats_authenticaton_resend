-- DropForeignKey
ALTER TABLE "ATS_Score" DROP CONSTRAINT "ATS_Score_resumeId_fkey";

-- AddForeignKey
ALTER TABLE "ATS_Score" ADD CONSTRAINT "ATS_Score_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
