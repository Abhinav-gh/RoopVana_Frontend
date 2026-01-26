import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Globe, X } from "lucide-react";
import { Button } from "./ui/button";

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: { transcript: string };
}

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  detectedLanguage: string | null;
}

const placeholderPrompts = [
  "A royal Banarasi silk saree with golden zari work...",
  "Modern Indo-western fusion dress for cocktail party...",
  "Traditional Rajasthani lehenga with mirror work...",
  "Elegant kurta set with Lucknowi chikankari...",
  "Bridal ensemble with intricate kundan embroidery...",
];

// Pricing constants for Gemini 2.5 Flash Image
const PRICING = {
  INPUT_TOKEN_PRICE_USD: 0.30 / 1_000_000, // $0.30 per 1M tokens
  OUTPUT_IMAGE_PRICE_USD: 0.039, // $0.039 per image
  USD_TO_INR: 83, // Approximate exchange rate
  CHARS_PER_TOKEN: 4, // Rough estimate: 1 token ≈ 4 characters
};

// Estimate pricing in INR
const estimatePricing = (promptText: string): { tokens: number; costINR: string } => {
  // Estimate tokens (roughly 1 token per 4 characters)
  const estimatedTokens = Math.ceil(promptText.length / PRICING.CHARS_PER_TOKEN);
  
  // Calculate input cost
  const inputCostUSD = estimatedTokens * PRICING.INPUT_TOKEN_PRICE_USD;
  
  // Total cost (input + output image)
  const totalCostUSD = inputCostUSD + PRICING.OUTPUT_IMAGE_PRICE_USD;
  
  // Convert to INR
  const totalCostINR = totalCostUSD * PRICING.USD_TO_INR;
  
  return {
    tokens: estimatedTokens,
    costINR: totalCostINR.toFixed(2),
  };
};

const PromptInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  detectedLanguage,
}: PromptInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const [isVoiceInput, setIsVoiceInput] = useState(false); // Track if input is from voice
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Typing effect for placeholders
  useEffect(() => {
    if (value) return;

    const targetPlaceholder = placeholderPrompts[placeholderIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= targetPlaceholder.length) {
        setCurrentPlaceholder(targetPlaceholder.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholderPrompts.length);
        }, 3000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [placeholderIndex, value]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceLang;

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onChange(transcript);
        setIsVoiceInput(true); // Mark as voice input
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('🚫 Microphone access denied. Please allow microphone in browser settings.');
        } else if (event.error === 'no-speech') {
          alert('🔇 No speech detected. Please speak clearly and try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onChange, voiceLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setIsVoiceInput(true); // Mark that we're using voice input
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const clearInput = () => {
    onChange("");
    setIsVoiceInput(false); // Reset voice input flag
    textareaRef.current?.focus();
  };

  // Handle manual typing - reset voice input flag
  const handleManualChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setIsVoiceInput(false); // User is typing manually
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Main input container */}
        <div className="gradient-border">
          <div className="relative bg-card rounded-xl overflow-hidden">
            {/* Language indicator - Hide if voice input */}
            <AnimatePresence>
              {detectedLanguage && !isVoiceInput && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                >
                  <Globe className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    {detectedLanguage}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleManualChange}
              onKeyDown={handleKeyDown}
              placeholder={currentPlaceholder}
              rows={4}
              className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none p-6 ${
                detectedLanguage && !isVoiceInput ? "pt-14" : ""
              }`}
              disabled={isLoading}
            />

            {/* Bottom action bar */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-2">
                {/* Audio label box */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border/50">
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Audio
                  </span>
                </div>

                {/* Language selector for voice input */}
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  disabled={isLoading}
                  className="text-xs px-2 py-1 rounded-md bg-background/50 border border-border hover:bg-background/80 transition-colors cursor-pointer"
                  title="Voice input language"
                >
                  <option value="en-IN">🇮🇳 English</option>
                  <option value="hi-IN">🇮🇳 हिंदी</option>
                  <option value="ta-IN">🇮🇳 தமிழ்</option>
                  <option value="te-IN">🇮🇳 తెలుగు</option>
                  <option value="mr-IN">🇮🇳 मराठी</option>
                  <option value="pa-IN">🇮🇳 ਪੰਜਾਬੀ</option>
                  <option value="bn-IN">🇮🇳 বাংলা</option>
                  <option value="gu-IN">🇮🇳 ગુજરાતી</option>
                  <option value="kn-IN">🇮🇳 ಕನ್ನಡ</option>
                  <option value="ml-IN">🇮🇳 മലയാളം</option>
                  <option value="or-IN">🇮🇳 ଓଡ଼ିଆ</option>
                </select>

                {/* Voice input button */}
                <Button
                  variant="glass"
                  size="icon"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`relative ${isListening ? "text-primary" : ""}`}
                  title={isListening ? "Stop listening" : `Start voice input (${voiceLang})`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse-ring" />
                    </>
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>

                {/* Clear button */}
                <AnimatePresence>
                  {value && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearInput}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isListening && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-primary ml-2"
                  >
                    Listening in {voiceLang.split('-')[0].toUpperCase()}...
                  </motion.span>
                )}
              </div>

              {/* Generate button with pricing */}
              <div className="flex items-center gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={onSubmit}
                  disabled={!value.trim() || isLoading}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate</span>
                    </>
                  )}
                </Button>
                
                {/* Pricing estimate */}
                {value.trim() && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">~₹{estimatePricing(value).costINR}</span>
                    <span className="ml-1">({estimatePricing(value).tokens} tokens)</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground text-center mt-4"
        >
          Type or speak in any Indian language • Press Enter to generate
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PromptInput;