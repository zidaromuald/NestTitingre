# Guide d'Authentification - Application Titingre

## 📋 Vue d'Ensemble

L'application utilise **Firebase Authentication** (côté client) pour :

1. ✅ **Inscription** avec vérification de téléphone par SMS
2. ✅ **Récupération de mot de passe** par SMS OTP

Tout est géré par Firebase côté client. Le backend vérifie uniquement les tokens Firebase.

---

## 🔐 Inscription avec Firebase Authentication

### Comment ça fonctionne

L'inscription utilise **Firebase Phone Authentication côté client** (Flutter, React, etc.). Le backend **vérifie le token** Firebase après que le client ait validé le téléphone.

### Flux d'inscription

```
┌─────────┐         ┌──────────────┐         ┌─────────────┐         ┌──────────┐
│ Client  │────────>│   Firebase   │────────>│  Vérif SMS  │────────>│  Client  │
│         │  1. Tel │ Auth (client)│ 2. Send │             │ 3. Code │          │
└─────────┘         └──────────────┘   SMS   └─────────────┘         └─────────┘
     │                                                                       │
     │ 4. Reçoit token Firebase                                            │
     └───────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 5. POST /auth/register-firebase
                                        ▼
                                  ┌──────────┐
                                  │ Backend  │
                                  │ Vérifie  │
                                  │  Token   │
                                  │ + Créer  │
                                  │ Compte   │
                                  └──────────┘
```

### Endpoint: `POST /auth/register-firebase`

**Requête:**
```json
{
  "firebaseIdToken": "eyJhbGciOiJSUzI1NiIsImtp...",
  "nom": "Dupont",
  "prenom": "Jean",
  "numero": "+33612345678",
  "email": "jean.dupont@example.com",
  "activite": "Développeur",
  "date_naissance": "1990-01-01",
  "password": "motdepasse123",
  "password_confirmation": "motdepasse123"
}
```

**Réponse:**
```json
{
  "status": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com",
      "numero": "+33612345678",
      "is_phone_verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "user_type": "user"
  }
}
```

### Configuration Firebase côté Client

#### Flutter

```dart
import 'package:firebase_auth/firebase_auth.dart';

Future<void> registerWithPhoneNumber(String phoneNumber) async {
  final FirebaseAuth auth = FirebaseAuth.instance;

  // Étape 1: Envoyer le SMS
  await auth.verifyPhoneNumber(
    phoneNumber: phoneNumber,
    verificationCompleted: (PhoneAuthCredential credential) async {
      // Auto-vérification (sur Android uniquement)
      await auth.signInWithCredential(credential);
    },
    verificationFailed: (FirebaseAuthException e) {
      print('Erreur: ${e.message}');
    },
    codeSent: (String verificationId, int? resendToken) {
      // Afficher l'écran de saisie du code OTP
      showOTPDialog(verificationId);
    },
    codeAutoRetrievalTimeout: (String verificationId) {},
  );
}

// Étape 2: Vérifier le code OTP
Future<void> verifyOTP(String verificationId, String otpCode) async {
  final FirebaseAuth auth = FirebaseAuth.instance;

  final PhoneAuthCredential credential = PhoneAuthProvider.credential(
    verificationId: verificationId,
    smsCode: otpCode,
  );

  final UserCredential userCredential = await auth.signInWithCredential(credential);

  // Étape 3: Récupérer le token Firebase
  final String? idToken = await userCredential.user?.getIdToken();

  // Étape 4: Envoyer au backend
  await registerOnBackend(idToken!, phoneNumber, /* autres données */);
}

// Étape 4: Appeler le backend
Future<void> registerOnBackend(String firebaseIdToken, String phoneNumber, ...) async {
  final response = await http.post(
    Uri.parse('https://your-api.com/auth/register-firebase'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'firebaseIdToken': firebaseIdToken,
      'numero': phoneNumber,
      'nom': 'Dupont',
      'prenom': 'Jean',
      // ... autres champs
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final jwtToken = data['data']['token'];
    // Sauvegarder le JWT pour les futures requêtes
    await saveToken(jwtToken);
  }
}
```

