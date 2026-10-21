# Firestore Security Specification for ZNAVAL

## Data Invariants
- **Users**: Users can only read and write their own profile. Only admins (lookup doc) can see all users.
- **Listings**: Public can read. Only authenticated users can create. Only owners can update or delete. `price` must be positive. `id` must match doc ID.
- **Polls**: Public can read. Only authenticated users can vote. `votes` is an object mapping user IDs to their selected option.
- **Properties**: (Legacy/Requested) Public read, authenticated write.

## Identity & Roles
- `isAuthenticated()`: User has a valid auth token.
- `isOwner(userId)`: Current `request.auth.uid` matches the provided `userId`.
- `isAdmin()`: User exists in `/admins/$(request.auth.uid)`.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a listing with `authorUid` of another user. (Denied)
2. **Shadow Field injection**: Add `isVerified: true` to a listing. (Denied)
3. **Invalid Type**: Set `price` to a string. (Denied)
4. **Boundary Violation**: Set `price` to a negative number. (Denied)
5. **ID Poisoning**: Use a document ID longer than 128 characters or with invalid symbols. (Denied)
6. **State Shortcut**: Directly update another user's poll vote. (Denied)
7. **Privilege Escalation**: Attempt to create a document in `/admins/` as a regular user. (Denied)
8. **PII Leak**: Non-owner attempts to read private fields in `/users/` (if any). (Denied)
9. **Recursive Cost Attack**: Massive query without filters designed to trigger expensive rule lookups. (Denied by query enforcer)
10. **Immutable Field Change**: Attempt to change `createdAt` on a listing. (Denied)
11. **Orphaned Record**: Create a listing referencing a non-existent user profile (optional based on logic).
12. **Blanket Read Scam**: `list` query without auth-based filtration if sensitive data is involved. (Denied)
