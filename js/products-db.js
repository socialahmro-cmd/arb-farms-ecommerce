/**
 * products-db.js - Product Catalog Database
 * ARB Farms E-commerce
 *
 * ── SKU CORRECTION NOTE ──────────────────────────────────────────────────
 * Every `sku` value below has been corrected to match the real ERP
 * `organic_products` table (mhhxuabpak_erp). The SKUs that were here
 * before did NOT match ERP at all past OGN-017 — e.g. this file's
 * "OGN-027" was tagged on both "Kalonji (Black Seed)" AND a sowing-seed
 * variant, while ERP's real OGN-027 is "Torri (Gourd)". That mismatch
 * would have caused sync-to-erp.php to silently book orders against the
 * wrong product.
 *
 * Three storefront items had no matching ERP row at all (Gandum 5kg,
 * Gandum 40kg, Organic Wheat Sowing Seed 40kg) — new ERP SKUs OGN-083,
 * OGN-084, OGN-085 were added for these (see add_missing_wheat_skus.sql).
 *
 * "White Chaunsa (Pre-Order)" has no distinct ERP product — by decision,
 * it is mapped to the existing "Mango Chaunsa" SKUs (OGN-073 / OGN-074).
 * ──────────────────────────────────────────────────────────────────────
 */

const productsDb = [
  // A. Dairy & Organic Foods (Multan fresh milk delivery limits set in metadata)
  // NOTE: Milk items (Cow/Buffalo/Goat) are intentionally placed at the END of
  // this array (see "Z. Fresh Milk (shown last on shop page)" near the bottom)
  // so Desi Ghee, Honey, Gurr, Achaar, and Mangoes show first, milk last.
  {
    id: "ogn-007",
    sku: "OGN-007",
    name: "Desi Organic Gurr",
    weight: "1 Kg",
    price: 720,
    category: "dairy-organic",
    image: "catalog/ogn-007-desi-organic-gurr-1kg-v2.svg",
    hoverImage: "catalog/ogn-007-desi-organic-gurr-1kg-hover-v2.svg",
    tags: ["gurr", "sweetener", "jaggery", "sugar"]
  },
  {
    id: "ogn-008",
    sku: "OGN-008",
    name: "Gurr with Dry Fruits",
    weight: "1 Kg",
    price: 1800,
    category: "dairy-organic",
    image: "catalog/ogn-008-gurr-with-dry-fruits-1kg-v2.svg",
    hoverImage: "catalog/ogn-007-desi-organic-gurr-1kg-hover-v2.svg",
    tags: ["gurr", "sweetener", "premium", "dry fruits", "nuts"]
  },
  {
    id: "ogn-009",
    sku: "OGN-009",
    name: "Organic Shakar",
    weight: "1 Kg",
    price: 810,
    category: "dairy-organic",
    image: "catalog/ogn-009-organic-shakar-1kg-v2.svg",
    hoverImage: "catalog/ogn-009-organic-shakar-1kg-hover-v2.svg",
    tags: ["shakar", "sweetener", "sugar", "brown"]
  },
  {
    id: "ogn-010",
    sku: "OGN-010",
    name: "Organic Shakar (Bulk)",
    weight: "6 Kg",
    price: 4400,
    category: "dairy-organic",
    image: "catalog/ogn-009-organic-shakar-1kg-v2.svg",
    hoverImage: "catalog/ogn-009-organic-shakar-1kg-hover-v2.svg",
    tags: ["shakar", "sweetener", "sugar", "bulk"]
  },
  {
    id: "ogn-011",
    sku: "OGN-011",
    name: "Sidr Honey Small",
    weight: "500 gm",
    price: 5000,
    category: "dairy-organic",
    image: "catalog/ogn-011-sidr-honey-small-500gm-v2.svg",
    hoverImage: "catalog/ogn-011-sidr-honey-small-500gm-hover-v2.svg",
    tags: ["honey", "sidr", "sweet", "small", "remedy"]
  },
  {
    id: "ogn-012",
    sku: "OGN-012",
    name: "Sidr Honey Large",
    weight: "1 Kg",
    price: 9000,
    category: "dairy-organic",
    image: "catalog/ogn-011-sidr-honey-small-500gm-v2.svg",
    hoverImage: "catalog/ogn-011-sidr-honey-small-500gm-hover-v2.svg",
    tags: ["honey", "sidr", "sweet", "large", "premium"]
  },
  {
    id: "ogn-013",
    sku: "OGN-013",
    name: "Desi Ghee Small",
    weight: "500 gm",
    price: 5000,
    category: "dairy-organic",
    image: "catalog/ogn-013-desi-ghee-500gm-v2.svg",
    hoverImage: "catalog/ogn-013-desi-ghee-500gm-hover-v2.svg",
    tags: ["ghee", "desi", "butter", "dairy", "fat"]
  },
  {
    id: "ogn-014",
    sku: "OGN-014",
    name: "Desi Ghee Large",
    weight: "1 Kg",
    price: 9000,
    category: "dairy-organic",
    image: "catalog/ogn-013-desi-ghee-500gm-v2.svg",
    hoverImage: "catalog/ogn-013-desi-ghee-500gm-hover-v2.svg",
    tags: ["ghee", "desi", "butter", "dairy", "fat", "premium"]
  },
  {
    id: "ogn-015",
    sku: "OGN-017",
    name: "Organic Achaar Small",
    weight: "400 gm",
    price: 700,
    category: "dairy-organic",
    image: "catalog/ogn-015-organic-achaar-400gm-v2.svg",
    hoverImage: "catalog/ogn-017-organic-achaar-1kg-hover-v2.svg",
    tags: ["achaar", "pickle", "traditional", "oil", "mango"]
  },
  {
    id: "ogn-016",
    sku: "OGN-018",
    name: "Organic Achaar Medium",
    weight: "750 gm",
    price: 1000,
    category: "dairy-organic",
    image: "catalog/ogn-016-organic-achaar-750gm-v2.svg",
    hoverImage: "catalog/ogn-017-organic-achaar-1kg-hover-v2.svg",
    tags: ["achaar", "pickle", "traditional", "oil", "medium"]
  },
  {
    id: "ogn-017",
    sku: "OGN-019",
    name: "Organic Achaar Large",
    weight: "1 Kg",
    price: 1400,
    category: "dairy-organic",
    image: "catalog/ogn-017-organic-achaar-1kg-v2.svg",
    hoverImage: "catalog/ogn-017-organic-achaar-1kg-hover-v2.svg",
    tags: ["achaar", "pickle", "traditional", "oil", "large"]
  },
  {
    id: "ogn-066-white-chaunsa-5kg",
    sku: "OGN-073",
    name: "White Chaunsa (Pre-Order)",
    weight: "5 Kg Box",
    price: 2000,
    originalPrice: 2500,
    shipping: 0,
    category: "dairy-organic",
    image: "catalog/White-Chaunsa.svg",
    hoverImage: "catalog/White-Chaunsa.svg",
    tags: ["mango", "chaunsa", "white chaunsa", "fruit", "fresh", "organic", "pre-booking"]
  },
  {
    id: "ogn-066-white-chaunsa-9kg",
    sku: "OGN-074",
    name: "White Chaunsa (Pre-Order)",
    weight: "9 Kg Box",
    price: 3200,
    originalPrice: 3800,
    shipping: 0,
    category: "dairy-organic",
    image: "catalog/White-Chaunsa.svg",
    hoverImage: "catalog/White-Chaunsa.svg",
    tags: ["mango", "chaunsa", "white chaunsa", "fruit", "fresh", "organic", "pre-booking"]
  },
{
    id: "ogn-067-sindhri-5kg",
    sku: "OGN-075",
    name: "Sindhri Mango (Pre-Order)",
    weight: "5 Kg Box",
    price: 1700,
    originalPrice: 1900,
    shipping: 0,
  inStock: false,
    category: "dairy-organic",
    image: "catalog/Sindhri-Mango.svg",
    hoverImage: "catalog/Sindhri-Mango.svg",
    tags: ["mango", "sindhri", "fruit", "fresh", "organic", "pre-booking"]
  },
 {
    id: "ogn-067-sindhri-9kg",
    sku: "OGN-076",
    name: "Sindhri Mango (Pre-Order)",
    weight: "9 Kg Box",
    price: 2900,
    originalPrice: 3100,
    shipping: 0,
   inStock: false,
    category: "dairy-organic",
    image: "catalog/Sindhri-Mango.svg",
    hoverImage: "catalog/Sindhri-Mango.svg",
    tags: ["mango", "sindhri", "fruit", "fresh", "organic", "pre-booking"]
  },
 {
    id: "ogn-068-dusehri-5kg",
    sku: "OGN-069",
    name: "Dusehri Mango (Pre-Order)",
    weight: "5 Kg Box",
    price: 2000,
    originalPrice: 2200,
    shipping: 0,
   inStock: false,
    inStock: false,
    category: "dairy-organic",
    image: "catalog/Dusehri-Mango.svg",
    hoverImage: "catalog/Dusehri-Mango.svg",
    tags: ["mango", "dusehri", "fruit", "fresh", "organic", "pre-booking"]
  },
 {
    id: "ogn-068-dusehri-9kg",
    sku: "OGN-070",
    name: "Dusehri Mango (Pre-Order)",
    weight: "9 Kg Box",
    price: 3000,
    originalPrice: 3400,
    shipping: 0,
   inStock: false,
    inStock: false,
    category: "dairy-organic",
    image: "catalog/Dusehri-Mango.svg",
    hoverImage: "catalog/Dusehri-Mango.svg",
    tags: ["mango", "dusehri", "fruit", "fresh", "organic", "pre-booking"]
  },
  {
    id: "ogn-069-anwar-ratol-5kg",
    sku: "OGN-071",
    name: "Anwar Ratol (Pre-Order)",
    weight: "5 Kg Box",
    price: 2400,
    originalPrice: 2700,
    shipping: 0,
    inStock: false,
    category: "dairy-organic",
    image: "catalog/Anwar-Ratol.svg",
    hoverImage: "catalog/Anwar-Ratol.svg",
    tags: ["mango", "anwar ratol", "fruit", "fresh", "organic", "pre-booking"]
  },
  {
    id: "ogn-069-anwar-ratol-9kg",
    sku: "OGN-072",
    name: "Anwar Ratol (Pre-Order)",
    weight: "9 Kg Box",
    price: 3600,
    originalPrice: 4100,
    shipping: 0,
    inStock: false,
    category: "dairy-organic",
    image: "catalog/Anwar-Ratol.svg",
    hoverImage: "catalog/Anwar-Ratol.svg",
    tags: ["mango", "anwar ratol", "fruit", "fresh", "organic", "pre-booking"]
  },

  // B. Edible Seeds & Superfoods
  {
    id: "ogn-018",
    sku: "OGN-045",
    name: "Gandum (Wheat)",
    weight: "1 Kg",
    price: 225,
    category: "edible-seeds",
    image: "catalog/ogn-018-gandum-40kg-v2.svg",
    hoverImage: "catalog/ogn-018-gandum-40kg-hover-v2.svg",
    tags: ["wheat", "gandum", "grain", "flour", "staple"]
  },
  {
    id: "ogn-018-5kg",
    sku: "OGN-083",
    name: "Gandum (Wheat)",
    weight: "5 Kg",
    price: 1100,
    category: "edible-seeds",
    image: "catalog/ogn-018-gandum-40kg-v2.svg",
    hoverImage: "catalog/ogn-018-gandum-40kg-hover-v2.svg",
    tags: ["wheat", "gandum", "grain", "flour", "staple"]
  },
  {
    id: "ogn-018-40kg",
    sku: "OGN-084",
    name: "Gandum (Wheat)",
    weight: "40 Kg (Maund)",
    price: 9000,
    category: "edible-seeds",
    image: "catalog/ogn-018-gandum-40kg-v2.svg",
    hoverImage: "catalog/ogn-018-gandum-40kg-hover-v2.svg",
    tags: ["wheat", "gandum", "grain", "flour", "staple", "bulk"]
  },
  {
    id: "ogn-027-edible",
    sku: "OGN-047",
    name: "Kalonji (Black Seed)",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-027-kalonji-250gm-v2.svg",
    hoverImage: "catalog/ogn-027-kalonji-250gm-hover-v2.svg",
    tags: ["kalonji", "black seed", "superfood", "spice"]
  },
  {
    id: "ogn-046",
    sku: "OGN-048",
    name: "Kalonji (Black Seed)",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-027-kalonji-250gm-v2.svg",
    hoverImage: "catalog/ogn-027-kalonji-250gm-hover-v2.svg",
    tags: ["kalonji", "black seed", "superfood", "spice"]
  },
  {
    id: "ogn-028-edible",
    sku: "OGN-049",
    name: "Chia Seed",
    weight: "250 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-028-chia-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-028-chia-seed-250gm-hover-v2.svg",
    tags: ["chia", "seeds", "fiber", "weight loss", "superfood"]
  },
  {
    id: "ogn-048",
    sku: "OGN-050",
    name: "Chia Seed",
    weight: "500 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-028-chia-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-028-chia-seed-250gm-hover-v2.svg",
    tags: ["chia", "seeds", "fiber", "weight loss", "superfood"]
  },
  {
    id: "ogn-063",
    sku: "OGN-065",
    name: "Isapghol",
    weight: "100 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-063-isapghol-100gm-v2.svg",
    hoverImage: "catalog/ogn-063-isapghol-100gm-hover-v2.svg",
    tags: ["isapghol", "husk", "fiber", "digestion", "laxative"]
  },
  {
    id: "ogn-064",
    sku: "OGN-066",
    name: "Isapghol",
    weight: "250 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-063-isapghol-100gm-v2.svg",
    hoverImage: "catalog/ogn-063-isapghol-100gm-hover-v2.svg",
    tags: ["isapghol", "husk", "fiber", "digestion", "laxative"]
  },
  {
    id: "ogn-053-moringa",
    sku: "OGN-055",
    name: "Moringa Powder",
    weight: "250 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-053-moringa-powder-250gm-v2.svg",
    hoverImage: "catalog/ogn-053-moringa-powder-250gm-hover-v2.svg",
    tags: ["moringa", "suhunjna", "powder", "health", "herbal"]
  },
  {
    id: "ogn-054",
    sku: "OGN-056",
    name: "Moringa Powder",
    weight: "500 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-053-moringa-powder-250gm-v2.svg",
    hoverImage: "catalog/ogn-053-moringa-powder-250gm-hover-v2.svg",
    tags: ["moringa", "suhunjna", "powder", "health", "herbal"]
  },
  {
    id: "ogn-055",
    sku: "OGN-057",
    name: "Flax Seed",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-055-flax-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-055-flax-seed-250gm-hover-v2.svg",
    tags: ["flax", "alsi", "omega-3", "oils", "superfood"]
  },
  {
    id: "ogn-056",
    sku: "OGN-058",
    name: "Flax Seed",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-055-flax-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-055-flax-seed-250gm-hover-v2.svg",
    tags: ["flax", "alsi", "omega-3", "oils", "superfood"]
  },
  {
    id: "ogn-057",
    sku: "OGN-059",
    name: "Sunflower Seed",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-057-sunflower-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-057-sunflower-seed-250gm-hover-v2.svg",
    tags: ["sunflower", "seeds", "snack", "nuts", "healthy"]
  },
  {
    id: "ogn-058",
    sku: "OGN-060",
    name: "Sunflower Seed",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-057-sunflower-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-057-sunflower-seed-250gm-hover-v2.svg",
    tags: ["sunflower", "seeds", "snack", "nuts", "healthy"]
  },
  {
    id: "ogn-059",
    sku: "OGN-061",
    name: "Sesame Seed",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-059-sesame-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-059-sesame-seed-250gm-hover-v2.svg",
    tags: ["sesame", "til", "calcium", "baking"]
  },
  {
    id: "ogn-060",
    sku: "OGN-062",
    name: "Sesame Seed",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-059-sesame-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-059-sesame-seed-250gm-hover-v2.svg",
    tags: ["sesame", "til", "calcium", "baking"]
  },
  {
    id: "ogn-051",
    sku: "OGN-051",
    name: "Basil Seed (Tukh Malanga)",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-051-basil-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-051-basil-seed-250gm-hover-v2.svg",
    tags: ["basil", "tukh malanga", "cooling", "drink"]
  },
  {
    id: "ogn-061-edible",
    sku: "OGN-052",
    name: "Basil Seed (Tukh Malanga)",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-051-basil-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-051-basil-seed-250gm-hover-v2.svg",
    tags: ["basil", "tukh malanga", "cooling", "drink"]
  },
  {
    id: "ogn-052",
    sku: "OGN-053",
    name: "Pumpkin Seed",
    weight: "250 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-052-pumpkin-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-052-pumpkin-seed-250gm-hover-v2.svg",
    tags: ["pumpkin", "kaddu", "snack", "premium", "zinc"]
  },
  {
    id: "ogn-053-pumpkin",
    sku: "OGN-054",
    name: "Pumpkin Seed",
    weight: "500 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-052-pumpkin-seed-250gm-v2.svg",
    hoverImage: "catalog/ogn-052-pumpkin-seed-250gm-hover-v2.svg",
    tags: ["pumpkin", "kaddu", "snack", "premium", "zinc"]
  },

  // C. Livestock Feed & Forages
  {
    id: "ogn-041",
    sku: "OGN-043",
    name: "Silage Fodder Bale",
    weight: "40 Kg",
    price: 900,
    category: "feed-agri",
    image: "catalog/ogn-041-silage-40kg-v2.svg",
    hoverImage: "catalog/ogn-041-silage-40kg-hover-v2.svg",
    tags: ["silage", "fodder", "animal feed", "cows", "maund"]
  },
  {
    id: "ogn-042",
    sku: "OGN-044",
    name: "Alfalfa Hay Bale",
    weight: "40 Kg",
    price: 5400,
    category: "feed-agri",
    image: "catalog/ogn-042-hay-40kg-v2.svg",
    hoverImage: "catalog/ogn-042-hay-40kg-hover-v2.svg",
    tags: ["hay", "alfalfa", "animal feed", "cows", "maund"]
  },
  {
    id: "ogn-044",
    sku: "OGN-046",
    name: "Toori (Wheat Straw)",
    weight: "40 Kg",
    price: 1100,
    category: "feed-agri",
    image: "catalog/ogn-044-toori-40kg-v2.svg",
    hoverImage: "catalog/ogn-044-toori-40kg-hover-v2.svg",
    tags: ["toori", "wheat straw", "roughage", "animal bedding", "fodder"]
  },
  { id: "ogn-019", sku: "OGN-021", name: "Jodal (Oats Jodri) Sowing Seed", weight: "1 Kg", price: 1000, category: "agri-sowing-seed", image: "catalog/ogn-019-jodal-sowing-v2.svg", tags: ["seed", "sowing", "jodal"] },
  { id: "ogn-020", sku: "OGN-022", name: "Desi Javi (Oats Seed) Sowing Seed", weight: "1 Kg", price: 1000, category: "agri-sowing-seed", image: "catalog/ogn-020-desi-javi-sowing-v2.svg", tags: ["seed", "sowing", "javi"] },
  { id: "ogn-021", sku: "OGN-023", name: "Jou (Barley) Sowing Seed", weight: "1 Kg", price: 1000, category: "agri-sowing-seed", image: "catalog/ogn-021-jou-sowing-v2.svg", tags: ["seed", "sowing", "jou"] },
  { id: "ogn-022", sku: "OGN-024", name: "Methi (Fenugreek) Sowing Seed", weight: "1 Kg", price: 2500, category: "agri-sowing-seed", image: "catalog/ogn-022-methi-sowing-v2.svg", tags: ["seed", "sowing", "methi"] },
  { id: "ogn-023", sku: "OGN-025", name: "Pallak (Spinach) Sowing Seed", weight: "1 Kg", price: 1000, category: "agri-sowing-seed", image: "catalog/ogn-023-palak-sowing-v2.svg", tags: ["seed", "sowing", "pallak"] },
  { id: "ogn-024", sku: "OGN-026", name: "Kaddo (Pumpkin) Sowing Seed", weight: "1 Kg", price: 3500, category: "agri-sowing-seed", image: "catalog/ogn-024-kaddu-sowing-v2.svg", tags: ["seed", "sowing", "kaddo"] },
  { id: "ogn-025", sku: "OGN-027", name: "Torri (Gourd) Sowing Seed", weight: "1 Kg", price: 4000, category: "agri-sowing-seed", image: "catalog/ogn-025-torri-sowing-v2.svg", tags: ["seed", "sowing", "torri"] },
  { id: "ogn-026", sku: "OGN-028", name: "Kapas (Cotton) Sowing Seed", weight: "1 Kg", price: 1000, category: "agri-sowing-seed", image: "catalog/ogn-026-kapas-sowing-v2.svg", tags: ["seed", "sowing", "kapas"] },
  { id: "ogn-027-seed", sku: "OGN-029", name: "Kalonji Sowing Seed", weight: "1 Kg", price: 3000, category: "agri-sowing-seed", image: "catalog/ogn-027-kalonji-sowing-v2.svg", tags: ["seed", "sowing", "kalonji"] },
  { id: "ogn-028-seed", sku: "OGN-030", name: "Chia Seed Sowing Seed", weight: "1 Kg", price: 4000, category: "agri-sowing-seed", image: "catalog/ogn-028-chia-seed-sowing-v2.svg", tags: ["seed", "sowing", "chia"] },
  { id: "ogn-029-seed", sku: "OGN-031", name: "Isapghol Sowing Seed", weight: "1 Kg", price: 3000, category: "agri-sowing-seed", image: "catalog/ogn-029-isapghol-sowing-v2.svg", tags: ["seed", "sowing", "isapghol"] },
  { id: "ogn-030", sku: "OGN-032", name: "Saunf (Fennel) Sowing Seed", weight: "1 Kg", price: 2000, category: "agri-sowing-seed", image: "catalog/ogn-030-saunf-sowing-v2.svg", tags: ["seed", "sowing", "saunf"] },
  { id: "ogn-031", sku: "OGN-033", name: "Dhaniya (Coriander) Sowing Seed", weight: "1 Kg", price: 3000, category: "agri-sowing-seed", image: "catalog/ogn-031-dhaniya-sowing-v2.svg", tags: ["seed", "sowing", "dhaniya"] },
  { id: "ogn-032", sku: "OGN-034", name: "Lehsun (Garlic) Sowing Seed", weight: "1 Kg", price: 1500, category: "agri-sowing-seed", image: "catalog/ogn-032-lehsun-sowing-v2.svg", tags: ["seed", "sowing", "lehsun"] },
  { id: "ogn-033", sku: "OGN-035", name: "Piyaz (Onion) Sowing Seed", weight: "1 Kg", price: 8000, category: "agri-sowing-seed", image: "catalog/ogn-033-piyaz-sowing-v2.svg", tags: ["seed", "sowing", "piyaz"] },
  { id: "ogn-034", sku: "OGN-036", name: "Gajar (Carrot) Sowing Seed", weight: "1 Kg", price: 3000, category: "agri-sowing-seed", image: "catalog/ogn-034-gajar-sowing-v2.svg", tags: ["seed", "sowing", "gajar"] },
  { id: "ogn-035", sku: "OGN-037", name: "Taramira (Rocket) Sowing Seed", weight: "1 Kg", price: 1500, category: "agri-sowing-seed", image: "catalog/ogn-035-taramira-sowing-v2.svg", tags: ["seed", "sowing", "taramira"] },
  { id: "ogn-036", sku: "OGN-038", name: "Desi Moong (Mung Bean) Sowing Seed", weight: "1 Kg", price: 1500, category: "agri-sowing-seed", image: "catalog/ogn-036-moong-sowing-v2.svg", tags: ["seed", "sowing", "moong"] },
  { id: "ogn-037", sku: "OGN-039", name: "Chollay (Chickpea) Sowing Seed", weight: "1 Kg", price: 1000, category: "agri-sowing-seed", image: "catalog/ogn-037-chollay-sowing-v2.svg", tags: ["seed", "sowing", "chollay"] },
  { id: "ogn-038", sku: "OGN-040", name: "Tukh Malango (Black Seeds) Sowing Seed", weight: "1 Kg", price: 2000, category: "agri-sowing-seed", image: "catalog/ogn-038-tukh-malango-sowing-v2.svg", tags: ["seed", "sowing", "tukh"] },
  { id: "ogn-039", sku: "OGN-041", name: "Lucerne Sowing Seed", weight: "1 Kg", price: 6000, category: "agri-sowing-seed", image: "catalog/ogn-039-lucerne-fodder-v2.svg", tags: ["seed", "sowing", "lucerne"] },
  { id: "ogn-040", sku: "OGN-042", name: "Bajra (Pearl Millet) Sowing Seed", weight: "1 Kg", price: 1000, category: "agri-sowing-seed", image: "catalog/ogn-040-bajra-sowing-v2.svg", tags: ["seed", "sowing", "bajra"] },
  { id: "ogn-061", sku: "OGN-063", name: "Okra Seed (less than 40kg)", weight: "1 Kg", price: 3000, category: "agri-sowing-seed", image: "catalog/ogn-061-okra-retail-v2.svg", tags: ["seed", "sowing", "okra"] },
  { id: "ogn-062", sku: "OGN-064", name: "Okra Seed (more than 40kg)", weight: "1 Kg", price: 2500, category: "agri-sowing-seed", image: "catalog/ogn-062-okra-bulk-v2.svg", tags: ["seed", "sowing", "okra"] },
  { id: "ogn-004-seed", sku: "OGN-085", name: "Organic Wheat Sowing Seed", weight: "40 Kg", price: 4500, category: "agri-sowing-seed", image: "catalog/ogn-004-wheat-sowing-v2.svg", tags: ["seed", "sowing", "wheat"] },

  // Z. Fresh Milk (shown last on shop page)
  {
    id: "ogn-004-milk",
    sku: "OGN-001",
    name: "Cow Milk",
    weight: "1 Ltr",
    price: 330,
    category: "dairy-organic",
    image: "catalog/ogn-004-cow-milk-1ltr-v2.svg",
    hoverImage: "catalog/ogn-004-cow-milk-1ltr-hover-v2.svg",
    tags: ["milk", "dairy", "fresh", "cow", "multan"]
  },
  {
    id: "ogn-005",
    sku: "OGN-002",
    name: "Buffalo Milk",
    weight: "1 Ltr",
    price: 390,
    category: "dairy-organic",
    image: "catalog/ogn-005-buffalo-milk-1ltr-v2.svg",
    hoverImage: "catalog/ogn-005-hover-v2.svg",
    tags: ["milk", "dairy", "fresh", "buffalo", "multan"]
  },
  {
    id: "ogn-006",
    sku: "OGN-003",
    name: "Goat Milk",
    weight: "1 Ltr",
    price: 1000,
    category: "dairy-organic",
    image: "catalog/ogn-006-goat-milk-1ltr-v2.svg",
    hoverImage: "catalog/ogn-006-goat-milk-1ltr-hover-v2.svg",
    tags: ["milk", "dairy", "fresh", "goat", "multan"]
  }
];

