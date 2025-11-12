# Routes User & UserProfil - Documentation

## 📋 Architecture

**UN SEUL Controller**: `UserController` gère à la fois User ET UserProfil

### Pourquoi pas de UserProfilController séparé?

- Relation **OneToOne** (1 User = 1 Profil)
- UserProfil est une **extension** de User, pas une entité indépendante
- Simplifie l'API et le code client

---

## 🛣️ Routes Disponibles

### 1. Profil de l'Utilisateur Connecté

#### GET /users/me
Récupérer mon propre profil complet (User + UserProfil)

**Auth**: ✅ Obligatoire (JWT)

**Réponse**:
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "numero": "+33612345678",
    "activite": "Développeur",
    "date_naissance": "1990-05-15",
    "created_at": "2024-01-01",
    "profile": {
      "id": 1,
      "user_id": 1,
      "photo": "http://localhost:3000/uploads/images/photo-123.jpg",
      "bio": "Passionné de tech",
      "competences": ["JavaScript", "TypeScript", "NestJS"],
      "experience": "5 ans en développement web",
      "formation": "Master en informatique",
      "linkedin": "https://linkedin.com/in/jeandupont",
      "github": "https://github.com/jeandupont",
      "portfolio": "https://jeandupont.dev",
      "langues": ["Français", "Anglais"],
      "disponibilite": "Immédiate",
      "salaire_souhaite": 45000
    }
  }
}
```

---

#### GET /users/me/stats
Récupérer mes statistiques de profil

**Auth**: ✅ Obligatoire (JWT)

**Réponse**:
```json
{
  "success": true,
  "data": {
    "postsCount": 25,
    "followersCount": 150,
    "followingCount": 200,
    "groupesCount": 5,
    "societesCount": 2,
    "profileCompletude": 85
  }
}
```

**Note**: `profileCompletude` est un score de 0 à 100 indiquant le % de champs remplis.

---

#### PUT /users/me/profile
Mettre à jour mon profil

**Auth**: ✅ Obligatoire (JWT)

**Body (tous les champs optionnels)**:
```json
{
  "photo": "https://example.com/photo.jpg",
  "bio": "Développeur passionné",
  "competences": ["JavaScript", "React", "Node.js"],
  "experience": "3 ans en startup",
  "formation": "Licence informatique",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username",
  "portfolio": "https://mysite.com",
  "langues": ["Français", "Anglais", "Espagnol"],
  "disponibilite": "Dans 2 mois",
  "salaire_souhaite": 50000
}
```

**Réponse**:
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "id": 1,
    "user_id": 1,
    "photo": "https://example.com/photo.jpg",
    "bio": "Développeur passionné",
    "competences": ["JavaScript", "React", "Node.js"],
    "experience": "3 ans en startup",
    "formation": "Licence informatique"
  }
}
```

**Validations**:
- `photo`, `linkedin`, `github`, `portfolio`: Doivent être des URLs valides
- `bio`: Max 500 caractères
- `experience`, `formation`: Max 2000 caractères chacun
- `disponibilite`: Max 100 caractères
- `salaire_souhaite`: Doit être >= 0
- `competences`, `langues`: Tableaux de strings

---

#### POST /users/me/photo
Uploader une photo de profil

**Auth**: ✅ Obligatoire (JWT)

**Content-Type**: `multipart/form-data`

**Body**:
- `file`: Fichier image (JPEG, PNG, GIF, WebP)
- Max 5MB

**Réponse**:
```json
{
  "success": true,
  "message": "Photo de profil mise à jour avec succès",
  "data": {
    "photo": "http://localhost:3000/uploads/images/image-1234567890.jpg",
    "url": "http://localhost:3000/uploads/images/image-1234567890.jpg"
  }
}
```

**Workflow**:
1. Upload du fichier via `MediaService`
2. Mise à jour automatique du champ `photo` dans `UserProfil`

---

### 2. Profil d'un Autre Utilisateur

#### GET /users/:id
Récupérer le profil public d'un utilisateur

