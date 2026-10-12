import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Applique versionCode/versionName et la signature release au projet
// généré par `npx cap add android` (plateforme non versionnée).
// VERSION_CODE fourni par la CI (numéro de run, croissant requis par Play).
const root = process.cwd();
const gradlePath = resolve(root, 'android/app/build.gradle');
if (!existsSync(gradlePath)) throw new Error(`build.gradle introuvable : ${gradlePath}`);
const version = JSON.parse(readFileSync(resolve(root, 'version.json'), 'utf8'));
const versionCode = Number(process.env.VERSION_CODE || 1);
if (!Number.isInteger(versionCode) || versionCode < 1) throw new Error('VERSION_CODE invalide.');
let gradle = readFileSync(gradlePath, 'utf8');
gradle = gradle
  .replace(/versionCode \d+/, `versionCode ${versionCode}`)
  .replace(/versionName "[^"]*"/, `versionName "${version.version}"`);
const signing = `
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_FILE") ?: "keystore.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
`;
if (!gradle.includes('signingConfigs.release')) gradle += signing;
writeFileSync(gradlePath, gradle);
console.log(`Version ${version.version} (code ${versionCode}), signature release configurée.`);
