// Updated CreateSection.tsx with real API integration
// Replace the existing file at: frontend/src/components/CreateSection.tsx

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mic, MicOff, Sparkles, Globe, X, Edit2, RotateCcw, Plus } from "lucide-react";
import { Button } from "./ui/button";
import PromptInput from "./PromptInput";
import { CustomDropdown, DropdownOption } from './CustomDropdown';
import { EditOptionDialog } from './EditOptionDialog';
import ImagePreview from "./ImagePreview";
import ImageToImageInput from "./ImageToImageInput";
import apiClient from "@/services/api";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { AddOptionDialog } from "./AddOptionDialog";
import {
  FEMALE_STYLE_HIERARCHY,
  MALE_STYLE_HIERARCHY,
  StyleHierarchy,
  StyleCategory,
  Garment,
  Fabric,
  PrintType,
  COMMON_PRINTS,
  DEFAULT_FABRICS,
  FEMALE_UPPER_BODY_GARMENTS,
  FEMALE_LOWER_BODY_GARMENTS,
  MALE_UPPER_BODY_GARMENTS,
  MALE_LOWER_BODY_GARMENTS,
} from "./styleHierarchy";

// Language detection helper
const detectLanguage = (text: string): string | null => {
  if (!text.trim()) return null;
  
  const patterns: { [key: string]: RegExp } = {
    Hindi: /[\u0900-\u097F]/,
    Tamil: /[\u0B80-\u0BFF]/,
    Telugu: /[\u0C00-\u0C7F]/,
    Punjabi: /[\u0A00-\u0A7F]/,
    Bengali: /[\u0980-\u09FF]/,
    Gujarati: /[\u0A80-\u0AFF]/,
    Kannada: /[\u0C80-\u0CFF]/,
    Malayalam: /[\u0D00-\u0D7F]/,
    Marathi: /[\u0900-\u097F]/,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return lang;
  }

  return "English";
};

// Map detected language to language code
const getLanguageCode = (detectedLang: string | null): string => {
  const languageMap: { [key: string]: string } = {
    'Hindi': 'hi-IN',
    'Tamil': 'ta-IN',
    'Telugu': 'te-IN',
    'Punjabi': 'pa-IN',
    'Bengali': 'bn-IN',
    'Gujarati': 'gu-IN',
    'Kannada': 'kn-IN',
    'Malayalam': 'ml-IN',
    'Marathi': 'mr-IN',
    'English': 'en-IN',
  };

  return languageMap[detectedLang || 'English'] || 'en-IN';
};

// Style categories with their internal prompt enhancements
interface StyleDefinition {
  label: string;
  prompt: string;
  icon: string;
  category: 'indian' | 'western' | 'asian' | 'fusion';
}

// ============ FEMALE STYLES ============
const FEMALE_STYLES: { [key: string]: StyleDefinition } = {
  // ===== INDIAN STYLES =====
  traditional_saree: {
    label: "Traditional Saree",
    icon: "🥻",
    category: "indian",
    prompt: "Traditional Indian saree with classical draping, heritage patterns, elegant pallu, feminine silhouette",
  },
  kanjivaram: {
    label: "Kanjivaram",
    icon: "🎀",
    category: "indian",
    prompt: "South Indian Kanjivaram silk saree, rich gold zari work, temple borders, contrast pallu, lustrous mulberry silk",
  },
  banarasi: {
    label: "Banarasi",
    icon: "👑",
    category: "indian",
    prompt: "Varanasi Banarasi brocade saree, intricate gold and silver zari, Mughal-inspired motifs, luxurious silk",
  },
  paithani: {
    label: "Paithani",
    icon: "🦚",
    category: "indian",
    prompt: "Maharashtrian Paithani silk saree, peacock motifs, gold zari borders, rich jewel tones",
  },
  chanderi: {
    label: "Chanderi",
    icon: "🌙",
    category: "indian",
    prompt: "Chanderi saree, lightweight sheer texture, subtle gold zari borders, peacock motifs",
  },
  chikankari: {
    label: "Chikankari",
    icon: "🪡",
    category: "indian",
    prompt: "Lucknowi Chikankari embroidered suit, delicate white threadwork, shadow work, Mughal elegance",
  },
  phulkari: {
    label: "Phulkari",
    icon: "🌸",
    category: "indian",
    prompt: "Punjabi Phulkari embroidered suit, vibrant floral threadwork, bright colors, traditional dupatta",
  },
  lehenga: {
    label: "Lehenga",
    icon: "💃",
    category: "indian",
    prompt: "Bridal lehenga choli, heavy embroidery, flared skirt, matching dupatta, wedding grandeur",
  },
  anarkali: {
    label: "Anarkali",
    icon: "🌺",
    category: "indian",
    prompt: "Anarkali suit, floor-length flared kurta, fitted bodice, flowing silhouette, elegant churidar",
  },
  sharara: {
    label: "Sharara",
    icon: "👘",
    category: "indian",
    prompt: "Sharara suit, wide-leg flared pants, short kurta, traditional dupatta, festive elegance",
  },
  
  // ===== WESTERN STYLES =====
  modern_dress: {
    label: "Modern Dress",
    icon: "👗",
    category: "western",
    prompt: "Contemporary dress design, clean lines, elegant silhouette, modern feminine fashion",
  },
  bohemian: {
    label: "Bohemian",
    icon: "🌻",
    category: "western",
    prompt: "Boho style, flowing fabrics, earthy tones, layered textures, fringe details, free-spirited fashion",
  },
  minimalist: {
    label: "Minimalist",
    icon: "⬜",
    category: "western",
    prompt: "Clean minimalist fashion, neutral colors, simple silhouettes, understated elegance",
  },
  couture: {
    label: "Haute Couture",
    icon: "✨",
    category: "western",
    prompt: "High fashion couture, avant-garde silhouettes, dramatic details, luxury fabrics, runway-ready",
  },
  cottagecore: {
    label: "Cottagecore",
    icon: "🌿",
    category: "western",
    prompt: "Cottagecore dress, floral prints, puff sleeves, lace trim, romantic pastoral style",
  },
  evening_gown: {
    label: "Evening Gown",
    icon: "🎭",
    category: "western",
    prompt: "Elegant evening gown, floor-length, luxurious fabric, sophisticated design, formal occasion",
  },
  cocktail_dress: {
    label: "Cocktail Dress",
    icon: "🍸",
    category: "western",
    prompt: "Stylish cocktail dress, knee-length, party-ready, elegant yet fun, evening wear",
  },
  victorian: {
    label: "Victorian",
    icon: "🎩",
    category: "western",
    prompt: "Victorian era fashion, high collars, lace details, puffed sleeves, dark romantic aesthetic",
  },
  maxi_dress: {
    label: "Maxi Dress",
    icon: "👒",
    category: "western",
    prompt: "Flowing maxi dress, floor-length, summer style, comfortable elegance, vacation wear",
  },
  power_suit: {
    label: "Power Suit",
    icon: "💼",
    category: "western",
    prompt: "Feminine power suit, tailored blazer, professional elegance, boss lady fashion",
  },
  
  // ===== ADDITIONAL INDIAN STYLES =====
  patola: {
    label: "Patola",
    icon: "💎",
    category: "indian",
    prompt: "Gujarati Patola double ikat silk saree, geometric motifs, vibrant jewel tones, royal heritage",
  },
  bandhani: {
    label: "Bandhani",
    icon: "🔵",
    category: "indian",
    prompt: "Bandhani tie-dye saree, intricate dot patterns, vibrant colors, Rajasthani heritage",
  },
  zardozi: {
    label: "Zardozi",
    icon: "⭐",
    category: "indian",
    prompt: "Royal Zardozi embroidered outfit, gold metallic threadwork, Mughal court elegance",
  },
  kashmiri: {
    label: "Kashmiri",
    icon: "❄️",
    category: "indian",
    prompt: "Kashmiri embroidered suit, pashmina fabric, intricate paisley patterns, elegant warmth",
  },
  salwar_kameez: {
    label: "Salwar Kameez",
    icon: "👚",
    category: "indian",
    prompt: "Classic salwar kameez, comfortable traditional wear, elegant kurta with matching bottoms",
  },
  palazzo_suit: {
    label: "Palazzo Suit",
    icon: "🌷",
    category: "indian",
    prompt: "Palazzo suit, wide-leg palazzo pants, short kurta, modern traditional fusion",
  },
  party_wear: {
    label: "Party Wear",
    icon: "🎉",
    category: "indian",
    prompt: "Glamorous party wear, sequins and embellishments, festive occasion, celebration ready",
  },
  crop_top_set: {
    label: "Crop Top Set",
    icon: "✂️",
    category: "indian",
    prompt: "Modern crop top with lehenga skirt, contemporary ethnic wear, trendy fusion style",
  },

  // ===== FUSION STYLES =====
  indo_western: {
    label: "Indo-Western",
    icon: "🌐",
    category: "fusion",
    prompt: "Indo-Western fusion, blend of Indian and Western elements, contemporary with traditional embellishments",
  },
  modern_saree: {
    label: "Modern Saree",
    icon: "⚡",
    category: "fusion",
    prompt: "Contemporary saree draping, pre-stitched style, modern blouse design, fusion fashion",
  },
};

// ============ MALE STYLES ============
const MALE_STYLES: { [key: string]: StyleDefinition } = {
  // ===== INDIAN STYLES =====
  sherwani: {
    label: "Sherwani",
    icon: "🤵",
    category: "indian",
    prompt: "Traditional sherwani, rich brocade fabric, intricate embroidery, regal wedding wear, Mughal elegance",
  },
  kurta_pajama: {
    label: "Kurta Pajama",
    icon: "👕",
    category: "indian",
    prompt: "Classic kurta pajama set, comfortable cotton or silk, traditional neckline, festive Indian menswear",
  },
  bandhgala: {
    label: "Bandhgala",
    icon: "🎖️",
    category: "indian",
    prompt: "Nehru jacket bandhgala suit, mandarin collar, structured fit, formal Indian menswear, royal aesthetic",
  },
  pathani: {
    label: "Pathani Suit",
    icon: "🧥",
    category: "indian",
    prompt: "Pathani suit, loose-fitting kurta with salwar, comfortable cotton, traditional Afghan-inspired menswear",
  },
  dhoti_kurta: {
    label: "Dhoti Kurta",
    icon: "🙏",
    category: "indian",
    prompt: "Traditional dhoti with kurta, draped lower garment, cultural authenticity, ceremonial menswear",
  },
  jodhpuri: {
    label: "Jodhpuri Suit",
    icon: "👑",
    category: "indian",
    prompt: "Jodhpuri suit, structured jacket, slim trousers, royal Rajasthani elegance, formal occasion",
  },
  angrakha: {
    label: "Angrakha",
    icon: "📿",
    category: "indian",
    prompt: "Angrakha style kurta, overlapping front panels, tie fastenings, traditional Mughal-era design",
  },
  achkan: {
    label: "Achkan",
    icon: "🎩",
    category: "indian",
    prompt: "Achkan coat, knee-length jacket, fitted silhouette, intricate buttons, royal Indian menswear",
  },
  
  // ===== WESTERN STYLES =====
  formal_suit: {
    label: "Formal Suit",
    icon: "👔",
    category: "western",
    prompt: "Classic formal suit, tailored fit, professional menswear, clean lines, sophisticated style",
  },
  casual: {
    label: "Casual",
    icon: "👕",
    category: "western",
    prompt: "Casual menswear, relaxed fit, comfortable fabrics, everyday style, modern aesthetic",
  },
  streetwear: {
    label: "Streetwear",
    icon: "🛹",
    category: "western",
    prompt: "Urban streetwear, oversized fits, graphic elements, sneaker culture, contemporary youth fashion",
  },
  minimalist: {
    label: "Minimalist",
    icon: "⬜",
    category: "western",
    prompt: "Minimalist menswear, neutral palette, clean silhouettes, understated elegance",
  },
  preppy: {
    label: "Preppy",
    icon: "🎓",
    category: "western",
    prompt: "Preppy style, polo shirts, chinos, loafers, Ivy League aesthetic, smart casual",
  },
  tuxedo: {
    label: "Tuxedo",
    icon: "🎀",
    category: "western",
    prompt: "Classic tuxedo, black tie formal, satin lapels, elegant evening wear, gala ready",
  },
  business_casual: {
    label: "Business Casual",
    icon: "💼",
    category: "western",
    prompt: "Business casual attire, smart trousers, button-down shirt, professional yet relaxed",
  },
  bomber_jacket: {
    label: "Bomber Style",
    icon: "🧥",
    category: "western",
    prompt: "Bomber jacket outfit, casual cool style, urban fashion, layered look",
  },
  grunge: {
    label: "Grunge",
    icon: "🎸",
    category: "western",
    prompt: "90s grunge style, distressed denim, flannel, edgy rebellious fashion",
  },
  athleisure: {
    label: "Athleisure",
    icon: "🏃",
    category: "western",
    prompt: "Athleisure wear, sporty casual, comfortable yet stylish, modern active fashion",
  },
  
  // ===== ADDITIONAL INDIAN STYLES =====
  lucknowi_kurta: {
    label: "Lucknowi Kurta",
    icon: "🪡",
    category: "indian",
    prompt: "Lucknowi chikankari kurta, delicate embroidery, elegant menswear, festive sophistication",
  },
  bundi_jacket: {
    label: "Bundi Jacket",
    icon: "🎽",
    category: "indian",
    prompt: "Bundi jacket with kurta, sleeveless Nehru jacket, Rajasthani royal style, festive wear",
  },
  zardozi_sherwani: {
    label: "Zardozi Sherwani",
    icon: "✨",
    category: "indian",
    prompt: "Zardozi embroidered sherwani, gold metallic work, royal wedding wear, Mughal grandeur",
  },
  royal_look: {
    label: "Royal Look",
    icon: "👑",
    category: "indian",
    prompt: "Royal Indian menswear, maharaja inspired, rich fabrics, regal accessories, heritage elegance",
  },
  wedding_groom: {
    label: "Wedding Groom",
    icon: "💒",
    category: "indian",
    prompt: "Indian groom wedding attire, heavy embellishments, coordinated outfit, dulha fashion",
  },
  sangeet_wear: {
    label: "Sangeet Wear",
    icon: "🎵",
    category: "indian",
    prompt: "Sangeet ceremony outfit, colorful festive wear, dance-ready, celebration fashion",
  },

  // ===== FUSION STYLES =====
  indo_western: {
    label: "Indo-Western",
    icon: "🌐",
    category: "fusion",
    prompt: "Indo-Western fusion for men, contemporary silhouettes with traditional Indian embellishments",
  },
  modern_kurta: {
    label: "Modern Kurta",
    icon: "⚡",
    category: "fusion",
    prompt: "Contemporary kurta design, modern cuts, updated silhouettes, fusion of traditional and trendy",
  },
  ethnic_fusion: {
    label: "Ethnic Fusion",
    icon: "🎨",
    category: "fusion",
    prompt: "Ethnic fusion menswear, blend of cultures, global fashion meets Indian heritage",
  },
};

// Keep a combined reference for backwards compatibility
const STYLE_PROMPTS = { ...FEMALE_STYLES, ...MALE_STYLES };

// Category labels and order
const STYLE_CATEGORIES = {
  indian: { label: "🇮🇳 Indian", order: 1 },
  western: { label: "🌍 Western", order: 2 },
  asian: { label: "🌏 Asian", order: 3 },
  fusion: { label: "🔀 Fusion", order: 4 },
};

// Group styles by category
const getStylesByCategory = (styles: typeof STYLE_PROMPTS) => {
  const grouped: { [key: string]: { key: string; style: StyleDefinition }[] } = {};
  Object.entries(styles).forEach(([key, style]) => {
    if (!grouped[style.category]) grouped[style.category] = [];
    grouped[style.category].push({ key, style });
  });
  return grouped;
};

// Gender-specific body type options
const FEMALE_BODY_TYPES: { [key: string]: { label: string; icon: string; prompt: string } } = {
  any: { label: "Any", icon: "✨", prompt: "" },
  hourglass: { label: "Hourglass", icon: "⏳", prompt: "hourglass figure, balanced bust and hips, defined waist" },
  pear: { label: "Pear", icon: "🍐", prompt: "pear shaped body, wider hips, narrower shoulders" },
  apple: { label: "Apple", icon: "🍎", prompt: "apple shaped body, fuller midsection" },
  athletic: { label: "Athletic", icon: "💪", prompt: "athletic feminine body, toned physique, fit build" },
  petite: { label: "Petite", icon: "🌷", prompt: "petite body type, small frame, delicate feminine build" },
  tall: { label: "Tall", icon: "📏", prompt: "tall feminine body, long legs, elegant silhouette" },
  plus_size: { label: "Plus Size", icon: "🌸", prompt: "plus size feminine body, full figured, body positive" },
};

const MALE_BODY_TYPES: { [key: string]: { label: string; icon: string; prompt: string } } = {
  any: { label: "Any", icon: "✨", prompt: "" },
  athletic: { label: "Athletic", icon: "💪", prompt: "athletic male body, toned muscular physique" },
  slim: { label: "Slim", icon: "🧍", prompt: "slim male body type, lean slender figure" },
  muscular: { label: "Muscular", icon: "🏋️", prompt: "muscular male body, well-built, broad shoulders" },
  average: { label: "Average", icon: "👤", prompt: "average male body type, regular build" },
  tall: { label: "Tall", icon: "📏", prompt: "tall male body type, long limbs, commanding presence" },
  stocky: { label: "Stocky", icon: "🧱", prompt: "stocky male body, broad sturdy build" },
};

// Keep for backwards compatibility
const BODY_TYPE_OPTIONS = { ...FEMALE_BODY_TYPES, ...MALE_BODY_TYPES };

// Sleeve length options for upper body
const SLEEVE_LENGTH_OPTIONS: { [key: string]: { label: string; icon: string; prompt: string } } = {
  any: { label: "Any", icon: "👕", prompt: "" },
  sleeveless: { label: "Sleeveless", icon: "🎽", prompt: "sleeveless, no sleeves, bare arms" },
  short: { label: "Short", icon: "👕", prompt: "short sleeves, above elbow" },
  elbow: { label: "Elbow", icon: "🥋", prompt: "elbow length sleeves, mid-arm" },
  threequarter: { label: "3/4", icon: "🧥", prompt: "three-quarter sleeves, below elbow" },
  full: { label: "Full", icon: "🧥", prompt: "full length sleeves, wrist length" },
  bell: { label: "Bell", icon: "🛎️", prompt: "bell sleeves, flared wide sleeves" },
  puff: { label: "Puff", icon: "🎈", prompt: "puff sleeves, voluminous gathered sleeves" },
};

