# Pack étals MollyMine

Ce dossier pilote le remplacement des deux petits bâtiments de la surface
(la boutique de Gaspard et le marché de Rose) par des images générées par IA,
exactement comme les tuiles et les minerais : **un slot par étal, repli
automatique sur le dessin procédural si le slot est absent**.

## Slots

- `stall.shop` : boutique de Gaspard (outils, pioches)
- `stall.market` : marché de Rose (gemmes, cageots)

## Générer les images

1. Prendre chaque entrée de `prompts.json` (ComfyUI ou Gemini).
2. Sortir un PNG **à fond transparent**, 206×190 conseillé (103×95 minimum),
   étal centré occupant ~85 % de l’image. Aucun texte, aucun personnage.
3. Nommer les fichiers `stall-shop.png` et `stall-market.png` dans ce dossier.

## Activer

1. Copier `pack.example.json` vers `pack.json` et y renseigner la licence
   (source réelle + `commercialUse: true`).
2. Pointer `assets/active-pack.json` vers ce manifeste, ou fusionner les
   sprites voulus dans le pack actif (un pack peut être partiel : seuls les
   slots présents sont remplacés).
3. Exécuter `node scripts/validate-asset-pack.mjs`, puis `node --test` et
   `node scripts/build.mjs`.

Un slot manquant ou illisible conserve le dessin procédural sans bloquer
l’autre étal.
