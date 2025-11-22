CREATE TABLE `assessmentSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` enum('initial','regular','position') NOT NULL DEFAULT 'regular',
	`totalQuestions` int NOT NULL,
	`answeredQuestions` int DEFAULT 0,
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessmentSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `changelogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('feature','improvement','bugfix') NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `changelogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100),
	`industryId` int,
	`companySize` enum('startup','small','medium','large'),
	`companyStage` enum('seed','angel','series_a','series_b','series_c','series_d','pre_ipo','public','mature'),
	`description` text,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companyMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','member') NOT NULL DEFAULT 'member',
	`position` varchar(100),
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `companyMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domainId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`isCore` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competencyDomains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`module` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competencyDomains_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competencyScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`competencyId` int NOT NULL,
	`questionnaireScore` int DEFAULT 0,
	`selfAssessmentScore` int DEFAULT 0,
	`aiAnalysisScore` int DEFAULT 0,
	`evidenceScore` int DEFAULT 0,
	`finalScore` int DEFAULT 0,
	`level` int DEFAULT 1,
	`questionnaireWeight` int DEFAULT 40,
	`selfAssessmentWeight` int DEFAULT 20,
	`aiAnalysisWeight` int DEFAULT 30,
	`evidenceWeight` int DEFAULT 10,
	`practiceCount` int DEFAULT 0,
	`lastPracticeAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competencyScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competencySnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`competencyId` int NOT NULL,
	`score` int NOT NULL,
	`level` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competencySnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demoAccountAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`demoAccountId` int NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`loginCount` int DEFAULT 0,
	`pageViews` int DEFAULT 0,
	`duration` int DEFAULT 0,
	`visitedPages` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demoAccountAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demoAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`role` varchar(50) NOT NULL,
	`description` text,
	`userId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demoAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `demoAccounts_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` enum('bug','feature','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `industries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`keyCharacteristics` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `industries_id` PRIMARY KEY(`id`),
	CONSTRAINT `industries_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `industryCompetencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`industryId` int NOT NULL,
	`competencyId` int NOT NULL,
	`importance` int NOT NULL DEFAULT 3,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `industryCompetencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learningResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`competencyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('article','video','book','course') NOT NULL,
	`url` varchar(500),
	`description` text,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
	`estimatedTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learningResources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positionCompetencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`positionId` int NOT NULL,
	`competencyId` int NOT NULL,
	`importance` int NOT NULL DEFAULT 3,
	`requiredLevel` int NOT NULL DEFAULT 3,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `positionCompetencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(50) NOT NULL,
	`category` varchar(50) NOT NULL,
	`level` enum('executive','senior','middle','junior') NOT NULL,
	`description` text,
	`keyResponsibilities` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `positions_id` PRIMARY KEY(`id`),
	CONSTRAINT `positions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`companyStage` enum('seed','angel','series_a','series_b','series_c','series_d','pre_ipo','public','mature'),
	`analysis` text,
	`suggestions` text,
	`relatedCompetencies` text,
	`status` enum('pending','analyzed','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`questionId` int NOT NULL,
	`competencyId` int NOT NULL,
	`answer` int NOT NULL,
	`score` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`industry` varchar(100),
	`industryId` int,
	`companySize` enum('startup','small','medium','large'),
	`companyStage` enum('seed','angel','series_a','series_b','series_c','series_d','pre_ipo','public','mature') DEFAULT 'seed',
	`currentRole` varchar(100),
	`positionId` int,
	`managementLevel` enum('executive','senior','middle','junior'),
	`yearsOfManagement` int DEFAULT 0,
	`directReports` int DEFAULT 0,
	`teamSize` int DEFAULT 0,
	`profileCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `wikiArticles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`summary` text,
	`tags` varchar(255),
	`sortOrder` int DEFAULT 0,
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wikiArticles_id` PRIMARY KEY(`id`),
	CONSTRAINT `wikiArticles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `wikiCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wikiCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `wikiCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isDemo` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `demoRole` varchar(50);