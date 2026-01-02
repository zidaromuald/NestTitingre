# Guide de Test - Messages de Groupe

## Prérequis

Tous les endpoints nécessitent:
1. **Authentification JWT** via le header `Authorization: Bearer <token>`
2. **Membership dans le groupe** - L'utilisateur doit être membre du groupe

## 1. Authentification

Avant de tester les messages, vous devez vous connecter:

### Login User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "mot_de_passe": "password123"
  }'
```

Réponse:
```json
{
  "access_token": "eyJhbGc...",
  "user": {...}
}
```

Copiez le `access_token` pour l'utiliser dans les requêtes suivantes.

## 2. Rejoindre un Groupe (si pas déjà membre)

Si vous n'êtes pas membre du groupe, vous devez d'abord le rejoindre:

```bash
curl -X POST http://localhost:3000/groupes/1/membres/join \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 3. Envoyer un Message (POST)

```bash
curl -X POST http://localhost:3000/groupes/1/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Bonjour, ceci est un message de test!",
    "type": "normal"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Message envoyé avec succès",
  "data": {
    "id": 1,
    "groupe_id": 1,
    "sender": {
      "id": 123,
      "type": "User"
    },
    "contenu": "Bonjour, ceci est un message de test!",
    "type": "normal",
    "statut": "sent",
    "fichiers": [],
    "is_pinned": false,
    "is_edited": false,
    "read_count": 1,
    "is_read_by_me": true,
    "created_at": "2025-12-15T..."
  }
}
```

## 4. Récupérer les Messages (GET)

```bash
curl -X GET "http://localhost:3000/groupes/1/messages?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "groupe_id": 1,
      "sender": {
        "id": 123,
        "type": "User"
      },
      "contenu": "Bonjour...",
      "type": "normal",
      "statut": "sent",
      "fichiers": [],
      "is_pinned": false,
      "is_edited": false,
      "read_count": 1,
      "is_read_by_me": true,
      "created_at": "2025-12-15T..."
    }
  ],
  "meta": {
    "count": 1,
    "limit": 20,
    "offset": 0
  }
}
```

## 5. Messages Non Lus

```bash
curl -X GET http://localhost:3000/groupes/1/messages/unread \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 6. Messages Épinglés

```bash
curl -X GET http://localhost:3000/groupes/1/messages/pinned \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 7. Statistiques des Messages

```bash
curl -X GET http://localhost:3000/groupes/1/messages/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 8. Marquer comme Lu

```bash
curl -X PUT http://localhost:3000/groupes/1/messages/123/read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 9. Modifier un Message

```bash
curl -X PUT http://localhost:3000/groupes/1/messages/123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Message modifié"
  }'
```

## 10. Supprimer un Message

```bash
curl -X DELETE http://localhost:3000/groupes/1/messages/123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Erreurs Communes

### 401 Unauthorized
- **Cause**: Token JWT manquant ou invalide
- **Solution**: Vérifiez que vous avez bien inclus `Authorization: Bearer <token>`

### 403 Forbidden
- **Cause**: Vous n'êtes pas membre du groupe
- **Solution**: Rejoignez d'abord le groupe avec `/groupes/:id/membres/join`

### 404 Not Found
- **Cause**: Le groupe ou le message n'existe pas
- **Solution**: Vérifiez l'ID du groupe/message

### 500 Internal Server Error
- **Cause**: Erreur serveur (vérifiez les logs)
- **Solution**:
  1. Vérifiez que la table `messages_groupe` existe dans la DB
  2. Vérifiez les logs du serveur pour voir l'erreur exacte
  3. Vérifiez que le `GroupeRepository` et `MessageGroupeRepository` sont correctement injectés

## Dépannage

Si vous obtenez une erreur 500, vérifiez les logs du serveur:

```bash
# Dans le terminal où tourne le serveur
# Vous verrez les erreurs détaillées en rouge
```

Ou consultez le fichier de log:

```bash
tail -f server.log
```

## Tester avec Postman/Insomnia

1. Créez une collection "Groupes Messages"
2. Ajoutez une variable d'environnement `token`
3. Dans les headers, ajoutez: `Authorization: Bearer {{token}}`
4. Testez d'abord le login pour obtenir le token
5. Ensuite testez les autres endpoints
