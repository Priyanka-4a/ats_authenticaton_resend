-- DropTable if exists for Resume
DROP TABLE IF EXISTS "Resume" CASCADE;

-- DropTable if exists for ATS_Score
DROP TABLE IF EXISTS "ATS_Score" CASCADE;

-- CreateTable for Resume
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "Resumefilename" TEXT NOT NULL,
    "ResumefileUrl" TEXT NOT NULL,
    "JobDescriptionfileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable for ATS_Score
CREATE TABLE "ATS_Score" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" INTEGER NOT NULL,
    "resumeId" INTEGER NOT NULL, -- Adding resumeId as a foreign key

    CONSTRAINT "ATS_Score_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey for candidateId in Resume table
ALTER TABLE "Resume" 
ADD CONSTRAINT "Resume_candidateId_fkey" 
FOREIGN KEY ("candidateId") 
REFERENCES "Candidate"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- AddForeignKey for candidateId in ATS_Score table
ALTER TABLE "ATS_Score" 
ADD CONSTRAINT "ATS_Score_candidateId_fkey" 
FOREIGN KEY ("candidateId") 
REFERENCES "Candidate"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- AddForeignKey for resumeId in ATS_Score table
ALTER TABLE "ATS_Score" 
ADD CONSTRAINT "ATS_Score_resumeId_fkey" 
FOREIGN KEY ("resumeId") 
REFERENCES "Resume"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

