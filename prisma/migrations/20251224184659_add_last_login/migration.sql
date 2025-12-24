-- DropIndex
DROP INDEX "PageView_createdAt_idx";

-- DropIndex
DROP INDEX "PageView_projectId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLogin" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PageView_projectId_createdAt_idx" ON "PageView"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_projectId_deviceType_idx" ON "PageView"("projectId", "deviceType");

-- CreateIndex
CREATE INDEX "PageView_projectId_referrer_idx" ON "PageView"("projectId", "referrer");

-- CreateIndex
CREATE INDEX "PageView_projectId_page_idx" ON "PageView"("projectId", "page");

-- CreateIndex
CREATE INDEX "PageView_projectId_country_idx" ON "PageView"("projectId", "country");

-- CreateIndex
CREATE INDEX "PageView_projectId_sessionId_createdAt_idx" ON "PageView"("projectId", "sessionId", "createdAt");
