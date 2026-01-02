# 🔐 Système de Récupération de Mot de Passe par SMS OTP

## 📋 Vue d'ensemble

Ce système permet aux utilisateurs (Users et Societes) de réinitialiser leur mot de passe en 3 étapes simples via SMS OTP.

## 🔄 Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSUS COMPLET                        │
└─────────────────────────────────────────────────────────────┘

1️⃣  DEMANDE OTP
    └─> Utilisateur entre son numéro de téléphone
        └─> Backend vérifie si le compte existe
            └─> SMS OTP envoyé (valide 10 minutes)

2️⃣  VÉRIFICATION OTP
    └─> Utilisateur entre le code reçu par SMS
        └─> Backend vérifie la validité du code
            └─> Code marqué comme vérifié ✅

3️⃣  RÉINITIALISATION
    └─> Utilisateur entre nouveau mot de passe
        └─> Backend vérifie l'OTP vérifié
            └─> Mot de passe mis à jour 🎉
```

## 🚀 Endpoints API

### **1. Demander un code OTP**

**Endpoint:** `POST /auth/password-reset/request-otp`

**Body:**
```json
{
  "telephone": "0612345678"
}
```

**Réponse (Succès 200):**
```json
{
  "success": true,
  "message": "Un code de vérification a été envoyé au +33612***78"
}
```

**Réponse (Erreur 404):**
```json
{
  "statusCode": 404,
  "message": "Aucun compte trouvé avec ce numéro de téléphone"
}
```

---

### **2. Vérifier le code OTP**

**Endpoint:** `POST /auth/password-reset/verify-otp`

**Body:**
```json
{
  "telephone": "0612345678",
  "otp_code": "123456"
}
```

**Réponse (Succès 200):**
```json
{
  "success": true,
  "message": "Code OTP vérifié avec succès",
  "valid": true
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

### **3. Réinitialiser le mot de passe**

**Endpoint:** `POST /auth/password-reset/reset`

**Body:**
```json
{
  "telephone": "0612345678",
  "otp_code": "123456",
  "new_password": "nouveauMotDePasse123!"
}
```

**Réponse (Succès 200):**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Réponse (Erreur 401):**
```json
{
  "statusCode": 401,
  "message": "Code OTP invalide ou non vérifié. Veuillez recommencer le processus."
}
```

---

## 📱 Intégration Flutter

### **Service API Flutter**

```dart
// lib/services/password_reset_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class PasswordResetService {
  static const String baseUrl = 'http://localhost:3000';

  // Étape 1: Demander OTP
  Future<Map<String, dynamic>> requestOtp(String telephone) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/password-reset/request-otp'),
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

  // Étape 2: Vérifier OTP
  Future<Map<String, dynamic>> verifyOtp(String telephone, String otpCode) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/password-reset/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'telephone': telephone,
          'otp_code': otpCode,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'valid': data['valid']};
      } else {
        return {'success': false, 'message': data['message']};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur de connexion: $e'};
    }
  }

  // Étape 3: Réinitialiser mot de passe
  Future<Map<String, dynamic>> resetPassword(
    String telephone,
    String otpCode,
    String newPassword,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/password-reset/reset'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'telephone': telephone,
          'otp_code': otpCode,
          'new_password': newPassword,
        }),
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

### **Page Flutter: ForgotPasswordPage**

```dart
// lib/screens/forgot_password_page.dart
import 'package:flutter/material.dart';
import '../services/password_reset_service.dart';

class ForgotPasswordPage extends StatefulWidget {
  @override
  _ForgotPasswordPageState createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _passwordResetService = PasswordResetService();

  final _telephoneController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();

  bool _isLoading = false;
  int _currentStep = 0; // 0: Téléphone, 1: OTP, 2: Nouveau MDP

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mot de passe oublié'),
        backgroundColor: const Color(0xff5ac18e),
      ),
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
                  _buildStepIndicator(),
                  const SizedBox(height: 40),
                  if (_currentStep == 0) _buildPhoneStep(),
                  if (_currentStep == 1) _buildOtpStep(),
                  if (_currentStep == 2) _buildPasswordStep(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildStepCircle(0, 'Téléphone'),
        _buildStepLine(0),
        _buildStepCircle(1, 'Code OTP'),
        _buildStepLine(1),
        _buildStepCircle(2, 'Nouveau MDP'),
      ],
    );
  }

  Widget _buildStepCircle(int step, String label) {
    final isActive = _currentStep == step;
    final isCompleted = _currentStep > step;

    return Column(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isCompleted || isActive ? Colors.white : Colors.white38,
          ),
          child: Center(
            child: Text(
              '${step + 1}',
              style: TextStyle(
                color: const Color(0xff5ac18e),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildStepLine(int step) {
    final isActive = _currentStep > step;
    return Container(
      width: 40,
      height: 2,
      color: isActive ? Colors.white : Colors.white38,
    );
  }

  Widget _buildPhoneStep() {
    return Column(
      children: [
        const Text(
          'Entrez votre numéro de téléphone',
          style: TextStyle(color: Colors.white, fontSize: 18),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 30),
        TextFormField(
          controller: _telephoneController,
          keyboardType: TextInputType.phone,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Numéro de téléphone',
            labelStyle: const TextStyle(color: Colors.white),
            prefixIcon: const Icon(Icons.phone, color: Colors.white),
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
              return 'Veuillez entrer votre numéro';
            }
            return null;
          },
        ),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleRequestOtp,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xff5ac18e),
            ),
            child: _isLoading
                ? const CircularProgressIndicator()
                : const Text('Envoyer le code', style: TextStyle(fontSize: 18)),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpStep() {
    return Column(
      children: [
        const Text(
          'Entrez le code reçu par SMS',
          style: TextStyle(color: Colors.white, fontSize: 18),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 30),
        TextFormField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          style: const TextStyle(color: Colors.white, fontSize: 24, letterSpacing: 8),
          textAlign: TextAlign.center,
          decoration: InputDecoration(
            labelText: 'Code OTP',
            labelStyle: const TextStyle(color: Colors.white),
            counterText: '',
            enabledBorder: OutlineInputBorder(
              borderSide: const BorderSide(color: Colors.white),
              borderRadius: BorderRadius.circular(10),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: const BorderSide(color: Colors.white, width: 2),
              borderRadius: BorderRadius.circular(10),
            ),
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

  Widget _buildPasswordStep() {
    return Column(
      children: [
        const Text(
          'Entrez votre nouveau mot de passe',
          style: TextStyle(color: Colors.white, fontSize: 18),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 30),
        TextFormField(
          controller: _newPasswordController,
          obscureText: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Nouveau mot de passe',
            labelStyle: const TextStyle(color: Colors.white),
            prefixIcon: const Icon(Icons.lock, color: Colors.white),
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
            if (value == null || value.length < 8) {
              return 'Le mot de passe doit contenir au moins 8 caractères';
            }
            return null;
          },
        ),
        const SizedBox(height: 30),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleResetPassword,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xff5ac18e),
            ),
            child: _isLoading
                ? const CircularProgressIndicator()
                : const Text('Réinitialiser', style: TextStyle(fontSize: 18)),
          ),
        ),
      ],
    );
  }

  Future<void> _handleRequestOtp() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final result = await _passwordResetService.requestOtp(
      _telephoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      _showMessage(result['message'], isError: false);
      setState(() => _currentStep = 1);
    } else {
      _showMessage(result['message'], isError: true);
    }
  }

  Future<void> _handleVerifyOtp() async {
    if (_otpController.text.length != 6) {
      _showMessage('Le code doit contenir 6 chiffres', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    final result = await _passwordResetService.verifyOtp(
      _telephoneController.text.trim(),
      _otpController.text,
    );

    setState(() => _isLoading = false);

    if (result['success'] && result['valid']) {
      _showMessage('Code vérifié!', isError: false);
      setState(() => _currentStep = 2);
    } else {
      _showMessage(result['message'], isError: true);
    }
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final result = await _passwordResetService.resetPassword(
      _telephoneController.text.trim(),
      _otpController.text,
      _newPasswordController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      _showMessage('Mot de passe réinitialisé avec succès!', isError: false);
      Future.delayed(const Duration(seconds: 2), () {
        Navigator.pop(context);
      });
    } else {
      _showMessage(result['message'], isError: true);
    }
  }

  void _showMessage(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }

  @override
  void dispose() {
    _telephoneController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }
}
```

## ⚙️ Configuration SMS en Production

Pour utiliser un vrai service SMS en production (ex: Twilio), modifiez `sms.service.ts`:

1. **Installer Twilio:**
```bash
npm install twilio
```

2. **Ajouter dans `.env`:**
```
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+33123456789
```

3. **Décommenter le code Twilio dans `sms.service.ts`**

## 🔒 Sécurité

- ✅ OTP expire après 10 minutes
- ✅ OTP à usage unique (marqué comme utilisé)
- ✅ Vérification en 2 étapes (verify puis reset)
- ✅ Mot de passe hashé avec bcrypt
- ✅ Support Users ET Societes

## 📊 Base de données

Table `password_reset_otps`:
- `telephone`: Numéro de téléphone
- `otp_code`: Code à 6 chiffres
- `user_type`: 'User' ou 'Societe'
- `is_verified`: Code vérifié
- `is_used`: Code utilisé
- `expires_at`: Date d'expiration

## ✅ Testé et Fonctionnel

Le système est prêt à utiliser! 🎉