**Auth**: ✅ Obligatoire (JWT)

**Params**:
- `id`: ID de l'utilisateur

**Réponse**: Même format que `GET /users/me`

---

#### GET /users/:id/stats
Récupérer les statistiques d'un utilisateur

**Auth**: ✅ Obligatoire (JWT)

**Params**:
- `id`: ID de l'utilisateur

**Réponse**: Même format que `GET /users/me/stats`

---

### 3. Recherche d'Utilisateurs

#### GET /users/search
Rechercher des utilisateurs avec filtres

**Auth**: ✅ Obligatoire (JWT)

**Query Params**:
- `nom`: string (optionnel)
- `prenom`: string (optionnel)
- `activite`: string (optionnel)
- `ageMin`: number (optionnel)
- `ageMax`: number (optionnel)
- `emailVerified`: boolean (optionnel)
- `page`: number (default: 1)
- `perPage`: number (default: 10)

**Exemple**:
```
GET /users/search?nom=Dupont&activite=Développeur&page=1&perPage=20
```

**Réponse**:
```json
{
  "message": "Recherche effectuée avec succès",
  "data": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "perPage": 20,
    "totalPages": 3
  },
  "filters_applied": {
    "nom": "Dupont",
    "prenom": null,
    "activite": "Développeur",
    "ageMin": null,
    "ageMax": null,
    "emailVerified": null
  }
}
```

---

#### GET /users/autocomplete
Autocomplétion pour recherche rapide

**Auth**: ✅ Obligatoire (JWT)

**Query Params**:
- `term`: string (requis, min 2 caractères)

**Exemple**:
```
GET /users/autocomplete?term=Jean
```

**Réponse**:
```json
{
  "message": "Autocomplétion effectuée avec succès",
  "data": [
    {
      "id": 1,
      "label": "Jean Dupont (@jean.dupont)",
      "email": "jean@example.com"
    },
    {
      "id": 2,
      "label": "Jeanne Martin (@jeanne.martin)",
      "email": "jeanne@example.com"
    }
  ]
}
```

---

## 🎯 Workflow Typique

### Inscription & Configuration du Profil

```
1. POST /auth/register
   → Crée le User
   → UserProfil est vide

2. GET /users/me
   → Vérifie que le profil existe
   → Si non, crée un profil vide automatiquement

3. POST /users/me/photo
   → Upload la photo de profil
   → Retourne l'URL

4. PUT /users/me/profile
   → Met à jour bio, compétences, etc.
   → Profil complété à 85%

5. GET /users/me/stats
   → Vérifie le score de complétude
```

### Consultation de Profils

```
1. GET /users/search?activite=Développeur
   → Liste des développeurs

2. GET /users/:id
   → Voir le profil d'un développeur

3. GET /users/:id/stats
   → Voir ses stats (posts, followers, etc.)
```

---

## 📱 Exemples Flutter

### Service Utilisateur

```dart
// services/user_service.dart
class UserService {
  final ApiService _api = ApiService();

  // Récupérer mon profil
  Future<User> getMyProfile() async {
    final response = await _api.get('/users/me');
    return User.fromJson(response['data']);
  }

  // Mettre à jour mon profil
  Future<UserProfil> updateMyProfile(UpdateProfilDto dto) async {
    final response = await _api.put('/users/me/profile', dto.toJson());
    return UserProfil.fromJson(response['data']);
  }

  // Uploader ma photo
  Future<String> uploadProfilePhoto(File file) async {
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('${_api.baseUrl}/users/me/photo'),
    );
    request.headers.addAll(await _api.getHeaders());
    request.files.add(await http.MultipartFile.fromPath('file', file.path));

    var response = await request.send();
    var data = json.decode(await response.stream.bytesToString());

    return data['data']['url'];
  }

  // Récupérer profil d'un autre user
  Future<User> getUserProfile(int userId) async {
    final response = await _api.get('/users/$userId');
    return User.fromJson(response['data']);
  }

  // Stats
  Future<ProfileStats> getMyStats() async {
    final response = await _api.get('/users/me/stats');
    return ProfileStats.fromJson(response['data']);
  }

  // Recherche
  Future<List<User>> searchUsers(String term) async {
    final response = await _api.get('/users/search?nom=$term');
    return (response['data'] as List)
        .map((json) => User.fromJson(json))
        .toList();
  }
}
```

