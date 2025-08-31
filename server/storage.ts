import { users, installations, repositories, type User, type NewUser } from '../shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByGitHubId(githubId: string): Promise<User | undefined>;
  createUser(user: NewUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user;
  }

  async getUserByGitHubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user;
  }

  async createUser(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, parseInt(id)))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();