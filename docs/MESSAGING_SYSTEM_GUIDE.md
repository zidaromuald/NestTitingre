# 📨 Guide du Système de Messagerie - Titingre

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [ConversationController](#conversationcontroller)
3. [MessageCollaborationController](#messagecollaborationcontroller)
4. [Différences et Complémentarité](#différences-et-complémentarité)
5. [Modèle de Données](#modèle-de-données)
6. [Exemples d'Utilisation](#exemples-dutilisation)

---

## 🎯 Vue d'ensemble

Le système de messagerie de Titingre repose sur **deux contrôleurs complémentaires** qui gèrent différents aspects de la communication :

```
┌─────────────────────────────────────────────────────────┐
│                  SYSTÈME DE MESSAGERIE                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────┐        ┌────────────────────┐   │
│  │  CONVERSATION     │        │  MESSAGE           │   │
│  │  Controller       │◄──────►│  COLLABORATION     │   │
│  │                   │        │  Controller        │   │
│  │  Gère les "boîtes"│        │  Gère le contenu   │   │
│  └───────────────────┘        └────────────────────┘   │
│           │                             │                │
│           ▼                             ▼                │
│  ┌───────────────────┐        ┌────────────────────┐   │
│  │  Conversation     │        │  MessageCollabo-   │   │
│  │  Entity           │◄──────►│  ration Entity     │   │
│  └───────────────────┘        └────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 💬 ConversationController

**Route de base** : `/conversations`
**Fichier** : [conversation.controller.ts](../src/modules/messages/controllers/conversation.controller.ts)

### 🎯 Rôle Principal

Le `ConversationController` gère **les conteneurs de messages** (les "boîtes de dialogue"). Il s'occupe de :

- **Créer ou récupérer** des conversations entre deux participants
- **Lister** les conversations d'un utilisateur
- **Gérer l'archivage** (archiver/désarchiver)
- **Compter** les conversations actives
- **Récupérer les métadonnées** (dernier message, nombre de non-lus)

### 📦 Analogie

**Pensez-y comme Gmail** :
- Le `ConversationController` = La liste de vos **fils de discussion** dans votre boîte de réception
- Chaque conversation = Un **thread** d'emails entre vous et une autre personne

### 🔑 Caractéristiques

#### 1. **Participants Polymorphiques**
Une conversation peut être entre :
- User ↔ User
- User ↔ Societe
- Societe ↔ Societe

```typescript
// Exemple de structure
{
  participant1_id: 1,
  participant1_type: 'User',
  participant2_id: 5,
  participant2_type: 'Societe',
  dernier_message_at: '2025-11-26T00:00:00Z',
  is_archived: false
}
```

#### 2. **Gestion intelligente**
- Évite les doublons (une seule conversation entre deux participants)
- Track le dernier message automatiquement
- Support de l'archivage sans suppression

### 🛣️ Endpoints Disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/conversations` | Créer ou récupérer une conversation |
| `GET` | `/conversations` | Lister mes conversations actives |
| `GET` | `/conversations/archived` | Lister mes conversations archivées |
| `GET` | `/conversations/count` | Compter mes conversations |
| `GET` | `/conversations/:id` | Détails d'une conversation |
| `PUT` | `/conversations/:id/archive` | Archiver une conversation |
| `PUT` | `/conversations/:id/unarchive` | Désarchiver une conversation |

---

## 📧 MessageCollaborationController

**Route de base** : `/messages`
**Fichier** : [message-collaboration.controller.ts](../src/modules/messages/controllers/message-collaboration.controller.ts)

### 🎯 Rôle Principal

Le `MessageCollaborationController` gère **le contenu des messages**. Il s'occupe de :

- **Envoyer** des messages dans une conversation
- **Récupérer** les messages d'une conversation
- **Marquer comme lu** (un message ou tous les messages)
- **Compter** les messages non lus
- **Filtrer** par transaction ou abonnement

### 📦 Analogie

**Toujours comme Gmail** :
- Le `MessageCollaborationController` = Le **contenu réel** de chaque email dans un thread
- Chaque message = Un **email individuel** avec son texte, statut (lu/non lu), pièces jointes

### 🔑 Caractéristiques

#### 1. **Types de Messages**
```typescript
enum MessageCollaborationType {
  NORMAL = 'normal',    // Message classique
  SYSTEM = 'system',    // Notification automatique
  ALERT = 'alert'       // Message urgent
}
```

#### 2. **Statuts de Messages**
```typescript
enum MessageCollaborationStatut {
  SENT = 'sent',        // Envoyé
  READ = 'read',        // Lu
  ARCHIVED = 'archived' // Archivé
}
```

#### 3. **Contexte Métier**
Un message peut être lié à :
- Une **conversation** générale
- Une **transaction** de collaboration
- Un **abonnement** entre utilisateurs

```typescript
{
  conversation_id: 1,
  transaction_collaboration_id: 42,  // Optionnel
  abonnement_id: 15,                 // Optionnel
  sender_id: 1,
  sender_type: 'User',
  recipient_id: 5,
  recipient_type: 'Societe',
  contenu: 'Bonjour, je suis intéressé...',
  type: 'normal',
  statut: 'sent',
  fichiers: ['document.pdf'],
  lu_a: null
}
```

### 🛣️ Endpoints Disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/messages/conversations/:id` | Envoyer un message |
| `GET` | `/messages/conversations/:id` | Lister les messages d'une conversation |
| `PUT` | `/messages/:id/read` | Marquer un message comme lu |
| `PUT` | `/messages/conversations/:id/read-all` | Tout marquer comme lu |
| `GET` | `/messages/unread/count` | Compter mes messages non lus |
| `GET` | `/messages/conversations/:id/unread` | Messages non lus d'une conversation |
| `GET` | `/messages/transactions/:id` | Messages liés à une transaction |
| `GET` | `/messages/abonnements/:id` | Messages liés à un abonnement |

---

## 🔄 Différences et Complémentarité

### 📊 Tableau Comparatif

| Aspect | ConversationController | MessageCollaborationController |
|--------|------------------------|--------------------------------|
| **Focus** | Gestion des conversations | Gestion des messages |
| **Niveau** | Conteneur | Contenu |
| **Analogie** | Boîte aux lettres | Lettres individuelles |
| **Actions principales** | Créer, lister, archiver | Envoyer, lire, filtrer |
| **Métadonnées** | Participants, date dernier message | Expéditeur, destinataire, statut |
| **Contexte** | Relation entre 2 entités | Message individuel + contexte métier |

### 🔗 Comment ils travaillent ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX D'UTILISATION                        │
└─────────────────────────────────────────────────────────────┘

1. USER A veut contacter USER B
   └─► POST /conversations
       ├─► Crée ou récupère la conversation #123
       └─► Retourne { conversation_id: 123 }

2. USER A envoie un message dans la conversation
   └─► POST /messages/conversations/123
       ├─► Crée le message avec conversation_id: 123
       ├─► Met à jour dernier_message_at de la conversation
       └─► Retourne { message_id: 456, statut: 'sent' }

3. USER B consulte ses conversations
   └─► GET /conversations
       ├─► Liste toutes les conversations
       └─► Affiche unreadCount pour chaque conversation

4. USER B ouvre la conversation #123
   └─► GET /messages/conversations/123
       ├─► Liste tous les messages de la conversation
       └─► Affiche chaque message avec son statut

5. USER B lit les messages
   └─► PUT /messages/conversations/123/read-all
       ├─► Marque tous les messages comme lus
       └─► Met à jour lu_a et statut = 'read'

6. USER B archive la conversation
   └─► PUT /conversations/123/archive
       └─► is_archived = true
```

---

## 🗂️ Modèle de Données

### Conversation Entity

```typescript
{
  id: number,                      // ID unique
  participant1_id: number,         // ID du participant 1
  participant1_type: string,       // 'User' ou 'Societe'
  participant2_id: number,         // ID du participant 2
  participant2_type: string,       // 'User' ou 'Societe'
  titre: string,                   // Titre optionnel
  dernier_message_at: Date,        // Date du dernier message
  is_archived: boolean,            // Archivé ou non
  metadata: object,                // Données additionnelles
  created_at: Date,
  updated_at: Date
}
```

### MessageCollaboration Entity

```typescript
{
  id: number,                           // ID unique
  conversation_id: number,              // Lien vers la conversation
  transaction_collaboration_id: number, // Optionnel
  abonnement_id: number,                // Optionnel
  sender_id: number,                    // Expéditeur
  sender_type: string,                  // 'User' ou 'Societe'
  recipient_id: number,                 // Destinataire
  recipient_type: string,               // 'User' ou 'Societe'
  contenu: string,                      // Texte du message
  type: 'normal' | 'system' | 'alert',  // Type de message
  statut: 'sent' | 'read' | 'archived', // Statut
  lu_a: Date,                           // Date de lecture
  fichiers: string[],                   // URLs des fichiers joints
  metadata: object,                     // Données additionnelles
  created_at: Date,
  updated_at: Date
}
```

---

## 💡 Exemples d'Utilisation

### Scénario 1 : Messagerie classique entre deux utilisateurs

```typescript
// 1. Créer ou récupérer la conversation
POST /conversations
{
  "other_participant_id": 5,
  "other_participant_type": "User"
}

// Réponse
{
  "success": true,
  "data": {
    "id": 123,
    "participant1": { "id": 1, "type": "User" },
    "participant2": { "id": 5, "type": "User" },
    "unreadCount": 0
  }
}

// 2. Envoyer un message
POST /messages/conversations/123
{
  "contenu": "Salut ! Comment vas-tu ?",
  "type": "normal"
}

// 3. Lire les messages
GET /messages/conversations/123

// Réponse
{
  "success": true,
  "data": [
    {
      "id": 456,
      "contenu": "Salut ! Comment vas-tu ?",
      "sender": { "id": 1, "type": "User" },
      "statut": "sent",
      "created_at": "2025-11-26T10:00:00Z"
    }
  ]
}
```

### Scénario 2 : Discussion liée à une transaction

```typescript
// 1. User négocie une transaction avec une Société
POST /conversations
{
  "other_participant_id": 10,
  "other_participant_type": "Societe",
  "metadata": {
    "transaction_id": 42
  }
}

// 2. Envoyer un message lié à la transaction
POST /messages/conversations/124
{
  "contenu": "Je propose 500€ pour ce service",
  "type": "normal",
  "metadata": {
    "transaction_id": 42
  }
}

// 3. Récupérer tous les messages liés à cette transaction
GET /messages/transactions/42
```

### Scénario 3 : Notification système

```typescript
// Message système automatique (créé par le backend)
{
  "conversation_id": 123,
  "sender_id": 0,
  "sender_type": "System",
  "recipient_id": 5,
  "recipient_type": "User",
  "contenu": "Votre abonnement expire dans 7 jours",
  "type": "alert",
  "statut": "sent"
}
```

### Scénario 4 : Gestion des non-lus

```typescript
// 1. Compter tous mes messages non lus
GET /messages/unread/count

// Réponse
{
  "success": true,
  "data": { "count": 15 }
}

// 2. Voir mes conversations avec le nombre de non-lus
GET /conversations

// Réponse
{
  "success": true,
  "data": [
    {
      "id": 123,
      "participant2": { "id": 5, "name": "Jean Dupont" },
      "unreadCount": 3,
      "dernier_message_at": "2025-11-26T10:30:00Z"
    }
  ]
}

// 3. Tout marquer comme lu dans une conversation
PUT /messages/conversations/123/read-all
```

---

## 🎨 Use Cases dans Titingre

### 1. **Messagerie Professionnelle**
- User ↔ Societe : Demandes de collaboration
- Societe ↔ Societe : Partenariats

### 2. **Support Transaction**
- Messages pendant une transaction
- Négociation de prix
- Échange de documents

### 3. **Gestion Abonnements**
- Messages entre abonné et créateur de contenu
- Notifications d'expiration
- Messages exclusifs

### 4. **Notifications Système**
- Alertes importantes
- Rappels automatiques
- Confirmations d'actions

---

## 🔐 Sécurité et Permissions

Les deux contrôleurs vérifient :
- ✅ L'utilisateur est bien **participant** de la conversation
- ✅ Les messages ne sont accessibles que par les **participants**
- ✅ Seul le **destinataire** peut marquer un message comme lu
- ✅ L'archivage est **personnel** (n'affecte pas l'autre participant)

---

## 🚀 Résumé

| Question | Réponse |
|----------|---------|
| **Quand utiliser ConversationController ?** | Pour gérer les "boîtes" de dialogue (créer, lister, archiver) |
| **Quand utiliser MessageCollaborationController ?** | Pour gérer le contenu (envoyer, lire, compter les non-lus) |
| **Sont-ils dépendants ?** | Oui ! Un message nécessite toujours une conversation |
| **Peut-on avoir une conversation vide ?** | Oui ! Elle existe avant le premier message |
| **Quelle est la relation ?** | 1 Conversation → N Messages (OneToMany) |

---

## 📚 Liens Utiles

- [conversation.controller.ts](../src/modules/messages/controllers/conversation.controller.ts)
- [message-collaboration.controller.ts](../src/modules/messages/controllers/message-collaboration.controller.ts)
- [conversation.entity.ts](../src/modules/messages/entities/conversation.entity.ts)
- [message-collaboration.entity.ts](../src/modules/messages/entities/message-collaboration.entity.ts)
