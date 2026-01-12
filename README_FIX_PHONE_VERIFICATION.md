# 🔧 Fix: Phone Verification - Guide Rapide

## 🔴 Problème

Erreur lors de l'inscription d'un utilisateur:
```
QueryFailedError: column User.is_phone_verified does not exist
```

## ✅ Solution en 3 Fichiers

J'ai créé **3 fichiers** pour corriger ce problème:

### 1️⃣ Migration TypeScript (Nouveau)
📄 [src/migrations/1736683300000-AddPhoneVerificationToSocietes.ts](src/migrations/1736683300000-AddPhoneVerificationToSocietes.ts)
- Ajoute les colonnes à la table `societes`
- Complète la migration existante pour `users`

### 2️⃣ Script Shell Automatique (Recommandé)
📄 [fix-phone-verification.sh](fix-phone-verification.sh)
- ⚡ **Script tout-en-un** qui fait TOUT automatiquement
- Build, commit, deploy, migrations, restart, test

### 3️⃣ Script SQL Direct (Plan B)
📄 [fix-phone-verification.sql](fix-phone-verification.sql)
- Si les migrations TypeORM ne fonctionnent pas
- Ajoute directement les colonnes via SQL

---

## 🚀 Solution Rapide (3 commandes)

### Option A: Script Automatique (Le plus simple)

```bash
# Depuis votre machine locale
cd c:\Projets\titingre\backtiting
chmod +x fix-phone-verification.sh
./fix-phone-verification.sh
```

✅ C'est tout! Le script fait tout pour vous.

---

### Option B: Étape par Étape (Manuel)

#### 1. Commit et push la nouvelle migration

```bash
# Sur votre machine locale
cd c:\Projets\titingre\backtiting

git add src/migrations/1736683300000-AddPhoneVerificationToSocietes.ts
git commit -m "fix: Add phone verification columns to societes table"
git push origin main
```

#### 2. Déployer sur le VPS

```bash
# Se connecter au VPS
ssh zidar@votre-ip-vps

# Aller dans le dossier de l'API
cd ~/apps/titingre-api

# Pull le code
git pull origin main

# Build
npm run build

# Exécuter les migrations
npm run migration:run

# Redémarrer
pm2 restart titingre-api

# Vérifier les logs
pm2 logs titingre-api --lines 20
```

---

### Option C: SQL Direct (Si migration ne marche pas)

```bash
# Copier le fichier SQL sur le VPS
scp fix-phone-verification.sql zidar@votre-ip-vps:~/

# Se connecter au VPS
ssh zidar@votre-ip-vps

# Exécuter le SQL
psql -U api_userzr -d titingre_db -f ~/fix-phone-verification.sql

# Redémarrer l'API
pm2 restart titingre-api
```

---

## 🧪 Test Après Correction

### Test via curl

```bash
curl -X POST https://api.titingre.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenoms": "User",
    "telephone": "70999999",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Résultat attendu:**
- ✅ HTTP 201 (Created) - Utilisateur créé
- ✅ HTTP 409 (Conflict) - Email/téléphone déjà utilisé
- ❌ HTTP 500 avec "column does not exist" - Migrations pas exécutées

### Test depuis Flutter

Essayez de créer un compte depuis votre application Flutter Web.
L'erreur "failed to fetch" devrait avoir disparu!

---

## 📋 Ce qui a été créé

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| [1736683300000-AddPhoneVerificationToSocietes.ts](src/migrations/1736683300000-AddPhoneVerificationToSocietes.ts) | Migration TypeORM pour societes | Automatique avec `npm run migration:run` |
| [fix-phone-verification.sh](fix-phone-verification.sh) | Script bash automatique | `./fix-phone-verification.sh` |
| [fix-phone-verification.sql](fix-phone-verification.sql) | Script SQL direct | `psql -U api_userzr -d titingre_db -f fix-phone-verification.sql` |
| [FIX_PRODUCTION_DB.md](FIX_PRODUCTION_DB.md) | Guide détaillé complet | Documentation |

---

## 📊 État Actuel

### Migrations créées:
- ✅ `1736683200000-AddPhoneVerificationToUsers.ts` (existe déjà)
- ✅ `1736683300000-AddPhoneVerificationToSocietes.ts` (nouveau)

### Tables à modifier:
- ✅ `users` - Ajouter `is_phone_verified`, `phone_verified_at`
- ✅ `societes` - Ajouter `is_phone_verified`, `phone_verified_at`

---

## 🎯 Prochaines Étapes

1. ✅ **Corriger la base de données** (choisir une option A, B ou C ci-dessus)
2. ⏳ Déployer votre Flutter Web (voir [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md))
3. ⏳ Configurer Nginx pour le frontend
4. ⏳ Tester l'inscription depuis l'app

---

## 💡 Prévention

Pour éviter ce problème à l'avenir, suivez toujours cette procédure de déploiement:

```bash
# 1. Développement local
npm run build
git add .
git commit -m "Description"
git push

# 2. Déploiement VPS
ssh zidar@votre-ip-vps
cd ~/apps/titingre-api
git pull
npm install
npm run build
npm run migration:run  # ⚠️ NE PAS OUBLIER!
pm2 restart titingre-api
pm2 logs titingre-api
```

---

## 📞 Aide

- **Guide complet:** [FIX_PRODUCTION_DB.md](FIX_PRODUCTION_DB.md)
- **Guide Flutter:** [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md)
- **Quick Start Flutter:** [DEPLOIEMENT_FLUTTER_QUICK_START.md](DEPLOIEMENT_FLUTTER_QUICK_START.md)

---

**Date:** 2026-01-12
**Problème:** Colonnes `is_phone_verified` et `phone_verified_at` manquantes
**Status:** ✅ Fichiers créés, prêt à déployer
