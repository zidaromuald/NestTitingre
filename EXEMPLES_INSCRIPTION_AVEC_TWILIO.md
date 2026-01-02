# Guide Complet : Inscription avec Vérification Téléphonique via Twilio

Ce guide vous montre comment créer un compte (User ou Société) avec vérification du numéro de téléphone via Twilio SMS.

## 📋 Prérequis

1. **Configurer Twilio** (voir [TWILIO_SMS_SETUP.md](TWILIO_SMS_SETUP.md))
   - Créer un compte Twilio
   - Obtenir Account SID et Auth Token
   - Obtenir un numéro Twilio

2. **Variables d'environnement** (fichier `.env`) :
```env
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🔄 Processus d'Inscription en 2 Étapes

### Étape 1 : Créer le compte et recevoir le code OTP

**Endpoint** : `POST /auth/registration/request-otp`

### Étape 2 : Vérifier le code OTP et activer le compte

**Endpoint** : `POST /auth/registration/verify-otp`

---

## 📱 Exemple 1 : Inscription d'un Utilisateur (User)

### Étape 1 : Demander le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "user",
    "telephone": "+33612345678",
    "email": "jean.dupont@example.com",
    "password": "Password123!",
    "nom": "Dupont",
    "prenom": "Jean",
    "centre_interet": "Technologie",
    "date_naissance": "1990-05-15"
  }'
```

**Réponse attendue** :
```json
{
  "message": "Compte créé avec succès. Un code de vérification a été envoyé au +336123****78",
  "userId": 1,
  "userType": "User"
}
```

**SMS reçu** :
```
Votre code de vérification Titingre est : 123456
Ce code expire dans 10 minutes.
```

### Étape 2 : Vérifier le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33612345678",
    "otp_code": "123456"
  }'
```

**Réponse attendue** :
```json
{
  "message": "Votre numéro de téléphone a été vérifié avec succès. Votre compte est maintenant actif.",
  "verified": true
}
```

---

## 🏢 Exemple 2 : Inscription d'une Société (Societe)

### Étape 1 : Demander le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/request-otp \
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
  "message": "Compte créé avec succès. Un code de vérification a été envoyé au +336876****21",
  "userId": 2,
  "userType": "Societe"
}
```

**SMS reçu** :
```
Votre code de vérification Titingre est : 789012
Ce code expire dans 10 minutes.
```

### Étape 2 : Vérifier le code OTP

```bash
curl -X POST http://localhost:3000/auth/registration/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33687654321",
    "otp_code": "789012"
  }'
```

**Réponse attendue** :
```json
{
  "message": "Votre numéro de téléphone a été vérifié avec succès. Votre compte est maintenant actif.",
  "verified": true
}
```

---

## 🔄 Exemple 3 : Renvoyer un code OTP (si expiré ou perdu)

**Endpoint** : `POST /auth/registration/resend-otp`

```bash
curl -X POST http://localhost:3000/auth/registration/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33612345678"
  }'
```

**Réponse attendue** :
```json
{
  "message": "Un nouveau code de vérification a été envoyé au +336123****78"
}
```

---

## 🔐 Exemple 4 : Se Connecter après vérification

Une fois le compte vérifié, vous pouvez vous connecter normalement :

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "+33612345678",
    "password": "Password123!"
  }'
```

**Réponse attendue** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "numero": "+33612345678",
    "is_phone_verified": true
  }
}
```

---

## ⚠️ Gestion des Erreurs

### 1. Téléphone déjà utilisé

**Requête** :
```bash
curl -X POST http://localhost:3000/auth/registration/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "user",
    "telephone": "+33612345678",
    ...
  }'
```

**Réponse** (409 Conflict) :
```json
{
  "statusCode": 409,
  "message": "Ce numéro de téléphone est déjà utilisé",
  "error": "Conflict"
}
```

### 2. Email déjà utilisé

**Réponse** (409 Conflict) :
```json
{
  "statusCode": 409,
  "message": "Cet email est déjà utilisé",
  "error": "Conflict"
}
```

### 3. Code OTP invalide

**Requête** :
```bash
curl -X POST http://localhost:3000/auth/registration/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33612345678",
    "otp_code": "999999"
  }'
```

**Réponse** (404 Not Found) :
```json
{
  "statusCode": 404,
  "message": "Code OTP invalide ou expiré",
  "error": "Not Found"
}
```

### 4. Code OTP expiré (après 10 minutes)

**Réponse** (400 Bad Request) :
```json
{
  "statusCode": 400,
  "message": "Le code OTP a expiré. Veuillez en demander un nouveau.",
  "error": "Bad Request"
}
```

### 5. Compte déjà vérifié

