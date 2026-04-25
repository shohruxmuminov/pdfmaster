# Security Specification - IELTS.net

## Data Invariants
1. **User Profiles**: Every user must have a document in `/users/{userId}` where `{userId}` matches their Auth UID.
2. **Premium Access**: Access to certain materials is restricted based on the `isPremium` field in the material and the user's `expiryDate`.
3. **Teacher/Admin Access**: Elevated permissions (reading all results, managing materials) are granted only to users with the `role` of 'teacher' or 'admin'.
4. **Ownership**: Users can only read and write their own profile and results.

## The "Dirty Dozen" Payloads (Malicious Attempts)

1. **Identity Spoofing (User Profile)**: Try to create a user profile with a UID different from the authenticated user.
2. **Privilege Escalation**: Try to set your own `role` to 'admin' during profile creation.
3. **Shadow Update**: Try to update a user profile with an extra field `isVerified: true`.
4. **Orphaned Result**: Try to submit a test result with a non-existent `materialId`.
5. **PII Leak**: Try to read another user's profile document.
6. **Query Scraping**: Try to list all results without being a teacher/admin.
7. **Bypassing Expiry**: Try to update your own `expiryDate`.
8. **ID Poisoning**: Try to create a document with a 2MB string as ID.
9. **State Shortcutting**: Try to approve your own premium request.
10. **Resource Poisoning**: Try to upload 10MB of junk into a name field.
11. **Settings Hijack**: Try to change global settings as a regular user.
12. **Alert Suppression**: Try to delete cheat alerts as a regular user.

## Test Runner (firestore.rules.test.ts)

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { setDoc, getDoc, collection, query, where, getDocs, doc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-ielts-net",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

test("Identity Spoofing: fail when creating profile for another UID", async () => {
  const alice = testEnv.authenticatedContext("alice");
  await assertFails(setDoc(doc(alice.firestore(), "users", "bob"), {
    uid: "bob",
    email: "bob@example.com",
    role: "user"
  }));
});

test("Privilege Escalation: fail when setting own role to admin", async () => {
  const alice = testEnv.authenticatedContext("alice");
  await assertFails(setDoc(doc(alice.firestore(), "users", "alice"), {
    uid: "alice",
    email: "alice@example.com",
    role: "admin",
    premiumStatus: "none"
  }));
});

test("PII Leak: fail when reading another user's profile", async () => {
  const alice = testEnv.authenticatedContext("alice");
  const bob = testEnv.authenticatedContext("bob");
  
  // Alice creating her profile
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users", "alice"), {
      uid: "alice",
      email: "alice@example.com",
      role: "user"
    });
  });

  await assertFails(getDoc(doc(bob.firestore(), "users", "alice")));
});

test("Settings Hijack: fail when updating global settings as user", async () => {
  const alice = testEnv.authenticatedContext("alice");
  await assertFails(setDoc(doc(alice.firestore(), "settings", "global"), {
    mockTestAccessEnabled: true
  }));
});
```
