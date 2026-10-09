# Molly Biomes — les cinq zones

Ce pack reprend la surface validée et décline ses formes simples sur les quatre
autres zones. Chaque zone dispose de trois terres et de deux fonds de tunnel.
Les rochers mobiles ont des formes simples et des couleurs par zone.
La roche incassable commune et les fissures de creusement restent celles de la
version validée. Les textures ne révèlent jamais le minerai caché.

## Fichiers et découpe

- `moss-tiles.png` : mine mousseuse, verts sourds.
- `deep-tiles.png` : caverne profonde, bleus ardoise.
- `violet-tiles.png` : faille cristalline, violets mats sans trésor apparent.
- `magma-tiles.png` : cœur magmatique, rouges rouille sans lave décorative.
- `biome-rocks.png` : quatre rochers mobiles sur fond réellement transparent.

Chaque atlas de terrain fait 1536 × 1024, avec six cases de 512 × 512, sans marge :

| Terre A | Terre B | Terre C |
| --- | --- | --- |
| Tunnel A | Roche incassable commune (non utilisée) | Tunnel B |

La roche incassable utilisée provient de la surface, pour garder toutes les
frontières identifiables. L’atlas des rochers utilise deux colonnes et deux lignes,
dans l’ordre mousse, bleu, violet, magma. Les rectangles exacts sont dans `pack.json`.

## Refaire les images

Les prompts exacts et les chemins des références sont dans `prompts.json`.
Ils ont été utilisés avec l’outil intégré `image_gen` de Codex. Tu peux les copier
dans Gemini ou dans un workflow ComfyUI, en fournissant les mêmes références.
La seed et le modèle précis ne sont pas exposés ; les prompts permettent de
retrouver la direction artistique, pas de garantir des pixels identiques.

Conserver les dimensions, la grille et les marges lors du remplacement ; sinon,
adapter les rectangles `frame`. Pour des rochers individuels, remplacer leur
`src` et supprimer `frame`. Exporter une véritable transparence alpha.
Augmenter la version du pack après changement des images.

Ce pack référence `molly-surface` et `molly-default` : garder ces dossiers voisins.
Depuis `D:\Dev\Molly` :

```powershell
node scripts/validate-asset-pack.mjs
node --test
node scripts/build.mjs
```

Vérifier via un serveur HTTP et pousser sur `main` pour publier sur GitHub Pages.
Pour revenir à l’étape précédente, remettre `packs/molly-surface/pack.json` dans
`assets/active-pack.json`.
