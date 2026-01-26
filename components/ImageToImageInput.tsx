import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ImageToImageInputProps {
  onSubmit: (imageData: string, textPrompt: string) => void;
  isLoading: boolean;
}

const ImageToImageInput = ({ onSubmit, isLoading }: ImageToImageInputProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress/resize image to reduce payload size
  const compressImage = (file: File, maxWidth: number = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    try {
      setIsCompressing(true);
      // Compress image before storing
      const compressedImage = await compressImage(file, 1024);
      setSelectedImage(compressedImage);
    } catch (error) {
      console.error('Image compression error:', error);
      // Fallback to original
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setTextPrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!selectedImage) {
      alert("Please upload a reference image");
      return;
    }
    onSubmit(selectedImage, textPrompt);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="gradient-border"
      >
        <div className="bg-card rounded-xl overflow-hidden">
          {/* Image upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative min-h-[200px] flex items-center justify-center p-6 transition-all duration-300 ${
              isDragging
                ? "bg-primary/10 border-2 border-dashed border-primary"
                : "bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {selectedImage ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative w-full max-w-[300px]"
                >
                  <img
                    src={selectedImage}
                    alt="Reference"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">
                    Drop your reference image here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text prompt input (optional) */}
          <div className="p-4 border-t border-border/50">
            <label className="block text-sm text-muted-foreground mb-2">
              Optional: Add text guidance
            </label>
            <textarea
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              placeholder="e.g., Make it more colorful, add embroidery, change to silk fabric..."
              rows={2}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-muted/30 rounded-lg text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-end gap-3 px-4 pb-4">
            {selectedImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button
              variant="hero"
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedImage || isLoading}
              className="min-w-[160px]"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transform Image
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Helper text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-muted-foreground text-center mt-4"
      >
        Upload a reference image • Add optional text guidance • Generate a new design
      </motion.p>
    </div>
  );
};

export default ImageToImageInput;