// Female Footwear options
const FEMALE_FOOTWEAR: { [key: string]: { label: string; icon: string; prompt: string } } = {
  any: { label: "Any", icon: "👟", prompt: "" },
  none: { label: "None", icon: "❌", prompt: "barefoot, no shoes" }, // Added None option
  heels: { label: "Heels", icon: "👠", prompt: "high heels, stilettos, elegant feminine footwear" },
  flats: { label: "Flats", icon: "🥿", prompt: "ballet flats, comfortable feminine footwear" },
  sandals: { label: "Sandals", icon: "👡", prompt: "strappy sandals, feminine open footwear" },
  wedges: { label: "Wedges", icon: "👠", prompt: "wedge heels, platform wedges" },
  pumps: { label: "Pumps", icon: "👠", prompt: "classic pumps, court shoes" },
  boots: { label: "Boots", icon: "👢", prompt: "feminine boots, ankle or knee-high boots" },
  juttis: { label: "Juttis", icon: "🥿", prompt: "traditional juttis, embroidered ethnic footwear" },
  kolhapuri: { label: "Kolhapuri", icon: "👡", prompt: "Kolhapuri chappals, traditional leather sandals" },
  sneakers: { label: "Sneakers", icon: "👟", prompt: "stylish sneakers, casual athletic shoes" },
  mules: { label: "Mules", icon: "👡", prompt: "mules, backless slip-on shoes" },
  barefoot: { label: "Barefoot", icon: "🦶", prompt: "barefoot, no footwear" },
};

// Male Footwear options
const MALE_FOOTWEAR: { [key: string]: { label: string; icon: string; prompt: string } } = {
  any: { label: "Any", icon: "👟", prompt: "" },
  none: { label: "None", icon: "❌", prompt: "barefoot, no shoes" }, // Added None option
  oxfords: { label: "Oxfords", icon: "👞", prompt: "oxford shoes, formal lace-up shoes" },
  loafers: { label: "Loafers", icon: "👞", prompt: "loafers, slip-on formal shoes" },
  boots: { label: "Boots", icon: "🥾", prompt: "men's boots, ankle or high boots" },
  sneakers: { label: "Sneakers", icon: "👟", prompt: "sneakers, casual athletic shoes" },
  sandals: { label: "Sandals", icon: "🩴", prompt: "men's sandals, leather sandals" },
  juttis: { label: "Juttis", icon: "🥿", prompt: "traditional juttis, Punjabi mojari, ethnic footwear" },
  kolhapuri: { label: "Kolhapuri", icon: "👡", prompt: "Kolhapuri chappals, traditional leather sandals" },
  brogues: { label: "Brogues", icon: "👞", prompt: "brogue shoes, perforated leather shoes" },
  monks: { label: "Monk Straps", icon: "👞", prompt: "monk strap shoes, buckle closure formal shoes" },
  derby: { label: "Derby", icon: "👞", prompt: "derby shoes, open lacing formal shoes" },
  barefoot: { label: "Barefoot", icon: "🦶", prompt: "barefoot, no footwear" },
};

// Female Headwear options
const FEMALE_HEADWEAR: { [key: string]: { label: string; icon: string; prompt: string } } = {
  none: { label: "None", icon: "❌", prompt: "" },
  dupatta: { label: "Dupatta", icon: "🧣", prompt: "dupatta draped over head, traditional head covering" },
  maangtika: { label: "Maang Tikka", icon: "💎", prompt: "maang tikka, forehead jewelry, bridal headpiece" },
  tiara: { label: "Tiara", icon: "👑", prompt: "tiara, elegant crown headpiece" },
  hair_accessories: { label: "Hair Pins", icon: "📍", prompt: "decorative hair pins, hair accessories" },
  headband: { label: "Headband", icon: "👸", prompt: "elegant headband, hair band" },
  floral: { label: "Floral Crown", icon: "🌸", prompt: "floral crown, flower headpiece" },
  veil: { label: "Veil", icon: "👰", prompt: "bridal veil, sheer head covering" },
  hat: { label: "Hat", icon: "👒", prompt: "elegant hat, sun hat" },
  turban: { label: "Turban", icon: "🧕", prompt: "feminine turban, head wrap" },
};

// Male Headwear options
const MALE_HEADWEAR: { [key: string]: { label: string; icon: string; prompt: string } } = {
  none: { label: "None", icon: "❌", prompt: "" },
  turban: { label: "Turban", icon: "🧑‍🦰", prompt: "pagri, traditional turban, safa" },
  topi: { label: "Topi", icon: "🎩", prompt: "traditional topi, Nehru cap" },
  sehra: { label: "Sehra", icon: "👑", prompt: "sehra, groom's headdress with face veil" },
  pagri: { label: "Pagri", icon: "👳", prompt: "pagri, Rajasthani turban, colorful headwear" },
  safa: { label: "Safa", icon: "👳", prompt: "safa, wedding turban, ornate headpiece" },
  fedora: { label: "Fedora", icon: "🎩", prompt: "fedora hat, stylish formal hat" },
  cap: { label: "Cap", icon: "🧢", prompt: "modern cap, casual headwear" },
  crown: { label: "Crown", icon: "👑", prompt: "royal crown, regal headpiece" },
};

// Keep for backwards compatibility
const FOOTWEAR_OPTIONS = { ...FEMALE_FOOTWEAR, ...MALE_FOOTWEAR };

// Color name detection from hex value
const getColorNameFromHex = (hex: string): { name: string; prompt: string } => {
  // Remove # if present
  const cleanHex = hex.replace('#', '').toLowerCase();
  
  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convert RGB to HSL for better color detection
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  // Determine color name based on HSL values
  if (lPercent < 10) return { name: "Black", prompt: "black colored clothing, deep dark elegant" };
  if (lPercent > 90) return { name: "White", prompt: "white colored clothing, pure cream ivory" };
  if (s < 10) {
    if (lPercent < 30) return { name: "Dark Gray", prompt: "dark gray colored clothing, charcoal" };
    if (lPercent < 70) return { name: "Gray", prompt: "gray colored clothing, neutral tones" };
    return { name: "Light Gray", prompt: "light gray colored clothing, silver tones" };
  }
  
  // Color wheel detection
  if (h < 15 || h >= 345) return { name: "Red", prompt: "red colored clothing, crimson scarlet" };
  if (h < 30) return { name: "Orange-Red", prompt: "orange-red colored clothing, vermillion coral" };
  if (h < 45) return { name: "Orange", prompt: "orange colored clothing, tangerine amber" };
  if (h < 60) return { name: "Gold", prompt: "golden colored clothing, gold embellishments, warm metallic" };
  if (h < 75) return { name: "Yellow", prompt: "yellow colored clothing, sunny bright" };
  if (h < 105) return { name: "Lime", prompt: "lime green colored clothing, chartreuse, fresh" };
  if (h < 135) return { name: "Green", prompt: "green colored clothing, emerald forest" };
  if (h < 165) return { name: "Teal", prompt: "teal colored clothing, cyan turquoise" };
  if (h < 195) return { name: "Cyan", prompt: "cyan colored clothing, aqua blue" };
  if (h < 225) return { name: "Sky Blue", prompt: "sky blue colored clothing, light azure" };
  if (h < 255) return { name: "Blue", prompt: "blue colored clothing, navy royal blue" };
  if (h < 285) return { name: "Purple", prompt: "purple colored clothing, violet indigo" };
  if (h < 315) return { name: "Magenta", prompt: "magenta colored clothing, fuchsia vibrant" };
  if (h < 345) return { name: "Pink", prompt: "pink colored clothing, rose blush" };
  
  return { name: "Custom", prompt: `custom colored clothing with hex ${hex}` };
};

// Preset color palette for simple dropdown selection
const COLOR_PALETTE: { [key: string]: { label: string; hex: string; prompt: string } } = {
  any: { label: "Any Color", hex: "", prompt: "" },
  black: { label: "🖤 Black", hex: "#000000", prompt: "black colored clothing, deep dark elegant" },
  white: { label: "🤍 White", hex: "#FFFFFF", prompt: "white colored clothing, pure cream ivory" },
  red: { label: "❤️ Red", hex: "#DC143C", prompt: "red colored clothing, crimson scarlet" },
  maroon: { label: "🟤 Maroon", hex: "#800000", prompt: "maroon colored clothing, deep wine burgundy" },
  gold: { label: "💛 Gold", hex: "#FFD700", prompt: "golden colored clothing, gold embellishments, warm metallic" },
  yellow: { label: "🌟 Yellow", hex: "#FFD93D", prompt: "yellow colored clothing, sunny bright" },
  orange: { label: "🧡 Orange", hex: "#FF6B35", prompt: "orange colored clothing, tangerine amber" },
  pink: { label: "💗 Pink", hex: "#FF69B4", prompt: "pink colored clothing, rose blush" },
  magenta: { label: "💜 Magenta", hex: "#FF00FF", prompt: "magenta colored clothing, fuchsia vibrant" },
  purple: { label: "💟 Purple", hex: "#9B59B6", prompt: "purple colored clothing, violet indigo" },
  blue: { label: "💙 Blue", hex: "#3498DB", prompt: "blue colored clothing, navy royal blue" },
  navy: { label: "🌑 Navy", hex: "#000080", prompt: "navy blue colored clothing, deep midnight blue" },
  teal: { label: "💎 Teal", hex: "#008080", prompt: "teal colored clothing, cyan turquoise" },
  green: { label: "💚 Green", hex: "#27AE60", prompt: "green colored clothing, emerald forest" },
  olive: { label: "🫒 Olive", hex: "#808000", prompt: "olive colored clothing, earthy green" },
  beige: { label: "🏖️ Beige", hex: "#F5F5DC", prompt: "beige colored clothing, nude cream" },
  brown: { label: "🤎 Brown", hex: "#8B4513", prompt: "brown colored clothing, chocolate coffee" },
  gray: { label: "🩶 Gray", hex: "#808080", prompt: "gray colored clothing, silver neutral" },
  silver: { label: "✨ Silver", hex: "#C0C0C0", prompt: "silver metallic clothing, shimmering gray" },
  peach: { label: "🍑 Peach", hex: "#FFCBA4", prompt: "peach colored clothing, soft coral" },
  coral: { label: "🪸 Coral", hex: "#FF7F50", prompt: "coral colored clothing, warm tropical" },
};

// Posture options
const POSTURE_OPTIONS: { [key: string]: { label: string; icon: string; prompt: string } } = {
  standing: { label: "Standing", icon: "🧍", prompt: "standing pose, full body view" },
  walking: { label: "Walking", icon: "🚶", prompt: "walking pose, mid-stride, natural movement" },
  sitting: { label: "Sitting", icon: "🪑", prompt: "sitting pose, seated elegantly" },
  side_view: { label: "Side", icon: "👤", prompt: "side profile view, lateral angle" },
  back_view: { label: "Back", icon: "🔙", prompt: "back view showing outfit from behind" },
};

// Gender-specific person type options
const FEMALE_PERSON_TYPES: { [key: string]: { label: string; icon: string; prompt: string } } = {
  woman: {
    label: "Woman",
    icon: "👩",
    prompt: "adult woman, feminine fashion, women's wear",
  },
  young_woman: {
    label: "Young Woman",
    icon: "👩‍🦱",
    prompt: "young woman in her 20s, youthful feminine style, trendy fashion",
  },
  teen_girl: {
    label: "Girl (Teen)",
    icon: "👧",
    prompt: "teenage girl, modest teen fashion, age-appropriate youthful style",
  },
  child_girl: {
    label: "Girl (Child)",
    icon: "🧒",
    prompt: "young girl child, kids fashion, playful modest children's wear",
  },
  mature_woman: {
    label: "Mature Woman",
    icon: "👵",
    prompt: "mature elegant woman, sophisticated fashion, timeless graceful style",
  },
};

const MALE_PERSON_TYPES: { [key: string]: { label: string; icon: string; prompt: string } } = {
  man: {
    label: "Man",
    icon: "👨",
    prompt: "adult man, masculine fashion, men's wear",
  },
  young_man: {
    label: "Young Man",
    icon: "👨‍🦱",
    prompt: "young man in his 20s, youthful masculine style, contemporary fashion",
  },
  teen_boy: {
    label: "Boy (Teen)",
    icon: "👦",
    prompt: "teenage boy, modest teen fashion, age-appropriate youthful style",
  },
  child_boy: {
    label: "Boy (Child)",
    icon: "🧒",
    prompt: "young boy child, kids fashion, playful modest children's wear",
  },
  mature_man: {
    label: "Mature Man",
    icon: "👴",
    prompt: "mature distinguished man, classic sophisticated fashion, refined style",
  },
};

// Simplified style categories for custom clothing mode (upper body)
const UPPER_BODY_STYLES: { [key: string]: { label: string; icon: string; prompt: string } } = {
  traditional: {
    label: "Traditional",
    icon: "🏛️",
    prompt: "traditional ethnic upper wear, heritage patterns, classical motifs",
  },
  modern: {
    label: "Modern",
    icon: "✨",
    prompt: "contemporary upper wear, clean lines, minimalist design",
  },
  casual: {
    label: "Casual",
    icon: "👕",
    prompt: "casual relaxed upper wear, comfortable everyday style",
  },
  formal: {
    label: "Formal",
    icon: "👔",
    prompt: "formal upper wear, professional elegant style, refined look",
  },
  festive: {
    label: "Festive",
    icon: "🎉",
    prompt: "festive celebration upper wear, embellished, party style",
  },
  embroidered: {
    label: "Embroidered",
    icon: "🧵",
    prompt: "embroidered upper wear, intricate threadwork, handcrafted details",
  },
};

// Simplified style categories for custom clothing mode (lower body)
const LOWER_BODY_STYLES: { [key: string]: { label: string; icon: string; prompt: string } } = {
  traditional: {
    label: "Traditional",
    icon: "🏛️",
    prompt: "traditional ethnic lower wear, heritage patterns, classical design",
  },
  modern: {
    label: "Modern",
    icon: "✨",
    prompt: "contemporary lower wear, clean lines, sleek design",
  },
  casual: {
    label: "Casual",
    icon: "👖",
    prompt: "casual relaxed lower wear, comfortable everyday pants/skirt",
  },
  formal: {
    label: "Formal",
    icon: "📋",
    prompt: "formal lower wear, professional tailored style",
  },
  flowy: {
    label: "Flowy",
    icon: "💨",
    prompt: "flowy draped lower wear, elegant movement, graceful silhouette",
  },
  fitted: {
    label: "Fitted",
    icon: "📐",
    prompt: "fitted lower wear, streamlined silhouette, tailored fit",
  },
};

// Outfit mode type
type OutfitMode = 'full' | 'custom';

// Frequent style usage tracking interface
interface StyleUsageEntry {
  styleKey: string;
  count: number;
  lastUsed: number;
}

// Generation mode types
type GenerationMode = 'text' | 'image';

// Generation history type
interface GenerationHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

