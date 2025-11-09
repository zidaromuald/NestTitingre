# Relations Polymorphiques vs Relations Normales

## 🎯 Le problème fondamental

**Question**: Pourquoi n'y a-t-il pas de `@ManyToOne` entre Post et User/Societe alors qu'il y en a un entre Post et Groupe ?

**Réponse**: Parce que TypeORM ne supporte pas nativement les relations polymorphiques comme Laravel.

## 📚 Laravel vs TypeORM

### Laravel (Eloquent) - Support natif

```php
// Post.php
class Post extends Model
{
    // ✅ Relation polymorphique native
    public function postedBy()
    {
        return $this->morphTo();
    }

    // ✅ Relation normale
    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }
}

// User.php
class User extends Model
{
    // ✅ Relation polymorphique inverse automatique
    public function posts()
    {
        return $this->morphMany(Post::class, 'postedBy');
    }
}

// Utilisation
$author = $post->postedBy; // User ou Societe automatiquement
$posts = $user->posts; // Tous les posts de l'utilisateur
```

### TypeORM/NestJS - Gestion manuelle

```typescript
// post.entity.ts
@Entity('posts')
export class Post {
    // ❌ Relation polymorphique - IMPOSSIBLE en TypeORM
    // @ManyToOne(() => User | Societe) // TypeScript l'accepte, mais TypeORM NON

    // ✅ Solution: Colonnes manuelles
    @Column({ type: 'int' })
    posted_by_id: number;

    @Column({ type: 'varchar', length: 100 })
    posted_by_type: string; // 'User' ou 'Societe'

    // ✅ Relation normale - POSSIBLE
    @ManyToOne(() => Groupe, (groupe) => groupe.posts)
    @JoinColumn({ name: 'groupe_id' })
    groupe: Groupe;
}

// user.entity.ts
@Entity('users')
export class User {
    // ❌ Relation polymorphique inverse - IMPOSSIBLE en TypeORM
    // @OneToMany(() => Post, (post) => post.postedBy)

    // ✅ Solution: Documentation + Service
    // Posts créés par cet utilisateur (relation polymorphique)
    // Utiliser: PostPolymorphicService.getPostsByUser(userId)
}

// Utilisation
const author = await postPolymorphicService.getAuthor(post); // Manuelle
const posts = await postPolymorphicService.getPostsByUser(user.id); // Manuelle
```

## 🔍 Pourquoi cette différence ?

### Relation Normale (Groupe ↔ Post)

```
Base de données:
┌─────────────┐         ┌──────────────┐
│   Groupe    │         │     Post     │
├─────────────┤         ├──────────────┤
│ id (PK)     │◄────────│ groupe_id    │
└─────────────┘         └──────────────┘
                             ↑
                    Référence à UNE SEULE table

TypeORM peut gérer ceci automatiquement:
- Post.groupe → Groupe
- Groupe.posts → Post[]
```

### Relation Polymorphique (User/Societe ↔ Post)

```
Base de données:
┌──────────┐                ┌──────────────┐
│   User   │                │     Post     │
├──────────┤         ┌─────►│posted_by_id  │
│ id (PK)  │         │      │posted_by_type│◄─┐
└──────────┘         │      └──────────────┘  │
                     │                         │
┌──────────────┐     │                         │
│   Societe    │     │                         │
├──────────────┤     │                         │
│ id (PK)      │◄────┘                         │
└──────────────┘                               │
                                               │
              Référence à PLUSIEURS tables possible
              (User OU Societe selon posted_by_type)

TypeORM ne peut PAS gérer ceci automatiquement:
- Post.postedBy → ❌ Type inconnu à la compilation
- User.posts → ❌ Pas de colonne de jointure fixe
- Societe.posts → ❌ Pas de colonne de jointure fixe
```

## 🛠️ Notre solution: Services Polymorphiques

Nous avons créé des services dédiés pour gérer les relations polymorphiques:

### PostPolymorphicService

```typescript
@Injectable()
export class PostPolymorphicService {
  // Récupérer l'auteur d'un post (User ou Societe)
  async getAuthor(post: Post): Promise<User | Societe | null> {
    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    return PolymorphicHelper.morphTo<User | Societe>(
      {
        id: post.posted_by_id,
        type: post.posted_by_type,
      },
      repositories,
    );
  }

  // Récupérer tous les posts d'un User
  async getPostsByUser(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: {
        posted_by_id: userId,
        posted_by_type: PolymorphicTypes.USER,
      },
    });
  }

  // Récupérer tous les posts d'une Societe
  async getPostsBySociete(societeId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: {
        posted_by_id: societeId,
        posted_by_type: PolymorphicTypes.SOCIETE,
      },
    });
  }
}
```

