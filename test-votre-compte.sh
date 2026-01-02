#!/bin/bash

# Test de création de compte pour Junior SANOU
# Version adaptée avec numéro français

API_URL="http://localhost:3000"

echo "=========================================="
echo " Création de compte pour Junior SANOU"
echo "=========================================="
echo ""

# OPTION 1 : Avec la méthode ancienne (/auth/register) - PLUS SIMPLE
echo "TEST 1 : Méthode /auth/register (plus simple, 1 seule étape)"
echo ""

curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "SANOU",
    "prenom": "Junior",
    "email": "Junior1@gmail.com",
    "numero": "+33612345678",
    "activite": "Informaticien",
    "date_naissance": "1999-06-09",
    "password": "Junior12345"
  }'

echo ""
echo ""
echo "=========================================="
echo " ⚠️  IMPORTANT"
echo "=========================================="
echo ""
echo "Votre numéro original : 0022608090809 (Burkina Faso)"
echo "Numéro utilisé ici   : +33612345678 (France)"
echo ""
echo "Pour utiliser votre vrai numéro burkinabé,"
echo "je dois modifier la validation dans le code."
echo ""
echo "Voulez-vous que je modifie le code pour"
echo "accepter les numéros burkinabés (+226) ?"
echo ""
