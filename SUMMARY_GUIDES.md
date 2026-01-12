# 📚 Résumé des Guides de Déploiement

## 🎯 Guides Créés pour Vous

Voici tous les fichiers de documentation et scripts créés pour faciliter votre déploiement:

---

## 🔴 **URGENT: Corriger l'Erreur Backend**

### 📄 [README_FIX_PHONE_VERIFICATION.md](README_FIX_PHONE_VERIFICATION.md)
**Guide rapide** pour corriger l'erreur actuelle:
```
QueryFailedError: column User.is_phone_verified does not exist
```

**🚀 À FAIRE EN PREMIER!**

**Fichiers associés:**
- 📄 [FIX_PRODUCTION_DB.md](FIX_PRODUCTION_DB.md) - Guide détaillé complet
- 🔧 [fix-phone-verification.sh](fix-phone-verification.sh) - Script automatique
- 📊 [fix-phone-verification.sql](fix-phone-verification.sql) - Script SQL direct
- 🗂️ [src/migrations/1736683300000-AddPhoneVerificationToSocietes.ts](src/migrations/1736683300000-AddPhoneVerificationToSocietes.ts) - Migration TypeScript

**Commandes rapides:**
```bash
# Option A: Script automatique (recommandé)
./fix-phone-verification.sh

# Option B: Manuel
ssh zidar@votre-ip-vps
cd ~/apps/titingre-api
git pull && npm run build && npm run migration:run
pm2 restart titingre-api
```

---

## 🌐 **Déploiement Flutter Web**

### 📄 [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md)
**Guide complet** pour déployer votre application Flutter Web sur Hostinger VPS.

**Contenu:**
- ✅ Comparaison VPS vs Hébergement Partagé
- ✅ Configuration du projet Flutter
- ✅ Build de production
- ✅ Déploiement sur VPS avec Nginx
- ✅ Configuration SSL (HTTPS gratuit)
- ✅ Scripts de déploiement automatiques
- ✅ Dépannage complet

**Durée:** 30-45 minutes

---

### 📄 [DEPLOIEMENT_FLUTTER_QUICK_START.md](DEPLOIEMENT_FLUTTER_QUICK_START.md)
**Quick Start** - Version simplifiée en 6 étapes.

**Contenu:**
- ⚡ Configuration rapide API
- ⚡ Build Flutter
- ⚡ Création dossier VPS
- ⚡ Upload fichiers
- ⚡ Configuration Nginx minimale
- ⚡ SSL

**Durée:** 10-15 minutes

---

## 📊 Tableau Récapitulatif

| Guide | Type | Durée | Priorité | Utilisation |
|-------|------|-------|----------|-------------|
| [README_FIX_PHONE_VERIFICATION.md](README_FIX_PHONE_VERIFICATION.md) | Fix Urgent | 5-10 min | 🔴 **URGENT** | Corriger erreur backend actuelle |
| [FIX_PRODUCTION_DB.md](FIX_PRODUCTION_DB.md) | Guide détaillé | 15-20 min | 🔴 **URGENT** | Détails correction + prévention |
| [DEPLOIEMENT_FLUTTER_QUICK_START.md](DEPLOIEMENT_FLUTTER_QUICK_START.md) | Quick Start | 10-15 min | 🟡 Après fix | Déployer Flutter rapidement |
| [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md) | Guide complet | 30-45 min | 🟢 Référence | Documentation complète Flutter |

---

## 🗂️ Scripts Créés

### Backend (Correction DB)

| Script | Description | Commande |
|--------|-------------|----------|
| [fix-phone-verification.sh](fix-phone-verification.sh) | Script bash automatique complet | `./fix-phone-verification.sh` |
| [fix-phone-verification.sql](fix-phone-verification.sql) | Script SQL direct | `psql -U api_userzr -d titingre_db -f fix-phone-verification.sql` |

### Frontend (Flutter Web)

Scripts disponibles dans [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md):
- `deploy_flutter_vps.sh` - Déploiement complet avec vérifications
- `quick_deploy.sh` - Déploiement rapide pour mises à jour
- `deploy_flutter_shared.sh` - Pour hébergement partagé (FTP)

---

## 🎯 Plan d'Action Complet

### Étape 1: Corriger le Backend (MAINTENANT)
1. Lire: [README_FIX_PHONE_VERIFICATION.md](README_FIX_PHONE_VERIFICATION.md)
2. Exécuter: `./fix-phone-verification.sh` OU suivre Option B/C
3. Tester: `curl -X POST https://api.titingre.com/auth/register ...`

