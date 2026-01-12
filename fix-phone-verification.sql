-- ============================================
-- Script SQL: Ajout des colonnes Phone Verification
-- ============================================
-- Ce script ajoute les colonnes is_phone_verified et phone_verified_at
-- aux tables users et societes si elles n'existent pas

-- Connexion: psql -U api_userzr -d titingre_db -f fix-phone-verification.sql

\echo '============================================'
\echo 'Fix: Phone Verification Columns'
\echo '============================================'
\echo ''

-- ====================
-- TABLE: users
-- ====================
\echo '1/2 Ajout des colonnes à la table users...'

-- Ajouter is_phone_verified
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'is_phone_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT false;
        RAISE NOTICE '✓ Colonne is_phone_verified ajoutée à users';
    ELSE
        RAISE NOTICE '⚠ Colonne is_phone_verified existe déjà dans users';
    END IF;
END $$;

-- Ajouter phone_verified_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'phone_verified_at'
    ) THEN
        ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMP NULL;
        RAISE NOTICE '✓ Colonne phone_verified_at ajoutée à users';
    ELSE
        RAISE NOTICE '⚠ Colonne phone_verified_at existe déjà dans users';
    END IF;
END $$;

\echo ''

-- ====================
-- TABLE: societes
-- ====================
\echo '2/2 Ajout des colonnes à la table societes...'

-- Ajouter is_phone_verified
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'societes'
        AND column_name = 'is_phone_verified'
    ) THEN
        ALTER TABLE societes ADD COLUMN is_phone_verified BOOLEAN DEFAULT false;
        RAISE NOTICE '✓ Colonne is_phone_verified ajoutée à societes';
    ELSE
        RAISE NOTICE '⚠ Colonne is_phone_verified existe déjà dans societes';
    END IF;
END $$;

-- Ajouter phone_verified_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'societes'
        AND column_name = 'phone_verified_at'
    ) THEN
        ALTER TABLE societes ADD COLUMN phone_verified_at TIMESTAMP NULL;
        RAISE NOTICE '✓ Colonne phone_verified_at ajoutée à societes';
    ELSE
        RAISE NOTICE '⚠ Colonne phone_verified_at existe déjà dans societes';
    END IF;
END $$;

\echo ''
\echo '============================================'
\echo '✅ Correction terminée!'
\echo '============================================'
\echo ''

-- ====================
-- VÉRIFICATION
-- ====================
\echo 'Vérification des colonnes ajoutées:'
\echo ''

\echo 'Colonnes de la table users:'
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name LIKE '%phone%'
ORDER BY ordinal_position;

\echo ''
\echo 'Colonnes de la table societes:'
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'societes'
AND column_name LIKE '%phone%'
ORDER BY ordinal_position;

\echo ''
\echo '🎉 Vous pouvez maintenant redémarrer votre API:'
\echo '   pm2 restart titingre-api'
\echo ''
