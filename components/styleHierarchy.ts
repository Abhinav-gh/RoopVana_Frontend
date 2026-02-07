// Style Hierarchy Data Structure
// 3-Level Nested: Category -> Garment -> Fabric -> Print

export interface PrintType {
  label: string;
  icon: string;
  prompt: string;
}

export interface Fabric {
  label: string;
  icon: string;
  prompt: string;
  prints: { [key: string]: PrintType };
}

export interface Garment {
  label: string;
  icon: string;
  prompt: string;
  fabrics: { [key: string]: Fabric };
}

export interface StyleCategory {
  label: string;
  icon: string;
  garments: { [key: string]: Garment };
}

export type StyleHierarchy = { [category: string]: StyleCategory };

// ============ COMMON PRINTS (shared across fabrics) ============
export const COMMON_PRINTS: { [key: string]: PrintType } = {
  any: { label: "Any", icon: "✨", prompt: "" },
  floral: { label: "Floral", icon: "🌸", prompt: "floral motifs, flower patterns, botanical designs" },
  geometric: { label: "Geometric", icon: "🔷", prompt: "geometric patterns, abstract shapes, angular designs" },
  paisley: { label: "Paisley", icon: "🪶", prompt: "paisley motifs, mango patterns, traditional buta" },
  abstract: { label: "Abstract", icon: "🎨", prompt: "abstract contemporary patterns, artistic designs" },
  solid: { label: "Solid/Plain", icon: "⬜", prompt: "solid color, plain fabric, no print" },
  stripes: { label: "Stripes", icon: "📊", prompt: "striped pattern, linear design" },
  checks: { label: "Checks", icon: "🏁", prompt: "checkered pattern, plaid design" },
  polka: { label: "Polka Dots", icon: "⚪", prompt: "polka dot pattern, dotted design" },
};

// ============ DEFAULT FABRICS (for custom garments) ============
export const DEFAULT_FABRICS: { [key: string]: Fabric } = {
  any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
  cotton: { label: "Cotton", icon: "☁️", prompt: "comfortable cotton fabric", prints: { ...COMMON_PRINTS } },
  silk: { label: "Silk", icon: "✨", prompt: "luxurious silk fabric", prints: { ...COMMON_PRINTS } },
  linen: { label: "Linen", icon: "🌾", prompt: "breathable linen fabric", prints: { ...COMMON_PRINTS } },
  georgette: { label: "Georgette", icon: "💨", prompt: "lightweight georgette, flowing drape", prints: { ...COMMON_PRINTS } },
  chiffon: { label: "Chiffon", icon: "🌬️", prompt: "lightweight chiffon, ethereal", prints: { ...COMMON_PRINTS } },
  velvet: { label: "Velvet", icon: "🎀", prompt: "plush velvet fabric, rich texture", prints: { ...COMMON_PRINTS } },
  satin: { label: "Satin", icon: "💎", prompt: "smooth satin, lustrous finish", prints: { ...COMMON_PRINTS } },
};

