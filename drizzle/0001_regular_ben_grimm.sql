ALTER TABLE `users` MODIFY COLUMN `openId` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `linkedinUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `linkedinId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerifyToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpires` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_linkedinId_unique` UNIQUE(`linkedinId`);