#!/bin/bash

# Script pour tester l'upload de photo de profil avec curl
# Usage: ./test-upload.sh YOUR_JWT_TOKEN

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
TOKEN="${1:-YOUR_TOKEN_HERE}"
IMAGE_FILE="test-files/test-profile.jpg"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Test Upload Photo de Profil - NestJS        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier si le token est fourni
if [ "$TOKEN" == "YOUR_TOKEN_HERE" ]; then
    echo -e "${RED}❌ Erreur: Aucun token fourni${NC}"
    echo -e "${YELLOW}Usage: $0 YOUR_JWT_TOKEN${NC}"
    echo ""
    echo -e "${YELLOW}Pour obtenir un token:${NC}"
    echo "curl -X POST $BASE_URL/auth/login \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"identifier\": \"votre_email\", \"password\": \"votre_password\"}'"
    exit 1
fi

# Vérifier si le fichier existe
if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}❌ Fichier image non trouvé: $IMAGE_FILE${NC}"
    echo -e "${YELLOW}Exécutez d'abord: node create-test-image.js${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Configuration:${NC}"
echo "   URL: $BASE_URL/users/me/photo"
echo "   Fichier: $IMAGE_FILE"
echo "   Token: ${TOKEN:0:20}..."
echo ""

echo -e "${BLUE}🚀 Envoi de la requête...${NC}"
echo ""

# Faire la requête
RESPONSE=$(curl -X POST "$BASE_URL/users/me/photo" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$IMAGE_FILE" \
  -w "\n%{http_code}" \
  -s)

# Extraire le code HTTP et le body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "${YELLOW}📊 Réponse:${NC}"
echo ""

# Vérifier le code de statut
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    echo -e "${GREEN}✅ Succès (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""

    # Extraire l'URL de la photo si possible
    PHOTO_URL=$(echo "$BODY" | jq -r '.data.url' 2>/dev/null)
    if [ "$PHOTO_URL" != "null" ] && [ ! -z "$PHOTO_URL" ]; then
        echo -e "${GREEN}📸 Photo uploadée: $PHOTO_URL${NC}"
    fi

elif [ "$HTTP_CODE" == "401" ]; then
    echo -e "${RED}❌ Échec (HTTP $HTTP_CODE - Non autorisé)${NC}"
    echo ""
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${YELLOW}💡 Le token est peut-être expiré ou invalide${NC}"

elif [ "$HTTP_CODE" == "400" ]; then
    echo -e "${RED}❌ Échec (HTTP $HTTP_CODE - Requête invalide)${NC}"
    echo ""
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

else
    echo -e "${RED}❌ Échec (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"

# Proposer de vérifier le profil
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    echo ""
    read -p "Voulez-vous vérifier le profil mis à jour? (o/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[OoYy]$ ]]; then
        echo ""
        echo -e "${BLUE}📥 Récupération du profil...${NC}"
        echo ""
        curl -X GET "$BASE_URL/users/me" \
          -H "Authorization: Bearer $TOKEN" \
          -s | jq '.'
    fi
fi
