/*
  Warnings:

  - You are about to alter the column `name` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `password` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `name` on the `route` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `name` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `password` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - A unique constraint covering the columns `[nik]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Made the column `is_checked_in` on table `trip` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_checked_out` on table `trip` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergency_phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ktp_photo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `phone` VARCHAR(20) NOT NULL,
    MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `password` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `route` MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `is_open` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `trip` MODIFY `is_checked_in` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `is_checked_out` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` VARCHAR(255) NOT NULL,
    ADD COLUMN `date_of_birth` DATETIME(3) NOT NULL,
    ADD COLUMN `emergency_phone` VARCHAR(20) NOT NULL,
    ADD COLUMN `height` FLOAT NOT NULL,
    ADD COLUMN `ktp_photo` VARCHAR(255) NOT NULL,
    ADD COLUMN `nik` VARCHAR(30) NOT NULL,
    ADD COLUMN `phone` VARCHAR(20) NOT NULL,
    ADD COLUMN `weight` FLOAT NOT NULL,
    MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `password` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_nik_key` ON `User`(`nik`);
