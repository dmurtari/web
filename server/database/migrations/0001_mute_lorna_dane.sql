PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`original_filename` text NOT NULL,
	`uploaded_at` integer DEFAULT 1755394584119 NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`description` text,
	`latitude` text,
	`longitude` text,
	`camera_make` text,
	`camera_model` text,
	`exposure_time` text,
	`aperture` text,
	`iso` integer,
	`focal_length` text,
	`taken_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_photos`("id", "filename", "original_filename", "uploaded_at", "mime_type", "size", "description", "latitude", "longitude", "camera_make", "camera_model", "exposure_time", "aperture", "iso", "focal_length", "taken_at") SELECT "id", "filename", "original_filename", "uploaded_at", "mime_type", "size", "description", "latitude", "longitude", "camera_make", "camera_model", "exposure_time", "aperture", "iso", "focal_length", "taken_at" FROM `photos`;--> statement-breakpoint
DROP TABLE `photos`;--> statement-breakpoint
ALTER TABLE `__new_photos` RENAME TO `photos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;