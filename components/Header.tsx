import { motion } from "framer-motion";
import { Sparkles, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Fashion Intelligence
              </p>
            </div>
          </motion.div>

          {/* Theme Toggle, User & Logout */}
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
            {user && (
              <div className="flex items-center gap-3 ml-2">
                <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[150px]">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

