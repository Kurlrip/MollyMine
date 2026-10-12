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

## Login Google (activé côté jeu depuis la 12.13.0)

1. Dans Google Cloud : écran de consentement OAuth + client Web. Origines
   JavaScript autorisées : `https://hhybotjdatsstrvlgmjg.supabase.co`.
   URI de redirection : `https://hhybotjdatsstrvlgmjg.supabase.co/auth/v1/callback`.
2. Dans Supabase : Authentication → Providers → Google → activé avec
   l’identifiant client et le secret Google.
3. Dans Supabase : Authentication → URL Configuration → ajouter aux
   Redirect URLs (lignes séparées) :
   `https://kurlrip.github.io/MollyMine/`,
   `https://kurlrip.github.io/MollyMine/index.html` et
   `com.mollymine.game://login-callback` (retour direct dans l’appli).
4. Côté jeu, rien à configurer : l’accueil propose « Se connecter avec
   Google » (flux PKCE, sans dépendance). Connecté, le record suit le compte
   sur tous les appareils ; sinon le mode pseudo libre continue.

Facebook est techniquement possible via le même mécanisme, mais demande une
app Meta + politique de confidentialité : déconseillé pour ce jeu.
