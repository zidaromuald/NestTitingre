# Déploiement Flutter Web - Guide Rapide (VPS Hostinger)

## 🚀 Démarrage Rapide (5 étapes)

### Prérequis
- ✅ VPS Hostinger avec accès SSH
- ✅ Backend NestJS déjà déployé
- ✅ Projet Flutter prêt

---

## 📝 Étapes Simplifiées

### 1️⃣ Configurer l'API dans Flutter

Créez `lib/config/api_config.dart`:

```dart
class ApiConfig {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000/api',
  );
}
```

Utilisez dans vos services:
```dart
final url = Uri.parse('${ApiConfig.apiUrl}/auth/login');
```

---

### 2️⃣ Builder Flutter Web

```bash
# Dans votre projet Flutter
flutter build web --release --dart-define=API_URL=https://votre-domaine.com/api
```

---

### 3️⃣ Créer le dossier sur le VPS

```bash
# Se connecter au VPS
ssh zidar@votre-ip-vps

# Créer le dossier
sudo mkdir -p /var/www/monapp.com
sudo chown -R $USER:$USER /var/www/monapp.com
sudo chmod -R 755 /var/www/monapp.com
```

---

### 4️⃣ Uploader les fichiers

```bash
# Depuis votre machine locale
rsync -avz --delete build/web/ zidar@votre-ip-vps:/var/www/monapp.com/
```

---

### 5️⃣ Configurer Nginx

```bash
# Sur le VPS
sudo nano /etc/nginx/sites-available/monapp.com
```

Copiez cette configuration minimale:

```nginx
server {
    listen 80;
    server_name monapp.com www.monapp.com;
    root /var/www/monapp.com;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript application/json;

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Activer et redémarrer:

```bash
sudo ln -s /etc/nginx/sites-available/monapp.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 6️⃣ Activer HTTPS (Bonus)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d monapp.com -d www.monapp.com
```

---

## 🎉 C'est tout!

Visitez: `https://votre-domaine.com`

---

## 🔄 Mise à jour rapide

```bash
# Build
flutter build web --release --dart-define=API_URL=https://votre-domaine.com/api

# Upload
rsync -avz --delete build/web/ zidar@votre-ip-vps:/var/www/monapp.com/
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez [GUIDE_DEPLOIEMENT_FLUTTER_WEB.md](GUIDE_DEPLOIEMENT_FLUTTER_WEB.md)

---

## ⚠️ Important

### Configuration CORS dans NestJS

Dans [src/main.ts](src/main.ts), vérifiez:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://monapp.com',
    'https://www.monapp.com',
  ],
  credentials: true,
});
```

### Structure du VPS

```
/var/www/monapp.com/           # Flutter Web (Frontend)
  ├── index.html
  ├── main.dart.js
  ├── flutter.js
  ├── assets/
  └── canvaskit/

~/apps/tata-api/                # NestJS API (Backend)
  └── dist/
```

---

## 🐛 Dépannage Rapide

### Page blanche?
```bash
# Vérifier les logs Nginx
ssh zidar@votre-ip-vps
sudo tail -f /var/log/nginx/monapp-error.log
```

### Erreur CORS?
Vérifiez que votre domaine est dans la liste CORS du backend.

### Routes ne marchent pas?
Vérifiez la configuration `try_files` dans Nginx.

---

## 📞 Commandes Utiles

```bash
# Voir les logs Nginx
ssh zidar@votre-ip-vps 'sudo tail -f /var/log/nginx/monapp-access.log'

# Tester Nginx
ssh zidar@votre-ip-vps 'sudo nginx -t'

# Redémarrer Nginx
ssh zidar@votre-ip-vps 'sudo systemctl restart nginx'

# Voir les fichiers déployés
ssh zidar@votre-ip-vps 'ls -la /var/www/monapp.com'
```
