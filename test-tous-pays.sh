#!/bin/bash

# Test de tous les pays d'Afrique de l'Ouest supportés

API_URL="http://localhost:3000"

echo "=========================================="
echo " Test - Tous les Pays d'Afrique de l'Ouest"
echo "=========================================="
echo ""

# Fonction pour tester un pays
test_country() {
    local flag=$1
    local country=$2
    local code=$3
    local numero=$4
    local email=$5

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$flag $country ($code)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Numéro : $numero"
    echo ""

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
      -H "Content-Type: application/json" \
      -d "{
        \"nom\": \"Test\",
        \"prenom\": \"User\",
        \"email\": \"$email\",
        \"numero\": \"$numero\",
        \"activite\": \"Test\",
        \"date_naissance\": \"1995-01-01\",
        \"password\": \"Test123!\",
        \"password_confirmation\": \"Test123!\"
      }")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
        echo "✅ SUCCÈS - Inscription réussie"
    else
        echo "❌ ÉCHEC - Code HTTP: $HTTP_CODE"
        echo "$BODY"
    fi
    echo ""
}

# Test de chaque pays
test_country "🇧🇫" "Burkina Faso" "+226" "0022608090809" "test.bf@example.com"
test_country "🇨🇮" "Côte d'Ivoire" "+225" "002250123456789" "test.ci@example.com"
test_country "🇲🇱" "Mali" "+223" "0022312345678" "test.ml@example.com"
test_country "🇸🇳" "Sénégal" "+221" "002217012345678" "test.sn@example.com"
test_country "🇹🇬" "Togo" "+228" "0022890123456" "test.tg@example.com"
test_country "🇧🇯" "Bénin" "+229" "0022990123456" "test.bj@example.com"
test_country "🇳🇪" "Niger" "+227" "0022790123456" "test.ne@example.com"
test_country "🇬🇳" "Guinée" "+224" "002246012345678" "test.gn@example.com"

echo "=========================================="
echo " ✅ Tests Terminés"
echo "=========================================="
echo ""
echo "Pays supportés : 8"
echo "Format accepté : 00XXX, +XXX, XXX"
echo ""
