import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LogOut, Coins, Send, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/AuthContext";
import { useEffect, useState, useRef } from "react";
import apiClient from "@/services/api";
import type { UserCreditsResponse } from "@/services/api";
import CreditPopup from "./CreditPopup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [requestingCredits, setRequestingCredits] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [creditPopup, setCreditPopup] = useState<{
    awarded: number;
    capped: boolean;
    newBalance: number;
  } | null>(null);

  // Fetch credits once when user logs in
  useEffect(() => {
    if (user) {
      fetchCredits(true); // show popup on login
    } else {
      setCredits(null);
      setCreditPopup(null);
    }
  }, [user]);

  // Re-fetch credits when a generation completes
  useEffect(() => {
    const handler = () => fetchCredits();
    window.addEventListener('credits-updated', handler);
    return () => window.removeEventListener('credits-updated', handler);
  }, []);

  const fetchCredits = async (showPopup = false) => {
    setCreditsLoading(true);
    try {
      const data: UserCreditsResponse = await apiClient.getUserCredits();
      setCredits(data.credits);
      // Show popup if daily top-up happened (only on initial login fetch)
      if (showPopup && data.creditTopUp) {
        setCreditPopup(data.creditTopUp);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      setCredits(0);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleRequestCredits = async () => {
    setRequestingCredits(true);
    try {
      await apiClient.requestCredits();
      setRequestSent(true);
      setTimeout(() => setRequestSent(false), 3000);
    } catch (error) {
      console.error('Failed to request credits:', error);
    } finally {
      setRequestingCredits(false);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Extract initials from email (e.g. "john.doe@gmail.com" → "JD", "alice@x.com" → "A")
  const getInitials = (email: string): string => {
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
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

          {/* Right side: Credits, Theme, Avatar Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            {/* Credits Badge — always visible when logged in */}
            {user && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <button
                  onClick={() => fetchCredits()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer"
                  title="Click to refresh credits"
                >
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  {creditsLoading ? (
                    <div className="w-4 h-3 rounded bg-primary/20 animate-pulse" />
                  ) : (
                    <span className="text-xs font-semibold text-primary">
                      {credits ?? 0}
                    </span>
                  )}
                  <span className="hidden sm:inline text-xs text-muted-foreground">
                    credits
                  </span>
                </button>
              </motion.div>
            )}

            <ThemeToggle />

            {/* User Avatar + Dropdown */}
            {user && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform hover:scale-105"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8 cursor-pointer border border-primary/30 hover:border-primary/60 transition-colors">
                      <AvatarFallback className="bg-gradient-button text-primary-foreground text-xs font-semibold">
                        {getInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                  {/* User info */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Credits info inside dropdown too */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm">Credits</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {credits ?? 0}
                      </span>
                    </div>
                  </DropdownMenuLabel>

                  {/* Request credits */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleRequestCredits();
                    }}
                    disabled={requestingCredits}
                    className="cursor-pointer"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <AnimatePresence mode="wait">
                      {requestSent ? (
                        <motion.span
                          key="sent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-green-500 font-medium"
                        >
                          ✓ Request Sent!
                        </motion.span>
                      ) : (
                        <motion.span key="request">
                          {requestingCredits ? 'Sending...' : 'Request More Credits'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </DropdownMenuItem>

                  {/* Admin Dashboard */}
                  <DropdownMenuItem
                    onClick={() => { setDropdownOpen(false); navigate('/admin'); }}
                    className="cursor-pointer"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>

    {/* Credit top-up popup */}
    {creditPopup && (
      <CreditPopup
        awarded={creditPopup.awarded}
        capped={creditPopup.capped}
        newBalance={creditPopup.newBalance}
        onClose={() => setCreditPopup(null)}
      />
    )}
    </>
  );
};

export default Header;
