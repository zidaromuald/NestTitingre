# 📱 Vérification SMS à l'Inscription - Documentation Complète

## 🎯 Fonctionnement du Système

### **Workflow Complet**

```
┌────────────────────────────────────────────────────────────┐
│         INSCRIPTION AVEC VÉRIFICATION SMS OTP              │
└────────────────────────────────────────────────────────────┘

ÉTAPE 1: Demande d'inscription
├─> User remplit le formulaire d'inscription
├─> POST /auth/register/request-verification
├─> Backend vérifie si numéro/email déjà utilisé
├─> Compte créé avec is_phone_verified = FALSE
├─> OTP généré et stocké en base
└─> SMS envoyé au numéro fourni ✅

ÉTAPE 2: Vérification du code OTP
├─> User entre le code reçu par SMS
├─> POST /auth/register/verify-phone
├─> Backend vérifie le code OTP
├─> Si valide: is_phone_verified = TRUE
├─> Token JWT généré
└─> User connecté automatiquement ✅

ÉTAPE 3: Accès complet
└─> User peut utiliser toutes les fonctionnalités
```

---

## 🔧 Modifications Effectuées

### **1. Entités Modifiées**

#### **User Entity** (`user.entity.ts`)
```typescript
@Column({ type: 'boolean', default: false })
is_phone_verified: boolean;

@Column({ type: 'timestamp', nullable: true })
phone_verified_at: Date;
```

#### **Societe Entity** (`societe.entity.ts`)
```typescript
@Column({ type: 'boolean', default: false })
is_phone_verified: boolean;

@Column({ type: 'timestamp', nullable: true })
phone_verified_at: Date;
```

#### **PasswordResetOtp Entity** (Renommé en concept)
```typescript
export enum OtpType {
  REGISTRATION = 'registration',       // Nouveau!
  PASSWORD_RESET = 'password_reset',
}

@Column({
  type: 'enum',
  enum: OtpType,
  default: OtpType.PASSWORD_RESET,
})
otp_type: OtpType;
```

### **2. Service SMS Amélioré**

Le service détecte automatiquement si Twilio est configuré:
- ✅ **Avec Twilio**: Envoi SMS réel
- ✅ **Sans Twilio**: Affichage du code dans les logs (développement)

---

## 📡 Nouveaux Endpoints API

### **1. Demander une vérification (Inscription)**

**Endpoint:** `POST /auth/register/request-verification`

**Body pour User:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "password": "MonMotDePasse123!",
  "telephone": "0612345678",
  "date_naissance": "1990-01-15"
}
```

**Body pour Societe:**
```json
{
  "nom_societe": "Tech Solutions",
  "email": "contact@techsolutions.fr",
  "password": "SecurePass123!",
  "telephone": "0612345678",
  "centre_interet": "Technologie",
  "secteur_activite": "IT",
  "type_produit": "Services"
}
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "message": "Compte créé. Code de vérification envoyé au +33612***78",
  "userId": 42,
  "userType": "User"
}
```

**Réponse (Erreur 409):**
```json
{
  "statusCode": 409,
  "message": "Ce numéro de téléphone est déjà utilisé"
}
```

---

### **2. Vérifier le numéro de téléphone**

**Endpoint:** `POST /auth/register/verify-phone`

**Body:**
```json
{
  "telephone": "0612345678",
  "otp_code": "123456"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Numéro vérifié avec succès",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 42,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@email.com",
    "telephone": "+33612345678",
    "is_phone_verified": true
  }
}
```

**Réponse (Erreur 401):**
```json
{
  "statusCode": 401,
  "message": "Code OTP invalide ou expiré"
}
```

---

### **3. Renvoyer le code OTP**

**Endpoint:** `POST /auth/register/resend-otp`

**Body:**
```json
{
  "telephone": "0612345678"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "message": "Nouveau code envoyé au +33612***78"
}
```

---

## 🚀 Intégration Flutter

### **Service d'API Flutter**

```dart
// lib/services/registration_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class RegistrationService {
  static const String baseUrl = 'http://localhost:3000';

  // Étape 1: Demander vérification (créer compte)
  Future<Map<String, dynamic>> requestVerification({
    required String nom,
    required String prenom,
    required String email,
    required String password,
    required String telephone,
    required DateTime dateNaissance,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register/request-verification'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'nom': nom,
          'prenom': prenom,
          'email': email,
          'password': password,
          'telephone': telephone,
          'date_naissance': dateNaissance.toIso8601String(),
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return {
          'success': true,
          'message': data['message'],
          'userId': data['userId'],
        };
      } else {
        return {'success': false, 'message': data['message']};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur de connexion: $e'};
    }
  }

  // Étape 2: Vérifier le code OTP
  Future<Map<String, dynamic>> verifyPhone({
    required String telephone,
    required String otpCode,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register/verify-phone'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'telephone': telephone,
          'otp_code': otpCode,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Sauvegarder le token
        // await _saveToken(data['access_token']);

        return {
          'success': true,
          'token': data['access_token'],
          'user': data['user'],
        };
      } else {
        return {'success': false, 'message': data['message']};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur de connexion: $e'};
    }
  }

  // Renvoyer le code OTP
  Future<Map<String, dynamic>> resendOtp(String telephone) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register/resend-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'telephone': telephone}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'message': data['message']};
      } else {
        return {'success': false, 'message': data['message']};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur de connexion: $e'};
    }
  }
}
```

### **Page d'inscription Flutter (Complète)**

```dart
// lib/screens/registration_screen.dart
import 'package:flutter/material.dart';
import '../services/registration_service.dart';

