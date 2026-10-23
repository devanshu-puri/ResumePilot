import { ValidatedLearningResource, validateLibrarySeed } from "@/modules/library/domain/content-validator";

export const RAW_LIBRARY_RESOURCES = [
  {
    slug: "redis-caching-patterns",
    title: "Redis In-Memory Architecture & Eviction Policies",
    description: "Deep dive into Redis data structures, memory limits, allkeys-lru vs volatile-lru eviction heuristics, and write-through vs cache-aside architectures.",
    resourceType: "architecture_pattern",
    canonicalUrl: "https://redis.io/docs/latest/develop/reference/eviction/",
    attribution: "Official Redis Documentation / Salvatore Sanfilippo",
    internalNotes: "When Redis reaches maxmemory, the eviction algorithm selectively purges keys based on maxmemory-policy. LRU approximates least recently used via sampling 5 keys. Hashes and Sorted Sets offer efficient sub-object retrieval without serializing entire records.",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    topicSlugs: ["redis-caching", "caching-strategies"],
    objectives: [
      {
        topicSlug: "redis-caching",
        description: "Compare Redis LRU eviction policies and explain when to select allkeys-lru vs volatile-ttl.",
        orderIndex: 0,
      },
      {
        topicSlug: "caching-strategies",
        description: "Analyze the trade-offs between cache-aside and write-through patterns under high write concurrency.",
        orderIndex: 1,
      },
    ],
    activities: [
      {
        id: "act_redis_kc_1",
        activityType: "knowledge_check",
        title: "Redis Eviction & Data Structures Check",
        instructions: "Answer each question by selecting the most technically accurate architectural choice.",
        contentPayload: {
          questions: [
            {
              id: "q1",
              text: "Which Redis maxmemory-policy evicts least recently used keys regardless of whether an expiration TTL is set?",
              options: [
                { id: "opt_a", text: "allkeys-lru", isCorrect: true },
                { id: "opt_b", text: "volatile-lru", isCorrect: false },
                { id: "opt_c", text: "noeviction", isCorrect: false },
                { id: "opt_d", text: "volatile-random", isCorrect: false },
              ],
            },
            {
              id: "q2",
              text: "Under the Cache-Aside pattern, what should occur when a database write updates an existing record?",
              options: [
                { id: "opt_2a", text: "Write directly to cache only, sync DB later", isCorrect: false },
                { id: "opt_2b", text: "Update DB and invalidate (delete) the cached key", isCorrect: true },
                { id: "opt_2c", text: "Flush the entire Redis database instance", isCorrect: false },
                { id: "opt_2d", text: "Increment the Redis replication counter", isCorrect: false },
              ],
            },
          ],
        },
        completionPolicy: { minRatio: 0.8 },
        orderIndex: 0,
      },
    ],
  },

  {
    slug: "postgres-indexing-mastery",
    title: "PostgreSQL B-Tree Indexing & Query Plans",
    description: "Learn how PostgreSQL B-Tree indexes function, column order in composite indexes, covering indexes with INCLUDE, and reading EXPLAIN ANALYZE execution trees.",
    resourceType: "code_deep_dive",
    canonicalUrl: "https://www.postgresql.org/docs/current/indexes-types.html",
    attribution: "The PostgreSQL Global Development Group",
    internalNotes: "B-Tree indexes maintain sorted leaf pages with double-linked lists. In composite indexes (colA, colB), queries filtering solely on colB cannot leverage the index prefix efficiently unless loose index scanning or index-only scans apply. EXPLAIN ANALYZE executes the query and reports actual row counts and execution loops.",
    difficulty: "intermediate",
    estimatedMinutes: 25,
    topicSlugs: ["postgresql", "database-indexing"],
    objectives: [
      {
        topicSlug: "database-indexing",
        description: "Evaluate index selectivity and explain why a leading column in a composite index dictates query usability.",
        orderIndex: 0,
      },
      {
        topicSlug: "postgresql",
        description: "Diagnose sequential scans vs index scans in EXPLAIN ANALYZE outputs.",
        orderIndex: 1,
      },
    ],
    activities: [
      {
        id: "act_pg_sa_1",
        activityType: "short_answer",
        title: "Composite Index Ordering Explanation",
        instructions: "Explain why creating a composite index on (tenant_id, created_at) allows fast range queries for tenant-filtered dates, but does not efficiently accelerate queries filtering only on created_at.",
        contentPayload: {
          prompt: "Explain the column order dependency of PostgreSQL B-Tree composite indexes.",
          expectedRubric: "resume_defense_v1",
        },
        completionPolicy: { minRatio: 0.75 },
        orderIndex: 0,
      },
    ],
  },

  {
    slug: "rest-api-idempotency",
    title: "RESTful HTTP Verbs & Idempotency Guarantees",
    description: "Explore the semantics of GET, POST, PUT, DELETE, and PATCH with respect to safety and idempotency, and implement idempotent POST requests using Idempotency-Key headers.",
    resourceType: "concept_guide",
    canonicalUrl: "https://datatracker.ietf.org/doc/html/rfc7231#section-4.2",
    attribution: "IETF RFC 7231 (HTTP/1.1 Semantics)",
    internalNotes: "An idempotent HTTP method is one where multiple identical requests produce the same server-side outcome as a single request. GET, PUT, and DELETE are idempotent by specification; POST is not. Adding an Idempotency-Key header stores transaction status in Redis or DB to prevent duplicate payment charges.",
    difficulty: "beginner",
    estimatedMinutes: 15,
    topicSlugs: ["rest-api-design", "api-rate-limiting"],
    objectives: [
      {
        topicSlug: "rest-api-design",
        description: "Distinguish safe vs idempotent HTTP methods and explain when to select PUT vs PATCH.",
        orderIndex: 0,
      },
    ],
    activities: [
      {
        id: "act_rest_kc_1",
        activityType: "knowledge_check",
        title: "HTTP Idempotency Verification",
        instructions: "Identify idempotent methods and behavior in REST architectures.",
        contentPayload: {
          questions: [
            {
              id: "rest_q1",
              text: "Which of the following HTTP methods is NOT idempotent according to RFC specifications?",
              options: [
                { id: "o1", text: "GET", isCorrect: false },
                { id: "o2", text: "DELETE", isCorrect: false },
                { id: "o3", text: "POST", isCorrect: true },
                { id: "o4", text: "PUT", isCorrect: false },
              ],
            },
          ],
        },
        completionPolicy: { minRatio: 1.0 },
        orderIndex: 0,
      },
    ],
  },

  {
    slug: "docker-multistage-builds",
    title: "Production Containerization with Multi-Stage Builds",
    description: "Minimize Docker image size and attack surface by separating compile-time SDK tools from minimal runtime Alpine or Distroless base images.",
    resourceType: "architecture_pattern",
    canonicalUrl: "https://docs.docker.com/build/building/multi-stage/",
    attribution: "Docker Official Documentation",
    internalNotes: "Multi-stage builds use multiple FROM lines in one Dockerfile. Artifacts produced in build stages are copied using COPY --from=builder /app/dist /app/dist into a lean scratch or alpine runner, discarding dev dependencies, compilers, and source files.",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    topicSlugs: ["docker", "ci-cd-pipelines"],
    objectives: [
      {
        topicSlug: "docker",
        description: "Construct a multi-stage Dockerfile that separates compiler toolchains from production runtime containers.",
        orderIndex: 0,
      },
    ],
    activities: [],
  },

  {
    slug: "distributed-consensus-cap",
    title: "CAP Theorem & Consistency in Distributed Systems",
    description: "Understand the fundamental trade-offs between Consistency, Availability, and Partition Tolerance in distributed networked systems.",
    resourceType: "trade_off_analysis",
    canonicalUrl: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
    attribution: "Eric Brewer (UC Berkeley / Google)",
    internalNotes: "In any distributed data store experiencing an inevitable network partition (P), one must choose between returning an error or stale data to preserve Availability (AP), or blocking/failing writes to guarantee linearizable Consistency (CP).",
    difficulty: "advanced",
    estimatedMinutes: 20,
    topicSlugs: ["distributed-systems"],
    objectives: [
      {
        topicSlug: "distributed-systems",
        description: "Analyze system trade-offs when choosing between CP and AP guarantees under network partitions.",
        orderIndex: 0,
      },
    ],
    activities: [], // Informational only (PRD LIB-3)
  },
];

export const SEED_LIBRARY_RESOURCES: ValidatedLearningResource[] =
  validateLibrarySeed(RAW_LIBRARY_RESOURCES);
