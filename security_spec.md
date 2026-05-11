# Security Specification for Smart Energy Manager AI

## Data Invariants
1. A user can only access their own profile (`/users/{userId}`).
2. A user can only access their own appliances (`/users/{userId}/appliances/{applianceId}`).
3. A user can only access their own bill history (`/users/{userId}/billHistory/{billId}`).
4. `userId` in the document path must always match `request.auth.uid`.
5. Certain fields like `createdAt` are immutable after creation.
6. All writes must satisfy the schema (type and size constraints).

## The "Dirty Dozen" Payloads (Wicked Writes)

1. **Identity Spoofing**: Attempt to create an appliance in another user's collection.
   - Path: `/users/victim_user_id/appliances/new_id`
   - Outcome: `PERMISSION_DENIED`
2. **Profile Hijacking**: Attempt to update another user's profile.
   - Path: `/users/victim_user_id`
   - Outcome: `PERMISSION_DENIED`
3. **Malicious ID**: Attempt to create a document with a 2MB string as ID.
   - Outcome: `PERMISSION_DENIED`
4. **Shadow Update**: Attempt to add an `isAdmin: true` field to a UserProfile.
   - Outcome: `PERMISSION_DENIED`
5. **Type Poisoning**: Sending a string for `watts` in Appliance.
   - Outcome: `PERMISSION_DENIED`
6. **Out-of-Bounds**: Sending a negative value for `hours` used.
   - Outcome: `PERMISSION_DENIED`
7. **Timestamp Fraud**: Sending a future `createdAt` date.
   - Outcome: `PERMISSION_DENIED`
8. **Orphan Write**: Creating a bill history entry without a valid user profile.
   - Outcome: `PERMISSION_DENIED`
9. **Bulk Scrape**: Attempting `list` on all users' profiles.
   - Outcome: `PERMISSION_DENIED`
10. **Resource Exhaustion**: Sending a 1MB string in `name` field.
    - Outcome: `PERMISSION_DENIED`
11. **History Tampering**: Updating a terminal bill history record.
    - Outcome: `PERMISSION_DENIED`
12. **Insecure Query**: Querying all appliances without a `userId` filter.
    - Outcome: `PERMISSION_DENIED`