## 📊 Tableau récapitulatif

| Relation | Type | Dans l'entité | Comment accéder |
|----------|------|---------------|-----------------|
| **Post → Groupe** | Normale | `@ManyToOne(() => Groupe)` | `post.groupe` ou `await post.groupe` |
| **Groupe → Posts** | Normale | `@OneToMany(() => Post)` | `groupe.posts` |
| **Post → Auteur** | Polymorphique | Colonnes manuelles | `postPolymorphicService.getAuthor(post)` |
| **User → Posts** | Polymorphique | Commentaire | `postPolymorphicService.getPostsByUser(id)` |
| **Societe → Posts** | Polymorphique | Commentaire | `postPolymorphicService.getPostsBySociete(id)` |
| **Post → Likes** | Normale | `@OneToMany(() => Like)` | `post.likes` |
| **Like → Auteur** | Polymorphique | Colonnes manuelles | `likePolymorphicService.getLikeable(like)` |
| **User → Likes** | Polymorphique | Commentaire | `likePolymorphicService.getLikesByUser(id)` |
| **Post → Commentaires** | Normale | `@OneToMany(() => Commentaire)` | `post.commentaires` |
| **Commentaire → Auteur** | Polymorphique | Colonnes manuelles | `commentairePolymorphicService.getCommentable(c)` |

## 🎯 Règle simple à retenir

### Utiliser `@ManyToOne` / `@OneToMany` quand:
✅ La relation pointe vers **UN SEUL type** d'entité
- Exemple: Post → Groupe (toujours Groupe)
- Exemple: User → UserProfil (toujours UserProfil)
- Exemple: TransactionCollaboration → User (toujours User)

### Utiliser des colonnes polymorphiques + services quand:
⚡ La relation peut pointer vers **PLUSIEURS types** d'entités
- Exemple: Post → Auteur (User OU Societe)
- Exemple: Like → Auteur (User OU Societe)
- Exemple: Commentaire → Auteur (User OU Societe)
- Exemple: Groupe → Créateur (User OU Societe)

## 💻 Code d'exemple complet

### Scénario: Récupérer un post avec son auteur et son groupe

```typescript
// 1. Récupérer le post
const post = await postRepository.findOne({
  where: { id: postId },
  relations: ['groupe'], // ✅ Relation normale chargée automatiquement
});

// 2. Le groupe est disponible directement
console.log(post.groupe.nom_groupe); // ✅ Fonctionne

// 3. L'auteur nécessite le service polymorphique
const author = await postPolymorphicService.getAuthor(post);
// ⚡ Service nécessaire car relation polymorphique

if (post.isPostedByUser()) {
  console.log(`Posté par: ${(author as User).fullName}`);
} else {
  console.log(`Posté par: ${(author as Societe).nom_societe}`);
}

// 4. Récupérer les likes avec auteurs
const likesWithAuthors = await likePolymorphicService.getLikesWithAuthors(post.id);
likesWithAuthors.forEach(({ like, author }) => {
  console.log(`Like de: ${author.id} (${like.likeable_type})`);
});
```

## 🌟 Avantages de notre approche

1. ✅ **Type-safe**: TypeScript vérifie les types à la compilation
2. ✅ **Explicite**: Le code montre clairement qu'une relation est polymorphique
3. ✅ **Testable**: Les services peuvent être mockés facilement
4. ✅ **Flexible**: Facile d'ajouter de nouveaux types polymorphiques
5. ✅ **Performant**: Possibilité d'optimiser les requêtes dans les services
6. ✅ **Documenté**: Les commentaires dans les entités expliquent l'usage

## 🔄 Migration depuis Laravel

Si vous venez de Laravel:

| Laravel | NestJS/TypeORM |
|---------|----------------|
| `$post->postedBy` | `await postPolymorphicService.getAuthor(post)` |
| `$user->posts` | `await postPolymorphicService.getPostsByUser(user.id)` |
| `$post->postedBy()` | Service method |
| `$post->groupe` | `post.groupe` (identique) |
| `$post->likes` | `post.likes` (identique) |
| `$like->likeable` | `await likePolymorphicService.getLikeable(like)` |

## 📝 Conclusion

**TypeORM n'a pas de support natif pour les relations polymorphiques**, contrairement à Laravel Eloquent.

Notre solution utilise:
1. **Colonnes manuelles** (`_id` + `_type`) pour stocker la relation
2. **Services polymorphiques** pour accéder aux données
3. **PolymorphicHelper** pour centraliser la logique

Cette approche est **plus explicite** que Laravel mais **tout aussi puissante** ! 🚀
