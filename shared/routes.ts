import { z } from 'zod';
import { generations, insertGenerationSchema, analyzeRequestSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  analyze: {
    method: 'POST' as const,
    path: '/api/analyze',
    input: analyzeRequestSchema,
    responses: {
      200: z.object({
        notes: z.array(z.object({
          pitch: z.string(),
          startTime: z.number(), // Changed to number for simpler backend calc
          duration: z.string(),
          velocity: z.number(),
        })),
        previewImage: z.string().optional(), // Processed debug view
      }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  generations: {
    list: {
      method: 'GET' as const,
      path: '/api/generations',
      responses: {
        200: z.array(z.custom<typeof generations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/generations',
      input: insertGenerationSchema,
      responses: {
        201: z.custom<typeof generations.$inferSelect>(),
        500: errorSchemas.internal,
      },
    },
  },
};

// ============================================
// TYPE HELPERS
// ============================================
export type AnalyzeInput = z.infer<typeof api.analyze.input>;
export type AnalyzeResponse = z.infer<typeof api.analyze.responses[200]>;