// ============ FEMALE STYLE HIERARCHY ============
export const FEMALE_STYLE_HIERARCHY: StyleHierarchy = {
  indian: {
    label: "Indian",
    icon: "🇮🇳",
    garments: {
      saree: {
        label: "Saree",
        icon: "🥻",
        prompt: "traditional saree with elegant draping, pallu, feminine silhouette",
        fabrics: {
          any: {
            label: "Any Fabric",
            icon: "✨",
            prompt: "",
            prints: { ...COMMON_PRINTS }
          },
          silk: {
            label: "Silk",
            icon: "✨",
            prompt: "luxurious silk fabric, lustrous sheen, elegant drape",
            prints: {
              ...COMMON_PRINTS,
              zari: { label: "Zari Work", icon: "⭐", prompt: "gold/silver zari work, metallic threadwork" },
              temple: { label: "Temple Border", icon: "🛕", prompt: "temple border design, traditional temple motifs" },
            }
          },
          chikankari: {
            label: "Chikankari",
            icon: "🪡",
            prompt: "Lucknowi chikankari embroidery, delicate white threadwork, Mughal elegance",
            prints: {
              any: { label: "Any", icon: "✨", prompt: "" },
              jali: { label: "Jali Work", icon: "🔳", prompt: "intricate jali openwork pattern, net-like design" },
              shadow: { label: "Shadow Work", icon: "🌑", prompt: "shadow work embroidery, tepchi stitch" },
              murri: { label: "Murri", icon: "⚪", prompt: "murri grain pattern, raised stitches" },
              phanda: { label: "Phanda", icon: "🔘", prompt: "phanda knot work, small round motifs" },
            }
          },
          banarasi: {
            label: "Banarasi",
            icon: "👑",
            prompt: "Varanasi Banarasi brocade, intricate gold and silver zari, Mughal-inspired",
            prints: {
              any: { label: "Any", icon: "✨", prompt: "" },
              buti: { label: "Buti/Booti", icon: "🌿", prompt: "small buti motifs scattered across fabric" },
              jangla: { label: "Jangla", icon: "🌳", prompt: "jangla design, dense floral jungle pattern" },
              tanchoi: { label: "Tanchoi", icon: "🎭", prompt: "tanchoi weave, multi-colored weft pattern" },
              cutwork: { label: "Cutwork", icon: "✂️", prompt: "cutwork design, intricate cut patterns" },
            }
          },
          kanjivaram: {
            label: "Kanjivaram",
            icon: "🎀",
            prompt: "South Indian Kanjivaram silk, rich gold zari, temple borders, mulberry silk",
            prints: {
              any: { label: "Any", icon: "✨", prompt: "" },
              temple: { label: "Temple Border", icon: "🛕", prompt: "temple border, traditional gopuram motifs" },
              peacock: { label: "Peacock", icon: "🦚", prompt: "peacock motifs, mayil design" },
              mango: { label: "Mango", icon: "🥭", prompt: "mango/paisley motifs, traditional maanga" },
              checks: { label: "Checks", icon: "🏁", prompt: "kattam checks, square patterns" },
            }
          },
          georgette: {
            label: "Georgette",
            icon: "💨",
            prompt: "lightweight georgette fabric, flowing drape, graceful movement",
            prints: { ...COMMON_PRINTS }
          },
          organza: {
            label: "Organza",
            icon: "🌬️",
            prompt: "sheer organza fabric, crisp texture, elegant translucence",
            prints: { ...COMMON_PRINTS }
          },
          chanderi: {
            label: "Chanderi",
            icon: "🌙",
            prompt: "Chanderi fabric, lightweight sheer texture, subtle gold zari",
            prints: {
              ...COMMON_PRINTS,
              coin: { label: "Coin Motifs", icon: "🪙", prompt: "traditional coin motifs, asharfi buti" },
            }
          },
          cotton: {
            label: "Cotton",
            icon: "☁️",
            prompt: "comfortable cotton fabric, breathable, everyday wear",
            prints: {
              ...COMMON_PRINTS,
              block: { label: "Block Print", icon: "🎨", prompt: "hand block printed, traditional printing technique" },
              kalamkari: { label: "Kalamkari", icon: "🖌️", prompt: "Kalamkari art, pen-drawn mythological motifs" },
            }
          },
        }
      },
      lehenga: {
        label: "Lehenga",
        icon: "💃",
        prompt: "bridal lehenga choli, flared skirt, matching dupatta, wedding grandeur",
        fabrics: {
          any: {
            label: "Any Fabric",
            icon: "✨",
            prompt: "",
            prints: { ...COMMON_PRINTS }
          },
          silk: {
            label: "Silk",
            icon: "✨",
            prompt: "luxurious silk fabric, rich sheen",
            prints: {
              ...COMMON_PRINTS,
              zari: { label: "Zari Work", icon: "⭐", prompt: "gold/silver zari embroidery" },
              gota: { label: "Gota Patti", icon: "🎗️", prompt: "gota patti work, golden ribbon applique" },
            }
          },
          velvet: {
            label: "Velvet",
            icon: "🎀",
            prompt: "plush velvet fabric, rich texture, royal feel",
            prints: {
              ...COMMON_PRINTS,
              embroidered: { label: "Embroidered", icon: "🧵", prompt: "heavy embroidery, threadwork" },
              zardozi: { label: "Zardozi", icon: "👑", prompt: "zardozi metallic embroidery, royal grandeur" },
            }
          },
          georgette: {
            label: "Georgette",
            icon: "💨",
            prompt: "lightweight georgette, flowing drape",
            prints: {
              ...COMMON_PRINTS,
              sequin: { label: "Sequin", icon: "✨", prompt: "sequin work, shimmering embellishments" },
            }
          },
          net: {
            label: "Net",
            icon: "🕸️",
            prompt: "delicate net fabric, sheer overlay, layered look",
            prints: {
              any: { label: "Any", icon: "✨", prompt: "" },
              embroidered: { label: "Embroidered", icon: "🧵", prompt: "embroidered net, threadwork overlay" },
              sequin: { label: "Sequin", icon: "✨", prompt: "sequin embellished net" },
              pearl: { label: "Pearl Work", icon: "🔘", prompt: "pearl embellishments, moti work" },
            }
          },
          brocade: {
            label: "Brocade",
            icon: "🏆",
            prompt: "rich brocade fabric, woven patterns, royal elegance",
            prints: {
              ...COMMON_PRINTS,
              jacquard: { label: "Jacquard", icon: "🎭", prompt: "jacquard woven pattern" },
            }
          },
        }
      },
      anarkali: {
        label: "Anarkali",
        icon: "🌺",
        prompt: "Anarkali suit, floor-length flared kurta, fitted bodice, flowing silhouette",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "luxurious silk Anarkali", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "flowing georgette Anarkali", prints: { ...COMMON_PRINTS } },
          chiffon: { label: "Chiffon", icon: "🌬️", prompt: "lightweight chiffon, ethereal drape", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "comfortable cotton Anarkali", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "rich velvet Anarkali", prints: { ...COMMON_PRINTS } },
        }
      },
      sharara: {
        label: "Sharara",
        icon: "👘",
        prompt: "Sharara suit, wide-leg flared pants, short kurta, festive elegance",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "flowing georgette sharara", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "luxurious silk sharara", prints: { ...COMMON_PRINTS } },
          net: { label: "Net", icon: "🕸️", prompt: "delicate net overlay sharara", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "rich velvet sharara", prints: { ...COMMON_PRINTS } },
        }
      },
      salwar_kameez: {
        label: "Salwar Kameez",
        icon: "👚",
        prompt: "classic salwar kameez, comfortable traditional wear, elegant kurta with matching bottoms",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: {
            label: "Cotton",
            icon: "☁️",
            prompt: "comfortable cotton salwar kameez, everyday wear",
            prints: {
              ...COMMON_PRINTS,
              block: { label: "Block Print", icon: "🎨", prompt: "hand block printed cotton" },
            }
          },
          silk: { label: "Silk", icon: "✨", prompt: "elegant silk salwar kameez", prints: { ...COMMON_PRINTS } },
          chiffon: { label: "Chiffon", icon: "🌬️", prompt: "lightweight chiffon suit", prints: { ...COMMON_PRINTS } },
          lawn: { label: "Lawn", icon: "🌿", prompt: "Pakistani lawn fabric, premium cotton", prints: { ...COMMON_PRINTS } },
        }
      },
      palazzo_suit: {
        label: "Palazzo Suit",
        icon: "🌷",
        prompt: "palazzo suit, wide-leg palazzo pants, short kurta, modern traditional fusion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "comfortable cotton palazzo", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "elegant silk palazzo set", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "flowing georgette palazzo", prints: { ...COMMON_PRINTS } },
        }
      },
      kurti: {
        label: "Kurti",
        icon: "👕",
        prompt: "stylish kurti, versatile Indian top, contemporary ethnic wear",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton kurti, comfortable everyday wear", prints: { ...COMMON_PRINTS } },
          rayon: { label: "Rayon", icon: "🌊", prompt: "soft rayon kurti, flowy fabric", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk kurti, elegant finish", prints: { ...COMMON_PRINTS } },
        }
      },
    }
  },
  western: {
    label: "Western",
    icon: "🌍",
    garments: {
      dress: {
        label: "Dress",
        icon: "👗",
        prompt: "contemporary dress design, clean lines, elegant silhouette",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "comfortable cotton dress", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "luxurious silk dress", prints: { ...COMMON_PRINTS } },
          satin: { label: "Satin", icon: "💎", prompt: "smooth satin dress, lustrous finish", prints: { ...COMMON_PRINTS } },
          chiffon: { label: "Chiffon", icon: "🌬️", prompt: "lightweight chiffon dress, ethereal", prints: { ...COMMON_PRINTS } },
          lace: { label: "Lace", icon: "🕸️", prompt: "delicate lace dress, romantic detailing", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "plush velvet dress, rich texture", prints: { ...COMMON_PRINTS } },
        }
      },
      gown: {
        label: "Gown",
        icon: "🎭",
        prompt: "elegant evening gown, floor-length, formal occasion, sophisticated design",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "luxurious silk gown", prints: { ...COMMON_PRINTS } },
          satin: { label: "Satin", icon: "💎", prompt: "smooth satin gown, elegant drape", prints: { ...COMMON_PRINTS } },
          tulle: { label: "Tulle", icon: "🌬️", prompt: "layered tulle gown, princess silhouette", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "rich velvet gown, dramatic elegance", prints: { ...COMMON_PRINTS } },
          chiffon: { label: "Chiffon", icon: "💨", prompt: "flowing chiffon gown", prints: { ...COMMON_PRINTS } },
        }
      },
      jumpsuit: {
        label: "Jumpsuit",
        icon: "🦸‍♀️",
        prompt: "stylish jumpsuit, one-piece outfit, modern chic",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "comfortable cotton jumpsuit", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "elegant silk jumpsuit", prints: { ...COMMON_PRINTS } },
          denim: { label: "Denim", icon: "👖", prompt: "denim jumpsuit, casual cool", prints: { ...COMMON_PRINTS } },
          crepe: { label: "Crepe", icon: "🌊", prompt: "crepe fabric jumpsuit, professional look", prints: { ...COMMON_PRINTS } },
        }
      },
      blazer_set: {
        label: "Blazer Set",
        icon: "💼",
        prompt: "power blazer set, tailored fit, professional elegance",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          wool: { label: "Wool Blend", icon: "🐑", prompt: "wool blend blazer, structured fit", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton blazer set, comfortable elegance", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen blazer set, relaxed luxury", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet blazer, evening sophistication", prints: { ...COMMON_PRINTS } },
        }
      },
      maxi_dress: {
        label: "Maxi Dress",
        icon: "👒",
        prompt: "flowing maxi dress, floor-length, summer style, vacation wear",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "breathable cotton maxi", prints: { ...COMMON_PRINTS } },
          chiffon: { label: "Chiffon", icon: "🌬️", prompt: "flowing chiffon maxi", prints: { ...COMMON_PRINTS } },
          jersey: { label: "Jersey", icon: "🌊", prompt: "soft jersey maxi, comfortable stretch", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "breathable linen maxi", prints: { ...COMMON_PRINTS } },
        }
      },
      cocktail_dress: {
        label: "Cocktail Dress",
        icon: "🍸",
        prompt: "stylish cocktail dress, knee-length, party-ready, evening wear",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk cocktail dress", prints: { ...COMMON_PRINTS } },
          satin: { label: "Satin", icon: "💎", prompt: "satin cocktail dress, glamorous", prints: { ...COMMON_PRINTS } },
          lace: { label: "Lace", icon: "🕸️", prompt: "lace cocktail dress, romantic", prints: { ...COMMON_PRINTS } },
          sequin: { label: "Sequin", icon: "✨", prompt: "sequin cocktail dress, sparkly", prints: { ...COMMON_PRINTS } },
        }
      },
      skirt_top: {
        label: "Skirt & Top",
        icon: "👚",
        prompt: "coordinated skirt and top set, versatile separates",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton skirt top set", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk skirt top set", prints: { ...COMMON_PRINTS } },
          satin: { label: "Satin", icon: "💎", prompt: "satin skirt top set", prints: { ...COMMON_PRINTS } },
        }
      },
    }
  },
  indo_western: {
    label: "Indo-Western",
    icon: "🔀",
    garments: {
      fusion_saree: {
        label: "Fusion Saree",
        icon: "🥻",
        prompt: "contemporary fusion saree, modern draping, pre-stitched style",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "flowing georgette fusion saree", prints: { ...COMMON_PRINTS } },
          lycra: { label: "Lycra", icon: "🔄", prompt: "stretch lycra pre-stitched saree", prints: { ...COMMON_PRINTS } },
          crepe: { label: "Crepe", icon: "🌊", prompt: "crepe fusion saree, modern drape", prints: { ...COMMON_PRINTS } },
          satin: { label: "Satin", icon: "💎", prompt: "satin fusion saree, glossy finish", prints: { ...COMMON_PRINTS } },
        }
      },
      crop_top_lehenga: {
        label: "Crop Top Lehenga",
        icon: "✂️",
        prompt: "modern crop top with lehenga skirt, contemporary ethnic wear, trendy fusion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk crop top lehenga", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "georgette crop top lehenga", prints: { ...COMMON_PRINTS } },
          net: { label: "Net", icon: "🕸️", prompt: "net overlay crop top lehenga", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet crop top lehenga, rich texture", prints: { ...COMMON_PRINTS } },
        }
      },
      indo_gown: {
        label: "Indo Gown",
        icon: "🎭",
        prompt: "Indo-Western gown, fusion of Indian embroidery with Western silhouette",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk Indo gown", prints: { ...COMMON_PRINTS } },
          net: { label: "Net", icon: "🕸️", prompt: "net Indo gown with embroidery", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet Indo gown, royal fusion", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "flowing georgette Indo gown", prints: { ...COMMON_PRINTS } },
        }
      },
      dhoti_pants_set: {
        label: "Dhoti Pants Set",
        icon: "🩲",
        prompt: "dhoti pants with modern top, fusion ethnic style",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk dhoti pants set", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton dhoti pants, comfortable fusion", prints: { ...COMMON_PRINTS } },
          crepe: { label: "Crepe", icon: "🌊", prompt: "crepe dhoti pants set", prints: { ...COMMON_PRINTS } },
        }
      },
      cape_dress: {
        label: "Cape Dress",
        icon: "🦸‍♀️",
        prompt: "dress with cape overlay, dramatic Indo-Western fusion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "flowing georgette cape dress", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk cape dress, elegant drape", prints: { ...COMMON_PRINTS } },
          chiffon: { label: "Chiffon", icon: "🌬️", prompt: "chiffon cape dress, ethereal", prints: { ...COMMON_PRINTS } },
        }
      },
      jacket_lehenga: {
        label: "Jacket Lehenga",
        icon: "🧥",
        prompt: "lehenga with jacket instead of dupatta, modern twist",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk jacket lehenga", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet jacket lehenga, royal", prints: { ...COMMON_PRINTS } },
          brocade: { label: "Brocade", icon: "🏆", prompt: "brocade jacket lehenga", prints: { ...COMMON_PRINTS } },
        }
      },
      peplum_set: {
        label: "Peplum Set",
        icon: "💫",
        prompt: "peplum top with ethnic skirt or pants, fusion formal wear",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk peplum set", prints: { ...COMMON_PRINTS } },
          crepe: { label: "Crepe", icon: "🌊", prompt: "crepe peplum set", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "georgette peplum set", prints: { ...COMMON_PRINTS } },
        }
      },
    }
  }
};

