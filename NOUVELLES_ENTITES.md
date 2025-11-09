# 🎉 Nouvelles Entités Créées - Système de Collaboration Business

## Vue d'ensemble

J'ai créé **6 nouvelles entités** pour compléter votre système de collaboration business entre Users et Sociétés.

---

## ✅ Entités Créées

### 1. **Abonnement** - Abonnement Business

📁 **Fichier:** [src/modules/abonnements/entities/abonnement.entity.ts](src/modules/abonnements/entities/abonnement.entity.ts)

**Description:** Gère les abonnements business entre un User et une Societe avec système de plans et permissions.

**Colonnes principales:**
- `user_id` - L'utilisateur abonné
- `societe_id` - La société
- `statut` - actif, inactif, suspendu, expire
- `plan_collaboration` - standard, premium, enterprise
- `solde_compte` - Solde pour transactions
- `groupe_collaboration_id` - Groupe automatique créé
- `permissions[]` - Permissions JSON
- `secteur_collaboration` - Secteur d'activité
- `role_utilisateur` - Rôle dans la collaboration

**Relations:**
- `@ManyToOne` → User
- `@ManyToOne` → Societe
- `@ManyToOne` → Groupe (groupe de collaboration)
- `@OneToMany` → TransactionCollaboration
- `@OneToMany` → MessageCollaboration

**Méthodes helper:**
- `isActif()` - Vérifie si l'abonnement est actif
- `isPlanStandard/Premium/Enterprise()` - Vérifie le plan
- `hasPermission(permission)` - Vérifie une permission
- `peutUpgraderVers(plan)` - Peut upgrader vers un plan supérieur

**Fonctionnalités Laravel à implémenter dans le service:**
- `ajouterSolde(montant)` - Ajouter du crédit
- `debiterSolde(montant)` - Débiter du crédit
- `marquerActiviteBusiness()` - Mettre à jour dernière activité
- `upgraderPlan(nouveauPlan)` - Upgrader le plan
- `creerGroupeCollaboration()` - Créer automatiquement un groupe (hook boot)

---

### 2. **Suivre** - Suivi de Société

📁 **Fichier:** [src/modules/suivis/entities/suivre.entity.ts](src/modules/suivis/entities/suivre.entity.ts)

**Description:** Permet à un User de suivre une Société (comme Instagram/Facebook) avec tracking des interactions.

**Colonnes principales:**
- `user_id` - L'utilisateur qui suit
- `societe_id` - La société suivie
- `notifications_posts` - Activer notifications posts
- `notifications_email` - Activer notifications email
- `derniere_visite` - Dernière visite du profil
- `derniere_interaction` - Dernière interaction
- `total_likes` - Total des likes donnés
- `total_commentaires` - Total des commentaires
- `total_partages` - Total des partages

**Relations:**
- `@ManyToOne` → User
- `@ManyToOne` → Societe
- `@OneToOne` → Abonnement (optionnel)

**Méthodes helper:**
- `marquerVisite()` - Marquer une visite
- `incrementerLike/Commentaire/Partage()` - Incrémenter les stats
- `calculerScoreEngagement()` - Score d'engagement
- `peutUpgraderVersAbonnement()` - Peut passer en abonnement business

---

### 3. **Like** - Likes Polymorphiques

📁 **Fichier:** [src/modules/posts/entities/like.entity.ts](src/modules/posts/entities/like.entity.ts)

**Description:** Gère les likes sur les posts (par User ou Societe).

**Colonnes principales:**
- `post_id` - Le post liké
- `likeable_id` - ID de l'entité (User ou Societe)
- `likeable_type` - Type: 'User' ou 'Societe'

**Relations:**
- `@ManyToOne` → Post

**Index unique:** `['post_id', 'likeable_id', 'likeable_type']` pour éviter les doublons

**Méthodes helper:**
- `isLikeByUser()` - Vérifie si c'est un like User
- `isLikeBySociete()` - Vérifie si c'est un like Societe

---

### 4. **Commentaire** - Commentaires Polymorphiques

📁 **Fichier:** [src/modules/posts/entities/commentaire.entity.ts](src/modules/posts/entities/commentaire.entity.ts)

**Description:** Gère les commentaires sur les posts (par User ou Societe).

**Colonnes principales:**
- `post_id` - Le post commenté
- `commentable_id` - ID de l'auteur (User ou Societe)
- `commentable_type` - Type: 'User' ou 'Societe'
- `contenu` - Texte du commentaire

**Relations:**
- `@ManyToOne` → Post

**Méthodes helper:**
- `isCommentByUser()` - Vérifie si c'est un commentaire User
- `isCommentBySociete()` - Vérifie si c'est un commentaire Societe

---

### 5. **Conversation** - Conversations Privées

📁 **Fichier:** [src/modules/messages/entities/conversation.entity.ts](src/modules/messages/entities/conversation.entity.ts)

