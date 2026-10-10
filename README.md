# MollyMine

**Molly — Sous la surface**, jeu d’exploration minière autonome. Version **12.7.0**.

[Jouer sur GitHub Pages](https://kurlrip.github.io/MollyMine/)

## Jouer et modifier

`molly_mine.html` contient le jeu complet, ses styles et les images de secours intégrées.
Il peut toujours être ouvert directement, sans serveur ni dépendance. L’accueil
indique alors « source locale ». Les commandes et règles sont dans `LISEZ_MOI.txt`.
Sur le site et dans `_site`, le pack actif peut remplacer progressivement les
dessins intégrés sans modifier les règles du jeu.

## Construire et vérifier

Node.js 22+ et Git suffisent, sans installation npm :

```powershell
node --test
node scripts/build.mjs
```

Le build écrit `_site/index.html`, `_site/molly_mine.html`, `version.json`, les
assets et `.nojekyll`. Les deux HTML sont identiques. Les grandes images intégrées
sont remplacées par leurs fichiers dans `assets/` pour alléger fortement la page
publiée ; le fichier source reste jouable seul et le rendu procédural reste le
dernier fallback si un asset publié manque.
L’accueil affiche la version et les sept premiers caractères du commit ; son
infobulle contient le SHA complet. Le manifeste publié contient aussi le commit
complet et l’empreinte SHA-256 du HTML réellement servi. Le build ne modifie ni
les règles du jeu ni les sauvegardes. Il refuse aussi un pack actif invalide.

`version.json` dans le dépôt décrit le fichier source. Pour une nouvelle version,
mettre à jour son numéro et le numéro local dans le bloc `buildInfo` du HTML,
puis son empreinte SHA-256. La publication utilise toujours le numéro du manifeste
et injecte automatiquement le commit du checkout ; ne jamais saisir un SHA à la main.
Un build local non commité porte le SHA de HEAD : il sert à vérifier les changements,
mais ne prouve pas qu’ils sont déjà publiés. Le workflow construit un checkout propre.

## Publication automatique

[Publier MollyMine](https://github.com/Kurlrip/MollyMine/actions/workflows/pages.yml)
s’exécute à **chaque push sur `main`**, sans filtre de fichiers. Les tests et la
vérification du JavaScript doivent réussir avant publication. Les autres branches
ne sont pas publiées : intégrer leurs changements à `main` pour les mettre en ligne.
Le lancement manuel est également limité à `main`.

Les publications sont sérialisées ; un ancien run relancé est ignoré si `main`
a déjà avancé. Une modification uniquement locale ne peut pas déclencher GitHub.
La source dans Settings → Pages doit rester **GitHub Actions**. Le dépôt est public
au moment de la vérification du 8 octobre 2026 et Pages est opérationnel.

Après publication, comparer `version.json` sur le site au SHA de `main`, puis
recharger l’accueil. La mise à jour prend le temps du workflow et du cache Pages.
Une page déjà ouverte doit être rechargée pour exécuter la nouvelle version.

## Sauvegardes et mobile

Conserver le même navigateur et la même URL : la progression utilise toujours
`molly-save-v2` dans localStorage. Ne pas effacer les données du navigateur.
Une sauvegarde d’un fichier local ne se transfère pas automatiquement vers Pages.
Tester les contrôles sur téléphone réel ; l’émulation Chromium ne remplace pas
une validation Android/iOS. Un raccourci d’accueil ne garantit pas le jeu hors ligne.

## État des fonctionnalités

La V12.2.0 ajoute des salles irrégulières reliées par des tunnels. Chaque frontière
entre zones forme une couche de roche sombre incassable qui traverse toute la carte.
Une seule ouverture, large de 2 à 6 cases et placée différemment pour chaque mine,
permet d’atteindre la zone suivante. Les bords latéraux restent fermés.

La géométrie dépend uniquement de la graine de la concession : elle ne change pas
selon l’ordre d’exploration, les tirages de butin ou un rechargement. Les tunnels
principaux sont générés sans rocher, gaz ni monstre afin que le passage reste
praticable au départ. Les dangers peuvent toujours apparaître dans les salles.

Les sauvegardes V12/V12.1 restent compatibles et conservent leur ancien terrain.
L’accueil leur propose explicitement une nouvelle concession à cavernes ; cette
opération garde les cartes, le sac, le coffre, les pièces et les équipements. Le
bouton « Nouvelle concession » de la boutique crée également le nouveau terrain.

## Packs d’assets

La V12.3.0 charge `assets/active-pack.json`, puis le manifeste sélectionné. Un pack
peut être partiel : chaque slot absent ou impossible à charger conserve le dessin
actuel. Les slots couvrent Molly, les terrains des cinq zones, la roche incassable,
les rochers, la pierre cachée, le gaz, les monstres, l’alerte d’éboulement et les
deux stands de surface.

Les PNG peuvent provenir de ComfyUI, Gemini ou d’un pack acheté. Le manifeste doit
indiquer la source et confirmer l’autorisation commerciale. Les chemins absolus,
les sorties hors de `assets/`, les cadres hors image et les slots inconnus sont
refusés par le build.

```powershell
node scripts/validate-asset-pack.mjs
node --test
node scripts/build.mjs
```

Le format complet, les slots et les tailles conseillées sont documentés dans
`assets/packs/README.md`. La V12.4.0 active `molly-default` : deux atlas générés
pour les cinq terrains, les cinq rochers, la roche incassable et la pierre cachée.
Molly conserve son portrait et ses animations. Les prompts exacts et le guide de
régénération sont dans `assets/packs/molly-default/`. Le pack `molly-classic`
reste disponible pour revenir aux visuels précédents.

La V12.5.0 sélectionne `molly-surface` pour valider une première zone : trois
variantes de terre, deux fonds de tunnel et un rocher mobile simplifié. La roche
incassable commune reçoit aussi le nouveau dessin. Les autres zones reprennent
`molly-default`. Les variantes dépendent des coordonnées et ne révèlent pas le
minerai ; la génération, les sauvegardes et les règles de creusement restent
inchangées. Voir `assets/packs/molly-surface/README.md` et `prompts.json`.

La V12.6.0 active `molly-biomes` et étend le style validé aux cinq zones : trois
terres, deux fonds de tunnel et un rocher mobile par zone. Les quatre nouveaux
atlas et l’atlas des rochers sont documentés dans `assets/packs/molly-biomes/`.
La surface validée, la roche incassable et les règles de gameplay sont conservées.

La V12.7.0 enchaîne les grattages : récupérer une pierre ouvre directement
la carte suivante au lieu de refermer la fenêtre, avec un compteur visible
(« encore N à gratter ») dans la modale et sur le bouton du camp. La
durabilité de la pioche et la vie deviennent deux pastilles très lisibles en
haut (alerte rouge sous 25 % / 30 PV), et les boutons du bas (Sac, Boutique,
Marché, Corde, O₂) se redistribuent en grille responsive.
