import type { CapacitorConfig } from '@capacitor/cli';

// Identifiants AdMob : IDs DE TEST Google par défaut (annonces factices).
// Pour monétiser : compte AdMob → remplace APP_ID ci-dessous et dans
// scripts/android-manifest.mjs (ou secret ADMOB_APP_ID), puis l'unité
// ADMOB_REWARD_ID dans molly_mine.html par ta vraie unité récompensée.
const config: CapacitorConfig = {
  appId: 'com.mollymine.game',
  appName: 'MollyMine',
  webDir: 'www',
  android: {
    allowMixedContent: false,
  },
};

export default config;
