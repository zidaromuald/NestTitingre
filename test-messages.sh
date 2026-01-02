#!/bin/bash

# Script de test pour les messages de groupe
# Assurez-vous que le serveur tourne sur http://localhost:3000

BASE_URL="http://localhost:3000"

echo "===================="
echo "TEST MESSAGES GROUPE"
echo "===================="
echo ""

# 1. Login pour obtenir un token
echo "1. Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "mot_de_passe": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "ERREUR: Impossible d'obtenir le token. Vérifiez vos credentials."
    echo "Créez d'abord un utilisateur ou utilisez un existant."
    exit 1
fi

echo "Token obtenu: ${TOKEN:0:20}..."
echo ""

# 2. Créer ou rejoindre un groupe
GROUPE_ID=1
echo "2. Vérifier si membre du groupe $GROUPE_ID..."
IS_MEMBER=$(curl -s -X GET "$BASE_URL/groupes/$GROUPE_ID/is-member" \
  -H "Authorization: Bearer $TOKEN")

echo "Is member: $IS_MEMBER"

if echo "$IS_MEMBER" | grep -q '"is_member":false'; then
    echo "Pas membre, tentative de rejoindre le groupe..."
    JOIN_RESPONSE=$(curl -s -X POST "$BASE_URL/groupes/$GROUPE_ID/membres/join" \
      -H "Authorization: Bearer $TOKEN")
    echo "Join response: $JOIN_RESPONSE"
fi
echo ""

# 3. Envoyer un message
echo "3. Envoyer un message..."
MESSAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/groupes/$GROUPE_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Message de test automatique - '"$(date)"'",
    "type": "normal"
  }')

echo "Message response:"
echo "$MESSAGE_RESPONSE" | jq '.' 2>/dev/null || echo "$MESSAGE_RESPONSE"
echo ""

# 4. Récupérer les messages
echo "4. Récupérer les messages du groupe..."
MESSAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/groupes/$GROUPE_ID/messages?limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Messages response:"
echo "$MESSAGES_RESPONSE" | jq '.' 2>/dev/null || echo "$MESSAGES_RESPONSE"
echo ""

# 5. Statistiques
echo "5. Récupérer les statistiques..."
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/groupes/$GROUPE_ID/messages/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Stats response:"
echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
echo ""

echo "===================="
echo "Tests terminés!"
echo "===================="
