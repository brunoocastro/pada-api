-- AlterTable
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `adopts` (
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

    UNIQUE INDEX `adopts_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `adopts` ADD CONSTRAINT `adopts_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
