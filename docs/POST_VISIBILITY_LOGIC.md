# Logique de Visibilité des Posts

## Vue d'ensemble

Ce document décrit la logique de visibilité des posts dans le système.

---

## 1. Types de Publication

Un post peut être publié dans **3 contextes différents** :

### 1.1 Post Personnel (Public)
- **Conditions** : `groupe_id = null` ET `societe_id = null`
- **Visibilité** : Tous les utilisateurs qui suivent l'auteur peuvent voir le post
- **Exemple** : Un user poste sur son profil personnel

```json
{
  "contenu": "Mon post personnel",
  "images": ["photo.jpg"],
  "groupe_id": null,
  "societe_id": null,
  "visibility": "public"
}
```

**Qui peut voir ?**
- ✅ Tous les followers de l'auteur
- ✅ Le post apparaît dans le feed public
- ✅ Le post apparaît sur le profil de l'auteur

---

### 1.2 Post dans un Groupe
- **Conditions** : `groupe_id` renseigné
- **Visibilité** : Dépend du paramètre `visibility`

```json
{
  "contenu": "Post dans le groupe",
  "groupe_id": 5,
  "visibility": "membres_only"
}
```

**Options de visibilité :**

#### A. `visibility: "public"`
- ✅ Visible par tous (même non-membres)
- ✅ Apparaît dans le feed public
- ✅ Apparaît sur la page du groupe

#### B. `visibility: "membres_only"`
- ✅ Visible UNIQUEMENT par les membres du groupe
- ❌ N'apparaît PAS dans le feed public
- ✅ Apparaît sur la page du groupe (si membre)

#### C. `visibility: "admins_only"`
- ✅ Visible UNIQUEMENT par les admins du groupe
- ❌ N'apparaît PAS dans le feed public
- ❌ Invisible pour les membres normaux

---

### 1.3 Post dans une Société
- **Conditions** : `societe_id` renseigné
- **Visibilité** : Similaire au groupe

```json
{
  "contenu": "Post sur la page de la société",
  "societe_id": 10,
  "visibility": "membres_only"
}
```

**Qui peut poster ?**
- ✅ La société elle-même (posted_by_type = 'Societe')
- ✅ Les employés/membres de la société (si autorisés)

**Qui peut voir ?**
- Si `visibility: "public"` → Tout le monde
- Si `visibility: "membres_only"` → Seulement les employés/membres de la société
- Si `visibility: "admins_only"` → Seulement les administrateurs de la société

---

## 2. Matrice de Visibilité Complète

| Type de Post | Visibility | Qui peut voir ? |
|-------------|-----------|----------------|
| Personnel | public | Tous les followers + Feed public |
| Groupe | public | Tout le monde + Feed public |
| Groupe | membres_only | Membres du groupe uniquement |
| Groupe | admins_only | Admins du groupe uniquement |
| Société | public | Tout le monde + Feed public |
| Société | membres_only | Employés/membres de la société |
| Société | admins_only | Administrateurs de la société |

---

## 3. Scénarios d'Utilisation

### Scénario 1 : User publie sur son profil
```typescript
// User ID: 1 poste sur son profil
{
  posted_by_id: 1,
  posted_by_type: 'User',
  contenu: "Bonjour à tous !",
  groupe_id: null,      // ← Pas de groupe
  societe_id: null,     // ← Pas de société
  visibility: "public"
}
```
**Résultat** : Tous les followers du User #1 voient ce post dans leur feed

---

### Scénario 2 : User publie dans un groupe
```typescript
// User ID: 1 poste dans Groupe ID: 5
{
  posted_by_id: 1,
  posted_by_type: 'User',
  contenu: "Message pour le groupe",
  groupe_id: 5,         // ← Dans le groupe
  societe_id: null,
  visibility: "membres_only"
}
```
**Résultat** : Seulement les membres du Groupe #5 peuvent voir ce post

---

### Scénario 3 : Société publie sur sa page
```typescript
// Société ID: 10 poste sur sa propre page
{
  posted_by_id: 10,
  posted_by_type: 'Societe',
  contenu: "Nouvelle offre d'emploi !",
  groupe_id: null,
  societe_id: 10,       // ← Sur la page de la société
  visibility: "public"
}
```
**Résultat** : Tout le monde peut voir ce post (apparaît dans le feed public)

---

### Scénario 4 : User sélectionne une société pour publier
```typescript
// User ID: 1 publie sur la page de la Société ID: 10
{
  posted_by_id: 1,
  posted_by_type: 'User',
  contenu: "Message interne de l'entreprise",
  groupe_id: null,
  societe_id: 10,       // ← Sur la page de la société
  visibility: "membres_only"
}
```
**Résultat** : Seulement les employés/membres de la Société #10 peuvent voir

