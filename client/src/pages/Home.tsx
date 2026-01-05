import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import { ControlPanel } from "@/components/ControlPanel";
import { Visualizer } from "@/components/Visualizer";
import { AudioEngine, type AudioEngineHandle } from "@/components/AudioEngine";
import { useAnalyzeImage } from "@/hooks/use-sonification";
import { AnalysisSettings, NoteEvent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Wand2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [settings, setSettings] = useState<AnalysisSettings>({
    scale: "major",
    baseNote: "C4",
    tempo: 120,
    strategy: "brightness_row",
  });
  
  const [analysisResult, setAnalysisResult] = useState<{
    notes: NoteEvent[];
    totalDuration: number;
  } | null>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const analyzeMutation = useAnalyzeImage();
  const audioEngineRef = useRef<AudioEngineHandle>(null);

  const handleAnalyze = () => {
    if (!imageBase64) return;
    
    // Stop any current playback
    audioEngineRef.current?.stop();
    setAnalysisResult(null);

    analyzeMutation.mutate(
      {
        image: imageBase64,
        settings,
      },
      {
        onSuccess: (data) => {
          // Calculate total duration from the last note
          let maxDuration = 0;
          if (data.notes.length > 0) {
            const lastNote = data.notes[data.notes.length - 1];
            // Simple parsing assuming seconds format from backend for now, or just use index
            // The backend actually sends numbers for startTime now per schema update
            const end = Number(lastNote.startTime) + 0.5; // Add some tail
            maxDuration = end;
          }
          
          setAnalysisResult({
            notes: data.notes as any[], // Casting for now due to subtle schema mismatch handling
            totalDuration: maxDuration || 10, // Fallback
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Controls & Upload */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                DataLullaby <br/> <span className="text-primary">Transmuter</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Upload an image to scan its pixel data and generate a unique sonic signature based on luminance and color mapping.
              </p>
            </div>

            <ControlPanel 
              settings={settings} 
              onSettingsChange={setSettings}
              disabled={analyzeMutation.isPending}
            />
            
            <Button 
              size="lg" 
              className="w-full font-mono font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              onClick={handleAnalyze}
              disabled={!imageBase64 || analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                "PROCESSING..."
              ) : (
                <>
                  <Wand2 className="mr-2 w-5 h-5" /> GENERATE SONIFICATION
                </>
              )}
            </Button>
            
            {analyzeMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {analyzeMutation.error?.message || "Failed to analyze image."}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column: Visualizer & Playback */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Visualizer Area */}
            <div className="bg-card border border-border rounded-xl p-1 overflow-hidden shadow-2xl relative min-h-[400px]">
               {analysisResult ? (
                 <Visualizer 
                   imageSrc={imageBase64}
                   notes={analysisResult.notes}
                   isPlaying={isPlaying}
                   currentTime={currentTime}
                   totalDuration={analysisResult.totalDuration}
                 />
               ) : (
                 <ImageUploader 
                   onImageSelected={setImageBase64} 
                   isLoading={analyzeMutation.isPending}
                 />
               )}
            </div>

            {/* Playback Controls */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AudioEngine 
                  ref={audioEngineRef}
                  notes={analysisResult.notes}
                  tempo={settings.tempo}
                  totalDuration={analysisResult.totalDuration}
                  onTimeUpdate={(t) => {
                    setCurrentTime(t);
                    setIsPlaying(t > 0 && t < analysisResult.totalDuration);
                  }}
                />
                
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground font-mono mb-1">NOTE COUNT</div>
                    <div className="text-2xl font-bold font-display text-primary">{analysisResult.notes.length}</div>
                  </div>
                  <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground font-mono mb-1">DURATION</div>
                    <div className="text-2xl font-bold font-display text-primary">{analysisResult.totalDuration.toFixed(1)}s</div>
                  </div>
                  <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground font-mono mb-1">KEY</div>
                    <div className="text-2xl font-bold font-display text-secondary">{settings.baseNote}</div>
                  </div>
                   <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground font-mono mb-1">ALGORITHM</div>
                    <div className="text-sm font-bold font-display text-muted-foreground uppercase mt-1">{settings.strategy.replace('_', ' ')}</div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {!analysisResult && !analyzeMutation.isPending && (
              <div className="h-24 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground/50 font-mono text-sm">
                AWAITING INPUT DATA...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
