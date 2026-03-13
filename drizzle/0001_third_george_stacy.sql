CREATE TABLE `clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stackId` int NOT NULL,
	`userId` int,
	`type` enum('website','affiliate') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lauds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stackId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lauds_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_lauds_unique` UNIQUE(`stackId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stackId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`pros` json,
	`cons` json,
	`helpfulCount` int NOT NULL DEFAULT 0,
	`founderReply` text,
	`founderReplyAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_reviews_unique` UNIQUE(`stackId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `saves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stackId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saves_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_saves_unique` UNIQUE(`stackId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `stack_screenshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stackId` int NOT NULL,
	`url` text NOT NULL,
	`caption` varchar(255),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stack_screenshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`tagline` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`logoUrl` text,
	`screenshotUrl` text,
	`websiteUrl` text,
	`affiliateUrl` text,
	`category` varchar(100) NOT NULL,
	`pricingModel` varchar(50) NOT NULL DEFAULT 'Freemium',
	`pricingDetails` text,
	`tags` json,
	`founderId` int,
	`claimedAt` timestamp,
	`status` enum('draft','pending_review','published','suspended','rejected') NOT NULL DEFAULT 'published',
	`isVerified` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isTrending` boolean NOT NULL DEFAULT false,
	`isSpotlighted` boolean NOT NULL DEFAULT false,
	`laudCount` int NOT NULL DEFAULT 0,
	`saveCount` int NOT NULL DEFAULT 0,
	`reviewCount` int NOT NULL DEFAULT 0,
	`averageRating` decimal(3,2) NOT NULL DEFAULT '0.00',
	`viewCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`rankScore` int NOT NULL DEFAULT 0,
	`weeklyRankChange` int NOT NULL DEFAULT 0,
	`launchedAt` timestamp,
	`addedBy` enum('admin','founder') NOT NULL DEFAULT 'admin',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stacks_id` PRIMARY KEY(`id`),
	CONSTRAINT `stacks_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `verification_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stackId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stackId` int NOT NULL,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_clicks_stackId` ON `clicks` (`stackId`);--> statement-breakpoint
CREATE INDEX `idx_lauds_stackId` ON `lauds` (`stackId`);--> statement-breakpoint
CREATE INDEX `idx_reviews_stackId` ON `reviews` (`stackId`);--> statement-breakpoint
CREATE INDEX `idx_reviews_userId` ON `reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_saves_stackId` ON `saves` (`stackId`);--> statement-breakpoint
CREATE INDEX `idx_screenshots_stackId` ON `stack_screenshots` (`stackId`);--> statement-breakpoint
CREATE INDEX `idx_stacks_category` ON `stacks` (`category`);--> statement-breakpoint
CREATE INDEX `idx_stacks_status` ON `stacks` (`status`);--> statement-breakpoint
CREATE INDEX `idx_stacks_founderId` ON `stacks` (`founderId`);--> statement-breakpoint
CREATE INDEX `idx_stacks_rankScore` ON `stacks` (`rankScore`);--> statement-breakpoint
CREATE INDEX `idx_verification_stackId` ON `verification_requests` (`stackId`);--> statement-breakpoint
CREATE INDEX `idx_views_stackId` ON `views` (`stackId`);