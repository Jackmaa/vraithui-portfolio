/**
 * VraithUI Theme Configuration
 * Centralized theme definitions for the portfolio
 */

export const THEME_CATEGORIES = {
  POPULAR: 'popular',
  LIGHT: 'light',
  DARK: 'dark',
  LUXURY: 'luxury',
};

export const THEMES = [
  { name: 'nord', category: THEME_CATEGORIES.POPULAR, mode: 'dark', label: 'Nord' },
  { name: 'dracula', category: THEME_CATEGORIES.POPULAR, mode: 'dark', label: 'Dracula' },
  { name: 'cyberpunk', category: THEME_CATEGORIES.POPULAR, mode: 'dark', label: 'Cyberpunk' },
  { name: 'luxury', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Luxury' },
  { name: 'brand', category: THEME_CATEGORIES.LIGHT, mode: 'light', label: 'Brand Light' },
  { name: 'brand-dark', category: THEME_CATEGORIES.DARK, mode: 'dark', label: 'Brand Dark' },
  { name: 'neutral', category: THEME_CATEGORIES.LIGHT, mode: 'light', label: 'Neutral' },
  { name: 'velvet-charcoal', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Velvet Charcoal' },
  { name: 'persian-plum', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Persian Plum' },
  { name: 'bordeaux-silk', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Bordeaux Silk' },
  { name: 'regal-gold', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Regal Gold' },
  { name: 'velvet-indigo', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Velvet Indigo' },
  { name: 'deep-jungle', category: THEME_CATEGORIES.DARK, mode: 'dark', label: 'Deep Jungle' },
  { name: 'crimson-peach', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Crimson Peach' },
  { name: 'imperial-blue', category: THEME_CATEGORIES.DARK, mode: 'dark', label: 'Imperial Blue' },
  { name: 'mystic-jade', category: THEME_CATEGORIES.LIGHT, mode: 'light', label: 'Mystic Jade' },
  { name: 'lush-merlot', category: THEME_CATEGORIES.LUXURY, mode: 'dark', label: 'Lush Merlot' },
  { name: 'oxford-maize', category: THEME_CATEGORIES.DARK, mode: 'dark', label: 'Oxford Maize' },
  { name: 'rich-black', category: THEME_CATEGORIES.DARK, mode: 'dark', label: 'Rich Black' },
];

// Default theme
export const DEFAULT_THEME = 'cyberpunk';

// Helper functions
export const getThemeNames = () => THEMES.map(t => t.name);

export const getThemeByName = (name) => THEMES.find(t => t.name === name);

export const getThemesByCategory = (category) => THEMES.filter(t => t.category === category);

export const isValidTheme = (name) => THEMES.some(t => t.name === name);

export const getThemesByMode = (mode) => THEMES.filter(t => t.mode === mode);
