#!/bin/bash

# Test de création de compte avec un numéro burkinabé
# Données réelles de Junior SANOU

API_URL="http://localhost:3000"

echo "=========================================="
echo " Test - Inscription Junior SANOU"
echo " 🇧🇫 Burkina Faso"
echo "=========================================="
echo ""

# Test avec l'ancienne méthode /auth/register (plus simple)
echo "📋 Données à envoyer:"
echo "  Nom: SANOU"
echo "  Prénom: Junior"
echo "  Email: Junior1@gmail.com"
echo "  Numéro: 0022608090809 (Burkina Faso)"
echo "  Activité: Informaticien"
echo "  Date naissance: 1999-06-09"
echo ""
echo "⏳ Envoi de la requête..."
echo ""

curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "SANOU",
    "prenom": "Junior",
    "email": "Junior1@gmail.com",
    "numero": "0022608090809",
    "activite": "Informaticien",
    "date_naissance": "1999-06-09",
    "password": "Junior12345",
    "password_confirmation": "Junior12345"
  }'

echo ""
echo ""
echo "=========================================="
echo " ✅ Si l'inscription a réussi,"
echo "    vous avez reçu un token JWT !"
echo "=========================================="
echo ""
echo "Format alternatif accepté:"
echo "  • 0022608090809  (format 00 + indicatif)"
echo "  • +22608090809   (format international)"
echo "  • 22608090809    (sans préfixe)"
echo ""
