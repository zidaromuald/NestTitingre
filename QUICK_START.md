# Guide de Démarrage Rapide

## ✅ Ce qui a été fait

Toutes les entités de votre projet Laravel ont été créées dans NestJS avec leurs relations :

- ✅ User + UserProfil
- ✅ Societe + SocieteProfil
- ✅ Groupe + GroupeProfil + GroupeInvitation
- ✅ Post
- ✅ Notification
- ✅ TransactionCollaboration

## 📝 Prochaines étapes

### 1. Vérifier la configuration de la base de données

Ouvrez le fichier [.env](.env) et vérifiez :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=votre_mot_de_passe
DB_NAME=ma_base_nest
```

⚠️ **Important**: Remplacez `votre_mot_de_passe` par le vrai mot de passe PostgreSQL.

### 2. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE ma_base_nest;

# Quitter
\q
```

### 3. Générer les migrations

```bash
# Générer une migration à partir des entités
npm run migration:generate src/migrations/InitialSchema
```

Cette commande va créer automatiquement un fichier de migration avec toutes les tables.

### 4. Exécuter les migrations

```bash
# Appliquer les migrations à la base de données
npm run migration:run
```

### 5. Vérifier que tout fonctionne

```bash
# Démarrer le serveur en mode développement
npm run start:dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

---

## 🔧 Commandes Utiles

### Migrations

```bash
# Générer une nouvelle migration
npm run migration:generate src/migrations/NomDeLaMigration

# Créer une migration vide
npm run migration:create src/migrations/NomDeLaMigration

# Exécuter les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

### Base de données

```bash
# Synchroniser le schéma (DEV UNIQUEMENT - DANGER)
npm run schema:sync

# Supprimer toutes les tables (DANGER)
npm run schema:drop
```

---

## ⚠️ ATTENTION: Relations Polymorphiques

TypeORM ne gère pas automatiquement les relations polymorphiques comme Laravel.

### Relations concernées:

1. **Groupe.createur** (User ou Societe)
2. **Post.postedBy** (User ou Societe)
3. **TransactionCollaboration.partenaire** (User ou Societe)

### Exemple d'implémentation manuelle:

```typescript
// Dans un service
async getGroupeCreateur(groupe: Groupe) {
  if (groupe.created_by_type === 'User') {
    return this.userRepository.findOne({
      where: { id: groupe.created_by_id }
    });
  } else if (groupe.created_by_type === 'Societe') {
    return this.societeRepository.findOne({
      where: { id: groupe.created_by_id }
    });
  }
}
```

---

## 📋 Tables Pivot à Créer Manuellement

Les tables ManyToMany avec colonnes supplémentaires nécessitent des entités dédiées :

### 1. GroupeUser (groupe_user)

Créer : `src/modules/groupes/entities/groupe-user.entity.ts`

```typescript
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('groupe_user')
export class GroupeUser {
  @PrimaryColumn()
  groupe_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 50, default: 'membre' })
  role: string; // 'membre', 'moderateur', 'admin'

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // 'active', 'suspended', 'banned'

  @CreateDateColumn()
  joined_at: Date;
}
```

### 2. SocieteUser (societe_user)

Créer : `src/modules/societes/entities/societe-user.entity.ts`

```typescript
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('societe_user')
export class SocieteUser {
  @PrimaryColumn()
  societe_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 50, default: 'membre' })
  role: string; // 'membre', 'admin'

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
```

---

## 📦 Modules à Créer

Les entités sont créées, mais il manque les modules, services et controllers :

```bash
# Module Groupes
nest g module modules/groupes
nest g service modules/groupes/services/groupe --flat
nest g controller modules/groupes/controllers/groupe --flat

# Module Posts
nest g module modules/posts
nest g service modules/posts/services/post --flat
nest g controller modules/posts/controllers/post --flat

# Module Notifications
nest g module modules/notifications
nest g service modules/notifications/services/notification --flat
nest g controller modules/notifications/controllers/notification --flat

# Module Transactions
nest g module modules/transactions
nest g service modules/transactions/services/transaction --flat
nest g controller modules/transactions/controllers/transaction --flat
```

---

## 🧪 Test avec Postman

Une fois le serveur démarré, vous pouvez tester les endpoints existants :

### Authentification

```
POST http://localhost:3000/auth/register
POST http://localhost:3000/auth/login
```

### Utilisateurs

```
GET http://localhost:3000/users/search
GET http://localhost:3000/users/autocomplete
```

### Sociétés

```
GET http://localhost:3000/societes/search
GET http://localhost:3000/societes/filters
GET http://localhost:3000/societes/autocomplete
```

---

## 📚 Documentation Complète

Consultez [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) pour une documentation complète de toutes les entités et relations créées.

---

## ❓ Besoin d'aide ?

1. Vérifier les logs du serveur : `npm run start:dev`
2. Vérifier la connexion à la base de données
3. Consulter la documentation NestJS : https://docs.nestjs.com
4. Consulter la documentation TypeORM : https://typeorm.io
