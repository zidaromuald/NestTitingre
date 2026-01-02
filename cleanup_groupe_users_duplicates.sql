-- Cleanup duplicate entries in groupe_users table before migration
-- This script removes duplicate (groupe_id, member_id) pairs, keeping only the oldest entry

-- Show duplicates before cleanup
SELECT groupe_id, member_id, COUNT(*) as count
FROM groupe_users
GROUP BY groupe_id, member_id
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping only the row with the smallest primary key (oldest)
DELETE FROM groupe_users
WHERE ctid IN (
  SELECT ctid
  FROM (
    SELECT ctid,
           ROW_NUMBER() OVER (
             PARTITION BY groupe_id, member_id
             ORDER BY groupe_id, member_id
           ) AS rn
    FROM groupe_users
  ) t
  WHERE rn > 1
);

-- Show count after cleanup
SELECT 'Nettoyage terminé. Nombre total de lignes restantes:' as status, COUNT(*) as count
FROM groupe_users;
