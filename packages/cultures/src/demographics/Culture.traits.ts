export interface Characteristic {
  name: string;
  description: string;
}

export interface Trait extends Characteristic {
  restrictions?: string[];
}
export interface PowerSource extends Characteristic {}

export interface Value extends Characteristic {}

// based on https://humanparts.medium.com/the-mtg-color-wheel-c9700a7cf36d
export const values = [
  {
    name: "Peace",
    description: "Peace Through Order",
  },
  {
    name: "Harmony",
    description: "through acceptance",
  },
  {
    name: "Freedom",
    description: "through action",
  },
  {
    name: "Pleasure",
    description: "through ruthlessness",
  },
  {
    name: "Perfection",
    description: "through knowledge",
  },
];

export const sourceOfPower = [
  {
    name: "Democracy",
    description:
      "Power is shared directly or indirectly by a wider enfranchised community",
  },
  {
    name: "Autocracy",
    description:
      "Power is concentrated in wholly in the hands of a single individual",
  },
  {
    name: "Oligarchy",
    description: "Power rests in the hands a few distinguished patricians",
  },
];

export const KingdomName = (power: PowerSource, traits: Trait[]) => {};

// these traits will have an impact on the ranks of civil positions and other things
export const traits: Trait[] = [
  {
    name: "Monumentalists",
    description:
      "This culture values creating vast structures. They love to express their power over nature",
    restrictions: ["Naturalists"],
  },
  {
    name: "Way of the Warrior", //chivalry, bushido -> samurai and knights
    description:
      "This culture values martial prowess, and those who are trained in special forms of warfare are given special rights. Warrior behavior is venerated and codified",
  },
  {
    name: "Ruler Cult",
    description:
      "This political leaders of this culture are venerated as divines",
  },
  {
    name: "Naturalists",
    description:
      "This culture emphasizes harmony with the ways of nature, at least in their view.",
  },
  {
    name: "Feudalism",
    description:
      "This culture organizes society in a hierarchy of oaths, obligations, and personal relationships between lords, vassals, and fiefs",
  },
  {
    name: "Imperial Examinations", // https://en.wikipedia.org/wiki/Mandarin_(bureaucrat)
    description:
      "Ministers and civil servants are the founders and core of this culture's gentry and political life",
  },
  {
    name: "Corvee Labor", // ancient egypt
    description:
      "The state has full rights over where and how its citizens live and work. It has innovated vast institutions to exercise this power.",
  },
  {
    name: "Thalassocracy", // pheonecia, venice, genoa, austronesia
    description:
      "This culture is concerned with crucial sea-based trade links and colonization of coastal ports to secure naval supremacy",
  },
  {
    name: "Steppe Nomads",
    description:
      "The members of this culture have no fixed abode, and emphasize mounted life. Warfare is for displacement, not conquest.",
    restrictions: ["Thalassocracy"],
  },
  {
    name: "Stratified Society",
    description: "The culture is divided into strict roles and castes",
  },
  {
    name: "Merchant Guilds",
    description:
      "Powerful trade organizations ply for control of the lives and government of this culture",
  },
  {
    name: "Reavers", // Iron born
    description:
      "This culture respects those who can take what they will by force, and pay the iron price.",
  },
  {
    name: "Mageocracy",
    description:
      "Powerful wizards and mages helm this society. Magic, its study, and use is respected, those who cannot manipulate magicks may be looked down upon.",
  },
  {
    name: "Knives in the Senate",
    description:
      "Constant intrigue, backstabbing, and palace schemes are the norm. In the game of thrones, you live, or you die.",
  },
  {
    name: "Venerated Priesthood",
    description:
      "Pious leaders guide the society in their infinite and divine wisdom from their temples",
  },
  {
    name: "Kritarchy",
    description:
      "Judges and adjudicators control the society from their benches and send powerful magistrates across the countryside to enforce their rulings",
  },
  {
    name: "Dolmen Raisers",
    description:
      "Mystical import is placed on curious neolithic tombs that are still raised by these peoples, a practice dating back since the world was young",
  },
  {
    name: "Stone Circles and Runestones",
    description:
      "Monumental stone rings and stele are placed amongst in places where fey energies meet",
  },
  {
    name: "Pyramid Raisers",
    description:
      "Great architectural triumphs of geometry and geomancy dot the skylines of the landscape",
  },
  {
    name: "Ancestor Veneration",
    description:
      "These people petition their ancestors in worship in order to gain favor in the eyes of heaven",
  },
  {
    name: "City State",
    description:
      "The citoyens of this burgh are justified in the pride of their hometown, the city's self-reliance is second only to its splendor.",
  },
  {
    name: "Refuge",
    description:
      "This society is known far and wide as a free and just haven for exiled princes and destitute diasporas",
  },
  {
    name: "Master Artificers",
    description:
      "The incredible arcane automatons or technological gadgets that are made here a known across the world for their fineness and quality",
  },
];

export interface Wonders extends Characteristic {}

export const wonders: Wonders[] = [
  {
    name: "Skyshipwrights",
    description:
      "Rare and wonderous skyships and their arcane engineering are known only to a select few master technomancers of this society",
  },
  {
    name: "Floating Cities",
    description:
      "This society is known for cities that soar amongst the clouds",
  },
  {
    name: "Great Library",
    description: "A grand athenaeum filled with the knowledge of the world",
  },
];
