import { db } from "./db";
import {
  generations,
  type InsertGeneration,
  type Generation
} from "@shared/schema";

export interface IStorage {
  createGeneration(gen: InsertGeneration): Promise<Generation>;
  getGenerations(): Promise<Generation[]>;
}

export class DatabaseStorage implements IStorage {
  async createGeneration(gen: InsertGeneration): Promise<Generation> {
    const [created] = await db.insert(generations).values(gen).returning();
    return created;
  }

  async getGenerations(): Promise<Generation[]> {
    return await db.select().from(generations).orderBy(generations.createdAt);
  }
}

export const storage = new DatabaseStorage();
