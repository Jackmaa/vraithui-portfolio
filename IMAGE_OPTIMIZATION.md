# Image Optimization Guide

## 📦 Optimisations Appliquées

### 1. Lazy Loading
- ✅ Toutes les images utilisent `loading="lazy"`
- ✅ Décodage asynchrone avec `decoding="async"`
- ✅ Videos avec `preload="none"` pour éviter le chargement automatique

### 2. Responsive Images
- ✅ Attribut `sizes` configuré pour différents breakpoints
- ✅ Support `srcset` préparé (nécessite plusieurs versions d'images)

### 3. Format WebP (À configurer)

Pour activer le support WebP, deux options :

#### Option A : Plugin Vite (Recommandé)

```bash
npm install -D vite-plugin-imagemin @vite-imagemin/webp
```

Puis dans `vite.config.js` :

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    vue(),
    viteImagemin({
      webp: {
        quality: 80
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      }
    })
  ]
})
```

#### Option B : Conversion Manuelle

Convertir vos images avec un outil comme `cwebp` :

```bash
# Installer cwebp (macOS)
brew install webp

# Convertir une image
cwebp -q 80 input.png -o output.webp

# Batch conversion (Linux/macOS)
for file in public/projects/*.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

### 4. Compression Vidéo

Pour les vidéos de projets, utiliser FFmpeg :

```bash
# Compression MP4
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow output.mp4

# Compression WebM (meilleure compression)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

## 📊 Gains de Performance Attendus

### Images
- **Lazy loading** : Économie de ~60% de bande passante au premier chargement
- **WebP** : Réduction de ~25-35% de la taille vs PNG/JPEG
- **Responsive images** : Économie de ~40% sur mobile

### Canvas Animations
- **30 FPS throttling** : Économie de ~50% CPU
- **Spatial hashing** : O(n²) → O(n) pour calculs de distance
- **Low-end device detection** : Désactivation complète sur appareils bas de gamme

### Vidéos
- **Preload none** : Économie de ~100% (pas de chargement avant interaction)
- **Compression** : Réduction de ~60-70% de la taille

## 🎯 Prochaines Étapes

1. **Installer le plugin d'optimisation d'images**
2. **Convertir les images existantes en WebP**
3. **Générer plusieurs tailles pour srcset** (320w, 640w, 1024w, 1920w)
4. **Compresser les vidéos** dans `/public/projects/`
5. **Activer le component `OptimizedImage.vue`** dans ProjectCard

## 🔧 Utilisation du Composant OptimizedImage

```vue
<OptimizedImage
  src="/projects/myproject.png"
  webp-src="/projects/myproject.webp"
  alt="My Project"
  loading="lazy"
  :responsive="true"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  img-class="w-full h-full object-cover"
/>
```

## 📈 Mesurer l'Impact

Avant/après avec Lighthouse :

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Audit avant optimisations
lighthouse https://yoursite.com --output html --output-path ./before.html

# Audit après optimisations
lighthouse https://yoursite.com --output html --output-path ./after.html
```

Métriques à surveiller :
- **LCP** (Largest Contentful Paint)
- **FCP** (First Contentful Paint)
- **Total Bundle Size**
- **Total Blocking Time**
