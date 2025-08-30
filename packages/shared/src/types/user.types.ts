/**
 * Client-safe user type for frontend consumption
 * Excludes sensitive fields like githubId
 */
export type ClientUser = {
  id: number;
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
};

/**
 * GitHub user profile response type
 */
export type GitHubUser = {
  id: number;
  login: string;
  email?: string | null;
  avatar_url?: string | null;
  name?: string | null;
};

/**
 * Authentication response type
 */
export type AuthResponse = {
  user: ClientUser;
  message: string;
};