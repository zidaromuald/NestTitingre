-- Supprimer les anciennes colonnes si elles existent
ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS cle CASCADE;
ALTER TABLE informations_partenaires DROP COLUMN IF EXISTS valeur CASCADE;

-- Ajouter toutes les nouvelles colonnes
ALTER TABLE informations_partenaires
  ADD COLUMN IF NOT EXISTS nom_affichage VARCHAR(255),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS localite VARCHAR(255),
  ADD COLUMN IF NOT EXISTS adresse_complete TEXT,
  ADD COLUMN IF NOT EXISTS numero_telephone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS email_contact VARCHAR(255),
  ADD COLUMN IF NOT EXISTS secteur_activite VARCHAR(255),
  ADD COLUMN IF NOT EXISTS superficie VARCHAR(100),
  ADD COLUMN IF NOT EXISTS type_culture VARCHAR(255),
  ADD COLUMN IF NOT EXISTS maison_etablissement VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_controleur VARCHAR(255),
  ADD COLUMN IF NOT EXISTS siege_social VARCHAR(255),
  ADD COLUMN IF NOT EXISTS date_creation DATE,
  ADD COLUMN IF NOT EXISTS certificats JSON,
  ADD COLUMN IF NOT EXISTS numero_registration VARCHAR(100),
  ADD COLUMN IF NOT EXISTS capital_social DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS chiffre_affaires DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS nombre_employes INT,
  ADD COLUMN IF NOT EXISTS type_organisation VARCHAR(255),
  ADD COLUMN IF NOT EXISTS modifiable_par VARCHAR(50) DEFAULT 'societe',
  ADD COLUMN IF NOT EXISTS visible_sur_page BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS metadata JSON;
