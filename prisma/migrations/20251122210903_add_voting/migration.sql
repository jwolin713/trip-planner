-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_destinationId_idx" ON "Vote"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_destinationId_voterId_key" ON "Vote"("destinationId", "voterId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
