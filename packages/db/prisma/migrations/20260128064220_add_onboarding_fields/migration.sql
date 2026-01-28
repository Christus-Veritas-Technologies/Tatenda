-- AlterTable
ALTER TABLE "user" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralSources" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "school" TEXT,
ADD COLUMN     "schoolLevel" TEXT;
