# Pack minerais MollyMine

Ce dossier pilote le remplacement des 27 pierres du jeu (or, fer, gemmes…)
par des images générées par IA, exactement comme les tuiles : **un slot par
minerai, repli automatique sur la gemme procédurale si le slot est absent**.

## Slots

`mineral.<id>` avec l’identifiant du jeu :

- Zone Surface : `gray`, `clay`, `silver`, `roseQuartz`, `goldDust`, `trilobite`
- Zone Mine Mousseuse : `hardRock`, `gold`, `amethyst`, `jade`, `geode`
- Zone Caverne Profonde : `basalt`, `goldBar`, `platinumBar`, `emerald`, `sapphire`, `meteorite`
- Zone Faille Cristalline : `rockQuartz`, `platinum`, `diamond`, `ruby`, `ether`
- Zone Cœur Magmatique : `slag`, `blueDiamond`, `magmaGold`, `blackOpal`, `obsidian`

La géode utilise son slot **fermée** (boule rocheuse) ; son contenu reste
tiré au hasard comme avant. Le coffre au trésor garde son dessin intégré.

## Générer les images

1. Prendre chaque entrée de `prompts.json` (ComfyUI ou Gemini).
2. Sortir un PNG **carré à fond transparent**, motif centré occupant ~80 %
   de l’image : 256×256 conseillé, 96×96 minimum. Aucun texte, aucun décor.
3. Nommer le fichier `<id>.png` (ex. `gold.png`) dans ce dossier.

## Activer

1. Copier `pack.example.json` vers `pack.json` et y renseigner la licence
   (source réelle + `commercialUse: true`).
2. Pointer `assets/active-pack.json` vers ce manifeste, ou fusionner les
   sprites voulus dans le pack actif (un pack peut être partiel : seuls les
   slots présents sont remplacés).
3. Exécuter `node scripts/validate-asset-pack.mjs`, puis `node --test` et
   `node scripts/build.mjs`.

Les pierres apparaissent dans la carte à gratter, sur l’étal de Rose, dans
le sac, le coffre et les cours du marché. Un slot manquant ou illisible
conserve la gemme procédurale sans bloquer les autres.
