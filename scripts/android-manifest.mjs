import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Injecte l'ID d'application AdMob et le retour OAuth (schéma applicatif)
// dans le manifeste généré par `npx cap add android` (plateforme non
// versionnée, recréée en CI).
// ADMOB_APP_ID non défini = ID de test Google (annonces factices).
const appId = process.env.ADMOB_APP_ID?.trim()
  || 'ca-app-pub-3940256099942544~3347511713';
const manifestPath = resolve(process.cwd(), 'android/app/src/main/AndroidManifest.xml');
if (!existsSync(manifestPath)) throw new Error(`Manifeste introuvable : ${manifestPath}`);
let xml = readFileSync(manifestPath, 'utf8');
if (xml.includes('com.google.android.gms.ads.APPLICATION_ID')) {
  console.log('AdMob déjà configuré dans le manifeste.');
} else {
  const meta = `        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${appId}"/>\n`;
  if (!/<application\b[^>]*>/.test(xml)) throw new Error('Balise <application> introuvable.');
  xml = xml.replace(/(<application\b[^>]*>)/, `$1\n${meta}`);
  console.log(`AdMob injecté (${appId.slice(0, 20)}…).`);
}
// Retour de connexion Google directement dans l'appli.
const deepLink = `        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="com.mollymine.game" android:host="login-callback" />
        </intent-filter>\n`;
if (xml.includes('com.mollymine.game') && xml.includes('login-callback')) {
  console.log('Deep link déjà configuré dans le manifeste.');
} else {
  const closeActivity = xml.indexOf('</activity>');
  if (closeActivity < 0) throw new Error('Balise </activity> introuvable.');
  xml = xml.slice(0, closeActivity) + deepLink + xml.slice(closeActivity);
  console.log('Deep link OAuth injecté.');
}
writeFileSync(manifestPath, xml);
