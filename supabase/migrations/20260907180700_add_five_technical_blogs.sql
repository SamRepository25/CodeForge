-- Add exactly five new published technical blog posts.
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
    author_id,
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    published,
    featured,
    reading_time
  )
  SELECT
    admin_id,
    v.title,
    v.slug,
    v.excerpt,
    v.content,
    v.category,
    v.tags,
    true,
    false,
    v.reading_time
  FROM (
    VALUES
      (
        '🌐 What Happens When You Type a URL?',
        'what-happens-when-you-type-a-url',
        'A step-by-step look at what happens between entering a URL and seeing a webpage in your browser.',
        $content1$
# 🌐 What Happens When You Type a URL?

A URL looks simple, but pressing **Enter** starts a surprisingly long chain of events. Your browser has to find the server, establish a connection, send a request, receive a response, and turn the returned data into the page you see.

## 1. The browser parses the URL

Suppose you enter:

`https://example.com/products`

The browser identifies the protocol (`https`), hostname (`example.com`), and path (`/products`). It uses this information to decide how the request should be made.

## 2. DNS finds the server

The hostname is not normally used directly for routing packets. DNS translates `example.com` into an IP address such as `203.0.113.10`.

The browser and operating system may already have the answer cached. Otherwise, a DNS resolver performs the lookup through the DNS hierarchy.

## 3. A connection is established

For HTTPS, the browser connects to the destination server using TCP and then performs a TLS handshake. TLS encrypts the connection and verifies the server's certificate.

Modern browsers can also use HTTP/3 over QUIC, which changes the transport layer while keeping the same high-level goal: securely exchange HTTP messages.

## 4. The browser sends an HTTP request

The browser sends a request containing information such as the method, path, headers, and sometimes a request body.

```http
GET /products HTTP/1.1
Host: example.com
```

Cookies and other headers may also be included when appropriate.

## 5. The server processes the request

The request can pass through a CDN, reverse proxy, load balancer, web server, and application backend before the application generates a response.

The backend might query a database, call another service, authenticate the user, or render HTML.

## 6. The response comes back

The server returns an HTTP response with a status code, headers, and content.

```http
HTTP/1.1 200 OK
Content-Type: text/html
```

The browser receives the HTML and then discovers additional resources such as CSS, JavaScript, fonts, images, and API requests.

## 7. The browser renders the page

The browser parses HTML into the DOM and CSS into the CSSOM. These structures are combined to determine what should be displayed. JavaScript can then modify the page and trigger additional network requests.

Eventually, pixels are produced and you see the webpage.

## The complete journey

```text
URL
 ↓
DNS lookup
 ↓
IP address
 ↓
TCP / QUIC connection
 ↓
TLS handshake
 ↓
HTTP request
 ↓
Server / CDN / application
 ↓
HTTP response
 ↓
HTML + CSS + JavaScript + assets
 ↓
Browser rendering
 ↓
Web page
```

## Why this matters

Understanding this sequence makes many web problems easier to debug. Slow DNS, TLS negotiation, server processing, database queries, large assets, and client-side JavaScript can all contribute to page-load time.

The next time you type a URL, remember: the page you see is the final result of several layers of networking and software working together.
$content1$,
        'Web Development',
        ARRAY['Web','HTTP','DNS','Networking','Browser'],
        6
      ),
      (
        '🔌 Understanding APIs',
        'understanding-apis',
        'Learn what APIs are, how requests and responses work, and why APIs are the foundation of modern software integration.',
        $content2$
# 🔌 Understanding APIs

An **API (Application Programming Interface)** is a defined way for one piece of software to communicate with another.

A useful mental model is a restaurant. You choose something from the menu, the waiter carries your request to the kitchen, and the kitchen returns the result. An API plays a similar role between software systems.

## What does an API do?

An API defines things such as:

- What operations are available
- What inputs are expected
- What responses look like
- How errors are reported
- How clients authenticate

For web applications, these rules are commonly exposed through HTTP endpoints.

## A simple API request

Imagine an application exposes:

```text
GET /api/users/42
```

A client sends the request and the server might return JSON:

```json
{
  "id": 42,
  "name": "Alex",
  "role": "developer"
}
```

The frontend can then use that data to update its interface.

## Common HTTP methods

| Method | Typical purpose |
| --- | --- |
| GET | Read data |
| POST | Create data |
| PUT | Replace data |
| PATCH | Partially update data |
| DELETE | Remove data |

These are conventions rather than absolute rules, but following them makes APIs easier to understand.

## Status codes matter

APIs communicate the outcome of a request using HTTP status codes.

- **200 OK** — request succeeded
- **201 Created** — a resource was created
- **400 Bad Request** — invalid input
- **401 Unauthorized** — authentication is required or invalid
- **403 Forbidden** — authenticated but not allowed
- **404 Not Found** — resource does not exist
- **500 Internal Server Error** — server-side failure

Good APIs use these codes consistently so clients can react correctly.

## Authentication and authorization

An API often needs to know who is making a request and what that user is allowed to do. Common approaches include session cookies, API keys, OAuth, and bearer tokens.

Authentication answers **who are you?** Authorization answers **what are you allowed to do?**

These should be enforced on the server rather than relying only on frontend checks.

## REST, GraphQL, and beyond

REST is a popular approach for HTTP APIs, but it is not the only option. GraphQL lets clients request the fields they need through a typed query system. gRPC uses strongly typed service definitions and efficient binary serialization.

The important idea is the contract between the client and the service.

## Why APIs matter

APIs allow different systems to evolve independently. A React frontend can communicate with a Python backend. A mobile application can use the same backend as a website. A service can integrate with payment, maps, messaging, or AI providers without exposing its internal implementation.

That separation is one of the reasons APIs are so important in modern software engineering.
$content2$,
        'Software Engineering',
        ARRAY['API','REST','HTTP','Backend','Software Engineering'],
        5
      ),
      (
        '🗄️ SQL vs NoSQL',
        'sql-vs-nosql',
        'A practical comparison of relational SQL databases and NoSQL databases, including when each approach makes sense.',
        $content3$
# 🗄️ SQL vs NoSQL

Choosing a database is not simply a matter of deciding which technology is more popular. The right choice depends on your data model, consistency requirements, query patterns, scale, and development needs.

## SQL databases

SQL databases are relational databases. Data is organized into tables containing rows and columns, and relationships between tables are commonly represented with keys.

For example:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);
```

Popular relational databases include PostgreSQL, MySQL, MariaDB, and SQL Server.

SQL databases are especially strong when your application has structured data and complex relationships. Transactions and constraints help preserve data integrity.

## NoSQL databases

NoSQL is a broad category that includes document, key-value, wide-column, and graph databases.

A document database might store a user as:

```json
{
  "id": 42,
  "name": "Alex",
  "skills": ["Java", "Python", "SQL"]
}
```

Popular examples include MongoDB, DynamoDB, Cassandra, and Redis for specific NoSQL use cases.

NoSQL systems often make it easier to work with flexible schemas or distribute certain workloads across many machines.

## Key differences

| Area | SQL | NoSQL |
| --- | --- | --- |
| Data model | Relational | Document / key-value / other models |
| Schema | Usually structured | Often flexible |
| Relationships | Strong relational support | Depends on database type |
| Transactions | Strong support | Varies by product |
| Query language | SQL | Database-specific APIs / languages |
| Scaling | Often vertical plus replication | Often designed for horizontal scaling |

## Which one should you choose?

Choose SQL when your data has important relationships, strong consistency matters, and you need expressive queries or transactions.

Consider NoSQL when your workload benefits from a flexible data model, very high-scale distributed access, or a database model that closely matches the application's access pattern.

There is also nothing wrong with using both. A system might use PostgreSQL for core transactional data and Redis for caching, or another specialized store for a particular workload.

## The real lesson

The SQL-versus-NoSQL debate is often presented as a competition. In practice, database selection is an engineering decision.

Start with your requirements and data access patterns. Then choose the simplest database that handles them reliably.
$content3$,
        'Databases',
        ARRAY['SQL','NoSQL','PostgreSQL','MongoDB','Databases'],
        5
      ),
      (
        '🌍 How DNS Works',
        'how-dns-works',
        'A practical guide to DNS, from domain names and recursive resolvers to authoritative servers and caching.',
        $content4$
# 🌍 How DNS Works

Humans prefer names like `example.com`. Networks route traffic using IP addresses. **DNS (Domain Name System)** connects those two worlds by translating domain names into network information.

## Why DNS exists

Remembering an IP address for every website would be painful. DNS lets users work with names while computers can obtain the addresses they need.

For example:

```text
example.com → 93.184.216.34
```

The actual answer can vary because a domain may use multiple records, CDNs, load balancing, or other infrastructure.

## The main players

A typical lookup involves several components:

1. **Client** — your browser or operating system starts the lookup.
2. **Recursive resolver** — searches for the answer on the client's behalf.
3. **Root servers** — direct the resolver toward the correct top-level domain servers.
4. **TLD servers** — handle domains such as `.com`, `.org`, and country-code TLDs.
5. **Authoritative server** — provides the authoritative DNS records for the domain.

## A simplified lookup

Suppose you request `www.example.com` and there is no cached answer.

```text
Browser / OS
    ↓
Recursive resolver
    ↓
Root server
    ↓
.com TLD server
    ↓
Authoritative DNS server
    ↓
IP address
```

The resolver then returns the answer to your device.

## Common DNS record types

- **A** — maps a name to an IPv4 address
- **AAAA** — maps a name to an IPv6 address
- **CNAME** — aliases one hostname to another
- **MX** — identifies mail servers
- **TXT** — stores text used for verification and other purposes
- **NS** — identifies authoritative name servers

## Caching and TTL

DNS would be inefficient if every lookup had to travel through the full hierarchy. Resolvers cache answers for a period controlled by the record's **TTL (Time To Live)**.

Caching makes lookups faster and reduces DNS traffic, but it also means a DNS change may not be visible everywhere immediately.

## DNS is more than name-to-IP mapping

DNS supports much more than simple website lookups. Email delivery uses MX records. Domain verification often uses TXT records. Service discovery and traffic management can also rely on DNS.

Security technologies such as DNSSEC add cryptographic validation to help protect the integrity of DNS responses.

## Why DNS knowledge matters

DNS problems can look like application problems. A website can be perfectly healthy while a stale record, incorrect nameserver configuration, missing record, or resolver issue prevents users from reaching it.

Understanding DNS gives you a powerful debugging skill: when a domain does not work, you can separate **name resolution** from **network connectivity** and **application availability** instead of treating them as one problem.
$content4$,
        'Networking',
        ARRAY['DNS','Networking','Internet','TCP/IP','Web'],
        5
      ),
      (
        '💻 Processes, Threads & Memory',
        'processes-threads-and-memory',
        'Understand how operating systems organize running programs, execute threads, and manage memory.',
        $content5$
# 💻 Processes, Threads & Memory

When you run an application, the operating system has to give it CPU time, memory, and access to system resources. Three concepts are central to understanding this: **processes, threads, and memory**.

## What is a process?

A process is a running instance of a program with its own virtual address space and operating-system-managed resources.

For example, opening a code editor creates a process. The operating system tracks information about it such as its state, memory mappings, open resources, and scheduling information.

Processes provide isolation. A failure in one process does not automatically mean another unrelated process can access its memory.

## What is a thread?

A thread is an execution path within a process. A process can contain one or many threads.

Threads in the same process share resources such as the process's address space, which makes communication between them relatively efficient. The trade-off is that shared memory introduces synchronization problems.

```text
Process
├── Thread 1
├── Thread 2
└── Thread 3
```

A multithreaded application can perform different tasks concurrently, such as handling requests while another thread performs background work.

## Processes vs threads

| Feature | Process | Thread |
| --- | --- | --- |
| Address space | Separate virtual address space | Shared within process |
| Isolation | Higher | Lower |
| Creation cost | Generally higher | Generally lower |
| Communication | IPC mechanisms | Shared memory and synchronization |
| Failure impact | Usually isolated | Can affect the whole process |

The exact costs depend on the operating system and runtime, but the distinction remains important.

## How memory works

A process sees a virtual address space rather than directly working with arbitrary physical RAM addresses. The operating system and hardware translate virtual addresses to physical memory through mechanisms such as page tables.

A simplified process memory layout may contain:

```text
High addresses
┌──────────────┐
│    Stack     │
├──────────────┤
│              │
│   Mapped     │
│   regions    │
│              │
├──────────────┤
│     Heap     │
├──────────────┤
│ Data / BSS   │
├──────────────┤
│    Code      │
└──────────────┘
Low addresses
```

The exact layout varies by operating system, architecture, compiler, and runtime.

## Stack and heap

The **stack** commonly stores function call frames and local execution state. It is managed in a structured last-in-first-out manner.

The **heap** is used for dynamically allocated memory. In languages such as Java, the runtime manages heap allocation and garbage collection. In C and C++, programmers can have more direct responsibility for allocation and deallocation.

## Context switching

The CPU switches between runnable threads and processes. When the operating system changes which execution context is running, it performs a context switch.

Context switching enables multitasking, but it is not free. Excessive scheduling overhead can hurt performance.

## Why these concepts matter

Processes explain isolation. Threads explain concurrent execution. Memory explains how programs store and access data while the operating system protects and manages resources.

Once these ideas are clear, topics such as CPU scheduling, virtual memory, synchronization, deadlocks, and concurrency become much easier to understand.
$content5$,
        'Operating Systems',
        ARRAY['Operating Systems','Processes','Threads','Memory','Concurrency'],
        6
      )
  ) AS v(title, slug, excerpt, content, category, tags, reading_time)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.slug = v.slug
  );
END
$seed$;
