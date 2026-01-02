# 🌍 Support des Numéros d'Afrique de l'Ouest

## ✅ Modification Effectuée avec Succès !

Votre application accepte maintenant **tous les numéros de téléphone d'Afrique de l'Ouest** :

- 🇧🇫 **Burkina Faso** : +226 (8 chiffres)
- 🇨🇮 **Côte d'Ivoire** : +225 (10 chiffres)
- 🇲🇱 **Mali** : +223 (8 chiffres)
- 🇸🇳 **Sénégal** : +221 (9 chiffres)
- 🇹🇬 **Togo** : +228 (8 chiffres)
- 🇧🇯 **Bénin** : +229 (8 chiffres)
- 🇳🇪 **Niger** : +227 (8 chiffres)
- 🇬🇳 **Guinée** : +224 (9 chiffres)

---

## 🎯 Test Réussi !

Voici le test effectué avec **votre numéro burkinabé** :

### Requête
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "SANOU",
    "prenom": "Junior",
    "email": "junior.test@example.com",
    "numero": "0022608090809",
    "activite": "Informaticien",
    "date_naissance": "1999-06-09",
    "password": "Junior12345",
    "password_confirmation": "Junior12345"
  }'
```

### Réponse (SUCCÈS ✅)
```json
{
  "status": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 6,
      "nom": "SANOU",
      "prenom": "Junior",
      "email": "junior.test@example.com",
      "numero": "0022608090809"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "user_type": "user"
  }
}
```

---

## 📝 Formats de Numéros Acceptés

Pour **tous les pays d'Afrique de l'Ouest**, vous pouvez utiliser ces formats :

### 🇧🇫 Burkina Faso (+226)
```json
"numero": "0022608090809"    // ✅ Avec préfixe 00
"numero": "+22608090809"      // ✅ Avec préfixe +
"numero": "22608090809"       // ✅ Sans préfixe
```

### 🇨🇮 Côte d'Ivoire (+225)
```json
"numero": "00225XXXXXXXXXX"   // ✅ 10 chiffres après 225
"numero": "+225XXXXXXXXXX"
"numero": "225XXXXXXXXXX"
```

### 🇲🇱 Mali (+223)
```json
"numero": "0022312345678"     // ✅ 8 chiffres après 223
"numero": "+22312345678"
"numero": "22312345678"
```

### 🇸🇳 Sénégal (+221)
```json
"numero": "002217012345678"   // ✅ 9 chiffres après 221
"numero": "+2217012345678"
"numero": "2217012345678"
```

### 🇹🇬 Togo (+228)
```json
"numero": "0022890123456"     // ✅ 8 chiffres après 228
"numero": "+22890123456"
"numero": "22890123456"
```

### 🇧🇯 Bénin (+229)
```json
"numero": "0022990123456"     // ✅ 8 chiffres après 229
"numero": "+22990123456"
"numero": "22990123456"
```

### 🇳🇪 Niger (+227)
```json
"numero": "0022790123456"     // ✅ 8 chiffres après 227
"numero": "+22790123456"
"numero": "22790123456"
```

### 🇬🇳 Guinée (+224)
```json
"numero": "002246012345678"   // ✅ 9 chiffres après 224
"numero": "+2246012345678"
"numero": "2246012345678"
```

---

## 🚀 Comment Utiliser

### Option 1 : Méthode `/auth/register` (Recommandée pour vous)

Cette méthode accepte **exactement** le format que vous voulez utiliser :

```bash
curl -X POST http://localhost:3000/auth/register \
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
```

**Réponse** :
- ✅ Compte créé immédiatement
- ✅ Token JWT retourné
- ⚠️ Téléphone pas vérifié (`is_phone_verified: false`)

---

### Option 2 : Méthode `/auth/registration/request-verification` (Avec SMS)

Pour cette méthode, utilisez ces champs :

```bash
curl -X POST http://localhost:3000/auth/registration/request-verification \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "user",
    "telephone": "0022608090809",
    "email": "Junior1@gmail.com",
    "password": "Junior12345",
    "nom": "SANOU",
    "prenom": "Junior",
    "centre_interet": "Informaticien",
    "date_naissance": "1999-06-09"
  }'
