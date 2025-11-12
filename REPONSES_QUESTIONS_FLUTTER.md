# Réponses aux Questions Flutter

## Question 1: Route `/posts/feed/my-feed` Manquante

### ❓ C'est nécessaire?

**OUI, ABSOLUMENT!** ✅

### Pourquoi?

Sans cette route, ton app affiche **TOUS** les posts de la plateforme (feed public). Mais l'utilisateur veut voir **SEULEMENT** les posts:
- Des personnes qu'il suit
- Des groupes dont il est membre
- Ses propres posts

### Différence

```
/posts/feed/public        → Posts de tout le monde (Explorer)
/posts/feed/my-feed       → Posts de mes suivis (Accueil)
```

### Exemple Concret

**Instagram**:
- Tab "🏠 Accueil" = `/feed/my-feed` (posts des followings)
- Tab "🔍 Explorer" = `/feed/public` (posts populaires)

### ✅ Solution: Ajoutée!

```typescript
@Get('feed/my-feed')
@UseGuards(JwtAuthGuard)  // Auth obligatoire
async getMyFeed(@CurrentUser() user: User | Societe) {
  return this.postService.getPersonalizedFeed(user);
}
```

---

## Question 2: Authentification JWT avec MockUser

### ❓ Dois-je remplacer les mock users?

**OUI, pour la production!** ✅

### Situation Actuelle

```typescript
// ⚠️ Mock (temporaire)
const mockUser = { id: 1, type: 'User' } as any;
```

**Problème**: Tous les posts sont créés par le même utilisateur (id=1)!

### Solution

```typescript
// ✅ Authentification réelle
@Post()
@UseGuards(JwtAuthGuard)
async create(
  @Body() dto: CreatePostDto,
  @CurrentUser() user: User | Societe,  // Vrai utilisateur!
) {
  return this.postService.create(dto, user);
}
```

### Infrastructure Déjà en Place

✅ `JwtAuthGuard` existe dans `src/common/guards/jwt-auth.guard.ts`
✅ `@CurrentUser()` existe dans `src/common/decorators/current-user.decorator.ts`
✅ Tu n'as qu'à les utiliser!

### Routes à Protéger

| Route | Guard? | Raison |
|-------|--------|--------|
| `POST /posts` | ✅ | Créer post |
| `PUT /posts/:id` | ✅ | Modifier post |
| `DELETE /posts/:id` | ✅ | Supprimer post |
| `GET /posts/feed/my-feed` | ✅ | Feed perso |
| `POST /posts/:id/share` | ⚠️ | Optionnel |
| `GET /posts/:id` | ❌ | Lecture publique |
| `GET /posts/feed/public` | ❌ | Feed public |

---

## Question 3: Ordre des Routes

### ❓ Pourquoi vérifier l'ordre?

**CRITIQUE!** NestJS matche les routes **dans l'ordre de déclaration**.

### ❌ Mauvais Ordre

```typescript
@Get(':id')              // ❌ EN PREMIER
async findOne() {}

@Get('feed/public')      // Ne sera JAMAIS appelée!
async getFeed() {}
```

**Résultat**: `GET /posts/feed/public` matche `:id` avec `id="feed"` → ERREUR!

### ✅ Bon Ordre

```typescript
// 1. Routes spécifiques EN PREMIER
@Get('feed/my-feed')
@Get('feed/public')
@Get('trending/top')
@Get('search/query')

// 2. Route dynamique EN DERNIER
@Get(':id')
```

### ✅ Ton Code est Correct!

J'ai vérifié: tes routes sont dans le bon ordre. Pas de problème! 🎉

---

## Impact sur Flutter

### Changements Nécessaires

#### 1. Ajouter le Token dans les Requêtes

**Avant** (sans auth):
```dart
await http.post(
  Uri.parse('$baseUrl/posts'),
  body: json.encode({'contenu': 'Hello'}),
);
```

**Après** (avec auth):
```dart
class ApiService {
  Future<Map<String, String>> _getHeaders() async {
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
      headers: await _getHeaders(),  // ✅ Token inclus
      body: json.encode({'contenu': content}),
    );

    if (response.statusCode == 401) {
      // Token expiré → Rediriger vers login
      throw UnauthorizedException();
    }

    return Post.fromJson(json.decode(response.body));
  }
}
```

#### 2. Utiliser `/feed/my-feed` pour le Feed Principal

```dart
class FeedScreen extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.home), text: 'Accueil'),
              Tab(icon: Icon(Icons.explore), text: 'Explorer'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Tab 1: Feed personnalisé (mes suivis)
            FeedList(url: '/posts/feed/my-feed'),

            // Tab 2: Feed public (tout le monde)
            FeedList(url: '/posts/feed/public'),
          ],
        ),
      ),
    );
  }
}
```

---

## Checklist de Migration Flutter

### Phase 1: Authentification

- [ ] Stocker le token JWT après login
  ```dart
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('access_token', token);
  ```

- [ ] Créer un service centralisé pour les headers
  ```dart
  class ApiService {
    Future<Map<String, String>> getHeaders() async { ... }
  }
  ```

- [ ] Ajouter le token dans TOUTES les requêtes authentifiées
  ```dart
  headers: await apiService.getHeaders()
  ```

### Phase 2: Gestion des Erreurs

