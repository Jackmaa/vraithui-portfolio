/**
 * VraithUI Command Registry
 * Centralized command definitions for console and palette
 */

export const COMMAND_CATEGORIES = {
  NAVIGATION: 'navigation',
  THEME: 'theme',
  UTILITY: 'utility',
  FUN: 'fun',
  SYSTEM: 'system',
  EASTER_EGG: 'easter_egg',
};

/**
 * Command Definition Structure:
 * - name: Display name for palette/autocomplete
 * - pattern: RegExp to match command input
 * - category: Command category
 * - description: Short description
 * - requiresConsole: Auto-open console for output
 * - handler: Will be set in commandStore (needs access to stores)
 */
export const COMMAND_DEFINITIONS = [
  // === NAVIGATION ===
  {
    name: 'open home',
    pattern: /^open\s+home$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open home section',
    requiresConsole: false,
    section: 'home',
  },
  {
    name: 'open about',
    pattern: /^open\s+about$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open about section',
    requiresConsole: false,
    section: 'about',
  },
  {
    name: 'open projects',
    pattern: /^open\s+projects$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open projects section',
    requiresConsole: false,
    section: 'projects',
  },
  {
    name: 'open github',
    pattern: /^open\s+github$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open GitHub section',
    requiresConsole: false,
    section: 'github',
  },
  {
    name: 'open skills',
    pattern: /^open\s+skills$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open skills section',
    requiresConsole: false,
    section: 'skills',
  },
  {
    name: 'open blog',
    pattern: /^open\s+blog$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open blog section',
    requiresConsole: false,
    section: 'blog',
  },
  {
    name: 'open resume',
    pattern: /^open\s+resume$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open resume section',
    requiresConsole: false,
    section: 'resume',
  },
  {
    name: 'open contact',
    pattern: /^open\s+contact$/i,
    category: COMMAND_CATEGORIES.NAVIGATION,
    description: 'Open contact section',
    requiresConsole: false,
    section: 'contact',
  },

  // === THEME ===
  {
    name: 'theme list',
    pattern: /^theme\s+list$/i,
    category: COMMAND_CATEGORIES.THEME,
    description: 'List all available themes',
    requiresConsole: true,
  },
  {
    name: 'theme set',
    pattern: /^theme\s+set\s+([a-z0-9\-]+)$/i,
    category: COMMAND_CATEGORIES.THEME,
    description: 'Set theme: theme set <name>',
    requiresConsole: false,
    hasArgs: true,
  },
  {
    name: 'theme random',
    pattern: /^theme\s+random$/i,
    category: COMMAND_CATEGORIES.THEME,
    description: 'Set a random theme',
    requiresConsole: false,
  },

  // === UTILITY ===
  {
    name: 'help',
    pattern: /^help$/i,
    category: COMMAND_CATEGORIES.UTILITY,
    description: 'Show all available commands',
    requiresConsole: true,
  },
  {
    name: 'clear',
    pattern: /^(clear|cls)$/i,
    category: COMMAND_CATEGORIES.UTILITY,
    description: 'Clear console output',
    requiresConsole: false,
  },
  {
    name: 'exit',
    pattern: /^(exit|quit)$/i,
    category: COMMAND_CATEGORIES.UTILITY,
    description: 'Close the console',
    requiresConsole: false,
  },
  {
    name: 'whoami',
    pattern: /^whoami$/i,
    category: COMMAND_CATEGORIES.SYSTEM,
    description: 'Display current user',
    requiresConsole: true,
  },
  {
    name: 'pwd',
    pattern: /^pwd$/i,
    category: COMMAND_CATEGORIES.SYSTEM,
    description: 'Print working directory',
    requiresConsole: true,
  },
  {
    name: 'date',
    pattern: /^date$/i,
    category: COMMAND_CATEGORIES.SYSTEM,
    description: 'Display current date/time',
    requiresConsole: true,
  },
  {
    name: 'version',
    pattern: /^(version|ver)$/i,
    category: COMMAND_CATEGORIES.SYSTEM,
    description: 'Show portfolio version',
    requiresConsole: true,
  },

  // === UTILITY (language & manual) ===
  {
    name: 'lang toggle',
    pattern: /^lang\s+toggle$/i,
    category: COMMAND_CATEGORIES.UTILITY,
    description: 'Toggle language (EN/FR)',
    requiresConsole: true,
  },
  {
    name: 'lang set',
    pattern: /^lang\s+(en|fr)$/i,
    category: COMMAND_CATEGORIES.UTILITY,
    description: 'Set language: lang en | lang fr',
    requiresConsole: true,
    hasArgs: true,
  },
  {
    name: 'man',
    pattern: /^man\s+(\S+.*)$/i,
    category: COMMAND_CATEGORIES.UTILITY,
    description: 'Show manual for a command',
    requiresConsole: true,
    hasArgs: true,
  },

  // === FUN ===
  {
    name: 'ascii vraith',
    pattern: /^ascii(\s+vraith)?$/i,
    category: COMMAND_CATEGORIES.FUN,
    description: 'Show Vraith ASCII art',
    requiresConsole: true,
  },
  {
    name: 'roll',
    pattern: /^roll(\s+d(\d+))?$/i,
    category: COMMAND_CATEGORIES.FUN,
    description: 'Roll dice: roll or roll d20',
    requiresConsole: true,
    hasArgs: true,
  },
  // === EASTER EGGS ===
  // NOTE: sudo rm -rf / MUST come before generic sudo (Array.find returns first match)
  {
    name: 'sudo rm -rf /',
    pattern: /^sudo\s+rm\s+-rf\s+\/$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Nice try',
    requiresConsole: true,
  },
  {
    name: 'sudo',
    pattern: /^sudo(\s+.*)?$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Permission denied',
    requiresConsole: true,
  },
  {
    name: 'vim',
    pattern: /^(n?vim)$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'You\'re already here',
    requiresConsole: true,
  },
  {
    name: 'emacs',
    pattern: /^emacs$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'We don\'t do that here',
    requiresConsole: true,
  },
  {
    name: ':q',
    pattern: /^:(q!?|wq!?|x)$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'No escape',
    requiresConsole: true,
  },
  {
    name: 'neofetch',
    pattern: /^neofetch$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'System info',
    requiresConsole: true,
  },
  {
    name: 'matrix',
    pattern: /^(c?matrix)$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Enter the Matrix',
    requiresConsole: false,
  },
  {
    name: 'cowsay',
    pattern: /^cowsay\s+(.+)$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Moo',
    requiresConsole: true,
    hasArgs: true,
  },
  {
    name: 'fortune',
    pattern: /^fortune$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Random wisdom',
    requiresConsole: true,
  },
  {
    name: 'history',
    pattern: /^history$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Show command history',
    requiresConsole: true,
  },
  {
    name: 'uptime',
    pattern: /^uptime$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Session uptime',
    requiresConsole: true,
  },
  {
    name: 'hack',
    pattern: /^hack$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Hack the mainframe',
    requiresConsole: true,
  },
  {
    name: 'barrel roll',
    pattern: /^(barrel\s+roll|do\s+a\s+barrel\s+roll)$/i,
    category: COMMAND_CATEGORIES.EASTER_EGG,
    description: 'Do a barrel roll!',
    requiresConsole: false,
  },
];

/**
 * Get commands by category
 */
export function getCommandsByCategory(category) {
  return COMMAND_DEFINITIONS.filter(cmd => cmd.category === category);
}

/**
 * Get all command names for autocomplete
 */
export function getAllCommandNames() {
  return COMMAND_DEFINITIONS.map(cmd => cmd.name);
}

/**
 * Find command definition by input string
 */
export function findCommandByInput(input) {
  const trimmed = input.trim();
  return COMMAND_DEFINITIONS.find(cmd => cmd.pattern.test(trimmed));
}

/**
 * Parse command and extract arguments
 */
export function parseCommand(input) {
  const trimmed = input.trim();
  const definition = findCommandByInput(trimmed);

  if (!definition) {
    return null;
  }

  const match = trimmed.match(definition.pattern);
  const args = match ? match.slice(1).filter(Boolean) : [];

  return {
    definition,
    args,
    input: trimmed,
  };
}
