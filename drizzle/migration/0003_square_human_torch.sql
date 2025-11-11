CREATE TABLE `oauthAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider` enum('google','github') NOT NULL,
	`provide_account_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauthAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauthAccounts_provide_account_id_unique` UNIQUE(`provide_account_id`)
);
--> statement-breakpoint
ALTER TABLE `oauthAccounts` ADD CONSTRAINT `oauthAccounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;