const productVariations = {
  // Mangoes - 5kg and 9kg box variants
  "ogn-066-white-chaunsa-5kg": ["ogn-066-white-chaunsa-5kg", "ogn-066-white-chaunsa-9kg"],
  "ogn-066-white-chaunsa-9kg": ["ogn-066-white-chaunsa-5kg", "ogn-066-white-chaunsa-9kg"],
  "ogn-067-sindhri-5kg":       ["ogn-067-sindhri-5kg",       "ogn-067-sindhri-9kg"],
  "ogn-067-sindhri-9kg":       ["ogn-067-sindhri-5kg",       "ogn-067-sindhri-9kg"],
  "ogn-068-dusehri-5kg":       ["ogn-068-dusehri-5kg",       "ogn-068-dusehri-9kg"],
  "ogn-068-dusehri-9kg":       ["ogn-068-dusehri-5kg",       "ogn-068-dusehri-9kg"],
  "ogn-069-anwar-ratol-5kg":   ["ogn-069-anwar-ratol-5kg",   "ogn-069-anwar-ratol-9kg"],
  "ogn-069-anwar-ratol-9kg":   ["ogn-069-anwar-ratol-5kg",   "ogn-069-anwar-ratol-9kg"],
  // Other products
  "ogn-018": ["ogn-018", "ogn-018-5kg", "ogn-018-40kg"],  // Wheat (Gandum)
  "ogn-018-5kg": ["ogn-018", "ogn-018-5kg", "ogn-018-40kg"],
  "ogn-018-40kg": ["ogn-018", "ogn-018-5kg", "ogn-018-40kg"],
  "ogn-011": ["ogn-011", "ogn-012"], // Honey
  "ogn-012": ["ogn-011", "ogn-012"],
  "ogn-013": ["ogn-013", "ogn-014"], // Ghee
  "ogn-014": ["ogn-013", "ogn-014"],
  "ogn-015": ["ogn-015", "ogn-016", "ogn-017"], // Achaar
  "ogn-016": ["ogn-015", "ogn-016", "ogn-017"],
  "ogn-017": ["ogn-015", "ogn-016", "ogn-017"],
  "ogn-009": ["ogn-009", "ogn-010"], // Shakar
  "ogn-010": ["ogn-009", "ogn-010"],
  "ogn-027-edible": ["ogn-027-edible", "ogn-046"], // Kalonji
  "ogn-046": ["ogn-027-edible", "ogn-046"],
  "ogn-028-edible": ["ogn-028-edible", "ogn-048"], // Chia
  "ogn-048": ["ogn-028-edible", "ogn-048"],
  "ogn-063": ["ogn-063", "ogn-064"], // Isapghol
  "ogn-064": ["ogn-063", "ogn-064"],
  "ogn-053-moringa": ["ogn-053-moringa", "ogn-054"], // Moringa
  "ogn-054": ["ogn-053-moringa", "ogn-054"],
  "ogn-055": ["ogn-055", "ogn-056"], // Flax
  "ogn-056": ["ogn-055", "ogn-056"],
  "ogn-057": ["ogn-057", "ogn-058"], // Sunflower
  "ogn-058": ["ogn-057", "ogn-058"],
  "ogn-059": ["ogn-059", "ogn-060"], // Sesame
  "ogn-060": ["ogn-059", "ogn-060"],
  "ogn-051": ["ogn-051", "ogn-061-edible"], // Basil
  "ogn-061-edible": ["ogn-051", "ogn-061-edible"],
  "ogn-052": ["ogn-052", "ogn-053-pumpkin"], // Pumpkin
  "ogn-053-pumpkin": ["ogn-052", "ogn-053-pumpkin"]
};

