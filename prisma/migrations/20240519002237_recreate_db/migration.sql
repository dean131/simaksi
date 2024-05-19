/*
  Warnings:

  - A unique constraint covering the columns `[national_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `national_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `national_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_national_id_key` ON `User`(`national_id`);
