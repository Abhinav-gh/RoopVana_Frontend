import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Sparkles } from "lucide-react";

interface CreditPopupProps {
  awarded: number;
  capped: boolean;
  newBalance: number;
  onClose: () => void;
}

const CreditPopup = ({ awarded, capped, newBalance, onClose }: CreditPopupProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[90vw] max-w-sm"
      >
        <div className="glass-card border border-primary/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex flex-col items-center text-center gap-3">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.15, stiffness: 300 }}
              className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center"
            >
              {awarded > 0 ? (
                <Sparkles className="w-6 h-6 text-primary" />
              ) : (
                <Coins className="w-6 h-6 text-primary" />
              )}
            </motion.div>

            {/* Message */}
            {awarded > 0 ? (
              <>
                <h3 className="text-base font-semibold text-foreground">
                  Daily Credits Earned! 🎉
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You received <span className="font-bold text-primary">+{awarded}</span> credits today.
                  {capped && " (capped at maximum)"}
                </p>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Balance: {newBalance}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-foreground">
                  Credits at Maximum
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your credits have already reached the maximum limit.
                  No daily credits were added.
                </p>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Balance: {newBalance}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreditPopup;