const CreateSection = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  
  // Primary gender selection
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  
  // Outfit mode: full outfit (single style) or custom (upper + lower)
  const [outfitMode, setOutfitMode] = useState<OutfitMode>('full');
  
  // Style selections
  const [selectedStyle, setSelectedStyle] = useState<string>("traditional_saree");
  const [selectedUpperStyle, setSelectedUpperStyle] = useState<string>("traditional");
  const [selectedLowerStyle, setSelectedLowerStyle] = useState<string>("traditional");
  
  // 3-Level Hierarchy Style Selections (Category -> Garment -> Fabric -> Print)
  const [selectedCategory, setSelectedCategory] = useState<string>("indian");
  const [selectedGarment, setSelectedGarment] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedPrint, setSelectedPrint] = useState<string | null>(null);
  
  // Custom Mode: Upper Body Hierarchy (Garment -> Fabric -> Print)
  const [selectedUpperGarment, setSelectedUpperGarment] = useState<string | null>(null);
  const [selectedUpperFabric, setSelectedUpperFabric] = useState<string | null>(null);
  const [selectedUpperPrint, setSelectedUpperPrint] = useState<string | null>(null);
  
  // Custom Mode: Lower Body Hierarchy (Garment -> Fabric -> Print)
  const [selectedLowerGarment, setSelectedLowerGarment] = useState<string | null>(null);
  const [selectedLowerFabric, setSelectedLowerFabric] = useState<string | null>(null);
  const [selectedLowerPrint, setSelectedLowerPrint] = useState<string | null>(null);
  
  // Custom hierarchy items (user-added categories, garments, fabrics, prints)
  const [customCategories, setCustomCategories] = useState<{ [key: string]: { label: string; icon: string } }>({});
  const [customGarments, setCustomGarments] = useState<{ [key: string]: { label: string; icon: string; prompt: string } }>({});
  const [customFabrics, setCustomFabrics] = useState<{ [key: string]: { label: string; icon: string; prompt: string } }>({});
  const [customPrints, setCustomPrints] = useState<{ [key: string]: { label: string; icon: string; prompt: string } }>({});

  // NEW: Custom options for Upper/Lower Body hierarchies + other dropdowns
  const [customUpperGarments, setCustomUpperGarments] = useState<Record<string, Garment>>({});
  const [customLowerGarments, setCustomLowerGarments] = useState<Record<string, Garment>>({});
  const [customUpperFabrics, setCustomUpperFabrics] = useState<Record<string, Fabric>>({});
  const [customLowerFabrics, setCustomLowerFabrics] = useState<Record<string, Fabric>>({});
  const [customUpperPrints, setCustomUpperPrints] = useState<Record<string, PrintType>>({});
  const [customLowerPrints, setCustomLowerPrints] = useState<Record<string, PrintType>>({});
  
  // Custom options for other categories
  const [customColors, setCustomColors] = useState<Record<string, { label: string; hex: string; prompt: string }>>({});
  const [customFootwear, setCustomFootwear] = useState<Record<string, { label: string; icon: string; prompt: string }>>({});
  const [customHeadwear, setCustomHeadwear] = useState<Record<string, { label: string; icon: string; prompt: string }>>({});
  const [customSleeveLengths, setCustomSleeveLengths] = useState<Record<string, { label: string; icon: string; prompt: string }>>({});
  const [customBodyTypes, setCustomBodyTypes] = useState<Record<string, { label: string; icon: string; prompt: string }>>({});
  const [customPostures, setCustomPostures] = useState<Record<string, { label: string; icon: string; prompt: string }>>({});

  // Dialog State
  const [addDialogState, setAddDialogState] = useState<{
    isOpen: boolean;
    category: string; // identifier for which state to update
    label: string; // display title
    withColor?: boolean;
  }>({ isOpen: false, category: "", label: "" });

  
  // Add custom item modals
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddGarment, setShowAddGarment] = useState(false);
  const [showAddFabric, setShowAddFabric] = useState(false);
  const [showAddPrint, setShowAddPrint] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrompt, setNewItemPrompt] = useState("");
  
  // Other options
  const [selectedBodyType, setSelectedBodyType] = useState<string>("any");
  const [selectedPersonType, setSelectedPersonType] = useState<string>("woman");
  const [selectedUpperColor, setSelectedUpperColor] = useState<string>("any"); // Color key for upper body
  const [selectedLowerColor, setSelectedLowerColor] = useState<string>("any"); // Color key for lower body
  const [selectedPosture, setSelectedPosture] = useState<string>("standing");
  
  // Custom prompts for upper/lower body in custom mode
  const [customUpperPrompt, setCustomUpperPrompt] = useState<string>("");
  const [customLowerPrompt, setCustomLowerPrompt] = useState<string>("");
  const [customFootwearPrompt, setCustomFootwearPrompt] = useState<string>("");

  // Storage for edited prompts (overrides)
  // Key format: "type:itemId" e.g. "upperGarment:shirt", "upperFabric:silk"
  const [editedPrompts, setEditedPrompts] = useState<Record<string, string>>({});

  // Edit Dialog State
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    type: string; // 'upperGarment', 'upperFabric', etc.
    key: string;
    label: string;
    defaultPrompt: string;
    currentPrompt: string;
  }>({
    isOpen: false,
    type: "",
    key: "",
    label: "",
    defaultPrompt: "",
    currentPrompt: ""
  });
  
  // Sleeve length and footwear options for custom mode
  const [selectedSleeveLength, setSelectedSleeveLength] = useState<string>("any");
  const [selectedFootwear, setSelectedFootwear] = useState<string>("any");
  const [selectedFootwearColor, setSelectedFootwearColor] = useState<string>("any");
  
  // Headwear options for custom mode
  const [selectedHeadwear, setSelectedHeadwear] = useState<string>("none");
  const [selectedHeadwearColor, setSelectedHeadwearColor] = useState<string>("any");
  const [customHeadwearPrompt, setCustomHeadwearPrompt] = useState<string>("");
  
  // Speech recognition for custom mode
  const [isUpperListening, setIsUpperListening] = useState(false);
  const [isLowerListening, setIsLowerListening] = useState(false);
  const [isFootwearListening, setIsFootwearListening] = useState(false);
  const [isHeadwearListening, setIsHeadwearListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const upperRecognitionRef = useRef<any>(null);
  const lowerRecognitionRef = useRef<any>(null);
  const footwearRecognitionRef = useRef<any>(null);
  const headwearRecognitionRef = useRef<any>(null);
  
  const [generationMode, setGenerationMode] = useState<GenerationMode>('text');
  
  // Track active dropdown for z-index management
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Track if any dropdown is open (to show backdrop)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Track if style panel is expanded (replaces NavigationMenu dropdown)
  const [isStyleExpanded, setIsStyleExpanded] = useState(false);
  
  // Track if upper/lower style panels are expanded (for custom mode)
  const [isUpperStyleExpanded, setIsUpperStyleExpanded] = useState(false);
  const [isLowerStyleExpanded, setIsLowerStyleExpanded] = useState(false);
  
  // Style usage tracking for frequently used styles (LRU with frequency)
  const [styleUsageHistory, setStyleUsageHistory] = useState<StyleUsageEntry[]>([]);
  
  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customEnhancedPrompt, setCustomEnhancedPrompt] = useState<string | null>(null);
  const [backendEnhancedPrompt, setBackendEnhancedPrompt] = useState<string | null>(null);
  
  // Generation history (max 5 items)
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>([]);
  
  // Custom styles state
  const [customStyles, setCustomStyles] = useState<{ [key: string]: StyleDefinition }>({});
  const [showAddStyle, setShowAddStyle] = useState(false);
  const [newStyleName, setNewStyleName] = useState("");
  const [newStylePrompt, setNewStylePrompt] = useState("");
  
  // View Input Combination modal state
  const [showInputCombination, setShowInputCombination] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  
  // Get person types based on selected gender
  const personTypes = selectedGender === 'female' ? FEMALE_PERSON_TYPES : MALE_PERSON_TYPES;
  
  // Get body types based on selected gender
  const bodyTypes = selectedGender === 'female' ? FEMALE_BODY_TYPES : MALE_BODY_TYPES;
  
  // Get styles based on selected gender
  const genderStyles = selectedGender === 'female' ? FEMALE_STYLES : MALE_STYLES;
  
  // Combine gender-specific and custom styles
  const allStyles: { [key: string]: StyleDefinition } = { ...genderStyles, ...customStyles };
  
  // Reset person type, body type, and style when gender changes
  const handleGenderChange = (gender: 'female' | 'male') => {
    setSelectedGender(gender);
    // Set default person type for the selected gender
    setSelectedPersonType(gender === 'female' ? 'woman' : 'man');
    // Set default body type for the selected gender
    setSelectedBodyType('any');
    // Set default style for the selected gender
    setSelectedStyle(gender === 'female' ? 'traditional_saree' : 'sherwani');
  };
  
  // Handle adding custom style
  const handleAddCustomStyle = () => {
    if (!newStyleName.trim()) {
      toast.error("Please enter a style name");
      return;
    }
    
    const styleKey = newStyleName.toLowerCase().replace(/\s+/g, '_');
    
    if (allStyles[styleKey]) {
      toast.error("A style with this name already exists");
      return;
    }
    
    setCustomStyles(prev => ({
      ...prev,
      [styleKey]: {
        label: newStyleName,
        icon: "🎨",
        prompt: newStylePrompt.trim() || newStyleName, // Use name as fallback prompt if description empty
        category: "fusion" as const,
      }
    }));
    
    // Select the new style
    setSelectedStyle(styleKey);
    
    // Reset and close form
    setNewStyleName("");
    setNewStylePrompt("");
    setShowAddStyle(false);
    
    toast.success(`Style "${newStyleName}" added!`);
  };

  // === 3-Level Style Hierarchy Helpers ===
  
  // Get the style hierarchy based on gender
  const styleHierarchy = selectedGender === 'female' ? FEMALE_STYLE_HIERARCHY : MALE_STYLE_HIERARCHY;
  
  // Get current category garments (empty for custom categories)
  const currentCategoryGarments = styleHierarchy[selectedCategory]?.garments || {};
  
  // Get current garment fabrics (if garment selected)
  // For custom garments, use DEFAULT_FABRICS as fallback
  const currentGarmentFabrics = (() => {
    if (!selectedGarment) return {};
    // If it's a custom garment, use default fabrics
    if (selectedGarment.startsWith('custom_')) {
      return DEFAULT_FABRICS;
    }
    return currentCategoryGarments[selectedGarment]?.fabrics || DEFAULT_FABRICS;
  })();
  
  // Get current fabric prints (if fabric selected)
  // For custom fabrics, use COMMON_PRINTS as fallback
  const currentFabricPrints = (() => {
    if (!selectedGarment || !selectedFabric) return {};
    // If it's a custom fabric, use common prints
    if (selectedFabric.startsWith('custom_')) {
      return COMMON_PRINTS;
    }
    // If it's a custom garment, fabrics come from DEFAULT_FABRICS
    if (selectedGarment.startsWith('custom_')) {
      return DEFAULT_FABRICS[selectedFabric]?.prints || COMMON_PRINTS;
    }
    return currentCategoryGarments[selectedGarment]?.fabrics[selectedFabric]?.prints || COMMON_PRINTS;
  })();
  
  // === Custom Mode Upper/Lower Body Hierarchy Helpers ===
  
  // Get upper body garments based on gender
  const upperBodyGarments = selectedGender === 'female' ? FEMALE_UPPER_BODY_GARMENTS : MALE_UPPER_BODY_GARMENTS;
  
  // Get lower body garments based on gender
  const lowerBodyGarments = selectedGender === 'female' ? FEMALE_LOWER_BODY_GARMENTS : MALE_LOWER_BODY_GARMENTS;
  
  // Get upper body fabrics (if garment selected)
  const upperBodyFabrics = (() => {
    if (!selectedUpperGarment || selectedUpperGarment === 'none') return {};
    return upperBodyGarments[selectedUpperGarment]?.fabrics || DEFAULT_FABRICS;
  })();
  
  // Get upper body prints (if fabric selected)
  const upperBodyPrints = (() => {
    if (!selectedUpperGarment || selectedUpperGarment === 'none' || !selectedUpperFabric) return {};
    return upperBodyFabrics[selectedUpperFabric]?.prints || COMMON_PRINTS;
  })();
  
  // Get lower body fabrics (if garment selected)
  const lowerBodyFabrics = (() => {
    if (!selectedLowerGarment || selectedLowerGarment === 'none') return {};
    return lowerBodyGarments[selectedLowerGarment]?.fabrics || DEFAULT_FABRICS;
  })();
  
  // Get lower body prints (if fabric selected)
  const lowerBodyPrints = (() => {
    if (!selectedLowerGarment || selectedLowerGarment === 'none' || !selectedLowerFabric) return {};
    return lowerBodyFabrics[selectedLowerFabric]?.prints || COMMON_PRINTS;
  })();
  
  // Helper to get label for upper body button display
  const getUpperBodyButtonLabel = () => {
    if (!selectedUpperGarment) return "Select Upper";
    const garment = upperBodyGarments[selectedUpperGarment] || customUpperGarments[selectedUpperGarment];
    if (!garment) return "Select Upper";
    if (selectedUpperGarment === 'none') return "NONE";
    let label = garment.label;
    if (selectedUpperFabric && selectedUpperFabric !== 'any') {
      const fabric = upperBodyFabrics[selectedUpperFabric] || customUpperFabrics[selectedUpperFabric];
      if (fabric) label = `${fabric.label} ${label}`;
    }
    if (selectedUpperPrint && selectedUpperPrint !== 'any') {
      const print = upperBodyPrints[selectedUpperPrint] || customUpperPrints[selectedUpperPrint];
      if (print) label = `${print.label} ${label}`;
    }
    return label;
  };
  
  // Helper to get label for lower body button display
  const getLowerBodyButtonLabel = () => {
    if (!selectedLowerGarment) return "Select Lower";
    const garment = lowerBodyGarments[selectedLowerGarment] || customLowerGarments[selectedLowerGarment];
    if (!garment) return "Select Lower";
    if (selectedLowerGarment === 'none') return "NONE";
    let label = garment.label;
    if (selectedLowerFabric && selectedLowerFabric !== 'any') {
      const fabric = lowerBodyFabrics[selectedLowerFabric] || customLowerFabrics[selectedLowerFabric];
      if (fabric) label = `${fabric.label} ${label}`;
    }
    if (selectedLowerPrint && selectedLowerPrint !== 'any') {
      const print = lowerBodyPrints[selectedLowerPrint] || customLowerPrints[selectedLowerPrint];
      if (print) label = `${print.label} ${label}`;
    }
    return label;
  };
  
  // Helper to build prompt for upper body hierarchical selections (Updated to use edited prompts)
  const getUpperBodyHierarchyPrompt = (): string => {
    if (!selectedUpperGarment || selectedUpperGarment === 'none') return '';
    const parts: string[] = [];
    
    // 1. Base Garment
    const garment = upperBodyGarments[selectedUpperGarment] || customUpperGarments[selectedUpperGarment];
    if (garment) {
      // Check for edited prompt first
      const editedPrompt = editedPrompts[`upperGarment:${selectedUpperGarment}`];
      parts.push(editedPrompt !== undefined ? editedPrompt : garment.prompt);
    }
    
    // 2. Fabric
    if (selectedUpperFabric && selectedUpperFabric !== 'any') {
      const fabric = upperBodyFabrics[selectedUpperFabric] || customUpperFabrics[selectedUpperFabric];
      if (fabric) {
        parts.push(`FABRIC: ${fabric.label}`);
        const editedPrompt = editedPrompts[`upperFabric:${selectedUpperFabric}`];
        const finalPrompt = editedPrompt !== undefined ? editedPrompt : fabric.prompt;
        if (finalPrompt) parts.push(finalPrompt);
      }
    }
    
    // 3. Print
    if (selectedUpperPrint && selectedUpperPrint !== 'any') {
      const print = upperBodyPrints[selectedUpperPrint] || customUpperPrints[selectedUpperPrint];
      if (print) {
        parts.push(`PRINT: ${print.label}`);
        const editedPrompt = editedPrompts[`upperPrint:${selectedUpperPrint}`];
        const finalPrompt = editedPrompt !== undefined ? editedPrompt : print.prompt;
        if (finalPrompt) parts.push(finalPrompt);
      }
    }
    
    return parts.filter(Boolean).join(', ');
  };
   
  // Helper to handle opening the edit dialog
  const handleEditOption = (type: string, key: string, option: DropdownOption) => {
    // If we've edited it before, use that. Otherwise use the default from the option.
    const savedPrompt = editedPrompts[`${type}:${key}`];
    const defaultPrompt = option.prompt || "";
    
    setEditDialog({
      isOpen: true,
      type,
      key,
      label: option.label,
      defaultPrompt,
      currentPrompt: savedPrompt !== undefined ? savedPrompt : defaultPrompt
    });
  };

  // Handler for saving an edited prompt
  const handleSaveEditedPrompt = (newPrompt: string) => {
    if (editDialog.type === 'full_style') {
      setCustomEnhancedPrompt(newPrompt);
    } else {
      setEditedPrompts(prev => ({
        ...prev,
        [`${editDialog.type}:${editDialog.key}`]: newPrompt
      }));
    }
    setEditDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Handler for resetting an edited prompt
  const handleResetEditedPrompt = () => {
    if (editDialog.type === 'full_style') {
      setCustomEnhancedPrompt('');
    } else {
      setEditedPrompts(prev => {
        const newState = { ...prev };
        delete newState[`${editDialog.type}:${editDialog.key}`];
        return newState;
      });
    }
    // Don't close dialog immediately on reset, let user see the reset value
    // But update currentPrompt in logic? EditOptionDialog might handle it via props update
  };
    
  // New handler for editing full style
  const handleEditFullStyle = () => {
    const baseline = computeEnhancedPrompt();
    setEditDialog({
      isOpen: true,
      type: 'full_style',
      key: 'override',
      label: 'Full Outfit Prompt',
      defaultPrompt: baseline,
      currentPrompt: customEnhancedPrompt || baseline
    });
  };
  
  // Helper to build prompt for lower body hierarchical selections (Updated to use edited prompts)
  const getLowerBodyHierarchyPrompt = (): string => {
    if (!selectedLowerGarment || selectedLowerGarment === 'none') return '';
    const parts: string[] = [];
    
    // 1. Base Garment
    const garment = lowerBodyGarments[selectedLowerGarment] || customLowerGarments[selectedLowerGarment];
    if (garment) {
      // Check for edited prompt
      const editedPrompt = editedPrompts[`lowerGarment:${selectedLowerGarment}`];
      parts.push(editedPrompt !== undefined ? editedPrompt : garment.prompt);
    }
    
    // 2. Fabric
    if (selectedLowerFabric && selectedLowerFabric !== 'any') {
      const fabric = lowerBodyFabrics[selectedLowerFabric] || customLowerFabrics[selectedLowerFabric];
      if (fabric) {
        parts.push(`FABRIC: ${fabric.label}`);
        const editedPrompt = editedPrompts[`lowerFabric:${selectedLowerFabric}`];
        const finalPrompt = editedPrompt !== undefined ? editedPrompt : fabric.prompt;
        if (finalPrompt) parts.push(finalPrompt);
      }
    }
    
    // 3. Print
    if (selectedLowerPrint && selectedLowerPrint !== 'any') {
      const print = lowerBodyPrints[selectedLowerPrint] || customLowerPrints[selectedLowerPrint];
      if (print) {
        parts.push(`PRINT: ${print.label}`);
        const editedPrompt = editedPrompts[`lowerPrint:${selectedLowerPrint}`];
        const finalPrompt = editedPrompt !== undefined ? editedPrompt : print.prompt;
        if (finalPrompt) parts.push(finalPrompt);
      }
    }
    
    return parts.filter(Boolean).join(', ');
  };
  
  // Helper function to get prompt parts from hierarchy selections
  const getHierarchyPromptParts = (): string[] => {
    const parts: string[] = [];
    
    // Add garment prompt
    if (selectedGarment) {
      if (selectedGarment.startsWith('custom_')) {
        // Custom garment - use the custom item's prompt
        const customItem = customGarments[selectedGarment];
        if (customItem?.prompt) {
          parts.push(customItem.prompt);
        } else if (customItem?.label) {
          parts.push(customItem.label);
        }
      } else {
        // Standard garment from hierarchy
        const garmentData = currentCategoryGarments[selectedGarment];
        if (garmentData?.prompt) {
          parts.push(garmentData.prompt);
        } else if (garmentData?.label) {
          parts.push(garmentData.label);
        }
      }
    }
    
    // Add fabric prompt
    if (selectedGarment && selectedFabric) {
      if (selectedFabric.startsWith('custom_')) {
        // Custom fabric
        const customItem = customFabrics[selectedFabric];
        if (customItem?.prompt) {
          parts.push(customItem.prompt);
        } else if (customItem?.label) {
          parts.push(`${customItem.label} fabric`);
        }
      } else {
        // Standard fabric from hierarchy or DEFAULT_FABRICS
        let fabricData;
        if (selectedGarment.startsWith('custom_')) {
          fabricData = DEFAULT_FABRICS[selectedFabric];
        } else {
          fabricData = currentCategoryGarments[selectedGarment]?.fabrics?.[selectedFabric];
        }
        // Only add if there's a non-empty prompt
        if (fabricData?.prompt) {
          parts.push(fabricData.prompt);
        } else if (fabricData?.label && selectedFabric !== 'any') {
          // Fallback to label if no prompt (but skip "any")
          parts.push(`${fabricData.label} fabric`);
        }
      }
    }
    
    // Add print/pattern prompt
    if (selectedGarment && selectedFabric && selectedPrint) {
      if (selectedPrint.startsWith('custom_')) {
        // Custom print
        const customItem = customPrints[selectedPrint];
        if (customItem?.prompt) {
          parts.push(customItem.prompt);
        } else if (customItem?.label) {
          parts.push(`${customItem.label} pattern`);
        }
      } else {
        // Standard print from hierarchy or COMMON_PRINTS
        let printData;
        if (selectedFabric.startsWith('custom_') || selectedGarment.startsWith('custom_')) {
          printData = COMMON_PRINTS[selectedPrint];
        } else {
          printData = currentCategoryGarments[selectedGarment]?.fabrics?.[selectedFabric]?.prints?.[selectedPrint];
        }
        // Only add if there's a non-empty prompt
        if (printData?.prompt) {
          parts.push(printData.prompt);
        } else if (printData?.label && selectedPrint !== 'any') {
          // Fallback to label if no prompt (but skip "any")
          parts.push(`${printData.label} pattern`);
        }
      }
    }
    
    return parts;
  };
  
  // Cascading reset: when category changes, reset lower levels
  useEffect(() => {
    setSelectedGarment(null);
    setSelectedFabric(null);
    setSelectedPrint(null);
  }, [selectedCategory]);
  
  // Cascading reset: when garment changes, reset fabric and print
  useEffect(() => {
    setSelectedFabric(null);
    setSelectedPrint(null);
  }, [selectedGarment]);
  
  // Cascading reset: when fabric changes, reset print
  useEffect(() => {
    setSelectedPrint(null);
  }, [selectedFabric]);
  
  // Reset hierarchy selections when gender changes
  useEffect(() => {
    setSelectedCategory("indian");
    setSelectedGarment(null);
    setSelectedFabric(null);
    setSelectedPrint(null);
    // Also reset custom mode upper/lower body selections
    setSelectedUpperGarment(null);
    setSelectedUpperFabric(null);
    setSelectedUpperPrint(null);
    setSelectedLowerGarment(null);
    setSelectedLowerFabric(null);
    setSelectedLowerPrint(null);
  }, [selectedGender]);
  
  // Cascading reset: when upper garment changes, reset upper fabric and print
  useEffect(() => {
    setSelectedUpperFabric(null);
    setSelectedUpperPrint(null);
  }, [selectedUpperGarment]);
  
  // Cascading reset: when upper fabric changes, reset upper print
  useEffect(() => {
    setSelectedUpperPrint(null);
  }, [selectedUpperFabric]);
  
  // Cascading reset: when lower garment changes, reset lower fabric and print
  useEffect(() => {
    setSelectedLowerFabric(null);
    setSelectedLowerPrint(null);
  }, [selectedLowerGarment]);
  
  // Cascading reset: when lower fabric changes, reset lower print
  useEffect(() => {
    setSelectedLowerPrint(null);
  }, [selectedLowerFabric]);
  
  // Handler for adding custom garment
  const handleAddCustomGarment = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a garment name");
      return;
    }
    const key = `custom_${newItemName.toLowerCase().replace(/\s+/g, '_')}`;
    setCustomGarments(prev => ({
      ...prev,
      [key]: {
        label: newItemName,
        icon: "🎨",
        prompt: newItemPrompt.trim() || newItemName,
      }
    }));
    setSelectedGarment(key);
    setNewItemName("");
    setNewItemPrompt("");
    setShowAddGarment(false);
    toast.success(`Garment "${newItemName}" added!`);
  };
  
  // Handler for adding custom fabric
  const handleAddCustomFabric = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a fabric name");
      return;
    }
    const key = `custom_${newItemName.toLowerCase().replace(/\s+/g, '_')}`;
    setCustomFabrics(prev => ({
      ...prev,
      [key]: {
        label: newItemName,
        icon: "🧵",
        prompt: newItemPrompt.trim() || newItemName,
      }
    }));
    setSelectedFabric(key);
    setNewItemName("");
    setNewItemPrompt("");
    setShowAddFabric(false);
    toast.success(`Fabric "${newItemName}" added!`);
  };
  
  // Handler for adding custom print
  const handleAddCustomPrint = () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a print name");
      return;
    }
    const key = `custom_${newItemName.toLowerCase().replace(/\s+/g, '_')}`;
    setCustomPrints(prev => ({
      ...prev,
      [key]: {
        label: newItemName,
        icon: "🎨",
        prompt: newItemPrompt.trim() || newItemName,
      }
    }));
    setSelectedPrint(key);
    setNewItemName("");
    setNewItemPrompt("");
    setShowAddPrint(false);
    toast.success(`Print "${newItemName}" added!`);
  };
   // Initialize speech recognition for custom mode
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      // Upper body recognition
      upperRecognitionRef.current = new SpeechRecognitionAPI();
      upperRecognitionRef.current.continuous = true;
      upperRecognitionRef.current.interimResults = true;
      upperRecognitionRef.current.lang = voiceLang;
      
      upperRecognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomUpperPrompt(transcript);
      };
      
      upperRecognitionRef.current.onerror = () => setIsUpperListening(false);
      upperRecognitionRef.current.onend = () => setIsUpperListening(false);
      
      // Lower body recognition
      lowerRecognitionRef.current = new SpeechRecognitionAPI();
      lowerRecognitionRef.current.continuous = true;
      lowerRecognitionRef.current.interimResults = true;
      lowerRecognitionRef.current.lang = voiceLang;
      
      lowerRecognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomLowerPrompt(transcript);
      };
      
      lowerRecognitionRef.current.onerror = () => setIsLowerListening(false);
      lowerRecognitionRef.current.onend = () => setIsLowerListening(false);
      
      // Footwear recognition
      footwearRecognitionRef.current = new SpeechRecognitionAPI();
      footwearRecognitionRef.current.continuous = true;
      footwearRecognitionRef.current.interimResults = true;
      footwearRecognitionRef.current.lang = voiceLang;
      
      footwearRecognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomFootwearPrompt(transcript);
      };
      
      footwearRecognitionRef.current.onerror = () => setIsFootwearListening(false);
      footwearRecognitionRef.current.onend = () => setIsFootwearListening(false);
      
      // Headwear recognition
      headwearRecognitionRef.current = new SpeechRecognitionAPI();
      headwearRecognitionRef.current.continuous = true;
      headwearRecognitionRef.current.interimResults = true;
      headwearRecognitionRef.current.lang = voiceLang;
      
      headwearRecognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCustomHeadwearPrompt(transcript);
      };
      
      headwearRecognitionRef.current.onerror = () => setIsHeadwearListening(false);
      headwearRecognitionRef.current.onend = () => setIsHeadwearListening(false);
    }
    
    return () => {
      upperRecognitionRef.current?.stop();
      lowerRecognitionRef.current?.stop();
      footwearRecognitionRef.current?.stop();
      headwearRecognitionRef.current?.stop();
    };
  }, [voiceLang]);
  
  const toggleUpperListening = () => {
    if (!upperRecognitionRef.current) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (isUpperListening) {
      upperRecognitionRef.current.stop();
      setIsUpperListening(false);
    } else {
      // Stop lower if active
      if (isLowerListening) {
        lowerRecognitionRef.current?.stop();
        setIsLowerListening(false);
      }
      upperRecognitionRef.current.start();
      setIsUpperListening(true);
    }
  };
  
  const toggleLowerListening = () => {
    if (!lowerRecognitionRef.current) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (isLowerListening) {
      lowerRecognitionRef.current.stop();
      setIsLowerListening(false);
    } else {
      // Stop upper if active
      if (isUpperListening) {
        upperRecognitionRef.current?.stop();
        setIsUpperListening(false);
      }
      lowerRecognitionRef.current.start();
      setIsLowerListening(true);
    }
  };
  
  const toggleFootwearListening = () => {
    if (!footwearRecognitionRef.current) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (isFootwearListening) {
      footwearRecognitionRef.current.stop();
      setIsFootwearListening(false);
    } else {
      // Stop others if active
      if (isUpperListening) {
        upperRecognitionRef.current?.stop();
        setIsUpperListening(false);
      }
      if (isLowerListening) {
        lowerRecognitionRef.current?.stop();
        setIsLowerListening(false);
      }
      footwearRecognitionRef.current.start();
      setIsFootwearListening(true);
    }
  };
  
  const toggleHeadwearListening = () => {
    if (!headwearRecognitionRef.current) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    if (isHeadwearListening) {
      headwearRecognitionRef.current.stop();
      setIsHeadwearListening(false);
    } else {
      // Stop others if active
      if (isUpperListening) {
        upperRecognitionRef.current?.stop();
        setIsUpperListening(false);
      }
      if (isLowerListening) {
        lowerRecognitionRef.current?.stop();
        setIsLowerListening(false);
      }
      if (isFootwearListening) {
        footwearRecognitionRef.current?.stop();
        setIsFootwearListening(false);
      }
      headwearRecognitionRef.current.start();
      setIsHeadwearListening(true);
    }
  };

  const detectedLanguage = detectLanguage(prompt);
  
  // Compute the enhanced prompt preview (user prompt first, then modifiers)
  const computeEnhancedPrompt = () => {
    const bodyTypeEnhancement = (bodyTypes[selectedBodyType] || customBodyTypes[selectedBodyType])?.prompt || "";
    const personTypeEnhancement = personTypes[selectedPersonType]?.prompt || "";
    const postureEnhancement = (POSTURE_OPTIONS[selectedPosture] || customPostures[selectedPosture])?.prompt || "";
    
    const parts = [];
    
    // For custom mode, use custom prompts; for full mode, use main prompt
    if (outfitMode === 'custom') {
      if (customUpperPrompt || customLowerPrompt) {
        parts.push("Fashion design");
      }
    } else {
      parts.push(prompt);
    }
    
    // Add gender context
    parts.push(`Gender: ${selectedGender === 'female' ? 'female, feminine' : 'male, masculine'}`);
    
    // Add person type (who is wearing)
    if (personTypeEnhancement) {
      parts.push(`Model: ${personTypeEnhancement}`);
    }
    
    // Add body type
    if (bodyTypeEnhancement) {
      parts.push(`Body type: ${bodyTypeEnhancement}`);
    }
    
    // Add posture/pose
    if (postureEnhancement) {
      parts.push(`Pose: ${postureEnhancement}`);
    }
    
    // Add style based on outfit mode
    if (outfitMode === 'full') {
      // Use 3-level hierarchy: Garment -> Fabric -> Print
      
      // Add color for full mode
      const colorInfo = COLOR_PALETTE[selectedUpperColor];
      if (colorInfo && colorInfo.prompt) {
        parts.push(`Color: ${colorInfo.prompt}`);
      }
      
      // Build structured garment description
      if (selectedGarment) {
        // Add instruction for the model
        parts.push("OUTFIT: Generate a complete outfit with the following specifications");
        
        // Get garment info
        let garmentLabel = "";
        let garmentPrompt = "";
        if (selectedGarment.startsWith('custom_')) {
          const customItem = customGarments[selectedGarment];
          garmentLabel = customItem?.label || "";
          garmentPrompt = customItem?.prompt || "";
        } else {
          const garmentData = currentCategoryGarments[selectedGarment];
          garmentLabel = garmentData?.label || "";
          garmentPrompt = garmentData?.prompt || "";
        }
        parts.push(`Garment: ${garmentLabel}${garmentPrompt ? ` - ${garmentPrompt}` : ""}`);
        
        // Get fabric info
        if (selectedFabric && selectedFabric !== 'any') {
          let fabricLabel = "";
          let fabricPrompt = "";
          if (selectedFabric.startsWith('custom_')) {
            const customItem = customFabrics[selectedFabric];
            fabricLabel = customItem?.label || "";
            fabricPrompt = customItem?.prompt || "";
          } else if (selectedGarment.startsWith('custom_')) {
            const fabricData = DEFAULT_FABRICS[selectedFabric];
            fabricLabel = fabricData?.label || "";
            fabricPrompt = fabricData?.prompt || "";
          } else {
            const fabricData = currentCategoryGarments[selectedGarment]?.fabrics?.[selectedFabric];
            fabricLabel = fabricData?.label || "";
            fabricPrompt = fabricData?.prompt || "";
          }
          if (fabricLabel) {
            parts.push(`Fabric: ${fabricLabel}${fabricPrompt ? ` - ${fabricPrompt}` : ""}`);
          }
        }
        
        // Get print info
        if (selectedFabric && selectedPrint && selectedPrint !== 'any') {
          let printLabel = "";
          let printPrompt = "";
          if (selectedPrint.startsWith('custom_')) {
            const customItem = customPrints[selectedPrint];
            printLabel = customItem?.label || "";
            printPrompt = customItem?.prompt || "";
          } else if (selectedFabric.startsWith('custom_') || selectedGarment.startsWith('custom_')) {
            const printData = COMMON_PRINTS[selectedPrint];
            printLabel = printData?.label || "";
            printPrompt = printData?.prompt || "";
          } else {
            const printData = currentCategoryGarments[selectedGarment]?.fabrics?.[selectedFabric]?.prints?.[selectedPrint];
            printLabel = printData?.label || "";
            printPrompt = printData?.prompt || "";
          }
          if (printLabel) {
            parts.push(`Pattern: ${printLabel}${printPrompt ? ` - ${printPrompt}` : ""}`);
          }
        }
      } else {
        // Fallback to old style system if no hierarchy selection made
        const styleEnhancement = allStyles[selectedStyle]?.prompt || "";
        if (styleEnhancement) {
          parts.push(`Design preference: ${styleEnhancement}`);
        }
      }
    } else {
      // Custom mode - upper and lower styles with custom prompts and colors
      // Add strict instruction to separate upper and lower body styles
      
      // Check if ANY body part has a selection (hierarchical or custom prompt)
      // Note: 'none' is a valid selection that means "explicitly exclude/don't generate"
      const hasUpperBodySelection = selectedUpperGarment && selectedUpperGarment !== '';
      const hasLowerBodySelection = selectedLowerGarment && selectedLowerGarment !== '';
      const isUpperNone = selectedUpperGarment === 'none';
      const isLowerNone = selectedLowerGarment === 'none';
      
      if (hasUpperBodySelection || hasLowerBodySelection || customUpperPrompt || customLowerPrompt) {
        if (!isUpperNone && !isLowerNone) {
          parts.push("IMPORTANT: The upper body and lower body have DIFFERENT styles. Apply each style ONLY to its specified body area. Do NOT mix or blend the styles between upper and lower body");
        }
      }
      
      // Get hierarchical prompts for upper and lower body
      const upperHierarchyPrompt = getUpperBodyHierarchyPrompt();
      const lowerHierarchyPrompt = getLowerBodyHierarchyPrompt();
      
      const upperColorInfo = COLOR_PALETTE[selectedUpperColor] || customColors[selectedUpperColor];
      const lowerColorInfo = COLOR_PALETTE[selectedLowerColor] || customColors[selectedLowerColor];
      const sleeveLengthEnhancement = (SLEEVE_LENGTH_OPTIONS[selectedSleeveLength] || customSleeveLengths[selectedSleeveLength])?.prompt || "";
      
      // Use gender-specific footwear and headwear
      const footwearOptions = selectedGender === 'female' ? FEMALE_FOOTWEAR : MALE_FOOTWEAR;
      const headwearOptions = selectedGender === 'female' ? FEMALE_HEADWEAR : MALE_HEADWEAR;
      
      // Handle Footwear NONE selection
      const isFootwearNone = selectedFootwear === 'none';
      const footwearEnhancement = (footwearOptions[selectedFootwear] || customFootwear[selectedFootwear])?.prompt || "";
      const headwearEnhancement = (headwearOptions[selectedHeadwear] || customHeadwear[selectedHeadwear])?.prompt || "";
      const footwearColorInfo = COLOR_PALETTE[selectedFootwearColor] || customColors[selectedFootwearColor];
      const headwearColorInfo = COLOR_PALETTE[selectedHeadwearColor] || customColors[selectedHeadwearColor];
      
      // Upper body logic
      if (isUpperNone) {
         parts.push("DO NOT generate upper body clothing. Focus camera on lower body/legs/feet. Crop out upper body.");
      } else if (hasUpperBodySelection || customUpperPrompt || sleeveLengthEnhancement) {
        const upperParts = [
          allStyles[selectedUpperStyle]?.prompt,
          upperHierarchyPrompt,
          upperColorInfo ? upperColorInfo.prompt : "",
          sleeveLengthEnhancement,
          customUpperPrompt
        ].filter(Boolean).join(", ");
        if (upperParts.trim()) {
          parts.push(`UPPER BODY ONLY (from shoulders to waist): ${upperParts}`);
        }
      }
      
      // Lower body logic
      if (isLowerNone) {
        parts.push("DO NOT generate lower body clothing. Focus camera on upper body/face/torso. Crop out lower body.");
      } else if (hasLowerBodySelection || customLowerPrompt) {
        const lowerParts = [
          allStyles[selectedLowerStyle]?.prompt,
          lowerHierarchyPrompt,
          lowerColorInfo ? lowerColorInfo.prompt : "",
          customLowerPrompt
        ].filter(Boolean).join(", ");
        if (lowerParts.trim()) {
          parts.push(`LOWER BODY ONLY (from waist to feet): ${lowerParts}`);
        }
      }
      
      // Footwear logic
      if (isFootwearNone) {
         parts.push("NO FOOTWEAR. Barefoot or crop feet out of frame.");
      } else if (footwearEnhancement || customFootwearPrompt) {
        const footwearParts = [
          footwearEnhancement,
          footwearColorInfo ? footwearColorInfo.prompt : "",
          customFootwearPrompt
        ].filter(Boolean).join(", ");
        parts.push(`FOOTWEAR: ${footwearParts}`);
      }
      
      // Headwear: combine style + color + custom prompt
      if (headwearEnhancement || customHeadwearPrompt) {
        const headwearParts = [
          headwearEnhancement,
          headwearColorInfo ? headwearColorInfo.prompt : "",
          customHeadwearPrompt
        ].filter(Boolean).join(", ");
        parts.push(`HEADWEAR: ${headwearParts}`);
      }
    }
    
    return parts.join(". ");
  };
  
  // Get current color names for display
  const upperColorName = COLOR_PALETTE[selectedUpperColor]?.label || "Any Color";
  const lowerColorName = COLOR_PALETTE[selectedLowerColor]?.label || "Any Color";
  const footwearColorName = COLOR_PALETTE[selectedFootwearColor]?.label || "Any Color";
  const headwearColorName = COLOR_PALETTE[selectedHeadwearColor]?.label || "Any Color";
  
  // Get current gender-specific options
  const footwearOptions = selectedGender === 'female' ? FEMALE_FOOTWEAR : MALE_FOOTWEAR;
  const headwearOptions = selectedGender === 'female' ? FEMALE_HEADWEAR : MALE_HEADWEAR;
  
  // Check if custom mode has valid input for generation - prompts are optional, just being in custom mode is enough
  const canGenerateCustom = outfitMode === 'custom';
  
  // Update style usage for LRU tracking
  const updateStyleUsage = (styleKey: string) => {
    setStyleUsageHistory(prev => {
      const existingIndex = prev.findIndex(entry => entry.styleKey === styleKey);
      const now = Date.now();
      
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: updated[existingIndex].count + 1,
          lastUsed: now,
        };
        return updated;
      } else {
        // Add new entry
        return [...prev, { styleKey, count: 1, lastUsed: now }];
      }
    });
  };
  
  // Get top 5 frequently used styles (sorted by count, then by recency)
  const getFrequentStyles = () => {
    return styleUsageHistory
      .filter(entry => allStyles[entry.styleKey]) // Only include existing styles
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.lastUsed - a.lastUsed;
      })
      .slice(0, 5);
  };
  
  const frequentStyles = getFrequentStyles();
  
  // Get all current input selections as JSON for developers
  const getInputCombinationJSON = () => {
    const footwearOpts = selectedGender === 'female' ? FEMALE_FOOTWEAR : MALE_FOOTWEAR;
    const headwearOpts = selectedGender === 'female' ? FEMALE_HEADWEAR : MALE_HEADWEAR;
    
    const combination: Record<string, any> = {
      gender: selectedGender,
      generationMode: generationMode,
      outfitMode: outfitMode,
      personType: {
        key: selectedPersonType,
        label: personTypes[selectedPersonType]?.label || selectedPersonType,
      },
      bodyType: {
        key: selectedBodyType,
        label: (bodyTypes[selectedBodyType] || customBodyTypes[selectedBodyType])?.label || selectedBodyType,
      },
      posture: {
        key: selectedPosture,
        label: (POSTURE_OPTIONS[selectedPosture] || customPostures[selectedPosture])?.label || selectedPosture,
      },
    };
    
    if (outfitMode === 'full') {
      combination.fullMode = {
        style: {
          key: selectedStyle,
          label: allStyles[selectedStyle]?.label || selectedStyle,
          category: allStyles[selectedStyle]?.category || 'custom',
        },
        color: {
          key: selectedUpperColor,
          label: COLOR_PALETTE[selectedUpperColor]?.label || selectedUpperColor,
          hex: COLOR_PALETTE[selectedUpperColor]?.hex || '',
        },
        prompt: prompt,
      };
    } else {
      combination.customMode = {
        upperBody: {
          garment: {
            key: selectedUpperGarment,
            label: (selectedUpperGarment && (upperBodyGarments[selectedUpperGarment] || customUpperGarments[selectedUpperGarment])?.label) || selectedUpperGarment,
          },
          fabric: {
            key: selectedUpperFabric,
            label: (selectedUpperFabric && (upperBodyFabrics[selectedUpperFabric] || customUpperFabrics[selectedUpperFabric])?.label) || selectedUpperFabric,
          },
          print: {
            key: selectedUpperPrint,
            label: (selectedUpperPrint && (upperBodyPrints[selectedUpperPrint] || customUpperPrints[selectedUpperPrint])?.label) || selectedUpperPrint,
          },
          color: {
            key: selectedUpperColor,
            label: (COLOR_PALETTE[selectedUpperColor] || customColors[selectedUpperColor])?.label || selectedUpperColor,
            hex: (COLOR_PALETTE[selectedUpperColor] || customColors[selectedUpperColor])?.hex || '',
          },
          sleeveLength: {
            key: selectedSleeveLength,
            label: (SLEEVE_LENGTH_OPTIONS[selectedSleeveLength] || customSleeveLengths[selectedSleeveLength])?.label || selectedSleeveLength,
          },
          customPrompt: customUpperPrompt,
        },
        lowerBody: {
          garment: {
            key: selectedLowerGarment,
            label: (selectedLowerGarment && (lowerBodyGarments[selectedLowerGarment] || customLowerGarments[selectedLowerGarment])?.label) || selectedLowerGarment,
          },
          fabric: {
            key: selectedLowerFabric,
            label: (selectedLowerFabric && (lowerBodyFabrics[selectedLowerFabric] || customLowerFabrics[selectedLowerFabric])?.label) || selectedLowerFabric,
          },
          print: {
            key: selectedLowerPrint,
            label: (selectedLowerPrint && (lowerBodyPrints[selectedLowerPrint] || customLowerPrints[selectedLowerPrint])?.label) || selectedLowerPrint,
          },
          color: {
            key: selectedLowerColor,
            label: (COLOR_PALETTE[selectedLowerColor] || customColors[selectedLowerColor])?.label || selectedLowerColor,
            hex: (COLOR_PALETTE[selectedLowerColor] || customColors[selectedLowerColor])?.hex || '',
          },
          customPrompt: customLowerPrompt,
        },
        footwear: {
          type: {
            key: selectedFootwear,
            label: (footwearOpts[selectedFootwear] || customFootwear[selectedFootwear])?.label || selectedFootwear,
          },
          color: {
            key: selectedFootwearColor,
            label: (COLOR_PALETTE[selectedFootwearColor] || customColors[selectedFootwearColor])?.label || selectedFootwearColor,
            hex: (COLOR_PALETTE[selectedFootwearColor] || customColors[selectedFootwearColor])?.hex || '',
          },
          customPrompt: customFootwearPrompt,
        },
        headwear: {
          type: {
            key: selectedHeadwear,
            label: (headwearOpts[selectedHeadwear] || customHeadwear[selectedHeadwear])?.label || selectedHeadwear,
          },
          color: {
            key: selectedHeadwearColor,
            label: (COLOR_PALETTE[selectedHeadwearColor] || customColors[selectedHeadwearColor])?.label || selectedHeadwearColor,
            hex: (COLOR_PALETTE[selectedHeadwearColor] || customColors[selectedHeadwearColor])?.hex || '',
          },
          customPrompt: customHeadwearPrompt,
        },
      };
    }
    
    combination.enhancedPrompt = computeEnhancedPrompt();
    
    return combination;
  };
  
  // Copy input combination JSON to clipboard
  const copyInputCombination = async () => {
    try {
      const json = JSON.stringify(getInputCombinationJSON(), null, 2);
      await navigator.clipboard.writeText(json);
      setCopiedJSON(true);
      toast.success('Input combination copied to clipboard!');
      setTimeout(() => setCopiedJSON(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const enhancedPromptPreview = computeEnhancedPrompt();
  
  // Pricing estimation (based on enhanced prompt)
  const PRICING = {
    INPUT_TOKEN_PRICE_USD: 0.30 / 1_000_000, // $0.30 per 1M tokens
    OUTPUT_IMAGE_PRICE_USD: 0.039, // $0.039 per image
    USD_TO_INR: 83,
    CHARS_PER_TOKEN: 4,
  };
  
  const estimatePricing = (promptText: string) => {
    const estimatedTokens = Math.ceil(promptText.length / PRICING.CHARS_PER_TOKEN);
    const inputCostUSD = estimatedTokens * PRICING.INPUT_TOKEN_PRICE_USD;
    const totalCostUSD = inputCostUSD + PRICING.OUTPUT_IMAGE_PRICE_USD;
    const totalCostINR = totalCostUSD * PRICING.USD_TO_INR;
    return { tokens: estimatedTokens, costINR: totalCostINR.toFixed(2) };
  };
  
  // Get current enhanced prompt (custom or computed)
  const finalEnhancedPrompt = customEnhancedPrompt || enhancedPromptPreview;
  const pricingEstimate = estimatePricing(finalEnhancedPrompt);

  // Handle opening the Add Option Dialog
  const handleOpenAddDialog = (category: string, label: string, withColor: boolean = false) => {
    setAddDialogState({
      isOpen: true,
      category,
      label,
      withColor,
    });
  };

  // Handle saving the custom option from dialog
  const handleSaveCustomOption = (data: { label: string; prompt: string; hex?: string }) => {
    const { category, withColor } = addDialogState;
    const key = `custom_${Date.now()}`;
    const newItem = {
        label: data.label,
        prompt: data.prompt,
        // Add specific fields based on category
        ...(withColor ? { hex: data.hex || "#000000" } : {}),
        icon: "✨", // Default icon
    };

    // Update specific state and selection based on category
    switch (category) {
        case 'upperGarment':
            setCustomUpperGarments(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedUpperGarment(key);
            break;
        case 'lowerGarment':
            setCustomLowerGarments(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedLowerGarment(key);
            break;
        case 'upperFabric':
            setCustomUpperFabrics(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedUpperFabric(key);
            break;
        case 'lowerFabric':
            setCustomLowerFabrics(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedLowerFabric(key);
            break;
        case 'upperPrint':
            setCustomUpperPrints(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedUpperPrint(key);
            break;
        case 'lowerPrint':
            setCustomLowerPrints(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedLowerPrint(key);
            break;
        case 'upperColor':
             setCustomColors(prev => ({ ...prev, [key]: { ...newItem, hex: data.hex! } }));
             setSelectedUpperColor(key);
             break;
        case 'lowerColor':
             setCustomColors(prev => ({ ...prev, [key]: { ...newItem, hex: data.hex! } }));
             setSelectedLowerColor(key);
             break;
        case 'footwearColor':
             setCustomColors(prev => ({ ...prev, [key]: { ...newItem, hex: data.hex! } }));
             setSelectedFootwearColor(key);
             break;
        case 'headwearColor':
             setCustomColors(prev => ({ ...prev, [key]: { ...newItem, hex: data.hex! } }));
             setSelectedHeadwearColor(key);
             break;
        case 'sleeveLength':
            setCustomSleeveLengths(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedSleeveLength(key);
            break;
        case 'footwear':
            setCustomFootwear(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedFootwear(key);
            break;
        case 'headwear':
            setCustomHeadwear(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedHeadwear(key);
            break;
        case 'bodyType':
            setCustomBodyTypes(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedBodyType(key);
            break;
        case 'posture': // Pose
            setCustomPostures(prev => ({ ...prev, [key]: newItem as any }));
            setSelectedPosture(key);
            break;
    }
  };

  const handleGenerate = async () => {
    // Validate based on outfit mode
    if (outfitMode === 'custom') {
      // Prevent selecting NONE for both upper and lower body
      if (selectedUpperGarment === 'none' && selectedLowerGarment === 'none') {
        toast.error("Please select at least one garment type. You cannot set both Upper and Lower Body to 'None'.");
        return;
      }

      // Check if user provided EITHER a text description OR made a selection in dropdowns
      const hasTextPrompt = customUpperPrompt.trim() || customLowerPrompt.trim() || customFootwearPrompt.trim() || customHeadwearPrompt.trim();
      const hasSelection = (selectedUpperGarment && selectedUpperGarment !== '') || 
                          (selectedLowerGarment && selectedLowerGarment !== '') || 
                          (selectedFootwear && selectedFootwear !== 'any') || 
                          (selectedHeadwear && selectedHeadwear !== 'any');
      
      if (!hasTextPrompt && !hasSelection) {
        toast.error("Please make a selection or enter a description to generate");
        return;
      }
    } else {
      if (!prompt.trim()) {
        toast.error("Please enter a description");
        return;
      }
    }

    setIsLoading(true);
    setLastPrompt(prompt);

    try {
      // Call real API with style prompt enhancement
      const languageCode = getLanguageCode(detectedLanguage);
      
      // Use custom prompt if user modified it, otherwise use computed
      const finalPrompt = customEnhancedPrompt || computeEnhancedPrompt();
      
      console.log('Generating image with prompt:', finalPrompt);
      console.log('Style:', selectedStyle);
      console.log('Language:', languageCode);

      const response = await apiClient.generateImage({
        prompt: finalPrompt,
        language: languageCode,
        style: selectedStyle as any,
      });

      if (response.success && response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        
        // Track style usage for frequently used styles
        updateStyleUsage(selectedStyle);
        
        // Store the backend-enhanced prompt returned from API
        if (response.prompt) {
          setBackendEnhancedPrompt(response.prompt);
        }
        
        // Add to history (keep max 5)
        const newHistoryItem: GenerationHistoryItem = {
          id: Date.now().toString(),
          imageUrl: response.imageUrl,
          prompt: prompt, // Store user's original prompt
          timestamp: Date.now(),
        };
        setGenerationHistory(prev => {
          const updated = [newHistoryItem, ...prev];
          return updated.slice(0, 5); // Keep only latest 5
        });
        
        toast.success(`Design created in ${(response.generationTime / 1000).toFixed(1)}s!`);
      } else {
        throw new Error(response.error || 'Failed to generate image');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate image. Please try again.");
      console.error('Generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastPrompt) {
      setPrompt(lastPrompt);
      handleGenerate();
    }
  };

  const handleGenerateBack = async () => {
    if (!generatedImage) {
      toast.error("Generate a front view first");
      return;
    }

    setIsLoading(true);

    try {
      // Use IMAGE + TEXT conditioned generation for consistent back view
      const backViewPrompt = "Show the back view of this exact garment. Keep the same fabric, colors, embroidery, and design elements. Rotate to show the rear of the outfit.";
      
      console.log('Generating back view conditioned on front image');

      // Use image-to-image with the generated front image
      const response = await apiClient.generateFromImage({
        imageData: generatedImage,
        textPrompt: backViewPrompt,
        style: selectedStyle,
      });

      if (response.success && response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        toast.success(`Back view created in ${(response.generationTime / 1000).toFixed(1)}s!`);
      } else {
        throw new Error(response.error || 'Failed to generate back view');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate back view. Please try again.");
      console.error('Generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageToImage = async (imageData: string, textPrompt: string) => {
    setIsLoading(true);
    setLastPrompt(textPrompt || "Image transformation");

    try {
      // For image+text mode, style comes from reference image - no style enhancement
      const fullPrompt = textPrompt || "Create a new fashion design inspired by this reference image";
      
      console.log('Generating from image with prompt:', fullPrompt);

      const response = await apiClient.generateFromImage({
        imageData: imageData,
        textPrompt: fullPrompt,
      });

      if (response.success && response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        toast.success(`Design created in ${(response.generationTime / 1000).toFixed(1)}s!`);
      } else {
        throw new Error(response.error || 'Failed to generate image');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate image. Please try again.");
      console.error('Generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="create" className="relative py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-overlay opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Create Your</span>{" "}
            <span className="gradient-text">Masterpiece</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Describe your dream fashion design in any Indian language. 
            Our AI understands your vision and brings it to life.
          </p>
        </motion.div>

        {/* Mode tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="flex justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setGenerationMode('text')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              generationMode === 'text'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            ✍️ Text to Image
          </button>
          <button
            onClick={() => setGenerationMode('image')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              generationMode === 'image'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            🖼️ Image + Text to Image
          </button>
        </motion.div>

        {/* Backdrop overlay when dropdown is open - blocks clicks on elements below */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Options for Text-to-Image mode */}
        {generationMode === 'text' && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center mb-8 space-y-6"
          >
            {/* Step 1: Gender Selection - Big prominent buttons */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Step 1: Select Gender</span>
              <div className="flex gap-4">
                <button
                  onClick={() => handleGenderChange('female')}
                  disabled={isLoading}
                  className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                    selectedGender === 'female'
                      ? 'bg-pink-500/20 text-pink-400 border-2 border-pink-500 shadow-lg shadow-pink-500/20'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border-2 border-transparent'
                  } disabled:opacity-50`}
                >
                  <span className="text-2xl">👩</span>
                  Female
                </button>
                <button
                  onClick={() => handleGenderChange('male')}
                  disabled={isLoading}
                  className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                    selectedGender === 'male'
                      ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border-2 border-transparent'
                  } disabled:opacity-50`}
                >
                  <span className="text-2xl">👨</span>
                  Male
                </button>
              </div>
            </div>

            {/* Step 2: Outfit Mode Toggle */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Step 2: Outfit Type</span>
              <div className="flex gap-2 p-1 rounded-xl bg-muted/30 border border-border/50">
                <button
                  onClick={() => setOutfitMode('full')}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    outfitMode === 'full'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  👔 Full Outfit
                </button>
                <button
                  onClick={() => setOutfitMode('custom')}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    outfitMode === 'custom'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ✂️ Custom (Upper + Lower)
                </button>
              </div>
            </div>

            {/* Step 3: Style Selection - Only for Full Outfit Mode */}
            {outfitMode === 'full' && (
            <div className="flex flex-col items-center gap-8 w-full">
              {/* Step 3: Model Details (Age, Body, Color, Pose) */}
              <div className="flex flex-col items-center gap-3 w-full">
                 <span className="text-sm font-medium text-muted-foreground">Step 3: Model Details</span>
                 <div className="flex flex-wrap justify-center gap-3">
                    {/* Age/Person Type */}
                    <NavigationMenu className="relative" onValueChange={(value: string) => setIsDropdownOpen(!!value)}>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger 
                            className="bg-muted/50 border border-border/50 hover:bg-muted h-12 px-4 text-base rounded-xl"
                            disabled={isLoading}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-xl">{personTypes[selectedPersonType]?.icon}</span>
                              <span>{personTypes[selectedPersonType]?.label}</span>
                            </span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="bg-zinc-900 border border-border rounded-xl shadow-xl p-2">
                            <ul className="grid w-[180px] gap-1">
                              {Object.entries(personTypes).map(([key, { label, icon }]) => (
                                <li key={key}>
                                  <button
                                    onClick={() => setSelectedPersonType(key)}
                                    className={`block w-full select-none rounded-lg p-2 text-left text-sm transition-colors ${
                                      selectedPersonType === key
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'hover:bg-muted'
                                    }`}
                                  >
                                    {icon} {label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>

                    {/* Body Type */}
                    <NavigationMenu className="relative" onValueChange={(value: string) => setIsDropdownOpen(!!value)}>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger 
                            className="bg-muted/50 border border-border/50 hover:bg-muted h-12 px-4 text-base rounded-xl"
                            disabled={isLoading}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-xl">{(bodyTypes[selectedBodyType] || customBodyTypes[selectedBodyType])?.icon}</span>
                              <span>{(bodyTypes[selectedBodyType] || customBodyTypes[selectedBodyType])?.label}</span>
                            </span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="bg-zinc-900 border border-border rounded-xl shadow-xl p-2">
                            <ul className="grid w-[180px] gap-1">
                              {Object.entries({...bodyTypes, ...customBodyTypes}).map(([key, { label, icon }]) => (
                                <li key={key}>
                                  <button
                                    onClick={() => setSelectedBodyType(key)}
                                    className={`block w-full select-none rounded-lg p-2 text-left text-sm transition-colors ${
                                      selectedBodyType === key
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'hover:bg-muted'
                                    }`}
                                  >
                                    {icon} {label}
                                  </button>
                                </li>
                              ))}
                              <li>
                                 <button
                                   onClick={() => handleOpenAddDialog('bodyType', 'Body Type')}
                                   className="block w-full select-none rounded-lg p-2 text-left text-sm text-primary hover:bg-primary/10 font-medium mt-1 border-t border-border/30"
                                 >
                                   + Add New...
                                 </button>
                               </li>
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>

                    {/* Color Selector */}
                    <div className="relative h-12">
                      <NavigationMenu className="relative" onValueChange={(value: string) => setIsDropdownOpen(!!value)}>
                        <NavigationMenuList>
                          <NavigationMenuItem>
                            <NavigationMenuTrigger 
                              className="bg-muted/30 border border-border/50 hover:bg-muted data-[state=open]:bg-muted h-12 px-4 text-sm min-w-[140px]"
                              disabled={isLoading}
                            >
                              <span className="flex items-center gap-2">
                                 <div 
                                    className="w-5 h-5 rounded-full border border-border shadow-sm" 
                                    style={{ backgroundColor: (COLOR_PALETTE[selectedUpperColor] || customColors[selectedUpperColor])?.hex || '#9CA3AF' }}
                                 />
                                 <span className="truncate max-w-[100px] text-left">
                                     <span className="block text-[10px] text-muted-foreground leading-tight">Color</span>
                                     <span className="block font-medium">{((COLOR_PALETTE[selectedUpperColor] || customColors[selectedUpperColor])?.label || "Any Color").replace(/^[^\w\s]+\s/, '')}</span>
                                 </span>
                              </span>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="bg-zinc-900 border border-border rounded-lg shadow-xl">
                              <ul className="grid w-[200px] max-h-[300px] overflow-y-auto gap-1 p-2">
                                {Object.entries({...COLOR_PALETTE, ...customColors}).map(([key, color]) => (
                                    <li key={key}>
                                    <button
                                        onClick={() => setSelectedUpperColor(key)}
                                        className={`flex items-center gap-3 w-full select-none rounded-md p-2 text-left text-sm ${
                                        selectedUpperColor === key
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-muted'
                                        }`}
                                    >
                                        <div 
                                        className="w-5 h-5 rounded-full border border-border shadow-sm" 
                                        style={{ backgroundColor: color.hex }}
                                        />
                                        <span className="truncate">{color.label.replace(/^[^\w\s]+\s/, '')}</span>
                                    </button>
                                    </li>
                                ))}
                                <div className="h-px bg-border/50 my-1" />
                                <li>
                                  <button
                                    onClick={() => handleOpenAddDialog('color', 'Color', true)}
                                    className="flex items-center gap-2 w-full select-none rounded-md p-2 text-left text-sm text-primary hover:bg-muted font-medium"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Custom Color
                                  </button>
                                </li>
                              </ul>
                            </NavigationMenuContent>
                          </NavigationMenuItem>
                        </NavigationMenuList>
                      </NavigationMenu>
                    </div>

                    {/* Pose Selector */}
                    <NavigationMenu className="relative" onValueChange={(value: string) => setIsDropdownOpen(!!value)}>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger 
                            className="bg-muted/50 border border-border/50 hover:bg-muted h-12 px-4 text-base rounded-xl"
                            disabled={isLoading}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-xl">{(POSTURE_OPTIONS[selectedPosture] || customPostures[selectedPosture])?.icon}</span>
                              <span>{(POSTURE_OPTIONS[selectedPosture] || customPostures[selectedPosture])?.label}</span>
                            </span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="bg-zinc-900 border border-border rounded-xl shadow-xl p-2">
                            <ul className="grid w-[180px] gap-1">
                              {Object.entries({...POSTURE_OPTIONS, ...customPostures}).map(([key, { label, icon }]) => (
                                <li key={key}>
                                  <button
                                    onClick={() => setSelectedPosture(key)}
                                    className={`block w-full select-none rounded-lg p-2 text-left text-sm transition-colors ${
                                      selectedPosture === key
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'hover:bg-muted'
                                    }`}
                                  >
                                    {icon} {label}
                                  </button>
                                </li>
                              ))}
                              <li>
                                 <button
                                   onClick={() => handleOpenAddDialog('posture', 'Pose')}
                                   className="block w-full select-none rounded-lg p-2 text-left text-sm text-primary hover:bg-primary/10 font-medium mt-1 border-t border-border/30"
                                 >
                                   + Add New...
                                 </button>
                               </li>
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                 </div>
              </div>

              {/* Step 4: Choose Style (Renamed) */}
              <div className="flex flex-col items-center gap-3 w-full">
              <span className="text-sm font-medium text-muted-foreground">Step 4: Choose Style</span>
              
              {outfitMode === 'full' ? (
                /* Full Outfit Mode - Single Expandable Hierarchical Style Selector */
                <div className="w-full max-w-4xl mx-auto">
                  {/* Main Style Button - Click to expand */}
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setIsStyleExpanded(!isStyleExpanded)}
                      disabled={isLoading}
                      className={`flex-1 max-w-2xl px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between gap-3 ${
                        isStyleExpanded
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted/50 border border-border/50 hover:bg-muted hover:border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                            {currentCategoryGarments[selectedGarment || ""]?.icon || customGarments[selectedGarment || ""]?.icon || "👗"}
                        </span>
                        <span className="text-left">
                            {selectedGarment 
                            ? (
                                <span className="flex items-center flex-wrap gap-1">
                                {styleHierarchy[selectedCategory]?.label || customCategories[selectedCategory]?.label || "Category"}
                                <span className="opacity-50">→</span>
                                {currentCategoryGarments[selectedGarment]?.label || customGarments[selectedGarment]?.label}
                                {selectedFabric ? (
                                    <>
                                    <span className="opacity-50">→</span>
                                    {currentGarmentFabrics[selectedFabric]?.label || customFabrics[selectedFabric]?.label}
                                    </>
                                ) : ""}
                                {selectedPrint ? (
                                    <>
                                    <span className="opacity-50">→</span>
                                    {currentFabricPrints[selectedPrint]?.label || customPrints[selectedPrint]?.label}
                                    </>
                                ) : ""}
                                </span>
                            )
                            : "Select Style..."
                            }
                        </span>
                      </div>
                      <span className={`transition-transform ${isStyleExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {/* Edit/Reset Buttons */}
                    <div className="flex gap-1">
                        {customEnhancedPrompt && (
                            <button
                                onClick={handleResetEditedPrompt}
                                title="Reset to auto-generated"
                                className="p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                  </div>

                  {/* Expanded Hierarchical Panel */}
                  {isStyleExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-xl bg-card/50 border border-border/50 space-y-4"
                    >
                      {/* Level 1: Category */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</span>
                          <button
                            onClick={() => { setShowAddCategory(true); setNewItemName(""); }}
                            className="text-xs text-primary hover:underline"
                          >
                            + Add Custom
                          </button>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {Object.entries(styleHierarchy).map(([key, cat]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedCategory(key)}
                              disabled={isLoading}
                              className={`select-none rounded-lg p-3 text-center transition-colors ${
                                selectedCategory === key
                                  ? 'bg-primary/20 text-primary border border-primary/40'
                                  : 'hover:bg-muted/50 border border-transparent'
                              }`}
                            >
                              <span className="text-2xl block">{cat.icon}</span>
                              <p className="text-sm mt-1 truncate">{cat.label}</p>
                            </button>
                          ))}
                          {Object.entries(customCategories).map(([key, item]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedCategory(key)}
                              disabled={isLoading}
                              className={`select-none rounded-lg p-3 text-center transition-colors ${
                                selectedCategory === key
                                  ? 'bg-primary/20 text-primary border border-primary/40'
                                  : 'hover:bg-muted/50 border border-transparent'
                              }`}
                            >
                              <span className="text-2xl block">{item.icon}</span>
                              <p className="text-sm mt-1 truncate">{item.label}</p>
                            </button>
                          ))}
                        </div>
                        {showAddCategory && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              placeholder="Category name..."
                              className="flex-1 px-3 py-1.5 text-sm bg-muted/30 rounded-lg text-foreground"
                            />
                            <button onClick={() => {
                              if (newItemName.trim()) {
                                const key = `custom_${newItemName.toLowerCase().replace(/\s+/g, '_')}`;
                                setCustomCategories(prev => ({ ...prev, [key]: { label: newItemName, icon: "🏷️" } }));
                                setSelectedCategory(key);
                              }
                              setNewItemName("");
                              setShowAddCategory(false);
                            }} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg">Add</button>
                            <button onClick={() => setShowAddCategory(false)} className="px-3 py-1.5 text-sm text-muted-foreground">Cancel</button>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border/30" />

                      {/* Level 2: Garment */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Garment Type</span>
                          <button
                            onClick={() => { setShowAddGarment(true); setNewItemName(""); setNewItemPrompt(""); }}
                            className="text-xs text-primary hover:underline"
                          >
                            + Add Custom
                          </button>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 max-h-48 overflow-y-auto">
                          {Object.entries(currentCategoryGarments).map(([key, garment]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedGarment(key)}
                              disabled={isLoading}
                              className={`relative select-none rounded-lg p-2 text-center transition-colors ${
                                selectedGarment === key
                                  ? 'bg-primary/20 text-primary border border-primary/40'
                                  : 'hover:bg-muted/50 border border-transparent'
                              }`}
                            >
                              <span className="text-2xl block">{garment.icon}</span>
                              <p className="text-sm mt-1 truncate">{garment.label}</p>
                                {selectedGarment === key && (
                                  <div 
                                    className="absolute top-1 right-1 p-1.5 rounded-full bg-card shadow-sm border border-border/50 text-foreground hover:text-primary cursor-pointer z-20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditOption('garment', key, garment);
                                    }}
                                    title="Edit garment prompt"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </div>
                                )}
                            </button>
                          ))}
                          {Object.entries(customGarments).map(([key, item]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedGarment(key)}
                              disabled={isLoading}
                              className={`relative select-none rounded-lg p-2 text-center transition-colors ${
                                selectedGarment === key
                                  ? 'bg-primary/20 text-primary border border-primary/40'
                                  : 'hover:bg-muted/50 border border-transparent'
                              }`}
                            >
                              <span className="text-2xl block">{item.icon}</span>
                              <p className="text-sm mt-1 truncate">{item.label}</p>
                              {selectedGarment === key && (
                                <div 
                                  className="absolute top-1 right-1 p-1.5 rounded-full bg-card shadow-sm border border-border/50 text-foreground hover:text-primary cursor-pointer z-20"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditOption('garment', key, item);
                                  }}
                                  title="Edit garment prompt"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {showAddGarment && (
                          <div className="flex flex-col gap-2 mt-2">
                            <input
                              type="text"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              placeholder="Garment name..."
                              className="px-3 py-1.5 text-sm bg-muted/30 rounded-lg text-foreground"
                            />
                            <input
                              type="text"
                              value={newItemPrompt}
                              onChange={(e) => setNewItemPrompt(e.target.value)}
                              placeholder="Description (optional)..."
                              className="px-3 py-1.5 text-sm bg-muted/30 rounded-lg text-foreground"
                            />
                            <div className="flex gap-2">
                              <button onClick={handleAddCustomGarment} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg">Add</button>
                              <button onClick={() => setShowAddGarment(false)} className="px-3 py-1.5 text-sm text-muted-foreground">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Level 3: Fabric (shows when garment selected) */}
                      {selectedGarment && (
                        <>
                          <div className="border-t border-border/30" />
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fabric</span>
                              <button
                                onClick={() => { setShowAddFabric(true); setNewItemName(""); setNewItemPrompt(""); }}
                                className="text-xs text-primary hover:underline"
                              >
                                + Add Custom
                              </button>
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 max-h-48 overflow-y-auto">
                              {Object.entries(currentGarmentFabrics).map(([key, fabric]) => (
                                <button
                                  key={key}
                                  onClick={() => setSelectedFabric(key)}
                                  disabled={isLoading}
                                  className={`relative select-none rounded-lg p-2 text-center transition-colors ${
                                    selectedFabric === key
                                      ? 'bg-primary/20 text-primary border border-primary/40'
                                      : 'hover:bg-muted/50 border border-transparent'
                                  }`}
                                >
                                  <span className="text-2xl block">{fabric.icon}</span>
                                  <p className="text-sm mt-1 truncate">{fabric.label}</p>
                                  {selectedFabric === key && (
                                    <div 
                                      className="absolute top-1 right-1 p-1.5 rounded-full bg-card shadow-sm border border-border/50 text-foreground hover:text-primary cursor-pointer z-20"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditOption('fabric', key, fabric);
                                      }}
                                      title="Edit fabric prompt"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </button>
                              ))}
                              {Object.entries(customFabrics).map(([key, item]) => (
                                <button
                                  key={key}
                                  onClick={() => setSelectedFabric(key)}
                                  disabled={isLoading}
                                  className={`relative select-none rounded-lg p-2 text-center transition-colors ${
                                    selectedFabric === key
                                      ? 'bg-primary/20 text-primary border border-primary/40'
                                      : 'hover:bg-muted/50 border border-transparent'
                                  }`}
                                >
                                  <span className="text-2xl block">{item.icon}</span>
                                  <p className="text-sm mt-1 truncate">{item.label}</p>
                                  {selectedFabric === key && (
                                    <div 
                                      className="absolute top-1 right-1 p-1.5 rounded-full bg-card shadow-sm border border-border/50 text-foreground hover:text-primary cursor-pointer z-20"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditOption('fabric', key, item);
                                      }}
                                      title="Edit fabric prompt"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                            {showAddFabric && (
                              <div className="flex flex-col gap-2 mt-2">
                                <input
                                  type="text"
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  placeholder="Fabric name..."
                                  className="px-3 py-1.5 text-sm bg-muted/30 rounded-lg text-foreground"
                                />
                                <input
                                  type="text"
                                  value={newItemPrompt}
                                  onChange={(e) => setNewItemPrompt(e.target.value)}
                                  placeholder="Description (optional)..."
                                  className="px-3 py-1.5 text-sm bg-muted/30 rounded-lg text-foreground"
                                />
                                <div className="flex gap-2">
                                  <button onClick={handleAddCustomFabric} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg">Add</button>
                                  <button onClick={() => setShowAddFabric(false)} className="px-3 py-1.5 text-sm text-muted-foreground">Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Level 4: Print (shows when fabric selected) */}
                      {selectedGarment && selectedFabric && (
                        <>
                          <div className="border-t border-border/30" />
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Print / Pattern</span>
                              <button
                                onClick={() => { setShowAddPrint(true); setNewItemName(""); setNewItemPrompt(""); }}
                                className="text-xs text-primary hover:underline"
                              >
                                + Add Custom
                              </button>
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 max-h-48 overflow-y-auto">
                              {Object.entries(currentFabricPrints).map(([key, print]) => (
                                <button
                                  key={key}
                                  onClick={() => setSelectedPrint(key)}
                                  disabled={isLoading}
                                  className={`relative select-none rounded-lg p-2 text-center transition-colors ${
                                    selectedPrint === key
                                      ? 'bg-primary/20 text-primary border border-primary/40'
                                      : 'hover:bg-muted/50 border border-transparent'
                                  }`}
                                >
                                  <span className="text-2xl block">🎨</span>
                                  <p className="text-sm mt-1 truncate">{print.label}</p>
                                  {selectedPrint === key && (
                                    <div 
                                      className="absolute top-1 right-1 p-1.5 rounded-full bg-card shadow-sm border border-border/50 text-foreground hover:text-primary cursor-pointer z-20"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditOption('print', key, print);
                                      }}
                                      title="Edit print prompt"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </button>
                              ))}
                              {Object.entries(customPrints).map(([key, item]) => (
                                <button
                                  key={key}
                                  onClick={() => setSelectedPrint(key)}
                                  disabled={isLoading}
                                  className={`relative select-none rounded-lg p-2 text-center transition-colors ${
                                    selectedPrint === key
                                      ? 'bg-primary/20 text-primary border border-primary/40'
                                      : 'hover:bg-muted/50 border border-transparent'
                                  }`}
                                >
                                  <span className="text-2xl block">{item.icon}</span>
                                  <p className="text-sm mt-1 truncate">{item.label}</p>
                                  {selectedPrint === key && (
                                    <div 
                                      className="absolute top-1 right-1 p-1.5 rounded-full bg-card shadow-sm border border-border/50 text-foreground hover:text-primary cursor-pointer z-20"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditOption('print', key, item);
                                      }}
                                      title="Edit print prompt"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                            {showAddPrint && (
                              <div className="flex flex-col gap-2 mt-2">
                                <input
                                  type="text"
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  placeholder="Print/Pattern name..."
                                  className="px-3 py-1.5 text-sm bg-muted/30 rounded-lg text-foreground"
                                />
                                <input
                                  type="text"
                                  value={newItemPrompt}
                                  onChange={(e) => setNewItemPrompt(e.target.value)}
                                  placeholder="Description (optional)..."
                                  className="px-3 py-1.5 text-sm bg-muted/30 rounded-lg text-foreground"
                                />
                                <div className="flex gap-2">
                                  <button onClick={handleAddCustomPrint} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg">Add</button>
                                  <button onClick={() => setShowAddPrint(false)} className="px-3 py-1.5 text-sm text-muted-foreground">Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Done Button */}
                      <div className="border-t border-border/30 pt-3">
                        <button
                          onClick={() => setIsStyleExpanded(false)}
                          className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Custom Mode - Upper + Lower Style Selection with expandable panels */
                <div className="w-full">
                  <div className="flex flex-wrap justify-center gap-4 mb-2">
                    {/* Upper Body Style Button */}
                    <button
                      onClick={() => setIsUpperStyleExpanded(!isUpperStyleExpanded)}
                      disabled={isLoading}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                        isUpperStyleExpanded
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted/50 border border-border/50 hover:bg-muted hover:border-border'
                      }`}
                    >
                      <span className="text-xl">{allStyles[selectedUpperStyle]?.icon || UPPER_BODY_STYLES[selectedUpperStyle]?.icon || "👚"}</span>
                      <span>Upper: {allStyles[selectedUpperStyle]?.label || UPPER_BODY_STYLES[selectedUpperStyle]?.label || "Select"}</span>
                      <span className={`transition-transform ${isUpperStyleExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    {/* Lower Body Style Button */}
                    <button
                      onClick={() => setIsLowerStyleExpanded(!isLowerStyleExpanded)}
                      disabled={isLoading}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                        isLowerStyleExpanded
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted/50 border border-border/50 hover:bg-muted hover:border-border'
                      }`}
                    >
                      <span className="text-xl">{allStyles[selectedLowerStyle]?.icon || LOWER_BODY_STYLES[selectedLowerStyle]?.icon || "👖"}</span>
                      <span>Lower: {allStyles[selectedLowerStyle]?.label || LOWER_BODY_STYLES[selectedLowerStyle]?.label || "Select"}</span>
                      <span className={`transition-transform ${isLowerStyleExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  </div>
                  
                  {/* Upper Body Style Expandable Panel - Shifts content down */}
                  {isUpperStyleExpanded && (
                    <div className="bg-zinc-900 border border-border rounded-xl p-4 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-xs text-muted-foreground mb-3">👚 Select a style for upper body garment:</p>
                      {Object.entries(STYLE_CATEGORIES)
                        .sort((a, b) => a[1].order - b[1].order)
                        .map(([categoryKey, categoryInfo]) => {
                          const categoryStyles = Object.entries(allStyles).filter(
                            ([_, style]) => style.category === categoryKey
                          );
                          if (categoryStyles.length === 0) return null;
                          return (
                            <div key={categoryKey} className="mb-4 last:mb-0">
                              <h3 className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border/50">
                                {categoryInfo.label}
                              </h3>
                              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                                {categoryStyles.map(([key, style]) => (
                                  <button
                                    key={key}
                                    onClick={() => { setSelectedUpperStyle(key); setIsUpperStyleExpanded(false); }}
                                    className={`select-none rounded-lg p-2 text-center transition-colors ${
                                      selectedUpperStyle === key
                                        ? 'bg-primary/20 text-primary border border-primary/40'
                                        : 'hover:bg-muted/50 border border-transparent'
                                    }`}
                                  >
                                    <span className="text-2xl">{style.icon}</span>
                                    <p className="text-sm mt-1 truncate">{style.label}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  
                  {/* Lower Body Style Expandable Panel - Shifts content down */}
                  {isLowerStyleExpanded && (
                    <div className="bg-zinc-900 border border-border rounded-xl p-4 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-xs text-muted-foreground mb-3">👖 Select a style for lower body garment:</p>
                      {Object.entries(STYLE_CATEGORIES)
                        .sort((a, b) => a[1].order - b[1].order)
                        .map(([categoryKey, categoryInfo]) => {
                          const categoryStyles = Object.entries(allStyles).filter(
                            ([_, style]) => style.category === categoryKey
                          );
                          if (categoryStyles.length === 0) return null;
                          return (
                            <div key={categoryKey} className="mb-4 last:mb-0">
                              <h3 className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border/50">
                                {categoryInfo.label}
                              </h3>
                              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                                {categoryStyles.map(([key, style]) => (
                                  <button
                                    key={key}
                                    onClick={() => { setSelectedLowerStyle(key); setIsLowerStyleExpanded(false); }}
                                    className={`select-none rounded-lg p-2 text-center transition-colors ${
                                      selectedLowerStyle === key
                                        ? 'bg-primary/20 text-primary border border-primary/40'
                                        : 'hover:bg-muted/50 border border-transparent'
                                    }`}
                                  >
                                    <span className="text-2xl">{style.icon}</span>
                                    <p className="text-sm mt-1 truncate">{style.label}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
            )}

            {/* Step 4: Additional Options (Custom Mode Only) */}
            {outfitMode === 'custom' && (
            <div className="flex flex-wrap justify-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
              {/* Person Type Dropdown */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
                <span className="text-xs text-muted-foreground">Age:</span>
                <NavigationMenu className="relative" onValueChange={(value: string) => setIsDropdownOpen(!!value)}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="bg-muted/30 border border-border/50 hover:bg-muted data-[state=open]:bg-muted h-8 text-sm"
                        disabled={isLoading}
                      >
                        <span className="flex items-center gap-1">
                          <span>{personTypes[selectedPersonType]?.icon}</span>
                          <span>{personTypes[selectedPersonType]?.label}</span>
                        </span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-card border border-border/50 rounded-lg shadow-xl">
                        <ul className="grid w-[180px] gap-1 p-2">
                          {Object.entries(personTypes).map(([key, { label, icon }]) => (
                            <li key={key}>
                              <button
                                onClick={() => setSelectedPersonType(key)}
                                className={`block w-full select-none rounded-md p-2 text-left text-sm ${
                                  selectedPersonType === key
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted'
                                }`}
                              >
                                {icon} {label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              {/* Body Type Dropdown - Gender Specific */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
                <span className="text-xs text-muted-foreground">Body:</span>
                <NavigationMenu className="relative" onValueChange={(value: string) => setIsDropdownOpen(!!value)}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="bg-muted/30 border border-border/50 hover:bg-muted data-[state=open]:bg-muted h-8 text-sm"
                        disabled={isLoading}
                      >
                        <span className="flex items-center gap-1">
                          <span>{(bodyTypes[selectedBodyType] || customBodyTypes[selectedBodyType])?.icon}</span>
                          <span>{(bodyTypes[selectedBodyType] || customBodyTypes[selectedBodyType])?.label}</span>
                        </span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-zinc-900 border border-border rounded-lg shadow-xl">
                        <ul className="grid w-[160px] gap-1 p-2">
                          {Object.entries({...bodyTypes, ...customBodyTypes}).map(([key, { label, icon }]) => (
                            <li key={key}>
                              <button
                                onClick={() => setSelectedBodyType(key)}
                                className={`block w-full select-none rounded-md p-2 text-left text-sm ${
                                  selectedBodyType === key
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted'
                                }`}
                              >
                                {icon} {label}
                              </button>
                            </li>
                          ))}
                          <li>
                             <button
                               onClick={() => handleOpenAddDialog('bodyType', 'Body Type')}
                               className="block w-full select-none rounded-md p-2 text-left text-sm text-primary hover:bg-muted font-medium"
                             >
                               + Add New...
                             </button>
                           </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>



              {/* Posture Dropdown */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
                <span className="text-xs text-muted-foreground">Pose:</span>
                <NavigationMenu className="relative" onValueChange={(value: string) => setIsDropdownOpen(!!value)}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className="bg-muted/30 border border-border/50 hover:bg-muted data-[state=open]:bg-muted h-8 text-sm"
                        disabled={isLoading}
                      >
                        <span className="flex items-center gap-1">
                          <span>{(POSTURE_OPTIONS[selectedPosture] || customPostures[selectedPosture])?.icon}</span>
                          <span>{(POSTURE_OPTIONS[selectedPosture] || customPostures[selectedPosture])?.label}</span>
                        </span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-zinc-900 border border-border rounded-lg shadow-xl">
                        <ul className="grid w-[150px] gap-1 p-2">
                          {Object.entries({...POSTURE_OPTIONS, ...customPostures}).map(([key, { label, icon }]) => (
                            <li key={key}>
                              <button
                                onClick={() => setSelectedPosture(key)}
                                className={`block w-full select-none rounded-md p-2 text-left text-sm ${
                                  selectedPosture === key
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted'
                                }`}
                              >
                                {icon} {label}
                              </button>
                            </li>
                          ))}
                          <li>
                             <button
                               onClick={() => handleOpenAddDialog('posture', 'Pose')}
                               className="block w-full select-none rounded-md p-2 text-left text-sm text-primary hover:bg-muted font-medium"
                             >
                               + Add New...
                             </button>
                           </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
            )}

            
            {/* Add Custom Style Form (Collapsible) */}
            {showAddStyle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 w-full max-w-md p-4 rounded-xl bg-card border border-border/50"
              >
                <h4 className="text-sm font-medium text-foreground mb-3">Create Custom Style</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Style Name</label>
                    <input
                      type="text"
                      value={newStyleName}
                      onChange={(e) => setNewStyleName(e.target.value)}
                      placeholder="e.g., Chanderi Silk"
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Design Preference Prompt</label>
                    <textarea
                      value={newStylePrompt}
                      onChange={(e) => setNewStylePrompt(e.target.value)}
                      placeholder="e.g., Lightweight Chanderi silk fabric, subtle gold zari borders, pastel colors, sheer texture, Madhya Pradesh heritage weaving"
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-muted/30 rounded-lg text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowAddStyle(false);
                        setNewStyleName("");
                        setNewStylePrompt("");
                      }}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomStyle}
                      className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Add Style
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Main creation interface */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Input side */}
          <div>
            {generationMode === 'text' ? (
              <>
                {/* Custom Mode - Two text areas with color pickers */}
                {outfitMode === 'custom' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-3xl mx-auto"
                  >
                    <div className="gradient-border">
                      <div className="relative bg-card rounded-xl p-4 space-y-4">
                        {/* Upper Body Prompt with Color Dropdown */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-foreground">👚 Upper Body</span>
                              <div className="flex items-center gap-2">
                                {/* Upper Body Color Selector */}
                                <div className={`relative h-8 w-full min-w-[120px] max-w-[150px] ${activeDropdown === 'upper' ? 'z-50' : 'z-10'}`}>
                                  <NavigationMenu className="relative" onValueChange={(value: string) => { setIsDropdownOpen(!!value); setActiveDropdown(!!value ? 'upper' : null); }}>
                                    <NavigationMenuList>
                                      <NavigationMenuItem>
                                        <NavigationMenuTrigger 
                                          className="bg-muted/50 border border-border/50 hover:bg-muted h-9 px-3 text-xs w-full justify-start"
                                          disabled={isLoading}
                                        >
                                          <span className="flex items-center gap-2 truncate">
                                             <div 
                                                className="w-3.5 h-3.5 rounded-full border border-border shadow-sm flex-shrink-0" 
                                                style={{ backgroundColor: (COLOR_PALETTE[selectedUpperColor] || customColors[selectedUpperColor])?.hex || '#9CA3AF' }}
                                             />
                                             <span className="truncate">
                                                 {((COLOR_PALETTE[selectedUpperColor] || customColors[selectedUpperColor])?.label || "Any Color").replace(/^[^\w\s]+\s/, '')}
                                             </span>
                                          </span>
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent className="bg-zinc-900 border border-border rounded-lg shadow-xl">
                                          <ul className="grid w-[200px] max-h-[300px] overflow-y-auto gap-1 p-2">
                                            {Object.entries({...COLOR_PALETTE, ...customColors}).map(([key, color]) => (
                                                <li key={key}>
                                                <button
                                                    onClick={() => setSelectedUpperColor(key)}
                                                    className={`flex items-center gap-3 w-full select-none rounded-md p-2 text-left text-sm ${
                                                    selectedUpperColor === key
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    <div 
                                                    className="w-4 h-4 rounded-full border border-border shadow-sm" 
                                                    style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span className="truncate">{color.label.replace(/^[^\w\s]+\s/, '')}</span>
                                                </button>
                                                </li>
                                            ))}
                                            <div className="h-px bg-border/50 my-1" />
                                            <li>
                                              <button
                                                onClick={() => handleOpenAddDialog('upperColor', 'Upper Body Color', true)}
                                                className="flex items-center gap-2 w-full select-none rounded-md p-2 text-left text-sm text-primary hover:bg-muted font-medium"
                                              >
                                                <Plus className="w-4 h-4" />
                                                Add Custom Color
                                              </button>
                                            </li>
                                          </ul>
                                        </NavigationMenuContent>
                                      </NavigationMenuItem>
                                    </NavigationMenuList>
                                  </NavigationMenu>
                                </div>
                                {/* Sleeve Length Dropdown */}
                                <select
                                  value={selectedSleeveLength}
                                  onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === 'add_new') {
                                          handleOpenAddDialog('sleeveLength', 'Sleeve Length');
                                      } else {
                                          setSelectedSleeveLength(val);
                                      }
                                  }}
                                  disabled={isLoading}
                                  className="text-xs px-2 py-1 rounded-md bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer"
                                  title="Sleeve length"
                                >
                                  {Object.entries({...SLEEVE_LENGTH_OPTIONS, ...customSleeveLengths}).map(([key, item]) => (
                                    <option key={key} value={key}>{item.icon} {item.label}</option>
                                  ))}
                                  <option value="add_new" className="font-medium text-primary">+ Add New...</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hierarchical Garment Selection for Upper Body */}
                          <div className="flex flex-wrap gap-2 items-center">
                            {/* Garment Dropdown */}
                            <CustomDropdown
                              value={selectedUpperGarment || ""}
                              options={Object.entries({...upperBodyGarments, ...customUpperGarments})}
                              onChange={(val) => setSelectedUpperGarment(val || null)}
                              onEdit={(key, opt) => handleEditOption('upperGarment', key, opt)}
                              onAdd={() => handleOpenAddDialog('upperGarment', 'Upper Garment')}
                              placeholder="Select Garment..."
                              className="flex-1 min-w-[140px]"
                              disabled={isLoading}
                              title="Select upper body garment"
                            />
                            
                            {/* Fabric Dropdown (shown when garment selected and not NONE) */}
                            {selectedUpperGarment && selectedUpperGarment !== 'none' && (Object.keys(upperBodyFabrics).length > 0 || Object.keys(customUpperFabrics).length > 0) && (
                              <CustomDropdown
                                value={selectedUpperFabric || ""}
                                options={Object.entries({...upperBodyFabrics, ...customUpperFabrics})}
                                onChange={(val) => setSelectedUpperFabric(val || null)}
                                onEdit={(key, opt) => handleEditOption('upperFabric', key, opt)}
                                onAdd={() => handleOpenAddDialog('upperFabric', 'Upper Fabric')}
                                placeholder="Select Fabric..."
                                className="flex-1 min-w-[120px]"
                                disabled={isLoading}
                                title="Select fabric"
                              />
                            )}
                            
                            {/* Print Dropdown (shown when fabric selected) */}
                            {selectedUpperGarment && selectedUpperGarment !== 'none' && selectedUpperFabric && (Object.keys(upperBodyPrints).length > 0 || Object.keys(customUpperPrints).length > 0) && (
                              <CustomDropdown
                                value={selectedUpperPrint || ""}
                                options={Object.entries({...upperBodyPrints, ...customUpperPrints})}
                                onChange={(val) => setSelectedUpperPrint(val || null)}
                                onEdit={(key, opt) => handleEditOption('upperPrint', key, opt)}
                                onAdd={() => handleOpenAddDialog('upperPrint', 'Upper Print')}
                                placeholder="Select Print..."
                                className="flex-1 min-w-[120px]"
                                disabled={isLoading}
                                title="Select print/pattern"
                              />
                            )}
                          </div>
                          
                          {/* Summary of upper body selection */}
                          {selectedUpperGarment && selectedUpperGarment !== 'none' && (
                            <div className="text-xs text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-md">
                              Selected: <span className="text-foreground font-medium">{getUpperBodyButtonLabel()}</span>
                            </div>
                          )}
                          <div className="relative">
                            <textarea
                              value={customUpperPrompt}
                              onChange={(e) => setCustomUpperPrompt(e.target.value)}
                              placeholder="Describe upper body outfit... e.g., 'A silk blouse with golden embroidery and puff sleeves'"
                              rows={3}
                              disabled={isLoading || selectedUpperGarment === 'none'}
                              className={`w-full px-4 py-3 bg-muted/30 rounded-lg text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${isUpperListening ? 'ring-2 ring-primary' : ''}`}
                            />
                            {isUpperListening && (
                              <span className="absolute right-3 top-3 text-xs text-primary animate-pulse">Listening in {voiceLang.split('-')[0].toUpperCase()}...</span>
                            )}
                          </div>
                          {/* Audio input bar for upper body */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border/50">
                              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Audio</span>
                            </div>
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
                            <Button
                              variant="glass"
                              size="icon"
                              onClick={toggleUpperListening}
                              disabled={isLoading}
                              className={`relative ${isUpperListening ? 'text-primary' : ''}`}
                              title={isUpperListening ? "Stop listening" : "Start voice input"}
                            >
                              {isUpperListening ? (
                                <>
                                  <MicOff className="w-4 h-4" />
                                  <span className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
                                </>
                              ) : (
                                <Mic className="w-4 h-4" />
                              )}
                            </Button>
                            {customUpperPrompt && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCustomUpperPrompt("")}
                                disabled={isLoading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Lower Body Prompt with Color Picker */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-foreground">👖 Lower Body</span>
                              <div className="flex items-center gap-2">
                                {/* Lower Body Color Selector */}
                                <div className={`relative h-8 w-full min-w-[120px] max-w-[150px] ${activeDropdown === 'lower' ? 'z-50' : 'z-10'}`}>
                                  <NavigationMenu className="relative" onValueChange={(value: string) => { setIsDropdownOpen(!!value); setActiveDropdown(!!value ? 'lower' : null); }}>
                                    <NavigationMenuList>
                                      <NavigationMenuItem>
                                        <NavigationMenuTrigger 
                                          className="bg-muted/50 border border-border/50 hover:bg-muted h-9 px-3 text-xs w-full justify-start"
                                          disabled={isLoading}
                                        >
                                          <span className="flex items-center gap-2 truncate">
                                             <div 
                                                className="w-3.5 h-3.5 rounded-full border border-border shadow-sm flex-shrink-0" 
                                                style={{ backgroundColor: (COLOR_PALETTE[selectedLowerColor] || customColors[selectedLowerColor])?.hex || '#9CA3AF' }}
                                             />
                                             <span className="truncate">
                                                 {((COLOR_PALETTE[selectedLowerColor] || customColors[selectedLowerColor])?.label || "Any Color").replace(/^[^\w\s]+\s/, '')}
                                             </span>
                                          </span>
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent className="bg-zinc-900 border border-border rounded-lg shadow-xl">
                                          <ul className="grid w-[200px] max-h-[300px] overflow-y-auto gap-1 p-2">
                                            {Object.entries({...COLOR_PALETTE, ...customColors}).map(([key, color]) => (
                                                <li key={key}>
                                                <button
                                                    onClick={() => setSelectedLowerColor(key)}
                                                    className={`flex items-center gap-3 w-full select-none rounded-md p-2 text-left text-sm ${
                                                    selectedLowerColor === key
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    <div 
                                                    className="w-4 h-4 rounded-full border border-border shadow-sm" 
                                                    style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span className="truncate">{color.label.replace(/^[^\w\s]+\s/, '')}</span>
                                                </button>
                                                </li>
                                            ))}
                                            <div className="h-px bg-border/50 my-1" />
                                            <li>
                                              <button
                                                onClick={() => handleOpenAddDialog('lowerColor', 'Lower Body Color', true)}
                                                className="flex items-center gap-2 w-full select-none rounded-md p-2 text-left text-sm text-primary hover:bg-muted font-medium"
                                              >
                                                <Plus className="w-4 h-4" />
                                                Add Custom Color
                                              </button>
                                            </li>
                                          </ul>
                                        </NavigationMenuContent>
                                      </NavigationMenuItem>
                                    </NavigationMenuList>
                                  </NavigationMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hierarchical Garment Selection for Lower Body */}
                          <div className="flex flex-wrap gap-2 items-center">
                            {/* Garment Dropdown */}
                            <CustomDropdown
                              value={selectedLowerGarment || ""}
                              options={Object.entries({...lowerBodyGarments, ...customLowerGarments})}
                              onChange={(val) => setSelectedLowerGarment(val || null)}
                              onEdit={(key, opt) => handleEditOption('lowerGarment', key, opt)}
                              onAdd={() => handleOpenAddDialog('lowerGarment', 'Lower Garment')}
                              placeholder="Select Garment..."
                              className="flex-1 min-w-[140px]"
                              disabled={isLoading}
                              title="Select lower body garment"
                            />
                            
                            {/* Fabric Dropdown (shown when garment selected and not NONE) */}
                            {selectedLowerGarment && selectedLowerGarment !== 'none' && (Object.keys(lowerBodyFabrics).length > 0 || Object.keys(customLowerFabrics).length > 0) && (
                                <CustomDropdown
                                  value={selectedLowerFabric || ""}
                                  options={Object.entries({...lowerBodyFabrics, ...customLowerFabrics})}
                                  onChange={(val) => setSelectedLowerFabric(val || null)}
                                  onEdit={(key, opt) => handleEditOption('lowerFabric', key, opt)}
                                  onAdd={() => handleOpenAddDialog('lowerFabric', 'Lower Fabric')}
                                  placeholder="Select Fabric..."
                                  className="flex-1 min-w-[120px]"
                                  disabled={isLoading}
                                  title="Select fabric"
                                />
                            )}
                            
                            {/* Print Dropdown (shown when fabric selected) */}
                            {selectedLowerGarment && selectedLowerGarment !== 'none' && selectedLowerFabric && (Object.keys(lowerBodyPrints).length > 0 || Object.keys(customLowerPrints).length > 0) && (
                                <CustomDropdown
                                  value={selectedLowerPrint || ""}
                                  options={Object.entries({...lowerBodyPrints, ...customLowerPrints})}
                                  onChange={(val) => setSelectedLowerPrint(val || null)}
                                  onEdit={(key, opt) => handleEditOption('lowerPrint', key, opt)}
                                  onAdd={() => handleOpenAddDialog('lowerPrint', 'Lower Print')}
                                  placeholder="Select Print..."
                                  className="flex-1 min-w-[120px]"
                                  disabled={isLoading}
                                  title="Select print/pattern"
                                />
                            )}
                          </div>
                          
                          {/* Summary of lower body selection */}
                          {selectedLowerGarment && selectedLowerGarment !== 'none' && (
                            <div className="text-xs text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-md">
                              Selected: <span className="text-foreground font-medium">{getLowerBodyButtonLabel()}</span>
                            </div>
                          )}
                          <div className="relative">
                            <textarea
                              value={customLowerPrompt}
                              onChange={(e) => setCustomLowerPrompt(e.target.value)}
                              placeholder="Describe lower body outfit... e.g., 'Flared palazzo pants in matching color, ankle length'"
                              rows={3}
                              disabled={isLoading || selectedLowerGarment === 'none'}
                              className={`w-full px-4 py-3 bg-muted/30 rounded-lg text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${isLowerListening ? 'ring-2 ring-primary' : ''}`}
                            />
                            {isLowerListening && (
                              <span className="absolute right-3 top-3 text-xs text-primary animate-pulse">Listening in {voiceLang.split('-')[0].toUpperCase()}...</span>
                            )}
                          </div>
                          {/* Audio input bar for lower body */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border/50">
                              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Audio</span>
                            </div>
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
                            <Button
                              variant="glass"
                              size="icon"
                              onClick={toggleLowerListening}
                              disabled={isLoading}
                              className={`relative ${isLowerListening ? 'text-primary' : ''}`}
                              title={isLowerListening ? "Stop listening" : "Start voice input"}
                            >
                              {isLowerListening ? (
                                <>
                                  <MicOff className="w-4 h-4" />
                                  <span className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
                                </>
                              ) : (
                                <Mic className="w-4 h-4" />
                              )}
                            </Button>
                            {customLowerPrompt && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCustomLowerPrompt("")}
                                disabled={isLoading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Footwear Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-foreground">👟 Footwear</span>
                              <div className="flex items-center gap-2">
                                {/* Footwear Color Selector */}
                                <div className={`relative h-8 w-full min-w-[120px] max-w-[150px] ${activeDropdown === 'footwear' ? 'z-50' : 'z-10'}`}>
                                  <NavigationMenu className="relative" onValueChange={(value: string) => { setIsDropdownOpen(!!value); setActiveDropdown(!!value ? 'footwear' : null); }}>
                                    <NavigationMenuList>
                                      <NavigationMenuItem>
                                        <NavigationMenuTrigger 
                                          className="bg-muted/50 border border-border/50 hover:bg-muted h-9 px-3 text-xs w-full justify-start"
                                          disabled={isLoading}
                                        >
                                          <span className="flex items-center gap-2 truncate">
                                             <div 
                                                className="w-3.5 h-3.5 rounded-full border border-border shadow-sm flex-shrink-0" 
                                                style={{ backgroundColor: (COLOR_PALETTE[selectedFootwearColor] || customColors[selectedFootwearColor])?.hex || '#9CA3AF' }}
                                             />
                                             <span className="truncate">
                                                 {((COLOR_PALETTE[selectedFootwearColor] || customColors[selectedFootwearColor])?.label || "Any Color").replace(/^[^\w\s]+\s/, '')}
                                             </span>
                                          </span>
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent className="bg-zinc-900 border border-border rounded-lg shadow-xl">
                                          <ul className="grid w-[200px] max-h-[300px] overflow-y-auto gap-1 p-2">
                                            {Object.entries({...COLOR_PALETTE, ...customColors}).map(([key, color]) => (
                                                <li key={key}>
                                                <button
                                                    onClick={() => setSelectedFootwearColor(key)}
                                                    className={`flex items-center gap-3 w-full select-none rounded-md p-2 text-left text-sm ${
                                                    selectedFootwearColor === key
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    <div 
                                                    className="w-4 h-4 rounded-full border border-border shadow-sm" 
                                                    style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span className="truncate">{color.label.replace(/^[^\w\s]+\s/, '')}</span>
                                                </button>
                                                </li>
                                            ))}
                                            <div className="h-px bg-border/50 my-1" />
                                            <li>
                                              <button
                                                onClick={() => handleOpenAddDialog('footwearColor', 'Footwear Color', true)}
                                                className="flex items-center gap-2 w-full select-none rounded-md p-2 text-left text-sm text-primary hover:bg-muted font-medium"
                                              >
                                                <Plus className="w-4 h-4" />
                                                Add Custom Color
                                              </button>
                                            </li>
                                          </ul>
                                        </NavigationMenuContent>
                                      </NavigationMenuItem>
                                    </NavigationMenuList>
                                  </NavigationMenu>
                                </div>
                                {/* Footwear Type Dropdown */}
                                <select
                                  value={selectedFootwear}
                                  onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === 'add_new') {
                                          handleOpenAddDialog('footwear', 'Footwear Type');
                                      } else {
                                          setSelectedFootwear(val);
                                      }
                                  }}
                                  disabled={isLoading}
                                  className="text-xs px-2 py-1 rounded-md bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer"
                                  title="Footwear type"
                                >
                                  {Object.entries({...footwearOptions, ...customFootwear}).map(([key, item]) => (
                                    <option key={key} value={key}>{item.icon} {item.label}</option>
                                  ))}
                                  <option value="add_new" className="font-medium text-primary">+ Add New...</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <textarea
                              value={customFootwearPrompt}
                              onChange={(e) => setCustomFootwearPrompt(e.target.value)}
                              placeholder="Describe footwear... e.g., 'Embroidered golden juttis matching the outfit'"
                              rows={2}
                              disabled={isLoading || selectedFootwear === 'none'}
                              className={`w-full px-4 py-3 bg-muted/30 rounded-lg text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${isFootwearListening ? 'ring-2 ring-primary' : ''}`}
                            />
                            {isFootwearListening && (
                              <span className="absolute right-3 top-3 text-xs text-primary animate-pulse">Listening in {voiceLang.split('-')[0].toUpperCase()}...</span>
                            )}
                          </div>
                          {/* Audio input bar for footwear */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border/50">
                              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Audio</span>
                            </div>
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
                            <Button
                              variant="glass"
                              size="icon"
                              onClick={toggleFootwearListening}
                              disabled={isLoading}
                              className={`relative ${isFootwearListening ? 'text-primary' : ''}`}
                              title={isFootwearListening ? "Stop listening" : "Start voice input"}
                            >
                              {isFootwearListening ? (
                                <>
                                  <MicOff className="w-4 h-4" />
                                  <span className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
                                </>
                              ) : (
                                <Mic className="w-4 h-4" />
                              )}
                            </Button>
                            {customFootwearPrompt && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCustomFootwearPrompt("")}
                                disabled={isLoading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Headwear Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-foreground">👒 Headwear</span>
                              <div className="flex items-center gap-2">
                                {/* Headwear Color Selector */}
                                <div className={`relative h-8 w-full min-w-[120px] max-w-[150px] ${activeDropdown === 'headwear' ? 'z-50' : 'z-10'}`}>
                                  <NavigationMenu className="relative" onValueChange={(value: string) => { setIsDropdownOpen(!!value); setActiveDropdown(!!value ? 'headwear' : null); }}>
                                    <NavigationMenuList>
                                      <NavigationMenuItem>
                                        <NavigationMenuTrigger 
                                          className="bg-muted/50 border border-border/50 hover:bg-muted h-9 px-3 text-xs w-full justify-start"
                                          disabled={isLoading}
                                        >
                                          <span className="flex items-center gap-2 truncate">
                                             <div 
                                                className="w-3.5 h-3.5 rounded-full border border-border shadow-sm flex-shrink-0" 
                                                style={{ backgroundColor: (COLOR_PALETTE[selectedHeadwearColor] || customColors[selectedHeadwearColor])?.hex || '#9CA3AF' }}
                                             />
                                             <span className="truncate">
                                                 {((COLOR_PALETTE[selectedHeadwearColor] || customColors[selectedHeadwearColor])?.label || "Any Color").replace(/^[^\w\s]+\s/, '')}
                                             </span>
                                          </span>
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent className="bg-zinc-900 border border-border rounded-lg shadow-xl">
                                          <ul className="grid w-[200px] max-h-[300px] overflow-y-auto gap-1 p-2">
                                            {Object.entries({...COLOR_PALETTE, ...customColors}).map(([key, color]) => (
                                                <li key={key}>
                                                <button
                                                    onClick={() => setSelectedHeadwearColor(key)}
                                                    className={`flex items-center gap-3 w-full select-none rounded-md p-2 text-left text-sm ${
                                                    selectedHeadwearColor === key
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    <div 
                                                    className="w-4 h-4 rounded-full border border-border shadow-sm" 
                                                    style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span className="truncate">{color.label.replace(/^[^\w\s]+\s/, '')}</span>
                                                </button>
                                                </li>
                                            ))}
                                            <div className="h-px bg-border/50 my-1" />
                                            <li>
                                              <button
                                                onClick={() => handleOpenAddDialog('headwearColor', 'Headwear Color', true)}
                                                className="flex items-center gap-2 w-full select-none rounded-md p-2 text-left text-sm text-primary hover:bg-muted font-medium"
                                              >
                                                <Plus className="w-4 h-4" />
                                                Add Custom Color
                                              </button>
                                            </li>
                                          </ul>
                                        </NavigationMenuContent>
                                      </NavigationMenuItem>
                                    </NavigationMenuList>
                                  </NavigationMenu>
                                </div>
                                {/* Headwear Type Dropdown */}
                                <select
                                  value={selectedHeadwear}
                                  onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === 'add_new') {
                                          handleOpenAddDialog('headwear', 'Headwear Type');
                                      } else {
                                          setSelectedHeadwear(val);
                                      }
                                  }}
                                  disabled={isLoading}
                                  className="text-xs px-2 py-1 rounded-md bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer"
                                  title="Headwear type"
                                >
                                  {Object.entries({...headwearOptions, ...customHeadwear}).map(([key, item]) => (
                                    <option key={key} value={key}>{item.icon} {item.label}</option>
                                  ))}
                                  <option value="add_new" className="font-medium text-primary">+ Add New...</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <textarea
                              value={customHeadwearPrompt}
                              onChange={(e) => setCustomHeadwearPrompt(e.target.value)}
                              placeholder="Describe headwear... e.g., 'Traditional maang tikka with pearl drops'"
                              rows={2}
                              disabled={isLoading}
                              className={`w-full px-4 py-3 bg-muted/30 rounded-lg text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${isHeadwearListening ? 'ring-2 ring-primary' : ''}`}
                            />
                            {isHeadwearListening && (
                              <span className="absolute right-3 top-3 text-xs text-primary animate-pulse">Listening in {voiceLang.split('-')[0].toUpperCase()}...</span>
                            )}
                          </div>
                          {/* Audio input bar for headwear */}
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border/50">
                              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Audio</span>
                            </div>
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
                            <Button
                              variant="glass"
                              size="icon"
                              onClick={toggleHeadwearListening}
                              disabled={isLoading}
                              className={`relative ${isHeadwearListening ? 'text-primary' : ''}`}
                              title={isHeadwearListening ? "Stop listening" : "Start voice input"}
                            >
                              {isHeadwearListening ? (
                                <>
                                  <MicOff className="w-4 h-4" />
                                  <span className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
                                </>
                              ) : (
                                <Mic className="w-4 h-4" />
                              )}
                            </Button>
                            {customHeadwearPrompt && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCustomHeadwearPrompt("")}
                                disabled={isLoading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Generate Button */}
                        <div className="flex flex-col gap-2 pt-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Describe your upper and lower body outfit details
                            </p>
                            <span className="text-xs text-muted-foreground">
                              Est. cost: <span className="font-medium text-foreground">~₹{pricingEstimate.costINR}</span>
                              <span className="text-[10px] ml-1">({pricingEstimate.tokens} tokens)</span>
                            </span>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={handleGenerate}
                              disabled={!canGenerateCustom || isLoading}
                              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                                canGenerateCustom && !isLoading
                                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105'
                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                              }`}
                            >
                              {isLoading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                />
                              ) : (
                                <>✨ Generate</>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Prompt Preview */}
                        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                          <span className="text-xs font-medium text-muted-foreground">📝 Final Prompt Preview</span>
                          <p className="text-xs text-foreground/80 leading-relaxed break-words mt-1">
                            {computeEnhancedPrompt()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Full Outfit Mode - Regular PromptInput */
                  <PromptInput
                    value={prompt}
                    onChange={(val) => {
                      setPrompt(val);
                      // Reset custom prompt when user types new input
                      setCustomEnhancedPrompt(null);
                    }}
                    onSubmit={handleGenerate}
                    isLoading={isLoading}
                    detectedLanguage={detectedLanguage}
                  />
                )}
                
                {/* Advanced Options */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <motion.span
                        animate={{ rotate: showAdvanced ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▼
                      </motion.span>
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>
                    
                    {/* View Input Combination Button */}
                    <button
                      onClick={() => setShowInputCombination(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50 transition-all duration-200"
                    >
                      📋 View Input Combination
                    </button>
                  </div>
                  
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-xl bg-card border border-border/50 space-y-4"
                    >
                      {/* Prompt being sent to backend */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-foreground">
                            📝 Your Prompt (frontend preview)
                          </label>
                          {customEnhancedPrompt && (
                            <button
                              onClick={() => setCustomEnhancedPrompt(null)}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <textarea
                          value={customEnhancedPrompt || enhancedPromptPreview}
                          onChange={(e) => setCustomEnhancedPrompt(e.target.value)}
                          rows={4}
                          disabled={isLoading || (outfitMode === 'full' ? !prompt.trim() : !canGenerateCustom)}
                          className="w-full px-4 py-3 bg-muted/30 rounded-lg text-foreground text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                          placeholder={outfitMode === 'full' ? "Enter your prompt above to see the enhanced version..." : "Configure your custom outfit options above to see the enhanced prompt..."}
                        />
                      </div>
                      
                      {/* Backend-enhanced prompt (shown after generation) */}
                      {backendEnhancedPrompt && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <label className="text-sm font-medium text-primary mb-2 block">
                            ✨ AI-Enhanced Prompt (from backend)
                          </label>
                          <p className="text-sm text-foreground font-mono whitespace-pre-wrap">
                            {backendEnhancedPrompt}
                          </p>
                        </div>
                      )}
                      
                      {/* Dual pricing estimate */}
                      {prompt.trim() && (
                        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">💰 Estimated Costs</span>
                            <span className="text-sm font-semibold text-primary">
                              Total: ~₹{(parseFloat(pricingEstimate.costINR) + 0.21).toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>1. Prompt Enhancement (text gen):</span>
                              <span>~₹0.21 (~100 tokens in/out)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>2. Image Generation:</span>
                              <span>~₹{pricingEstimate.costINR} ({pricingEstimate.tokens} tokens + image)</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                            Text: $2.50/1M output tokens • Image: $0.039/image
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        💡 The backend AI further enhances your prompt for better results. The final enhanced version will appear after generation.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </>
            ) : (
              <ImageToImageInput
                onSubmit={handleImageToImage}
                isLoading={isLoading}
              />
            )}

            {/* Style suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              {/* <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                Quick suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Bridal Lehenga",
                  "Designer Saree",
                  "Indo-Western",
                  "Party Wear",
                  "Traditional Kurta",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion + " ")}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/50 transition-all duration-200 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div> */}
            </motion.div>
          </div>

          {/* Preview side */}
          <div>
            <ImagePreview
              imageUrl={generatedImage}
              isLoading={isLoading}
              prompt={lastPrompt}
              onRegenerate={handleRegenerate}
              onGenerateBack={handleGenerateBack}
            />
            
            {/* Generation History - only for text-to-image mode */}
            {generationMode === 'text' && generationHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                  Recent Generations ({generationHistory.length}/5)
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {generationHistory.map((item) => (
                    <div
                      key={item.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-200"
                      onClick={() => {
                        setGeneratedImage(item.imageUrl);
                        setLastPrompt(item.prompt);
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.prompt}
                        className="w-full aspect-square object-cover"
                      />
                      {/* Hover overlay with prompt */}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                        <p className="text-xs text-foreground text-center line-clamp-3">
                          {item.prompt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* View Input Combination Modal */}
      {showInputCombination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* ... existing modal code ... */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowInputCombination(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-2xl max-h-[80vh] bg-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="font-semibold text-foreground">Input Combination</h3>
                  <p className="text-xs text-muted-foreground">Current selections as JSON</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyInputCombination}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    copiedJSON
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
                  }`}
                >
                  {copiedJSON ? '✓ Copied!' : '📋 Copy JSON'}
                </button>
                <button
                  onClick={() => setShowInputCombination(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-auto max-h-[60vh]">
              <pre className="p-4 rounded-xl bg-muted/50 border border-border/50 overflow-x-auto text-sm">
                <code className="text-foreground font-mono whitespace-pre">
                  {JSON.stringify(getInputCombinationJSON(), null, 2)}
                </code>
              </pre>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                💡 Use this JSON to document your input combinations for demos
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Custom Option Dialog */}
      <AddOptionDialog
        open={addDialogState.isOpen}
        onOpenChange={(open) => setAddDialogState(prev => ({ ...prev, isOpen: open }))}
        categoryName={addDialogState.label}
        withColor={addDialogState.withColor}
        onSave={handleSaveCustomOption}
      />

      {/* Edit Option Dialog */}
      <EditOptionDialog
        isOpen={editDialog.isOpen}
        onClose={() => setEditDialog(prev => ({ ...prev, isOpen: false }))}
        title={editDialog.label}
        defaultValue={editDialog.defaultPrompt}
        currentValue={editDialog.currentPrompt}
        onSave={handleSaveEditedPrompt}
        onReset={handleResetEditedPrompt}
      />
    </section>
  );
};

export default CreateSection;