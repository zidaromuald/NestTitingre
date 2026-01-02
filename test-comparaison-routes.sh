#!/bin/bash

# Script de comparaison entre les deux méthodes d'inscription
# Démontre les différences entre /auth/register et /auth/registration/request-verification

API_URL="http://localhost:3000"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Comparaison des Méthodes d'Inscription                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}TEST 1 : Méthode ANCIENNE - /auth/register (Sans vérification)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Caractéristiques :${NC}"
echo -e "  • ${GREEN}1 seule étape${NC}"
echo -e "  • ${GREEN}Token JWT immédiat${NC}"
echo -e "  • ${RED}Pas de vérification téléphone${NC}"
echo -e "  • ${RED}is_phone_verified = false${NC}"
echo ""

# Générer un email unique
EMAIL1="test.ancien.$(date +%s)@example.com"
PHONE1="+33612345678"

echo -e "${YELLOW}➤ Envoi de la requête...${NC}"
echo ""

RESPONSE1=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"nom\": \"TestAncien\",
    \"prenom\": \"User\",
    \"numero\": \"$PHONE1\",
    \"email\": \"$EMAIL1\",
    \"password\": \"Test123!\",
    \"activite\": \"Test\",
    \"date_naissance\": \"1995-01-01\"
  }")

HTTP_CODE1=$(echo "$RESPONSE1" | tail -n 1)
BODY1=$(echo "$RESPONSE1" | sed '$d')

if [ "$HTTP_CODE1" = "201" ] || [ "$HTTP_CODE1" = "200" ]; then
    echo -e "${GREEN}✅ Inscription réussie (Code HTTP: $HTTP_CODE1)${NC}"
    echo ""
    echo -e "${YELLOW}📥 Réponse complète :${NC}"
    echo "$BODY1" | python3 -m json.tool 2>/dev/null || echo "$BODY1"
    echo ""
    echo -e "${GREEN}🎯 Points clés :${NC}"
    echo -e "  • ${GREEN}✓${NC} Token JWT reçu immédiatement"
    echo -e "  • ${GREEN}✓${NC} Compte actif tout de suite"
    echo -e "  • ${RED}✗${NC} Téléphone NON vérifié (is_phone_verified: false)"
    echo ""

    # Extraire le token
    TOKEN1=$(echo "$BODY1" | grep -o '"token":"[^"]*' | grep -o '[^"]*$' | head -1)
    if [ ! -z "$TOKEN1" ]; then
        echo -e "${BLUE}🔑 Token JWT reçu : ${TOKEN1:0:50}...${NC}"
    fi
else
    echo -e "${RED}❌ Erreur (Code HTTP: $HTTP_CODE1)${NC}"
    echo "$BODY1"
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}TEST 2 : Méthode NOUVELLE - /auth/registration/request-verification${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Caractéristiques :${NC}"
echo -e "  • ${YELLOW}2 étapes requises${NC}"
echo -e "  • ${GREEN}Vérification par SMS (Twilio)${NC}"
echo -e "  • ${GREEN}is_phone_verified = true (après vérification)${NC}"
echo -e "  • ${YELLOW}Token JWT via /auth/login après vérification${NC}"
echo ""

# Générer un email unique
EMAIL2="test.nouveau.$(date +%s)@example.com"
PHONE2="+33687654321"

echo -e "${YELLOW}━━━ Étape 1/2 : Demande d'inscription et envoi OTP ━━━${NC}"
echo ""

RESPONSE2=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/registration/request-verification \
  -H "Content-Type: application/json" \
  -d "{
    \"userType\": \"user\",
    \"telephone\": \"$PHONE2\",
    \"email\": \"$EMAIL2\",
    \"password\": \"Test123!\",
    \"nom\": \"TestNouveau\",
    \"prenom\": \"User\",
    \"centre_interet\": \"Test\",
    \"date_naissance\": \"1995-01-01\"
  }")

HTTP_CODE2=$(echo "$RESPONSE2" | tail -n 1)
BODY2=$(echo "$RESPONSE2" | sed '$d')

