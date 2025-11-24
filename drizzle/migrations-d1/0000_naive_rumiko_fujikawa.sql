CREATE TABLE `achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text,
	`category` text NOT NULL,
	`type` text DEFAULT 'one_time' NOT NULL,
	`condition` text NOT NULL,
	`points` integer DEFAULT 10,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assessmentQuestions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`competencyId` integer NOT NULL,
	`question` text NOT NULL,
	`questionType` text DEFAULT 'self_assessment' NOT NULL,
	`option1` text NOT NULL,
	`option2` text NOT NULL,
	`option3` text NOT NULL,
	`option4` text NOT NULL,
	`option5` text NOT NULL,
	`score1` integer DEFAULT 20,
	`score2` integer DEFAULT 40,
	`score3` integer DEFAULT 60,
	`score4` integer DEFAULT 80,
	`score5` integer DEFAULT 100,
	`difficulty` text DEFAULT 'medium',
	`targetLevel` integer DEFAULT 3,
	`usageCount` integer DEFAULT 0,
	`correctRate` integer DEFAULT 50,
	`isActive` integer DEFAULT true NOT NULL,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assessmentSessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`sessionType` text DEFAULT 'regular' NOT NULL,
	`totalQuestions` integer NOT NULL,
	`answeredQuestions` integer DEFAULT 0,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`startedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `changelogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`type` text NOT NULL,
	`publishedAt` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`industry` text,
	`industryId` integer,
	`companySize` text,
	`companyStage` text,
	`description` text,
	`organizationStructure` text,
	`ownerId` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `companyMembers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`companyId` integer NOT NULL,
	`userId` integer NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`position` text,
	`joinedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `competencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`domainId` integer NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`isCore` integer DEFAULT true NOT NULL,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `competencyDomains` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `competencyScores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`competencyId` integer NOT NULL,
	`questionnaireScore` integer DEFAULT 0,
	`selfAssessmentScore` integer DEFAULT 0,
	`aiAnalysisScore` integer DEFAULT 0,
	`evidenceScore` integer DEFAULT 0,
	`finalScore` integer DEFAULT 0,
	`level` integer DEFAULT 1,
	`questionnaireWeight` integer DEFAULT 40,
	`selfAssessmentWeight` integer DEFAULT 20,
	`aiAnalysisWeight` integer DEFAULT 30,
	`evidenceWeight` integer DEFAULT 10,
	`practiceCount` integer DEFAULT 0,
	`lastPracticeAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `competencySnapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`competencyId` integer NOT NULL,
	`score` integer NOT NULL,
	`level` integer NOT NULL,
	`snapshotDate` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `demoAccountAnalytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`demoAccountId` integer NOT NULL,
	`sessionId` text NOT NULL,
	`loginCount` integer DEFAULT 0,
	`pageViews` integer DEFAULT 0,
	`duration` integer DEFAULT 0,
	`visitedPages` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `demoAccounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`displayName` text NOT NULL,
	`role` text NOT NULL,
	`description` text,
	`userId` integer,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demoAccounts_username_unique` ON `demoAccounts` (`username`);--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `industries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`keyCharacteristics` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `industries_code_unique` ON `industries` (`code`);--> statement-breakpoint
CREATE TABLE `industryCompetencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`industryId` integer NOT NULL,
	`competencyId` integer NOT NULL,
	`importance` integer DEFAULT 3 NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learningPaths` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`targetCompetencies` text NOT NULL,
	`resourceIds` text NOT NULL,
	`totalResources` integer DEFAULT 0,
	`completedResources` integer DEFAULT 0,
	`estimatedDays` integer DEFAULT 30,
	`status` text DEFAULT 'active' NOT NULL,
	`startedAt` integer,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learningResources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`competencyId` integer NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`url` text,
	`description` text,
	`difficulty` text DEFAULT 'intermediate',
	`estimatedTime` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organizationAssessmentHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`strategyScore` integer NOT NULL,
	`operationScore` integer NOT NULL,
	`organizationScore` integer NOT NULL,
	`innovationScore` integer NOT NULL,
	`questionAnswers` text,
	`metricValues` text,
	`assessmentDate` integer DEFAULT (unixepoch()) NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organizationAssessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`companyId` integer,
	`strategyScore` integer DEFAULT 0 NOT NULL,
	`operationScore` integer DEFAULT 0 NOT NULL,
	`organizationScore` integer DEFAULT 0 NOT NULL,
	`innovationScore` integer DEFAULT 0 NOT NULL,
	`detailedScores` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `positionCompetencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`positionId` integer NOT NULL,
	`competencyId` integer NOT NULL,
	`importance` integer DEFAULT 3 NOT NULL,
	`requiredLevel` integer DEFAULT 3 NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`category` text NOT NULL,
	`level` text NOT NULL,
	`description` text,
	`keyResponsibilities` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `positions_code_unique` ON `positions` (`code`);--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`companyStage` text,
	`analysis` text,
	`suggestions` text,
	`relatedCompetencies` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`achievementId` integer NOT NULL,
	`unlockedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`progress` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userAnswers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`sessionId` integer NOT NULL,
	`questionId` integer NOT NULL,
	`competencyId` integer NOT NULL,
	`answer` integer NOT NULL,
	`score` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userLearningProgress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`pathId` integer NOT NULL,
	`resourceId` integer NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`progressPercent` integer DEFAULT 0,
	`timeSpent` integer DEFAULT 0,
	`notes` text,
	`rating` integer,
	`startedAt` integer,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`industry` text,
	`industryId` integer,
	`companySize` text,
	`companyStage` text DEFAULT 'seed',
	`currentRole` text,
	`positionId` integer,
	`managementLevel` text,
	`yearsOfManagement` integer DEFAULT 0,
	`directReports` integer DEFAULT 0,
	`teamSize` integer DEFAULT 0,
	`profileCompleted` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `userProfiles_userId_unique` ON `userProfiles` (`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text,
	`username` text,
	`passwordHash` text,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`isDemo` integer DEFAULT false NOT NULL,
	`demoRole` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`lastSignedIn` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `wikiArticles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`categoryId` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`summary` text,
	`tags` text,
	`sortOrder` integer DEFAULT 0,
	`viewCount` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wikiArticles_slug_unique` ON `wikiArticles` (`slug`);--> statement-breakpoint
CREATE TABLE `wikiCategories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`sortOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wikiCategories_slug_unique` ON `wikiCategories` (`slug`);