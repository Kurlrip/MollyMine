# Molly Default — assets générés

Pack de départ pour les cinq terrains, les cinq rochers, la roche incassable et
la pierre mystérieuse. Molly garde ses animations et son portrait actuels.
Les images ne révèlent pas le minerai caché : tous les butins utilisent la même
pierre avant grattage. Aucun paramètre de gameplay n’est modifié par le pack.

## Refaire les images

Les prompts exacts sont dans `prompts.json`. Ils ont été utilisés avec l’outil
intégré `image_gen` de Codex. Tu peux les copier dans Gemini ou dans le champ
positif de ton workflow ComfyUI. Le modèle, le sampler et la seed ne sont pas
exposés par cet outil : ces prompts reproduisent la direction artistique, pas
une image identique pixel pour pixel.

- `terrain-atlas.png` : atlas opaque, trois colonnes × deux lignes, sans marge.
  Ordre : surface, mousse, profondeur, faille, magma, roche incassable.
- `rock-atlas.png` : atlas à transparence réelle, trois colonnes × deux lignes.
  Ordre : rocher de chaque zone de 0 à 4, puis pierre mystérieuse.
- Taille demandée : 1536 × 1024 ; chaque case fait alors 512 × 512.
- Pour les rochers, certains modèles ne produisent pas d’alpha. Exporter les
  sprites avec un véritable fond transparent avant de remplacer le PNG.

Les rectangles utilisés sont dans `pack.json`. Si tu conserves la taille et la
grille des atlas, remplace simplement les deux PNG, puis augmente la version du
pack. Si tu changes les dimensions ou les marges, ajuste les rectangles `frame`.
Pour des PNG individuels, utilise `src` par slot et retire `frame`.

Depuis `D:\Dev\Molly` :

```powershell
node scripts/validate-asset-pack.mjs
node --test
node scripts/build.mjs
```

Vérifie ensuite le rendu via un serveur HTTP, puis pousse sur `main` pour publier.
Pour revenir aux anciennes illustrations, remets
`packs/molly-classic/pack.json` dans `assets/active-pack.json`.

La provenance est déclarée dans le manifeste. Pour des assets venant d’un autre
modèle ou d’un pack acheté, adapte cette déclaration aux conditions de ta source.
