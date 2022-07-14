import { Orthography } from "./Language";

export const defaultOrtho: Orthography["orth"] = {
  ʃ: "sh",
  ʒ: "zh",
  ʧ: "ch",
  ʤ: "j",
  ŋ: "ng",
  j: "y",
  x: "kh",
  ɣ: "gh",
  ʔ: "‘",
  A: "á",
  E: "é",
  I: "í",
  O: "ó",
  U: "ú",
};

export const consonantOrthoSets = [
  {
    name: "Default",
    orth: {},
  },
  {
    name: "Slavic",
    orth: {
      ʃ: "š",
      ʒ: "ž",
      ʧ: "č",
      ʤ: "ǧ",
      j: "j",
    },
  },
  {
    name: "German",
    orth: {
      ʃ: "sch",
      ʒ: "zh",
      ʧ: "tsch",
      ʤ: "dz",
      j: "j",
      x: "ch",
    },
  },
  {
    name: "French",
    orth: {
      ʃ: "ch",
      ʒ: "j",
      ʧ: "tch",
      ʤ: "dj",
      x: "kh",
    },
  },
  {
    name: "Chinese (pinyin)",
    orth: {
      ʃ: "x",
      ʧ: "q",
      ʤ: "j",
    },
  },
];

export const vowelOrthoSets = [
  {
    name: "Ácutes",
    orth: {},
  },
  {
    name: "Ümlauts",
    orth: {
      A: "ä",
      E: "ë",
      I: "ï",
      O: "ö",
      U: "ü",
    },
  },
  {
    name: "Welsh",
    orth: {
      A: "â",
      E: "ê",
      I: "y",
      O: "ô",
      U: "w",
    },
  },
  {
    name: "Diphthongs",
    orth: {
      A: "au",
      E: "ei",
      I: "ie",
      O: "ou",
      U: "oo",
    },
  },
  {
    name: "Doubles",
    orth: {
      A: "aa",
      E: "ee",
      I: "ii",
      O: "oo",
      U: "uu",
    },
  },
];

export const consonantSets = [
  // {
  //   name: "Minimal",
  //   C: "ptkmnls",
  // },
  {
    name: "English-ish",
    C: "ptkbdgmnlrsʃzʒʧ",
  },
  // {
  //   name: "Pirahã (very simple)",
  //   C: "ptkmnh",
  // },
  // {
  //   name: "Hawaiian-ish",
  //   C: "hklmnpwʔ",
  // },
  // {
  //   name: "Greenlandic-ish",
  //   C: "ptkqvsgrmnŋlj",
  // },
  // {
  //   name: "Arabic-ish",
  //   C: "tksʃdbqɣxmnlrwj",
  // },
  // {
  //   name: "Arabic-lite",
  //   C: "tkdgmnsʃ",
  // },
  {
    name: "English-lite",
    C: "ptkbdgmnszʒʧhjw",
  },
];

export const sibilantSets = [
  {
    name: "Just s",
    S: "s",
  },
  {
    name: "s ʃ",
    S: "sʃ",
  },
  {
    name: "s ʃ f",
    S: "sʃf",
  },
];

export const liquidSets = [
  {
    name: "r l",
    L: "rl",
  },
  {
    name: "Just r",
    L: "r",
  },
  {
    name: "Just l",
    L: "l",
  },
  {
    name: "w j",
    L: "wj",
  },
  {
    name: "r l w j",
    L: "rlwj",
  },
];

export const fricativeSets = [
  {
    name: "m n",
    F: "mn",
  },
  {
    name: "s k",
    F: "sk",
  },
  {
    name: "m n ŋ",
    F: "mnŋ",
  },
  {
    name: "s ʃ z ʒ",
    F: "sʃzʒ",
  },
];

export const vowelSets = [
  {
    name: "Standard 5-vowel",
    V: "aeiou",
  },
  {
    name: "3-vowel a i u",
    V: "aiu",
  },
  {
    name: "Extra A E I",
    V: "aeiouAEI",
  },
  {
    name: "Extra U",
    V: "aeiouU",
  },
  {
    name: "5-vowel a i u A I",
    V: "aiuAI",
  },
  {
    name: "3-vowel e o u",
    V: "eou",
  },
  {
    name: "Extra A O U",
    V: "aeiouAOU",
  },
];

export const restrictionSets = [
  {
    name: "None",
    res: [],
  },
  {
    name: "Double sounds",
    res: [/(.)\1/],
  },
  {
    name: "Doubles and hard clusters",
    res: [/[sʃf][sʃ]/, /(.)\1/, /[rl][rl]/],
  },
];
