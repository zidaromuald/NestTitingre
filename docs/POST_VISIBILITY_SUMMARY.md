# Résumé Visuel : Logique de Visibilité des Posts

## 🎯 Question Principale

**Votre question :** "Pour un post, si on sélectionne public, tous ceux qui me suivent peuvent voir le post. Si on choisit groupe, seuls les membres du groupe peuvent voir. Si un user sélectionne une société, seule la société va voir le post sur sa page privée. Vice versa pour une société qui publie. Est-ce que cette logique est respectée ?"

**Réponse courte :** ⚠️ **NON, pas complètement implémenté actuellement**

---

## 📊 Logique Actuelle vs Logique Souhaitée

### ✅ Ce qui FONCTIONNE déjà :

```
✓ Structure DB (groupe_id, societe_id, visibility)
✓ Validation : pas groupe ET société en même temps
✓ Feed public basique
✓ Posts par auteur
✓ Posts par groupe
```

### ❌ Ce qui MANQUE :

```
✗ Système de followers (suivis)
✗ Vérification des permissions de membre
✗ Feed personnalisé complet
✗ Validation cohérence société
```

---

## 🔍 Votre Logique Expliquée en 3 Cas

### Cas 1️⃣ : Post PERSONNEL (Public)

```
┌─────────────────────────────────────────┐
│  User #1 crée un post                   │
│  ─────────────────────                  │
│  groupe_id: null                        │
│  societe_id: null                       │
│  visibility: "public"                   │
└─────────────────────────────────────────┘
                  │
                  │ Qui voit ce post ?
                  ▼
    ┌─────────────────────────────┐
    │ ✅ Followers du User #1     │
    │ ✅ Feed public général      │
    │ ✅ Profil du User #1        │
    └─────────────────────────────┘
```

**Exemple concret :**
```json
{
  "contenu": "Bonjour tout le monde !",
  "images": ["photo.jpg"],
  "groupe_id": null,
  "societe_id": null,
  "visibility": "public"
}
```

---

### Cas 2️⃣ : Post dans un GROUPE

```
┌─────────────────────────────────────────┐
│  User #1 poste dans Groupe #5           │
│  ──────────────────────────              │
│  groupe_id: 5                           │
│  societe_id: null                       │
│  visibility: "membres_only"             │
└─────────────────────────────────────────┘
                  │
                  │ Qui voit ce post ?
                  ▼
    ┌─────────────────────────────────────┐
    │ ✅ SEULEMENT les membres du         │
    │    Groupe #5                        │
    │                                     │
    │ ❌ PAS les followers du User #1     │
    │ ❌ PAS dans le feed public          │
    └─────────────────────────────────────┘
```

**Exemple concret :**
```json
{
  "contenu": "Message privé pour le groupe",
  "groupe_id": 5,
  "visibility": "membres_only"
}
```

**Variante : Si visibility = "public"**
```
┌─────────────────────────────────────────┐
│  groupe_id: 5                           │
│  visibility: "public"                   │
└─────────────────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │ ✅ Tout le monde peut voir          │
    │ ✅ Apparaît dans le feed public     │
    │ ✅ Sur la page du groupe            │
    └─────────────────────────────────────┘
```

---

### Cas 3️⃣ : Post sur la page d'une SOCIÉTÉ

#### A. User poste sur la page d'une Société

```
┌─────────────────────────────────────────┐
│  User #1 poste sur Société #10          │
│  ───────────────────────────            │
│  societe_id: 10                         │
│  groupe_id: null                        │
│  visibility: "membres_only"             │
└─────────────────────────────────────────┘
                  │
                  │ Qui voit ce post ?
                  ▼
    ┌─────────────────────────────────────┐
    │ ✅ SEULEMENT les employés/membres   │
    │    de la Société #10                │
    │                                     │
    │ ❌ PAS les followers du User #1     │
    │ ❌ PAS dans le feed public          │
    │                                     │
    │ 📍 Visible sur la page privée       │
    │    de la Société #10                │
    └─────────────────────────────────────┘
```

**Exemple concret :**
```json
{
  "contenu": "Annonce interne pour l'entreprise",
  "societe_id": 10,
  "visibility": "membres_only"
}
```

#### B. Société poste sur sa propre page

```
┌─────────────────────────────────────────┐
│  Société #10 poste sur sa page          │
│  ───────────────────────────            │
│  posted_by_id: 10                       │
│  posted_by_type: "Societe"              │
│  societe_id: 10                         │
│  visibility: "public"                   │
└─────────────────────────────────────────┘
                  │
                  │ Qui voit ce post ?
                  ▼
    ┌─────────────────────────────────────┐
    │ ✅ Tout le monde                    │
    │ ✅ Feed public                      │
    │ ✅ Followers de la Société #10      │
    │ ✅ Page de la Société #10           │
    └─────────────────────────────────────┘
```

---

## 🎨 Tableau Récapitulatif