---

### Scénario 5 : Société publie pour une autre société (NON AUTORISÉ)
```typescript
// ❌ INTERDIT : Société ID: 10 ne peut PAS poster sur la page de Société ID: 20
{
  posted_by_id: 10,
  posted_by_type: 'Societe',
  societe_id: 20        // ← INTERDIT
}
```
**Résultat** : Erreur 403 - Une société ne peut poster que sur sa propre page

---

## 4. Règles de Validation

### Règle 1 : Exclusivité groupe/société
```typescript
// ❌ INTERDIT : Un post ne peut pas être dans un groupe ET une société
{
  groupe_id: 5,
  societe_id: 10    // ❌ Les deux en même temps = ERREUR
}
```

### Règle 2 : Membership requis
- Pour poster dans un groupe → L'auteur doit être membre du groupe
- Pour poster dans une société → L'auteur doit être employé/membre de la société

### Règle 3 : Cohérence société
```typescript
// Si posted_by_type = 'Societe' ET societe_id est renseigné
// Alors posted_by_id DOIT être égal à societe_id

// ✅ VALIDE
{
  posted_by_id: 10,
  posted_by_type: 'Societe',
  societe_id: 10    // ✅ La société poste sur sa propre page
}

// ❌ INVALIDE
{
  posted_by_id: 10,
  posted_by_type: 'Societe',
  societe_id: 20    // ❌ Société 10 ne peut pas poster sur page Société 20
}
```

---

## 5. Implémentation du Feed Personnalisé

### Algorithm du Feed

```typescript
async getPersonalizedFeed(currentUser: User | Societe) {
  // 1. Récupérer les IDs des entités suivies
  const followedUserIds = await getFollowedUserIds(currentUser);
  const followedSocieteIds = await getFollowedSocieteIds(currentUser);

  // 2. Récupérer les IDs des groupes dont l'utilisateur est membre
  const memberGroupeIds = await getUserGroupeIds(currentUser);

  // 3. Récupérer les IDs des sociétés dont l'utilisateur est employé
  const employeeSocieteIds = await getUserSocieteIds(currentUser);

  // 4. Construire la query
  return posts WHERE (
    // Posts personnels des entités suivies (public)
    (posted_by_id IN followedUserIds AND posted_by_type = 'User'
     AND groupe_id IS NULL AND societe_id IS NULL AND visibility = 'public')

    OR

    (posted_by_id IN followedSocieteIds AND posted_by_type = 'Societe'
     AND groupe_id IS NULL AND societe_id IS NULL AND visibility = 'public')

    OR

    // Posts dans les groupes dont je suis membre
    (groupe_id IN memberGroupeIds AND visibility IN ('public', 'membres_only'))

    OR

    // Posts dans mes groupes (admin only si je suis admin)
    (groupe_id IN myAdminGroupeIds AND visibility = 'admins_only')

    OR

    // Posts dans les sociétés dont je suis employé
    (societe_id IN employeeSocieteIds AND visibility IN ('public', 'membres_only'))

    OR

    // Mes propres posts
    (posted_by_id = currentUser.id AND posted_by_type = currentUser.type)
  )
  ORDER BY created_at DESC
}
```

---

## 6. Ce qui est Implémenté vs Ce qui Manque

### ✅ Déjà Implémenté

1. Structure de la base de données (champs groupe_id, societe_id, visibility)
2. Validation : Un post ne peut pas être dans groupe ET société en même temps
3. Vérification que le groupe/société existe
4. Feed public (posts avec visibility = 'public')
5. Récupération des posts par auteur
6. Récupération des posts par groupe

### ❌ À Implémenter

1. **Système de suivi (Following)**
   - Table `suivis` pour tracker qui suit qui
   - Méthodes `getFollowedUserIds()` et `getFollowedSocieteIds()`

2. **Vérification des permissions**
   - `verifyGroupeMembership()` - Vérifier que l'auteur est membre du groupe
   - `verifySocieteMembership()` - Vérifier que l'auteur est employé de la société
   - `verifyGroupeAdmin()` - Vérifier que l'utilisateur est admin du groupe

3. **Feed personnalisé complet**
   - Intégrer le système de suivis
   - Intégrer les groupes de l'utilisateur
   - Intégrer les sociétés de l'utilisateur
   - Respecter les règles de visibilité

4. **Règle de cohérence Société**
   - Valider que si `posted_by_type = 'Societe'` et `societe_id` est renseigné,
     alors `posted_by_id === societe_id`

