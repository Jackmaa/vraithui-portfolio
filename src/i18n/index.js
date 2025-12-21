import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import en from './locales/en.json';

const STORAGE_KEY = 'vraithui-locale';
const SUPPORTED_LOCALES = ['fr', 'en'];
const DEFAULT_LOCALE = 'fr';

// Detect browser language
function getBrowserLocale() {
  const navigatorLocale = navigator.language || navigator.languages?.[0];
  if (!navigatorLocale) return DEFAULT_LOCALE;

  const trimmedLocale = navigatorLocale.trim().split('-')[0];
  return SUPPORTED_LOCALES.includes(trimmedLocale) ? trimmedLocale : DEFAULT_LOCALE;
}

// Load from localStorage or detect
function getInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) {
      return saved;
    }
  } catch (error) {
    console.error('[i18n] Failed to load locale from localStorage:', error);
  }

  return getBrowserLocale();
}

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    fr,
    en
  },
  globalInjection: true, // Enable $t in templates
  missingWarn: false, // Disable missing translation warnings in dev
  fallbackWarn: false
});

export default i18n;
