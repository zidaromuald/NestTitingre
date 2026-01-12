#!/bin/bash

# Script pour trouver le dossier de l'API sur le VPS

echo "🔍 Recherche du dossier titingre-api sur le VPS..."
echo ""

VPS_USER="zidar"
VPS_HOST="154.56.50.146"

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'

echo "📁 Recherche dans le home directory..."
find ~ -name "titingre-api" -o -name "tata-api" -o -name "*titingre*" -o -name "*tata*" 2>/dev/null | head -20

echo ""
echo "📁 Recherche des processus PM2..."
pm2 list

echo ""
echo "📁 Contenu du home directory..."
ls -la ~

echo ""
echo "📁 Recherche dans /var/www..."
sudo find /var/www -name "*titingre*" -o -name "*tata*" 2>/dev/null | head -10

echo ""
echo "📁 Recherche dans /opt..."
sudo find /opt -name "*titingre*" -o -name "*tata*" 2>/dev/null | head -10

ENDSSH

echo ""
echo "✅ Recherche terminée!"
