import type { Config } from "tailwindcss";

// Mobile-first. The visual system (colors, fonts) gets filled in once
// Colt & Valentine send brand notes — see docs/DECISIONS.md.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
