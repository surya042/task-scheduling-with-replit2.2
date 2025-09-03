import {
  users,
  tasks,
  type User,
  type UpsertUser,
  type InsertTask,
  type UpdateTask,
  type Task,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Custom user operations
  getUserByAdminNumber(adminNumber: string): Promise<User | undefined>;
  getLinkedUsers(adminId: string): Promise<User[]>;
  updateUserRole(userId: string, role: "admin" | "user", adminUniqueNumber?: string, linkedAdminId?: string): Promise<User>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByAdmin(adminId: string): Promise<Task[]>;
  updateTask(taskId: string, updates: UpdateTask): Promise<Task>;
  getTask(taskId: string): Promise<Task | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Custom user operations
  async getUserByAdminNumber(adminNumber: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.adminUniqueNumber, adminNumber));
    return user;
  }

  async getLinkedUsers(adminId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.linkedAdminId, adminId));
  }

  async updateUserRole(
    userId: string,
    role: "admin" | "user",
    adminUniqueNumber?: string,
    linkedAdminId?: string
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role,
        adminUniqueNumber,
        linkedAdminId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.deadline));
  }

  async getTasksByAdmin(adminId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedBy, adminId))
      .orderBy(desc(tasks.createdAt));
  }

  async updateTask(taskId: string, updates: UpdateTask): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();
    return task;
  }

  async getTask(taskId: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    return task;
  }
}

export const storage = new DatabaseStorage();
