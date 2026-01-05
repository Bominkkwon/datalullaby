import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Sliders, Music2, Activity, Zap } from "lucide-react";
import type { AnalysisSettings } from "@shared/schema";

interface ControlPanelProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
  disabled?: boolean;
}

export function ControlPanel({ settings, onSettingsChange, disabled }: ControlPanelProps) {
  const updateSetting = <K extends keyof AnalysisSettings>(key: K, value: AnalysisSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="p-6 bg-card border-border tech-border h-full flex flex-col gap-8">
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
        <Sliders className="w-5 h-5 text-primary" />
        <h2 className="font-display font-bold text-lg tracking-tight">PARAMETERS</h2>
      </div>

      {/* Strategy Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-mono text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> SCAN STRATEGY
          </Label>
        </div>
        <RadioGroup
          value={settings.strategy}
          onValueChange={(val) => updateSetting("strategy", val as any)}
          disabled={disabled}
          className="grid grid-cols-1 gap-3"
        >
          <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-md border border-border/50 hover:border-primary/50 transition-colors">
            <RadioGroupItem value="brightness_row" id="s1" className="border-primary text-primary" />
            <Label htmlFor="s1" className="flex-1 cursor-pointer">
              <span className="font-bold block text-sm">Brightness Scan</span>
              <span className="text-xs text-muted-foreground">Maps luminance to pitch vertically</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-md border border-border/50 hover:border-primary/50 transition-colors">
            <RadioGroupItem value="edge_detection" id="s2" className="border-primary text-primary" />
            <Label htmlFor="s2" className="flex-1 cursor-pointer">
              <span className="font-bold block text-sm">Edge Detection</span>
              <span className="text-xs text-muted-foreground">Triggers notes on high contrast changes</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-md border border-border/50 hover:border-primary/50 transition-colors">
            <RadioGroupItem value="color_mapped" id="s3" className="border-primary text-primary" />
            <Label htmlFor="s3" className="flex-1 cursor-pointer">
              <span className="font-bold block text-sm">Color Mapping</span>
              <span className="text-xs text-muted-foreground">Hue determines pitch, saturation is velocity</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Musical Settings */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-mono text-muted-foreground flex items-center gap-2">
            <Music2 className="w-4 h-4" /> MUSICAL SCALE
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={settings.scale}
              onValueChange={(val) => updateSetting("scale", val as any)}
              disabled={disabled}
            >
              <SelectTrigger className="font-mono bg-background border-input">
                <SelectValue placeholder="Scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="pentatonic">Pentatonic</SelectItem>
                <SelectItem value="chromatic">Chromatic</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={settings.baseNote}
              onValueChange={(val) => updateSetting("baseNote", val)}
              disabled={disabled}
            >
              <SelectTrigger className="font-mono bg-background border-input">
                <SelectValue placeholder="Key" />
              </SelectTrigger>
              <SelectContent>
                {["C", "D", "E", "F", "G", "A", "B"].map((note) => (
                  <SelectItem key={note} value={`${note}3`}>
                    {note}3
                  </SelectItem>
                ))}
                {["C", "D", "E", "F", "G", "A", "B"].map((note) => (
                  <SelectItem key={note} value={`${note}4`}>
                    {note}4
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-mono text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" /> TEMPO (BPM)
            </Label>
            <span className="font-mono text-primary font-bold">{settings.tempo}</span>
          </div>
          <Slider
            value={[settings.tempo]}
            min={40}
            max={240}
            step={1}
            onValueChange={([val]) => updateSetting("tempo", val)}
            disabled={disabled}
            className="[&_.range-thumb]:bg-primary [&_.range-track]:bg-muted"
          />
        </div>
      </div>
    </Card>
  );
}
