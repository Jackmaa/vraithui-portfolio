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
