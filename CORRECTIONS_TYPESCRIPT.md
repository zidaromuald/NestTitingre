# Corrections TypeScript à Appl

iquer

## Corrections Nécessaires

Il y a 18 erreurs TypeScript à corriger. Voici les corrections à appliquer :

### 1. ✅ DÉJÀ CORRIGÉ : polymorphic.helper.ts

```typescript
// Ligne 2 - Ajouter ObjectLiteral
import { Repository, ObjectLiteral } from 'typeorm';

// Ligne 36 - Ajouter contrainte de type
static async morphMany<T extends ObjectLiteral>(
```

### 2. Services Polymorphiques - Map<string, Repository<any>>

Dans **tous** les fichiers suivants, changer :
```typescript
const repositories = new Map([
```

En :
```typescript
const repositories = new Map<string, Repository<any>>([
```

**Fichiers à corriger :**
- `src/modules/groupes/services/groupe-polymorphic.service.ts` (ligne 36) ✅ DÉJÀ FAIT
- `src/modules/groupes/services/groupe-polymorphic.service.ts` (ligne 117 - méthode getGroupePostsWithAuthors)
- `src/modules/posts/services/post-polymorphic.service.ts` (ligne 32)
- `src/modules/posts/services/post-polymorphic.service.ts` (ligne 90)
- `src/modules/transactions/services/transaction-polymorphic.service.ts` (ligne 34)

### 3. auth.module.ts - expiresIn type

**Fichier:** `src/modules/auth/auth.module.ts` ligne 44

Changer :
```typescript
expiresIn: '7d',
```

En :
```typescript
expiresIn: 604800, // 7 jours en secondes
```

OU

```typescript
expiresIn: '7 days', // Format StringValue
```

###  4. services/*.service.ts - perPage possibly undefined

**Fichiers:**
- `src/modules/users/services/user.service.ts` ligne 83
- `src/modules/societes/services/societe.service.ts` lignes 86 et 121

Changer :
```typescript
const totalPages = Math.ceil(total / searchDto.perPage);
```

En :
```typescript
const totalPages = Math.ceil(total / (searchDto.perPage || 15));
```

### 5. transaction-polymorphic.service.ts - return type null

**Fichier:** `src/modules/transactions/services/transaction-polymorphic.service.ts` ligne 157-167

Changer le type de retour :
```typescript
async getTransactionWithActors(transactionId: number): Promise<{
  transaction: TransactionCollaboration;
  client: User | Societe | null;
  partenaire: User | Societe | null;
}>
```

En :
```typescript
async getTransactionWithActors(transactionId: number): Promise<{
  transaction: TransactionCollaboration | null;
  client: User | Societe | null;
  partenaire: User | Societe | null;
}>
```

### 6. Cache type deprecated

**Fichiers:**
- `src/modules/societes/services/societe.service.ts` ligne 8

Changer :
```typescript
import { Cache } from 'cache-manager';
```

En :
```typescript
import type { Cache } from 'cache-manager';
```

---

## Script de Correction Automatique

Pour appliquer toutes ces corrections automatiquement :

```bash
# À EXÉCUTER DANS LE TERMINAL

# 1. Corriger getGroupePostsWithAuthors
sed -i "s/const repositories = new Map(\[/const repositories = new Map<string, Repository<any>>([/g" src/modules/groupes/services/groupe-polymorphic.service.ts

# 2. Corriger PostPolymorphicService
sed -i "s/const repositories = new Map(\[/const repositories = new Map<string, Repository<any>>([/g" src/modules/posts/services/post-polymorphic.service.ts

# 3. Corriger TransactionPolymorphicService
sed -i "s/const repositories = new Map(\[/const repositories = new Map<string, Repository<any>>([/g" src/modules/transactions/services/transaction-polymorphic.service.ts

# 4. Corriger expiresIn
sed -i "s/expiresIn: '7d',/expiresIn: 604800, \/\/ 7 jours en secondes/g" src/modules/auth/auth.module.ts

# 5. Corriger perPage
sed -i "s/searchDto.perPage/(searchDto.perPage || 15)/g" src/modules/users/services/user.service.ts
sed -i "s/searchDto.perPage/(searchDto.perPage || 15)/g" src/modules/societes/services/societe.service.ts

# 6. Corriger import Cache
sed -i "s/import { Cache } from 'cache-manager';/import type { Cache } from 'cache-manager';/g" src/modules/societes/services/societe.service.ts
```

**Note:** Sur Windows, utilisez PowerShell :

```powershell
# Installer sed pour Windows si nécessaire
# Ou utiliser un éditeur de texte pour faire les remplacements manuellement
```

---

## Vérification Après Corrections

```bash
npm run build
```

Si tout est correct, vous devriez voir :
```
Successfully compiled!
```

---

## Alternative : Corrections Manuelles Rapides

Si vous préférez corriger manuellement, voici l'ordre recommandé :

1. ✅ `polymorphic.helper.ts` - DÉJÀ FAIT
2. ✅ `groupe-polymorphic.service.ts` ligne 36 - DÉJÀ FAIT
3. `groupe-polymorphic.service.ts` ligne 117
4. `post-polymorphic.service.ts` ligne 32 et 90
5. `transaction-polymorphic.service.ts` ligne 34 et type de retour ligne 157
6. `auth.module.ts` ligne 44
7. `user.service.ts` ligne 83
8. `societe.service.ts` lignes 8, 86, 121

---

## Après les corrections

Une fois toutes les corrections appliquées :

```bash
# 1. Vérifier la compilation
npm run build

# 2. Si succès, générer les migrations
npm run migration:generate src/migrations/InitialSchema

# 3. Exécuter les migrations
npm run migration:run

# 4. Démarrer le serveur
npm run start:dev
```
