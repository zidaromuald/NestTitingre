# 📱 Guide Complet : Inscription avec Vérification SMS via Twilio

Ce guide vous montre comment créer un compte (User ou Société) avec vérification du numéro de téléphone via Twilio SMS.

## ✅ Le serveur est démarré

Le serveur NestJS est actuellement en cours d'exécution sur `http://localhost:3000`

---

## 🚀 Démarrage Rapide

### Test avec le script automatique

```bash
# Pour tester l'inscription d'un utilisateur
./exemple-inscription-simple.sh
```

### Test manuel avec curl

Suivez les exemples ci-dessous pour tester manuellement avec curl.

---

## 📋 Endpoints Disponibles

| Endpoint                                       | Méthode | Description                          |
|------------------------------------------------|---------|--------------------------------------|
| `/auth/registration/request-verification`      | POST    | Créer compte et envoyer code OTP     |
| `/auth/registration/verify-phone`              | POST    | Vérifier le code OTP                 |
| `/auth/registration/resend-otp`                | POST    | Renvoyer un nouveau code OTP         |
| `/auth/login`                                  | POST    | Se connecter après vérification      |

---

## 👤 Exemple 1 : Inscription d'un Utilisateur

### Étape 1 : Créer le compte et recevoir le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/request-verification \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "user",
    "telephone": "+33612345678",
    "email": "jean.dupont@example.com",
    "password": "Password123!",
    "nom": "Dupont",
    "prenom": "Jean",
    "centre_interet": "Technologie et Innovation",
    "date_naissance": "1990-05-15"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Compte créé avec succès. Un code de vérification a été envoyé au +336123****78",
  "data": {
    "userId": 1,
    "userType": "User"
  }
}
```

**📧 Mode Développement** : Le code OTP s'affiche dans les logs du serveur :
```
[SmsService] 📧 Mode Dev - Code OTP pour +33612345678: 123456
[SmsService] Message: Votre code de vérification Titingre est : 123456
Ce code expire dans 10 minutes.
```

**📱 Mode Production** : Vous recevrez un SMS avec le code OTP.

### Étape 2 : Vérifier le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33612345678",
    "otp_code": "123456"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Votre numéro de téléphone a été vérifié avec succès. Votre compte est maintenant actif.",
  "verified": true
}
```

---

## 🏢 Exemple 2 : Inscription d'une Société

### Étape 1 : Créer le compte et recevoir le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/request-verification \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "societe",
    "telephone": "+33687654321",
    "email": "contact@techcorp.fr",
    "password": "SecurePass456!",
    "nom_societe": "TechCorp Solutions",
    "centre_interet": "Innovation Technologique",
    "secteur_activite": "Informatique",
    "type_produit": "Logiciels SaaS",
    "adresse": "123 Avenue des Champs, Paris"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Compte créé avec succès. Un code de vérification a été envoyé au +336876****21",
  "data": {
    "userId": 2,
    "userType": "Societe"
  }
}
```

### Étape 2 : Vérifier le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33687654321",
    "otp_code": "789012"
  }'
```

---

## 🔄 Exemple 3 : Renvoyer un code OTP

Si le code a expiré (après 10 minutes) ou a été perdu :

```bash
curl -X POST http://localhost:3000/auth/registration/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33612345678"
  }'
```

**Réponse** :
```json
{
  "success": true,
  "message": "Un nouveau code de vérification a été envoyé au +336123****78"
}
```

---

## 🔐 Exemple 4 : Se Connecter après vérification

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+33612345678",
    "password": "Password123!"
  }'
```

**Réponse** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "numero": "+33612345678",
    "is_phone_verified": true,
    "phone_verified_at": "2025-12-26T23:54:40.123Z"
  }
}
```

---

## ⚠️ Gestion des Erreurs Courantes

### 1. Téléphone déjà utilisé (409 Conflict)

```json
{
  "statusCode": 409,
  "message": "Ce numéro de téléphone est déjà utilisé",
  "error": "Conflict"
}
```

### 2. Email déjà utilisé (409 Conflict)

```json
{
  "statusCode": 409,
  "message": "Cet email est déjà utilisé",
  "error": "Conflict"
}
```

### 3. Code OTP invalide (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Code OTP invalide ou expiré",
  "error": "Not Found"
}
```

### 4. Code OTP expiré (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Le code OTP a expiré. Veuillez en demander un nouveau.",
  "error": "Bad Request"
}
```

### 5. Numéro déjà vérifié (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Ce numéro de téléphone est déjà vérifié",
  "error": "Bad Request"
}
```

### 6. Champs manquants pour un User (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Les champs nom, prenom, centre_interet et date_naissance sont requis pour un utilisateur",
  "error": "Bad Request"
}
```

---

## 📊 Validation des Champs

### Pour un User (`userType: "user"`)

| Champ             | Requis | Format/Règles                          |
|-------------------|--------|----------------------------------------|
| telephone         | ✅     | Format français : +33XXXXXXXXX ou 0XXXXXXXXX |
| email             | ✅     | Email valide                           |
| password          | ✅     | Minimum 8 caractères                   |
| nom               | ✅     | Max 255 caractères                     |
| prenom            | ✅     | Max 255 caractères                     |
| centre_interet    | ✅     | Max 255 caractères                     |
| date_naissance    | ✅     | Format ISO : YYYY-MM-DD                |

