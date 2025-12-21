import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const STORAGE_KEY = 'vraithui-locale';
const SUPPORTED_LOCALES = ['fr', 'en'];
const DEFAULT_LOCALE = 'fr';

export const LANGUAGE_CONFIG = {
  fr: {
    code: 'fr',
    name: 'Français',
    label: 'FR'
  },
  en: {
    code: 'en',
    name: 'English',
    label: 'EN'
  }
};

export const useLanguageStore = defineStore('language', () => {
  // Get i18n instance
  const { locale } = useI18n();

  // State
  const currentLocale = ref(DEFAULT_LOCALE);
  const isInitialized = ref(false);

  // Getters
  const languageConfig = computed(() => LANGUAGE_CONFIG[currentLocale.value]);
  const availableLanguages = computed(() => Object.values(LANGUAGE_CONFIG));
  const otherLanguage = computed(() => {
    return currentLocale.value === 'fr' ? LANGUAGE_CONFIG.en : LANGUAGE_CONFIG.fr;
  });

  // Actions
  function setLocale(newLocale) {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.warn(`[LanguageStore] Unsupported locale: ${newLocale}`);
      return false;
    }

    currentLocale.value = newLocale;
    locale.value = newLocale; // Update vue-i18n
    saveToStorage(newLocale);
    applyHtmlLang(newLocale);

    console.log(`[LanguageStore] Locale changed to: ${newLocale}`);
    return true;
  }

  function toggleLocale() {
    const newLocale = currentLocale.value === 'fr' ? 'en' : 'fr';
    return setLocale(newLocale);
  }

  function applyHtmlLang(locale) {
    document.documentElement.setAttribute('lang', locale);
  }

  function saveToStorage(locale) {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (error) {
      console.error('[LanguageStore] Failed to save locale to localStorage:', error);
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LOCALES.includes(saved)) {
        return saved;
      }
    } catch (error) {
      console.error('[LanguageStore] Failed to load locale from localStorage:', error);
    }
    return null;
  }

  function detectBrowserLocale() {
    const navigatorLocale = navigator.language || navigator.languages?.[0];
    if (!navigatorLocale) return DEFAULT_LOCALE;

    const trimmedLocale = navigatorLocale.trim().split('-')[0];
    return SUPPORTED_LOCALES.includes(trimmedLocale) ? trimmedLocale : DEFAULT_LOCALE;
  }

  function initialize() {
    if (isInitialized.value) return;

    // Priority: localStorage > browser detection > default
    const savedLocale = loadFromStorage();
    const initialLocale = savedLocale || detectBrowserLocale();

    currentLocale.value = initialLocale;
    locale.value = initialLocale;
    applyHtmlLang(initialLocale);
    isInitialized.value = true;

    console.log(`[LanguageStore] Initialized with locale: ${initialLocale} (saved: ${!!savedLocale})`);
  }

  return {
    // State
    currentLocale,

    // Getters
    languageConfig,
    availableLanguages,
    otherLanguage,

    // Actions
    setLocale,
    toggleLocale,
    initialize,
  };
});
