# Guide des Relations Polymorphiques dans NestJS

## 📚 Introduction

TypeORM ne gère pas nativement les relations polymorphiques comme Laravel (`morphTo`, `morphMany`).
J'ai créé un système complet pour reproduire ce comportement.

---

## 🏗️ Architecture

### Fichiers créés

1. **[src/common/helpers/polymorphic.helper.ts](src/common/helpers/polymorphic.helper.ts)**
   - Helper principal pour gérer les relations polymorphiques
   - Classe `PolymorphicHelper` avec méthodes utilitaires
   - Enum `PolymorphicTypes` pour les types constants

2. **[src/modules/groupes/services/groupe-polymorphic.service.ts](src/modules/groupes/services/groupe-polymorphic.service.ts)**
   - Gère les relations polymorphiques des Groupes
   - Créateur (User ou Societe)
   - Posts du groupe avec auteurs

3. **[src/modules/posts/services/post-polymorphic.service.ts](src/modules/posts/services/post-polymorphic.service.ts)**
   - Gère les relations polymorphiques des Posts
   - Auteur (User ou Societe)

4. **[src/modules/transactions/services/transaction-polymorphic.service.ts](src/modules/transactions/services/transaction-polymorphic.service.ts)**
   - Gère les relations polymorphiques des Transactions
   - Partenaire (User ou Societe)

---

## 📖 Comment utiliser

### 1. Relations Polymorphiques dans les Entités

Dans vos entités, les relations polymorphiques sont représentées par 2 colonnes :

```typescript
@Entity('groupes')
export class Groupe {
  @Column({ type: 'int' })
  created_by_id: number;  // ID de l'entité

  @Column({ type: 'varchar', length: 100 })
  created_by_type: string;  // Type: 'User' ou 'Societe'
}
```

### 2. Récupérer une relation polymorphique (morphTo)

**Laravel:**
```php
$createur = $groupe->createur;  // Retourne User ou Societe
```

**NestJS:**
```typescript
import { GroupePolymorphicService } from './services/groupe-polymorphic.service';

// Dans un service ou controller
constructor(
  private readonly groupePolymorphicService: GroupePolymorphicService,
) {}

// Récupérer le créateur
const createur = await this.groupePolymorphicService.getCreateur(groupe);

if (createur) {
  // createur peut être User ou Societe
  console.log(createur instanceof User);  // true ou false
  console.log(createur instanceof Societe);  // true ou false
}
```

### 3. Récupérer des entités par relation polymorphique (morphMany)

**Laravel:**
```php
// Tous les groupes créés par un user
$groupes = $user->groupesCrees;
```

**NestJS:**
```typescript
// Tous les groupes créés par un user
const groupes = await this.groupePolymorphicService.getGroupesByUser(userId);

// Tous les groupes créés par une société
const groupes = await this.groupePolymorphicService.getGroupesBySociete(societeId);
```

### 4. Créer une entité avec relation polymorphique

**Laravel:**
```php
$groupe = Groupe::create([
    'nom' => 'Mon groupe',
    'created_by_id' => $user->id,
    'created_by_type' => User::class,
]);
```

**NestJS:**
```typescript
// Créer un groupe avec un créateur
const groupe = await this.groupePolymorphicService.createGroupeWithCreateur(
  {
    nom: 'Mon groupe',
    description: 'Description',
    type: GroupeType.PUBLIC,
  },
  user,  // Peut être User ou Societe
);
```

---

## 🔥 Exemples Pratiques

### Exemple 1: Afficher les posts d'un groupe avec leurs auteurs

```typescript
import { PostPolymorphicService } from './services/post-polymorphic.service';
import { GroupePolymorphicService } from './services/groupe-polymorphic.service';

@Injectable()
export class GroupeService {
  constructor(
    private readonly groupePolymorphicService: GroupePolymorphicService,
  ) {}

  async getGroupeWithPosts(groupeId: number) {
    const postsWithAuthors =
      await this.groupePolymorphicService.getGroupePostsWithAuthors(groupeId);

    return postsWithAuthors.map(({ post, author }) => ({
      id: post.id,
      contenu: post.contenu,
      author: {
        id: author.id,
        nom: author instanceof User ? author.nom : author.nom_societe,
        type: author instanceof User ? 'User' : 'Societe',
      },
    }));
  }
}
```

### Exemple 2: Créer un post

```typescript
@Injectable()
export class PostService {
  constructor(
    private readonly postPolymorphicService: PostPolymorphicService,
  ) {}

  async createPost(
    contenu: string,
    author: User | Societe,
    groupeId?: number,
  ) {
    return this.postPolymorphicService.createPostWithAuthor(
      {
        contenu,
        groupe_id: groupeId,
      },
      author,
    );
  }
}
```

### Exemple 3: Gérer les transactions

```typescript
@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionPolymorphicService: TransactionPolymorphicService,
  ) {}

  // Créer une transaction
  async createTransaction(
    client: User | Societe,
    partenaire: User | Societe,
    data: Partial<TransactionCollaboration>,
  ) {
    return this.transactionPolymorphicService.createTransactionWithPartner(
      data,
      client,
      partenaire,
    );
  }

  // Récupérer toutes les transactions d'un user
  async getAllUserTransactions(userId: number) {
    return this.transactionPolymorphicService.getAllTransactionsByUser(userId);
  }

  // Récupérer une transaction avec tous ses acteurs
  async getTransactionDetails(transactionId: number) {
    const { transaction, client, partenaire } =
      await this.transactionPolymorphicService.getTransactionWithActors(transactionId);

    return {
      id: transaction.id,
      titre: transaction.titre,
      montant: transaction.montant,
      client: {
        id: client.id,
        nom: client instanceof User ? client.nom : client.nom_societe,
        type: client instanceof User ? 'User' : 'Societe',
      },
      partenaire: {
        id: partenaire.id,
        nom: partenaire instanceof User ? partenaire.nom : partenaire.nom_societe,
        type: partenaire instanceof User ? 'User' : 'Societe',
      },
    };
  }
}
```