#### React / JavaScript

```javascript
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

const auth = getAuth();

// Étape 1: Configurer reCAPTCHA (obligatoire pour le web)
window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
  'size': 'invisible'
}, auth);

// Étape 2: Envoyer le SMS
const phoneNumber = '+33612345678';
const appVerifier = window.recaptchaVerifier;

signInWithPhoneNumber(auth, phoneNumber, appVerifier)
  .then((confirmationResult) => {
    // SMS envoyé, demander le code à l'utilisateur
    const verificationCode = window.prompt('Entrez le code reçu par SMS');

    // Étape 3: Vérifier le code
    return confirmationResult.confirm(verificationCode);
  })
  .then(async (result) => {
    // Étape 4: Récupérer le token Firebase
    const idToken = await result.user.getIdToken();

    // Étape 5: Envoyer au backend
    const response = await fetch('https://your-api.com/auth/register-firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseIdToken: idToken,
        numero: phoneNumber,
        nom: 'Dupont',
        prenom: 'Jean',
        // ... autres champs
      })
    });

    const data = await response.json();
    const jwtToken = data.data.token;
    localStorage.setItem('jwt_token', jwtToken);
  })
  .catch((error) => {
    console.error('Erreur:', error);
  });
```

---

## 🔓 Récupération de Mot de Passe avec Firebase Authentication

### Comment ça fonctionne

La récupération de mot de passe utilise **exactement le même système que l'inscription** : Firebase Phone Authentication côté client.

### Flux de récupération

```
┌─────────────┐
│   Client    │
│  (Flutter)  │
└──────┬──────┘
       │
       │ 1. Utilisateur oublie son mot de passe
       │    Saisit son numéro de téléphone
       │
       ▼
┌──────────────────────┐
│ Firebase.auth()      │
│ .signInWithPhone()   │
└──────┬───────────────┘
       │
       │ 2. Firebase envoie SMS OTP automatiquement
       │
       ▼
┌─────────────────────┐
│  📱 Utilisateur     │
│  reçoit SMS avec    │
│  code 123456        │
└──────┬──────────────┘
       │
       │ 3. Utilisateur entre le code OTP
       │
       ▼
┌──────────────────────┐
│ Firebase vérifie OTP │
│ et retourne token    │
└──────┬───────────────┘
       │
       │ 4. Client envoie au backend:
       │    {firebaseIdToken, newPassword}
       │
       ▼
┌─────────────────────────────────┐
│ Backend:                        │
│ POST /auth/password-reset       │
│ 1. Vérifie token Firebase       │
│ 2. Extrait numéro du token      │
│ 3. Trouve User/Societe          │
│ 4. Update password              │
└─────────────────────────────────┘
```

### Endpoint

**`POST /auth/password-reset`**

**Requête:**
```json
{
  "firebaseIdToken": "eyJhbGciOiJSUzI1NiIsImtp...",
  "newPassword": "nouveauMotDePasse123"
}
```

**Réponse:**
```json
{
  "message": "Votre mot de passe a été réinitialisé avec succès"
}
```

### Code Exemple - Récupération de mot de passe

#### Flutter

