# 🌐 Flux des Fonctionnalités Sociales - Titingre

## 📋 Vue d'ensemble du système

Votre système Titingre possède **3 niveaux de communication** :

```
┌────────────────────────────────────────────────────────────┐
│           NIVEAUX DE COMMUNICATION TITINGRE                 │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 👥 GROUPES                                              │
│     └─► Communication de groupe (publique/privée)          │
│         • Posts dans le groupe                              │
│         • Membres multiples                                 │
│         • Discussions collectives                           │
│                                                              │
│  2. 📊 FEED (Suivis)                                        │
│     └─► Voir les posts de ceux qu'on suit                  │
│         • Timeline personnalisée                            │
│         • Posts de mes followings                           │
│         • Bouton "Message" sur les profils                  │
│                                                              │
│  3. 💬 CONVERSATIONS (Messagerie 1-à-1)                     │
│     └─► Messages privés directs                            │
│         • Discussion privée entre 2 personnes              │
│         • Accessible via le bouton "Message" du profil     │
│         • Messages chiffrés/privés                          │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Votre Question : Le Flux de Conversation

### ✅ **OUI, votre système fonctionne EXACTEMENT comme vous le décrivez !**

Voici le parcours utilisateur complet :

---

## 📱 Scénario 1 : User suit un autre User

```
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : User A découvre User B                            │
└──────────────────────────────────────────────────────────────┘

User A navigue et voit le profil de User B
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 2 : User A décide de SUIVRE User B                    │
└──────────────────────────────────────────────────────────────┘

User A clique sur "Suivre" ──► Crée InvitationSuivi
    │                          (statut: pending)
    │
    ▼
User B reçoit la notification
User B accepte l'invitation ──► Crée Suivre (relation mutuelle)
                                 • User A ──► User B
                                 • User B ──► User A
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 3 : User A voit les posts de User B dans son FEED     │
└──────────────────────────────────────────────────────────────┘

GET /posts/feed/my-feed
    │
    ▼
User A voit:
    • Les posts de User B
    • Les posts de tous ceux qu'il suit
    • Peut liker, commenter, partager
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 4 : User A clique sur le profil de User B             │
└──────────────────────────────────────────────────────────────┘

User A ouvre le profil de User B
    │
    ├─► Voit les infos du profil
    ├─► Voit les posts de User B
    └─► Voit le bouton "💬 Message" ou "Envoyer un message"
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 5 : User A clique sur "Message"                       │
└──────────────────────────────────────────────────────────────┘

Frontend: Clique sur bouton "Message"
    │
    ▼
Backend: POST /conversations
    {
      "other_participant_id": [User B ID],
      "other_participant_type": "User"
    }
    │
    ├─► Si conversation existe: retourne la conversation existante
    └─► Sinon: crée nouvelle conversation
            │
            ▼
        Retourne conversation_id: 42
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 6 : Page de Messagerie s'ouvre                        │
└──────────────────────────────────────────────────────────────┘

Frontend: Redirige vers /messages/conversations/42
    │
    ▼
