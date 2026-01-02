#!/bin/bash

# Exemple simple d'inscription avec vérification téléphonique
# Pas de dépendances (jq non requis)

API_URL="http://localhost:3000"

echo "======================================================"
echo " Test d'Inscription avec Vérification Téléphonique"
echo "======================================================"
echo ""

# ÉTAPE 1 : Créer le compte et demander le code OTP
echo "ÉTAPE 1 : Création du compte utilisateur..."
echo ""

curl -X POST "$API_URL/auth/registration/request-verification" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "user",
    "telephone": "+33612345678",
    "email": "jean.test@example.com",
    "password": "Password123!",
    "nom": "Dupont",
    "prenom": "Jean",
    "centre_interet": "Technologie",
    "date_naissance": "1990-05-15"
  }'

echo ""
echo ""
echo "------------------------------------------------------"
echo "⚠️  IMPORTANT : Récupérez le code OTP"
echo ""
echo "• Mode Production : Vérifiez vos SMS"
echo "• Mode Dev : Consultez les logs du serveur"
echo "  Recherchez : [SmsService] 📧 Mode Dev - Code OTP"
echo "------------------------------------------------------"
echo ""
read -p "Entrez le code OTP reçu (6 chiffres) : " OTP_CODE
echo ""

# ÉTAPE 2 : Vérifier le code OTP
echo "ÉTAPE 2 : Vérification du code OTP..."
echo ""

curl -X POST "$API_URL/auth/registration/verify-phone" \
  -H "Content-Type: application/json" \
  -d "{
    \"telephone\": \"+33612345678\",
    \"otp_code\": \"$OTP_CODE\"
  }"

echo ""
echo ""
echo "======================================================"
echo "✅ Inscription terminée !"
echo "======================================================"
