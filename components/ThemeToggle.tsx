import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          scale: resolvedTheme === "dark" ? 1 : 0,
          opacity: resolvedTheme === "dark" ? 1 : 0,
          rotate: resolvedTheme === "dark" ? 0 : 180,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-primary" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: resolvedTheme === "light" ? 1 : 0,
          opacity: resolvedTheme === "light" ? 1 : 0,
          rotate: resolvedTheme === "light" ? 0 : -180,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-amber-500" />
      </motion.div>
    </motion.button>
  );
}