**Requête** (renvoyer OTP pour un compte déjà vérifié) :
```bash
curl -X POST http://localhost:3000/auth/registration/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+33612345678"
  }'
```

**Réponse** (400 Bad Request) :
```json
{
  "statusCode": 400,
  "message": "Ce numéro de téléphone est déjà vérifié",
  "error": "Bad Request"
}
```

---

## 🧪 Mode Développement (sans Twilio configuré)

Si Twilio n'est pas configuré, le système fonctionne en mode développement :

1. **Le code OTP est affiché dans les logs du serveur** :
```
[SmsService] 📧 Mode Dev - Code OTP pour +33612345678: 123456
```

2. **Aucun SMS n'est réellement envoyé**

3. **Le code OTP est quand même stocké en base de données**

4. **Vous pouvez tester le flux complet sans Twilio**

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

## 🎯 Scénario Complet : Test End-to-End

Voici un script bash complet pour tester l'inscription :

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3000"
TELEPHONE="+33612345678"
EMAIL="test@example.com"
PASSWORD="TestPassword123!"

echo "=== Test d'inscription avec vérification téléphonique ==="

# Étape 1 : Créer le compte
echo -e "\n1️⃣ Création du compte..."
RESPONSE=$(curl -s -X POST $API_URL/auth/registration/request-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"userType\": \"user\",
    \"telephone\": \"$TELEPHONE\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"nom\": \"Test\",
    \"prenom\": \"User\",
    \"centre_interet\": \"Testing\",
    \"date_naissance\": \"1995-01-01\"
  }")

echo $RESPONSE | jq '.'

# Attendre l'utilisateur pour entrer le code OTP
echo -e "\n2️⃣ Vérifiez vos SMS ou les logs du serveur pour le code OTP"
read -p "Entrez le code OTP reçu : " OTP_CODE

# Étape 2 : Vérifier le code OTP
echo -e "\n3️⃣ Vérification du code OTP..."
VERIFY_RESPONSE=$(curl -s -X POST $API_URL/auth/registration/verify-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"telephone\": \"$TELEPHONE\",
    \"otp_code\": \"$OTP_CODE\"
  }")

echo $VERIFY_RESPONSE | jq '.'

# Étape 3 : Se connecter
echo -e "\n4️⃣ Connexion au compte..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"identifier\": \"$TELEPHONE\",
    \"password\": \"$PASSWORD\"
  }")

echo $LOGIN_RESPONSE | jq '.'
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

echo -e "\n✅ Inscription et connexion réussies !"
echo "🔑 Token JWT : $TOKEN"
```

**Pour exécuter le script** :
```bash
chmod +x test-inscription.sh
./test-inscription.sh
```

---

## 📝 Notes Importantes

1. **Durée de validité du code OTP** : 10 minutes
2. **Un seul code OTP valide** : Les anciens codes sont automatiquement invalidés quand un nouveau est demandé
3. **Sécurité** : Le code OTP ne peut être utilisé qu'une seule fois
4. **Format du téléphone** : Accepte les formats +33XXXXXXXXX ou 0XXXXXXXXX (automatiquement normalisé)
5. **En production** : Configurez toujours Twilio avec vos vraies credentials

---

## 🔗 Endpoints Disponibles

| Endpoint                                    | Méthode | Description                          |
|---------------------------------------------|---------|--------------------------------------|
| `/auth/registration/request-otp`            | POST    | Créer compte et envoyer code OTP     |
| `/auth/registration/verify-otp`             | POST    | Vérifier le code OTP                 |
| `/auth/registration/resend-otp`             | POST    | Renvoyer un nouveau code OTP         |
| `/auth/login`                               | POST    | Se connecter après vérification      |

---

## ✅ Vérification en Base de Données

Après l'inscription et la vérification, vous pouvez vérifier dans PostgreSQL :

```sql
-- Vérifier l'utilisateur créé
SELECT id, nom, prenom, numero, email, is_phone_verified, phone_verified_at, created_at
FROM users
WHERE numero = '+33612345678';

-- Vérifier les OTPs générés
SELECT id, telephone, otp_code, otp_type, is_used, is_verified, expires_at, created_at
FROM password_reset_otps
WHERE telephone = '+33612345678'
ORDER BY created_at DESC;

-- Vérifier une société créée
SELECT id, nom_societe, numero, email, is_phone_verified, phone_verified_at, created_at
FROM societes
WHERE numero = '+33687654321';
```

---

## 🆘 Support

- Documentation Twilio : https://www.twilio.com/docs/sms
- Configuration Twilio : [TWILIO_SMS_SETUP.md](TWILIO_SMS_SETUP.md)
- Implémentation complète : [PHONE_VERIFICATION_REGISTRATION.md](PHONE_VERIFICATION_REGISTRATION.md)
