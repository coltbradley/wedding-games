/** Colour tokens from the prototype. Mirror of the CSS variables in globals.css. */
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
} as const;

/** Connections group styling (level 0..3), matching the prototype. */
export const CONN_STYLE = [
  { bg: "#E4C97E", fg: "#5A4413", shape: "●" },
  { bg: "#8A9A7B", fg: "#FBF7F0", shape: "▲" },
  { bg: "#294C60", fg: "#FBF7F0", shape: "■" },
  { bg: "#6E2C3E", fg: "#FBF7F0", shape: "◆" },
] as const;
