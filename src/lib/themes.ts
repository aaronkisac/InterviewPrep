/** Preview swatches: [background, primary, accent] */
export const COLOR_THEMES = [
  {
    id: "vintage-paper",
    label: "Vintage Paper",
    swatches: ["#f5f1e6", "#a67c52", "#d4c8aa"],
    swatchesDark: ["#2d2621", "#c0a080", "#59493e"],
  },
  {
    id: "golden-hour",
    label: "Golden Hour",
    swatches: ["#ffffff", "#f59e0b", "#fffbeb"],
    swatchesDark: ["#171717", "#f59e0b", "#92400e"],
  },
  {
    id: "sage-meadow",
    label: "Sage Meadow",
    swatches: ["#e4d7b0", "#8d9d4f", "#dbc894"],
    swatchesDark: ["#3a3529", "#8a9f7b", "#a18f5c"],
  },
  {
    id: "catppuccin",
    label: "Catppuccin",
    swatches: ["#eff1f5", "#8839ef", "#04a5e5"],
    swatchesDark: ["#181825", "#cba6f7", "#89dceb"],
  },
  {
    id: "warm-minimal",
    label: "Warm Minimal",
    swatches: ["#f9f9f9", "#644a40", "#ffdfb5"],
    swatchesDark: ["#111111", "#ffe0c2", "#393028"],
  },
] as const;

export type ColorThemeId = (typeof COLOR_THEMES)[number]["id"];

export const DEFAULT_COLOR_THEME: ColorThemeId = "vintage-paper";
export const COLOR_THEME_STORAGE_KEY = "color-theme";
