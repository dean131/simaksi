/*
  Warnings:

  - You are about to drop the column `nik` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_nik_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `nik`;
