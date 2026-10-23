import { DrillQuestion } from "./drill-schema";

export const VERIFIED_DRILL_QUESTIONS: DrillQuestion[] = [
  // ----------------------------------------------------
  // React Questions
  // ----------------------------------------------------
  {
    id: "react_stale_closure_01",
    skillId: "React",
    type: "debug",
    difficulty: "medium",
    stem: "In React functional components, what primary condition causes a 'stale closure' inside a useCallback or useEffect hook?",
    codeSnippet: `const [count, setCount] = useState(0);

const handleLog = useCallback(() => {
  console.log("Count is:", count);
}, []); // Empty dependency array`,
    codeLanguage: "typescript",
    options: [
      { id: "opt_a", text: "React re-renders the component asynchronously without updating the DOM tree." },
      { id: "opt_b", text: "The callback closes over the lexical environment of the first render and never updates because count is omitted from dependencies." },
      { id: "opt_c", text: "State updates in React are mutated in-place, confusing Javascript's garbage collector." },
      { id: "opt_d", text: "The useCallback hook runs synchronously before useState initialises." },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "In JavaScript, closures retain references to variables in their scope at creation time. With an empty dependency array `[]`, useCallback caches the first render's function instance, closing over the initial `count = 0` forever.",
      distractors: {
        opt_a: "Stale closures are an artifact of JavaScript lexical scoping and hook memoization, not React's asynchronous reconciliation scheduler.",
        opt_c: "React state is immutable; setters create new state references rather than mutating values in-place.",
        opt_d: "useState initializes on component mount before any callbacks are executed.",
      },
      takeaway: "Always include referenced reactive values in hook dependency arrays or use state updater functions `(prev => prev + 1)`.",
    },
    xpAward: 15,
  },
  {
    id: "react_use_action_state_02",
    skillId: "React",
    type: "mcq",
    difficulty: "hard",
    stem: "What is the primary architectural purpose of `useActionState` introduced in React 19?",
    codeSnippet: `const [state, formAction, isPending] = useActionState(updateName, null);`,
    codeLanguage: "typescript",
    options: [
      { id: "opt_a", text: "It replaces Redux and Zustand for global client-side state management." },
      { id: "opt_b", text: "It manages optimistic UI updates before network responses return." },
      { id: "opt_c", text: "It wraps async form actions, providing current state, action dispatcher, and an isPending transition flag automatically." },
      { id: "opt_d", text: "It caches API responses across page navigations in memory." },
    ],
    correctOptionId: "opt_c",
    explanation: {
      why: "`useActionState` is React 19's native primitive for managing async action state in forms, exposing `isPending`, the returned state, and formAction dispatcher without manual `try/catch` and `setIsLoading` boilerplate.",
      distractors: {
        opt_a: "It is a localized hook for form actions, not an application-wide global state store.",
        opt_b: "Optimistic UI updates are handled by `useOptimistic`, not `useActionState`.",
        opt_d: "Response caching across navigations is handled by data fetching frameworks or React Cache, not this action hook.",
      },
      takeaway: "In React technical rounds, emphasize how `useActionState` eliminates manual pending booleans and seamlessly supports progressive enhancement.",
    },
    xpAward: 15,
  },
  {
    id: "react_custom_hook_03",
    skillId: "React",
    type: "approach",
    difficulty: "basic",
    stem: "What is the primary architectural reason to extract component state logic into a Custom Hook in React?",
    options: [
      { id: "opt_a", text: "To share stateful logic between components without sharing actual state instances." },
      { id: "opt_b", text: "To make components render faster by bypassing the Virtual DOM reconciliation." },
      { id: "opt_c", text: "To create global singleton state shared by all instances of the hook." },
      { id: "opt_d", text: "To allow hooks to be called inside conditional if/else blocks." },
    ],
    correctOptionId: "opt_a",
    explanation: {
      why: "Custom hooks let you extract and reuse stateful logic (like subscription management, form handling, or debounce) across multiple components, while each component instance maintains its own completely independent state.",
      distractors: {
        opt_b: "Custom hooks execute standard React hooks internally; they do not bypass reconciliation.",
        opt_c: "Custom hooks create isolated state per caller; they are not singletons unless backed by a React Context or external store.",
        opt_d: "The Rules of Hooks still strictly apply to custom hooks — they can never be called conditionally.",
      },
      takeaway: "Custom hooks share stateful logic, not state values. Highlight clean separation of presentation vs domain logic in interview answers.",
    },
    xpAward: 15,
  },

  // ----------------------------------------------------
  // TypeScript Questions
  // ----------------------------------------------------
  {
    id: "ts_unknown_vs_any_01",
    skillId: "TypeScript",
    type: "mcq",
    difficulty: "basic",
    stem: "Why is `unknown` preferred over `any` for parsing external, untrusted API responses or user inputs in TypeScript?",
    codeSnippet: `function parsePayload(input: unknown) {
  // TypeScript enforces type-narrowing before property access
  if (typeof input === "object" && input !== null && "id" in input) {
    console.log(input.id);
  }
}`,
    codeLanguage: "typescript",
    options: [
      { id: "opt_a", text: "Because `unknown` casts the variable to a string at runtime." },
      { id: "opt_b", text: "Because `unknown` disables the type-checker for maximum runtime flexibility." },
      { id: "opt_c", text: "Because `unknown` enforces type narrowing or assertions before any operations or property accesses can be performed." },
      { id: "opt_d", text: "Because `any` cannot be used inside generic functions." },
    ],
    correctOptionId: "opt_c",
    explanation: {
      why: "`unknown` is the type-safe counterpart of `any`. Anything is assignable to `unknown`, but TypeScript prohibits reading properties, calling it, or constructing it until you narrow the type using guards, assertions, or schemas (e.g. Zod).",
      distractors: {
        opt_a: "TypeScript types are erased at compile-time and perform zero runtime conversions.",
        opt_b: "`any` disables type-checking; `unknown` strictly enforces type-checking.",
        opt_d: "`any` can be used anywhere in TypeScript, including generic constraints.",
      },
      takeaway: "In senior TypeScript interviews, state that `any` silences the compiler while `unknown` forces the developer to handle edge cases explicitly.",
    },
    xpAward: 15,
  },
  {
    id: "ts_satisfies_operator_02",
    skillId: "TypeScript",
    type: "output",
    difficulty: "medium",
    stem: "What is the key advantage of the `satisfies` operator in TypeScript 4.9+ compared to a standard type annotation?",
    codeSnippet: `type Palette = Record<"primary" | "secondary", string | [number, number, number]>;

// Using satisfies:
const theme = {
  primary: "#10b981",
  secondary: [16, 185, 129],
} satisfies Palette;

// What does TypeScript infer for theme.primary.toLowerCase()?`,
    codeLanguage: "typescript",
    options: [
      { id: "opt_a", text: "It throws a compiler error because primary is a union type." },
      { id: "opt_b", text: "It validates the object against Palette while preserving the exact literal type `string` for primary, allowing string methods without narrowing." },
      { id: "opt_c", text: "It freezes the object at runtime using Object.freeze()." },
      { id: "opt_d", text: "It coerces the secondary array into a hex string." },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "`satisfies` validates that an expression matches a type contract without widening the inferred type. `theme.primary` remains typed as `string` rather than `string | [number, number, number]`, preserving method access.",
      distractors: {
        opt_a: "A regular annotation `const theme: Palette` would cause an error because it widens to the union, but `satisfies` does not.",
        opt_c: "`satisfies` is pure compile-time type-checking and produces zero runtime code.",
        opt_d: "TypeScript operators never mutate or coerce runtime values.",
      },
      takeaway: "Use `satisfies` when you need both contract conformance and precise inferred property types.",
    },
    xpAward: 15,
  },
  {
    id: "ts_discriminated_union_03",
    skillId: "TypeScript",
    type: "approach",
    difficulty: "hard",
    stem: "Which pattern guarantees exhaustive compile-time checking across all state variants in a Reducer or State Machine?",
    codeSnippet: `type Result = 
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function handle(res: Result) {
  switch (res.status) {
    case "success": return res.data;
    case "error": return res.error.message;
    default:
      const _exhaustive: never = res;
      throw new Error("Unhandled case");
  }
}`,
    codeLanguage: "typescript",
    options: [
      { id: "opt_a", text: "Using `instanceof` checks with prototype inheritance." },
      { id: "opt_b", text: "Discriminated unions with an exhaustive `never` assertion in the default branch." },
      { id: "opt_c", text: "Optional chaining on nullable payload properties." },
      { id: "opt_d", text: "Type casting all variants to `Record<string, any>`." },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "A discriminated union shares a common literal discriminant field (like `status`). Assigning unhandled cases to `never` ensures that if a new variant is added to `Result`, TypeScript will fail compilation until the new case is handled.",
      distractors: {
        opt_a: "`instanceof` works only on classes and fails for plain JSON objects and network payloads.",
        opt_c: "Optional chaining masks missing cases and results in silent `undefined` bugs at runtime.",
        opt_d: "Casting to `any` destroys type safety and disables all compiler exhaustiveness checks.",
      },
      takeaway: "Pair discriminated unions with `const _exhaustive: never = x` to ensure your state machines cannot introduce unhandled states.",
    },
    xpAward: 15,
  },

  // ----------------------------------------------------
  // PostgreSQL Questions
  // ----------------------------------------------------
  {
    id: "pg_indexing_composite_01",
    skillId: "PostgreSQL",
    type: "approach",
    difficulty: "medium",
    stem: "You have a composite index `CREATE INDEX idx_orders ON orders (tenant_id, created_at, status);`. Which of the following queries CANNOT effectively use this index?",
    codeSnippet: `-- Index: (tenant_id, created_at, status)
-- Which query fails to utilize the index for filtering?`,
    codeLanguage: "sql",
    options: [
      { id: "opt_a", text: "SELECT * FROM orders WHERE tenant_id = 42 AND created_at > '2024-01-01';" },
      { id: "opt_b", text: "SELECT * FROM orders WHERE tenant_id = 42;" },
      { id: "opt_c", text: "SELECT * FROM orders WHERE created_at > '2024-01-01' AND status = 'shipped';" },
      { id: "opt_d", text: "SELECT * FROM orders WHERE tenant_id = 42 AND created_at = '2024-01-01' AND status = 'shipped';" },
    ],
    correctOptionId: "opt_c",
    explanation: {
      why: "B-Tree composite indexes work like a phone book sorted by (Last Name, First Name). You cannot look up someone by First Name alone without the leading column. Queries omitting `tenant_id` must perform a full sequential scan.",
      distractors: {
        opt_a: "Uses the leading column `tenant_id` and the second column `created_at` range; highly efficient.",
        opt_b: "Uses the leading prefix column `tenant_id`; perfectly valid index lookup.",
        opt_d: "Matches all 3 index columns exactly; uses the full index.",
      },
      takeaway: "In database design questions, always place the highest-cardinality equality filter column first in composite indexes.",
    },
    xpAward: 15,
  },
  {
    id: "pg_transaction_isolation_02",
    skillId: "PostgreSQL",
    type: "mcq",
    difficulty: "hard",
    stem: "What concurrency anomaly does PostgreSQL's default `READ COMMITTED` isolation level allow, which `REPEATABLE READ` prevents?",
    options: [
      { id: "opt_a", text: "Dirty reads (reading uncommitted writes from other transactions)." },
      { id: "opt_b", text: "Non-repeatable reads (re-reading a row in the same transaction returns newly committed modifications from another transaction)." },
      { id: "opt_c", text: "Hardware crash corruption." },
      { id: "opt_d", text: "Primary key collisions." },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "Under `READ COMMITTED`, each query in a transaction sees a fresh snapshot of committed data. Re-executing the same `SELECT` can return altered values. Under `REPEATABLE READ`, the snapshot is taken at the start of the transaction, ensuring consistent reads throughout.",
      distractors: {
        opt_a: "PostgreSQL never permits dirty reads under any isolation level due to MVCC architecture.",
        opt_c: "Hardware crash recovery is governed by Write-Ahead Logging (WAL), not isolation levels.",
        opt_d: "Primary key uniqueness constraints are checked deterministically on write regardless of isolation level.",
      },
      takeaway: "For financial reports, multi-step checkout calculations, or snapshot exports, specify `REPEATABLE READ` or `SERIALIZABLE`.",
    },
    xpAward: 15,
  },
  {
    id: "pg_connection_pool_03",
    skillId: "PostgreSQL",
    type: "approach",
    difficulty: "basic",
    stem: "Why do production serverless architectures (like Next.js on Vercel or AWS Lambda) require connection poolers like PgBouncer or Supabase Pooler?",
    options: [
      { id: "opt_a", text: "PostgreSQL forks a dedicated backend process (~5-10MB RAM) per connection; hundreds of ephemeral lambdas will instantly exhaust database connection limits." },
      { id: "opt_b", text: "PostgreSQL requires SSL certificates that cannot be parsed in Node.js without a proxy." },
      { id: "opt_c", text: "To compress SQL query text over the wire." },
      { id: "opt_d", text: "To automatically convert relational tables into MongoDB documents." },
    ],
    correctOptionId: "opt_a",
    explanation: {
      why: "Each native PostgreSQL connection spawns a separate OS process consuming ~5MB-10MB of memory. Serverless scaling can spawn 500 lambda instances simultaneously, exhausting `max_connections` (usually 100) and crashing the DB without pooling.",
      distractors: {
        opt_b: "Node.js natively supports TLS/SSL connections to PostgreSQL.",
        opt_c: "Connection poolers manage TCP connection reuse; they do not perform custom SQL compression.",
        opt_d: "Poolers do not alter data formats.",
      },
      takeaway: "Mention transaction-mode pooling (e.g. PgBouncer on port 6543) when discussing serverless backend scale.",
    },
    xpAward: 15,
  },

  // ----------------------------------------------------
  // Redis Questions
  // ----------------------------------------------------
  {
    id: "redis_eviction_policy_01",
    skillId: "Redis",
    type: "mcq",
    difficulty: "medium",
    stem: "When Redis reaches its `maxmemory` threshold, which eviction policy evicts the least recently used keys regardless of whether a TTL expiration was set?",
    options: [
      { id: "opt_a", text: "volatile-lru" },
      { id: "opt_b", text: "allkeys-lru" },
      { id: "opt_c", text: "volatile-ttl" },
      { id: "opt_d", text: "noeviction" },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "`allkeys-lru` evicts the least recently used keys across the entire dataset. `volatile-lru` only evicts among keys that have an expire TTL set.",
      distractors: {
        opt_a: "`volatile-lru` only evicts keys with expiration set, which causes OOM errors if non-expiring keys fill memory.",
        opt_c: "`volatile-ttl` evicts keys with the shortest remaining time-to-live.",
        opt_d: "`noeviction` returns write errors (`OOM command not allowed`) when memory is full.",
      },
      takeaway: "For pure cache-aside caches where all keys are re-creatable from a primary DB, `allkeys-lru` or `allkeys-lfu` is the recommended policy.",
    },
    xpAward: 15,
  },
  {
    id: "redis_cache_stampede_02",
    skillId: "Redis",
    type: "debug",
    difficulty: "hard",
    stem: "Under high concurrency (10,000 req/sec), a popular cached homepage key expires. All 10,000 requests simultaneously miss the cache and query the database. What architectural pattern best prevents this 'Cache Stampede'?",
    codeSnippet: `// Problem: Cache Stampede / Thundering Herd
async function getTopProducts() {
  const cached = await redis.get("top_products");
  if (cached) return JSON.parse(cached);

  // 10,000 concurrent executions hit Postgres at once!
  const data = await db.query("SELECT * FROM products ORDER BY sales DESC LIMIT 20");
  await redis.set("top_products", JSON.stringify(data), "EX", 300);
  return data;
}`,
    codeLanguage: "typescript",
    options: [
      { id: "opt_a", text: "Increase Redis memory by 10x." },
      { id: "opt_b", text: "Use Distributed Locking (e.g. Redlock / mutex) or Probabilistic Early Expiration (XFetch) so only one worker queries the DB while others wait or serve stale." },
      { id: "opt_c", text: "Disable all cache expiration TTLs permanently." },
      { id: "opt_d", text: "Move the Redis database onto the same machine as PostgreSQL." },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "A distributed mutex (`SET key val NX EX 10`) ensures only the first request queries the DB to repopulate the cache, while concurrent requests wait or serve the previous stale entry until updated.",
      distractors: {
        opt_a: "Stampedes occur on key expiration, not when Redis runs out of memory.",
        opt_c: "Disabling TTLs leads to permanently stale data and memory exhaustion.",
        opt_d: "Colocating servers does not prevent database connection pool saturation.",
      },
      takeaway: "In system design interviews, mention mutex locks or background cron refresh workers to prevent thundering herds on hot keys.",
    },
    xpAward: 15,
  },
  {
    id: "redis_data_structures_03",
    skillId: "Redis",
    type: "approach",
    difficulty: "basic",
    stem: "Which Redis data structure is optimal for building a real-time leaderboard sorted by user scores?",
    options: [
      { id: "opt_a", text: "Redis Hashes (HSET)" },
      { id: "opt_b", text: "Redis Sorted Sets (ZSET)" },
      { id: "opt_c", text: "Redis Lists (LPUSH)" },
      { id: "opt_d", text: "Redis Sets (SADD)" },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "Redis Sorted Sets (ZSET) maintain elements ordered by a floating-point score using a combination of a hash table and a skip list, providing O(log(N)) insertions, rank lookups (ZRANK), and range queries (ZREVRANGE).",
      distractors: {
        opt_a: "Hashes store field-value pairs without order or score ranking.",
        opt_c: "Lists maintain insertion order; finding rank or sorting requires O(N) traversal.",
        opt_d: "Sets store unique unordered strings with no score association.",
      },
      takeaway: "Sorted Sets (ZSET) are the standard answer for leaderboards, rate-limit sliding windows, and priority queues in Redis.",
    },
    xpAward: 15,
  },

  // ----------------------------------------------------
  // System Design Questions
  // ----------------------------------------------------
  {
    id: "sys_idempotency_keys_01",
    skillId: "System Design",
    type: "approach",
    difficulty: "medium",
    stem: "How does an API provider (e.g. Stripe, Razorpay) use an `Idempotency-Key` HTTP header to prevent double-charging during network retries?",
    codeSnippet: `POST /v1/charges
Idempotency-Key: e1a3f0c2-9b24-4f81-8173
Amount: $50.00`,
    codeLanguage: "typescript",
    options: [
      { id: "opt_a", text: "The server stores the key with a lock and cached response; duplicate requests with the same key return the original response without re-executing payment." },
      { id: "opt_b", text: "The client generates a hash of the credit card number to verify identity." },
      { id: "opt_c", text: "The key encrypts the payment payload end-to-end using AES-256." },
      { id: "opt_d", text: "The server forwards the key directly to Visa as an authorization code." },
    ],
    correctOptionId: "opt_a",
    explanation: {
      why: "When a request arrives, the server checks whether the idempotency key exists in a transactional database or Redis. If currently processing, concurrent requests wait. If already completed, the saved HTTP response is returned immediately without re-charging.",
      distractors: {
        opt_b: "Idempotency keys are random UUIDs generated per operation, not card hashes.",
        opt_c: "Idempotency keys ensure single execution; TLS handles transmission encryption.",
        opt_d: "Idempotency is an application-level guarantee managed by the merchant API gateway.",
      },
      takeaway: "In payment and webhook interviews, explain the 3 states of an idempotency record: `started`, `completed`, and `failed`.",
    },
    xpAward: 15,
  },
  {
    id: "sys_rate_limiting_sliding_window_02",
    skillId: "System Design",
    type: "mcq",
    difficulty: "hard",
    stem: "Why is the Sliding Window Log or Sliding Window Counter preferred over the Fixed Window Counter algorithm for API rate limiting?",
    options: [
      { id: "opt_a", text: "Because Fixed Window uses more memory than Sliding Window." },
      { id: "opt_b", text: "Because Fixed Window allows up to 2x the burst limit at the boundary edges between consecutive windows." },
      { id: "opt_c", text: "Because Sliding Window does not require a database." },
      { id: "opt_d", text: "Because Fixed Window cannot be used with JSON APIs." },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "If a limit is 100 req/min, a client can send 100 requests at 00:59 and another 100 at 01:00 under Fixed Window, allowing 200 requests within a 2-second interval. Sliding Window accounts for the rolling timeline.",
      distractors: {
        opt_a: "Sliding window log actually consumes more memory than fixed window because timestamps must be tracked.",
        opt_c: "Both algorithms typically leverage in-memory stores like Redis.",
        opt_d: "Rate limiting operates on HTTP headers and IP/token addresses, independent of payload format.",
      },
      takeaway: "Highlight the boundary burst vulnerability of Fixed Window counters when architecting rate limiters.",
    },
    xpAward: 15,
  },
  {
    id: "sys_eventual_consistency_03",
    skillId: "System Design",
    type: "approach",
    difficulty: "medium",
    stem: "Under the CAP theorem, when a network partition (P) occurs between distributed data centers, what does choosing Availability (A) over Consistency (C) mean for user reads?",
    options: [
      { id: "opt_a", text: "The system halts all operations and throws 500 errors to prevent data divergence." },
      { id: "opt_b", text: "Every replica responds to reads without waiting for partition sync, which may return stale data until the partition heals." },
      { id: "opt_c", text: "Data is immediately replicated using quantum entanglement with zero latency." },
      { id: "opt_d", text: "All writes are discarded and memory is wiped clean." },
    ],
    correctOptionId: "opt_b",
    explanation: {
      why: "Choosing AP means the system continues accepting reads and writes locally on each side of the partition. Users receive successful 200 responses, but replicas temporarily diverge until asynchronous reconciliation (eventual consistency).",
      distractors: {
        opt_a: "Halting operations to preserve strict correctness is choosing CP (Consistency over Availability).",
        opt_c: "Physics prohibits zero-latency communication across physical partitions.",
        opt_d: "AP systems buffer and persist writes; they never wipe memory.",
      },
      takeaway: "In distributed systems interviews, ground CAP choices in real use cases: DNS and shopping cart views favor AP; account balances and ticket reservations require CP.",
    },
    xpAward: 15,
  },
];

export const ALL_DRILL_QUESTIONS = VERIFIED_DRILL_QUESTIONS;

export function getAvailableSkills(): string[] {
  const skills = new Set<string>();
  for (const q of VERIFIED_DRILL_QUESTIONS) {
    skills.add(q.skillId);
  }
  return Array.from(skills);
}

export function getQuestionsBySkills(
  skills: string[],
  difficulty?: "basic" | "medium" | "hard" | "mixed",
  limit?: number
): DrillQuestion[] {
  const normalized = skills.map((s) => s.toLowerCase().trim());
  let filtered = VERIFIED_DRILL_QUESTIONS.filter((q) =>
    normalized.length === 0 || normalized.includes(q.skillId.toLowerCase())
  );

  if (difficulty && difficulty !== "mixed") {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  if (limit && limit > 0) {
    return filtered.slice(0, limit);
  }

  return filtered;
}

export function getQuestionById(id: string): DrillQuestion | undefined {
  return VERIFIED_DRILL_QUESTIONS.find((q) => q.id === id);
}

