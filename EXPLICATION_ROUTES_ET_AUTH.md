# Explications: Routes et Authentification

## 1. 📍 Ordre des Routes (TRÈS IMPORTANT!)

### ❌ Mauvais Ordre (Ne JAMAIS faire ça!)

```typescript
@Controller('posts')
export class PostController {
  @Get(':id')  // ❌ Route dynamique EN PREMIER
  async findOne(@Param('id') id: number) { }

  @Get('feed/public')  // ❌ Ne sera JAMAIS appelée!
  async getFeed() { }

  @Get('trending/top')  // ❌ Ne sera JAMAIS appelée!
  async getTrending() { }
}
```

**Problème**:
- `GET /posts/feed/public` → Matche `:id` avec `id = "feed"` ❌
- `GET /posts/trending/top` → Matche `:id` avec `id = "top"` ❌

### ✅ Bon Ordre (TOUJOURS comme ça!)

```typescript
@Controller('posts')
export class PostController {
  // 1. Routes spécifiques EN PREMIER
  @Get('feed/my-feed')     // ✅ Route spécifique
  async getMyFeed() { }

  @Get('feed/public')      // ✅ Route spécifique
  async getFeed() { }

  @Get('trending/top')     // ✅ Route spécifique
  async getTrending() { }

  @Get('search/query')     // ✅ Route spécifique
  async search() { }

  @Get('author/:type/:id') // ✅ Route spécifique
  async getByAuthor() { }

  // 2. Route dynamique EN DERNIER
  @Get(':id')              // ✅ Route dynamique à la fin
  async findOne(@Param('id') id: number) { }
}
```

**Pourquoi?**
- NestJS matche les routes **dans l'ordre de déclaration**
- La première route qui matche gagne
- Les routes dynamiques (`:id`) matchent **tout**
- Donc elles doivent être **EN DERNIER**

### 🎯 Règle Simple

```
Routes Spécifiques (feed/public, trending/top)
         ⬇️
Routes Semi-Dynamiques (author/:type/:id)
         ⬇️
Routes Dynamiques (:id)
```

---

## 2. 🔐 Authentification JWT

### Situation Actuelle

```typescript
// ⚠️ Mock User (temporaire)
const mockUser = { id: 1, type: 'User' } as any;
```

### Solution: JWT avec Guards

#### A. Créer le JWT Guard

Le guard vérifie le token et injecte l'utilisateur:

```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

#### B. Utiliser le Décorateur @CurrentUser()

```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Injecté par JwtAuthGuard
  },
);
```

#### C. Application dans le Controller

##### Avant (avec Mock)

```typescript
@Post()
async create(@Body() dto: CreatePostDto) {
  const mockUser = { id: 1, type: 'User' } as any; // ❌
  return this.postService.create(dto, mockUser);
}
```

##### Après (avec JWT)

```typescript
@Post()
@UseGuards(JwtAuthGuard)  // ✅ Active l'authentification
async create(
  @Body() dto: CreatePostDto,
  @CurrentUser() user: User | Societe,  // ✅ Utilisateur réel
) {
  return this.postService.create(dto, user);
}
```

### Routes Nécessitant l'Authentification

| Route | Auth Requise? | Raison |
|-------|---------------|--------|
| `POST /posts` | ✅ OUI | Créer un post |
| `PUT /posts/:id` | ✅ OUI | Modifier son post |
| `DELETE /posts/:id` | ✅ OUI | Supprimer son post |
| `GET /posts/feed/my-feed` | ✅ OUI | Feed personnalisé |
| `POST /posts/:id/share` | ⚠️ Optionnel | Peut être anonyme ou authentifié |
| `GET /posts/feed/public` | ❌ NON | Feed public |
| `GET /posts/:id` | ❌ NON | Voir un post |
| `GET /posts/trending/top` | ❌ NON | Posts tendances |

---

## 3. 🆕 Route `/posts/feed/my-feed`

### C'est Quoi?

Le **feed personnalisé** de l'utilisateur connecté.

### Différence avec `/feed/public`

| `/feed/public` | `/feed/my-feed` |
|----------------|-----------------|
| Posts de tout le monde | Posts des gens que TU suis |
| Pas besoin d'auth | Auth OBLIGATOIRE |
| Comme "Explorer" Instagram | Comme "Accueil" Instagram |

### Contenu du Feed Personnalisé

```typescript
// Ce qu'on affiche dans my-feed:
1. Posts des utilisateurs que je suis
2. Posts des sociétés que je suis
3. Posts des groupes dont je suis membre
4. Mes propres posts
```

### Implémentation

```typescript
@Get('feed/my-feed')
@UseGuards(JwtAuthGuard)  // Auth obligatoire
async getMyFeed(
  @CurrentUser() user: User | Societe,
  @Query('limit') limit?: number,
) {
  const posts = await this.postService.getPersonalizedFeed(user, {
    limit: limit || 20,
  });

  return {
    success: true,
    data: posts,
  };
}
```

### Logique Backend (Service)

```typescript
async getPersonalizedFeed(currentUser: User | Societe) {
  // 1. Récupérer les IDs des suivis
  const followedIds = await this.suiviService.getFollowedIds(currentUser);

  // 2. Récupérer les IDs des groupes dont il est membre
  const groupeIds = await this.groupeService.getUserGroupes(currentUser);

  // 3. Query pour récupérer les posts
  return this.postRepo
    .createQueryBuilder('post')
    .where(
      new Brackets((qb) => {
        qb.where('post.posted_by_id = :userId', { userId: currentUser.id })
          .orWhere('post.posted_by_id IN (:...followedIds)', { followedIds })
          .orWhere('post.groupe_id IN (:...groupeIds)', { groupeIds });
      }),
    )
    .andWhere('post.visibility != :private', { private: 'private' })
    .orderBy('post.created_at', 'DESC')
    .take(20)
    .getMany();
}
```

---

## 4. 🚀 Migration JWT: Plan d'Action

### Étape 1: Vérifier le Module Auth

```bash
# Vérifier que JwtStrategy existe
ls src/modules/auth/strategies/jwt.strategy.ts
```

### Étape 2: Créer le Guard Global (Optionnel)

```typescript
// main.ts
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

