# Résumé de la Migration Laravel vers NestJS

## Entités Créées

Toutes les entités de votre projet Laravel ont été créées dans NestJS avec leurs relations complètes.

### ✅ Entités Principales

1. **User** ([src/modules/users/entities/user.entity.ts](src/modules/users/entities/user.entity.ts))
   - Relations: profile, societes, groupes, invitations, notifications, transactions

2. **UserProfil** ([src/modules/users/entities/user-profil.entity.ts](src/modules/users/entities/user-profil.entity.ts))
   - Relation OneToOne avec User

3. **Societe** ([src/modules/societes/entities/societe.entity.ts](src/modules/societes/entities/societe.entity.ts))
   - Relations: profile, membres, transactions

4. **SocieteProfil** ([src/modules/societes/entities/societe-profil.entity.ts](src/modules/societes/entities/societe-profil.entity.ts))
   - Relation OneToOne avec Societe

### ✅ Module Groupes

5. **Groupe** ([src/modules/groupes/entities/groupe.entity.ts](src/modules/groupes/entities/groupe.entity.ts))
   - Relations: profil, membres, adminDesigne, invitations, posts
   - Relations polymorphiques pour le créateur (User ou Societe)

6. **GroupeProfil** ([src/modules/groupes/entities/groupe-profil.entity.ts](src/modules/groupes/entities/groupe-profil.entity.ts))
   - Relation OneToOne avec Groupe

7. **GroupeInvitation** ([src/modules/groupes/entities/groupe-invitation.entity.ts](src/modules/groupes/entities/groupe-invitation.entity.ts))
   - Relations: groupe, invitedUser, invitedByUser

### ✅ Module Posts

8. **Post** ([src/modules/posts/entities/post.entity.ts](src/modules/posts/entities/post.entity.ts))
   - Relation avec Groupe
   - Relations polymorphiques pour l'auteur (User ou Societe)

### ✅ Module Notifications

9. **Notification** ([src/modules/notifications/entities/notification.entity.ts](src/modules/notifications/entities/notification.entity.ts))
   - Relation ManyToOne avec User

### ✅ Module Transactions

10. **TransactionCollaboration** ([src/modules/transactions/entities/transaction-collaboration.entity.ts](src/modules/transactions/entities/transaction-collaboration.entity.ts))
    - Relations: user, societe
    - Relations polymorphiques pour le partenaire (User ou Societe)

---

## Relations Implémentées

### User Relations
- ✅ OneToOne: profile (UserProfil)
- ✅ ManyToMany: societes (Societe)
- ✅ ManyToMany: groupes (Groupe)
- ✅ OneToMany: invitationsRecues (GroupeInvitation)
- ✅ OneToMany: invitationsEnvoyees (GroupeInvitation)
- ✅ OneToMany: notifications (Notification)
- ✅ OneToMany: transactionsCollaboration (TransactionCollaboration)
- ✅ Polymorphique: groupesCrees, posts, transactionsCommePartenaire

### Societe Relations
- ✅ OneToOne: profile (SocieteProfil)
- ✅ ManyToMany: membres (User)
- ✅ OneToMany: transactionsCollaboration (TransactionCollaboration)
- ✅ Polymorphique: groupesCrees, posts, transactionsCommePartenaire

### Groupe Relations
- ✅ OneToOne: profil (GroupeProfil)
- ✅ ManyToMany: membres (User)
- ✅ ManyToOne: adminDesigne (User)
- ✅ OneToMany: invitations (GroupeInvitation)
- ✅ OneToMany: posts (Post)
- ✅ Polymorphique: createur (User ou Societe)

---

## ⚠️ IMPORTANT: Relations Polymorphiques

TypeORM ne supporte pas nativement les relations polymorphiques comme Laravel.
Les relations suivantes sont gérées **manuellement** via des colonnes `_type` et `_id`:

1. **Groupe.createur** (User ou Societe)
   - Colonnes: `created_by_id`, `created_by_type`

2. **Post.postedBy** (User ou Societe)
   - Colonnes: `posted_by_id`, `posted_by_type`

3. **TransactionCollaboration.partenaire** (User ou Societe)
   - Colonnes: `partenaire_id`, `partenaire_type`

### Comment gérer ces relations:

```typescript
// Exemple: Récupérer le créateur d'un groupe
async getGroupeCreateur(groupe: Groupe) {
  if (groupe.created_by_type === 'User') {
    return this.userRepository.findOne({ where: { id: groupe.created_by_id } });
  } else if (groupe.created_by_type === 'Societe') {
    return this.societeRepository.findOne({ where: { id: groupe.created_by_id } });
  }
}
```

---

## Tables Pivot (ManyToMany)

Ces tables seront créées automatiquement par TypeORM lors des migrations:

1. **societe_user**
   - Colonnes: user_id, societe_id
   - Pivot pour: User ↔ Societe
   - **TODO**: Ajouter colonnes pivot: role, status

2. **groupe_user**
   - Colonnes: groupe_id, user_id
   - Pivot pour: User ↔ Groupe
   - **TODO**: Ajouter colonnes pivot: role, joined_at, status

---

## ⚠️ Configuration Base de Données

### Problème identifié dans .env

Vous avez mentionné vouloir utiliser **"Postman"** comme base de données.
**ERREUR**: Postman est un outil de test d'API, pas une base de données!