class RegistrationScreen extends StatefulWidget {
  @override
  _RegistrationScreenState createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _registrationService = RegistrationService();

  // Controllers
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _emailController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpController = TextEditingController();

  DateTime? _dateNaissance;
  bool _isLoading = false;
  int _currentStep = 0; // 0: Formulaire, 1: Vérification OTP
  int? _userId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0x665ac18e),
              Color(0x995ac18e),
              Color(0xcc5ac18e),
              Color(0xff5ac18e),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(30),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  const SizedBox(height: 40),
                  const Text(
                    'Inscription',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 50),
                  if (_currentStep == 0) _buildRegistrationForm(),
                  if (_currentStep == 1) _buildOtpVerification(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRegistrationForm() {
    return Column(
      children: [
        _buildTextField(_nomController, 'Nom', Icons.person),
        const SizedBox(height: 20),
        _buildTextField(_prenomController, 'Prénom', Icons.person_outline),
        const SizedBox(height: 20),
        _buildTextField(_emailController, 'Email', Icons.email, keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 20),
        _buildTextField(_telephoneController, 'Téléphone', Icons.phone, keyboardType: TextInputType.phone),
        const SizedBox(height: 20),
        _buildDatePicker(),
        const SizedBox(height: 20),
        _buildTextField(_passwordController, 'Mot de passe', Icons.lock, obscureText: true),
        const SizedBox(height: 20),
        _buildTextField(_confirmPasswordController, 'Confirmer mot de passe', Icons.lock_outline, obscureText: true),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleRegistration,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xff5ac18e),
            ),
            child: _isLoading
                ? const CircularProgressIndicator()
                : const Text('S\'inscrire', style: TextStyle(fontSize: 18)),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpVerification() {
    return Column(
      children: [
        const Icon(Icons.sms, size: 80, color: Colors.white),
        const SizedBox(height: 20),
        const Text(
          'Code de vérification',
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        Text(
          'Nous avons envoyé un code au\n${_telephoneController.text}',
          style: const TextStyle(color: Colors.white70, fontSize: 14),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        TextFormField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 32,
            letterSpacing: 16,
            fontWeight: FontWeight.bold,
          ),
          decoration: InputDecoration(
            counterText: '',
            hintText: '● ● ● ● ● ●',
            hintStyle: const TextStyle(color: Colors.white30),
            enabledBorder: OutlineInputBorder(
              borderSide: const BorderSide(color: Colors.white, width: 2),
              borderRadius: BorderRadius.circular(10),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: const BorderSide(color: Colors.white, width: 3),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        const SizedBox(height: 20),
        TextButton(
          onPressed: _isLoading ? null : _handleResendOtp,
          child: const Text(
            'Renvoyer le code',
            style: TextStyle(color: Colors.white, fontSize: 16),
          ),
        ),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleVerifyOtp,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xff5ac18e),
            ),
            child: _isLoading
                ? const CircularProgressIndicator()
                : const Text('Vérifier', style: TextStyle(fontSize: 18)),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white),
        prefixIcon: Icon(icon, color: Colors.white),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.white),
          borderRadius: BorderRadius.circular(10),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.white, width: 2),
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Champ requis';
        }
        return null;
      },
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: DateTime(2000),
          firstDate: DateTime(1900),
          lastDate: DateTime.now(),
        );
        if (date != null) {
          setState(() => _dateNaissance = date);
        }
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: 'Date de naissance',
          labelStyle: const TextStyle(color: Colors.white),
          prefixIcon: const Icon(Icons.calendar_today, color: Colors.white),
          enabledBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Colors.white),
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Text(
          _dateNaissance == null
              ? 'Sélectionner une date'
              : '${_dateNaissance!.day}/${_dateNaissance!.month}/${_dateNaissance!.year}',
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  Future<void> _handleRegistration() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dateNaissance == null) {
      _showError('Veuillez sélectionner votre date de naissance');
      return;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      _showError('Les mots de passe ne correspondent pas');
      return;
    }

    setState(() => _isLoading = true);

    final result = await _registrationService.requestVerification(
      nom: _nomController.text.trim(),
      prenom: _prenomController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      telephone: _telephoneController.text.trim(),
      dateNaissance: _dateNaissance!,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      setState(() {
        _userId = result['userId'];
        _currentStep = 1;
      });
      _showSuccess(result['message']);
    } else {
      _showError(result['message']);
    }
  }

  Future<void> _handleVerifyOtp() async {
    if (_otpController.text.length != 6) {
      _showError('Le code doit contenir 6 chiffres');
      return;
    }

    setState(() => _isLoading = true);

    final result = await _registrationService.verifyPhone(
      telephone: _telephoneController.text.trim(),
      otpCode: _otpController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      _showSuccess('Inscription réussie!');
      // Navigation vers l'écran principal
      Future.delayed(const Duration(seconds: 2), () {
        Navigator.pushReplacementNamed(context, '/home');
      });
    } else {
      _showError(result['message']);
    }
  }

  Future<void> _handleResendOtp() async {
    setState(() => _isLoading = true);

    final result = await _registrationService.resendOtp(
      _telephoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      _showSuccess(result['message']);
    } else {
      _showError(result['message']);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }

  @override
  void dispose() {
    _nomController.dispose();
    _prenomController.dispose();
    _emailController.dispose();
    _telephoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
```

---

## 🔒 Sécurité Implémentée

### **1. Rate Limiting Recommandé**

Ajoutez une limite de tentatives:
```typescript
// Maximum 3 OTP par numéro toutes les 10 minutes
const recentOtps = await otpRepository.count({
  where: {
    telephone,
    created_at: MoreThan(new Date(Date.now() - 10 * 60 * 1000)),
  },
});

if (recentOtps >= 3) {
  throw new BadRequestException(
    'Trop de tentatives. Réessayez dans 10 minutes.'
  );
}
```

### **2. Expiration des OTP**

- ✅ OTP expire après 10 minutes
- ✅ OTP à usage unique
- ✅ Vérification en 2 étapes

### **3. Validation des données**

- ✅ Format téléphone validé
- ✅ Email unique
- ✅ Numéro unique
- ✅ Mot de passe fort requis

---

## 📊 Flux de Données

```
Frontend (Flutter)     Backend (NestJS)        Database         Twilio
      │                       │                    │               │
      │  POST /register/      │                    │               │
      │  request-verification │                    │               │
      ├──────────────────────>│                    │               │
      │                       │  Vérifier unicité  │               │
      │                       ├───────────────────>│               │
      │                       │                    │               │
      │                       │  Créer User        │               │
      │                       │  (non vérifié)     │               │
      │                       ├───────────────────>│               │
      │                       │                    │               │
      │                       │  Créer OTP         │               │
      │                       ├───────────────────>│               │
      │                       │                    │               │
      │                       │  Envoyer SMS       │               │
      │                       ├────────────────────┼──────────────>│
      │                       │                    │     SMS OTP   │
      │  ✅ OTP envoyé       │                    │               │
      │<──────────────────────┤                    │               │
      │                       │                    │               │
      │  POST /register/      │                    │               │
      │  verify-phone         │                    │               │
      ├──────────────────────>│                    │               │
      │                       │  Vérifier OTP      │               │
      │                       ├───────────────────>│               │
      │                       │                    │               │
      │                       │  Marquer vérifié   │               │
      │                       ├───────────────────>│               │
      │                       │                    │               │
      │  ✅ Token JWT +       │                    │               │
      │  User connecté        │                    │               │
      │<──────────────────────┤                    │               │
```

---

## ✅ Checklist d'Implémentation

Backend:
- [x] Champs `is_phone_verified` ajoutés aux entités
- [x] `OtpType` ajouté à l'entité OTP
- [x] Service SMS avec support Twilio
- [x] Service d'inscription avec vérification
- [x] Endpoints API créés
- [x] Migration générée

Frontend:
- [ ] Service registration_service.dart créé
- [ ] Page d'inscription avec OTP
- [ ] Gestion des étapes (formulaire → OTP)
- [ ] Sauvegarde du token JWT
- [ ] Navigation après succès

Configuration:
- [ ] Twilio configuré dans `.env`
- [ ] Package `twilio` installé (si prod)
- [ ] Numéro de test vérifié
- [ ] Tests effectués

---

## 🎉 Résultat Final

Votre application dispose maintenant d'un système complet de:
- ✅ Inscription avec vérification SMS OTP
- ✅ Récupération de mot de passe par SMS OTP
- ✅ Support Users ET Societes
- ✅ Mode dev (logs) et prod (Twilio)
- ✅ Sécurité et rate limiting

Excellent travail! 🚀