```

**Différences avec Option 1** :
- ✅ Ajout de `userType: "user"`
- ✅ `numero` → `telephone`
- ✅ `activite` → `centre_interet`
- ✅ Pas besoin de `password_confirmation`
- ⚠️ Nécessite vérification SMS ensuite

---

## 📊 Tableau de Correspondance des Champs

| Méthode Ancienne (`/auth/register`) | Nouvelle Méthode (`/auth/registration/request-verification`) |
|--------------------------------------|--------------------------------------------------------------|
| `numero` | `telephone` |
| `activite` | `centre_interet` |
| `password_confirmation` (requis) | ❌ Pas nécessaire |
| ❌ N'existe pas | `userType` (requis: "user" ou "societe") |

---

## 🔧 Fichiers Modifiés

Les modifications ont été appliquées dans ces fichiers :

1. **[src/common/validators/phone-number.validator.ts](src/common/validators/phone-number.validator.ts)** *(nouveau)*
   - Regex pour valider les numéros d'Afrique de l'Ouest
   - Configuration des pays supportés
   - Fonctions de formatage

2. **[src/modules/users/dto/create-user.dto.ts](src/modules/users/dto/create-user.dto.ts:28)**
   - Validation pour `/auth/register` (utilisateurs)

3. **[src/modules/societes/dto/create-societe.dto.ts](src/modules/societes/dto/create-societe.dto.ts:22)**
   - Validation pour `/auth/societe/register` (sociétés)

4. **[src/modules/auth/dto/request-registration-otp.dto.ts](src/modules/auth/dto/request-registration-otp.dto.ts:9)**
   - Validation pour `/auth/registration/request-verification`

5. **[src/modules/auth/dto/request-otp.dto.ts](src/modules/auth/dto/request-otp.dto.ts:8)**
   - Validation pour reset de mot de passe

6. **[src/modules/auth/services/sms.service.ts](src/modules/auth/services/sms.service.ts:81)**
   - Formatage des numéros internationaux

---

## ✅ Exemples de Tests

### Test avec numéro burkinabé (votre cas)
```bash
./test-numero-burkina.sh
```

### Test avec numéro ivoirien
```bash
curl -X POST http://localhost:3000/auth/register \
  -d '{
    "nom": "KOUAME",
    "prenom": "Yao",
    "email": "yao@example.com",
    "numero": "00225XXXXXXXXXX",
    "activite": "Commerce",
    "date_naissance": "1995-01-01",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'
```

### Test avec numéro sénégalais
```bash
curl -X POST http://localhost:3000/auth/register \
  -d '{
    "nom": "DIOP",
    "prenom": "Amadou",
    "email": "amadou@example.com",
    "numero": "+2217012345678",
    "activite": "Finance",
    "date_naissance": "1992-03-15",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'
```

---

## ⚠️ Messages d'Erreur

Si le numéro n'est **pas valide**, vous recevrez :

```json
{
  "status": false,
  "message": [
    "Le numéro de téléphone doit être un numéro valide d'Afrique de l'Ouest (Burkina Faso, Côte d'Ivoire, Mali, Sénégal, Togo, Bénin, Niger, Guinée)"
  ]
}
```

**Causes possibles** :
- ❌ Indicatif pays incorrect (ex: +33 pour France)
- ❌ Nombre de chiffres incorrect
- ❌ Format invalide

---

## 🎯 Votre Cas Spécifique

### Données que vous vouliez utiliser :
```json
{
  "nom": "SANOU",
  "prenom": "Junior",
  "email": "Junior1@gmail.com",
  "numero": "0022608090809",
  "activite": "Informaticien",
  "date_naissance": "1999-06-09",
  "password": "Junior12345",
  "password_confirmation": "Junior12345"
}
```

### ✅ Maintenant ça fonctionne !

```bash
curl -X POST http://localhost:3000/auth/register \
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
```

**Résultat** : ✅ Compte créé avec succès + Token JWT reçu immédiatement !

---

## 📱 Support Twilio SMS

⚠️ **Note importante sur Twilio** :

Twilio peut ne **pas supporter** certains pays d'Afrique de l'Ouest pour l'envoi de SMS.

**Solutions** :
1. **Mode Développement** (par défaut)
   - Les codes OTP s'affichent dans les logs du serveur
   - Aucun SMS réel envoyé
   - Parfait pour le développement

2. **Utiliser un service SMS local**
   - Intégrer un service SMS africain (ex: Africa's Talking, Hubtel, etc.)
   - Plus fiable pour l'Afrique de l'Ouest

3. **Vérifier la couverture Twilio**
   - Consulter : https://www.twilio.com/console/sms/whatsapp/sandbox
   - Vérifier si votre pays est supporté

---

## 🎉 Résumé

✅ **Modifications appliquées avec succès !**
- ✅ Support de 8 pays d'Afrique de l'Ouest
- ✅ Validation correcte des numéros
- ✅ Formats multiples acceptés (00XXX, +XXX, XXX)
- ✅ Testé avec succès avec un numéro burkinabé
- ✅ Fonctionne avec les deux méthodes d'inscription

**Vous pouvez maintenant utiliser votre application avec des numéros burkinabés et d'autres pays d'Afrique de l'Ouest ! 🎊**
