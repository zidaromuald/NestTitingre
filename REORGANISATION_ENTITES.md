# 🔄 Réorganisation des Entités - Système de Partenariat

## 🎯 Logique Business Clarifiée

### Niveau 1: SUIVRE (Gratuit - Social Media)
```
User → suit → Societe
  ↓
- Voir publications
- Liker, commenter
- Stats d'engagement
- PAS d'accès aux données commerciales
```

### Niveau 2: ABONNEMENT (Payant - Partenariat Commercial)
```
User → s'abonne → Societe
  ↓ (si accepté par Societe)
- Devient PARTENAIRE COMMERCIAL
- Page Partenariat créée automatiquement
- Accès aux transactions commerciales
- Informations des deux parties affichées
```

---

## 📊 Architecture Proposée

### Entités Actuelles à Conserver

#### ✅ **Suivre** (Déjà OK)
- Table: `suivis`
- Fonction: Suivi social, stats d'engagement
- **Ne touche PAS aux données commerciales**

#### ✅ **Abonnement** (À Modifier Légèrement)
- Table: `abonnements`
- Fonction: Gère le partenariat commercial
- **Ajouter:** `page_partenariat_id` (lien vers la page commune)

---

### Nouvelles Entités à Créer

#### 🆕 **PagePartenariat** (Dashboard Commun)
```typescript
@Entity('pages_partenariat')
export class PagePartenariat {
  id: number;
  abonnement_id: number;  // Lien 1:1 avec Abonnement

  // Visibilité et branding
  titre: string;  // Ex: "Partenariat SOFITEX - Jean Dupont"
  description: string;
  logo_url: string;
  couleur_theme: string;

  // Stats affichées sur la page
  total_transactions: number;
  montant_total: number;
  date_debut_partenariat: Date;

  // Permissions (qui peut voir/modifier)
  visibilite: 'prive' | 'public';  // Page visible publiquement ou non

  // Métadonnées
  metadata: Record<string, any>;

  created_at: Date;
  updated_at: Date;

  // Relations
  abonnement: Abonnement;  // 1:1
  transactions: TransactionPartenariat[];  // 1:N
  informationsUser: InformationPartenaire;  // 1:1 (infos User)
  informationsSociete: InformationPartenaire;  // 1:1 (infos Societe)
}
```

#### 🆕 **TransactionPartenariat** (Transactions Agricoles/Commerciales)
```typescript
@Entity('transactions_partenariat')
export class TransactionPartenariat {
  id: number;
  page_partenariat_id: number;

  // Période de la transaction
  date_debut: Date;  // Ex: "Janvier 2023"
  date_fin: Date;    // Ex: "Mars 2023"
  periode_label: string;  // Ex: "Janvier à Mars 2023"

  // Produit/Service
  produit: string;  // Ex: "Coton"
  categorie: string;  // Ex: "Agriculture", "Textile"

  // Quantités
  quantite: number;  // Ex: 2038
  unite: string;     // Ex: "Kg", "Tonnes", "Unités"

  // Prix
  prix_unitaire: number;  // Ex: 1000
  devise: string;         // Ex: "CFA", "EUR"
  prix_total: number;     // Calculé automatiquement

  // Statut
  statut: 'en_cours' | 'termine' | 'annule' | 'en_attente_validation';

  // Validation (SEULE LA SOCIETE peut créer/modifier)
  creee_par_societe: boolean;  // true = Societe a créé
  validee_par_user: boolean;   // User peut valider
  date_validation_user: Date;

  // Notes
  notes: string;

  created_at: Date;
  updated_at: Date;

  // Relations
  pagePartenariat: PagePartenariat;
}
```

#### 🆕 **InformationPartenaire** (Infos Affichées sur la Page)
```typescript
@Entity('informations_partenaires')
export class InformationPartenaire {
  id: number;
  page_partenariat_id: number;

  // Type (User ou Societe)
  partenaire_id: number;
  partenaire_type: 'User' | 'Societe';

  // Informations générales
  nom_affichage: string;
  description: string;
  logo_url: string;

  // Informations de contact
  localite: string;           // Ex: "Sorano (Champs) Uber"
  adresse_complete: string;
  numero_telephone: string;   // Ex: "+226-08-07-80-14"
  email_contact: string;

  // Informations métier (selon le secteur)
  secteur_activite: string;   // Ex: "Agriculture", "Textile"

  // Pour Agriculture
  superficie: string;         // Ex: "4 Hectares"
  type_culture: string;       // Ex: "Coton", "Maïs"
  maison_etablissement: string;  // Ex: "SORO, KTF"

  // Pour Entreprise
  siege_social: string;
  date_creation: Date;
  certificats: string[];      // URLs des certificats
  numero_registration: string;

  // Informations financières
  capital_social: number;
  chiffre_affaires: number;

  // Contrôle
  contact_controleur: string;  // Ex: "Contrôleur de User"

  // Permissions
  modifiable_par: 'user' | 'societe' | 'les_deux';

  // Métadonnées JSON pour flexibilité
  metadata: Record<string, any>;

  created_at: Date;
  updated_at: Date;

  // Relations
  pagePartenariat: PagePartenariat;
}
```

---

## 🔄 Modifications des Entités Existantes

### **Abonnement** (Modifications)

