import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  COMMAND_DEFINITIONS,
  COMMAND_CATEGORIES,
  parseCommand,
  getCommandsByCategory,
} from '@/config/commands';
import { useThemeStore } from './themeStore';
import { useLanguageStore } from './languageStore';
import { THEMES } from '@/config/themes';

const SESSION_START = Date.now();

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
      if (definition.name === 'theme list') {
        return handlers._themeList();
      } else if (definition.name === 'theme set') {
        return handlers._themeSet(args);
      } else if (definition.name === 'theme random') {
        const themeStore = useThemeStore();
        themeStore.setRandomTheme();
        return {
          success: true,
          output: [`✓ Random theme applied: ${themeStore.theme}`],
        };
      }
    },

    _themeList: () => {
      const themeStore = useThemeStore();
      const konamiUnlocked = localStorage.getItem('vraithui-konami-unlocked') === 'true';
      const output = [];

      const categories = {
        popular: 'Popular themes:',
        light: 'Light themes:',
        dark: 'Dark themes:',
        luxury: 'Luxury themes:',
      };

      let totalCount = 0;

      Object.entries(themeStore.themesByCategory).forEach(([category, themes]) => {
        const visible = konamiUnlocked ? themes : themes.filter(t => !t.hidden);
        if (visible.length > 0) {
          output.push(categories[category] || `${category}:`);
          visible.forEach(theme => {
            const current = theme.name === themeStore.theme ? ' (current)' : '';
            output.push(`  • ${theme.name.padEnd(18)} ${theme.label}${current}`);
          });
          totalCount += visible.length;
          output.push('');
        }
      });

      output.unshift(`Available themes (${totalCount} total):`);
      output.unshift('');
      output.splice(1, 0, '─────────────────────────────────────');

      output.push('─────────────────────────────────────');
      output.push(`Total: ${totalCount} themes`);
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
      output.push('  theme random     Set a random theme');
      output.push('');
      output.push('UTILITIES:');
      output.push('  help             Show this help menu');
      output.push('  clear / cls      Clear console output');
      output.push('  exit / quit      Close the console');
      output.push('  lang toggle      Toggle language (EN/FR)');
      output.push('  lang <en|fr>     Set language');
      output.push('  man <command>    Show manual for a command');
      output.push('');
      output.push('SYSTEM:');
      output.push('  whoami           Display current user');
      output.push('  pwd              Print working directory');
      output.push('  date             Show current date and time');
      output.push('  version / ver    Show portfolio version info');
      output.push('  neofetch         Display system information');
      output.push('  uptime           Show session uptime');
      output.push('  history          Show command history');
      output.push('');
      output.push('FUN:');
      output.push('  ascii [vraith]   Display ASCII art');
      output.push('  roll [dX]        Roll a dice (default: d20)');
      output.push('  cowsay <msg>     Make a cow say something');
      output.push('  fortune          Random programming wisdom');
      output.push('  matrix           Enter the Matrix');
      output.push('  barrel roll      Do a barrel roll!');
      output.push('');
      output.push('─────────────────────────────────────────────────────────');
      output.push('');
      output.push('Tips:');
      output.push('  • Use ↑/↓ arrows to navigate command history');
      output.push('  • Press Tab for command completion (coming soon)');
      output.push('  • Press Ctrl+J to toggle console');
      output.push('  • Some commands are hidden... try to find them all!');

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

    // === EASTER EGGS ===
    'sudo': (args, definition) => {
      if (definition.name === 'sudo rm -rf /') {
        return {
          success: true,
          output: [
            '🔥 Deleting portfolio...',
            '  rm: cannot remove \'/\': Permission denied',
            '  Nice try. This portfolio is indestructible.',
          ],
        };
      }
      return {
        success: true,
        output: [
          'vraith is not in the sudoers file.',
          'This incident will be reported.',
        ],
      };
    },

    'vim': () => {
      return {
        success: true,
        output: [
          "You're already inside Neovim. How meta.",
          "  Try :q to see what happens...",
        ],
      };
    },

    'emacs': () => {
      return {
        success: true,
        output: [
          'We don\'t do that here.',
          '  This is Vim territory.',
          '  (M-x butterfly is not available)',
        ],
      };
    },

    ':q': () => {
      return {
        success: true,
        output: [
          "You can't escape. You're already home.",
          '  E37: No write since last change',
        ],
      };
    },

    'neofetch': () => {
      const themeStore = useThemeStore();
      const languageStore = useLanguageStore();
      const elapsed = Date.now() - SESSION_START;
      const mins = Math.floor(elapsed / 60000);
      const secs = Math.floor((elapsed % 60000) / 1000);
      const visibleThemes = THEMES.filter(t => !t.hidden).length;

      const logo = [
        '  ██╗   ██╗██████╗  ',
        '  ██║   ██║██╔══██╗ ',
        '  ██║   ██║██████╔╝ ',
        '  ╚██╗ ██╔╝██╔══██╗ ',
        '   ╚████╔╝ ██║  ██║ ',
        '    ╚═══╝  ╚═╝  ╚═╝ ',
      ];

      const info = [
        `  OS:       VraithUI Portfolio`,
        `  Shell:    Vraith Console v2.1`,
        `  Theme:    ${themeStore.theme} (${themeStore.themeData?.mode})`,
        `  Lang:     ${languageStore.currentLocale.toUpperCase()}`,
        `  Uptime:   ${mins}m ${secs}s`,
        `  Themes:   ${visibleThemes} available`,
      ];

      const output = [];
      const maxLen = Math.max(logo.length, info.length);
      for (let i = 0; i < maxLen; i++) {
        const left = (logo[i] || '').padEnd(22);
        const right = info[i] || '';
        output.push(left + right);
      }

      if (typeof window !== 'undefined') {
        output.push('');
        output.push(`  Resolution: ${window.innerWidth}x${window.innerHeight}`);
      }

      return { success: true, output };
    },

    'matrix': () => {
      return {
        success: true,
        action: 'matrix',
        output: ['Entering the Matrix...'],
      };
    },

    'cowsay': (args) => {
      const message = args[0] || 'moo';
      const border = '-'.repeat(message.length + 2);
      const output = [
        ` ${border}`,
        `< ${message} >`,
        ` ${border}`,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||',
      ];
      return { success: true, output };
    },

    'fortune': () => {
      const fortunes = [
        '"There are only two hard things in CS: cache invalidation and naming things." — Phil Karlton',
        '"It works on my machine." — Every developer ever',
        '"The best code is no code at all." — Jeff Atwood',
        '"Talk is cheap. Show me the code." — Linus Torvalds',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
        '"Debugging is twice as hard as writing the code in the first place." — Brian Kernighan',
        '"The only way to go fast is to go well." — Robert C. Martin',
        '"Premature optimization is the root of all evil." — Donald Knuth',
        '"Simplicity is the soul of efficiency." — Austin Freeman',
        '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
        '"In theory, there is no difference between theory and practice. In practice, there is." — Yogi Berra',
      ];
      const pick = fortunes[Math.floor(Math.random() * fortunes.length)];
      return { success: true, output: [pick] };
    },

    'history': () => {
      const output = [];
      if (commandHistory.value.length === 0) {
        output.push('No commands in history yet.');
      } else {
        commandHistory.value.forEach((cmd, i) => {
          output.push(`  ${String(i + 1).padStart(4)}  ${cmd}`);
        });
      }
      return { success: true, output };
    },

    'uptime': () => {
      const elapsed = Date.now() - SESSION_START;
      const hours = Math.floor(elapsed / 3600000);
      const mins = Math.floor((elapsed % 3600000) / 60000);
      const secs = Math.floor((elapsed % 60000) / 1000);
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      parts.push(`${secs}s`);
      return {
        success: true,
        output: [`Session uptime: ${parts.join(' ')}`],
      };
    },

    'hack': () => {
      return {
        success: true,
        output: [
          'Initiating hack sequence...',
          '  [0x4A2F] 8B 45 FC 89 C7 E8 2A FE FF FF',
          '  [0x4A39] 48 8B 05 D0 15 20 00 48 8B 00',
          '  [0x4A43] 83 F8 01 74 12 89 C6 BF 01 00',
          '  [0x4A4D] E8 3C FB FF FF B8 01 00 00 00',
          '  [0x4A57] ACCESS GRANTED ██████████ 100%',
          '',
          '  Just kidding. This is a portfolio.',
        ],
      };
    },

    'barrel': () => {
      return {
        success: true,
        action: 'barrel-roll',
        output: ['🛸 Do a barrel roll!'],
      };
    },

    // === LANGUAGE ===
    'lang': (args, definition) => {
      const languageStore = useLanguageStore();
      if (definition.name === 'lang toggle') {
        languageStore.toggleLocale();
        return {
          success: true,
          output: [`✓ Language switched to: ${languageStore.currentLocale.toUpperCase()}`],
        };
      } else if (definition.name === 'lang set') {
        const locale = args[0].toLowerCase();
        const success = languageStore.setLocale(locale);
        if (success) {
          return {
            success: true,
            output: [`✓ Language set to: ${locale.toUpperCase()}`],
          };
        }
        return {
          success: false,
          output: [`✗ Unsupported locale: '${locale}'. Use 'en' or 'fr'.`],
        };
      }
    },

    // === MANUAL ===
    'man': (args) => {
      const topic = args[0].toLowerCase();
      const manPages = {
        'theme': [
          'THEME(1) — VraithUI Theme Manager',
          '',
          'COMMANDS:',
          '  theme list           List all available themes',
          '  theme set <name>     Set a specific theme',
          '  theme random         Set a random theme',
          '',
          'EXAMPLES:',
          '  theme set nord       Switch to Nord theme',
          '  theme set dracula    Switch to Dracula theme',
        ],
        'open': [
          'OPEN(1) — VraithUI Navigation',
          '',
          'USAGE: open <section>',
          '',
          'SECTIONS:',
          '  home      Landing / intro page',
          '  about     About me',
          '  projects  Project showcase',
          '  github    GitHub activity',
          '  contact   Contact form',
        ],
        'lang': [
          'LANG(1) — VraithUI Language Manager',
          '',
          'COMMANDS:',
          '  lang toggle    Toggle between EN and FR',
          '  lang en        Switch to English',
          '  lang fr        Switch to French',
        ],
        'cowsay': [
          'COWSAY(1) — Configurable Speaking Cow',
          '',
          'USAGE: cowsay <message>',
          '',
          'EXAMPLES:',
          '  cowsay hello world',
          '  cowsay I love Neovim',
        ],
        'roll': [
          'ROLL(1) — Dice Roller',
          '',
          'USAGE: roll [dN]',
          '',
          'EXAMPLES:',
          '  roll           Roll a d20',
          '  roll d6        Roll a d6',
          '  roll d100      Roll a d100',
        ],
        'help': [
          'HELP(1) — VraithUI Help',
          '',
          'USAGE: help',
          '',
          'Shows all available commands grouped by category.',
        ],
      };

      const page = manPages[topic];
      if (page) {
        return { success: true, output: page };
      }
      return {
        success: false,
        output: [`No manual entry for '${topic}'`, "  Try: man theme, man open, man lang, man cowsay, man roll"],
      };
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