// ============ MALE STYLE HIERARCHY ============
export const MALE_STYLE_HIERARCHY: StyleHierarchy = {
  indian: {
    label: "Indian",
    icon: "🇮🇳",
    garments: {
      sherwani: {
        label: "Sherwani",
        icon: "🤵",
        prompt: "traditional sherwani, rich embroidery, regal wedding wear, Mughal elegance",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: {
            label: "Silk",
            icon: "✨",
            prompt: "luxurious silk sherwani",
            prints: {
              ...COMMON_PRINTS,
              zardozi: { label: "Zardozi", icon: "👑", prompt: "zardozi metallic embroidery, royal grandeur" },
              thread: { label: "Thread Work", icon: "🧵", prompt: "intricate thread embroidery" },
            }
          },
          brocade: {
            label: "Brocade",
            icon: "🏆",
            prompt: "rich brocade sherwani, woven patterns",
            prints: { ...COMMON_PRINTS }
          },
          velvet: {
            label: "Velvet",
            icon: "🎀",
            prompt: "plush velvet sherwani, royal texture",
            prints: { ...COMMON_PRINTS }
          },
          jacquard: {
            label: "Jacquard",
            icon: "🎭",
            prompt: "jacquard woven sherwani, intricate patterns",
            prints: { ...COMMON_PRINTS }
          },
        }
      },
      kurta_pajama: {
        label: "Kurta Pajama",
        icon: "👕",
        prompt: "classic kurta pajama set, comfortable traditional menswear",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: {
            label: "Cotton",
            icon: "☁️",
            prompt: "comfortable cotton kurta pajama",
            prints: {
              ...COMMON_PRINTS,
              chikankari: { label: "Chikankari", icon: "🪡", prompt: "Lucknowi chikankari embroidery" },
              block: { label: "Block Print", icon: "🎨", prompt: "hand block printed" },
            }
          },
          silk: { label: "Silk", icon: "✨", prompt: "festive silk kurta pajama", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "breathable linen kurta", prints: { ...COMMON_PRINTS } },
          khadi: { label: "Khadi", icon: "🧶", prompt: "handspun khadi kurta, rustic elegance", prints: { ...COMMON_PRINTS } },
        }
      },
      bandhgala: {
        label: "Bandhgala",
        icon: "🎖️",
        prompt: "Nehru jacket bandhgala suit, mandarin collar, structured fit, royal aesthetic",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk bandhgala jacket", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen bandhgala, summer formal", prints: { ...COMMON_PRINTS } },
          wool: { label: "Wool Blend", icon: "🐑", prompt: "wool blend bandhgala, structured", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet bandhgala, evening elegance", prints: { ...COMMON_PRINTS } },
        }
      },
      dhoti_kurta: {
        label: "Dhoti Kurta",
        icon: "🙏",
        prompt: "traditional dhoti with kurta, draped lower garment, ceremonial menswear",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton dhoti kurta", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk dhoti kurta, festive", prints: { ...COMMON_PRINTS } },
        }
      },
      pathani: {
        label: "Pathani Suit",
        icon: "🧥",
        prompt: "Pathani suit, loose-fitting kurta with salwar, Afghan-inspired",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton Pathani suit", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen Pathani suit", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk Pathani suit", prints: { ...COMMON_PRINTS } },
        }
      },
      jodhpuri: {
        label: "Jodhpuri Suit",
        icon: "👑",
        prompt: "Jodhpuri suit, structured jacket, slim trousers, royal Rajasthani elegance",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          wool: { label: "Wool Blend", icon: "🐑", prompt: "wool blend Jodhpuri", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk Jodhpuri suit", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet Jodhpuri, royal", prints: { ...COMMON_PRINTS } },
        }
      },
      achkan: {
        label: "Achkan",
        icon: "🎩",
        prompt: "Achkan coat, knee-length jacket, fitted silhouette, royal Indian menswear",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk Achkan", prints: { ...COMMON_PRINTS } },
          brocade: { label: "Brocade", icon: "🏆", prompt: "brocade Achkan, woven patterns", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet Achkan", prints: { ...COMMON_PRINTS } },
        }
      },
      angrakha: {
        label: "Angrakha",
        icon: "📿",
        prompt: "Angrakha style kurta, overlapping front panels, tie fastenings, Mughal design",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk Angrakha", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton Angrakha", prints: { ...COMMON_PRINTS } },
        }
      },
    }
  },
  western: {
    label: "Western",
    icon: "🌍",
    garments: {
      formal_suit: {
        label: "Formal Suit",
        icon: "👔",
        prompt: "classic formal suit, tailored fit, professional menswear, sophisticated",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          wool: {
            label: "Wool",
            icon: "🐑",
            prompt: "fine wool suit, structured fit",
            prints: {
              ...COMMON_PRINTS,
              pinstripe: { label: "Pinstripe", icon: "📊", prompt: "pinstripe pattern, classic formal" },
              herringbone: { label: "Herringbone", icon: "🔀", prompt: "herringbone weave pattern" },
              windowpane: { label: "Windowpane", icon: "🪟", prompt: "windowpane check pattern" },
            }
          },
          linen: { label: "Linen", icon: "🌾", prompt: "linen suit, summer formal", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton Blend", icon: "☁️", prompt: "cotton blend suit", prints: { ...COMMON_PRINTS } },
          tweed: { label: "Tweed", icon: "🧶", prompt: "tweed suit, textured classic", prints: { ...COMMON_PRINTS } },
        }
      },
      tuxedo: {
        label: "Tuxedo",
        icon: "🎀",
        prompt: "classic tuxedo, black tie formal, satin lapels, gala ready",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          wool: { label: "Wool", icon: "🐑", prompt: "fine wool tuxedo", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet tuxedo jacket, statement piece", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk Blend", icon: "✨", prompt: "silk blend tuxedo, luxurious sheen", prints: { ...COMMON_PRINTS } },
        }
      },
      blazer: {
        label: "Blazer & Pants",
        icon: "🧥",
        prompt: "smart blazer with trousers, semi-formal look",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          wool: { label: "Wool Blend", icon: "🐑", prompt: "wool blend blazer", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton blazer, casual elegance", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen blazer, relaxed luxury", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet blazer, evening style", prints: { ...COMMON_PRINTS } },
          tweed: { label: "Tweed", icon: "🧶", prompt: "tweed blazer, classic British", prints: { ...COMMON_PRINTS } },
        }
      },
      casual_shirt: {
        label: "Casual Shirt & Pants",
        icon: "👕",
        prompt: "casual shirt outfit, relaxed menswear, everyday style",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton casual shirt", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen shirt, breathable", prints: { ...COMMON_PRINTS } },
          chambray: { label: "Chambray", icon: "🌊", prompt: "chambray shirt, denim-like", prints: { ...COMMON_PRINTS } },
          flannel: { label: "Flannel", icon: "🧶", prompt: "flannel shirt, cozy", prints: { ...COMMON_PRINTS, plaid: { label: "Plaid", icon: "🏁", prompt: "classic plaid pattern" } } },
          oxford: { label: "Oxford", icon: "📚", prompt: "oxford cloth shirt, preppy", prints: { ...COMMON_PRINTS } },
        }
      },
      polo_outfit: {
        label: "Polo Outfit",
        icon: "🏇",
        prompt: "polo shirt with chinos, smart casual, preppy style",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton Pique", icon: "☁️", prompt: "cotton pique polo", prints: { ...COMMON_PRINTS } },
          performance: { label: "Performance", icon: "🏃", prompt: "moisture-wicking performance polo", prints: { ...COMMON_PRINTS } },
        }
      },
      denim_outfit: {
        label: "Denim Outfit",
        icon: "👖",
        prompt: "denim-based outfit, rugged casual style",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          raw_denim: { label: "Raw Denim", icon: "👖", prompt: "raw denim, unwashed indigo", prints: { ...COMMON_PRINTS } },
          washed: { label: "Washed Denim", icon: "🧺", prompt: "washed denim, soft texture", prints: { ...COMMON_PRINTS } },
          black: { label: "Black Denim", icon: "⬛", prompt: "black denim, edgy style", prints: { ...COMMON_PRINTS } },
          distressed: { label: "Distressed", icon: "🔧", prompt: "distressed denim, worn look", prints: { ...COMMON_PRINTS } },
        }
      },
      streetwear: {
        label: "Streetwear",
        icon: "🛹",
        prompt: "urban streetwear, oversized fits, contemporary youth fashion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton Heavy", icon: "☁️", prompt: "heavyweight cotton, structured", prints: { ...COMMON_PRINTS } },
          french_terry: { label: "French Terry", icon: "🧣", prompt: "french terry fabric, comfortable", prints: { ...COMMON_PRINTS } },
          nylon: { label: "Tech Nylon", icon: "🔧", prompt: "technical nylon, futuristic", prints: { ...COMMON_PRINTS } },
        }
      },
      athleisure: {
        label: "Athleisure",
        icon: "🏃",
        prompt: "athleisure wear, sporty casual, comfortable yet stylish",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          performance: { label: "Performance", icon: "💨", prompt: "moisture-wicking performance fabric", prints: { ...COMMON_PRINTS } },
          cotton_blend: { label: "Cotton Blend", icon: "☁️", prompt: "soft cotton blend, comfortable", prints: { ...COMMON_PRINTS } },
          tech: { label: "Tech Fabric", icon: "🔧", prompt: "technical athletic fabric", prints: { ...COMMON_PRINTS } },
        }
      },
      bomber_jacket: {
        label: "Bomber Jacket Look",
        icon: "🧥",
        prompt: "bomber jacket outfit, casual cool, urban fashion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          nylon: { label: "Nylon", icon: "✈️", prompt: "classic nylon bomber", prints: { ...COMMON_PRINTS } },
          leather: { label: "Leather", icon: "🧳", prompt: "leather bomber jacket, premium", prints: { ...COMMON_PRINTS } },
          suede: { label: "Suede", icon: "🤎", prompt: "suede bomber, luxe texture", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton bomber, lightweight", prints: { ...COMMON_PRINTS } },
        }
      },
      overcoat_look: {
        label: "Overcoat Look",
        icon: "🧥",
        prompt: "sophisticated overcoat outfit, winter formal style",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          wool: { label: "Wool", icon: "🐑", prompt: "wool overcoat, warm elegance", prints: { ...COMMON_PRINTS } },
          cashmere: { label: "Cashmere", icon: "✨", prompt: "cashmere overcoat, luxury", prints: { ...COMMON_PRINTS } },
          camel: { label: "Camel Hair", icon: "🐪", prompt: "camel hair coat, classic", prints: { ...COMMON_PRINTS } },
        }
      },
    }
  },
  indo_western: {
    label: "Indo-Western",
    icon: "🔀",
    garments: {
      nehru_jacket_set: {
        label: "Nehru Jacket Set",
        icon: "🧥",
        prompt: "Nehru jacket with Western pants or jeans, modern Indian fusion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk Nehru jacket", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen Nehru jacket, summer fusion", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet Nehru jacket, festive", prints: { ...COMMON_PRINTS } },
          brocade: { label: "Brocade", icon: "🏆", prompt: "brocade Nehru jacket, traditional weave", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton Nehru jacket, casual fusion", prints: { ...COMMON_PRINTS } },
        }
      },
      kurta_blazer: {
        label: "Kurta with Blazer",
        icon: "🧥",
        prompt: "traditional kurta layered with Western blazer, boardroom fusion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton_silk: { label: "Cotton Silk", icon: "✨", prompt: "cotton silk kurta with wool blazer", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen kurta with cotton blazer", prints: { ...COMMON_PRINTS } },
        }
      },
      asymmetric_kurta: {
        label: "Asymmetric Kurta",
        icon: "📐",
        prompt: "asymmetric cut kurta, contemporary design, modern Indian",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton asymmetric kurta", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk asymmetric kurta", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen asymmetric kurta", prints: { ...COMMON_PRINTS } },
        }
      },
      draped_sherwani: {
        label: "Draped Sherwani",
        icon: "🎭",
        prompt: "modern draped sherwani, contemporary silhouette, fusion formal",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk draped sherwani", prints: { ...COMMON_PRINTS } },
          crepe: { label: "Crepe", icon: "🌊", prompt: "crepe draped sherwani, fluid drape", prints: { ...COMMON_PRINTS } },
          georgette: { label: "Georgette", icon: "💨", prompt: "georgette draped sherwani", prints: { ...COMMON_PRINTS } },
        }
      },
      bundi_shirt: {
        label: "Bundi with Shirt",
        icon: "🎽",
        prompt: "sleeveless bundi jacket over Western shirt, casual fusion",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk Bundi", icon: "✨", prompt: "silk bundi jacket over cotton shirt", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton Bundi", icon: "☁️", prompt: "cotton bundi, everyday fusion", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen Bundi", icon: "🌾", prompt: "linen bundi, summer style", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet Bundi", icon: "🎀", prompt: "velvet bundi, festive fusion", prints: { ...COMMON_PRINTS } },
        }
      },
      dhoti_pants_suit: {
        label: "Dhoti Pants with Suit",
        icon: "👔",
        prompt: "draped dhoti pants with suit jacket, bold fusion formal",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk dhoti pants with wool jacket", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton dhoti with linen jacket", prints: { ...COMMON_PRINTS } },
        }
      },
      longline_kurta: {
        label: "Longline Kurta Set",
        icon: "📏",
        prompt: "extra long kurta with straight pants, contemporary minimal",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          cotton: { label: "Cotton", icon: "☁️", prompt: "cotton longline kurta", prints: { ...COMMON_PRINTS } },
          linen: { label: "Linen", icon: "🌾", prompt: "linen longline kurta", prints: { ...COMMON_PRINTS } },
          silk: { label: "Silk", icon: "✨", prompt: "silk longline kurta", prints: { ...COMMON_PRINTS } },
        }
      },
      bandhgala_tux: {
        label: "Bandhgala Tuxedo",
        icon: "🎩",
        prompt: "bandhgala collar tuxedo, ultimate Indo-Western formal",
        fabrics: {
          any: { label: "Any Fabric", icon: "✨", prompt: "", prints: { ...COMMON_PRINTS } },
          wool: { label: "Wool", icon: "🐑", prompt: "fine wool bandhgala tuxedo", prints: { ...COMMON_PRINTS } },
          silk_blend: { label: "Silk Blend", icon: "✨", prompt: "silk blend bandhgala tuxedo", prints: { ...COMMON_PRINTS } },
          velvet: { label: "Velvet", icon: "🎀", prompt: "velvet bandhgala tuxedo", prints: { ...COMMON_PRINTS } },
        }
      },
    }
  }
};
