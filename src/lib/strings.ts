/**
 * Bilingual UI strings, ported from the design prototype's STR table.
 * Game *content* (questions, words) lives in src/content/games; this is only
 * chrome/copy. Language toggles instantly client-side (see LangContext).
 */
export type Lang = "en" | "fr";

/** Tiny template helper: fmt("Bravo, {name}!", { name: "Léa" }). */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

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
  boardGames: Record<string, string>;
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
  findName: string;
  pickName: string;
  pickNameSub: string;
  search: string;
  noNames: string;
  change: string;
  eventCode: string;
  eventCodePh: string;
  badCode: string;
  nameTaken: string;
  signInProblem: string;
  signIn: string;
  thatsMe: string;
  // unlock schedule
  comingSoonTitle: string;
  comingSoonSub: string; // {date}
  locked: string;
  played: string;
  // result cards
  bravoName: string; // {name}
  nextTime: string;
  nicelyPlayed: string;
  beautifullyDone: string;
  wellTravelled: string;
  flawless: string;
  solvedBang: string;
  placedRight: string;
  captionScoreOnly: string;
  captionScoreFriends: string;
  yesCountry: string; // {c}
  itsCountry: string; // {c}
  // persistence + errors
  dayOfBonus: string; // {pts}
  scoreSaved: string;
  scoreSaving: string;
  scoreSaveFailed: string;
  retry: string;
  rosterFailed: string;
  boardFailed: string;
  shareManual: string;
  // a11y
  backAria: string;
  chateauAlt: string;
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
    boardGames: {
      wordle: "Word",
      trivia: "Trivia",
      "two-truths": "Truths",
      travel: "Travel",
      connections: "Links",
    },
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
    findName: "Find your name",
    pickName: "Find your name",
    pickNameSub: "Tap your name to join. We’ll remember you on this phone.",
    search: "Search your name…",
    noNames: "No match — try your first name.",
    change: "Change",
    eventCode: "Guest code",
    eventCodePh: "From your invitation",
    badCode: "That code isn’t right.",
    nameTaken: "Someone’s already playing as this guest.",
    signInProblem: "Something went wrong. Try again.",
    signIn: "Let’s go",
    thatsMe: "That’s me — let’s go",
    comingSoonTitle: "Almost time",
    comingSoonSub: "The first game opens {date}",
    locked: "Opens {date}",
    played: "Played",
    bravoName: "Bravo, {name}!",
    nextTime: "Next time!",
    nicelyPlayed: "Nicely played.",
    beautifullyDone: "Beautifully done!",
    wellTravelled: "Well travelled!",
    flawless: "Flawless!",
    solvedBang: "Solved!",
    placedRight: "placed right",
    captionScoreOnly: "Just the score — no spoilers.",
    captionScoreFriends: "Spoiler-free — your friends only see the score.",
    yesCountry: "Yes — {c}!",
    itsCountry: "It’s {c}.",
    dayOfBonus: "Played on the day · +{pts}",
    scoreSaved: "Score saved",
    scoreSaving: "Saving your score…",
    scoreSaveFailed: "Your score didn’t save",
    retry: "Try again",
    rosterFailed: "Couldn’t load the guest list.",
    boardFailed: "Couldn’t load the board.",
    shareManual: "Copy didn’t work — press and hold to copy:",
    backAria: "Back",
    chateauAlt: "Watercolour château in Burgundy",
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
    boardGames: {
      wordle: "Mot",
      trivia: "Quiz",
      "two-truths": "Vérités",
      travel: "Voyage",
      connections: "Liens",
    },
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
    findName: "Trouve ton nom",
    pickName: "Trouve ton nom",
    pickNameSub:
      "Touche ton nom pour entrer. On te reconnaîtra sur ce téléphone.",
    search: "Cherche ton nom…",
    noNames: "Aucun résultat — essaie ton prénom.",
    change: "Changer",
    eventCode: "Code invité",
    eventCodePh: "Sur ton invitation",
    badCode: "Ce code n’est pas correct.",
    nameTaken: "Quelqu’un joue déjà avec ce nom.",
    signInProblem: "Une erreur s’est produite. Réessaie.",
    signIn: "C’est parti",
    thatsMe: "C’est moi — c’est parti",
    comingSoonTitle: "Bientôt",
    comingSoonSub: "Le premier jeu ouvre {date}",
    locked: "Ouvre {date}",
    played: "Terminé",
    bravoName: "Bravo, {name} !",
    nextTime: "La prochaine fois !",
    nicelyPlayed: "Beau parcours.",
    beautifullyDone: "Magnifique !",
    wellTravelled: "Globe-trotteur !",
    flawless: "Sans faute !",
    solvedBang: "Terminé !",
    placedRight: "bien placés",
    captionScoreOnly: "Le score — sans spoiler.",
    captionScoreFriends: "Sans spoiler — tes amis ne voient que le score.",
    yesCountry: "Oui — {c} !",
    itsCountry: "C’est {c}.",
    dayOfBonus: "Joué le jour même · +{pts}",
    scoreSaved: "Score enregistré",
    scoreSaving: "Enregistrement…",
    scoreSaveFailed: "Ton score n’a pas été enregistré",
    retry: "Réessayer",
    rosterFailed: "Impossible de charger la liste des invités.",
    boardFailed: "Impossible de charger le classement.",
    shareManual:
      "La copie n’a pas fonctionné — appuie longuement pour copier :",
    backAria: "Retour",
    chateauAlt: "Château bourguignon à l’aquarelle",
  },
};