- [ ] Gérer l'erreur 401 (token expiré)
  ```dart
  if (response.statusCode == 401) {
    Navigator.pushReplacementNamed(context, '/login');
  }
  ```

- [ ] Implémenter le refresh token (optionnel mais recommandé)

### Phase 3: Feeds

- [ ] Créer l'écran avec 2 tabs (Accueil / Explorer)
- [ ] Tab "Accueil" → `/posts/feed/my-feed` (auth requise)
- [ ] Tab "Explorer" → `/posts/feed/public` (pas d'auth)

### Phase 4: Upload Média

- [ ] Utiliser `/media/upload/image` avant de créer un post
- [ ] Afficher un indicateur de progression pendant l'upload
- [ ] Implémenter l'Optimistic UI (affichage instantané)

---

## Architecture Flutter Recommandée

```
lib/
├── services/
│   ├── api_service.dart          # Service de base avec headers JWT
│   ├── auth_service.dart         # Login/Register/Logout
│   ├── post_service.dart         # CRUD posts
│   ├── media_service.dart        # Upload fichiers
│   └── feed_service.dart         # Feeds personnalisés
├── models/
│   ├── user.dart
│   ├── post.dart
│   ├── media.dart
│   └── api_response.dart
├── screens/
│   ├── login_screen.dart
│   ├── feed_screen.dart          # 2 tabs (Accueil/Explorer)
│   ├── create_post_screen.dart
│   └── profile_screen.dart
├── widgets/
│   ├── post_card.dart
│   ├── feed_list.dart
│   └── media_uploader.dart
└── providers/                     # State management (Riverpod/Provider)
    ├── auth_provider.dart
    ├── post_provider.dart
    └── feed_provider.dart
```

---

## Exemple Complet Flutter

### Service d'API avec JWT

```dart
// services/api_service.dart
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://localhost:3000';

  // Récupérer les headers avec token
  Future<Map<String, String>> getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');

    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Méthode POST générique
  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: await getHeaders(),
      body: json.encode(body),
    );

    if (response.statusCode == 401) {
      throw UnauthorizedException('Token expiré');
    }

    if (response.statusCode >= 400) {
      throw ApiException('Erreur: ${response.statusCode}');
    }

    return json.decode(response.body);
  }

  // Méthode GET générique
  Future<dynamic> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: await getHeaders(),
    );

    if (response.statusCode == 401) {
      throw UnauthorizedException('Token expiré');
    }

    return json.decode(response.body);
  }
}
```

### Service de Feed

```dart
// services/feed_service.dart
import 'api_service.dart';
import '../models/post.dart';

class FeedService {
  final ApiService _api = ApiService();

  // Feed personnalisé (mes suivis)
  Future<List<Post>> getMyFeed({int limit = 20, int offset = 0}) async {
    final response = await _api.get(
      '/posts/feed/my-feed?limit=$limit&offset=$offset',
    );

    return (response['data'] as List)
        .map((json) => Post.fromJson(json))
        .toList();
  }

  // Feed public (tout le monde)
  Future<List<Post>> getPublicFeed({int limit = 20, int offset = 0}) async {
    final response = await _api.get(
      '/posts/feed/public?limit=$limit&offset=$offset',
    );

    return (response['data'] as List)
        .map((json) => Post.fromJson(json))
        .toList();
  }
}
```

### Écran de Feed avec Tabs

```dart
// screens/feed_screen.dart
import 'package:flutter/material.dart';

class FeedScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text('TiTingre'),
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.home), text: 'Accueil'),
              Tab(icon: Icon(Icons.explore), text: 'Explorer'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            MyFeedTab(),      // Feed personnalisé
            PublicFeedTab(),  // Feed public
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            Navigator.pushNamed(context, '/create-post');
          },
          child: Icon(Icons.add),
        ),
      ),
    );
  }
}

class MyFeedTab extends StatefulWidget {
  @override
  _MyFeedTabState createState() => _MyFeedTabState();
}

class _MyFeedTabState extends State<MyFeedTab> {
  final FeedService _feedService = FeedService();
  List<Post> _posts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFeed();
  }

  Future<void> _loadFeed() async {
    try {
      final posts = await _feedService.getMyFeed();
      setState(() {
        _posts = posts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _loadFeed,
      child: ListView.builder(
        itemCount: _posts.length,
        itemBuilder: (context, index) {
          return PostCard(post: _posts[index]);
        },
      ),
    );
  }
}
```

---

## Résumé Final

### ✅ Ce qui a été fait

1. **Route `/feed/my-feed` ajoutée** - Feed personnalisé fonctionnel
2. **Documentation complète** - Ordre des routes expliqué
3. **Infrastructure JWT existante** - Guards et décorateurs prêts
4. **Ordre des routes vérifié** - Tout est correct!

### 🔜 Ce qu'il reste à faire

1. **Backend**: Remplacer les `mockUser` par `@CurrentUser()`
2. **Flutter**: Ajouter le token JWT dans les requêtes
3. **Flutter**: Implémenter les 2 tabs (Accueil/Explorer)
4. **Flutter**: Gérer l'expiration du token

### 🎯 Priorité

1. **URGENT**: Remplacer les mock users par JWT
2. **IMPORTANT**: Implémenter le feed personnalisé dans Flutter
3. **RECOMMANDÉ**: Ajouter refresh token pour meilleure UX

Toutes les explications détaillées sont dans `EXPLICATION_ROUTES_ET_AUTH.md`! 📚
