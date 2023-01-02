/*
  Warnings:

  - You are about to drop the `adopts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `adopts` DROP FOREIGN KEY `adopts_donorId_fkey`;

-- DropTable
DROP TABLE `adopts`;

-- CreateTable
CREATE TABLE `adoptions` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `species` VARCHAR(191) NOT NULL,
    `breed` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `pictures` JSON NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'UNKNOWN') NOT NULL,
    `adoptionState` ENUM('INPROGRESS', 'ADOPTED', 'CANCELED') NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `adoptions_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `adoptions` ADD CONSTRAINT `adoptions_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
