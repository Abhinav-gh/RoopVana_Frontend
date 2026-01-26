import { motion } from "framer-motion";
import { Mic, Globe2, Palette, Zap, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Globe2,
    title: "Multilingual Support",
    description:
      "Create in Hindi, Tamil, Telugu, and all major Indian languages with seamless AI translation.",
    gradient: "from-primary/20 to-accent/20",
  },
  {
    icon: Mic,
    title: "Voice Input",
    description:
      "Simply speak your design vision. Our AI captures every detail in your native language.",
    gradient: "from-secondary/20 to-primary/20",
  },
  {
    icon: Palette,
    title: "Fashion Intelligence",
    description:
      "AI trained on traditional Indian aesthetics, modern trends, and timeless elegance.",
    gradient: "from-accent/20 to-secondary/20",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description:
      "From thought to design in seconds. Premium quality outputs every single time.",
    gradient: "from-primary/20 to-secondary/20",
  },
  {
    icon: Shield,
    title: "Your Creations",
    description:
      "Full ownership of every design. Download, share, and use commercially.",
    gradient: "from-secondary/20 to-accent/20",
  },
  {
    icon: Sparkles,
    title: "Endless Possibilities",
    description:
      "From bridal to casual, traditional to fusion - create any fashion style imaginable.",
    gradient: "from-accent/20 to-primary/20",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pattern-overlay" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Designed for</span>{" "}
            <span className="gradient-text">Excellence</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every feature crafted to empower your creative vision with the 
            richness of Indian heritage and cutting-edge AI.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="gradient-border h-full">
                <div className="bg-card p-6 rounded-xl h-full">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
