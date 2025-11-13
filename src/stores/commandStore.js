import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  COMMAND_DEFINITIONS,
  COMMAND_CATEGORIES,
  parseCommand,
  getCommandsByCategory,
} from '@/config/commands';
import { useThemeStore } from './themeStore';

export const useCommandStore = defineStore('command', () => {
  // State
  const consoleOutput = ref([]);
  const commandHistory = ref([]);
  const historyIndex = ref(-1);

  // Getters
  const allCommands = computed(() => COMMAND_DEFINITIONS);
  const commandsByCategory = computed(() => {
    const grouped = {};
    Object.values(COMMAND_CATEGORIES).forEach(category => {
      grouped[category] = getCommandsByCategory(category);
    });
    return grouped;
  });

  // Command handlers
  const handlers = {
    // === NAVIGATION ===
    'open': (args, definition) => {
      const section = definition.section;
      return {
        success: true,
        action: 'navigate',
        section,
        output: [`✓ Opening: ${section}`],
      };
    },

    // === THEME ===
    'theme': (args, definition) => {
      // Handle both 'theme list' and 'theme set'
      if (definition.name === 'theme list') {
        return handlers._themeList();
      } else if (definition.name === 'theme set') {
        return handlers._themeSet(args);
      }
    },

    _themeList: () => {
      const themeStore = useThemeStore();
      const output = [];

      output.push(`Available themes (${themeStore.allThemes.length} total):`);
      output.push('─────────────────────────────────────');

      const categories = {
        popular: 'Popular themes:',
        light: 'Light themes:',
        dark: 'Dark themes:',
        luxury: 'Luxury themes:',
      };

      Object.entries(themeStore.themesByCategory).forEach(([category, themes]) => {
        if (themes.length > 0) {
          output.push(categories[category] || `${category}:`);
          themes.forEach(theme => {
            const current = theme.name === themeStore.theme ? ' (current)' : '';
            output.push(`  • ${theme.name.padEnd(18)} ${theme.label}${current}`);
          });
          output.push('');
        }
      });

      output.push('─────────────────────────────────────');
      output.push(`Total: ${themeStore.allThemes.length} themes`);
      output.push(`Current: ${themeStore.theme}`);
      output.push('');
      output.push('Usage: theme set <name>');

      return {
        success: true,
        output,
      };
    },

    _themeSet: (args) => {
      const themeStore = useThemeStore();
      const themeName = args[0];
      const success = themeStore.setTheme(themeName);

      if (success) {
        const themeData = themeStore.themeData;
        const output = [
          `✓ Theme switched to: ${themeName}`,
          `  ${themeData.label} (${themeData.mode} mode)`,
        ];

        // Custom messages for specific themes
        if (themeName === 'nord') {
          output.push('  🌌 Welcome to the Arctic - enjoy the harmony!');
        } else if (themeName === 'dracula') {
          output.push('  🧛 Welcome to the night - embrace the darkness!');
        } else if (themeName === 'cyberpunk') {
          output.push('  ⚡ Neon lights activated - welcome to the future!');
        }

        return { success: true, output };
      } else {
        return {
          success: false,
          output: [
            `✗ Unknown theme: '${themeName}'`,
            "  Type 'theme list' to see available themes",
          ],
        };
      }
    },

    // === UTILITY ===
    'help': () => {
      const output = [];
      output.push('╔════════════════════════════════════════════════════════╗');
      output.push('║           VraithUI Portfolio - Help Menu              ║');
      output.push('╚════════════════════════════════════════════════════════╝');
      output.push('');
      output.push('NAVIGATION:');
      output.push('  open <section>   Open a section (home, about, projects, github, contact)');
      output.push('');
      output.push('THEMES:');
      output.push('  theme list       List all available themes');
      output.push('  theme set <name> Switch to a specific theme');
      output.push('');
      output.push('UTILITIES:');
      output.push('  help             Show this help menu');
      output.push('  clear / cls      Clear console output');
      output.push('  exit / quit      Close the console');
      output.push('');
      output.push('SYSTEM:');
      output.push('  whoami           Display current user');
      output.push('  pwd              Print working directory');
      output.push('  date             Show current date and time');
      output.push('  version / ver    Show portfolio version info');
      output.push('');
      output.push('FUN:');
      output.push('  ascii [vraith]   Display ASCII art');
      output.push('  roll [dX]        Roll a dice (default: d20)');
      output.push('');
      output.push('─────────────────────────────────────────────────────────');
      output.push('');
      output.push('Tips:');
      output.push('  • Use ↑/↓ arrows to navigate command history');
      output.push('  • Press Tab for command completion (coming soon)');
      output.push('  • Press Ctrl+J to toggle console');

      return { success: true, output };
    },

    'clear': () => {
      consoleOutput.value = [];
      return { success: true, silent: true };
    },

    'exit': () => {
      return {
        success: true,
        action: 'close-console',
        output: ['✓ Closing console...'],
      };
    },

    // === SYSTEM ===
    'whoami': () => {
      return { success: true, output: ['vraith@portfolio'] };
    },

    'pwd': () => {
      return { success: true, output: ['/home/vraith/portfolio'] };
    },

    'date': () => {
      return { success: true, output: [new Date().toLocaleString()] };
    },

    'version': () => {
      const themeStore = useThemeStore();
      return {
        success: true,
        output: [
          'Vraith Portfolio v2.1',
          'Built with Vue 3 + Vite',
          `${themeStore.allThemes.length} themes available (current: ${themeStore.theme})`,
        ],
      };
    },

    // === FUN ===
    'ascii': () => {
      return {
        success: true,
        output: [
          ' __     __        _ _   _     ',
          ' \\ \\   / / _ __ _ (_)|_| |___  ',
          '  \\ \\ / / \'_/ _`| |  __| \'_  \\',
          '   \\ V /| | | (__| | | |_| | | |',
          '    \\_/ |_|  \\__,_|_|\\__|_| |_|',
          '                                ',
          '    Developer Portfolio v2.1',
          '    Now with Nord & Dracula themes!',
        ],
      };
    },

    'roll': (args) => {
      const match = args[1]; // d(\d+) captured group
      const dice = match ? parseInt(match) : 20;
      const result = Math.floor(Math.random() * dice) + 1;

      const output = [`🎲 You rolled d${dice}: ${result}`];

      if (result === dice) {
        output.push('   ⭐ Critical success!');
      } else if (result === 1) {
        output.push('   💀 Critical failure!');
      }

      return { success: true, output };
    },
  };

  // Actions
  function println(text) {
    consoleOutput.value.push(text);
  }

  function printLines(lines) {
    if (Array.isArray(lines)) {
      lines.forEach(line => println(line));
    } else {
      println(lines);
    }
  }

  function clearOutput() {
    consoleOutput.value = [];
  }

  function addToHistory(cmd) {
    if (cmd && commandHistory.value[commandHistory.value.length - 1] !== cmd) {
      commandHistory.value.push(cmd);
    }
    historyIndex.value = -1;
  }

  function getHistoryUp() {
    if (commandHistory.value.length === 0) return null;

    if (historyIndex.value === -1) {
      historyIndex.value = commandHistory.value.length - 1;
    } else if (historyIndex.value > 0) {
      historyIndex.value--;
    }

    return commandHistory.value[historyIndex.value];
  }

  function getHistoryDown() {
    if (historyIndex.value === -1) return '';

    historyIndex.value++;

    if (historyIndex.value >= commandHistory.value.length) {
      historyIndex.value = -1;
      return '';
    }

    return commandHistory.value[historyIndex.value];
  }

  /**
   * Execute a command
   * Returns: { success, output?, action?, message?, section? }
   */
  function execute(input) {
    const trimmed = input.trim();

    if (!trimmed) {
      return { success: false, silent: true };
    }

    // Echo the command
    println(`$ ${trimmed}`);

    // Parse command
    const parsed = parseCommand(trimmed);

    if (!parsed) {
      printLines([
        `✗ Command not found: '${trimmed}'`,
        "  Type 'help' for available commands",
      ]);
      return { success: false };
    }

    const { definition, args } = parsed;

    // Find handler - always use first word of command name as key
    const handlerKey = definition.name.split(' ')[0];
    const handler = handlers[handlerKey];

    if (!handler) {
      printLines([
        `✗ Command handler not found: '${definition.name}'`,
        '  This is a bug - please report it!',
      ]);
      return { success: false };
    }

    // Execute handler
    try {
      const result = handler(args, definition);

      // Print output if any
      if (result.output && !result.silent) {
        printLines(result.output);
      }

      // Add to history
      addToHistory(trimmed);

      return {
        ...result,
        requiresConsole: definition.requiresConsole,
      };
    } catch (error) {
      console.error('[CommandStore] Error executing command:', error);
      printLines([
        `✗ Error executing command: ${error.message}`,
        '  Please try again or type "help" for assistance',
      ]);
      return { success: false };
    }
  }

  return {
    // State
    consoleOutput,
    commandHistory,

    // Getters
    allCommands,
    commandsByCategory,

    // Actions
    execute,
    println,
    printLines,
    clearOutput,
    addToHistory,
    getHistoryUp,
    getHistoryDown,
  };
});