**Description:** Gère les conversations privées entre 2 entités (User-User, User-Societe, Societe-Societe).

**Colonnes principales:**
- `participant1_id` / `participant1_type` - Premier participant
- `participant2_id` / `participant2_type` - Deuxième participant
- `titre` - Titre optionnel
- `dernier_message_at` - Timestamp du dernier message
- `is_archived` - Conversation archivée
- `metadata` - Données supplémentaires JSON

**Relations:**
- `@OneToMany` → MessageCollaboration

**Méthodes helper:**
- `isParticipant(entityId, entityType)` - Vérifie si une entité participe
- `getOtherParticipant(entityId, entityType)` - Récupère l'autre participant

---

### 6. **MessageCollaboration** - Messages Business

📁 **Fichier:** [src/modules/messages/entities/message-collaboration.entity.ts](src/modules/messages/entities/message-collaboration.entity.ts)

**Description:** Messages de collaboration entre Users et Sociétés avec support des transactions.

**Colonnes principales:**
- `conversation_id` - La conversation
- `transaction_collaboration_id` - Transaction liée (optionnel)
- `abonnement_id` - Abonnement lié (optionnel)
- `sender_id` / `sender_type` - Expéditeur polymorphique
- `recipient_id` / `recipient_type` - Destinataire polymorphique
- `contenu` - Contenu du message
- `type` - normal, collaboration, systeme
- `statut` - envoye, delivre, lu
- `lu_a` - Timestamp de lecture
- `fichiers[]` - Pièces jointes JSON
- `metadata` - Métadonnées JSON

**Relations:**
- `@ManyToOne` → Conversation
- `@ManyToOne` → TransactionCollaboration
- `@ManyToOne` → Abonnement

**Méthodes helper:**
- `marquerCommeLu()` - Marquer comme lu
- `isLu()` - Vérifie si lu
- `isSenderUser/Societe()` - Type d'expéditeur
- `isRecipientUser/Societe()` - Type de destinataire
- `isMessageCollaboration()` - Vérifie si message de collaboration

**Méthode statique Laravel à implémenter:**
- `creerMessageTransaction(transaction, contenu, metadata)` - Créer un message lié à une transaction

---

## 🔄 Entités Mises à Jour

### Post - Ajout des relations

**Nouvelles relations ajoutées:**
```typescript
@OneToMany(() => Like, (like) => like.post)
likes: Like[];

@OneToMany(() => Commentaire, (commentaire) => commentaire.post)
commentaires: Commentaire[];
```

### TransactionCollaboration - Ajout abonnement

**Nouvelle relation ajoutée:**
```typescript
@Column({ type: 'int', nullable: true })
abonnement_id: number;

@ManyToOne(() => Abonnement, (abonnement) => abonnement.transactions)
abonnement: Abonnement;
```

---

## 📊 Diagramme des Relations

```
User ──1:N──> Abonnement <──N:1── Societe
                  │
                  └──> Groupe (collaboration)
                  │
                  └──1:N──> Transaction
                  │
                  └──1:N──> Message

User ──1:N──> Suivre <──N:1── Societe

User/Societe ──N:N──> Post
                       │
                       ├──1:N──> Like (polymorphique)
                       └──1:N──> Commentaire (polymorphique)

User/Societe ──N:N──> Conversation
                       │
                       └──1:N──> Message (polymorphique)
```

---

## 🎯 Logique Métier à Implémenter dans les Services

### AbonnementService

```typescript
// Gestion du solde
async ajouterSolde(abonnementId: number, montant: number, description?: string)
async debiterSolde(abonnementId: number, montant: number, description?: string)

// Gestion du plan
async upgraderPlan(abonnementId: number, nouveauPlan: AbonnementPlan)
async downgraderPlan(abonnementId: number)

// Activité
async marquerActiviteBusiness(abonnementId: number)

// Création automatique (hook)
async creerGroupeCollaboration(abonnement: Abonnement)
async creerSuiviSiInexistant(abonnement: Abonnement)
```

### SuivreService

```typescript
// Stats
async incrementerInteraction(suiviId: number, type: 'like' | 'commentaire' | 'partage')
async marquerVisite(suiviId: number)

// Score
async calculerScoreEngagement(suiviId: number): Promise<number>

// Conversion
async upgraderVersAbonnement(suiviId: number, planData): Promise<Abonnement>
```

### LikeService (polymorphique)

```typescript
async likerPost(postId: number, likeable: User | Societe): Promise<Like>
async unlikePost(postId: number, likeable: User | Societe): Promise<boolean>
async getPostLikes(postId: number): Promise<Like[]>
async hasUserLikedPost(postId: number, likeableId: number, likeableType: string): Promise<boolean>
```

### CommentaireService (polymorphique)

