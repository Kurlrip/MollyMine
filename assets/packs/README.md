# Packs d’assets MollyMine

Un pack peut remplacer progressivement les dessins procéduraux sans modifier le
gameplay. Les fichiers peuvent venir de ComfyUI, Gemini ou d’un pack acquis avec
une licence commerciale compatible.

## Activer un pack

1. Créer `assets/packs/<id>/pack.json` et placer ses PNG dans ce dossier.
2. Renseigner la licence et uniquement les slots réellement remplacés.
3. Pointer `assets/active-pack.json` vers le nouveau manifeste.
4. Exécuter `node scripts/validate-asset-pack.mjs`.
5. Exécuter `node --test` puis `node scripts/build.mjs`.

Les slots absents, invalides ou impossibles à charger utilisent automatiquement
le rendu intégré. Un pack partiel est donc valide.

## Format minimal

```json
{
  "schemaVersion": 1,
  "id": "mon-pack",
  "name": "Mon pack",
  "version": "1.0.0",
  "license": {
    "name": "Nom de la licence ou asset généré",
    "source": "URL, facture, modèle et workflow, ou auteur",
    "commercialUse": true
  },
  "sprites": {
    "terrain.0": { "src": "terrain-surface.png" },
    "bedrock": { "src": "bedrock.png" }
  }
}
```

`src` est relatif au manifeste et doit rester dans `assets/`. Les images sont des
PNG. `frame: [x, y, largeur, hauteur]` permet de découper une image ; sans `frame`,
l’image complète est utilisée. `molly.atlas` utilise `frames`, avec huit entrées
`[x, y, largeur, hauteur, appuiX, appuiY]`.
Les points d’appui sont des coordonnées absolues dans l’atlas, aux pieds de Molly.
Les poses suivent l’ordre : quatre phases de marche, puis quatre phases de pioche.
`referenceHeight` sur `molly.atlas`
fixe la hauteur de référence du personnage en pixels (425 par défaut ; 128 pour
des poses hautes de 128 pixels), afin de conserver sa taille à l’écran.
Le validateur bloque les fichiers invalides avant publication ; au chargement,
une image indisponible laisse les autres slots du pack utilisables.

## Slots disponibles

- `molly.idle`, `molly.atlas`
- `terrain.0` à `terrain.4`
- `terrain.<zone>.<variante>` : trois variantes (0, 1, 2) par zone ;
  si une variante manque, le jeu utilise `terrain.<zone>`, puis son dessin intégré.
- `tunnel.0` à `tunnel.4` : fond des cases vides ;
  `tunnel.<zone>.<variante>` accepte deux variantes (0 et 1) avec le même secours.
- `bedrock`
- `rock.0` à `rock.4`
- `find.stone`
- `gas`, `monster`, `warning`
- `stall.shop`, `stall.market` : les deux étals de la surface (voir
  `stalls/README.md` et `stalls/prompts.json` pour les générer par IA).
- `mineral.<id>` : un slot par pierre du jeu (27 au total, voir
  `minerals/README.md` et `minerals/prompts.json`). Le sprite remplace la
  gemme procédurale dans la carte à gratter, sur l’étal, dans le sac, le
  coffre et les cours. Slot absent ou illisible = gemme procédurale.

Tailles conseillées : 64×64 pour terrain, roche et dangers ; 128×128 pour un
monstre ; 206×190 pour un stand ; 256×256 à fond transparent pour un minerai
(motif centré ~80 %). Utiliser une transparence réelle pour les objets.
Éviter le texte dans les images : l’interface et la localisation restent en HTML.

Pour un pack acheté, conserver hors du dépôt la facture et les conditions de
licence. Le manifeste doit néanmoins identifier la source et confirmer que
l’utilisation commerciale est permise.
