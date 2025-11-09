# Architecture du Système de Posts

## Vue d'ensemble

Le système de posts permet aux **Users** et **Societes** de publier du contenu dans deux contextes différents:
1. **Posts personnels** - Sur leur propre profil
2. **Posts de groupe** - Dans des groupes dont ils sont membres

## Schéma de la relation

```
┌─────────────────────────────────────────────────────────┐
│                     ARCHITECTURE                         │
└─────────────────────────────────────────────────────────┘

┌──────────┐                    ┌──────────────┐
│   User   │◄───────────┐       │   Societe    │
└──────────┘            │       └──────────────┘
     │                  │              │
     │ membre           │              │ membre
     │                  │              │
     ▼                  │              ▼
┌──────────┐            │       ┌──────────────┐
│  Groupe  │            │       │    Groupe    │
└──────────┘            │       └──────────────┘
     │                  │              │
     │ canal            │              │ canal
     │                  │              │
     ▼                  │              ▼
┌─────────────────────────────────────────────┐
│                   POST                      │
│  - posted_by_id + posted_by_type           │
│    (polymorphique: User ou Societe)        │
│  - groupe_id (nullable)                     │
│    • NULL = post personnel                  │
│    • NOT NULL = post dans un groupe         │
└─────────────────────────────────────────────┘
     │
     ├──► Likes (polymorphiques)
     └──► Commentaires (polymorphiques)
```

## Colonnes clés dans Post

### 1. `posted_by_id` + `posted_by_type` (Relation Polymorphique)
- **Auteur du post** - Peut être un User OU une Societe
- **posted_by_id**: ID de l'auteur
- **posted_by_type**: 'User' ou 'Societe'

