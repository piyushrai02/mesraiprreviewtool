import { pgTable, serial, varchar, text, boolean, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: varchar("github_id").unique(),
  email: varchar("email"),
  username: varchar("username").notNull(),
  avatarUrl: varchar("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// GitHub App Installations
export const installations = pgTable("installations", {
  id: serial("id").primaryKey(),
  githubInstallationId: integer("github_installation_id").unique().notNull(),
  githubAccountId: integer("github_account_id").notNull(),
  githubAccountType: varchar("github_account_type").notNull(), // "Organization" or "User"
  status: varchar("status").default("active").notNull(), // active, suspended, deleted
  encryptedAccessToken: text("encrypted_access_token"), // Encrypted installation access token
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("installations_status_idx").on(table.status),
  userIdx: index("installations_user_idx").on(table.userId),
}));

// Repositories connected to installations
export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  githubId: integer("github_id").unique().notNull(),
  name: varchar("name").notNull(),
  fullName: varchar("full_name").unique().notNull(),
  isPrivate: boolean("is_private").default(false),
  language: varchar("language"),
  defaultBranch: varchar("default_branch").default("main"),
  status: varchar("status").default("syncing").notNull(), // syncing, active, failed, suspended
  lastSyncAt: timestamp("last_sync_at"),
  installationId: integer("installation_id").references(() => installations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("repositories_status_idx").on(table.status),
  installationIdx: index("repositories_installation_idx").on(table.installationId),
  fullNameIdx: index("repositories_full_name_idx").on(table.fullName),
}));

// Review sessions for pull requests
export const reviewSessions = pgTable("review_sessions", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id").references(() => repositories.id).notNull(),
  pullRequestNumber: integer("pull_request_number").notNull(),
  githubPrId: integer("github_pr_id").notNull(),
  status: varchar("status").default("queued").notNull(), // queued, analyzing, reviewed, commented, error
  title: text("title"),
  author: varchar("author"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  statusIdx: index("review_sessions_status_idx").on(table.status),
  repositoryIdx: index("review_sessions_repository_idx").on(table.repositoryId),
  prNumberIdx: index("review_sessions_pr_number_idx").on(table.repositoryId, table.pullRequestNumber),
}));

// Webhook events for tracking and deduplication
export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  githubDeliveryId: varchar("github_delivery_id").unique().notNull(),
  eventType: varchar("event_type").notNull(),
  action: varchar("action"),
  installationId: integer("installation_id"),
  repositoryId: integer("repository_id"),
  processed: boolean("processed").default(false),
  processedAt: timestamp("processed_at"),
  payload: text("payload"), // JSON payload for debugging
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  processedIdx: index("webhook_events_processed_idx").on(table.processed),
  deliveryIdx: index("webhook_events_delivery_idx").on(table.githubDeliveryId),
  installationIdx: index("webhook_events_installation_idx").on(table.installationId),
}));

// Job queue entries for monitoring
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id").unique().notNull(),
  queueName: varchar("queue_name").notNull(),
  jobType: varchar("job_type").notNull(),
  status: varchar("status").default("active").notNull(), // active, completed, failed, delayed, waiting
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  data: text("data"), // JSON data
  result: text("result"), // JSON result
  error: text("error"), // Error message if failed
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  statusIdx: index("jobs_status_idx").on(table.status),
  queueIdx: index("jobs_queue_idx").on(table.queueName),
  createdIdx: index("jobs_created_idx").on(table.createdAt),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInstallationSchema = createInsertSchema(installations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRepositorySchema = createInsertSchema(repositories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSessionSchema = createInsertSchema(reviewSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({ id: true, createdAt: true });
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Installation = typeof installations.$inferSelect;
export type NewInstallation = z.infer<typeof insertInstallationSchema>;
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = z.infer<typeof insertRepositorySchema>;
export type ReviewSession = typeof reviewSessions.$inferSelect;
export type NewReviewSession = z.infer<typeof insertReviewSessionSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type Job = typeof jobs.$inferSelect;
export type NewJob = z.infer<typeof insertJobSchema>;