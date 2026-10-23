/**
 * Topic mapping and alias resolution (RES-T5).
 * Maps skill variations on resumes into canonical Topic slugs.
 * Unmatched skills become candidate topics (status="candidate").
 */

export const TOPIC_ALIASES: Record<string, string> = {
  // Frontend
  react: "react",
  reactjs: "react",
  "react.js": "react",
  "next.js": "react",
  nextjs: "react",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  es6: "javascript",
  ecmascript: "javascript",
  redux: "state-management",
  zustand: "state-management",
  mobx: "state-management",
  "state management": "state-management",
  "web performance": "web-performance",
  lighthouse: "web-performance",

  // Backend
  node: "nodejs",
  nodejs: "nodejs",
  "node.js": "nodejs",
  express: "nodejs",
  expressjs: "nodejs",
  nestjs: "nodejs",
  rest: "rest-api-design",
  "rest api": "rest-api-design",
  restful: "rest-api-design",
  graphql: "graphql",
  apollo: "graphql",
  jwt: "authentication-authorization",
  oauth: "authentication-authorization",
  oauth2: "authentication-authorization",
  auth: "authentication-authorization",
  "rate limit": "api-rate-limiting",
  "rate limiting": "api-rate-limiting",

  // Databases
  sql: "sql-fundamentals",
  mysql: "sql-fundamentals",
  mariadb: "sql-fundamentals",
  sqlite: "sql-fundamentals",
  postgres: "postgresql",
  postgresql: "postgresql",
  pgsql: "postgresql",
  indexing: "database-indexing",
  "b-tree": "database-indexing",
  transactions: "transactions-acid",
  acid: "transactions-acid",
  redis: "redis-caching",
  caching: "caching-strategies",

  // System Design
  "message queue": "message-queues",
  rabbitmq: "message-queues",
  kafka: "message-queues",
  sqs: "message-queues",
  "load balancing": "load-balancing",
  nginx: "load-balancing",
  haproxy: "load-balancing",
  "distributed systems": "distributed-systems",
  microservices: "microservices",

  // DevOps & Tools
  docker: "docker",
  containers: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  "ci/cd": "ci-cd-pipelines",
  "github actions": "ci-cd-pipelines",
  jenkins: "ci-cd-pipelines",
  git: "git-workflows",
  github: "git-workflows",
  gitlab: "git-workflows",
  prometheus: "monitoring-observability",
  grafana: "monitoring-observability",

  // CS Fundamentals
  dsa: "data-structures",
  "data structures": "data-structures",
  algorithms: "algorithms-complexity",
  "big-o": "algorithms-complexity",
  concurrency: "concurrency",
  multithreading: "concurrency",
  http: "network-protocols",
  tcp: "network-protocols",
  networking: "network-protocols",
  testing: "testing-methodologies",
  jest: "testing-methodologies",
  vitest: "testing-methodologies",
};

export interface ResolvedTopic {
  slug: string;
  name: string;
  isCanonical: boolean;
}

export function resolveTopic(
  rawSkill: string,
  canonicalSlugs = new Set(Object.values(TOPIC_ALIASES))
): ResolvedTopic {
  if (!rawSkill || rawSkill.trim().length === 0) {
    return { slug: "unknown", name: "Unknown", isCanonical: false };
  }

  const cleaned = rawSkill.trim().toLowerCase();

  // 1. Check alias dictionary
  if (TOPIC_ALIASES[cleaned]) {
    const slug = TOPIC_ALIASES[cleaned];
    return {
      slug,
      name: rawSkill.trim(),
      isCanonical: true,
    };
  }

  // 2. Check direct match against canonical slugs
  const slugified = cleaned.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (canonicalSlugs.has(slugified)) {
    return {
      slug: slugified,
      name: rawSkill.trim(),
      isCanonical: true,
    };
  }

  // 3. Fallback to candidate topic
  return {
    slug: slugified || "candidate-skill",
    name: rawSkill.trim(),
    isCanonical: false,
  };
}