### 2. `groupe_id` (Canal de publication - nullable)
- **NULL**: Post personnel publié sur le profil de l'auteur
- **NOT NULL**: Post publié dans un Groupe (l'auteur doit être membre)

## Exemples de cas d'usage

### Exemple 1: User poste sur son profil
```typescript
{
  posted_by_id: 123,
  posted_by_type: 'User',
  groupe_id: null,           // Post personnel
  contenu: "Mon premier post !"
}
```

### Exemple 2: User poste dans un Groupe
```typescript
{
  posted_by_id: 123,
  posted_by_type: 'User',
  groupe_id: 456,            // Post dans le groupe 456
  contenu: "Annonce pour le groupe !"
}
```

### Exemple 3: Societe poste sur son profil
```typescript
{
  posted_by_id: 789,
  posted_by_type: 'Societe',
  groupe_id: null,           // Post personnel de la société
  contenu: "Nouvelle offre disponible !"
}
```

### Exemple 4: Societe poste dans un Groupe
```typescript
{
  posted_by_id: 789,
  posted_by_type: 'Societe',
  groupe_id: 456,            // Post dans le groupe 456
  contenu: "Partenariat avec le groupe !"
}
```

## Règles métier

### Validation de publication dans un Groupe
1. ✅ L'auteur (User ou Societe) **doit être membre** du Groupe
2. ✅ Le Groupe doit exister et être actif
3. ✅ L'auteur doit avoir les permissions selon `visibility`:
   - `PUBLIC`: Tous les membres peuvent poster
   - `MEMBRES_ONLY`: Seuls les membres peuvent poster
   - `ADMINS_ONLY`: Seuls les admins peuvent poster

### Visibilité des posts
- **Posts personnels** (`groupe_id = null`):
  - Visibles sur le profil de l'auteur
  - Accessibles selon les paramètres de confidentialité du profil

- **Posts de groupe** (`groupe_id != null`):
  - Visibles pour tous les membres du groupe
  - Soumis aux règles de visibilité du groupe

## Relations polymorphiques

### User et Societe peuvent:
1. ✅ **Poster** (posted_by)
2. ✅ **Liker** (likeable)
3. ✅ **Commenter** (commentable)
4. ✅ **Créer des groupes** (created_by)

### Accès aux relations

#### Pour User:
```typescript
// Récupérer tous les posts d'un User
const posts = await postPolymorphicService.getPostsByUser(userId);

// Posts personnels uniquement
const personalPosts = posts.filter(p => p.groupe_id === null);

// Posts dans des groupes uniquement
const groupPosts = posts.filter(p => p.groupe_id !== null);

// Likes donnés par le User
const likes = await likePolymorphicService.getLikesByUser(userId);

// Commentaires créés par le User
const comments = await commentairePolymorphicService.getCommentairesByUser(userId);
```

#### Pour Societe:
```typescript
// Récupérer tous les posts d'une Societe
const posts = await postPolymorphicService.getPostsBySociete(societeId);

// Posts personnels uniquement
const personalPosts = posts.filter(p => p.groupe_id === null);

// Posts dans des groupes uniquement
const groupPosts = posts.filter(p => p.groupe_id !== null);

// Likes donnés par la Societe
const likes = await likePolymorphicService.getLikesBySociete(societeId);

// Commentaires créés par la Societe
const comments = await commentairePolymorphicService.getCommentairesBySociete(societeId);
```

## Types de médias supportés

Un post peut contenir:
- ✅ **Texte** (contenu)
- ✅ **Images** (array d'URLs)
- ✅ **Vidéos** (array d'URLs)
- ✅ **Audio/Vocal** (array d'URLs) 🎤 **NOUVEAU**
- ✅ **Documents** (array d'URLs)

```typescript
const post = {
  contenu: "Écoutez mon message !",
  audios: ["https://storage.com/audio123.mp3"],
  images: ["https://storage.com/photo1.jpg"],
  videos: ["https://storage.com/video1.mp4"],
  documents: ["https://storage.com/doc.pdf"]
};
```

## Méthodes helper disponibles

### Sur Post entity:
```typescript
post.isPostedByUser()      // Auteur = User ?
post.isPostedBySociete()   // Auteur = Societe ?
post.isPersonalPost()      // Post personnel ?
post.isGroupPost()         // Post dans un groupe ?
post.hasMedia()            // A des médias ?
post.hasAudio()            // A de l'audio ?
post.hasImages()           // A des images ?
post.hasVideos()           // A des vidéos ?
post.hasDocuments()        // A des documents ?
```

## Compteurs automatiques

Les compteurs sont **automatiquement** mis à jour:
- ✅ `likes_count` - Incrémenté/décrémenté lors de like/unlike
- ✅ `comments_count` - Incrémenté/décrémenté lors d'ajout/suppression de commentaire
- ⚠️ `shares_count` - À implémenter

## Endpoints API disponibles

### Posts
- `POST /posts` - Créer un post (personnel ou dans un groupe)
- `GET /posts/:id` - Récupérer un post
- `PUT /posts/:id` - Modifier un post
- `DELETE /posts/:id` - Supprimer un post
- `GET /posts/user/:userId` - Posts d'un utilisateur
- `GET /posts/societe/:societeId` - Posts d'une société
- `GET /posts/groupe/:groupeId` - Posts d'un groupe

### Likes
- `POST /likes/post/:postId` - Liker un post
- `DELETE /likes/post/:postId` - Unlike un post
- `GET /likes/post/:postId/check` - Vérifier si liké
- `GET /likes/post/:postId` - Liste des likes avec auteurs
- `GET /likes/my-liked-posts` - Posts likés par l'utilisateur connecté

### Commentaires
- `POST /commentaires` - Créer un commentaire
- `GET /commentaires/post/:postId` - Commentaires d'un post avec auteurs
- `PUT /commentaires/:id` - Modifier un commentaire
- `DELETE /commentaires/:id` - Supprimer un commentaire
- `GET /commentaires/my-comments` - Commentaires de l'utilisateur connecté
- `GET /commentaires/my-commented-posts` - Posts commentés

## Conclusion

Cette architecture permet:
1. ✅ **Flexibilité** - User et Societe peuvent poster partout
2. ✅ **Polymorphisme** - Un seul système pour tous les types d'acteurs
3. ✅ **Canaux multiples** - Posts personnels ET posts de groupe
4. ✅ **Traçabilité** - Auteur et canal toujours identifiés
5. ✅ **Performance** - Compteurs automatiques, index sur colonnes clés