**Ajouter ces colonnes:**
```typescript
@Column({ type: 'int', nullable: true })
page_partenariat_id: number;

@Column({ type: 'boolean', default: false })
page_partenariat_creee: boolean;

@OneToOne(() => PagePartenariat, page => page.abonnement)
@JoinColumn({ name: 'page_partenariat_id' })
pagePartenariat: PagePartenariat;
```

### **TransactionCollaboration** (Garder pour autres usages)

**Cette entité reste** pour :
- Transactions financières génériques
- Paiements d'abonnements
- Transactions entre Users (sans Page Partenariat)

**TransactionPartenariat** sera utilisée pour :
- Transactions commerciales agricoles
- Transactions avec quantités, prix unitaire
- Transactions affichées sur la Page Partenariat

---

## 📐 Schéma des Relations

```
User ──1:N──> Suivre <──N:1── Societe
                             (Social, gratuit)

User ──1:N──> Abonnement <──N:1── Societe
                  │               (Partenariat commercial)
                  │
                  └──1:1──> PagePartenariat
                              │
                              ├──1:N──> TransactionPartenariat
                              │           (2038 Kg coton, etc.)
                              │
                              ├──1:1──> InformationPartenaire (User)
                              │           (Champs, superficie, etc.)
                              │
                              └──1:1──> InformationPartenaire (Societe)
                                          (SOFITEX, certificats, etc.)
```

---

## 🎯 Exemple Concret : Partenariat SOFITEX

### Étape 1: User suit SOFITEX (gratuit)
```typescript
const suivi = await suivreService.creerSuivi({
  user_id: jeanId,
  societe_id: sofitexId,
});
// Jean peut voir les posts, liker, commenter
```

### Étape 2: User s'abonne (devient partenaire)
```typescript
const abonnement = await abonnementService.creerAbonnement({
  user_id: jeanId,
  societe_id: sofitexId,
  plan_collaboration: 'premium',
  secteur_collaboration: 'Agriculture - Coton',
});

// Automatiquement créée:
const pagePartenariat = await pagePartenaritService.creerPagePartenariat(abonnement);
```

### Étape 3: SOFITEX ajoute les informations
```typescript
// Informations de Jean (agriculteur)
await informationService.creerInformation({
  page_partenariat_id: pagePartenariat.id,
  partenaire_id: jeanId,
  partenaire_type: 'User',
  localite: 'Sorano (Champs) Uber',
  superficie: '4 Hectares',
  type_culture: 'Coton',
  numero_telephone: '+226-08-07-80-14',
  modifiable_par: 'societe',  // SEULE SOFITEX peut modifier
});

// Informations de SOFITEX
await informationService.creerInformation({
  page_partenariat_id: pagePartenariat.id,
  partenaire_id: sofitexId,
  partenaire_type: 'Societe',
  siege_social: 'Bobo-Dioulasso',
  secteur_activite: 'Textile - Coton',
  certificats: ['cert1.pdf', 'cert2.pdf'],
  modifiable_par: 'societe',
});
```

### Étape 4: SOFITEX crée les transactions
```typescript
// Transaction Q1 2023
await transactionPartenaritService.creerTransaction({
  page_partenariat_id: pagePartenariat.id,
  periode_label: 'Janvier à Mars 2023',
  date_debut: '2023-01-01',
  date_fin: '2023-03-31',
  produit: 'Coton',
  quantite: 2038,
  unite: 'Kg',
  prix_unitaire: 1000,
  devise: 'CFA',
  prix_total: 2038000,  // Calculé auto
  creee_par_societe: true,
  statut: 'en_attente_validation',
});

// Jean valide la transaction
await transactionPartenaritService.validerParUser(transactionId, jeanId);
```

---

## 🔒 Permissions & Sécurité

### Règles de Modification

| Entité | Qui peut CRÉER | Qui peut MODIFIER |
|--------|----------------|-------------------|
| **PagePartenariat** | Auto (lors abonnement) | Societe (titre, description) |
| **InformationPartenaire** (User) | Societe | SEULE Societe |
| **InformationPartenaire** (Societe) | Societe | Societe |
| **TransactionPartenariat** | SEULE Societe | SEULE Societe |

### Règles de Validation

| Action | User | Societe |
|--------|------|---------|
| Créer transaction | ❌ | ✅ |
| Modifier transaction | ❌ | ✅ |
| **Valider** transaction | ✅ | ✅ |
| Voir transactions | ✅ | ✅ |

---

## 💡 Avantages de cette Architecture

✅ **Séparation claire** : Social (Suivre) ≠ Commercial (Abonnement)
✅ **Page dédiée** : Dashboard professionnel pour le partenariat
✅ **Données structurées** : Transactions avec quantités, périodes
✅ **Sécurité** : Seule Societe modifie, User valide
✅ **Flexibilité** : Secteurs d'activité variés (agriculture, textile, etc.)
✅ **Évolutif** : Facile d'ajouter d'autres types de partenariats

---

## 🚀 Prochaines Étapes

1. ✅ Créer `PagePartenariat`
2. ✅ Créer `TransactionPartenariat`
3. ✅ Créer `InformationPartenaire`
4. ✅ Modifier `Abonnement` (ajouter page_partenariat_id)
5. ✅ Créer services avec logique métier
6. ✅ Créer DTOs et validations
7. ✅ Créer controllers avec permissions

---

**Voulez-vous que je crée ces 3 nouvelles entités maintenant ?**
