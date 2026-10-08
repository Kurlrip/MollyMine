# MollyMine

**Molly — Sous la surface**, jeu d’exploration minière autonome. Version **12.1.0**.

[Jouer sur GitHub Pages](https://kurlrip.github.io/MollyMine/)

## Jouer et modifier

`molly_mine.html` contient le jeu complet, ses styles et les images intégrées.
Il peut toujours être ouvert directement, sans serveur ni dépendance. L’accueil
indique alors « source locale ». Les commandes et règles sont dans `LISEZ_MOI.txt`.
Les PNG dans `assets/` sont les originaux ; les modifier seuls ne remplace pas les
images intégrées au HTML.

## Construire et vérifier

Node.js 22+ et Git suffisent, sans installation npm :

```powershell
node --test
node scripts/build.mjs
```

Le build écrit `_site/index.html`, `_site/molly_mine.html`, `version.json`, les
assets et `.nojekyll`. Les deux HTML sont identiques et restent autonomes.
L’accueil affiche la version et les sept premiers caractères du commit ; son
infobulle contient le SHA complet. Le manifeste publié contient aussi le commit
complet et l’empreinte SHA-256 du HTML réellement servi. Le build ne modifie ni
les règles du jeu ni les sauvegardes.

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

La V12.1.0 conserve le gameplay V12 : cinq zones, cartes en pochette, grattage
à la surface, extraction en trois coups, sac 5 kg, coffre, marché variable,
commandes de Rose, filons, pioches, dangers et sauvegarde.

Les cavernes irrégulières avec une seule ouverture dans une frontière incassable
entre zones ont été demandées, mais **ne sont pas implémentées** dans la V12.
La branche `codex/caves-zone-passages` pointait encore sur le même jeu lors de
l’audit. Ce changement de génération doit faire l’objet d’une évolution dédiée,
avec prise en compte des mines déjà sauvegardées.
