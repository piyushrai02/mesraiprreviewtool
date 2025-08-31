import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, boolean, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table  
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  githubId: varchar("github_id").unique(),
  email: varchar("email"),
  username: varchar("username").notNull(),
  avatarUrl: varchar("avatar_url"),
  accessToken: varchar("access_token"), // GitHub OAuth token
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User repositories from GitHub
export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  githubId: integer("github_id").unique().notNull(),
  name: varchar("name").notNull(),
  fullName: varchar("full_name").unique().notNull(),
  owner: varchar("owner").notNull(),
  isPrivate: boolean("is_private").default(false),
  language: varchar("language"),
  defaultBranch: varchar("default_branch").default("main"),
  description: text("description"),
  starCount: integer("star_count").default(0),
  forkCount: integer("fork_count").default(0),
  openIssuesCount: integer("open_issues_count").default(0),
  lastSyncAt: timestamp("last_sync_at"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("repositories_user_idx").on(table.userId),
  fullNameIdx: index("repositories_full_name_idx").on(table.fullName),
}));

// Review sessions for pull requests
export const reviewSessions = pgTable("review_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryId: varchar("repository_id").references(() => repositories.id).notNull(),
  pullRequestNumber: integer("pull_request_number").notNull(),
  githubPrId: integer("github_pr_id").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, reviewed, commented
  title: text("title"),
  author: varchar("author"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("review_sessions_user_idx").on(table.userId),
  repositoryIdx: index("review_sessions_repository_idx").on(table.repositoryId),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;
export type ReviewSession = typeof reviewSessions.$inferSelect;
export type NewReviewSession = typeof reviewSessions.$inferInsert;