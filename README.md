# MollyMine

**Molly — Sous la surface** est un jeu d’exploration minière jouable dans un navigateur.

## Jouer

Ouvre [`molly_mine.html`](./molly_mine.html) dans un navigateur récent. Le jeu fonctionne sans installation, serveur ni connexion Internet. Le fichier HTML contient le jeu complet et ses images intégrées.

Pour les commandes, le contenu du jeu et les détails de sauvegarde, consulte [`LISEZ_MOI.txt`](./LISEZ_MOI.txt).

## Fichiers

- `molly_mine.html` : jeu et code source.
- `assets/` : illustrations originales de Molly, également intégrées au jeu.
- `version.json` : numéro de version et empreinte SHA-256 du fichier du jeu.

Version actuelle : **12**.

## Publication automatique et test mobile

Le workflow [Publier MollyMine](../../actions/workflows/pages.yml) vérifie le
JavaScript et publie le jeu après chaque modification du jeu, de ses assets, de
`version.json` ou du workflow sur `main`. On peut aussi le lancer manuellement.

### Activation initiale (une seule fois)

1. Ouvrir [Settings → Pages](https://github.com/Kurlrip/MollyMine/settings/pages).
2. Dans **Build and deployment → Source**, choisir **GitHub Actions**.
3. Ouvrir [Actions → Publier MollyMine](https://github.com/Kurlrip/MollyMine/actions/workflows/pages.yml),
   puis **Run workflow**, branche **main**.
4. Attendre que les deux étapes de préparation et de publication soient vertes.

Le dépôt est privé. GitHub Pages pour un dépôt privé nécessite une offre compatible,
par exemple GitHub Pro. Si GitHub propose une mise à niveau au lieu du réglage de
publication, l'activation est bloquée par l'offre du compte. Ne pas rendre le dépôt
public simplement pour contourner ce blocage ; un hébergement tel que Cloudflare Pages
peut être envisagé avec une connexion séparée.

### Jouer sur téléphone

Après la première publication réussie, ouvrir
**https://kurlrip.github.io/MollyMine/** dans Chrome ou Safari, en mode portrait.
Sur Android, le menu du navigateur permet d'ajouter un raccourci à l'écran d'accueil.
Ce raccourci n'est pas un APK et ne garantit pas un accès hors ligne.

Après une mise à jour, recharger la page. La progression reste dans le stockage local
du navigateur : garder le même navigateur et la même adresse, sans effacer ses données.
Une partie enregistrée en ouvrant un fichier local ne se transfère pas automatiquement
à la version en ligne.

### Ce qui est publié

Le dossier de publication contient uniquement le jeu (`index.html` et
`molly_mine.html`), `version.json`, les assets et `.nojekyll`.
Le jeu et ses assets deviennent accessibles sur le site publié ; le dépôt conserve
ses propres réglages de visibilité.

Si la préparation réussit mais que la publication échoue avec « Pages not found »,
vérifier l'activation dans Settings → Pages et l'offre du compte, puis relancer le workflow.
