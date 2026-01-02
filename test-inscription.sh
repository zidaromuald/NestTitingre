#!/bin/bash

# Script de test pour l'inscription avec vérification téléphonique
# Usage: ./test-inscription.sh [user|societe]

# Configuration
API_URL="http://localhost:3000"
TYPE="${1:-user}"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Test d'Inscription avec Vérification Téléphonique       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

if [ "$TYPE" = "user" ]; then
    echo -e "\n${YELLOW}📱 Mode : Inscription UTILISATEUR${NC}"

    # Données pour un utilisateur
    TELEPHONE="+33612345678"
    EMAIL="jean.dupont.$(date +%s)@example.com"
    PASSWORD="Password123!"

    REQUEST_DATA="{
        \"userType\": \"user\",
        \"telephone\": \"$TELEPHONE\",
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\",
        \"nom\": \"Dupont\",
        \"prenom\": \"Jean\",
        \"centre_interet\": \"Technologie et Innovation\",
        \"date_naissance\": \"1990-05-15\"
    }"

elif [ "$TYPE" = "societe" ]; then
    echo -e "\n${YELLOW}🏢 Mode : Inscription SOCIÉTÉ${NC}"

    # Données pour une société
    TELEPHONE="+33687654321"
    EMAIL="contact.$(date +%s)@techcorp.fr"
    PASSWORD="SecurePass456!"

    REQUEST_DATA="{
        \"userType\": \"societe\",
        \"telephone\": \"$TELEPHONE\",
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\",
        \"nom_societe\": \"TechCorp Solutions\",
        \"centre_interet\": \"Innovation Technologique\",
        \"secteur_activite\": \"Informatique\",
        \"type_produit\": \"Logiciels SaaS\",
        \"adresse\": \"123 Avenue des Champs, Paris\"
    }"
else
    echo -e "${RED}❌ Type invalide. Utilisez 'user' ou 'societe'${NC}"
    echo -e "Usage: ./test-inscription.sh [user|societe]"
    exit 1
fi

# Étape 1 : Créer le compte et demander l'OTP
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}1️⃣  Création du compte et envoi du code OTP...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📤 Requête envoyée à :${NC} POST $API_URL/auth/registration/request-otp"
echo -e "${YELLOW}📋 Données :${NC}"
echo "$REQUEST_DATA" | jq '.'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/registration/request-otp \
  -H "Content-Type: application/json" \
  -d "$REQUEST_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "\n${GREEN}✅ Compte créé avec succès !${NC}"
    echo -e "${YELLOW}📥 Réponse :${NC}"
    echo "$BODY" | jq '.'

    USER_ID=$(echo "$BODY" | jq -r '.userId')
    USER_TYPE=$(echo "$BODY" | jq -r '.userType')

    echo -e "\n${GREEN}🆔 ID du compte créé : $USER_ID${NC}"
    echo -e "${GREEN}📂 Type de compte : $USER_TYPE${NC}"
else
    echo -e "\n${RED}❌ Erreur lors de la création du compte (Code HTTP: $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.'
    exit 1
fi

# Afficher les informations pour récupérer le code OTP
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Pour obtenir le code OTP :${NC}"
echo -e "${YELLOW}   • En production : Vérifiez vos SMS${NC}"
echo -e "${YELLOW}   • En développement : Consultez les logs du serveur${NC}"
echo -e "${YELLOW}   Recherchez : ${GREEN}[SmsService] 📧 Mode Dev - Code OTP pour $TELEPHONE:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Attendre l'utilisateur pour entrer le code OTP
echo -e "\n${YELLOW}2️⃣  Vérification du code OTP${NC}"
read -p "🔑 Entrez le code OTP reçu (6 chiffres) : " OTP_CODE

# Valider le format du code OTP
if ! [[ "$OTP_CODE" =~ ^[0-9]{6}$ ]]; then
    echo -e "${RED}❌ Code OTP invalide. Le code doit contenir 6 chiffres.${NC}"
    exit 1
fi

# Étape 2 : Vérifier le code OTP
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Vérification du code OTP...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

VERIFY_DATA="{
    \"telephone\": \"$TELEPHONE\",
    \"otp_code\": \"$OTP_CODE\"
}"

echo -e "\n${YELLOW}📤 Requête envoyée à :${NC} POST $API_URL/auth/registration/verify-otp"
echo -e "${YELLOW}📋 Données :${NC}"
echo "$VERIFY_DATA" | jq '.'

VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/registration/verify-otp \
  -H "Content-Type: application/json" \
  -d "$VERIFY_DATA")

VERIFY_HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n 1)
VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')

if [ "$VERIFY_HTTP_CODE" = "201" ] || [ "$VERIFY_HTTP_CODE" = "200" ]; then
    echo -e "\n${GREEN}✅ Code OTP vérifié avec succès !${NC}"
    echo -e "${YELLOW}📥 Réponse :${NC}"
    echo "$VERIFY_BODY" | jq '.'
else
    echo -e "\n${RED}❌ Erreur lors de la vérification du code OTP (Code HTTP: $VERIFY_HTTP_CODE)${NC}"
    echo "$VERIFY_BODY" | jq '.'
    exit 1
fi

# Étape 3 : Se connecter
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}3️⃣  Connexion au compte...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

LOGIN_DATA="{
    \"identifier\": \"$TELEPHONE\",
    \"password\": \"$PASSWORD\"
}"

echo -e "\n${YELLOW}📤 Requête envoyée à :${NC} POST $API_URL/auth/login"
echo -e "${YELLOW}📋 Données :${NC}"
echo "$LOGIN_DATA" | jq '.'

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_HTTP_CODE" = "201" ] || [ "$LOGIN_HTTP_CODE" = "200" ]; then
    echo -e "\n${GREEN}✅ Connexion réussie !${NC}"
    echo -e "${YELLOW}📥 Réponse :${NC}"
    echo "$LOGIN_BODY" | jq '.'

    TOKEN=$(echo "$LOGIN_BODY" | jq -r '.access_token')

    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Test d'inscription terminé avec succès !${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "\n${GREEN}📋 Récapitulatif :${NC}"
    echo -e "${YELLOW}   • Téléphone :${NC} $TELEPHONE"
    echo -e "${YELLOW}   • Email :${NC} $EMAIL"
    echo -e "${YELLOW}   • Mot de passe :${NC} $PASSWORD"
    echo -e "${YELLOW}   • Type :${NC} $USER_TYPE"
    echo -e "${YELLOW}   • ID :${NC} $USER_ID"
    echo -e "${GREEN}   • 🔑 Token JWT :${NC} ${TOKEN:0:50}..."
    echo -e "\n${YELLOW}💡 Utilisez ce token pour les requêtes authentifiées :${NC}"
    echo -e "${GREEN}   Authorization: Bearer $TOKEN${NC}"
else
    echo -e "\n${RED}❌ Erreur lors de la connexion (Code HTTP: $LOGIN_HTTP_CODE)${NC}"
    echo "$LOGIN_BODY" | jq '.'
    exit 1
fi