### Écran de Profil

```dart
// screens/profile_screen.dart
class ProfileScreen extends StatefulWidget {
  final int? userId; // null = mon profil, sinon profil d'un autre

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<User>(
      future: userId == null
          ? userService.getMyProfile()
          : userService.getUserProfile(userId!),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          final user = snapshot.data!;
          final profile = user.profile;

          return Column(
            children: [
              // Photo de profil
              CircleAvatar(
                radius: 50,
                backgroundImage: profile.photo != null
                    ? NetworkImage(profile.photo!)
                    : null,
                child: profile.photo == null
                    ? Icon(Icons.person, size: 50)
                    : null,
              ),

              // Nom complet
              Text('${user.prenom} ${user.nom}'),

              // Bio
              Text(profile.bio ?? 'Aucune bio'),

              // Compétences
              Wrap(
                children: profile.competences.map((comp) {
                  return Chip(label: Text(comp));
                }).toList(),
              ),

              // Stats
              FutureBuilder<ProfileStats>(
                future: userService.getMyStats(),
                builder: (context, statsSnapshot) {
                  if (statsSnapshot.hasData) {
                    final stats = statsSnapshot.data!;
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _StatColumn('Posts', stats.postsCount),
                        _StatColumn('Abonnés', stats.followersCount),
                        _StatColumn('Abonnements', stats.followingCount),
                      ],
                    );
                  }
                  return CircularProgressIndicator();
                },
              ),

              // Bouton modifier (seulement pour mon profil)
              if (userId == null)
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/edit-profile');
                  },
                  child: Text('Modifier le profil'),
                ),
            ],
          );
        }

        return CircularProgressIndicator();
      },
    );
  }
}
```

---

## ⚠️ Points Importants

### 1. Ordre des Routes

```typescript
// ✅ BON ORDRE
@Get('me')              // Spécifique
@Get('me/stats')        // Spécifique
@Get('search')          // Spécifique
@Get('autocomplete')    // Spécifique
@Get(':id')             // Dynamique EN DERNIER
@Get(':id/stats')       // Dynamique EN DERNIER
```

**Si `:id` est en premier**, `GET /users/me` matchera avec `id = "me"` → ERREUR!

### 2. Création Automatique du Profil

Le profil est créé automatiquement à la première consultation si absent:
```typescript
if (!user.profile) {
  user.profile = await this.createEmptyProfile(userId);
}
```

### 3. Score de Complétude

Calculé automatiquement par `UserProfil.getCompletudeScore()`:
- Photo renseignée: +20%
- Bio renseignée: +20%
- Compétences renseignées: +20%
- Expérience renseignée: +20%
- Formation renseignée: +20%

### 4. Upload de Photo

**2 façons**:

**Option 1 (Recommandée)**: Via `/users/me/photo`
```typescript
POST /users/me/photo
→ Upload + mise à jour profil en une seule requête
```

**Option 2**: Via `/media/upload/image` puis `/users/me/profile`
```typescript
1. POST /media/upload/image → Retourne URL
2. PUT /users/me/profile { "photo": "URL" }
```

---

## 🎯 Résumé

- ✅ **UN SEUL Controller** (`UserController`) pour User ET UserProfil
- ✅ **7 routes** au total (me, me/stats, me/profile, me/photo, :id, :id/stats, search, autocomplete)
- ✅ **OneToOne** → Profil créé automatiquement si absent
- ✅ **Ordre des routes** crucial (spécifiques avant dynamiques)
- ✅ **Integration MediaService** pour upload photo
- ✅ **Score de complétude** calculé automatiquement

**Pas besoin de UserProfilController séparé!** Tout est géré dans UserController. ✨
