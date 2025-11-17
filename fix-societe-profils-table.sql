-- Script SQL pour corriger la table societe_profils
-- Exécutez ce script dans votre console PostgreSQL ou via un client SQL

-- 1. Renommer les colonnes existantes
ALTER TABLE societe_profils RENAME COLUMN photo_couverture TO logo;
ALTER TABLE societe_profils RENAME COLUMN presentation_longue TO description;

-- 2. Supprimer les colonnes non utilisées
ALTER TABLE societe_profils DROP COLUMN IF EXISTS reseaux_sociaux;
ALTER TABLE societe_profils DROP COLUMN IF EXISTS horaires_ouverture;

-- 3. Ajouter les nouvelles colonnes
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS secteur_activite VARCHAR(255);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS taille_entreprise VARCHAR(100);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS chiffre_affaires DECIMAL(15,2);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS adresse_complete VARCHAR(255);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS ville VARCHAR(100);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS pays VARCHAR(100);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS code_postal VARCHAR(20);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS telephone VARCHAR(50);
ALTER TABLE societe_profils ADD COLUMN IF NOT EXISTS email_contact VARCHAR(255);

-- Vérifier la structure finale
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'societe_profils'
ORDER BY ordinal_position;
