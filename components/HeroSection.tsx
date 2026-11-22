import { motion } from "framer-motion";
import { ArrowDown, Wand2, Globe2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LANGUAGES } from "@/lib/i18n";

const HeroSection = () => {
  const { lang, t, openPicker } = useLanguage();
  const currentLanguage = LANGUAGES.find((l) => l.code === lang);
  const scrollToCreate = () => {
    document.getElementById("create")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 pattern-overlay" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/30 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/20 mb-8"
          >
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {t("heroBadge")}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">{t("heroLine1")}</span>
            <br />
            <span className="gradient-text">{t("heroLine2")}</span>
            <br />
            <span className="text-foreground">{t("heroLine3")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t("heroSub")}
          </motion.p>

          {/* Current language — opens the language picker to change it
              (same as the language button in the header) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10 sm:mb-12 flex flex-col items-center gap-2"
          >
            <p className="text-sm text-muted-foreground">{t("chooseLang")}</p>
            <button
              type="button"
              translate="no"
              onClick={openPicker}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/40 bg-primary/10 text-foreground hover:bg-primary/20 hover:border-primary transition-colors"
            >
              <Globe2 className="w-4 h-4 text-primary" />
              <span className="font-semibold">{currentLanguage?.native}</span>
              <span className="text-xs text-muted-foreground">▾</span>
            </button>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={scrollToCreate}
            className="group inline-flex items-center gap-2 bg-gradient-button text-primary-foreground font-semibold px-8 py-4 rounded-xl shadow-button hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t("startCreating")}</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowDown className="w-5 h-5" />
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
