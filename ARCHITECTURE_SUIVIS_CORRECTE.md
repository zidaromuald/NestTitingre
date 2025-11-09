# Architecture CORRECTE du module Suivis

## 🎯 Logique Métier

### Sur le profil User:
**Bouton: "SUIVRE"**
1. Clique → Envoie **InvitationSuivi** (status: PENDING)
2. Si ACCEPTÉE → Crée 2 **Suivre** mutuels (A→B et B→A)
3. Après acceptation:
   - ✅ Peut créer **Groupe privé** (canal de communication)
   - ✅ Communiquer: texte, vocal, image, vidéo
   - ✅ Intégrer d'autres personnes qu'on suit mutuellement

### Sur le profil Societe:
**2 Boutons:**

**1. "SUIVRE"** (même logique que User)
- Envoie InvitationSuivi
- Si acceptée → Suivre mutuel
- Communication via Groupe

**2. "S'ABONNER"** (collaboration business)
- Crée **Abonnement** (User ↔ Societe)
- Crée automatiquement **PagePartenariat**
- Permet collaboration dans même secteur d'activité

---

## 📊 Entités

### 1. InvitationSuivi (NOUVEAU)
```typescript
{
  sender_id: number;          // Qui envoie
  target_id: number;          // À qui (User ou Societe)
  target_type: string;        // 'User' ou 'Societe'
  status: PENDING|ACCEPTED|DECLINED|EXPIRED;
  message: string;
  expires_at: Date;
  responded_at: Date;
}
```

**Flux:**
```
User A clique "Suivre" sur User B
  ↓
InvitationSuivi créée (PENDING)
  ↓
User B accepte
  ↓
2 Suivre créés:
- Suivre(user_id: A, followed_id: B, followed_type: 'User')
- Suivre(user_id: B, followed_id: A, followed_type: 'User')
  ↓
A et B peuvent créer Groupe privé
```

### 2. Suivre (MODIFIÉ)
**Créé UNIQUEMENT après acceptation d'InvitationSuivi**

```typescript
{
  user_id: number;
  followed_id: number;
  followed_type: string;     // 'User' ou 'Societe'
  notifications_posts: boolean;
  notifications_email: boolean;
  derniere_visite: Date;
  total_likes: number;
  total_commentaires: number;
  total_partages: number;
}
```

**Caractéristiques:**
- ✅ Connexion mutuelle (bidirectionnelle)
- ✅ Permet création de Groupes privés
- ✅ Tracking d'engagement
- ✅ Pour Societe: peut upgrader vers Abonnement

### 3. Abonnement (EXISTANT)
**Créé via bouton "S'ABONNER" (différent de "Suivre")**

```typescript
{
  user_id: number;
  societe_id: number;
  statut: ACTIF|INACTIF|SUSPENDU|EXPIRE;
  plan_collaboration: STANDARD|PREMIUM|ENTERPRISE;
  secteur_collaboration: string;
  role_utilisateur: string;
  page_partenariat_id: number;  // Créé automatiquement
  page_partenariat_creee: boolean;
}
```

---

## 🔄 Services

### InvitationSuiviService

**Méthodes:**
```typescript
// Envoyer invitation
envoyerInvitation(senderId, targetId, targetType, message?)
  → Crée InvitationSuivi (PENDING)

// Accepter invitation
accepterInvitation(invitationId, userId)
  → Change status à ACCEPTED
  → Crée 2 Suivre mutuels (A→B et B→A)
  → Retourne les 2 Suivre créés

// Refuser invitation
refuserInvitation(invitationId, userId)
  → Change status à DECLINED

// Annuler invitation (sender uniquement)
annulerInvitation(invitationId, senderId)
  → Supprime l'invitation

// Mes invitations envoyées
getMesInvitationsEnvoyees(userId, status?)

// Mes invitations reçues
getMesInvitationsRecues(userId, status?)
```

### SuivreService (MODIFIÉ)

**Méthodes:**
```typescript
// Récupérer mes connexions
getMesConnexions(userId, type?)  // type = 'User' | 'Societe'

// Vérifier si connexion mutuelle existe
sontConnectes(userId, targetId, targetType)

// Ne plus suivre (supprime connexion mutuelle)
unfollowMutuel(userId, targetId, targetType)
  → Supprime les 2 Suivre (A→B et B→A)

// Upgrade vers abonnement (UNIQUEMENT Societe)
upgradeToAbonnement(userId, societeId, data)
  → Crée Abonnement
  → Crée PagePartenariat
```

