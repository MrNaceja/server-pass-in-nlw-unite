-- CreateTable
CREATE TABLE "tbevents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "slug" TEXT NOT NULL,
    "max_participants" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "tbevents_id_key" ON "tbevents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tbevents_slug_key" ON "tbevents"("slug");