// Culturally Curated Bundles
const bundlesDb = [
  {
    id: "bndl-desi-nashta",
    name: "Desi Nashta Bundle",
    description: "Traditional Weekend Breakfast. Includes Organic Desi Ghee (Small), Buffalo Milk, and Organic Achaar (Small).",
    items: ["ogn-013", "ogn-005", "ogn-015"],
    discountRate: 0.05,
    cityRestriction: "multan",
    image: "catalog/ogn-013-desi-ghee-500gm-v2.svg",
    badge: "Multan Exclusive"
  },
  {
    id: "bndl-aam-season",
    name: "Aam Season Bundle",
    description: "The ultimate summer treat. Includes Anwar Ratol, Dusehri, and Cow Milk for fresh shakes.",
    items: ["ogn-069-anwar-ratol-5kg", "ogn-068-dusehri-5kg", "ogn-004-milk"],
    discountRate: 0.05,
    cityRestriction: "multan",
    image: "catalog/Anwar-Ratol.svg",
    badge: "Multan Exclusive"
  },
  {
    id: "bndl-ghee-shakkar",
    name: "Sweet Paratha Bundle",
    description: "The classic Punjabi comfort food pair. Organic Desi Ghee (Small) & Pure Shakkar.",
    items: ["ogn-013", "ogn-009"],
    discountRate: 0.05,
    cityRestriction: "all",
    image: "catalog/ogn-009-organic-shakar-1kg-v2.svg",
    badge: "Nationwide Delivery"
  },
  {
    id: "bndl-panjeeri",
    name: "Taqat Ka Khazana (Panjeeri Base)",
    description: "Perfect for winter or postpartum. Includes Ghee (Small), Shakkar, Chia Seeds, and Mixed Edible Seeds.",
    items: ["ogn-013", "ogn-009", "ogn-028-edible", "ogn-051"], // Just selecting a few seeds
    discountRate: 0.05,
    cityRestriction: "all",
    image: "catalog/ogn-028-chia-seed-250gm-v2.svg",
    badge: "Nationwide Delivery"
  }
];

// Share database globally
if (typeof window !== "undefined") {
  window.productsDb = productsDb;
  window.productVariations = productVariations;
  window.bundlesDb = bundlesDb;
}
