import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, ImageIcon, Paintbrush, Layers, Star, Download, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient, { GenerationHistoryItem } from "@/services/api";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const GenerationHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [selectedImage, setSelectedImage] = useState<GenerationHistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await apiClient.getGenerationHistory();
      setHistory(data.history);
    } catch (error: any) {
      toast.error(error.message || "Failed to load generation history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async (url: string, id: string) => {
    try {
      // Fetch the image as a blob so we avoid CORS download issues and force download
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `roopvana-generated-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <div className="container max-w-4xl mx-auto px-6 pt-32">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to App
            </button>
            <h1 className="text-3xl font-display font-semibold text-foreground flex items-center gap-4">
              Generation History
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse your previously generated fashion concepts.
            </p>
          </div>

          <div className="glass-card border border-primary/20 bg-primary/5 rounded-xl p-4 flex items-center gap-4 shrink-0 mt-4 md:mt-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Generations</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {loading ? "..." : history.length}
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="login-spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 glass-card rounded-2xl border border-border/50"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Generations Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              You haven't generated any images yet. Head back to the app to start creating!
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Start Generating
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-xl p-5 border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-accent/5 transition-colors cursor-pointer group"
                onClick={() => setSelectedImage(item)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        {item.type === 'text-to-image' ? <Paintbrush className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                        {item.type === 'image-to-image' ? 'Image Prompt' : 'Text Prompt'}
                      </Badge>
                      {item.outfitMode && (
                        <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-border/50">
                          <Layers className="w-3 h-3 mr-1" />
                          {item.outfitMode === 'full' ? 'Full Outfit' : 'Custom Outfit'}
                        </Badge>
                      )}
                      {item.style && (
                        <Badge variant="outline" className="opacity-80">
                          <Star className="w-3 h-3 mr-1" />
                          {item.style}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mt-2 line-clamp-2 pr-4">
                    "{item.prompt}"
                  </p>
                </div>
                
                {/* View Button */}
                <div className="shrink-0 self-end md:self-center">
                  <div className="px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                    View Image
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image Dialog Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border/50 gap-0">
          {selectedImage && (
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* Left Side: Image Display */}
              <div className="flex-1 bg-black/5 dark:bg-black/20 relative flex items-center justify-center min-h-[300px] group">
                {selectedImage.generatedImageUrl ? (
                  <>
                    <img 
                      src={selectedImage.generatedImageUrl} 
                      alt="Generated Fashion" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(selectedImage.generatedImageUrl!, selectedImage.id);
                        }}
                        className="p-2 bg-black/50 hover:bg-primary text-white rounded-full backdrop-blur-sm transition-colors cursor-pointer shadow-lg"
                        title="Download Image"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <ImageIcon className="w-12 h-12 opacity-50" />
                    <p>Image data unavailable</p>
                  </div>
                )}
              </div>
              
              {/* Right Side: Details Panel */}
              <div className="w-full md:w-[350px] shrink-0 border-t md:border-t-0 md:border-l border-border/50 flex flex-col bg-card/50 backdrop-blur-sm">
                <DialogHeader className="p-6 border-b border-border/50 text-left shrink-0">
                  <DialogTitle className="flex items-center gap-2">
                    Generation Details
                  </DialogTitle>
                  <DialogDescription>
                    {formatDate(selectedImage.timestamp)}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-secondary">
                      {selectedImage.type === 'image-to-image' ? 'Image + Text' : 'Text Prompt'}
                    </Badge>
                    {selectedImage.outfitMode && (
                      <Badge variant="outline">
                        Mode: {selectedImage.outfitMode}
                      </Badge>
                    )}
                    {selectedImage.language && (
                      <Badge variant="outline">
                        Lang: {selectedImage.language}
                      </Badge>
                    )}
                    <Badge variant="outline" className="opacity-70 text-[10px] ml-auto">
                      {(selectedImage.generationTimeMs / 1000).toFixed(1)}s
                    </Badge>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Paintbrush className="w-4 h-4 text-primary" /> 
                      Original Prompt
                    </h4>
                    <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/30 leading-relaxed whitespace-pre-wrap">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  {/* Improved Prompt */}
                  {selectedImage.improvedPrompt && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-6">
                        <Sparkles className="w-4 h-4 text-emerald-500" /> 
                        Enhanced Prompt
                      </h4>
                      <div className="text-sm text-muted-foreground bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 leading-relaxed max-h-[200px] overflow-y-auto text-xs whitespace-pre-wrap">
                        {selectedImage.improvedPrompt}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenerationHistoryPage;