| Scénario | groupe_id | societe_id | visibility | Qui voit ? |
|----------|-----------|------------|------------|------------|
| **Post personnel public** | `null` | `null` | `public` | 👥 Tous les followers |
| **Post personnel dans feed** | `null` | `null` | `public` | 🌍 Feed public |
| **Post groupe public** | `5` | `null` | `public` | 🌍 Tout le monde |
| **Post groupe privé** | `5` | `null` | `membres_only` | 👥 Membres du groupe seulement |
| **Post groupe admin** | `5` | `null` | `admins_only` | 👔 Admins du groupe seulement |
| **Post société public** | `null` | `10` | `public` | 🌍 Tout le monde |
| **Post société privé** | `null` | `10` | `membres_only` | 👥 Employés de la société |
| **Post société admin** | `null` | `10` | `admins_only` | 👔 Admins de la société |

---

## ⚙️ Règles Importantes

### Règle #1 : Exclusivité
```
❌ INTERDIT d'avoir groupe_id ET societe_id en même temps

✅ VALIDE : groupe_id = 5,  societe_id = null
✅ VALIDE : groupe_id = null, societe_id = 10
❌ INVALIDE : groupe_id = 5,  societe_id = 10
```

### Règle #2 : Permission de poster
```
Pour poster dans un GROUPE :
  → L'auteur DOIT être membre du groupe

Pour poster sur une SOCIÉTÉ :
  → L'auteur DOIT être employé/membre de la société
  → OU la société poste sur sa propre page
```

### Règle #3 : Cohérence Société
```
Si posted_by_type = "Societe" ET societe_id est renseigné
  → posted_by_id DOIT ÊTRE ÉGAL à societe_id

✅ VALIDE :
   posted_by_id: 10, posted_by_type: "Societe", societe_id: 10

❌ INVALIDE :
   posted_by_id: 10, posted_by_type: "Societe", societe_id: 20
   (Société #10 ne peut pas poster sur la page de Société #20)
```

---

## 📱 Exemples d'Interface Utilisateur

### Quand un User crée un post, il choisit :

```
┌──────────────────────────────────────┐
│  Créer un post                       │
│  ────────────────                    │
│                                      │
│  Publier sur :                       │
│  ○ Mon profil (public)               │ ← groupe_id = null, societe_id = null
│  ○ Groupe "Tech Lovers" (5)          │ ← groupe_id = 5
│  ○ Société "ABC Corp" (10)           │ ← societe_id = 10
│                                      │
│  Visibilité :                        │
│  ○ Public                            │
│  ○ Membres seulement                 │
│  ○ Admins seulement                  │
│                                      │
│  [Texte du post...]                  │
│  [📷 Ajouter images/vidéos]          │
│                                      │
│  [ Publier ]                         │
└──────────────────────────────────────┘
```

### Résultat selon les choix :

**Choix 1 : "Mon profil (public)"**
```
→ Visible par tous mes followers
→ Apparaît dans le feed public
```

**Choix 2 : "Groupe Tech Lovers" + "Membres seulement"**
```
→ Visible UNIQUEMENT par les membres du groupe
→ N'apparaît PAS dans le feed public
→ N'apparaît PAS pour mes followers (sauf s'ils sont membres du groupe)
```

**Choix 3 : "Société ABC Corp" + "Membres seulement"**
```
→ Visible UNIQUEMENT par les employés d'ABC Corp
→ N'apparaît PAS dans le feed public
→ Apparaît sur la page privée d'ABC Corp
```

---

## 🚀 Ce qu'il faut implémenter

### Étape 1 : Système de Suivis (Followers)

```typescript
// Table suivis
{
  follower_id: 1,       // Qui suit
  follower_type: 'User',
  followed_id: 2,       // Qui est suivi
  followed_type: 'User',
  created_at: '2024-01-01'
}
```

### Étape 2 : Vérification des Permissions

```typescript
// Avant de créer un post dans un groupe
await verifyGroupeMembership(user, groupe_id)

// Avant de créer un post dans une société
await verifySocieteMembership(user, societe_id)
```

### Étape 3 : Feed Personnalisé Complet

```typescript
// Le feed doit inclure :
1. Posts personnels (public) des entités suivies
2. Posts dans les groupes dont je suis membre
3. Posts dans les sociétés dont je suis employé
4. Mes propres posts

// Et EXCLURE :
1. Posts avec visibility = "membres_only" si je ne suis pas membre
2. Posts avec visibility = "admins_only" si je ne suis pas admin
```

---

## ✅ Conclusion

**Votre logique est CORRECTE et BIEN PENSÉE !**

Actuellement, le code a la **structure de base**, mais il manque :
1. Le système de followers
2. Les vérifications de permissions
3. Le feed personnalisé complet

Ces fonctionnalités sont **marquées comme TODO** dans le code et doivent être implémentées pour que la logique complète fonctionne.

---

## 📚 Fichiers à consulter

- [POST_VISIBILITY_LOGIC.md](POST_VISIBILITY_LOGIC.md) - Documentation complète
- [POST_EXAMPLES.md](examples/POST_EXAMPLES.md) - Exemples de tests
- [post.entity.ts](../src/modules/posts/entities/post.entity.ts) - Entité Post
- [post.service.ts](../src/modules/posts/services/post.service.ts) - Service Post (contient les TODO)
