/**
 * Repository type definitions for Mesrai AI Review Tool
 * @fileoverview Shared type definitions for repository entities
 */

export interface Repository {
  /** Unique identifier for the repository */
  id: string;
  
  /** Repository name in format "owner/repo-name" */
  name: string;
  
  /** Repository owner username */
  owner: string;
  
  /** Current status of the repository */
  status: "active" | "inactive" | "paused";
  
  /** Number of open pull requests */
  pullRequestCount: number;
  
  /** Last review date in formatted string */
  lastReviewDate: string;
  
  /** Code health score from 0-100 */
  codeHealthScore: number;
}

export interface DashboardStats {
  /** Display title for the statistic */
  title: string;
  
  /** Formatted value to display */
  value: string;
  
  /** Icon component type */
  icon: React.ComponentType<any>;
}