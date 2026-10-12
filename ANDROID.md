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
2. Créer une unité **récompensée** → copier son ID dans le secret GitHub
   `ADMOB_REWARD_ID`, et l’ID d’application dans `ADMOB_APP_ID`.
   (Sans ces secrets : IDs de test, annonces factices, zéro revenu.)
3. Pendant les tests avec de vrais IDs, déclarer le téléphone comme
   **appareil de test** dans AdMob (clics réels = bannissement sinon).

## Release signée + Play Store

1. Générer le keystore **une fois** (PowerShell, JDK installé) :
   `keytool -genkeypair -v -keystore mollymine-release.jks -alias mollymine -keyalg RSA -keysize 2048 -validity 10000`
   **Sauvegarder le fichier + mots de passe** : sans eux, plus aucune mise
   à jour possible.
2. Ajouter les secrets GitHub : `KEYSTORE_BASE64` (contenu base64 du `.jks`),
   `KEY_ALIAS`, `KEYSTORE_PASSWORD`, `KEY_PASSWORD`.
3. Lancer **Release Play Store** (Actions → Run workflow) : produit
   `app-release.aab` (à envoyer sur Play) + `app-release.apk`, signés,
   versionnés (`versionCode` = numéro de run).
4. Compte développeur Google Play (25 $ uniques) → créer l’appli
   `com.mollymine.game` → piste de **test interne** d’abord → questionnaires
   (sécurité des données : voir `PRIVACY.md` comme URL de politique,
   classification contenu, audience) → production.

## Bouton retour Android

Géré dans le jeu : ferme le panneau/modale, reprend la pause, sinon quitte.
