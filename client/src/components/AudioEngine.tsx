import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import * as Tone from "tone";
import { NoteEvent } from "@shared/schema";
import { Play, Square, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface AudioEngineHandle {
  play: () => void;
  stop: () => void;
  pause: () => void;
}

interface AudioEngineProps {
  notes: NoteEvent[];
  tempo: number;
  onTimeUpdate?: (time: number) => void;
  totalDuration: number;
}

export const AudioEngine = forwardRef<AudioEngineHandle, AudioEngineProps>(
  ({ notes, tempo, onTimeUpdate, totalDuration }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [progress, setProgress] = useState(0);
    
    // Tone references
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const partRef = useRef<Tone.Part | null>(null);
    const transportRef = useRef<any>(null); // Use any to avoid complex Tone types issues in template

    // Initialize Tone.js
    useEffect(() => {
      const initAudio = async () => {
        // Create a polysynth with a cybernetic sound
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "sawtooth" },
          envelope: {
            attack: 0.05,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        }).toDestination();
        
        // Add some effects for "space"
        const reverb = new Tone.Reverb(1.5).toDestination();
        const delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
        synthRef.current.connect(reverb);
        synthRef.current.connect(delay);
        
        // Set master volume
        Tone.getDestination().volume.value = -10;
        
        setIsReady(true);
      };

      initAudio();

      return () => {
        if (synthRef.current) {
          synthRef.current.dispose();
        }
        if (partRef.current) {
          partRef.current.dispose();
        }
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
      };
    }, []);

    // Update Transport when notes/tempo change
    useEffect(() => {
      if (!isReady || notes.length === 0) return;

      // Stop existing playback
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      if (partRef.current) partRef.current.dispose();

      Tone.getTransport().bpm.value = tempo;

      // Convert NoteEvents to Tone.Part format
      // NoteEvent: { pitch: "C4", startTime: "0:0:0", duration: "8n", velocity: 0.5 }
      const events = notes.map((note) => ({
        time: note.startTime,
        note: note.pitch,
        duration: note.duration,
        velocity: note.velocity,
      }));

      partRef.current = new Tone.Part((time, value) => {
        synthRef.current?.triggerAttackRelease(
          value.note,
          value.duration,
          time,
          value.velocity
        );
      }, events).start(0);

      // Schedule time updates for UI
      Tone.getTransport().scheduleRepeat((time) => {
        // Tone.Transport.seconds gives current time in seconds
        const currentSec = Tone.getTransport().seconds;
        if (onTimeUpdate) {
          // Use requestAnimationFrame for smoother UI updates if needed, but this is ok for now
          onTimeUpdate(currentSec);
          setProgress((currentSec / totalDuration) * 100);
        }
      }, "0.1");

    }, [notes, tempo, isReady, totalDuration]);

    // Handle Expose methods
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (!isReady) return;
        await Tone.start();
        Tone.getTransport().start();
        setIsPlaying(true);
      },
      pause: () => {
        Tone.getTransport().pause();
        setIsPlaying(false);
      },
      stop: () => {
        Tone.getTransport().stop();
        setIsPlaying(false);
        if (onTimeUpdate) onTimeUpdate(0);
        setProgress(0);
      },
    }));

    // Local handlers
    const handlePlay = async () => {
      if (!isReady) return;
      await Tone.start();
      
      if (Tone.getTransport().state === "started") {
        Tone.getTransport().pause();
        setIsPlaying(false);
      } else {
        Tone.getTransport().start();
        setIsPlaying(true);
      }
    };

    const handleStop = () => {
      Tone.getTransport().stop();
      setIsPlaying(false);
      if (onTimeUpdate) onTimeUpdate(0);
      setProgress(0);
    };

    return (
      <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={isPlaying ? "secondary" : "default"}
            className="w-12 h-12 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
            onClick={handlePlay}
            disabled={!isReady || notes.length === 0}
          >
            {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleStop}
            disabled={!isReady || notes.length === 0}
          >
            <Square className="fill-current w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>PLAYBACK</span>
            <span>{isPlaying ? "ACTIVE" : "READY"}</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="w-32 hidden md:block">
           <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
            <span>VOL</span>
            <span>-10dB</span>
          </div>
          <Slider defaultValue={[75]} max={100} step={1} />
        </div>
      </div>
    );
  }
);

AudioEngine.displayName = "AudioEngine";
