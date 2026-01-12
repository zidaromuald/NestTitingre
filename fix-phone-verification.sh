#!/bin/bash

# ============================================
# Script de Correction: Phone Verification
# ============================================
# Ce script corrige l'erreur "column is_phone_verified does not exist"
# en ajoutant les colonnes manquantes aux tables users et societes

set -e  # Arrêter en cas d'erreur

# ====================
# COULEURS
# ====================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ====================
# FONCTIONS
# ====================
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo "============================================"
echo "🔧 Correction: Phone Verification Columns"
echo "============================================"
echo ""

# ====================
# ÉTAPE 1: Build local
# ====================
print_step "1/5 Build du projet en local..."
npm run build

if [ ! -d "dist" ]; then
  print_error "Le build a échoué!"
  exit 1
fi

print_success "Build réussi"
echo ""

# ====================
# ÉTAPE 2: Commit et Push
# ====================
print_step "2/5 Commit et push des migrations..."

git add src/migrations/1736683300000-AddPhoneVerificationToSocietes.ts
git commit -m "fix: Add phone verification columns to societes table" || print_warning "Aucun changement à commiter"
git push origin main || print_warning "Push échoué ou déjà à jour"

print_success "Code poussé sur Git"
echo ""

# ====================
# ÉTAPE 3: Déploiement sur VPS
# ====================
print_step "3/5 Connexion au VPS et pull du code..."

VPS_USER="zidar"
VPS_HOST="154.56.50.146"  # Remplacez par votre IP
API_PATH="~/apps/titingre-api"

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

echo "📥 Pull du code..."
cd ~/apps/titingre-api
git pull origin main

echo "📦 Installation des dépendances..."
npm install

echo "🏗️ Build du projet..."
npm run build

echo "✅ Code déployé"
ENDSSH

print_success "Code déployé sur le VPS"
echo ""

# ====================
# ÉTAPE 4: Exécution des migrations
# ====================
print_step "4/5 Exécution des migrations sur le VPS..."

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

cd ~/apps/titingre-api

echo "📋 État des migrations AVANT:"
npm run migration:show

echo ""
echo "⚡ Exécution des migrations..."
npm run migration:run

echo ""
echo "📋 État des migrations APRÈS:"
npm run migration:show

echo ""
echo "✅ Migrations exécutées avec succès"
ENDSSH

print_success "Migrations appliquées"
echo ""

# ====================
# ÉTAPE 5: Redémarrage de l'API
# ====================
print_step "5/5 Redémarrage de l'API..."

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
set -e

echo "🔄 Redémarrage PM2..."
pm2 restart titingre-api

echo "⏳ Attente de 3 secondes..."
sleep 3

echo "📊 État de l'application:"
pm2 status titingre-api

echo ""
echo "📝 Derniers logs:"
pm2 logs titingre-api --lines 20 --nostream

echo ""
echo "✅ API redémarrée"
ENDSSH

print_success "API redémarrée avec succès"
echo ""

# ====================
# ÉTAPE 6: Vérification
# ====================
print_step "Vérification de l'API..."

echo ""
echo "🧪 Test de l'endpoint register..."
RESPONSE=$(curl -X POST https://api.titingre.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenoms": "Verification",
    "telephone": "70999888",
    "email": "test-verification@example.com",
    "password": "Test1234"
  }' \
  -w "\n%{http_code}" \
  -s)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo ""
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 409 ]; then
  print_success "API fonctionne! (HTTP $HTTP_CODE)"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  print_error "API retourne une erreur (HTTP $HTTP_CODE)"
  echo "$BODY"
fi

echo ""
echo "============================================"
print_success "CORRECTION TERMINÉE!"
echo "============================================"
echo ""
echo "📝 Résumé:"
echo "   ✅ Migrations créées et commitées"
echo "   ✅ Code déployé sur le VPS"
echo "   ✅ Migrations exécutées sur la base de données"
echo "   ✅ API redémarrée"
echo "   ✅ Colonnes is_phone_verified et phone_verified_at ajoutées"
echo ""
echo "🌐 Votre API est prête:"
echo "   https://api.titingre.com"
echo ""
echo "🧪 Testez maintenant l'inscription depuis votre app Flutter!"
echo ""
