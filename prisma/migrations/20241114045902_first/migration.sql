-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL,
    `national_id` VARCHAR(16) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `emergency_phone` VARCHAR(20) NOT NULL,
    `gender` VARCHAR(10) NULL,
    `date_of_birth` DATETIME(3) NOT NULL,
    `weight` FLOAT NOT NULL,
    `height` FLOAT NOT NULL,

    UNIQUE INDEX `User_national_id_key`(`national_id`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `price` FLOAT NOT NULL,
    `is_open` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trip` (
    `id` INTEGER NOT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `checked_in_at` DATETIME(3) NULL,
    `checked_out_at` DATETIME(3) NULL,
    `canceled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `route_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(15) NOT NULL,
    `transaction_id` VARCHAR(100) NOT NULL,
    `price` DOUBLE NOT NULL,
    `expiration` DATETIME(3) NOT NULL,
    `bank` VARCHAR(20) NOT NULL,
    `va_number` VARCHAR(50) NOT NULL,
    `trip_id` INTEGER NOT NULL,

    UNIQUE INDEX `Payment_trip_id_key`(`trip_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `trip_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckPoint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `picture` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `Route`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_trip_id_fkey` FOREIGN KEY (`trip_id`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
