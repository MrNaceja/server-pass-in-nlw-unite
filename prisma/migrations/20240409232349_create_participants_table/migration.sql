-- CreateTable
CREATE TABLE "tbparticipants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscribed_at" DATETIME NOT NULL,
    "check_in_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" TEXT NOT NULL,
    CONSTRAINT "tbparticipants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "tbevents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tbparticipants_id_key" ON "tbparticipants"("id");
