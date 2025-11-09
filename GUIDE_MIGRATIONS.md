# Guide des Migrations TypeORM - Projet Titingre

## ✅ Configuration Terminée

Votre projet est maintenant configuré pour utiliser les **migrations TypeORM** au lieu de `synchronize: true`.

## 📋 Résumé des Changements

### 1. Fichier `.env` - Nouvelles variables

```env
NODE_ENV=development           # Environnement (development, production, test)
DB_SYNCHRONIZE=false          # Synchronize désactivé - utilisation des migrations
DB_LOGGING=true               # Logs SQL activés en développement
```

### 2. Fichier `database.config.ts` - Mode migrations

```typescript
synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
```

- ✅ `synchronize` est maintenant contrôlé par la variable d'environnement
- ✅ Par défaut `false` → utilisation obligatoire des migrations

### 3. Fichier `app.module.ts` - Migrations activées

```typescript
migrations: [__dirname + '/migrations/*{.ts,.js}'],
migrationsRun: true,  // Exécute automatiquement les migrations au démarrage
migrationsTableName: 'migrations',
```

## 📁 Structure des Migrations

### Ordre d'exécution des migrations:

Les migrations sont exécutées **dans l'ordre chronologique** par timestamp:

```
src/migrations/
├── 1730000000001-InitialSchema.ts                    ← 1. CRÉER toutes les tables de base
├── 1730000000000-AddAudiosColumnToPosts.ts           ← 2. Ajouter colonne audios
├── 1730550000000-UpdateSuivreEntityPolymorphic.ts    ← 3. Rendre Suivre polymorphique
├── 1730560000000-CreateInvitationSuiviTable.ts       ← 4. Créer table invitation_suivi
├── 1730561000000-UpdateInvitationSuiviSenderPolymorphic.ts  ← 5. Rendre sender polymorphique
├── 1730562000000-UpdateSuivreUserPolymorphic.ts      ← 6. Mise à jour Suivre user polymorphique
├── 1730563000000-CreateDemandeAbonnementTable.ts     ← 7. Créer table demande_abonnement
├── 1730564000000-UpdatePartenaritPermissions.ts      ← 8. Permissions partenariats
└── 1730565000000-UpdateNotificationsPolymorphic.ts   ← 9. Notifications polymorphiques
```

## 🚀 Comment Utiliser les Migrations

### Première Fois - Installation Complète

Si votre base de données PostgreSQL est **vide** ou **nouvelle**:

```bash
# 1. Créer la base de données (si pas encore créée)
psql -U postgres
CREATE DATABASE ma_base_nest;
\q

# 2. Démarrer l'application (les migrations s'exécutent automatiquement)
npm run start:dev
```

✅ TypeORM va:
1. Créer la table `migrations` pour tracker les migrations exécutées
2. Exécuter toutes les migrations dans l'ordre chronologique
3. Créer toutes les tables et colonnes dans PostgreSQL

### Vérifier l'État des Migrations

Pour voir quelles migrations ont été exécutées:

```sql
-- Dans PostgreSQL
SELECT * FROM migrations ORDER BY timestamp;
```

Résultat attendu:
| id | timestamp         | name                                    |
|----|-------------------|-----------------------------------------|
| 1  | 1730000000001     | InitialSchema1730000000001              |
| 2  | 1730000000000     | AddAudiosColumnToPosts1730000000000     |
| 3  | 1730550000000     | UpdateSuivreEntityPolymorphic...        |
| ... | ...             | ...                                     |

## 🔄 Workflow de Développement

### Lorsque vous modifiez une entité:

**Exemple**: Ajouter un nouveau champ `bio_longue` à `UserProfil`

#### 1. Modifier l'entité

```typescript
// src/modules/users/entities/user-profil.entity.ts
@Entity('user_profils')
export class UserProfil {
  // ...

  @Column({ type: 'text', nullable: true })
  bio_longue: string;  // ← NOUVEAU CHAMP
}
```

#### 2. Créer une nouvelle migration

