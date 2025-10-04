# VraithUI Portfolio

Portfolio interactif inspiré d’un IDE (Neovim / Cursor) avec **Vue 3 + Vite + TailwindCSS**.  
Il inclut une **Command Palette** (`⌘K`), une **Console** (`⌘J`), un **Explorer**, une **Tabline/Statusline** type Vim et des **thèmes** dynamiques (cyberpunk, luxury, brand, etc.).

---

## ✨ Features

- 🎨 Système de **thèmes** (clair/sombre + palettes premium).
- ⌨️ **Command Palette** (`⌘K`) : `theme set`, `theme list`, `open <section>`.
- 🖥️ **Console** (`⌘J`) : `help`, `theme set`, `ascii vraith`, `roll`, etc.
- 📂 **Explorer** (arborescence) + **Tabline/Statusline** inspirées de Neovim.
- 🖱️ **Scrollbars custom** adaptées aux thèmes.

---

## 🛠 Stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) (tokens VraithUI)
- [PostCSS](https://postcss.org/)

---

## 🚀 Démarrage

### Installation

```bash
git clone https://github.com/Jackmaa/vraithui-portfolio.git
cd vraithui-portfolio
npm install

```

---

## 🎨 Thèmes

Exemples de thèmes disponibles :

- `cyberpunk`
- `luxury`
- `brand` (clair)
- `brand-dark` (sombre)
- `neutral`
- `velvet-charcoal`
- `persian-plum`
- `bordeaux-silk`
- `regal-gold`
- `velvet-indigo`
- `deep-jungle`
- `crimson-peach`
- `imperial-blue`
- `mystic-jade`
- `lush-merlot`

### Commandes liées aux thèmes

`theme set <name>` → change de thème  
`theme list` → affiche les thèmes disponibles

---

## ⌨️ Commandes (console / palette)

| Commande              | Action                         |
| --------------------- | ------------------------------ |
| `help`                | Liste toutes les commandes     |
| `theme list`          | Affiche les thèmes disponibles |
| `theme set <name>`    | Change le thème                |
| `open home/about/...` | Ouvre la section demandée      |
| `ascii vraith`        | Easter egg ASCII               |
| `roll` / `roll d6`…   | Lance un dé virtuel            |
| `exit`                | Ferme la console               |

---

## 🧩 Composants principaux

- `EditorShell.vue` — layout global (Explorer, Tabline, Statusline, Console, Palette).
- `CommandPalette.vue` — recherche et exécution rapide de commandes (`⌘K`).
- `VraithConsole.vue` — console intégrée (`⌘J`).
- `NvimTabline.vue` / `NvimStatusline.vue` — UI inspirée Neovim.
- `NvimExplorer.vue` — navigation façon arborescence.
- `CustomScrollbar.vue` _(TODO)_ — version draggable full custom.

---

## 📌 Roadmap

- [ ] **CustomScrollbar** (drag thumb, support tactile, accessibilité).
- [ ] Animations (Matrix rain, transitions smooth).
- [ ] Page **Blog/Notes**.
- [ ] Packager **VraithUI** comme mini design system.

---

## 📜 Licence

MIT © Valentin _“Vraith”_ Gillot ([Jackmaa](https://github.com/Jackmaa))
