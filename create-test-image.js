/**
 * Script pour créer une image de test pour l'upload de photo de profil
 * Usage: node create-test-image.js
 */

const fs = require('fs');
const path = require('path');

// Créer un dossier pour les fichiers de test
const testDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Créer une image PNG simple (1x1 pixel rouge) en base64
// Ceci est un PNG valide de 1x1 pixel rouge
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');
const pngPath = path.join(testDir, 'test-profile.png');
fs.writeFileSync(pngPath, pngBuffer);

// Créer une image JPG simple
// Ceci est un JPEG valide de 1x1 pixel rouge
const jpgBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';
const jpgBuffer = Buffer.from(jpgBase64, 'base64');
const jpgPath = path.join(testDir, 'test-profile.jpg');
fs.writeFileSync(jpgPath, jpgBuffer);

console.log('✅ Fichiers de test créés avec succès !');
console.log('\nFichiers créés dans:', testDir);
console.log('  - test-profile.png');
console.log('  - test-profile.jpg');
console.log('\nVous pouvez utiliser ces fichiers pour tester l\'upload dans Postman.');
