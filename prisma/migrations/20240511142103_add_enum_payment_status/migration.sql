/*
  Warnings:

  - You are about to alter the column `status` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `bank` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `va_number` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `bank` VARCHAR(191) NOT NULL,
    ADD COLUMN `transaction_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `va_number` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('menunggu', 'lunas', 'aktif', 'selesai', 'ditolak', 'batal') NOT NULL DEFAULT 'menunggu';