### Pour une Societe (`userType: "societe"`)

| Champ             | Requis | Format/Règles                          |
|-------------------|--------|----------------------------------------|
| telephone         | ✅     | Format français : +33XXXXXXXXX ou 0XXXXXXXXX |
| email             | ✅     | Email valide                           |
| password          | ✅     | Minimum 8 caractères                   |
| nom_societe       | ✅     | Max 255 caractères                     |
| centre_interet    | ✅     | Max 255 caractères                     |
| secteur_activite  | ✅     | Max 255 caractères                     |
| type_produit      | ✅     | Max 255 caractères                     |
| adresse           | ❌     | Optionnel, max 255 caractères          |

---

## 🧪 Mode Développement vs Production

### Mode Développement (Twilio non configuré)

Quand Twilio n'est pas configuré (variables d'environnement manquantes), le système fonctionne en mode dev :

- ✅ Le code OTP est affiché dans les logs du serveur
- ✅ Aucun SMS n'est réellement envoyé
- ✅ Le flux complet fonctionne normalement
- ✅ Parfait pour le développement et les tests

**Configuration** : Ne configurez pas les variables Twilio dans `.env`

### Mode Production (Twilio configuré)

Avec Twilio configuré :

- ✅ Les SMS sont réellement envoyés via Twilio
- ✅ Les codes OTP ne sont PAS affichés dans les logs
- ✅ Facturation selon votre plan Twilio

**Configuration** : Ajoutez dans votre `.env` :
```env
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📝 Vérification en Base de Données

Après l'inscription et la vérification, vous pouvez vérifier dans PostgreSQL :

```sql
-- Vérifier l'utilisateur créé
SELECT id, nom, prenom, numero, email, is_phone_verified, phone_verified_at, created_at
FROM users
WHERE numero = '+33612345678';

-- Vérifier les OTPs générés (historique)
SELECT id, telephone, otp_code, otp_type, is_used, is_verified, expires_at, created_at
FROM password_reset_otps
WHERE telephone = '+33612345678'
ORDER BY created_at DESC;

-- Vérifier une société
SELECT id, nom_societe, numero, email, is_phone_verified, phone_verified_at, created_at
FROM societes
WHERE numero = '+33687654321';
```

---

## 💡 Points Importants

1. **Durée de validité du code OTP** : 10 minutes
2. **Code OTP à usage unique** : Un code ne peut être utilisé qu'une seule fois
3. **Invalidation automatique** : Les anciens codes sont invalidés quand un nouveau est demandé
4. **Format du téléphone** : Accepte +33XXXXXXXXX ou 0XXXXXXXXX (normalisé automatiquement en +33)
5. **Sécurité** : Les mots de passe sont hashés avec bcrypt (10 rounds)
6. **Vérification requise** : Le compte est créé mais pas actif tant que le téléphone n'est pas vérifié

---

## 🛠️ Tests avec Postman

Importez cette collection Postman pour tester facilement :

1. **Créer une nouvelle collection** : "Titingre - Inscription"

2. **Ajouter les requêtes** :
   - `POST Request Verification` → `{{base_url}}/auth/registration/request-verification`
   - `POST Verify Phone` → `{{base_url}}/auth/registration/verify-phone`
   - `POST Resend OTP` → `{{base_url}}/auth/registration/resend-otp`
   - `POST Login` → `{{base_url}}/auth/login`

3. **Variables d'environnement** :
   - `base_url` = `http://localhost:3000`

---

## 📞 Support et Documentation

- **Configuration Twilio** : [TWILIO_SMS_SETUP.md](TWILIO_SMS_SETUP.md)
- **Implémentation complète** : [PHONE_VERIFICATION_REGISTRATION.md](PHONE_VERIFICATION_REGISTRATION.md)
- **Reset de mot de passe** : [PASSWORD_RESET_SMS.md](PASSWORD_RESET_SMS.md)
- **Documentation Twilio** : https://www.twilio.com/docs/sms

---

## 🎯 Test Rapide - Exemple Complet

```bash
# 1. Créer le compte
RESPONSE=$(curl -s -X POST http://localhost:3000/auth/registration/request-verification \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "user",
    "telephone": "+33612345678",
    "email": "test@example.com",
    "password": "Test123!",
    "nom": "Test",
    "prenom": "User",
    "centre_interet": "Test",
    "date_naissance": "1995-01-01"
  }')

echo "Réponse : $RESPONSE"
echo ""
echo "⚠️  Consultez les logs du serveur pour récupérer le code OTP"
echo ""
read -p "Code OTP : " OTP

# 2. Vérifier le code
curl -X POST http://localhost:3000/auth/registration/verify-phone \
  -H "Content-Type: application/json" \
  -d "{
    \"telephone\": \"+33612345678\",
    \"otp_code\": \"$OTP\"
  }"

# 3. Se connecter
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+33612345678",
    "password": "Test123!"
  }'
```

✅ **Votre serveur est prêt ! Testez dès maintenant !**
