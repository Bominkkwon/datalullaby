import { useEffect, useRef } from "react";
import { NoteEvent } from "@shared/schema";
import { motion } from "framer-motion";

interface VisualizerProps {
  imageSrc: string | null;
  notes: NoteEvent[];
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
}

export function Visualizer({ imageSrc, notes, isPlaying, currentTime, totalDuration }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate playback progress (0 to 1)
  const progress = totalDuration > 0 ? (currentTime / totalDuration) : 0;
  
  // Draw visualizations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !notes.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw active notes
    // Notes are mapped: x = time, y = pitch
    // But we want to visualize them OVER the image concept
    // If strategy is scanning, X is time.
    
    notes.forEach(note => {
      const noteStartTime = parseFloat(note.startTime);
      const noteDuration = parseFloat(note.duration);
      
      // Check if note is currently playing
      if (isPlaying && currentTime >= noteStartTime && currentTime < noteStartTime + noteDuration) {
        // Map pitch to Y? This is approximate since pitch is a string like "C4"
        // For visual flair, we'll just randomize Y or use a hash if we don't have exact frequency data here
        // Ideally we'd parse the pitch to a number.
        
        // Simple visual representation:
        const x = (noteStartTime / totalDuration) * canvas.width;
        const w = (noteDuration / totalDuration) * canvas.width;
        
        ctx.fillStyle = `rgba(34, 197, 94, ${note.velocity})`; // Green with velocity opacity
        ctx.fillRect(x, 0, Math.max(2, w), canvas.height);
        
        // Add a "blip" circle at a random height to simulate the "note" location
        const pseudoY = (note.pitch.charCodeAt(0) % 10) / 10 * canvas.height; 
        
        ctx.beginPath();
        ctx.arc(x, pseudoY, 5 + (note.velocity * 10), 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#22c55e";
      }
    });
    
  }, [notes, isPlaying, currentTime, totalDuration]);

  if (!imageSrc) return null;

  return (
    <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden border border-border shadow-2xl">
      {/* Base Image */}
      <img 
        src={imageSrc} 
        alt="Visualizer Base" 
        className="absolute inset-0 w-full h-full object-contain opacity-50 grayscale"
      />
      
      {/* Note Overlay Canvas */}
      <canvas 
        ref={canvasRef}
        width={800}
        height={400}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Scanning Line */}
      <motion.div 
        className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_15px_#22c55e] z-10"
        style={{ left: `${progress * 100}%` }}
      />
      
      {/* Time Display */}
      <div className="absolute top-4 left-4 bg-black/80 font-mono text-xs text-primary px-2 py-1 rounded border border-primary/20 backdrop-blur-md">
        T: {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_98%,rgba(34,197,94,0.1)_2%),linear-gradient(transparent_98%,rgba(34,197,94,0.1)_2%)] bg-[length:50px_50px] pointer-events-none" />
    </div>
  );
}
