# MollyMine sur Android (APK)

Le jeu web (`molly_mine.html`) est encapsulé tel quel via **Capacitor** : aucun
code dupliqué, jeu 100 % hors-ligne, pubs AdMob en option.

## APK de test (automatique)

Chaque push sur `main` lance aussi **APK MollyMine** : vérifie les tests,
construit l’APK debug et le joint en artefact `mollymine-debug-apk`.
Télécharge-le depuis l’onglet Actions du run, installe-le sur ton téléphone
(autoriser l’installation inconnue) et joue. Les pubs affichées sont des
**annonces de test Google**, sans revenu.

## Pubs récompensées (déjà câblées)

- 🎬 **+1 carte** (fenêtre de grattage) et 🎬 **+75 air** (boutons du bas) :
  visibles uniquement dans l’appli (`body.has-capacitor`), invisibles sur le
  web. La récompense n’est versée que si la pub est regardée jusqu’au bout.
- IDs de test en place : `molly_mine.html` (`ADMOB_REWARD_ID`) et
  `scripts/android-manifest.mjs` (ID d’application).

## Passer aux vraies pubs (monétisation)

1. Créer un compte **AdMob**, y déclarer l’appli (`com.mollymine.game`).
2. Créer une unité **récompensée** → copier son ID dans `ADMOB_REWARD_ID`.
3. Ajouter le secret GitHub `ADMOB_APP_ID` = ID d’application AdMob
   (sans lui, la CI utilise l’ID de test).
4. Publier : l’APK release signé est une étape suivante (keystore + Play).

## Bouton retour Android

Géré dans le jeu : ferme le panneau/modale, reprend la pause, sinon quitte.
