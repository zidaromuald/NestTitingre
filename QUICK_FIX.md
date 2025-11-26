# Database Schema Fixed

## What Was Fixed

Fixed two database schema issues:

1. **Missing `societe_id` column** - Added via migration `1763929000000-AddSocieteIdColumnToPosts.ts`
2. **Column name mismatch** - Renamed `visibilite` → `visibility` via migration `1763930000000-RenameVisibiliteToVisibility.ts`

Both migrations have been executed successfully.

---

## Current Status

✅ Database schema is now correct
✅ Server has been rebuilt and restarted
✅ All columns exist:
   - `societe_id` (allows posts by societies)
   - `visibility` (controls post visibility)

The post creation endpoint should now work correctly!

---

## Testing Post Creation

### 1. First, login to get a JWT token:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Create a post using the token:

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Mon premier post qui fonctionne !"
  }'
```

### Expected Response:

```json
{
  "success": true,
  "message": "Post créé avec succès",
  "data": {
    "id": 1,
    "contenu": "Mon premier post qui fonctionne !",
    "posted_by_id": 1,
    "posted_by_type": "User",
    "groupe_id": null,
    "societe_id": null,
    "visibility": "public",
    "likes_count": 0,
    "comments_count": 0,
    "shares_count": 0,
    "is_pinned": false,
    "created_at": "2025-11-23T20:30:00.000Z"
  }
}
```

---

## Post Examples

### Personal Post (default)
```json
{
  "contenu": "Mon post personnel"
}
```

### Post in a Group
```json
{
  "groupe_id": 5,
  "contenu": "Message pour le groupe",
  "visibility": "membres_only"
}
```

### Post by a Society
```json
{
  "societe_id": 10,
  "contenu": "Annonce de la société",
  "visibility": "public"
}
```

### Post with Media
```json
{
  "contenu": "Belle photo !",
  "images": ["uploads/images/photo-123.jpg"],
  "videos": ["uploads/videos/video-456.mp4"]
}
```

---

## Important Notes

- `posted_by_id` and `posted_by_type` are **automatically** set from the JWT token
- Do NOT include these fields in your request body
- Authentication is required (use `@UseGuards(JwtAuthGuard)`)
- The `@CurrentUser()` decorator provides the authenticated user/societe

---

## Migrations Applied

1. `1763929000000-AddSocieteIdColumnToPosts.ts` - Adds `societe_id` column
2. `1763930000000-RenameVisibiliteToVisibility.ts` - Renames column to English

Both migrations are idempotent and safe to run multiple times.
