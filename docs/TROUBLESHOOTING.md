# Guide de Dépannage - Erreur "La table posts n'existe pas"

## ❌ Erreur Rencontrée

```
QueryFailedError: la relation « posts » n'existe pas
```

## 🔍 Causes Possibles

### 1. Les migrations n'ont pas été exécutées

**Solution :**
```bash
npm run migration:run
```

### 2. Connexion à la mauvaise base de données

**Vérification :**
```bash
# Vérifier les variables d'environnement
cat .env | grep DB_

# Doit afficher :
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=titingredb
# DB_NAME=titingre_db
```

### 3. L'application NestJS est démarrée avant les migrations

**Solution :**
1. Arrêter l'application (Ctrl+C)
2. Exécuter les migrations :
```bash
npm run migration:run
```
3. Redémarrer l'application :
```bash
npm run start:dev
```

### 4. TypeORM synchronize est activé et cause des conflits

**Vérification dans .env :**
```bash
DB_SYNCHRONIZE=false  # DOIT être false
```

---

## ✅ Solution Complète Étape par Étape

### Étape 1 : Arrêter l'application

Si l'application tourne, arrêtez-la avec `Ctrl+C`.

### Étape 2 : Vérifier la connexion à PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres -d titingre_db

# Vérifier si la table posts existe
\dt posts

# Si la table n'existe pas, vous verrez :
# Did not find any relation named "posts"

# Quitter psql
\q
```

### Étape 3 : Exécuter les migrations

```bash
npm run migration:run
```

**Sortie attendue :**
```
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
12 migrations are already loaded in the database.
No migrations are pending
```

### Étape 4 : Vérifier que la table a été créée

```bash
# Méthode 1 : Via psql
psql -U postgres -d titingre_db -c "\d posts"

# Méthode 2 : Via TypeORM CLI
npm run typeorm -- query "SELECT COUNT(*) FROM posts" -d src/config/typeorm.config.ts
```

### Étape 5 : Redémarrer l'application

```bash
npm run start:dev
```

### Étape 6 : Tester la création d'un post

```bash
# 1. Se connecter et obtenir un token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' \
  | jq -r '.access_token')

# 2. Créer un post
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contenu": "Test post"}'
```

---

## 🔧 Autres Vérifications

### Vérifier les entités enregistrées dans app.module.ts

Le fichier `src/app.module.ts` doit contenir :

```typescript
entities: [
  // ... autres entités
  Post,
  Like,
  Commentaire,
  // ...
],
```

### Vérifier que l'entité Post est bien importée

Dans `src/app.module.ts` :

```typescript
import { Post } from './modules/posts/entities/post.entity';
import { Like } from './modules/posts/entities/like.entity';
import { Commentaire } from './modules/posts/entities/commentaire.entity';
```

### Vérifier la configuration TypeORM

Dans `src/app.module.ts`, la configuration doit utiliser les bonnes variables :

```typescript
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.name'),
    entities: [Post, Like, Commentaire, /* ... */],
    synchronize: false, // IMPORTANT !
    logging: true,
  }),
}),
```

---

## 🗄️ Réinitialiser Complètement la Base de Données (SI NÉCESSAIRE)

⚠️ **ATTENTION : Cela supprimera TOUTES les données !**

```bash
# 1. Se connecter à PostgreSQL
psql -U postgres

# 2. Supprimer et recréer la base de données
DROP DATABASE IF EXISTS titingre_db;
CREATE DATABASE titingre_db;

# 3. Quitter psql
\q

# 4. Exécuter les migrations
npm run migration:run

# 5. Redémarrer l'application
npm run start:dev
```

---

## 📊 Commandes Utiles de Diagnostic

### Lister toutes les tables de la base de données

```bash
npm run typeorm -- query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name" -d src/config/typeorm.config.ts
```

### Voir le schéma de la table posts

```bash
psql -U postgres -d titingre_db -c "\d posts"
```

### Compter les migrations exécutées

```bash
psql -U postgres -d titingre_db -c "SELECT COUNT(*) FROM migrations"
```

### Voir toutes les migrations exécutées

```bash
psql -U postgres -d titingre_db -c "SELECT * FROM migrations ORDER BY id"
```

### Vérifier la connexion à la base de données

```bash
psql -U postgres -d titingre_db -c "SELECT current_database(), current_user, version()"
```

---

## 🐛 Mode Debug

Pour activer le mode debug complet de TypeORM, modifiez temporairement `.env` :

```env
DB_LOGGING=true
```

Puis redémarrez l'application. Vous verrez toutes les requêtes SQL dans la console.

---

## 📝 Checklist Complète

- [ ] PostgreSQL est démarré
- [ ] La base de données `titingre_db` existe
- [ ] Les variables d'environnement sont correctes dans `.env`
- [ ] `DB_SYNCHRONIZE=false` dans `.env`
- [ ] Les migrations ont été exécutées (`npm run migration:run`)
- [ ] La table `posts` existe (vérifier avec `\d posts`)
- [ ] L'entité `Post` est importée dans `app.module.ts`
- [ ] L'application a été redémarrée après les migrations
- [ ] Le token JWT est valide

---

## 🎯 Solution Rapide (TL;DR)

```bash
# 1. Arrêter l'app (Ctrl+C)

# 2. Exécuter les migrations
npm run migration:run

# 3. Redémarrer l'app
npm run start:dev

# 4. Tester
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contenu": "Test"}'
```

---

## 📞 Si le problème persiste

1. Vérifier les logs de PostgreSQL
2. Vérifier que vous êtes bien connecté à la bonne base de données
3. Essayer de créer manuellement la table avec le SQL de migration
4. Vérifier les permissions de l'utilisateur PostgreSQL

Pour plus d'aide, consultez :
- [Documentation TypeORM](https://typeorm.io)
- [Documentation NestJS](https://docs.nestjs.com)
