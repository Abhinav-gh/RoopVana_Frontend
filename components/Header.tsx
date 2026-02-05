import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-button flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 w-10 h-10 rounded-xl bg-gradient-button opacity-50 blur-lg animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">
                <span className="gradient-text">RoopVana</span>
                {/* <span className="text-foreground">AI</span> */}
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Fashion Intelligence
              </p>
            </div>
          </motion.div>

          {/* Navigation */}
          {/* <nav className="hidden md:flex items-center gap-8">
            {["Create"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav> */}

          {/* Theme Toggle & Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Gen AI Ready</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
