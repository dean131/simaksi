/*
  Warnings:

  - Added the required column `price` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `route` ADD COLUMN `price` FLOAT NOT NULL;
