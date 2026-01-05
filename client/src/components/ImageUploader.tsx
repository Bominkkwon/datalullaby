import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading?: boolean;
}

export function ImageUploader({ onImageSelected, isLoading }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setPreview(result);
          onImageSelected(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelected]
  );

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelected("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div className="w-full h-full relative group">
      <div
        {...getRootProps()}
        className={`
          relative w-full h-[400px] rounded-lg border-2 border-dashed 
          transition-all duration-300 cursor-pointer overflow-hidden
          flex flex-col items-center justify-center
          ${
            isDragActive
              ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }
          ${preview ? "border-solid border-primary/20" : ""}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence>
          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain bg-black/40 backdrop-blur-sm p-4"
              />
              
              {!isLoading && (
                <button
                  onClick={clearImage}
                  className="absolute top-4 right-4 p-2 bg-destructive/90 text-destructive-foreground rounded-md hover:bg-destructive transition-colors shadow-lg z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-foreground">
                  Upload Source Image
                </h3>
                <p className="text-sm text-muted-foreground mt-2 font-mono">
                  Drag & drop or click to browse
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 font-mono border border-border/50 rounded px-3 py-1 bg-background/50 mx-auto w-fit">
                <ImageIcon className="w-3 h-3" />
                <span>SUPPORTS: JPG, PNG, WEBP</span>
              </div>
            </div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-primary font-mono text-sm animate-pulse tracking-widest">
              ANALYZING PIXELS...
            </p>
          </div>
        )}
      </div>
      
      {/* Tech Corners */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/30 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/30 pointer-events-none" />
    </div>
  );
}
