# 🔥 Guide Complet : Firebase Authentication pour l'Afrique

## 🎯 Pourquoi Firebase Authentication ?

- ✅ **Support parfait** de tous les pays africains (Burkina Faso, Mali, Côte d'Ivoire, etc.)
- ✅ **Gratuit** jusqu'à 10,000 vérifications/mois
- ✅ **Intégration native** avec Flutter
- ✅ **Pas de gestion manuelle** des codes OTP
- ✅ **Fiable** et **scalable**

---

## 📋 Partie 1 : Configuration Firebase (Console)

### Étape 1 : Créer un Projet Firebase

1. Allez sur https://console.firebase.google.com
2. Cliquez sur **"Ajouter un projet"**
3. Nom du projet : `titingre` (ou votre choix)
4. Activez Google Analytics (optionnel)
5. Cliquez sur **"Créer le projet"**

### Étape 2 : Activer Authentication Phone

1. Dans la console Firebase, allez dans **Authentication**
2. Cliquez sur **"Commencer"**
3. Allez dans l'onglet **"Sign-in method"**
4. Activez **"Téléphone"**
5. Cliquez sur **"Enregistrer"**

### Étape 3 : Ajouter votre App Flutter

#### Pour Android :

1. Cliquez sur l'icône **Android**
2. **Nom du package** : `com.titingre.app` (ou votre package)
3. Téléchargez le fichier `google-services.json`
4. Placez-le dans `android/app/google-services.json`

#### Pour iOS :

1. Cliquez sur l'icône **iOS**
2. **Bundle ID** : `com.titingre.app`
3. Téléchargez le fichier `GoogleService-Info.plist`
4. Placez-le dans `ios/Runner/GoogleService-Info.plist`

### Étape 4 : Générer la Clé Privée (Pour Backend NestJS)

1. Dans la console Firebase, allez dans **⚙️ Paramètres du projet**
2. Allez dans **"Comptes de service"**
3. Cliquez sur **"Générer une nouvelle clé privée"**
4. Un fichier JSON sera téléchargé : `titingre-firebase-adminsdk-xxxxx.json`
5. **Placez ce fichier** dans votre backend : `backend/firebase-service-account.json`
6. ⚠️ **IMPORTANT** : Ajoutez ce fichier à `.gitignore` !

---

## 📱 Partie 2 : Installation Flutter

### Étape 1 : Ajouter les Dépendances

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # Firebase
  firebase_core: ^2.24.2
  firebase_auth: ^4.16.0
```

### Étape 2 : Configuration Android

```gradle
// android/build.gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'  // Ajoutez cette ligne
    }
}
```

```gradle
// android/app/build.gradle
apply plugin: 'com.google.gms.google-services'  // Ajoutez à la fin du fichier
```

### Étape 3 : Initialiser Firebase dans Flutter

```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}
```

### Étape 4 : Générer firebase_options.dart

```bash
# Installer FlutterFire CLI
dart pub global activate flutterfire_cli

# Générer la configuration
flutterfire configure
```

---

## 🚀 Partie 3 : Code Flutter (Inscription avec OTP)

### Service d'Authentication Firebase

```dart
// lib/services/firebase_auth_service.dart
import 'package:firebase_auth/firebase_auth.dart';

class FirebaseAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  String? _verificationId;

  /// Étape 1 : Envoyer le code OTP au numéro
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String) onCodeSent,
    required Function(String) onError,
    required Function(PhoneAuthCredential) onAutoVerify,
  }) async {
    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber, // Format: +22608090809
        timeout: const Duration(seconds: 60),

        // Vérification automatique (si possible)
        verificationCompleted: (PhoneAuthCredential credential) async {
          print('✅ Vérification automatique réussie');
          onAutoVerify(credential);
        },

        // Échec de vérification
        verificationFailed: (FirebaseAuthException e) {
          print('❌ Erreur de vérification: ${e.message}');
          onError(e.message ?? 'Erreur de vérification');
        },

        // Code envoyé avec succès
        codeSent: (String verificationId, int? resendToken) {
          print('📱 Code OTP envoyé');
          _verificationId = verificationId;
          onCodeSent('Code OTP envoyé avec succès');
        },

        // Timeout de vérification automatique
        codeAutoRetrievalTimeout: (String verificationId) {
          _verificationId = verificationId;
        },
      );
    } catch (e) {
      onError(e.toString());
    }
  }

  /// Étape 2 : Vérifier le code OTP entré par l'utilisateur
  Future<User?> verifyOTP(String smsCode) async {
    try {
      if (_verificationId == null) {
        throw Exception('Aucun code de vérification disponible');
      }

      // Créer les credentials avec le code
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: smsCode,
      );

      // Se connecter avec les credentials
      UserCredential userCredential = await _auth.signInWithCredential(credential);

      return userCredential.user;
    } catch (e) {
      print('❌ Erreur de vérification OTP: $e');
      rethrow;
    }
  }

  /// Obtenir le token Firebase ID pour le backend
  Future<String?> getIdToken() async {
    User? user = _auth.currentUser;
    if (user != null) {
      return await user.getIdToken();
    }
    return null;
  }

  /// Se déconnecter
  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Utilisateur actuel
  User? get currentUser => _auth.currentUser;
}
```

### Page d'Inscription Flutter

```dart
// lib/screens/registration_screen.dart
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/firebase_auth_service.dart';
import '../services/api_service.dart';

class RegistrationScreen extends StatefulWidget {
  @override
  _RegistrationScreenState createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final FirebaseAuthService _firebaseAuth = FirebaseAuthService();
  final ApiService _apiService = ApiService();

