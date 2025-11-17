# 🎯 Guide de Création de Groupes - Valeurs Corrigées

## ✅ Requête Correcte

```json
{
  "nom": "Communauté Full-Stack Afrique",
  "description": "Groupe dédié aux développeurs full-stack africains",
  "type": "public",
  "categorie": "active",
  "maxMembres": 5000
}
```

## 📋 Champs Disponibles

### `nom` (requis)
- Type: String
- Max: 255 caractères
- Exemple: `"Communauté Full-Stack Afrique"`

### `description` (optionnel)
- Type: String
- Max: 5000 caractères
- Exemple: `"Groupe dédié aux développeurs..."`

### `type` (optionnel) - Visibilité du groupe
Valeurs possibles:
- **`"public"`** (défaut) - Tout le monde peut voir et rejoindre
- **`"private"`** - Sur invitation uniquement
- **`"members_only"`** - Visible par tous, mais seuls les membres voient le contenu

### `categorie` (optionnel) - Statut du groupe
Valeurs possibles:
- **`"active"`** (défaut) - Groupe actif
- **`"archived"`** - Groupe archivé
- **`"deleted"`** - Groupe supprimé

### `maxMembres` (optionnel)
- Type: Number
- Min: 2
- Max: 100000
- Défaut: 50
- Exemple: `5000`

### `adminUserId` (optionnel)
- Type: Number
- Uniquement pour les groupes créés par une société
- ID de l'utilisateur désigné comme admin
- Exemple: `1`

## 🧪 Exemples de Requêtes

### Groupe Public Actif
```json
{
  "nom": "Développeurs JavaScript",
  "description": "Communauté de développeurs JS",
  "type": "public",
  "categorie": "active",
  "maxMembres": 1000
}
```

### Groupe Privé
```json
{
  "nom": "Équipe Projet X",
  "description": "Groupe privé pour le projet X",
  "type": "private",
  "maxMembres": 20
}
```

### Groupe Members Only
```json
{
  "nom": "Formation Pro",
  "description": "Contenu réservé aux membres inscrits",
  "type": "members_only",
  "maxMembres": 500
}
```

### Groupe Minimal
```json
{
  "nom": "Mon Groupe"
}
```
(Utilise les valeurs par défaut: type=public, categorie=active, maxMembres=50)

## ❌ Erreurs à Éviter

### ❌ NE PAS envoyer
```json
{
  "created_by_id": 1,        // ❌ Rempli automatiquement
  "created_by_type": "User"  // ❌ Rempli automatiquement
}
```

### ❌ Anciennes valeurs (ne fonctionnent plus)
```json
{
  "type": "prive",              // ❌ OBSOLÈTE - Utiliser "private"
  "categorie": "professionnel"  // ❌ OBSOLÈTE - Utiliser "active"
}
```

### ✅ Nouvelles valeurs (correctes)
```json
{
  "type": "private",     // ✅ CORRECT
  "categorie": "active"  // ✅ CORRECT
}
```

## 🔑 Authentification

Les groupes peuvent être créés par:
- **Users** (utilisateurs individuels)
- **Sociétés** (entreprises)

Le créateur est automatiquement déterminé par le token JWT.

### Créer en tant que User
```http
POST /groupes
Authorization: Bearer <USER_TOKEN>
```

### Créer en tant que Société (avec admin désigné)
```http
POST /groupes
Authorization: Bearer <SOCIETE_TOKEN>

{
  "nom": "Groupe Entreprise",
  "type": "private",
  "adminUserId": 5
}
```

## 📊 Réponse Attendue

```json
{
  "id": 1,
  "nom": "Communauté Full-Stack Afrique",
  "description": "Groupe dédié aux développeurs...",
  "created_by_id": 1,
  "created_by_type": "User",
  "type": "public",
  "max_membres": 5000,
  "categorie": "active",
  "admin_user_id": null,
  "created_at": "2025-11-15T14:00:00.000Z",
  "updated_at": "2025-11-15T14:00:00.000Z"
}
```

## 🎯 Récapitulatif des Changements

| Ancien (❌) | Nouveau (✅) | Description |
|------------|-------------|-------------|
| `type: "prive"` | `type: "private"` | Groupe privé |
| `type: "public"` | `type: "public"` | Groupe public (inchangé) |
| `categorie: "simple"` | `categorie: "active"` | Groupe actif |
| `categorie: "professionnel"` | `categorie: "active"` | Groupe actif |
| `categorie: "supergroupe"` | `categorie: "active"` | Groupe actif |

**Note**: La "catégorie" représente maintenant le **statut** du groupe (actif/archivé/supprimé), pas sa taille.
