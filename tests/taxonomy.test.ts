import { describe, it, expect } from "vitest";
import { CANONICAL_TOPICS, seedTopics } from "../prisma/seed-topics";
import type { PrismaClient } from "@prisma/client";

describe("Topic Taxonomy Seed (FND-T4)", () => {
  it("contains at least 30 curated canonical topics", () => {
    expect(CANONICAL_TOPICS.length).toBeGreaterThanOrEqual(30);
  });

  it("ensures every topic slug is unique, kebab-cased, and has required fields", () => {
    const slugs = new Set<string>();

    for (const topic of CANONICAL_TOPICS) {
      expect(topic.slug).toMatch(/^[a-z0-9-]+$/);
      expect(slugs.has(topic.slug)).toBe(false);
      slugs.add(topic.slug);

      expect(topic.name.trim().length).toBeGreaterThan(0);
      expect(topic.description.trim().length).toBeGreaterThan(10);
      expect(topic.category.trim().length).toBeGreaterThan(0);
    }
  });

  it("covers all key categories: Frontend, Backend, Databases, System Design, DevOps, Computer Science", () => {
    const categories = new Set(CANONICAL_TOPICS.map((t) => t.category));
    expect(categories.has("Frontend")).toBe(true);
    expect(categories.has("Backend")).toBe(true);
    expect(categories.has("Databases")).toBe(true);
    expect(categories.has("System Design")).toBe(true);
    expect(categories.has("DevOps")).toBe(true);
    expect(categories.has("Computer Science")).toBe(true);
  });

  it("runs seedTopics idempotently against a mock prisma client", async () => {
    const upsertedSlugs: string[] = [];
    const mockPrisma = {
      topic: {
        upsert: async (args: { where: { slug: string }; create: { slug: string } }) => {
          upsertedSlugs.push(args.where.slug);
          return args.create;
        },
      },
    } as unknown as PrismaClient;

    await seedTopics(mockPrisma);
    expect(upsertedSlugs.length).toBe(CANONICAL_TOPICS.length);
  });
});