Affiche l'interface de chat:
    • Historique des messages (s'il y en a)
    • Zone de saisie pour nouveau message
    • Bouton "Envoyer"
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 7 : User A envoie un message                          │
└──────────────────────────────────────────────────────────────┘

User A tape: "Salut ! J'ai vu ton dernier post, super !"
User A clique "Envoyer"
    │
    ▼
Backend: POST /messages/conversations/42
    {
      "contenu": "Salut ! J'ai vu ton dernier post, super !",
      "type": "normal"
    }
    │
    ▼
Message créé et envoyé
User B reçoit une notification
```

---

## 📱 Scénario 2 : User s'abonne à une Société

```
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : User découvre une Société                         │
└──────────────────────────────────────────────────────────────┘

User navigue et voit le profil de "Société ABC"
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 2 : User SUIT d'abord la Société                      │
└──────────────────────────────────────────────────────────────┘

User clique "Suivre" ──► Envoie InvitationSuivi
    │
    ▼
Société accepte ──► Crée Suivre (relation mutuelle)
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 3 : User voit les posts de la Société dans son FEED   │
└──────────────────────────────────────────────────────────────┘

GET /posts/feed/my-feed
    │
    ▼
User voit:
    • Les posts de "Société ABC"
    • Bouton "S'abonner" (différent de "Suivre" !)
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  OPTION A : User clique "S'abonner" (collaboration business) │
└──────────────────────────────────────────────────────────────┘

POST /demandes-abonnement
    │
    ▼
Société accepte ──► Crée Abonnement
    │               └─► Crée PagePartenariat automatiquement
    │                   • Transactions business
    │                   • Collaboration dans le même secteur
    │                   • Messages liés aux transactions
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  OPTION B : User clique "💬 Message" (conversation simple)   │
└──────────────────────────────────────────────────────────────┘

User clique sur profil de "Société ABC"
    │
    ▼
User clique "Message"
    │
    ▼
Backend: POST /conversations
    {
      "other_participant_id": [Société ABC ID],
      "other_participant_type": "Societe"
    }
    │
    ▼
Crée conversation User ↔ Société
    │
    ▼
Page de messagerie s'ouvre
    │
    ▼
User peut envoyer des messages directs à la Société
```

---

## 🔑 Points Clés de votre Système

### ✅ **1. Groupes ≠ Conversations**

| Aspect | Groupes | Conversations |
|--------|---------|---------------|
| **Type** | Communication collective | 1-à-1 privé |
| **Participants** | Multiples membres | Exactement 2 |
| **Visibilité** | Public/Privé selon le groupe | Toujours privé |
| **Posts** | Oui, posts de groupe | Non, seulement messages |
| **Contexte** | Communauté/Thème | Relation directe |

### ✅ **2. Suivre → Permet de voir le Feed**

```typescript
// Quand User A suit User B:
Suivre {
  user_id: 1,           // User A
  user_type: 'User',
  followed_id: 2,       // User B
  followed_type: 'User'
}

// User A peut maintenant:
✅ Voir les posts de User B dans son feed
✅ Liker/commenter les posts de User B
✅ Cliquer sur le profil de User B
✅ Voir le bouton "Message" sur le profil
```

### ✅ **3. Bouton "Message" → Ouvre Conversation**

Le bouton "Message" sur un profil :

```typescript
// Frontend (exemple React/Vue)
function handleMessageClick(userId, userType) {
  // 1. Créer ou récupérer la conversation
  const response = await fetch('/conversations', {
    method: 'POST',
    body: JSON.stringify({
      other_participant_id: userId,
      other_participant_type: userType
    })
  });

  const { data } = await response.json();
  const conversationId = data.id;

  // 2. Rediriger vers la page de messagerie
  router.push(`/messages/${conversationId}`);
}
```

### ✅ **4. Différence Suivre vs Abonnement**

```
SUIVRE (Suivis)
├─► Gratuit
├─► Voir les posts dans le feed
├─► Messagerie simple disponible
└─► Pas de collaboration business

ABONNEMENT (Societe uniquement)
├─► Payant (plans: Standard, Premium, Enterprise)
├─► Tout ce que "Suivre" fait +
├─► PagePartenariat créée
├─► Transactions business
├─► Gestion de compte
└─► Collaboration dans le même secteur
```

---

## 🎨 Interface Utilisateur Suggérée

### Page Profil

```
┌─────────────────────────────────────────────────────┐
│  👤 Jean Dupont                                      │
│  @jeandupont                                         │
│                                                       │
│  📊 150 posts  •  1.2K followers  •  345 following  │
│                                                       │
│  [✅ Suivi]  [💬 Message]                           │
│                                                       │
│  ─────────────────────────────────────────────────  │
│                                                       │
│  📝 Posts récents:                                   │
│  • Post 1...                                         │
│  • Post 2...                                         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

Quand on clique **[💬 Message]** :

```
┌─────────────────────────────────────────────────────┐
│  ← Retour    Conversation avec Jean Dupont          │
│                                                       │
│  ─────────────────────────────────────────────────  │
│                                                       │
│  Jean: Salut ! 10:00                    [Lu]        │
│                                                       │
│  Moi: Salut, comment ça va ? 10:05                  │
│                                                       │
│  Jean: Très bien et toi ? 10:10         [Lu]        │
│                                                       │
│  ─────────────────────────────────────────────────  │
│                                                       │
│  [Type a message...]              [📎] [😊] [Send]  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Architecture Complète

```
┌────────────────────────────────────────────────────────────┐
│                     TITINGRE ECOSYSTEM                      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  DÉCOUVERTE                                                 │
│  ├─► Recherche d'utilisateurs/sociétés                     │
│  └─► Navigation dans les profils                           │
│       │                                                      │
│       ▼                                                      │
│  CONNEXION (Suivis)                                         │
│  ├─► InvitationSuivi (envoi)                               │
│  ├─► Acceptation                                            │
│  └─► Suivre (relation établie)                             │
│       │                                                      │
│       ▼                                                      │
│  FEED                                                        │
│  ├─► Voir les posts des followings                         │
│  ├─► Liker/Commenter                                        │
│  └─► Accéder aux profils                                   │
│       │                                                      │
│       ├──────────────────┬──────────────────┐              │
│       ▼                  ▼                  ▼               │
│  GROUPES          CONVERSATIONS      ABONNEMENT             │
│  • Posts groupe   • Messages 1-à-1  • Business             │
│  • Multiples      • Privé            • PagePartenariat     │
│  • Discussions    • Direct           • Transactions        │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 Flux de Données

```typescript
// 1. User A suit User B
POST /invitations-suivi → InvitationSuivi (pending)
PUT /invitations-suivi/:id/accept → Suivre (mutual)

// 2. User A voit les posts de User B
GET /posts/feed/my-feed → Posts de tous les followings

// 3. User A clique sur le profil de User B
GET /users/:id → Profil + bouton "Message"

// 4. User A clique "Message"
POST /conversations → Crée/récupère conversation

// 5. Page de messagerie s'ouvre
GET /messages/conversations/:id → Liste des messages
POST /messages/conversations/:id → Envoie nouveau message
PUT /messages/:id/read → Marque comme lu
```

---

## ✅ Confirmation : Votre Système Fonctionne

**Question** : "Si un user décide de suivre un user ou user s'abonne à une société, on a le feed de ses followings, donc s'il clique sur le user il a la possibilité de cliquer sur conversation et la page de message s'ouvre pour qu'il discute"

**Réponse** : **OUI, EXACTEMENT !**

Voici le résumé :

1. ✅ User suit → Voit dans le feed
2. ✅ Clique sur profil → Voit bouton "Message"
3. ✅ Clique "Message" → Crée/ouvre conversation
4. ✅ Page messagerie s'ouvre → Chat 1-à-1 privé
5. ✅ Peut envoyer messages → Communication directe

**Les Groupes** sont un **système séparé** pour la communication collective, tandis que les **Conversations** sont pour la messagerie privée 1-à-1.

---

## 🚀 Implémentation Frontend Suggérée

```typescript
// Composant ProfileHeader.tsx
<div className="profile-header">
  <h1>{user.nom} {user.prenom}</h1>

  <div className="actions">
    {isFollowing ? (
      <button disabled>✅ Suivi</button>
    ) : (
      <button onClick={handleFollow}>Suivre</button>
    )}

    {/* Bouton Message - toujours visible si on suit la personne */}
    {isFollowing && (
      <button onClick={() => openConversation(user.id, user.type)}>
        💬 Message
      </button>
    )}

    {/* Pour les Sociétés uniquement */}
    {user.type === 'Societe' && isFollowing && (
      <button onClick={handleSubscribe}>
        ⭐ S'abonner
      </button>
    )}
  </div>
</div>

// Fonction pour ouvrir conversation
async function openConversation(userId, userType) {
  const response = await api.post('/conversations', {
    other_participant_id: userId,
    other_participant_type: userType
  });

  const conversationId = response.data.id;
  router.push(`/messages/${conversationId}`);
}
```

---

## 📚 Documentation Connexe

- [Système de Messagerie](./MESSAGING_SYSTEM_GUIDE.md)
- [Système de Posts et Visibilité](./POST_VISIBILITY_SUMMARY.md)
- [Architecture Groupes](../src/modules/groupes/)

---

**Votre système est bien conçu et fonctionne exactement comme vous le souhaitez !** 🎉