app.useGlobalGuards(new JwtAuthGuard());  // Auth sur TOUTES les routes
```

OU utiliser `@UseGuards(JwtAuthGuard)` route par route.

### Étape 3: Remplacer les Mock Users

```typescript
// Chercher dans tous les controllers
grep -r "mockUser" src/modules/*/controllers/

// Remplacer par
@UseGuards(JwtAuthGuard)
async method(@CurrentUser() user: User | Societe) {
  // Utiliser user au lieu de mockUser
}
```

### Étape 4: Tester

```bash
# 1. Login pour récupérer le token
POST /auth/login
{
  "identifiant": "user@example.com",
  "password": "password"
}

# Réponse:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 2. Utiliser le token pour créer un post
POST /posts
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Body:
{
  "contenu": "Mon post avec JWT!"
}
```

---

## 5. 📱 Impact Flutter

### Avant (Sans JWT)

```dart
// Pas de token nécessaire
await http.post(
  Uri.parse('$baseUrl/posts'),
  body: json.encode({'contenu': 'Hello'}),
);
```

### Après (Avec JWT)

```dart
// 1. Stocker le token après login
final prefs = await SharedPreferences.getInstance();
await prefs.setString('access_token', token);

// 2. Ajouter le token dans chaque requête
class ApiService {
  Future<Map<String, String>> getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');

    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Post> createPost(String content) async {
    final response = await http.post(
      Uri.parse('$baseUrl/posts'),
      headers: await getHeaders(),  // ✅ Token inclus
      body: json.encode({'contenu': content}),
    );
    return Post.fromJson(response.data);
  }
}
```

---

## 6. ✅ Checklist de Migration

- [ ] Vérifier JwtStrategy existe
- [ ] Créer JwtAuthGuard si manquant
- [ ] Le décorateur @CurrentUser() existe déjà ✅
- [ ] Remplacer tous les `mockUser` par `@CurrentUser()`
- [ ] Ajouter `@UseGuards(JwtAuthGuard)` sur routes protégées
- [ ] Route `/feed/my-feed` ajoutée ✅
- [ ] Tester login → récupération token
- [ ] Tester création post avec token
- [ ] Mettre à jour le code Flutter pour inclure le token
- [ ] Gérer l'expiration du token (refresh token)

---

## 7. 🎯 Résumé

### Ordre des Routes
✅ **Spécifiques d'abord**, dynamiques à la fin

### Feed Personnalisé
✅ `/feed/my-feed` ajouté pour posts des suivis

### Authentification
⚠️ Mock users actuellement
🔜 À remplacer par JWT + @CurrentUser()

### Nécessité
✅ `/feed/my-feed` est **ESSENTIEL** pour une app sociale
✅ JWT est **OBLIGATOIRE** pour la production
✅ Ordre des routes est **CRITIQUE** pour le bon fonctionnement
