CREATE TABLE `learningPaths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetCompetencies` text NOT NULL,
	`resourceIds` text NOT NULL,
	`totalResources` int DEFAULT 0,
	`completedResources` int DEFAULT 0,
	`estimatedDays` int DEFAULT 30,
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningPaths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userLearningProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pathId` int NOT NULL,
	`resourceId` int NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`progressPercent` int DEFAULT 0,
	`timeSpent` int DEFAULT 0,
	`notes` text,
	`rating` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userLearningProgress_id` PRIMARY KEY(`id`)
);
