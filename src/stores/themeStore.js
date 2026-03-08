import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  THEMES,
  DEFAULT_THEME,
  getThemeNames,
  getThemeByName,
  isValidTheme,
  getThemesByCategory,
  getThemesByMode,
  THEME_CATEGORIES
} from '@/config/themes';

const STORAGE_KEY = 'vraithui-theme';

export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref(DEFAULT_THEME);
  const isInitialized = ref(false);

  // Getters
  const theme = computed(() => currentTheme.value);
  const themeData = computed(() => getThemeByName(currentTheme.value));
  const isDarkMode = computed(() => themeData.value?.mode === 'dark');
  const themeLabel = computed(() => themeData.value?.label || currentTheme.value);
  const themeCategory = computed(() => themeData.value?.category);

  const allThemes = computed(() => THEMES);
  const themeNames = computed(() => getThemeNames());

  // Group themes by category for better UX
  const themesByCategory = computed(() => {
    const grouped = {};
    Object.values(THEME_CATEGORIES).forEach(category => {
      grouped[category] = getThemesByCategory(category);
    });
    return grouped;
  });

  // Actions
  function setTheme(themeName) {
    if (!isValidTheme(themeName)) {
      console.warn(`[ThemeStore] Invalid theme: ${themeName}`);
      return false;
    }

    currentTheme.value = themeName;
    applyTheme(themeName);
    saveToStorage(themeName);

    return true;
  }

  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
  }

  function saveToStorage(themeName) {
    try {
      localStorage.setItem(STORAGE_KEY, themeName);
    } catch (error) {
      console.error('[ThemeStore] Failed to save theme to localStorage:', error);
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isValidTheme(saved)) {
        return saved;
      }
    } catch (error) {
      console.error('[ThemeStore] Failed to load theme from localStorage:', error);
    }
    return DEFAULT_THEME;
  }

  function initialize() {
    if (isInitialized.value) return;

    const savedTheme = loadFromStorage();
    currentTheme.value = savedTheme;
    applyTheme(savedTheme);
    isInitialized.value = true;

    console.log(`[ThemeStore] Initialized with theme: ${savedTheme}`);
  }

  function toggleMode() {
    const current = themeData.value;
    if (!current) return false;

    // Find a theme with opposite mode
    const targetMode = current.mode === 'dark' ? 'light' : 'dark';
    const alternativeThemes = getThemesByMode(targetMode);

    if (alternativeThemes.length > 0) {
      setTheme(alternativeThemes[0].name);
      return true;
    }

    return false;
  }

  function getRandomTheme() {
    const visible = THEMES.filter(t => !t.hidden);
    return visible[Math.floor(Math.random() * visible.length)].name;
  }

  function setRandomTheme() {
    const randomTheme = getRandomTheme();
    setTheme(randomTheme);
  }

  return {
    // State
    currentTheme,

    // Getters
    theme,
    themeData,
    isDarkMode,
    themeLabel,
    themeCategory,
    allThemes,
    themeNames,
    themesByCategory,

    // Actions
    setTheme,
    initialize,
    toggleMode,
    setRandomTheme,
    getRandomTheme,
  };
});
