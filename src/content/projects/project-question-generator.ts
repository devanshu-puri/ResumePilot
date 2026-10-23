import {
  ParsedProject,
  ProjectQuestion,
  ProjectQuestionCategory,
} from "./project-panel-schema";

/**
 * Deterministically synthesizes 10 rigorous senior interview defense questions
 * tailored specifically to a candidate's project, role, tech stack, and metrics.
 * Operates 100% offline with zero LLM latency.
 */
export function generateProjectQuestions(project: ParsedProject): ProjectQuestion[] {
  const pName = project.name.trim();
  const stack = project.techStack && project.techStack.length > 0
    ? project.techStack
    : ["Node.js", "PostgreSQL", "Redis"];

  const primaryDb =
    stack.find((t) => /postgres|mongo|sql|dynamo|mysql/i.test(t)) || "PostgreSQL";
  const cacheOrBroker =
    stack.find((t) => /redis|kafka|rabbit|sqs|memcache/i.test(t)) || "Redis/Kafka";
  const primaryLang =
    stack.find((t) => /typescript|javascript|python|go|java|c\+\+/i.test(t)) || "TypeScript";
  const keyMetric =
    project.metrics && project.metrics.length > 0
      ? project.metrics[0]
      : "15,000 req/sec peak throughput";
  const secondMetric =
    project.metrics && project.metrics.length > 1
      ? project.metrics[1]
      : "45ms p95 latency";

  const rawQuestions: Array<{
    category: ProjectQuestionCategory;
    difficulty: "basic" | "medium" | "hard";
    question: string;
    modelAnswer: string;
    keyPoints: string[];
    commonMistakes: string[];
    followUps: string[];
  }> = [
    {
      category: "Architecture & System Design",
      difficulty: "medium",
      question: `Walk me through the high-level architecture of ${pName}. How do client requests flow from the edge through your services down to ${primaryDb}?`,
      modelAnswer: `**Situation:** In ${pName}, we needed to support ${keyMetric} while keeping services decoupled and resilient to downstream latency spikes.\n\n**Task:** Architect an end-to-end request flow that isolates write throughput, protects the database, and provides predictable response times.\n\n**Action:** Requests enter through an API gateway performing TLS termination and JWT rate limiting. Read operations query an in-memory ${cacheOrBroker} layer using Cache-Aside. Cache misses fall back to read replicas of ${primaryDb}. Write mutations execute within ACID database transactions, which emit events into an asynchronous queue for downstream processing.\n\n**Result:** Successfully achieved ${secondMetric} with zero unhandled spikes during traffic surges.`,
      keyPoints: [
        "Clearly trace Edge / CDN → Gateway → Service → Cache → Database.",
        "Highlight read vs write path separation and database protection.",
        "Quantify the latency and throughput benefits at each layer.",
      ],
      commonMistakes: [
        "Describing the stack without explaining how data flows between components.",
        "Not mentioning failure boundaries between the web tier and storage.",
      ],
      followUps: [
        "What happens when the edge gateway experiences an unexpected spike in invalid requests?",
        "How do you prevent cache misses from saturating the primary database connection pool?",
      ],
    },
    {
      category: "Scale & Performance",
      difficulty: "hard",
      question: `You mentioned achieving ${keyMetric}. How did you identify bottlenecks, benchmark the system, and optimize ${pName} to sustain this load?`,
      modelAnswer: `**Situation:** Under synthetic load testing simulating peak traffic, service latency degraded beyond acceptable SLAs, revealing severe thread pool and database connection saturation.\n\n**Task:** Profile CPU, memory, and database I/O to eliminate bottlenecks and guarantee sustained performance.\n\n**Action:** Using distributed tracing and APM tooling, we profiled slow queries and identified sequential table scans on key lookup tables. We introduced composite B-Tree indexes and migrated session storage from ${primaryDb} to ${cacheOrBroker}. On the runtime side, we tuned Node.js connection pooling and enabled HTTP keep-alive.\n\n**Result:** Reduced p95 latency by over 60%, successfully validating ${keyMetric} during load tests.`,
      keyPoints: [
        "Discuss diagnostic methodology: APM profiling, slow query logs, connection metrics.",
        "Explain targeted optimizations (indexing, caching, connection pooling).",
        "Validate results with before-and-after concrete performance metrics.",
      ],
      commonMistakes: [
        "Claiming scale without explaining how performance was measured or profiled.",
        "Suggesting 'adding more servers' without addressing database and I/O bottlenecks first.",
      ],
      followUps: [
        "How did you isolate database contention from network latency in your profiling?",
        "What automated alerts notify on p99 latency regressions in production?",
      ],
    },
    {
      category: "Failure Modes & Edge Cases",
      difficulty: "hard",
      question: `What is the single biggest point of failure in ${pName}? If ${cacheOrBroker} crashes during peak traffic, how does the system degrade gracefully?`,
      modelAnswer: `**Situation:** In distributed architectures, cache layer downtime can cause an immediate 'thundering herd' that overwhelms the primary database.\n\n**Task:** Design resilient fallback mechanisms and circuit breakers to prevent total system failure when ${cacheOrBroker} is unavailable.\n\n**Action:** We implemented a circuit breaker with exponential backoff. When ${cacheOrBroker} timeouts exceed a 5% error threshold, the circuit trips: instead of cascading all traffic into ${primaryDb}, non-critical reads degrade to stale local memory caches, and aggressive client-side rate limiting activates.\n\n**Result:** The system remains 99.9% available in degraded mode, preventing primary database crashes and allowing the cache cluster to recover safely.`,
      keyPoints: [
        "Acknowledge the cascade failure hazard (Cache Stampede / Thundering Herd).",
        "Describe circuit breaker patterns and degraded mode behavior.",
        "Explain self-healing and recovery steps once dependencies return.",
      ],
      commonMistakes: [
        "Assuming dependencies will never fail or having no degraded fallback plan.",
        "Letting all requests fall back directly to the primary database, crashing the entire platform.",
      ],
      followUps: [
        "How does the circuit breaker transition from open to half-open state during recovery?",
        "What metrics trigger automated alerts to on-call engineers when degraded mode activates?",
      ],
    },
    {
      category: "Trade-offs & Alternatives",
      difficulty: "medium",
      question: `Why did you select ${primaryDb} and ${cacheOrBroker} for ${pName} instead of alternatives like MongoDB or DynamoDB? What trade-offs did you accept?`,
      modelAnswer: `**Situation:** Designing the storage layer required balancing relational schema consistency against horizontal write scaling.\n\n**Task:** Select a data store that guarantees ACID compliance for core records while maintaining sub-50ms reads.\n\n**Action:** We selected ${primaryDb} over document stores because our transactional domain required foreign key constraints, atomic multi-table updates, and complex analytical reporting. The trade-off is vertical scaling limits and the need for connection poolers like PgBouncer. To offload heavy reads, we complemented it with ${cacheOrBroker}.\n\n**Result:** Guaranteed 100% data integrity without duplicate records, while maintaining ${secondMetric} on cached reads.`,
      keyPoints: [
        "State the exact requirements that disqualified the alternative (e.g. relational integrity vs document flexibility).",
        "Articulate the trade-offs accepted (e.g. operational complexity, sharding difficulty).",
        "Avoid calling any technology 'strictly superior' — focus on fit for purpose.",
      ],
      commonMistakes: [
        "Saying 'we chose it because we were familiar with it' without technical justification.",
        "Ignoring the downsides or operational overhead of the chosen technology.",
      ],
      followUps: [
        "Under what conditions would you consider migrating this workload to a NoSQL or DynamoDB store?",
        "How do you handle schema migrations across versions without downtime?",
      ],
    },
    {
      category: "Data Modeling & Storage",
      difficulty: "medium",
      question: `Explain the schema and data model in ${primaryDb} for ${pName}. How did you handle normalization, foreign keys, and indexing?`,
      modelAnswer: `**Situation:** The project required modeling multi-tenant entities with high read-to-write ratios and relational associations.\n\n**Task:** Design a normalized 3NF schema that enforces integrity while optimizing high-frequency query paths.\n\n**Action:** We normalized core entities with foreign keys and unique constraints to prevent data anomalies. For high-volume querying, we introduced composite B-Tree indexes on (tenant_id, created_at, status). Where join overhead on hot endpoints exceeded 20ms, we selectively denormalized aggregated summary counters updated via database triggers.\n\n**Result:** Maintained strict referential integrity with zero orphan records, keeping critical query plans under 5ms execution time.`,
      keyPoints: [
        "Explain normalization baseline (3NF) and deliberate selective denormalization.",
        "Detail index strategies: composite indexes, leftmost prefix rule, covering indexes.",
        "Explain how data integrity and constraints are enforced at the database level.",
      ],
      commonMistakes: [
        "Over-normalizing without considering join performance at high query volume.",
        "Adding indexes indiscriminately without analyzing write overhead or query execution plans (EXPLAIN ANALYZE).",
      ],
      followUps: [
        "How do you monitor table bloat and index efficiency over time?",
        "What was your archiving and partition strategy for older historical records?",
      ],
    },
    {
      category: "Concurrency & Race Conditions",
      difficulty: "hard",
      question: `In ${pName}, what happens if two concurrent requests attempt to modify the exact same resource simultaneously? How did you prevent race conditions and double mutations?`,
      modelAnswer: `**Situation:** During peak traffic, simultaneous client requests or webhook retries could attempt to update the same record, leading to lost updates or double-processing.\n\n**Task:** Implement strict concurrency controls to guarantee idempotency and avoid inconsistent state.\n\n**Action:** For critical mutation endpoints, we enforced client Idempotency-Keys cached in ${cacheOrBroker}. At the database layer, we used optimistic concurrency control (OCC) with a version integer column (\`WHERE id = ? AND version = ?\`). For inventory reservation, we used pessimistic row-level locking (\`SELECT ... FOR UPDATE\`) inside an explicit transaction.\n\n**Result:** Completely eliminated double-charging and race conditions, maintaining 100% idempotent execution on retries.`,
      keyPoints: [
        "Distinguish between Optimistic Locking (versioning) and Pessimistic Locking (SELECT FOR UPDATE).",
        "Explain API idempotency keys for network retries and webhook deduplication.",
        "Discuss deadlock avoidance and lock timeout settings.",
      ],
      commonMistakes: [
        "Relying on application-level checks (\`if (exists)\`) without database transactional locks.",
        "Holding database locks across slow external HTTP network calls.",
      ],
      followUps: [
        "How do you handle deadlocks when multiple transactions lock rows in different orders?",
        "How long do you retain idempotency keys before clearing them?",
      ],
    },
    {
      category: "Scale & Performance",
      difficulty: "medium",
      question: `How does ${pName} handle asynchronous background tasks and job processing? What happens if worker processes crash mid-job?`,
      modelAnswer: `**Situation:** Intensive operations like report generation and notification dispatch could not be executed synchronously on the HTTP request thread.\n\n**Task:** Build an asynchronous worker queue that guarantees at-least-once delivery and fault-tolerant job completion.\n\n**Action:** We used message broker queues backed by ${cacheOrBroker}. Workers pull jobs with visibility timeouts and acknowledge only after successful processing. If a worker crashes mid-execution, the visibility timeout expires and the message is automatically requeued for another worker. Failed jobs after 3 retries move to a Dead Letter Queue (DLQ).\n\n**Result:** Decoupled HTTP API response times from background work, keeping API latency under 50ms while processing millions of background jobs reliably.`,
      keyPoints: [
        "Explain job queue mechanics: Producer → Broker → Consumer with acknowledgments.",
        "Describe failure handling: Visibility timeouts, retries, exponential backoff, Dead Letter Queues.",
        "Emphasize worker idempotency so retry replays do not duplicate effects.",
      ],
      commonMistakes: [
        "Executing long-running tasks synchronously inside the HTTP request loop.",
        "Not designing workers to be idempotent when processing retried queue messages.",
      ],
      followUps: [
        "How do you inspect, replay, or discard poisoned messages from the Dead Letter Queue?",
        "How do you scale worker pods dynamically based on queue depth?",
      ],
    },
    {
      category: "Failure Modes & Edge Cases",
      difficulty: "hard",
      question: `Tell me about a challenging production bug or outage you encountered in ${pName}. How did you diagnose the root cause and ensure it never happens again?`,
      modelAnswer: `**Situation:** During a high-traffic release, our services threw 504 Gateway Timeouts, and latency spiked across all endpoints simultaneously.\n\n**Task:** Triage the ongoing incident, mitigate customer impact immediately, and identify the root cause.\n\n**Action:** First, I inspected APM dashboards and noticed connection pool exhaustion in ${primaryDb}. We temporarily throttled non-critical background jobs to restore service availability within 8 minutes. In post-mortem log analysis, we found an unindexed query introduced in an edge-case filter, causing full sequential scans on 10M rows. We deployed an index migration, added query timeouts, and integrated an index check into CI.\n\n**Result:** Restored availability in 8 minutes with zero data loss. Automated CI checks prevented unindexed queries from reaching production again.`,
      keyPoints: [
        "Demonstrate systematic triage: Stop the bleeding first, then diagnose root cause.",
        "Explain blameless post-mortem methodology and long-term preventative fixes.",
        "Quantify recovery time (MTTR) and customer impact.",
      ],
      commonMistakes: [
        "Focusing solely on debugging in production instead of restoring customer service first.",
        "Failing to mention preventative mechanisms, regression tests, or monitoring added afterward.",
      ],
      followUps: [
        "What was your communication protocol with stakeholders during the outage?",
        "How do you verify backups and failover procedures in staging?",
      ],
    },
    {
      category: "Architecture & System Design",
      difficulty: "basic",
      question: `What was your automated testing and deployment pipeline for ${pName}? How did you ensure zero-downtime deployments?`,
      modelAnswer: `**Situation:** To ship features rapidly without breaking production, we needed an automated CI/CD pipeline with zero-downtime guarantees.\n\n**Task:** Establish a testing pyramid and continuous deployment workflow that catches regressions before release.\n\n**Action:** We structured tests with ~70% unit tests (isolated business logic), ~25% integration tests using Docker containers for ${primaryDb} and ${cacheOrBroker}, and ~5% E2E smoke tests. In CI, every PR runs linter, typecheck, and tests. On merge, container images are built and deployed via rolling updates with automated readiness health checks.\n\n**Result:** Maintained 95%+ test coverage on core services and achieved seamless zero-downtime deployments.`,
      keyPoints: [
        "Break down the testing pyramid: Unit (fast, isolated), Integration (real DB/cache), E2E.",
        "Detail CI pipeline stages: Lint → Type Check → Test → Container Build → Deploy.",
        "Explain zero-downtime strategies: Rolling updates with readiness health check probes.",
      ],
      commonMistakes: [
        "Relying 100% on unit tests with mocked databases, leaving SQL queries untested.",
        "Performing manual database migrations directly in production without rollback scripts.",
      ],
      followUps: [
        "How do you run database schema migrations without downtime when modifying existing columns?",
        "How do you manage secrets and environment variables securely in your deployment pipeline?",
      ],
    },
    {
      category: "Trade-offs & Alternatives",
      difficulty: "medium",
      question: `Looking back on ${pName}, what architectural decision would you make differently today, and why?`,
      modelAnswer: `**Situation:** In early development, we coupled several business domains into a single service codebase to maximize shipping velocity.\n\n**Task:** Evaluate the architectural trade-offs made early on versus current operational requirements.\n\n**Action:** As the team and feature set expanded, shared database transactions between domains created deployment coupling and occasional lock contention. Today, I would enforce domain boundaries earlier using the modular monolith pattern with explicit module interfaces, before considering separate microservices.\n\n**Result:** This insight taught me to align architecture with team boundaries and prioritize domain decoupling over premature distributed complexity.`,
      keyPoints: [
        "Show mature technical self-reflection without undermining your own accomplishment.",
        "Explain the contextual constraints that led to the original decision.",
        "Articulate the alternative architectural pattern with clear engineering rationale.",
      ],
      commonMistakes: [
        "Claiming the architecture was 100% perfect and nothing needs improvement.",
        "Blaming tools or teammates instead of discussing technical trade-offs and growth.",
      ],
      followUps: [
        "What metrics would indicate it is time to split a modular monolith into microservices?",
        "How do you prevent premature optimization when building early-stage projects?",
      ],
    },
  ];

  return rawQuestions.map((q, idx) => ({
    id: `pq_${project.id}_${idx + 1}`,
    projectId: project.id,
    category: q.category,
    difficulty: q.difficulty,
    question: q.question,
    modelAnswer: q.modelAnswer,
    keyPoints: q.keyPoints,
    commonMistakes: q.commonMistakes,
    followUps: q.followUps,
    status: "unreviewed",
  }));
}
