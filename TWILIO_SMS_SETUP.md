# 📱 Configuration Twilio SMS - Guide Complet

## 🎯 Vue d'ensemble

Ce guide vous explique comment configurer **Twilio** pour envoyer des SMS OTP réels pour:
- ✅ Vérification du numéro à l'inscription
- ✅ Récupération de mot de passe

---

## 📋 Étape 1: Créer un compte Twilio

### **1.1 Inscription**

1. Allez sur [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Cliquez sur "**Start for free**" (Essai gratuit)
3. Remplissez le formulaire:
   - First name / Last name
   - Email
   - Password
4. Vérifiez votre email
5. Vérifiez votre numéro de téléphone (ils enverront un code)

### **1.2 Crédit gratuit**

Twilio offre **$15.00 USD de crédit gratuit** pour tester!
- ~0.0075 USD par SMS en France
- Soit environ **2000 SMS gratuits** pour vos tests 🎉

---

## 🔑 Étape 2: Obtenir vos credentials Twilio

### **2.1 Account SID et Auth Token**

1. Connectez-vous à [https://console.twilio.com](https://console.twilio.com)
2. Sur le **Dashboard**, vous verrez:
   ```
   Account Info
   ├── Account SID:     ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   └── Auth Token:      [Show] ← Cliquez pour afficher
   ```
3. Copiez ces deux valeurs ⚠️  **GARDEZ-LES SECRÈTES!**

### **2.2 Obtenir un numéro de téléphone Twilio**

1. Dans le menu de gauche: **Phone Numbers** → **Manage** → **Buy a number**
2. Choisissez:
   - **Country**: France (+33) ou votre pays
   - **Capabilities**: Cochez "SMS"
3. Cliquez sur "**Search**"
4. Choisissez un numéro et cliquez "**Buy**"
5. Confirmez l'achat (utilise votre crédit gratuit)
6. Copiez votre numéro au format: `+33XXXXXXXXX`

---

## ⚙️ Étape 3: Configuration du Backend NestJS

### **3.1 Installer le package Twilio**

```bash
npm install twilio
```

### **3.2 Ajouter les variables d'environnement**

Ouvrez votre fichier `.env` et ajoutez:

```env
# Configuration Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+33123456789

# ⚠️ IMPORTANT:
# - Remplacez par vos vraies valeurs
# - Le numéro doit inclure le code pays (+33 pour France)
# - NE PARTAGEZ JAMAIS ces credentials sur GitHub!
```

### **3.3 Ajouter .env au .gitignore**

Vérifiez que `.env` est dans `.gitignore`:

```gitignore
# Fichier .gitignore
.env
.env.local
.env.production
```

---

## 🔧 Étape 4: Configuration de votre environnement

### **4.1 Mode Développement (Sans Twilio)**

Si Twilio n'est PAS configuré, le système affiche les codes OTP dans les logs:

```bash
npm run start:dev
```

Vous verrez dans la console:
```
===========================================
📱 SMS ENVOYÉ À: +33612345678
🔐 CODE OTP: 123456
📝 Type: Inscription
⏰ Valide pendant 10 minutes
===========================================
```

### **4.2 Mode Production (Avec Twilio)**

Une fois Twilio configuré dans `.env`:

```bash
npm run start:prod
```

Vous verrez:
```
✅ Twilio SMS configuré et activé
📱 SMS Twilio envoyé au +33612***78
```

Les SMS seront envoyés RÉELLEMENT! 📱

---

## 🧪 Étape 5: Tester l'envoi de SMS

### **5.1 Test avec numéro vérifié (Compte gratuit)**

⚠️  **Limitation compte gratuit Twilio:**
- Vous pouvez SEULEMENT envoyer des SMS aux numéros que vous avez **vérifiés**
- Pour vérifier un numéro: Console Twilio → Phone Numbers → Verified Caller IDs

### **5.2 Vérifier un numéro de test**

1. Allez sur: [https://console.twilio.com/us1/develop/phone-numbers/manage/verified](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
2. Cliquez "**Add a new Caller ID**"
3. Entrez votre numéro de téléphone (celui qui recevra les SMS de test)
4. Twilio vous enverra un code → Entrez-le
5. Votre numéro est maintenant vérifié! ✅

### **5.3 Test d'inscription**

```bash
# Exemple de requête pour tester
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "email": "test@example.com",
    "password": "Password123!",
    "telephone": "0612345678",
    "date_naissance": "1990-01-01"
  }'
```

Vous devriez recevoir un SMS avec le code OTP! 📱

---

## 💰 Étape 6: Passer en compte payant (Optionnel)

### **6.1 Pourquoi passer en compte payant?**

Compte gratuit (Trial):
- ❌ SMS uniquement vers numéros vérifiés
- ❌ Message préfixé par "Sent from your Twilio trial account"
- ✅ $15 de crédit gratuit

Compte payant:
- ✅ SMS vers N'IMPORTE QUEL numéro
- ✅ Pas de message "trial account"
- ✅ Tarifs très bas (~0.0075€/SMS)

### **6.2 Activer le compte payant**

1. Console Twilio → **Account** → **Upgrade**
2. Ajoutez une carte de crédit
3. Approvisionnez votre compte (minimum 20€ recommandé)
4. C'est tout! Pas de frais mensuels, vous payez SEULEMENT les SMS envoyés

---

## 📊 Tarification Twilio (France)

| Service | Prix |
|---------|------|
| SMS vers France (mobile) | ~0.0075 EUR |
| SMS vers France (fixe) | Non supporté |
| Numéro de téléphone/mois | ~1.00 EUR |

**Exemple de coût:**
- 1000 utilisateurs s'inscrivent = 1000 SMS
- Coût = 1000 × 0.0075 = **7.50 EUR** 💰

---

## 🔒 Sécurité & Bonnes Pratiques

### **7.1 Protéger vos credentials**

✅ **À FAIRE:**
- Stocker credentials dans `.env`
- Ajouter `.env` au `.gitignore`
- Utiliser des variables d'environnement en production
- Régénérer Auth Token si compromis

❌ **À NE PAS FAIRE:**
- Commit credentials dans Git
- Partager Auth Token
- Hardcoder credentials dans le code

### **7.2 Rate Limiting**

Implémentez un rate limiting pour éviter l'abus:

```typescript
// Exemple: Max 3 SMS par numéro toutes les 10 minutes
const otpsLast10Min = await otpRepository.count({
  where: {
    telephone,
    created_at: MoreThan(new Date(Date.now() - 10 * 60 * 1000)),
  },
});

if (otpsLast10Min >= 3) {
  throw new BadRequestException('Trop de tentatives. Réessayez dans 10 minutes.');
}
```

### **7.3 Surveiller les coûts**

1. Console Twilio → **Monitor** → **Logs** → **Messaging**
2. Vérifiez combien de SMS sont envoyés
3. Configurez des alertes de budget

---

## 🌍 Alternatives à Twilio

Si Twilio ne convient pas, voici des alternatives:

| Service | Prix SMS France | Avantages |
|---------|----------------|-----------|
| **Twilio** | 0.0075€ | ✅ Le plus populaire, documentation excellente |
| **MessageBird** | 0.0065€ | ✅ Moins cher |
| **Nexmo (Vonage)** | 0.0073€ | ✅ Bonne API |
| **OVH SMS** | 0.04€ | ✅ Français, support FR |
| **Orange SMS API** | Variable | ✅ Opérateur français |

---

## ✅ Checklist de configuration

- [ ] Compte Twilio créé
- [ ] $15 de crédit gratuit disponible
- [ ] Account SID copié
- [ ] Auth Token copié
- [ ] Numéro Twilio acheté
- [ ] Package `twilio` installé
- [ ] Variables dans `.env` ajoutées
- [ ] `.env` dans `.gitignore`
- [ ] Numéro de test vérifié
- [ ] Test d'envoi SMS réussi 📱

---

## 🆘 Dépannage

### Erreur: "Unable to create record"

**Cause:** Compte gratuit essayant d'envoyer à un numéro non vérifié

**Solution:** Vérifiez le numéro dans Console Twilio → Verified Caller IDs

### Erreur: "Invalid phone number"

**Cause:** Format de numéro incorrect

**Solution:**
- Utilisez le format international: `+33612345678`
- Pas d'espaces ni de tirets
- Le service `formatPhoneNumber()` convertit automatiquement `0612345678` → `+33612345678`

### SMS non reçu

**Vérifiez:**
1. Le numéro est au bon format (`+33...`)
2. Le numéro est vérifié (compte gratuit)
3. Vous avez du crédit Twilio
4. Logs Twilio → Messaging → Vérifier le statut

---

## 📚 Ressources

- [Twilio Console](https://console.twilio.com)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [Twilio Pricing](https://www.twilio.com/sms/pricing/fr)

---

## 🎉 Voilà!

Votre système SMS OTP avec Twilio est maintenant configuré!

En développement: Les codes s'affichent dans les logs 🔍
En production: Les SMS sont envoyés réellement 📱

Bon développement! 🚀
