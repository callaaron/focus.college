CREATE TABLE `organizationAssessmentHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`strategyScore` int NOT NULL,
	`operationScore` int NOT NULL,
	`organizationScore` int NOT NULL,
	`innovationScore` int NOT NULL,
	`questionAnswers` text,
	`metricValues` text,
	`assessmentDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizationAssessmentHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyId` int,
	`strategyScore` int NOT NULL DEFAULT 0,
	`operationScore` int NOT NULL DEFAULT 0,
	`organizationScore` int NOT NULL DEFAULT 0,
	`innovationScore` int NOT NULL DEFAULT 0,
	`detailedScores` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationAssessments_id` PRIMARY KEY(`id`)
);
