/**
 * Design tokens — the single place to retune the palette. Components pull from
 * here (or the matching CSS variables in globals.css); avoid hardcoding hexes
 * in screens so a colour change stays a one-file edit.
 */
export const C = {
  paper: "#FBF7F0",
  bg: "#EFE7DA",
  surface: "#E7DCCB",
  wine: "#6E2C3E",
  taupe: "#A8927A",
  sage: "#8A9A7B",
  ink: "#2A2D32",
  gold: "#D8B871",
  blue: "#294C60",
  cream: "#FBF7F0",
  // supporting neutrals (previously scattered as raw hexes)
  stone: "#A8A49A", // muted captions, empty states
  slate: "#6E6E6A", // secondary body text
  sand: "#E7DAC9", // neutral chips/avatars
  faded: "#B4ABA0", // inactive tab icons
  error: "#C0584A",
} as const;

/** Recurring radii, so the shape language stays consistent. */
export const R = {
  card: 16,
  row: 14,
  tile: 11,
  pill: 999,
} as const;

/**
 * Wordle square colours (tile + keyboard + result grid). Text colours are
 * chosen for outdoor-sunlight contrast: dark text on the light gold/greige,
 * white only on the deeper sage.
 */
export const SQ = {
  correct: { bg: "#7E9070", fg: "#FFFFFF" },
  present: { bg: "#D8B871", fg: "#5A4413" },
  absent: { bg: "#C4BBA9", fg: "#453F35" },
  empty: { bg: "#FFFFFF", fg: "#2A2D32" },
} as const;

/** Connections group styling (level 0..3), matching the prototype. */
export const CONN_STYLE = [
  { bg: "#E4C97E", fg: "#5A4413", shape: "●" },
  { bg: "#8A9A7B", fg: "#FBF7F0", shape: "▲" },
  { bg: "#294C60", fg: "#FBF7F0", shape: "■" },
  { bg: "#6E2C3E", fg: "#FBF7F0", shape: "◆" },
] as const;
