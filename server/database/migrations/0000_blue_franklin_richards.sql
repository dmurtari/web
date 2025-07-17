CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`original_filename` text NOT NULL,
	`uploaded_at` integer DEFAULT 1752754302364 NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`latitude` text,
	`longitude` text,
	`description` text
);
