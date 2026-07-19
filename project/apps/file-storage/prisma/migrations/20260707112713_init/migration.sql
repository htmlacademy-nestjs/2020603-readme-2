-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "sub_directory" VARCHAR(64) NOT NULL,
    "hash_name" VARCHAR(64) NOT NULL,
    "mimetype" VARCHAR(64) NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);
