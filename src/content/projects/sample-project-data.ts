import { ParsedProject } from "./project-panel-schema";

export const DEFAULT_SAMPLE_PROJECT: ParsedProject = {
  id: "sample_microservices_platform",
  name: "High-Throughput E-Commerce Microservices",
  role: "Backend & Distributed Systems Engineer",
  summary:
    "Engineered distributed checkout and order orchestration microservices handling peak flash sales, with idempotency guarantees, a Redis cache-aside layer, and asynchronous inventory reservation.",
  techStack: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes"],
  metrics: ["15,000 req/sec peak throughput", "99.98% availability", "45ms p95 latency"],
  responsibilities: [
    "Architected payment webhook ingestion pipeline using idempotency keys and transactional outbox pattern.",
    "Integrated Redis cluster caching layer for catalog lookup, reducing PostgreSQL query load by 78%.",
    "Implemented BullMQ/Kafka worker consumers for asynchronous order fulfillment and email dispatch.",
  ],
};
