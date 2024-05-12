/*
  Warnings:

  - You are about to drop the column `createdAt` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `is_canceled` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `is_checked_in` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `is_checked_out` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `is_created` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `trip` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `trip` DROP COLUMN `createdAt`,
    DROP COLUMN `is_canceled`,
    DROP COLUMN `is_checked_in`,
    DROP COLUMN `is_checked_out`,
    DROP COLUMN `is_created`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `canceled_at` DATETIME(3) NULL,
    ADD COLUMN `checked_in_at` DATETIME(3) NULL,
    ADD COLUMN `checked_out_at` DATETIME(3) NULL,
    ADD COLUMN `created_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
