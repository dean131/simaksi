-- AlterTable
ALTER TABLE `trip` ADD COLUMN `is_canceled` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `expiration` DATETIME(3) NOT NULL,
    `trip_id` INTEGER NOT NULL,

    UNIQUE INDEX `Payment_trip_id_key`(`trip_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
