/*
  Warnings:

  - You are about to alter the column `national_id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(16)`.
  - You are about to alter the column `gender` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `national_id` VARCHAR(16) NOT NULL,
    MODIFY `gender` VARCHAR(10) NULL;