```dart
// 1. Demander reset password avec numéro de téléphone
Future<void> requestPasswordReset(String phoneNumber) async {
  final FirebaseAuth auth = FirebaseAuth.instance;

  await auth.verifyPhoneNumber(
    phoneNumber: phoneNumber,
    verificationCompleted: (PhoneAuthCredential credential) async {
      await auth.signInWithCredential(credential);
      final idToken = await auth.currentUser?.getIdToken();

      // Afficher écran pour saisir nouveau mot de passe
      showNewPasswordDialog(idToken!);
    },
    verificationFailed: (FirebaseAuthException e) {
      print('Erreur: ${e.message}');
    },
    codeSent: (String verificationId, int? resendToken) {
      // Afficher écran de saisie OTP
      showOTPDialogForPasswordReset(verificationId);
    },
    codeAutoRetrievalTimeout: (String verificationId) {},
  );
}

// 2. Vérifier l'OTP et demander nouveau mot de passe
Future<void> verifyOTPAndShowPasswordDialog(
  String verificationId,
  String otpCode,
) async {
  final FirebaseAuth auth = FirebaseAuth.instance;

  final PhoneAuthCredential credential = PhoneAuthProvider.credential(
    verificationId: verificationId,
    smsCode: otpCode,
  );

  final UserCredential userCredential =
    await auth.signInWithCredential(credential);

  final String? idToken = await userCredential.user?.getIdToken();

  // Afficher dialogue pour nouveau mot de passe
  showNewPasswordDialog(idToken!);
}

// 3. Soumettre le nouveau mot de passe au backend
Future<void> submitNewPassword(
  String firebaseIdToken,
  String newPassword,
) async {
  final response = await http.post(
    Uri.parse('https://your-api.com/auth/password-reset'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'firebaseIdToken': firebaseIdToken,
      'newPassword': newPassword,
    }),
  );

  if (response.statusCode == 200) {
    print('✅ Mot de passe réinitialisé avec succès!');
    // Rediriger vers page de connexion
    Navigator.pushReplacementNamed(context, '/login');
  } else {
    print('❌ Erreur lors de la réinitialisation');
  }
}
```

#### React / JavaScript

```javascript
// 1. Demander reset password
const requestPasswordReset = async (phoneNumber) => {
  const auth = getAuth();
  const appVerifier = window.recaptchaVerifier;

  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );

    // Demander le code OTP à l'utilisateur
    const verificationCode = window.prompt('Entrez le code OTP reçu par SMS');

    // Vérifier le code
    const result = await confirmationResult.confirm(verificationCode);

    // Récupérer le token Firebase
    const idToken = await result.user.getIdToken();

    // Demander le nouveau mot de passe
    const newPassword = window.prompt('Entrez votre nouveau mot de passe');

    // Soumettre au backend
    await submitNewPassword(idToken, newPassword);
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// 2. Soumettre le nouveau mot de passe
const submitNewPassword = async (firebaseIdToken, newPassword) => {
  const response = await fetch('https://your-api.com/auth/password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firebaseIdToken,
      newPassword,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    alert('✅ Mot de passe réinitialisé avec succès!');
    window.location.href = '/login';
  } else {
    alert('❌ Erreur: ' + data.message);
  }
};
```

---

## 🛠️ Configuration Backend

### Variables d'Environnement

```env
# Firebase (pour vérification des tokens)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OU utiliser un fichier JSON
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

---

## 🔒 Sécurité

### Firebase Token Verification

Le backend vérifie que:
1. Le token Firebase est valide et non expiré
2. Le numéro de téléphone dans le token existe dans la base de données
3. Le token provient bien de votre projet Firebase

**Note:** Aucune table de base de données n'est nécessaire pour les OTP car Firebase gère tout côté client.

---

## ✅ Checklist d'Intégration

### Frontend (Flutter/React)

- [ ] Installer Firebase SDK
- [ ] Configurer Firebase project
- [ ] Implémenter Phone Authentication pour inscription
- [ ] Implémenter Phone Authentication pour reset password
- [ ] Récupérer le Firebase ID Token
- [ ] Appeler `/auth/register-firebase` pour inscription
- [ ] Appeler `/auth/password-reset` pour reset password

### Backend

- [x] Service Firebase Auth configuré
- [x] Endpoint `/auth/register-firebase` fonctionnel
- [x] Endpoint `/auth/password-reset` fonctionnel
- [x] Service Password Reset avec Firebase créé
- [x] Aucune table nécessaire (Firebase gère les OTP)

---

## 🚀 Prochaines Étapes

1. **Configurer Firebase** dans votre app cliente (Flutter/React)
2. **Tester l'inscription** avec Firebase Phone Auth
3. **Tester la récupération de mot de passe** avec Firebase Phone Auth
4. **Déployer en production** (Firebase gère automatiquement l'envoi des SMS)

---

## 📞 Support

Pour toute question:
- Documentation Firebase: https://firebase.google.com/docs/auth/web/phone-auth
- Documentation NestJS: https://docs.nestjs.com/