### Étape 2: Déployer le Frontend
4. Lire: [DEPLOIEMENT_FLUTTER_QUICK_START.md](DEPLOIEMENT_FLUTTER_QUICK_START.md)
5. Configurer l'API dans Flutter
6. Build: `flutter build web --release --dart-define=API_URL=https://api.titingre.com`
7. Créer dossier VPS: `sudo mkdir -p /var/www/titingre-app.com`
8. Upload: `rsync -avz build/web/ zidar@votre-ip:/var/www/titingre-app.com/`
9. Configurer Nginx (voir guide)
10. Activer SSL: `sudo certbot --nginx -d titingre-app.com`

### Étape 3: Tester
11. Backend: `https://api.titingre.com/auth/register`
12. Frontend: `https://titingre-app.com`
13. Test complet: Créer un compte depuis l'app

---

## 🏗️ Architecture Finale

```
VPS Hostinger (srv1232327)
│
├── Backend NestJS
│   📁 ~/apps/titingre-api/
│   🌐 https://api.titingre.com
│   ⚙️  PM2 (port 3000)
│   🗄️  PostgreSQL (titingre_db)
│
└── Frontend Flutter Web
    📁 /var/www/titingre-app.com/
    🌐 https://titingre-app.com
    ⚙️  Nginx (port 80/443)
```

---

## 📋 Checklist Complète

### Backend ✅
- [ ] Migration `users` exécutée
- [ ] Migration `societes` exécutée
- [ ] API redémarrée
- [ ] Test inscription réussit
- [ ] Logs PM2 OK

### Frontend ⏳
- [ ] Dossier VPS créé (`/var/www/titingre-app.com`)
- [ ] Fichiers Flutter uploadés
- [ ] Nginx configuré
- [ ] SSL activé
- [ ] App accessible en HTTPS
- [ ] Inscription fonctionne depuis l'app

### CORS ⏳
- [ ] Domaine frontend ajouté dans [src/main.ts](src/main.ts)
- [ ] ALLOWED_ORIGINS mis à jour dans `.env` production

---

## 🆘 Dépannage Rapide

| Problème | Solution | Guide |
|----------|----------|-------|
| "column does not exist" | Exécuter migrations | [README_FIX_PHONE_VERIFICATION.md](README_FIX_PHONE_VERIFICATION.md) |
| "failed to fetch" | Vérifier CORS | [FIX_PRODUCTION_DB.md](FIX_PRODUCTION_DB.md) |
| Page blanche Flutter | Vérifier Nginx | [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md) |
| Routes ne marchent pas | `try_files` Nginx | [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md) |
| Erreur 404 assets | Permissions fichiers | [DEPLOIEMENT_FLUTTER_QUICK_START.md](DEPLOIEMENT_FLUTTER_QUICK_START.md) |

---

## 📞 Commandes Utiles

### Backend
```bash
# Logs
ssh zidar@votre-ip 'pm2 logs titingre-api --lines 50'

# Redémarrer
ssh zidar@votre-ip 'pm2 restart titingre-api'

# Migrations
ssh zidar@votre-ip 'cd ~/apps/titingre-api && npm run migration:show'
```

### Frontend
```bash
# Build
flutter build web --release --dart-define=API_URL=https://api.titingre.com

# Deploy
rsync -avz --delete build/web/ zidar@votre-ip:/var/www/titingre-app.com/

# Nginx
ssh zidar@votre-ip 'sudo nginx -t && sudo systemctl restart nginx'
```

### Base de données
```bash
# Connexion
ssh zidar@votre-ip
psql -U api_userzr -d titingre_db

# Vérifier colonnes
\d users
\d societes

# Lister migrations
SELECT * FROM migrations ORDER BY id DESC LIMIT 5;
```

---

## 🎓 Pour Aller Plus Loin

- **Automatisation:** Créer un pipeline CI/CD (GitHub Actions)
- **Monitoring:** Configurer Sentry pour les erreurs
- **Performance:** Optimiser les assets Flutter
- **Backup:** Script automatique de sauvegarde DB

---

## 📝 Notes Importantes

### Développement vs Production

| Aspect | Développement | Production |
|--------|--------------|------------|
| TypeORM sync | ✅ Auto | ❌ Désactivé |
| Migrations | Optionnelles | **OBLIGATOIRES** |
| Logs | Verbeux | Minimaux |
| CORS | `*` | Domaines spécifiques |
| SSL | HTTP | HTTPS |

### Procédure de Déploiement Standard

**À chaque modification de structure DB:**
```bash
# 1. Local: Créer migration
npm run migration:generate -- src/migrations/NomMigration

# 2. Local: Build et test
npm run build

# 3. Local: Commit
git add . && git commit -m "..." && git push

# 4. VPS: Deploy
ssh zidar@votre-ip
cd ~/apps/titingre-api
git pull && npm install && npm run build

# 5. VPS: Migrations (CRUCIAL!)
npm run migration:run

# 6. VPS: Restart
pm2 restart titingre-api && pm2 logs titingre-api
```

---

**Dernière mise à jour:** 2026-01-12
**Status:** ✅ Tous les guides et scripts créés, prêts à utiliser
