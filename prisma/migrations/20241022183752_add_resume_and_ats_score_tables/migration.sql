-- DropTable if exists for Resume
DROP TABLE IF EXISTS "Resume" CASCADE;

-- DropTable if exists for Generated_Resume
DROP TABLE IF EXISTS "Generated_Resume" CASCADE;

-- DropTable if exists for ATS_Score
DROP TABLE IF EXISTS "ATS_Score" CASCADE;

-- DropTable if exists for Generated_ATS_Score
DROP TABLE IF EXISTS "Generated_ATS_Score" CASCADE;

-- CreateTable for Resume
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "Resumefilename" TEXT NOT NULL,
    "ResumefileUrl" TEXT NOT NULL,
    "JobDescriptionfileUrl" TEXT NULL,
    "JobDescription" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" INTEGER NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Generated_Resume
CREATE TABLE "Generated_Resume" (
    "id" SERIAL NOT NULL,
    "Resumefilename" TEXT NOT NULL,
    "ResumefileUrl" TEXT NOT NULL,
    "JobDescription" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" INTEGER NOT NULL,
    "resumeId" INTEGER NOT NULL,

    CONSTRAINT "Generated_Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable for ATS_Score
CREATE TABLE "ATS_Score" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" INTEGER NOT NULL,
    "resumeId" INTEGER NOT NULL, 

    CONSTRAINT "ATS_Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable for Generated_ATS_Score
CREATE TABLE "Generated_ATS_Score" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" INTEGER NOT NULL,
    "generatedResumeId" INTEGER NOT NULL,

    CONSTRAINT "Generated_ATS_Score_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey for candidateId in Resume table
ALTER TABLE "Resume" 
ADD CONSTRAINT "Resume_candidateId_fkey" 
FOREIGN KEY ("candidateId") 
REFERENCES "Candidate"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- AddForeignKey for candidateId in Generated_Resume table
ALTER TABLE "Generated_Resume" 
ADD CONSTRAINT "Generated_Resume_candidateId_fkey" 
FOREIGN KEY ("candidateId") 
REFERENCES "Candidate"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- AddForeignKey for resumeId in Generated_Resume table
ALTER TABLE "Generated_Resume" 
ADD CONSTRAINT "Generated_Resume_resumeId_fkey" 
FOREIGN KEY ("resumeId") 
REFERENCES "Resume"("id") 
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

-- AddForeignKey for candidateId in Generated_ATS_Score table
ALTER TABLE "Generated_ATS_Score" 
ADD CONSTRAINT "Generated_ATS_Score_candidateId_fkey" 
FOREIGN KEY ("candidateId") 
REFERENCES "Candidate"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- AddForeignKey for generatedResumeId in Generated_ATS_Score table
ALTER TABLE "Generated_ATS_Score" 
ADD CONSTRAINT "Generated_ATS_Score_generatedResumeId_fkey" 
FOREIGN KEY ("generatedResumeId") 
REFERENCES "Generated_Resume"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;
