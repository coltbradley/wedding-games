/**
 * Bilingual UI strings, ported from the design prototype's STR table.
 * Game *content* (questions, words) lives in src/content/games; this is only
 * chrome/copy. Language toggles instantly client-side (see LangContext).
 */
export type Lang = "en" | "fr";

export interface Strings {
  date: string;
  tagline: string;
  ido: string;
  email: string;
  emailPh: string;
  noPw: string;
  emailBad: string;
  hello: string;
  todays: string;
  dayWord: string;
  theDays: string;
  wordleTitle: string;
  wordleSub: string;
  play: string;
  resume: string;
  hintLabel: string;
  seeCard: string;
  backToGames: string;
  spoilerFree: string;
  won: string[];
  lost: string;
  solvedIn: string;
  playable: string;
  openOn: string;
  copy: string;
  copied: string;
  gamesTab: string;
  boardTab: string;
  boardTitle: string;
  today: string;
  allTime: string;
  pts: string;
  you: string;
  noScoreYet: string;
  next: string;
  finish: string;
  questionOf: [string, string];
  whichLie: string;
  theLie: string;
  correctMark: string;
  yourGuess: string;
  gotIt: string;
  loadingWord: string;
  france: string;
  srilanka: string;
  travelAsk: string;
  connHint: string;
  submit: string;
  shuffle: string;
  oneAway: string;
  mistakesWord: string;
  viewBoard: string;
  rightWord: string;
}

export const STR: Record<Lang, Strings> = {
  en: {
    date: "Wednesday · August 5 · Burgundy",
    tagline: "Five little games — one for each day before we say",
    ido: "“I do.”",
    email: "Your email",
    emailPh: "you@example.com",
    noPw: "No password. We’ll remember you on this phone.",
    emailBad: "That email doesn’t look right.",
    hello: "Bonjour",
    todays: "Today’s game",
    dayWord: "Day",
    theDays: "The five days",
    wordleTitle: "The word of the day",
    wordleSub: "5 letters · 1 try a day",
    play: "Play today",
    resume: "See your result",
    hintLabel: "Hint",
    seeCard: "See your card",
    backToGames: "Back to games",
    spoilerFree: "Spoiler-free — your friends only see the colours.",
    won: ["Bravo!", "Lovely.", "You’ve got it."],
    lost: "So close — the word was",
    solvedIn: "Solved in",
    playable: "Play now",
    openOn: "Opens",
    copy: "Copy result",
    copied: "Copied!",
    gamesTab: "Games",
    boardTab: "Board",
    boardTitle: "Leaderboard",
    today: "Today",
    allTime: "All-time",
    pts: "pts",
    you: "You",
    noScoreYet: "Play today’s game to join the board",
    next: "Next",
    finish: "See your card",
    questionOf: ["Question", "of"],
    whichLie: "Which one is the lie?",
    theLie: "The lie",
    correctMark: "True",
    yourGuess: "Your guess",
    gotIt: "You got it!",
    loadingWord: "A moment…",
    france: "France",
    srilanka: "Sri Lanka",
    travelAsk: "Where would you find this?",
    connHint: "Find four groups of four",
    submit: "Submit",
    shuffle: "Shuffle",
    oneAway: "One away…",
    mistakesWord: "Guesses",
    viewBoard: "View leaderboard",
    rightWord: "right",
  },
  fr: {
    date: "Mercredi · 5 août · Bourgogne",
    tagline: "Cinq petits jeux — un par jour avant le grand",
    ido: "« oui ».",
    email: "Votre e-mail",
    emailPh: "vous@exemple.com",
    noPw: "Pas de mot de passe. On vous reconnaîtra sur ce téléphone.",
    emailBad: "Cet e-mail semble incorrect.",
    hello: "Bonjour",
    todays: "Le jeu du jour",
    dayWord: "Jour",
    theDays: "Les cinq jours",
    wordleTitle: "Le mot du jour",
    wordleSub: "5 lettres · 1 essai par jour",
    play: "Jouer aujourd’hui",
    resume: "Voir le résultat",
    hintLabel: "Indice",
    seeCard: "Voir ta carte",
    backToGames: "Retour aux jeux",
    spoilerFree: "Sans spoiler — tes amis ne voient que les couleurs.",
    won: ["Bravo !", "Joli.", "Tu l’as !"],
    lost: "Si près — le mot était",
    solvedIn: "Résolu en",
    playable: "À jouer",
    openOn: "Ouvre",
    copy: "Copier le résultat",
    copied: "Copié !",
    gamesTab: "Jeux",
    boardTab: "Classement",
    boardTitle: "Classement",
    today: "Aujourd’hui",
    allTime: "Au total",
    pts: "pts",
    you: "Toi",
    noScoreYet: "Joue au jeu du jour pour entrer au classement",
    next: "Suivant",
    finish: "Voir ta carte",
    questionOf: ["Question", "sur"],
    whichLie: "Lequel est le mensonge ?",
    theLie: "Le mensonge",
    correctMark: "Vrai",
    yourGuess: "Ton choix",
    gotIt: "Bien vu !",
    loadingWord: "Un instant…",
    france: "France",
    srilanka: "Sri Lanka",
    travelAsk: "Où trouve-t-on cela ?",
    connHint: "Forme quatre groupes de quatre",
    submit: "Valider",
    shuffle: "Mélanger",
    oneAway: "À un près…",
    mistakesWord: "Essais",
    viewBoard: "Voir le classement",
    rightWord: "bonnes",
  },
};
