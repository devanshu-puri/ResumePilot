import { PrismaClient } from "@prisma/client";

export const CANONICAL_TOPICS = [
  // 1. Core Language & Frontend
  {
    slug: "javascript",
    name: "JavaScript Core & Runtime",
    description: "Event loop, closures, prototypes, asynchronous execution, and modern ECMAScript standards.",
    category: "Frontend",
  },
  {
    slug: "typescript",
    name: "TypeScript",
    description: "Static typing, generics, utility types, structural typing, and compiler configuration.",
    category: "Frontend",
  },
  {
    slug: "react",
    name: "React & Component Lifecycle",
    description: "Virtual DOM, hooks, reconciliation, concurrent features, and server components.",
    category: "Frontend",
  },
  {
    slug: "state-management",
    name: "Client State Management",
    description: "Global vs local state, Context API, Redux/Zustand principles, immutability, and state colocation.",
    category: "Frontend",
  },
  {
    slug: "web-performance",
    name: "Web Performance & Core Vitals",
    description: "Bundle splitting, lazy loading, rendering metrics (LCP, INP, CLS), and network optimization.",
    category: "Frontend",
  },

  // 2. Backend & API Design
  {
    slug: "nodejs",
    name: "Node.js Runtime",
    description: "Non-blocking I/O, event loop phases, streams, worker threads, and memory lifecycle.",
    category: "Backend",
  },
  {
    slug: "rest-api-design",
    name: "REST API Design",
    description: "HTTP verbs, status codes, idempotency, pagination, hypermedia, and versioning strategies.",
    category: "Backend",
  },
  {
    slug: "graphql",
    name: "GraphQL Architecture",
    description: "Schemas, queries, mutations, resolvers, DataLoader pattern, and solving over/under-fetching.",
    category: "Backend",
  },
  {
    slug: "authentication-authorization",
    name: "Auth & Access Control",
    description: "Session tokens, JWTs, OAuth 2.0 / OIDC, RBAC, ABAC, and cookie security flags.",
    category: "Backend",
  },
  {
    slug: "api-rate-limiting",
    name: "Rate Limiting & Throttling",
    description: "Token bucket, leaky bucket, fixed/sliding window algorithms, and distributed coordination.",
    category: "Backend",
  },

  // 3. Databases & Storage
  {
    slug: "sql-fundamentals",
    name: "SQL & Relational Modeling",
    description: "Schema normalization, joins, constraints, aggregation, subqueries, and window functions.",
    category: "Databases",
  },
  {
    slug: "postgresql",
    name: "PostgreSQL Architecture",
    description: "MVCC, table vacuuming, query planner, EXPLAIN ANALYZE, and extension ecosystem.",
    category: "Databases",
  },
  {
    slug: "database-indexing",
    name: "Database Indexing & Query Optimization",
    description: "B-Tree, GIN, hash indexes, composite index order, covering indexes, and index selectivity.",
    category: "Databases",
  },
  {
    slug: "transactions-acid",
    name: "Database Transactions & ACID",
    description: "Atomicity, consistency, isolation levels, phantom reads, and deadlock detection.",
    category: "Databases",
  },
  {
    slug: "redis-caching",
    name: "Redis & In-Memory Storage",
    description: "Data structures (hashes, sorted sets), memory eviction policies, pub/sub, and persistence (RDB/AOF).",
    category: "Databases",
  },

  // 4. System Design & Distributed Systems
  {
    slug: "caching-strategies",
    name: "Caching Patterns & Cache Invalidation",
    description: "Cache-aside, read/write-through, write-behind, cache stamps, and eviction heuristics.",
    category: "System Design",
  },
  {
    slug: "message-queues",
    name: "Asynchronous Messaging & Queues",
    description: "Publish/subscribe, message brokers (Kafka/RabbitMQ), delivery guarantees, and dead-letter queues.",
    category: "System Design",
  },
  {
    slug: "load-balancing",
    name: "Load Balancing & Traffic Management",
    description: "Round-robin, least connections, consistent hashing, reverse proxies, and health checks.",
    category: "System Design",
  },
  {
    slug: "distributed-systems",
    name: "Distributed Systems Fundamentals",
    description: "CAP theorem, PACELC, event-driven architecture, eventual consistency, and consensus.",
    category: "System Design",
  },
  {
    slug: "microservices",
    name: "Microservices & Service Boundaries",
    description: "Domain-driven design, API gateways, service discovery, distributed tracing, and resilience patterns.",
    category: "System Design",
  },

  // 5. DevOps, Infrastructure & Tooling
  {
    slug: "docker",
    name: "Containerization with Docker",
    description: "Dockerfile layers, multi-stage builds, namespaces, cgroups, volumes, and networking.",
    category: "DevOps",
  },
  {
    slug: "kubernetes",
    name: "Kubernetes Orchestration",
    description: "Pods, Deployments, Services, ConfigMaps, resource limits, and auto-scaling.",
    category: "DevOps",
  },
  {
    slug: "ci-cd-pipelines",
    name: "CI/CD & Automation",
    description: "Automated testing, linting, semantic versioning, build artifacts, and deployment strategies.",
    category: "DevOps",
  },
  {
    slug: "git-workflows",
    name: "Git Workflows & Version Control",
    description: "Rebasing vs merging, cherry-picking, bisect, reflog, and trunk-based development.",
    category: "DevOps",
  },
  {
    slug: "monitoring-observability",
    name: "Observability & Metrics",
    description: "Logs, metrics, traces (telemetry), SLO/SLI tracking, Prometheus, and alerting hygiene.",
    category: "DevOps",
  },

  // 6. Computer Science Fundamentals
  {
    slug: "data-structures",
    name: "Data Structures & Practical Trade-offs",
    description: "Arrays, linked lists, trees, hash tables, heaps, and graphs in production scenarios.",
    category: "Computer Science",
  },
  {
    slug: "algorithms-complexity",
    name: "Algorithmic Complexity & Big-O",
    description: "Time and space complexity analysis, worst/average case, asymptotic bounds, and memory overhead.",
    category: "Computer Science",
  },
  {
    slug: "concurrency",
    name: "Concurrency & Synchronization",
    description: "Race conditions, mutexes, semaphores, thread pools, and non-blocking synchronization.",
    category: "Computer Science",
  },
  {
    slug: "network-protocols",
    name: "Networking & HTTP/TCP",
    description: "OSI model, TCP three-way handshake, TLS termination, DNS resolution, and HTTP/2 vs HTTP/3.",
    category: "Computer Science",
  },
  {
    slug: "testing-methodologies",
    name: "Testing Methodologies & Test Doubles",
    description: "Unit testing, integration testing, end-to-end testing, mocks, stubs, and regression prevention.",
    category: "Computer Science",
  },
];

export async function seedTopics(prisma: PrismaClient) {
  for (const topic of CANONICAL_TOPICS) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        name: topic.name,
        description: topic.description,
        category: topic.category,
      },
      create: {
        slug: topic.slug,
        name: topic.name,
        description: topic.description,
        category: topic.category,
        status: "canonical",
      },
    });
  }
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedTopics(prisma)
    .then(async () => {
      console.log(`Successfully seeded ${CANONICAL_TOPICS.length} canonical topics.`);
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
