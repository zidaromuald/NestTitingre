# Fix Production Database - Colonnes Manquantes

## 🔴 Problème Identifié

```
QueryFailedError: column User.is_phone_verified does not exist
```

Les colonnes `is_phone_verified` et `phone_verified_at` sont définies dans l'entity User mais **n'existent pas dans la base de données de production**.

---

## 🔧 Solution Rapide (À exécuter sur le VPS)

### ⚡ Méthode Automatique: Script Tout-en-Un (RECOMMANDÉ)

J'ai créé un script qui fait tout automatiquement!

```bash
# Sur votre machine Windows (dans le projet backend)
cd c:\Projets\titingre\backtiting

# Rendre le script exécutable (si sur Linux/Mac)
chmod +x fix-phone-verification.sh

# Exécuter le script (il va tout faire automatiquement)
./fix-phone-verification.sh
```

Le script va:
1. ✅ Build le projet localement
2. ✅ Commit et push les nouvelles migrations
3. ✅ Déployer sur le VPS
4. ✅ Exécuter les migrations
5. ✅ Redémarrer l'API
6. ✅ Tester que tout fonctionne

### Méthode 1: Via TypeORM Migrations (Manuelle)

```bash
# Se connecter au VPS
ssh zidar@votre-ip-vps

# Aller dans le dossier de l'API
cd ~/apps/titingre-api

# Pull les dernières migrations
git pull origin main

# Build le projet
npm run build

# Vérifier les migrations en attente
npm run migration:show

# Exécuter TOUTES les migrations en attente
npm run migration:run

# Vérifier que la migration a bien été appliquée
npm run migration:show
```

### Méthode 2: SQL Direct avec fichier (Si la migration ne fonctionne pas)

J'ai aussi créé un fichier SQL prêt à l'emploi!

```bash
# Sur votre machine locale
cd c:\Projets\titingre\backtiting

# Copier le fichier SQL sur le VPS
scp fix-phone-verification.sql zidar@votre-ip-vps:~/

# Se connecter au VPS
ssh zidar@votre-ip-vps

# Exécuter le script SQL
psql -U api_userzr -d titingre_db -f ~/fix-phone-verification.sql

# Redémarrer l'API
pm2 restart titingre-api
```

### Méthode 3: SQL Direct Manuel

```bash
# Se connecter au VPS
ssh zidar@votre-ip-vps

# Se connecter à PostgreSQL
psql -U api_userzr -d titingre_db

# Exécuter ce SQL pour la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP NULL;

# Exécuter ce SQL pour la table societes
ALTER TABLE societes
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP NULL;

# Vérifier que les colonnes ont été ajoutées
\d users
\d societes

# Quitter psql
\q
```

### Étape 3: Redémarrer l'API

```bash
# Redémarrer PM2
pm2 restart titingre-api

# Vérifier que tout fonctionne
pm2 logs titingre-api --lines 50
```

---

## 📝 Vérification

### 1. Tester l'inscription depuis le terminal

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

Vous devriez recevoir une réponse JSON avec le user créé (ou une erreur si l'email/téléphone existe déjà).

### 2. Vérifier depuis Flutter

Essayez de créer un compte depuis votre app Flutter Web. L'erreur devrait avoir disparu!

---

## 🚀 Prévenir ce problème à l'avenir

### 1. Créer une migration pour societes

Si la migration pour `societes` n'existe pas:

```bash
# Sur votre machine de développement
cd c:\Projets\titingre\backtiting

# Créer une nouvelle migration
npm run migration:generate -- src/migrations/AddPhoneVerificationToSocietes
```

Contenu de la migration:

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneVerificationToSocietes1736683300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne is_phone_verified
    await queryRunner.addColumn(
      'societes',
      new TableColumn({
        name: 'is_phone_verified',
        type: 'boolean',
        default: false,
      }),
    );

    // Ajouter la colonne phone_verified_at
    await queryRunner.addColumn(
      'societes',
      new TableColumn({
        name: 'phone_verified_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('societes', 'phone_verified_at');
    await queryRunner.dropColumn('societes', 'is_phone_verified');
  }
}
```

### 2. Procédure de déploiement complète

**À chaque déploiement, suivre ces étapes:**

```bash
# 1. Sur votre machine locale - Build et commit
npm run build
git add .
git commit -m "Update: description des changements"
git push

# 2. Sur le VPS - Pull et rebuild
ssh zidar@votre-ip-vps
cd ~/apps/titingre-api

# Pull les derniers changements
git pull origin main

# Installer les dépendances (si package.json a changé)
npm install

# Build le projet
npm run build

# IMPORTANT: Exécuter les migrations AVANT de redémarrer
npm run migration:run

# Redémarrer l'application
pm2 restart titingre-api

# Vérifier les logs
pm2 logs titingre-api --lines 50
```

---

## 🔍 Diagnostic Complet

### Commandes utiles pour diagnostiquer les problèmes de DB

```bash
# Sur le VPS

# 1. Lister toutes les colonnes de la table users
psql -U api_userzr -d titingre_db -c "\d users"

# 2. Lister toutes les colonnes de la table societes
psql -U api_userzr -d titingre_db -c "\d societes"

# 3. Voir l'historique des migrations
psql -U api_userzr -d titingre_db -c "SELECT * FROM migrations ORDER BY id DESC;"

# 4. Vérifier si les colonnes existent
psql -U api_userzr -d titingre_db -c "
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name LIKE '%phone%';"
```

---

## ⚠️ Notes Importantes

### Pourquoi ce problème est arrivé?

1. **Développement local**: Les colonnes ont été ajoutées via l'entity
2. **synchronize: false en production**: TypeORM ne crée pas automatiquement les colonnes
3. **Migration non exécutée**: La migration existe mais n'a pas été appliquée sur le serveur

### Configuration TypeORM en production

Dans votre [typeorm.config.ts](src/config/typeorm.config.ts:20-24), vous avez correctement:

```typescript
// En Production (NODE_ENV=production)
synchronize: false  // ✅ CORRECT - Évite la perte de données
```

Cela signifie que **vous DEVEZ exécuter manuellement les migrations** après chaque déploiement qui modifie la structure de la base de données.

---

## 📋 Checklist de Déploiement

Avant chaque déploiement en production:

- [ ] Code buildé localement sans erreur (`npm run build`)
- [ ] Tests passent (`npm test`)
- [ ] Migrations générées si nécessaire (`npm run migration:generate`)
- [ ] Code committé et poussé sur Git
- [ ] **Sur le VPS**: Code pullé (`git pull`)
- [ ] **Sur le VPS**: Dépendances installées (`npm install`)
- [ ] **Sur le VPS**: Projet buildé (`npm run build`)
- [ ] **Sur le VPS**: Migrations exécutées (`npm run migration:run`) ⚠️ CRUCIAL
- [ ] **Sur le VPS**: Application redémarrée (`pm2 restart titingre-api`)
- [ ] **Sur le VPS**: Logs vérifiés (`pm2 logs titingre-api`)
- [ ] Test de l'API fonctionnel

---

## 🎯 Action Immédiate

**Exécutez maintenant sur votre VPS:**

```bash
ssh zidar@votre-ip-vps
cd ~/apps/titingre-api
npm run migration:run
pm2 restart titingre-api
pm2 logs titingre-api
```

Puis testez l'inscription depuis votre application Flutter!

---

**Date de création:** 2026-01-12
**Problème résolu:** Colonne `is_phone_verified` manquante dans la table `users`
