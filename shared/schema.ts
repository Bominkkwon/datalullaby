import { pgTable, text, serial, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  settings: jsonb("settings").notNull(), // Stores Scale, Tempo, Mapping Strategy
  noteData: jsonb("note_data").notNull(), // The generated sequence of notes
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertGenerationSchema = createInsertSchema(generations).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;

// Request types
export const analysisSettingsSchema = z.object({
  scale: z.enum(["major", "minor", "pentatonic", "chromatic"]).default("major"),
  baseNote: z.string().default("C4"),
  tempo: z.number().min(40).max(240).default(120),
  strategy: z.enum(["brightness_row", "edge_detection", "color_mapped"]).default("brightness_row"),
});

export type AnalysisSettings = z.infer<typeof analysisSettingsSchema>;

export const analyzeRequestSchema = z.object({
  image: z.string(), // Base64 data URL
  settings: analysisSettingsSchema,
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// Response types
export interface NoteEvent {
  pitch: string;
  startTime: string; // "0:0:0" format or seconds
  duration: string;
  velocity: number; // 0-1 derived from brightness
  instrument: string;
}

export interface AnalysisResponse {
  notes: NoteEvent[];
  metadata: {
    totalDuration: number;
    eventCount: number;
  };
}