---

## 🎮 Controllers

### InvitationSuiviController

```typescript
POST   /invitations-suivi              // Envoyer invitation
PUT    /invitations-suivi/:id/accept   // Accepter
PUT    /invitations-suivi/:id/decline  // Refuser
DELETE /invitations-suivi/:id          // Annuler
GET    /invitations-suivi/sent         // Mes envois
GET    /invitations-suivi/received     // Mes réceptions
```

### SuivreController (MODIFIÉ)

```typescript
GET    /suivis/my-connections?type=User|Societe  // Mes connexions
GET    /suivis/check/:type/:id                   // Vérifier connexion
DELETE /suivis/:type/:id                         // Ne plus suivre
POST   /suivis/upgrade-to-abonnement             // S'abonner (Societe)
GET    /suivis/stats/:type/:id                   // Statistiques
```

---

## 🔀 Flux complets

### Flux 1: User A suit User B

```
1. User A clique "Suivre" sur profil User B
   POST /invitations-suivi
   {
     "target_id": B,
     "target_type": "User",
     "message": "Salut, travaillons ensemble!"
   }
   → InvitationSuivi créée (PENDING)

2. User B reçoit notification

3. User B accepte
   PUT /invitations-suivi/{id}/accept
   → InvitationSuivi passe à ACCEPTED
   → Crée Suivre(A→B) et Suivre(B→A)

4. A et B sont connectés mutuellement
   → Peuvent créer Groupe privé
   → Peuvent communiquer (texte, vocal, image, vidéo)
   → Peuvent intégrer d'autres contacts mutuels
```

### Flux 2: User A suit Societe C

```
1. User A clique "Suivre" sur profil Societe C
   POST /invitations-suivi
   {
     "target_id": C,
     "target_type": "Societe"
   }

2. Représentant de Societe C accepte
   PUT /invitations-suivi/{id}/accept
   → Crée Suivre(A→C) et Suivre(C→A)

3. Connexion établie
   → Peuvent créer Groupe privé
   → Peuvent communiquer
```

### Flux 3: User A s'abonne à Societe C (collaboration business)

```
Prérequis: A et C doivent être connectés (Suivre mutuel)

1. User A clique "S'ABONNER" sur profil Societe C
   POST /suivis/upgrade-to-abonnement
   {
     "societe_id": C,
     "plan_collaboration": "premium",
     "secteur_collaboration": "Agriculture - Coton",
     "role_utilisateur": "Fournisseur"
   }

2. Transaction atomique:
   → Crée Abonnement(A↔C)
   → Crée PagePartenariat automatiquement
   → Lie les deux

3. Résultat:
   → Relation business établie
   → Page partenariat pour collaboration
   → Gestion activités communes secteur
```

---

## 📝 Migrations nécessaires

### 1. CreateInvitationSuiviTable
```sql
CREATE TABLE invitations_suivi (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL,
  target_id INT NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(sender_id, target_id, target_type)
);

CREATE INDEX idx_invitations_status ON invitations_suivi(status);
CREATE INDEX idx_invitations_target ON invitations_suivi(target_id, target_type);
```

### 2. Table Suivre déjà existante
- Déjà mise à jour avec followed_id + followed_type
- Migration précédente suffit

---

## 🎯 Différences clés

| Aspect | InvitationSuivi | Suivre | Abonnement |
|--------|-----------------|--------|------------|
| **Quand créé** | Clic "Suivre" | Après acceptation | Clic "S'abonner" |
| **État** | PENDING → ACCEPTED/DECLINED | Connexion établie | Relation business |
| **Bidirectionnel** | Non (1 entrée) | Oui (2 entrées A→B, B→A) | Non (1 entrée) |
| **Permet Groupe** | ❌ Non | ✅ Oui | ✅ Oui (via PagePartenariat) |
| **Pour Societe** | ✅ Oui | ✅ Oui | ✅ Uniquement |

---

## ✅ Avantages de cette architecture

1. **Séparation claire:**
   - InvitationSuivi = Demandes
   - Suivre = Connexions établies
   - Abonnement = Collaboration business

2. **Contrôle:**
   - Personne ne peut forcer une connexion
   - Nécessite acceptation mutuelle

3. **Flexibilité:**
   - Groupes privés entre connexions
   - Upgrade vers abonnement business
   - Communication multimédia

4. **Scalabilité:**
   - Facile d'ajouter fonctionnalités
   - Stats d'engagement par connexion
   - Gestion expiration invitations
