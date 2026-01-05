import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import sharp from "sharp";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Increase payload limit for image uploads
  app.use(function(req, res, next) {
    const json = typeof req.body === 'object';
    if (!json) {
      // If body not parsed yet, we might need to rely on express.json limit set in index.ts
      // usually index.ts sets it. If issues arise, we might need to adjust index.ts
    }
    next();
  });

  app.post(api.analyze.path, async (req, res) => {
    try {
      const input = api.analyze.input.parse(req.body);
      const buffer = Buffer.from(input.image.split(',')[1], 'base64');
      
      // Process image: Resize to 32x32 for matrix analysis to keep it musical and manageable
      const size = 32;
      const { data, info } = await sharp(buffer)
        .resize(size, size, { fit: 'fill' })
        .grayscale() // Start simple with grayscale intensity
        .raw()
        .toBuffer({ resolveWithObject: true });

      const notes: { pitch: string; startTime: number; duration: string; velocity: number }[] = [];
      const pixelData = new Uint8Array(data);
      
      // Map pixels to notes
      // Strategy: X axis = Time, Y axis = Pitch
      // Brightness = Velocity/Trigger
      
      // Pentatonic Scale (C Major Pentatonic)
      const scale = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5", "A5", "C6", "D6"];
      
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const idx = (y * size) + x;
          const brightness = pixelData[idx];
          
          // Threshold to reduce noise
          if (brightness > 50) {
            // Invert Y so bottom is low pitch, top is high
            const pitchIndex = Math.floor(((size - 1 - y) / size) * scale.length);
            const safePitchIndex = Math.min(Math.max(pitchIndex, 0), scale.length - 1);
            
            notes.push({
              pitch: scale[safePitchIndex],
              startTime: x * 0.2, // 0.2s per column
              duration: "8n",
              velocity: brightness / 255
            });
          }
        }
      }

      res.json({ notes });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  app.post(api.generations.create.path, async (req, res) => {
    try {
      const input = api.generations.create.input.parse(req.body);
      const result = await storage.createGeneration(input);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to save generation" });
    }
  });

  app.get(api.generations.list.path, async (req, res) => {
    const list = await storage.getGenerations();
    res.json(list);
  });

  return httpServer;
}
