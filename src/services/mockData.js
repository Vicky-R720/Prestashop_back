export const categories = [
  {
    id: "cat-01",
    name: "Sneakers",
    slug: "sneakers",
    count: 24,
  },
  {
    id: "cat-02",
    name: "Bagagerie",
    slug: "bagagerie",
    count: 18,
  },
  {
    id: "cat-03",
    name: "Accessoires",
    slug: "accessoires",
    count: 32,
  },
  {
    id: "cat-04",
    name: "Electro",
    slug: "electro",
    count: 14,
  },
  {
    id: "cat-05",
    name: "Maison",
    slug: "maison",
    count: 20,
  },
  {
    id: "cat-06",
    name: "Sport",
    slug: "sport",
    count: 16,
  },
];

export const heroSlides = [
  {
    id: "slide-01",
    title: "Collection Atlas",
    subtitle: "Des essentiels premium pour un dressing urbain et affute.",
    cta: "Decouvrir",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "slide-02",
    title: "Maison & design",
    subtitle: "Textures douces, materiaux nobles, finitions modernes.",
    cta: "Voir la selection",
    image:
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "slide-03",
    title: "Performance sport",
    subtitle: "Confort, energie et style pour chaque mouvement.",
    cta: "Acheter maintenant",
    image:
      "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop",
  },
];

export const mockProducts = [
  {
    id: "ps-101",
    name: "Baskets Atlas Flow",
    price: 129.9,
    rating: 4.8,
    reviews: 212,
    category: "sneakers",
    badge: "New",
    colors: ["Crimson", "Onyx", "Pearl"],
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Semelle reactive, cuir lisse et silhouette profil race. Parfait pour la ville.",
    specs: [
      { label: "Matiere", value: "Cuir lisse" },
      { label: "Semelle", value: "EVA multicouche" },
      { label: "Poids", value: "320 g" },
    ],
    tags: ["urban", "new"],
  },
  {
    id: "ps-102",
    name: "Sac Weekender Nomad",
    price: 189.0,
    rating: 4.7,
    reviews: 98,
    category: "bagagerie",
    badge: "Limited",
    colors: ["Sand", "Ink"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Volume genereux, poche interieure et toile technique resistante a l eau.",
    specs: [
      { label: "Capacite", value: "38 L" },
      { label: "Matiere", value: "Toile technique" },
      { label: "Garantie", value: "2 ans" },
    ],
    tags: ["travel"],
  },
  {
    id: "ps-103",
    name: "Montre Oria Steel",
    price: 249.0,
    rating: 4.6,
    reviews: 140,
    category: "accessoires",
    badge: "Bestseller",
    colors: ["Steel", "Graphite"],
    images: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Boitier acier brosse, cadran minimaliste et bracelet interchangeable.",
    specs: [
      { label: "Diametre", value: "40 mm" },
      { label: "Verre", value: "Saphir" },
      { label: "Etancheite", value: "5 ATM" },
    ],
    tags: ["premium"],
  },
  {
    id: "ps-104",
    name: "Casque Audio Pulse",
    price: 159.0,
    rating: 4.5,
    reviews: 88,
    category: "electro",
    badge: "-20%",
    colors: ["Noir", "Clay"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Audio immersif, reduction de bruit et autonomie 38 heures.",
    specs: [
      { label: "Autonomie", value: "38 h" },
      { label: "Poids", value: "260 g" },
      { label: "Bluetooth", value: "5.2" },
    ],
    tags: ["audio", "deal"],
  },
  {
    id: "ps-105",
    name: "Lampe Halo",
    price: 89.0,
    rating: 4.4,
    reviews: 65,
    category: "maison",
    badge: "New",
    colors: ["Cream", "Charcoal"],
    images: [
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Eclairage doux, base ceramique, intensite reglable.",
    specs: [
      { label: "Puissance", value: "9 W" },
      { label: "Hauteur", value: "32 cm" },
      { label: "Cable", value: "2 m" },
    ],
    tags: ["home"],
  },
  {
    id: "ps-106",
    name: "Tapis Studio",
    price: 140.0,
    rating: 4.3,
    reviews: 52,
    category: "maison",
    badge: "Edition",
    colors: ["Ivory", "Graphite"],
    images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Texture epaisse, motif abstrait et rendu chaleureux.",
    specs: [
      { label: "Dimensions", value: "160 x 230" },
      { label: "Matiere", value: "Laine melangee" },
      { label: "Epaisseur", value: "18 mm" },
    ],
    tags: ["home"],
  },
  {
    id: "ps-107",
    name: "Veste Tech Air",
    price: 210.0,
    rating: 4.7,
    reviews: 73,
    category: "sport",
    badge: "New",
    colors: ["Slate", "Lime"],
    images: [
      "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Coupe dynamique, tissu respirant et impermeabilite 5k.",
    specs: [
      { label: "Tissu", value: "Nylon technique" },
      { label: "Poids", value: "410 g" },
      { label: "Impermeable", value: "Oui" },
    ],
    tags: ["sport"],
  },
  {
    id: "ps-108",
    name: "Lunettes Aster",
    price: 120.0,
    rating: 4.5,
    reviews: 58,
    category: "accessoires",
    badge: "New",
    colors: ["Amber", "Smoke"],
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Monture acetate, protection UV400 et silhouette iconique.",
    specs: [
      { label: "Protection", value: "UV400" },
      { label: "Poids", value: "24 g" },
      { label: "Etui", value: "Inclus" },
    ],
    tags: ["summer"],
  },
  {
    id: "ps-109",
    name: "Chaise Lou",
    price: 180.0,
    rating: 4.2,
    reviews: 44,
    category: "maison",
    badge: "Studio",
    colors: ["Oat", "Forest"],
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Assise confortable, structure bois et design scandinave.",
    specs: [
      { label: "Hauteur", value: "82 cm" },
      { label: "Charge", value: "120 kg" },
      { label: "Bois", value: "Chene" },
    ],
    tags: ["home"],
  },
  {
    id: "ps-110",
    name: "Tote Studio",
    price: 59.0,
    rating: 4.4,
    reviews: 36,
    category: "bagagerie",
    badge: "New",
    colors: ["Sand", "Ink"],
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=700&auto=format&fit=crop",
    ],
    description:
      "Format daily, poches invisibles et toile resistant.",
    specs: [
      { label: "Capacite", value: "18 L" },
      { label: "Matiere", value: "Coton recycle" },
      { label: "Fermeture", value: "Zip" },
    ],
    tags: ["daily"],
  },
];

export const mockUser = {
  name: "Alex Morgan",
  email: "alex.morgan@mail.com",
  tier: "Iconic",
  memberSince: "2021",
  address: "18 Rue des Archives, Paris",
  points: 1240,
};

export const mockOrders = [
  {
    id: "SO-3912",
    date: "12 May 2026",
    total: 249.0,
    status: "Expedie",
  },
  {
    id: "SO-3887",
    date: "30 Apr 2026",
    total: 129.9,
    status: "Livre",
  },
  {
    id: "SO-3811",
    date: "15 Apr 2026",
    total: 180.0,
    status: "Livre",
  },
];
