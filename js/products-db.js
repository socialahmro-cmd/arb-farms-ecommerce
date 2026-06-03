/**
 * products-db.js - Product Catalog Database
 * ARB Farms E-commerce
 */

const productsDb = [
  // A. Dairy & Organic Foods (Multan fresh milk delivery limits set in metadata)
  {
    id: "ogn-004-milk",
    sku: "OGN-004",
    name: "Cow Milk",
    weight: "1 Ltr",
    price: 330,
    category: "dairy-organic",
    image: "catalog/ogn-004-cow-milk-1ltr.svg",
    hoverImage: "catalog/ogn-004-cow-milk-1ltr-hover.svg",
    tags: ["milk", "dairy", "fresh", "cow", "multan"]
  },
  {
    id: "ogn-005",
    sku: "OGN-005",
    name: "Buffalo Milk",
    weight: "1 Ltr",
    price: 390,
    category: "dairy-organic",
    image: "catalog/ogn-005-buffalo-milk-1ltr.svg",
    hoverImage: "catalog/ogn-005-hover.svg",
    tags: ["milk", "dairy", "fresh", "buffalo", "multan"]
  },
  {
    id: "ogn-006",
    sku: "OGN-006",
    name: "Goat Milk",
    weight: "1 Ltr",
    price: 1000,
    category: "dairy-organic",
    image: "catalog/ogn-006-goat-milk-1ltr.svg",
    hoverImage: "catalog/ogn-006-goat-milk-1ltr-hover.svg",
    tags: ["milk", "dairy", "fresh", "goat", "multan"]
  },
  {
    id: "ogn-007",
    sku: "OGN-007",
    name: "Desi Organic Gurr",
    weight: "1 Kg",
    price: 720,
    category: "dairy-organic",
    image: "catalog/ogn-007-desi-organic-gurr-1kg.svg",
    hoverImage: "catalog/ogn-007-desi-organic-gurr-1kg-hover.svg",
    tags: ["gurr", "sweetener", "jaggery", "sugar"]
  },
  {
    id: "ogn-008",
    sku: "OGN-008",
    name: "Gurr with Dry Fruits",
    weight: "1 Kg",
    price: 1800,
    category: "dairy-organic",
    image: "catalog/ogn-008-gurr-with-dry-fruits-1kg.svg",
    hoverImage: "catalog/ogn-008-gurr-with-dry-fruits-1kg-hover.svg",
    tags: ["gurr", "sweetener", "premium", "dry fruits", "nuts"]
  },
  {
    id: "ogn-009",
    sku: "OGN-009",
    name: "Organic Shakar",
    weight: "1 Kg",
    price: 810,
    category: "dairy-organic",
    image: "catalog/ogn-009-organic-shakar-1kg.svg",
    hoverImage: "catalog/ogn-009-organic-shakar-1kg-hover.svg",
    tags: ["shakar", "sweetener", "sugar", "brown"]
  },
  {
    id: "ogn-010",
    sku: "OGN-010",
    name: "Organic Shakar (Bulk)",
    weight: "6 Kg",
    price: 4400,
    category: "dairy-organic",
    image: "catalog/ogn-010-organic-shakar-6kg.svg",
    hoverImage: "catalog/ogn-010-organic-shakar-6kg-hover.svg",
    tags: ["shakar", "sweetener", "sugar", "bulk"]
  },
  {
    id: "ogn-011",
    sku: "OGN-011",
    name: "Sidr Honey Small",
    weight: "500 gm",
    price: 5000,
    category: "dairy-organic",
    image: "catalog/honey.svg?v=2",
    hoverImage: "catalog/honey.svg?v=2",
    tags: ["honey", "sidr", "sweet", "small", "remedy"]
  },
  {
    id: "ogn-012",
    sku: "OGN-012",
    name: "Sidr Honey Large",
    weight: "1 Kg",
    price: 9000,
    category: "dairy-organic",
    image: "catalog/honey.svg?v=2",
    hoverImage: "catalog/honey.svg?v=2",
    tags: ["honey", "sidr", "sweet", "large", "premium"]
  },
  {
    id: "ogn-013",
    sku: "OGN-013",
    name: "Desi Ghee Small",
    weight: "500 gm",
    price: 5000,
    category: "dairy-organic",
    image: "catalog/ogn-013-desi-ghee-500gm.svg",
    hoverImage: "catalog/ogn-013-desi-ghee-500gm-hover.svg",
    tags: ["ghee", "desi", "butter", "dairy", "fat"]
  },
  {
    id: "ogn-014",
    sku: "OGN-014",
    name: "Desi Ghee Large",
    weight: "1 Kg",
    price: 9000,
    category: "dairy-organic",
    image: "catalog/ogn-014-desi-ghee-1kg.svg",
    hoverImage: "catalog/ogn-014-desi-ghee-1kg-hover.svg",
    tags: ["ghee", "desi", "butter", "dairy", "fat", "premium"]
  },
  {
    id: "ogn-015",
    sku: "OGN-015",
    name: "Organic Achaar Small",
    weight: "400 gm",
    price: 700,
    category: "dairy-organic",
    image: "catalog/ogn-015-organic-achaar-400gm.svg",
    hoverImage: "catalog/ogn-017-organic-achaar-1kg-hover.svg",
    tags: ["achaar", "pickle", "traditional", "oil", "mango"]
  },
  {
    id: "ogn-016",
    sku: "OGN-016",
    name: "Organic Achaar Medium",
    weight: "750 gm",
    price: 1000,
    category: "dairy-organic",
    image: "catalog/ogn-016-organic-achaar-750gm.svg",
    hoverImage: "catalog/ogn-017-organic-achaar-1kg-hover.svg",
    tags: ["achaar", "pickle", "traditional", "oil", "medium"]
  },
  {
    id: "ogn-017",
    sku: "OGN-017",
    name: "Organic Achaar Large",
    weight: "1 Kg",
    price: 1400,
    category: "dairy-organic",
    image: "catalog/ogn-017-organic-achaar-1kg.svg",
    hoverImage: "catalog/ogn-017-organic-achaar-1kg-hover.svg",
    tags: ["achaar", "pickle", "traditional", "oil", "large"]
  },
  {
    id: "ogn-065-mango",
    sku: "OGN-065",
    name: "Multan Chaunsa Mangoes (Pre-Booking)",
    weight: "5 Kg Box",
    price: 0,
    category: "dairy-organic",
    image: "catalog/ogn-065-mango-5kg.png",
    hoverImage: "catalog/ogn-065-mango-5kg-hover.png",
    tags: ["mango", "chaunsa", "fruit", "fresh", "organic", "pre-booking", "multan"]
  },

  // B. Edible Seeds & Superfoods
  {
    id: "ogn-018",
    sku: "OGN-018",
    name: "Gandum (Wheat)",
    weight: "1 Kg",
    price: 225,
    category: "edible-seeds",
    image: "catalog/ogn-018-gandum-40kg.svg",
    hoverImage: "catalog/ogn-018-gandum-40kg-hover.svg",
    tags: ["wheat", "gandum", "grain", "flour", "staple"]
  },
  {
    id: "ogn-018-5kg",
    sku: "OGN-018",
    name: "Gandum (Wheat)",
    weight: "5 Kg",
    price: 1100,
    category: "edible-seeds",
    image: "catalog/ogn-018-gandum-40kg.svg",
    hoverImage: "catalog/ogn-018-gandum-40kg-hover.svg",
    tags: ["wheat", "gandum", "grain", "flour", "staple"]
  },
  {
    id: "ogn-018-40kg",
    sku: "OGN-018",
    name: "Gandum (Wheat)",
    weight: "40 Kg (Maund)",
    price: 9000,
    category: "edible-seeds",
    image: "catalog/ogn-018-gandum-40kg.svg",
    hoverImage: "catalog/ogn-018-gandum-40kg-hover.svg",
    tags: ["wheat", "gandum", "grain", "flour", "staple", "bulk"]
  },
  {
    id: "ogn-027-edible",
    sku: "OGN-027",
    name: "Kalonji (Black Seed)",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-027-kalonji-250gm.svg",
    hoverImage: "catalog/ogn-027-kalonji-250gm-hover.svg",
    tags: ["kalonji", "black seed", "superfood", "spice"]
  },
  {
    id: "ogn-046",
    sku: "OGN-046",
    name: "Kalonji (Black Seed)",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-046-kalonji-500gm.svg",
    hoverImage: "catalog/ogn-046-kalonji-500gm-hover.svg",
    tags: ["kalonji", "black seed", "superfood", "spice"]
  },
  {
    id: "ogn-028-edible",
    sku: "OGN-028",
    name: "Chia Seed",
    weight: "250 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-028-chia-seed-250gm.svg",
    hoverImage: "catalog/ogn-028-chia-seed-250gm-hover.svg",
    tags: ["chia", "seeds", "fiber", "weight loss", "superfood"]
  },
  {
    id: "ogn-048",
    sku: "OGN-048",
    name: "Chia Seed",
    weight: "500 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-028-chia-seed-250gm.svg",
    hoverImage: "catalog/ogn-028-chia-seed-250gm-hover.svg",
    tags: ["chia", "seeds", "fiber", "weight loss", "superfood"]
  },
  {
    id: "ogn-063",
    sku: "OGN-063",
    name: "Isapghol",
    weight: "100 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-063-isapghol-100gm.svg",
    hoverImage: "catalog/ogn-063-isapghol-100gm-hover.svg",
    tags: ["isapghol", "husk", "fiber", "digestion", "laxative"]
  },
  {
    id: "ogn-064",
    sku: "OGN-064",
    name: "Isapghol",
    weight: "250 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-064-isapghol-250gm.svg",
    hoverImage: "catalog/ogn-064-isapghol-250gm-hover.svg",
    tags: ["isapghol", "husk", "fiber", "digestion", "laxative"]
  },
  {
    id: "ogn-053-moringa",
    sku: "OGN-053",
    name: "Moringa Powder",
    weight: "250 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-053-moringa-powder-250gm.svg",
    hoverImage: "catalog/ogn-053-moringa-powder-250gm-hover.svg",
    tags: ["moringa", "suhunjna", "powder", "health", "herbal"]
  },
  {
    id: "ogn-054",
    sku: "OGN-054",
    name: "Moringa Powder",
    weight: "500 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-054-moringa-powder-500gm.svg",
    hoverImage: "catalog/ogn-054-moringa-powder-500gm-hover.svg",
    tags: ["moringa", "suhunjna", "powder", "health", "herbal"]
  },
  {
    id: "ogn-055",
    sku: "OGN-055",
    name: "Flax Seed",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-055-flax-seed-250gm.svg",
    hoverImage: "catalog/ogn-055-flax-seed-250gm-hover.svg",
    tags: ["flax", "alsi", "omega-3", "oils", "superfood"]
  },
  {
    id: "ogn-056",
    sku: "OGN-056",
    name: "Flax Seed",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-056-flax-seed-500gm.svg",
    hoverImage: "catalog/ogn-056-flax-seed-500gm-hover.svg",
    tags: ["flax", "alsi", "omega-3", "oils", "superfood"]
  },
  {
    id: "ogn-057",
    sku: "OGN-057",
    name: "Sunflower Seed",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-057-sunflower-seed-250gm.svg",
    hoverImage: "catalog/ogn-057-sunflower-seed-250gm-hover.svg",
    tags: ["sunflower", "seeds", "snack", "nuts", "healthy"]
  },
  {
    id: "ogn-058",
    sku: "OGN-058",
    name: "Sunflower Seed",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-058-sunflower-seed-500gm.svg",
    hoverImage: "catalog/ogn-058-sunflower-seed-500gm-hover.svg",
    tags: ["sunflower", "seeds", "snack", "nuts", "healthy"]
  },
  {
    id: "ogn-059",
    sku: "OGN-059",
    name: "Sesame Seed",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-059-sesame-seed-250gm.svg",
    hoverImage: "catalog/ogn-059-sesame-seed-250gm-hover.svg",
    tags: ["sesame", "til", "calcium", "baking"]
  },
  {
    id: "ogn-060",
    sku: "OGN-060",
    name: "Sesame Seed",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-060-sesame-seed-500gm.svg",
    hoverImage: "catalog/ogn-060-sesame-seed-500gm-hover.svg",
    tags: ["sesame", "til", "calcium", "baking"]
  },
  {
    id: "ogn-051",
    sku: "OGN-051",
    name: "Basil Seed (Tukh Malanga)",
    weight: "250 gm",
    price: 720,
    category: "edible-seeds",
    image: "catalog/ogn-051-basil-seed-250gm.svg",
    hoverImage: "catalog/ogn-051-basil-seed-250gm-hover.svg",
    tags: ["basil", "tukh malanga", "cooling", "drink"]
  },
  {
    id: "ogn-061-edible",
    sku: "OGN-061",
    name: "Basil Seed (Tukh Malanga)",
    weight: "500 gm",
    price: 1350,
    category: "edible-seeds",
    image: "catalog/ogn-051-basil-seed-250gm.svg",
    hoverImage: "catalog/ogn-051-basil-seed-250gm-hover.svg",
    tags: ["basil", "tukh malanga", "cooling", "drink"]
  },
  {
    id: "ogn-052",
    sku: "OGN-052",
    name: "Pumpkin Seed",
    weight: "250 gm",
    price: 1400,
    category: "edible-seeds",
    image: "catalog/ogn-052-pumpkin-seed-250gm.svg",
    hoverImage: "catalog/ogn-052-pumpkin-seed-250gm-hover.svg",
    tags: ["pumpkin", "kaddu", "snack", "premium", "zinc"]
  },
  {
    id: "ogn-053-pumpkin",
    sku: "OGN-053",
    name: "Pumpkin Seed",
    weight: "500 gm",
    price: 2700,
    category: "edible-seeds",
    image: "catalog/ogn-053-pumpkin-seed-500gm.svg",
    hoverImage: "catalog/ogn-053-pumpkin-seed-500gm-hover.svg",
    tags: ["pumpkin", "kaddu", "snack", "premium", "zinc"]
  },

  // C. Livestock Feed & Forages
  {
    id: "ogn-041",
    sku: "OGN-041",
    name: "Silage Fodder Bale",
    weight: "40 Kg",
    price: 900,
    category: "feed-agri",
    image: "catalog/ogn-041-silage-40kg.svg",
    hoverImage: "catalog/ogn-041-silage-40kg-hover.svg",
    tags: ["silage", "fodder", "animal feed", "cows", "maund"]
  },
  {
    id: "ogn-042",
    sku: "OGN-042",
    name: "Alfalfa Hay Bale",
    weight: "40 Kg",
    price: 5400,
    category: "feed-agri",
    image: "catalog/ogn-042-hay-40kg.svg",
    hoverImage: "catalog/ogn-042-hay-40kg-hover.svg",
    tags: ["hay", "alfalfa", "animal feed", "cows", "maund"]
  },
  {
    id: "ogn-044",
    sku: "OGN-044",
    name: "Toori (Wheat Straw)",
    weight: "40 Kg",
    price: 1100,
    category: "feed-agri",
    image: "catalog/ogn-044-toori-40kg.svg",
    hoverImage: "catalog/ogn-044-toori-40kg-hover.svg",
    tags: ["toori", "wheat straw", "roughage", "animal bedding", "fodder"]
  }
];

const productVariations = {
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

// Share database globally
if (typeof window !== "undefined") {
  window.productsDb = productsDb;
  window.productVariations = productVariations;
}