if [ "$HTTP_CODE2" = "201" ] || [ "$HTTP_CODE2" = "200" ]; then
    echo -e "${GREEN}✅ Compte créé avec succès (Code HTTP: $HTTP_CODE2)${NC}"
    echo ""
    echo -e "${YELLOW}📥 Réponse :${NC}"
    echo "$BODY2" | python3 -m json.tool 2>/dev/null || echo "$BODY2"
    echo ""
    echo -e "${GREEN}🎯 Points clés :${NC}"
    echo -e "  • ${GREEN}✓${NC} Compte créé"
    echo -e "  • ${GREEN}✓${NC} SMS OTP envoyé"
    echo -e "  • ${YELLOW}⚠${NC} Pas de token JWT (nécessite vérification d'abord)"
    echo -e "  • ${YELLOW}⚠${NC} Compte pas encore actif"
    echo ""

    USER_ID=$(echo "$BODY2" | grep -o '"userId":[0-9]*' | grep -o '[0-9]*')
    echo -e "${BLUE}🆔 ID utilisateur : $USER_ID${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📧 Mode Développement : Le code OTP est affiché dans les logs${NC}"
    echo -e "${YELLOW}   Consultez les logs du serveur pour récupérer le code OTP${NC}"
    echo -e "${YELLOW}   Recherchez : ${GREEN}[SmsService] 📧 Mode Dev - Code OTP${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    read -p "🔑 Entrez le code OTP reçu (6 chiffres) : " OTP_CODE

    echo ""
    echo -e "${YELLOW}━━━ Étape 2/2 : Vérification du code OTP ━━━${NC}"
    echo ""

    VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/registration/verify-phone \
      -H "Content-Type: application/json" \
      -d "{
        \"telephone\": \"$PHONE2\",
        \"otp_code\": \"$OTP_CODE\"
      }")

    VERIFY_HTTP=$(echo "$VERIFY_RESPONSE" | tail -n 1)
    VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')

    if [ "$VERIFY_HTTP" = "200" ] || [ "$VERIFY_HTTP" = "201" ]; then
        echo -e "${GREEN}✅ Code OTP vérifié avec succès !${NC}"
        echo ""
        echo -e "${YELLOW}📥 Réponse :${NC}"
        echo "$VERIFY_BODY" | python3 -m json.tool 2>/dev/null || echo "$VERIFY_BODY"
        echo ""
        echo -e "${GREEN}🎯 Compte maintenant vérifié :${NC}"
        echo -e "  • ${GREEN}✓${NC} Téléphone vérifié (is_phone_verified: true)"
        echo -e "  • ${GREEN}✓${NC} Compte actif"
        echo -e "  • ${YELLOW}⚠${NC} Pour obtenir le token JWT, connectez-vous"
        echo ""

        echo -e "${YELLOW}━━━ Connexion pour obtenir le token JWT ━━━${NC}"
        echo ""

        LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
          -H "Content-Type: application/json" \
          -d "{
            \"identifier\": \"$PHONE2\",
            \"password\": \"Test123!\"
          }")

        LOGIN_HTTP=$(echo "$LOGIN_RESPONSE" | tail -n 1)
        LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

        if [ "$LOGIN_HTTP" = "200" ] || [ "$LOGIN_HTTP" = "201" ]; then
            echo -e "${GREEN}✅ Connexion réussie !${NC}"
            echo ""
            echo -e "${YELLOW}📥 Réponse :${NC}"
            echo "$LOGIN_BODY" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_BODY"
            echo ""

            TOKEN2=$(echo "$LOGIN_BODY" | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')
            if [ ! -z "$TOKEN2" ]; then
                echo -e "${BLUE}🔑 Token JWT reçu : ${TOKEN2:0:50}...${NC}"
            fi
        else
            echo -e "${RED}❌ Erreur de connexion${NC}"
        fi
    else
        echo -e "${RED}❌ Erreur de vérification OTP (Code HTTP: $VERIFY_HTTP)${NC}"
        echo "$VERIFY_BODY"
    fi
else
    echo -e "${RED}❌ Erreur lors de la création du compte (Code HTTP: $HTTP_CODE2)${NC}"
    echo "$BODY2"
fi

echo ""
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                        COMPARAISON FINALE                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}┌─────────────────────────────┬─────────────────┬─────────────────┐${NC}"
echo -e "${YELLOW}│ Caractéristique            │ /auth/register  │ /request-verif  │${NC}"
echo -e "${YELLOW}├─────────────────────────────┼─────────────────┼─────────────────┤${NC}"
echo -e "${YELLOW}│ Nombre d'étapes             │${NC} ${GREEN}1 étape${NC}         ${YELLOW}│${NC} ${YELLOW}2-3 étapes${NC}      ${YELLOW}│${NC}"
echo -e "${YELLOW}│ Token JWT immédiat          │${NC} ${GREEN}✓ Oui${NC}           ${YELLOW}│${NC} ${RED}✗ Non${NC}           ${YELLOW}│${NC}"
echo -e "${YELLOW}│ Vérification téléphone      │${NC} ${RED}✗ Non${NC}           ${YELLOW}│${NC} ${GREEN}✓ Oui (SMS)${NC}     ${YELLOW}│${NC}"
echo -e "${YELLOW}│ is_phone_verified           │${NC} ${RED}false${NC}           ${YELLOW}│${NC} ${GREEN}true${NC}            ${YELLOW}│${NC}"
echo -e "${YELLOW}│ Activation compte           │${NC} ${GREEN}Immédiate${NC}       ${YELLOW}│${NC} ${YELLOW}Après OTP${NC}       ${YELLOW}│${NC}"
echo -e "${YELLOW}│ Sécurité                    │${NC} ${YELLOW}Moyenne${NC}         ${YELLOW}│${NC} ${GREEN}Élevée${NC}          ${YELLOW}│${NC}"
echo -e "${YELLOW}│ Usage recommandé            │${NC} ${YELLOW}Dev/Tests${NC}       ${YELLOW}│${NC} ${GREEN}Production${NC}      ${YELLOW}│${NC}"
echo -e "${YELLOW}└─────────────────────────────┴─────────────────┴─────────────────┘${NC}"
echo ""
echo -e "${GREEN}✅ Les deux méthodes sont fonctionnelles et coexistent !${NC}"
echo -e "${BLUE}📖 Consultez DIFFERENCE_ROUTES_INSCRIPTION.md pour plus de détails${NC}"
echo ""