### Configuration actuelle (.env):
```env
DB_HOST=localhost
DB_PORT=5432          # Port PostgreSQL
DB_USER=postgres
DB_PASS=motdepasse
DB_NAME=ma_base_nest
```

### Options:

#### Option 1: Utiliser PostgreSQL (configuration actuelle)
```bash
# Installer le driver PostgreSQL
npm install pg
```

#### Option 2: Utiliser MySQL (comme Laravel)
```env
# Modifier le .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=votre_mot_de_passe
DB_NAME=ma_base_nest
```

```bash
# Installer le driver MySQL
npm install mysql2
```

Puis modifier [src/app.module.ts:21](src/app.module.ts#L21):
```typescript
type: 'mysql' as const,  // Changer de 'postgres' à 'mysql'
```

---

## Prochaines Étapes

### 1. Installer le driver de base de données

```bash
# Pour PostgreSQL
npm install pg

# OU pour MySQL
npm install mysql2
```

### 2. Créer les migrations

TypeORM peut générer automatiquement les migrations à partir de vos entités:

```bash
# Générer une migration
npm run typeorm migration:generate -- -n InitialSchema

# Exécuter les migrations
npm run typeorm migration:run
```

**NOTE**: Vous devez d'abord configurer les scripts dans package.json:

```json
"scripts": {
  "typeorm": "typeorm-ts-node-commonjs",
  "migration:generate": "npm run typeorm migration:generate -- -d src/config/typeorm.config.ts",
  "migration:run": "npm run typeorm migration:run -- -d src/config/typeorm.config.ts"
}
```

### 3. Créer un fichier de configuration TypeORM

Créer [src/config/typeorm.config.ts](src/config/typeorm.config.ts):

```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();
const configService = new ConfigService();

export default new DataSource({
  type: 'postgres', // ou 'mysql'
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASS'),
  database: configService.get('DB_NAME'),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
});
```

### 4. Tables Pivot personnalisées

Pour les colonnes pivot supplémentaires (role, status, etc.), vous devrez créer des entités dédiées:

```typescript
// src/modules/groupes/entities/groupe-user.entity.ts
@Entity('groupe_user')
export class GroupeUser {
  @PrimaryColumn()
  groupe_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 50, default: 'membre' })
  role: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;
}
```

### 5. Créer les modules manquants

Les modules suivants doivent être créés avec leurs services et controllers:

- [ ] GroupesModule
- [ ] PostsModule
- [ ] NotificationsModule
- [ ] TransactionsModule

Exemple de commande NestJS CLI:
```bash
nest g module modules/groupes
nest g service modules/groupes/services/groupe
nest g controller modules/groupes/controllers/groupe
```

---

## Structure des Fichiers Créés

```
src/
├── modules/
│   ├── users/
│   │   └── entities/
│   │       ├── user.entity.ts ✅
│   │       └── user-profil.entity.ts ✅
│   ├── societes/
│   │   └── entities/
│   │       ├── societe.entity.ts ✅
│   │       └── societe-profil.entity.ts ✅
│   ├── groupes/ ✅ (nouveau)
│   │   └── entities/
│   │       ├── groupe.entity.ts ✅
│   │       ├── groupe-profil.entity.ts ✅
│   │       └── groupe-invitation.entity.ts ✅
│   ├── posts/ ✅ (nouveau)
│   │   └── entities/
│   │       └── post.entity.ts ✅
│   ├── notifications/ ✅ (nouveau)
│   │   └── entities/
│   │       └── notification.entity.ts ✅
│   └── transactions/ ✅ (nouveau)
│       └── entities/
│           └── transaction-collaboration.entity.ts ✅
```

---

## Différences Laravel vs NestJS

| Aspect | Laravel | NestJS/TypeORM |
|--------|---------|----------------|
| Relations polymorphiques | Natif avec `morphTo()` | Manuel via colonnes _type/_id |
| Pivot personnalisé | Via `withPivot()` | Créer une entité dédiée |
| Accessors/Mutators | `get...Attribute()` | Getters/Setters TS natifs |
| Scopes | `scopeName()` | Méthodes du Repository |
| Migrations | Fichiers PHP | Fichiers TypeScript |
| Synchronize | ❌ Production | ⚠️ Dev uniquement |

---

## Commandes Utiles

```bash
# Vérifier la configuration TypeORM
npm run typeorm -- --help

# Voir le schéma SQL généré
npm run typeorm schema:log

# Synchroniser la BDD (DANGER: dev uniquement)
npm run typeorm schema:sync

# Créer une migration vide
npm run typeorm migration:create -- -n NomDeLaMigration
```

---

## Checklist Finale

- [x] Créer toutes les entités
- [x] Ajouter toutes les relations
- [ ] Installer le driver de base de données
- [ ] Configurer TypeORM pour les migrations
- [ ] Générer les migrations initiales
- [ ] Créer les entités pivot personnalisées
- [ ] Créer les modules manquants (services/controllers)
- [ ] Tester les relations en environnement de développement
- [ ] Implémenter la logique des relations polymorphiques

---

## Support et Documentation

- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation TypeORM](https://typeorm.io/)
- [TypeORM Relations](https://typeorm.io/relations)
- [NestJS Database Guide](https://docs.nestjs.com/techniques/database)