```typescript
// src/migrations/1730566000000-AddBioLongueToUserProfil.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBioLongueToUserProfil1730566000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_profils
      ADD COLUMN bio_longue TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_profils
      DROP COLUMN bio_longue
    `);
  }
}
```

#### 3. Redémarrer l'application

```bash
npm run start:dev
```

✅ La migration s'exécute automatiquement au démarrage

## 🛑 Cas d'Urgence - Réinitialiser la Base

Si vous devez **tout recréer** depuis zéro:

```bash
# 1. Se connecter à PostgreSQL
psql -U postgres

# 2. Supprimer et recréer la base
DROP DATABASE ma_base_nest;
CREATE DATABASE ma_base_nest;
\q

# 3. Redémarrer l'application (migrations s'exécutent)
npm run start:dev
```

## 📊 Tables Créées par la Migration Initiale

La migration `InitialSchema` crée **24 tables**:

### Utilisateurs & Sociétés
- `users` - Utilisateurs
- `user_profils` - Profils utilisateurs
- `societes` - Sociétés
- `societe_profils` - Profils sociétés
- `societe_users` - Relation Many-to-Many users ↔ sociétés

### Groupes
- `groupes` - Groupes
- `groupe_profils` - Profils de groupes
- `groupe_users` - Membres des groupes
- `groupe_invitations` - Invitations de groupes

### Posts & Interactions
- `posts` - Publications
- `likes` - Likes sur posts
- `commentaires` - Commentaires sur posts

### Suivis & Abonnements
- `suivis` - Relations de suivi
- `invitations_suivi` - Invitations de suivi
- `abonnements` - Abonnements User ↔ Societe
- `demandes_abonnement` - Demandes d'abonnement

### Partenariats
- `pages_partenariat` - Pages de partenariat
- `transactions_partenariat` - Transactions commerciales
- `informations_partenaires` - Informations des partenaires

### Transactions & Messages
- `transactions_collaboration` - Transactions de collaboration
- `conversations` - Conversations
- `messages_collaboration` - Messages privés

### Notifications (créées par migration UpdateNotificationsPolymorphic)
- `notifications` - Notifications
- `notification_preferences` - Préférences de notifications

## 🔍 Vérifier les Tables dans PostgreSQL

```sql
-- Lister toutes les tables
\dt

-- Voir la structure d'une table
\d users

-- Compter les enregistrements
SELECT COUNT(*) FROM migrations;
```

## ⚠️ Important - En Production

Quand vous déployez en production:

### 1. Désactiver `migrationsRun: true`

```typescript
// app.module.ts - PRODUCTION UNIQUEMENT
migrationsRun: false,  // Ne pas exécuter automatiquement
```

### 2. Exécuter les migrations manuellement

```bash
# Avant de démarrer l'application
npm run migration:run

# Puis démarrer
npm run start:prod
```

Cela vous permet de:
- Vérifier les migrations avant exécution
- Faire un backup de la base avant changements
- Contrôler le moment exact de l'exécution

## 📝 Commandes Utiles (À Ajouter au package.json)

```json
{
  "scripts": {
    "migration:run": "ts-node -r tsconfig-paths/register node_modules/typeorm/cli.js migration:run -d src/data-source.ts",
    "migration:revert": "ts-node -r tsconfig-paths/register node_modules/typeorm/cli.js migration:revert -d src/data-source.ts",
    "migration:show": "ts-node -r tsconfig-paths/register node_modules/typeorm/cli.js migration:show -d src/data-source.ts"
  }
}
```

## ✅ Prochaines Étapes

1. **Démarrer l'application**: `npm run start:dev`
2. **Vérifier les logs** pour voir les migrations s'exécuter
3. **Vérifier dans PostgreSQL** que toutes les tables sont créées
4. **Tester vos endpoints** pour vérifier que tout fonctionne

## 🆘 Problèmes Fréquents

### Erreur: "relation already exists"

**Cause**: Vous avez déjà des tables créées par `synchronize: true`

**Solution**:
```bash
# Supprimer toutes les tables existantes
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Redémarrer l'application
npm run start:dev
```

### Erreur: "migration already executed"

**Cause**: La migration est déjà dans la table `migrations`

**Solution**:
```sql
-- Supprimer l'entrée de la table migrations
DELETE FROM migrations WHERE name = 'NomDeLaMigration';
```

---

**Votre projet est maintenant prêt à utiliser les migrations! 🎉**
