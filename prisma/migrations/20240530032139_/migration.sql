/*
  Warnings:

  - You are about to alter the column `email` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `name` on the `checkpoint` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `status` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(15)`.
  - You are about to alter the column `transaction_id` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `bank` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `va_number` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `admin` MODIFY `email` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `checkpoint` MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `picture` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `payment` MODIFY `status` VARCHAR(15) NOT NULL,
    MODIFY `transaction_id` VARCHAR(100) NOT NULL,
    MODIFY `bank` VARCHAR(20) NOT NULL,
    MODIFY `va_number` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `address` TEXT NOT NULL;
