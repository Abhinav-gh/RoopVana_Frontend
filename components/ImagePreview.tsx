import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Maximize2, RefreshCw, ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface ImagePreviewProps {
  imageUrl: string | null;
  isLoading: boolean;
  prompt: string;
  onRegenerate: () => void;
  onGenerateBack?: () => void;
}

const ImagePreview = ({
  imageUrl,
  isLoading,
  prompt,
  onRegenerate,
  onGenerateBack,
}: ImagePreviewProps) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `vastra-ai-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RoopVana Creation",
          text: prompt,
          url: imageUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="gradient-border"
      >
        <div className="bg-card rounded-xl overflow-hidden">
          {/* Image container */}
          <div className="relative aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  {/* Animated loader */}
                  <div className="relative w-24 h-24">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-primary/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-accent border-b-transparent border-l-transparent"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ImageIcon className="w-8 h-8 text-primary/50" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.p
                      className="text-foreground font-medium mb-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Creating your design...
                    </motion.p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      AI is weaving together your vision
                    </p>
                  </div>
                </motion.div>
              ) : imageUrl ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full group"
                >
                  <img
                    src={imageUrl}
                    alt={prompt}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="glass" size="icon-lg">
                      <Maximize2 className="w-6 h-6" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 p-8 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">
                      Your creation will appear here
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Describe your fashion vision above
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action bar */}
          <AnimatePresence>
            {imageUrl && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 border-t border-border/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {prompt}
                  </p>
                    <div className="flex items-center gap-2">
                    {onGenerateBack && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onGenerateBack}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Back View
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRegenerate}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="accent" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ImagePreview;