  final TextEditingController _nomController = TextEditingController();
  final TextEditingController _prenomController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _numeroController = TextEditingController();
  final TextEditingController _activiteController = TextEditingController();
  final TextEditingController _dateNaissanceController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();

  bool _codeSent = false;
  bool _loading = false;

  /// Étape 1 : Envoyer le code OTP
  Future<void> _sendOTP() async {
    setState(() => _loading = true);

    String phoneNumber = _numeroController.text.trim();

    // Formater le numéro au format international
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('00')) {
        phoneNumber = '+' + phoneNumber.substring(2);
      } else {
        phoneNumber = '+226' + phoneNumber; // Par défaut Burkina Faso
      }
    }

    await _firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      onCodeSent: (message) {
        setState(() {
          _codeSent = true;
          _loading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(message)),
        );
      },
      onError: (error) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $error')),
        );
      },
      onAutoVerify: (credential) async {
        // Vérification automatique réussie
        await _completeRegistration(credential);
      },
    );
  }

  /// Étape 2 : Vérifier le code OTP et créer le compte
  Future<void> _verifyOTPAndRegister() async {
    setState(() => _loading = true);

    try {
      // Vérifier l'OTP avec Firebase
      User? firebaseUser = await _firebaseAuth.verifyOTP(_otpController.text);

      if (firebaseUser != null) {
        // Obtenir le token Firebase
        String? idToken = await firebaseUser.getIdToken();

        // Envoyer les données au backend NestJS
        await _apiService.registerWithFirebase(
          nom: _nomController.text,
          prenom: _prenomController.text,
          email: _emailController.text,
          numero: _numeroController.text,
          activite: _activiteController.text,
          dateNaissance: _dateNaissanceController.text,
          password: _passwordController.text,
          firebaseIdToken: idToken!,
        );

        // Succès !
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('✅ Inscription réussie !')),
        );

        // Naviguer vers l'écran principal
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Inscription')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            children: [
              TextField(
                controller: _nomController,
                decoration: InputDecoration(labelText: 'Nom'),
              ),
              TextField(
                controller: _prenomController,
                decoration: InputDecoration(labelText: 'Prénom'),
              ),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
              ),
              TextField(
                controller: _numeroController,
                decoration: InputDecoration(labelText: 'Numéro (ex: 0022608090809)'),
                keyboardType: TextInputType.phone,
                enabled: !_codeSent, // Désactiver après envoi
              ),
              TextField(
                controller: _activiteController,
                decoration: InputDecoration(labelText: 'Activité'),
              ),
              TextField(
                controller: _dateNaissanceController,
                decoration: InputDecoration(labelText: 'Date de naissance (YYYY-MM-DD)'),
              ),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(labelText: 'Mot de passe'),
                obscureText: true,
              ),
              SizedBox(height: 20),

              // Bouton pour envoyer l'OTP
              if (!_codeSent)
                ElevatedButton(
                  onPressed: _loading ? null : _sendOTP,
                  child: _loading
                      ? CircularProgressIndicator()
                      : Text('Envoyer le code OTP'),
                ),

              // Champ OTP et bouton de vérification
              if (_codeSent) ...[
                TextField(
                  controller: _otpController,
                  decoration: InputDecoration(labelText: 'Code OTP (6 chiffres)'),
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                ),
                ElevatedButton(
                  onPressed: _loading ? null : _verifyOTPAndRegister,
                  child: _loading
                      ? CircularProgressIndicator()
                      : Text('Vérifier et S\'inscrire'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 🔧 Partie 4 : Backend NestJS

### Installation

```bash
npm install firebase-admin
```

### Configuration .env

```env
# Option 1 : Chemin vers le fichier de service account
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Option 2 : Variables d'environnement (alternative)
# FIREBASE_PROJECT_ID=votre-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk@votre-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Ajouter le Service au Module

Modifiez `auth.module.ts` :

```typescript
import { FirebaseAuthService } from './services/firebase-auth.service';

@Module({
  // ...
  providers: [
    AuthService,
    FirebaseAuthService, // Ajoutez ici
    // ...
  ],
  exports: [AuthService, FirebaseAuthService],
})
export class AuthModule {}
```

---

## ✅ Partie 5 : Test Complet

### Test depuis Flutter

```bash
flutter run
```

1. Remplissez le formulaire d'inscription
2. Cliquez sur "Envoyer le code OTP"
3. **Recevez le SMS** (réel !) avec le code à 6 chiffres
4. Entrez le code
5. Cliquez sur "Vérifier et S'inscrire"
6. ✅ Compte créé et vérifié !

---

## 🌍 Pays Supportés (Afrique de l'Ouest)

Firebase supporte **tous** ces pays :

- 🇧🇫 Burkina Faso (+226) ✅
- 🇨🇮 Côte d'Ivoire (+225) ✅
- 🇲🇱 Mali (+223) ✅
- 🇸🇳 Sénégal (+221) ✅
- 🇹🇬 Togo (+228) ✅
- 🇧🇯 Bénin (+229) ✅
- 🇳🇪 Niger (+227) ✅
- 🇬🇳 Guinée (+224) ✅

---

## 💰 Tarification Firebase

### Gratuit (Spark Plan)
- **10,000 vérifications/mois** GRATUITES
- Parfait pour commencer

### Payant (Blaze Plan - Pay as you go)
- **$0.01 par vérification** après les 10,000 gratuites
- Très abordable !

---

## 🎯 Résumé

1. ✅ **Firebase gère** l'envoi du SMS et la génération du code OTP
2. ✅ **Flutter** vérifie le numéro avec Firebase
3. ✅ **NestJS** vérifie le token Firebase et crée le compte
4. ✅ **Pas de Twilio** nécessaire !
5. ✅ **Support parfait** de l'Afrique

**C'est la solution idéale pour votre application ! 🚀**
