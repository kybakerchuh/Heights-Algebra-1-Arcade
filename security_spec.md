# Security Specification — Heights Algebra 1 Arcade

## 1. Data Invariants
1. **Admin-Only Game Mutations**: Only verified teacher admins (`ky_baker@chuh.org` with `email_verified == true` or an explicitly authorized teacher in `/authorizedTeachers/{email}` with `email_verified == true`) may create, update, or delete `/games/{gameId}` documents.
2. **Public Published-Only Visibility**: Unauthenticated students and non-admin visitors may ONLY `get` or `list` games where `resource.data.published == true`. Draft (`published == false`) games are strictly hidden from non-admins.
3. **Uploaded / Local Thumbnail Enforcement**: `thumbnailData` MUST match either a base64 image Data URL (`data:image/(png|jpeg|jpg|webp|gif);base64,...`) or a local bundled asset path (`/src/assets/images/...`), strictly capped at `450000` bytes. External `http://` or `https://` image URLs are rejected at the rule layer.
4. **Immortal Audit Fields & Server Timestamps**: `createdByUid` and `createdAt` are immutable after creation; `createdAt` (on create) and `updatedAt` (on create and update) MUST equal `request.time`.
5. **PII Isolation**: Teacher emails in `/authorizedTeachers/{teacherEmail}` are NEVER publicly readable or listable; only admins (or a verified teacher checking their own exact document) can read them.
6. **Strict Field Allowlisting**: Every create enforces `keys().hasAll(...) && keys().hasOnly(...)`; every update enforces `affectedKeys().hasOnly(...)` and runs `isValidGame(incoming())`.

## 2. Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Game Create**: Anonymous client attempts `setDoc('/games/game-1', validGame)`.
2. **Unverified Email Spoof**: Signed-in user with `email: 'ky_baker@chuh.org'`, `email_verified: false` attempts to create a game.
3. **Non-Teacher Student Write**: Signed-in student (`student@chuh.org`, `email_verified: true`) attempts to create/update/delete a game.
4. **External Internet Image URL Injection**: Teacher attempts to save `thumbnailData: 'https://images.unsplash.com/photo-123.jpg'` (must reject external URLs).
5. **Shadow / Ghost Field Injection**: Teacher attempts to create a game with extra key `isSystemVerified: true`.
6. **Oversized Denial-of-Wallet Payload**: Teacher attempts to save `thumbnailData` > `450000` characters or `title` > `80` characters.
7. **ID Poisoning**: Client attempts `setDoc('/games/' + 'a'.repeat(200), validGame)` or path with illegal characters.
8. **Fake Client Timestamp**: Teacher attempts to create a game with `createdAt` set to a backdated client timestamp instead of `request.time`.
9. **Immortal Field Mutation**: Teacher attempts to update `createdByUid` or `createdAt` on an existing game.
10. **Draft Game Leak to Student**: Unauthenticated visitor attempts `getDoc('/games/draft-1')` where `published == false`.
11. **PII Scraping of Teacher Emails**: Student or unauthenticated user attempts `getDocs(collection(db, 'authorizedTeachers'))`.
12. **Self-Privilege Escalation**: Non-admin user attempts `setDoc('/authorizedTeachers/hacker@gmail.com', ...)` to add themselves as a teacher.