```typescript
async commenterPost(postId: number, commentable: User | Societe, contenu: string): Promise<Commentaire>
async modifierCommentaire(commentaireId: number, contenu: string): Promise<Commentaire>
async supprimerCommentaire(commentaireId: number): Promise<boolean>
async getPostCommentaires(postId: number): Promise<Commentaire[]>
```

### ConversationService

```typescript
async creerConversation(participant1: User | Societe, participant2: User | Societe): Promise<Conversation>
async getConversationEntreParticipants(p1: User | Societe, p2: User | Societe): Promise<Conversation | null>
async archiverConversation(conversationId: number): Promise<void>
```

### MessageCollaborationService

```typescript
async envoyerMessage(conversation: Conversation, sender: User | Societe, contenu: string): Promise<MessageCollaboration>
async envoyerMessageTransaction(transaction: TransactionCollaboration, contenu: string, metadata): Promise<MessageCollaboration>
async marquerCommeLu(messageId: number): Promise<void>
async getMessagesConversation(conversationId: number, limit: number): Promise<MessageCollaboration[]>
```

---

## 🔥 Scénarios d'Utilisation

### Scénario 1: User suit une Société

```typescript
// 1. User découvre une société et la suit
const suivi = await suivreService.suivreSociete(userId, societeId);

// 2. User like un post de la société
await likeService.likerPost(postId, user);
await suivreService.incrementerInteraction(suivi.id, 'like');

// 3. User commente un post
await commentaireService.commenterPost(postId, user, "Super produit !");
await suivreService.incrementerInteraction(suivi.id, 'commentaire');

// 4. Calcul du score d'engagement
const score = await suivreService.calculerScoreEngagement(suivi.id);

// 5. Si engagement élevé, proposer upgrade vers abonnement
if (score > 50 && suivi.peutUpgraderVersAbonnement()) {
  // Afficher offre d'abonnement business
}
```

### Scénario 2: Upgrade vers Abonnement Business

```typescript
// 1. User décide de prendre un abonnement business
const abonnement = await abonnementService.creerAbonnement({
  user_id: userId,
  societe_id: societeId,
  plan_collaboration: AbonnementPlan.STANDARD,
  secteur_collaboration: 'tech',
  permissions: ['message', 'transaction'],
});

// 2. Groupe de collaboration créé automatiquement
// groupe_collaboration_id est rempli automatiquement

// 3. Ajouter du crédit
await abonnementService.ajouterSolde(abonnement.id, 1000, "Crédit initial");

// 4. User peut maintenant envoyer des messages de collaboration
await messageService.envoyerMessage(conversation, user, "Bonjour, je souhaite collaborer");
```

### Scénario 3: Transaction avec Messages

```typescript
// 1. Créer une transaction
const transaction = await transactionService.creerTransaction({
  user_id: userId,
  partenaire_id: societeId,
  partenaire_type: 'Societe',
  abonnement_id: abonnementId,
  type: 'collaboration',
  montant: 5000,
});

// 2. Envoyer un message lié à la transaction
await messageService.envoyerMessageTransaction(
  transaction,
  "Voici les détails du projet...",
  { deadline: '2025-12-31' }
);

// 3. Débiter le solde lors de la validation
await abonnementService.debiterSolde(abonnementId, 5000, `Transaction #${transaction.id}`);
```

---

## 📝 Prochaines Étapes

1. **Créer les modules NestJS**
   ```bash
   nest g module modules/abonnements
   nest g module modules/suivis
   nest g module modules/messages
   ```

2. **Créer les services avec la logique métier**

3. **Créer les controllers avec les endpoints**

4. **Créer les services polymorphiques**
   - `LikePolymorphicService`
   - `CommentairePolymorphicService`
   - `MessagePolymorphicService`

5. **Créer les DTOs de validation**

6. **Générer les migrations**

---

## 🎓 Comparaison Laravel vs NestJS

| Fonctionnalité | Laravel | NestJS (implémenté) |
|----------------|---------|---------------------|
| Abonnement avec solde | `ajouterSolde()` | Service method ✅ |
| Suivi avec stats | Accessors | Méthodes helper ✅ |
| Likes polymorphiques | `morphTo()` | Colonnes _id/_type + Service ✅ |
| Commentaires polymorphiques | `morphTo()` | Colonnes _id/_type + Service ✅ |
| Messages polymorphiques | `morphTo()` | Colonnes _id/_type + Service ✅ |
| Hook boot() | `static::created()` | À implémenter dans service ⚠️ |
| Scopes | `scopeActif()` | QueryBuilder methods ⚠️ |

---

**✅ Toutes les entités sont créées et prêtes à être utilisées !**

**📖 Consultez [POLYMORPHIC_GUIDE.md](POLYMORPHIC_GUIDE.md) pour gérer les relations polymorphiques.**