### Exemple 4: Vérifier les permissions

```typescript
@Injectable()
export class GroupeService {
  constructor(
    private readonly groupePolymorphicService: GroupePolymorphicService,
  ) {}

  async canUserManageGroupe(groupeId: number, userId: number): Promise<boolean> {
    const groupe = await this.groupeRepository.findOne({
      where: { id: groupeId },
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['societes'],
    });

    return this.groupePolymorphicService.canManageGroupe(
      groupe,
      user,
      user.societes,
    );
  }
}
```

---

## 🎯 Comparaison Laravel vs NestJS

### Créateur de Groupe

**Laravel:**
```php
// Récupérer le créateur
$createur = $groupe->createur;

// Créer un groupe
$user->groupesCrees()->create([...]);
```

**NestJS:**
```typescript
// Récupérer le créateur
const createur = await groupePolymorphicService.getCreateur(groupe);

// Créer un groupe
const groupe = await groupePolymorphicService.createGroupeWithCreateur({...}, user);
```

### Posts polymorphiques

**Laravel:**
```php
// Récupérer l'auteur
$auteur = $post->postedBy;

// Tous les posts d'un user
$posts = $user->posts;
```

**NestJS:**
```typescript
// Récupérer l'auteur
const auteur = await postPolymorphicService.getAuthor(post);

// Tous les posts d'un user
const posts = await postPolymorphicService.getPostsByUser(userId);
```

### Transactions polymorphiques

**Laravel:**
```php
// Toutes les transactions d'un user
$transactions = $user->toutesTransactionsCollaboration();
```

**NestJS:**
```typescript
// Toutes les transactions d'un user
const transactions = await transactionPolymorphicService.getAllTransactionsByUser(userId);
```

---

## ⚙️ Configuration des Modules

Pour utiliser les services polymorphiques, vous devez les ajouter aux modules :

### GroupesModule

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Groupe } from './entities/groupe.entity';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';
import { Post } from '../posts/entities/post.entity';
import { GroupePolymorphicService } from './services/groupe-polymorphic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Groupe, User, Societe, Post]),
  ],
  providers: [GroupePolymorphicService],
  exports: [GroupePolymorphicService],
})
export class GroupesModule {}
```

### PostsModule

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';
import { PostPolymorphicService } from './services/post-polymorphic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Societe]),
  ],
  providers: [PostPolymorphicService],
  exports: [PostPolymorphicService],
})
export class PostsModule {}
```

### TransactionsModule

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionCollaboration } from './entities/transaction-collaboration.entity';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';
import { TransactionPolymorphicService } from './services/transaction-polymorphic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionCollaboration, User, Societe]),
  ],
  providers: [TransactionPolymorphicService],
  exports: [TransactionPolymorphicService],
})
export class TransactionsModule {}
```

---

## 🚀 Utilisation dans un Controller

```typescript
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { GroupePolymorphicService } from '../services/groupe-polymorphic.service';
import { User } from '../../users/entities/user.entity';

@Controller('groupes')
@UseGuards(JwtAuthGuard)
export class GroupeController {
  constructor(
    private readonly groupePolymorphicService: GroupePolymorphicService,
  ) {}

  @Get(':id/creator')
  async getGroupeCreator(@Param('id') id: number) {
    const groupe = await this.groupeRepository.findOne({ where: { id } });
    const createur = await this.groupePolymorphicService.getCreateur(groupe);

    return {
      id: createur.id,
      nom: createur instanceof User ? createur.nom : createur.nom_societe,
      type: createur instanceof User ? 'User' : 'Societe',
    };
  }

  @Post()
  async createGroupe(
    @Body() data: CreateGroupeDto,
    @CurrentUser() user: User,
  ) {
    return this.groupePolymorphicService.createGroupeWithCreateur(data, user);
  }

  @Get(':id/posts')
  async getGroupePosts(@Param('id') id: number) {
    return this.groupePolymorphicService.getGroupePostsWithAuthors(id);
  }
}
```

---

## ✅ Avantages de cette approche

1. **Type-safe** : TypeScript vérifie les types
2. **Réutilisable** : Services séparés pour chaque type de relation
3. **Testable** : Facile à mocker dans les tests
4. **Similaire à Laravel** : Logique familière
5. **Performant** : Queries optimisées

---

## 📝 Notes Importantes

1. **Toujours utiliser PolymorphicTypes** pour éviter les erreurs de typage:
   ```typescript
   import { PolymorphicTypes } from '../../../common/helpers/polymorphic.helper';

   // ✅ Bon
   where: { created_by_type: PolymorphicTypes.USER }

   // ❌ Mauvais (risque d'erreur de typage)
   where: { created_by_type: 'user' }
   ```

2. **instanceof pour différencier** User et Societe:
   ```typescript
   if (entity instanceof User) {
     // C'est un User
   } else if (entity instanceof Societe) {
     // C'est une Societe
   }
   ```

3. **Relations à charger manuellement** : Contrairement à Laravel, vous devez explicitement charger les relations

---

## 🔍 Debugging

Pour débugger une relation polymorphique :

```typescript
console.log('Type:', entity.created_by_type);  // 'User' ou 'Societe'
console.log('ID:', entity.created_by_id);      // L'ID de l'entité
```

---

**C'est tout ! Vous avez maintenant un système complet de relations polymorphiques similaire à Laravel ! 🎉**
