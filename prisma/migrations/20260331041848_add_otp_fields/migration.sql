-- AlterTable
ALTER TABLE `users` ADD COLUMN `otp` VARCHAR(10) NULL,
    ADD COLUMN `otpExpiry` DATETIME(3) NULL,
    ADD COLUMN `resetToken` VARCHAR(255) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL;
