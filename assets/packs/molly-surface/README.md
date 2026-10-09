# Molly Surface — première zone

Trois variantes de terre, deux fonds de tunnel, une roche incassable et un
rocher mobile. Les fissures de creusement restent dessinées par le jeu, selon le
nombre réel de coups ; elles se superposent aux nouvelles textures.
Les autres zones et les animations de Molly reprennent le pack `molly-default`.
La roche incassable étant commune aux frontières, son nouveau dessin apparaît
également dans les profondeurs.

## Refaire le pack

Les prompts exacts sont dans `prompts.json`. Utiliser Gemini ou un workflow
ComfyUI adapté à l’illustration. Le modèle et la seed de l’outil intégré ne sont
pas exposés : on peut reproduire le style, pas garantir les mêmes pixels.

`surface-tiles-v2.png` est l’atlas actif opaque de 1536 × 1024, trois colonnes et deux
lignes, sans marge :

| Terre A | Terre B | Terre C |
| --- | --- | --- |
| Tunnel A | Roche incassable | Tunnel B |

Chaque case fait 512 × 512 et s’affiche en 64 × 64 dans le jeu.
`surface-tiles.png` conserve le premier essai ; la V2 harmonise les teintes des
trois terres pour éviter les bandes trop contrastées. Le prompt de cette
retouche figure dans `prompts.json`.
`surface-rock.png` est un sprite isolé, sur fond réellement transparent. Sa taille
peut changer : le manifeste utilise toute l’image, sans rectangle de découpe.

La variante d’une case dépend de ses coordonnées, jamais du butin ou d’un tirage
aléatoire. Un minerai non découvert garde la même texture que la terre.
Les slots `terrain.0.0` à `terrain.0.2` remplacent les trois variantes ;
`terrain.0` sert de secours. Les slots `tunnel.0.0` et `tunnel.0.1` remplacent
les fonds vides, avec `tunnel.0` comme secours.

Conserver `molly-default` dans le dossier voisin : ce pack le référence.
Pour revenir aux visuels précédents, sélectionner `packs/molly-default/pack.json`
dans `assets/active-pack.json`.

Depuis `D:\Dev\Molly`, vérifier puis publier :

```powershell
node scripts/validate-asset-pack.mjs
node --test
node scripts/build.mjs
```

Tester le rendu via HTTP puis pousser sur `main` pour déclencher GitHub Pages.
