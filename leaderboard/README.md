# Légendes mondiales MollyMine

Classement mondial minimal, sans serveur à maintenir : une table Supabase
(offre gratuite), le jeu statique parle directement à son API REST.

## Mise en route (10 minutes)

1. Créer un projet gratuit sur https://supabase.com, puis dans l’éditeur SQL
   du projet, exécuter `leaderboard/schema.sql` (table + politiques d’accès).
2. Dans les réglages API du projet, copier **l’URL du projet** et la
   **clé publique `anon`**.
3. Me transmettre ces deux valeurs : je les injecte dans le bloc
   `LEADERBOARD` du jeu (`url` + `key`) et on publie.
4. Tester : au camp, onglet **Légendes**, bouton **🌍 Publier** sur une
   pierre, vérifier qu’elle apparaît dans les deux tris.

## Fonctionnement

- Une ligne par joueur (`player_uuid` aléatoire stocké dans le navigateur,
  conservé même après la RAZ du jeu). Republier remplace l’ancien record.
- Le jeu valide avant envoi : minerai connu, 1 à 6000 g, valeur 1 à
  2 000 000, pseudo 1 à 20 caractères. Le SQL applique les mêmes bornes.
- Lecture publique, écriture anonyme encadrée. Pas de compte requis.
- Hors-ligne ou non configuré : le panneau l’indique, le reste du jeu
  fonctionne normalement.

## Phase 2 : login Google (optionnel)

1. Créer un identifiant OAuth Google (écran de consentement + client Web) et
   déclarer comme origine et redirection l’URL du site
   (`https://kurlrip.github.io/MollyMine/`).
2. L’ajouter dans Supabase : Authentication → Providers → Google.
3. Me transmettre l’info : j’ajoute le bouton « Se connecter avec Google »
   (flux implicite, sans dépendance) et le jeton servira d’identifiant à la
   place de la clé anonyme. Le mode pseudo libre restera disponible.

Facebook est techniquement possible via le même mécanisme, mais demande une
app Meta + politique de confidentialité : déconseillé pour ce jeu.