5. **Permissions de publication**
   - Vérifier les droits avant de créer un post dans un groupe/société

---

## 7. Exemples de Requêtes d'Implémentation

### Vérifier le membership d'un groupe

```typescript
async verifyGroupeMembership(user: User, groupeId: number): Promise<boolean> {
  const membership = await this.groupeMembreRepo.findOne({
    where: {
      groupe_id: groupeId,
      user_id: user.id,
      // statut: 'actif' si vous avez ce champ
    }
  });

  if (!membership) {
    throw new ForbiddenException(
      'Vous devez être membre du groupe pour y publier'
    );
  }

  return true;
}
```

### Récupérer les IDs des utilisateurs suivis

```typescript
async getFollowedUserIds(currentUser: User): Promise<number[]> {
  const suivis = await this.suiviRepo.find({
    where: {
      follower_id: currentUser.id,
      follower_type: 'User',
      followed_type: 'User'
      // statut: 'accepté' si vous avez un système d'acceptation
    }
  });

  return suivis.map(s => s.followed_id);
}
```

### Feed personnalisé complet

```typescript
async getPersonalizedFeed(currentUser: User, options) {
  // Récupérer les IDs
  const followedUserIds = await this.getFollowedUserIds(currentUser);
  const followedSocieteIds = await this.getFollowedSocieteIds(currentUser);
  const memberGroupeIds = await this.getUserGroupeIds(currentUser);
  const employeeSocieteIds = await this.getUserSocieteIds(currentUser);

  return this.postRepo
    .createQueryBuilder('post')
    .where(
      new Brackets((qb) => {
        // Mes propres posts
        qb.where(
          'post.posted_by_id = :userId AND post.posted_by_type = :userType',
          { userId: currentUser.id, userType: 'User' }
        )

        // Posts personnels (public) des users suivis
        .orWhere(
          `post.posted_by_id IN (:...followedUserIds)
           AND post.posted_by_type = 'User'
           AND post.groupe_id IS NULL
           AND post.societe_id IS NULL
           AND post.visibility = 'public'`,
          { followedUserIds: followedUserIds.length ? followedUserIds : [0] }
        )

        // Posts personnels (public) des sociétés suivies
        .orWhere(
          `post.posted_by_id IN (:...followedSocieteIds)
           AND post.posted_by_type = 'Societe'
           AND post.groupe_id IS NULL
           AND post.societe_id IS NULL
           AND post.visibility = 'public'`,
          { followedSocieteIds: followedSocieteIds.length ? followedSocieteIds : [0] }
        )

        // Posts dans mes groupes
        .orWhere(
          `post.groupe_id IN (:...memberGroupeIds)
           AND post.visibility IN ('public', 'membres_only')`,
          { memberGroupeIds: memberGroupeIds.length ? memberGroupeIds : [0] }
        )

        // Posts dans mes sociétés
        .orWhere(
          `post.societe_id IN (:...employeeSocieteIds)
           AND post.visibility IN ('public', 'membres_only')`,
          { employeeSocieteIds: employeeSocieteIds.length ? employeeSocieteIds : [0] }
        );
      })
    )
    .orderBy('post.created_at', 'DESC')
    .take(options?.limit || 20)
    .skip(options?.offset || 0)
    .getMany();
}
```

---

## 8. Résumé de la Logique Complète

### Pour un POST PERSONNEL (Public)
```
groupe_id = null
societe_id = null
visibility = public
→ Visible par tous les followers de l'auteur
```

### Pour un POST dans un GROUPE
```
groupe_id = X
societe_id = null
visibility = membres_only
→ Visible UNIQUEMENT par les membres du groupe X
```

### Pour un POST dans une SOCIÉTÉ
```
groupe_id = null
societe_id = Y
visibility = membres_only
→ Visible UNIQUEMENT par les employés/membres de la société Y
```

### Règle Importante
**Un User ou une Société peut publier sur la page d'une autre Société UNIQUEMENT s'il/elle est membre/employé de cette société.**

**Une Société ne peut poster sur la page d'une autre Société que si elles sont liées d'une manière ou d'une autre (à définir selon vos besoins métier).**

---

## 9. Prochaines Étapes d'Implémentation

1. ✅ Terminer le système de `suivis` (followers)
2. ✅ Implémenter `verifyGroupeMembership()`
3. ✅ Implémenter `verifySocieteMembership()`
4. ✅ Ajouter la validation de cohérence Société
5. ✅ Compléter le feed personnalisé avec toutes les règles
6. ✅ Ajouter des tests pour chaque scénario de visibilité
