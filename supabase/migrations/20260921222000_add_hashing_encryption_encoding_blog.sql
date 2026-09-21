-- Add the hashing, encryption, and encoding explainer as a published technical blog post.
-- The existing admin account is used as the author without hard-coding a user UUID.

DO $seed$
DECLARE
  admin_id UUID;
BEGIN
  SELECT ur.user_id
  INTO admin_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at
  LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found. Create/promote the CodeForge admin before applying this migration.';
  END IF;

  INSERT INTO public.posts (
    author_id, title, slug, excerpt, content, category, tags, published, featured, reading_time
  )
  SELECT
    admin_id,
    '🔑 Hashing vs Encryption vs Encoding: What''s the Difference?',
    'hashing-encryption-encoding',
    'Hashing, encryption, and encoding are often confused. Learn what each one does, how they differ, and where they belong in real-world software systems.',
    $content$
# 🔑 Hashing vs Encryption vs Encoding: What's the Difference?

Hashing, encryption, and encoding all transform data, but they solve **different problems**.

They are often mixed together because the output of each process can look like a random string. The important difference is what the transformation is designed to accomplish and whether the original data can be recovered.

A simple way to remember them is:

- **Encoding** changes data into another representation.
- **Encryption** protects data so authorized parties can recover it.
- **Hashing** creates a one-way representation that is useful for integrity checks, lookup, and password verification.

## 1. What is encoding?

**Encoding** converts data from one representation into another so that it can be stored, transmitted, or processed correctly.

Encoding is **not a security mechanism**.

For example, Base64 can represent binary data using printable characters:

```text
Hello
  ↓ Base64
SGVsbG8=
```

Anyone who knows that the data is Base64 can decode it.

Common examples include:

- Base64
- URL encoding
- UTF-8
- hexadecimal representation

### Why use encoding?

Encoding is useful when two systems need a compatible representation.

For example, URLs have rules about which characters can appear directly in a URL. URL encoding lets those characters be represented safely.

The key point is:

> **If the goal is confidentiality, encoding is the wrong tool.**

Base64-encoding a password does not protect the password.

## 2. What is encryption?

**Encryption** transforms readable data into ciphertext using an encryption algorithm and a key.

The intended recipient can use the appropriate key to decrypt the ciphertext and recover the original data.

```text
Plaintext
   ↓
Encryption + Key
   ↓
Ciphertext
   ↓
Decryption + Key
   ↓
Plaintext
```

Encryption is designed to provide **confidentiality**.

### Symmetric encryption

With symmetric encryption, the same secret key is used to encrypt and decrypt data.

Examples include AES and ChaCha20.

Symmetric encryption is commonly used when applications need to protect stored or transmitted data efficiently.

### Asymmetric encryption

Asymmetric cryptography uses a **public key** and a **private key**.

Public-key cryptography also supports digital signatures, where a private key signs data and others use the public key to verify the signature.

Examples include RSA and elliptic-curve cryptography.

Modern protocols such as TLS combine multiple cryptographic techniques rather than relying on one primitive for everything.

## 3. What is hashing?

A **cryptographic hash function** takes an input and produces a fixed-size output called a digest.

```text
Input
  ↓
Hash function
  ↓
Digest
```

For a cryptographic hash function, a small change in the input should produce a substantially different digest.

For example:

```text
Hello
  ↓
SHA-256
  ↓
[fixed-length hexadecimal digest]
```

Unlike encryption, cryptographic hashing is intended to be **one-way**. There is no decryption key that simply reverses a secure hash function.

Common cryptographic hash functions include:

- SHA-256
- SHA-512
- SHA-3

Older algorithms such as MD5 and SHA-1 have known security weaknesses and should not be chosen for new security-sensitive designs.

## 4. Passwords should be hashed differently

One of the most important real-world applications of hashing is password storage.

A website should not normally store users' plaintext passwords in its database.

Instead, a password should be processed with a password hashing function designed to make large-scale guessing expensive.

Common password hashing algorithms include:

- Argon2
- bcrypt
- scrypt

A password hash should also use a unique **salt** for each password.

```text
Password + Unique Salt
          ↓
Password Hashing Function
          ↓
Stored Password Hash
```

When the user logs in, the submitted password is processed again and the result is checked against the stored password hash.

### Why not just use SHA-256?

General-purpose hash functions are designed to be fast. That is useful for many applications, but it is undesirable for password storage because attackers can test huge numbers of guesses quickly.

Password hashing functions deliberately introduce computational and memory costs that can be configured according to the application's security requirements.

## 5. The three concepts side by side

| Property | Encoding | Encryption | Hashing |
| --- | --- | --- | --- |
| Main purpose | Representation | Confidentiality | One-way transformation |
| Designed to be reversible? | Yes | Yes, with the key | No |
| Requires a secret key? | No | Yes | No secret key for ordinary hashing |
| Protects confidentiality? | No | Yes | Not by itself |
| Common example | Base64 | AES | SHA-256 |
| Password storage? | No | Usually not directly | Yes, with a password-hashing algorithm |

The table is simplified because cryptographic systems can combine multiple primitives, but it captures the core distinction.

## 6. A practical example

Imagine an application stores a user's profile picture.

The application might:

1. **Encode** binary data into a format required by another system.
2. **Encrypt** sensitive stored data if confidentiality is required.
3. **Hash** a file when it needs a compact value for integrity checking or change detection.

These operations can coexist because they solve different problems.

## 7. A common mistake: "Hashing is encryption"

It isn't.

If something needs to be recovered later, encryption may be appropriate.

If something needs to be represented in a different format, encoding may be appropriate.

If you need a one-way cryptographic digest or secure password verification, hashing or password hashing may be appropriate.

Choosing the wrong operation can create serious security problems.

## 8. Another common mistake: "Encrypted means secure"

Encryption is powerful, but encryption alone does not automatically make an application secure.

Security also depends on:

- How keys are generated
- Where keys are stored
- Who can access the keys
- Which algorithms and modes are used
- How authentication is implemented
- Whether data is protected before and after encryption
- Whether the application validates inputs and permissions correctly

If an attacker can obtain the encryption key, encrypted data may no longer provide meaningful protection.

## The easiest way to remember

```text
ENCODING
"How should I represent this data?"
        ↓
Representation

ENCRYPTION
"How do I keep this data secret?"
        ↓
Ciphertext + Key

HASHING
"How can I create a one-way fingerprint of this data?"
        ↓
Digest
```

### Final takeaway

**Encoding is about representation. Encryption is about confidentiality. Hashing is about one-way transformation.**

They may appear similar on the surface, but they should not be treated as interchangeable security tools.

Understanding this distinction is fundamental to building software that handles data correctly and securely.
$content$,
    'Cybersecurity',
    ARRAY['Cybersecurity','Cryptography','Hashing','Encryption','Encoding','Passwords'],
    true,
    false,
    8
  WHERE NOT EXISTS (
    SELECT 1 FROM public.posts p WHERE p.slug = 'hashing-encryption-encoding'
  );
END
$seed$;
